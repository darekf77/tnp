//#region imports
import { _ } from 'tnp-core/src';
import { BaseCliWorker } from 'tnp-helpers/src';

import { CURRENT_PACKAGE_VERSION } from '../../../../build-info._auto-generated_';

import { SecretsKeychainActiveContext } from './secrets-keychain.active.context';
import { SecretsKeychainController } from './secrets-keychain.controller';
import { SecretsKeychainTerminalUI } from './secrets-keychain.terminal-ui';
//#endregion

export class SecretsKeychainWorker extends BaseCliWorker<
  SecretsKeychainController,
  SecretsKeychainTerminalUI
> {
  //#region properties
  // TODO 'as any' for some reason is necessary
  // TypeScript d.ts generation bug
  workerContextTemplate = SecretsKeychainActiveContext as any;

  readonly terminalUI = new SecretsKeychainTerminalUI(this);

  readonly controllerClass = SecretsKeychainController;
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
    startCommandFn: ()=> string,
  ) {
    // replace '0.0.0' with CURRENT_PACKAGE_VERSION for versioning
    super(serviceID, startCommandFn, CURRENT_PACKAGE_VERSION);
  }
  //#endregion
}
