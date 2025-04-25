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

//#region env options

//#region env options / build

//#region env options / build / pwa
class EnvOptionsBuildPwa {
  declare disableServiceWorker: boolean;
  declare name?: string;
  declare short_name?: string;
  declare start_url?: string;
  // theme_color?: string;
  // background_color?: string;
  // display?: string;
  // scope?: string;
}
//#endregion

//#region env options / build / cli
class EnvOptionsBuildCli {
  /**
   * using ncc
   */
  declare minify: boolean;
  /**
   * using ncc
   */
  declare includeNodeModules: boolean;
  /**
   * using uglifyjs
   */
  declare uglify: boolean;
  /**
   * using only works with uglify = true
   */
  declare compress: boolean;
  /**
   * using  obscurejs
   */
  declare obscure: boolean;
}
//#endregion

//#region env options / build / cli
class EnvOptionsBuildLib {
  declare removeDts: boolean;
  declare uglifyFileByFile: boolean;
  declare obscureFileByFile: boolean;
  declare includeSourceMaps: boolean;
  declare compress: boolean;
  /**
   * skip include lib files (only cli.js + bin stays)
   * Perfect for just releasing cli tool
   */
  declare doNotIncludeLibFiles: boolean;
}
//#endregion

class EnvOptionsBuild {
  /**
   * override output path
   * for combined/bundled build artifact
   */
  declare overrideOutputPath: string;
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
  private declare _baseHref: string;
  declare skipBuildForRelease?: boolean;
  declare websql: boolean;
  /**
   * watch build
   */
  declare watch: boolean;
  declare angularProd: boolean;

  /**
   * Do not generate backend code
   */
  declare genOnlyClientCode: boolean;
  declare pwa: Partial<EnvOptionsBuildPwa>;
}
//#endregion

//#region env options / ports
class EnvOptionsPorts {
  /**
   * override port for angular ng serve in normal mode
   */
  declare ngNormalAppPort?: number;

  /**
   * override port for angular ng serve in websql mode
   */
  declare ngWebsqlAppPort?: number;

  /**
   * override port for nodejs backend server
   */
  declare nodeBeAppPort?: number;
}
//#endregion

//#region env options / loading

//#region env options / loading / pre-angular-bootstrap
class EnvOptionsLoadingPreAngularBootstrap {
  /**
   * loder path to image or
   * build in loader config
   */
  declare loader?: string | Models.TaonLoaderConfig;
  declare background?: string;
}
//#endregion

//#region env options / loading / after-angular-bootstrap
class EnvOptionsLoadingAfterAngularBootstrapConfig {
  /**
   * loder path to image or
   * build in loader config
   */
  declare loader?: string | Models.TaonLoaderConfig;
  declare background?: string;
}
//#endregion

class EnvOptionsLoading {
  /**
   * this is presented before bootstrapping of angular
   * at the beginning of first index.html fetch
   */
  declare preAngularBootstrap?: Partial<EnvOptionsLoadingPreAngularBootstrap>;
  /**
   * this loader is presented when
   * taon app data is being loader
   * (right after *preAngularBootstrap*)
   */
  declare afterAngularBootstrap?: Partial<EnvOptionsLoadingAfterAngularBootstrapConfig>;
}
//#endregion

//#region env options / release
class EnvOptionsRelease {
  /**
   * new version resolve at the beginning of release process
   * and is used for all artifacts
   */
  declare readonly resolvedNewVersion: string;
  /**
   * release artifact name
   * for example: "angular-node-app"
   */
  declare targetArtifact: ReleaseArtifactTaon;
  /**
   * undefined  - means it is development build
   */
  declare releaseType?: ReleaseType | undefined;
  /**
   * process that is running in CI (no questions for user)
   */

  declare releaseVersionBumpType: CoreModels.ReleaseVersionType;
  /**
   * quick automatic release of lib
   */
  declare autoReleaseUsingConfig: boolean;
  declare envName: CoreModels.EnvironmentNameTaon;
  /**
   * undefined - prod
   * number   -  prod1
   */
  declare envNumber: number | undefined;

  declare cli: Partial<EnvOptionsBuildCli>;
  declare lib: Partial<EnvOptionsBuildLib>;
}
//#endregion

//#region env options / init
class EnvOptionsInit {
  /**
   * init only structure without external deps
   */
  declare struct: boolean;
  declare branding: boolean;
}
//#endregion

//#region env options / copy to manager
class EnvOptionsCopyToManager {
  declare skip: boolean;
  declare copyToLocations: string[];
  declare copyToProjects: string[];
}
//#endregion

//#region env options / website
class EnvOptionsWebsite {
  declare title: string;
  declare domain: string;
  declare useDomain: boolean;
}
//#endregion

//#region env options / container
class EnvOptionsContainer {
  /**
   * start release on project
   */
  declare start?: string;
  /**
   * release only specified projects
   */
  declare only?: string | string[];
  /**
   * end release on project
   */
  declare end?: string;
}
//#endregion

