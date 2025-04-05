import { walk } from 'lodash-walk-object/src';
import { config } from 'tnp-config/src';
import { Helpers } from 'tnp-core/src';
import { CoreModels, _, crossPlatformPath } from 'tnp-core/src';

import { Models } from './models';

//#region release artifact taon
/**
 * All possible release types for taon
 * for MANUAL/CLOUD release
 */
export const ReleaseArtifactTaonNames = Object.freeze({
  /**
   * Npm lib package and global cli tool
   */
  NPM_LIB_PKG_AND_CLI_TOOL: 'npm-lib-and-cli-tool',
  /**
   * Angular frontend webapp (pwa) + nodejs backend inside docker
   */
  ANGULAR_NODE_APP: 'angular-node-app',
  /**
   * Angular + Electron app
   */
  ELECTRON_APP: 'electron-app',
  /**
   * Angular + Ionic
   */
  MOBILE_APP: 'mobile-app',
  /**
   * Visual Studio Code extension/plugin
   */
  VSCODE_PLUGIN: 'vscode-plugin',
  /**
   * Documentation (MkDocs + compodoc + storybook)
   * webapp (pwa) inside docker
   */
  DOCS_DOCS_WEBAPP: 'docs-webapp',
});

export type ReleaseArtifactTaon =
  (typeof ReleaseArtifactTaonNames)[keyof typeof ReleaseArtifactTaonNames];

export const ReleaseArtifactTaonNamesArr: ReleaseArtifactTaon[] = Object.values(
  ReleaseArtifactTaonNames,
);
//#endregion

//#region release type
export const ReleaseTypeNames = Object.freeze({
  /**
   * Manual release (happen physically on local machine)
   */
  MANUAL: 'manual',
  /**
   * Releases artifact to local repository <project-location>/local_release/<artifact-name>/<release build files>
   */
  LOCAL: 'local',
  /**
   * Trigger cloud release (happen on cloud server)
   * Cloud release actually start "Manual" release process on cloud server
   */
  CLOUD: 'cloud',
  /**
   * Trigger cloud release (happen on cloud server)
   * Cloud release actually start "Manual" release process on cloud server
   */
  STATIC_PAGES: 'static-pages',
});

export type ReleaseType =
  (typeof ReleaseTypeNames)[keyof typeof ReleaseTypeNames];

export const ReleaseTypeNamesArr: ReleaseType[] =
  Object.values(ReleaseTypeNames);
//#endregion

//#region initing partial process
/**
 * Class is as part of initing project structure process
 */
export interface InitingPartialProcess {
  /**
   * All initialization process from class
   * gathered in one place
   */
  init(options: EnvOptions): Promise<void>;
}
//#endregion

//#region env options

//#region env options / build

//#region env options / build / pwa
class EnvOptionsBuildPwa {
  disableServiceWorker: boolean;
  name?: string;
  short_name?: string;
  start_url?: string;
  // theme_color?: string;
  // background_color?: string;
  // display?: string;
  // scope?: string;
}
//#endregion

//#region env options / build / cli
class EnvOptionsBuildCli {
  uglify: boolean;
  obscure: boolean;
  includeNodeModules: boolean;
  includeSourceMaps: boolean;
}
//#endregion

class EnvOptionsBuild {
  /**
   * override output path
   * for combined/bundled build artifact
   */
  overrideOutputPath: string;
  /**
   * base-href -> is a part of lib code build
   *
   * overwrite base href for app deployment.
   * Must be at least equal: '/'
   *
   * default: /
   * default for github pages standalone project: '/<project-name-or-overwritten>/'
   * default for organizaion main target: '/<project-name-or-overwritten>/'
   * default for organizaion main other targets: '/<project-name-or-overwritten>/-/<other-target-name>/'
   */
  get baseHref(): string {
    return this._baseHref;
  }
  set baseHref(v) {
    this._baseHref = crossPlatformPath(v);
  }
  private _baseHref: string;
  websql: boolean;
  /**
   * watch build
   */
  watch: boolean;
  pwa: Partial<EnvOptionsBuildPwa>;
  angularProd: boolean;
  cli: Partial<EnvOptionsBuildCli>;
  /**
   * Do not generate backend code
   */
  genOnlyClientCode: boolean;
}
//#endregion

//#region env options / ports
class EnvOptionsPorts {
  /**
   * override port for angular ng serve in normal mode
   */
  ngNormalAppPort?: number;

