import { config } from 'tnp-config/src';
import { CoreModels, _, crossPlatformPath } from 'tnp-core/src';
import { CLASS } from 'typescript-class-helpers/src';

import { Models } from './models';
import type { Project } from './project/abstract/project';

//#region release artifact taon
/**
 * All possible release types for taon
 * for MANUAL/CLOUD release
 */
export const ReleaseArtifactTaonNames = Object.freeze({
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
   * Documentation (MkDocs + compodoc + storybook)
   * webapp (pwa) inside docker
   */
  DOCS_DOCS_WEBAPP: 'docs-webapp',
  /**
   * Npm lib package and global cli tool
   */
  NPM_LIB_PKG_AND_CLI_TOOL: 'npm-lib-and-cli-tool',
  /**
   * Visual Studio Code extension/plugin
   */
  VSCODE_EXTENSION_PLUGIN: 'vscode-plugin',
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
});

export type ReleaseType =
  (typeof ReleaseTypeNames)[keyof typeof ReleaseTypeNames];

export const ReleaseTypeNamesArr: ReleaseType[] =
  Object.values(ReleaseTypeNames);
//#endregion

//#region system-task options
class SystemTask<T> {
  protected constructor() {}
  finishCallback: () => any;
  public clone(override: Partial<T>): T {
    const classFn = CLASS.getFromObject(this);
    const result = _.merge(new classFn(), _.merge(_.cloneDeep(this), override));
    // console.log({result})
    return result;
  }
  copyto?: string[];
  copytoall?: boolean;
  purpose?: string;
}

export class BaseBuild<T> extends SystemTask<T> {
  /**
   * watch build
   */
  watch: boolean;

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

  disableServiceWorker: boolean;
  buildAngularAppForElectron: boolean;
}

class BuildOptionsLibOrApp<T> extends BaseBuild<T> {
  cliBuildNoDts: boolean;
  cliBuildUglify: boolean;
  cliBuildObscure: boolean;
  cliBuildIncludeNodeModules: boolean;

  /**
   * Enable all production optimalization for build
   * - minification
   * - caches
   * etc.
   */
  prod: boolean;
  targetArtifact: ReleaseArtifactTaon = 'angular-node-app';
}
//#endregion

//#region new options
export class NewOptions extends SystemTask<NewOptions> {
  branding: boolean;
}
//#endregion

//#region clear options
export class ClearOptions extends SystemTask<ClearOptions> {
  recrusive?: boolean;
}
//#endregion

//#region init options
export class InitOptions extends BaseBuild<InitOptions> {
  private constructor() {
    super();
  }

  /**
   * init only structure without external deps
   */
  struct: boolean;
  websql: boolean;
  branding: boolean;

  public static from(options: Partial<InitOptions>): InitOptions {
    return instanceFrom(options, InitOptions);
  }

  public static fromBuild(options: BuildOptions): InitOptions {
    const initOptions = InitOptions.from({});

    const propsToInit = [
      'baseHref',
      'watch',
      'websql',
      'smartContainerTargetName',
      'ci',
      'targetApp',
      'prod',
      'disableServiceWorker',
      'buildAngularAppForElectron',
      'purpose',
    ] as (keyof BuildOptions)[];

    for (const prop of propsToInit) {
      if (!_.isUndefined(options[prop])) {
        initOptions[prop] = options[prop];
      }
    }

    return initOptions;
  }
}
//#endregion

//#region build options
export class BuildOptions extends BuildOptionsLibOrApp<BuildOptions> {
  /**
   * TODO remove
   */
  readonly outDir: 'dist' = 'dist';
  buildType: 'lib' | 'app' | 'docs' | 'lib-app';

  /**
   * null  - means it is development build
   */
  isForRelease: ReleaseType | null = null;
  get appBuild() {
    return this.buildType === 'app' || this.buildType === 'lib-app';
  }
  get libBuild() {
    return this.buildType === 'lib' || this.buildType === 'lib-app';
  }

  get temporarySrcForReleaseCutCode() {
    //#region @backendFunc
    return `tmp-cut-release-src-${config.folder.dist}${this.websql ? '-websql' : ''}`;
    //#endregion
  }

  private constructor() {
    super();
    this.outDir = 'dist';
    this.targetArtifact = 'angular-node-app';
  }
  /**
   *
   */
  websql: boolean;

  private _skipProjectProcess: boolean;
  /**
   * Skip project process for assigning automatic ports
   */
  get skipProjectProcess() {
    //#region @backendFunc
    return this._skipProjectProcess;
    //#endregion
  }
  set skipProjectProcess(value) {
    this._skipProjectProcess = value;
  }

  /**
   * override port number for app build
   */
  port: number;

  skipCopyManager: boolean;
  /**
   * build executed druring lib release
   */
  buildForRelease: boolean;

  /**
   * default: '<project-locaiton>/dist-app'
   * default for github page: '<project-location>/docs'
   */
  appBuildLocation: string;
  /**
   * Cut <@>notForNpm  tag from lib build
   */
  cutNpmPublishLibReleaseCode: boolean;
  /**
   * Do not generate backend code
   */
  genOnlyClientCode: boolean;
  /**
   * Generate only backend, without browser version
   */
  onlyBackend: boolean;
  /**
   * Optionally we can start build of smart container
   * with different app
   */
  smartContainerTargetName: string;

  public static from(
    options: Omit<Partial<BuildOptions>, 'appBuild' | 'serveApp'>,
  ): BuildOptions {
    return instanceFrom(options, BuildOptions);
  }
}
//#endregion

//#region release options

export class ReleaseOptions extends BuildOptionsLibOrApp<ReleaseOptions> {
  private constructor() {
    super();
    this.releaseVersionBumpType = 'patch';
    this.resolved = [];
  }
  releaseVersionBumpType: CoreModels.ReleaseVersionType;
  shouldReleaseLibrary: boolean;
  /**
   * build action only for specific framework version of prohect
   */
  frameworkVersion: CoreModels.FrameworkVersion;
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
  skipProjectProcess: boolean;
  /**
   * Projects to release in container
   */
  resolved: Project[];
  /**
   * quick automatic release of lib
   */
  automaticRelease: boolean;
  /**
   * quick automatic release of docs app(s)
   */
  automaticReleaseDocs: boolean;
  /**
   * @deprecated
   */
  specifiedVersion: string;
  /**
   * release only trusted projects for specific container framework version
   */
  trusted: boolean;
  releaseTarget: 'lib' | 'app' | 'lib-app';
  public static from(options: Partial<ReleaseOptions>): ReleaseOptions {
    return instanceFrom(options, ReleaseOptions);
  }
}

//#endregion

//#region helpers / instance from
function instanceFrom(
  options: Partial<InitOptions | BuildOptions | ReleaseOptions>,
  classFn: Function,
) {
  const orgFinishCallback = options?.finishCallback;
  options = (options ? options : {}) as any;
  const res = _.merge(new (classFn as any)(), _.cloneDeep(options));
  if (orgFinishCallback) {
    res.finishCallback = orgFinishCallback;
  } else {
    res.finishCallback = () => {};
  }
  return res;
}
//#endregion
