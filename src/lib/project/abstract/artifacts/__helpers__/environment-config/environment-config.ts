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
import {
  EnvOptions,
  InitingPartialProcess,
  ReleaseArtifactTaon,
} from '../../../../../options';
import type { Project } from '../../../project';
import { Env } from 'electron/common';

//#endregion

//#region @backend
register();
//#endregion

export class EnvironmentConfig // @ts-ignore TODO weird inheritance problem
  extends BaseFeatureForProject<Project>
  implements InitingPartialProcess
{
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
    const configResult = await this.getConfigFor(this.project);

    await this.updateData(configResult);
    //#endregion
  }
  //#endregion

  //#region read env config for artifact/environment
  envOptionsResolve(envOptions: EnvOptions): EnvOptions {
    //#region @backendFunc
    if (!this.project.hasFolder(environments)) {
      const coreEnv = this.project.ins
        .by('isomorphic-lib')
        .pathFor(environments);

      Helpers.copy(coreEnv, this.project.pathFor(environments), {
        recursive: true,
      });
    }

    if (envOptions.release.environment && envOptions.release.targetArtifact) {
      const envConfigForArtifactAndEnvironment =
        this.project.environmentConfig.envOptionsFor(
          envOptions.release.targetArtifact,
          envOptions.release.environment,
          envOptions.release.envNum,
        );
      envOptions = EnvOptions.from(
        _.merge(envConfigForArtifactAndEnvironment, _.cloneDeep(envOptions)),
      );
    } else {
      envOptions = EnvOptions.from(
        _.merge(this.envOptionsProjectLevel, _.cloneDeep(envOptions)),
      );
    }
    return this.setGeneratedValues(envOptions);
    //#endregion
  }

  private envOptionsFor(
    artifactName: ReleaseArtifactTaon,
    environmentName: CoreModels.EnvironmentNameTaon,
    envNum: number = undefined,
  ): EnvOptions {
    //#region @backendFunc
    let env: EnvOptions;
    try {
      env = require(
        this.project.pathFor(
          `environments/${artifactName}/` +
            `env.${artifactName}.${environmentName}${envNum === undefined ? '' : envNum}.ts`,
        ),
      )?.default;
    } catch (error) {
      Helpers.error(error, true, true);
      Helpers.error(
        `Incorrect env config for:
         artifactName: ${artifactName}
         environmentName: ${environmentName}
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
  public get envOptionsProjectLevel(): EnvOptions {
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
  private async updateData(envOptions?: EnvOptions): Promise<void> {
    //#region @backendFunc

    this.saveEnvironmentConfig(envOptions);
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

  //#region set generated values
  private setGeneratedValues(envOptions: EnvOptions): EnvOptions {
    //#region @backendFunc
    if (this.project.git.isInsideGitRepo) {
      // @ts-expect-error overriding readonly property
      envOptions.buildInfo = {
        number: this.project.git.countComits(),
        date: this.project.git.lastCommitDate(),
        hash: this.project.git.lastCommitHash(),
      };
    }

    // @ts-expect-error overriding readonly property
    envOptions.currentProjectName = this.project.name;
    // @ts-expect-error overriding readonly property
    envOptions.currentProjectGenericName = this.project.genericName;
    // @ts-expect-error overriding readonly property
    envOptions.currentProjectType = this.project.type;

    if (this.project.framework.isStandaloneProject) {
      // TODO I think this is not needed anymore - or something better is needed
      envOptions['pathsTsconfig'] =
        `"paths": ` +
        JSON.stringify({
          [`${this.project.name}`]: ['./src/lib'],
          [`${this.project.name}/*`]: ['./src/lib/*'],
        });
    } else if (this.project.framework.isContainer) {
      // TODO
    }

    if (
      envOptions['pathsTsconfig'] &&
      !(envOptions['pathsTsconfig'] as string)?.endsWith(',')
    ) {
      envOptions['pathsTsconfig'] = `${envOptions['pathsTsconfig']},`;
    }
    return envOptions;
    //#endregion
  }
  //#endregion

  //#region save config workspace
  private saveEnvironmentConfig(projectConfig: EnvOptions): void {
    //#region @backendFunc
    projectConfig = this.setGeneratedValues(projectConfig);

    const tmpEnvironmentPath = path.join(
      this.project.location,
      config.file.tnpEnvironment_json,
    );
    const tmpEnvironmentPathBrowser = path.join(
      this.project.location,
      'tmp-environment-for-browser.json',
    );

    if (
      this.project.framework.isStandaloneProject ||
      this.project.framework.isContainer
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
        `Config saved in project ${chalk.bold(this.project.genericName)}
      ${tmpEnvironmentPath}`,
      );
    }
    //#endregion
  }
  //#endregion

  //#endregion
}
