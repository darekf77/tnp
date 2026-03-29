import { ProcessesUtils__NS__displayRealtimeProgressMonitor } from '../processes/processes.utils';
//namespace DeploymentsUtils
//#region display deployment progress
export const DeploymentsUtils__NS__displayRealtimeProgressMonitor = async (deployment, processesController, options) => {
    //#region @backendFunc
    if (!deployment) {
        throw new Error(`deployment is required`);
    }
    if (!deployment.processIdComposeUp) {
        throw new Error(`deployment.processIdComposeUp is required`);
    }
    await ProcessesUtils__NS__displayRealtimeProgressMonitor(deployment.processIdComposeUp, processesController, options);
    //#endregion
};
//#endregion
//end of namespace DeploymentsUtils
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/deployments/deployments.utils.js.map