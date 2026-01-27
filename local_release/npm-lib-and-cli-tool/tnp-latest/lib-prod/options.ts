import type axiosType from 'axios';
import { walk } from 'lodash-walk-object/lib-prod';
import { chalk, config, LibTypeEnum, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC } from 'tnp-core/lib-prod';
import { crossPlatformPath, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings } from 'tnp-core/lib-prod';

import { DOCKER_TEMPLATES } from './constants';
import { Models__NS__CreateJsonSchemaOptions, Models__NS__DocsConfig, Models__NS__NewSiteOptions, Models__NS__PsListInfo, Models__NS__RootArgsType, Models__NS__TaonArtifactInclude, Models__NS__TaonAutoReleaseItem, Models__NS__TaonContext, Models__NS__TaonJson, Models__NS__TaonJsonContainer, Models__NS__TaonJsonStandalone, Models__NS__TaonLoaderConfig, Models__NS__TaonLoaders, Models__NS__TestTypeTaon, Models__NS__TestTypeTaonArr, Models__NS__TscCompileOptions } from './models';
import type { Project } from './project/abstract/project';

//#region release artifact taon
/**
 * All possible release types for taon
 * for MANUAL/CLOUD release
 */
export enum ReleaseArtifactTaon {
  /**
   * Npm lib package and global cli tool
   */
  NPM_LIB_PKG_AND_CLI_TOOL = 'npm-lib-and-cli-tool',

  /**
   * Angular frontend webapp (pwa) + nodejs backend inside docker
   */
  ANGULAR_NODE_APP = 'angular-node-app',
  /**
   * Angular + Electron app
   */
  ELECTRON_APP = 'electron-app',
  /**
   * Angular + Ionic
   */
  MOBILE_APP = 'mobile-app',
  /**
   * Visual Studio Code extension/plugin
   */
  VSCODE_PLUGIN = 'vscode-plugin',
  /**
   * Documentation (MkDocs + compodoc + storybook)
   * webapp (pwa) inside docker
   */
  DOCS_DOCS_WEBAPP = 'docs-webapp',
}

export const ReleaseArtifactTaonNamesArr: ReleaseArtifactTaon[] = [
  ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
  ReleaseArtifactTaon.ANGULAR_NODE_APP,
  ReleaseArtifactTaon.ELECTRON_APP,
  ReleaseArtifactTaon.MOBILE_APP,
  ReleaseArtifactTaon.VSCODE_PLUGIN,
  ReleaseArtifactTaon.DOCS_DOCS_WEBAPP,
];
//#endregion

//#region release type
export enum ReleaseType {
  /**
   * Manual release (happen physically on local machine)
   */
  MANUAL = 'manual',
  /**
   * Releases artifact to local repository <project-location>/local_release/<artifact-name>/<release build files>
   */
  LOCAL = 'local',
  /**
   * Trigger cloud release (happen on cloud server)
   * Cloud release actually start "Manual" release process on cloud server
   */
  CLOUD = 'cloud',
  /**
   * Trigger cloud release (happen on cloud server)
   * Cloud release actually start "Manual" release process on cloud server
   */
  STATIC_PAGES = 'static-pages',
}

export const ReleaseTypeArr: ReleaseType[] = [
  ReleaseType.MANUAL,
  ReleaseType.LOCAL,
  ReleaseType.CLOUD,
  ReleaseType.STATIC_PAGES,
];

export const Development = 'development';
export const ReleaseTypeWithDevelopmentArr: (ReleaseType | 'development')[] = [
  ...ReleaseTypeArr,
  Development,
];

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

//#region env options / build / electron
class EnvOptionsBuildElectron {
  declare showDevTools: boolean;
}
//#endregion

//#region env options / build / cli
class EnvOptionsBuildCli {
  /**
   * using esbuild (default false)
   */
  declare minify: boolean;

