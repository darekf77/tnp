import { CoreModels__NS__CfontStyle } from 'tnp-core/lib-prod';
import { BaseCliWorkerTerminalUI, BaseWorkerTerminalActionReturnType } from 'tnp-helpers/lib-prod';
import { InstancesWorker } from './instances.worker';
export declare class InstancesTerminalUI extends BaseCliWorkerTerminalUI<InstancesWorker> {
    headerText(): Promise<string>;
    textHeaderStyle(): CoreModels__NS__CfontStyle;
    getWorkerTerminalActions(options?: {
        exitIsOnlyReturn?: boolean;
        chooseAction?: boolean;
    }): BaseWorkerTerminalActionReturnType;
}
