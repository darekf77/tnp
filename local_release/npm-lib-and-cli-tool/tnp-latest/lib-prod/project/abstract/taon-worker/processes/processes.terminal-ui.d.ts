import { CoreModels__NS__CfontStyle } from 'tnp-core/lib-prod';
import { BaseCliWorkerTerminalUI, BaseWorkerTerminalActionReturnType } from 'tnp-helpers/lib-prod';
import { Processes } from './processes';
import { ProcessesController } from './processes.controller';
import { ProcessesWorker } from './processes.worker';
export declare class ProcessesTerminalUI extends BaseCliWorkerTerminalUI<ProcessesWorker> {
    protected headerText(): Promise<string>;
    protected textHeaderStyle(): CoreModels__NS__CfontStyle;
    getDummyProcessParams(): Promise<{
        command: string;
        cwd: string;
    }>;
    protected refetchProcess(process: Processes, processesController: ProcessesController): Promise<Processes>;
    protected crudMenuForSingleProcess(processFromDb: Processes, processesController: ProcessesController): Promise<void>;
    getWorkerTerminalActions(options?: {
        exitIsOnlyReturn?: boolean;
        chooseAction?: boolean;
    }): BaseWorkerTerminalActionReturnType;
}
