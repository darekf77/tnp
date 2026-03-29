"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessesStatesAllowedStop = exports.ProcessesStatesAllowedStart = exports.ProcessesState = void 0;
var ProcessesState;
(function (ProcessesState) {
    /**
     * Process has not been started yet, only entity exists in the DB
     */
    ProcessesState["NOT_STARTED"] = "not-started";
    /**
     * child_process is being started
     */
    ProcessesState["STARTING"] = "starting";
    /**
     * Process is running and proper processActiveMessages displayed in
     * output (stdout / stderr)
     */
    ProcessesState["ACTIVE"] = "active";
    /**
     * Process is being killed
     */
    ProcessesState["KILLING"] = "killing";
    /**
     * Process killed after being active
     */
    ProcessesState["KILLED"] = "killed";
    /**
     * Process ended with error (exit code different than 0)
     */
    ProcessesState["ENDED_WITH_ERROR"] = "ended-with-error";
    /**
     * Process ended ok (exit code 0)
     */
    ProcessesState["ENDED_OK"] = "ended-ok";
})(ProcessesState || (exports.ProcessesState = ProcessesState = {}));
exports.ProcessesStatesAllowedStart = [
    ProcessesState.NOT_STARTED,
    ProcessesState.KILLED,
    ProcessesState.ENDED_OK,
    ProcessesState.ENDED_WITH_ERROR,
];
exports.ProcessesStatesAllowedStop = [
    ProcessesState.STARTING,
    ProcessesState.ACTIVE,
];
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/processes/processes.models.js.map