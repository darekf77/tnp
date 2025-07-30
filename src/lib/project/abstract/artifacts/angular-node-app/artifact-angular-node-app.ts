//#region imports
import { BaseContext, Taon } from 'taon/src';
import { config } from 'tnp-config/src';
import { crossPlatformPath, path, _, UtilsYaml } from 'tnp-core/src';
import { UtilsOs, UtilsTerminal } from 'tnp-core/src';
import { Helpers, UtilsTypescript, DockerComposeFile } from 'tnp-helpers/src';
import { UtilsDotFile } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';
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
  THIS_IS_GENERATED_INFO_COMMENT,
  THIS_IS_GENERATED_STRING,
  tmpBaseHrefOverwriteRelPath,
  tmpBuildPort,
} from '../../../../constants';
import { Development, EnvOptions, ReleaseType } from '../../../../options';
import type { Project } from '../../project';
import { DockerHelper } from '../__helpers__/docker-helper';
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
  },
  ReleasePartialOutput
> {
  //#region fields & getters
  public readonly migrationHelper: MigrationHelper;
  public readonly angularFeBasenameManager: AngularFeBasenameManager;
  public readonly docker: DockerHelper;
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
    this.docker = new DockerHelper(project);
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

    // await this.project.docker.runTask({
    //   watch: initOptions.build.watch,
    //   initialParams: {
    //     envOptions: initOptions,
    //   },
    // });

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

    const appDistOutBackendNodeAbsPath =
      this.getOutDirNodeBackendAppAbsPath(buildOptions);

    if (
      buildOptions.release.releaseType === 'local' ||
      buildOptions.release.releaseType === 'manual'
    ) {
      await this.buildBackend(buildOptions, appDistOutBackendNodeAbsPath);
    }

    const angularTempProj = this.globalHelper.getProxyNgProj(
      buildOptions,
      buildOptions.release.targetArtifact,
    );

    const appDistOutBrowserAngularAbsPath =
      buildOptions.release.targetArtifact === 'electron-app'
        ? angularTempProj.pathFor('dist')
        : this.getOutDirAngularBrowserAppAbsPath(buildOptions);

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

    if (!buildOptions.build.watch) {
      Helpers.remove(appDistOutBrowserAngularAbsPath);
    }

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
          // : buildOptions.build.angularSsr
          //   ? 'ssr'
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

    if (!buildOptions.build.watch) {
      this.project.framework.recreateFileFromCoreProject({
        relativePathInCoreProject:
          'docker-templates/angular-app-node/Dockerfile',
        customDestinationLocation: [
          appDistOutBrowserAngularAbsPath,
          'Dockerfile',
        ],
      });
    }

    return {
      appDistOutBackendNodeAbsPath,
      appDistOutBrowserAngularAbsPath,
      angularNgServeAddress: new URL(
        `http://localhost:${portAssignedToAppBuild}`,
      ),
    };
    //#endregion
  }

  private async buildBackend(
    buildOptions: EnvOptions,
    appDistOutBackendNodeAbsPath,
  ): Promise<void> {
    //#region @backendFunc
    Helpers.remove(appDistOutBackendNodeAbsPath);
    await Helpers.bundleCodeIntoSingleFile(
      this.project.pathFor('dist/app.js'),
      crossPlatformPath([appDistOutBackendNodeAbsPath, 'dist/app.js']),
      {
        minify: buildOptions.release.nodeBackendApp.minify,
        strategy: 'node-app',
        additionalExternals: [
          ...this.project.taonJson.additionalExternalsFor('angular-node-app'),
        ],
        additionalReplaceWithNothing: [
          ...this.project.taonJson.additionalReplaceWithNothingFor(
            'angular-node-app',
          ),
        ],
      },
    );

    const copyToBackendBundle = [
      'run.js',
      'README.md',
      'dist/lib/build-info._auto-generated_.js',
    ];

    for (const relativePathBundleBackend of copyToBackendBundle) {
      Helpers.copyFile(
        this.project.pathFor(relativePathBundleBackend),
        crossPlatformPath([
          appDistOutBackendNodeAbsPath,
          relativePathBundleBackend,
        ]),
      );
    }

    const nodeJsAppNativeDeps = [
      ...this.project.taonJson.getNativeDepsFor('angular-node-app'),
      'lodash',
      'minimist',
      'fs-extra',
      'sql.js',
    ];

    const dependenciesNodeJsApp =
      this.project.framework.coreProject.getValueFromJSON(
        'docker-templates/backend-app-node/package.json',
        'dependencies',
      );

    for (const nativeDepName of nodeJsAppNativeDeps) {
      const version = this.project.packageJson.dependencies[nativeDepName];
      if (version) {
        Helpers.logInfo(
          `Setting native dependency ${nativeDepName} to version ${version}`,
        );
        dependenciesNodeJsApp[nativeDepName] =
          this.project.packageJson.dependencies[nativeDepName];
      } else {
        Helpers.warn(
          `Native dependency ${nativeDepName} not found in taon package.json dependencies`,
        );
      }
    }

    Helpers.writeJson(
      [appDistOutBackendNodeAbsPath, config.file.package_json],
      {
        name: this.project.packageJson.name,
        version: this.project.packageJson.version,
        dependencies: dependenciesNodeJsApp,
      } as PackageJson,
    );

    this.project.framework.recreateFileFromCoreProject({
      relativePathInCoreProject: 'docker-templates/backend-app-node/Dockerfile',
      customDestinationLocation: [appDistOutBackendNodeAbsPath, 'Dockerfile'],
    });

    this.project.framework.recreateFileFromCoreProject({
      relativePathInCoreProject: 'app/src/assets/sql-wasm.wasm',
      customDestinationLocation: [
        appDistOutBackendNodeAbsPath,
        'dist/sql-wasm.wasm',
      ],
    });

    //#endregion
  }

  //#endregion

  //#region release partial
  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<ReleasePartialOutput> {
    //#region @backendFunc

    //#region update resolved variables
    releaseOptions = this.updateResolvedVersion(releaseOptions);
    const projectsReposToPushAndTag: string[] = [this.project.location];
    const projectsReposToPush: string[] = [];

    const { appDistOutBrowserAngularAbsPath, appDistOutBackendNodeAbsPath } =
      await this.buildPartial(
        EnvOptions.fromRelease({
          ...releaseOptions,
          // copyToManager: {
          //   skip: true,
          // },
        }),
      );
    let releaseProjPath: string = appDistOutBrowserAngularAbsPath;

    releaseOptions.release.skipStaticPagesVersioning = _.isUndefined(
      releaseOptions.release.skipStaticPagesVersioning,
    )
      ? true
      : releaseOptions.release.skipStaticPagesVersioning;
    //#endregion

    if (releaseOptions.release.releaseType === 'static-pages') {
      //#region static pages release
      const releaseData = await this.staticPagesDeploy(
        appDistOutBrowserAngularAbsPath,
        releaseOptions,
      );
      releaseProjPath = releaseData.releaseProjPath;
      projectsReposToPush.push(...releaseData.projectsReposToPush);
      //#endregion
    } else if (releaseOptions.release.releaseType === 'local') {
      //#region local release

      //#region copy to local release folder
      const localReleaseOutputBasePath = this.project.pathFor([
        config.folder.local_release,
        this.currentArtifactName,
        `${this.project.name}-latest`,
      ]);
      Helpers.copy(appDistOutBrowserAngularAbsPath, [
        localReleaseOutputBasePath,
        path.basename(appDistOutBrowserAngularAbsPath),
      ]);
      Helpers.copy(appDistOutBackendNodeAbsPath, [
        localReleaseOutputBasePath,
        path.basename(appDistOutBackendNodeAbsPath),
      ]);
      releaseProjPath = localReleaseOutputBasePath;

      const dependenciesNodeJsApp =
        this.project.framework.coreProject.getValueFromJSON(
          'docker-templates/angular-app-node/package.json',
          'dependencies',
        );

      Helpers.setValueToJSON(
        [
          localReleaseOutputBasePath,
          path.basename(appDistOutBrowserAngularAbsPath),
          config.file.package_json,
        ],
        'dependencies',
        dependenciesNodeJsApp,
      );

      Helpers.setValueToJSON(
        [
          localReleaseOutputBasePath,
          path.basename(appDistOutBrowserAngularAbsPath),
          config.file.package_json,
        ],
        'name',
        path.basename(appDistOutBrowserAngularAbsPath),
      );

      Helpers.setValueToJSON(
        [
          localReleaseOutputBasePath,
          path.basename(appDistOutBackendNodeAbsPath),
          config.file.package_json,
        ],
        'name',
        path.basename(appDistOutBackendNodeAbsPath),
      );

      Helpers.setValueToJSON(
        [
          localReleaseOutputBasePath,
          path.basename(appDistOutBrowserAngularAbsPath),
          config.file.package_json,
        ],
        'version',
        releaseOptions.release.resolvedNewVersion,
      );

      Helpers.setValueToJSON(
        [
          localReleaseOutputBasePath,
          path.basename(appDistOutBackendNodeAbsPath),
          config.file.package_json,
        ],
        'version',
        releaseOptions.release.resolvedNewVersion,
      );
      //#endregion

      //#region handle docker-compose files

      const dockerComposeRelativePath = 'docker-templates/docker-compose.yml';
      const dockerComposeYmlDestPath = crossPlatformPath([
        localReleaseOutputBasePath,
        path.basename(dockerComposeRelativePath),
      ]);

      this.project.framework.recreateFileFromCoreProject({
        relativePathInCoreProject: dockerComposeRelativePath,
        customDestinationLocation: dockerComposeYmlDestPath,
      });

      (() => {
        const startJsRelativePath = 'docker-templates/start.ts';
        const startJsDestPath = crossPlatformPath([
          localReleaseOutputBasePath,
          path.basename(startJsRelativePath),
        ]);

        this.project.framework.recreateFileFromCoreProject({
          relativePathInCoreProject: startJsRelativePath,
          customDestinationLocation: startJsDestPath,
        });
      })();

      (() => {
        const startJsRelativePath =
          'docker-templates/angular-app-node/index.js';
        const startJsDestPath = crossPlatformPath([
          localReleaseOutputBasePath,
          'angular-app-node/index.js',
        ]);

        this.project.framework.recreateFileFromCoreProject({
          relativePathInCoreProject: startJsRelativePath,
          customDestinationLocation: startJsDestPath,
        });
      })();

      //#endregion
      const contextsNames =
        this.project.framework.getAllDetectedContextsNames();

      const useDomain = releaseOptions.website.useDomain;
      const domain = releaseOptions.website.domain;

      for (let i = 0; i < contextsNames.length; i++) {
        const index = i + 1; // start from 1
        const contextName = contextsNames[index];
        const portBackendRelease = await this.project.registerAndAssignPort(
          `docker release ${releaseOptions.release.releaseType} backend port for ${contextName} (n=${index})`,
        );

        const portFrontendRelease = await this.project.registerAndAssignPort(
          `docker release ${releaseOptions.release.releaseType} frontend port for ${contextName} (n=${index})`,
        );

        UtilsDotFile.setValuesKeysFromObject(
          [localReleaseOutputBasePath, '.env'],
          {
            [`HOST_BACKEND_PORT_${index}`]: portBackendRelease,
            [`HOST_URL_${index}`]: useDomain
              ? domain
              : `http://localhost:${portBackendRelease}`,
            [`FRONTEND_NORMAL_APP_PORT_${index}`]: portFrontendRelease,
            [`FRONTEND_HOST_URL_${index}`]: useDomain
              ? domain
              : `http://localhost:${portFrontendRelease}`,
          },
        );
      }

      UtilsDotFile.setValueToDotFile(
        [localReleaseOutputBasePath, '.env'],
        (
          _.camelCase(this.project.parent?.name) +
          '-' +
          _.camelCase(this.project.name) +
          '-' +
          `release-type-${releaseOptions.release.releaseType}`
        ).toLowerCase(),

        'COMPOSE_PROJECT_NAME',
      );

      const allValues = UtilsDotFile.getValuesKeysAsJsonObject([
        localReleaseOutputBasePath,
        '.env',
      ]);
      const dockerComposeFile = UtilsYaml.readYamlAsJson<DockerComposeFile>(
        dockerComposeYmlDestPath,
      );
      Object.values(dockerComposeFile.services).forEach(c => {
        const all = _.cloneDeep(allValues) as Record<string, string>;
        for (const key of Object.keys(all)) {
          all[key] = `\${${key}}`;
        }
        c.environment = all;
      });

      UtilsYaml.writeJsonToYaml(dockerComposeYmlDestPath, dockerComposeFile);

      const dockerComposeYmlFileContent = Helpers.readFile(
        dockerComposeYmlDestPath,
      );
      Helpers.writeFile(
        dockerComposeYmlDestPath,
        `# ${THIS_IS_GENERATED_STRING}
# FRONTEND APP can ONLY READ VARIABLES THAT START WITH "FRONTEND_", "PUIBLIC_" or "HOST_"
${dockerComposeYmlFileContent}
# ${THIS_IS_GENERATED_STRING}`,
      );

      Helpers.taskDone(`Local release done!`);

      //#endregion
    }

    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      releaseProjPath,
      releaseType: releaseOptions.release.releaseType,
      projectsReposToPushAndTag,
      projectsReposToPush,
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

  //#endregion

  //#region private methods

  //#region private methods / get out dir app
  /**
   * Absolute path to the output directory for the app
   */
  getOutDirNodeBackendAppAbsPath(buildOptions: EnvOptions): string {
    let outDirApp =
      `.${config.frameworkName}/${this.currentArtifactName}/` +
      `${buildOptions.release.releaseType ? buildOptions.release.releaseType : Development}/` +
      `backend-app${buildOptions.build.websql ? '-websql' : '-node'}`;

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
      `${buildOptions.release.releaseType ? buildOptions.release.releaseType : Development}/` +
      `angular-app${buildOptions.build.websql ? '-websql' : '-node'}`;

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

  protected prefixVarTemplate(varName: string, n: number | undefined): string {
    return (
      `nodeENV['${varName}${n ? `_${n}` : ''}'] || ` +
      `argsENV['${varName}${n ? `_${n}` : ''}'] || `
    );
  }

  public writePortsToFile(): void {
    // #region @backend
    const appHostsFile = crossPlatformPath(
      path.join(this.project.location, config.folder.src, 'app.hosts.ts'),
    );
    const filesWithContexts = {} as { [fileRelativePath: string]: string[] };
    const taonContexts = this.project.framework.getAllDetectedTaonContexts();
    // console.log({ taonContexts });
    for (const context of taonContexts) {
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


${_.times(taonContexts.length, i => {
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

    //#endregion
  }
  //#endregion

  //#endregion
}
