//#region imports
import type * as ora from 'ora';
import { TaonTempDatabasesFolder, TaonTempRoutesFolder } from 'taon/lib-prod';
import {
  config,
  dockerTemplates,
  dotTaonFolder,
  fileName,
  folderName,
  taonContainers,
} from 'tnp-core/lib-prod';
import { fse, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings } from 'tnp-core/lib-prod';
import { ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds } from 'tnp-core/lib-prod';

import { CURRENT_PACKAGE_VERSION } from './build-info._auto-generated_';
import type { EnvOptions } from './options';
import { DeploymentReleaseData } from './project/abstract/taon-worker/deployments/deployments.models';

// import type { Project } from './project/abstract/project';
//#endregion

export const whatToLinkFromCore: 'src' | 'src/lib' = 'src/lib';
// export const whatToLinkFromCore: 'src' | 'src/lib' = 'src/lib';

/**
 *  '' - when whatToLinkFromCore is src
 *  'lib' - when whatToLinkFromCore is src/lib
 *  'deep/folder' - when whatToLinkFromCore is src/deep/folder
 */
export const whatToLinkFromCoreDeepPart =
  whatToLinkFromCore === ('src' as any)
    ? ''
    : (whatToLinkFromCore as string).replace('src/', '');

export const keysMap = {
  destinationDomain: 'dn',
  projectName: 'pn',
  releaseType: 'rt',
  version: 'ver',
  envName: 'enm',
  envNumber: 'enu',
  targetArtifact: 'ta',
} as Required<{ [key in keyof DeploymentReleaseData]: string }>;

export const dirnameFromSourceToProject = (linkToSource: string): string => {
  const orgParamLinkAbs = linkToSource;
  linkToSource = fse.realpathSync(linkToSource);
  linkToSource = crossPlatformPath(linkToSource);
  const orgRealLinkToSource = linkToSource;
  const howManyDirname = whatToLinkFromCore.split('/').length;
  ___NS__times(howManyDirname, n => {
    // console.log(`dirname action ${n}/${howManyDirname}`);
    linkToSource = crossPlatformPath(path.dirname(linkToSource));
  });
  linkToSource = crossPlatformPath(linkToSource);
  // console.log({ linkToSource, orgRealLinkToSource, howManyDirname });

  if (path.basename(linkToSource) === 'src') {
    // console.log(`FIXING NOT PROPER LINK TO SOURCE ${orgParamLinkAbs}`);
    linkToSource = crossPlatformPath(path.dirname(linkToSource));
    // if (whatToLinkFromCore === 'src') {
    //   try {
    //     fse.unlinkSync(orgParamLinkAbs);
    //   } catch (error) {}
    //   Helpers__NS__createSymLink(
    //     crossPlatformPath([linkToSource, whatToLinkFromCore]),
    //     orgParamLinkAbs,
    //   );
    // }

    // linkToSource = crossPlatformPath(path.dirname(linkToSource));
  }

  return linkToSource;
};

export const DUMMY_LIB = '@lib';

export const DOCKER_COMPOSE_FILE_NAME = 'docker-compose.yml';
export const DOCKER_FOLDER = 'docker';
export const BASE_TEMP_DOCKER_FOLDER = 'tmp-docker';

export const DOCKER_TEMPLATES = 'docker-templates';

export const ACTIVE_CONTEXT = 'ACTIVE_CONTEXT';

export const friendlyNameForReleaseAutoConfigIsRequired = false;

export const iconVscode128Basename = 'icon-vscode.png';

export const startJsFromBin = 'start.js';
export const startTsFromLib = 'start.ts';

export const taonIgnore = '@taon' + '-' + 'ignore';

export const DEBUG_WORD = 'Debug/Start';

export const scriptsCommands = [
  'taon init',
  'taon start',
  'taon build:lib',
  'taon build:watch:lib',
  'taon build:watch:app',
  'taon build:watch:electron',
  'taon docs',
  'taon docs:watch',
  'taon clear',
  'taon release',
  'taon release:auto',
  'taon release:install:locally',
  'taon migration:create',
  'taon migration:run',
  'taon migration:revert',
  'taon vscode:temp:show',
  'taon vscode:temp:hide',
];