  /**
   * override port for angular ng serve in websql mode
   */
  ngWebsqlAppPort?: number;

  /**
   * override port for nodejs backend server
   */
  nodeBeAppPort?: number;
}
//#endregion

//#region env options / loading

//#region env options / loading / pre-angular-bootstrap
class EnvOptionsLoadingPreAngularBootstrap {
  /**
   * loder path to image or
   * build in loader config
   */
  loader?: string | Models.TaonLoaderConfig;
  background?: string;
}
//#endregion

//#region env options / loading / after-angular-bootstrap
class EnvOptionsLoadingAfterAngularBootstrapConfig {
  /**
   * loder path to image or
   * build in loader config
   */
  loader?: string | Models.TaonLoaderConfig;
  background?: string;
}
//#endregion

class EnvOptionsLoading {
  /**
   * this is presented before bootstrapping of angular
   * at the beginning of first index.html fetch
   */
  preAngularBootstrap?: Partial<EnvOptionsLoadingPreAngularBootstrap>;
  /**
   * this loader is presented when
   * taon app data is being loader
   * (right after *preAngularBootstrap*)
   */
  afterAngularBootstrap?: Partial<EnvOptionsLoadingAfterAngularBootstrapConfig>;
}
//#endregion

//#region env options / release
class EnvOptionsRelease {
  targetArtifact: ReleaseArtifactTaon;
  /**
   * null  - means it is development build
   */
  releaseType: ReleaseType | null = null;
  /**
   * process that is running in CI (no questions for user)
   */

  releaseVersionBumpType: CoreModels.ReleaseVersionType = 'patch';
  /**
   * quick automatic release of lib
   */
  autoReleaseUsingConfig: boolean;
  environment: CoreModels.EnvironmentNameTaon;
  envNum: number | undefined;
  /**
   * Cut <@>notForNpm  tag from lib build
   */
  cutNpmPublishLibReleaseCode: boolean;
}
//#endregion

//#region env options / init
class EnvOptionsInit {
  /**
   * init only structure without external deps
   */
  struct: boolean;
  branding: boolean;
}
//#endregion

//#region env options / copy to manager
class EnvOptionsCopyToManager {
  skip: boolean;
  copyToLocations: string[];
  copyToProjects: string[];
}
//#endregion

//#region env options / website
class EnvOptionsWebsite {
  title: string;
  domain: string;
  useDomain: boolean;
}
//#endregion

//#region env options / container
class EnvOptionsContainer {
  /**
   * start release on project
   */
  start?: string;
  /**
   * release only specified projects
   */
  only?: string | string[];
  /**
   * end release on project
   */
  end?: string;
}
//#endregion

export class EnvOptions<PATHS = {}, CONFIGS = {}> {
  //#region static / from
  public static from(options: Partial<EnvOptions>): EnvOptions {
    const orgFinishCallback = options?.finishCallback;
    let res = _.merge(new EnvOptions(), _.cloneDeep(options));
    res = res.clone(options);
    if (orgFinishCallback) {
      res.finishCallback = orgFinishCallback;
    } else {
      res.finishCallback = () => {};
    }
    return res;
  }

  public static fromRelease(releaseOptions: EnvOptions): EnvOptions {
    const buildOptions = EnvOptions.from(releaseOptions as any);
    buildOptions.build.watch = false;
    return buildOptions;
  }

  public static fromBuild(releaseOptions: EnvOptions): EnvOptions {
    const buildOptions = EnvOptions.from(releaseOptions as any);
    // buildOptions.build.watch = false;
    return buildOptions;
  }

  public static saveToFile(
    options: Partial<EnvOptions>,
    absFilePath: string,
  ): void {
    //#region @backendFunc
    Helpers.writeJson(absFilePath, options);
    //#endregion
  }

  public static loadFromFile(absFilePath: string): EnvOptions {
    //#region @backendFunc
    const options = Helpers.readJson(absFilePath);
    return EnvOptions.from(options);
    //#endregion
  }