  /**
   *  using esbuild (default false)
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

class EnvOptionsNodeBackendApp {
  /**
   * using esbuild
   */
  declare minify: boolean;
}

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
  declare baseHref: string;

  declare websql: boolean;

  /**
   * Taon production release mode:
   * - splitting namespaces
   * - all possible optimization
   */
  declare prod?: boolean;

  /**
   * watch build
   */
  declare watch: boolean;

  /**
   * true by default
   */
  declare ssr: boolean;
  // declare angularSsr: boolean;

  /**
   * show electron dev tools
   */
  declare electron: Partial<EnvOptionsBuildElectron>;
  // declare angularSsr: boolean;

  /**
   * Do not generate backend code
   */
  declare genOnlyClientCode: boolean;

  declare pwa: Partial<EnvOptionsBuildPwa>;
}
//#endregion

//#region env options / docker

export const dockerBackendAppNode = {
  name: 'backend-app-node',
  skipStartInDevMode: true,
  pathToProjectWithDockerfile: (project: Project) => {
    //#region @backendFunc
    return project.ins
      .by(LibTypeEnum.ISOMORPHIC_LIB)
      .pathFor([DOCKER_TEMPLATES, 'backend-app-node']);
    //#endregion
  },
} as TaonDockerContainerConfig;

export const dockerFrontendNginx = {
  name: 'frontend-app-node',
  skipStartInDevMode: true,
  pathToProjectWithDockerfile: (project: Project) => {
    //#region @backendFunc
    return project.ins
      .by(LibTypeEnum.ISOMORPHIC_LIB)
      .pathFor([DOCKER_TEMPLATES, 'frontend-app-node']);
    //#endregion
  },
} as TaonDockerContainerConfig;

export const dockerDatabaseMysql = {
  name: 'database-mysql',
  pathToProjectWithDockerfile: (project: Project) => {
    //#region @backendFunc
    return project.ins
      .by(LibTypeEnum.ISOMORPHIC_LIB)
      .pathFor([DOCKER_TEMPLATES, 'database-mysql']);
    //#endregion
  },
  healthCheck: async ({ axios, env }) => {
    //#region @backendFunc
    const res = await axios.get(`http://localhost:${env.HEALTH_PORT}/health`);
    return res.data === 'OK';
    //#endregion
  },
} as TaonDockerContainerConfig<{
  MYSQL_ROOT_PASSWORD: string;
  MYSQL_DATABASE: string;
  MYSQL_USER: string;
  MYSQL_PASSWORD: string;
  readonly HEALTH_PORT: number;
}>;

const taonBuiltinDockerImages = {
  'backend-app-node': dockerBackendAppNode,
  'frontend-app': dockerFrontendNginx,
  'database-mysql': dockerDatabaseMysql,
};

export const taonBuildInImages = Object.values(
  taonBuiltinDockerImages,
) as TaonDockerContainerConfig[];

export interface TaonDockerContainerConfig<ENV = {}> {
  /**
   * name for container - should be unique
   */
  name: string;
  /**
   * based on image name or function that return path to dockerfile
   */
  pathToProjectWithDockerfile?: (opt?: {
    project?: Project;
    env?: ENV;
  }) => string;
  /**
   * if true container wont start in dev mode
   * (ng serve, debug js mode on localhost etc.)
   */
  skipStartInDevMode?: boolean;
  /**
   * if wait unit healthy is true
   * then healthCheck function is required
   * and it will be called to check if container is healthy
   */
  healthCheck?: (opt?: {
    axios?: typeof axiosType;
    project?: Project;
    env?: ENV;
  }) => Promise<boolean>;
  waitUnitHealthy?: boolean;
  overrideDotEnv?: { [key in keyof ENV]: string | number | boolean };
}

/**
 * Each taon context will get mysql mariadb instead
 * sqljs file database when using docker
 */
class EnvOptionsDocker {
  declare skipStartInOrder?: boolean;

  /**
   * each taon context will use sql.js file database
   */
  declare skipUsingMysqlDb?: boolean;

  declare additionalContainer: (
    | Partial<TaonDockerContainerConfig<any>>
    | keyof typeof taonBuiltinDockerImages
  )[];
}
//#endregion

