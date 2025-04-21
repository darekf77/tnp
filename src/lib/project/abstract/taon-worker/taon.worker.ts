//#region imports
import { EndpointContext } from 'taon/src';
import { config } from 'tnp-config/src';
import { _, fse, UtilsTerminal } from 'tnp-core/src';
import { BaseCliWorker, Helpers } from 'tnp-helpers/src';

import { CURRENT_PACKAGE_VERSION } from '../../../build-info._auto-generated_';
import type { TaonProjectResolve } from '../project-resolve';

import { TaonTerminalUI } from './taon-terminal-ui';
import { TaonProjectsContextTemplate } from './taon.context';
import { TaonProjectsController } from './taon.controller';
//#endregion

export class TaonProjectsWorker extends BaseCliWorker<
  TaonProjectsController,
  TaonTerminalUI
> {
  // @ts-ignore
  terminalUI = new TaonTerminalUI(this);

  workerContextTemplate = TaonProjectsContextTemplate as any; // TODO for some reason as any is nessesary
  controllerClass = TaonProjectsController;

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
    super(serviceID, startCommand, CURRENT_PACKAGE_VERSION);
  }
  //#endregion

  //#region methods / start normally in current process
  /**
   * start normally process
   * this will crash if process already started
   */
  async startNormallyInCurrentProcess(): Promise<void> {
    //#region @backendFunc
    Helpers.taskStarted(`Waiting for ports manager to be started...`);
    await this.ins.portsWorker.startDetachedIfNeedsToBeStarted({
      useCurrentWindowForDetach: true,
    });
    Helpers.taskDone(`Ports manager started !`);
    await super.startNormallyInCurrentProcess();
    //#endregion
  }
  //#endregion
}
