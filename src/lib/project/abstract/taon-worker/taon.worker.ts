//#region imports
import { config } from 'tnp-config/src';
import { fse, UtilsTerminal } from 'tnp-core/src';
import { BaseCliWorker, Helpers } from 'tnp-helpers/src';

import type { TaonProjectResolve } from '../project-resolve';

import { TaonTerminalUI } from './taon-termina-ui';
import { TaonProjectsContext } from './taon.context';
import { TaonProjectsController } from './taon.controller';
//#endregion

export class TaonProjectsWorker extends BaseCliWorker<
  TaonProjectsController,
  TaonTerminalUI
> {
  terminalUI: TaonTerminalUI = new TaonTerminalUI(this);

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
    public readonly ins: TaonProjectResolve,
  ) {
    super(serviceID, startCommand, '0.0.0');
  }
  //#endregion

  //#region methods / get controller for remote connection

  async getControllerForRemoteConnection(): Promise<TaonProjectsController> {
    //#region @backendFunc
    await this.waitForProcessPortSavedToDisk();
    const refRemote = await TaonProjectsContext.initialize({
      overrideRemoteHost: `http://localhost:${this.processLocalInfoObj.port}`,
    });
    const taonProjectsController = refRemote.getInstanceBy(
      TaonProjectsController,
    );
    return taonProjectsController;
    //#endregion
  }
  //#endregion

  //#region methods / start normally in current process
  /**
   * start normally process
   * this will crash if process already started
   */
  async startNormallyInCurrentProcess(options?: {
    healthCheckRequestTrys?: number;
  }): Promise<void> {
    //#region @backendFunc

    Helpers.taskStarted(`Waiting for ports manager to be started...`);
    await this.ins.portsWorker.startDetachedIfNeedsToBeStarted({
      useCurrentWindowForDetach: true,
    });
    Helpers.taskDone(`Ports manager started !`);

    options = options || {};
    await this.preventStartIfAlreadyStarted();
    const port = await this.getServicePort();

    await TaonProjectsContext.initialize({
      overrideHost: `http://localhost:${port}`,
    });

    await this.initializeWorkerMetadata();

    Helpers.info(`Service started !`);
    this.preventExternalConfigChange();
    await this.terminalUI.infoScreen();
    //#endregion
  }
  //#endregion
}