//#region env options / ports
class EnvOptionsPorts {
  // TODO not needed ?
  // /**
  //  * override port for angular ng serve in normal mode
  //  */
  // declare ngNormalAppPort?: number;
  // /**
  //  * override port for angular ng serve in websql mode
  //  */
  // declare ngWebsqlAppPort?: number;
  // /**
  //  * override port for angular ng serve in normal mode
  //  */
  // declare ngNormalElectronPort?: number;
  // /**
  //  * override port for angular ng serve in websql mode
  //  */
  // declare ngWebsqlElectronPort?: number;
  // /**
  //  * override port for nodejs backend server
  //  */
  // declare nodeBeAppPort?: number;
}
//#endregion

//#region env options / loading

//#region env options / loading / pre-angular-bootstrap
class EnvOptionsLoadingPreAngularBootstrap {
  /**
   * loder path to image or
   * build in loader config
   */
  declare loader?: string | Models__NS__TaonLoaderConfig;

  /**
   * background body
   */
  declare background?: string;
}
//#endregion

//#region env options / loading / after-angular-bootstrap
class EnvOptionsLoadingAfterAngularBootstrapConfig {
  /**
   * loder path to image or
   * build in loader config
   */
  declare loader?: string | Models__NS__TaonLoaderConfig;

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
  // declare afterAngularBootstrap?: Partial<EnvOptionsLoadingAfterAngularBootstrapConfig>;
}
//#endregion

//#region env options / release
class EnvOptionsRelease {
  declare taonInstanceIp?: string;

  /**
   * new version resolve at the beginning of release process
   * and is used for all artifacts
   */
  declare readonly resolvedNewVersion: string;

  /**
   * skip npm publish
   */
  declare skipDeploy?: boolean;

  /**
   * skip npm publish
   */
  declare skipNpmPublish?: boolean;

  /**
   * skip git commit
   */
  declare skipTagGitPush?: boolean;

  /**
   * skip release question
   */
  declare skipReleaseQuestion?: boolean;

  /**
   * Useful if you just want to release static pages
   * without any versioning
   */
  declare skipStaticPagesVersioning?: boolean;

  /**
   * skip git commit
   */
  declare skipResolvingGitChanges?: boolean;

  /**
   * skip cuting @ n o t F o r N p m tags
   */
  declare skipCodeCutting?: boolean;

  /**
   * release artifact name
   * for example: "angular-node-app"
   */
  declare targetArtifact: ReleaseArtifactTaon;

  /**
   * true - skip all artifacts build
   * or array of artifacts to skip
   */
  declare skipBuildingArtifacts?: ReleaseArtifactTaon[] | boolean;

  /**
   * undefined  - means it is development build
   */
  declare releaseType?: ReleaseType | undefined;
  /**
   * process that is running in CI (no questions for user)
   */

  declare releaseVersionBumpType: CoreModels__NS__ReleaseVersionType;

  /**
   * quick automatic release of lib
   */
  declare autoReleaseUsingConfig: boolean;

  /**
   * Task of auto release from config
   */
  declare autoReleaseTaskName: string;

  /**
   * Tell when to override (html,js,css) static pages files
   * when releasing new version
   * Example:
   * - for docs on "static pages" you just want one docs version for major release
   * - for electron apps on "static pages" you want to have an version for each minor or patch release
   */
  declare overrideStaticPagesReleaseType: CoreModels__NS__ReleaseVersionType;

  /**
   * Separated repository for static pages releases
   */
  declare staticPagesCustomRepoUrl?: string;

  declare envName: CoreModels__NS__EnvironmentNameTaon;

  /**
   * undefined - prod
   * number   -  prod1
   */
  declare envNumber: number | undefined;

  declare cli: Partial<EnvOptionsBuildCli>;

  declare nodeBackendApp: Partial<EnvOptionsNodeBackendApp>;

  declare lib: Partial<EnvOptionsBuildLib>;

  /**
   * after release install locally
   * - vscode plugin -> to Local VSCode
   * - npm lib -> to Local NPM
   * - angular-node-app -> to Local docker
   * - electron-app -> to current os
   * - mobile-app -> to current connected device
   * - docs-webapp -> as offline pwa app installed in current os
   */
  declare installLocally: boolean;

  /**
   * after local install remove release output
   * (for quick local test releases)
   */
  declare removeReleaseOutputAfterLocalInstall?: boolean;
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

