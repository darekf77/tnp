"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentsUtils = void 0;
const processes_utils_1 = require("../processes/processes.utils");
var DeploymentsUtils;
(function (DeploymentsUtils) {
    //#region display deployment progress
    DeploymentsUtils.displayRealtimeProgressMonitor = async (deployment, processesController, options) => {
        //#region @backendFunc
        if (!deployment) {
            throw new Error(`deployment is required`);
        }
        if (!deployment.processIdComposeUp) {
            throw new Error(`deployment.processIdComposeUp is required`);
        }
        await processes_utils_1.ProcessesUtils.displayRealtimeProgressMonitor(deployment.processIdComposeUp, processesController, options);
        //#endregion
    };
    //#endregion
})(DeploymentsUtils || (exports.DeploymentsUtils = DeploymentsUtils = {}));
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/deployments/deployments.utils.js.map