export const THIS_IS_GENERATED_STRING = `THIS FILE IS GENERATED - DO NOT MODIFY`;
export const THIS_IS_GENERATED_INFO_COMMENT = `// ${THIS_IS_GENERATED_STRING}`;

export const defaultLicenseVscodePlugin = 'MIT';

export const OVERRIDE_FROM_TNP = [
  'activationEvents',
  'author',
  'bugs',
  'categories',
  'description',
  'engines',
  'homepage',
  'keywords',
  'license',
  'private',
  'repository',
  'scripts',
];

export const globalSpinner = {
  get instance(): Pick<
    ora.Ora,
    'start' | 'text' | 'succeed' | 'stop' | 'fail'
  > {
    //#region @backendFunc
    return global.spinner;
    //#endregion
  },
};

export const startSpinner = 'start-spinner';
export const stopSpinner = 'stop-spinner';
export const failSpinner = 'fail-spinner';
export const succeedSpinner = 'succeed-spinner';

export const USE_IN_HOST_CONFIG_FULL_CONTEXT_PATH = false;

export const MIGRATION_CONST_PREFIX = 'MIGRATIONS_CLASSES_FOR_';

let taonUsingBundledCliMode = false;

//#region @backend
taonUsingBundledCliMode = !!global.taonUsingBundledCliMode;
//#endregion

export { taonUsingBundledCliMode };

export const UNIT_TEST_TIMEOUT = 30000;
export const INTEGRATION_TEST_TIMEOUT = 30000;

export const USE_MIGRATIONS_DATA_IN_HOST_CONFIG = false;

export const COMPILATION_COMPLETE_LIB_NG_BUILD =
  'Compilation complete. Watching for file changes';

export const COMPILATION_COMPLETE_APP_NG_SERVE = 'Compiled successfully';

// TODO get this from cli, global
export const DEFAULT_FRAMEWORK_VERSION =
  `v${CURRENT_PACKAGE_VERSION.split('.')[0]}` as CoreModels__NS__FrameworkVersion;

let taonRepoPathUserInUserDir: string = '';

//#region @backend
taonRepoPathUserInUserDir = crossPlatformPath([
  UtilsOs__NS__getRealHomeDir(),
  dotTaonFolder,
  taonContainers,
]);
//#endregion

const taonBasePathToGlobalDockerTemplates: string = crossPlatformPath([
  UtilsOs__NS__getRealHomeDir(),
  dotTaonFolder,
  dockerTemplates,
]);

export { taonRepoPathUserInUserDir, taonBasePathToGlobalDockerTemplates };

/**
 * Prevents taon from checking core container when
 * calling itself from child process
 */
export const SKIP_CORE_CHECK_PARAM = '--skipCoreCheck';

export const argsToClear = [
  'websql',
  'serveApp',
  'skipNodeModules',
  'skipSmartContainerDistInit',
  'copyto',
  'port',
  'branding',
  'struct',
  'verbose',
];

export const verbosePrefix = '-verbose';
export const spinnerPrefix = '-spinner';
export const websqlPrefix = '-websql';

export const folder_shared_folder_info = 'shared_folder_info.txt';
export const taonConfigSchemaJsonStandalone =
  'taon-config-standalone.schema.json';
export const taonConfigSchemaJsonContainer =
  'taon-config-container.schema.json';

export const TEMP_DOCS = 'tmp-documentation';

const libsAppPortsFolder = 'libs-apps-ports';

export const HOST_BACKEND_PORT = 'HOST_BACKEND_PORT';
export const tmp_HOST_BACKEND_PORT = `${dotTaonFolder}/${libsAppPortsFolder}/${HOST_BACKEND_PORT}`;

export const FRONTEND_WEBSQL_APP_PORT = 'FRONTEND_WEBSQL_APP_PORT';
export const tmp_FRONTEND_WEBSQL_APP_PORT = `${dotTaonFolder}/${libsAppPortsFolder}/${FRONTEND_WEBSQL_APP_PORT}`;