  declare beforeCopyHook: () => void | Promise<void>;

  declare copyToLocations: string[];

  declare copyToProjects: string[];
}
//#endregion

//#region env options / website
class EnvOptionsWebsite {
  declare title: string;

  declare domain: string;
  /**
   * Where taon should allow doamin use in this project.
   *
   * Not using domain ( useDomain = false ) means:
   * -> github pages generated domain
   * -> ip address as domain
   */

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
   * skip specified projects
   */
  declare skip?: string | string[];

  /**
   * end release on project
   */
  declare end?: string;

  /**
   * skip just released projects (last commit starts with 'release: ')
   * and only release projects with new changes
   */
  declare skipReleased?: boolean;
}
//#endregion

export class EnvOptions<PATHS = {}, CONFIGS = {}> {
  //#region static / from

  static async releaseSkipMenu(
    options: EnvOptions,
    opt?: {
      selectDefaultValues?: boolean;
      args?: string[];
    },
  ): Promise<EnvOptions> {
    const args = opt?.args || [];
    opt = opt || {};
    const defaultSelected = [
      'skipBuildingArtifactsNpmLibAndCliTool',
      'skipReleaseQuestion',
    ] as (keyof typeof choices)[];

    const choices = {
      skipDeploy: {
        name: 'Skip deploy',
      },
      skipNpmPublish: {
        name: 'Skip npm publish',
      },
      skipTagGitPush: {
        name: 'Skip git tag & push',
      },
      skipReleaseQuestion: {
        name: 'Skip release questions',
      },
      skipResolvingGitChanges: {
        name: 'Skip resolving git changes',
      },
      skipBuildingArtifactsNpmLibAndCliTool: {
        name: 'Skip building artifact: npm-lib-and-cli-tool',
      },
      skipBuildingArtifactsAngularNodeApp: {
        name: 'Skip building artifact: angular-node-app',
      },
    };

    const optionsToSet = opt.selectDefaultValues
      ? defaultSelected
      : await UtilsTerminal__NS__multiselect({
          question: 'Select options to skip during release:',
          choices,
          defaultSelected,
          autocomplete: true,
        });

    if (optionsToSet.includes('skipDeploy')) {
      options.release.skipDeploy = true;
    }
    if (optionsToSet.includes('skipNpmPublish')) {
      options.release.skipNpmPublish = true;
    }
    if (optionsToSet.includes('skipTagGitPush')) {
      options.release.skipTagGitPush = true;
    }
    if (optionsToSet.includes('skipReleaseQuestion')) {
      options.release.skipReleaseQuestion = true;
    }
    if (optionsToSet.includes('skipResolvingGitChanges')) {
      options.release.skipResolvingGitChanges = true;
    }

    options.release.skipBuildingArtifacts =
      options.release.skipBuildingArtifacts || [];

    if (optionsToSet.includes('skipBuildingArtifactsNpmLibAndCliTool')) {
      (options.release.skipBuildingArtifacts as string[]).push(
        ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
      );
    }
    if (optionsToSet.includes('skipBuildingArtifactsAngularNodeApp')) {
      (options.release.skipBuildingArtifacts as string[]).push(
        ReleaseArtifactTaon.ANGULAR_NODE_APP,
      );
    }

    Helpers__NS__info(`

      Your command:

${chalk.bold(options.toStringCommand(args.join(' ')))}

      `);
    await UtilsTerminal__NS__pressAnyKeyToContinueAsync();

    return options;
  }

  public static from(options: Partial<EnvOptions>): EnvOptions {
    return new EnvOptions().clone(options);
  }

