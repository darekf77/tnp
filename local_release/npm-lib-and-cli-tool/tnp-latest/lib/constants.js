"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOST_BACKEND_PORT = exports.TEMP_DOCS = exports.taonConfigSchemaJsonContainer = exports.taonConfigSchemaJsonStandalone = exports.folder_shared_folder_info = exports.websqlPrefix = exports.linuxWatchPrefix = exports.spinnerPrefix = exports.verbosePrefix = exports.argsToClear = exports.skipCoreCheck = exports.taonBasePathToGlobalDockerTemplates = exports.taonRepoPathUserInUserDir = exports.DEFAULT_FRAMEWORK_VERSION = exports.COMPILATION_COMPLETE_TSC = exports.COMPILATION_COMPLETE_APP_NG_SERVE = exports.COMPILATION_COMPLETE_LIB_NG_BUILD = exports.USE_MIGRATIONS_DATA_IN_HOST_CONFIG = exports.INTEGRATION_TEST_TIMEOUT = exports.UNIT_TEST_TIMEOUT = exports.taonUsingBundledCliMode = exports.MIGRATION_CONST_PREFIX = exports.USE_IN_HOST_CONFIG_FULL_CONTEXT_PATH = exports.succeedSpinner = exports.failSpinner = exports.stopSpinner = exports.startSpinner = exports.globalSpinner = exports.OVERRIDE_FROM_TNP = exports.defaultLicenseVscodePlugin = exports.THIS_IS_GENERATED_INFO_COMMENT = exports.THIS_IS_GENERATED_STRING = exports.scriptsCommands = exports.GENERATE_CMD_COPY_TO_AI = exports.DEBUG_WORD = exports.taonIgnore = exports.startTsFromLib = exports.startJsFromBin = exports.iconVscode128Basename = exports.friendlyNameForReleaseAutoConfigIsRequired = exports.ACTIVE_CONTEXT = exports.DOCKER_TEMPLATES = exports.BASE_TEMP_DOCKER_FOLDER = exports.DOCKER_FOLDER = exports.DOCKER_COMPOSE_FILE_NAME = exports.DUMMY_LIB = exports.dirnameFromSourceToProject = exports.keysMap = exports.whatToLinkFromCoreDeepPart = exports.whatToLinkFromCore = void 0;
exports.reExportJson = exports.splitNamespacesJson = exports.TaonGeneratedFolders = exports.DS_Store = exports.TaonGeneratedFiles = exports.CoreNgTemplateFiles = exports.DockerTemplatesFolders = exports.dockerTemplatesFolder = exports.CoreAssets = exports.AngularJsonTaskName = exports.TemplateFolder = exports.TempalteSubprojectTypeGroup = exports.TempalteSubprojectGroup = exports.TemplateSubprojectDbPrefix = exports.TempalteSubprojectTypeArr = exports.TempalteSubprojectType = exports.mainProjectSubProjects = exports.defaultConfiguration = exports.tmpSrcAppDistWebsql = exports.tmpSrcAppDist = exports.tmpSrcDistWebsql = exports.tmpSrcDist = exports.tmpSourceDistWebsql = exports.tmpSourceDist = exports.tmpVscodeProj = exports.tmpBaseHrefOverwrite = exports.tmpCutReleaseSrcDistWebsql = exports.tmpCutReleaseSrcDist = exports.tmpLocalCopytoProjDist = exports.tmpAllAssetsLinked = exports.tmpAlreadyStartedCopyManager = exports.tmpIsomorphicPackagesJson = exports.readmeMdMainProject = exports.result_packages_json = exports.coreRequiredEnvironments = exports.environmentsFolder = exports.envTs = exports.frameworkBuildFolders = exports.customDefaultJs = exports.customDefaultCss = exports.docsConfigSchema = exports.docsConfigJsonFileName = exports.DEFAULT_PORT = exports.tmp_FRONTEND_NORMAL_ELECTRON_PORT = exports.FRONTEND_NORMAL_ELECTRON_PORT = exports.tmp_FRONTEND_NORMAL_APP_PORT = exports.FRONTEND_NORMAL_APP_PORT = exports.tmp_FRONTEND_WEBSQL_APP_PORT = exports.FRONTEND_WEBSQL_APP_PORT = exports.tmp_HOST_BACKEND_PORT = void 0;
exports.TaonCommands = exports.BundledDocsFolders = exports.AngularJsonLibTaskNameResolveFor = exports.AngularJsonLibTaskName = exports.AngularJsonAppOrElectronTaskNameResolveFor = exports.AngularJsonAppOrElectronTaskName = exports.BundledFiles = exports.libs = exports.assetsFor = exports.pwaGeneratedFolder = exports.generatedFromAssets = exports.sharedFromAssets = exports.assetsFromNpmPackage = exports.assetsFromNgProj = exports.assetsFromTempSrc = exports.assetsFromNpmLib = exports.assetsFromSrc = exports.testsFromSrc = exports.libFromNgProject = exports.libFromNpmPackage = exports.libFromCompiledDist = exports.libFromImport = exports.libFromSrc = exports.websqlTypeString = exports.browserTypeString = exports.libTypeString = exports.appFromSrcInsideNgApp = exports.appFromSrc = exports.projectsFromMainProject = exports.projectsFromNgTemplate = exports.externalLibsFromNgProject = exports.myLibFromNgProject = exports.srcJSFromNpmPackage = exports.srcDtsFromNpmPackage = exports.srcFromTaonImport = exports.srcNgProxyProject = exports.srcMainProject = exports.binMainProject = exports.docsMainProject = exports.outVscodeProj = exports.combinedDocsAllMdFilesFolder = exports.electronNgProj = exports.distFromSassLoader = exports.distFromNgBuild = exports.distElectronProj = exports.distVscodeProj = exports.distMainProject = exports.distNoCutSrcMainProject = exports.nodeModulesSubPorject = exports.nodeModulesMainProject = void 0;
exports.packageJsonNpmLibAngular = exports.packageJsonVscodePlugin = exports.packageJsonNpmLib = exports.packageJsonSubProject = exports.packageJsonMainProject = exports.yarnLockMainProject = exports.packageJsonLockSubProject = exports.packageJsonLockMainProject = exports.wranglerJsonC = exports.indexTsInSrcForWorker = exports.dotVscodeMainProject = exports.KV_DATABASE_ONLINE_NAME = exports.dotInstallDate = exports.localReleaseMainProject = exports.MESSAGES = exports.notAllowedAsPacakge = exports.clientCodeVersionFolder = exports.websqlNpmPackage = exports.websqlFromImport = exports.websqlFromCompiledDist = exports.websqlMainProject = exports.browserNpmPackage = exports.browserFromImport = exports.browserNgBuild = exports.browserFromCompiledDist = exports.browserMainProject = exports.isomorphicPackagesJsonKey = exports.ENV_INJECT_COMMENT = exports.indexScssFromSrcLib = exports.indexTsFromMigrationsFromSrc = exports.indexScssFromSrc = exports.indexTsFromLibFromSrc = exports.indexTsFromSrc = exports.tmpAppsForDistElectronWebsql = exports.tmpAppsForDistElectron = exports.tmpAppsForDistWebsql = exports.tmpAppsForDist = exports.tmpLibsForDistWebsql = exports.tmpLibsForDist = exports.TaonFileExtension = exports.appVscodeJSFromBuild = exports.appVscodeTsFromSrc = exports.appElectronTsFromSrc = exports.ngProjectStylesScss = exports.globalScssFromSrc = exports.appScssFromSrc = exports.appJsBackend = exports.appAutoGenJs = exports.appAutoGenDocsMd = exports.appTsFromSrc = void 0;
exports.ONLY_COPY_ALLOWED = exports.testEnvironmentsMainProject = exports.containerPrefix = exports.inspectBrkSuffix = exports.inspectSuffix = exports.debugBrkSuffix = exports.debugSuffix = exports.releaseSuffix = exports.prodSuffix = exports.suffixLatest = exports.dotEnvFile = exports.dotFileTemplateExt = exports.databases = exports.routes = exports.VERIFIED_BUILD_DATA = exports.updateVscodePackageJsonJsMainProject = exports.taonJsonMainProject = exports.sourceLinkInNodeModules = exports.indexJsMapMainProject = exports.indexJsMainProject = exports.cliDtsNpmPackage = exports.cliJSMapNpmPackage = exports.cliJSNpmPackage = exports.cliTsFromSrc = exports.indexProdJs = exports.indexJSElectronDist = exports.indexJSNpmPackage = exports.indexDtsNpmPackage = exports.indexDtsMainProject = exports.runJsMainProject = exports.esLintRuleNoNamespaceReExport = exports.vitestConfigJsonMainProject = exports.esLintConfigJsonMainProject = exports.esLintCustomRulesMainProject = exports.webpackConfigJsMainProject = exports.dotNpmIgnoreMainProject = exports.dotGitIgnoreMainProject = exports.dotNpmrcMainProject = exports.tsconfigJsonIsomorphicMainProject = exports.tsconfigForSchemaJson = exports.tsconfigBackendDistJson_PROD = exports.tsconfigBackendDistJson = exports.tsconfigJsonBrowserMainProject = exports.tsconfigSpecJsonMain = exports.tsconfigSpecNgProject = exports.tsconfigSubProject = exports.tsconfigNgProject = exports.tsconfigJsonMainProject = exports.packageJsonLibDist = exports.packageJsonNgProject = void 0;
exports.migrationIndexAutogeneratedTsFileRelativeToSrcPath = exports.migration_index_autogenerated_ts = exports.migrationsFromLib = exports.ERR_MESSAGE_PROCESS_NOT_FOUND = exports.ERR_MESSAGE_DEPLOYMENT_NOT_FOUND = exports.TO_REMOVE_TAG = void 0;
exports.tempSourceFolder = tempSourceFolder;
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-core/lib");
const build_info__auto_generated_1 = require("./build-info._auto-generated_");
// import type { Project } from './project/abstract/project';
//#endregion
exports.whatToLinkFromCore = 'src/lib';
// export const whatToLinkFromCore: 'src' | 'src/lib' = 'src/lib';
/**
 *  '' - when whatToLinkFromCore is src
 *  'lib' - when whatToLinkFromCore is src/lib
 *  'deep/folder' - when whatToLinkFromCore is src/deep/folder
 */
