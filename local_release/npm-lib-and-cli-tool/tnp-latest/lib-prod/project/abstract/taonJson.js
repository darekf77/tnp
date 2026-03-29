import { walk } from 'lodash-walk-object/lib-prod';
import { crossPlatformPath, fileName, LibTypeEnum, UtilsJson__NS__getAtrributiesFromJsonWithComments } from 'tnp-core/lib-prod';
import { os } from 'tnp-core/lib-prod';
import { ___NS__cloneDeep, ___NS__isArray, ___NS__isFunction, ___NS__isNil, ___NS__isObject, ___NS__isString, ___NS__isUndefined, ___NS__set, ___NS__startCase, Helpers__NS__clearConsole, Helpers__NS__createSymLink, Helpers__NS__exists, Helpers__NS__info, Helpers__NS__log, Helpers__NS__readJson5, Helpers__NS__removeFileIfExists, Helpers__NS__taskDone, Helpers__NS__taskStarted } from 'tnp-core/lib-prod';
import { Utils__NS__sortKeys, Utils__NS__uniqArray } from 'tnp-core/lib-prod';
import { BaseFeatureForProject, BasePackageJson, UtilsNpm__NS__getLatestVersionFromNpm } from 'tnp-helpers/lib-prod';
import { OVERRIDE_FROM_TNP, packageJsonMainProject, scriptsCommands, taonJsonMainProject, } from '../../constants';
import { EnvOptions } from '../../options';
// @ts-ignore TODO weird inheritance problem
export class TaonJson extends BaseFeatureForProject {
    data;
    /**
     * package.json override
     */
    overridePackageJsonManager;
    get path() {
        return this.project.pathFor(fileName.taon_jsonc);
    }
    //#region constructor
    //#region @backend
    constructor(project, defaultValue) {
        super(project);
        this.data = Helpers__NS__readJson5([project.pathFor(taonJsonMainProject)]);
        if (!this.data && defaultValue) {
            this.data = ___NS__cloneDeep(defaultValue);
        }
        this.overridePackageJsonManager = new BasePackageJson({
            jsonContent: this.data.packageJsonOverride || {},
            reloadInMemoryCallback: data => {
                if (this.data && this.overridePackageJsonManager) {
                    this.data.packageJsonOverride = data;
                    this.saveToDisk();
                }
            },
        });
    }
    //#endregion
    //#endregion
    //#region reload from disk
    /**
     * ! TODO EXPERMIENTAL
     * @deprecated
     */
    reloadFromDisk() {
        //#region @backendFunc
        const newData = Helpers__NS__readJson5([this.project.pathFor(taonJsonMainProject)]) ||
            this.data;
        walk.Object(newData, (value, lodashPath) => {
            if (___NS__isNil(value) || ___NS__isFunction(value) || ___NS__isObject(value)) {
                // skipping
            }
            else {
                ___NS__set(this.data, lodashPath, value);
            }
        }, { walkGetters: false });
        //#endregion
    }
    //#endregion
    //#region exists
    get exists() {
        return Helpers__NS__exists(this.project.pathFor(taonJsonMainProject));
    }
    //#endregion
    //#region save
    preserveOldTaonProps() {
        if (this.project.framework.isContainer &&
            this.project.framework.isCoreProject) {
            return;
        }
        const data = this.data;
        if (data.overrided?.includeOnly && !data.dependenciesNamesForNpmLib) {
            data.dependenciesNamesForNpmLib = ___NS__cloneDeep(data.overrided.includeOnly);
            delete data.overrided.includeOnly;
        }
        if (this.project.framework.isStandaloneProject) {
            const dataToClean = this.data;
            delete dataToClean.monorepo;
            delete dataToClean['smart'];
            delete dataToClean['smartContainerBuildTarget'];
        }
        for (const prop of [
            ...OVERRIDE_FROM_TNP,
            'overrided',
            'required',
            'requiredServers',
            'main',
            'useFramework',
            'isGenerated',
            'workerPlugins',
            'smartContainerTarget',
            'libReleaseOptions',
            'linkedRepos',
        ]) {
            delete data[prop];
        }
        if (!this.appId) {
            const mainConfig = EnvOptions.from(this.project.environmentConfig.getEnvMain());
            this.appId = Utils__NS__uniqArray((`${mainConfig.website.domain
                .replace(this.project.nameForNpmPackage, '')
                .replace(this.project.name, '')
                .split('.')
                .reverse()
                .join('.')}` +
                `.${this.project.nameForNpmPackage
                    .replace(/\@/g, '')
                    .replace(/\//g, '.')}`).split('.')).join('.');
        }
        this.saveToDisk('preserve old taon props');
    }
    preservePropsFromPackageJson() {
        if (this.project.framework.isContainer &&
            this.project.framework.isCoreProject) {
            return;
        }
        const exitedPackageJson = this.project.packageJson.getAllData() || {};
        const packageJsonOverrideData = this.overridePackageJsonManager.getAllData() || {};
        const lastBuildTagHash = this.overridePackageJsonManager.getBuildHash();
        for (const prop of OVERRIDE_FROM_TNP) {
            if (___NS__isUndefined(packageJsonOverrideData[prop]) &&
                !___NS__isUndefined(exitedPackageJson[prop])) {
                packageJsonOverrideData[prop] = exitedPackageJson[prop];
            }
        }
        this.overridePackageJsonManager.setAllData({
            ...packageJsonOverrideData,
            lastBuildTagHash,
        });
    }
    saveToDisk(purpose) {
        //#region @backend
        Helpers__NS__log(`Saving taon.jsonc ${purpose ? `(${purpose})` : ''}`);
        if (this.isCoreProject && this.project.framework.isContainer) {
            this.project.writeJsonC(taonJsonMainProject, this.data);
        }
        else {
            const sorted = Utils__NS__sortKeys(___NS__cloneDeep(this.data));
            const packageJsonOverride = sorted.packageJsonOverride || {};
            if (!packageJsonOverride.author) {
                packageJsonOverride.author = ___NS__startCase(os.userInfo().username);
            }
            if (!packageJsonOverride.description) {
                packageJsonOverride.description = `Description for ${this.project.name}. Hello world!`;
            }
            delete sorted.packageJsonOverride;
            const showFirst = ['type', 'version', 'dependenciesNamesForNpmLib'];
            for (const key of showFirst) {
                delete sorted[key];
            }
            const destinationObject = {
                ...showFirst.reduce((acc, key) => {
                    acc[key] = this.data[key];
                    return acc;
                }, {}),
                ...sorted,
                packageJsonOverride,
            };
            scriptsCommands.forEach(command => {
                delete ((destinationObject.packageJsonOverride || {}).scripts || {})[command];
            });
            this.project.writeJsonC(taonJsonMainProject, destinationObject);
        }
        this.project.packageJson.saveToDisk();
        //#endregion
    }
    //#endregion
    //#region type
    get type() {
        const res = this.data?.type;
        if (___NS__isString(res)) {
            return res;
        }
        if (this.project.hasFile(packageJsonMainProject)) {
            return LibTypeEnum.UNKNOWN_NPM_PROJECT;
        }
        return LibTypeEnum.UNKNOWN;
    }
    //#endregion
    //#region resources
    /**
     * Resource to include in npm lib
     * (relative paths to files or folders)
     */
    get resources() {
        //#region @backendFunc
        return this.data?.resources || [];
        //#endregion
    }
    //#endregion
    //#region base content url
    /**
     * Base url for content (docs, md files etc.)
     * Required if README.md has relative pathes to links
     */
    get baseContentUrl() {
        //#region @backendFunc
        return this.data?.baseContentUrl;
        //#endregion
    }
    //#endregion
    //#region base images url
    /**
     * Base url for content (docs, md files etc.)
     * Required if README.md has relative pathes to images
     */
    get baseImagesUrl() {
        //#region @backendFunc
        return this.data?.baseImagesUrl;
        //#endregion
    }
    //#endregion
    //#region store generated assets in repo
    get storeGeneratedAssetsInRepository() {
        //#region @backendFunc
        return !!this.data
            ?.storeGeneratedAssetsInRepository;
        //#endregion
    }
    //#endregion
    //#region store local release files in repo
    get storeLocalReleaseFilesInRepository() {
        //#region @backendFunc
        return !!this.data
            ?.storeLocalReleaseFilesInRepository;
        //#endregion
    }
    //#endregion
    //#region dependencies names for npm lib
    /**
     * Dependencies for npm lib (non isomorphic)
     */
    get dependenciesNamesForNpmLib() {
        //#region @backendFunc
        let res = this.data
            ?.dependenciesNamesForNpmLib;
        if (!___NS__isArray(res)) {
            return this.data.overrided?.includeOnly || [];
        }
        return res || [];
        //#endregion
    }
    //#endregion
    //#region override packages order
    get overridePackagesOrder() {
        //#region @backendFunc
        let res = this.data?.overridePackagesOrder;
        return res || [];
        //#endregion
    }
    //#endregion
    setDependenciesNamesForNpmLib(dependencies) {
        //#region @backendFunc
        const data = this.data;
        data.dependenciesNamesForNpmLib = dependencies;
        this.saveToDisk('updating dependencies for npm lib');
        //#endregion
    }
    //#region isomorphic dependencies names for npm lib
    /**
     * External isomorphic dependencies for npm lib
     * (build-in/core taon isomorphic packages will not be here)
     */
    get isomorphicDependenciesForNpmLib() {
        //#region @backendFunc
        let res = this.data
            ?.isomorphicDependenciesForNpmLib;
        return res || [];
        //#endregion
    }
    //#endregion
    //#region set isomorphic dependencies for npm lib
    setIsomorphicDependenciesForNpmLib(dependencies) {
        //#region @backendFunc
        const data = this.data;
        data.isomorphicDependenciesForNpmLib = dependencies;
        this.saveToDisk('updating isomorphic dependencies for npm lib');
        //#endregion
    }
    //#endregion
    //#region additional externals for
    additionalExternalsFor(artifactName) {
        //#region @backendFunc
        let res = this.data?.singleFileBundlingPackages
            ?.filter(c => {
            return (c.isExternalFor === '*' || c.isExternalFor.includes(artifactName));
        })
            .map(c => c.packageName);
        return res || [];
        //#endregion
    }
    //#endregion
    //#region additional replace with nothing for
    additionalReplaceWithNothingFor(artifactName) {
        //#region @backendFunc
        let res = this.data?.singleFileBundlingPackages
            ?.filter(c => {
            return (c.replaceWithNothing === '*' ||
                (Array.isArray(c.replaceWithNothing) &&
                    c.replaceWithNothing.includes(artifactName)));
        })
            .map(c => c.packageName);
        return res || [];
        //#endregion
    }
    //#endregion
    //#region native deps for
    getNativeDepsFor(artifactName) {
        //#region @backendFunc
        let res = this.data?.singleFileBundlingPackages
            ?.filter(c => {
            return (c.includeInBundleNodeModules === '*' ||
                (Array.isArray(c.includeInBundleNodeModules) &&
                    c.includeInBundleNodeModules.includes(artifactName)));
        })
            .map(c => c.packageName);
        return res || [];
        //#endregion
    }
    //#endregion
    //#region peerDependencies names for npm lib
    /**
     * Peer deps to inlculde in npm lib
     * (relative paths to files or folders)
     */
    get peerDependenciesNamesForNpmLib() {
        //#region @backendFunc
        let res = this.data
            ?.peerDependenciesNamesForNpmLib;
        return res || [];
        //#endregion
    }
    //#endregion
    /**
     * Peer deps to inlculde in npm lib
     * (relative paths to files or folders)
     */
    get devDependenciesNamesForNpmLib() {
        //#region @backendFunc
        let res = this.data
            ?.devDependenciesNamesForNpmLib;
        return res || [];
        //#endregion
    }
    //#endregion
    setPeerDependenciesNamesForNpmLib(dependencies) {
        //#region @backendFunc
        const data = this.data;
        data.peerDependenciesNamesForNpmLib = dependencies;
        this.saveToDisk('updating peer dependencies for npm lib');
        //#endregion
    }
    //#region peerDependencies names for npm lib
    /**
     * Peer deps to inlculde in npm lib
     * (relative paths to files or folders)
     */
    get optionalDependenciesNamesForNpmLib() {
        //#region @backendFunc
        let res = this.data
            ?.optionalDependenciesNamesForNpmLib;
        return res || [];
        //#endregion
    }
    //#endregion
    //#region set new version
    setType(type) {
        //#region @backendFunc
        const data = this.data;
        Helpers__NS__info(`Setting type to project  ${this.project.genericName}: ${type}`);
        data.type = type;
        this.saveToDisk(`setting new type "${type}"`);
        //#endregion
    }
    //#endregion
    //#region set framework version
    async setFrameworkVersion(frameworkVersionArg) {
        //#region @backendFunc
        this.data.version = frameworkVersionArg;
        this.saveToDisk('updating framework version');
        //#endregion
    }
    //#endregion
    //#region uses its own node_modules
    get isUsingOwnNodeModulesInsteadCoreContainer() {
        const data = this.data;
        //#region @backendFunc
        let res = data?.isUsingOwnNodeModulesInsteadCoreContainer;
        return !!res;
        //#endregion
    }
    //#endregion
    //#region uses its own node_modules
    get linkNodeModulesFromCoreContainer() {
        const data = this.data;
        //#region @backendFunc
        let res = data?.linkNodeModulesFromCoreContainer;
        return !!res;
        //#endregion
    }
    //#endregion
    //#region should generate src/lib/index file
    get shouldGenerateAutogenIndexFile() {
        const data = this.data;
        //#region @backendFunc
        return !!data?.shouldGenerateAutogenIndexFile;
        //#endregion
    }
    //#endregion
    setShouldGenerateAutogenIndexFile(value) {
        const data = this.data;
        data.shouldGenerateAutogenIndexFile = value;
        this.saveToDisk('updating shouldGenerateAutogenIndexFile');
    }
    setShouldGenerateAutogenAppRoutes(value) {
        const data = this.data;
        data.shouldGenerateAutogenAppRoutesFile = value;
        this.saveToDisk('updating shouldGenerateAutogenAppRoutesFile');
    }
    setCloudFlareAccountSubdomain(value) {
        const data = this.data;
        data.cloudFlareAccountSubdomain = value;
        this.saveToDisk('updating cloudFlareAccountSubdomain');
    }
    get cloudFlareAccountSubdomain() {
        //#region @backendFunc
        const data = this.data;
        return data?.cloudFlareAccountSubdomain;
        //#endregion
    }
    //#region should generate app.ts routes,imports and context initializations file
    get shouldGenerateAutogenAppRoutesFile() {
        const data = this.data;
        //#region @backendFunc
        return !!data?.shouldGenerateAutogenAppRoutesFile;
        //#endregion
    }
    //#endregion
    //#region is monorepo
    get isMonorepo() {
        //#region @backendFunc
        const data = this.data;
        return !!data?.monorepo;
        //#endregion
    }
    //#endregion
    //#region is organization
    get isOrganization() {
        //#region @backendFunc
        const data = this.data;
        return !!data?.organization;
        //#endregion
    }
    //#endregion
    //#region name when inside organization
    get nameWhenInsideOrganiation() {
        //#region @backendFunc
        const data = this.data;
        return data?.overrideNameWhenInsideOrganization;
        //#endregion
    }
    //#endregion
    //#region override name for cli
    get overrideNameForCli() {
        //#region @backendFunc
        const data = this.data;
        return data?.overrideNameForCli;
        //#endregion
    }
    //#endregion
    //#region name when inside organization
    get overrideNpmName() {
        //#region @backendFunc
        const data = this.data;
        return data?.overrideNpmName;
        //#endregion
    }
    //#endregion
    //#region is core project
    get isCoreProject() {
        //#region @backendFunc
        return !!this.data?.isCoreProject;
        //#endregion
    }
    //#endregion
    //#region framework version
    get frameworkVersion() {
        //#region @backendFunc
        return this.data?.version;
        //#endregion
    }
    //#endregion
    //#region app id
    get appId() {
        //#region @backendFunc
        return this.data?.appId;
        //#endregion
    }
    set appId(value) {
        //#region @backend
        const data = this.data;
        data.appId = value;
        this.saveToDisk('updating appId');
        //#endregion
    }
    //#endregion
    //#region folders to remove after pulling from git
    get removeAfterPullingFromGit() {
        //#region @backendFunc
        const data = this.data;
        return Array.isArray(data?.removeAfterPullingFromGit)
            ? data?.removeAfterPullingFromGit
            : [];
        //#endregion
    }
    //#endregion
    //#region link to
    linkTo(destination) {
        //#region @backendFunc
        const source = this.project.pathFor(taonJsonMainProject);
        const dest = crossPlatformPath([destination, taonJsonMainProject]);
        Helpers__NS__removeFileIfExists(dest);
        Helpers__NS__createSymLink(source, dest);
        //#endregion
    }
    //#endregion
    //#region auto release config allowed items
    get autoReleaseConfigAllowedItems() {
        const data = this.data;
        return data?.autoReleaseConfigAllowedItems || [];
    }
    get createOnlyTagWhenRelease() {
        const data = this.data;
        return !!data?.createOnlyTagWhenRelease;
    }
    set autoReleaseConfigAllowedItems(items) {
        const data = this.data;
        data.autoReleaseConfigAllowedItems = items;
        this.saveToDisk('updating auto release config allowed items');
    }
    //#endregion
    //#region update isomorphic external depenencies
    detectAndUpdateNpmExternalDependencies() {
        //#region @backendFunc
        Helpers__NS__taskStarted(`Updating isomorphic external dependencies`);
        let allDetectedNpmDeps = this.project.framework.allDetectedExternalNPmDependenciesForNpmLibCode;
        this.setDependenciesNamesForNpmLib(allDetectedNpmDeps);
        Helpers__NS__taskDone(`Done updating npm external dependencies`);
        //#endregion
    }
    detectAndUpdateIsomorphicExternalDependencies() {
        //#region @backendFunc
        Helpers__NS__taskStarted(`Updating isomorphic external dependencies`);
        let allDetectedIsomorphicDeps = this.project.framework
            .allDetectedExternalIsomorphicDependenciesForNpmLibCode;
        allDetectedIsomorphicDeps = allDetectedIsomorphicDeps.filter(f => ![this.project.name, this.project.nameForNpmPackage].includes(f));
        this.setIsomorphicDependenciesForNpmLib(allDetectedIsomorphicDeps);
        let isomorphicDependenciesForNpmLib = this.dependenciesNamesForNpmLib.filter(d => !allDetectedIsomorphicDeps.includes(d));
        isomorphicDependenciesForNpmLib = isomorphicDependenciesForNpmLib.filter(f => ![this.project.name, this.project.nameForNpmPackage].includes(f));
        this.setDependenciesNamesForNpmLib(isomorphicDependenciesForNpmLib);
        let peerDependenciesNamesForNpmLib = this.peerDependenciesNamesForNpmLib.filter(d => !allDetectedIsomorphicDeps.includes(d));
        peerDependenciesNamesForNpmLib = peerDependenciesNamesForNpmLib.filter(f => ![this.project.name, this.project.nameForNpmPackage].includes(f));
        this.setPeerDependenciesNamesForNpmLib(peerDependenciesNamesForNpmLib);
        Helpers__NS__taskDone(`Done updating isomorphic external dependencies`);
        //#endregion
    }
    //#endregion
    async updateDependenciesFromNpm(options) {
        //#region @backendFunc
        options = options || {};
        options.onlyPackageNames = options.onlyPackageNames || [];
        const allDeps = this.project.packageJson.allDependencies;
        // const overrideAndUpdateAllToLatest = false;
        // await Helpers__NS__questionYesNo(
        //   'update all to latest ?',
        // );
        const allDepsKeys = Object.keys(allDeps);
        for (let index = 0; index < allDepsKeys.length; index++) {
            Helpers__NS__clearConsole();
            const packageName = allDepsKeys[index];
            if (options.onlyPackageNames.length > 0 &&
                !options.onlyPackageNames.includes(packageName)) {
                continue;
            }
            const currentPackageVersion = allDeps[packageName];
            // const currentVerObj = UtilsNpm__NS__getVerObj(currentPackageVersion);
            const taonJsonContent = this.project.readFile(taonJsonMainProject);
            const tags = UtilsJson__NS__getAtrributiesFromJsonWithComments(packageName, taonJsonContent);
            Helpers__NS__info(`(${index + 1} / ${allDepsKeys.length}) ` +
                `Downloading info about "${packageName}" (current ver: ${currentPackageVersion})`);
            if (currentPackageVersion === 'latest') {
                console.log(`Package "${packageName}" is set to latest. Skipping.`);
                continue;
            }
            //#region resolve tags
            const updateToContainerMajor = tags.find(c => c.name === '@updateToContainerMajor');
            const trustedMajor = !!tags.find(c => c.name === '@trusted' && c.value === 'major');
            const trustedMinor = !!tags.find(c => c.name === '@trusted' && c.value === 'minor');
            const trustedPath = !!tags.find(c => c.name === '@trusted' && c.value === 'patch');
            //#endregion
            //#region check for @updateToContainerMajor
            if (updateToContainerMajor) {
                const containerMajorVersion = `~${this.project.taonJson.frameworkVersion.replace('v', '')}.0.0`;
                this.project.packageJson.updateDependency({
                    packageName,
                    version: containerMajorVersion,
                });
                this.project.taonJson.overridePackageJsonManager.updateDependency({
                    packageName,
                    version: containerMajorVersion,
                });
                continue;
            }
            //#endregion
            if (!trustedMajor && !trustedMinor && !trustedPath) {
                console.log(`Package "${packageName}" is not trusted for any updates. Skipping.`);
                continue;
            }
            const latestType = trustedMajor
                ? 'major'
                : trustedMinor
                    ? 'minor'
                    : 'patch';
            let latestToUpdate = await UtilsNpm__NS__getLatestVersionFromNpm(packageName, {
                currentPackageVersion,
                latestType,
                skipAlphaBetaNext: true,
            });
            const prefix = currentPackageVersion.startsWith('^')
                ? '^'
                : currentPackageVersion.startsWith('~')
                    ? '~'
                    : '';
            this.project.packageJson.updateDependency({
                packageName,
                version: `${prefix}${latestToUpdate}`,
            });
            this.project.taonJson.overridePackageJsonManager.updateDependency({
                packageName,
                version: `${prefix}${latestToUpdate}`,
            });
        }
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taonJson.js.map