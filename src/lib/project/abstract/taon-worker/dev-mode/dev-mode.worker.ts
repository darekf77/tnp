//#region imports
import { _ } from 'tnp-core/src';
import { BaseCliWorker } from 'tnp-helpers/src';

import { CURRENT_PACKAGE_VERSION } from '../../../../build-info._auto-generated_';

import { DevModeContext } from './dev-mode.context';
import { DevModeController } from './dev-mode.controller';
import { DevModeTerminalUI } from './dev-mode.terminal-ui';
//#endregion

export class DevModeWorker extends BaseCliWorker<
  DevModeController,
  DevModeTerminalUI
> {
  //#region properties
  // TODO 'as any' for some reason is necessary
  // TypeScript d.ts generation bug
  workerContextTemplate = DevModeContext as any;

  readonly terminalUI = new DevModeTerminalUI(this);

  readonly controllerClass = DevModeController;
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
    startCommandFn: () => string,
  ) {
    // replace '0.0.0' with CURRENT_PACKAGE_VERSION for versioning
    super(serviceID, startCommandFn, CURRENT_PACKAGE_VERSION);
  }
  //#endregion
}