  toStringCommand(taonCommand?: string): string {
    let paramsCommand = '';
    const alreadySetParams: string[] = [`--skipMenu true`, '--skipMenu'];
    for (const element of alreadySetParams) {
      taonCommand = taonCommand?.replace(element, '');
    }

    walk.Object(
      this,
      (value, lodashPath) => {
        if (___NS__isNil(value) || ___NS__isFunction(value)) {
          // skipping
        } else {
          // ___NS__set(destination, lodashPath, value);
          if (___NS__isBoolean(value)) {
            value = value ? 'true' : 'false';
          }
          if (___NS__isArray(value) || lodashPath.includes('[')) {
            if (___NS__isArray(value)) {
              for (const val of value) {
                const newParam = `--${lodashPath.split('[')[0]} ${val}`;
                if (!alreadySetParams.includes(newParam)) {
                  paramsCommand = `${paramsCommand} ${newParam} `;
                  alreadySetParams.push(newParam);
                }
              }
            } else {
              const newParam = `--${lodashPath.split('[')[0]} ${value}`;
              if (!alreadySetParams.includes(newParam)) {
                paramsCommand = `${paramsCommand} ${newParam} `;
                alreadySetParams.push(newParam);
              }
            }
          } else {
            if (___NS__isObject(value)) {
              // skip object
            } else {
              const newParam = `--${lodashPath} ${value}`;
              if (!alreadySetParams.includes(newParam)) {
                paramsCommand = `${paramsCommand} ${newParam} `;
                alreadySetParams.push(newParam);
              }
            }
          }
        }
      },
      {
        walkGetters: false,
      },
    );

    return `${config.frameworkName} ${taonCommand || ''} ${paramsCommand}`.trim();
  }

