import type * as ora from 'ora';
import { CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__FrameworkVersion } from 'tnp-core/lib-prod';
import type { EnvOptions } from './options';
import { DeploymentReleaseData } from './project/abstract/taon-worker/deployments/deployments.models';
export declare const whatToLinkFromCore: 'src' | 'src/lib';
/**
 *  '' - when whatToLinkFromCore is src
 *  'lib' - when whatToLinkFromCore is src/lib
 *  'deep/folder' - when whatToLinkFromCore is src/deep/folder
 */
export declare const whatToLinkFromCoreDeepPart: string;
export declare const keysMap: Required<{ [key in keyof DeploymentReleaseData]: string; }>;
export declare const dirnameFromSourceToProject: (linkToSource: string) => string;
export declare const DUMMY_LIB = "@lib";
export declare const DOCKER_COMPOSE_FILE_NAME = "docker-compose.yml";
export declare const DOCKER_FOLDER = "docker";
export declare const BASE_TEMP_DOCKER_FOLDER = "tmp-docker";
export declare const DOCKER_TEMPLATES = "docker-templates";
export declare const ACTIVE_CONTEXT = "ACTIVE_CONTEXT";
export declare const friendlyNameForReleaseAutoConfigIsRequired = false;
export declare const iconVscode128Basename = "icon-vscode.png";
export declare const startJsFromBin = "start.js";
export declare const startTsFromLib = "start-cli.ts";
export declare const taonIgnore: string;
export declare const DEBUG_WORD = "Debug/Start";
export declare const GENERATE_CMD_COPY_TO_AI = "generate-cmd-copy-to-ai";
export declare const scriptsCommands: string[];
export declare const THIS_IS_GENERATED_STRING = "THIS FILE IS GENERATED - DO NOT MODIFY";
export declare const THIS_IS_GENERATED_INFO_COMMENT = "// THIS FILE IS GENERATED - DO NOT MODIFY";
export declare const defaultLicenseVscodePlugin = "MIT";
export declare const OVERRIDE_FROM_TNP: string[];
export declare const globalSpinner: {
    readonly instance: Pick<ora.Ora, "start" | "text" | "succeed" | "stop" | "fail">;
};
export declare const startSpinner = "start-spinner";
export declare const stopSpinner = "stop-spinner";
export declare const failSpinner = "fail-spinner";
export declare const succeedSpinner = "succeed-spinner";
export declare const USE_IN_HOST_CONFIG_FULL_CONTEXT_PATH = false;
export declare const MIGRATION_CONST_PREFIX = "MIGRATIONS_CLASSES_FOR_";
declare let taonUsingBundledCliMode: boolean;
export { taonUsingBundledCliMode };
export declare const UNIT_TEST_TIMEOUT = 30000;
export declare const INTEGRATION_TEST_TIMEOUT = 30000;
export declare const USE_MIGRATIONS_DATA_IN_HOST_CONFIG = false;
export declare const COMPILATION_COMPLETE_LIB_NG_BUILD = "Compilation complete. Watching for file changes";
export declare const COMPILATION_COMPLETE_APP_NG_SERVE = "Compiled successfully";
export declare const COMPILATION_COMPLETE_TSC = "Found 0 errors. Watching for file changes";
export declare const DEFAULT_FRAMEWORK_VERSION: CoreModels__NS__FrameworkVersion;
declare let taonRepoPathUserInUserDir: string;
declare const taonBasePathToGlobalDockerTemplates: string;
export { taonRepoPathUserInUserDir, taonBasePathToGlobalDockerTemplates };
/**
 * Prevents taon from checking core container when
 * calling itself from child process
 */
