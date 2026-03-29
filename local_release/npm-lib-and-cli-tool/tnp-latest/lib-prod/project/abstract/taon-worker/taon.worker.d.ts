import { BaseCliWorker } from 'tnp-helpers/lib-prod';
import type { TaonProjectResolve } from '../project-resolve';
import { DeploymentsWorker } from './deployments/deployments.worker';
import { InstancesWorker } from './instances/instances.worker';
import { ProcessesWorker } from './processes/processes.worker';
import { TaonTerminalUI } from './taon-terminal-ui';
import { TaonProjectsController } from './taon.controller';
import { TraefikProvider } from './traefik/traefik.provider';
export declare class TaonProjectsWorker extends BaseCliWorker<TaonProjectsController, TaonTerminalUI> {
    readonly ins: TaonProjectResolve;
    terminalUI: TaonTerminalUI;
    workerContextTemplate: any;
    controllerClass: typeof TaonProjectsController;
    deploymentsWorker: DeploymentsWorker;
    instancesWorker: InstancesWorker;
    processesWorker: ProcessesWorker;
    traefikProvider: TraefikProvider;
    constructor(
    /**
     * unique id for service
     */
    serviceID: string, 
    /**
     * external command that will start service
     */
    startCommandFn: () => string, ins: TaonProjectResolve);
    /**
     * start normally process
     * this will crash if process already started
     */
    startNormallyInCurrentProcess(): Promise<void>;
    enableCloud(): Promise<void>;
    disableCloud(): Promise<void>;
}