export const FRONTEND_NORMAL_APP_PORT = 'FRONTEND_NORMAL_APP_PORT';
export const tmp_FRONTEND_NORMAL_APP_PORT = `${dotTaonFolder}/${libsAppPortsFolder}/${FRONTEND_NORMAL_APP_PORT}`;

export const FRONTEND_NORMAL_ELECTRON_PORT = 'FRONTEND_NORMAL_ELECTRON_PORT';
export const tmp_FRONTEND_NORMAL_ELECTRON_PORT = `${dotTaonFolder}/${libsAppPortsFolder}/${FRONTEND_NORMAL_ELECTRON_PORT}`;

export const DEFAULT_PORT = {
  DIST_SERVER_DOCS: 4000,
  APP_BUILD_LOCALHOST: 4200,
  SERVER_LOCALHOST: 4100,
  DEBUGGING_CLI_TOOL: 9222,
  DEBUGGING_ELECTRON: 9888,
};

export const docsConfigJsonFileName = 'docs-config.jsonc';
export const docsConfigSchema = 'docs-config.schema.json';
export const customDefaultCss = 'custom-default.css';
export const customDefaultJs = 'custom-default.js';

export const frameworkBuildFolders = Utils__NS__uniqArray([
  'firedev',
  'taon',
  'tnp',
  `${config.frameworkName}`,
])
  .filter(f => !!f)
  .map(f => `.${f}`);

export const envTs = 'env.ts';

export const environmentsFolder = 'environments';

export const coreRequiredEnvironments = [
  '__',
  'prod',
] as CoreModels__NS__EnvironmentNameTaon[];

/**
 * @deprecated not needed probably
 */
export const result_packages_json = 'result-packages.json';

export const readmeMdMainProject = 'README.md';

export const tmpIsomorphicPackagesJson = 'tmp-isomorphic-packages.json';

/**
 * If exist - copy manager will clean copy bundled package to destinations
 */
export const tmpAlreadyStartedCopyManager = 'tmp-already-started-copy-manager'; // not for prod

export const tmpAllAssetsLinked = 'tmp-all-assets-linked'; // not for prod

/**
 * Destination place for all taon processes (tsc, ng build, etc)
 * From this folder code is copied to final destinations node_modules
 */
export const tmpLocalCopytoProjDist = 'tmp-local-copyto-proj-dist'; // not for prod

/**
 * Folder where tmpSrdDist code is cutted file by file before publishing
 */
export const tmpCutReleaseSrcDist = 'tmp-cut-release-src-dist'; // not for prod

/**
 * Folder where tmpSrdDist code is cutted file by file before publishing (websql version)
 */
export const tmpCutReleaseSrcDistWebsql = 'tmp-cut-release-src-dist-websql'; // not for prod

/**
 * Temporary folder for base href overwrite during build
 * (taon library build sets it)
 */
export const tmpBaseHrefOverwrite = 'tmp-base-href-overwrite';

/**
 * Temporary folder for vscode project files
 */
export const tmpVscodeProj = `tmp-vscode-proj`;

/**
 * Taon code transformed for backend
 */
export const tmpSourceDist = 'tmp-source-dist'; // ok for prod
/**
 * Taon code transformed for backend in websql mode
 * (this code is probably never used)
 */
export const tmpSourceDistWebsql = 'tmp-source-dist-websql'; // ok for prod

/**
 * Taon code transformed for browser
 */
export const tmpSrcDist = 'tmp-src-dist'; // ok for prod
/**
 * Taon code transformed for browser in websql mode
 */
export const tmpSrcDistWebsql = 'tmp-src-dist-websql'; // ok for prod

/**
 * Taon code transformed for browser (angular app uses this)
 */

export const tmpSrcAppDist = 'tmp-src-app-dist'; // ok for prod

/**
 * Taon code transformed for browser (angular app in websql uses this)
 */
export const tmpSrcAppDistWebsql = 'tmp-src-app-dist-websql'; // ok for prod

export const defaultConfiguration = 'defaultConfiguration';

/**
 * template folders from isomorphic lib
 */
