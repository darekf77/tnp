//#region imports
import { config, folderName, GlobalStorage, LibTypeEnum, taonActionFromParent, } from 'tnp-core/lib-prod';
import { chalk, crossPlatformPath, dateformat, fse, glob, path, rimraf } from 'tnp-core/lib-prod';
import { ___NS__camelCase, ___NS__isFunction, ___NS__isUndefined, ___NS__upperFirst } from 'tnp-core/lib-prod';
import { fileName } from 'tnp-core/lib-prod';
import { BasePackageJson, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__getFilesFrom, Helpers__NS__info, Helpers__NS__isExistedSymlink, Helpers__NS__isFolder, Helpers__NS__log, Helpers__NS__logInfo, Helpers__NS__readFile, Helpers__NS__remove, Helpers__NS__removeFileIfExists, Helpers__NS__run, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__setValueToJSON } from 'tnp-helpers/lib-prod';
import { angularProjProxyPath, getProxyNgProj, templateFolderForArtifact, } from '../../../../app-utils';
import { AngularJsonLibTaskNameResolveFor, appFromSrc, assetsFromNgProj, assetsFromSrc, binMainProject, browserFromCompiledDist, browserMainProject, BundledFiles, cliDtsNpmPackage, cliJSMapNpmPackage, cliJSNpmPackage, COMPILATION_COMPLETE_LIB_NG_BUILD, COMPILATION_COMPLETE_TSC, CoreAssets, CoreNgTemplateFiles, defaultConfiguration, distMainProject, dotFileTemplateExt, dotGitIgnoreMainProject, dotNpmIgnoreMainProject, dotNpmrcMainProject, indexDtsNpmPackage, indexJSNpmPackage, indexProdJs, libFromCompiledDist, libFromNpmPackage, libFromSrc, libs, localReleaseMainProject, MESSAGES, migrationsFromLib, nodeModulesMainProject, packageJsonNpmLib, prodSuffix, reExportJson, sourceLinkInNodeModules, splitNamespacesJson, srcMainProject, srcNgProxyProject, suffixLatest, TaonCommands, TaonGeneratedFiles, taonJsonMainProject, TempalteSubprojectType, testsFromSrc, THIS_IS_GENERATED_INFO_COMMENT, tmpBaseHrefOverwrite, tmpLocalCopytoProjDist, tmpSrcDist, tmpSrcDistWebsql, websqlFromCompiledDist, websqlMainProject, } from '../../../../constants';
import { EnvOptions, ReleaseArtifactTaon, ReleaseType, } from '../../../../options';
import { AssetsManager } from '../angular-node-app/tools/assets-manager';
import { BaseArtifact } from '../base-artifact';
import { AppRoutesAutogenProvider } from './tools/app-routes-autogen-provider';
import { IncrementalBuildProcess } from './tools/build-isomorphic-lib/compilations/incremental-build-process';
import { CopyManagerStandalone } from './tools/copy-manager/copy-manager-standalone';
import { FilesTemplatesBuilder } from './tools/files-recreation';
import { IndexAutogenProvider } from './tools/index-autogen-provider';
import { InsideStructuresLib } from './tools/inside-struct-lib';
import { CypressTestRunner } from './tools/test-runner/cypress-test-runner';
import { JestTestRunner } from './tools/test-runner/jest-test-runner';
import { MochaTestRunner } from './tools/test-runner/mocha-test-runner';
import { VitestTestRunner } from './tools/test-runner/vitest-test-runner';
//#endregion
export class ArtifactNpmLibAndCliTool extends BaseArtifact {
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
        super(project, ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL);
        this.testsMocha = new MochaTestRunner(project);
        this.testsJest = new JestTestRunner(project);
        this.testsVite = new VitestTestRunner(project);
        this.testsCypress = new CypressTestRunner(project);
        this.copyNpmDistLibManager = new CopyManagerStandalone(project);
        this.indexAutogenProvider = new IndexAutogenProvider(project);
        this.appTsRoutesAutogenProvider = new AppRoutesAutogenProvider(project);
        this.filesTemplatesBuilder = new FilesTemplatesBuilder(project);
        this.insideStructureLib = new InsideStructuresLib(project);
        this.assetsManager = new AssetsManager(project);
    }
    //#endregion
    //#endregion
    //#region init partial
    async initPartial(initOptions) {
        //#region @backendFunc
        Helpers__NS__taskStarted(`Initing project: ${chalk.bold(this.project.genericName)} ${initOptions.init.struct ? '(without packages install)' : ''} `);
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
        Helpers__NS__log(`Init DONE for project: ${chalk.bold(this.project.genericName)} `);
        this.project.quickFixes.makeSureDistFolderExists();
        // Helpers__NS__info(`[buildLib] start of building ${websql ? '[WEBSQL]' : ''}`);
        this.copyEssentialFilesTo([
            crossPlatformPath([this.project.pathFor(distMainProject)]),
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
            Helpers__NS__warn(`Project is not standalone. Skipping npm-lib-and-cli-tool build.`);
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
            tmpLocalCopytoProjDist,
            nodeModulesMainProject,
            packageName,
        ]);
        if (shouldSkipBuild) {
            Helpers__NS__warn(`

        Skipping build of npm-lib-and-cli-tool artifact...

        `);
            return {
                tmpProjNpmLibraryInNodeModulesAbsPath,
                isOrganizationPackage,
                packageName,
            };
        }
        //#endregion
        Helpers__NS__logInfo(`Start of (${buildOptions.build.watch ? 'watch' : 'normal'}) lib building...`);
        //#region init incremental process
        const incrementalBuildProcess = new IncrementalBuildProcess(this.project, buildOptions);
        //#endregion
        //#region init proxy projects
        const proxyProject = getProxyNgProj(this.project, buildOptions.clone({
            build: {
                websql: false,
            },
        }), ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL);
        const proxyProjectWebsql = getProxyNgProj(this.project, buildOptions.clone({
            build: {
                websql: true,
            },
        }), ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL);
        Helpers__NS__log(`

    proxy Proj = ${proxyProject?.location}
    proxy Proj websql = ${proxyProjectWebsql?.location}

    `);
        //#endregion
        //#region prepare commands + base href
        // const command = `${loadNvm} && ${this.npmRunNg} build ${this.name} ${watch ? '--watch' : ''}`;
        const commandForLibraryBuild = isDevelopmentBuildUseTscInsteadNgBuild
            ? `${TaonCommands.NPM_RUN_TSC} -p tsconfig.typecheck.json --watch --preserveWatchOutput `
            : `${TaonCommands.NPM_RUN_NG} build ${this.project.name} ${buildOptions.build.watch ? '--watch' : ''}`;
        //#region show angular info function
        const showInfoAngular = () => {
            Helpers__NS__info(`Starting browser Angular/TypeScirpt build.... ${buildOptions.build.websql ? '[WEBSQL]' : ''}`);
            Helpers__NS__log(`

      ANGULAR ${this.project.framework.coreContainer?.packageJson.version} ${buildOptions.build.watch ? 'WATCH ' : ''} LIB BUILD STARTED... ${buildOptions.build.websql ? '[WEBSQL]' : ''}

      `);
            Helpers__NS__log(` command for ng build: ${commandForLibraryBuild}`);
        };
        //#endregion
        //#region resolve & save base href
        buildOptions.build.baseHref = !___NS__isUndefined(buildOptions.build.baseHref)
            ? buildOptions.build.baseHref
            : this.artifacts.angularNodeApp.angularFeBasenameManager.rootBaseHref;
        this.project.writeFile(tmpBaseHrefOverwrite, buildOptions.build.baseHref);
        //#endregion
        Helpers__NS__logInfo(`

    ${buildOptions.build.prod
            ? '[PROD]'
            : `[DEV${opt?.normalBuildBeforeProd ? '-BEFORE-PROD' : ''}]`} Building lib for base href: ${!___NS__isUndefined(buildOptions.build.baseHref)
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
            ? COMPILATION_COMPLETE_TSC
            : COMPILATION_COMPLETE_LIB_NG_BUILD;
        const runNgBuild = async () => {
            await proxyProject.execute(commandForLibraryBuild, {
                similarProcessKey: TaonCommands.NG,
                resolvePromiseMsg: {
                    stdout: buildOptions.build.watch ? watchResolveString : undefined,
                },
                rebuildOnChange: buildOptions.build.watch
                    ? this.project.tmpSourceRebuildForBrowserObs
                    : void 0,
                ...outputOptions,
            });
            await proxyProjectWebsql.execute(commandForLibraryBuild, {
                similarProcessKey: TaonCommands.NG,
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
        const tmpLibForDistNormalRelativePath = angularProjProxyPath({
            project: this.project,
            targetArtifact: buildOptions.release.targetArtifact,
            envOptions: buildOptions.clone({
                build: { websql: false },
            }),
        });
        const tmpLibForDistWebsqlRelativePath = angularProjProxyPath({
            project: this.project,
            targetArtifact: buildOptions.release.targetArtifact,
            envOptions: buildOptions.clone({
                build: { websql: true },
            }),
        });
        this.project.setValueToJSONC([tmpLibForDistNormalRelativePath, CoreNgTemplateFiles.ANGULAR_JSON], `projects["${this.project.name}"].architect.build.${defaultConfiguration}`, AngularJsonLibTaskNameResolveFor(buildOptions));
        this.project.setValueToJSONC([tmpLibForDistWebsqlRelativePath, CoreNgTemplateFiles.ANGULAR_JSON], `projects["${this.project.name}"].architect.build.${defaultConfiguration}`, AngularJsonLibTaskNameResolveFor(buildOptions));
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
                Helpers__NS__throwError(`
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
            if (___NS__isFunction(buildOptions.copyToManager.beforeCopyHook)) {
                await buildOptions.copyToManager.beforeCopyHook();
            }
            if (buildOptions.build.prod) {
                //#region copy browser, websql prod to normal dist
                //#region copy browser, websql prod to normal dist / lib
                HelpersTaon__NS__copy(this.project.pathFor([
                    distMainProject + prodSuffix,
                    libFromCompiledDist,
                ]), this.project.pathFor([
                    distMainProject,
                    libFromCompiledDist + prodSuffix,
                ]), {
                    recursive: true,
                    overwrite: true,
                });
                HelpersTaon__NS__copyFile(this.project.pathFor([
                    distMainProject + prodSuffix,
                    libFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
                ]), this.project.pathFor([
                    distMainProject,
                    libFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
                ]));
                HelpersTaon__NS__copyFile(this.project.pathFor([
                    distMainProject + prodSuffix,
                    libFromCompiledDist + prodSuffix + `.${reExportJson}`,
                ]), this.project.pathFor([
                    distMainProject,
                    libFromCompiledDist + prodSuffix + `.${reExportJson}`,
                ]));
                //#endregion
                //#region copy browser, websql prod to normal dist / browser
                HelpersTaon__NS__copyFile(this.project.pathFor([
                    distMainProject + prodSuffix,
                    browserFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
                ]), this.project.pathFor([
                    distMainProject,
                    browserFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
                ]));
                HelpersTaon__NS__copyFile(this.project.pathFor([
                    distMainProject + prodSuffix,
                    browserFromCompiledDist + prodSuffix + `.${reExportJson}`,
                ]), this.project.pathFor([
                    distMainProject,
                    browserFromCompiledDist + prodSuffix + `.${reExportJson}`,
                ]));
                HelpersTaon__NS__copy(this.project.pathFor([
                    distMainProject + prodSuffix,
                    browserMainProject,
                ]), this.project.pathFor([
                    distMainProject,
                    browserMainProject + prodSuffix,
                ]), { recursive: true, overwrite: true });
                //#endregion
                //#region copy browser, websql prod to normal dist / websql
                HelpersTaon__NS__copyFile(this.project.pathFor([
                    distMainProject + prodSuffix,
                    websqlFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
                ]), this.project.pathFor([
                    distMainProject,
                    websqlFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
                ]));
                HelpersTaon__NS__copyFile(this.project.pathFor([
                    distMainProject + prodSuffix,
                    websqlFromCompiledDist + prodSuffix + `.${reExportJson}`,
                ]), this.project.pathFor([
                    distMainProject,
                    websqlFromCompiledDist + prodSuffix + `.${reExportJson}`,
                ]));
                HelpersTaon__NS__copy(this.project.pathFor([
                    distMainProject + prodSuffix,
                    websqlMainProject,
                ]), this.project.pathFor([
                    distMainProject,
                    websqlMainProject + prodSuffix,
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
        Helpers__NS__info(buildOptions.build.watch
            ? `
     [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
     Files watcher started.. ${buildOptions.build.websql ? '[WEBSQL]' : ''}
   `
            : `
     [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
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
        releaseOptions = this.updateResolvedVersion(releaseOptions);
        const { tmpProjNpmLibraryInNodeModulesAbsPath } = await this.buildPartial(releaseOptions.clone({
            build: {
                prod: releaseOptions.release.targetArtifact ===
                    ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
                watch: false,
            },
        }));
        let releaseProjPath = tmpProjNpmLibraryInNodeModulesAbsPath;
        //#endregion
        if (releaseOptions.release.releaseType !== ReleaseType.LOCAL) {
            this.removeNotNpmRelatedFilesFromReleaseBundle(releaseProjPath);
        }
        this.copyEssentialFilesTo([tmpProjNpmLibraryInNodeModulesAbsPath]);
        this.packResource(tmpProjNpmLibraryInNodeModulesAbsPath);
        this.fixPackageJsonForRelease(tmpProjNpmLibraryInNodeModulesAbsPath, releaseOptions.release.resolvedNewVersion);
        this.preparePackageJsonForReleasePublish(tmpProjNpmLibraryInNodeModulesAbsPath);
        await this.runAfterReleaseJsCodeActions(tmpProjNpmLibraryInNodeModulesAbsPath, releaseOptions);
        const projFromCompiled = this.project.ins.From(tmpProjNpmLibraryInNodeModulesAbsPath);
        const allowedToNpmReleases = [
            ReleaseType.MANUAL,
            ReleaseType.CLOUD,
        ];
        // console.log(`
        //   doNotIncludeLibFiles: ${releaseOptions.release.lib.doNotIncludeLibFiles}
        //   `);
        const clearLibFiles = (folderAbsPath) => {
            Helpers__NS__remove([folderAbsPath, libFromSrc]);
            Helpers__NS__remove([folderAbsPath, libFromSrc + prodSuffix]);
            Helpers__NS__remove([folderAbsPath, sourceLinkInNodeModules]);
            Helpers__NS__remove([folderAbsPath, assetsFromSrc]);
            Helpers__NS__remove([folderAbsPath, browserMainProject]);
            Helpers__NS__remove([folderAbsPath, browserMainProject + prodSuffix]);
            Helpers__NS__remove([folderAbsPath, folderName.client]); // TODO REMOVE
            Helpers__NS__remove([folderAbsPath, websqlMainProject]);
            Helpers__NS__remove([folderAbsPath, websqlMainProject + prodSuffix]);
            Helpers__NS__remove([folderAbsPath, migrationsFromLib]);
            Helpers__NS__remove([folderAbsPath, srcMainProject]);
            Helpers__NS__remove([folderAbsPath, 'src.*']);
            Helpers__NS__remove([folderAbsPath, 'index.*']);
            Helpers__NS__remove([folderAbsPath, cliDtsNpmPackage]);
            Helpers__NS__remove([folderAbsPath, cliJSMapNpmPackage]);
            HelpersTaon__NS__setValueToJSON([folderAbsPath, packageJsonNpmLib], 'scripts', {});
        };
        if (releaseOptions.release.lib.doNotIncludeLibFiles &&
            releaseOptions.release.releaseType !== ReleaseType.LOCAL) {
            clearLibFiles(releaseProjPath);
        }
        //#region remove lagacy file from final bundle
        Helpers__NS__remove([
            tmpProjNpmLibraryInNodeModulesAbsPath,
            fileName.package_json__devDependencies_json,
        ]);
        Helpers__NS__remove([
            tmpProjNpmLibraryInNodeModulesAbsPath,
            fileName.package_json__tnp_json5,
        ]);
        Helpers__NS__remove([
            tmpProjNpmLibraryInNodeModulesAbsPath,
            fileName.package_json__tnp_json,
        ]);
        Helpers__NS__remove([
            tmpProjNpmLibraryInNodeModulesAbsPath,
            fileName.tnpEnvironment_json,
        ]);
        Helpers__NS__remove([
            tmpProjNpmLibraryInNodeModulesAbsPath,
            taonJsonMainProject,
        ]);
        Helpers__NS__remove([tmpProjNpmLibraryInNodeModulesAbsPath, migrationsFromLib]);
        Helpers__NS__remove([tmpProjNpmLibraryInNodeModulesAbsPath, 'firedev.jsonc']);
        Helpers__NS__remove([tmpProjNpmLibraryInNodeModulesAbsPath, 'client']);
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
            if (releaseOptions.release.releaseType === ReleaseType.LOCAL) {
                //#region local release
                const releaseDest = this.project.pathFor([
                    localReleaseMainProject,
                    this.currentArtifactName,
                    `${this.project.name}${suffixLatest}`,
                ]);
                Helpers__NS__remove(releaseDest, true);
                HelpersTaon__NS__copy(releaseProjPath, releaseDest);
                Helpers__NS__taskStarted(`Installing dependencies for local release...`);
                Helpers__NS__run(`npm install`, { cwd: releaseProjPath }).sync();
                Helpers__NS__taskDone(`Dependencies installed for local release.`);
                releaseProjPath = releaseDest;
                if (releaseOptions.release.lib.doNotIncludeLibFiles) {
                    clearLibFiles(releaseProjPath);
                }
                this.removeNotNpmRelatedFilesFromReleaseBundle(releaseProjPath);
                if (releaseOptions.release.installLocally) {
                    // console.log('SHOULD INSTALL LOCALLY');
                    Helpers__NS__taskStarted('Linking local package globally...');
                    Helpers__NS__run(`npm link`, { cwd: releaseProjPath }).sync();
                    Helpers__NS__taskDone(`Done linking local package globally.

            Now you can use it globally via CLI:
            ${this.project.nameForCli} <command>

            `);
                }
                Helpers__NS__info(`Local release done: ${releaseDest}`);
                //#endregion
            }
        }
        return {
            resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
            releaseProjPath,
            releaseType,
            projectsReposToPushAndTag: [this.project.location],
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
                rimraf.sync(this.project.pathFor(distMainProject) + '*');
                rimraf.sync(this.project.pathFor(folderName.tmp) + '*');
                return;
            }
            catch (error) {
                HelpersTaon__NS__pressKeyAndContinue(MESSAGES.SHUT_DOWN_FOLDERS_AND_DEBUGGERS);
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
        Helpers__NS__taskStarted(`Cleaning project: ${this.project.genericName}`);
        if (this.project.typeIs(LibTypeEnum.UNKNOWN) ||
            this.project.typeIs(LibTypeEnum.UNKNOWN_NPM_PROJECT)) {
            return;
        }
        while (true) {
            try {
                rimraf.sync(crossPlatformPath([this.project.location, folderName.tmp + '*']));
                rimraf.sync(crossPlatformPath([this.project.location, folderName.dist + '*']));
                try {
                    this.project.removeFile(nodeModulesMainProject);
                }
                catch (error) {
                    this.project.remove(nodeModulesMainProject);
                }
                this.project.removeFile(browserMainProject);
                this.project.removeFile(websqlMainProject);
                this.project.removeFile(browserMainProject + prodSuffix);
                this.project.removeFile(websqlMainProject + prodSuffix);
                this.project.removeFile(fileName.tnpEnvironment_json);
                if (this.project.framework.isCoreProject) {
                    return;
                }
                glob
                    .sync(`${this.project.location}/*${dotFileTemplateExt}`)
                    .forEach(fileTemplate => {
                    Helpers__NS__remove(fileTemplate);
                    Helpers__NS__remove(fileTemplate.replace(dotFileTemplateExt, ''));
                });
                this.project.removeFile(fileName.tnpEnvironment_json);
                break;
            }
            catch (error) {
                HelpersTaon__NS__pressKeyAndContinue(MESSAGES.SHUT_DOWN_FOLDERS_AND_DEBUGGERS);
            }
        }
        this.project.quickFixes.addMissingSrcFolderToEachProject();
        Helpers__NS__info(`Cleaning project: ${this.project.genericName} done`);
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
        if (config.frameworkName === 'tnp') {
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
        //   !Helpers__NS__isSymlinkFileExitedOrUnexisted(this.project.nodeModules.path)
        // ) {
        //   Helpers__NS__taskStarted('Checking if node_modules folder is correct...');
        //   const minDepsLength = Object.keys(
        //     this.project.npmHelpers.packageJson.allDependencies,
        //   ).length;
        //   const notFullyInstalled =
        //     Helpers.findChildren(this.project.nodeModules.path, c => c).length <
        //     minDepsLength + 1;
        //   if (notFullyInstalled) {
        //     try {
        //       Helpers__NS__info(`Removing incorrect node_modules folder...`);
        //       Helpers__NS__removeSymlinks(this.project.nodeModules.path);
        //       Helpers__NS__remove(this.project.nodeModules.path, true);
        //     } catch (error) {}
        //   }
        //   Helpers__NS__taskDone('Checking if node_modules folder is correct DONE...');
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
            browserMainProject,
            websqlMainProject,
            browserMainProject + prodSuffix,
            websqlMainProject + prodSuffix,
        ];
        for (const folder of folderToFix) {
            const folderAbsPath = crossPlatformPath([releaseProjPath, folder]);
            Helpers__NS__remove([folderAbsPath, dotNpmIgnoreMainProject]);
            // const rootPackageNameForChildBrowser = crossPlatformPath([
            //   this.project.nameForNpmPackage,
            //   folder,
            // ]);
            // const childName = ___NS__kebabCase(this.project.nameForNpmPackage);
            // const browserOrWebsql = ___NS__last(rootPackageNameForChildBrowser.split('/'));
            HelpersTaon__NS__setValueToJSON([folderAbsPath, packageJsonNpmLib], 'sideEffects', this.project.packageJson.sideEffects);
            HelpersTaon__NS__setValueToJSON([folderAbsPath, packageJsonNpmLib], 'version', newVersion);
        }
        const prodbrowsefoldersToFix = [
            browserMainProject + prodSuffix,
            websqlMainProject + prodSuffix,
        ];
        for (const folder of prodbrowsefoldersToFix) {
            const folderAbsPath = crossPlatformPath([releaseProjPath, folder]);
            HelpersTaon__NS__setValueToJSON([folderAbsPath, packageJsonNpmLib], 'name', crossPlatformPath([this.project.nameForNpmPackage, folder]));
        }
        const folderToFixBackend = [
            libFromNpmPackage,
            libFromNpmPackage + prodSuffix,
        ];
        for (const folder of folderToFixBackend) {
            const folderAbsPath = crossPlatformPath([releaseProjPath, folder]);
            Helpers__NS__remove([folderAbsPath, dotNpmIgnoreMainProject]);
            const packageName = crossPlatformPath([
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
            Helpers__NS__writeJson([folderAbsPath, packageJsonNpmLib], pjBackendLib);
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
        const pathInRelease = crossPlatformPath([relaseAbsPath, packageJsonNpmLib]);
        HelpersTaon__NS__copyFile(this.project.packageJson.path, pathInRelease);
        const pj = new BasePackageJson({
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
                url: HelpersTaon__NS__git__NS__originSshToHttp(this.project.git.originURL),
            });
        }
        //#endregion
    }
    //#endregion
    //#region private methods / remove not npm releated files from release bundle
    removeNotNpmRelatedFilesFromReleaseBundle(releaseAbsPath) {
        //#region @backendFunc
        Helpers__NS__remove(`${releaseAbsPath}/${appFromSrc}*`); // QUICK_FIX
        Helpers__NS__remove(`${releaseAbsPath}/${testsFromSrc}*`); // QUICK_FIX
        Helpers__NS__remove(`${releaseAbsPath}/${srcMainProject}`, true); // QUICK_FIX
        // Helpers__NS__removeFileIfExists(`${relaseAbsPath}/source`);
        // regenerate src.d.ts
        Helpers__NS__writeFile(crossPlatformPath([releaseAbsPath, 'src.d.ts']), `
${THIS_IS_GENERATED_INFO_COMMENT}
export * from './${libFromSrc}';
${THIS_IS_GENERATED_INFO_COMMENT}
// please use command: taon build:watch to see here links for your globally builded lib code files
${THIS_IS_GENERATED_INFO_COMMENT}
    `.trimStart());
        //#endregion
    }
    //#endregion
    //#region private methods / fix terminal output paths
    async outputFixNgLibBuild(buildOptions) {
        const taonActionFromParentName = GlobalStorage.get(taonActionFromParent);
        return {
            // askToTryAgainOnError: true,
            exitOnErrorCallback: async (code) => {
                if (buildOptions.release.releaseType) {
                    throw 'Typescript compilation lib error';
                }
                else {
                    Helpers__NS__error(`[${config.frameworkName}] Typescript compilation lib error (code=${code})`, false, true);
                }
            },
            outputLineReplace: (line) => {
                // line = UtilsString.removeChalkSpecialChars(line);
                if (line.startsWith('WARNING: postcss-url')) {
                    return ' --- [taon] IGNORED WARN ---- ';
                }
                line = line.replace(`projects/${this.project.name}/${srcMainProject}/`, `./${srcMainProject}/`);
                if (line.includes(`../../${nodeModulesMainProject}/`)) {
                    line = line.replace(`../../${nodeModulesMainProject}/`, `./${nodeModulesMainProject}/`);
                }
                // ../../../../tmpSrcDistWebsql/lib/layout-proj-ng-related/layout-proj-ng-related.component.scss
                if (line.includes(`../../../../${tmpSrcDistWebsql + prodSuffix}/`)) {
                    line = line.replace(`../../../../${tmpSrcDistWebsql + prodSuffix}/`, `./${srcMainProject}/`);
                }
                if (line.includes(`../../../../${tmpSrcDistWebsql}/`)) {
                    line = line.replace(`../../../../${tmpSrcDistWebsql}/`, `./${srcMainProject}/`);
                }
                if (line.includes(`../../../../${tmpSrcDist + prodSuffix}/`)) {
                    line = line.replace(`../../../../${tmpSrcDist + prodSuffix}/`, `./${srcMainProject}/`);
                }
                if (line.includes(`../../../../${tmpSrcDist}/`)) {
                    line = line.replace(`../../../../${tmpSrcDist}/`, `./${srcMainProject}/`);
                }
                if (line.search(`/${srcMainProject}/${libs}/`) !== -1) {
                    const [__, ___, ____, moduleName] = line.split('/');
                    // console.log({
                    //   moduleName,
                    //   standalone: 'inlib'
                    // })
                    return line.replace(`/${srcMainProject}/${libs}/${moduleName}/`, `/${moduleName}/${srcMainProject}/${libFromSrc}/`);
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
        if (!fse.existsSync(releaseDistFolder)) {
            fse.mkdirSync(releaseDistFolder);
        }
        [...this.project.taonJson.resources].forEach(res => {
            //  copy resource to org build and copy shared assets
            const file = path.join(this.project.location, res);
            const dest = path.join(releaseDistFolder, res);
            if (!fse.existsSync(file)) {
                throw new Error(`[${config.frameworkName}][lib-project] Resource file: ${chalk.bold(path.basename(file))} does not ` +
                    `exist in "${this.project.genericName}"  (package.json > resources[])
        `);
            }
            if (fse.lstatSync(file).isDirectory()) {
                // console.log('IS DIRECTORY', file)
                // console.log('IS DIRECTORY DEST', dest)
                const filter = src => {
                    return !/.*node_modules.*/g.test(src);
                };
                HelpersTaon__NS__copy(file, dest, { filter });
            }
            else {
                // console.log('IS FILE', file)
                fse.copyFileSync(file, dest);
            }
        });
        Helpers__NS__logInfo(`Resources copied to release folder: ${distMainProject}`);
        //#endregion
    }
    //#endregion
    //#region private methods / copy essential files
    copyEssentialFilesTo(toDestinations) {
        //#region @backendFunc
        this.copyWhenExist(binMainProject, toDestinations);
        this.copyWhenExist(dotNpmrcMainProject, toDestinations);
        this.copyWhenExist(dotNpmIgnoreMainProject, toDestinations);
        this.copyWhenExist(dotGitIgnoreMainProject, toDestinations);
        //#endregion
    }
    //#endregion
    //#region private methods / copy when exists
    copyWhenExist(relativePath, destinations) {
        //#region @backendFunc
        const absPath = crossPlatformPath([this.project.location, relativePath]);
        for (let index = 0; index < destinations.length; index++) {
            const dest = crossPlatformPath([destinations[index], relativePath]);
            if (Helpers__NS__exists(absPath)) {
                if (Helpers__NS__isFolder(absPath)) {
                    Helpers__NS__remove(dest, true);
                    HelpersTaon__NS__copy(absPath, dest, { recursive: true });
                }
                else {
                    HelpersTaon__NS__copyFile(absPath, dest);
                }
            }
            else {
                Helpers__NS__log(`[isomorphic-lib][copyWhenExist] not exists: ${absPath}`);
            }
        }
        //#endregion
    }
    //#endregion
    //#region private methods / link when exists
    linkWhenExist(relativePath, destinations) {
        //#region @backendFunc
        let absPath = path.join(this.project.location, relativePath);
        if (Helpers__NS__exists(absPath) && Helpers__NS__isExistedSymlink(absPath)) {
            absPath = HelpersTaon__NS__pathFromLink(absPath);
        }
        for (let index = 0; index < destinations.length; index++) {
            const dest = crossPlatformPath([destinations[index], relativePath]);
            if (Helpers__NS__exists(absPath)) {
                Helpers__NS__remove(dest, true);
                Helpers__NS__createSymLink(absPath, dest);
            }
        }
        //#endregion
    }
    //#endregion
    //#region private methods / compile/cliBuildUglify backend code
    backendMinifyCode(options) {
        //#region @backendFunc
        const { strategy, releaseAbsPath, reservedNames, compress } = options;
        Helpers__NS__taskStarted(`Minifying started , strategy: ${strategy}`);
        const cliJsPath = crossPlatformPath([releaseAbsPath, 'cli.js']);
        const files = strategy === 'cli-only'
            ? [cliJsPath]
            : [
                ...(strategy === 'lib-and-cli' ? [cliJsPath] : []),
                ...Helpers__NS__filesFrom([releaseAbsPath, 'lib'], true).filter(f => f.endsWith('.js')),
            ];
        for (const fileAbsPath of files) {
            const uglifiedTempPath = crossPlatformPath([
                path.dirname(fileAbsPath),
                path.basename(fileAbsPath).replace('.js', '') + '.min.js',
            ]);
            Helpers__NS__logInfo(`minifying ${fileAbsPath} to ${path.basename(uglifiedTempPath)}`);
            const command = `npm-run uglifyjs ${fileAbsPath} ${compress ? '--compress' : ''} ` +
                ` --output ${uglifiedTempPath} -b` +
                ` --mangle reserved=[${reservedNames.map(n => `'${n}'`).join(',')}]`;
            // + ` --mangle-props reserved=[${reservedNames.join(',')}]` // it breakes code
            this.project.run(command, { biggerBuffer: false }).sync();
            Helpers__NS__removeFileIfExists(fileAbsPath);
            HelpersTaon__NS__copyFile(uglifiedTempPath, fileAbsPath);
            Helpers__NS__removeFileIfExists(uglifiedTempPath);
        }
        Helpers__NS__taskDone(`Minifying done , strategy: ${strategy}`);
        //#endregion
    }
    //#endregion
    //#region private methods / compile/cliBuildObscure backend code
    backendObscureCode(options) {
        //#region @backendFunc
        const { strategy, releaseAbsPath, reservedNames } = options;
        const cliJsPath = crossPlatformPath([releaseAbsPath, 'cli.js']);
        const files = strategy === 'cli-only'
            ? [cliJsPath]
            : [
                ...(strategy === 'lib-and-cli' ? [cliJsPath] : []),
                ...Helpers__NS__filesFrom([releaseAbsPath, 'lib'], true).filter(f => f.endsWith('.js')),
            ];
        for (const fileAbsPath of files) {
            const uglifiedTempPath = crossPlatformPath([
                path.dirname(fileAbsPath),
                path.basename(fileAbsPath).replace('.js', '') + '.min.js',
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
            Helpers__NS__removeFileIfExists(fileAbsPath);
            HelpersTaon__NS__copyFile(uglifiedTempPath, fileAbsPath);
            Helpers__NS__removeFileIfExists(uglifiedTempPath);
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
        Helpers__NS__getFilesFrom([absPathReleaseDistFolder, libFromCompiledDist], {
            recursive: true,
        })
            .filter(f => f.endsWith('.js.map') || f.endsWith('.mjs.map'))
            .forEach(f => Helpers__NS__removeFileIfExists(f));
        Helpers__NS__removeFileIfExists([absPathReleaseDistFolder, cliJSMapNpmPackage]);
        //#endregion
    }
    //#endregion
    //#region private methods / include remove dts
    /**
     * remove dts files from release
     */
    async backendReleaseRemoveDts(releaseFolderAbsPath) {
        //#region @backendFunc
        Helpers__NS__getFilesFrom([releaseFolderAbsPath, libFromCompiledDist], {
            recursive: true,
        })
            .filter(f => f.endsWith('.d.ts'))
            .forEach(f => Helpers__NS__removeFileIfExists(f));
        Helpers__NS__removeFileIfExists([releaseFolderAbsPath, cliDtsNpmPackage]);
        Helpers__NS__writeFile([releaseFolderAbsPath, `${libFromSrc}/${indexDtsNpmPackage}`], `export declare const dummy${new Date().getTime()};`);
        //#endregion
    }
    //#endregion
    //#region private methods / build info
    async creteBuildInfoFile(initOptions) {
        //#region @backendFunc
        initOptions = EnvOptions.from(initOptions);
        if (this.project.framework.isStandaloneProject) {
            const subProjects = [
                ...this.project.subProject.getAllByType(TempalteSubprojectType.TAON_STRIPE_CLOUDFLARE_WORKER),
                ...this.project.subProject.getAllByType(TempalteSubprojectType.TAON_YT_CLOUDFLARE_WORKER),
            ];
            const dest = this.project.pathFor([
                srcMainProject,
                libFromSrc,
                TaonGeneratedFiles.build_info_generated_ts,
            ]);
            Helpers__NS__writeFile(dest, `${THIS_IS_GENERATED_INFO_COMMENT}
/**
 *  Autogenerated by current cli tool
 */
export const BUILD_FRAMEWORK_CLI_NAME = '${config.frameworkName}';
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
 *  Autogenerated by current cli tool. Use *${config.frameworkName} release* to bump version.
 */
export const CURRENT_PACKAGE_VERSION = '${initOptions.release.releaseType &&
                initOptions.release.resolvedNewVersion
                ? initOptions.release.resolvedNewVersion
                : this.project.packageJson.version}';

${subProjects.length > 0 ? 'export namespace TAON_STRIPE_CLOUDFLARE_WORKERS_URLS {' : ''}
${subProjects
                .map(c => {
                return (`\texport const ${___NS__upperFirst(___NS__camelCase(c.name))} ` +
                    `= 'https://${c.name}.${this.project.taonJson.cloudFlareAccountSubdomain}.workers.dev';`);
            })
                .join('\n')}
${subProjects.length > 0 ? '}' : ''}

${THIS_IS_GENERATED_INFO_COMMENT}
      `);
        }
        //#endregion
    }
    //#endregion
    //#region private methods / show message when build lib done for smart container
    showMesageWhenBuildLibDone(buildOptions) {
        //#region @backendFunc
        if (buildOptions.release.releaseType) {
            Helpers__NS__logInfo(`${buildOptions.build.prod ? '[PROD]' : '[DEV]'} Lib build part done...  `);
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
        Helpers__NS__taskDone(`${chalk.underline(`${buildLibDone}...`)}`);
        Helpers__NS__success(`

      ${ifapp}

      ${chalk.bold(config.frameworkName + bawOrbaLong)}
      or
      ${config.frameworkName} ${bawOrbaLongWebsql}
      `);
        //#endregion
    }
    //#endregion
    //#region private methods / include node_modules in compilation
    async backendIncludeNodeModulesInCompilation(releaseAbsLocation, minify, prod) {
        //#region @backendFunc
        const destCliTSProd = crossPlatformPath([releaseAbsLocation, indexProdJs]);
        let destCli = crossPlatformPath([releaseAbsLocation, indexJSNpmPackage]);
        const destCliMin = crossPlatformPath([releaseAbsLocation, cliJSNpmPackage]);
        if (prod) {
            Helpers__NS__writeFile(destCliTSProd, `export * from './${libFromCompiledDist}${prodSuffix}';\n`);
            destCli = destCliTSProd;
        }
        await HelpersTaon__NS__bundleCodeIntoSingleFile(destCli, destCliMin, {
            minify,
            prod,
            additionalExternals: [
                ...this.project.taonJson.additionalExternalsFor(ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL),
            ],
            additionalReplaceWithNothing: [
                ...this.project.taonJson.additionalReplaceWithNothingFor(ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL),
            ],
        });
        // copy wasm file for dest
        const wasmfileSource = crossPlatformPath([
            this.project.ins
                .by(LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion)
                .pathFor([
                templateFolderForArtifact(this.currentArtifactName),
                srcNgProxyProject,
                assetsFromNgProj,
                CoreAssets.sqlWasmFile,
            ]),
        ]);
        const wasmfileDest = crossPlatformPath([
            releaseAbsLocation,
            CoreAssets.sqlWasmFile,
        ]);
        HelpersTaon__NS__copyFile(wasmfileSource, wasmfileDest);
        const destStartJS = crossPlatformPath([
            releaseAbsLocation,
            `${binMainProject}/start.js`,
        ]);
        Helpers__NS__writeFile(destStartJS, `console.log('<<< USING BUNDLED CLI >>>');\n` +
            `global.taonUsingBundledCliMode = true;\n` +
            `global.frameworkName = "${this.project.nameForCli}";` +
            `\n${Helpers__NS__readFile(destStartJS)}`);
        Helpers__NS__writeFile(crossPlatformPath([releaseAbsLocation, BundledFiles.CLI_README_MD]), `# ${this.project.name} CLI\n\n
## Installation as global tool
\`\`\`bash
npm link
\`\`\`
    `);
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/artifact-npm-lib-and-cli-tool.js.map