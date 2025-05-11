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
import { InsideStructuresApp } from '../npm-lib-and-cli-tool/tools/inside-structures/inside-structures';

import { AssetsFileListGenerator } from './tools/assets-list-file-generator';
import { AssetsManager } from './tools/assets-manager';
import { AngularFeBasenameManager } from './tools/basename-manager';
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
  public readonly assetsFileListGenerator: AssetsFileListGenerator;
  public readonly assetsManager: AssetsManager;

  //#endregion

  //#region constructor
  constructor(readonly project: Project) {
    super(project, 'angular-node-app');
    this.migrationHelper = new MigrationHelper(project);
    this.angularFeBasenameManager = new AngularFeBasenameManager(project);
    this.insideStructureApp = new InsideStructuresApp(project);
    this.assetsFileListGenerator = new AssetsFileListGenerator(project);
    this.assetsManager = new AssetsManager(project);
  }
  //#endregion

  //#region init partial
  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc

    initOptions = await this.project.environmentConfig.update(initOptions);
    await this.insideStructureApp.init(initOptions);
    this.fixAppTsFile();

    // Build assets file for app in app build mode
    if (this.project.framework.isStandaloneProject) {
      if (initOptions.build.watch) {
        await this.assetsFileListGenerator.startAndWatch(
          initOptions.build.websql,
        );
      } else {
        await this.assetsFileListGenerator.start(initOptions.build.websql);
      }
    }

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

    buildOptions = await this.initPartial(EnvOptions.from(buildOptions));
    await this.updatePortsInHosts(buildOptions); // QUICK_FIX second time update because of cloning env

    const shouldSkipBuild = this.shouldSkipBuild(buildOptions);

    //#region prevent empty base href
    if (!_.isUndefined(buildOptions.build.baseHref)) {
      Helpers.error(
        `Build baseHref only can be specify when` +
          ` build lib code:

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

    const appDistOutBrowserAngularAbsPath =
      this.getOutDirAngularBrowserAppAbsPath(buildOptions);

    const appDistOutBackendNodeAbsPath =
      this.getOutDirNodeBackendAppAbsPath(buildOptions);

    const fromFileBaseHref = Helpers.readFile(
      this.project.pathFor(tmpBaseHrefOverwriteRelPath),
    );
    buildOptions.build.baseHref = fromFileBaseHref;

    this.project.writeFile(
      'src/vars.scss',
      `${THIS_IS_GENERATED_INFO_COMMENT}
// current build base href
$basename: '${buildOptions.build.baseHref}';
$website_title: '${buildOptions.website.title}';
$website_domain: '${buildOptions.website.domain}';
$project_npm_name: '${this.project.nameForNpmPackage}';
${THIS_IS_GENERATED_INFO_COMMENT}
`,
    );

    const portAssignedToAppBuild: number = Number(
      buildOptions.build.websql
        ? buildOptions.ports.ngWebsqlAppPort
        : buildOptions.ports.ngNormalAppPort,
    );

    if (buildOptions.build.watch) {
      await Helpers.killProcessByPort(portAssignedToAppBuild);
    }

    //#region prepare angular command
    const outPutPathCommand = ` --output-path ${appDistOutBrowserAngularAbsPath} `;

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
        ` ${outPutPathCommand} `;
    //#endregion

    const angularTempProj = this.globalHelper.getProxyNgProj(buildOptions);

    const showInfoAngular = () => {
      Helpers.logInfo(`

  ANGULAR BUILD APP COMMAND: ${angularBuildAppCmd}

  inside: ${angularTempProj.location}

  `);
    };

    showInfoAngular();

    const isStandalone = this.project.framework.isStandaloneProject;
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
      Helpers.git.cleanRepoFromAnyFilesExceptDotGitFolder(
        staticPagesProjLocation,
      );
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
    // TODO @LAST this should be set externally
    buildOptions.ports.ngNormalAppPort =
      buildOptions.ports.ngNormalAppPort ||
      (await this.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(buildOptions));

    buildOptions.ports.ngWebsqlAppPort =
      buildOptions.ports.ngWebsqlAppPort ||
      (await this.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
        buildOptions.clone({
          build: {
            websql: true,
          },
        }),
      ));

    buildOptions.ports.nodeBeAppPort =
      buildOptions.ports.nodeBeAppPort ||
      (await this.NODE_BACKEND_PORT_UNIQ_KEY(buildOptions));

    UtilsTypescript.setValueToVariableInTsFile(
      this.project.pathFor('src/app.hosts.ts'),
      'HOST_BACKEND_PORT',
      buildOptions.ports.nodeBeAppPort,
    );

    UtilsTypescript.setValueToVariableInTsFile(
      this.project.pathFor('src/app.hosts.ts'),
      'CLIENT_DEV_WEBSQL_APP_PORT',
      buildOptions.ports.ngWebsqlAppPort,
    );

    UtilsTypescript.setValueToVariableInTsFile(
      this.project.pathFor('src/app.hosts.ts'),
      'CLIENT_DEV_NORMAL_APP_PORT',
      buildOptions.ports.ngNormalAppPort,
    );

    this.project.writeFile(
      'BUILD-INFO.md',
      `
# CURRENT BUILD INFO

## NORMAL APP FRONTEND:
http://localhost:${buildOptions.ports.ngNormalAppPort}

- normal app node backend:
http://localhost:${buildOptions.ports.nodeBeAppPort}

## WEBSQL APP BACKEND/FRONTEND:
http://localhost:${buildOptions.ports.ngWebsqlAppPort}


      `,
    );
    //#endregion
  }
  //#endregion

  //#region public methods / get ng server unique key
  async APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
    buildOptions: Partial<EnvOptions>,
  ): Promise<number> {
    buildOptions = EnvOptions.from(buildOptions);
    const key =
      `${buildOptions.build.watch ? 'serve' : 'build'} ` +
      `ng app (${buildOptions.build.websql ? 'websql' : 'normal'})`;
    return await this.project.registerAndAssignPort(key, {
      startFrom: DEFAULT_PORT.APP_BUILD_LOCALHOST,
    });
  }
  //#endregion

  //#region public methods / get node backend unique key
  async NODE_BACKEND_PORT_UNIQ_KEY(buildOptions: EnvOptions): Promise<number> {
    buildOptions = EnvOptions.from(buildOptions);
    const key = `node backend`;
    return await this.project.registerAndAssignPort(key, {
      startFrom: DEFAULT_PORT.SERVER_LOCALHOST,
    });
  }
  //#endregion

  //#endregion

  //#region private methods

  //#region private methods / get static pages cloned project location
  private getStaticPagesClonedProjectLocation(
    releaseOptions: EnvOptions,
  ): string {
    //#region @backendFunc
    const staticPagesRepoBranch = releaseOptions.release.releaseType;
    const repoRoot = this.project.pathFor([
      `.${config.frameworkName}`,
      this.currentArtifactName,
    ]);
    const repoName = `repo-${this.project.name}-for-${releaseOptions.release.releaseType}`;
    const repoPath = crossPlatformPath([repoRoot, repoName]);
    if (!Helpers.exists(repoPath)) {
      Helpers.mkdirp(repoRoot);
      Helpers.git.clone({
        cwd: repoRoot,
        url: this.project.git.remoteOriginUrl,
        override: true,
        destinationFolderName: repoName,
      });
    }
    Helpers.git.resetHard(repoPath);
    Helpers.git.checkout(repoPath, staticPagesRepoBranch, {
      createBranchIfNotExists: true,
      fetchBeforeCheckout: true,
      switchBranchWhenExists: true,
    });
    return repoPath;
    //#endregion
  }
  //#endregion

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
      `.${config.frameworkName}/${this.currentArtifactName}/` +
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
    Helpers.writeFile(
      appHostsFile,
      `
${THIS_IS_GENERATED_INFO_COMMENT}

export const HOST_BACKEND_PORT = undefined;
export const CLIENT_DEV_NORMAL_APP_PORT = undefined;
export const CLIENT_DEV_WEBSQL_APP_PORT = undefined;

${THIS_IS_GENERATED_INFO_COMMENT}


      `,
    );

    //#endregion
  }
  //#endregion

  //#endregion
}