export declare const skipCoreCheck = "--skipCoreCheck";
export declare const argsToClear: string[];
export declare const verbosePrefix = "-verbose";
export declare const spinnerPrefix = "-spinner";
export declare const linuxWatchPrefix = "-linuxWatch";
export declare const websqlPrefix = "-websql";
export declare const folder_shared_folder_info = "shared_folder_info.txt";
export declare const taonConfigSchemaJsonStandalone = "taon-config-standalone.schema.json";
export declare const taonConfigSchemaJsonContainer = "taon-config-container.schema.json";
export declare const TEMP_DOCS = "tmp-documentation";
export declare const HOST_BACKEND_PORT = "HOST_BACKEND_PORT";
export declare const tmp_HOST_BACKEND_PORT = ".taon/libs-apps-ports/HOST_BACKEND_PORT";
export declare const FRONTEND_WEBSQL_APP_PORT = "FRONTEND_WEBSQL_APP_PORT";
export declare const tmp_FRONTEND_WEBSQL_APP_PORT = ".taon/libs-apps-ports/FRONTEND_WEBSQL_APP_PORT";
export declare const FRONTEND_NORMAL_APP_PORT = "FRONTEND_NORMAL_APP_PORT";
export declare const tmp_FRONTEND_NORMAL_APP_PORT = ".taon/libs-apps-ports/FRONTEND_NORMAL_APP_PORT";
export declare const FRONTEND_NORMAL_ELECTRON_PORT = "FRONTEND_NORMAL_ELECTRON_PORT";
export declare const tmp_FRONTEND_NORMAL_ELECTRON_PORT = ".taon/libs-apps-ports/FRONTEND_NORMAL_ELECTRON_PORT";
export declare const DEFAULT_PORT: {
    DIST_SERVER_DOCS: number;
    APP_BUILD_LOCALHOST: number;
    SERVER_LOCALHOST: number;
    DEBUGGING_CLI_TOOL: number;
    DEBUGGING_ELECTRON: number;
};
export declare const docsConfigJsonFileName = "docs-config.jsonc";
export declare const docsConfigSchema = "docs-config.schema.json";
export declare const customDefaultCss = "custom-default.css";
export declare const customDefaultJs = "custom-default.js";
export declare const frameworkBuildFolders: string[];
export declare const envTs = "env.ts";
export declare const environmentsFolder = "environments";
export declare const coreRequiredEnvironments: CoreModels__NS__EnvironmentNameTaon[];
/**
 * @deprecated not needed probably
 */
export declare const result_packages_json = "result-packages.json";
export declare const readmeMdMainProject = "README.md";
export declare const tmpIsomorphicPackagesJson = "tmp-isomorphic-packages.json";
/**
 * If exist - copy manager will clean copy bundled package to destinations
 */
export declare const tmpAlreadyStartedCopyManager = "tmp-already-started-copy-manager";
export declare const tmpAllAssetsLinked = "tmp-all-assets-linked";
/**
 * Destination place for all taon processes (tsc, ng build, etc)
 * From this folder code is copied to final destinations node_modules
 */
export declare const tmpLocalCopytoProjDist = "tmp-local-copyto-proj-dist";
/**
 * Folder where tmpSrdDist code is cutted file by file before publishing
 */
export declare const tmpCutReleaseSrcDist = "tmp-cut-release-src-dist";
/**
 * Folder where tmpSrdDist code is cutted file by file before publishing (websql version)
 */
export declare const tmpCutReleaseSrcDistWebsql = "tmp-cut-release-src-dist-websql";
/**
 * Temporary folder for base href overwrite during build
 * (taon library build sets it)
 */
export declare const tmpBaseHrefOverwrite = "tmp-base-href-overwrite";
/**
 * Temporary folder for vscode project files
 */
export declare const tmpVscodeProj = "tmp-vscode-proj";
/**
 * Taon code transformed for backend
 */
export declare const tmpSourceDist = "tmp-source-dist";
/**
 * Taon code transformed for backend in websql mode
 * (this code is probably never used)
 */
export declare const tmpSourceDistWebsql = "tmp-source-dist-websql";
/**
 * Taon code transformed for browser
 */
export declare const tmpSrcDist = "tmp-src-dist";
/**
 * Taon code transformed for browser in websql mode
 */
export declare const tmpSrcDistWebsql = "tmp-src-dist-websql";
/**
 * Taon code transformed for browser (angular app uses this)
 */
