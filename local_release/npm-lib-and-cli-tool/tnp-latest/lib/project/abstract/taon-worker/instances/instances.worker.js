"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstancesWorker = void 0;
const lib_1 = require("tnp-helpers/lib");
const build_info__auto_generated_1 = require("../../../../build-info._auto-generated_");
const instances_context_1 = require("./instances.context");
const instances_controller_1 = require("./instances.controller");
const instances_terminal_ui_1 = require("./instances.terminal-ui");
//#endregion
class InstancesWorker extends lib_1.BaseCliWorker {
    //#region properties
    // TODO 'as any' for some reason is necessary
    // TypeScript d.ts generation bug
    workerContextTemplate = instances_context_1.InstancesContext;
    // TODO ts ignore needed for some reason
    // @ts-ignore
    terminalUI = new instances_terminal_ui_1.InstancesTerminalUI(this);
    controllerClass = instances_controller_1.InstancesController;
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
        await super.startNormallyInCurrentProcess();
        const ctrl = await this.getRemoteControllerFor({
            methodOptions: {
                calledFrom: 'instances startNormallyInCurrentProcess',
            },
        });
        //#endregion
    }
}
exports.InstancesWorker = InstancesWorker;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/instances/instances.worker.js.map