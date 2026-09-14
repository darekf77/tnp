import { Helpers, UtilsProjects } from 'tnp-core/src';

import type { DevBuildController } from '../dev-build/dev-build.controller';

import { DevMode } from './dev-mode.models';

export namespace DevModeUtils {
  export const dependenciesTreeForBuild = (
    allProjects: DevMode.ProjectBuildNotificaiton[],
    onlyAffectedByProject: string[],
  ): DevMode.ProjectBuildNotificaiton[] => {
    allProjects = UtilsProjects.sortGroupOfProject({
      projects: allProjects,
      resoveDepsArray: proj => proj.devModeDependenciesNames,
      projNameToCompare: proj => proj.nameForNpmPackage,
      projUniqueKeyToCompare: proj => proj.uniqueKey,
      onlyAffectedByProject,
    });
    return allProjects;
  };

  export const healthCheck = async (
    devBuildController: DevBuildController,
  ): Promise<boolean> => {
    //#region @backendFunc
    let maxTrys = 3;
    do {
      try {
        Helpers.logInfo(`Checkin health... `);
        const data = await devBuildController.healthCheck().request!({
          timeout: 500,
        });
        const isOK = data.body.booleanValue;
        Helpers.logInfo(`is ok = "${isOK}"`);

        return isOK;
      } catch (error) {
        Helpers.logInfo(`is ok = ERROR `);
      }
    } while (--maxTrys > 0);
    return false;
    //#endregion
  };
}