export declare const tmpSrcAppDist = "tmp-src-app-dist";
/**
 * Taon code transformed for browser (angular app in websql uses this)
 */
export declare const tmpSrcAppDistWebsql = "tmp-src-app-dist-websql";
export declare const defaultConfiguration = "defaultConfiguration";
export declare const mainProjectSubProjects = "sub-projects";
export declare enum TempalteSubprojectType {
    TAON_STRIPE_CLOUDFLARE_WORKER = "taon-stripe-cloudflare-worker",
    TAON_YT_CLOUDFLARE_WORKER = "taon-yt-cloudflare-worker"
}
export declare const TempalteSubprojectTypeArr: TempalteSubprojectType[];
export declare const TemplateSubprojectDbPrefix: {
    "taon-stripe-cloudflare-worker": string;
    "taon-yt-cloudflare-worker": string;
};
export declare enum TempalteSubprojectGroup {
    KEY_VALUE_FAST_WORKER_DATABASE = "key-value-fast-worker-database"
}
export declare const TempalteSubprojectTypeGroup: {
    "taon-stripe-cloudflare-worker": TempalteSubprojectGroup;
    "taon-yt-cloudflare-worker": TempalteSubprojectGroup;
};
/**
 * template folders from isomorphic lib
 */
export declare enum TemplateFolder {
    /**
     * Core project for angular app webapp, library and electron app
     */
    templateApp = "template-app",
    templatesSubprojects = "templates-subprojects"
}
export declare enum AngularJsonTaskName {
    ANGULAR_APP = "app",
    ELECTRON_APP = "angular-electron"
}
export declare enum CoreAssets {
    sqlWasmFile = "sql-wasm.wasm",
    mainFont = "flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2"
}
export declare const dockerTemplatesFolder = "docker-templates";
export declare enum DockerTemplatesFolders {
    ANGULAR_APP_NODE = "angular-app-node",
    ANGULAR_APP_SSR_NODE = "angular-app-ssr-node",
    BACKEND_APP_NODE = "backend-app-node",
    DATABASE_MYSQL = "database-mysql"
}
export declare enum CoreNgTemplateFiles {
    sqlJSLoaderTs = "sqljs-loader.ts",
    SERVER_TS = "server.ts",
    JEST_CONFIG_JS = "jest.config.js",
    SETUP_JEST_TS = "setupJest.ts",
    JEST_GLOBAL_MOCKS_TS = "jestGlobalMocks.ts",
    NG_PACKAGE_JSON = "ng-package.json",
    PACKAGE_JSON = "package.json",// fileName.package_json,
    ANGULAR_JSON = "angular.json",// fileName.angular_json,
    INDEX_HTML_NG_APP = "index.html",
    FAVICON_ICO = "favicon.ico",
    WEBMANIFEST_JSON = "manifest.webmanifest"
}
export declare enum TaonGeneratedFiles {
    BUILD_INFO_MD = "BUILD-INFO.md",
    build_info_generated_ts = "build-info._auto-generated_.ts",
    index_generated_ts = "index._auto-generated_.ts",
    BUILD_INFO_AUTO_GENERATED_JS = "build-info._auto-generated_.js",
    MIGRATIONS_INFO_MD = "migrations-info.md",
    MOCHA_TESTS_INFO_MD = "mocha-tests-info.md",
    SHARED_FOLDER_INFO_TXT = "shared_folder_info.txt",
    APP_HOSTS_TS = "app.hosts.ts",
    LAUNCH_JSON = "launch.json",
    LAUNCH_BACKUP_JSON = "launch-backup.json",
    VARS_SCSS = "vars.scss",
    LIB_INFO_MD = "lib-info.md",
    APP_FOLDER_INFO_MD = "app-folder-info.md"
}
export declare const DS_Store = ".DS_Store";
export declare enum TaonGeneratedFolders {
    ENV_FOLDER = "env",
    COMPILED = "compiled"
}
export declare const splitNamespacesJson = "split-namespaces.json";
export declare const reExportJson = "re-export.json";
/**
 * Main project /dist folder
 */
