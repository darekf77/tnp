import { CoreModels, crossPlatformPath, Helpers } from 'tnp-core/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import {
  InitingPartialProcess,
  ReleaseArtifactTaon,
  ReleaseArtifactTaonNamesArr,
  EnvOptions,
} from '../../../options';
import type { Project } from '../project';

export class ReleaseConfig // @ts-ignore TODO weird inheritance problem
  extends BaseFeatureForProject<Project>
  implements InitingPartialProcess
{
  async init(options?: EnvOptions): Promise<void> {
    //#region @backendFunc
    const environmentsAbsPath = this.project.pathFor('environments');
    Helpers.mkdirp(environmentsAbsPath);
    for (const artifactName of ReleaseArtifactTaonNamesArr) {
      Helpers.mkdirp([environmentsAbsPath, artifactName]);
      (['__', 'prod', 'ci'] as CoreModels.EnvironmentNameTaon[]).forEach(
        envName => {
          const envFileName = crossPlatformPath(
            [
              environmentsAbsPath,
              artifactName,
              `env.${artifactName}.${envName}.ts`,
            ].join('/'),
          );
          Helpers.removeFolderIfExists(envFileName);
          if (!Helpers.exists(envFileName)) {
            Helpers.writeFile(envFileName, '');
          }
        },
      );
    }
    //#endregion
  }

  create() {}
}