exports.whatToLinkFromCoreDeepPart = exports.whatToLinkFromCore === 'src'
    ? ''
    : exports.whatToLinkFromCore.replace('src/', '');
exports.keysMap = {
    destinationDomain: 'dn',
    projectName: 'pn',
    releaseType: 'rt',
    version: 'ver',
    envName: 'enm',
    envNumber: 'enu',
    targetArtifact: 'ta',
};
const dirnameFromSourceToProject = (linkToSource) => {
    const orgParamLinkAbs = linkToSource;
    linkToSource = lib_3.fse.realpathSync(linkToSource);
    linkToSource = (0, lib_5.crossPlatformPath)(linkToSource);
    const orgRealLinkToSource = linkToSource;
    const howManyDirname = exports.whatToLinkFromCore.split('/').length;
    lib_4._.times(howManyDirname, n => {
        // console.log(`dirname action ${n}/${howManyDirname}`);
        linkToSource = (0, lib_5.crossPlatformPath)(lib_5.path.dirname(linkToSource));
    });
    linkToSource = (0, lib_5.crossPlatformPath)(linkToSource);
    // console.log({ linkToSource, orgRealLinkToSource, howManyDirname });
    if (lib_5.path.basename(linkToSource) === 'src') {
        // console.log(`FIXING NOT PROPER LINK TO SOURCE ${orgParamLinkAbs}`);
        linkToSource = (0, lib_5.crossPlatformPath)(lib_5.path.dirname(linkToSource));
        // if (whatToLinkFromCore === 'src') {
        //   try {
        //     fse.unlinkSync(orgParamLinkAbs);
        //   } catch (error) {}
        //   Helpers.createSymLink(
        //     crossPlatformPath([linkToSource, whatToLinkFromCore]),
        //     orgParamLinkAbs,
        //   );
        // }
        // linkToSource = crossPlatformPath(path.dirname(linkToSource));
    }
    return linkToSource;
};
exports.dirnameFromSourceToProject = dirnameFromSourceToProject;
exports.DUMMY_LIB = '@lib';
exports.DOCKER_COMPOSE_FILE_NAME = 'docker-compose.yml';
exports.DOCKER_FOLDER = 'docker';
exports.BASE_TEMP_DOCKER_FOLDER = 'tmp-docker';
exports.DOCKER_TEMPLATES = 'docker-templates';
exports.ACTIVE_CONTEXT = 'ACTIVE_CONTEXT';
exports.friendlyNameForReleaseAutoConfigIsRequired = false;
exports.iconVscode128Basename = 'icon-vscode.png';
exports.startJsFromBin = 'start.js';
exports.startTsFromLib = 'start-cli.ts';
exports.taonIgnore = '@taon' + '-' + 'ignore';
exports.DEBUG_WORD = 'Debug/Start';
exports.GENERATE_CMD_COPY_TO_AI = 'generate-cmd-copy-to-ai';
exports.scriptsCommands = [
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
exports.THIS_IS_GENERATED_STRING = `THIS FILE IS GENERATED - DO NOT MODIFY`;
exports.THIS_IS_GENERATED_INFO_COMMENT = `// ${exports.THIS_IS_GENERATED_STRING}`;
exports.defaultLicenseVscodePlugin = 'MIT';
exports.OVERRIDE_FROM_TNP = [
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
exports.globalSpinner = {
    get instance() {
        //#region @backendFunc
        return global.spinner;
        //#endregion
    },
};
exports.startSpinner = 'start-spinner';
exports.stopSpinner = 'stop-spinner';
exports.failSpinner = 'fail-spinner';
exports.succeedSpinner = 'succeed-spinner';
exports.USE_IN_HOST_CONFIG_FULL_CONTEXT_PATH = false;
exports.MIGRATION_CONST_PREFIX = 'MIGRATIONS_CLASSES_FOR_';
let taonUsingBundledCliMode = false;
exports.taonUsingBundledCliMode = taonUsingBundledCliMode;
//#region @backend
exports.taonUsingBundledCliMode = taonUsingBundledCliMode = !!global.taonUsingBundledCliMode;
exports.UNIT_TEST_TIMEOUT = 30000;
exports.INTEGRATION_TEST_TIMEOUT = 30000;
exports.USE_MIGRATIONS_DATA_IN_HOST_CONFIG = false;
exports.COMPILATION_COMPLETE_LIB_NG_BUILD = 'Compilation complete. Watching for file changes';
exports.COMPILATION_COMPLETE_APP_NG_SERVE = 'Compiled successfully';
exports.COMPILATION_COMPLETE_TSC = 'Found 0 errors. Watching for file changes';
// TODO get this from cli, global
exports.DEFAULT_FRAMEWORK_VERSION = `v${build_info__auto_generated_1.CURRENT_PACKAGE_VERSION.split('.')[0]}`;
let taonRepoPathUserInUserDir = '';
exports.taonRepoPathUserInUserDir = taonRepoPathUserInUserDir;
//#region @backend
exports.taonRepoPathUserInUserDir = taonRepoPathUserInUserDir = (0, lib_5.crossPlatformPath)([
    lib_4.UtilsOs.getRealHomeDir(),
    lib_2.dotTaonFolder,
    lib_2.taonContainers,
]);
//#endregion
const taonBasePathToGlobalDockerTemplates = (0, lib_5.crossPlatformPath)([
    lib_4.UtilsOs.getRealHomeDir(),
    lib_2.dotTaonFolder,
    lib_2.dockerTemplates,
]);
exports.taonBasePathToGlobalDockerTemplates = taonBasePathToGlobalDockerTemplates;
/**
 * Prevents taon from checking core container when
 * calling itself from child process
 */
exports.skipCoreCheck = '--skipCoreCheck';
exports.argsToClear = [
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
exports.verbosePrefix = '-verbose';
exports.spinnerPrefix = '-spinner';
exports.linuxWatchPrefix = '-linuxWatch';
exports.websqlPrefix = '-websql';
exports.folder_shared_folder_info = 'shared_folder_info.txt';
exports.taonConfigSchemaJsonStandalone = 'taon-config-standalone.schema.json';
exports.taonConfigSchemaJsonContainer = 'taon-config-container.schema.json';
exports.TEMP_DOCS = 'tmp-documentation';
const libsAppPortsFolder = 'libs-apps-ports';
exports.HOST_BACKEND_PORT = 'HOST_BACKEND_PORT';
exports.tmp_HOST_BACKEND_PORT = `${lib_2.dotTaonFolder}/${libsAppPortsFolder}/${exports.HOST_BACKEND_PORT}`;
exports.FRONTEND_WEBSQL_APP_PORT = 'FRONTEND_WEBSQL_APP_PORT';
exports.tmp_FRONTEND_WEBSQL_APP_PORT = `${lib_2.dotTaonFolder}/${libsAppPortsFolder}/${exports.FRONTEND_WEBSQL_APP_PORT}`;
exports.FRONTEND_NORMAL_APP_PORT = 'FRONTEND_NORMAL_APP_PORT';
exports.tmp_FRONTEND_NORMAL_APP_PORT = `${lib_2.dotTaonFolder}/${libsAppPortsFolder}/${exports.FRONTEND_NORMAL_APP_PORT}`;
exports.FRONTEND_NORMAL_ELECTRON_PORT = 'FRONTEND_NORMAL_ELECTRON_PORT';
exports.tmp_FRONTEND_NORMAL_ELECTRON_PORT = `${lib_2.dotTaonFolder}/${libsAppPortsFolder}/${exports.FRONTEND_NORMAL_ELECTRON_PORT}`;
exports.DEFAULT_PORT = {
    DIST_SERVER_DOCS: 4000,
    APP_BUILD_LOCALHOST: 4200,
    SERVER_LOCALHOST: 4100,
    DEBUGGING_CLI_TOOL: 9222,
    DEBUGGING_ELECTRON: 9888,
};
exports.docsConfigJsonFileName = 'docs-config.jsonc';
exports.docsConfigSchema = 'docs-config.schema.json';
exports.customDefaultCss = 'custom-default.css';
exports.customDefaultJs = 'custom-default.js';
exports.frameworkBuildFolders = lib_5.Utils.uniqArray([
    'firedev',
    'taon',
    'tnp',
    `${lib_2.config.frameworkName}`,
])
    .filter(f => !!f)
    .map(f => `.${f}`);
exports.envTs = 'env.ts';
exports.environmentsFolder = 'environments';
exports.coreRequiredEnvironments = [
    '__',
    'prod',
];
/**
 * @deprecated not needed probably
 */
exports.result_packages_json = 'result-packages.json';
exports.readmeMdMainProject = 'README.md';
exports.tmpIsomorphicPackagesJson = 'tmp-isomorphic-packages.json';
/**
 * If exist - copy manager will clean copy bundled package to destinations
 */
exports.tmpAlreadyStartedCopyManager = 'tmp-already-started-copy-manager'; // not for prod
exports.tmpAllAssetsLinked = 'tmp-all-assets-linked'; // not for prod
/**
 * Destination place for all taon processes (tsc, ng build, etc)
 * From this folder code is copied to final destinations node_modules
 */
exports.tmpLocalCopytoProjDist = 'tmp-local-copyto-proj-dist'; // not for prod
/**
 * Folder where tmpSrdDist code is cutted file by file before publishing
 */
exports.tmpCutReleaseSrcDist = 'tmp-cut-release-src-dist'; // not for prod
/**
 * Folder where tmpSrdDist code is cutted file by file before publishing (websql version)
 */
exports.tmpCutReleaseSrcDistWebsql = 'tmp-cut-release-src-dist-websql'; // not for prod
/**
 * Temporary folder for base href overwrite during build
 * (taon library build sets it)
 */
exports.tmpBaseHrefOverwrite = 'tmp-base-href-overwrite';
/**
 * Temporary folder for vscode project files
 */
exports.tmpVscodeProj = `tmp-vscode-proj`;
/**
 * Taon code transformed for backend
 */
exports.tmpSourceDist = 'tmp-source-dist'; // ok for prod
/**
 * Taon code transformed for backend in websql mode
 * (this code is probably never used)
 */
exports.tmpSourceDistWebsql = 'tmp-source-dist-websql'; // ok for prod
/**
 * Taon code transformed for browser
 */
exports.tmpSrcDist = 'tmp-src-dist'; // ok for prod
/**
 * Taon code transformed for browser in websql mode
 */
exports.tmpSrcDistWebsql = 'tmp-src-dist-websql'; // ok for prod
/**
 * Taon code transformed for browser (angular app uses this)
 */
exports.tmpSrcAppDist = 'tmp-src-app-dist'; // ok for prod
/**
 * Taon code transformed for browser (angular app in websql uses this)
 */
exports.tmpSrcAppDistWebsql = 'tmp-src-app-dist-websql'; // ok for prod
exports.defaultConfiguration = 'defaultConfiguration';
exports.mainProjectSubProjects = 'sub-projects';
var TempalteSubprojectType;
(function (TempalteSubprojectType) {
    TempalteSubprojectType["TAON_STRIPE_CLOUDFLARE_WORKER"] = "taon-stripe-cloudflare-worker";
    TempalteSubprojectType["TAON_YT_CLOUDFLARE_WORKER"] = "taon-yt-cloudflare-worker";
})(TempalteSubprojectType || (exports.TempalteSubprojectType = TempalteSubprojectType = {}));
exports.TempalteSubprojectTypeArr = [
    TempalteSubprojectType.TAON_STRIPE_CLOUDFLARE_WORKER,
    TempalteSubprojectType.TAON_YT_CLOUDFLARE_WORKER,
];
exports.TemplateSubprojectDbPrefix = {
    [TempalteSubprojectType.TAON_STRIPE_CLOUDFLARE_WORKER]: 'SALES_KV',
    [TempalteSubprojectType.TAON_YT_CLOUDFLARE_WORKER]: 'YT_DATA_KV',
};
var TempalteSubprojectGroup;
(function (TempalteSubprojectGroup) {
    TempalteSubprojectGroup["KEY_VALUE_FAST_WORKER_DATABASE"] = "key-value-fast-worker-database";
})(TempalteSubprojectGroup || (exports.TempalteSubprojectGroup = TempalteSubprojectGroup = {}));
exports.TempalteSubprojectTypeGroup = {
    [TempalteSubprojectType.TAON_STRIPE_CLOUDFLARE_WORKER]: TempalteSubprojectGroup.KEY_VALUE_FAST_WORKER_DATABASE,
    [TempalteSubprojectType.TAON_YT_CLOUDFLARE_WORKER]: TempalteSubprojectGroup.KEY_VALUE_FAST_WORKER_DATABASE,
};
/**
 * template folders from isomorphic lib
 */
var TemplateFolder;
(function (TemplateFolder) {
    /**
     * Core project for angular app webapp, library and electron app
     */
    TemplateFolder["templateApp"] = "template-app";
    TemplateFolder["templatesSubprojects"] = "templates-subprojects";
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
})(TemplateFolder || (exports.TemplateFolder = TemplateFolder = {}));
var AngularJsonTaskName;
(function (AngularJsonTaskName) {
    AngularJsonTaskName["ANGULAR_APP"] = "app";
    AngularJsonTaskName["ELECTRON_APP"] = "angular-electron";
})(AngularJsonTaskName || (exports.AngularJsonTaskName = AngularJsonTaskName = {}));
var CoreAssets;
(function (CoreAssets) {
    CoreAssets["sqlWasmFile"] = "sql-wasm.wasm";
    CoreAssets["mainFont"] = "flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2";
})(CoreAssets || (exports.CoreAssets = CoreAssets = {}));
exports.dockerTemplatesFolder = 'docker-templates';
var DockerTemplatesFolders;
(function (DockerTemplatesFolders) {
    DockerTemplatesFolders["ANGULAR_APP_NODE"] = "angular-app-node";
    DockerTemplatesFolders["ANGULAR_APP_SSR_NODE"] = "angular-app-ssr-node";
    DockerTemplatesFolders["BACKEND_APP_NODE"] = "backend-app-node";
    DockerTemplatesFolders["DATABASE_MYSQL"] = "database-mysql";
})(DockerTemplatesFolders || (exports.DockerTemplatesFolders = DockerTemplatesFolders = {}));
var CoreNgTemplateFiles;
(function (CoreNgTemplateFiles) {
    CoreNgTemplateFiles["sqlJSLoaderTs"] = "sqljs-loader.ts";
    CoreNgTemplateFiles["SERVER_TS"] = "server.ts";
    CoreNgTemplateFiles["JEST_CONFIG_JS"] = "jest.config.js";
    CoreNgTemplateFiles["SETUP_JEST_TS"] = "setupJest.ts";
    CoreNgTemplateFiles["JEST_GLOBAL_MOCKS_TS"] = "jestGlobalMocks.ts";
    CoreNgTemplateFiles["NG_PACKAGE_JSON"] = "ng-package.json";
    CoreNgTemplateFiles["PACKAGE_JSON"] = "package.json";
    CoreNgTemplateFiles["ANGULAR_JSON"] = "angular.json";
    CoreNgTemplateFiles["INDEX_HTML_NG_APP"] = "index.html";
    CoreNgTemplateFiles["FAVICON_ICO"] = "favicon.ico";
    CoreNgTemplateFiles["WEBMANIFEST_JSON"] = "manifest.webmanifest";
})(CoreNgTemplateFiles || (exports.CoreNgTemplateFiles = CoreNgTemplateFiles = {}));
var TaonGeneratedFiles;
(function (TaonGeneratedFiles) {
    TaonGeneratedFiles["BUILD_INFO_MD"] = "BUILD-INFO.md";
    TaonGeneratedFiles["build_info_generated_ts"] = "build-info._auto-generated_.ts";
    TaonGeneratedFiles["index_generated_ts"] = "index._auto-generated_.ts";
    TaonGeneratedFiles["BUILD_INFO_AUTO_GENERATED_JS"] = "build-info._auto-generated_.js";
    TaonGeneratedFiles["MIGRATIONS_INFO_MD"] = "migrations-info.md";
    TaonGeneratedFiles["MOCHA_TESTS_INFO_MD"] = "mocha-tests-info.md";
    TaonGeneratedFiles["SHARED_FOLDER_INFO_TXT"] = "shared_folder_info.txt";
    TaonGeneratedFiles["APP_HOSTS_TS"] = "app.hosts.ts";
    TaonGeneratedFiles["LAUNCH_JSON"] = "launch.json";
    TaonGeneratedFiles["LAUNCH_BACKUP_JSON"] = "launch-backup.json";
    TaonGeneratedFiles["VARS_SCSS"] = "vars.scss";
    TaonGeneratedFiles["LIB_INFO_MD"] = "lib-info.md";
    TaonGeneratedFiles["APP_FOLDER_INFO_MD"] = "app-folder-info.md";
})(TaonGeneratedFiles || (exports.TaonGeneratedFiles = TaonGeneratedFiles = {}));
exports.DS_Store = '.DS_Store';
var TaonGeneratedFolders;
(function (TaonGeneratedFolders) {
    TaonGeneratedFolders["ENV_FOLDER"] = "env";
    TaonGeneratedFolders["COMPILED"] = "compiled";
})(TaonGeneratedFolders || (exports.TaonGeneratedFolders = TaonGeneratedFolders = {}));
exports.splitNamespacesJson = 'split-namespaces.json';
exports.reExportJson = 're-export.json';
/**
 * Main project /dist folder
 */
exports.nodeModulesMainProject = lib_2.folderName.node_modules;
exports.nodeModulesSubPorject = lib_2.folderName.node_modules;
/**
 * Main project /dist-nocutsrc folder (d.ts files without code cutting)
 */
exports.distNoCutSrcMainProject = `dist-nocutsrc`;
/**
 * Main project /dist folder
 */
exports.distMainProject = lib_2.folderName.dist;
/**
 * Vscode project dist folder
 */
exports.distVscodeProj = lib_2.folderName.dist;
/**
 * Electron project dist folder
 */
exports.distElectronProj = lib_2.folderName.dist;
/**
 * Normal angular app build
 */
exports.distFromNgBuild = lib_2.folderName.dist;
/**
 * Dist from sass loader
 */
exports.distFromSassLoader = lib_2.folderName.dist;
exports.electronNgProj = 'electron';
exports.combinedDocsAllMdFilesFolder = `allmdfiles`;
/**
 * Vscode project dist folder
 */
exports.outVscodeProj = lib_2.folderName.out;
/**
 * Main project /docs folder
 */
exports.docsMainProject = lib_2.folderName.docs;
/**
 * Main project /bin folder
 */
exports.binMainProject = lib_2.folderName.bin;
/**
 * Main project /src folder
 */
exports.srcMainProject = lib_2.folderName.src;
/**
 * src from template proxy project
 */
exports.srcNgProxyProject = lib_2.folderName.src;
/**
 * each taon import ends with /src
 */
exports.srcFromTaonImport = lib_2.folderName.src;
/**
 * each taon import ends with /src
 */
exports.srcDtsFromNpmPackage = 'src.d.ts';
exports.srcJSFromNpmPackage = 'src.js';
exports.myLibFromNgProject = 'my-lib';
exports.externalLibsFromNgProject = 'external-libs';
/**
 * projects/my-lib form angular lib template
 */
exports.projectsFromNgTemplate = lib_2.folderName.projects;
/**
 * @deprecated special place in standalone project for projects
 */
exports.projectsFromMainProject = lib_2.folderName.projects;
/**
 * Main project app folder from /src/app folder
 */
exports.appFromSrc = lib_2.folderName.app;
/**
 * Generated app inside angular app (comes from /src/app folder)
 */
exports.appFromSrcInsideNgApp = lib_2.folderName.app;
exports.libTypeString = lib_2.folderName.lib;
exports.browserTypeString = lib_2.folderName.browser;
exports.websqlTypeString = lib_2.folderName.websql;
/**
 * Main project lib folder from /src/lib folder
 */
exports.libFromSrc = lib_2.folderName.lib;
/**
 * Lib from taon import
 */
exports.libFromImport = lib_2.folderName.lib;
/**
 * Lib from dist/lib
 */
exports.libFromCompiledDist = lib_2.folderName.lib;
/**
 * Lib from npm packages
 */
exports.libFromNpmPackage = lib_2.folderName.lib;
/**
 * lib from ng projects
 */
exports.libFromNgProject = lib_2.folderName.lib;
/**
 * Main project tests folder from /src/tests folder
 */
exports.testsFromSrc = lib_2.folderName.tests;
/**
 * Main project assets from /src/assets folder
 */
exports.assetsFromSrc = lib_2.folderName.assets;
/**
 * Assets stored in taon isomorphic npm package with
 */
exports.assetsFromNpmLib = lib_2.folderName.assets;
/**
 * Main project assets from /tmp-*\/src/assets folder
 */
exports.assetsFromTempSrc = lib_2.folderName.assets;
/**
 * Assets from ng template project
 */
exports.assetsFromNgProj = lib_2.folderName.assets;
/**
 * Assets from npm package
 */
exports.assetsFromNpmPackage = lib_2.folderName.assets;
/**
 * Shared from assets from /src/assets/shared folder
 */
exports.sharedFromAssets = lib_2.folderName.shared;
/**
 * Generated folder in assets from /src/assets/generated folder
 */
exports.generatedFromAssets = lib_2.folderName.generated;
/**
 * Generated pwa assets from /src/assets/generated/pwa folder
 */
exports.pwaGeneratedFolder = 'pwa';
/**
 * Generated assets-for folder
 */
exports.assetsFor = 'assets-for';
/**
 * @deprecated it was probably needed for old container build
 * Folder for all browser libs
 */
exports.libs = lib_2.folderName.libs;
var BundledFiles;
(function (BundledFiles) {
    BundledFiles["CNAME"] = "CNAME";
    BundledFiles["README_MD"] = "README.md";
    BundledFiles["CLI_README_MD"] = "CLI-README.md";
    BundledFiles["INDEX_HTML"] = "index.html";
})(BundledFiles || (exports.BundledFiles = BundledFiles = {}));
var AngularJsonAppOrElectronTaskName;
(function (AngularJsonAppOrElectronTaskName) {
    AngularJsonAppOrElectronTaskName["developmentSsr"] = "development";
    AngularJsonAppOrElectronTaskName["productionSsr"] = "production";
    AngularJsonAppOrElectronTaskName["developmentStatic"] = "development-static";
    AngularJsonAppOrElectronTaskName["productionStatic"] = "production-static";
})(AngularJsonAppOrElectronTaskName || (exports.AngularJsonAppOrElectronTaskName = AngularJsonAppOrElectronTaskName = {}));
const AngularJsonAppOrElectronTaskNameResolveFor = (envOptions) => {
    if (envOptions.build.websql || !envOptions.build.ssr) {
        if (!envOptions.build.watch && !!envOptions.release.releaseType) {
            return AngularJsonAppOrElectronTaskName.productionStatic;
        }
        else {
            return AngularJsonAppOrElectronTaskName.developmentStatic;
        }
    }
    else {
        if (!envOptions.build.watch && !!envOptions.release.releaseType) {
            return AngularJsonAppOrElectronTaskName.productionSsr;
        }
        else {
            return AngularJsonAppOrElectronTaskName.developmentSsr;
        }
    }
};
exports.AngularJsonAppOrElectronTaskNameResolveFor = AngularJsonAppOrElectronTaskNameResolveFor;
var AngularJsonLibTaskName;
(function (AngularJsonLibTaskName) {
    AngularJsonLibTaskName["development"] = "development";
    AngularJsonLibTaskName["production"] = "production";
})(AngularJsonLibTaskName || (exports.AngularJsonLibTaskName = AngularJsonLibTaskName = {}));
const AngularJsonLibTaskNameResolveFor = (envOptions) => {
    if (!envOptions.build.watch && !!envOptions.release.releaseType) {
        return AngularJsonLibTaskName.production;
    }
    else {
        return AngularJsonLibTaskName.development;
    }
};
exports.AngularJsonLibTaskNameResolveFor = AngularJsonLibTaskNameResolveFor;
var BundledDocsFolders;
(function (BundledDocsFolders) {
    BundledDocsFolders["VERSION"] = "version";
})(BundledDocsFolders || (exports.BundledDocsFolders = BundledDocsFolders = {}));
var TaonCommands;
(function (TaonCommands) {
    TaonCommands["NPM_RUN_TSC"] = "npm-run tsc";
    TaonCommands["NPM_RUN_NG"] = "npm-run ng";
    TaonCommands["NG"] = "ng";
})(TaonCommands || (exports.TaonCommands = TaonCommands = {}));
exports.appTsFromSrc = 'app.ts';
exports.appAutoGenDocsMd = 'app.auto-gen-docs.md';
exports.appAutoGenJs = 'app.auto-gen-ver.js';
exports.appJsBackend = 'app.js';
exports.appScssFromSrc = 'app.scss';
exports.globalScssFromSrc = 'global.scss';
exports.ngProjectStylesScss = 'styles.scss';
exports.appElectronTsFromSrc = 'app.electron.ts';
exports.appVscodeTsFromSrc = 'app.vscode.ts';
exports.appVscodeJSFromBuild = 'app.vscode.js';
var TaonFileExtension;
(function (TaonFileExtension) {
    TaonFileExtension["DOT_WORKER_TS"] = ".worker.ts";
    TaonFileExtension["DOT_CONTEXT_TS"] = ".context.ts";
})(TaonFileExtension || (exports.TaonFileExtension = TaonFileExtension = {}));
/**
 * ng build for library from /src/lib
 */
exports.tmpLibsForDist = 'tmp-libs-for-dist';
/**
 * ng build for library from /src/lib (websql code)
 */
exports.tmpLibsForDistWebsql = 'tmp-libs-for-dist-websql';
/**
 * normal angular app build
 */
exports.tmpAppsForDist = 'tmp-apps-for-dist';
/**
 * websql angular app build
 */
exports.tmpAppsForDistWebsql = 'tmp-apps-for-dist-websql';
/**
 * electron angular app build
 */
exports.tmpAppsForDistElectron = `tmp-apps-for-dist-electron`;
exports.tmpAppsForDistElectronWebsql = `tmp-apps-for-dist-websql-electron`;
/**
 * Dummy auto generated /src/index.ts
 */
exports.indexTsFromSrc = lib_2.fileName.index_ts;
/**
 * Entry point for angular lib from /src/lib/index.ts
 */
exports.indexTsFromLibFromSrc = lib_2.fileName.index_ts;
/**
 * Entry point for scss from /src/index.scss
 */
exports.indexScssFromSrc = lib_2.fileName.index_ts;
/**
 * Index for autogenerated migrations /src/migrations/index.ts
 */
exports.indexTsFromMigrationsFromSrc = lib_2.fileName.index_ts;
/**
 * Entry point for scss from /src/lib/index.scss
 */
exports.indexScssFromSrcLib = 'index.scss';
/**
 *
 * @param appForLib if true code is for angular (ng server/build) app build, false for lib ng build
 * @param websql if true websql version
 * @returns relative path to temp browser source folder
 */
function tempSourceFolder(appForLib, websql, prod = false) {
    if (appForLib && websql) {
        return exports.tmpSrcAppDistWebsql + (prod ? exports.prodSuffix : '');
    }
    if (appForLib && !websql) {
        return exports.tmpSrcAppDist + (prod ? exports.prodSuffix : '');
    }
    if (!appForLib && websql) {
        return exports.tmpSrcDistWebsql + (prod ? exports.prodSuffix : '');
    }
    if (!appForLib && !websql) {
        return exports.tmpSrcDist + (prod ? exports.prodSuffix : '');
    }
} // ok for prod
exports.ENV_INJECT_COMMENT = '<!--ENV_INJECT-->';
exports.isomorphicPackagesJsonKey = 'isomorphicPackages';
exports.browserMainProject = lib_2.folderName.browser;
exports.browserFromCompiledDist = lib_2.folderName.browser;
exports.browserNgBuild = lib_2.folderName.browser;
exports.browserFromImport = lib_2.folderName.browser;
exports.browserNpmPackage = lib_2.folderName.browser;
exports.websqlMainProject = lib_2.folderName.websql;
exports.websqlFromCompiledDist = lib_2.folderName.websql;
exports.websqlFromImport = lib_2.folderName.websql;
exports.websqlNpmPackage = lib_2.folderName.websql;
exports.clientCodeVersionFolder = [exports.browserMainProject, exports.websqlMainProject];
exports.notAllowedAsPacakge = [...exports.clientCodeVersionFolder, exports.assetsFromSrc];
exports.MESSAGES = {
    SHUT_DOWN_FOLDERS_AND_DEBUGGERS: 'Please shut down your code debugger and any open windows from node_modules and press any key...',
};
exports.localReleaseMainProject = 'local_release';
exports.dotInstallDate = '.install-date';
exports.KV_DATABASE_ONLINE_NAME = 'KV_DATABASE_ONLINE_NAME';
exports.dotVscodeMainProject = '.vscode';
exports.indexTsInSrcForWorker = `src/index.ts`;
exports.wranglerJsonC = `wrangler.jsonc`;
exports.packageJsonLockMainProject = lib_2.fileName.package_lock_json;
exports.packageJsonLockSubProject = lib_2.fileName.package_lock_json;
exports.yarnLockMainProject = lib_2.fileName.yarn_lock;
exports.packageJsonMainProject = lib_2.fileName.package_json;
exports.packageJsonSubProject = lib_2.fileName.package_json;
exports.packageJsonNpmLib = lib_2.fileName.package_json;
exports.packageJsonVscodePlugin = lib_2.fileName.package_json;
exports.packageJsonNpmLibAngular = lib_2.fileName.package_json;
exports.packageJsonNgProject = lib_2.fileName.package_json;
exports.packageJsonLibDist = lib_2.fileName.package_json;
exports.tsconfigJsonMainProject = 'tsconfig.json';
exports.tsconfigNgProject = 'tsconfig.json';
exports.tsconfigSubProject = 'tsconfig.json';
exports.tsconfigSpecNgProject = 'tsconfig.spec.json';
// export const tsconfigForUnitTestsNgProject = 'tsconfig.spec-for-unit.json';
exports.tsconfigSpecJsonMain = 'tsconfig.spec.json';
/**
 * TODO not used?
 */
exports.tsconfigJsonBrowserMainProject = 'tsconfig.browser.json';
exports.tsconfigBackendDistJson = 'tsconfig.backend.dist.json';
exports.tsconfigBackendDistJson_PROD = 'tsconfig.backend.dist.prod.json';
exports.tsconfigForSchemaJson = 'tsconfig-for-schema.json';
exports.tsconfigJsonIsomorphicMainProject = 'tsconfig.isomorphic.json';
exports.dotNpmrcMainProject = lib_2.fileName._npmrc;
exports.dotGitIgnoreMainProject = lib_2.fileName._gitignore;
exports.dotNpmIgnoreMainProject = lib_2.fileName._npmignore;
exports.webpackConfigJsMainProject = 'webpack.config.js';
exports.esLintCustomRulesMainProject = 'eslint-rules';
exports.esLintConfigJsonMainProject = 'eslint.config.ts';
exports.vitestConfigJsonMainProject = 'vitest.config.ts';
exports.esLintRuleNoNamespaceReExport = 'eslint-rules/no-namespace-reexport.ts';
exports.runJsMainProject = 'run.js';
exports.indexDtsMainProject = lib_2.fileName.index_d_ts;
exports.indexDtsNpmPackage = lib_2.fileName.index_d_ts;
exports.indexJSNpmPackage = lib_2.fileName.index_js;
exports.indexJSElectronDist = lib_2.fileName.index_js;
exports.indexProdJs = 'index-prod.js';
exports.cliTsFromSrc = 'cli.ts';
exports.cliJSNpmPackage = 'cli.js';
exports.cliJSMapNpmPackage = 'cli.js.map';
exports.cliDtsNpmPackage = 'cli.d.js';
exports.indexJsMainProject = lib_2.fileName.index_js;
exports.indexJsMapMainProject = lib_2.fileName.index_js_map;
exports.sourceLinkInNodeModules = lib_2.folderName.source;
exports.taonJsonMainProject = lib_2.fileName.taon_jsonc;
exports.updateVscodePackageJsonJsMainProject = 'update-vscode-package-json.js';
exports.VERIFIED_BUILD_DATA = 'VERIFIED-BUILD-DATA.jsonc';
exports.routes = lib_1.TaonTempRoutesFolder;
exports.databases = lib_1.TaonTempDatabasesFolder;
exports.dotFileTemplateExt = '.filetemplate';
exports.dotEnvFile = '.env';
exports.suffixLatest = '-latest';
exports.prodSuffix = '-prod';
exports.releaseSuffix = '-release';
exports.debugSuffix = '--debug';
exports.debugBrkSuffix = '--debug-brk';
exports.inspectSuffix = '--inspect';
exports.inspectBrkSuffix = '--inspect-brk';
exports.containerPrefix = 'container-';
exports.testEnvironmentsMainProject = lib_2.folderName.testsEnvironments;
exports.ONLY_COPY_ALLOWED = [
    // 'background-worker-process',
    'better-sqlite3',
    '.bin',
    '.install-date',
];
/**
 * to prevent lib error when building with asserts
 */
exports.TO_REMOVE_TAG = `/${'TO_REMOVE'
    .split('')
    .map(c => lib_4._.times(8, () => c).join(''))
    .join('')}`;
exports.ERR_MESSAGE_DEPLOYMENT_NOT_FOUND = 'DEPLOYMENT_NOT_FOUND';
exports.ERR_MESSAGE_PROCESS_NOT_FOUND = 'PROCESS_NOT_FOUND';
// console.log('TO_REMOVE_TAG', TO_REMOVE_TAG);
exports.migrationsFromLib = lib_2.folderName.migrations;
exports.migration_index_autogenerated_ts = 'migrations_index._auto-generated_.ts';
exports.migrationIndexAutogeneratedTsFileRelativeToSrcPath = (0, lib_5.crossPlatformPath)([
    exports.libFromSrc,
    exports.migrationsFromLib,
    exports.migration_index_autogenerated_ts,
]);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/constants.js.map