export declare const nodeModulesMainProject: string;
export declare const nodeModulesSubPorject: string;
/**
 * Main project /dist-nocutsrc folder (d.ts files without code cutting)
 */
export declare const distNoCutSrcMainProject = "dist-nocutsrc";
/**
 * Main project /dist folder
 */
export declare const distMainProject: string;
/**
 * Vscode project dist folder
 */
export declare const distVscodeProj: string;
/**
 * Electron project dist folder
 */
export declare const distElectronProj: string;
/**
 * Normal angular app build
 */
export declare const distFromNgBuild: string;
/**
 * Dist from sass loader
 */
export declare const distFromSassLoader: string;
export declare const electronNgProj = "electron";
export declare const combinedDocsAllMdFilesFolder = "allmdfiles";
/**
 * Vscode project dist folder
 */
export declare const outVscodeProj: string;
/**
 * Main project /docs folder
 */
export declare const docsMainProject: string;
/**
 * Main project /bin folder
 */
export declare const binMainProject: string;
/**
 * Main project /src folder
 */
export declare const srcMainProject: string;
/**
 * src from template proxy project
 */
export declare const srcNgProxyProject: string;
/**
 * each taon import ends with /src
 */
export declare const srcFromTaonImport: string;
/**
 * each taon import ends with /src
 */
export declare const srcDtsFromNpmPackage = "src.d.ts";
export declare const srcJSFromNpmPackage = "src.js";
export declare const myLibFromNgProject = "my-lib";
export declare const externalLibsFromNgProject = "external-libs";
/**
 * projects/my-lib form angular lib template
 */
export declare const projectsFromNgTemplate: string;
/**
 * @deprecated special place in standalone project for projects
 */
export declare const projectsFromMainProject: string;
/**
 * Main project app folder from /src/app folder
 */
export declare const appFromSrc: string;
/**
 * Generated app inside angular app (comes from /src/app folder)
 */
export declare const appFromSrcInsideNgApp: string;
export declare const libTypeString: string;
export declare const browserTypeString: string;
export declare const websqlTypeString: string;
/**
 * Main project lib folder from /src/lib folder
 */
export declare const libFromSrc: string;
/**
 * Lib from taon import
 */
export declare const libFromImport: string;
/**
 * Lib from dist/lib
 */
export declare const libFromCompiledDist: string;
/**
 * Lib from npm packages
 */
export declare const libFromNpmPackage: string;
/**
 * lib from ng projects
 */
export declare const libFromNgProject: string;
/**
 * Main project tests folder from /src/tests folder
 */
export declare const testsFromSrc: string;
/**
 * Main project assets from /src/assets folder
 */
export declare const assetsFromSrc: string;
/**
 * Assets stored in taon isomorphic npm package with
 */
export declare const assetsFromNpmLib: string;
/**
 * Main project assets from /tmp-*\/src/assets folder
 */
export declare const assetsFromTempSrc: string;
/**
 * Assets from ng template project
 */
export declare const assetsFromNgProj: string;
/**
 * Assets from npm package
 */
export declare const assetsFromNpmPackage: string;
/**
 * Shared from assets from /src/assets/shared folder
 */
export declare const sharedFromAssets: string;
/**
 * Generated folder in assets from /src/assets/generated folder
 */
export declare const generatedFromAssets: string;
/**
 * Generated pwa assets from /src/assets/generated/pwa folder
 */
export declare const pwaGeneratedFolder = "pwa";
/**
 * Generated assets-for folder
 */
export declare const assetsFor = "assets-for";
/**
 * @deprecated it was probably needed for old container build
 * Folder for all browser libs
 */
