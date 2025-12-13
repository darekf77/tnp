import { fileName, folderName } from 'tnp-core/src';
import { BaseFileFoldersOperations } from 'tnp-helpers/src';

import {
  dotVscodeMainProject,
  environmentsFolder,
  envTs,
} from '../../constants';

// @ts-ignore TODO weird inheritance problem
export class FileFoldersOperations extends BaseFileFoldersOperations<Project> {
  protected fielsAndFoldersToCopy(): string[] {
    const original = super.fielsAndFoldersToCopy();
    return [
      ...original,
      fileName.taon_jsonc,
      `__${folderName.assets}`,
      dotVscodeMainProject,
      envTs,
      'logo.png',
      'logo.svg',
      environmentsFolder,
    ];
  }
}
