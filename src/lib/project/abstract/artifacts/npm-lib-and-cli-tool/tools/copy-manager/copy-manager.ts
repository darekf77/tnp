import { BuildOptions } from '../../../../../../options';
import type { Project } from '../../../../project';

import { BaseCopyManger } from './base-copy-manager';
import type { CopyManagerOrganization } from './copy-manager-organization';
import type { CopyManagerStandalone } from './copy-manager-standalone';

export abstract class CopyManager extends BaseCopyManger {
  //#region static
  static for(project: Project): CopyManager {
    //#region @backendFunc
    if (project.framework.isSmartContainer) {
      const CopyManagerOrganizationClass =
        require('./copy-manager-organization')
          .CopyManagerOrganization as typeof CopyManagerOrganization;
      return new CopyManagerOrganizationClass(project);
    } else {
      const CopyManagerStandaloneClass = require('./copy-manager-standalone')
        .CopyManagerStandalone as typeof CopyManagerStandalone;
      return new CopyManagerStandaloneClass(project);
    }
    //#endregion
  }
  //#endregion
  abstract init(
    buildOptions: BuildOptions,
    renameDestinationFolder?: string,
  ): void;
}
