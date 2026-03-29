"use strict";
//#region imports
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactNpmLibAndCliTool = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-helpers/lib");
const app_utils_1 = require("../../../../app-utils");
const constants_1 = require("../../../../constants");
const options_1 = require("../../../../options");
const assets_manager_1 = require("../angular-node-app/tools/assets-manager");
const base_artifact_1 = require("../base-artifact");
const app_routes_autogen_provider_1 = require("./tools/app-routes-autogen-provider");
const incremental_build_process_1 = require("./tools/build-isomorphic-lib/compilations/incremental-build-process");
const copy_manager_standalone_1 = require("./tools/copy-manager/copy-manager-standalone");
const files_recreation_1 = require("./tools/files-recreation");
const index_autogen_provider_1 = require("./tools/index-autogen-provider");
const inside_struct_lib_1 = require("./tools/inside-struct-lib");
const cypress_test_runner_1 = require("./tools/test-runner/cypress-test-runner");
const jest_test_runner_1 = require("./tools/test-runner/jest-test-runner");
const mocha_test_runner_1 = require("./tools/test-runner/mocha-test-runner");
const vitest_test_runner_1 = require("./tools/test-runner/vitest-test-runner");
//#endregion
class ArtifactNpmLibAndCliTool extends base_artifact_1.BaseArtifact {
    //#region fields
    testsMocha;
    testsJest;
    testsVite;
    testsCypress;
    copyNpmDistLibManager;
    insideStructureLib;
    indexAutogenProvider;
    appTsRoutesAutogenProvider;
    filesTemplatesBuilder;
    assetsManager;
    //#endregion
    //#region constructor
    //#region @backend
    constructor(project) {
        super(project, options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL);
        this.testsMocha = new mocha_test_runner_1.MochaTestRunner(project);
        this.testsJest = new jest_test_runner_1.JestTestRunner(project);
        this.testsVite = new vitest_test_runner_1.VitestTestRunner(project);
        this.testsCypress = new cypress_test_runner_1.CypressTestRunner(project);
        this.copyNpmDistLibManager = new copy_manager_standalone_1.CopyManagerStandalone(project);
        this.indexAutogenProvider = new index_autogen_provider_1.IndexAutogenProvider(project);
        this.appTsRoutesAutogenProvider = new app_routes_autogen_provider_1.AppRoutesAutogenProvider(project);
        this.filesTemplatesBuilder = new files_recreation_1.FilesTemplatesBuilder(project);
        this.insideStructureLib = new inside_struct_lib_1.InsideStructuresLib(project);
        this.assetsManager = new assets_manager_1.AssetsManager(project);
    }
    //#endregion
    //#endregion
    //#region init partial
    async initPartial(initOptions) {
        //#region @backendFunc
        lib_5.Helpers.taskStarted(`Initing project: ${lib_2.chalk.bold(this.project.genericName)} ${initOptions.init.struct ? '(without packages install)' : ''} `);
        // const updatedConfig =
        // if (updatedConfig) {
        //   initOptions = updatedConfig;
        // }
        if (this.project.framework.isStandaloneProject) {
            await this.insideStructureLib.init(initOptions);
            this.filesTemplatesBuilder.rebuild(initOptions);
        }
        if (this.project.framework.isStandaloneProject) {
            this.project.quickFixes.addMissingSrcFolderToEachProject();
            this.project.quickFixes.missingAngularLibFiles();
        }
        if (this.project.framework.isContainerCoreProject) {
            this.project.quickFixes.createDummyEmptyLibsReplacements([]); // TODO
            this.project.quickFixes.removeBadTypesInNodeModules();
        }
        if (this.project.framework.isStandaloneProject) {
            await this.project.artifactsManager.artifact.angularNodeApp.migrationHelper.runTask({
                watch: false,
            });
            await this.creteBuildInfoFile(initOptions);
            if (this.project.taonJson.shouldGenerateAutogenIndexFile) {
                await this.indexAutogenProvider.runTask({
                // watch: initOptions.build.watch, // TODO watching sucks here
                });
            }
            else {
                this.indexAutogenProvider.writeIndexFile(true);
            }
            if (this.project.taonJson.shouldGenerateAutogenAppRoutesFile) {
                await this.appTsRoutesAutogenProvider.runTask({
                // watch: initOptions.build.watch, // TODO watching sucks here
                });
            }
        }
        lib_5.Helpers.log(`Init DONE for project: ${lib_2.chalk.bold(this.project.genericName)} `);
        this.project.quickFixes.makeSureDistFolderExists();
        // Helpers.info(`[buildLib] start of building ${websql ? '[WEBSQL]' : ''}`);
        this.copyEssentialFilesTo([
            (0, lib_2.crossPlatformPath)([this.project.pathFor(constants_1.distMainProject)]),
        ]);
        return initOptions;
        //#endregion
    }
    //#endregion
    //#region build partial
    async buildPartial(buildOptions, opt) {
        //#region @backendFunc
        /**
         * TODO this may be possible with proper tsc build
         */
        const isDevelopmentBuildUseTscInsteadNgBuild = false; // !buildOptions.release.releaseType;
        if (!this.project.framework.isStandaloneProject) {
            lib_5.Helpers.warn(`Project is not standalone. Skipping npm-lib-and-cli-tool build.`);
            return;
        }
        const packageName = this.project.nameForNpmPackage;
        const isOrganizationPackage = this.project.nameForNpmPackage.startsWith('@');
        const orgParams = buildOptions.clone();
        buildOptions = await this.project.artifactsManager.init(buildOptions);
        //#region handle prod build 2 sequences
        if (buildOptions.build.prod) {
            await this.buildPartial(buildOptions.clone({
                build: {
                    prod: false,
                },
            }), { normalBuildBeforeProd: true });
        }
        //#endregion
        //#region handle envionment constant recreatino in watch mode
        if (buildOptions.build.watch) {
            this.project.environmentConfig.watchAndRecreate(async () => {
                await this.project.environmentConfig.update(orgParams.clone({
                    release: {
                        targetArtifact: buildOptions.release.targetArtifact,
                        envName: '__',
                    },
                }), { fromWatcher: true, saveEnvToLibEnv: true });
            });
        }
        //#endregion
        //#region handle skipping build
        const shouldSkipBuild = this.shouldSkipBuild(buildOptions);
        const tmpProjNpmLibraryInNodeModulesAbsPath = this.project.pathFor([
            constants_1.tmpLocalCopytoProjDist,
            constants_1.nodeModulesMainProject,
            packageName,
        ]);
        if (shouldSkipBuild) {
            lib_5.Helpers.warn(`

        Skipping build of npm-lib-and-cli-tool artifact...

        `);
            return {
                tmpProjNpmLibraryInNodeModulesAbsPath,
                isOrganizationPackage,
                packageName,
            };
        }
        //#endregion
        lib_5.Helpers.logInfo(`Start of (${buildOptions.build.watch ? 'watch' : 'normal'}) lib building...`);
        //#region init incremental process
        const incrementalBuildProcess = new incremental_build_process_1.IncrementalBuildProcess(this.project, buildOptions);
        //#endregion
        //#region init proxy projects
        const proxyProject = (0, app_utils_1.getProxyNgProj)(this.project, buildOptions.clone({
            build: {
                websql: false,
            },
        }), options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL);
        const proxyProjectWebsql = (0, app_utils_1.getProxyNgProj)(this.project, buildOptions.clone({
            build: {
                websql: true,
            },
        }), options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL);
        lib_5.Helpers.log(`

    proxy Proj = ${proxyProject?.location}
    proxy Proj websql = ${proxyProjectWebsql?.location}

    `);
        //#endregion
        //#region prepare commands + base href
        // const command = `${loadNvm} && ${this.npmRunNg} build ${this.name} ${watch ? '--watch' : ''}`;
        const commandForLibraryBuild = isDevelopmentBuildUseTscInsteadNgBuild
            ? `${constants_1.TaonCommands.NPM_RUN_TSC} -p tsconfig.typecheck.json --watch --preserveWatchOutput `
            : `${constants_1.TaonCommands.NPM_RUN_NG} build ${this.project.name} ${buildOptions.build.watch ? '--watch' : ''}`;
        //#region show angular info function
        const showInfoAngular = () => {
            lib_5.Helpers.info(`Starting browser Angular/TypeScirpt build.... ${buildOptions.build.websql ? '[WEBSQL]' : ''}`);
            lib_5.Helpers.log(`

      ANGULAR ${this.project.framework.coreContainer?.packageJson.version} ${buildOptions.build.watch ? 'WATCH ' : ''} LIB BUILD STARTED... ${buildOptions.build.websql ? '[WEBSQL]' : ''}

      `);
            lib_5.Helpers.log(` command for ng build: ${commandForLibraryBuild}`);
        };
        //#endregion
        //#region resolve & save base href
        buildOptions.build.baseHref = !lib_3._.isUndefined(buildOptions.build.baseHref)
            ? buildOptions.build.baseHref
            : this.artifacts.angularNodeApp.angularFeBasenameManager.rootBaseHref;
        this.project.writeFile(constants_1.tmpBaseHrefOverwrite, buildOptions.build.baseHref);
        //#endregion
        lib_5.Helpers.logInfo(`

    ${buildOptions.build.prod
            ? '[PROD]'
            : `[DEV${opt?.normalBuildBeforeProd ? '-BEFORE-PROD' : ''}]`} Building lib for base href: ${!lib_3._.isUndefined(buildOptions.build.baseHref)
            ? `'` + buildOptions.build.baseHref + `'`
            : '/ (default)'}

      `);
        //#endregion
        //#region actuall build of taon npm lib
        if (!buildOptions.build.watch &&
            buildOptions.release.releaseType &&
            !buildOptions.release.skipCodeCutting) {
            this.__cutReleaseCodeFromSrc(buildOptions);
        }
        //#region incremental build
        await incrementalBuildProcess.runTask({
            taskName: 'isomorphic compilation',
            watch: buildOptions.build.watch,
        });
        await this.assetsManager.runTask({
            watch: buildOptions.build.watch,
        });
        showInfoAngular();
        //#endregion
        //#region ng build
        const outputOptions = await this.outputFixNgLibBuild(buildOptions);
        const watchResolveString = isDevelopmentBuildUseTscInsteadNgBuild
            ? constants_1.COMPILATION_COMPLETE_TSC
            : constants_1.COMPILATION_COMPLETE_LIB_NG_BUILD;
        const runNgBuild = async () => {
            await proxyProject.execute(commandForLibraryBuild, {
                similarProcessKey: constants_1.TaonCommands.NG,
                resolvePromiseMsg: {
                    stdout: buildOptions.build.watch ? watchResolveString : undefined,
                },
                rebuildOnChange: buildOptions.build.watch
                    ? this.project.tmpSourceRebuildForBrowserObs
                    : void 0,
                ...outputOptions,
            });
            await proxyProjectWebsql.execute(commandForLibraryBuild, {
                similarProcessKey: constants_1.TaonCommands.NG,
                resolvePromiseMsg: {
                    stdout: buildOptions.build.watch ? watchResolveString : undefined,
                },
                rebuildOnChange: buildOptions.build.watch
                    ? this.project.tmpSourceRebuildForWebsqlObs
                    : void 0,
                ...outputOptions,
            });
        };
        //#endregion
        //#region set angular.json default tasks
        const tmpLibForDistNormalRelativePath = (0, app_utils_1.angularProjProxyPath)({
            project: this.project,
            targetArtifact: buildOptions.release.targetArtifact,
            envOptions: buildOptions.clone({
                build: { websql: false },
            }),
        });
        const tmpLibForDistWebsqlRelativePath = (0, app_utils_1.angularProjProxyPath)({
            project: this.project,
            targetArtifact: buildOptions.release.targetArtifact,
            envOptions: buildOptions.clone({
                build: { websql: true },
            }),
        });
        this.project.setValueToJSONC([tmpLibForDistNormalRelativePath, constants_1.CoreNgTemplateFiles.ANGULAR_JSON], `projects["${this.project.name}"].architect.build.${constants_1.defaultConfiguration}`, (0, constants_1.AngularJsonLibTaskNameResolveFor)(buildOptions));
        this.project.setValueToJSONC([tmpLibForDistWebsqlRelativePath, constants_1.CoreNgTemplateFiles.ANGULAR_JSON], `projects["${this.project.name}"].architect.build.${constants_1.defaultConfiguration}`, (0, constants_1.AngularJsonLibTaskNameResolveFor)(buildOptions));
        this.project.remove([tmpLibForDistNormalRelativePath, '.angular']);
        this.project.remove([tmpLibForDistWebsqlRelativePath, '.angular']);
        //#endregion
        //#region  handle watch & normal mode
        if (buildOptions.build.watch) {
            await runNgBuild();
        }
        else {
            try {
                await runNgBuild();
            }
            catch (e) {
                console.error(e);
                lib_5.Helpers.throwError(`
          Command failed: ${commandForLibraryBuild}

          Not able to build project: ${this.project.genericName}`);
            }
        }
        //#endregion
        if (!buildOptions.build.watch &&
            buildOptions.release.releaseType &&
            !buildOptions.release.skipCodeCutting) {
            this.__restoreCuttedReleaseCodeFromSrc(buildOptions);
        }
        //#endregion
        //#region start copy manager
        if (!buildOptions.copyToManager.skip && !opt?.normalBuildBeforeProd) {
            if (lib_3._.isFunction(buildOptions.copyToManager.beforeCopyHook)) {
                await buildOptions.copyToManager.beforeCopyHook();
            }
            if (buildOptions.build.prod) {
                //#region copy browser, websql prod to normal dist
                //#region copy browser, websql prod to normal dist / lib
                lib_5.HelpersTaon.copy(this.project.pathFor([
                    constants_1.distMainProject + constants_1.prodSuffix,
                    constants_1.libFromCompiledDist,
                ]), this.project.pathFor([
                    constants_1.distMainProject,
                    constants_1.libFromCompiledDist + constants_1.prodSuffix,
                ]), {
                    recursive: true,
                    overwrite: true,
                });
                lib_5.HelpersTaon.copyFile(this.project.pathFor([
                    constants_1.distMainProject + constants_1.prodSuffix,
                    constants_1.libFromCompiledDist + constants_1.prodSuffix + `.${constants_1.splitNamespacesJson}`,
                ]), this.project.pathFor([
                    constants_1.distMainProject,
                    constants_1.libFromCompiledDist + constants_1.prodSuffix + `.${constants_1.splitNamespacesJson}`,
                ]));
                lib_5.HelpersTaon.copyFile(this.project.pathFor([
                    constants_1.distMainProject + constants_1.prodSuffix,
                    constants_1.libFromCompiledDist + constants_1.prodSuffix + `.${constants_1.reExportJson}`,
                ]), this.project.pathFor([
                    constants_1.distMainProject,
                    constants_1.libFromCompiledDist + constants_1.prodSuffix + `.${constants_1.reExportJson}`,
                ]));
                //#endregion
                //#region copy browser, websql prod to normal dist / browser
                lib_5.HelpersTaon.copyFile(this.project.pathFor([
                    constants_1.distMainProject + constants_1.prodSuffix,
                    constants_1.browserFromCompiledDist + constants_1.prodSuffix + `.${constants_1.splitNamespacesJson}`,
                ]), this.project.pathFor([
                    constants_1.distMainProject,
                    constants_1.browserFromCompiledDist + constants_1.prodSuffix + `.${constants_1.splitNamespacesJson}`,
                ]));
                lib_5.HelpersTaon.copyFile(this.project.pathFor([
                    constants_1.distMainProject + constants_1.prodSuffix,
                    constants_1.browserFromCompiledDist + constants_1.prodSuffix + `.${constants_1.reExportJson}`,
                ]), this.project.pathFor([
                    constants_1.distMainProject,
                    constants_1.browserFromCompiledDist + constants_1.prodSuffix + `.${constants_1.reExportJson}`,
                ]));
                lib_5.HelpersTaon.copy(this.project.pathFor([
                    constants_1.distMainProject + constants_1.prodSuffix,
                    constants_1.browserMainProject,
                ]), this.project.pathFor([
                    constants_1.distMainProject,
                    constants_1.browserMainProject + constants_1.prodSuffix,
                ]), { recursive: true, overwrite: true });
                //#endregion
                //#region copy browser, websql prod to normal dist / websql
                lib_5.HelpersTaon.copyFile(this.project.pathFor([
                    constants_1.distMainProject + constants_1.prodSuffix,
                    constants_1.websqlFromCompiledDist + constants_1.prodSuffix + `.${constants_1.splitNamespacesJson}`,
                ]), this.project.pathFor([
                    constants_1.distMainProject,
                    constants_1.websqlFromCompiledDist + constants_1.prodSuffix + `.${constants_1.splitNamespacesJson}`,
                ]));
                lib_5.HelpersTaon.copyFile(this.project.pathFor([
                    constants_1.distMainProject + constants_1.prodSuffix,
                    constants_1.websqlFromCompiledDist + constants_1.prodSuffix + `.${constants_1.reExportJson}`,
                ]), this.project.pathFor([
                    constants_1.distMainProject,
                    constants_1.websqlFromCompiledDist + constants_1.prodSuffix + `.${constants_1.reExportJson}`,
                ]));
                lib_5.HelpersTaon.copy(this.project.pathFor([
                    constants_1.distMainProject + constants_1.prodSuffix,
                    constants_1.websqlMainProject,
                ]), this.project.pathFor([
                    constants_1.distMainProject,
                    constants_1.websqlMainProject + constants_1.prodSuffix,
                ]), { recursive: true, overwrite: true });
                //#endregion
                //#endregion
            }
            this.copyNpmDistLibManager.init(buildOptions);
            await this.copyNpmDistLibManager.runTask({
                taskName: 'copyto manger',
                watch: buildOptions.build.watch,
            });
        }
        //#endregion
        //#region show ending info
        if (!opt?.normalBuildBeforeProd) {
            this.showMesageWhenBuildLibDone(buildOptions);
        }
        lib_5.Helpers.info(buildOptions.build.watch
            ? `
     [${(0, lib_2.dateformat)(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
     Files watcher started.. ${buildOptions.build.websql ? '[WEBSQL]' : ''}
   `
            : `
     [${(0, lib_2.dateformat)(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
     End of Building ${this.project.genericName} ${buildOptions.build.websql ? '[WEBSQL]' : ''}

   `);
        //#endregion
        return {
            tmpProjNpmLibraryInNodeModulesAbsPath,
            isOrganizationPackage,
            packageName,
        };
        //#endregion
    }
    //#endregion
    //#region release partial
    async releasePartial(releaseOptions) {
        //#region @backendFunc
        //#region prepare variables
        let releaseType = releaseOptions.release.releaseType;
        const projectsReposToPushAndTag = [this.project.location];
        const projectsReposToPush = [];
        releaseOptions = this.updateResolvedVersion(releaseOptions);
        const { tmpProjNpmLibraryInNodeModulesAbsPath } = await this.buildPartial(releaseOptions.clone({
            build: {
                prod: releaseOptions.release.targetArtifact ===
                    options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
                watch: false,
            },
        }));
        let releaseProjPath = tmpProjNpmLibraryInNodeModulesAbsPath;
        //#endregion
        if (releaseOptions.release.releaseType !== options_1.ReleaseType.LOCAL) {
            this.removeNotNpmRelatedFilesFromReleaseBundle(releaseProjPath);
        }
        this.copyEssentialFilesTo([tmpProjNpmLibraryInNodeModulesAbsPath]);
        this.packResource(tmpProjNpmLibraryInNodeModulesAbsPath);
        this.fixPackageJsonForRelease(tmpProjNpmLibraryInNodeModulesAbsPath, releaseOptions.release.resolvedNewVersion);
        this.preparePackageJsonForReleasePublish(tmpProjNpmLibraryInNodeModulesAbsPath);
        await this.runAfterReleaseJsCodeActions(tmpProjNpmLibraryInNodeModulesAbsPath, releaseOptions);
        const projFromCompiled = this.project.ins.From(tmpProjNpmLibraryInNodeModulesAbsPath);
        const allowedToNpmReleases = [
            options_1.ReleaseType.MANUAL,
            options_1.ReleaseType.CLOUD,
        ];
        // console.log(`
        //   doNotIncludeLibFiles: ${releaseOptions.release.lib.doNotIncludeLibFiles}
        //   `);
        const clearLibFiles = (folderAbsPath) => {
            lib_5.Helpers.remove([folderAbsPath, constants_1.libFromSrc]);
            lib_5.Helpers.remove([folderAbsPath, constants_1.libFromSrc + constants_1.prodSuffix]);
            lib_5.Helpers.remove([folderAbsPath, constants_1.sourceLinkInNodeModules]);
            lib_5.Helpers.remove([folderAbsPath, constants_1.assetsFromSrc]);
            lib_5.Helpers.remove([folderAbsPath, constants_1.browserMainProject]);
            lib_5.Helpers.remove([folderAbsPath, constants_1.browserMainProject + constants_1.prodSuffix]);
            lib_5.Helpers.remove([folderAbsPath, lib_1.folderName.client]); // TODO REMOVE
            lib_5.Helpers.remove([folderAbsPath, constants_1.websqlMainProject]);
            lib_5.Helpers.remove([folderAbsPath, constants_1.websqlMainProject + constants_1.prodSuffix]);
            lib_5.Helpers.remove([folderAbsPath, constants_1.migrationsFromLib]);
            lib_5.Helpers.remove([folderAbsPath, constants_1.srcMainProject]);
            lib_5.Helpers.remove([folderAbsPath, 'src.*']);
            lib_5.Helpers.remove([folderAbsPath, 'index.*']);
            lib_5.Helpers.remove([folderAbsPath, constants_1.cliDtsNpmPackage]);
            lib_5.Helpers.remove([folderAbsPath, constants_1.cliJSMapNpmPackage]);
            lib_5.HelpersTaon.setValueToJSON([folderAbsPath, constants_1.packageJsonNpmLib], 'scripts', {});
        };
        if (releaseOptions.release.lib.doNotIncludeLibFiles &&
            releaseOptions.release.releaseType !== options_1.ReleaseType.LOCAL) {
            clearLibFiles(releaseProjPath);
        }
        //#region remove lagacy file from final bundle
        lib_5.Helpers.remove([
            tmpProjNpmLibraryInNodeModulesAbsPath,
            lib_4.fileName.package_json__devDependencies_json,
        ]);
        lib_5.Helpers.remove([
            tmpProjNpmLibraryInNodeModulesAbsPath,
            lib_4.fileName.package_json__tnp_json5,
        ]);
        lib_5.Helpers.remove([
            tmpProjNpmLibraryInNodeModulesAbsPath,
            lib_4.fileName.package_json__tnp_json,
        ]);
        lib_5.Helpers.remove([
            tmpProjNpmLibraryInNodeModulesAbsPath,
            lib_4.fileName.tnpEnvironment_json,
        ]);
        lib_5.Helpers.remove([
            tmpProjNpmLibraryInNodeModulesAbsPath,
            constants_1.taonJsonMainProject,
        ]);
        lib_5.Helpers.remove([tmpProjNpmLibraryInNodeModulesAbsPath, constants_1.migrationsFromLib]);
        lib_5.Helpers.remove([tmpProjNpmLibraryInNodeModulesAbsPath, 'firedev.jsonc']);
        lib_5.Helpers.remove([tmpProjNpmLibraryInNodeModulesAbsPath, 'client']);
        //#endregion
        let deploymentFunction = void 0;
        if (allowedToNpmReleases.includes(releaseOptions.release.releaseType)) {
            if (!releaseOptions.release.skipNpmPublish) {
                deploymentFunction = async () => {
                    await projFromCompiled.releaseProcess.publishToNpm(tmpProjNpmLibraryInNodeModulesAbsPath, releaseOptions.release.autoReleaseUsingConfig);
                };
            }
        }
        else {
            if (releaseOptions.release.releaseType === options_1.ReleaseType.LOCAL) {
                //#region local release
                let destinationUrl = this.project.location;
                if (releaseOptions.release.cli.useLocalReleaseBranch) {
                    const branchName = `release/${releaseOptions.release.releaseType}/${this.project.name}--` +
                        `env-${releaseOptions.release.envName}${releaseOptions.release.envNumber || ''}`;
                    const repoName = `${this.project.name}-${releaseOptions.release.envName}${releaseOptions.release.envNumber || ''}`;
                    const repoRoot = this.project.pathFor([
                        `.${lib_1.config.frameworkName}`,
                        this.currentArtifactName,
                        releaseOptions.release.releaseType,
                    ]);
                    const repoPath = (0, lib_2.crossPlatformPath)([repoRoot, repoName]);
                    const repoUrl = this.project.git.remoteOriginUrl;
                    if (!lib_5.Helpers.exists(repoPath)) {
                        lib_5.Helpers.mkdirp(repoRoot);
                        await lib_5.HelpersTaon.git.clone({
                            cwd: repoRoot,
                            url: repoUrl,
                            override: true,
                            destinationFolderName: repoName,
                        });
                    }
                    lib_5.HelpersTaon.git.resetHard(repoPath);
                    lib_5.HelpersTaon.git.checkout(repoPath, branchName, {
                        createBranchIfNotExists: true,
                        fetchBeforeCheckout: true,
                        switchBranchWhenExists: true,
                    });
                    destinationUrl = repoPath;
                    projectsReposToPush.push(repoPath);
                }
                const releaseDest = (0, lib_2.crossPlatformPath)([
                    destinationUrl,
                    constants_1.localReleaseMainProject,
                    this.currentArtifactName,
                    `${this.project.name}${constants_1.suffixLatest}`,
                ]);
                lib_5.Helpers.remove(releaseDest, true);
                lib_5.HelpersTaon.copy(releaseProjPath, releaseDest);
                lib_5.Helpers.taskStarted(`Installing dependencies for local release...`);
                lib_5.Helpers.run(`npm install`, { cwd: releaseProjPath }).sync();
                lib_5.Helpers.taskDone(`Dependencies installed for local release.`);
                releaseProjPath = releaseDest;
                if (releaseOptions.release.lib.doNotIncludeLibFiles) {
                    clearLibFiles(releaseProjPath);
                }
                this.removeNotNpmRelatedFilesFromReleaseBundle(releaseProjPath);
                if (releaseOptions.release.installLocally) {
                    // console.log('SHOULD INSTALL LOCALLY');
                    lib_5.Helpers.taskStarted('Linking local package globally...');
                    lib_5.Helpers.run(`npm link`, { cwd: releaseProjPath }).sync();
                    lib_5.Helpers.taskDone(`Done linking local package globally.

            Now you can use it globally via CLI:
            ${this.project.nameForCli} <command>

            `);
                }
                lib_5.Helpers.info(`Local release done: ${releaseDest}`);
                //#endregion
            }
        }
        return {
            resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
            releaseProjPath,
            releaseType,
            projectsReposToPush,
            projectsReposToPushAndTag,
            deploymentFunction,
        };
        //#endregion
    }
    //#endregion
    //#region clear partial
    async clearPartial(options) {
        // TODO make it better
        while (true) {
            try {
                lib_2.rimraf.sync(this.project.pathFor(constants_1.distMainProject) + '*');
                lib_2.rimraf.sync(this.project.pathFor(lib_1.folderName.tmp) + '*');
                return;
            }
            catch (error) {
                lib_5.HelpersTaon.pressKeyAndContinue(constants_1.MESSAGES.SHUT_DOWN_FOLDERS_AND_DEBUGGERS);
                continue;
            }
        }
    }
    /**
     * TODO
     * @param options
     * @returns
     */
    async clearLib(options) {
        //#region @backendFunc
        lib_5.Helpers.taskStarted(`Cleaning project: ${this.project.genericName}`);
        if (this.project.typeIs(lib_1.LibTypeEnum.UNKNOWN) ||
            this.project.typeIs(lib_1.LibTypeEnum.UNKNOWN_NPM_PROJECT)) {
            return;
        }
        while (true) {
            try {
                lib_2.rimraf.sync((0, lib_2.crossPlatformPath)([this.project.location, lib_1.folderName.tmp + '*']));
                lib_2.rimraf.sync((0, lib_2.crossPlatformPath)([this.project.location, lib_1.folderName.dist + '*']));
                try {
                    this.project.removeFile(constants_1.nodeModulesMainProject);
                }
                catch (error) {
                    this.project.remove(constants_1.nodeModulesMainProject);
                }
                this.project.removeFile(constants_1.browserMainProject);
                this.project.removeFile(constants_1.websqlMainProject);
                this.project.removeFile(constants_1.browserMainProject + constants_1.prodSuffix);
                this.project.removeFile(constants_1.websqlMainProject + constants_1.prodSuffix);
                this.project.removeFile(lib_4.fileName.tnpEnvironment_json);
                if (this.project.framework.isCoreProject) {
                    return;
                }
                lib_2.glob
                    .sync(`${this.project.location}/*${constants_1.dotFileTemplateExt}`)
                    .forEach(fileTemplate => {
                    lib_5.Helpers.remove(fileTemplate);
                    lib_5.Helpers.remove(fileTemplate.replace(constants_1.dotFileTemplateExt, ''));
                });
                this.project.removeFile(lib_4.fileName.tnpEnvironment_json);
                break;
            }
            catch (error) {
                lib_5.HelpersTaon.pressKeyAndContinue(constants_1.MESSAGES.SHUT_DOWN_FOLDERS_AND_DEBUGGERS);
            }
        }
        this.project.quickFixes.addMissingSrcFolderToEachProject();
        lib_5.Helpers.info(`Cleaning project: ${this.project.genericName} done`);
        if (options.recursiveAction) {
            for (const child of this.project.children) {
                await child.clear(options);
            }
        }
        //#endregion
    }
    //#endregion
    //#region unlink node_modules when tnp
    unlinkNodeModulesWhenTnp() {
        //#region @backendFunc
        let shouldUnlinkNodeModules = false;
        if (lib_1.config.frameworkName === 'tnp') {
            // TODO QUICK_FIX
            const { isCoreContainer, coreContainerFromNodeModules } = this.project.framework.containerDataFromNodeModulesLink;
            const isIncorrectLinkToNodeModules = !!coreContainerFromNodeModules &&
                this.project.taonJson.frameworkVersion !==
                    coreContainerFromNodeModules.taonJson.frameworkVersion;
            shouldUnlinkNodeModules =
                isCoreContainer &&
                    isIncorrectLinkToNodeModules &&
                    this.project.nodeModules.isLink;
        }
        if (shouldUnlinkNodeModules) {
            this.project.nodeModules.unlinkNodeModulesWhenLinked();
        }
        //#region TODO LAST TEST THIS ON WINDOWS
        // if (
        //   !Helpers.isSymlinkFileExitedOrUnexisted(this.project.nodeModules.path)
        // ) {
        //   Helpers.taskStarted('Checking if node_modules folder is correct...');
        //   const minDepsLength = Object.keys(
        //     this.project.npmHelpers.packageJson.allDependencies,
        //   ).length;
        //   const notFullyInstalled =
        //     Helpers.findChildren(this.project.nodeModules.path, c => c).length <
        //     minDepsLength + 1;
        //   if (notFullyInstalled) {
        //     try {
        //       Helpers.info(`Removing incorrect node_modules folder...`);
        //       Helpers.removeSymlinks(this.project.nodeModules.path);
        //       Helpers.remove(this.project.nodeModules.path, true);
        //     } catch (error) {}
        //   }
        //   Helpers.taskDone('Checking if node_modules folder is correct DONE...');
        // }
        //#endregion
        //#endregion
    }
    //#endregion
    //#region private methods
    //#region private methods / fix release package.json
    fixPackageJsonForRelease(releaseProjPath, newVersion) {
        //#region @backendFunc
        const folderToFix = [
            constants_1.browserMainProject,
            constants_1.websqlMainProject,
            constants_1.browserMainProject + constants_1.prodSuffix,
            constants_1.websqlMainProject + constants_1.prodSuffix,
        ];
        for (const folder of folderToFix) {
            const folderAbsPath = (0, lib_2.crossPlatformPath)([releaseProjPath, folder]);
            lib_5.Helpers.remove([folderAbsPath, constants_1.dotNpmIgnoreMainProject]);
            // const rootPackageNameForChildBrowser = crossPlatformPath([
            //   this.project.nameForNpmPackage,
            //   folder,
            // ]);
            // const childName = _.kebabCase(this.project.nameForNpmPackage);
            // const browserOrWebsql = _.last(rootPackageNameForChildBrowser.split('/'));
            lib_5.HelpersTaon.setValueToJSON([folderAbsPath, constants_1.packageJsonNpmLib], 'sideEffects', this.project.packageJson.sideEffects);
            lib_5.HelpersTaon.setValueToJSON([folderAbsPath, constants_1.packageJsonNpmLib], 'version', newVersion);
        }
        const prodbrowsefoldersToFix = [
            constants_1.browserMainProject + constants_1.prodSuffix,
            constants_1.websqlMainProject + constants_1.prodSuffix,
        ];
        for (const folder of prodbrowsefoldersToFix) {
            const folderAbsPath = (0, lib_2.crossPlatformPath)([releaseProjPath, folder]);
            lib_5.HelpersTaon.setValueToJSON([folderAbsPath, constants_1.packageJsonNpmLib], 'name', (0, lib_2.crossPlatformPath)([this.project.nameForNpmPackage, folder]));
        }
        const folderToFixBackend = [
            constants_1.libFromNpmPackage,
            constants_1.libFromNpmPackage + constants_1.prodSuffix,
        ];
        for (const folder of folderToFixBackend) {
            const folderAbsPath = (0, lib_2.crossPlatformPath)([releaseProjPath, folder]);
            lib_5.Helpers.remove([folderAbsPath, constants_1.dotNpmIgnoreMainProject]);
            const packageName = (0, lib_2.crossPlatformPath)([
                this.project.nameForNpmPackage,
                folder,
            ]);
            const pjBackendLib = {
                name: packageName,
                version: newVersion,
                // ! TODO @LAST ADD ESM SUPPORT
                // sideEffects: this.project.packageJson.sideEffects,
                // module: 'fesm2022/json10-writer-browser.mjs',
                // typings: 'types/json10-writer-browser.d.ts',
                // exports: {
                //   './package.json': {
                //     default: './package.json',
                //   },
                //   '.': {
                //     types: './types/json10-writer-browser.d.ts',
                //     default: './fesm2022/json10-writer-browser.mjs',
                //   },
                // },
            };
            lib_5.Helpers.writeJson([folderAbsPath, constants_1.packageJsonNpmLib], pjBackendLib);
        }
        //#endregion
    }
    //#endregion
    //#region private methods / run after release js code actions
    async runAfterReleaseJsCodeActions(releaseAbsPath, releaseOptions) {
        //#region cli
        if (releaseOptions.release.cli.includeNodeModules) {
            // await this.project.nodeModules.removeOwnPackage(async () => {
            await this.backendIncludeNodeModulesInCompilation(releaseAbsPath, releaseOptions.release.cli.minify, releaseOptions.build.prod);
            // });
        }
        const reservedNames = ['reservedExpSec', 'reservedExpOne'];
        if (releaseOptions.release.cli.uglify) {
            await this.backendMinifyCode({
                releaseAbsPath,
                strategy: 'cli-only',
                reservedNames,
                compress: releaseOptions.release.cli.compress,
            });
        }
        if (releaseOptions.release.cli.obscure) {
            await this.backendObscureCode({
                releaseAbsPath,
                strategy: 'cli-only',
                reservedNames,
            });
        }
        //#endregion
        //#region lib
        if (releaseOptions.release.lib.removeDts) {
            await this.backendReleaseRemoveDts(releaseAbsPath);
        }
        if (releaseOptions.release.lib.uglifyFileByFile) {
            await this.backendMinifyCode({
                releaseAbsPath,
                strategy: 'lib-only',
                reservedNames,
                compress: releaseOptions.release.lib.compress,
            });
        }
        if (releaseOptions.release.lib.obscureFileByFile) {
            await this.backendObscureCode({
                releaseAbsPath,
                strategy: 'lib-only',
                reservedNames,
            });
        }
        //#endregion
        // await this.backendRemoveJsMapsFrom(releaseAbsPath);
    }
    //#endregion
    //#region private methods / prepare package json for release publish
    preparePackageJsonForReleasePublish(relaseAbsPath) {
        //#region @backendFunc
        const pathInRelease = (0, lib_2.crossPlatformPath)([relaseAbsPath, constants_1.packageJsonNpmLib]);
        lib_5.HelpersTaon.copyFile(this.project.packageJson.path, pathInRelease);
        const pj = new lib_5.BasePackageJson({
            cwd: relaseAbsPath,
        });
        const dependencies = pj.dependencies;
        pj.setDependencies({});
        if (this.project.taonJson.dependenciesNamesForNpmLib) {
            pj.setDependencies([
                ...this.project.taonJson.dependenciesNamesForNpmLib,
                ...this.project.taonJson.isomorphicDependenciesForNpmLib,
            ].reduce((a, b) => {
                return { ...a, [b]: dependencies[b] };
            }, {}));
        }
        if (this.project.taonJson.peerDependenciesNamesForNpmLib) {
            pj.setPeerDependencies(this.project.taonJson.peerDependenciesNamesForNpmLib.reduce((a, b) => {
                return { ...a, [b]: dependencies[b] };
            }, {}));
        }
        if (this.project.taonJson.devDependenciesNamesForNpmLib) {
            pj.setDevDependencies(this.project.taonJson.devDependenciesNamesForNpmLib.reduce((a, b) => {
                return { ...a, [b]: dependencies[b] };
            }, {}));
        }
        const optionalDeps = pj.optionalDependencies;
        if (this.project.taonJson.optionalDependenciesNamesForNpmLib) {
            pj.setOptionalDependencies(this.project.taonJson.optionalDependenciesNamesForNpmLib.reduce((a, b) => {
                return { ...a, [b]: optionalDeps[b] };
            }, {}));
        }
        if (!pj.repository) {
            pj.setRepository({
                type: 'git',
                url: lib_5.HelpersTaon.git.originSshToHttp(this.project.git.originURL),
            });
        }
        //#endregion
    }
    //#endregion
    //#region private methods / remove not npm releated files from release bundle
    removeNotNpmRelatedFilesFromReleaseBundle(releaseAbsPath) {
        //#region @backendFunc
        lib_5.Helpers.remove(`${releaseAbsPath}/${constants_1.appFromSrc}*`); // QUICK_FIX
        lib_5.Helpers.remove(`${releaseAbsPath}/${constants_1.testsFromSrc}*`); // QUICK_FIX
        lib_5.Helpers.remove(`${releaseAbsPath}/${constants_1.srcMainProject}`, true); // QUICK_FIX
        // Helpers.removeFileIfExists(`${relaseAbsPath}/source`);
        // regenerate src.d.ts
        lib_5.Helpers.writeFile((0, lib_2.crossPlatformPath)([releaseAbsPath, 'src.d.ts']), `
${constants_1.THIS_IS_GENERATED_INFO_COMMENT}
export * from './${constants_1.libFromSrc}';
${constants_1.THIS_IS_GENERATED_INFO_COMMENT}
// please use command: taon build:watch to see here links for your globally builded lib code files
${constants_1.THIS_IS_GENERATED_INFO_COMMENT}
    `.trimStart());
        //#endregion
    }
    //#endregion
    //#region private methods / fix terminal output paths
    async outputFixNgLibBuild(buildOptions) {
        const taonActionFromParentName = lib_1.GlobalStorage.get(lib_1.taonActionFromParent);
        return {
            // askToTryAgainOnError: true,
            exitOnErrorCallback: async (code) => {
                if (buildOptions.release.releaseType) {
                    throw 'Typescript compilation lib error';
                }
                else {
                    lib_5.Helpers.error(`[${lib_1.config.frameworkName}] Typescript compilation lib error (code=${code})`, false, true);
                }
            },
            outputLineReplace: (line) => {
                // line = UtilsString.removeChalkSpecialChars(line);
                if (line.startsWith('WARNING: postcss-url')) {
                    return ' --- [taon] IGNORED WARN ---- ';
                }
                line = line.replace(`projects/${this.project.name}/${constants_1.srcMainProject}/`, `./${constants_1.srcMainProject}/`);
                if (line.includes(`../../${constants_1.nodeModulesMainProject}/`)) {
                    line = line.replace(`../../${constants_1.nodeModulesMainProject}/`, `./${constants_1.nodeModulesMainProject}/`);
                }
                // ../../../../tmpSrcDistWebsql/lib/layout-proj-ng-related/layout-proj-ng-related.component.scss
                if (line.includes(`../../../../${constants_1.tmpSrcDistWebsql + constants_1.prodSuffix}/`)) {
                    line = line.replace(`../../../../${constants_1.tmpSrcDistWebsql + constants_1.prodSuffix}/`, `./${constants_1.srcMainProject}/`);
                }
                if (line.includes(`../../../../${constants_1.tmpSrcDistWebsql}/`)) {
                    line = line.replace(`../../../../${constants_1.tmpSrcDistWebsql}/`, `./${constants_1.srcMainProject}/`);
                }
                if (line.includes(`../../../../${constants_1.tmpSrcDist + constants_1.prodSuffix}/`)) {
                    line = line.replace(`../../../../${constants_1.tmpSrcDist + constants_1.prodSuffix}/`, `./${constants_1.srcMainProject}/`);
                }
                if (line.includes(`../../../../${constants_1.tmpSrcDist}/`)) {
                    line = line.replace(`../../../../${constants_1.tmpSrcDist}/`, `./${constants_1.srcMainProject}/`);
                }
                if (line.search(`/${constants_1.srcMainProject}/${constants_1.libs}/`) !== -1) {
                    const [__, ___, ____, moduleName] = line.split('/');
                    // console.log({
                    //   moduleName,
                    //   standalone: 'inlib'
                    // })
                    return line.replace(`/${constants_1.srcMainProject}/${constants_1.libs}/${moduleName}/`, `/${moduleName}/${constants_1.srcMainProject}/${constants_1.libFromSrc}/`);
                }
                if (taonActionFromParentName && line.includes('./src/')) {
                    line = line.replace('./src/', `./${taonActionFromParentName}/src/`);
                }
                return line;
            },
        };
    }
    //#endregion
    //#region private methods / pack resources
    packResource(releaseDistFolder) {
        //#region @backendFunc
        if (!lib_2.fse.existsSync(releaseDistFolder)) {
            lib_2.fse.mkdirSync(releaseDistFolder);
        }
        [...this.project.taonJson.resources].forEach(res => {
            //  copy resource to org build and copy shared assets
            const file = lib_2.path.join(this.project.location, res);
            const dest = lib_2.path.join(releaseDistFolder, res);
            if (!lib_2.fse.existsSync(file)) {
                throw new Error(`[${lib_1.config.frameworkName}][lib-project] Resource file: ${lib_2.chalk.bold(lib_2.path.basename(file))} does not ` +
                    `exist in "${this.project.genericName}"  (package.json > resources[])
        `);
            }
            if (lib_2.fse.lstatSync(file).isDirectory()) {
                // console.log('IS DIRECTORY', file)
                // console.log('IS DIRECTORY DEST', dest)
                const filter = src => {
                    return !/.*node_modules.*/g.test(src);
                };
                lib_5.HelpersTaon.copy(file, dest, { filter });
            }
            else {
                // console.log('IS FILE', file)
                lib_2.fse.copyFileSync(file, dest);
            }
        });
        lib_5.Helpers.logInfo(`Resources copied to release folder: ${constants_1.distMainProject}`);
        //#endregion
    }
    //#endregion
    //#region private methods / copy essential files
    copyEssentialFilesTo(toDestinations) {
        //#region @backendFunc
        this.copyWhenExist(constants_1.binMainProject, toDestinations);
        this.copyWhenExist(constants_1.dotNpmrcMainProject, toDestinations);
        this.copyWhenExist(constants_1.dotNpmIgnoreMainProject, toDestinations);
        this.copyWhenExist(constants_1.dotGitIgnoreMainProject, toDestinations);
        //#endregion
    }
    //#endregion
    //#region private methods / copy when exists
    copyWhenExist(relativePath, destinations) {
        //#region @backendFunc
        const absPath = (0, lib_2.crossPlatformPath)([this.project.location, relativePath]);
        for (let index = 0; index < destinations.length; index++) {
            const dest = (0, lib_2.crossPlatformPath)([destinations[index], relativePath]);
            if (lib_5.Helpers.exists(absPath)) {
                if (lib_5.Helpers.isFolder(absPath)) {
                    lib_5.Helpers.remove(dest, true);
                    lib_5.HelpersTaon.copy(absPath, dest, { recursive: true });
                }
                else {
                    lib_5.HelpersTaon.copyFile(absPath, dest);
                }
            }
            else {
                lib_5.Helpers.log(`[isomorphic-lib][copyWhenExist] not exists: ${absPath}`);
            }
        }
        //#endregion
    }
    //#endregion
    //#region private methods / link when exists
    linkWhenExist(relativePath, destinations) {
        //#region @backendFunc
        let absPath = lib_2.path.join(this.project.location, relativePath);
        if (lib_5.Helpers.exists(absPath) && lib_5.Helpers.isExistedSymlink(absPath)) {
            absPath = lib_5.HelpersTaon.pathFromLink(absPath);
        }
        for (let index = 0; index < destinations.length; index++) {
            const dest = (0, lib_2.crossPlatformPath)([destinations[index], relativePath]);
            if (lib_5.Helpers.exists(absPath)) {
                lib_5.Helpers.remove(dest, true);
                lib_5.Helpers.createSymLink(absPath, dest);
            }
        }
        //#endregion
    }
    //#endregion
    //#region private methods / compile/cliBuildUglify backend code
    backendMinifyCode(options) {
        //#region @backendFunc
        const { strategy, releaseAbsPath, reservedNames, compress } = options;
        lib_5.Helpers.taskStarted(`Minifying started , strategy: ${strategy}`);
        const cliJsPath = (0, lib_2.crossPlatformPath)([releaseAbsPath, 'cli.js']);
        const files = strategy === 'cli-only'
            ? [cliJsPath]
            : [
                ...(strategy === 'lib-and-cli' ? [cliJsPath] : []),
                ...lib_5.Helpers.filesFrom([releaseAbsPath, 'lib'], true).filter(f => f.endsWith('.js')),
            ];
        for (const fileAbsPath of files) {
            const uglifiedTempPath = (0, lib_2.crossPlatformPath)([
                lib_2.path.dirname(fileAbsPath),
                lib_2.path.basename(fileAbsPath).replace('.js', '') + '.min.js',
            ]);
            lib_5.Helpers.logInfo(`minifying ${fileAbsPath} to ${lib_2.path.basename(uglifiedTempPath)}`);
            const command = `npm-run uglifyjs ${fileAbsPath} ${compress ? '--compress' : ''} ` +
                ` --output ${uglifiedTempPath} -b` +
                ` --mangle reserved=[${reservedNames.map(n => `'${n}'`).join(',')}]`;
            // + ` --mangle-props reserved=[${reservedNames.join(',')}]` // it breakes code
            this.project.run(command, { biggerBuffer: false }).sync();
            lib_5.Helpers.removeFileIfExists(fileAbsPath);
            lib_5.HelpersTaon.copyFile(uglifiedTempPath, fileAbsPath);
            lib_5.Helpers.removeFileIfExists(uglifiedTempPath);
        }
        lib_5.Helpers.taskDone(`Minifying done , strategy: ${strategy}`);
        //#endregion
    }
    //#endregion
    //#region private methods / compile/cliBuildObscure backend code
    backendObscureCode(options) {
        //#region @backendFunc
        const { strategy, releaseAbsPath, reservedNames } = options;
        const cliJsPath = (0, lib_2.crossPlatformPath)([releaseAbsPath, 'cli.js']);
        const files = strategy === 'cli-only'
            ? [cliJsPath]
            : [
                ...(strategy === 'lib-and-cli' ? [cliJsPath] : []),
                ...lib_5.Helpers.filesFrom([releaseAbsPath, 'lib'], true).filter(f => f.endsWith('.js')),
            ];
        for (const fileAbsPath of files) {
            const uglifiedTempPath = (0, lib_2.crossPlatformPath)([
                lib_2.path.dirname(fileAbsPath),
                lib_2.path.basename(fileAbsPath).replace('.js', '') + '.min.js',
            ]);
            const command = `npm-run javascript-obfuscator ${fileAbsPath} ` +
                ` --output ${uglifiedTempPath}` +
                ` --target node` +
                ` --string-array-rotate true` +
                // + ` --stringArray true`
                ` --string-array-encoding base64` +
                ` --reserved-names '${reservedNames.join(',')}'` +
                ` --reserved-strings '${reservedNames.join(',')}'`;
            this.project.run(command, { biggerBuffer: false }).sync();
            lib_5.Helpers.removeFileIfExists(fileAbsPath);
            lib_5.HelpersTaon.copyFile(uglifiedTempPath, fileAbsPath);
            lib_5.Helpers.removeFileIfExists(uglifiedTempPath);
        }
        //#endregion
    }
    //#endregion
    //#region getters & methods / remove (m)js.map files from release
    /**
     * because of that
     * In vscode there is a mess..
     * TODO
     */
    async backendRemoveJsMapsFrom(absPathReleaseDistFolder) {
        //#region @backendFunc
        lib_5.Helpers.getFilesFrom([absPathReleaseDistFolder, constants_1.libFromCompiledDist], {
            recursive: true,
        })
            .filter(f => f.endsWith('.js.map') || f.endsWith('.mjs.map'))
            .forEach(f => lib_5.Helpers.removeFileIfExists(f));
        lib_5.Helpers.removeFileIfExists([absPathReleaseDistFolder, constants_1.cliJSMapNpmPackage]);
        //#endregion
    }
    //#endregion
    //#region private methods / include remove dts
    /**
     * remove dts files from release
     */
    async backendReleaseRemoveDts(releaseFolderAbsPath) {
        //#region @backendFunc
        lib_5.Helpers.getFilesFrom([releaseFolderAbsPath, constants_1.libFromCompiledDist], {
            recursive: true,
        })
            .filter(f => f.endsWith('.d.ts'))
            .forEach(f => lib_5.Helpers.removeFileIfExists(f));
        lib_5.Helpers.removeFileIfExists([releaseFolderAbsPath, constants_1.cliDtsNpmPackage]);
        lib_5.Helpers.writeFile([releaseFolderAbsPath, `${constants_1.libFromSrc}/${constants_1.indexDtsNpmPackage}`], `export declare const dummy${new Date().getTime()};`);
        //#endregion
    }
    //#endregion
    //#region private methods / build info
    async creteBuildInfoFile(initOptions) {
        //#region @backendFunc
        initOptions = options_1.EnvOptions.from(initOptions);
        if (this.project.framework.isStandaloneProject) {
            const subProjects = [
                ...this.project.subProject.getAllByType(constants_1.TempalteSubprojectType.TAON_STRIPE_CLOUDFLARE_WORKER),
                ...this.project.subProject.getAllByType(constants_1.TempalteSubprojectType.TAON_YT_CLOUDFLARE_WORKER),
            ];
            const dest = this.project.pathFor([
                constants_1.srcMainProject,
                constants_1.libFromSrc,
                constants_1.TaonGeneratedFiles.build_info_generated_ts,
            ]);
            lib_5.Helpers.writeFile(dest, `${constants_1.THIS_IS_GENERATED_INFO_COMMENT}
/**
 *  Autogenerated by current cli tool
 */
export const BUILD_FRAMEWORK_CLI_NAME = '${lib_1.config.frameworkName}';
/**
 *  This value can be change in taon.jsonc (appId)
 */
export const APP_ID = '${initOptions.appId}';
/**
 *  Autogenerated by current cli tool
 */
export const BUILD_BASE_HREF = '${initOptions.build?.baseHref || ''}';
/**
 *  This value can be change in taon.jsonc (overrideNpmName)
 */
export const PROJECT_NPM_NAME = '${this.project.nameForNpmPackage}';
/**
 * Taon version from you project taon.json
 */
export const CURRENT_PACKAGE_TAON_VERSION = '${this.project.taonJson.frameworkVersion}';
/**
 *  Autogenerated by current cli tool. Use *${lib_1.config.frameworkName} release* to bump version.
 */
export const CURRENT_PACKAGE_VERSION = '${initOptions.release.releaseType &&
                initOptions.release.resolvedNewVersion
                ? initOptions.release.resolvedNewVersion
                : this.project.packageJson.version}';

${subProjects.length > 0 ? 'export namespace TAON_STRIPE_CLOUDFLARE_WORKERS_URLS {' : ''}
${subProjects
                .map(c => {
                return (`\texport const ${lib_3._.upperFirst(lib_3._.camelCase(c.name))} ` +
                    `= 'https://${c.name}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev';`);
            })
                .join('\n')}
${subProjects.length > 0 ? '}' : ''}

${constants_1.THIS_IS_GENERATED_INFO_COMMENT}
      `);
        }
        //#endregion
    }
    //#endregion
    //#region private methods / show message when build lib done for smart container
    showMesageWhenBuildLibDone(buildOptions) {
        //#region @backendFunc
        if (buildOptions.release.releaseType) {
            lib_5.Helpers.logInfo(`${buildOptions.build.prod ? '[PROD]' : '[DEV]'} Lib build part done...  `);
            return;
        }
        const buildLibDone = `LIB BUILD DONE.. `;
        const ifapp = 'if you want to start app build -> please run in other terminal command:';
        // const bawOrba = buildOptions.watch ? 'baw' : 'ba';
        const bawOrbaLong = buildOptions.build.watch
            ? ' build:app:watch '
            : ' build:app ';
        const bawOrbaLongWebsql = buildOptions.build.watch
            ? 'build:app:watch --websql'
            : 'build:app --websql';
        lib_5.Helpers.taskDone(`${lib_2.chalk.underline(`${buildLibDone}...`)}`);
        lib_5.Helpers.success(`

      ${ifapp}

      ${lib_2.chalk.bold(lib_1.config.frameworkName + bawOrbaLong)}
      or
      ${lib_1.config.frameworkName} ${bawOrbaLongWebsql}
      `);
        //#endregion
    }
    //#endregion
    //#region private methods / include node_modules in compilation
    async backendIncludeNodeModulesInCompilation(releaseAbsLocation, minify, prod) {
        //#region @backendFunc
        const destCliTSProd = (0, lib_2.crossPlatformPath)([releaseAbsLocation, constants_1.indexProdJs]);
        let destCli = (0, lib_2.crossPlatformPath)([releaseAbsLocation, constants_1.indexJSNpmPackage]);
        const destCliMin = (0, lib_2.crossPlatformPath)([releaseAbsLocation, constants_1.cliJSNpmPackage]);
        if (prod) {
            lib_5.Helpers.writeFile(destCliTSProd, `export * from './${constants_1.libFromCompiledDist}${constants_1.prodSuffix}';\n`);
            destCli = destCliTSProd;
        }
        await lib_5.HelpersTaon.bundleCodeIntoSingleFile(destCli, destCliMin, {
            minify,
            prod,
            additionalExternals: [
                ...this.project.taonJson.additionalExternalsFor(options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL),
            ],
            additionalReplaceWithNothing: [
                ...this.project.taonJson.additionalReplaceWithNothingFor(options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL),
            ],
        });
        // copy wasm file for dest
        const wasmfileSource = (0, lib_2.crossPlatformPath)([
            this.project.ins
                .by(lib_1.LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion)
                .pathFor([
                (0, app_utils_1.templateFolderForArtifact)(this.currentArtifactName),
                constants_1.srcNgProxyProject,
                constants_1.assetsFromNgProj,
                constants_1.CoreAssets.sqlWasmFile,
            ]),
        ]);
        const wasmfileDest = (0, lib_2.crossPlatformPath)([
            releaseAbsLocation,
            constants_1.CoreAssets.sqlWasmFile,
        ]);
        lib_5.HelpersTaon.copyFile(wasmfileSource, wasmfileDest);
        const destStartJS = (0, lib_2.crossPlatformPath)([
            releaseAbsLocation,
            `${constants_1.binMainProject}/start.js`,
        ]);
        lib_5.Helpers.writeFile(destStartJS, `console.log('<<< USING BUNDLED CLI >>>');\n` +
            `global.taonUsingBundledCliMode = true;\n` +
            `global.frameworkName = "${this.project.nameForCli}";` +
            `\n${lib_5.Helpers.readFile(destStartJS)}`);
        lib_5.Helpers.writeFile((0, lib_2.crossPlatformPath)([releaseAbsLocation, constants_1.BundledFiles.CLI_README_MD]), `# ${this.project.name} CLI\n\n
## Installation as global tool
\`\`\`bash
npm link
\`\`\`
    `);
        //#endregion
    }
}
exports.ArtifactNpmLibAndCliTool = ArtifactNpmLibAndCliTool;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/artifact-npm-lib-and-cli-tool.js.map