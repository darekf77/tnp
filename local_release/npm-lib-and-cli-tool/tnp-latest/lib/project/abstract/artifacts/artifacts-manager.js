"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactManager = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-core/lib");
const lib_6 = require("tnp-helpers/lib");
const build_info__auto_generated_1 = require("../../../build-info._auto-generated_");
const constants_1 = require("../../../constants");
const options_1 = require("../../../options");
const templates_1 = require("../../../templates");
const artifacts_helpers_1 = require("./__helpers__/artifacts-helpers");
//#endregion
/**
 * Artifact manager
 * Responsible for group actions on
 * current project or/and children projects
 */
class ArtifactManager {
    artifact;
    project;
    globalHelper;
    filesRecreator;
    static for(project) {
        //#region @backendFunc
        const artifactProcess = {
            angularNodeApp: new (require('./angular-node-app').ArtifactAngularNodeApp)(project),
            npmLibAndCliTool: new (require('./npm-lib-and-cli-tool').ArtifactNpmLibAndCliTool)(project),
            electronApp: new (require('./electron-app').ArtifactElectronApp)(project),
            mobileApp: new (require('./mobile-app').ArtifactMobileApp)(project),
            docsWebapp: new (require('./docs-webapp').ArtifactDocsWebapp)(project),
            vscodePlugin: new (require('./vscode-plugin').ArtifactVscodePlugin)(project),
        };
        const globalHelper = new artifacts_helpers_1.ArtifactsGlobalHelper(project);
        const manager = new ArtifactManager(artifactProcess, project, globalHelper);
        for (const key of Object.keys(artifactProcess)) {
            const instance = artifactProcess[lib_2._.camelCase(key)];
            // @ts-expect-error
            instance.artifacts = artifactProcess;
            // @ts-expect-error
            instance.globalHelper = globalHelper;
        }
        return manager;
        //#endregion
    }
    //#region constructor
    constructor(
    /**
     * @deprecated
     * this will be protected in future
     */
    artifact, project, globalHelper) {
        this.artifact = artifact;
        this.project = project;
        this.globalHelper = globalHelper;
        //#region @backend
        this.filesRecreator =
            new (require('./npm-lib-and-cli-tool/tools/files-recreation')
                .FilesRecreator)(project);
        //#endregion
    }
    //#endregion
    //#region public methods / clear
    async clear(options) {
        lib_6.Helpers.taskStarted(`

      Clearing artifacts temp data in ${this.project.name}

      `);
        this.project.removeFile([constants_1.TaonGeneratedFiles.BUILD_INFO_MD]);
        if (this.project.framework.isStandaloneProject) {
            this.project.removeFolderByRelativePath(lib_1.dotTnpFolder);
            this.project.removeFolderByRelativePath(lib_1.dotTaonFolder);
        }
        await this.artifact.npmLibAndCliTool.clearPartial(options);
        await this.artifact.angularNodeApp.clearPartial(options);
        await this.artifact.electronApp.clearPartial(options);
        await this.artifact.mobileApp.clearPartial(options);
        await this.artifact.docsWebapp.clearPartial(options);
        await this.artifact.vscodePlugin.clearPartial(options);
        if (this.project.framework.isContainer) {
            [
                constants_1.srcMainProject,
                ...this.filesRecreator.projectSpecificFilesForContainer(),
                ...this.filesRecreator.projectSpecificFilesForStandalone(),
                ...this.filesRecreator.filesTemplatesForStandalone(),
                ...this.filesRecreator
                    .filesTemplatesForStandalone()
                    .map(f => f.replace(constants_1.dotFileTemplateExt, '')),
            ].forEach(f => {
                // console.log('removing', f);
                this.project.remove(f, true);
            });
        }
        lib_6.Helpers.taskDone(`

      Done cleaning artifacts temp data in ${this.project.name}

      `);
    }
    async clearAllChildren(options) {
        for (const child of this.project.children) {
            await child.artifactsManager.clear(options);
        }
    }
    //#endregion
    //#region public methods / struct
    /**
     * struct current project only
     * struct() <=> init() with struct flag
     */
    async struct(initOptions) {
        //#region @backendFunc
        initOptions.purpose = 'only structure init';
        initOptions.init.struct = true;
        return await this.init(initOptions);
        //#endregion
    }
    /**
     * struct all children artifacts
     */
    async structAllChildren(options) {
        for (const child of this.project.children) {
            await child.artifactsManager.struct(options);
        }
    }
    //#endregion
    //#region public methods / init
    async init(initOptions) {
        //#region @backendFunc
        initOptions.release.fixStaticPagesCustomRepoUrl(this.project);
        //#region prevent not requested framework version
        if (this.project.framework.frameworkVersionLessThan('v4')) {
            lib_6.Helpers.warn(`Skipping artifacts init for project: ${this.project.name}`);
            return;
        }
        if (this.project.framework.frameworkVersionLessThan('v18')) {
            // TODO QUICK_FIX @REMOVE
            if (this.project.framework.isCoreProject) {
                return;
            }
            lib_6.Helpers.error(`Please upgrade taon framework version to to at least v18
        in project: ${this.project.name}

        ${constants_1.taonJsonMainProject} => version => should be at least 18
        inside file
        ${lib_2.chalk.underline(this.project.pathFor(constants_1.taonJsonMainProject))}

        `, false, true);
        }
        //#endregion
        this.project.quickFixes.fixPrettierCreatingConfigInNodeModules();
        if (!initOptions.init.struct) {
            //#region prevent incorrect node_modules with tnp dev mode
            if (lib_1.config.frameworkName === lib_4.tnpPackageName) {
                let node_modules_path = this.project.nodeModules.path;
                let node_modules_real_path = this.project.nodeModules.realPath;
                if (node_modules_path !== node_modules_real_path) {
                    // const containerName = path.basename(
                    //   path.dirname(node_modules_real_path),
                    // );
                    const properRelativeNodeModulesPath = (0, lib_2.crossPlatformPath)(lib_2.path.resolve(lib_1.config.dirnameForTnp, this.project.ins.taonProjectsRelative, `${constants_1.containerPrefix}${this.project.taonJson.frameworkVersion}`, constants_1.nodeModulesMainProject));
                    if (node_modules_real_path !== properRelativeNodeModulesPath) {
                        console.warn(`
    (DEV MODE TNP) DETECTED NODE_MODULES LINK NOT FROM PROPER CONTAINER
    fixing/linking proper node_modules path
              `);
                        try {
                            lib_2.fse.unlinkSync(node_modules_path);
                        }
                        catch (error) { }
                    }
                }
            }
            //#endregion
            await this.project.nodeModules.makeSureInstalled();
        }
        await this.project.subProject?.initAll();
        //#region check isomorphic dependencies for npm lib
        if (this.project.framework.isStandaloneProject) {
            let missingDependencies = [];
            const isomorphicDependenciesForNpmLib = this.project.taonJson.isomorphicDependenciesForNpmLib;
            for (const packageName of isomorphicDependenciesForNpmLib) {
                if (!this.project.nodeModules.hasPackageInstalled(packageName)) {
                    missingDependencies.push(packageName);
                }
            }
            missingDependencies = missingDependencies.filter(f => ![this.project.name, this.project.nameForNpmPackage].includes(f));
            if (missingDependencies.length > 0) {
                lib_6.Helpers.error(`
            (taon.json) - isomorphicDependenciesForNpmLib property has defined packages
            that are not installed in node_modules.

            Please rebuild first your external dependency project(s):
    ${missingDependencies.map(d => `- ${lib_2.chalk.bold(d)}`).join()}`, false, true);
            }
        }
        //#endregion
        this.recreateAndFixCoreFiles();
        initOptions = await this.project.environmentConfig.update(initOptions, {
            saveEnvToLibEnv: initOptions.release.targetArtifact ===
                options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
                !initOptions.release.targetArtifact,
        });
        this.project.framework.recreateVarsScss(initOptions);
        // TODO QUICK_FIX change env to something else
        lib_6.Helpers.removeFileIfExists(lib_2.path.join(this.project.location, lib_3.fileName.tnpEnvironment_json));
        if (!initOptions.isCiProcess && !this.project.framework.isCoreProject) {
            // do some fixing on dev machine
            // TODO QUICK_FIX
            // if (this.project.framework.isStandaloneProject) {
            //   try {
            //     this.project.remove(`app`, true);
            //   } catch (error) {}
            // }
            // TODO QUICK_FIX when somehow linked node_modules to dist
            // make electron use node_modules from dist no from ./node_modules
            try {
                lib_2.fse.unlinkSync(this.project.pathFor(`${constants_1.distMainProject}/${constants_1.nodeModulesMainProject}`));
            }
            catch (error) { }
            try {
                this.project
                    .run(`git rm -f ${constants_1.dotVscodeMainProject}/${constants_1.TaonGeneratedFiles.LAUNCH_JSON}`, {
                    output: false,
                    silence: true,
                })
                    .sync();
            }
            catch (error) { }
            this.project.removeFile('tsconfig.isomorphic-flat-bundle.json');
            this.project.removeFile('webpack.backend-bundle-build.js');
            this.project.removeFile('.eslintrc.json');
            this.project.removeFile('eslint.config.js');
            this.project.removeFile('tslint.json');
            this.project.removeFile(`${constants_1.dotVscodeMainProject}/${constants_1.TaonGeneratedFiles.LAUNCH_BACKUP_JSON}`);
            this.project.removeFile('run-org.js');
            if (this.project.typeIs(lib_1.LibTypeEnum.CONTAINER)) {
                this.project.removeFile(`${constants_1.srcMainProject}/${constants_1.TaonGeneratedFiles.VARS_SCSS}`);
            }
            this.project.remove(`${constants_1.srcMainProject}/docker`, true);
            if (this.project.hasFolder([constants_1.srcMainProject, constants_1.migrationsFromLib]) &&
                !this.project.hasFolder([constants_1.srcMainProject, constants_1.libFromSrc, constants_1.migrationsFromLib])) {
                lib_6.HelpersTaon.copy(this.project.pathFor([constants_1.srcMainProject, constants_1.migrationsFromLib]), this.project.pathFor([constants_1.srcMainProject, constants_1.libFromSrc, constants_1.migrationsFromLib]), { recursive: true, overwrite: true });
                lib_6.Helpers.remove(this.project.pathFor([constants_1.srcMainProject, constants_1.migrationsFromLib]));
            }
            try {
                this.project
                    .run(`git rm -f ${constants_1.dotVscodeMainProject}/${constants_1.TaonGeneratedFiles.LAUNCH_BACKUP_JSON}`, {
                    output: false,
                    silence: true,
                })
                    .sync();
            }
            catch (error) { }
        }
        // if organization project - children should have the same framework version
        if (this.project.framework.isContainer &&
            this.project.taonJson.isOrganization) {
            for (const orgChild of this.project.children) {
                orgChild.taonJson.setFrameworkVersion(this.project.taonJson.frameworkVersion);
            }
        }
        this.project.taonJson.preservePropsFromPackageJson(); // TODO temporary remove
        this.project.taonJson.preserveOldTaonProps(); // TODO temporary remove
        this.project.taonJson.saveToDisk('init');
        this.project.environmentConfig.updateGeneratedValues(initOptions);
        this.project.packagesRecognition.addIsomorphicPackagesToFile([
            this.project.nameForNpmPackage,
        ]);
        if (this.project.framework.isStandaloneProject) {
            await this.project.artifactsManager.artifact.angularNodeApp.appHostsRecreateHelper.runTask({
                watch: initOptions.build.watch,
                initialParams: {
                    envOptions: initOptions,
                },
            });
        }
        await this.project.ignoreHide.init();
        await this.filesRecreator.init();
        await this.project.vsCodeHelpers.init({
            skipHiddingTempFiles: !initOptions.init.struct,
        });
        await this.project.linter.init();
        if (this.project.framework.isStandaloneProject) {
            await this.project.artifactsManager.globalHelper.branding.apply(!!initOptions.init.branding);
            this.project.framework.recreateAppTsPresentationFiles();
        }
        this.artifact.npmLibAndCliTool.unlinkNodeModulesWhenTnp();
        const targetArtifact = initOptions.release.targetArtifact;
        if (this.project.framework.isStandaloneProject) {
            if (!targetArtifact ||
                targetArtifact === options_1.ReleaseArtifactTaon.DOCS_DOCS_WEBAPP) {
                initOptions = await this.artifact.docsWebapp.initPartial(initOptions);
            }
            if (!targetArtifact ||
                targetArtifact === options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL) {
                initOptions =
                    await this.artifact.npmLibAndCliTool.initPartial(initOptions);
            }
            if (!targetArtifact ||
                targetArtifact === options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
                targetArtifact === options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP) {
                initOptions =
                    await this.artifact.angularNodeApp.initPartial(initOptions);
            }
            if (!targetArtifact ||
                targetArtifact === options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
                targetArtifact === options_1.ReleaseArtifactTaon.ELECTRON_APP) {
                initOptions = await this.artifact.electronApp.initPartial(initOptions);
            }
            if (!targetArtifact ||
                targetArtifact === options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
                targetArtifact === options_1.ReleaseArtifactTaon.MOBILE_APP) {
                initOptions = await this.artifact.mobileApp.initPartial(initOptions);
            }
            if (!targetArtifact ||
                targetArtifact === options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
                targetArtifact === options_1.ReleaseArtifactTaon.VSCODE_PLUGIN) {
                initOptions = await this.artifact.vscodePlugin.initPartial(initOptions);
            }
        }
        return initOptions;
        //#endregion
    }
    async initAllChildren(options) {
        for (const child of this.project.children) {
            await child.artifactsManager.init(options.clone({}));
        }
    }
    //#endregion
    //#region public methods / build
    //#region public methods / interactive menu TODO
    /**
     * @deprecated
     */
    buildWatchCmdForArtifact = (artifact, options) => {
        options = options_1.EnvOptions.from(options);
        let params = '';
        // try {
        params = options_1.EnvOptions.getParamsString({
            ...options,
            release: { targetArtifact: artifact },
        });
        // } catch (error) {
        //   Helpers.error(error, true, true);
        //   Helpers.throwError(
        //     `Error while creating params for ${artifact} build command`,
        //   );
        // }
        return `${lib_1.config.frameworkName} build${options.build.watch ? ':watch' : ''} ${params}`;
    };
    //#endregion
    //#region public methods / build standalone
    async build(buildOptions) {
        if (!buildOptions.release.targetArtifact) {
            //#region  build Menu
            // TODO for unified build menu is not efficient enouth
            lib_6.Helpers.error(`

        Please use commands:

        ${lib_1.config.frameworkName} build:watch:lib
        ${lib_1.config.frameworkName} build:watch:app
        ${lib_1.config.frameworkName} build:watch:electron
        ${lib_1.config.frameworkName} docs:watch

        `, false, true);
            // await this.init(buildOptions.clone({ build: { watch: false } }));
            // const processManager = new BaseProcessManger(this.project as any);
            // const ngBuildLibCommand = CommandConfig.from({
            //   name: `Isomorphic Nodejs/Angular library`,
            //   cmd: this.buildWatchCmdForArtifact('npm-lib-and-cli-tool'),
            //   goToNextCommandWhenOutput: {
            //     stdoutContains: COMPILATION_COMPLETE_LIB_NG_BUILD,
            //   },
            // });
            // const ngNormalAppPort =
            //   await this.artifact.angularNodeApp.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
            //     buildOptions.clone({ build: { websql: false } }),
            //   );
            // const ngWebsqlAppPort =
            //   await this.artifact.angularNodeApp.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
            //     buildOptions.clone({ build: { websql: true } }),
            //   );
            // const nodeBeAppPort =
            //   await this.artifact.angularNodeApp.NODE_BACKEND_PORT_UNIQ_KEY(
            //     buildOptions.clone(),
            //   );
            // const ngServeAppCommand = CommandConfig.from({
            //   name: `Angular (for Nodejs backend) frontend app`,
            //   cmd: this.buildWatchCmdForArtifact('angular-node-app', {
            //     ports: { ngNormalAppPort, nodeBeAppPort, ngWebsqlAppPort },
            //   }),
            //   shouldBeActiveOrAlreadyBuild: [ngBuildLibCommand],
            //   goToNextCommandWhenOutput: {
            //     stdoutContains: COMPILATION_COMPLETE_APP_NG_SERVE,
            //   },
            //   headerMessageWhenActive:
            //     `Normal Angular App is running on ` +
            //     `http://localhost:${ngNormalAppPort}`,
            // });
            // const ngServeWebsqlAppCommand = CommandConfig.from({
            //   name: `Angular (for Websql backend) frontend app`,
            //   cmd: this.buildWatchCmdForArtifact('angular-node-app', {
            //     build: { websql: true },
            //     ports: { ngNormalAppPort, nodeBeAppPort, ngWebsqlAppPort },
            //   }),
            //   shouldBeActiveOrAlreadyBuild: [ngBuildLibCommand],
            //   goToNextCommandWhenOutput: {
            //     stdoutContains: COMPILATION_COMPLETE_APP_NG_SERVE,
            //   },
            //   headerMessageWhenActive:
            //     `Websql Angular App is running on ` +
            //     `http://localhost:${ngWebsqlAppPort}`,
            // });
            // const documenationCommand = CommandConfig.from({
            //   name: `Documentation (mkdocs, compodoc, typedoc)`,
            //   cmd: this.buildWatchCmdForArtifact('docs-webapp'),
            //   headerMessageWhenActive:
            //     `Documentation is running on http://localhost:` +
            //     `${await this.artifact.docsWebapp.DOCS_ARTIFACT_PORT_UNIQ_KEY(
            //       EnvOptions.from(buildOptions),
            //     )}`,
            // });
            // await processManager.init({
            //   watch: !!buildOptions.build.watch,
            //   header: `
            //   Build process for ${this.project.name}
            //   `,
            //   title: `Select what do you want to build ${buildOptions.build.watch ? 'in watch mode' : ''}?`,
            //   commands: [
            //     ngBuildLibCommand,
            //     ngServeAppCommand,
            //     ngServeWebsqlAppCommand,
            //     documenationCommand,
            //   ],
            // });
            //#endregion
        }
        else {
            //#region partial build
            //#region framework version check
            while (this.project.framework.frameworkVersionLessThan(build_info__auto_generated_1.CURRENT_PACKAGE_VERSION.split('.')[0])) {
                if (this.project.parent &&
                    this.project.parent?.framework.isContainer &&
                    this.project.parent?.taonJson.isOrganization &&
                    this.project.taonJson.frameworkVersion !==
                        this.project.parent.taonJson.frameworkVersion) {
                    this.project.taonJson.setFrameworkVersion(this.project.parent.taonJson.frameworkVersion);
                    continue;
                }
                lib_6.Helpers.error(`
              Please upgrade taon framework version to at least v${build_info__auto_generated_1.CURRENT_PACKAGE_VERSION.split('.')[0]} (in taon.jsonc)
              or install previous version of taon cli tool for ${this.project.framework.frameworkVersion}:

              npm i -g ${lib_1.taonPackageName}@${this.project.framework.frameworkVersion?.replace('v', '')}

            `, false, true);
                break; // not needed but to be sure
            }
            //#endregion
            if (buildOptions.build.watch && buildOptions.build.prod) {
                buildOptions.build.prod = false; // QUICK_FIX no prod for development
            }
            if (!buildOptions.build.watch &&
                buildOptions.build.prod &&
                this.project.framework.isStandaloneProject &&
                !this.project.taonJson.isUsingOwnNodeModulesInsteadCoreContainer) {
                await this.project.clear();
            }
            if (!buildOptions.release.targetArtifact ||
                buildOptions.release.targetArtifact ===
                    options_1.ReleaseArtifactTaon.DOCS_DOCS_WEBAPP) {
                await this.artifact.docsWebapp.buildPartial(buildOptions.clone());
            }
            if (!buildOptions.release.targetArtifact ||
                buildOptions.release.targetArtifact ===
                    options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL) {
                await this.artifact.npmLibAndCliTool.buildPartial(buildOptions.clone());
            }
            if (!buildOptions.release.targetArtifact ||
                buildOptions.release.targetArtifact ===
                    options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP) {
                await this.artifact.angularNodeApp.buildPartial(buildOptions.clone());
            }
            if (!buildOptions.release.targetArtifact ||
                buildOptions.release.targetArtifact === options_1.ReleaseArtifactTaon.ELECTRON_APP) {
                await this.artifact.electronApp.buildPartial(buildOptions.clone());
            }
            if (!buildOptions.release.targetArtifact ||
                buildOptions.release.targetArtifact === options_1.ReleaseArtifactTaon.MOBILE_APP) {
                await this.artifact.mobileApp.buildPartial(buildOptions.clone());
            }
            if (!buildOptions.release.targetArtifact ||
                buildOptions.release.targetArtifact === options_1.ReleaseArtifactTaon.MOBILE_APP) {
                await this.artifact.vscodePlugin.buildPartial(buildOptions.clone());
            }
            //#endregion
        }
    }
    //#endregion
    //#region public methods / build all children
    async buildAllChildren(options, children = this.project.children) {
        children = this.project.ins // @ts-ignore BaseProject inheritace compatiblity with Project problem
            .sortGroupOfProject(children, proj => [
            ...proj.taonJson.dependenciesNamesForNpmLib,
            ...proj.taonJson.isomorphicDependenciesForNpmLib,
            ...proj.taonJson.peerDependenciesNamesForNpmLib,
        ], proj => proj.nameForNpmPackage, this.project.taonJson.overridePackagesOrder);
        if (options.container.only.length > 0) {
            children = children.filter(c => {
                return options.container.only.includes(c.name);
            });
        }
        if (options.container.skip.length > 0) {
            children = children.filter(c => {
                return !options.container.skip.includes(c.name);
            });
        }
        const endIndex = this.project.children.findIndex(c => c.name === options.container.end);
        if (endIndex !== -1) {
            children = children.filter((c, i) => {
                return i <= endIndex;
            });
        }
        const startIndex = this.project.children.findIndex(c => c.name === options.container.start);
        if (startIndex !== -1) {
            children = children.filter((c, i) => {
                return i >= startIndex;
            });
        }
        if (options.container.skipReleased) {
            children = children.filter((c, i) => {
                const lastCommitMessage = c?.git?.lastCommitMessage()?.trim();
                return !lastCommitMessage?.startsWith('release: ');
            });
        }
        if (!(await this.project.npmHelpers.shouldReleaseMessage({
            releaseVersionBumpType: options.release.releaseVersionBumpType,
            children: children,
            whatToRelease: {
                itself: false,
                children: true,
            },
            skipQuestionToUser: options.isCiProcess,
            actionType: 'build',
        }))) {
            return;
        }
        for (const child of children) {
            lib_1.GlobalStorage.set(lib_5.taonActionFromParent, child.name);
            await child.artifactsManager.build(options);
        }
    }
    //#endregion
    //#endregion
    //#region public methods / release
    async release(releaseOptions, autoReleaseProcess = false) {
        //#region @backendFunc
        //#region handle autorelease
        if (!autoReleaseProcess && releaseOptions.release.autoReleaseUsingConfig) {
            let artifactsToRelease = this.project.taonJson.autoReleaseConfigAllowedItems.filter(item => {
                if (!releaseOptions.release.autoReleaseTaskName ||
                    this.project.taonJson.createOnlyTagWhenRelease) {
                    return true;
                }
                const allowed = item.taskName === releaseOptions.release.autoReleaseTaskName;
                if (!allowed) {
                    lib_6.Helpers.logWarn(`Skipping task ${item.taskName}`);
                }
                return allowed;
            });
            for (const item of artifactsToRelease) {
                const clonedOptions = releaseOptions.clone({
                    release: {
                        targetArtifact: item.artifactName,
                        envName: item.envName || '__',
                        envNumber: item.envNumber,
                        releaseType: item.releaseType || releaseOptions.release.releaseType,
                        taonInstanceIp: item.taonInstanceIp,
                        askUserBeforeFinalAction: item.askUserBeforeFinalAction,
                        staticPagesCustomRepoUrl: item.staticPagesCustomRepoUrl,
                    },
                });
                if (!this.project.taonJson.isUsingOwnNodeModulesInsteadCoreContainer) {
                    await this.project.clear();
                }
                clonedOptions.release.fixStaticPagesCustomRepoUrl(this.project);
                await this.release(clonedOptions, true);
            }
            return;
        }
        //#endregion
        releaseOptions =
            await this.project.environmentConfig.update(releaseOptions);
        let releaseOutput;
        //#region npm build helper
        const npmLibBUild = async (options) => {
            const libConfig = options.clone({
                build: {
                    watch: false,
                },
                release: {
                    skipCodeCutting: true,
                    targetArtifact: options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
                },
            });
            // normal lib build
            await this.artifact.npmLibAndCliTool.buildPartial(libConfig);
        };
        //#endregion
        //#region docs app
        if (!releaseOptions.release.targetArtifact ||
            releaseOptions.release.targetArtifact ===
                options_1.ReleaseArtifactTaon.DOCS_DOCS_WEBAPP) {
            releaseOutput =
                await this.artifact.docsWebapp.releasePartial(releaseOptions);
        }
        //#endregion
        //#region npm lib and cli tool
        if (!releaseOptions.release.targetArtifact ||
            releaseOptions.release.targetArtifact ===
                options_1.ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL) {
            releaseOutput =
                await this.artifact.npmLibAndCliTool.releasePartial(releaseOptions);
        }
        //#endregion
        //#region angular-node-app
        if (!releaseOptions.release.targetArtifact ||
            releaseOptions.release.targetArtifact ===
                options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP) {
            if (releaseOptions.release.releaseType === options_1.ReleaseType.STATIC_PAGES) {
                releaseOptions.build.baseHref =
                    this.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(releaseOptions);
            }
            await npmLibBUild(releaseOptions);
            releaseOutput =
                await this.artifact.angularNodeApp.releasePartial(releaseOptions);
        }
        //#endregion
        //#region electron app
        if (!releaseOptions.release.targetArtifact ||
            releaseOptions.release.targetArtifact === options_1.ReleaseArtifactTaon.ELECTRON_APP) {
            await npmLibBUild(releaseOptions.clone({
                build: {
                    pwa: {
                        disableServiceWorker: true,
                    },
                    baseHref: `./`,
                },
                copyToManager: {
                    skip: true,
                },
                release: {
                    targetArtifact: options_1.ReleaseArtifactTaon.ELECTRON_APP,
                },
            }));
            releaseOutput =
                await this.artifact.electronApp.releasePartial(releaseOptions);
        }
        //#endregion
        //#region mobile app
        if (!releaseOptions.release.targetArtifact ||
            releaseOptions.release.targetArtifact === options_1.ReleaseArtifactTaon.MOBILE_APP) {
            await npmLibBUild(releaseOptions);
            releaseOutput =
                await this.artifact.mobileApp.releasePartial(releaseOptions);
        }
        //#endregion
        //#region vscode plugin
        if (!releaseOptions.release.targetArtifact ||
            releaseOptions.release.targetArtifact ===
                options_1.ReleaseArtifactTaon.VSCODE_PLUGIN) {
            await npmLibBUild(releaseOptions);
            releaseOutput =
                await this.artifact.vscodePlugin.releasePartial(releaseOptions);
        }
        //#endregion
        //#region final actopm tag/push/release/deploy
        let shouldAskQuestions = !releaseOptions.release.autoReleaseUsingConfig;
        if (lib_2._.isBoolean(releaseOptions.release.askUserBeforeFinalAction)) {
            shouldAskQuestions = releaseOptions.release.askUserBeforeFinalAction;
        }
        if (shouldAskQuestions) {
            await this.project.releaseProcess.checkBundleQuestion(this.project.location, `[${releaseOptions.release.releaseType}] Check ${lib_2.chalk.bold('code')} before final action`);
        }
        if (!releaseOptions.release.skipTagGitPush) {
            if (shouldAskQuestions) {
                lib_6.Helpers.info(`Checking project path "${releaseOutput.releaseProjPath}" ..`);
                await this.project.releaseProcess.checkBundleQuestion(releaseOutput.releaseProjPath, `[${releaseOptions.release.releaseType}] Check ${lib_2.chalk.bold('bundled code')} before tagging/pushing`);
            }
            releaseOutput.projectsReposToPush =
                releaseOutput.projectsReposToPush || [];
            //#region push repos
            for (const repoAbsPath of lib_2.Utils.uniqArray(releaseOutput.projectsReposToPush)) {
                lib_6.Helpers.info(`Checking  path "${repoAbsPath}" `);
                if (shouldAskQuestions) {
                    await this.project.releaseProcess.checkBundleQuestion(repoAbsPath, `[${releaseOptions.release.releaseType}] Check ${lib_2.chalk.bold('project repo')} before pushing`);
                }
                if (releaseOptions.release.pushToAllOriginsWhenLocalReleaseBranch) {
                    const allOrigins = lib_6.HelpersTaon.git.allOrigins(this.project.location);
                    for (const origin of allOrigins) {
                        await lib_6.HelpersTaon.git.addOriginIfNotExists(repoAbsPath, origin.origin, origin.url);
                        await lib_6.HelpersTaon.git.tagAndPushToGitRepo(repoAbsPath, {
                            newVersion: releaseOutput.resolvedNewVersion,
                            skipAskingQuestionBeforePush: !shouldAskQuestions,
                            isCiProcess: releaseOptions.isCiProcess,
                            customOrigin: origin.origin,
                            skipTag: true,
                        });
                    }
                }
                else {
                    await lib_6.HelpersTaon.git.tagAndPushToGitRepo(repoAbsPath, {
                        newVersion: releaseOutput.resolvedNewVersion,
                        skipAskingQuestionBeforePush: !shouldAskQuestions,
                        isCiProcess: releaseOptions.isCiProcess,
                        skipTag: true,
                    });
                }
            }
            //#endregion
            //#region push and tag repos
            for (const repoAbsPath of lib_2.Utils.uniqArray(releaseOutput.projectsReposToPushAndTag)) {
                if (shouldAskQuestions) {
                    lib_6.Helpers.info(`Checking  path "${repoAbsPath}" ..`);
                    await this.project.releaseProcess.checkBundleQuestion(repoAbsPath, `[${releaseOptions.release.releaseType}] Check ${lib_2.chalk.bold('project repo')} before tagging/pushing`);
                }
                await lib_6.HelpersTaon.git.tagAndPushToGitRepo(repoAbsPath, {
                    newVersion: releaseOutput.resolvedNewVersion,
                    skipAskingQuestionBeforePush: !shouldAskQuestions,
                    isCiProcess: releaseOptions.isCiProcess,
                });
            }
            //#endregion
        }
        if (releaseOutput.deploymentFunction) {
            if (releaseOptions.release.skipDeploy) {
                lib_6.Helpers.warn(`Skipping deployment as per release.skipDeploy`);
            }
            else {
                await releaseOutput.deploymentFunction();
            }
        }
        //#endregion
        //#endregion
    }
    async releaseAllChildren(options, children = this.project.children) {
        //#region @backendFunc
        const howManyChildren = children.length;
        for (let index = 0; index < children.length; index++) {
            const child = children[index];
            lib_1.GlobalStorage.set(lib_5.taonActionFromParent, child.name);
            if (!options.isCiProcess) {
                lib_2.UtilsTerminal.clearConsole();
            }
            lib_6.Helpers.info(`Releasing container child: ${child.name}  (${howManyChildren}/${index + 1}) `);
            await this.tryCatchWrapper(async () => {
                await child.artifactsManager.release(options);
            }, 'release', child);
        }
        //#endregion
    }
    //#endregion
    //#region public methods / try catch wrapper
    async tryCatchWrapper(action, actionName, project = this.project) {
        //#region @backendFunc
        while (true) {
            try {
                await action();
                return;
            }
            catch (error) {
                if (error instanceof Error && error?.name === 'ExitPromptError') {
                    process.exit(0);
                }
                console.error(error);
                lib_6.Helpers.error(`Not able to ${actionName} your project ${lib_2.chalk.bold(project.genericName)}`, true, true);
                const errorOptions = {
                    tryAgain: { name: 'Try again' },
                    skipPackage: { name: `Skip ${actionName} for this project` },
                    openInVscode: { name: `Open in VSCode ... try release again` },
                    exit: { name: 'Exit process' },
                };
                const res = await lib_2.UtilsTerminal.select({
                    choices: errorOptions,
                    question: 'What you wanna do ?',
                });
                if (res === 'openInVscode') {
                    await project.openInEditor();
                    await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync({
                        message: 'Press any key to try release again',
                    });
                }
                if (res === 'exit') {
                    process.exit(0);
                }
                else if (res === 'skipPackage') {
                    break;
                }
            }
        }
        //#endregion
    }
    //#endregion
    //#region private methods / recreation and fixing core files
    recreateAndFixCoreFiles() {
        //#region @backendFunc
        const project = this.project;
        if (!project.framework.isCoreProject &&
            project.framework.isStandaloneProject) {
            project.framework.recreateFileFromCoreProject({
                fileRelativePath: [constants_1.srcMainProject, constants_1.appTsFromSrc],
            });
            project.framework.preventNotExistedComponentAndModuleInAppTs();
            project.framework.recreateFileFromCoreProject({
                fileRelativePath: [constants_1.srcMainProject, constants_1.globalScssFromSrc],
            });
            project.framework.recreateFileFromCoreProject({
                fileRelativePath: [constants_1.srcMainProject, constants_1.appElectronTsFromSrc],
            });
            const indexInSrcFile = project.pathFor([constants_1.srcMainProject, constants_1.indexTsFromSrc]);
            if (!lib_6.Helpers.exists(indexInSrcFile)) {
                lib_6.Helpers.writeFile(indexInSrcFile, (0, templates_1.EXPORT_TEMPLATE)(constants_1.libFromSrc));
            }
        }
        //#endregion
    }
}
exports.ArtifactManager = ArtifactManager;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/artifacts-manager.js.map