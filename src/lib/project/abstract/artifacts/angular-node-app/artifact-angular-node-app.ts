//#region imports
import { BaseContext, Taon } from 'taon/src';
import { config } from 'tnp-config/src';
import { crossPlatformPath, path, _ } from 'tnp-core/src';
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';
import {
  createSourceFile,
  isClassDeclaration,
  ScriptTarget,
  Node,
  forEachChild,
} from 'typescript';

import {
  COMPILATION_COMPLETE_APP_NG_SERVE,
  DEFAULT_PORT,
  PortUtils,
  THIS_IS_GENERATED_INFO_COMMENT,
  tmpBaseHrefOverwriteRelPath,
  tmpBuildPort,
} from '../../../../constants';
import { EnvOptions, ReleaseType } from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';
import { InsideStructuresElectron } from '../electron-app/tools/inside-struct-electron';

import { AngularFeBasenameManager } from './tools/basename-manager';
import { InsideStructuresApp } from './tools/inside-struct-app';
import { MigrationHelper } from './tools/migrations-helper';

//#endregion

export class ArtifactAngularNodeApp extends BaseArtifact<
  {
    appDistOutBrowserAngularAbsPath: string;
    appDistOutBackendNodeAbsPath: string;
    angularNgServeAddress: URL;
    dockerBackendFrontendAppDistOutPath: string;
  },
  ReleasePartialOutput