export enum TemplateFolder {
  /**
   * Core project for angular app webapp, library and electron app
   */
  templateApp = 'template-app',

  /**
   * @deprecated
   * Core project angular library
   */
  // templateLib = 'template-lib',

  /**
   * @deprecated
   * Core project template for electron app
   */
  // templateElectron = 'template-electron',
}

export enum AngularJsonTaskName {
  ANGULAR_APP = 'app',
  ELECTRON_APP = 'angular-electron',
}

export enum CoreAssets {
  sqlWasmFile = 'sql-wasm.wasm',
  mainFont = 'flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
}

export const dockerTemplatesFolder = 'docker-templates';

export enum DockerTemplatesFolders {
  ANGULAR_APP_NODE = 'angular-app-node',
  ANGULAR_APP_SSR_NODE = 'angular-app-ssr-node',
  BACKEND_APP_NODE = 'backend-app-node',
  DATABASE_MYSQL = 'database-mysql',
}

export enum CoreNgTemplateFiles {
  sqlJSLoaderTs = 'sqljs-loader.ts',
  SERVER_TS = 'server.ts',
  JEST_CONFIG_JS = 'jest.config.js',
  SETUP_JEST_TS = 'setupJest.ts',
  JEST_GLOBAL_MOCKS_TS = 'jestGlobalMocks.ts',
  NG_PACKAGE_JSON = 'ng-package.json',
  PACKAGE_JSON = 'package.json', // fileName.package_json,
  ANGULAR_JSON = 'angular.json', // fileName.angular_json,
  INDEX_HTML_NG_APP = 'index.html',
  FAVICON_ICO = 'favicon.ico',
  WEBMANIFEST_JSON = 'manifest.webmanifest',
}

export enum TaonGeneratedFiles {
  BUILD_INFO_MD = 'BUILD-INFO.md',
  build_info_generated_ts = 'build-info._auto-generated_.ts',
  index_generated_ts = 'index._auto-generated_.ts',
  BUILD_INFO_AUTO_GENERATED_JS = 'build-info._auto-generated_.js',
  MIGRATIONS_INFO_MD = 'migrations-info.md',
  MOCHA_TESTS_INFO_MD = 'mocha-tests-info.md',
  SHARED_FOLDER_INFO_TXT = 'shared_folder_info.txt',
  APP_HOSTS_TS = 'app.hosts.ts',
  LAUNCH_JSON = 'launch.json',
  LAUNCH_BACKUP_JSON = 'launch-backup.json',
  VARS_SCSS = 'vars.scss',
  LIB_INFO_MD = 'lib-info.md',
  APP_FOLDER_INFO_MD = 'app-folder-info.md',
}

export const DS_Store = '.DS_Store';

export enum TaonGeneratedFolders {
  ENV_FOLDER = 'env',
  COMPILED = 'compiled',
}

export const splitNamespacesJson = 'split-namespaces.json';

export const reExportJson = 're-export.json';

/**
 * Main project /dist folder
 */
export const nodeModulesMainProject = folderName.node_modules;

/**
 * Main project /dist-nocutsrc folder (d.ts files without code cutting)
 */
export const distNoCutSrcMainProject = `dist-nocutsrc`;

/**
 * Main project /dist folder
 */
export const distMainProject = folderName.dist;

/**
 * Vscode project dist folder
 */
export const distVscodeProj = folderName.dist;

/**
 * Electron project dist folder
 */
export const distElectronProj = folderName.dist;

/**
 * Normal angular app build
 */
export const distFromNgBuild = folderName.dist;

/**
 * Dist from sass loader
 */
export const distFromSassLoader = folderName.dist;

export const electronNgProj = 'electron';

export const combinedDocsAllMdFilesFolder = `allmdfiles`;

/**
 * Vscode project dist folder
 */
export const outVscodeProj = folderName.out;

/**
 * Main project /docs folder
 */
export const docsMainProject = folderName.docs;

/**
 * Main project /bin folder
 */
export const binMainProject = folderName.bin;

/**
 * Main project /src folder
 */
export const srcMainProject = folderName.src;

/**
 * src from template proxy project
 */
export const srcNgProxyProject = folderName.src;

