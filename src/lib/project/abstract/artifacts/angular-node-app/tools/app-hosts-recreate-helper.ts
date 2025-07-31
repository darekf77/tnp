//#region imports
// import * as dockernode from 'dockerode';
import { ChangeOfFile } from 'incremental-compiler/src';
import { config } from 'tnp-config/src';
import { CoreModels, crossPlatformPath, path } from 'tnp-core/src';
import { fse } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';
import {
  BaseFeatureForProject,
  BaseDebounceCompilerForProject,
} from 'tnp-helpers/src';

import {
  Development,
  EnvOptions,
  ReleaseArtifactTaonNames,
} from '../../../../../options';
import {
  DEFAULT_PORT,
  DOCKER_COMPOSE_FILE_NAME,
  DOCKER_FOLDER,
  THIS_IS_GENERATED_INFO_COMMENT,
} from '../../../../../constants';
import { Models } from '../../../../../models';
import { Project } from '../../../project';
//#endregion

/**
 * handle dockers image in taon projects
 */
export class AppHostsRecreateHelper extends BaseDebounceCompilerForProject<
  {
    envOptions: EnvOptions;
  }, // @ts-ignore TODO weird inheritance problem
  Project
> {
  //#region constructor
  private readonly baseSrcFolder: string;
  private lastTaonContexts: Models.TaonContext[] = [];
  constructor(project: Project) {
    super(project, {
      folderPath: [project.pathFor([config.folder.src])],
      subscribeOnlyFor: ['ts', 'tsx'],
      followSymlinks: false,
      taskName: 'AppHostsTsRecreateHelper',
      notifyOnFileUnlink: true,
    });
    this.baseSrcFolder = project.pathFor('src') + '/';
  }
  //#endregion

  //#region getters
  get envOptions(): EnvOptions {
    return this.initialParams.envOptions;
  }

  //#endregion

  //#region rebuild
  private async rebuild(
    changeOfFiles: ChangeOfFile[],
    asyncEvent: boolean,
  ): Promise<void> {
    //#region @backendFunc

    Helpers.taskStarted(`Rebuilding app.hosts.ts`);
    // if (asyncEvent) {
    //   console.log('ASYNC EVNET changeOfFiles', changeOfFiles);
    //   // console.log('env release', this.envOptions.release);
    // } else {
    //   console.log('SYNC EVNET changeOfFiles', changeOfFiles);
    // }
    const taonContexts = this.project.framework.getAllDetectedTaonContexts();
    if(_.isEqual(taonContexts,this.lastTaonContexts)) {
      Helpers.logInfo(`No need for taon context update in app.hosts `)
      return;
    }
    this.lastTaonContexts = taonContexts;
    this.writePortsToFile();
    await this.updatePortsInHosts(this.envOptions);

    Helpers.taskDone(`Rebuilding docker environment Done`);
    //#endregion
  }
  async action({
    changeOfFiles,
    asyncEvent,
  }: {
    changeOfFiles: ChangeOfFile[];
    asyncEvent: boolean;
  }): Promise<void> {
    //#region @backendFunc
    changeOfFiles = changeOfFiles.filter(c => {
      const relativePath = c.fileAbsolutePath.replace(this.baseSrcFolder, '');
      return this.project.framework.contextFilter(relativePath);
    });
    if (changeOfFiles.length === 0) {
      Helpers.logInfo(`No file detected that affects app.hosts.ts`)
      return;
    }
    await this.rebuild(changeOfFiles, asyncEvent);
    //#endregion
  }
  //#endregion

  //#region private methods / write ports to file
  public writePortsToFile(): void {
    // #region @backend
    Helpers.taskStarted('Writing hosts and ports config to app.hosts ...');
    const appHostsFile = crossPlatformPath(
      path.join(this.project.location, config.folder.src, 'app.hosts.ts'),
    );
    const filesWithContexts = {} as { [fileRelativePath: string]: string[] };

    // console.log({ taonContexts });
    for (const context of this.lastTaonContexts) {
      if (!filesWithContexts[context.fileRelativePath]) {
        filesWithContexts[context.fileRelativePath] = [];
      }
      filesWithContexts[context.fileRelativePath].push(context.contextName);
    }
    let counter = 0;

    const tempalte = (n?: number) => {
      return (
        `
/**
 * Your context backend port
 * ${!n ? '@deprecated use HOST_BACKEND_PORT_n instead' : ''}
 */
export const HOST_BACKEND_PORT${n ? `_${n}` : ''} = ` +
        `${this.prefixVarTemplate('HOST_BACKEND_PORT', n) + (n ? `undefined` : 'HOST_BACKEND_PORT_1')};
/**
 * Angular website url with normal/nodejs backend
 * ${!n ? '@deprecated use FRONTEND_NORMAL_APP_PORT_n instead' : ''}
 */
export const FRONTEND_NORMAL_APP_PORT${n ? `_${n}` : ''} = ` +
        `${this.prefixVarTemplate('FRONTEND_NORMAL_APP_PORT', n) + (n ? `undefined` : 'FRONTEND_NORMAL_APP_PORT_1')};

/**
 * @deprecated use FRONTEND_NORMAL_APP_PORT instead
*/
export const CLIENT_DEV_NORMAL_APP_PORT${n ? `_${n}` : ''} = FRONTEND_NORMAL_APP_PORT${n ? `_${n}` : ''};

/**
 * Angular website url with websql backend
 * ${!n ? '@deprecated use FRONTEND_WEBSQL_APP_PORT_n instead' : ''}
 */
export const FRONTEND_WEBSQL_APP_PORT${n ? `_${n}` : ''} = ` +
        `${this.prefixVarTemplate('FRONTEND_WEBSQL_APP_PORT', n) + (n ? `undefined` : 'FRONTEND_WEBSQL_APP_PORT_1')};

/**
 * @deprecated use FRONTEND_WEBSQL_APP_PORT instead
*/
export const CLIENT_DEV_WEBSQL_APP_PORT${n ? `_${n}` : ''} = FRONTEND_WEBSQL_APP_PORT${n ? `_${n}` : ''};

/**
 * Electron/angular website url for electron app purpose (ipc backend)
 */
export const FRONTEND_NORMAL_ELECTRON_PORT${n ? `_${n}` : ''} = ${n ? `undefined` : 'FRONTEND_NORMAL_ELECTRON_PORT_1'};
// electron websql not supported yet
// export const FRONTEND_WEBSQL_ELECTRON_PORT${n ? `_${n}` : ''} = ${n ? `undefined` : 'FRONTEND_WEBSQL_ELECTRON_PORT_1'};
/**
 * Backend url - use as "host" inside your context
 * ${!n ? '@deprecated use HOST_URL_n instead' : ''}
 */
export const HOST_URL${n ? `_${n}` : ''} =  ${this.prefixVarTemplate('HOST_URL', n)} ('http://localhost:' + HOST_BACKEND_PORT${n ? `_${n}` : ''});
/**
 * Frontend host url - use as "frontendHost" inside your context
 * ${!n ? '@deprecated use FRONTEND_HOST_URL_n instead' : ''}
 */
export const FRONTEND_HOST_URL${n ? `_${n}` : ''} = ${this.prefixVarTemplate('FRONTEND_HOST_URL', n)}  ( 'http://localhost:' +
  (isWebSQLMode ? FRONTEND_WEBSQL_APP_PORT${n ? `_${n}` : ''} : FRONTEND_NORMAL_APP_PORT${n ? `_${n}` : ''}));
/**
 * Frontend electron host url - use in app.electron.ts with win.loadURL(FRONTEND_HOST_URL_ELECTRON);
 */
export const FRONTEND_HOST_URL_ELECTRON${n ? `_${n}` : ''} = 'http://localhost:' + FRONTEND_NORMAL_ELECTRON_PORT${n ? `_${n}` : ''}
// electron websql not supported yet
// export const FRONTEND_HOST_URL_ELECTRON${n ? `_${n}` : ''} =
//  'http://localhost:' +
//  (isWebSQLMode ? FRONTEND_WEBSQL_ELECTRON_PORT${n ? `_${n}` : ''} : FRONTEND_NORMAL_ELECTRON_PORT${n ? `_${n}` : ''});

  `
      );
    };
    const depecationMessage = `\n/** @deprecated avoid using HOST_CONFIG inside library code (src/lib/**) */\n`;
    Helpers.writeFile(
      appHostsFile,
      `
${THIS_IS_GENERATED_INFO_COMMENT}
${'imp' + 'ort'} { APP_ID } from '${'./lib/build-info._auto-generated_'}';
let isWebSQLMode: boolean = false;
//#${'reg' + 'ion'} @${'bac' + 'kend'}
isWebSQLMode = false;
//#${'end' + 'reg' + 'ion'}

//#${'reg' + 'ion'} @${'web' + 'sql' + 'Only'}
isWebSQLMode = true;
//#${'end' + 'reg' + 'ion'}

const nodeENV = (()=> {
  let env: any;
  //#${'reg' + 'ion'} @${'bac' + 'kend'}
  env = process.env || {};
  //#${'endr' + 'egion'}
  //#${'reg' + 'ion'} @${'bro' + 'wser'}
  env = globalThis['ENV'] || {};
  //#${'endr' + 'egion'}
  return env || {};
})();

const argsENV = (()=> {
  let env: any;
  //#${'reg' + 'ion'} @${'bac' + 'kend'}
  env = require('minimist')(process.argv);
  //#${'endr' + 'egion'}
  return env || {};
})();


${_.times(this.lastTaonContexts.length, i => {
  return tempalte(i + 1);
}).join('\n')}
${tempalte()}

export const HOST_CONFIG = {
${Object.keys(filesWithContexts)
  .sort((a, b) => a.localeCompare(b))
  .map((contextFileName, index) => {
    const contextsInFile = (filesWithContexts[contextFileName] || []).sort(
      (a, b) => a.localeCompare(b),
    );
    const markAsDepecated = contextFileName.startsWith('lib/');
    return `
    ${markAsDepecated ? depecationMessage : `\n/** Relative file path for context */\n`}
    '${contextFileName}' : {
${contextsInFile
  .map((contextName, i) => {
    ++counter;

    return `
${markAsDepecated ? depecationMessage : `\n/** Name of context (var, let, const variable) inside *.ts file. */\n`}
        '${contextName}': {
         ${markAsDepecated ? depecationMessage : ''}
         host: HOST_URL_${counter},
         ${markAsDepecated ? depecationMessage : ''}
         frontendHost: FRONTEND_HOST_URL_${counter},
         ${markAsDepecated ? depecationMessage : ''}
         appId: APP_ID,
        }`;
  })
  .map(c => c.trimStart())
  .join(',\n')}}`;
  })
  .join(',\n')}
}

${THIS_IS_GENERATED_INFO_COMMENT}


      `,
    );
    Helpers.taskDone('Done writing ports and hosts to app.hosts.ts');
    //#endregion
  }
  //#endregion

  //#region prefix var template
  protected prefixVarTemplate(varName: string, n: number | undefined): string {
    return (
      `nodeENV['${varName}${n ? `_${n}` : ''}'] || ` +
      `argsENV['${varName}${n ? `_${n}` : ''}'] || `
    );
  }
  //#endregion

  //#region public methods / update ports in hosts
  public async updatePortsInHosts(buildOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    let contexts: string[] = [];
    type ContextOptions = {
      num: number;
      nodeBeAppPort?: number;
      ngWebsqlAppPort?: number;
      ngWebsqlElectronPort?: number;
      ngNormalAppPort?: number;
      ngNormalElectronPort?: number;
    };

    const contextTemplate = (options: ContextOptions): string => {
      return `## CONTEXT ${options.num}:
- nodejs backend http://localhost:${options.nodeBeAppPort}
- normal frontend app for nodejs backend http://localhost:${options.ngNormalAppPort}
- websql app backend/frontend http://localhost:${options.ngWebsqlAppPort}
`;
    };

    const numberOfContexts =
      this.project.framework.getAllDetectedTaonContexts().length;
    for (let i = 0; i < numberOfContexts; i++) {
      const nodeBeAppPort = await this.NODE_BACKEND_PORT_UNIQ_KEY(
        buildOptions.clone({
          build: {
            websql: false,
          },
          release: {
            targetArtifact: 'angular-node-app',
          },
        }),
        i + 1,
      );
      const ngWebsqlAppPort = await this.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
        buildOptions.clone({
          build: {
            websql: true,
          },
          release: {
            targetArtifact: 'angular-node-app',
          },
        }),
        {
          num: i + 1,
        },
      );
      const ngNormalAppPort = await this.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
        buildOptions.clone({
          build: {
            websql: false,
          },
          release: {
            targetArtifact: 'angular-node-app',
          },
        }),
        {
          num: i + 1,
        },
      );

      const ngWebsqlElectronPort =
        await this.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
          buildOptions.clone({
            build: {
              websql: true,
            },
            release: {
              targetArtifact: 'electron-app',
            },
          }),
          {
            num: i + 1,
          },
        );

      const ngNormalElectronPort =
        await this.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
          buildOptions.clone({
            build: {
              websql: false,
            },
            release: {
              targetArtifact: 'electron-app',
            },
          }),
          {
            num: i + 1,
          },
        );

      contexts.push(
        contextTemplate({
          num: i + 1,
          nodeBeAppPort,
          ngWebsqlAppPort,
          ngWebsqlElectronPort,
          ngNormalAppPort,
          ngNormalElectronPort,
        }),
      );

      UtilsTypescript.setValueToVariableInTsFile(
        this.project.pathFor('src/app.hosts.ts'),
        'HOST_BACKEND_PORT_' + (i + 1),
        this.prefixVarTemplate('HOST_BACKEND_PORT', i + 1) + nodeBeAppPort,
        {
          useRawStringValue: true,
        },
      );

      UtilsTypescript.setValueToVariableInTsFile(
        this.project.pathFor('src/app.hosts.ts'),
        'FRONTEND_WEBSQL_APP_PORT_' + (i + 1),
        this.prefixVarTemplate('FRONTEND_WEBSQL_APP_PORT', i + 1) +
          ngWebsqlAppPort,
        {
          useRawStringValue: true,
        },
      );

      UtilsTypescript.setValueToVariableInTsFile(
        this.project.pathFor('src/app.hosts.ts'),
        'FRONTEND_NORMAL_APP_PORT_' + (i + 1),
        this.prefixVarTemplate('FRONTEND_NORMAL_APP_PORT', i + 1) +
          ngNormalAppPort,
        {
          useRawStringValue: true,
        },
      );

      // TODO electron websql not supported yet
      // UtilsTypescript.setValueToVariableInTsFile(
      //   this.project.pathFor('src/app.hosts.ts'),
      //   'FRONTEND_WEBSQL_ELECTRON_PORT_' + (i + 1),
      //   ngWebsqlElectronPort,
      // );

      UtilsTypescript.setValueToVariableInTsFile(
        this.project.pathFor('src/app.hosts.ts'),
        'FRONTEND_NORMAL_ELECTRON_PORT_' + (i + 1),
        ngNormalElectronPort,
      );
    }

    this.project.writeFile(
      'BUILD-INFO.md',
      `# CURRENT BUILD INFO

Project name: **${this.project.name}** <br>
Project npm name: **${this.project.nameForNpmPackage}**

${contexts.join('\n')}
`,
    );
    //#endregion
  }
  //#endregion

  //#region public methods / get ng server unique key
  async APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
    buildOptions: Partial<EnvOptions>,
    options?: {
      num?: number;
    },
  ): Promise<number> {
    //#region @backendFunc
    options = options || ({} as any);
    const { num } = options;
    buildOptions = EnvOptions.from(buildOptions);
    const key =
      `ng ${buildOptions.release.targetArtifact === 'electron-app' ? 'electron' : 'app'}` +
      ` (${buildOptions.build.websql ? 'websql' : 'normal'})` +
      ` # context=${num || 1} `;
    return await this.project.registerAndAssignPort(key, {
      startFrom: DEFAULT_PORT.APP_BUILD_LOCALHOST,
    });
    //#endregion
  }
  //#endregion

  //#region public methods / get node backend unique key
  async NODE_BACKEND_PORT_UNIQ_KEY(
    buildOptions: EnvOptions,
    num?: Number,
  ): Promise<number> {
    buildOptions = EnvOptions.from(buildOptions);
    const key = `node backend${num ? ` (${num})` : ''}`;
    return await this.project.registerAndAssignPort(key, {
      startFrom: DEFAULT_PORT.SERVER_LOCALHOST,
    });
  }
  //#endregion
}
