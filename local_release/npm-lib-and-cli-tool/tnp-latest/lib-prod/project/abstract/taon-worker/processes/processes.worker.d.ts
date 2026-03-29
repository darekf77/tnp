import { BaseCliWorker } from 'tnp-helpers/lib-prod';
import { ProcessesTerminalUI } from './processes.terminal-ui';
import { ProcessesWorkerController } from './processes.worker.controller';
export declare class ProcessesWorker extends BaseCliWorker<ProcessesWorkerController, ProcessesTerminalUI> {
    workerContextTemplate: any;
    terminalUI: ProcessesTerminalUI;
    controllerClass: typeof ProcessesWorkerController;
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