export declare const libs: string;
export declare enum BundledFiles {
    CNAME = "CNAME",
    README_MD = "README.md",
    CLI_README_MD = "CLI-README.md",
    INDEX_HTML = "index.html"
}
export declare enum AngularJsonAppOrElectronTaskName {
    developmentSsr = "development",
    productionSsr = "production",
    developmentStatic = "development-static",
    productionStatic = "production-static"
}
export declare const AngularJsonAppOrElectronTaskNameResolveFor: (envOptions: EnvOptions) => AngularJsonAppOrElectronTaskName;
export declare enum AngularJsonLibTaskName {
    development = "development",
    production = "production"
}
export declare const AngularJsonLibTaskNameResolveFor: (envOptions: EnvOptions) => AngularJsonLibTaskName;
export declare enum BundledDocsFolders {
    VERSION = "version"
}
export declare enum TaonCommands {
    NPM_RUN_TSC = "npm-run tsc",
    NPM_RUN_NG = "npm-run ng",
    NG = "ng"
}
export declare const appTsFromSrc = "app.ts";
export declare const appAutoGenDocsMd = "app.auto-gen-docs.md";
export declare const appAutoGenJs = "app.auto-gen-ver.js";
export declare const appJsBackend = "app.js";
export declare const appScssFromSrc = "app.scss";
export declare const globalScssFromSrc = "global.scss";
export declare const ngProjectStylesScss = "styles.scss";
export declare const appElectronTsFromSrc = "app.electron.ts";
export declare const appVscodeTsFromSrc = "app.vscode.ts";
export declare const appVscodeJSFromBuild = "app.vscode.js";
export declare enum TaonFileExtension {
    DOT_WORKER_TS = ".worker.ts",
    DOT_CONTEXT_TS = ".context.ts"
}
/**
 * ng build for library from /src/lib
 */
export declare const tmpLibsForDist = "tmp-libs-for-dist";
/**
 * ng build for library from /src/lib (websql code)
 */
export declare const tmpLibsForDistWebsql = "tmp-libs-for-dist-websql";
/**
 * normal angular app build
 */
export declare const tmpAppsForDist = "tmp-apps-for-dist";
/**
 * websql angular app build
 */
export declare const tmpAppsForDistWebsql = "tmp-apps-for-dist-websql";
/**
 * electron angular app build
 */
export declare const tmpAppsForDistElectron = "tmp-apps-for-dist-electron";
export declare const tmpAppsForDistElectronWebsql = "tmp-apps-for-dist-websql-electron";
/**
 * Dummy auto generated /src/index.ts
 */
export declare const indexTsFromSrc: string;
/**
 * Entry point for angular lib from /src/lib/index.ts
 */
export declare const indexTsFromLibFromSrc: string;
/**
 * Entry point for scss from /src/index.scss
 */
export declare const indexScssFromSrc: string;
/**
 * Index for autogenerated migrations /src/migrations/index.ts
 */
export declare const indexTsFromMigrationsFromSrc: string;
/**
 * Entry point for scss from /src/lib/index.scss
 */
export declare const indexScssFromSrcLib = "index.scss";
/**
 *
 * @param appForLib if true code is for angular (ng server/build) app build, false for lib ng build
 * @param websql if true websql version
 * @returns relative path to temp browser source folder
 */
export declare function tempSourceFolder(appForLib: boolean, websql: boolean, prod?: boolean): string;
export declare const ENV_INJECT_COMMENT = "<!--ENV_INJECT-->";
export declare const isomorphicPackagesJsonKey = "isomorphicPackages";
export declare const browserMainProject: string;
export declare const browserFromCompiledDist: string;
export declare const browserNgBuild: string;
export declare const browserFromImport: string;
export declare const browserNpmPackage: string;
export declare const websqlMainProject: string;
export declare const websqlFromCompiledDist: string;
export declare const websqlFromImport: string;
export declare const websqlNpmPackage: string;
export declare const clientCodeVersionFolder: string[];
export declare const notAllowedAsPacakge: string[];
export declare const MESSAGES: {
    SHUT_DOWN_FOLDERS_AND_DEBUGGERS: string;
};
export declare const localReleaseMainProject = "local_release";
export declare const dotInstallDate = ".install-date";
export declare const KV_DATABASE_ONLINE_NAME = "KV_DATABASE_ONLINE_NAME";
export declare const dotVscodeMainProject = ".vscode";
export declare const indexTsInSrcForWorker = "src/index.ts";
export declare const wranglerJsonC = "wrangler.jsonc";
export declare const packageJsonLockMainProject: string;
export declare const packageJsonLockSubProject: string;
export declare const yarnLockMainProject: string;
export declare const packageJsonMainProject: string;
export declare const packageJsonSubProject: string;
export declare const packageJsonNpmLib: string;
export declare const packageJsonVscodePlugin: string;
export declare const packageJsonNpmLibAngular: string;
export declare const packageJsonNgProject: string;
export declare const packageJsonLibDist: string;
export declare const tsconfigJsonMainProject = "tsconfig.json";
export declare const tsconfigNgProject = "tsconfig.json";
export declare const tsconfigSubProject = "tsconfig.json";
export declare const tsconfigSpecNgProject = "tsconfig.spec.json";
export declare const tsconfigSpecJsonMain = "tsconfig.spec.json";
/**
 * TODO not used?
 */
