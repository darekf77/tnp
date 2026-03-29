"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaonProjectResolve = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-core/lib");
const lib_6 = require("tnp-helpers/lib");
const build_info__auto_generated_1 = require("../../build-info._auto-generated_");
const constants_1 = require("../../constants");
const taon_worker_1 = require("./taon-worker/taon.worker");
//#endregion
// @ts-ignore TODO weird inheritance problem
class TaonProjectResolve extends lib_6.BaseProjectResolver {
    classFn;
    cliToolNameFn;
    taonProjectsWorker;
    hasResolveCoreDepsAndFolder = false;
    //#region constructor
    constructor(classFn, cliToolNameFn) {
        super(classFn, cliToolNameFn);
        this.classFn = classFn;
        this.cliToolNameFn = cliToolNameFn;
        // if (!this.cliToolName) {
        //   Helpers.throwError(`cliToolName is not provided`);
        // }
        if (lib_5.UtilsOs.isRunningInVscodeExtension()) {
            //#region @backend
            lib_1.config.frameworkName = lib_1.config.frameworkName || lib_1.taonPackageName;
            const allTaonContainersCoreContainers = lib_6.Helpers.foldersFrom([lib_5.UtilsOs.getRealHomeDir(), lib_1.dotTaonFolder, lib_1.taonContainers], { recursive: false })
                .map(c => this.From(c))
                .filter(c => c?.typeIs(lib_1.LibTypeEnum.CONTAINER))
                .sort((a, b) => {
                const numA = Number(a.name
                    ?.replace(lib_1.LibTypeEnum.CONTAINER, '')
                    .replace('-', '')
                    .replace('v', '')) || 0;
                const numB = Number(b.name
                    ?.replace(lib_1.LibTypeEnum.CONTAINER, '')
                    .replace('-', '')
                    .replace('v', '')) || 0;
                return numB - numA; // highest numbers first
            });
            const firstContainer = lib_4._.first(allTaonContainersCoreContainers);
            lib_1.config.dirnameForTnp =
                firstContainer?.pathFor(`${constants_1.nodeModulesMainProject}/${lib_1.tnpPackageName}`) || lib_1.config.dirnameForTnp;
            //#endregion
        }
        // TODO $Global not available here
        // const commandStartWorker = `${cliToolName} ${UtilsCliClassMethod.getFrom(
        //   $Global.prototype.startCliServiceTaonProjectsWorker,
        //   { globalMethod: true, argsToParse: { skipCoreCheck: true } },
        // )}`;
        // const commandStartWorker = `${cliToolName} ${
        //   'startCliServiceTaonProjectsWorker ${SKIP_CORE_CHECK_PARAM}'
        //   // as keyof $Global
        // }`;
        this.taonProjectsWorker = new taon_worker_1.TaonProjectsWorker(lib_1.taonProjects, () => `${cliToolNameFn()} ${`startCliServiceTaonProjectsWorker ${constants_1.skipCoreCheck}`
        // as keyof $Global
        }`, this);
    }
    //#endregion
    //#region methods / type from
    typeFrom(location) {
        //#region @backendFunc
        location = (0, lib_4.crossPlatformPath)(location);
        if (!lib_3.fse.existsSync(location)) {
            return void 0;
        }
        const taonJson = lib_6.Helpers.readJsonC([location, constants_1.taonJsonMainProject]);
        if (!lib_4._.isObject(taonJson) || !taonJson.type) {
            return lib_6.Helpers.exists([location, constants_1.packageJsonMainProject])
                ? lib_1.LibTypeEnum.UNKNOWN_NPM_PROJECT
                : lib_1.LibTypeEnum.UNKNOWN;
        }
        const type = taonJson.type;
        return type;
        //#endregion
    }
    //#endregion
    //#region methods / from
    /**
     * TODO use base resolve
     */
    From(locationOfProj) {
        //#region @backendFunc
        if (Array.isArray(locationOfProj)) {
            locationOfProj = locationOfProj.join('/');
        }
        if (!locationOfProj) {
            return;
        }
        let location = locationOfProj.replace(/\/\//g, '/');
        if (!lib_4._.isString(location)) {
            lib_6.Helpers.warn(`[project.from] location is not a string`);
            return;
        }
        if (lib_4.path.basename(location) === constants_1.distMainProject) {
            location = lib_4.path.dirname(location);
        }
        location = (0, lib_4.crossPlatformPath)(lib_4.path.resolve(location));
        if (this.emptyLocations.includes(location)) {
            if (location.search(`/${constants_1.distMainProject}`) === -1) {
                lib_6.Helpers.log(`[project.from] empty location ${location}`, 2);
                return;
            }
        }
        const alreadyExist = this.projects.find(l => l.location.trim() === location.trim());
        if (alreadyExist) {
            return alreadyExist;
        }
        if (!lib_3.fse.existsSync(location)) {
            lib_6.Helpers.log(`[taon/project][project.from] Cannot find project in location: ${location}`, 1);
            this.emptyLocations.push(location);
            return;
        }
        let type = this.typeFrom(location);
        // console.log(`type ${type} for location ${location}`);
        let resultProject;
        if (type === lib_1.LibTypeEnum.ISOMORPHIC_LIB) {
            resultProject = new this.classFn(location);
        }
        if (type === lib_1.LibTypeEnum.CONTAINER) {
            resultProject = new this.classFn(location);
        }
        if (type === lib_1.LibTypeEnum.UNKNOWN_NPM_PROJECT) {
            resultProject = new this.classFn(location);
        }
        return resultProject;
        //#endregion
    }
    //#endregion
    //#region methods / nearest to
    nearestTo(absoluteLocation, options) {
        //#region @backendFunc
        options = options || {};
        const { type, findGitRoot, onlyOutSideNodeModules } = options;
        if (lib_4._.isString(type) && !lib_2.LibTypeArr.includes(type)) {
            lib_6.Helpers.error(`[taon/project][project.nearestTo] wrong type: ${type}`, false, true);
        }
        if (lib_3.fse.existsSync(absoluteLocation)) {
            absoluteLocation = lib_3.fse.realpathSync(absoluteLocation);
        }
        if (lib_3.fse.existsSync(absoluteLocation) &&
            !lib_3.fse.lstatSync(absoluteLocation).isDirectory()) {
            absoluteLocation = lib_4.path.dirname(absoluteLocation);
        }
        let project;
        let previousLocation;
        while (true) {
            if (onlyOutSideNodeModules &&
                lib_4.path.basename(lib_4.path.dirname(absoluteLocation)) === constants_1.nodeModulesMainProject) {
                absoluteLocation = lib_4.path.dirname(lib_4.path.dirname(absoluteLocation));
            }
            project = this.From(absoluteLocation);
            if (lib_4._.isString(type)) {
                if (project?.typeIs(type)) {
                    if (findGitRoot) {
                        if (project.git.isGitRoot) {
                            break;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                if (project) {
                    if (findGitRoot) {
                        if (project.git.isGitRoot) {
                            break;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            previousLocation = absoluteLocation;
            const newAbsLocation = lib_4.path.join(absoluteLocation, '..');
            if (!lib_4.path.isAbsolute(newAbsLocation)) {
                return;
            }
            absoluteLocation = (0, lib_4.crossPlatformPath)(lib_4.path.resolve(newAbsLocation));
            if (!lib_3.fse.existsSync(absoluteLocation) &&
                absoluteLocation.split('/').length < 2) {
                return;
            }
            if (previousLocation === absoluteLocation) {
                return;
            }
        }
        return project;
        //#endregion
    }
    //#endregion
    //#region methods / tnp
    get Tnp() {
        //#region @backendFunc
        let tnpProject = this.From(lib_1.config.dirnameForTnp);
        lib_6.Helpers.log(`Using ${lib_1.config.frameworkName} path: ${lib_1.config.dirnameForTnp}`, 1);
        if (!tnpProject && !global.globalSystemToolMode) {
            lib_6.Helpers.error(`Not able to find tnp project in "${lib_1.config.dirnameForTnp}".`);
        }
        return tnpProject;
        //#endregion
    }
    //#endregion
    //#region by
    by(libraryType, 
    //#region @backend
    version = constants_1.DEFAULT_FRAMEWORK_VERSION) {
        //#region @backendFunc
        // console.log({ libraryType, version });
        if (libraryType === lib_1.LibTypeEnum.CONTAINER) {
            const pathToContainer = this.resolveCoreProjectsPathes(version).container;
            // console.log({ pathToContainer });
            const containerProject = this.From(pathToContainer);
            return containerProject;
        }
        if (libraryType !== lib_1.LibTypeEnum.ISOMORPHIC_LIB) {
            return void 0;
        }
        const projectPath = this.resolveCoreProjectsPathes(version).projectByType(libraryType);
        // console.log({ projectPath });
        if (!lib_3.fse.existsSync(projectPath)) {
            lib_6.Helpers.error(`
    path: ${(0, lib_4.crossPlatformPath)(projectPath)}
    config.dirnameForTnp: ${lib_1.config.dirnameForTnp}

     [taon/project] Bad library type "${libraryType}" for this framework version "${version}"

     `, false, false);
        }
        return this.From(projectPath);
        //#endregion
    }
    //#endregion
    //#region projects in user folder
    get projectsInUserFolder() {
        //#region @backendFunc
        const projectsInUserFolder = (0, lib_4.crossPlatformPath)([
            lib_5.UtilsOs.getRealHomeDir(),
            lib_1.dotTaonFolder,
            lib_1.taonContainers,
        ]);
        return projectsInUserFolder;
        //#endregion
    }
    //#endregion
    //#region sync core project
    /**
     * taon sync command
     */
    sync({ syncFromCommand } = {}) {
        //#region @backendFunc
        const cwd = constants_1.taonRepoPathUserInUserDir;
        const oldTaonFolder = (0, lib_4.crossPlatformPath)([
            lib_4.path.dirname(constants_1.taonRepoPathUserInUserDir),
            lib_1.taonPackageName,
        ]);
        if (lib_6.Helpers.exists(oldTaonFolder)) {
            lib_6.Helpers.taskStarted(`Removing old taon folder: ${oldTaonFolder}`);
            lib_6.Helpers.removeSymlinks(oldTaonFolder);
            lib_6.Helpers.remove(oldTaonFolder);
            lib_6.Helpers.taskDone('Old taon folder removed');
        }
        lib_6.Helpers.info(`Syncing... Fetching git data... `);
        lib_5.CLI.installEnvironment(lib_3.requiredForDev);
        //#region reset origin of taon repo
        try {
            // ! TODO this can cause error when (link is committed in git repo)
            // $ git clean -df or git reset --hard
            //warning: could not open directory 'projects/container-v18/isomorphic-lib
            // -v18/docs-config.schema.json/': Function not implemented
            // this may be temporary
            lib_6.Helpers.run(`git reset --hard && git clean -df && git fetch`, {
                cwd,
                output: false,
            }).sync();
        }
        catch (error) {
            lib_6.Helpers.error(`[${lib_1.config.frameworkName} Not able to reset origin of taon repo: ${lib_1.urlRepoTaonContainers} in: ${cwd}`, false, true);
        }
        //#endregion
        //#region checkout master
        try {
            lib_6.Helpers.run(`git checkout master`, { cwd, output: false }).sync();
            lib_6.Helpers.log('DONE CHECKING OUT MASTER');
        }
        catch (error) {
            lib_6.Helpers.log(error);
            lib_6.Helpers.error(`[${lib_1.config.frameworkName} Not able to checkout master branch for :${lib_1.urlRepoTaonContainers} in: ${cwd}`, false, true);
        }
        //#endregion
        //#region pull master with tags
        try {
            lib_6.HelpersTaon.git.meltActionCommits(cwd);
        }
        catch (error) { }
        try {
            lib_6.Helpers.run(`git reset --hard HEAD~2 && git reset --hard && git clean -df && git pull --tags origin master`, { cwd, output: false }).sync();
            lib_6.Helpers.log('DONE PULLING MASTER');
        }
        catch (error) {
            lib_6.Helpers.log(error);
            lib_6.Helpers.error(`[${lib_1.config.frameworkName} Not able to pull master branch for :` +
                `${lib_1.urlRepoTaonContainers} in: ${(0, lib_4.crossPlatformPath)(cwd)}`, false, true);
        }
        try {
            lib_6.HelpersTaon.git.meltActionCommits(cwd);
        }
        catch (error) { }
        try {
            lib_6.Helpers.run(`git reset --hard`, { cwd, output: false }).sync();
        }
        catch (error) { }
        //#endregion
        //#region checkout lastest tag
        // TODO remove ? taon-containers gonna be constantly update and
        // no need for checking out specific tag
        const tagToCheckout = this.taonTagToCheckoutForCurrentCliVersion(cwd);
        const currentBranch = lib_6.HelpersTaon.git.currentBranchName(cwd);
        lib_6.Helpers.taskStarted(`Checking out latest tag ${tagToCheckout} for taon framework...`);
        if (currentBranch !== tagToCheckout) {
            try {
                lib_6.Helpers.run(`git reset --hard && git clean -df && git checkout ${tagToCheckout}`, { cwd }).sync();
            }
            catch (error) {
                console.log(error);
                lib_6.Helpers.warn(`[${lib_1.config.frameworkName} ERROR Not able to checkout latest tag of taon framework: ${lib_1.urlRepoTaonContainers} in: ${cwd}`, false);
            }
        }
        //#endregion
        //#region pull latest tag
        try {
            lib_6.Helpers.run(`git pull origin ${tagToCheckout}`, { cwd }).sync();
        }
        catch (error) {
            console.log(error);
            lib_6.Helpers.warn(`[${lib_1.config.frameworkName}] ERROR Not able to pull latest tag of taon framework: ${lib_1.urlRepoTaonContainers} in: ${cwd}`, false);
        }
        //#endregion
        //#region remove vscode folder
        try {
            lib_6.Helpers.run(`rimraf ${constants_1.dotVscodeMainProject}`, { cwd }).sync();
        }
        catch (error) { }
        //#endregion
        if (syncFromCommand) {
            // const command =
            //   `${config.frameworkName} ` +
            //   `${UtilsCliClassMethod.getFrom(
            //     $Global.prototype.reinstallCoreContainers,
            //     { globalMethod: true, argsToParse: { skipCoreCheck: true } },
            //   )}`;
            // Helpers.run(command).sync();
            lib_6.Helpers.run(
            // $Global.prototype.reinstallCoreContainers.name
            `${lib_1.config.frameworkName} ${'reinstallCoreContainers'} ${constants_1.skipCoreCheck}`).sync();
        }
        lib_6.Helpers.success('taon framework synced ok');
        //#endregion
    }
    //#endregion
    //#region initial check
    initialCheck() {
        //#region @backendFunc
        if (this.hasResolveCoreDepsAndFolder) {
            return;
        }
        const morhiVscode = (0, lib_4.crossPlatformPath)([
            lib_4.path.dirname(constants_1.taonRepoPathUserInUserDir),
            `${lib_1.taonProjects}/${constants_1.dotVscodeMainProject}`,
        ]);
        if (!lib_3.fse.existsSync(constants_1.taonRepoPathUserInUserDir) && !global.skipCoreCheck) {
            if (!lib_3.fse.existsSync(lib_4.path.dirname(constants_1.taonRepoPathUserInUserDir))) {
                lib_3.fse.mkdirpSync(lib_4.path.dirname(constants_1.taonRepoPathUserInUserDir));
            }
            lib_5.CLI.installEnvironment(lib_3.requiredForDev);
            // const commandEnvInstall = `${config.frameworkName} ${UtilsCliClassMethod.getFrom(
            //   $Global.prototype.ENV_INSTALL,
            //   {
            //     globalMethod: true,
            //     argsToParse: { skipCoreCheck: true },
            //   },
            // )}`;
            // child_process.execSync(commandEnvInstall, { stdio: [0, 1, 2] });
            try {
                lib_3.child_process.execSync(
                //$Global.prototype.ENV_INSTALL.name
                `${lib_1.config.frameworkName}  ${'ENV_INSTALL'} ${constants_1.skipCoreCheck}`, { stdio: [0, 1, 2] });
            }
            catch (error) {
                lib_6.Helpers.error(`[${lib_1.config.frameworkName}][config] Not able to install local global environment`, false, true);
            }
            try {
                lib_3.child_process.execSync(`git clone ${lib_1.urlRepoTaonContainers}`, {
                    cwd: lib_4.path.dirname(constants_1.taonRepoPathUserInUserDir),
                    stdio: [0, 1, 2],
                });
                lib_6.Helpers.remove(morhiVscode);
            }
            catch (error) {
                lib_6.Helpers.error(`[${lib_1.config.frameworkName}][config] Not able to clone repository: ${lib_1.urlRepoTaonContainers} in:
       ${constants_1.taonRepoPathUserInUserDir}`, false, true);
            }
            this.sync();
            this.hasResolveCoreDepsAndFolder = true;
        }
        //#endregion
    }
    //#endregion
    //#region path resolved
    pathResolved(...partOfPath) {
        //#region @backendFunc
        // console.log('pathResolved', partOfPath);
        if ((global['frameworkName'] &&
            global['frameworkName'] === lib_1.taonPackageName) ||
            lib_5.UtilsOs.isRunningInVscodeExtension()) {
            const joined = partOfPath.join('/');
            let pathResult = joined.replace(lib_1.config.dirnameForTnp + '/' + this.taonProjectsRelative, this.projectsInUserFolder);
            pathResult = (0, lib_4.crossPlatformPath)(lib_4.path.resolve(pathResult));
            this.initialCheck();
            return pathResult;
        }
        return (0, lib_4.crossPlatformPath)(lib_4.path.resolve(lib_4.path.join(...partOfPath)));
        //#endregion
    }
    //#endregion
    //#region resolve core projects paths
    resolveCoreProjectsPathes(version) {
        //#region @backendFunc
        if (Number(version.replace('v', '')) < 18) {
            lib_6.Helpers.warn(`[taon/project] ${version} is not supported anymore.. use v19 instead`);
        }
        version = !version || version === 'v1' ? '' : version;
        // console.log(({ dirnameForTnp: config.dirnameForTnp, taonProjectsRelative: this.taonProjectsRelative, version }));
        const coreContainerPath = this.pathResolved(lib_1.config.dirnameForTnp, `${this.taonProjectsRelative}/${constants_1.containerPrefix}${version}`);
        const result = {
            container: coreContainerPath,
            projectByType: (libType) => {
                const resultByType = this.pathResolved(lib_1.config.dirnameForTnp, `${this.taonProjectsRelative}/${constants_1.containerPrefix}${version}/${libType}-${version}`);
                // console.log(`resultByType ${libType}`, resultByType);
                return resultByType;
            },
        };
        return result;
        //#endregion
    }
    //#endregion
    //#region taon relative projects paths
    /**
     * only for tnp dev mode cli
     */
    get taonProjectsRelative() {
        return `../${lib_1.taonContainers}`;
    }
    //#endregion
    //#region angular major version for current cli
    angularMajorVersionForCurrentCli() {
        //#region @backendFunc
        return Number(build_info__auto_generated_1.CURRENT_PACKAGE_VERSION.split('.')[0]);
        //#endregion
    }
    //#endregion
    //#region taon tag to checkout for current cli version
    taonTagToCheckoutForCurrentCliVersion(cwd) {
        //#region @backendFunc
        const ngVer = this.angularMajorVersionForCurrentCli();
        const lastTagForVer = this.From(cwd).git.lastTagNameForMajorVersion(ngVer);
        return lastTagForVer;
        //#endregion
    }
}
exports.TaonProjectResolve = TaonProjectResolve;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/project-resolve.js.map