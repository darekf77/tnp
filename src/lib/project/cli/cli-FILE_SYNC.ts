//#region imports
import { watch } from 'fs';

import { UtilsOs } from 'tnp-core/src';
import { _, crossPlatformPath } from 'tnp-core/src';
import { dotTaonFolder } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';
import { UtilsFileSync } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem
class $FileSync extends BaseCli {
  public async _(): Promise<void> {
    // TODO @LAST in progress
    return;
    const [androidFolder, macPhotosLibrary, ...onlyProcessFiles] = this.args;
    await UtilsFileSync.forFolders({
      androidFolder,
      macPhotosLibrary,
      onlyProcessFiles,
      tempConvertFolder: crossPlatformPath([
        UtilsOs.getRealHomeDir(),
        dotTaonFolder,
        'temp-data',
        'file-sync-convert',
      ]),
    });
  }
}

export default {
  $FileSync: Helpers.CLIWRAP($FileSync, '$FileSync'),
};
