import { config } from 'tnp-config/src';
import { CoreModels, _, crossPlatformPath } from 'tnp-core/src';
import { CLASS } from 'typescript-class-helpers/src';

import { Models } from './models';
import type { Project } from './project/abstract/project';

//#region helpers / instance from
const instanceFrom = (
  options: Partial<InitOptions | BuildOptions | ReleaseOptions | ClearOptions>,
  classFn: Function,
) => {
  const orgFinishCallback = options?.finishCallback;
  options = (options ? options : {}) as any;
  const res = _.merge(new (classFn as any)(), _.cloneDeep(options));
  if (orgFinishCallback) {
    res.finishCallback = orgFinishCallback;
  } else {
    res.finishCallback = () => {};
  }
  return res;
};
//#endregion

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
  VSCODE_PLUGIN: 'vscode-plugin',
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
  targetArtifact: ReleaseArtifactTaon;
  /**
   * null  - means it is development build
   */
  releaseType: ReleaseType | null = null;
  /**
   * process that is running in CI (no questions for user)
   */
  ciProcess?: boolean;
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
}
//#endregion

//#region new options
export class NewOptions extends SystemTask<NewOptions> {
  branding: boolean;
}
//#endregion

//#region clear options
export class ClearOptions extends SystemTask<ClearOptions> {
  public static from(options: Partial<ClearOptions>): ClearOptions {
    return instanceFrom(options, ClearOptions);
  }
  recrusive?: boolean;
}
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
  init(options: InitOptions): Promise<void>;
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

  public static fromBuild(buildOptions: BuildOptions): InitOptions {
    const initOptions = InitOptions.from(buildOptions as any);

    return initOptions;
  }
}
//#endregion

//#region build options
export class BuildOptions extends BuildOptionsLibOrApp<BuildOptions> {
  get temporarySrcForReleaseCutCode(): string {
    //#region @backendFunc
    return `tmp-cut-release-src-${config.folder.dist}${this.websql ? '-websql' : ''}`;
    //#endregion
  }

  /**
   * override output path
   * for combined/bundled build artifact
   */
  overrideOutputPath: string;

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

  /**
   *
   */
  websql: boolean;

  skipCopyManager: boolean;
  /**
   * Cut <@>notForNpm  tag from lib build
   */
  cutNpmPublishLibReleaseCode: boolean;
  /**
   * Do not generate backend code
   */
  genOnlyClientCode: boolean;

  /**
   * Optionally we can start build of smart container
   * with different app
   */
  smartContainerTargetName: string;

  public static from(options: Partial<BuildOptions>): BuildOptions {
    return instanceFrom(options, BuildOptions);
  }

  public static fromRelease(releaseOptions: ReleaseOptions): BuildOptions {
    const buildOptions = BuildOptions.from(releaseOptions as any);
    buildOptions.watch = false;
    return buildOptions;
  }
}
//#endregion

//#region release options

export class ReleaseOptions extends BuildOptionsLibOrApp<ReleaseOptions> {
  private constructor() {
    super();
  }
  releaseVersionBumpType: CoreModels.ReleaseVersionType = 'patch';

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

  /**
   * quick automatic release of lib
   */
  autoReleaseUsingConfig: boolean;
  /**
   * quick automatic release of docs app(s)
   */
  autoReleaseUsingConfigDocs: boolean;
  /**
   * @deprecated
   */
  specifiedVersion: string;
  /**
   * release only trusted projects for specific container framework version
   */
  trusted: boolean;
  public static from(options: Partial<ReleaseOptions>): ReleaseOptions {
    return instanceFrom(options, ReleaseOptions);
  }
}

//#endregion