export class EnvOptions<PATHS = {}, CONFIGS = {}> {
  //#region static / from
  public static from(options: Partial<EnvOptions>): EnvOptions {
    const orgFinishCallback = options?.finishCallback;
    let res = new EnvOptions(options);
    // res = res.clone(options);
    if (orgFinishCallback) {
      res.finishCallback = orgFinishCallback;
    } else {
      res.finishCallback = () => {};
    }
    return res;
  }

  public static fromRelease(releaseOptions: Partial<EnvOptions>): EnvOptions {
    const buildOptions = EnvOptions.from(releaseOptions as any);
    buildOptions.build.watch = false;
    return buildOptions;
  }

  public static fromBuild(releaseOptions: Partial<EnvOptions>): EnvOptions {
    const buildOptions = EnvOptions.from(releaseOptions as any);
    // buildOptions.build.watch = false;
    return buildOptions;
  }

  /**
   * override existed/proper fields from "override" object
   * inside "destination" object
   */
  static merge(destination, override): EnvOptions {
    walk.Object(
      override || {},
      (value, lodashPath) => {
        if (_.isNil(value) || _.isFunction(value) || _.isObject(value)) {
          // skipping
        } else {
          _.set(destination, lodashPath, value);
        }
      },
      {
        walkGetters: false,
      },
    );
    return destination;
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

  //#region fields
  declare finishCallback: () => any;
  declare paths?: PATHS;
  declare config?: CONFIGS;
  declare purpose?: string;
  /**
   * action is recursive
   */
  declare recursiveAction?: boolean;
  declare isCiProcess?: boolean;
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
  declare readonly currentProjectType?: CoreModels.LibType;
  declare readonly buildInfo?: {
    // number?: number; // count commits takes time
    hash?: string;
    date?: Date;
  };
  //#endregion

  //#endregion

  //#region constructor
  protected constructor(options: Partial<EnvOptions> = {}) {
    this.applyFieldsFrom(options);
  }
  //#endregion

  //#region apply fields
  public applyFieldsFrom(override?: Partial<EnvOptions>): void {
    override = override || {};
    EnvOptions.merge(this, override);

    this.paths = this.paths || ({} as any);
    this.config = this.config || ({} as any);

    this.paths = _.merge(this.paths, _.cloneDeep(override.paths));
    this.config = _.merge(this.config, _.cloneDeep(override.config));

    this.container = _.merge(new EnvOptionsContainer(), this.container);

    this.ports = _.merge(new EnvOptionsPorts(), this.ports);
    this.init = _.merge(new EnvOptionsInit(), this.init);
    this.build = this.build || ({} as any);
    this.build.pwa = _.merge(new EnvOptionsBuildPwa(), this.build?.pwa);
    this.build = _.merge(new EnvOptionsBuild(), this.build);

    this.loading = this.loading || ({} as any);

    this.loading.preAngularBootstrap = _.merge(
      new EnvOptionsLoadingPreAngularBootstrap(),
      this.loading?.preAngularBootstrap,
    );
    this.loading.afterAngularBootstrap = _.merge(
      new EnvOptionsLoadingAfterAngularBootstrapConfig(),
      this.loading?.afterAngularBootstrap,
    );
    this.loading = _.merge(new EnvOptionsLoading(), this.loading);

    this.release = this.release || ({} as any);

    this.release.cli = _.merge(new EnvOptionsBuildCli(), this.release?.cli);
    this.release.lib = _.merge(new EnvOptionsBuildLib(), this.release?.lib);
    this.release = _.merge(new EnvOptionsRelease(), this.release);

    this.copyToManager = _.merge(
      new EnvOptionsCopyToManager(),
      this.copyToManager,
    );

    this.website = _.merge(new EnvOptionsWebsite(), this.website);

    // fields fixes, prevent incorrect values
    if (_.isString(this.website.domain)) {
      this.website.domain = this.website.domain.replace(/\/$/, '');
      this.website.domain = this.website.domain.replace(/^https?:\/\//, '');
    }
  }
  //#endregion

  //#region save to file
  public saveToFile(absFilePath: string): void {
    //#region @backendFunc
    EnvOptions.saveToFile(this, absFilePath);
    //#endregion
  }
  //#endregion

  //#region load from file
  public loadFromFile(absFilePath: string): void {
    //#region @backendFunc
    const data = EnvOptions.loadFromFile(absFilePath);
    this.applyFieldsFrom(data);
    //#endregion
  }
  //#endregion

  //#region clone
  public clone(override?: Partial<EnvOptions>): EnvOptions {
    //#region @backendFunc
    override = override || {};
    const toClone = _.cloneDeep(this);
    EnvOptions.merge(toClone, override);
    const result = new EnvOptions(toClone);
    return result;
    //#endregion
  }
  //#endregion

  //#region getters
  get temporarySrcForReleaseCutCode(): string {
    //#region @backendFunc
    return `tmp-cut-release-src-${config.folder.dist}${this.build.websql ? '-websql' : ''}`;
    //#endregion
  }
  //#endregion
}
//#endregion
