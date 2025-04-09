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
  ReleaseArtifactTaon,
} from '../../../../../options';
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
  /**
   * TODO THIS IS QUICK_FIX
   */
  private makeSureConfigIsProperForTsNode(): void {
    //#region @backend
    // console.log(`checking tsconfig.json for ${this.project.genericName}`);
    const template = {
      compilerOptions: {
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
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

    if (json.compilerOptions?.module !== 'NodeNext') {
      json.compilerOptions.module = 'NodeNext';
    }
    if (json.compilerOptions?.moduleResolution !== 'NodeNext') {
      json.compilerOptions.moduleResolution = 'NodeNext';
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
  }

  //#region get base env template
  getBaseEnvTemplate(jsonString = '{ ...baseEnv }'): string {
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
  public async init<EnvConfig>(): Promise<EnvOptions> {
    //#region @backendFunc
    const configResult = await this.getConfigFor(this.project);

    await this.updateData(configResult);
    return configResult;
    //#endregion
  }
  //#endregion

  //#region read env config for artifact/environment
  envOptionsResolve(envOptions: EnvOptions): EnvOptions {
    //#region @backendFunc
    envOptions = EnvOptions.from(envOptions);

    if (!this.project.hasFolder(environments)) {
      const coreEnv = this.project.ins
        .by('isomorphic-lib')
        .pathFor(environments);

      Helpers.copy(coreEnv, this.project.pathFor(environments), {
        recursive: true,
      });
    }

    if (envOptions.release.envName && envOptions.release.targetArtifact) {
      const envConfigForArtifactAndEnvironment =
        this.project.environmentConfig.envOptionsFor(
          envOptions.release.targetArtifact,
          envOptions.release.envName,
          envOptions.release.envNumber,
        );
      walk.Object(
        envConfigForArtifactAndEnvironment,
        (val, lodashPath, newValue) => {
          if (_.isNil(val) || _.isObject(val)) {
            // nothing
          } else {
            _.set(envOptions, lodashPath, val);
          }
        },
        { walkGetters: false },
      );
    } else {
      walk.Object(
        this.envOptionsProjectLevel,
        (val, lodashPath, newValue) => {
          if (_.isNil(val) || _.isObject(val)) {
            // nothing
          } else {
            _.set(envOptions, lodashPath, val);
          }
        },
        { walkGetters: false },
      );
    }
    // debugger
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
    Helpers.taskStarted(
      `Reading environment config for ` +
        `${artifactName}/${environmentName}/${envNum || ''}`,
    );
    this.makeSureConfigIsProperForTsNode();
    try {
      env = require(
        this.project.pathFor(
          `environments/${artifactName}/` +
            `env.${artifactName}.${environmentName}${envNum === undefined ? '' : envNum}.ts`,
        ),
      )?.default;
    } catch (error) {
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

      Helpers.writeFile(
        pathToProjectEnvironmentAbsPath,
        this.getBaseEnvTemplate(jsonString),
      );

      UtilsTypescript.formatFile(pathToProjectEnvironmentAbsPath);
    }

    Helpers.taskStarted(`Reading environment config for ${project.name}`);
    this.makeSureConfigIsProperForTsNode();
    try {
      var configStandaloneEnv: EnvOptions = require(
        pathToProjectEnvironmentAbsPath,
      )?.default;
    } catch (error) {
      console.log(error);
      Helpers.error(
        `Incorrect env config for:
         project: ${project.name}
        `,
      );
    }
    Helpers.taskDone(`Done reading environment config for ${project.name}`);

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
      console.log(`

        container not initing

        `);
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
      Helpers.info(
        `Config saved in project ${chalk.bold(this.project.pathFor('tsconfig.json'))}
      ${tmpEnvironmentPath}`,
      );
    }
    //#endregion
  }
  //#endregion

  //#endregion

  //#region create artifact
  async createForArtifact(
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
}
