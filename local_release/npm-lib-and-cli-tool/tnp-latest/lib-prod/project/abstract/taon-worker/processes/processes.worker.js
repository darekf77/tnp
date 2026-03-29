//#region imports
import { Helpers__NS__info } from 'tnp-core/lib-prod';
import { BaseCliWorker } from 'tnp-helpers/lib-prod';
import { CURRENT_PACKAGE_VERSION } from '../../../../build-info._auto-generated_';
import { ProcessesContext } from './processes.context';
import { ProcessesController } from './processes.controller';
import { ProcessesTerminalUI } from './processes.terminal-ui';
import { ProcessesWorkerController } from './processes.worker.controller';
//#endregion
export class ProcessesWorker extends BaseCliWorker {
    //#region properties
    // TODO 'as any' for some reason is necessary
    // TypeScript d.ts generation bug
    workerContextTemplate = ProcessesContext;
    // TODO ts ignore needed for some reason
    // @ts-ignore
    terminalUI = new ProcessesTerminalUI(this);
    controllerClass = ProcessesWorkerController;
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
                const ctx = await this.getRemoteContextFor({
                    methodOptions: {
                        calledFrom: 'processes startNormallyInCurrentProcess',
                    },
                });
                const processController = ctx.getInstanceBy(ProcessesController);
                Helpers__NS__info(`Clearing processes table before starting terminal UI`);
                await processController.clearTable(); // clear processes from previous runs
            },
        });
        // await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/processes/processes.worker.js.map