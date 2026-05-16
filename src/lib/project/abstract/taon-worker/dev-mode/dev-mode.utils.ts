import { UtilsProjects } from 'tnp-core/src';

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
}
