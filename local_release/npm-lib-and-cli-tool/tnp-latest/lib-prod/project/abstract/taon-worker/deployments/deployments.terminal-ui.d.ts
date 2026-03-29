import { CoreModels__NS__CfontStyle } from 'tnp-core/lib-prod';
import { BaseCliWorkerTerminalUI, BaseWorkerTerminalActionReturnType } from 'tnp-helpers/lib-prod';
import { ProcessesController } from '../processes/processes.controller';
import { Deployments } from './deployments';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsWorker } from './deployments.worker';
export declare class DeploymentsTerminalUI extends BaseCliWorkerTerminalUI<DeploymentsWorker> {
    headerText(): Promise<string>;
    textHeaderStyle(): CoreModels__NS__CfontStyle;
    private stopDeployment;
    private removeDeployment;
    private startDeployment;
    protected refetchDeployment(deployment: Deployments, deploymentsController: DeploymentsController): Promise<Deployments>;
    protected crudMenuForSingleDeployment(deployment: Deployments, deploymentsController: DeploymentsController, processesController: ProcessesController): Promise<void>;
    getWorkerTerminalActions(options?: {
        exitIsOnlyReturn?: boolean;
        chooseAction?: boolean;
    }): BaseWorkerTerminalActionReturnType;
}