  public static getParamsString(options: Partial<EnvOptions>): string {
    //#region @backendFunc
    const env = EnvOptions.from(options);
    let pathWithParams = '';
    walk.Object(
      env,
      (value, lodashPath) => {
        if (_.isNil(value) || _.isFunction(value) || _.isObject(value)) {
          // skipping
        } else {
          if (Array.isArray(value)) {
            for (const val of value) {
              if (_.isBoolean(value)) {
                pathWithParams += ` --${lodashPath}=${val ? 'true' : 'false'} `;
              } else {
                pathWithParams += ` --${lodashPath}=${val} `;
              }
            }
          } else {
            const val = value;
            if (_.isBoolean(value)) {
              pathWithParams += ` --${lodashPath}=${val ? 'true' : 'false'} `;
            } else {
              pathWithParams += ` --${lodashPath}=${val} `;
            }
          }
        }
      },
      { walkGetters: false },
    );
    return pathWithParams ? ` ${pathWithParams.trim()} ` : ' ';
    //#endregion
  }

  //#endregion

  private applyFields(options: Partial<EnvOptions> = {}): void {
    const override = _.cloneDeep(options);
    Object.keys(override).forEach(key => {
      this[key] = override[key];
    });

    this.paths = this.paths || ({} as any);
    this.config = this.config || ({} as any);

    this.paths = _.merge(this.paths, override.paths);
    this.config = _.merge(this.config, override.config);

    this.container = _.merge(EnvOptionsContainer, override.container);

    this.ports = _.merge(EnvOptionsPorts, override.ports);
    this.init = _.merge(EnvOptionsInit, override.init);
    this.build = _.merge(EnvOptionsBuild, override.build);
    this.build.pwa = _.merge(EnvOptionsBuildPwa, override.build?.pwa);
    this.build.cli = _.merge(EnvOptionsBuildCli, override.build?.cli);
    this.build.websql = !!(override.build?.websql || this.build.websql);

    this.loading = _.merge(EnvOptionsLoading, override.loading);
    this.loading.preAngularBootstrap = _.merge(
      EnvOptionsLoadingPreAngularBootstrap,
      override.loading?.preAngularBootstrap,
    );
    this.loading.afterAngularBootstrap = _.merge(
      EnvOptionsLoadingAfterAngularBootstrapConfig,
      override.loading?.afterAngularBootstrap,
    );
    this.release = _.merge(EnvOptionsRelease, override.release);
    this.copyToManager = _.merge(
      EnvOptionsCopyToManager,
      override.copyToManager,
    );
    this.website = _.merge(EnvOptionsWebsite, override.website);
    if (_.isString(this.website.domain)) {
      this.website.domain = this.website.domain.replace(/\/$/, '');
      this.website.domain = this.website.domain.replace(/^https?:\/\//, '');
    }
  }

  protected constructor(options: Partial<EnvOptions> = {}) {
    this.applyFields(options);
  }
  finishCallback: () => any;

  public saveToFile(absFilePath: string): void {
    //#region @backendFunc
    EnvOptions.saveToFile(this, absFilePath);
    //#endregion
  }

  public loadFromFile(absFilePath: string): void {
    //#region @backendFunc
    const data = EnvOptions.loadFromFile(absFilePath);
    this.applyFields(data);
    //#endregion
  }

  //#region clone
  public clone(override: Partial<EnvOptions>): EnvOptions {
    const result = new EnvOptions(_.merge(_.cloneDeep(this), override));
    return result;
  }
  //#endregion

  get temporarySrcForReleaseCutCode(): string {
    //#region @backendFunc
    return `tmp-cut-release-src-${config.folder.dist}${this.build.websql ? '-websql' : ''}`;
    //#endregion
  }

  paths?: PATHS;
  config?: CONFIGS;
  purpose?: string;
  /**
   * action is recursive
   */
  recursiveAction?: boolean;
  isCiProcess?: boolean;
  declare container: Partial<EnvOptionsContainer>;
  declare ports: Partial<EnvOptionsPorts>;
  declare release: Partial<EnvOptionsRelease>;
  declare init: Partial<EnvOptionsInit>;
  declare build: Partial<EnvOptionsBuild>;
  declare loading: Partial<EnvOptionsLoading>;
  declare copyToManager: Partial<EnvOptionsCopyToManager>;
  declare website: Partial<EnvOptionsWebsite>;

  //#region generated fields
  declare readonly name?: CoreModels.EnvironmentNameTaon; // generated
  declare readonly currentProjectName?: string;
  declare readonly currentProjectGenericName?: string;
  declare readonly currentProjectType?: CoreModels.LibType;
  declare readonly buildInfo?: {
    number?: number;
    hash?: string;
    date?: Date;
    options?: {
      isWatchBuild?: boolean;
      isWebsqlBuild?: boolean;
      outDir?: 'dist';
    };
  };
  //#endregion
}
//#endregion
