import { BaseCliWorker } from 'tnp-helpers/src';
import { InstancesController } from './instances.controller';
import { InstancesTerminalUI } from './instances.terminal-ui';
export declare class InstancesWorker extends BaseCliWorker<InstancesController, InstancesTerminalUI> {
    workerContextTemplate: any;
    terminalUI: InstancesTerminalUI;
    controllerClass: typeof InstancesController;
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