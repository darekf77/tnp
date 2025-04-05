import { EnvOptions } from '../../../../../../options';
import type { Project } from '../../../../project';

import { BaseCopyManger } from './base-copy-manager';
import type { CopyManagerStandalone } from './copy-manager-standalone';

export abstract class CopyManager extends BaseCopyManger {
  //#region static
  static for(project: Project): CopyManager {
    //#region @backendFunc

    const CopyManagerStandaloneClass = require('./copy-manager-standalone')
      .CopyManagerStandalone as typeof CopyManagerStandalone;
    return new CopyManagerStandaloneClass(project);

    //#endregion
  }
  //#endregion
  abstract init(
    buildOptions: EnvOptions,
    renameDestinationFolder?: string,
  ): void;
}
