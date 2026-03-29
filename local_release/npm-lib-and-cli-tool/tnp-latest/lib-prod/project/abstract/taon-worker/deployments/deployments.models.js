/**
 * Temporary status while adding new deployment
 * already exists in the system
 */
export var DeploymentsAddingStatus;
(function (DeploymentsAddingStatus) {
    DeploymentsAddingStatus["NOT_STARTED"] = "not-started";
    DeploymentsAddingStatus["IN_PROGRESS"] = "in-progress";
    DeploymentsAddingStatus["DONE"] = "done";
    DeploymentsAddingStatus["FAILED"] = "failed";
})(DeploymentsAddingStatus || (DeploymentsAddingStatus = {}));
export var DeploymentsStatus;
(function (DeploymentsStatus) {
    DeploymentsStatus["NOT_STARTED"] = "not-started";
    DeploymentsStatus["STARTING"] = "starting";
    DeploymentsStatus["STARTED_AND_ACTIVE"] = "started-active";
    DeploymentsStatus["FAILED_START"] = "failed-start";
    DeploymentsStatus["STOPPING"] = "stopping";
    DeploymentsStatus["STOPPED"] = "stopped";
})(DeploymentsStatus || (DeploymentsStatus = {}));
export var AllDeploymentsRemoveStatus;
(function (AllDeploymentsRemoveStatus) {
    AllDeploymentsRemoveStatus["NOT_STARTED"] = "not-started";
    AllDeploymentsRemoveStatus["REMOVING"] = "removing";
    AllDeploymentsRemoveStatus["DONE"] = "done";
})(AllDeploymentsRemoveStatus || (AllDeploymentsRemoveStatus = {}));
export const DeploymentsStatesAllowedStart = [
    DeploymentsStatus.NOT_STARTED,
    DeploymentsStatus.FAILED_START,
    DeploymentsStatus.STOPPED,
];
export const DeploymentsStatesAllowedStop = [
    DeploymentsStatus.STARTING,
    DeploymentsStatus.STARTED_AND_ACTIVE,
];
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/deployments/deployments.models.js.map