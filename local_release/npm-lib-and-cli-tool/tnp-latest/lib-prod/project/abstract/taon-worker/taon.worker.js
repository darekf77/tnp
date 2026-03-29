//#region imports
import { config } from 'tnp-core/lib-prod';
import { UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__pressAnyKeyToContinueAsync } from 'tnp-core/lib-prod';
import { BaseCliWorker, BaseCLiWorkerStartMode, Helpers__NS__error, Helpers__NS__info, Helpers__NS__taskDone, Helpers__NS__taskStarted, UtilsDocker__NS__removeAllTaonContainersAndImagesFromDocker } from 'tnp-helpers/lib-prod';
import { CURRENT_PACKAGE_VERSION } from '../../../build-info._auto-generated_';
import { skipCoreCheck } from '../../../constants';
import { DeploymentsWorker } from './deployments/deployments.worker';
import { InstancesWorker } from './instances/instances.worker';
import { ProcessesWorker } from './processes/processes.worker';
import { TaonTerminalUI } from './taon-terminal-ui';
import { TaonProjectsContextTemplate } from './taon.context';
import { TaonProjectsController } from './taon.controller';
import { TraefikProvider } from './traefik/traefik.provider';
//#endregion
export class TaonProjectsWorker extends BaseCliWorker {
    ins;
    //#region properties
    // @ts-ignore
    terminalUI = new TaonTerminalUI(this);
    workerContextTemplate = TaonProjectsContextTemplate; // TODO for some reason as any is nessesary
    controllerClass = TaonProjectsController;
    deploymentsWorker;
    instancesWorker;
    processesWorker;
    traefikProvider = new TraefikProvider(this);
    //#endregion
    //#region constructor
    constructor(
    /**
     * unique id for service
     */
    serviceID, 
    /**
     * external command that will start service
     */
    startCommandFn, ins) {
        super(serviceID, startCommandFn, CURRENT_PACKAGE_VERSION);
        this.ins = ins;
        // console.log({
        //   depoyments: UtilsCliClassMethod__NS__getFrom($Cloud.prototype.deployments),
        //   instances: UtilsCliClassMethod__NS__getFrom($Cloud.prototype.instances),
        //   processes: UtilsCliClassMethod__NS__getFrom($Cloud.prototype.processes),
        // });
        // console.log('Initializing TaonProjectsWorker...');
        //#region @backend
        this.deploymentsWorker = new DeploymentsWorker('taon-project-deployments-worker', () => `${config.frameworkName} cloud:deployments ${skipCoreCheck}`);
        this.instancesWorker = new InstancesWorker('taon-project-instances-worker', () => `${config.frameworkName} cloud:instances ${skipCoreCheck}`);
        this.processesWorker = new ProcessesWorker('taon-project-processes-worker', () => `${config.frameworkName} cloud:processes ${skipCoreCheck}`);
        // this.deploymentsWorker = new DeploymentsWorker(
        //   'taon-project-deployments-worker',
        //   `${global.frameworkName} ${UtilsCliClassMethod__NS__getFrom($Cloud.prototype.deployments)}`,
        // );
        // this.instancesWorker = new InstancesWorker(
        //   'taon-project-instances-worker',
        //   `${global.frameworkName} ${UtilsCliClassMethod__NS__getFrom($Cloud.prototype.instances)}`,
        // );
        // this.processesWorker = new ProcessesWorker(
        //   'taon-project-processes-worker',
        //   `${global.frameworkName} ${UtilsCliClassMethod__NS__getFrom($Cloud.prototype.processes)}`,
        // );
        if (config.frameworkName !== 'tnp') {
            // skip restarting ports worker for tnp development
            this.dependencyWorkers.set(this.ins.portsWorker.serviceID, this.ins.portsWorker);
        }
        this.dependencyWorkers.set(this.processesWorker.serviceID, this.processesWorker);
        this.dependencyWorkers.set(this.deploymentsWorker.serviceID, this.deploymentsWorker);
        this.dependencyWorkers.set(this.instancesWorker.serviceID, this.instancesWorker);
        //#endregion
    }
    //#endregion
    //#region methods / start normally in current process
    /**
     * start normally process
     * this will crash if process already started
     */
    async startNormallyInCurrentProcess() {
        //#region @backendFunc
        Helpers__NS__taskStarted(`Waiting for ports manager to be started...`);
        await this.ins.portsWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    mode: BaseCLiWorkerStartMode.CHILD_PROCESS,
                },
                calledFrom: 'taon projects/portsWorker worker start',
            },
        });
        Helpers__NS__taskStarted(`Waiting for processes manager to be started...`);
        await this.processesWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    mode: BaseCLiWorkerStartMode.CHILD_PROCESS,
                },
                calledFrom: 'taon projects/processesWorker worker start',
            },
        });
        Helpers__NS__taskStarted(`Waiting for deployments manager to be started...`);
        await this.deploymentsWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    mode: BaseCLiWorkerStartMode.CHILD_PROCESS,
                },
                calledFrom: 'taon projects/deploymentsWorker worker start',
            },
        });
        Helpers__NS__taskStarted(`Waiting for taon instances manager to be started...`);
        await this.instancesWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    mode: BaseCLiWorkerStartMode.CHILD_PROCESS,
                },
                calledFrom: 'taon projects/instancesWorker worker start',
            },
        });
        await super.startNormallyInCurrentProcess({
            actionBeforeTerminalUI: async () => {
                Helpers__NS__info(``);
                await this.traefikProvider.initialCloudStatusCheck();
            },
        });
        //#endregion
    }
    //#endregion
    //#region methods / enable cloud
    async enableCloud() {
        //#region @backendFunc
        UtilsTerminal__NS__clearConsole();
        const isTraefikStarted = await this.traefikProvider.startTraefik();
        if (!isTraefikStarted) {
            Helpers__NS__error(`

          Please pull the latest version of Taon to get the latest docker templates
          Use command: ${config.frameworkName} sync

          `, true, true);
            await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
            return;
        }
        Helpers__NS__taskDone(`Taon cloud started! Enjoy deploying new projects!`);
        await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
        //#endregion
    }
    //#endregion
    //#region methods / disable cloud
    async disableCloud() {
        //#region @backendFunc
        while (true) {
            UtilsTerminal__NS__clearConsole();
            await this.traefikProvider.stopTraefik();
            await UtilsDocker__NS__removeAllTaonContainersAndImagesFromDocker();
            // await UtilsProcess__NS__killProcessOnPort(80);
            // await UtilsProcess__NS__killProcessOnPort(443);
            Helpers__NS__taskDone(`Taon cloud disabled!`);
            await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
            break;
        }
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/taon.worker.js.map