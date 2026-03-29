"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
//#region imports
const rxjs_1 = require("rxjs");
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
const options_1 = require("../../options");
const artifacts_manager_1 = require("./artifacts/artifacts-manager");
const project_resolve_1 = require("./project-resolve");
const refactor_1 = require("./refactor");
const taonJson_1 = require("./taonJson");
//#endregion
// @ts-ignore TODO weird inheritance problem
class Project extends lib_5.BaseProject {
    //#region static
    //#region static / instance of resolve
    static ins = new project_resolve_1.TaonProjectResolve(Project, () => {
        //#region @backendFunc
        return global.frameworkName;
        //#endregion
    });
    //#endregion
    //#endregion
    //#region fields
    // @ts-ignore TODO weird inheritance problem
    type;
    // @ts-ignore TODO weird inheritance problem
    vsCodeHelpers;
    // @ts-ignore TODO weird inheritance problem
    releaseProcess;
    // @ts-ignore TODO weird inheritance problem
    npmHelpers;
    subProject;
    get packageJson() {
        return this.npmHelpers.packageJson;
    }
    // @ts-ignore TODO weird inheritance problem
    get nodeModules() {
        return this.npmHelpers.nodeModules;
    }
    // @ts-ignore TODO weird inheritance problem
    linter;
    framework;
    // @ts-ignore TODO weird inheritance problem
    quickFixes;
    artifactsManager;
    // @ts-ignore TODO weird inheritance problem
    git;
    // @ts-ignore TODO weird inheritance problem
    ignoreHide;
    taonJson;
    packagesRecognition;
    environmentConfig;
    refactor;
    //#endregion
    //#region constructor
    //#region @backend
    constructor(location) {
        super((0, lib_3.crossPlatformPath)(lib_3._.isString(location) ? location : ''));
        this.taonJson = new taonJson_1.TaonJson(this);
        this.setType(this.taonJson.type || lib_1.LibTypeEnum.UNKNOWN);
        this.framework = new (require('./framework').Framework)(this);
        this.git = new (require('./git').Git)(this);
        this.ignoreHide = new (require('./ignore-hide')
            .IgnoreHide)(this);
        this.fileFoldersOperations = new (require('./file-folders-operations')
            .FileFoldersOperations)(this);
        this.libraryBuild = new (require('./library-build')
            .LibraryBuild)(this);
        this.npmHelpers = new (require('./npm-helpers')
            .NpmHelpers)(this);
        this.linkedProjects = new (require('./linked-projects')
            .LinkedProjects)(this);
        this.vsCodeHelpers = new (require('./vscode-helper')
            .Vscode)(this);
        this.releaseProcess = new (require('./release-process')
            .ReleaseProcess)(this);
        this.quickFixes = new (require('./quick-fixes')
            .QuickFixes)(this);
        this.subProject = new (require('./sub-project')
            .SubProject)(this);
        this.linter = new (require('./linter').Linter)(this);
        this.packagesRecognition = new (require('./packages-recognition')
            .PackagesRecognition)(this);
        this.artifactsManager = artifacts_manager_1.ArtifactManager.for(this);
        this.environmentConfig =
            new (require('./artifacts/__helpers__/environment-config/environment-config')
                .EnvironmentConfig)(this);
        this.refactor = new refactor_1.Refactor(this);
        Project.ins.add(this);
    }
    //#endregion
    //#endregion
    //#region api / struct
    async struct(initOptions) {
        initOptions = options_1.EnvOptions.from(initOptions);
        if (this.framework.isStandaloneProject) {
            await this.artifactsManager.struct(initOptions);
        }
        if (this.framework.isContainer) {
            await this.artifactsManager.struct(initOptions);
            await this.artifactsManager.structAllChildren(initOptions);
        }
        initOptions.finishCallback();
    }
    //#endregion
    //#region api / init
    async init(initOptions) {
        initOptions = options_1.EnvOptions.from(initOptions);
        if (this.framework.isStandaloneProject) {
            await this.artifactsManager.init(initOptions);
        }
        if (this.framework.isContainer) {
            await this.artifactsManager.init(initOptions);
            if (initOptions.recursiveAction) {
                await this.artifactsManager.initAllChildren(initOptions);
            }
        }
        if (!initOptions.build.watch) {
            initOptions.finishCallback();
        }
    }
    //#endregion
    //#region api / build
    async build(buildOptions) {
        buildOptions = options_1.EnvOptions.from(buildOptions);
        if (this.framework.isStandaloneProject) {
            await this.artifactsManager.build(buildOptions);
        }
        if (this.framework.isContainer) {
            buildOptions.build.watch = false; // there is no need to watch for container ever
            await this.artifactsManager.build(buildOptions);
            if (buildOptions.recursiveAction) {
                await this.artifactsManager.buildAllChildren(buildOptions);
            }
        }
        if (!buildOptions.build.watch && !!buildOptions.release.targetArtifact) {
            buildOptions.finishCallback();
        }
    }
    //#endregion
    //#region api / release
    async release(releaseOptions) {
        //#region @backendFunc
        releaseOptions = options_1.EnvOptions.from(releaseOptions);
        const endCallback = () => {
            releaseOptions.finishCallback && releaseOptions.finishCallback();
        };
        if (this.framework.isStandaloneProject &&
            !this.hasValidAutoReleaseConfig(releaseOptions)) {
            endCallback();
            return;
        }
        await this.npmHelpers.checkProjectReadyForNpmRelease();
        if (releaseOptions.release.targetArtifact === 'npm-lib-and-cli-tool' &&
            releaseOptions.release.releaseType !== 'local' &&
            releaseOptions.release.releaseType !== 'static-pages') {
            await this.npmHelpers.makeSureLoggedInToNpmRegistry();
        }
        const newVersion = this.packageJson.resolvePossibleNewVersion(releaseOptions.release.releaseVersionBumpType);
        //#region prepare release children
        let children = releaseOptions.release.autoReleaseUsingConfig
            ? this.children.filter(f => f.taonJson.autoReleaseConfigAllowedItems.length > 0 ||
                (f.framework.isContainer && f.taonJson.createOnlyTagWhenRelease))
            : this.children;
        // console.log('before sorting ',children.map(c => c.name));
        if (this.framework.isContainer) {
            if (this.taonJson.createOnlyTagWhenRelease) {
                lib_5.Helpers.warn(`Container project is set to only create git tag during release process.` +
                    `No releases will be done inside children projects.`);
                this.packageJson.setVersion(newVersion);
                await lib_5.HelpersTaon.git.tagAndPushToGitRepo(this.location, {
                    newVersion,
                    skipAskingQuestionBeforePush: releaseOptions.release.autoReleaseUsingConfig,
                    isCiProcess: releaseOptions.isCiProcess,
                    skipTag: false,
                });
                endCallback();
                return;
            }
            children = this.ins // @ts-ignore BaseProject inheritace compatiblity with Project problem
                .sortGroupOfProject(children, proj => [
                ...proj.taonJson.dependenciesNamesForNpmLib,
                ...proj.taonJson.isomorphicDependenciesForNpmLib,
                ...proj.taonJson.peerDependenciesNamesForNpmLib,
            ], proj => proj.nameForNpmPackage, this.taonJson.overridePackagesOrder)
                .filter(d => d.framework.isStandaloneProject ||
                (d.framework.isContainer && d.taonJson.createOnlyTagWhenRelease));
            // console.log({
            //   overridePackagesOrder: this.taonJson.overridePackagesOrder,
            // });
            if (releaseOptions.container.only.length > 0) {
                children = children.filter(c => {
                    return releaseOptions.container.only.includes(c.name);
                });
            }
            if (releaseOptions.container.skip.length > 0) {
                children = children.filter(c => {
                    return !releaseOptions.container.skip.includes(c.name);
                });
            }
            const endIndex = children.findIndex(c => c.name === releaseOptions.container.end);
            if (endIndex !== -1) {
                children = children.filter((c, i) => {
                    return i <= endIndex;
                });
            }
            const startIndex = children.findIndex(c => c.name === releaseOptions.container.start);
            if (startIndex !== -1) {
                children = children.filter((c, i) => {
                    return i >= startIndex;
                });
            }
            if (releaseOptions.container.skipReleased) {
                children = children.filter((c, i) => {
                    const lastCommitMessage = c?.git?.lastCommitMessage()?.trim();
                    return !lastCommitMessage?.startsWith('release: ');
                });
            }
        }
        if (releaseOptions.release.autoReleaseUsingConfig) {
            children = children.filter(child => {
                if (!child.framework.isStandaloneProject) {
                    return true;
                }
                const hasConfigForAutoRelease = child.hasValidAutoReleaseConfig(releaseOptions, { project: child, hideTaskErrors: true });
                return hasConfigForAutoRelease;
            });
        }
        // console.log('after sorting ',children.map(c => c.name));
        //#endregion
        //#region question about release
        if (!releaseOptions.isCiProcess) {
            lib_5.Helpers.clearConsole();
        }
        if (!(await this.npmHelpers.shouldReleaseMessage({
            releaseVersionBumpType: releaseOptions.release.releaseVersionBumpType,
            versionToUse: newVersion,
            children: children,
            whatToRelease: {
                itself: this.framework.isStandaloneProject,
                children: this.framework.isContainer,
            },
            skipQuestionToUser: (this.framework.isStandaloneProject &&
                releaseOptions.release.autoReleaseUsingConfig) ||
                releaseOptions.release.skipReleaseQuestion,
            messagePrefix: `${releaseOptions.release.releaseType}-release`,
        }))) {
            return;
        }
        //#endregion
        //#region resolve taon instances
        if ([options_1.ReleaseType.MANUAL, options_1.ReleaseType.CLOUD].includes(releaseOptions.release.releaseType) &&
            releaseOptions.release.targetArtifact === 'angular-node-app') {
            if (releaseOptions.release.autoReleaseUsingConfig) {
                // use from config
            }
            else {
                const ctrl = await this.ins.taonProjectsWorker.instancesWorker.getRemoteControllerFor({
                    methodOptions: {
                        calledFrom: 'Project.release',
                    },
                });
                const instances = (await ctrl.getEntities().request())?.body.json || [];
                const options = instances.map(i => ({
                    name: `${i.name} (${i.ipAddress})`,
                    value: i.ipAddress,
                }));
                releaseOptions.release.taonInstanceIp = await lib_4.UtilsTerminal.select({
                    choices: options,
                    autocomplete: true,
                    question: `[${releaseOptions.release.releaseType}-release] Select to what instance you want to release`,
                });
            }
            console.log(lib_2.chalk.gray(`You selected to release to instance: ${releaseOptions.release.taonInstanceIp}`));
        }
        //#endregion
        //#region resolve git changes
        if (!releaseOptions.release.skipTagGitPush) {
            if (!releaseOptions.isCiProcess) {
                lib_5.Helpers.clearConsole();
            }
            if (this.framework.isStandaloneProject) {
                if (!releaseOptions.release.skipResolvingGitChanges) {
                    await this.git.resolveLastChanges({
                        tryAutomaticActionFirst: releaseOptions.release.autoReleaseUsingConfig,
                    });
                }
            }
            if (this.framework.isContainer) {
                if (!releaseOptions.release.skipResolvingGitChanges) {
                    for (const child of children) {
                        if (!releaseOptions.isCiProcess) {
                            lib_5.Helpers.clearConsole();
                        }
                        lib_5.Helpers.info(`Checking if project has any unfinished/uncommitted git changes: ${child.name}`);
                        await child.git.resolveLastChanges({
                            tryAutomaticActionFirst: releaseOptions.release.autoReleaseUsingConfig,
                            projectNameAsOutputPrefix: child.name,
                        });
                    }
                }
            }
        }
        if (!releaseOptions.isCiProcess) {
            lib_5.Helpers.clearConsole();
        }
        //#endregion
        //#region actual release process
        if (this.framework.isStandaloneProject) {
            await this.artifactsManager.tryCatchWrapper(async () => {
                await this.artifactsManager.release(releaseOptions);
            }, 'release');
        }
        if (this.framework.isContainer) {
            await this.artifactsManager.releaseAllChildren(releaseOptions, children);
        }
        //#endregion
        endCallback();
        //#endregion
    }
    //#endregion
    //#region api / lint
    async lint(lintOptions) {
        // await this.linter.start()
    }
    //#endregion
    //#region api / clear
    async clear(clearOptions) {
        clearOptions = options_1.EnvOptions.from(clearOptions);
        await this.artifactsManager.clear(clearOptions);
        if (clearOptions.recursiveAction) {
            await this.artifactsManager.clearAllChildren(clearOptions);
        }
    }
    //#endregion
    isLinuxWatchModeAllowde() {
        //#region @backendFunc
        if (global.linuxWatchInArgs) {
            return global.linuxWatchInArgs;
        }
        if (process.platform === 'darwin') {
            return false;
        }
        if (process.platform === 'win32') {
            return false;
        }
        return true;
        //#endregion
    }
    getWatcherFor(folders, watcherType) {
        //#region @backendFunc
        const watcher = new rxjs_1.Subject();
        const isomorphic = this.nodeModules.getIsomorphicPackagesNames();
        // console.log({ isomorphic });
        const pathsToWatch = [
            ...folders,
            ...isomorphic.map(p => this.nodeModules.pathFor([p, constants_1.packageJsonNpmLib])),
        ];
        // console.log('Watching for changes in:', pathsToWatch);
        lib_1.chokidar
            .watch(pathsToWatch, {
            ignoreInitial: true,
        })
            .on('all', async (eventWatcher, pathToFile) => {
            const relative = (0, lib_3.crossPlatformPath)(pathToFile).replace(this.location + '/' + lib_3.path.basename(folders[0]) + '/', '');
            if (watcherType === 'backend') {
                if (!relative.startsWith(`${constants_1.assetsFromTempSrc}/`)) {
                    // console.log('WATCHER CHANGE', {
                    //   eventWatcher,
                    //   pathToFile,
                    //   watcherType,
                    // });
                    watcher.next({});
                }
            }
            else {
                if (!relative.startsWith(`${constants_1.assetsFromTempSrc}/`) &&
                    !relative.startsWith(`app/`) &&
                    !relative.startsWith(`app.`)) {
                    // console.log('WATCHER CHANGE', {
                    //   eventWatcher,
                    //   pathToFile,
                    //   watcherType,
                    // });
                    watcher.next({});
                }
            }
        });
        return watcher.asObservable();
        //#endregion
    }
    get tmpSourceRebuildForBackendObs() {
        if (!this.isLinuxWatchModeAllowde()) {
            return;
        }
        const key = 'tmpSourceRebuildForBackendObs';
        if (this.cache[key]) {
            return this.cache[key];
        }
        const watcher = this.getWatcherFor([this.pathFor(constants_1.tmpSourceDist)], 'backend');
        this.cache[key] = watcher;
        return this.cache[key];
    }
    get tmpSourceRebuildForBrowserObs() {
        if (!this.isLinuxWatchModeAllowde()) {
            return;
        }
        const key = 'tmpSourceRebuildForBrowserObs';
        if (this.cache[key]) {
            return this.cache[key];
        }
        const watcher = this.getWatcherFor([this.pathFor(constants_1.tmpSrcDist)], 'browser');
        this.cache[key] = watcher;
        return this.cache[key];
    }
    get tmpSourceRebuildForWebsqlObs() {
        if (!this.isLinuxWatchModeAllowde()) {
            return;
        }
        const key = 'tmpSourceRebuildForWebsqlObs';
        if (this.cache[key]) {
            return this.cache[key];
        }
        const watcher = this.getWatcherFor([this.pathFor(constants_1.tmpSrcDistWebsql)], 'webslq');
        this.cache[key] = watcher;
        return this.cache[key];
    }
    hasValidAutoReleaseConfig(envOptions, options) {
        //#region @backendFunc
        options = options || {};
        const project = options.project || this;
        if (!envOptions.release.autoReleaseUsingConfig) {
            return true;
        }
        if (envOptions.release.autoReleaseUsingConfig &&
            !envOptions.release.autoReleaseTaskName) {
            lib_5.Helpers.error(`When using auto releae config (from taon.json) you have to provide task name as argument.`, false, true);
        }
        const task = project.taonJson.autoReleaseConfigAllowedItems.find(i => i.taskName === envOptions.release.autoReleaseTaskName);
        const taskNames = project.taonJson.autoReleaseConfigAllowedItems
            .filter(f => f.taskName)
            .map(i => i.taskName);
        if (!task) {
            if (!options.hideTaskErrors) {
                lib_5.Helpers.error(`Auto release task name: "${envOptions.release.autoReleaseTaskName}" is not ` +
                    `present in project auto release configuration.` +
                    ` Available task names are: ${taskNames.join(', ')}`, true, true);
            }
            return false;
        }
        const regexContainerOnlySmallLettersAndDash = /^[a-z\-]+$/;
        if (regexContainerOnlySmallLettersAndDash.test(task.taskName) === false) {
            if (!options.hideTaskErrors) {
                lib_5.Helpers.error(`

            invalid item ${lib_2.chalk.bold(task.taskName)} in "autoReleaseConfigAllowedItems" in taon.json

            ${lib_2.chalk.bold('taskName')} can contains only small letters and dash(-).

            Current value: "${lib_2.chalk.bold(task.taskName)}"

            `, true, true);
            }
            return false;
        }
        return true;
        //#endregion
    }
    // get env(): EnvOptions  //
    //   return this.environmentConfig.config;
    // }
    get branding() {
        return this.artifactsManager.globalHelper.branding;
    }
    //#region taon relative projects paths
    /**
     * @deprecated
     */
    get tnpCurrentCoreContainer() {
        return this.ins.From(this.pathFor(`${this.ins.taonProjectsRelative}/${constants_1.containerPrefix}${this.framework.frameworkVersion}`));
    }
    //#endregion
    //#region name
    /**
     * @overload
     */
    get name() {
        //#region @backendFunc
        if (this.typeIs(lib_1.LibTypeEnum.UNKNOWN_NPM_PROJECT)) {
            if (this.packageJson.name !== lib_3.path.basename(this.location) &&
                lib_3.path.basename(lib_3.path.dirname(this.location)) === 'external') {
                return lib_3.path.basename(this.location);
            }
        }
        return lib_3.path.basename(this.location);
        //#endregion
    }
    //#endregion
    get nameForCli() {
        if (this.taonJson.overrideNameForCli) {
            return this.taonJson.overrideNameForCli;
        }
        return this.name;
    }
    //#region name for npm package
    /**
     * @overload
     */
    get nameForNpmPackage() {
        //#region @backendFunc
        if (this.framework.isStandaloneProject &&
            this.parent?.framework?.isContainer &&
            this.parent?.taonJson.isOrganization) {
            let nameWhenInOrganization = this.taonJson.nameWhenInsideOrganiation
                ? this.taonJson.nameWhenInsideOrganiation
                : this.name;
            nameWhenInOrganization = this.taonJson.overrideNpmName
                ? this.taonJson.overrideNpmName
                : nameWhenInOrganization;
            return `@${this.parent.name}/${nameWhenInOrganization}`;
        }
        return this.taonJson.overrideNpmName
            ? this.taonJson.overrideNpmName
            : this.name;
        //#endregion
    }
    //#endregion
    //#region info
    async info() {
        //#region @backendFunc
        const children = (this.children || [])
            .map(c => '- ' + c.genericName)
            .join('\n');
        const linkedProjects = (this.linkedProjects.linkedProjects || [])
            .map(c => '- ' + c.relativeClonePath)
            .join('\n');
        const gitChildren = (this.git.gitChildren || [])
            .map(c => '- ' + c.genericName)
            .join('\n');
        return `

    name: ${this.name}
    basename: ${this.basename}
    nameForNpmPackage: ${this.nameForNpmPackage}
    has node_modules :${!this.nodeModules.empty}
    uses it own node_modules: ${this.taonJson.isUsingOwnNodeModulesInsteadCoreContainer}
    version: ${this.packageJson.version}
    private: ${this.packageJson?.isPrivate}
    monorepo: ${this.isMonorepo}
    parent: ${this.parent?.name}
    grandpa: ${this.grandpa?.name}
    children: ${this.children.length}
    core container location: ${this.framework.coreContainer?.location}
    core project location: ${this.framework.coreProject?.location}

    isStandaloneProject: ${this.framework.isStandaloneProject}
    isCoreProject: ${this.framework.isCoreProject}
    isContainer: ${this.framework.isContainer}
    isOrganization: ${this.taonJson.isOrganization}
    should dedupe packages ${this.nodeModules.shouldDedupePackages}

    genericName: ${this.genericName}

    frameworkVersion: ${this.framework.frameworkVersion}
    type: ${this.type}
    parent name: ${this.parent && this.parent.name}
    grandpa name: ${this.grandpa && this.grandpa.name}
    git origin: ${this.git.originURL}
    git branch name: ${this.git.currentBranchName}
    git commits number: ${this.git.countCommits()}

    location: ${this.location}

    children (${(this.children || []).length}):
${children}

    linked projects (${(this.linkedProjects.linkedProjects || []).length}):
${linkedProjects}

    git children (${(this.git.gitChildren || []).length}):
${gitChildren}

    `;
        //#endregion
    }
    //#endregion
    //#region ins
    /**
     * @overload
     */
    get ins() {
        return Project.ins;
    }
    //#endregion
    //#region children
    /**
     * @overload
     */
    get children() {
        //#region @backendFunc
        let location = this.location;
        const absExternalPathToChildren = this.pathFor([
            lib_1.dotTaonFolder,
            lib_3.CoreModels.pathToChildren,
        ]);
        let usingExternalLocation = false;
        if (lib_5.Helpers.exists(absExternalPathToChildren)) {
            const externalLocation = lib_5.Helpers.readFile(absExternalPathToChildren);
            if (externalLocation && lib_5.Helpers.exists(externalLocation)) {
                location = externalLocation;
                usingExternalLocation = true;
            }
        }
        if (this.pathExists(constants_1.taonJsonMainProject) || usingExternalLocation) {
            const folders = lib_5.Helpers.foldersFrom(location).filter(f => (0, lib_3.crossPlatformPath)(f) !== (0, lib_3.crossPlatformPath)(location) &&
                !lib_3.path.basename(f).startsWith('.') &&
                !lib_3.path.basename(f).startsWith('__') &&
                !lib_3.path.basename(f).startsWith(constants_1.distMainProject) &&
                !lib_3.path.basename(f).startsWith(constants_1.srcMainProject) &&
                !lib_3.path.basename(f).startsWith(constants_1.binMainProject) &&
                !lib_3.path.basename(f).startsWith(constants_1.docsMainProject) &&
                !lib_3.path.basename(f).startsWith('tmp') &&
                ![constants_1.nodeModulesMainProject].includes(lib_3.path.basename(f)));
            // console.log({ folders });
            const taonChildren = folders
                .map(f => this.ins.From(f))
                .filter(f => !!f);
            // console.log({
            //   taonChildren: taonChildren.map(c => c.location)
            // })
            return taonChildren;
        }
        return [];
        //#endregion
    }
    //#endregion
    //#region is monorepo
    get isMonorepo() {
        return this.taonJson?.isMonorepo;
    }
}
exports.Project = Project;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/project.js.map