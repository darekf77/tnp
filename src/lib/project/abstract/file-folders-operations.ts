import { fileName, folderName } from 'tnp-config/src';
import { BaseFileFoldersOperations } from 'tnp-helpers/src';

import { environments } from '../../constants';

// @ts-ignore TODO weird inheritance problem
export class FileFoldersOperations extends BaseFileFoldersOperations<Project> {
  protected fielsAndFoldersToCopy(): string[] {
    const original = super.fielsAndFoldersToCopy();
    return [
      ...original,
      fileName.taon_jsonc,
      `__${folderName.assets}`,
      '.vscode',
      'env.ts',
      'logo.png',
      'logo.svg',
      environments,
    ];
  }
}