/**
 * each taon import ends with /src
 */
export const srcFromTaonImport = folderName.src;

/**
 * each taon import ends with /src
 */
export const srcDtsFromNpmPackage = 'src.d.ts';

export const myLibFromNgProject = 'my-lib';

export const externalLibsFromNgProject = 'external-libs';

/**
 * projects/my-lib form angular lib template
 */
export const projectsFromNgTemplate = folderName.projects;

/**
 * @deprecated special place in standalone project for projects
 */
export const projectsFromMainProject = folderName.projects;

/**
 * Main project app folder from /src/app folder
 */
export const appFromSrc = folderName.app;

/**
 * Generated app inside angular app (comes from /src/app folder)
 */
export const appFromSrcInsideNgApp = folderName.app;

export const libTypeString = folderName.lib;

export const browserTypeString = folderName.browser;

export const websqlTypeString = folderName.websql;

/**
 * Main project lib folder from /src/lib folder
 */
export const libFromSrc = folderName.lib;

/**
 * Lib from taon import
 */
export const libFromImport = folderName.lib;

/**
 * Lib from dist/lib
 */
export const libFromCompiledDist = folderName.lib;

/**
 * Lib from npm packages
 */
export const libFromNpmPackage = folderName.lib;

/**
 * lib from ng projects
 */
export const libFromNgProject = folderName.lib;

/**
 * Main project tests folder from /src/tests folder
 */
export const testsFromSrc = folderName.tests;

/**
 * Main project assets from /src/assets folder
 */
export const assetsFromSrc = folderName.assets;

/**
 * Assets stored in taon isomorphic npm package with
 */
export const assetsFromNpmLib = folderName.assets;

/**
 * Main project assets from /tmp-*\/src/assets folder
 */
export const assetsFromTempSrc = folderName.assets;

/**
 * Assets from ng template project
 */
export const assetsFromNgProj = folderName.assets;

/**
 * Assets from npm package
 */
export const assetsFromNpmPackage = folderName.assets;

/**
 * Shared from assets from /src/assets/shared folder
 */
export const sharedFromAssets = folderName.shared;

/**
 * Generated folder in assets from /src/assets/generated folder
 */
export const generatedFromAssets = folderName.generated;

/**
 * Generated pwa assets from /src/assets/generated/pwa folder
 */
export const pwaGeneratedFolder = 'pwa';

/**
 * Generated assets-for folder
 */
export const assetsFor = 'assets-for';

/**
 * @deprecated it was probably needed for old container build
 * Folder for all browser libs
 */
export const libs = folderName.libs;

export enum BundledFiles {
  CNAME = 'CNAME',
  README_MD = 'README.md',
  CLI_README_MD = 'CLI-README.md',
  INDEX_HTML = 'index.html',
}

export enum AngularJsonAppOrElectronTaskName {
  developmentSsr = 'development',
  productionSsr = 'production',
  developmentStatic = 'development-static',
  productionStatic = 'production-static',
}

export const AngularJsonAppOrElectronTaskNameResolveFor = (
  envOptions: EnvOptions,
): AngularJsonAppOrElectronTaskName => {
  if (envOptions.build.websql || !envOptions.build.ssr) {
    if (!envOptions.build.watch && !!envOptions.release.releaseType) {
      return AngularJsonAppOrElectronTaskName.productionStatic;
    } else {
      return AngularJsonAppOrElectronTaskName.developmentStatic;
    }
  } else {
    if (!envOptions.build.watch && !!envOptions.release.releaseType) {
      return AngularJsonAppOrElectronTaskName.productionSsr;
    } else {
      return AngularJsonAppOrElectronTaskName.developmentSsr;
    }
  }
};

export enum AngularJsonLibTaskName {
  development = 'development',
  production = 'production',
}

export const AngularJsonLibTaskNameResolveFor = (
  envOptions: EnvOptions,
): AngularJsonLibTaskName => {
  if (!envOptions.build.watch && !!envOptions.release.releaseType) {
    return AngularJsonLibTaskName.production;
  } else {
    return AngularJsonLibTaskName.development;
  }
};

