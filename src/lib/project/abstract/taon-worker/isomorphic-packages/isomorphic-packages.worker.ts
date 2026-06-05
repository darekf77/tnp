//#region imports
import { _ } from 'tnp-core/src';
import { BaseCliWorker } from 'tnp-helpers/src';

import { CURRENT_PACKAGE_VERSION } from '../../../../build-info._auto-generated_';

import { IsomorphicPackagesContext } from './isomorphic-packages.context';
import { IsomorphicPackagesController } from './isomorphic-packages.controller';
import { IsomorphicPackagesTerminalUI } from './isomorphic-packages.terminal-ui';
//#endregion

export class IsomorphicPackagesWorker extends BaseCliWorker<
  IsomorphicPackagesController,
  IsomorphicPackagesTerminalUI
> {
  //#region properties
  // TODO 'as any' for some reason is necessary
  // TypeScript d.ts generation bug
  workerContextTemplate = IsomorphicPackagesContext as any;

  readonly terminalUI = new IsomorphicPackagesTerminalUI(this);

  readonly controllerClass = IsomorphicPackagesController;
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
