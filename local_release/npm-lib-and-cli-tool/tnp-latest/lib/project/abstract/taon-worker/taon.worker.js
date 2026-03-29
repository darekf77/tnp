"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaonProjectsWorker = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const build_info__auto_generated_1 = require("../../../build-info._auto-generated_");
const constants_1 = require("../../../constants");
const deployments_worker_1 = require("./deployments/deployments.worker");
const instances_worker_1 = require("./instances/instances.worker");
const processes_worker_1 = require("./processes/processes.worker");
const taon_terminal_ui_1 = require("./taon-terminal-ui");
const taon_context_1 = require("./taon.context");
const taon_controller_1 = require("./taon.controller");
const traefik_provider_1 = require("./traefik/traefik.provider");
//#endregion
class TaonProjectsWorker extends lib_3.BaseCliWorker {
    ins;
    //#region properties
    // @ts-ignore
    terminalUI = new taon_terminal_ui_1.TaonTerminalUI(this);
    workerContextTemplate = taon_context_1.TaonProjectsContextTemplate; // TODO for some reason as any is nessesary
    controllerClass = taon_controller_1.TaonProjectsController;
    deploymentsWorker;
    instancesWorker;
    processesWorker;
    traefikProvider = new traefik_provider_1.TraefikProvider(this);
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
        super(serviceID, startCommandFn, build_info__auto_generated_1.CURRENT_PACKAGE_VERSION);
        this.ins = ins;
        // console.log({
        //   depoyments: UtilsCliClassMethod.getFrom($Cloud.prototype.deployments),
        //   instances: UtilsCliClassMethod.getFrom($Cloud.prototype.instances),
        //   processes: UtilsCliClassMethod.getFrom($Cloud.prototype.processes),
        // });
        // console.log('Initializing TaonProjectsWorker...');
        //#region @backend
        this.deploymentsWorker = new deployments_worker_1.DeploymentsWorker('taon-project-deployments-worker', () => `${lib_1.config.frameworkName} cloud:deployments ${constants_1.skipCoreCheck}`);
        this.instancesWorker = new instances_worker_1.InstancesWorker('taon-project-instances-worker', () => `${lib_1.config.frameworkName} cloud:instances ${constants_1.skipCoreCheck}`);
        this.processesWorker = new processes_worker_1.ProcessesWorker('taon-project-processes-worker', () => `${lib_1.config.frameworkName} cloud:processes ${constants_1.skipCoreCheck}`);
        // this.deploymentsWorker = new DeploymentsWorker(
        //   'taon-project-deployments-worker',
        //   `${global.frameworkName} ${UtilsCliClassMethod.getFrom($Cloud.prototype.deployments)}`,
        // );
        // this.instancesWorker = new InstancesWorker(
        //   'taon-project-instances-worker',
        //   `${global.frameworkName} ${UtilsCliClassMethod.getFrom($Cloud.prototype.instances)}`,
        // );
        // this.processesWorker = new ProcessesWorker(
        //   'taon-project-processes-worker',
        //   `${global.frameworkName} ${UtilsCliClassMethod.getFrom($Cloud.prototype.processes)}`,
        // );
        if (lib_1.config.frameworkName !== 'tnp') {
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
        lib_3.Helpers.taskStarted(`Waiting for ports manager to be started...`);
        await this.ins.portsWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    mode: lib_3.BaseCLiWorkerStartMode.CHILD_PROCESS,
                },
                calledFrom: 'taon projects/portsWorker worker start',
            },
        });
        lib_3.Helpers.taskStarted(`Waiting for processes manager to be started...`);
        await this.processesWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    mode: lib_3.BaseCLiWorkerStartMode.CHILD_PROCESS,
                },
                calledFrom: 'taon projects/processesWorker worker start',
            },
        });
        lib_3.Helpers.taskStarted(`Waiting for deployments manager to be started...`);
        await this.deploymentsWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    mode: lib_3.BaseCLiWorkerStartMode.CHILD_PROCESS,
                },
                calledFrom: 'taon projects/deploymentsWorker worker start',
            },
        });
        lib_3.Helpers.taskStarted(`Waiting for taon instances manager to be started...`);
        await this.instancesWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    mode: lib_3.BaseCLiWorkerStartMode.CHILD_PROCESS,
                },
                calledFrom: 'taon projects/instancesWorker worker start',
            },
        });
        await super.startNormallyInCurrentProcess({
            actionBeforeTerminalUI: async () => {
                lib_3.Helpers.info(``);
                await this.traefikProvider.initialCloudStatusCheck();
            },
        });
        //#endregion
    }
    //#endregion
    //#region methods / enable cloud
    async enableCloud() {
        //#region @backendFunc
        lib_2.UtilsTerminal.clearConsole();
        const isTraefikStarted = await this.traefikProvider.startTraefik();
        if (!isTraefikStarted) {
            lib_3.Helpers.error(`

          Please pull the latest version of Taon to get the latest docker templates
          Use command: ${lib_1.config.frameworkName} sync

          `, true, true);
            await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
            return;
        }
        lib_3.Helpers.taskDone(`Taon cloud started! Enjoy deploying new projects!`);
        await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
        //#endregion
    }
    //#endregion
    //#region methods / disable cloud
    async disableCloud() {
        //#region @backendFunc
        while (true) {
            lib_2.UtilsTerminal.clearConsole();
            await this.traefikProvider.stopTraefik();
            await lib_3.UtilsDocker.removeAllTaonContainersAndImagesFromDocker();
            // await UtilsProcess.killProcessOnPort(80);
            // await UtilsProcess.killProcessOnPort(443);
            lib_3.Helpers.taskDone(`Taon cloud disabled!`);
            await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
            break;
        }
        //#endregion
    }
}
exports.TaonProjectsWorker = TaonProjectsWorker;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/taon.worker.js.map