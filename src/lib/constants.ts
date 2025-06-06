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

export const ALLOWED_TO_RELEASE: {
  [releaseType in ReleaseType]: ReleaseArtifactTaon[];
} = {
  manual: ['npm-lib-and-cli-tool'],
  local: ['npm-lib-and-cli-tool', 'vscode-plugin', 'electron-app'],
  cloud: [],
  'static-pages': ['angular-node-app', 'docs-webapp'],
};

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
};

export const tmpVscodeProj = `tmp-vscode-proj`;

export const tmpBuildPort = 'tmp-build-port';
export const tmpBaseHrefOverwriteRelPath = 'tmp-base-href-overwrite';

/**
 *
 * Ports for:
    max = max instances = max container childs = 20;
    n = folder process build number (searches for new port always)
    index = container project index (can't exceeds max)

    build process service 4100 = 4100 + n

    standalone server 4500 = 4100  + 400 + n
    containers servers 4600 = 4100  + 500 + n * max + index

    standalone ng serve normal 4300 = 4100  + 200 + n
    standalone ng serve websql 4400 = 4100  + 300 + n

    container ng serve normal 4800 = 4100  + 700 + n + max + index
    container ng serve websql 4900 = 4100  + 800 + n + max + index
 *
 * @param basePort 4100 + n
 * @returns
 */
export class PortUtils {
  static instance(basePort: number) {
    return new PortUtils(basePort);
  }

  private readonly n: number;
  constructor(private basePort: number) {
    this.n = (basePort - (basePort % 1000)) / 1000;
  }

  /**
   * max container  childs
   */
  private max = 20;

  calculatePortForElectronDebugging(project: Project): number {
    if (!project.framework.isStandaloneProject) {
      return;
    }
    return 9876 + this.n;
  }

  calculateServerPortFor(project: Project): number {
    //#region @backendFunc
    if (project.framework.isContainer) {
      return;
    }

    if (project.framework.isStandaloneProject) {
      return this.calculateForStandaloneServer();
    }
    //#endregion
  }

  calculateClientPortFor(
    project: Project,
    { websql }: { websql: boolean },
  ): number {
    //#region @backendFunc
    if (project.framework.isContainer) {
      return;
    }

    if (project.framework.isStandaloneProject) {
      return this.calculateForStandaloneClient({ websql });
    }
    //#endregion
  }

  private calculateForStandaloneServer() {
    const clientStandalonePort = this.basePort + 400 + this.n;
    return clientStandalonePort;
  }

  private calculateForContainerServer(index: number) {
    const clientSmartContainerChildPort =
      this.basePort + 500 + this.n * this.max + index;
    // console.log({ clientSmartContainerChildPort })
    return clientSmartContainerChildPort;
  }

  private calculateForStandaloneClient({ websql }: { websql: boolean }) {
    const clientPort = this.basePort + (websql ? 300 : 200) + this.n;
    return clientPort;
  }

  private calculateForContainerClient(
    index: number,
    { websql }: { websql: boolean },
  ) {
    const clientPort =
      this.basePort + (websql ? 800 : 700) + this.n * this.max + index;
    return clientPort;
  }
}

export const frameworkBuildFolders = Utils.uniqArray([
  'firedev',
  'taon',
  'tnp',
  `${config.frameworkName}`,
])
  .filter(f => !!f)
  .map(f => `.${f}`);

export const notAllowedProjectNames = [
  // TODO add all npm package names from core container
  'copyto',
  'app',
  'apps',
  'libs',
  'lib',
  'src',
  'bin',
  'source',
  'migrations',
  'assets',
  'assets-for',
  'browser',
  'websql',
  'compiled',
  'docs',
  'environments',
  'env',
  'projects',
  'plugins',
  '_',
  'taon',
  'taon-simple-org',
  'taon-storage',
  'taon-type-sql',
  'taon-typeorm',
  'incremental-compiler',
  'isomorphic-region-loader',
  'json10',
  'json10-writer',
  'lodash-walk-object',
  'magic-renamer',
  'ng-talkback',
  'ng2-logger',
  'ng2-rest',
  'ng2-rest-swagger-generator',
  'node-cli-tester',
  'record-replay-req-res-scenario',
  'static-columns',
  'tnp',
  'tnp-config',
  'tnp-core',
  'tnp-helpers',
  'tnp-models',
  'typescript-class-helpers',
  'vpn-split',
];

export const envTs = 'env.ts';

export const environments = 'environments';

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
