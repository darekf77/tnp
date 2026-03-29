import { BaseCliWorker } from 'tnp-helpers/src';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsTerminalUI } from './deployments.terminal-ui';
export declare class DeploymentsWorker extends BaseCliWorker<DeploymentsController, DeploymentsTerminalUI> {
    workerContextTemplate: any;
    terminalUI: DeploymentsTerminalUI;
    controllerClass: typeof DeploymentsController;
    constructor(
    /**
     * unique id for service
     */
    serviceID: string, 
    /**
     * external command that will start service
     */
    startCommandFn: () => string);
    startNormallyInCurrentProcess(): Promise<void>;
}