  /**
   * override existed/proper fields from "override" object
   * inside "destination" object
   */
  static merge(destination, override): EnvOptions {
    walk.Object(
      override || {},
      (value, lodashPath) => {
        if (___NS__isNil(value) || ___NS__isFunction(value) || ___NS__isObject(value)) {
          // skipping
        } else {
          ___NS__set(destination, lodashPath, value);
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
    Helpers__NS__writeJson(absFilePath, options);
    //#endregion
  }

  public static loadFromFile(absFilePath: string): EnvOptions {
    //#region @backendFunc
    const options = Helpers__NS__readJson(absFilePath);
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
        if (___NS__isNil(value) || ___NS__isFunction(value) || ___NS__isObject(value)) {
          // skipping
        } else {
          if (Array.isArray(value)) {
            for (const val of value) {
              if (___NS__isBoolean(value)) {
                pathWithParams += ` --${lodashPath}=${val ? 'true' : 'false'} `;
              } else {
                pathWithParams += ` --${lodashPath}=${val} `;
              }
            }
          } else {
            const val = value;
            if (___NS__isBoolean(value)) {
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

  /**
   * @deprecated everything automatically handled by taon
   */
  declare ports: Partial<EnvOptionsPorts>;

  declare docker: Partial<EnvOptionsDocker>;

  declare release: Partial<EnvOptionsRelease>;

  declare init: Partial<EnvOptionsInit>;

  declare build: Partial<EnvOptionsBuild>;

  /**
   * Use this only when you are not using SSR
   */
  declare loading: Partial<EnvOptionsLoading>;

  declare copyToManager: Partial<EnvOptionsCopyToManager>;

  declare website: Partial<EnvOptionsWebsite>;

  //#region generated fields
  declare readonly name?: CoreModels__NS__EnvironmentNameTaon; // generated

  declare readonly currentProjectName?: string;

  declare readonly currentProjectType?: CoreModels__NS__LibType;

  declare readonly appId?: string;

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

    this.paths = ___NS__merge(this.paths, ___NS__cloneDeep(override.paths));
    this.config = ___NS__merge(this.config, ___NS__cloneDeep(override.config));

    this.container = ___NS__merge(new EnvOptionsContainer(), this.container);
    if (___NS__isString(this.container.only) && this.container.only.includes(',')) {
      this.container.only = this.container.only.split(',');
    }
    this.container.only =
      (___NS__isString(this.container.only)
        ? [this.container.only]
        : this.container.only) || [];

    if (!___NS__isArray(this.container.only)) {
      this.container.only = [];
    }

    if (___NS__isString(this.container.skip) && this.container.skip.includes(',')) {
      this.container.skip = this.container.skip.split(',');
    }
    this.container.skip =
      (___NS__isString(this.container.skip)
        ? [this.container.skip]
        : this.container.skip) || [];

    if (!___NS__isArray(this.container.skip)) {
      this.container.skip = [];
    }

    this.ports = ___NS__merge(new EnvOptionsPorts(), this.ports);
    this.init = ___NS__merge(new EnvOptionsInit(), this.init);

    this.build = this.build || ({} as any);
    this.build.pwa = ___NS__merge(new EnvOptionsBuildPwa(), this.build?.pwa);
    this.build.electron = ___NS__merge(
      new EnvOptionsBuildElectron(),
      this.build?.electron,
    );
    this.build = ___NS__merge(new EnvOptionsBuild(), this.build);

    if (
      ___NS__isString(this['base-href']) &&
      this['base-href'] &&
      this['base-href'] !== '/'
    ) {
      // QUICK FIX
      this.build.baseHref = this['base-href'];
      delete this['base-href'];
      delete override['base-href'];
    }

    if (___NS__isString(this.build.baseHref)) {
      this.build.baseHref = crossPlatformPath(this.build.baseHref);
      if (!this.build.baseHref.startsWith('/')) {
        this.build.baseHref = `/${this.build.baseHref}`;
      }
      if (!this.build.baseHref.endsWith('/')) {
        this.build.baseHref = `${this.build.baseHref}/`;
      }
    }

    if (___NS__isBoolean(this['websql'])) {
      // QUICK FIX
      this.build.websql = this['websql'];
      delete this['websql'];
      delete override['websql'];
    }

    if (___NS__isBoolean(this['ssr'])) {
      // QUICK FIX
      this.build.ssr = this['ssr'];
      delete this['ssr'];
      delete override['ssr'];
    }

    this.loading = this.loading || ({} as any);

    this.loading.preAngularBootstrap = ___NS__merge(
      new EnvOptionsLoadingPreAngularBootstrap(),
      this.loading?.preAngularBootstrap,
    );
    // this.loading.afterAngularBootstrap = ___NS__merge(
    //   new EnvOptionsLoadingAfterAngularBootstrapConfig(),
    //   this.loading?.afterAngularBootstrap,
    // );
    this.loading = ___NS__merge(new EnvOptionsLoading(), this.loading);

    this.release = this.release || ({} as any);

    this.release.cli = ___NS__merge(new EnvOptionsBuildCli(), this.release?.cli);
    this.release.nodeBackendApp = ___NS__merge(
      new EnvOptionsNodeBackendApp(),
      this.release?.nodeBackendApp,
    );
    this.release.lib = ___NS__merge(new EnvOptionsBuildLib(), this.release?.lib);
    this.release = ___NS__merge(new EnvOptionsRelease(), this.release);

    this.copyToManager = ___NS__merge(
      new EnvOptionsCopyToManager(),
      this.copyToManager,
    );

    this.website = ___NS__merge(new EnvOptionsWebsite(), this.website);

    // fields fixes, prevent incorrect values
    if (___NS__isString(this.website.domain)) {
      this.website.domain = this.website.domain.replace(/\/$/, '');
      this.website.domain = this.website.domain.replace(/^https?:\/\//, '');
    }

    if (___NS__isString(this.release.skipBuildingArtifacts)) {
      if (this.release.skipBuildingArtifacts.includes(',')) {
        this.release.skipBuildingArtifacts = this.release.skipBuildingArtifacts
          .split(',')
          .map(v => v.trim()) as ReleaseArtifactTaon[];
      } else {
        this.release.skipBuildingArtifacts = [
          this.release.skipBuildingArtifacts as ReleaseArtifactTaon,
        ];
      }
    }
  }
  //#endregion

  //#region save to file
  public saveToFile(absFilePath: string): void {
    //#region @backendFunc
    EnvOptions.saveToFile(this as any, absFilePath);
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
  public clone(
    override?: Partial<EnvOptions>,
    options?: {
      skipPreservingFinishCallback?: boolean;
    },
  ): EnvOptions {
    //#region @backendFunc
    options = options || {};
    override = override || {};
    const orgFinishCallback = override?.finishCallback;
    const beforeCopyHookOverride = override?.copyToManager?.beforeCopyHook;
    const beforeCopyHookThis = this?.copyToManager?.beforeCopyHook;
    const toClone = ___NS__cloneDeep(this);
    EnvOptions.merge(toClone, override);
    const result = new EnvOptions(toClone);
    if (!options.skipPreservingFinishCallback) {
      if (orgFinishCallback) {
        result.finishCallback = orgFinishCallback;
      } else {
        result.finishCallback = () => {};
      }
    }
    if (beforeCopyHookOverride || beforeCopyHookThis) {
      if (beforeCopyHookOverride) {
        result.copyToManager.beforeCopyHook = beforeCopyHookOverride;
      } else if (beforeCopyHookThis) {
        result.copyToManager.beforeCopyHook = beforeCopyHookThis;
      }
    }
    return result;
    //#endregion
  }
  //#endregion
}
//#endregion

//#region dummy for generating environments
/**
 * Purpose of this dummy is to have all properties
 * when generating environments
 */
export const EnvOptionsDummyWithAllProps = EnvOptions.from({
  paths: {},
  config: {},
  purpose: '-' as any,
  recursiveAction: '-' as any,
  isCiProcess: '-' as any,
  container: {
    end: '-' as any,
    only: '-' as any,
    start: '-' as any,
    skipReleased: '-' as any,
  },
  ports: {},
  release: {
    resolvedNewVersion: '-' as any,
    targetArtifact: '-' as any,
    releaseVersionBumpType: '-' as any,
    envName: '-' as any,
    envNumber: '-' as any,
    installLocally: '-' as any,
    removeReleaseOutputAfterLocalInstall: '-' as any,
    cli: {
      minify: '-' as any,
      includeNodeModules: '-' as any,
      uglify: '-' as any,
      obscure: '-' as any,
      compress: '-' as any,
    },
    nodeBackendApp: {
      minify: '-' as any,
    },
    releaseType: '-' as any,
    lib: {
      removeDts: '-' as any,
      obscureFileByFile: '-' as any,
      uglifyFileByFile: '-' as any,
      includeSourceMaps: '-' as any,
      compress: '-' as any,
      doNotIncludeLibFiles: '-' as any,
    },
    autoReleaseUsingConfig: '-' as any,
    autoReleaseTaskName: '-' as any,
    taonInstanceIp: '-' as any,
    skipNpmPublish: '-' as any,
    skipDeploy: '-' as any,
    skipTagGitPush: '-' as any,
    skipReleaseQuestion: '-' as any,
    skipResolvingGitChanges: '-' as any,
    skipCodeCutting: '-' as any,
    skipBuildingArtifacts: '-' as any,
  },
  init: {
    branding: '-' as any,
    struct: '-' as any,
  },
  docker: {
    additionalContainer: '-' as any,
    skipStartInOrder: '-' as any,
    skipUsingMysqlDb: '-' as any,
  },
  build: {
    ssr: '-' as any,
    // angularSsr: '-' as any,
    websql: '-' as any,
    prod: '-' as any,
    electron: {
      showDevTools: '-' as any,
    },
    pwa: {
      disableServiceWorker: '-' as any,
      name: '-' as any,
      short_name: '-' as any,
      start_url: '-' as any,
    },
    overrideOutputPath: '-' as any,
    baseHref: '-' as any,
    watch: '-' as any,
    genOnlyClientCode: '-' as any,
  },
  loading: {
    // afterAngularBootstrap: {
    //   loader: '-' as any,
    //   background: '-' as any,
    // },
    preAngularBootstrap: {
      loader: '-' as any,
      background: '-' as any,
    },
  },
  copyToManager: {
    beforeCopyHook: '-' as any,
    copyToLocations: '-' as any,
    copyToProjects: '-' as any,
    skip: '-' as any,
  },
  website: {
    domain: '-' as any,
    title: '-' as any,
    useDomain: '-' as any,
  },
});

const allPathsEnvConfig = [];

walk.Object(
  EnvOptionsDummyWithAllProps,
  (value, lodashPath) => {
    if (Array.isArray(value)) {
      allPathsEnvConfig.push(lodashPath);
    } else {
      if (
        !___NS__isObject(value) &&
        !___NS__isFunction(value) &&
        !lodashPath.includes('[') // it is array
      ) {
        allPathsEnvConfig.push(lodashPath);
      }
    }
  },
  { walkGetters: false },
);

export { allPathsEnvConfig };

//#endregion