> {
  //#region fields & getters
  public readonly migrationHelper: MigrationHelper;
  public readonly angularFeBasenameManager: AngularFeBasenameManager;

  public readonly insideStructureApp: InsideStructuresApp;
  public readonly insideStructureElectron: InsideStructuresElectron;

  //#endregion

  //#region constructor
  constructor(readonly project: Project) {
    super(project, 'angular-node-app');
    this.migrationHelper = new MigrationHelper(project);
    this.angularFeBasenameManager = new AngularFeBasenameManager(project);
    this.insideStructureApp = new InsideStructuresApp(project);
    this.insideStructureElectron = new InsideStructuresElectron(project);
  }
  //#endregion

  //#region init partial
  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc
    if (!initOptions.release.targetArtifact) {
      initOptions.release.targetArtifact = 'angular-node-app';
    }
    if (initOptions.release.targetArtifact === 'electron-app') {
      await this.insideStructureElectron.init(initOptions);
    } else {
      await this.insideStructureApp.init(initOptions);
    }
    this.fixAppTsFile();

    const copyFromCoreAssets = (fileName: string) => {
      const coreSource = crossPlatformPath([
        this.project.ins.by(
          'isomorphic-lib',
          this.project.framework.frameworkVersion,
        ).location,
        `app/src/assets/${fileName}`,
      ]);

      const tmpDest = this.project.pathFor(
        `tmp-src-dist${initOptions.build.websql ? '-websql' : ''}` +
          `/assets/${fileName}`,
      );
      Helpers.copyFile(coreSource, tmpDest);
    };

    copyFromCoreAssets('sql-wasm.wasm');
    copyFromCoreAssets('flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2');

    return initOptions;
    //#endregion
  }
  //#endregion

  //#region build partial
  async buildPartial(buildOptions: EnvOptions): Promise<{
    appDistOutBrowserAngularAbsPath: string;
    appDistOutBackendNodeAbsPath: string;
    angularNgServeAddress: URL;
    dockerBackendFrontendAppDistOutPath: string;
  }> {
    //#region @backendFunc

    buildOptions = await this.project.artifactsManager.init(
      EnvOptions.from(buildOptions),
    );

    const shouldSkipBuild = this.shouldSkipBuild(buildOptions);

    //#region prevent empty base href
    if (
      !_.isUndefined(buildOptions.build.baseHref) &&
      !buildOptions.release.releaseType &&
      !buildOptions.build.watch
    ) {
      Helpers.error(
        `Build baseHref only can be specify when build lib code:

      try commands:
      ${config.frameworkName} build:lib --base-href ` +
          `${buildOptions.build.baseHref} ` +
          `# it will do lib code build

      `,
        false,
        true,
      );
    }
    //#endregion

    const dockerBackendFrontendAppDistOutPath: string = void 0; // TODO implement

    const angularTempProj = this.globalHelper.getProxyNgProj(
      buildOptions,
      buildOptions.release.targetArtifact,
    );

    const appDistOutBrowserAngularAbsPath =
      buildOptions.release.targetArtifact === 'electron-app'
        ? angularTempProj.pathFor('dist')
        : this.getOutDirAngularBrowserAppAbsPath(buildOptions);

    const appDistOutBackendNodeAbsPath =
      this.getOutDirNodeBackendAppAbsPath(buildOptions);

    const fromFileBaseHref = Helpers.readFile(
      this.project.pathFor(tmpBaseHrefOverwriteRelPath),
    );
    buildOptions.build.baseHref = buildOptions.build.baseHref
      ? buildOptions.build.baseHref
      : fromFileBaseHref;

    const portAssignedToAppBuild: number =
      await this.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(buildOptions);

    if (buildOptions.build.watch) {
      await Helpers.killProcessByPort(portAssignedToAppBuild);
    }

    //#region prepare angular command
    const outPutPathCommand = ` --output-path ${appDistOutBrowserAngularAbsPath} `;
    const baseHrefCommand = buildOptions.build.baseHref
      ? ` --base-href ${buildOptions.build.baseHref} `
      : '';

    const angularBuildAppCmd = buildOptions.build.watch
      ? `${this.NPM_RUN_NG_COMMAND} serve ${
          buildOptions.release.targetArtifact === 'electron-app'
            ? 'angular-electron'
            : 'app'
        } ` +
        ` ${`--port=${portAssignedToAppBuild}`} ${
          buildOptions.build.angularProd ? '--prod' : ''
        }`
      : `${this.NPM_RUN_NG_COMMAND} build ${
          buildOptions.release.targetArtifact === 'electron-app'
            ? 'angular-electron'
            : 'app'
        }` +
        ` ${buildOptions.build.angularProd ? '--configuration production' : ''} ` +
        ` ${buildOptions.build.watch ? '--watch' : ''}` +
        ` ${outPutPathCommand} ${baseHrefCommand}`;
    //#endregion

    const showInfoAngular = () => {
      Helpers.logInfo(`

  ANGULAR BUILD APP COMMAND: ${angularBuildAppCmd}

  inside: ${angularTempProj.location}

  `);
    };

    showInfoAngular();

    const projectBasePath = this.project.location;

    if (!shouldSkipBuild) {
      await angularTempProj.execute(angularBuildAppCmd, {
        similarProcessKey: 'ng',
        resolvePromiseMsg: {
          stdout: COMPILATION_COMPLETE_APP_NG_SERVE,
        },
        //#region command execute params
        exitOnErrorCallback: async code => {
          if (buildOptions.release.releaseType) {
            throw 'Angular compilation lib error!';
          } else {
            Helpers.error(
              `[${config.frameworkName}] Typescript compilation error (code=${code})`,
              false,
              true,
            );
          }
        },
        outputLineReplace: (line: string) => {
          //#region replace outut line for better debugging
          // console.log('LINE:', line);

          if (line.includes('Warning:')) {
            line = line.replace(projectBasePath + '/', './');
          }

          // TODO QUICK_FIXES for clean errors
          if (
            line.includes('styles.scss?ngGlobalStyle') ||
            (line.includes('./src/styles.scss') &&
              line.includes('/sass-loader/dist/cjs.js')) ||
            (line.includes('HookWebpackError: Module build failed') &&
              line.includes('/sass-loader/dist/cjs.js'))
          ) {
            return '';
          }

          line = line.replace(`src/app/${this.project.name}/`, `./src/`);

          return line;
          //#endregion
        },
        //#endregion
      });
    }

    return {
      appDistOutBackendNodeAbsPath,
      appDistOutBrowserAngularAbsPath,
      angularNgServeAddress: new URL(
        `http://localhost:${portAssignedToAppBuild}`,
      ),
      dockerBackendFrontendAppDistOutPath,
    };
    //#endregion
  }
  //#endregion

  //#region release partial
  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<ReleasePartialOutput> {
    //#region @backendFunc
    releaseOptions = this.updateResolvedVersion(releaseOptions);
    const projectsReposToPushAndTag: string[] = [this.project.location];

    const { appDistOutBrowserAngularAbsPath, appDistOutBackendNodeAbsPath } =
      await this.buildPartial(
        EnvOptions.fromRelease({
          ...releaseOptions,
          // copyToManager: {
          //   skip: true,
          // },
        }),
      );

    if (releaseOptions.release.releaseType === 'static-pages') {
      const staticPagesProjLocation =
        this.getStaticPagesClonedProjectLocation(releaseOptions);
      try {
        await Helpers.git.pullCurrentBranch(staticPagesProjLocation, {
          // @ts-ignore TODO @REMOVE
          exitOnError: false,
        });
      } catch (error) {}
      if (Helpers.exists([staticPagesProjLocation, config.file.taon_jsonc])) {
        Helpers.git.cleanRepoFromAnyFilesExceptDotGitFolder(
          staticPagesProjLocation,
        );
      }
      Helpers.writeFile([appDistOutBrowserAngularAbsPath, '.nojekyll'], '');
      Helpers.copy(appDistOutBrowserAngularAbsPath, staticPagesProjLocation);
      Helpers.git.revertFileChanges(staticPagesProjLocation, 'CNAME');

      Helpers.info(`Static pages release done: ${staticPagesProjLocation}`);

      if (!releaseOptions.release.skipTagGitPush) {
        projectsReposToPushAndTag.unshift(staticPagesProjLocation);
      }
    }

    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      releaseProjPath: appDistOutBrowserAngularAbsPath,
      releaseType: releaseOptions.release.releaseType,
      projectsReposToPushAndTag,
    };
    //#endregion
  }
  //#endregion

  //#region clear partial
  async clearPartial(options: EnvOptions): Promise<void> {
    return void 0; // TODO implement
  }
  //#endregion

  //#region public methods

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

    for (let i = 0; i < this.project.taonJson.numberOfContexts; i++) {
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
        nodeBeAppPort,
      );

      UtilsTypescript.setValueToVariableInTsFile(
        this.project.pathFor('src/app.hosts.ts'),
        'CLIENT_DEV_WEBSQL_APP_PORT_' + (i + 1),
        ngWebsqlAppPort,
      );

      UtilsTypescript.setValueToVariableInTsFile(
        this.project.pathFor('src/app.hosts.ts'),
        'CLIENT_DEV_NORMAL_APP_PORT_' + (i + 1),
        ngNormalAppPort,
      );

      // TODO electron websql not supported yet
      // UtilsTypescript.setValueToVariableInTsFile(
      //   this.project.pathFor('src/app.hosts.ts'),
      //   'CLIENT_DEV_WEBSQL_ELECTRON_PORT_' + (i + 1),
      //   ngWebsqlElectronPort,
      // );

      UtilsTypescript.setValueToVariableInTsFile(
        this.project.pathFor('src/app.hosts.ts'),
        'CLIENT_DEV_NORMAL_ELECTRON_PORT_' + (i + 1),
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

  //#endregion

  //#region private methods

  //#region private methods / get out dir app
  /**
   * Absolute path to the output directory for the app
   */
  getOutDirNodeBackendAppAbsPath(buildOptions: EnvOptions): string {
    let outDirApp =
      `.${config.frameworkName}/${this.currentArtifactName}/` +
      `${buildOptions.release.releaseType ? buildOptions.release.releaseType : 'development'}/` +
      `backend/` +
      `${config.folder.dist}-app${buildOptions.build.websql ? '-websql' : ''}`;

    return this.project.pathFor(outDirApp);
  }
  //#endregion

  //#region private methods / get out dir app
  /**
   * Absolute path to the output directory for the app
   */
  getOutDirAngularBrowserAppAbsPath(buildOptions: EnvOptions): string {
    let outDirApp =
      `.${config.frameworkName}/${buildOptions.release.targetArtifact}/` +
      `${buildOptions.release.releaseType ? buildOptions.release.releaseType : 'development'}/` +
      `${config.folder.browser}/` +
      `${config.folder.dist}-app${buildOptions.build.websql ? '-websql' : ''}`;

    return this.project.pathFor(outDirApp);
  }
  //#endregion

  //#region private methods / fix missing components/modules
  private fixAppTsFile(): string {
    //#region @backendFunc
    if (!this.project.framework.isStandaloneProject) {
      return;
    }

    const relativeAppTs = crossPlatformPath([config.folder.src, 'app.ts']);
    const appFile = this.project.pathFor(relativeAppTs);
    if (Helpers.exists(appFile)) {
      let contentAppFile = Helpers.readFile(appFile);
      let newContentAppFile = this.replaceModuleAndComponentName(
        contentAppFile,
        this.project.name,
      );

      if (contentAppFile !== newContentAppFile) {
        Helpers.writeFile(appFile, newContentAppFile);
        try {
          this.project.formatFile(relativeAppTs);
        } catch (error) {}
      }
    }
    //#endregion
  }
  //#endregion

  //#region private methods / add missing components/modules
  private replaceModuleAndComponentName(
    tsFileContent: string,
    projectName: string,
  ) {
    //#region @backendFunc
    // Parse the source file using TypeScript API

    const sourceFile = createSourceFile(
      'temp.ts',
      tsFileContent,
      ScriptTarget.Latest,
      true,
    );

    let moduleName: string | null = null;
    let componentName: string | null = null;
    let tooMuchToProcess = false;

    const newComponentName = `${_.upperFirst(_.camelCase(projectName))}Component`;
    const newModuleName = `${_.upperFirst(_.camelCase(projectName))}Module`;
    let orignalComponentClassName: string;
    let orignalModuleClassName: string;

    // Visitor to analyze the AST
    const visit = (node: Node) => {
      if (isClassDeclaration(node) && node.name) {
        const className = node.name.text;

        if (className.endsWith('Module')) {
          if (moduleName) {
            // More than one module found, return original content
            tooMuchToProcess = true;
            return;
          }
          moduleName = className;
          orignalModuleClassName = className;
        }

        if (className.endsWith('Component')) {
          if (componentName) {
            // More than one component found, return original content
            tooMuchToProcess = true;
            return;
          }
          componentName = className;
          orignalComponentClassName = className;
        }
      }

      forEachChild(node, visit);
    };

    visit(sourceFile);

    if (tooMuchToProcess) {
      return tsFileContent;
    }

    const moduleTempalte =
      [`\n//#re`, `gion  ${this.project.name} module `].join('') +
      ['\n//#re', 'gion @bro', 'wser'].join('') +
      `\n@NgModule({ declarations: [${newComponentName}],` +
      ` imports: [CommonModule], exports: [${newComponentName}] })\n` +
      `export class ${newModuleName} {}` +
      ['\n//#endre', 'gion'].join('') +
      ['\n//#endre', 'gion'].join('');

    const componentTemplate =
      [`\n//#re`, `gion  ${this.project.name} component `].join('') +
      ['\n//#re', 'gion @bro', 'wser'].join('') +
      `\n@Component({ template: 'hello world fromr ${this.project.name}' })` +
      `\nexport class ${newComponentName} {}` +
      ['\n//#endre', 'gion'].join('') +
      ['\n//#endre', 'gion'].join('');

    if (orignalModuleClassName) {
      tsFileContent = tsFileContent.replace(
        new RegExp(orignalModuleClassName, 'g'),
        newModuleName,
      );
    }

    if (orignalComponentClassName) {
      tsFileContent = tsFileContent.replace(
        new RegExp(orignalComponentClassName, 'g'),
        newComponentName,
      );
    }

    if (moduleName === null && componentName === null) {
      // No module or component found, append new ones
      return (
        tsFileContent + '\n\n' + componentTemplate + '\n\n' + moduleTempalte
      );
    }

    if (moduleName === null && componentName !== null) {
      // append only module
      return tsFileContent + '\n\n' + moduleTempalte;
    }

    if (moduleName !== null && componentName === null) {
      // Either module or component is missing; leave content unchanged
      return tsFileContent + '\n\n' + componentTemplate;
    }

    return tsFileContent;
    //#endregion
  }
  //#endregion

  //#region private methods / write ports to file
  public writePortsToFile(): void {
    // #region @backend
    const appHostsFile = crossPlatformPath(
      path.join(this.project.location, config.folder.src, 'app.hosts.ts'),
    );
    const numOfContexts = this.project.taonJson.numberOfContexts;
    const tempalte = (n?: number) => {
      return `
/**
 * Your context backend port
 */
export const HOST_BACKEND_PORT${n ? `_${n}` : ''} = ${n ? `undefined` : 'HOST_BACKEND_PORT_1'};
/**
 * Angular website url with normal/nodejs backend
 */
export const CLIENT_DEV_NORMAL_APP_PORT${n ? `_${n}` : ''} = ${n ? `undefined` : 'CLIENT_DEV_NORMAL_APP_PORT_1'};
/**
 * Angular website url with websql backend
 */
export const CLIENT_DEV_WEBSQL_APP_PORT${n ? `_${n}` : ''} = ${n ? `undefined` : 'CLIENT_DEV_WEBSQL_APP_PORT_1'};
/**
 * Electron/angular website url for electron app purpose (ipc backend)
 */
export const CLIENT_DEV_NORMAL_ELECTRON_PORT${n ? `_${n}` : ''} = ${n ? `undefined` : 'CLIENT_DEV_NORMAL_ELECTRON_PORT_1'};
// electron websql not supported yet
// export const CLIENT_DEV_WEBSQL_ELECTRON_PORT${n ? `_${n}` : ''} = ${n ? `undefined` : 'CLIENT_DEV_WEBSQL_ELECTRON_PORT_1'};
/**
 * Backend url - use as "host" inside your context
 */
export const HOST_URL${n ? `_${n}` : ''} = 'http://localhost:' + HOST_BACKEND_PORT${n ? `_${n}` : ''};
/**
 * Frontend host url - use as "frontendHost" inside your context
 */
export const FRONTEND_HOST_URL${n ? `_${n}` : ''} =
  'http://localhost:' +
  (isWebSQLMode ? CLIENT_DEV_WEBSQL_APP_PORT${n ? `_${n}` : ''} : CLIENT_DEV_NORMAL_APP_PORT${n ? `_${n}` : ''});
/**
 * Frontend electron host url - use in app.electron.ts with win.loadURL(FRONTEND_HOST_URL_ELECTRON);
 */
export const FRONTEND_HOST_URL_ELECTRON${n ? `_${n}` : ''} = 'http://localhost:' + CLIENT_DEV_NORMAL_ELECTRON_PORT${n ? `_${n}` : ''}
// electron websql not supported yet
// export const FRONTEND_HOST_URL_ELECTRON${n ? `_${n}` : ''} =
//  'http://localhost:' +
//  (isWebSQLMode ? CLIENT_DEV_WEBSQL_ELECTRON_PORT${n ? `_${n}` : ''} : CLIENT_DEV_NORMAL_ELECTRON_PORT${n ? `_${n}` : ''});

  `;
    };
    Helpers.writeFile(
      appHostsFile,
      `
${THIS_IS_GENERATED_INFO_COMMENT}
let isWebSQLMode: boolean = false;
//#${'reg' + 'ion'} @${'bac' + 'kend'}
isWebSQLMode = false;
//#${'end' + 'reg' + 'ion'}

//#${'reg' + 'ion'} @${'web' + 'sql' + 'Only'}
isWebSQLMode = true;
//#${'end' + 'reg' + 'ion'}

${_.times(numOfContexts, i => {
  return tempalte(i + 1);
}).join('\n')}
${tempalte()}

${THIS_IS_GENERATED_INFO_COMMENT}


      `,
    );

    //#endregion
  }
  //#endregion

  //#endregion
}
