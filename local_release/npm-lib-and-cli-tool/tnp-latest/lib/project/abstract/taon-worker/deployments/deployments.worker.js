"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentsWorker = void 0;
const lib_1 = require("tnp-helpers/lib");
const build_info__auto_generated_1 = require("../../../../build-info._auto-generated_");
const deployments_context_1 = require("./deployments.context");
const deployments_controller_1 = require("./deployments.controller");
const deployments_terminal_ui_1 = require("./deployments.terminal-ui");
//#endregion
// @ts-ignore TODO weird inheritance problem
class DeploymentsWorker extends lib_1.BaseCliWorker {
    //#region properties
    // TODO 'as any' for some reason is necessary
    // TypeScript d.ts generation bug
    workerContextTemplate = deployments_context_1.DeploymentsContext;
    // TODO ts ignore needed for some reason
    // @ts-ignore
    terminalUI = new deployments_terminal_ui_1.DeploymentsTerminalUI(this);
    // @ts-ignore
    controllerClass = deployments_controller_1.DeploymentsController;
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
                const ctrl = await this.getRemoteControllerFor({
                    methodOptions: {
                        calledFrom: 'deployment startNormallyInCurrentProcess',
                    },
                });
                await ctrl.triggerTableClearAndAddExistedDeployments().request();
                await ctrl.waitUntilTableClearAndAllExistedDeploymentsAdded();
            },
        });
        // await UtilsTerminal.pressAnyKeyToContinueAsync();
        //#endregion
    }
}
exports.DeploymentsWorker = DeploymentsWorker;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/deployments/deployments.worker.js.map