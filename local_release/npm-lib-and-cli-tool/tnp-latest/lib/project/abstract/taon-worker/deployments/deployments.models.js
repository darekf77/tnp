"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentsStatesAllowedStop = exports.DeploymentsStatesAllowedStart = exports.AllDeploymentsRemoveStatus = exports.DeploymentsStatus = exports.DeploymentsAddingStatus = void 0;
/**
 * Temporary status while adding new deployment
 * already exists in the system
 */
var DeploymentsAddingStatus;
(function (DeploymentsAddingStatus) {
    DeploymentsAddingStatus["NOT_STARTED"] = "not-started";
    DeploymentsAddingStatus["IN_PROGRESS"] = "in-progress";
    DeploymentsAddingStatus["DONE"] = "done";
    DeploymentsAddingStatus["FAILED"] = "failed";
})(DeploymentsAddingStatus || (exports.DeploymentsAddingStatus = DeploymentsAddingStatus = {}));
var DeploymentsStatus;
(function (DeploymentsStatus) {
    DeploymentsStatus["NOT_STARTED"] = "not-started";
    DeploymentsStatus["STARTING"] = "starting";
    DeploymentsStatus["STARTED_AND_ACTIVE"] = "started-active";
    DeploymentsStatus["FAILED_START"] = "failed-start";
    DeploymentsStatus["STOPPING"] = "stopping";
    DeploymentsStatus["STOPPED"] = "stopped";
})(DeploymentsStatus || (exports.DeploymentsStatus = DeploymentsStatus = {}));
var AllDeploymentsRemoveStatus;
(function (AllDeploymentsRemoveStatus) {
    AllDeploymentsRemoveStatus["NOT_STARTED"] = "not-started";
    AllDeploymentsRemoveStatus["REMOVING"] = "removing";
    AllDeploymentsRemoveStatus["DONE"] = "done";
})(AllDeploymentsRemoveStatus || (exports.AllDeploymentsRemoveStatus = AllDeploymentsRemoveStatus = {}));
exports.DeploymentsStatesAllowedStart = [
    DeploymentsStatus.NOT_STARTED,
    DeploymentsStatus.FAILED_START,
    DeploymentsStatus.STOPPED,
];
exports.DeploymentsStatesAllowedStop = [
    DeploymentsStatus.STARTING,
    DeploymentsStatus.STARTED_AND_ACTIVE,
];
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/deployments/deployments.models.js.map