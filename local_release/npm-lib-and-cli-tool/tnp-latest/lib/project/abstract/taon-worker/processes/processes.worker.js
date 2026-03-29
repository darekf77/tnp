"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessesWorker = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const build_info__auto_generated_1 = require("../../../../build-info._auto-generated_");
const processes_context_1 = require("./processes.context");
const processes_controller_1 = require("./processes.controller");
const processes_terminal_ui_1 = require("./processes.terminal-ui");
const processes_worker_controller_1 = require("./processes.worker.controller");
//#endregion
class ProcessesWorker extends lib_2.BaseCliWorker {
    //#region properties
    // TODO 'as any' for some reason is necessary
    // TypeScript d.ts generation bug
    workerContextTemplate = processes_context_1.ProcessesContext;
    // TODO ts ignore needed for some reason
    // @ts-ignore
    terminalUI = new processes_terminal_ui_1.ProcessesTerminalUI(this);
    controllerClass = processes_worker_controller_1.ProcessesWorkerController;
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
    startCommandFn) {
        // replace '0.0.0' with CURRENT_PACKAGE_VERSION for versioning
        super(serviceID, startCommandFn, build_info__auto_generated_1.CURRENT_PACKAGE_VERSION);
    }
    //#endregion
    async startNormallyInCurrentProcess() {
        //#region @backendFunc
        await super.startNormallyInCurrentProcess({
            actionBeforeTerminalUI: async () => {
                const ctx = await this.getRemoteContextFor({
                    methodOptions: {
                        calledFrom: 'processes startNormallyInCurrentProcess',
                    },
                });
                const processController = ctx.getInstanceBy(processes_controller_1.ProcessesController);
                lib_1.Helpers.info(`Clearing processes table before starting terminal UI`);
                await processController.clearTable(); // clear processes from previous runs
            },
        });
        // await UtilsTerminal.pressAnyKeyToContinueAsync();
        //#endregion
    }
}
exports.ProcessesWorker = ProcessesWorker;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/processes/processes.worker.js.map