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

//#endregion

//#region @backend
register({
  transpileOnly: true,
  compilerOptions: {
    skipLibCheck: true,
  },
});
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

  //#region api / update
  public async update(envConfigFromParams: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc
    envConfigFromParams = EnvOptions.from(envConfigFromParams);

    this.makeSureEnvHasProperStructure();

    const configResult = await this.envOptionsResolve(envConfigFromParams);
    configResult.applyFieldsFrom(envConfigFromParams);

    this.updateGeneratedValues(configResult);
    this.saveEnvironmentConfig(configResult);
    return configResult;
    //#endregion
  }
  //#endregion

  //#endregion

  //#region private methods

  //#region private methods / env options resolve
  private envOptionsResolve(envOptions: EnvOptions): EnvOptions {
    //#region @backendFunc
    if (envOptions.release.envName && envOptions.release.targetArtifact) {
      const envConfigForArtifactAndEnvironment = EnvOptions.from(
        this.project.environmentConfig.getEnvFor(
          envOptions.release.targetArtifact,
          envOptions.release.envName,
          envOptions.release.envNumber,
        ),
      );
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
  ): Partial<EnvOptions> {
    //#region @backendFunc
    let env: Partial<EnvOptions>;
    Helpers.taskStarted(
      `Reading environment config for ` +
        `${artifactName}/${environmentName}/${envNum || ''}`,
    );

    try {
      env = require(
        this.project.pathFor(
          `environments/${artifactName}/` +
            `env.${artifactName}.${environmentName}${envNum === undefined ? '' : envNum}.ts`,
        ),
      )?.default;
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
    Helpers.taskDone(
      `Reading environment config for ` +
        `${artifactName}/${environmentName}/${envNum || ''}`,
    );
    return env;
    //#endregion
  }
  //#endregion

  //#region private methods / get env main
  private getEnvMain(): Partial<EnvOptions> {
    //#region @backendFunc

    Helpers.taskStarted(`Reading environment config for ${this.project.name}`);
    try {
      var configStandaloneEnv: EnvOptions = require(
        this.absPathToEnvTs,
      )?.default;
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
    Helpers.taskDone(
      `Done reading environment config for ${this.project.name}`,
    );

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
  private updateGeneratedValues(envOptions: EnvOptions): void {
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
  private saveEnvironmentConfig(projectConfig: EnvOptions): void {
    //#region @backendFunc

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
      Helpers.info(
        `Config saved in project ${chalk.bold(this.project.pathFor('tsconfig.json'))}
      ${tmpEnvironmentPath}`,
      );
    }
    //#endregion
  }
  //#endregion

  //#region make sure config is proper for ts-node
  /**
   * TODO THIS IS QUICK_FIX
   */
  private makeSureEnvHasProperStructure(): void {
    //#region @backend

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

    //#region BIG QUICK_FIX for READING ENV.ts @LAST
    // console.log(`checking tsconfig.json for ${this.project.genericName}`);
    const template = {
      compilerOptions: {
        // module: 'NodeNext',
        // moduleResolution: 'NodeNext',
        module: 'CommonJS',
        moduleResolution: 'Node',
        esModuleInterop: true,
        strictNullChecks: false,
        rootDir: './',
        paths: {},
      },
      include: ['environments/**/*.ts', 'env.ts'],
    };
    const tsconfigPath = this.project.pathFor('tsconfig.json');
    const json: typeof template = this.project.readJson('tsconfig.json');
    if (!json) {
      Helpers.writeJson(tsconfigPath, template);
      Helpers.info(`tsconfig.json created for ${tsconfigPath} project`);
      return;
    }
    json.compilerOptions = json.compilerOptions || ({} as any);
    json.include = json.include || [];

    if (json.compilerOptions?.module !== 'CommonJS') {
      json.compilerOptions.module = 'CommonJS';
    }
    if (json.compilerOptions?.moduleResolution !== 'Node') {
      json.compilerOptions.moduleResolution = 'Node';
    }

    if (!json.compilerOptions?.esModuleInterop) {
      json.compilerOptions.esModuleInterop = true;
    }

    if (json.compilerOptions?.rootDir !== './') {
      json.compilerOptions.rootDir = './';
    }

    if (!json.include.includes('environments/**/*.ts')) {
      json.include.push('environments/**/*.ts');
    }
    if (!json.include.includes('env.ts')) {
      json.include.push('env.ts');
    }

    Helpers.writeJson(tsconfigPath, json);
    // Helpers.info(`tsconfig.json update for ${tsconfigPath} project`);
    //#endregion
    //#endregion
  }
  //#endregion

  private get absPathToEnvTs(): string {
    return crossPlatformPath([this.project.location, envTs]);
  }

  //#endregion
}
