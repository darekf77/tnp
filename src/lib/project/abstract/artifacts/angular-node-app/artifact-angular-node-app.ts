//#region imports
import type { AxiosProgressEvent } from 'axios';
import { BaseContext, MulterFileUploadResponse, Taon } from 'taon/src';
import { config } from 'tnp-config/src';
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
import {
  Helpers,
  UtilsTypescript,
  DockerComposeFile,
  UtilsZip,
} from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import {
  ACTIVE_CONTEXT,
  COMPILATION_COMPLETE_APP_NG_SERVE,
  DEFAULT_PORT,
  globalSpinner,
  keysMap,
  THIS_IS_GENERATED_INFO_COMMENT,
  THIS_IS_GENERATED_STRING,
  tmpBaseHrefOverwriteRelPath,
  tmpBuildPort,
} from '../../../../constants';
import { Development, EnvOptions, ReleaseType } from '../../../../options';
import type { Project } from '../../project';
import type { DeploymentReleaseData } from '../../taon-worker/deployments/deployments.models';
import { DeploymentsUtils } from '../../taon-worker/deployments/deployments.utils';
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
    super(project, 'angular-node-app');
    this.migrationHelper = new MigrationHelper(project);
    this.angularFeBasenameManager = new AngularFeBasenameManager(project);
    this.insideStructureApp = new InsideStructuresApp(project);
    this.insideStructureElectron = new InsideStructuresElectron(project);
    this.appHostsRecreateHelper = new AppHostsRecreateHelper(project);
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

    // TODO @REMOVE when microfrontends for container ready
    if (this.project.typeIsNot('isomorphic-lib')) {
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

    const serveCommand =
      `${this.NPM_RUN_NG_COMMAND} serve ${
        buildOptions.release.targetArtifact === 'electron-app'
          ? 'angular-electron'
          : 'app'
      } ` +
      ` ${`--port=${portAssignedToAppBuild}`} ${
        buildOptions.build.angularProd ? '--prod' : ''
      }`;

    const angularBuildCommand =
      `${this.NPM_RUN_NG_COMMAND} build ${
        buildOptions.release.targetArtifact === 'electron-app'
          ? 'angular-electron'
          : 'app'
        // : buildOptions.build.angularSsr
        //   ? 'ssr'
      }` +
      ` ${buildOptions.build.angularProd ? '--configuration production' : ''} ` +
      ` ${buildOptions.build.watch ? '--watch' : ''}` +
      ` ${outPutPathCommand} ${baseHrefCommand}`;

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
    } else if (
      releaseOptions.release.releaseType === 'local' ||
      releaseOptions.release.releaseType === 'manual'
    ) {
      //#region local/manual release

      //#region copy to local release folder
      const localReleaseOutputBasePath =
        releaseOptions.release.releaseType === 'local'
          ? this.project.pathFor([
              config.folder.local_release,
              this.currentArtifactName,
              `${this.project.name}-latest`,
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

      //#endregion

      const contextsNames = this.project.framework.getAllDetectedTaonContexts();

      const useDomain = releaseOptions.website.useDomain;
      const domain = releaseOptions.website.domain;

      //#region create one env file for all docker containers
      for (let i = 0; i < contextsNames.length; i++) {
        const contextRealIndex = i + 1; // start from 1
        const contextName = contextsNames[i].contextName;
        const taskNameBackendReleasePort =
          `docker release ${releaseOptions.release.releaseType} ` +
          `backend port for ${contextName} (n=${contextRealIndex})`;
        const portBackendRelease = await this.project.registerAndAssignPort(
          taskNameBackendReleasePort,
        );

        const taskNameFrontendreleasePort =
          `docker release ${releaseOptions.release.releaseType} ` +
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
          [localReleaseOutputBasePath, '.env'],
          {
            ...(!useDomain
              ? {
                  [_.snakeCase(
                    'HINT! IF YOU NEED DOMAIN USE userDomain=true in env.ts',
                  )]: 'HINT! IF YOU NEED DOMAIN USE userDomain=true in env.ts',
                }
              : {}),
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
          [localReleaseOutputBasePath, '.env'],
          `HOST_BACKEND_PORT_${contextRealIndex}`,
          `${CoreModels.tagForTaskName}="${taskNameBackendReleasePort}"`,
        );
        if (i === 0) {
          UtilsDotFile.setCommentToKeyInDotFile(
            [localReleaseOutputBasePath, '.env'],
            `HOST_BACKEND_PORT`,
            `${CoreModels.tagForTaskName}="${taskNameBackendReleasePort}"`,
          );
        }
        UtilsDotFile.setCommentToKeyInDotFile(
          [localReleaseOutputBasePath, '.env'],
          `FRONTEND_NORMAL_APP_PORT_${contextRealIndex}`,
          `${CoreModels.tagForTaskName}="${taskNameFrontendreleasePort}"`,
        );
      }

      UtilsDotFile.setValueToDotFile(
        [localReleaseOutputBasePath, '.env'],
        'COMPOSE_PROJECT_NAME',
        (
          _.camelCase(this.project.parent?.name) +
          '-' +
          _.camelCase(this.project.name) +
          '-' +
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
        [localReleaseOutputBasePath, '.env'],
        'BUILD_DATE',
        `${dateformat(new Date(), 'dd-mm-yyyy_HH:MM:ss')}`,
      );

      UtilsDotFile.setValueToDotFile(
        [localReleaseOutputBasePath, '.env'],
        'NODE_ENV',
        `production`,
      );
      //#endregion

      const allValues = UtilsDotFile.getValuesKeysAsJsonObject([
        localReleaseOutputBasePath,
        '.env',
      ]);

      //#region update docker-compose file with env variables
      const dockerComposeFile = UtilsYaml.readYamlAsJson<DockerComposeFile>(
        dockerComposeYmlDestPath,
      );

      const backendTemplapteObj =
        dockerComposeFile.services['backend-app-node'];
      delete dockerComposeFile.services['backend-app-node'];

      for (let i = 0; i < contextsNames.length; i++) {
        const index = i + 1; // start from 1
        const contextName = contextsNames[i].contextName;
        const ctxBackend = _.cloneDeep(backendTemplapteObj);
        const newKey =
          `backend-app-node--${contextName}--${index}`.toLowerCase();
        const treafikKeyBackend = _.kebabCase(
          `${this.project.name}-${newKey}--` +
            `${releaseOptions.release.envName}${releaseOptions.release.envNumber || ''}`,
        );

        const treafikLabelsBE = [
          `traefik.enable=true`,
          `traefik.http.routers.${treafikKeyBackend}.rule=Host(\`${releaseOptions.website.domain}\`) && PathPrefix(\`/api/CTX/\`)`,
          `traefik.http.routers.${treafikKeyBackend}.entrypoints=websecure`,
          // `traefik.http.routers.${treafikKeyBackend}.tls.certresolver=myresolver`,
          `traefik.http.services.${treafikKeyBackend}.loadbalancer.server.port=$\{HOST_BACKEND_PORT_1\}`,

          // only when sripping prefix
          // 'traefik.http.middlewares.strip-api.stripprefix.prefixes=/api',
          // 'traefik.http.routers.backend.middlewares=strip-api',
        ];
        const treafikLabelsBEObject: Record<string, string> = {};
        treafikLabelsBE.forEach(label => {
          const [key, value] = label.split('=');
          treafikLabelsBEObject[key] = value;
        });
        ctxBackend.labels = { ...ctxBackend.labels, ...treafikLabelsBEObject };
        ctxBackend.container_name = newKey;
        const all = _.cloneDeep(allValues) as Record<string, string>;
        for (const key of Object.keys(all)) {
          all[key] = `\${${key}}`;
        }
        ctxBackend.environment = all;
        ctxBackend.environment[ACTIVE_CONTEXT] = contextName;
        (() => {
          const keyLoadBalancerServerPort = `traefik.http.services.${treafikKeyBackend}.loadbalancer.server.port`;
          const loadBalancerValue =
            ctxBackend.labels[keyLoadBalancerServerPort];
          ctxBackend.labels[keyLoadBalancerServerPort] =
            loadBalancerValue?.replace('1', index.toString());
        })();

        (() => {
          const httpRouterBackendPortKey = `traefik.http.routers.${treafikKeyBackend}.rule`;
          const loadBalancerValue = ctxBackend.labels[httpRouterBackendPortKey];
          ctxBackend.labels[httpRouterBackendPortKey] =
            loadBalancerValue?.replace('CTX', contextName);
        })();
        dockerComposeFile.services[newKey] = ctxBackend;
      }

      Object.values(dockerComposeFile.services).forEach(c => {
        if (c.container_name.startsWith('angular-app-node')) {
          //#region set traefik labels for frontend app
          const all = _.cloneDeep(allValues) as Record<string, string>;
          for (const key of Object.keys(all)) {
            all[key] = `\${${key}}`;
          }
          c.environment = all;

          const newKey = `angular-app-node--${releaseOptions.release.envName}${releaseOptions.release.envNumber || ''}`;
          const treafikKeyFronend = _.kebabCase(
            `${this.project.name}-${newKey}`,
          );

          const treafikLabelsFE = [
            `traefik.enable=true`,
            `traefik.http.routers.${treafikKeyFronend}.rule=Host(\`${releaseOptions.website.domain}\`)`,
            `traefik.http.routers.${treafikKeyFronend}.entrypoints=websecure`,
            // `traefik.http.routers.${treafikKeyFronend}.tls.certresolver=myresolver`,
            `traefik.http.services.${treafikKeyFronend}.loadbalancer.server.port=80`,
          ];
          const treafikLabelsFEObject: Record<string, string> = {};
          treafikLabelsFE.forEach(label => {
            const [key, value] = label.split('=');
            treafikLabelsFEObject[key] = value;
          });
          c.labels = treafikLabelsFEObject;
          //#endregion
        }
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
      Helpers.copyFile(this.project.pathFor(config.file.package_json), [
        localReleaseOutputBasePath,
        config.file.package_json,
      ]);
      Helpers.setValueToJSON(
        [localReleaseOutputBasePath, config.file.package_json],
        'scripts',
        {},
      );

      Helpers.setValueToJSON(
        [localReleaseOutputBasePath, config.file.package_json],
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
        window.ENV = ${JSON.stringify(allValues, null, 2)};
      </script>`;

        let html = Helpers.readFile(indexHtmlFromAngularAppPath);
        // Inject before </head> if found
        html = html.replace(/<\/head>/i, `${envScript}\n</head>`);
        Helpers.writeFile(indexHtmlFromAngularAppPath, html);
      })();
      //#endregion

      Helpers.info(`

        Dockerized version of your app is ready.
        you can run: ${chalk.bold('docker compose up -d')}
        in ${localReleaseOutputBasePath}

        or quick script:
        taon preview ./docker-compose.yml

        `);

      if (releaseOptions.release.releaseType === 'local') {
        Helpers.taskDone(`Local release done!`);
      } else if (releaseOptions.release.releaseType === 'manual') {
        // Helpers.run
        // localReleaseOutputBasePath

        let zipFileAbsPath = await UtilsZip.zipDir(localReleaseOutputBasePath, {
          overrideIfZipFileExists: true,
        });

        const newBasenameZipFile = FilePathMetaData.embedData(
          {
            projectName: this.project.name,
            releaseType: releaseOptions.release.releaseType as ReleaseType,
            version: releaseOptions.release.resolvedNewVersion,
            envName: releaseOptions.release.envName,
            envNumber: releaseOptions.release.envNumber || '',
            targetArtifact: releaseOptions.release.targetArtifact,
          } as DeploymentReleaseData,
          path.basename(zipFileAbsPath),
          {
            skipAddingBasenameAtEnd: true,
            keysMap,
          },
        );

        const newZipFileName = crossPlatformPath([
          path.dirname(zipFileAbsPath),
          newBasenameZipFile,
        ]);

        Helpers.copyFile(zipFileAbsPath, newZipFileName);

        zipFileAbsPath = newZipFileName;
        const portIfLocalhost =
          releaseOptions.release.taonInstanceIpOrDomain ===
          CoreModels.localhostIp127
            ? Number(
                this.project.ins.taonProjectsWorker.deploymentsWorker
                  .processLocalInfoObj.port,
              )
            : undefined;

        Helpers.taskDone(`

          Manual release done!
          Destination taon instance ip (or domain): "${releaseOptions.release.taonInstanceIpOrDomain}"

          Zip file ready for taon cloud deployment:
${path.dirname(zipFileAbsPath)}
/${path.basename(zipFileAbsPath)}

          `);

        const ctrl =
          await this.project.ins.taonProjectsWorker.deploymentsWorker.getRemoteControllerFor(
            releaseOptions.release.taonInstanceIpOrDomain,
            portIfLocalhost,
          );

        let uploadResponse: MulterFileUploadResponse[];
        while (true) {
          try {
            Helpers.info(`Uploading zip file to taon server...`);
            globalSpinner.start();
            uploadResponse = await ctrl.uploadLocalFileToServer(
              zipFileAbsPath,
              {
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                  const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total,
                  );
                  globalSpinner.text = `Upload progress: ${percentCompleted}%`;
                  // console.log(`Upload progress: ${percentCompleted}%`);
                },
              },
            );

            globalSpinner.succeed(`Deployment upload done!`);
            break;
          } catch (error) {
            globalSpinner.text = `Error during upload zip file to taon server...`;
            if (releaseOptions.release.autoReleaseUsingConfig) {
              throw new Error('Deployment upload failed!');
            } else {
              await UtilsTerminal.pressAnyKeyToContinueAsync({
                message: `Error during upload zip file to taon server...press any key to continue`,
              });
            }
          }
        }

        if (!releaseOptions.release.skipDeploy) {
          Helpers.info(`Starting deployment...`);
          const deployment = (
            await ctrl.startDeployment(uploadResponse[0].savedAs).request()
          ).body.json;
          Helpers.info(`Deployment started! `);

          if (!releaseOptions.release.autoReleaseUsingConfig) {
            Helpers.info(`


STARTING DEPLOYMENT PREVIEW (PRESS ANY KEY TO MOVE BACK TO RELEASE FINSH SCREEN)


              `);
            await DeploymentsUtils.displayRealtimeProgressMonitor(
              deployment,
              ctrl,
              {
                resolveWhenTextInStdoutOrStder:
                  CoreModels.SPECIAL_APP_READY_MESSAGE,
              },
            );
          }
        }

        // this.project.nodeModules.linkToLocation(localReleaseOutputBasePath);
      }

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
