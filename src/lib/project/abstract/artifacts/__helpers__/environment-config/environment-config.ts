//#region imports
import { incrementalWatcher } from 'incremental-compiler/src';
import { walk } from 'lodash-walk-object/src';
import { from } from 'rxjs';
import { config, LibTypeEnum, tnpPackageName } from 'tnp-core/src';
import { chalk, CoreModels, crossPlatformPath, fse, Utils } from 'tnp-core/src';
import { path } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { BaseFeatureForProject, HelpersTaon, UtilsTypescript } from 'tnp-helpers/src';
import { Helpers } from 'tnp-helpers/src';
import { register } from 'ts-node';

import {
  coreRequiredEnvironments,
  DUMMY_LIB,
  environmentsFolder,
  envTs,
  libFromImport,
  libFromSrc,
  srcFromTaonImport,
  srcMainProject,
  TaonGeneratedFolders,
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
      environmentsFolder,
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
      const watcher = incrementalWatcher(
        [
          this.project.pathFor(`${environmentsFolder}/**/*.ts`),
          this.project.pathFor(`${envTs}`),
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

      this.project.framework.generateIndexTs(
        `${srcMainProject}/${libFromSrc}/${TaonGeneratedFolders.ENV_FOLDER}`,
      );
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
        // TODO @LAST APPLY ALL FIELDS FROM
        // must be reapplied after cloning envOptions also
        release: {
          targetArtifact: envOptions.release.targetArtifact,
          envName: envOptions.release.envName,
          envNumber: envOptions.release.envNumber,
        },
        copyToManager:{
          beforeCopyHook: envOptions.copyToManager.beforeCopyHook
        }
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
        `${environmentsFolder}/${artifactName}/` +
          `env.${artifactName}.${environmentName}${envNum === undefined ? '' : envNum}.ts`,
      );

      // TODO QUICK_FIX
      if (!fse.existsSync(pathToEnvTs)) {
        HelpersTaon.copyFile(
          crossPlatformPath([
            path.dirname(pathToEnvTs),
            `env.${artifactName}.${CoreModels.EnvironmentName.__}.ts`,
          ]),
          pathToEnvTs,
        );
      }

      UtilsTypescript.clearRequireCacheRecursive(pathToEnvTs);
      // @ts-ignore
      env = require(pathToEnvTs)?.default;
    } catch (error) {
      // TODO QUICK_FIX @UNCOMMENT
      if (this.project.framework.isCoreProject) {
        return {};
      }
      const errMsg = (error instanceof Error && error.message) || String(error);
      console.error(errMsg);
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
      // TODO QUICK_FIX @UNCOMMENT
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
      Helpers.throwError(`Please provide default export in ${this.absPathToEnvTs}`);
    }

    return configStandaloneEnv;
    //#endregion
  }
  //#endregion

  //#region private methods / get base env template
  private getBaseEnvTemplate(jsonString = '{ ...baseEnv }'): string {
    //#region @backendFunc
    const isBase = jsonString === '{ ...baseEnv }';
    const fileToSave = `${'import'} type { EnvOptions } from '${tnpPackageName}/${'src'}';
  ${isBase ? `${'import'} baseEnv from '../../${envTs.replace('.ts', '')}';` : ''}
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
        // number: this.project.git.countCommits(),
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
          [`${DUMMY_LIB}`]: [`./${srcMainProject}/${libFromSrc}`],
          [`${DUMMY_LIB}/*`]: [`./${srcFromTaonImport}/${libFromImport}/*`],
          [`${this.project.nameForNpmPackage}/${srcMainProject}`]: [
            `./${srcFromTaonImport}/${libFromImport}`,
          ],
          [`${this.project.nameForNpmPackage}/${srcMainProject}/*`]: [
            `./${srcFromTaonImport}/${libFromImport}/*`,
          ],
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
        `${srcMainProject}/${libFromImport}/${TaonGeneratedFolders.ENV_FOLDER}/${backendConfigFileName}`,
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
    if (!this.project.hasFolder(environmentsFolder)) {
      const coreEnv = this.project.ins
        .by(LibTypeEnum.ISOMORPHIC_LIB)
        .pathFor(environmentsFolder);

      HelpersTaon.copy(coreEnv, this.project.pathFor(environmentsFolder), {
        recursive: true,
      });
    }

    if (!fse.existsSync(this.absPathToEnvTs)) {
      const jsonString = JSON.stringify({
        website: {
          domain: `${this.project.name}.example.domain.com`,
          title: _.startCase(this.project.name),
          useDomain: true,
        },
        loading: {
          preAngularBootstrap: {
            background: '#fdebed', // light pink
            loader: {
              name: 'lds-default',
            },
          },
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
          environmentsFolder,
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
          HelpersTaon.copyFile(coreProjectArtifactPath, absPathToArtifactEnv);
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
