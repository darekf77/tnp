//#region imports
import { incrementalWatcher } from 'incremental-compiler/src';
import { walk } from 'lodash-walk-object/src';
import { from } from 'rxjs';
import { config } from 'tnp-config/src';
import { chalk, CoreModels, crossPlatformPath, fse, Utils } from 'tnp-core/src';
import { path } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { BaseFeatureForProject, UtilsTypescript } from 'tnp-helpers/src';
import { Helpers } from 'tnp-helpers/src';
import { register } from 'ts-node';

import {
  coreRequiredEnvironments,
  DUMMY_LIB,
  environments,
  envTs,
  THIS_IS_GENERATED_INFO_COMMENT,
  THIS_IS_GENERATED_STRING,
} from '../../../../../constants';
import {
  allPathsEnvConfig,
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseArtifactTaonNamesArr,
} from '../../../../../options';
import type { Project } from '../../../project';

//#endregion

//#region @backend
try {
  register({
    transpileOnly: true,
    compilerOptions: {
      skipLibCheck: true,
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
    },
  });
} catch (error) {}

//#endregion

export class EnvironmentConfig // @ts-ignore TODO weird inheritance problem
  extends BaseFeatureForProject<Project>
{
  //#region api

  //#region api / create artifact
  public async createForArtifact(
    artifactName: ReleaseArtifactTaon,
    envName: CoreModels.EnvironmentNameTaon = CoreModels.EnvironmentName.__,
    envNumber: number = undefined,
  ): Promise<void> {
    //#region @backendFunc
    const environmentsAbsPath = this.project.pathFor([
      environments,
      artifactName,
      `env.${artifactName}.${envName}${envNumber ?? ''}.ts`,
    ]);

    Helpers.writeFile(environmentsAbsPath, this.getBaseEnvTemplate());

    UtilsTypescript.formatFile(environmentsAbsPath);
    //#endregion
  }
  //#endregion

  async watchAndRecreate(onChange: () => any): Promise<void> {
    //#region @backendFunc
    if (this.project.framework.isStandaloneProject) {
      const watcher = await incrementalWatcher(
        [
          this.project.pathFor(`environments/**/*.ts`),
          this.project.pathFor(`env.ts`),
        ],
        {
          name: 'Environment Config Watcher',
          ignoreInitial: true,
          followSymlinks: false,
        },
      );
      watcher.on('all', async (event, filePath) => {
        onChange();
      });
    }

    //#endregion
  }

  //#region api / update
  public async update(
    envConfigFromParams: EnvOptions,
    options?: {
      fromWatcher?: boolean;
      saveEnvToLibEnv?: boolean;
    },
  ): Promise<EnvOptions> {
    //#region @backendFunc
    options = options || {};
    Helpers.taskStarted(
      `${options.fromWatcher ? '(watcher) ' : ''}Updating environment config `,
    );
    envConfigFromParams = EnvOptions.from(envConfigFromParams);

    this.makeSureEnvironmentExists();

    if (options.saveEnvToLibEnv) {
      if (!options.fromWatcher) {
        this.project.remove(`src/lib/env`);
      }
    }

    const configResult = await this.envOptionsResolve(
      envConfigFromParams,
      options.fromWatcher,
    );
    configResult.applyFieldsFrom(envConfigFromParams);

    this.updateGeneratedValues(configResult);

    if (options.saveEnvToLibEnv && this.project.framework.isStandaloneProject) {
      for (const targetArtifact of ReleaseArtifactTaonNamesArr) {
        const toApplyWithTarget = configResult.clone({
          release: {
            targetArtifact,
          },
        });
        const configResultForTarget = await this.envOptionsResolve(
          toApplyWithTarget,
          options.fromWatcher,
        );

        this.saveEnvironmentConfig(configResultForTarget);
      }

      this.project.framework.generateIndexTs('src/lib/env');
    }

    Helpers.taskDone(
      `${options.fromWatcher ? '(watcher) ' : ''}Done updating environment config `,
    );

    return configResult;
    //#endregion
  }
  //#endregion

  //#endregion

  //#region private methods

  //#region private methods / env options resolve
  private envOptionsResolve(
    envOptions: EnvOptions,
    fromWatcher = false,
  ): EnvOptions {
    //#region @backendFunc
    if (!envOptions.release.envName) {
      envOptions.release.envName = '__';
    }
    if (envOptions.release.envName && envOptions.release.targetArtifact) {
      const envConfigForArtifactAndEnvironment = EnvOptions.from(
        this.project.environmentConfig.getEnvFor(
          envOptions.release.targetArtifact,
          envOptions.release.envName,
          envOptions.release.envNumber,
          fromWatcher,
        ),
      ).clone({
        // must be reapplied after cloning
        release: {
          targetArtifact: envOptions.release.targetArtifact,
          envName: envOptions.release.envName,
          envNumber: envOptions.release.envNumber,
        },
      });
      return envConfigForArtifactAndEnvironment;
    } else {
      const mainConfig = EnvOptions.from(this.getEnvMain());
      return mainConfig;
    }
    //#endregion
  }
  //#endregion

  //#region private methods / get env for
  private getEnvFor(
    artifactName: ReleaseArtifactTaon,
    environmentName: CoreModels.EnvironmentNameTaon,
    envNum: number = undefined,
    fromWatcher = false,
  ): Partial<EnvOptions> {
    //#region @backendFunc
    let env: Partial<EnvOptions>;
    // Helpers.taskStarted(
    //   `${fromWatcher ? '(watcher) ' : ''}Reading environment config for ` +
    //     `${artifactName}/${environmentName}/${envNum || ''}`,
    // );

    try {
      const pathToEnvTs = this.project.pathFor(
        `environments/${artifactName}/` +
          `env.${artifactName}.${environmentName}${envNum === undefined ? '' : envNum}.ts`,
      );

      UtilsTypescript.clearRequireCacheRecursive(pathToEnvTs);
      env = require(pathToEnvTs)?.default;
    } catch (error) {
      // TODO QUICK_FIX @UNCOMMENT @LAST
      if (this.project.framework.isCoreProject) {
        return {};
      }
      console.error(error, true, true);
      Helpers.error(
        `Incorrect env config for:
         artifactName: ${artifactName}
         environmentName: ${environmentName}
         envNum: ${envNum}
        `,
      );
    }
    // Helpers.taskDone(
    //   `${fromWatcher ? '(watcher) ' : ''}Done reading environment config for ` +
    //     `${artifactName}/${environmentName}/${envNum || ''}`,
    // );
    return env;
    //#endregion
  }
  //#endregion

  //#region private methods / get env main
  public getEnvMain(): Partial<EnvOptions> {
    //#region @backendFunc

    // Helpers.taskStarted(`Reading environment config for ${this.project.name}`);
    let configStandaloneEnv: EnvOptions;
    try {
      UtilsTypescript.clearRequireCacheRecursive(this.absPathToEnvTs);
      configStandaloneEnv = require(this.absPathToEnvTs)?.default;
    } catch (error) {
      // TODO QUICK_FIX @UNCOMMENT @LAST
      if (this.project.framework.isCoreProject) {
        return {};
      }
      console.log(error);
      Helpers.error(
        `Incorrect env config for:
         project: ${this.project.name}
        `,
      );
    }
    // Helpers.taskDone(
    //   `Done reading environment config for ${this.project.name}`,
    // );

    if (!configStandaloneEnv) {
      Helpers.throw(`Please provide default export in ${this.absPathToEnvTs}`);
    }

    return configStandaloneEnv;
    //#endregion
  }
  //#endregion

  //#region private methods / get base env template
  private getBaseEnvTemplate(jsonString = '{ ...baseEnv }'): string {
    //#region @backendFunc
    const isBase = jsonString === '{ ...baseEnv }';
    const fileToSave = `${'import'} type { EnvOptions } from '${'tnp'}/${'src'}';
  ${isBase ? `${'import'} baseEnv from '../../env';` : ''}
  const env: Partial<EnvOptions> = ${jsonString};
  export default env;
  `;
    return fileToSave;
    //#endregion
  }
  //#endregion

  //#region private methods / update generated values
  public updateGeneratedValues(envOptions: EnvOptions): void {
    //#region @backendFunc
    if (this.project.git.isInsideGitRepo && envOptions.release.targetArtifact) {
      // @ts-expect-error overriding readonly property
      envOptions.buildInfo = {
        // number: this.project.git.countComits(),
        date: this.project.git.lastCommitDate(),
        hash: this.project.git.lastCommitHash(),
      };
    }

    // @ts-expect-error overriding readonly property
    envOptions.currentProjectName = this.project.name;

    // @ts-expect-error overriding readonly property
    envOptions.appId = this.project.taonJson.appId;

    if (this.project.framework.isStandaloneProject) {
      // TODO I think this is not needed anymore - or something better is needed
      envOptions['pathsTsconfig'] =
        `"paths": ` +
        JSON.stringify({
          [`${DUMMY_LIB}`]: ['./src/lib'],
          [`${DUMMY_LIB}/*`]: ['./src/lib/*'],
          [`${this.project.nameForNpmPackage}/src`]: ['./src/lib'],
          [`${this.project.nameForNpmPackage}/src/*`]: ['./src/lib/*'],
        });
    } else if (this.project.framework.isContainer) {
      // TODO
      // console.log(`
      //   container not initing
      //   `);
    }

    if (
      envOptions['pathsTsconfig'] &&
      !(envOptions['pathsTsconfig'] as string)?.endsWith(',')
    ) {
      envOptions['pathsTsconfig'] = `${envOptions['pathsTsconfig']},`;
    }
    //#endregion
  }
  //#endregion

  //#region private methods / save config workspace
  private saveEnvironmentConfig(projectEnvConfig: EnvOptions): void {
    //#region @backendFunc

    if (this.project.framework.isStandaloneProject) {
      const backendConfigFileName = `env.${projectEnvConfig.release.targetArtifact}.ts`;
      const backendConstants: string[] = [];
      const pathsWithValues = [];

      walk.Object(
        projectEnvConfig,
        (val, lodashPath, newValue) => {
          if (!_.isObject(val)) {
            pathsWithValues.push(lodashPath);
            backendConstants.push(
              `export const ENV_` +
                `${_.snakeCase(projectEnvConfig.release.targetArtifact).toUpperCase()}_` +
                `${_.snakeCase(lodashPath).replace(/\ /g, '_').toUpperCase()} ` +
                `= ${_.isString(val) ? `'${val}'` : val};`,
            );
          }
        },
        { walkGetters: false },
      );

      // console.log({ allPathsEnvConfig, pathsWithValues });
      for (const setUndefinedLodashPath of allPathsEnvConfig) {
        if (!pathsWithValues.includes(setUndefinedLodashPath)) {
          backendConstants.push(
            `export const ENV_` +
              `${_.snakeCase(projectEnvConfig.release.targetArtifact).toUpperCase()}_` +
              `${_.snakeCase(setUndefinedLodashPath).replace(/\ /g, '_').toUpperCase()} ` +
              `= undefined;`,
          );
        }
      }

      this.project.writeFile(
        `src/lib/env/${backendConfigFileName}`,
        `${THIS_IS_GENERATED_INFO_COMMENT}
${backendConstants.join('\n')}
${THIS_IS_GENERATED_INFO_COMMENT}`,
      );
    }

    //#endregion
  }
  //#endregion

  makeSureEnvironmentExists(): void {
    //#region @backendFunc
    if (!this.project.hasFolder(environments)) {
      const coreEnv = this.project.ins
        .by('isomorphic-lib')
        .pathFor(environments);

      Helpers.copy(coreEnv, this.project.pathFor(environments), {
        recursive: true,
      });
    }

    if (!fse.existsSync(this.absPathToEnvTs)) {
      const jsonString = JSON.stringify({
        website: {
          domain: `${this.project.name}.example.domain.com`,
          title: _.startCase(this.project.name),
        },
      } as Partial<EnvOptions>);

      Helpers.writeFile(
        this.absPathToEnvTs,
        this.getBaseEnvTemplate(jsonString),
      );

      UtilsTypescript.formatFile(this.absPathToEnvTs);
    }

    for (const artifactName of ReleaseArtifactTaonNamesArr) {
      for (const envName of coreRequiredEnvironments) {
        const relativePathToArtifacEnv = crossPlatformPath([
          environments,
          artifactName,
          `env.${artifactName}.${envName}.ts`,
        ]);
        const absPathToArtifactEnv = this.project.pathFor(
          relativePathToArtifacEnv,
        );
        if (!fse.existsSync(absPathToArtifactEnv)) {
          const coreProjectArtifactPath =
            this.project.framework.coreProject.pathFor(
              relativePathToArtifacEnv,
            );
          Helpers.copyFile(coreProjectArtifactPath, absPathToArtifactEnv);
        }
      }
    }

    //#endregion
  }

  private get absPathToEnvTs(): string {
    return crossPlatformPath([this.project.location, envTs]);
  }

  //#endregion
}
