import { ThreadGroup, Scenario, Step } from './user-configuration.model';
import { Activity, ExeDuration, TransactionDetails } from './user-configuration.model';
import * as moment from 'moment';
import 'moment-duration-format';

export function getDataset(threads: ThreadGroup[]): TransactionDetails {
    const dataset: Activity[] = [];
    const totalUser = getTotalUsers(threads);
    const totalDuration = getTotalDuration(threads);
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
            // activeDuration = totalDuration - (rampdown * ct + rampup*ct);
            activeDuration = obj.hold + (obj.startup - (rampup * ct)) + (obj.shutdown - (rampdown * ct));
            runTracker = momentToday.clone().add(runDuration, 's');
            // console.log(currentUser + ',' + init + ',' + activeDuration);
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
    return { totalVusers: totalUser, totalDuration: totalDuration.displayString, totalIteration: totalRecords, activites: dataset };
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
