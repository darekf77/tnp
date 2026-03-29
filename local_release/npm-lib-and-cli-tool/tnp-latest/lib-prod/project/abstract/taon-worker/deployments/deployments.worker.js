import { BaseCliWorker } from 'tnp-helpers/lib-prod';
import { CURRENT_PACKAGE_VERSION } from '../../../../build-info._auto-generated_';
import { DeploymentsContext } from './deployments.context';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsTerminalUI } from './deployments.terminal-ui';
//#endregion
// @ts-ignore TODO weird inheritance problem
export class DeploymentsWorker extends BaseCliWorker {
    //#region properties
    // TODO 'as any' for some reason is necessary
    // TypeScript d.ts generation bug
    workerContextTemplate = DeploymentsContext;
    // TODO ts ignore needed for some reason
    // @ts-ignore
    terminalUI = new DeploymentsTerminalUI(this);
    // @ts-ignore
    controllerClass = DeploymentsController;
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
        super(serviceID, startCommandFn, CURRENT_PACKAGE_VERSION);
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
        // await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/deployments/deployments.worker.js.map