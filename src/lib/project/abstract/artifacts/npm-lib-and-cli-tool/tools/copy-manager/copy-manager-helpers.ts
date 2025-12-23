//#region imports
import { config } from 'tnp-core/src';
import { _, crossPlatformPath } from 'tnp-core/src';
import { fse } from 'tnp-core/src';
import { path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import type { Project } from '../.././../../project';
import {
  browserMainProject,
  websqlMainProject,
} from '../../../../../../constants';
import { Models } from '../../../../../../models';
//#endregion

export namespace CopyMangerHelpers {
  //#region helpers / browser websql folders
  export const browserwebsqlFolders = [
    browserMainProject,
    websqlMainProject,
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
