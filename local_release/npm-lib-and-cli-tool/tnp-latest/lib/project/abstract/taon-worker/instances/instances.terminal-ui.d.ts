import { CoreModels } from 'tnp-core';
import { BaseCliWorkerTerminalUI, BaseWorkerTerminalActionReturnType } from 'tnp-helpers';
import { InstancesWorker } from './instances.worker';
export declare class InstancesTerminalUI extends BaseCliWorkerTerminalUI<InstancesWorker> {
    headerText(): Promise<string>;
    textHeaderStyle(): CoreModels.CfontStyle;
    getWorkerTerminalActions(options?: {
        exitIsOnlyReturn?: boolean;
        chooseAction?: boolean;
    }): BaseWorkerTerminalActionReturnType;
}