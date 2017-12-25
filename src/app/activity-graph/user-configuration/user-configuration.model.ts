export interface ThreadGroup {
    threads: number;
    delay: number;
    startup: number;
    hold: number;
    shutdown: number;
    scenario: Scenario;
}

export interface Scenario {
    name: string;
    responseTime: number;
    pacing: number;
    steps: Step[];
}

export interface Step {
    name: string;
    responseTime: number;
    thinkTime: number;
}

export interface ExeDuration {
    displayString: string;
    durationSec: number;
}

export interface Activity {
    measure: string;
    data: Array<any>;
}

export interface TransactionDetails {
    totalVusers: number;
    totalDuration: string;
    totalIteration: number;
    activites: Activity[];
}