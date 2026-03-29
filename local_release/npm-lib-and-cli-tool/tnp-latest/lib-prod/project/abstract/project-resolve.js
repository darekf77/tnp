//#region imports
import { config, dotTaonFolder, LibTypeEnum, taonContainers, taonPackageName, taonProjects, tnpPackageName, urlRepoTaonContainers, } from 'tnp-core/lib-prod';
import { LibTypeArr } from 'tnp-core/lib-prod';
import { child_process, fse, requiredForDev } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, ___NS__first, ___NS__isObject, ___NS__isString } from 'tnp-core/lib-prod';
import { CLI, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isRunningInVscodeExtension } from 'tnp-core/lib-prod';
import { BaseProjectResolver, Helpers__NS__error, Helpers__NS__exists, Helpers__NS__foldersFrom, Helpers__NS__info, Helpers__NS__log, Helpers__NS__readJsonC, Helpers__NS__remove, Helpers__NS__removeSymlinks, Helpers__NS__run, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__warn, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__meltActionCommits } from 'tnp-helpers/lib-prod';
import { CURRENT_PACKAGE_VERSION } from '../../build-info._auto-generated_';
import { containerPrefix, DEFAULT_FRAMEWORK_VERSION, distMainProject, dotVscodeMainProject, nodeModulesMainProject, packageJsonMainProject, skipCoreCheck, taonJsonMainProject, taonRepoPathUserInUserDir, } from '../../constants';
import { TaonProjectsWorker } from './taon-worker/taon.worker';
//#endregion
// @ts-ignore TODO weird inheritance problem
export class TaonProjectResolve extends BaseProjectResolver {
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
        //   Helpers__NS__throwError(`cliToolName is not provided`);
        // }
        if (UtilsOs__NS__isRunningInVscodeExtension()) {
            //#region @backend
            config.frameworkName = config.frameworkName || taonPackageName;
            const allTaonContainersCoreContainers = Helpers__NS__foldersFrom([UtilsOs__NS__getRealHomeDir(), dotTaonFolder, taonContainers], { recursive: false })
                .map(c => this.From(c))
                .filter(c => c?.typeIs(LibTypeEnum.CONTAINER))
                .sort((a, b) => {
                const numA = Number(a.name
                    ?.replace(LibTypeEnum.CONTAINER, '')
                    .replace('-', '')
                    .replace('v', '')) || 0;
                const numB = Number(b.name
                    ?.replace(LibTypeEnum.CONTAINER, '')
                    .replace('-', '')
                    .replace('v', '')) || 0;
                return numB - numA; // highest numbers first
            });
            const firstContainer = ___NS__first(allTaonContainersCoreContainers);
            config.dirnameForTnp =
                firstContainer?.pathFor(`${nodeModulesMainProject}/${tnpPackageName}`) || config.dirnameForTnp;
            //#endregion
        }
        // TODO $Global not available here
        // const commandStartWorker = `${cliToolName} ${UtilsCliClassMethod__NS__getFrom(
        //   $Global.prototype.startCliServiceTaonProjectsWorker,
        //   { globalMethod: true, argsToParse: { skipCoreCheck: true } },
        // )}`;
        // const commandStartWorker = `${cliToolName} ${
        //   'startCliServiceTaonProjectsWorker ${SKIP_CORE_CHECK_PARAM}'
        //   // as keyof $Global
        // }`;
        this.taonProjectsWorker = new TaonProjectsWorker(taonProjects, () => `${cliToolNameFn()} ${`startCliServiceTaonProjectsWorker ${skipCoreCheck}`
        // as keyof $Global
        }`, this);
    }
    //#endregion
    //#region methods / type from
    typeFrom(location) {
        //#region @backendFunc
        location = crossPlatformPath(location);
        if (!fse.existsSync(location)) {
            return void 0;
        }
        const taonJson = Helpers__NS__readJsonC([location, taonJsonMainProject]);
        if (!___NS__isObject(taonJson) || !taonJson.type) {
            return Helpers__NS__exists([location, packageJsonMainProject])
                ? LibTypeEnum.UNKNOWN_NPM_PROJECT
                : LibTypeEnum.UNKNOWN;
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
        if (!___NS__isString(location)) {
            Helpers__NS__warn(`[project.from] location is not a string`);
            return;
        }
        if (path.basename(location) === distMainProject) {
            location = path.dirname(location);
        }
        location = crossPlatformPath(path.resolve(location));
        if (this.emptyLocations.includes(location)) {
            if (location.search(`/${distMainProject}`) === -1) {
                Helpers__NS__log(`[project.from] empty location ${location}`, 2);
                return;
            }
        }
        const alreadyExist = this.projects.find(l => l.location.trim() === location.trim());
        if (alreadyExist) {
            return alreadyExist;
        }
        if (!fse.existsSync(location)) {
            Helpers__NS__log(`[taon/project][project.from] Cannot find project in location: ${location}`, 1);
            this.emptyLocations.push(location);
            return;
        }
        let type = this.typeFrom(location);
        // console.log(`type ${type} for location ${location}`);
        let resultProject;
        if (type === LibTypeEnum.ISOMORPHIC_LIB) {
            resultProject = new this.classFn(location);
        }
        if (type === LibTypeEnum.CONTAINER) {
            resultProject = new this.classFn(location);
        }
        if (type === LibTypeEnum.UNKNOWN_NPM_PROJECT) {
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
        if (___NS__isString(type) && !LibTypeArr.includes(type)) {
            Helpers__NS__error(`[taon/project][project.nearestTo] wrong type: ${type}`, false, true);
        }
        if (fse.existsSync(absoluteLocation)) {
            absoluteLocation = fse.realpathSync(absoluteLocation);
        }
        if (fse.existsSync(absoluteLocation) &&
            !fse.lstatSync(absoluteLocation).isDirectory()) {
            absoluteLocation = path.dirname(absoluteLocation);
        }
        let project;
        let previousLocation;
        while (true) {
            if (onlyOutSideNodeModules &&
                path.basename(path.dirname(absoluteLocation)) === nodeModulesMainProject) {
                absoluteLocation = path.dirname(path.dirname(absoluteLocation));
            }
            project = this.From(absoluteLocation);
            if (___NS__isString(type)) {
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
            const newAbsLocation = path.join(absoluteLocation, '..');
            if (!path.isAbsolute(newAbsLocation)) {
                return;
            }
            absoluteLocation = crossPlatformPath(path.resolve(newAbsLocation));
            if (!fse.existsSync(absoluteLocation) &&
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
        let tnpProject = this.From(config.dirnameForTnp);
        Helpers__NS__log(`Using ${config.frameworkName} path: ${config.dirnameForTnp}`, 1);
        if (!tnpProject && !global.globalSystemToolMode) {
            Helpers__NS__error(`Not able to find tnp project in "${config.dirnameForTnp}".`);
        }
        return tnpProject;
        //#endregion
    }
    //#endregion
    //#region by
    by(libraryType, 
    //#region @backend
    version = DEFAULT_FRAMEWORK_VERSION) {
        //#region @backendFunc
        // console.log({ libraryType, version });
        if (libraryType === LibTypeEnum.CONTAINER) {
            const pathToContainer = this.resolveCoreProjectsPathes(version).container;
            // console.log({ pathToContainer });
            const containerProject = this.From(pathToContainer);
            return containerProject;
        }
        if (libraryType !== LibTypeEnum.ISOMORPHIC_LIB) {
            return void 0;
        }
        const projectPath = this.resolveCoreProjectsPathes(version).projectByType(libraryType);
        // console.log({ projectPath });
        if (!fse.existsSync(projectPath)) {
            Helpers__NS__error(`
    path: ${crossPlatformPath(projectPath)}
    config.dirnameForTnp: ${config.dirnameForTnp}

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
        const projectsInUserFolder = crossPlatformPath([
            UtilsOs__NS__getRealHomeDir(),
            dotTaonFolder,
            taonContainers,
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
        const cwd = taonRepoPathUserInUserDir;
        const oldTaonFolder = crossPlatformPath([
            path.dirname(taonRepoPathUserInUserDir),
            taonPackageName,
        ]);
        if (Helpers__NS__exists(oldTaonFolder)) {
            Helpers__NS__taskStarted(`Removing old taon folder: ${oldTaonFolder}`);
            Helpers__NS__removeSymlinks(oldTaonFolder);
            Helpers__NS__remove(oldTaonFolder);
            Helpers__NS__taskDone('Old taon folder removed');
        }
        Helpers__NS__info(`Syncing... Fetching git data... `);
        CLI.installEnvironment(requiredForDev);
        //#region reset origin of taon repo
        try {
            // ! TODO this can cause error when (link is committed in git repo)
            // $ git clean -df or git reset --hard
            //warning: could not open directory 'projects/container-v18/isomorphic-lib
            // -v18/docs-config.schema.json/': Function not implemented
            // this may be temporary
            Helpers__NS__run(`git reset --hard && git clean -df && git fetch`, {
                cwd,
                output: false,
            }).sync();
        }
        catch (error) {
            Helpers__NS__error(`[${config.frameworkName} Not able to reset origin of taon repo: ${urlRepoTaonContainers} in: ${cwd}`, false, true);
        }
        //#endregion
        //#region checkout master
        try {
            Helpers__NS__run(`git checkout master`, { cwd, output: false }).sync();
            Helpers__NS__log('DONE CHECKING OUT MASTER');
        }
        catch (error) {
            Helpers__NS__log(error);
            Helpers__NS__error(`[${config.frameworkName} Not able to checkout master branch for :${urlRepoTaonContainers} in: ${cwd}`, false, true);
        }
        //#endregion
        //#region pull master with tags
        try {
            HelpersTaon__NS__git__NS__meltActionCommits(cwd);
        }
        catch (error) { }
        try {
            Helpers__NS__run(`git reset --hard HEAD~2 && git reset --hard && git clean -df && git pull --tags origin master`, { cwd, output: false }).sync();
            Helpers__NS__log('DONE PULLING MASTER');
        }
        catch (error) {
            Helpers__NS__log(error);
            Helpers__NS__error(`[${config.frameworkName} Not able to pull master branch for :` +
                `${urlRepoTaonContainers} in: ${crossPlatformPath(cwd)}`, false, true);
        }
        try {
            HelpersTaon__NS__git__NS__meltActionCommits(cwd);
        }
        catch (error) { }
        try {
            Helpers__NS__run(`git reset --hard`, { cwd, output: false }).sync();
        }
        catch (error) { }
        //#endregion
        //#region checkout lastest tag
        // TODO remove ? taon-containers gonna be constantly update and
        // no need for checking out specific tag
        const tagToCheckout = this.taonTagToCheckoutForCurrentCliVersion(cwd);
        const currentBranch = HelpersTaon__NS__git__NS__currentBranchName(cwd);
        Helpers__NS__taskStarted(`Checking out latest tag ${tagToCheckout} for taon framework...`);
        if (currentBranch !== tagToCheckout) {
            try {
                Helpers__NS__run(`git reset --hard && git clean -df && git checkout ${tagToCheckout}`, { cwd }).sync();
            }
            catch (error) {
                console.log(error);
                Helpers__NS__warn(`[${config.frameworkName} ERROR Not able to checkout latest tag of taon framework: ${urlRepoTaonContainers} in: ${cwd}`, false);
            }
        }
        //#endregion
        //#region pull latest tag
        try {
            Helpers__NS__run(`git pull origin ${tagToCheckout}`, { cwd }).sync();
        }
        catch (error) {
            console.log(error);
            Helpers__NS__warn(`[${config.frameworkName}] ERROR Not able to pull latest tag of taon framework: ${urlRepoTaonContainers} in: ${cwd}`, false);
        }
        //#endregion
        //#region remove vscode folder
        try {
            Helpers__NS__run(`rimraf ${dotVscodeMainProject}`, { cwd }).sync();
        }
        catch (error) { }
        //#endregion
        if (syncFromCommand) {
            // const command =
            //   `${config.frameworkName} ` +
            //   `${UtilsCliClassMethod__NS__getFrom(
            //     $Global.prototype.reinstallCoreContainers,
            //     { globalMethod: true, argsToParse: { skipCoreCheck: true } },
            //   )}`;
            // Helpers__NS__run(command).sync();
            Helpers__NS__run(
            // $Global.prototype.reinstallCoreContainers.name
            `${config.frameworkName} ${'reinstallCoreContainers'} ${skipCoreCheck}`).sync();
        }
        Helpers__NS__success('taon framework synced ok');
        //#endregion
    }
    //#endregion
    //#region initial check
    initialCheck() {
        //#region @backendFunc
        if (this.hasResolveCoreDepsAndFolder) {
            return;
        }
        const morhiVscode = crossPlatformPath([
            path.dirname(taonRepoPathUserInUserDir),
            `${taonProjects}/${dotVscodeMainProject}`,
        ]);
        if (!fse.existsSync(taonRepoPathUserInUserDir) && !global.skipCoreCheck) {
            if (!fse.existsSync(path.dirname(taonRepoPathUserInUserDir))) {
                fse.mkdirpSync(path.dirname(taonRepoPathUserInUserDir));
            }
            CLI.installEnvironment(requiredForDev);
            // const commandEnvInstall = `${config.frameworkName} ${UtilsCliClassMethod__NS__getFrom(
            //   $Global.prototype.ENV_INSTALL,
            //   {
            //     globalMethod: true,
            //     argsToParse: { skipCoreCheck: true },
            //   },
            // )}`;
            // child_process.execSync(commandEnvInstall, { stdio: [0, 1, 2] });
            try {
                child_process.execSync(
                //$Global.prototype.ENV_INSTALL.name
                `${config.frameworkName}  ${'ENV_INSTALL'} ${skipCoreCheck}`, { stdio: [0, 1, 2] });
            }
            catch (error) {
                Helpers__NS__error(`[${config.frameworkName}][config] Not able to install local global environment`, false, true);
            }
            try {
                child_process.execSync(`git clone ${urlRepoTaonContainers}`, {
                    cwd: path.dirname(taonRepoPathUserInUserDir),
                    stdio: [0, 1, 2],
                });
                Helpers__NS__remove(morhiVscode);
            }
            catch (error) {
                Helpers__NS__error(`[${config.frameworkName}][config] Not able to clone repository: ${urlRepoTaonContainers} in:
       ${taonRepoPathUserInUserDir}`, false, true);
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
            global['frameworkName'] === taonPackageName) ||
            UtilsOs__NS__isRunningInVscodeExtension()) {
            const joined = partOfPath.join('/');
            let pathResult = joined.replace(config.dirnameForTnp + '/' + this.taonProjectsRelative, this.projectsInUserFolder);
            pathResult = crossPlatformPath(path.resolve(pathResult));
            this.initialCheck();
            return pathResult;
        }
        return crossPlatformPath(path.resolve(path.join(...partOfPath)));
        //#endregion
    }
    //#endregion
    //#region resolve core projects paths
    resolveCoreProjectsPathes(version) {
        //#region @backendFunc
        if (Number(version.replace('v', '')) < 18) {
            Helpers__NS__warn(`[taon/project] ${version} is not supported anymore.. use v19 instead`);
        }
        version = !version || version === 'v1' ? '' : version;
        // console.log(({ dirnameForTnp: config.dirnameForTnp, taonProjectsRelative: this.taonProjectsRelative, version }));
        const coreContainerPath = this.pathResolved(config.dirnameForTnp, `${this.taonProjectsRelative}/${containerPrefix}${version}`);
        const result = {
            container: coreContainerPath,
            projectByType: (libType) => {
                const resultByType = this.pathResolved(config.dirnameForTnp, `${this.taonProjectsRelative}/${containerPrefix}${version}/${libType}-${version}`);
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
        return `../${taonContainers}`;
    }
    //#endregion
    //#region angular major version for current cli
    angularMajorVersionForCurrentCli() {
        //#region @backendFunc
        return Number(CURRENT_PACKAGE_VERSION.split('.')[0]);
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/project-resolve.js.map