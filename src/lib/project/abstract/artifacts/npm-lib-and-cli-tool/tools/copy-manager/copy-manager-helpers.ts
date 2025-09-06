//#region imports
import { config } from 'tnp-config/src';
import { _, crossPlatformPath } from 'tnp-core/src';
import { fse } from 'tnp-core/src';
import { path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import type { Project } from '../.././../../project';
import { Models } from '../../../../../../models';
//#endregion

export namespace CopyMangerHelpers {
  export const angularBrowserComiplationFolders = {
    esm2022: 'esm2022',
    fesm2022: 'fesm2022',
  };

  export const angularBrowserComiplationFoldersArr = Object.values(
    angularBrowserComiplationFolders,
  ) as (keyof typeof angularBrowserComiplationFolders)[];

  //#region helpers / browser websql folders
  export const browserwebsqlFolders = [
    config.folder.browser,
    config.folder.websql,
  ] as ('browser' | 'websql' | string)[];
  //#endregion

  //#region helpers / pure child name
  export function childPureName(child: Project) {
    //#region @backendFunc
    return child.name.startsWith('@') ? child.name.split('/')[1] : child.name; // pure name
    //#endregion
  }
  //#endregion
}