export declare const tsconfigJsonBrowserMainProject = "tsconfig.browser.json";
export declare const tsconfigBackendDistJson = "tsconfig.backend.dist.json";
export declare const tsconfigBackendDistJson_PROD = "tsconfig.backend.dist.prod.json";
export declare const tsconfigForSchemaJson = "tsconfig-for-schema.json";
export declare const tsconfigJsonIsomorphicMainProject = "tsconfig.isomorphic.json";
export declare const dotNpmrcMainProject: string;
export declare const dotGitIgnoreMainProject: string;
export declare const dotNpmIgnoreMainProject: string;
export declare const webpackConfigJsMainProject = "webpack.config.js";
export declare const esLintCustomRulesMainProject = "eslint-rules";
export declare const esLintConfigJsonMainProject = "eslint.config.ts";
export declare const vitestConfigJsonMainProject = "vitest.config.ts";
export declare const esLintRuleNoNamespaceReExport = "eslint-rules/no-namespace-reexport.ts";
export declare const runJsMainProject = "run.js";
export declare const indexDtsMainProject: string;
export declare const indexDtsNpmPackage: string;
export declare const indexJSNpmPackage: string;
export declare const indexJSElectronDist: string;
export declare const indexProdJs = "index-prod.js";
export declare const cliTsFromSrc = "cli.ts";
export declare const cliJSNpmPackage = "cli.js";
export declare const cliJSMapNpmPackage = "cli.js.map";
export declare const cliDtsNpmPackage = "cli.d.js";
export declare const indexJsMainProject: string;
export declare const indexJsMapMainProject: string;
export declare const sourceLinkInNodeModules: string;
export declare const taonJsonMainProject: string;
export declare const updateVscodePackageJsonJsMainProject = "update-vscode-package-json.js";
export declare const VERIFIED_BUILD_DATA = "VERIFIED-BUILD-DATA.jsonc";
export interface TaonVerifiedBuild {
    commitHash: string;
    commitName: string;
    commitDate: string | Date;
}
export declare const routes = "routes";
export declare const databases = "databases";
export declare const dotFileTemplateExt = ".filetemplate";
export declare const dotEnvFile = ".env";
export declare const suffixLatest = "-latest";
export declare const prodSuffix = "-prod";
export declare const releaseSuffix = "-release";
export declare const debugSuffix = "--debug";
export declare const debugBrkSuffix = "--debug-brk";
export declare const inspectSuffix = "--inspect";
export declare const inspectBrkSuffix = "--inspect-brk";
export declare const containerPrefix = "container-";
export declare const testEnvironmentsMainProject: string;
export declare const ONLY_COPY_ALLOWED: string[];
/**
 * to prevent lib error when building with asserts
 */
export declare const TO_REMOVE_TAG: string;
export declare const ERR_MESSAGE_DEPLOYMENT_NOT_FOUND = "DEPLOYMENT_NOT_FOUND";
export declare const ERR_MESSAGE_PROCESS_NOT_FOUND = "PROCESS_NOT_FOUND";
export declare const migrationsFromLib: string;
export declare const migration_index_autogenerated_ts = "migrations_index._auto-generated_.ts";
export declare const migrationIndexAutogeneratedTsFileRelativeToSrcPath: string;
