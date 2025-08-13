//#region imports
import { _ } from 'tnp-core/src';
import { BaseCliWorker } from 'tnp-helpers/src';

import { CURRENT_PACKAGE_VERSION } from '../../../../build-info._auto-generated_';

import { DeploymentsContext } from './deployments.context';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsTerminalUI } from './deployments.terminal-ui';
//#endregion

export class DeploymentsWorker extends BaseCliWorker<
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
    await super.startNormallyInCurrentProcess();
    const ctrl = await this.getControllerForRemoteConnection();
    await ctrl.insertEntity().received;
    await ctrl.insertEntity().received;
  }
}
