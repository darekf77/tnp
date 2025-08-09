//#region imports
import { config } from 'tnp-config/src';
import { CoreModels, os } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { crossPlatformPath, path, Utils } from 'tnp-core/src';

import { CURRENT_PACKAGE_VERSION } from './build-info._auto-generated_';
import { ReleaseArtifactTaon, ReleaseType } from './options';
import type { Project } from './project/abstract/project';
//#endregion

export const DUMMY_LIB = '@lib';

export const DOCKER_COMPOSE_FILE_NAME = 'docker-compose.yml';
export const DOCKER_FOLDER = 'docker';
export const BASE_TEMP_DOCKER_FOLDER = 'tmp-docker';

export const DOCKER_TEMPLATES = 'docker-templates';

export const ACTIVE_CONTEXT = 'ACTIVE_CONTEXT';

export const ALLOWED_TO_RELEASE: {
  [releaseType in ReleaseType]: ReleaseArtifactTaon[];
} = {
  manual: ['npm-lib-and-cli-tool', 'angular-node-app'],
  local: [
    'electron-app',
    'npm-lib-and-cli-tool',
    'vscode-plugin',
    'angular-node-app',
  ],
  cloud: [],
  'static-pages': [
    'angular-node-app',
    'docs-webapp',
    'electron-app',
    'vscode-plugin',
  ],
};

export const iconVscode128Basename = 'icon-vscode.png';

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

export const UNIT_TEST_TIMEOUT = 30000;
export const INTEGRATION_TEST_TIMEOUT = 30000;

export const COMPILATION_COMPLETE_LIB_NG_BUILD =
  'Compilation complete. Watching for file changes';

export const COMPILATION_COMPLETE_APP_NG_SERVE = 'Compiled successfully';

// TODO get this from cli, global
export const DEFAULT_FRAMEWORK_VERSION =
  `v${CURRENT_PACKAGE_VERSION.split('.')[0]}` as CoreModels.FrameworkVersion;

export let taonRepoPathUserInUserDir: string =
  //#region @backend
  path.join(
    crossPlatformPath(os.homedir()),
    `.${config.frameworkNames.productionFrameworkName}`,
    config.frameworkNames.productionFrameworkName,
  );
//#endregion
('');

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

export const folder_shared_folder_info = 'shared_folder_info.txt';
export const taonConfigSchemaJsonStandalone =
  'taon-config-standalone.schema.json';
export const taonConfigSchemaJsonContainer =
  'taon-config-container.schema.json';

export const TEMP_DOCS = 'tmp-documentation';

export const DEFAULT_PORT = {
  DIST_SERVER_DOCS: 4000,
  APP_BUILD_LOCALHOST: 4200,
  SERVER_LOCALHOST: 4100,
  DEBUGGING_CLI_TOOL: 9222,
  DEBUGGING_ELECTRON: 9888,
};

export const tmpVscodeProj = `tmp-vscode-proj`;
export const tmpAppsForDist = `tmp-apps-for-dist`;
export const tmpAppsForDistWebsql = `${tmpAppsForDist}-websql`;
export const tmpAppsForDistElectron = `${tmpAppsForDist}-electron`;

export const tmpBuildPort = 'tmp-build-port';
export const tmpBaseHrefOverwriteRelPath = 'tmp-base-href-overwrite';

export const frameworkBuildFolders = Utils.uniqArray([
  'firedev',
  'taon',
  'tnp',
  `${config.frameworkName}`,
])
  .filter(f => !!f)
  .map(f => `.${f}`);

export const envTs = 'env.ts';

export const environments = 'environments';

export const coreRequiredEnvironments = [
  '__',
  'prod',
] as CoreModels.EnvironmentNameTaon[];

//#region methods & getters / get browser ver path
/**
 * @deprecated
 */
export const getBrowserVerPath = (websql: boolean = false) => {
  //#region @backend
  return websql ? config.folder.websql : config.folder.browser;
  //#endregion
};
//#endregion

export function tempSourceFolder(
  outDir: 'dist',
  appForLib: boolean,
  websql: boolean,
) {
  return `tmp-src-${appForLib ? 'app-' : ''}${outDir}${websql ? '-websql' : ''}`;
}

export const clientCodeVersionFolder = [
  config.folder.browser,
  config.folder.websql,
];

export const notAllowedAsPacakge = [
  ...clientCodeVersionFolder,
  config.folder.assets,
];

export const MESSAGES = {
  SHUT_DOWN_FOLDERS_AND_DEBUGGERS:
    'Please shut down your code debugger and any open windows from node_modules and press any key...',
};

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
  .map(c => _.times(8, () => c).join(''))
  .join('')}`;

// console.log('TO_REMOVE_TAG', TO_REMOVE_TAG);