export enum BundledDocsFolders {
  VERSION = 'version',
}

export enum TaonCommands {
  NPM_RUN_NG = 'npm-run ng',
  NG = 'ng',
}

export const appTsFromSrc = 'app.ts';

export const appScssFromSrc = 'app.scss';

export const globalScssFromSrc = 'global.scss';

export const ngProjectStylesScss = 'styles.scss';

export const appElectronTsFromSrc = 'app.electron.ts';

export const appVscodeTsFromSrc = 'app.vscode.ts';

export const appVscodeJSFromBuild = 'app.vscode.js';

export enum TaonFileExtension {
  DOT_WORKER_TS = '.worker.ts',
  DOT_CONTEXT_TS = '.context.ts',
}

/**
 * ng build for library from /src/lib
 */
export const tmpLibsForDist = 'tmp-libs-for-dist';
/**
 * ng build for library from /src/lib (websql code)
 */
export const tmpLibsForDistWebsql = 'tmp-libs-for-dist-websql';

/**
 * normal angular app build
 */
export const tmpAppsForDist = 'tmp-apps-for-dist';
/**
 * websql angular app build
 */
export const tmpAppsForDistWebsql = 'tmp-apps-for-dist-websql';
/**
 * electron angular app build
 */
export const tmpAppsForDistElectron = `tmp-apps-for-dist-electron`;

export const tmpAppsForDistElectronWebsql = `tmp-apps-for-dist-websql-electron`;

/**
 * Dummy auto generated /src/index.ts
 */
export const indexTsFromSrc = fileName.index_ts;

/**
 * Entry point for angular lib from /src/lib/index.ts
 */
export const indexTsFromLibFromSrc = fileName.index_ts;

/**
 * Entry point for scss from /src/index.scss
 */
export const indexScssFromSrc = fileName.index_ts;

/**
 * Index for autogenerated migrations /src/migrations/index.ts
 */
export const indexTsFromMigrationsFromSrc = fileName.index_ts;

/**
 * Entry point for scss from /src/lib/index.scss
 */
export const indexScssFromSrcLib = 'index.scss';

/**
 *
 * @param appForLib if true code is for angular (ng server/build) app build, false for lib ng build
 * @param websql if true websql version
 * @returns relative path to temp browser source folder
 */
export function tempSourceFolder(
  appForLib: boolean,
  websql: boolean,
  prod = false,
): string {
  if (appForLib && websql) {
    return tmpSrcAppDistWebsql + (prod ? prodSuffix : '');
  }
  if (appForLib && !websql) {
    return tmpSrcAppDist + (prod ? prodSuffix : '');
  }
  if (!appForLib && websql) {
    return tmpSrcDistWebsql + (prod ? prodSuffix : '');
  }
  if (!appForLib && !websql) {
    return tmpSrcDist + (prod ? prodSuffix : '');
  }
} // ok for prod

export const ENV_INJECT_COMMENT = '<!--ENV_INJECT-->';
export const isomorphicPackagesJsonKey = 'isomorphicPackages';

export const browserMainProject = folderName.browser;
export const browserFromCompiledDist = folderName.browser;
export const browserNgBuild = folderName.browser;
export const browserFromImport = folderName.browser;
export const browserNpmPackage = folderName.browser;
export const websqlMainProject = folderName.websql;

export const websqlFromCompiledDist = folderName.websql;
export const websqlFromImport = folderName.websql;

export const websqlNpmPackage = folderName.websql;

export const clientCodeVersionFolder = [browserMainProject, websqlMainProject];

export const notAllowedAsPacakge = [...clientCodeVersionFolder, assetsFromSrc];

export const MESSAGES = {
  SHUT_DOWN_FOLDERS_AND_DEBUGGERS:
    'Please shut down your code debugger and any open windows from node_modules and press any key...',
};

export const localReleaseMainProject = 'local_release';

export const dotInstallDate = '.install-date';

export const dotVscodeMainProject = '.vscode';

export const packageJsonLockMainProject = fileName.package_lock_json;

export const yarnLockMainProject = fileName.yarn_lock;

export const packageJsonMainProject = fileName.package_json;

