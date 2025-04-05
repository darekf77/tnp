//#region imports
import { walk } from 'lodash-walk-object/src';
import { config } from 'tnp-config/src';
import { chalk, CoreModels, crossPlatformPath, fse } from 'tnp-core/src';
import { path } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { BaseFeatureForProject, UtilsTypescript } from 'tnp-helpers/src';
import { Helpers } from 'tnp-helpers/src';
import { register } from 'ts-node';

import { environments, envTs } from '../../../../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../../../../options';
import type { Project } from '../../../project';
import { Env } from 'electron';

//#endregion

//#region @backend
register();
//#endregion

// @ts-ignore TODO weird inheritance problem
export class EnvironmentConfig extends BaseFeatureForProject<Project> {
  //#region copy to
  copyTo(destination: string): void {
    //#region @backend
    (() => {
      const source = path.join(this.project.location, envTs);
      const dest = path.join(destination, envTs);
      Helpers.copyFile(source, dest);
    })();
    (() => {
      const source = path.join(
        this.project.location,
        config.file.tnpEnvironment_json,
      );
      const dest = path.join(destination, config.file.tnpEnvironment_json);
      Helpers.copyFile(source, dest);
    })();
    //#endregion
  }
  //#endregion

  //#region init
  public async init(): Promise<void> {
    //#region @backendFunc

    if (!this.project.hasFolder(environments)) {
      const coreEnv = this.project.ins
        .by('isomorphic-lib')
        .pathFor(environments);
      Helpers.copy(coreEnv, this.project.pathFor(environments), {
        recursive: true,
      });
    }

    const configResult = await this.getConfigFor(this.project);

    await this.updateData(configResult);
    //#endregion
  }
  //#endregion

  //#region read env config for artifact/environemtnt
  envConfigFor(
    artifactName: ReleaseArtifactTaon,
    environemtnName: CoreModels.EnvironmentNameTaon,
    envNum: number = undefined,
  ): EnvOptions {
    //#region @backendFunc
    let env: EnvOptions;
    try {
      env = require(
        this.project.pathFor(
          `environments/${artifactName}/` +
            `env.${artifactName}.${environemtnName}${envNum === undefined ? '' : envNum}.ts`,
        ),
      )?.default;
    } catch (error) {
      Helpers.error(error, true, true);
      Helpers.error(
        `Incorect env config for:
         artifactName: ${artifactName}
         environemtnName: ${environemtnName}
         envNum: ${envNum}
        `,
      );
    }
    return env;
    //#endregion
  }
  //#endregion

  //#region config
  /**
   * @IMPORTANT
   * Can be accesed only after project.env.init()
   */
  public get config(): EnvOptions {
    //#region @backendFunc
    const configPath = crossPlatformPath([
      this.project.location,
      config.file.tnpEnvironment_json,
    ]);
    return EnvOptions.loadFromFile(configPath);
    //#endregion
  }
  //#endregion

  //#region  private methods

  //#region update data
  private async updateData(configEn?: EnvOptions): Promise<void> {
    //#region @backendFunc
    if (this.project.git.isInsideGitRepo) {
      if (!configEn && this.project.framework.frameworkVersionAtLeast('v3')) {
        Helpers.error(
          `Please build library first: ${config.frameworkName} build:dist`,
        );
      }

      // @ts-expect-error overriding readonly property
      configEn.buildInfo = {
        number: this.project.git.countComits(),
        date: this.project.git.lastCommitDate(),
        hash: this.project.git.lastCommitHash(),
      };
      // console.log('upppp done')
    }
    this.saveEnvironmentConfig(this.project, configEn);
    //#endregion
  }
  //#endregion

  //#region standalone config by
  private async getConfigFor(project: Project): Promise<EnvOptions> {
    //#region @backendFunc

    var pathToProjectEnvironmentAbsPath = crossPlatformPath([
      project.location,
      envTs,
    ]);

    if (!fse.existsSync(pathToProjectEnvironmentAbsPath)) {
      const jsonString = JSON.stringify({
        website: {
          domain: `${project.name}.example.domain.com`,
          title: _.startCase(project.name),
        },
      } as Partial<EnvOptions>);

      const fileToSave = `${'import'} type { EnvOptions } from '${'tnp'}/${'src'}';
const env: Partial<EnvOptions> = ${jsonString};
export default env;
`;
      Helpers.writeFile(pathToProjectEnvironmentAbsPath, fileToSave);

      UtilsTypescript.formatFile(pathToProjectEnvironmentAbsPath);
    }

    let configStandaloneEnv: EnvOptions = require(
      pathToProjectEnvironmentAbsPath,
    )?.default;

    if (!configStandaloneEnv) {
      Helpers.throw(
        `Please provide default export in ${pathToProjectEnvironmentAbsPath}`,
      );
    }

    return configStandaloneEnv;
    //#endregion
  }
  //#endregion

  //#region save config workspace
  private saveEnvironmentConfig(
    project: Project,
    projectConfig: EnvOptions,
  ): void {
    //#region @backendFunc
    // @ts-expect-error overriding readonly property
    projectConfig.currentProjectName = project.name;
    // @ts-expect-error overriding readonly property
    projectConfig.currentProjectGenericName = project.genericName;
    // @ts-expect-error overriding readonly property
    projectConfig.currentProjectType = project.type;

    if (project.framework.isStandaloneProject) {
      projectConfig['pathsTsconfig'] =
        `"paths": ` +
        JSON.stringify({
          [`${project.name}`]: ['./src/lib'],
          [`${project.name}/*`]: ['./src/lib/*'],
        });
    }

    if (
      projectConfig['pathsTsconfig'] &&
      !(projectConfig['pathsTsconfig'] as string)?.endsWith(',')
    ) {
      projectConfig['pathsTsconfig'] = `${projectConfig['pathsTsconfig']},`;
    }

    const tmpEnvironmentPath = path.join(
      project.location,
      config.file.tnpEnvironment_json,
    );
    const tmpEnvironmentPathBrowser = path.join(
      project.location,
      'tmp-environment-for-browser.json',
    );

    if (
      project.framework.isStandaloneProject ||
      project.framework.isContainer
    ) {
      Helpers.writeJson(tmpEnvironmentPath, projectConfig);
      const clonedConfig = _.cloneDeep(projectConfig);
      // console.log(JSON.stringify(clonedConfig))
      walk.Object(clonedConfig, (val, path, newValue) => {
        if (_.last(path.split('.')).startsWith('$')) {
          newValue(null);
        }
      });
      Helpers.writeJson(tmpEnvironmentPathBrowser, clonedConfig);
      Helpers.log(
        `Config saved in project ${chalk.bold(project.genericName)}
      ${tmpEnvironmentPath}`,
      );
    }
    //#endregion
  }
  //#endregion

  //#endregion
}
