import { ThreadGroup, Scenario, Step, GraphSettings } from './user-configuration.model';
import { Activity, ExeDuration, TransactionDetails } from './user-configuration.model';
import * as moment from 'moment';
import 'moment-duration-format';

export function getDataset(threads: ThreadGroup[], settings: GraphSettings): TransactionDetails {
    const totalUser = getTotalUsers(threads);
    const totalDuration = getTotalDuration(threads);
    const transactionActivity = getTransactionActivity(threads);
    if (settings.isSimulateSteps) {
        const stepActivity = getStepActivity(threads);
        return {
            totalVusers: totalUser, totalDuration: totalDuration.displayString,
            totalIteration: transactionActivity.totalIteration, activites: transactionActivity.activities,
            setpActivities: stepActivity.activities
        };
    } else {
        return {
            totalVusers: totalUser, totalDuration: totalDuration.displayString,
            totalIteration: transactionActivity.totalIteration, activites: transactionActivity.activities
        };
    }
}

function getStepActivity(threads: ThreadGroup[]) {
    const dataset: Activity[] = [];
    let rampup = 0;
    let rampdown = 0;
    let currentUser = 1;
    let runDuration = 0;
    let init = 0;
    let activeDuration = 0;
    let runTracker: moment.Moment;
    const momentToday = moment().startOf('day');
    threads.forEach(function (obj, key) {
        const activityDuration = getResponseTime(obj.scenario.steps);
        rampup = obj.startup / obj.threads > 1 ? obj.startup / obj.threads : 1;
        rampdown = obj.shutdown / obj.threads > 1 ? obj.shutdown / obj.threads : 1;
        for (let ct = 0; ct < obj.threads; ct++) {
            const item: Activity = { measure: 'VU ' + currentUser, data: [] };
            init = runDuration = obj.delay + (rampup * ct);
            activeDuration = obj.hold + (obj.startup - (rampup * ct)) + (obj.shutdown - (rampdown * ct));
            runTracker = momentToday.clone().add(runDuration, 's');
            while (true) {
                for (const step of obj.scenario.steps) {
                    // add step activity
                    const activity = [];
                    activity.push(runTracker.format('YYYY-MM-DD HH:mm:ss'));
                    activity.push(step.name);
                    if ((runDuration + step.responseTime) > (activeDuration + init)) {
                        runTracker.add((activeDuration + init) - runDuration, 's');
                    } else {
                        runTracker.add(step.responseTime, 's');
                    }
                    runDuration += step.responseTime;
                    activity.push(runTracker.format('YYYY-MM-DD HH:mm:ss'));
                    item.data.push(activity);
                    if (runDuration > (activeDuration + init)) { break; }

                    // add pacing
                    const thinkTime = [];
                    thinkTime.push(runTracker.format('YYYY-MM-DD HH:mm:ss'));
                    thinkTime.push('Think Time');
                    if ((runDuration + step.thinkTime) > (activeDuration + init)) {
                        runTracker.add((activeDuration + init) - runDuration, 's');
                    } else {
                        runTracker.add(step.thinkTime, 's');
                    }
                    runDuration += step.thinkTime;
                    thinkTime.push(runTracker.format('YYYY-MM-DD HH:mm:ss'));
                    item.data.push(thinkTime);
                    if (runDuration > (activeDuration + init)) { break; }
                }
                if (runDuration > (activeDuration + init)) { break; }

                // add pacing
                const pause = [];
                pause.push(runTracker.format('YYYY-MM-DD HH:mm:ss'));
                pause.push('Pacing');
                if ((runDuration + obj.scenario.pacing) > (activeDuration + init)) {
                    runTracker.add((activeDuration + init) - runDuration, 's');
                } else {
                    runTracker.add(obj.scenario.pacing, 's');
                }
                runDuration += obj.scenario.pacing;
                pause.push(runTracker.format('YYYY-MM-DD HH:mm:ss'));
                item.data.push(pause);
                if (runDuration > (activeDuration + init)) { break; }
            }
            currentUser++;
            dataset.push(item);
        }
    });
    dataset.reverse();
    // console.log(dataset);
    return { activities: dataset };
}

function getTransactionActivity(threads: ThreadGroup[]) {
    const dataset: Activity[] = [];
    let totalRecords = 0;
    let rampup = 0;
    let rampdown = 0;
    let currentUser = 1;
    let runDuration = 0;
    let init = 0;
    let activeDuration = 0;
    let runTracker: moment.Moment;
    const momentToday = moment().startOf('day');
    threads.forEach(function (obj, key) {
        const activityDuration = getResponseTime(obj.scenario.steps);
        rampup = obj.startup / obj.threads > 1 ? obj.startup / obj.threads : 1;
        rampdown = obj.shutdown / obj.threads > 1 ? obj.shutdown / obj.threads : 1;
        for (let ct = 0; ct < obj.threads; ct++) {
            const item: Activity = { measure: 'VU ' + currentUser, data: [] };
            init = runDuration = obj.delay + (rampup * ct);
            activeDuration = obj.hold + (obj.startup - (rampup * ct)) + (obj.shutdown - (rampdown * ct));
            runTracker = momentToday.clone().add(runDuration, 's');
            while (true) {
                // add activity
                const activity = [];
                activity.push(runTracker.format('YYYY-MM-DD HH:mm:ss'));
                activity.push(1);
                if ((runDuration + activityDuration) > (activeDuration + init)) {
                    runTracker.add((activeDuration + init) - runDuration, 's');
                } else {
                    runTracker.add(activityDuration, 's');
                    totalRecords++;
                }
                runDuration += activityDuration;
                activity.push(runTracker.format('YYYY-MM-DD HH:mm:ss'));
                item.data.push(activity);
                if (runDuration > (activeDuration + init)) { break; }

                // add pause
                const pause = [];
                pause.push(runTracker.format('YYYY-MM-DD HH:mm:ss'));
                pause.push(0);
                if ((runDuration + obj.scenario.pacing) > (activeDuration + init)) {
                    runTracker.add((activeDuration + init) - runDuration, 's');
                } else {
                    runTracker.add(obj.scenario.pacing, 's');
                }
                runDuration += obj.scenario.pacing;
                pause.push(runTracker.format('YYYY-MM-DD HH:mm:ss'));
                item.data.push(pause);
                if (runDuration > (activeDuration + init)) { break; }
            }
            currentUser++;
            dataset.push(item);
        }
    });
    dataset.reverse();
    // console.log(dataset);
    return { activities: dataset, totalIteration: totalRecords };
}

function getTotalUsers(threads: ThreadGroup[]): number {
    let totalvUsers = 0;
    threads.forEach(element => {
        totalvUsers += element.threads;
    });
    return totalvUsers;
}

function getTotalDuration(threads: ThreadGroup[]): ExeDuration {
    let totalDuration = 0;
    threads.forEach(e => {
        const tempDuration = (e.startup + e.delay + e.hold + e.shutdown);
        totalDuration += (tempDuration > totalDuration) ? tempDuration - totalDuration : 0;
    });
    return { displayString: moment.duration(totalDuration, 'seconds').format('D[day] HH:mm:ss'), durationSec: totalDuration };
}

function getResponseTime(steps: Step[]): number {
    let totalResponseTime = 0;
    steps.forEach(e => totalResponseTime += (e.responseTime + e.thinkTime));
    return totalResponseTime;
}