export const packageJsonNpmLib = fileName.package_json;

export const packageJsonVscodePlugin = fileName.package_json;

export const packageJsonNpmLibAngular = fileName.package_json;

export const packageJsonNgProject = fileName.package_json;

export const packageJsonLibDist = fileName.package_json;

export const tsconfigJsonMainProject = 'tsconfig.json';
export const tsconfigNgProject = 'tsconfig.json';

export const tsconfigSpecNgProject = 'tsconfig.spec.json';

export const tsconfigForUnitTestsNgProject = 'tsconfig.spec-for-unit.json';

/**
 * TODO not used?
 */
export const tsconfigJsonBrowserMainProject = 'tsconfig.browser.json';

export const tsconfigBackendDistJson = 'tsconfig.backend.dist.json';

export const tsconfigBackendDistJson_PROD = 'tsconfig.backend.dist.prod.json';

export const tsconfigForSchemaJson = 'tsconfig-for-schema.json';

export const tsconfigJsonIsomorphicMainProject = 'tsconfig.isomorphic.json';

export const dotNpmrcMainProject = fileName._npmrc;

export const dotGitIgnoreMainProject = fileName._gitignore;

export const dotNpmIgnoreMainProject = fileName._npmignore;

export const webpackConfigJsMainProject = 'webpack.config.js';

export const esLintCustomRulesMainProject = 'eslint-rules';
export const esLintConfigJsonMainProject = 'eslint.config.ts';
export const esLintRuleNoNamespaceReExport =
  'eslint-rules/no-namespace-reexport.ts';

export const runJsMainProject = 'run.js';

export const indexDtsMainProject = fileName.index_d_ts;

export const indexDtsNpmPackage = fileName.index_d_ts;

export const indexJSNpmPackage = fileName.index_js;

export const indexJSElectronDist = fileName.index_js;

export const indexTsProd = 'index-prod.ts';

export const cliTsFromSrc = 'cli.ts';

export const cliJSNpmPackage = 'cli.js';

export const cliJSMapNpmPackage = 'cli.js.map';

export const cliDtsNpmPackage = 'cli.d.js';

export const indexJsMainProject = fileName.index_js;

export const indexJsMapMainProject = fileName.index_js_map;

export const sourceLinkInNodeModules = folderName.source;

export const taonJsonMainProject = fileName.taon_jsonc;

export const updateVscodePackageJsonJsMainProject =
  'update-vscode-package-json.js';

export const routes = TaonTempRoutesFolder;

export const databases = TaonTempDatabasesFolder;

export const dotFileTemplateExt = '.filetemplate';

export const dotEnvFile = '.env';

export const suffixLatest = '-latest';
export const prodSuffix = '-prod';

export const releaseSuffix = '-release';

export const debugSuffix = '--debug';

export const debugBrkSuffix = '--debug-brk';

export const inspectSuffix = '--inspect';

export const inspectBrkSuffix = '--inspect-brk';

export const containerPrefix = 'container-';

export const testEnvironmentsMainProject = folderName.testsEnvironments;

export const ONLY_COPY_ALLOWED = [
  // 'background-worker-process',
  'better-sqlite3',
  '.bin',
  '.install-date',
];

/**
 * to prevent lib error when building with asserts
 */
export const TO_REMOVE_TAG = `/${'TO_REMOVE'
  .split('')
  .map(c => ___NS__times(8, () => c).join(''))
  .join('')}`;

export const ERR_MESSAGE_DEPLOYMENT_NOT_FOUND = 'DEPLOYMENT_NOT_FOUND';
export const ERR_MESSAGE_PROCESS_NOT_FOUND = 'PROCESS_NOT_FOUND';
// console.log('TO_REMOVE_TAG', TO_REMOVE_TAG);

export const migrationsFromLib = folderName.migrations;

export const migration_index_autogenerated_ts =
  'migrations_index._auto-generated_.ts';

export const migrationIndexAutogeneratedTsFileRelativeToSrcPath =
  crossPlatformPath([
    libFromSrc,
    migrationsFromLib,
    migration_index_autogenerated_ts,
  ]);