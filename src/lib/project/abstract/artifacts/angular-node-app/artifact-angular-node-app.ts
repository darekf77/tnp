//#region imports
import type { AxiosProgressEvent } from 'axios';
import { TaonBaseContext, MulterFileUploadResponse, Taon } from 'taon/src';
import { config, dotTaonFolder } from 'tnp-core/src';
import {
  crossPlatformPath,
  path,
  _,
  UtilsYaml,
  dateformat,
  chalk,
  CoreModels,
} from 'tnp-core/src';
import { UtilsOs, UtilsTerminal } from 'tnp-core/src';
import { UtilsDotFile } from 'tnp-core/src';
import { FilePathMetaData } from 'tnp-core/src';
import { LibTypeEnum } from 'tnp-core/src';
import {
  Helpers,
  UtilsTypescript,
  DockerComposeFile,
  UtilsZip,
  BaseCliWorkerConfigGetContextOptions,
} from 'tnp-helpers/src';
import { UtilsDocker } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import {
  angularProjProxyPath,
  getProxyNgProj,
  templateFolderForArtifact,
} from '../../../../app-utils';
import {
  ACTIVE_CONTEXT,
  AngularJsonAppOrElectronTaskName,
  AngularJsonAppOrElectronTaskNameResolveFor,
  AngularJsonTaskName,
  appFromSrc,
  appFromSrcInsideNgApp,
  assetsFromNgProj,
  assetsFromSrc,
  COMPILATION_COMPLETE_APP_NG_SERVE,
  CoreAssets,
  CoreNgTemplateFiles,
  databases,
  DEFAULT_PORT,
  distFromNgBuild,
  distFromSassLoader,
  distMainProject,
  dotEnvFile,
  globalSpinner,
  keysMap,
  libFromCompiledDist,
  localReleaseMainProject,
  ngProjectStylesScss,
  packageJsonMainProject,
  packageJsonNpmLib,
  readmeMdMainProject,
  routes,
  runJsMainProject,
  srcMainProject,
  srcNgProxyProject,
  suffixLatest,
  TaonCommands,
  TaonGeneratedFiles,
  TemplateFolder,
  THIS_IS_GENERATED_INFO_COMMENT,
  THIS_IS_GENERATED_STRING,
  tmpAppsForDistElectronWebsql,
  tmpAppsForDistWebsql,
  tmpBaseHrefOverwrite,
  tmpSrcDist,
  tmpSrcDistWebsql,
  tsconfigJsonIsomorphicMainProject,
} from '../../../../constants';
import {
  Development,
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { DeploymentsController } from '../../taon-worker/deployments';
import type { DeploymentReleaseData } from '../../taon-worker/deployments/deployments.models';
import { DeploymentsUtils } from '../../taon-worker/deployments/deployments.utils';
import { ProcessesController } from '../../taon-worker/processes/processes.controller';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';
import { InsideStructuresElectron } from '../electron-app/tools/inside-struct-electron';

import { AppHostsRecreateHelper } from './tools/app-hosts-recreate-helper';
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

  public readonly insideStructureApp: InsideStructuresApp;

  public readonly insideStructureElectron: InsideStructuresElectron;

  public readonly appHostsRecreateHelper: AppHostsRecreateHelper;

  //#endregion

  //#region constructor
  constructor(readonly project: Project) {
    super(project, ReleaseArtifactTaon.ANGULAR_NODE_APP);
    this.migrationHelper = new MigrationHelper(project);
    this.angularFeBasenameManager = new AngularFeBasenameManager(project);
    this.insideStructureApp = new InsideStructuresApp(project);
    this.insideStructureElectron = new InsideStructuresElectron(project);
    this.appHostsRecreateHelper = new AppHostsRecreateHelper(project);
  }
  //#endregion

  //#region clear partial
  async clearPartial(options: EnvOptions): Promise<void> {
    this.project.remove(`${routes}/*.rest`, false);
    this.project.remove(`${databases}/*.sqlite`, false);
  }
  //#endregion

  //#region init partial
  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc
    if (!initOptions.release.targetArtifact) {
      initOptions.release.targetArtifact = ReleaseArtifactTaon.ANGULAR_NODE_APP;
    }
    if (
      initOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
    ) {
      await this.insideStructureElectron.init(initOptions);
    } else {
      await this.insideStructureApp.init(initOptions);
    }

    // await this.project.docker.runTask({
    //   watch: initOptions.build.watch,
    //   initialParams: {
    //     envOptions: initOptions,
    //   },
    // });

    const copyFromCoreAssets = (fileName: string) => {
      const coreSource = crossPlatformPath([
        this.project.ins
          .by(
            LibTypeEnum.ISOMORPHIC_LIB,
            this.project.framework.frameworkVersion,
          )
          .pathFor(
            `${templateFolderForArtifact(
              initOptions.release.targetArtifact ===
                ReleaseArtifactTaon.ELECTRON_APP
                ? ReleaseArtifactTaon.ELECTRON_APP
                : ReleaseArtifactTaon.ANGULAR_NODE_APP,
            )}/${srcNgProxyProject}/${assetsFromNgProj}/${fileName}`,
          ),
      ]);

      const browserTsCode = initOptions.build.websql
        ? tmpSrcDistWebsql
        : tmpSrcDist;

      const tmpDest = this.project.pathFor(
        `${browserTsCode}/${assetsFromNgProj}/${fileName}`,
      );
      Helpers.copyFile(coreSource, tmpDest);
    };

    copyFromCoreAssets(CoreAssets.sqlWasmFile);
    copyFromCoreAssets(CoreAssets.mainFont);

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

    // TODO @REMOVE when microfrontends for container ready
    if (this.project.typeIsNot(LibTypeEnum.ISOMORPHIC_LIB)) {
      Helpers.error(
        `Only project type isomorphic-lib can use artifact angular-node-app!`,
        false,
        true,
      );
    }

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
      buildOptions.release.releaseType === ReleaseType.LOCAL ||
      buildOptions.release.releaseType === ReleaseType.MANUAL
    ) {
      await this.buildBackend(buildOptions, appDistOutBackendNodeAbsPath);
    }

    const angularTempProj = getProxyNgProj(
      this.project,
      buildOptions,
      buildOptions.release.targetArtifact,
    );

    const appDistOutBrowserAngularAbsPath =
      buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
        ? angularTempProj.pathFor(distFromNgBuild)
        : this.getOutDirAngularBrowserAppAbsPath(buildOptions);

    const fromFileBaseHref = Helpers.readFile(
      this.project.pathFor(tmpBaseHrefOverwrite),
    );
    buildOptions.build.baseHref = buildOptions.build.baseHref
      ? buildOptions.build.baseHref
      : fromFileBaseHref;

    const portAssignedToAppBuild: number =
      await this.appHostsRecreateHelper.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
        buildOptions,
      );

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

    //#region serve command
    const serveCommand =
      `${this.NPM_RUN_NG_COMMAND} serve ${
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
          ? AngularJsonTaskName.ELECTRON_APP
          : AngularJsonTaskName.ANGULAR_APP
      } ` +
      ` ${`--port=${portAssignedToAppBuild}`} ${
        buildOptions.build.angularProd ? '--prod' : ''
      }` +
      ` --host 0.0.0.0`; // make it accessible in network for development
    //#endregion

    if (buildOptions.build.watch) {
      Helpers.logInfo(`Using ng serve command: ${serveCommand}`);
    }

    //#region build command
    const angularBuildCommand =
      `${this.NPM_RUN_NG_COMMAND} build ${
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
          ? AngularJsonTaskName.ELECTRON_APP
          : AngularJsonTaskName.ANGULAR_APP
        // : buildOptions.build.angularSsr
        //   ? 'ssr'
      }` +
      ` ${buildOptions.build.angularProd ? '--configuration production' : ''} ` +
      ` ${buildOptions.build.watch ? '--watch' : ''}` +
      ` ${outPutPathCommand} ${baseHrefCommand}`;
    //#endregion

    const tmpAppForDistRelativePath = angularProjProxyPath({
      project: this.project,
      targetArtifact: buildOptions.release.targetArtifact,
      websql: buildOptions.build.websql,
    });

    // set correct default config for build/serve in angular.json
    this.project.setValueToJSONC(
      [tmpAppForDistRelativePath, CoreNgTemplateFiles.ANGULAR_JSON],
      `projects.${
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
          ? AngularJsonTaskName.ELECTRON_APP
          : AngularJsonTaskName.ANGULAR_APP
      }.architect.${buildOptions.build.watch ? 'serve' : 'build'}.defaultConfiguration`,
      AngularJsonAppOrElectronTaskNameResolveFor(buildOptions),
    );

    // remove angular cache to prevent weird issues
    this.project.remove([tmpAppForDistRelativePath, '.angular']);

    // quick fix for tsconfig pathing in ng proxy project
    Helpers.createSymLink(
      this.project.pathFor(tsconfigJsonIsomorphicMainProject),
      this.project.pathFor([
        tmpAppForDistRelativePath,
        srcNgProxyProject,
        tsconfigJsonIsomorphicMainProject,
      ]),
    );

    // remove server.ts for electron build
    if (
      buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
    ) {
      this.project.removeFile([
        tmpAppForDistRelativePath,
        srcNgProxyProject,
        CoreNgTemplateFiles.SERVER_TS,
      ]);
    }

    const angularBuildAppCmd = buildOptions.build.watch
      ? serveCommand
      : angularBuildCommand;

    //#endregion

    const showInfoAngular = () => {
      Helpers.logInfo(`

  ARTIFACT ${buildOptions.release.targetArtifact} BUILD COMMAND: ${angularBuildAppCmd}

  inside: ${angularTempProj.location}

  `);
    };

    showInfoAngular();

    const projectBasePath = this.project.location;

    if (!shouldSkipBuild) {
      await angularTempProj.execute(angularBuildAppCmd, {
        similarProcessKey: TaonCommands.NG,
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
            line.includes(`${ngProjectStylesScss}?ngGlobalStyle`) ||
            (line.includes(`./${srcMainProject}/${ngProjectStylesScss}`) &&
              line.includes(`/sass-loader/${distFromSassLoader}/cjs.js`)) ||
            (line.includes('HookWebpackError: Module build failed') &&
              line.includes(`/sass-loader/${distFromSassLoader}/cjs.js`))
          ) {
            return '';
          }

          line = line.replace(
            `${srcNgProxyProject}/${appFromSrcInsideNgApp}/`,
            `./${srcMainProject}/`,
          );

          line = line.replace(
            `${srcNgProxyProject}\\${appFromSrcInsideNgApp}\\`,
            `.\\${srcMainProject}\\`,
          );

          line = line.replace(
            `${srcNgProxyProject}/${appFromSrcInsideNgApp}/${this.project.name}/`,
            `./${srcMainProject}/`,
          );

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

      this.project.framework.recreateFileFromCoreProject({
        relativePathInCoreProject:
          'docker-templates/angular-app-node/nginx.conf',
        customDestinationLocation: [
          appDistOutBrowserAngularAbsPath,
          'nginx.conf',
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
          ...this.project.taonJson.additionalExternalsFor(
            ReleaseArtifactTaon.ANGULAR_NODE_APP,
          ),
        ],
        additionalReplaceWithNothing: [
          ...this.project.taonJson.additionalReplaceWithNothingFor(
            ReleaseArtifactTaon.ANGULAR_NODE_APP,
          ),
        ],
      },
    );

    const copyToBackendBundle = [
      runJsMainProject,
      readmeMdMainProject,
      `${distMainProject}/${libFromCompiledDist}/${TaonGeneratedFiles.BUILD_INFO_AUTO_GENERATED_JS}`,
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
      ...this.project.taonJson.getNativeDepsFor(
        ReleaseArtifactTaon.ANGULAR_NODE_APP,
      ),
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

    Helpers.writeJson([appDistOutBackendNodeAbsPath, packageJsonNpmLib], {
      name: this.project.packageJson.name,
      version: this.project.packageJson.version,
      dependencies: dependenciesNodeJsApp,
    } as PackageJson);

    this.project.framework.recreateFileFromCoreProject({
      relativePathInCoreProject: 'docker-templates/backend-app-node/Dockerfile',
      customDestinationLocation: [appDistOutBackendNodeAbsPath, 'Dockerfile'],
    });

    this.project.framework.recreateFileFromCoreProject({
      relativePathInCoreProject: `${templateFolderForArtifact(
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
          ? ReleaseArtifactTaon.ELECTRON_APP
          : ReleaseArtifactTaon.ANGULAR_NODE_APP,
      )}/${srcNgProxyProject}/${assetsFromNgProj}/${CoreAssets.sqlWasmFile}`,
      customDestinationLocation: [
        appDistOutBackendNodeAbsPath,
        `${distFromNgBuild}/${CoreAssets.sqlWasmFile}`,
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
    let deploymentFunction: () => Promise<void> = void 0;

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

    if (releaseOptions.release.releaseType === ReleaseType.STATIC_PAGES) {
      //#region static pages release
      const releaseData = await this.staticPagesDeploy(
        appDistOutBrowserAngularAbsPath,
        releaseOptions,
      );
      releaseProjPath = releaseData.releaseProjPath;
      projectsReposToPush.push(...releaseData.projectsReposToPush);
      //#endregion
    } else if (
      releaseOptions.release.releaseType === ReleaseType.LOCAL ||
      releaseOptions.release.releaseType === ReleaseType.MANUAL
    ) {
      //#region copy to local release folder
      const localReleaseOutputBasePath =
        releaseOptions.release.releaseType === ReleaseType.LOCAL
          ? this.project.pathFor([
              localReleaseMainProject,
              this.currentArtifactName,
              `${this.project.name}${suffixLatest}`,
            ])
          : this.project.pathFor([
              `.${config.frameworkName}`,
              'release-manual',
              this.currentArtifactName,
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
      //#endregion

      //#region update package.json in backend app
      Helpers.setValueToJSON(
        [
          localReleaseOutputBasePath,
          path.basename(appDistOutBackendNodeAbsPath),
          packageJsonNpmLib,
        ],
        'name',
        path.basename(appDistOutBackendNodeAbsPath),
      );

      Helpers.setValueToJSON(
        [
          localReleaseOutputBasePath,
          path.basename(appDistOutBackendNodeAbsPath),
          packageJsonNpmLib,
        ],
        'version',
        releaseOptions.release.resolvedNewVersion,
      );
      //#endregion

      //#region update docker-compose files

      const dockerComposeRelativePath = 'docker-templates/docker-compose.yml';
      const dockerComposeYmlDestPath = crossPlatformPath([
        localReleaseOutputBasePath,
        path.basename(dockerComposeRelativePath),
      ]);

      this.project.framework.recreateFileFromCoreProject({
        relativePathInCoreProject: dockerComposeRelativePath,
        customDestinationLocation: dockerComposeYmlDestPath,
      });

      //#endregion

      const contextsNames = this.project.framework.getAllDetectedTaonContexts({
        skipLibFolder: true,
      });

      const useDomain = releaseOptions.website.useDomain;
      const domain = releaseOptions.website.domain;

      //#region create one env file for all docker containers
      for (let i = 0; i < contextsNames.length; i++) {
        const contextRealIndex = i + 1; // start from 1
        const contextName = contextsNames[i].contextName;
        const taskNameBackendReleasePort =
          `docker release ${domain} ${releaseOptions.release.releaseType} ` +
          `backend port for ${contextName} (n=${contextRealIndex})`;
        const portBackendRelease = await this.project.registerAndAssignPort(
          taskNameBackendReleasePort,
        );

        const taskNameFrontendreleasePort =
          `docker release ${domain} ${releaseOptions.release.releaseType} ` +
          `frontend port for ${contextName} (n=${contextRealIndex})`;
        const portFrontendRelease = await this.project.registerAndAssignPort(
          taskNameFrontendreleasePort,
        );

        // const unknownProtocol = `https://`;

        // const domainForContextFE = useDomain
        //   ? domain.startsWith('http')
        //     ? domain
        //     : `${unknownProtocol}${domain}`
        //   : `http://localhost:${portFrontendRelease}`;

        const domainForContextFE = useDomain
          ? domain
          : `http://localhost:${portFrontendRelease}`;

        // const domainForContextBE = useDomain
        //   ? domain.startsWith('http')
        //     ? domain
        //     : `${unknownProtocol}${domain}`
        //   : `http://localhost:${portBackendRelease}`;

        const domainForContextBE = useDomain
          ? domain
          : `http://localhost:${portBackendRelease}`;

        UtilsDotFile.setValuesKeysFromObject(
          [localReleaseOutputBasePath, dotEnvFile],
          {
            [`HOST_BACKEND_PORT_${contextRealIndex}`]: portBackendRelease,
            [`HOST_URL_${contextRealIndex}`]: domainForContextBE,
            [`FRONTEND_NORMAL_APP_PORT_${contextRealIndex}`]:
              portFrontendRelease,
            [`FRONTEND_HOST_URL_${contextRealIndex}`]: domainForContextFE,

            ...(i === 0 // fallback to old taon app.hosts values
              ? {
                  [`HOST_BACKEND_PORT`]: portBackendRelease,
                  [`HOST_URL`]: domainForContextBE,
                  [`FRONTEND_NORMAL_APP_PORT`]: portFrontendRelease,
                  [`FRONTEND_HOST_URL`]: domainForContextFE,
                }
              : {}),
          },
        );

        UtilsDotFile.setCommentToKeyInDotFile(
          [localReleaseOutputBasePath, dotEnvFile],
          `HOST_BACKEND_PORT_${contextRealIndex}`,
          `${CoreModels.tagForTaskName}="${taskNameBackendReleasePort}"`,
        );
        if (i === 0) {
          UtilsDotFile.setCommentToKeyInDotFile(
            [localReleaseOutputBasePath, dotEnvFile],
            `HOST_BACKEND_PORT`,
            `${CoreModels.tagForTaskName}="${taskNameBackendReleasePort}"`,
          );
        }
        UtilsDotFile.setCommentToKeyInDotFile(
          [localReleaseOutputBasePath, dotEnvFile],
          `FRONTEND_NORMAL_APP_PORT_${contextRealIndex}`,
          `${CoreModels.tagForTaskName}="${taskNameFrontendreleasePort}"`,
        );
      }

      if (!useDomain) {
        UtilsDotFile.addCommentAtTheBeginningOfDotFile(
          [localReleaseOutputBasePath, dotEnvFile],
          `HINT! IF YOU NEED DOMAIN USE userDomain=true in env.ts`,
        );
      }

      UtilsDotFile.setValueToDotFile(
        [localReleaseOutputBasePath, '.env'],
        'COMPOSE_PROJECT_NAME',
        (
          'TaonDeployment__' +
          _.camelCase(releaseOptions.website.domain) +
          '__' +
          `v${_.kebabCase(this.project.packageJson.version)}` +
          '__' +
          `release-type-${releaseOptions.release.releaseType}` +
          `--env--${
            !releaseOptions.release.envName ||
            releaseOptions.release.envName === '__'
              ? 'default'
              : releaseOptions.release.envName
          }${releaseOptions.release.envNumber || ''}`
        ).toLowerCase(),
      );

      UtilsDotFile.setValueToDotFile(
        [localReleaseOutputBasePath, dotEnvFile],
        'BUILD_DATE',
        `${dateformat(new Date(), 'dd-mm-yyyy_HH:MM:ss')}`,
      );

      UtilsDotFile.setValueToDotFile(
        [localReleaseOutputBasePath, dotEnvFile],
        'NODE_ENV',
        `production`,
      );
      //#endregion

      const allValuesDotEnv = UtilsDotFile.getValuesKeysAsJsonObject([
        localReleaseOutputBasePath,
        dotEnvFile,
      ]);

      //#region update docker-compose file with env variables
      const dockerComposeFile = UtilsYaml.readYamlAsJson<DockerComposeFile>(
        dockerComposeYmlDestPath,
      );

      //#region prepare backend containers
      const backendTemplapteObj =
        dockerComposeFile.services['backend-app-node'];

      delete dockerComposeFile.services['backend-app-node'];

      const containerLabel = `${UtilsDocker.DOCKER_LABEL_KEY}="\${COMPOSE_PROJECT_NAME}"`;

      for (let i = 0; i < contextsNames.length; i++) {
        const index = i + 1; // start from 1
        const contextName = contextsNames[i].contextName;
        const ctxBackend = _.cloneDeep(backendTemplapteObj);

        const containerIdentifierBackendNOde =
          `backend-app-node--${_.kebabCase(releaseOptions.website.domain)}--` +
          `v${_.kebabCase(this.project.packageJson.version)}--${contextName}--ctxIndex${index}`.toLowerCase();

        //#region updating cloned backend template
        const traefikKeyBackend =
          `${containerIdentifierBackendNOde}--` +
          `${releaseOptions.release.envName}${releaseOptions.release.envNumber || ''}`;

        const traefikLabelsBE = [
          `traefik.enable=true`,
          `traefik.http.routers.${traefikKeyBackend}.rule=Host(\`${releaseOptions.website.domain}\`) && PathPrefix(\`/api/CTX/\`)`,
          `traefik.http.routers.${traefikKeyBackend}.entrypoints=websecure`,
          // `traefik.http.routers.${traefikKeyBackend}.tls.certresolver=myresolver`,
          `traefik.http.services.${traefikKeyBackend}.loadbalancer.server.port=$\{HOST_BACKEND_PORT_1\}`,
          containerLabel,
          UtilsDocker.DOCKER_TAON_PROJECT_LABEL,
          // only when sripping prefix
          // 'traefik.http.middlewares.strip-api.stripprefix.prefixes=/api',
          // 'traefik.http.routers.backend.middlewares=strip-api',
        ];
        const traefikLabelsBEObject: Record<string, string> = {};
        traefikLabelsBE.forEach(label => {
          const [key, value] = label.split('=');
          traefikLabelsBEObject[key] = value;
        });
        ctxBackend.labels = { ...ctxBackend.labels, ...traefikLabelsBEObject };
        ctxBackend.container_name = containerIdentifierBackendNOde;
        const all = _.cloneDeep(allValuesDotEnv) as Record<string, string>;
        for (const key of Object.keys(all)) {
          all[key] = `\${${key}}`;
        }
        ctxBackend.environment = all;
        ctxBackend.environment[ACTIVE_CONTEXT] = contextName;
        (() => {
          const keyLoadBalancerServerPort = `traefik.http.services.${traefikKeyBackend}.loadbalancer.server.port`;
          const loadBalancerValue =
            ctxBackend.labels[keyLoadBalancerServerPort];
          ctxBackend.labels[keyLoadBalancerServerPort] =
            loadBalancerValue?.replace('1', index.toString());
        })();

        (() => {
          const httpRouterBackendPortKey = `traefik.http.routers.${traefikKeyBackend}.rule`;
          const loadBalancerValue = ctxBackend.labels[httpRouterBackendPortKey];
          ctxBackend.labels[httpRouterBackendPortKey] =
            loadBalancerValue?.replace('CTX', contextName);
        })();

        const specificForProjectSQliteDbLocation = crossPlatformPath([
          UtilsOs.getRealHomeDir(),
          dotTaonFolder,
          'cloud/docker-backend-databases',
          releaseOptions.website.domain,
          this.project.packageJson.version,
          contextName,
          databases,
        ]);

        ctxBackend.volumes = [
          `${specificForProjectSQliteDbLocation}:/app/${databases}`,
        ];
        //#endregion

        dockerComposeFile.services[containerIdentifierBackendNOde] = ctxBackend;
      }
      //#endregion

      //#region prepare frontend container
      const frontendTemplapteObj =
        dockerComposeFile.services['angular-app-node'];
      delete dockerComposeFile.services['angular-app-node'];

      const ctxFrontend = _.cloneDeep(frontendTemplapteObj);

      const newKeyForContainerFrontendAngular = (
        `angular-app-node--${_.kebabCase(releaseOptions.website.domain)}` +
        `--v${_.kebabCase(this.project.packageJson.version)}`
      ).toLowerCase();

      //#region set traefik labels for frontend app

      const all = _.cloneDeep(allValuesDotEnv) as Record<string, string>;
      for (const key of Object.keys(all)) {
        all[key] = `\${${key}}`;
      }
      ctxFrontend.environment = all;

      const traefikKeyFrontend =
        `${newKeyForContainerFrontendAngular}--` +
        `${releaseOptions.release.envName}${releaseOptions.release.envNumber || ''}`;

      const traefikLabelsFE = [
        `traefik.enable=true`,
        `traefik.http.routers.${traefikKeyFrontend}.rule=Host(\`${releaseOptions.website.domain}\`)`,
        `traefik.http.routers.${traefikKeyFrontend}.entrypoints=websecure`,
        // `traefik.http.routers.${traefikKeyFronend}.tls.certresolver=myresolver`,
        `traefik.http.services.${traefikKeyFrontend}.loadbalancer.server.port=80`,
        containerLabel,
      ];
      const traefikLabelsFEObject: Record<string, string> = {};
      traefikLabelsFE.forEach(label => {
        const [key, value] = label.split('=');
        traefikLabelsFEObject[key] = value;
      });
      ctxFrontend.labels = traefikLabelsFEObject;
      //#endregion

      ctxFrontend.container_name = newKeyForContainerFrontendAngular;

      dockerComposeFile.services[newKeyForContainerFrontendAngular] =
        ctxFrontend;
      //#endregion

      UtilsYaml.writeJsonToYaml(dockerComposeYmlDestPath, dockerComposeFile);

      //#region add info comment to docker-compose.yml file
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
      //#endregion

      //#endregion

      //#region create package.json with start script for whole build
      Helpers.copyFile(this.project.pathFor(packageJsonMainProject), [
        localReleaseOutputBasePath,
        packageJsonNpmLib,
      ]);
      Helpers.setValueToJSON(
        [localReleaseOutputBasePath, packageJsonNpmLib],
        'scripts',
        {},
      );

      Helpers.setValueToJSON(
        [localReleaseOutputBasePath, packageJsonNpmLib],
        'scripts.start',
        `taon preview ./docker-compose.yml`,
      );
      //#endregion

      //#region update index.html with env variables
      (() => {
        const indexHtmlFromAngularAppPath = crossPlatformPath([
          localReleaseOutputBasePath,
          path.basename(appDistOutBrowserAngularAbsPath),
          'index.html',
        ]);

        const envScript = `<script>
      window.ENV = ${JSON.stringify(allValuesDotEnv, null, 2)};
    </script>`;

        let html = Helpers.readFile(indexHtmlFromAngularAppPath);
        // Inject before </head> if found
        html = html.replace(/<\/head>/i, `${envScript}\n</head>`);
        Helpers.writeFile(indexHtmlFromAngularAppPath, html);
      })();
      //#endregion

      //#region display final build info
      Helpers.info(`

      Dockerized version of your app is ready.
      you can run: ${chalk.bold('docker compose up -d')}
      in ${localReleaseOutputBasePath}

      or quick script:
      taon preview ./docker-compose.yml

      `);
      //#endregion

      if (releaseOptions.release.releaseType === ReleaseType.LOCAL) {
        Helpers.taskDone(`Local release done!`);
        // TODO
      } else if (releaseOptions.release.releaseType === ReleaseType.MANUAL) {
        Helpers.taskDone(`Manual release prepared!`);
        deploymentFunction = async () => {
          await this.deployToTaonCloud({
            releaseOptions,
            localReleaseOutputBasePath,
          });
        };
      }
    }

    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      releaseProjPath,
      releaseType: releaseOptions.release.releaseType,
      projectsReposToPushAndTag,
      projectsReposToPush,
      deploymentFunction,
    };
    //#endregion
  }
  //#endregion

  //#region deploy to cloud
  private async deployToTaonCloud({
    releaseOptions,
    localReleaseOutputBasePath,
  }: {
    releaseOptions: EnvOptions;
    localReleaseOutputBasePath?: string;
  }): Promise<void> {
    //#region @backendFunc

    //#region prepare zip newZipFileName file for upload
    const tmpZipLocalReleaseFileAbsPath = await UtilsZip.zipDir(
      localReleaseOutputBasePath,
      {
        overrideIfZipFileExists: true,
      },
    );

    const tmpProjDataForUpload = {
      destinationDomain: releaseOptions.website.domain,
      version: releaseOptions.release.resolvedNewVersion,
      envName: releaseOptions.release.envName,
      envNumber: releaseOptions.release.envNumber || '',
      releaseType: releaseOptions.release.releaseType as ReleaseType,
      projectName: this.project.name,
      targetArtifact: releaseOptions.release.targetArtifact,
    } as DeploymentReleaseData;

    const newBasenameZipFile = FilePathMetaData.embedData(
      _.pick(tmpProjDataForUpload, ['destinationDomain', 'version']),
      path.basename(tmpZipLocalReleaseFileAbsPath),
      {
        skipAddingBasenameAtEnd: true,
        keysMap,
      },
    );

    const newZipFileName = crossPlatformPath([
      path.dirname(tmpZipLocalReleaseFileAbsPath),
      newBasenameZipFile,
    ]);

    Helpers.copyFile(tmpZipLocalReleaseFileAbsPath, newZipFileName);

    Helpers.taskDone(`
      Release zip file prepared for taon cloud deployment!
      Destination taon instance ip (or domain): "${releaseOptions.release.taonInstanceIp}"

      Zip file ready for taon cloud deployment:
${path.dirname(newZipFileName)}
/${path.basename(newZipFileName)}

      `);
    //#endregion

    //#region prepare cloud connections and controllers
    const connectionOptionsDeployments = {
      ipAddressOfTaonInstance: releaseOptions.release.taonInstanceIp,
      port:
        releaseOptions.release.taonInstanceIp === CoreModels.localhostIp127
          ? Number(
              this.project.ins.taonProjectsWorker.deploymentsWorker
                .processLocalInfoObj.port,
            )
          : null,
    } as BaseCliWorkerConfigGetContextOptions;

    const connectionOptionsProcesses = {
      ipAddressOfTaonInstance: releaseOptions.release.taonInstanceIp,
      port:
        releaseOptions.release.taonInstanceIp === CoreModels.localhostIp127
          ? Number(
              this.project.ins.taonProjectsWorker.processesWorker
                .processLocalInfoObj.port,
            )
          : null,
    } as BaseCliWorkerConfigGetContextOptions;

    const deploymentController =
      await this.project.ins.taonProjectsWorker.deploymentsWorker.getRemoteControllerFor(
        {
          methodOptions: {
            connectionOptions: connectionOptionsDeployments,
            calledFrom: 'artifact-angular-node-app.releasePartial',
          },
          controllerClass: DeploymentsController,
        },
      );

    const processesController =
      await this.project.ins.taonProjectsWorker.processesWorker.getRemoteControllerFor(
        {
          methodOptions: {
            connectionOptions: connectionOptionsProcesses,
            calledFrom: 'artifact-angular-node-app.releasePartial',
          },
          controllerClass: ProcessesController,
        },
      );
    //#endregion

    //#region try to upload release to taon cloud
    let uploadResponse: MulterFileUploadResponse[];
    while (true) {
      try {
        Helpers.info(`Uploading zip file to taon server...`);
        globalSpinner.start();
        uploadResponse = await deploymentController.uploadLocalFileToServer(
          newZipFileName,
          {
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              globalSpinner.text = `Upload progress: ${percentCompleted}%`;
              // console.log(`Upload progress: ${percentCompleted}%`);
            },
          },
          tmpProjDataForUpload,
        );

        globalSpinner.succeed(`Deployment upload done!`);
        break;
      } catch (error) {
        globalSpinner.fail(`Error during upload zip file to taon server!`);
        config.frameworkName === 'tnp' && console.error(error);
        if (releaseOptions.release.autoReleaseUsingConfig) {
          throw `Error during upload zip file to taon server...`;
        } else {
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: `Error during upload zip file to taon server...press any key to continue`,
          });
        }
      }
    }
    //#endregion

    //#region trigger deployment start
    Helpers.info(`Starting deployment...`);
    const forceStart = true;
    let deployment = (
      await deploymentController
        .triggerDeploymentStart(uploadResponse[0].savedAs, forceStart)
        .request()
    ).body.json;
    await deploymentController.waitUntilDeploymentHasComposeUpProcess(
      deployment.id,
    );
    deployment = (
      await deploymentController.getByDeploymentId(deployment.id).request()
    ).body.json;

    Helpers.info(`Deployment started! `);
    //#endregion

    //#region display realtime deployment log
    if (!releaseOptions.isCiProcess) {
      Helpers.info(`

STARTING DEPLOYMENT PREVIEW (PRESS ANY KEY TO MOVE BACK TO RELEASE FINISH SCREEN)

              `);

      await DeploymentsUtils.displayRealtimeProgressMonitor(
        deployment,
        processesController,
        {
          resolveWhenTextInOutput: CoreModels.SPECIAL_APP_READY_MESSAGE,
        },
      );
    }
    //#endregion

    //#endregion
  }
  //#endregion

  //#region public methods

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

  //#endregion
}
