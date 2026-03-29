"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactAngularNodeApp = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-core/lib");
const lib_6 = require("tnp-core/lib");
const lib_7 = require("tnp-helpers/lib");
const lib_8 = require("tnp-helpers/lib");
const app_utils_1 = require("../../../../app-utils");
const constants_1 = require("../../../../constants");
const options_1 = require("../../../../options");
const deployments_1 = require("../../taon-worker/deployments");
const deployments_utils_1 = require("../../taon-worker/deployments/deployments.utils");
const processes_controller_1 = require("../../taon-worker/processes/processes.controller");
const production_build_1 = require("../__helpers__/production-build");
const base_artifact_1 = require("../base-artifact");
const inside_struct_electron_1 = require("../electron-app/tools/inside-struct-electron");
const app_hosts_recreate_helper_1 = require("./tools/app-hosts-recreate-helper");
const basename_manager_1 = require("./tools/basename-manager");
const inside_struct_app_1 = require("./tools/inside-struct-app");
const migrations_helper_1 = require("./tools/migrations-helper");
//#endregion
class ArtifactAngularNodeApp extends base_artifact_1.BaseArtifact {
    project;
    //#region fields & getters
    productionBuild;
    migrationHelper;
    angularFeBasenameManager;
    insideStructureApp;
    insideStructureElectron;
    appHostsRecreateHelper;
    nameForNpmPackage;
    // private readonly allIsomorphicPackagesFromMemory: string[];
    //#endregion
    //#region constructor
    constructor(project) {
        super(project, options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP);
        this.project = project;
        this.migrationHelper = new migrations_helper_1.MigrationHelper(project);
        this.productionBuild = new production_build_1.ProductionBuild(project);
        this.angularFeBasenameManager = new basename_manager_1.AngularFeBasenameManager(project);
        this.insideStructureApp = new inside_struct_app_1.InsideStructuresApp(project);
        this.insideStructureElectron = new inside_struct_electron_1.InsideStructuresElectron(project);
        this.appHostsRecreateHelper = new app_hosts_recreate_helper_1.AppHostsRecreateHelper(project);
        this.nameForNpmPackage = project.nameForNpmPackage;
        // this.allIsomorphicPackagesFromMemory =
        //   project.packagesRecognition.allIsomorphicPackagesFromMemory;
    }
    //#endregion
    //#region clear partial
    async clearPartial(options) {
        this.project.remove(`${constants_1.routes}/*.rest`, false);
        this.project.remove(`${constants_1.databases}/*.sqlite`, false);
    }
    //#endregion
    //#region init partial
    async initPartial(initOptions) {
        //#region @backendFunc
        if (!initOptions.release.targetArtifact) {
            initOptions.release.targetArtifact = options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP;
        }
        if (initOptions.release.targetArtifact === options_1.ReleaseArtifactTaon.ELECTRON_APP) {
            await this.insideStructureElectron.init(initOptions);
        }
        else {
            await this.insideStructureApp.init(initOptions);
        }
        // await this.project.docker.runTask({
        //   watch: initOptions.build.watch,
        //   initialParams: {
        //     envOptions: initOptions,
        //   },
        // });
        const copyFromCoreAssets = (fileName) => {
            const coreSource = (0, lib_2.crossPlatformPath)([
                this.project.ins
                    .by(lib_6.LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion)
                    .pathFor(`${(0, app_utils_1.templateFolderForArtifact)(initOptions.release.targetArtifact ===
                    options_1.ReleaseArtifactTaon.ELECTRON_APP
                    ? options_1.ReleaseArtifactTaon.ELECTRON_APP
                    : options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP)}/${constants_1.srcNgProxyProject}/${constants_1.assetsFromNgProj}/${fileName}`),
            ]);
            let browserTsCode = initOptions.build.websql
                ? constants_1.tmpSrcDistWebsql
                : constants_1.tmpSrcDist;
            if (initOptions.build.prod) {
                browserTsCode = `${browserTsCode}${constants_1.prodSuffix}`;
            }
            const tmpDest = this.project.pathFor(`${browserTsCode}/${constants_1.assetsFromNgProj}/${fileName}`);
            lib_7.HelpersTaon.copyFile(coreSource, tmpDest);
        };
        copyFromCoreAssets(constants_1.CoreAssets.sqlWasmFile);
        copyFromCoreAssets(constants_1.CoreAssets.mainFont);
        return initOptions;
        //#endregion
    }
    //#endregion
    //#region build partial
    async buildPartial(buildOptions) {
        //#region @backendFunc
        // TODO @REMOVE when microfrontends for container ready
        if (this.project.typeIsNot(lib_6.LibTypeEnum.ISOMORPHIC_LIB)) {
            lib_7.Helpers.error(`Only project type isomorphic-lib can use artifact angular-node-app!`, false, true);
        }
        buildOptions = await this.project.artifactsManager.init(options_1.EnvOptions.from(buildOptions));
        if (buildOptions.release.targetArtifact !==
            options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP &&
            buildOptions.build.ssr) {
            lib_7.Helpers.warn(`SSR option is not supported for artifact ${buildOptions.release.targetArtifact}, disabling SSR...`);
            buildOptions.build.ssr = false;
        }
        if (buildOptions.build.ssr) {
            lib_7.Helpers.info(`

      NOTE: You are building APP with SSR (Server Side Rendering) enabled.

      `);
        }
        const shouldSkipBuild = this.shouldSkipBuild(buildOptions);
        //#region prevent empty base href
        if (!lib_2._.isUndefined(buildOptions.build.baseHref) &&
            !buildOptions.release.releaseType &&
            !buildOptions.build.watch) {
            lib_7.Helpers.error(`Build baseHref only can be specify when build lib code:

      try commands:
      ${lib_1.config.frameworkName} build:lib --base-href ` +
                `${buildOptions.build.baseHref} ` +
                `# it will do lib code build

      `, false, true);
        }
        //#endregion
        this.productionBuild.runTask(buildOptions, true);
        const appDistOutBackendNodeAbsPath = this.getOutDirNodeBackendAppAbsPath(buildOptions);
        if (buildOptions.release.releaseType === options_1.ReleaseType.LOCAL ||
            buildOptions.release.releaseType === options_1.ReleaseType.MANUAL) {
            await this.buildBackend(buildOptions, appDistOutBackendNodeAbsPath);
        }
        const angularTempProj = (0, app_utils_1.getProxyNgProj)(this.project, buildOptions, buildOptions.release.targetArtifact);
        const appDistOutBrowserAngularAbsPath = buildOptions.release.targetArtifact === options_1.ReleaseArtifactTaon.ELECTRON_APP
            ? angularTempProj.pathFor(constants_1.distFromNgBuild)
            : this.getOutDirAngularBrowserAppAbsPath(buildOptions);
        const fromFileBaseHref = lib_7.Helpers.readFile(this.project.pathFor(constants_1.tmpBaseHrefOverwrite));
        buildOptions.build.baseHref = buildOptions.build.baseHref
            ? buildOptions.build.baseHref
            : fromFileBaseHref;
        const portAssignedToAppBuild = await this.appHostsRecreateHelper.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(buildOptions);
        if (buildOptions.build.watch) {
            await lib_7.Helpers.killProcessByPort(portAssignedToAppBuild);
        }
        //#region prepare angular command
        const outPutPathCommand = ` --output-path ${appDistOutBrowserAngularAbsPath} `;
        const baseHrefCommand = buildOptions.build.baseHref
            ? ` --base-href ${buildOptions.build.baseHref} `
            : '';
        if (!buildOptions.build.watch) {
            lib_7.Helpers.remove(appDistOutBrowserAngularAbsPath);
        }
        //#region serve command
        const serveCommand = `${constants_1.TaonCommands.NPM_RUN_NG} serve ${buildOptions.release.targetArtifact === options_1.ReleaseArtifactTaon.ELECTRON_APP
            ? constants_1.AngularJsonTaskName.ELECTRON_APP
            : constants_1.AngularJsonTaskName.ANGULAR_APP} ` +
            ` ${`--port=${portAssignedToAppBuild}`} ` +
            ` --host 0.0.0.0`; // make it accessible in network for development
        //#endregion
        if (buildOptions.build.watch) {
            lib_7.Helpers.logInfo(`Using ng serve command: ${serveCommand}`);
        }
        //#region build command
        const angularBuildCommand = `${constants_1.TaonCommands.NPM_RUN_NG} build ${buildOptions.release.targetArtifact === options_1.ReleaseArtifactTaon.ELECTRON_APP
            ? constants_1.AngularJsonTaskName.ELECTRON_APP
            : constants_1.AngularJsonTaskName.ANGULAR_APP
        // : buildOptions.build.angularSsr
        //   ? 'ssr'
        }` +
            ` ${buildOptions.build.watch ? '--watch' : ''}` +
            ` ${outPutPathCommand} ${baseHrefCommand}`;
        //#endregion
        const tmpAppForDistRelativePath = (0, app_utils_1.angularProjProxyPath)({
            project: this.project,
            targetArtifact: buildOptions.release.targetArtifact,
            envOptions: buildOptions,
        });
        // set correct default config for build/serve in angular.json
        const angularJsonSelectedTask = (0, constants_1.AngularJsonAppOrElectronTaskNameResolveFor)(buildOptions);
        lib_7.Helpers.logInfo(`Setting angular.json default config for ${angularJsonSelectedTask}  `);
        if (!buildOptions.build.watch) {
            // not needed for watch - watch uses app.hosts.ts
            const indexHtmlAbsPath = (0, lib_2.crossPlatformPath)([
                tmpAppForDistRelativePath,
                constants_1.srcNgProxyProject,
                constants_1.CoreNgTemplateFiles.INDEX_HTML_NG_APP,
            ]);
            let contentIndexHtml = lib_7.Helpers.readFile(indexHtmlAbsPath);
            const ENV_DATA_JSON = await this.getBrowserENVJSON(buildOptions);
            contentIndexHtml = contentIndexHtml.replace(constants_1.ENV_INJECT_COMMENT, `<script>window.ENV = ${JSON.stringify(ENV_DATA_JSON)};</script>`);
            lib_7.Helpers.writeFile(indexHtmlAbsPath, contentIndexHtml);
        }
        this.project.setValueToJSONC([tmpAppForDistRelativePath, constants_1.CoreNgTemplateFiles.ANGULAR_JSON], `projects.${buildOptions.release.targetArtifact === options_1.ReleaseArtifactTaon.ELECTRON_APP
            ? constants_1.AngularJsonTaskName.ELECTRON_APP
            : constants_1.AngularJsonTaskName.ANGULAR_APP}.architect.${buildOptions.build.watch ? 'serve' : 'build'}.${constants_1.defaultConfiguration}`, angularJsonSelectedTask);
        // remove angular cache to prevent weird issues
        this.project.remove([tmpAppForDistRelativePath, '.angular']);
        // quick fix for tsconfig pathing in ng proxy project
        lib_7.Helpers.createSymLink(this.project.pathFor(constants_1.tsconfigJsonIsomorphicMainProject), this.project.pathFor([
            tmpAppForDistRelativePath,
            constants_1.srcNgProxyProject,
            constants_1.tsconfigJsonIsomorphicMainProject,
        ]));
        // remove server.ts for electron build
        if (buildOptions.release.targetArtifact === options_1.ReleaseArtifactTaon.ELECTRON_APP) {
            this.project.removeFile([
                tmpAppForDistRelativePath,
                constants_1.srcNgProxyProject,
                constants_1.CoreNgTemplateFiles.SERVER_TS,
            ]);
        }
        const angularBuildAppCmd = buildOptions.build.watch
            ? serveCommand
            : angularBuildCommand;
        //#endregion
        const showInfoAngular = () => {
            lib_7.Helpers.logInfo(`

  ARTIFACT ${buildOptions.release.targetArtifact} BUILD COMMAND: ${angularBuildAppCmd}

  inside: ${angularTempProj.location}

  `);
        };
        showInfoAngular();
        const projectBasePath = this.project.location;
        const appBaseName = lib_2._.upperFirst(lib_2._.camelCase(this.project.name));
        const noConfigError = `TS2724: '"./app/app"' has no exported member named '${appBaseName}AppConfig'. Did you mean '${appBaseName}Config'?`;
        const noCompoenntError = `TS2614: Module '"./app/app"' has no exported member '${appBaseName}App'. Did you mean to use 'import ${appBaseName}App from "./app/app"' instead?`;
        const externalLibInPorject = 'projects/external-libs/src/lib';
        const taonActionFromParentName = lib_1.GlobalStorage.get(lib_1.taonActionFromParent);
        if (!shouldSkipBuild) {
            await angularTempProj.execute(angularBuildAppCmd, {
                similarProcessKey: constants_1.TaonCommands.NG,
                resolvePromiseMsg: {
                    stdout: constants_1.COMPILATION_COMPLETE_APP_NG_SERVE,
                },
                //#region command execute params
                exitOnErrorCallback: async (code) => {
                    if (buildOptions.release.releaseType) {
                        throw 'Angular compilation lib error!';
                    }
                    else {
                        lib_7.Helpers.error(`[${lib_1.config.frameworkName}] Typescript compilation error (code=${code})`, false, true);
                    }
                },
                outputLineReplace: (line) => {
                    //#region replace outut line for better debugging
                    // console.log('LINE:', line);
                    line = line.replace(tmpAppForDistRelativePath + '/', '');
                    if (line.includes(externalLibInPorject + '/')) {
                        let [__, packageName] = line.split(externalLibInPorject + '/') || [];
                        packageName = lib_2._.first((packageName || '').split('/lib/'));
                        if (packageName) {
                            const tempSource = (0, app_utils_1.angularProjProxyPath)({
                                envOptions: buildOptions,
                                project: this.project,
                                targetArtifact: buildOptions.release.targetArtifact,
                            });
                            let linkForRealSource;
                            const linkPath = this.project.pathFor([
                                tempSource,
                                externalLibInPorject,
                                packageName,
                                'lib',
                            ]);
                            try {
                                linkForRealSource = lib_1.fse.readlinkSync(linkPath);
                            }
                            catch (error) { }
                            if (typeof linkForRealSource === 'string') {
                                linkForRealSource = (0, lib_2.crossPlatformPath)(linkForRealSource).replace(/\/$/, '');
                            }
                            if (linkForRealSource) {
                                const relative = line
                                    .replace(`${externalLibInPorject}/${packageName}/lib/`, '')
                                    .trim();
                                // console.log({ relative });
                                linkForRealSource = linkForRealSource
                                    .split('/')
                                    .slice(0, -2)
                                    .join('/');
                                line = line.replace(`${externalLibInPorject}/${packageName}/lib/${relative}`, `${linkForRealSource}/src/lib/${relative}`);
                            }
                        }
                    }
                    if (line.includes('Warning:')) {
                        line = line.replace(projectBasePath + '/', './');
                    }
                    // TODO QUICK_FIXES for clean errors
                    if (line.includes(`${constants_1.ngProjectStylesScss}?ngGlobalStyle`) ||
                        (line.includes(`./${constants_1.srcMainProject}/${constants_1.ngProjectStylesScss}`) &&
                            line.includes(`/sass-loader/${constants_1.distFromSassLoader}/cjs.js`)) ||
                        (line.includes('HookWebpackError: Module build failed') &&
                            line.includes(`/sass-loader/${constants_1.distFromSassLoader}/cjs.js`))) {
                        return '';
                    }
                    line = line.replace(`${constants_1.srcNgProxyProject}/${constants_1.appFromSrcInsideNgApp}/`, `./${constants_1.srcMainProject}/`);
                    line = line.replace(`${constants_1.srcNgProxyProject}\\${constants_1.appFromSrcInsideNgApp}\\`, `.\\${constants_1.srcMainProject}\\`);
                    line = line.replace(`${constants_1.srcNgProxyProject}/${constants_1.appFromSrcInsideNgApp}/${this.project.name}/`, `./${constants_1.srcMainProject}/`);
                    line = line.replace(`${this.project.location}/.angular/cache/`, this.project.pathFor(`${tmpAppForDistRelativePath}/.angular/cache/`));
                    if (line.includes(noConfigError)) {
                        line = line.replace(noConfigError, `Please export ${appBaseName}AppConfig in your ./src/app.ts file. Check core project example for reference.`);
                    }
                    if (line.includes(noCompoenntError)) {
                        line = line.replace(noCompoenntError, `Please export ${appBaseName}App in your ./src/app.ts file. Check core project example for reference.`);
                    }
                    // /Users/dfilipiak/npm/taon-projects/application-quiz/.angular/cache/21.0.4/app/vite/deps_ssr/chunk-NX6GOWNM.js:27649:15
                    if (taonActionFromParentName && line.includes('./src/')) {
                        line = line.replace('./src/', `./${taonActionFromParentName}/src/`);
                    }
                    return line;
                    //#endregion
                },
                //#endregion
            });
        }
        if (!buildOptions.build.watch) {
            this.project.framework.recreateFileFromCoreProject({
                relativePathInCoreProject: `${constants_1.dockerTemplatesFolder}/${buildOptions.build.ssr
                    ? constants_1.DockerTemplatesFolders.ANGULAR_APP_SSR_NODE
                    : constants_1.DockerTemplatesFolders.ANGULAR_APP_NODE}/Dockerfile`,
                customDestinationLocation: [
                    appDistOutBrowserAngularAbsPath,
                    'Dockerfile',
                ],
            });
            if (!buildOptions.build.ssr) {
                this.project.framework.recreateFileFromCoreProject({
                    relativePathInCoreProject: `${constants_1.dockerTemplatesFolder}/${constants_1.DockerTemplatesFolders.ANGULAR_APP_NODE}/nginx.conf`,
                    customDestinationLocation: [
                        appDistOutBrowserAngularAbsPath,
                        'nginx.conf',
                    ],
                });
            }
        }
        return {
            appDistOutBackendNodeAbsPath,
            appDistOutBrowserAngularAbsPath,
            angularNgServeAddress: new URL(`http://localhost:${portAssignedToAppBuild}`),
        };
        //#endregion
    }
    async buildBackend(buildOptions, appDistOutBackendNodeAbsPath) {
        //#region @backendFunc
        lib_7.Helpers.remove(appDistOutBackendNodeAbsPath);
        await lib_7.HelpersTaon.bundleCodeIntoSingleFile(this.project.pathFor(`${constants_1.distVscodeProj}/${constants_1.appJsBackend}`), (0, lib_2.crossPlatformPath)([
            appDistOutBackendNodeAbsPath,
            `${constants_1.distVscodeProj}/${constants_1.appJsBackend}`,
        ]), {
            prod: buildOptions.build.prod,
            minify: buildOptions.release.nodeBackendApp.minify,
            strategy: 'node-app',
            additionalExternals: [
                ...this.project.taonJson.additionalExternalsFor(options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP),
            ],
            additionalReplaceWithNothing: [
                ...this.project.taonJson.additionalReplaceWithNothingFor(options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP),
            ],
        });
        const copyToBackendBundle = [
            constants_1.runJsMainProject,
            constants_1.readmeMdMainProject,
            `${constants_1.distMainProject}/${constants_1.libFromCompiledDist}/${constants_1.TaonGeneratedFiles.BUILD_INFO_AUTO_GENERATED_JS}`,
        ];
        for (const relativePathBundleBackend of copyToBackendBundle) {
            lib_7.HelpersTaon.copyFile(this.project.pathFor(relativePathBundleBackend), (0, lib_2.crossPlatformPath)([
                appDistOutBackendNodeAbsPath,
                relativePathBundleBackend,
            ]));
        }
        const nodeJsAppNativeDeps = [
            ...this.project.taonJson.getNativeDepsFor(options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP),
            'lodash',
            'minimist',
            'fs-extra',
            'sql.js',
        ];
        const dependenciesNodeJsApp = this.project.framework.coreProject.getValueFromJSON('docker-templates/backend-app-node/package.json', 'dependencies');
        for (const nativeDepName of nodeJsAppNativeDeps) {
            const version = this.project.packageJson.dependencies[nativeDepName];
            if (version) {
                lib_7.Helpers.logInfo(`Setting native dependency ${nativeDepName} to version ${version}`);
                dependenciesNodeJsApp[nativeDepName] =
                    this.project.packageJson.dependencies[nativeDepName];
            }
            else {
                lib_7.Helpers.warn(`Native dependency ${nativeDepName} not found in taon package.json dependencies`);
            }
        }
        lib_7.Helpers.writeJson([appDistOutBackendNodeAbsPath, constants_1.packageJsonNpmLib], {
            name: this.project.packageJson.name,
            version: this.project.packageJson.version,
            dependencies: dependenciesNodeJsApp,
        });
        this.project.framework.recreateFileFromCoreProject({
            relativePathInCoreProject: 'docker-templates/backend-app-node/Dockerfile',
            customDestinationLocation: [appDistOutBackendNodeAbsPath, 'Dockerfile'],
        });
        this.project.framework.recreateFileFromCoreProject({
            relativePathInCoreProject: `${(0, app_utils_1.templateFolderForArtifact)(buildOptions.release.targetArtifact === options_1.ReleaseArtifactTaon.ELECTRON_APP
                ? options_1.ReleaseArtifactTaon.ELECTRON_APP
                : options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP)}/${constants_1.srcNgProxyProject}/${constants_1.assetsFromNgProj}/${constants_1.CoreAssets.sqlWasmFile}`,
            customDestinationLocation: [
                appDistOutBackendNodeAbsPath,
                `${constants_1.distFromNgBuild}/${constants_1.CoreAssets.sqlWasmFile}`,
            ],
        });
        //#endregion
    }
    //#endregion
    async getBrowserENVJSON(releaseOptions) {
        //#region @backendFunc
        // TODO @LAST handle when domain is ip address
        const data = {};
        const contextsNames = this.project.framework.getAllDetectedTaonContexts({
            skipLibFolder: true,
        });
        // TODO maybe this compute property based
        const useDomain = releaseOptions.website.useDomain;
        const domain = releaseOptions.website.domain;
        // create one env file for all docker containers
        for (let i = 0; i < contextsNames.length; i++) {
            const contextRealIndex = i + 1; // start from 1
            const contextName = contextsNames[i].contextName;
            const taskNameBackendReleasePort = `docker release ${domain} ${releaseOptions.release.releaseType} ` +
                `backend port for ${contextName} (n=${contextRealIndex})`;
            const portBackendRelease = await this.project.registerAndAssignPort(taskNameBackendReleasePort);
            const taskNameFrontendreleasePort = `docker release ${domain} ${releaseOptions.release.releaseType} ` +
                `frontend port for ${contextName} (n=${contextRealIndex})`;
            const portFrontendRelease = await this.project.registerAndAssignPort(taskNameFrontendreleasePort);
            const domainForContextFE = useDomain
                ? domain
                : `http://localhost:${portFrontendRelease}`;
            const domainForContextBE = useDomain
                ? domain
                : `http://localhost:${portBackendRelease}`;
            // data[`HOST_BACKEND_PORT_${contextRealIndex}`] = portBackendRelease;
            data[`HOST_URL_${contextRealIndex}`] = domainForContextBE;
            // data[`FRONTEND_NORMAL_APP_PORT_${contextRealIndex}`] =
            //   portFrontendRelease;
            data[`FRONTEND_HOST_URL_${contextRealIndex}`] = domainForContextFE;
            if (i === 0) {
                // data[`HOST_BACKEND_PORT`] = portBackendRelease;
                data[`HOST_URL`] = domainForContextBE;
                // data[`FRONTEND_NORMAL_APP_PORT`] = portFrontendRelease;
                data[`FRONTEND_HOST_URL`] = domainForContextFE;
            }
        }
        return data;
        //#endregion
    }
    //#region release partial
    async releasePartial(releaseOptions) {
        //#region @backendFunc
        let deploymentFunction = void 0;
        //#region update resolved variables
        releaseOptions = this.updateResolvedVersion(releaseOptions);
        const projectsReposToPushAndTag = [this.project.location];
        const projectsReposToPush = [];
        let { appDistOutBrowserAngularAbsPath, appDistOutBackendNodeAbsPath } = await this.buildPartial(releaseOptions.clone({
            build: {
                watch: false,
            },
        }));
        let releaseProjPath = appDistOutBrowserAngularAbsPath;
        releaseOptions.release.skipStaticPagesVersioning = lib_2._.isUndefined(releaseOptions.release.skipStaticPagesVersioning)
            ? true
            : releaseOptions.release.skipStaticPagesVersioning;
        //#endregion
        if (releaseOptions.release.releaseType === options_1.ReleaseType.STATIC_PAGES) {
            //#region static pages release
            if (!releaseOptions.build.ssr) {
                appDistOutBrowserAngularAbsPath = (0, lib_2.crossPlatformPath)([
                    appDistOutBrowserAngularAbsPath,
                    constants_1.browserNgBuild,
                ]);
            }
            const releaseData = await this.staticPagesDeploy(appDistOutBrowserAngularAbsPath, releaseOptions);
            releaseProjPath = releaseData.releaseProjPath;
            projectsReposToPush.push(...releaseData.projectsReposToPush);
            //#endregion
        }
        else if (releaseOptions.release.releaseType === options_1.ReleaseType.LOCAL ||
            releaseOptions.release.releaseType === options_1.ReleaseType.MANUAL) {
            //#region copy to local release folder
            const localReleaseOutputBasePath = releaseOptions.release.releaseType === options_1.ReleaseType.LOCAL
                ? this.project.pathFor([
                    constants_1.localReleaseMainProject,
                    this.currentArtifactName,
                    `${this.project.name}${constants_1.suffixLatest}`,
                ])
                : this.project.pathFor([
                    `.${lib_1.config.frameworkName}`,
                    'release-manual',
                    this.currentArtifactName,
                ]);
            lib_7.HelpersTaon.copy(appDistOutBrowserAngularAbsPath, [
                localReleaseOutputBasePath,
                lib_2.path.basename(appDistOutBrowserAngularAbsPath),
            ]);
            lib_7.HelpersTaon.copy(appDistOutBackendNodeAbsPath, [
                localReleaseOutputBasePath,
                lib_2.path.basename(appDistOutBackendNodeAbsPath),
            ]);
            releaseProjPath = localReleaseOutputBasePath;
            //#endregion
            //#region update package.json in backend app
            lib_7.HelpersTaon.setValueToJSON([
                localReleaseOutputBasePath,
                lib_2.path.basename(appDistOutBackendNodeAbsPath),
                constants_1.packageJsonNpmLib,
            ], 'name', lib_2.path.basename(appDistOutBackendNodeAbsPath));
            lib_7.HelpersTaon.setValueToJSON([
                localReleaseOutputBasePath,
                lib_2.path.basename(appDistOutBackendNodeAbsPath),
                constants_1.packageJsonNpmLib,
            ], 'version', releaseOptions.release.resolvedNewVersion);
            //#endregion
            //#region update docker-compose files
            const dockerComposeRelativePath = 'docker-templates/docker-compose.yml';
            const dockerComposeYmlDestPath = (0, lib_2.crossPlatformPath)([
                localReleaseOutputBasePath,
                lib_2.path.basename(dockerComposeRelativePath),
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
                const taskNameBackendReleasePort = `docker release ${domain} ${releaseOptions.release.releaseType} ` +
                    `backend port for ${contextName} (n=${contextRealIndex})`;
                const portBackendRelease = await this.project.registerAndAssignPort(taskNameBackendReleasePort);
                const taskNameFrontendreleasePort = `docker release ${domain} ${releaseOptions.release.releaseType} ` +
                    `frontend port for ${contextName} (n=${contextRealIndex})`;
                const portFrontendRelease = await this.project.registerAndAssignPort(taskNameFrontendreleasePort);
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
                lib_4.UtilsDotFile.setValuesKeysFromObject([localReleaseOutputBasePath, constants_1.dotEnvFile], {
                    [`HOST_BACKEND_PORT_${contextRealIndex}`]: portBackendRelease,
                    [`HOST_URL_${contextRealIndex}`]: domainForContextBE,
                    [`FRONTEND_NORMAL_APP_PORT_${contextRealIndex}`]: portFrontendRelease,
                    [`FRONTEND_HOST_URL_${contextRealIndex}`]: domainForContextFE,
                    ...(i === 0 // fallback to old taon app.hosts values
                        ? {
                            [`HOST_BACKEND_PORT`]: portBackendRelease,
                            [`HOST_URL`]: domainForContextBE,
                            [`FRONTEND_NORMAL_APP_PORT`]: portFrontendRelease,
                            [`FRONTEND_HOST_URL`]: domainForContextFE,
                        }
                        : {}),
                });
                lib_4.UtilsDotFile.setCommentToKeyInDotFile([localReleaseOutputBasePath, constants_1.dotEnvFile], `HOST_BACKEND_PORT_${contextRealIndex}`, `${lib_2.CoreModels.tagForTaskName}="${taskNameBackendReleasePort}"`);
                if (i === 0) {
                    lib_4.UtilsDotFile.setCommentToKeyInDotFile([localReleaseOutputBasePath, constants_1.dotEnvFile], `HOST_BACKEND_PORT`, `${lib_2.CoreModels.tagForTaskName}="${taskNameBackendReleasePort}"`);
                }
                lib_4.UtilsDotFile.setCommentToKeyInDotFile([localReleaseOutputBasePath, constants_1.dotEnvFile], `FRONTEND_NORMAL_APP_PORT_${contextRealIndex}`, `${lib_2.CoreModels.tagForTaskName}="${taskNameFrontendreleasePort}"`);
            }
            if (!useDomain) {
                lib_4.UtilsDotFile.addCommentAtTheBeginningOfDotFile([localReleaseOutputBasePath, constants_1.dotEnvFile], `HINT! IF YOU NEED DOMAIN USE userDomain=true in env.ts`);
            }
            lib_4.UtilsDotFile.setValueToDotFile([localReleaseOutputBasePath, '.env'], 'COMPOSE_PROJECT_NAME', ('TaonDeployment__' +
                lib_2._.camelCase(releaseOptions.website.domain) +
                '__' +
                `v${lib_2._.kebabCase(this.project.packageJson.version)}` +
                '__' +
                `release-type-${releaseOptions.release.releaseType}` +
                `--env--${!releaseOptions.release.envName ||
                    releaseOptions.release.envName === '__'
                    ? 'default'
                    : releaseOptions.release.envName}${releaseOptions.release.envNumber || ''}`).toLowerCase());
            lib_4.UtilsDotFile.setValueToDotFile([localReleaseOutputBasePath, constants_1.dotEnvFile], 'BUILD_DATE', `${(0, lib_2.dateformat)(new Date(), 'dd-mm-yyyy_HH:MM:ss')}`);
            lib_4.UtilsDotFile.setValueToDotFile([localReleaseOutputBasePath, constants_1.dotEnvFile], 'NODE_ENV', `production`);
            //#endregion
            const allValuesDotEnv = lib_4.UtilsDotFile.getValuesKeysAsJsonObject([
                localReleaseOutputBasePath,
                constants_1.dotEnvFile,
            ]);
            //#region update docker-compose file with env variables
            const dockerComposeFile = lib_2.UtilsYaml.readYamlAsJson(dockerComposeYmlDestPath);
            //#region prepare backend containers
            const backendTemplapteObj = dockerComposeFile.services['backend-app-node'];
            delete dockerComposeFile.services['backend-app-node'];
            const containerLabel = `${lib_8.UtilsDocker.DOCKER_LABEL_KEY}="\${COMPOSE_PROJECT_NAME}"`;
            for (let i = 0; i < contextsNames.length; i++) {
                const contextRealIndex = i + 1; // start from 1
                const contextName = contextsNames[i].contextName;
                const ctxBackend = lib_2._.cloneDeep(backendTemplapteObj);
                //  `backend-app-node--${_.kebabCase(releaseOptions.website.domain)}--` +
                const containerIdentifierBackendNOde = `be--${lib_2._.kebabCase(releaseOptions.website.domain)}--` +
                    `v${lib_2._.kebabCase(this.project.packageJson.version)}--${contextName}--ctx${contextRealIndex}`.toLowerCase();
                //#region updating cloned backend template
                const traefikKeyBackend = `${containerIdentifierBackendNOde}--env` +
                    `${releaseOptions.release.envName}${releaseOptions.release.envNumber || ''}`;
                const traefikLabelsBE = [
                    `traefik.enable=true`,
                    `traefik.http.routers.${traefikKeyBackend}.rule=Host(\`${releaseOptions.website.domain}\`) && PathPrefix(\`/api/${contextName}/\`)`,
                    `traefik.http.routers.${traefikKeyBackend}.entrypoints=websecure`,
                    // `traefik.http.routers.${traefikKeyBackend}.tls.certresolver=myresolver`,
                    `traefik.http.services.${traefikKeyBackend}.loadbalancer.server.port=$\{HOST_BACKEND_PORT_${contextRealIndex}\}`,
                    containerLabel,
                    lib_8.UtilsDocker.DOCKER_TAON_PROJECT_LABEL,
                    // only when sripping prefix
                    // 'traefik.http.middlewares.strip-api.stripprefix.prefixes=/api',
                    // 'traefik.http.routers.backend.middlewares=strip-api',
                ];
                const traefikLabelsBEObject = {};
                traefikLabelsBE.forEach(label => {
                    const [key, value] = label.split('=');
                    traefikLabelsBEObject[key] = value;
                });
                ctxBackend.labels = { ...ctxBackend.labels, ...traefikLabelsBEObject };
                ctxBackend.container_name = containerIdentifierBackendNOde;
                ctxBackend.ports[0] = `$\{HOST_BACKEND_PORT_${contextRealIndex}\}:$\{HOST_BACKEND_PORT_${contextRealIndex}\}`;
                const all = lib_2._.cloneDeep(allValuesDotEnv);
                for (const key of Object.keys(all)) {
                    all[key] = `\${${key}}`;
                }
                ctxBackend.environment = all;
                ctxBackend.environment[constants_1.ACTIVE_CONTEXT] = contextName;
                const specificForProjectSQliteDbLocation = (0, lib_2.crossPlatformPath)([
                    lib_3.UtilsOs.getRealHomeDir(),
                    lib_1.dotTaonFolder,
                    'cloud/docker-backend-databases',
                    releaseOptions.website.domain,
                    this.project.packageJson.version,
                    contextName,
                    constants_1.databases,
                ]);
                ctxBackend.volumes = [
                    `${specificForProjectSQliteDbLocation}:/app/${constants_1.databases}`,
                ];
                //#endregion
                dockerComposeFile.services[containerIdentifierBackendNOde] = ctxBackend;
            }
            //#endregion
            //#region prepare frontend container
            const frontendTemplapteObj = dockerComposeFile.services['angular-app-node'];
            delete dockerComposeFile.services['angular-app-node'];
            const ctxFrontend = lib_2._.cloneDeep(frontendTemplapteObj);
            //  `angular-app-node--${_.kebabCase(releaseOptions.website.domain)}` +
            const newKeyForContainerFrontendAngular = (`fe--${lib_2._.kebabCase(releaseOptions.website.domain)}` +
                `--v${lib_2._.kebabCase(this.project.packageJson.version)}`).toLowerCase();
            //#region set traefik labels for frontend app
            const all = lib_2._.cloneDeep(allValuesDotEnv);
            for (const key of Object.keys(all)) {
                all[key] = `\${${key}}`;
            }
            ctxFrontend.environment = all;
            const traefikKeyFrontend = `${newKeyForContainerFrontendAngular}--` +
                `${releaseOptions.release.envName}${releaseOptions.release.envNumber || ''}`;
            const traefikLabelsFE = [
                `traefik.enable=true`,
                `traefik.http.routers.${traefikKeyFrontend}.rule=Host(\`${releaseOptions.website.domain}\`)`,
                `traefik.http.routers.${traefikKeyFrontend}.entrypoints=websecure`,
                // `traefik.http.routers.${traefikKeyFronend}.tls.certresolver=myresolver`,
                `traefik.http.services.${traefikKeyFrontend}.loadbalancer.server.port=80`,
                containerLabel,
            ];
            const traefikLabelsFEObject = {};
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
            lib_2.UtilsYaml.writeJsonToYaml(dockerComposeYmlDestPath, dockerComposeFile);
            //#region add info comment to docker-compose.yml file
            const dockerComposeYmlFileContent = lib_7.Helpers.readFile(dockerComposeYmlDestPath);
            lib_7.Helpers.writeFile(dockerComposeYmlDestPath, `# ${constants_1.THIS_IS_GENERATED_STRING}
# FRONTEND APP can ONLY READ VARIABLES THAT START WITH "FRONTEND_", "PUIBLIC_" or "HOST_"
${dockerComposeYmlFileContent}
# ${constants_1.THIS_IS_GENERATED_STRING}`);
            //#endregion
            //#endregion
            //#region create package.json with start script for whole build
            lib_7.HelpersTaon.copyFile(this.project.pathFor(constants_1.packageJsonMainProject), [
                localReleaseOutputBasePath,
                constants_1.packageJsonNpmLib,
            ]);
            lib_7.HelpersTaon.setValueToJSON([localReleaseOutputBasePath, constants_1.packageJsonNpmLib], 'scripts', {});
            lib_7.HelpersTaon.setValueToJSON([localReleaseOutputBasePath, constants_1.packageJsonNpmLib], 'scripts.start', `taon preview ./docker-compose.yml`);
            //#endregion
            //#region display final build info
            lib_7.Helpers.info(`

      Dockerized version of your app is ready.
      you can run: ${lib_2.chalk.bold('docker compose up -d')}
      in ${localReleaseOutputBasePath}

      or quick script:
      taon preview ./docker-compose.yml

      `);
            //#endregion
            if (releaseOptions.release.releaseType === options_1.ReleaseType.LOCAL) {
                lib_7.Helpers.taskDone(`Local release done!`);
                // TODO
            }
            else if (releaseOptions.release.releaseType === options_1.ReleaseType.MANUAL) {
                lib_7.Helpers.taskDone(`Manual release prepared!`);
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
    async deployToTaonCloud({ releaseOptions, localReleaseOutputBasePath, }) {
        //#region @backendFunc
        //#region prepare zip newZipFileName file for upload
        const tmpZipLocalReleaseFileAbsPath = await lib_7.UtilsZip.zipDir(localReleaseOutputBasePath, {
            overrideIfZipFileExists: true,
        });
        const tmpProjDataForUpload = {
            destinationDomain: releaseOptions.website.domain,
            version: releaseOptions.release.resolvedNewVersion,
            envName: releaseOptions.release.envName,
            envNumber: releaseOptions.release.envNumber || '',
            releaseType: releaseOptions.release.releaseType,
            projectName: this.project.name,
            targetArtifact: releaseOptions.release.targetArtifact,
        };
        const newBasenameZipFile = lib_5.FilePathMetaData.embedData(lib_2._.pick(tmpProjDataForUpload, ['destinationDomain', 'version']), lib_2.path.basename(tmpZipLocalReleaseFileAbsPath), {
            skipAddingBasenameAtEnd: true,
            keysMap: constants_1.keysMap,
        });
        const newZipFileName = (0, lib_2.crossPlatformPath)([
            lib_2.path.dirname(tmpZipLocalReleaseFileAbsPath),
            newBasenameZipFile,
        ]);
        lib_7.HelpersTaon.copyFile(tmpZipLocalReleaseFileAbsPath, newZipFileName);
        lib_7.Helpers.taskDone(`
      Release zip file prepared for taon cloud deployment!
      Destination taon instance ip (or domain): "${releaseOptions.release.taonInstanceIp}"

      Zip file ready for taon cloud deployment:
${lib_2.path.dirname(newZipFileName)}
/${lib_2.path.basename(newZipFileName)}

      `);
        //#endregion
        //#region prepare cloud connections and controllers
        const connectionOptionsDeployments = {
            ipAddressOfTaonInstance: releaseOptions.release.taonInstanceIp,
            port: releaseOptions.release.taonInstanceIp === lib_2.CoreModels.localhostIp127
                ? Number(this.project.ins.taonProjectsWorker.deploymentsWorker
                    .processLocalInfoObj.port)
                : null,
        };
        const connectionOptionsProcesses = {
            ipAddressOfTaonInstance: releaseOptions.release.taonInstanceIp,
            port: releaseOptions.release.taonInstanceIp === lib_2.CoreModels.localhostIp127
                ? Number(this.project.ins.taonProjectsWorker.processesWorker
                    .processLocalInfoObj.port)
                : null,
        };
        const deploymentController = await this.project.ins.taonProjectsWorker.deploymentsWorker.getRemoteControllerFor({
            methodOptions: {
                connectionOptions: connectionOptionsDeployments,
                calledFrom: 'artifact-angular-node-app.releasePartial',
            },
            controllerClass: deployments_1.DeploymentsController,
        });
        const processesController = await this.project.ins.taonProjectsWorker.processesWorker.getRemoteControllerFor({
            methodOptions: {
                connectionOptions: connectionOptionsProcesses,
                calledFrom: 'artifact-angular-node-app.releasePartial',
            },
            controllerClass: processes_controller_1.ProcessesController,
        });
        //#endregion
        //#region try to upload release to taon cloud
        let uploadResponse;
        while (true) {
            try {
                lib_7.Helpers.info(`Uploading zip file to taon server...`);
                constants_1.globalSpinner.instance.start();
                uploadResponse = await deploymentController.uploadLocalFileToServer(newZipFileName, {
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        constants_1.globalSpinner.instance.text = `Upload progress: ${percentCompleted}%`;
                        // console.log(`Upload progress: ${percentCompleted}%`);
                    },
                }, tmpProjDataForUpload);
                constants_1.globalSpinner.instance.succeed(`Deployment upload done!`);
                break;
            }
            catch (error) {
                constants_1.globalSpinner.instance.fail(`Error during upload zip file to taon server!`);
                const errMsg = (error instanceof Error ? error.message : error);
                lib_1.config.frameworkName === 'tnp' && console.error(errMsg);
                if (releaseOptions.release.autoReleaseUsingConfig) {
                    throw `Error during upload zip file to taon server...`;
                }
                else {
                    await lib_3.UtilsTerminal.pressAnyKeyToContinueAsync({
                        message: `Error during upload zip file to taon server...press any key to continue`,
                    });
                }
            }
        }
        //#endregion
        //#region trigger deployment start
        lib_7.Helpers.info(`Starting deployment...`);
        const forceStart = true;
        let deployment = (await deploymentController
            .triggerDeploymentStart(uploadResponse[0].savedAs, forceStart)
            .request()).body.json;
        await deploymentController.waitUntilDeploymentHasComposeUpProcess(deployment.id);
        deployment = (await deploymentController.getByDeploymentId(deployment.id).request()).body.json;
        lib_7.Helpers.info(`Deployment started! `);
        //#endregion
        //#region display realtime deployment log
        if (!releaseOptions.isCiProcess && !lib_3.UtilsOs.isRunningNodeDebugger()) {
            lib_7.Helpers.info(`

STARTING DEPLOYMENT PREVIEW (PRESS ANY KEY TO MOVE BACK TO RELEASE FINISH SCREEN)

              `);
            await deployments_utils_1.DeploymentsUtils.displayRealtimeProgressMonitor(deployment, processesController, {
                resolveWhenTextInOutput: lib_2.CoreModels.SPECIAL_APP_READY_MESSAGE,
            });
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
    getOutDirNodeBackendAppAbsPath(buildOptions) {
        let outDirApp = `.${lib_1.config.frameworkName}/${this.currentArtifactName}/` +
            `${buildOptions.release.releaseType ? buildOptions.release.releaseType : options_1.Development}/` +
            `backend-app${buildOptions.build.websql ? '-websql' : '-node'}`;
        return this.project.pathFor(outDirApp);
    }
    //#endregion
    //#region private methods / get out dir app
    /**
     * Absolute path to the output directory for the app
     */
    getOutDirAngularBrowserAppAbsPath(buildOptions) {
        let outDirApp = `.${lib_1.config.frameworkName}/${buildOptions.release.targetArtifact}/` +
            `${buildOptions.release.releaseType ? buildOptions.release.releaseType : options_1.Development}/` +
            `angular-app${buildOptions.build.websql ? '-websql' : '-node'}`;
        return this.project.pathFor(outDirApp);
    }
}
exports.ArtifactAngularNodeApp = ArtifactAngularNodeApp;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/angular-node-app/artifact-angular-node-app.js.map