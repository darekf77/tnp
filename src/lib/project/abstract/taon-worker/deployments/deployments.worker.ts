//#region imports
import { _, UtilsTerminal } from 'tnp-core/src';
import { BaseCliWorker } from 'tnp-helpers/src';

import { CURRENT_PACKAGE_VERSION } from '../../../../build-info._auto-generated_';

import { DeploymentsContext } from './deployments.context';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsTerminalUI } from './deployments.terminal-ui';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class DeploymentsWorker extends BaseCliWorker<
  // @ts-ignore TODO weird inheritance problem
  DeploymentsController,
  DeploymentsTerminalUI
> {
  //#region properties
  // TODO 'as any' for some reason is necessary
  // TypeScript d.ts generation bug
  workerContextTemplate = DeploymentsContext as any;

  // TODO ts ignore needed for some reason
  // @ts-ignore
  terminalUI = new DeploymentsTerminalUI(this);
  controllerClass = DeploymentsController;
  //#endregion

  //#region constructor
  constructor(
    /**
     * unique id for service
     */
    serviceID: string,
    /**
     * external command that will start service
     */
    startCommand: string,
  ) {
    // replace '0.0.0' with CURRENT_PACKAGE_VERSION for versioning
    super(serviceID, startCommand, CURRENT_PACKAGE_VERSION);
  }
  //#endregion

  public async startNormallyInCurrentProcess(): Promise<void> {
    //#region @backendFunc
    await super.startNormallyInCurrentProcess({
      actionBeforeTerminalUI: async () => {
        const ctrl = await this.getControllerForRemoteConnection({
          calledFrom: 'deployment startNormallyInCurrentProcess',
        });
        await ctrl.triggerAddExistedDeployments().request();
        let maxTrys = 20;
        let i = 0;
        while (true) {
          await UtilsTerminal.wait(1);
          const isDoneAdding = await ctrl.isAddingDeployments().request();
          // TODO REMOVE
          console.log({
            isDoneAdding
          })
          if (isDoneAdding.body.json.status === 'done') {
            break;
          }
          if (i++ > maxTrys) {
            throw new Error(
              `Timeout waiting for adding deployments to be finished. Waited for ${maxTrys} seconds`,
            );
          }
        }
      },
    });

    // await UtilsTerminal.pressAnyKeyToContinueAsync();
    //#endregion
  }
}
