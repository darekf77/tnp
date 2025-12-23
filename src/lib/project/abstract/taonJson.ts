import { walk } from 'lodash-walk-object/src';
import {
  chalk,
  config,
  crossPlatformPath,
  fileName,
  LibTypeEnum,
  UtilsJson,
} from 'tnp-core/src';
import { CoreModels, os, path } from 'tnp-core/src';
import { Helpers, _ } from 'tnp-core/src';
import { Utils } from 'tnp-core/src';
import {
  BaseFeatureForProject,
  BasePackageJson,
  UtilsNpm,
  UtilsTypescript,
} from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import {
  OVERRIDE_FROM_TNP,
  scriptsCommands,
  taonJsonMainProject,
} from '../../constants';
import { Models } from '../../models';
import { ReleaseArtifactTaon, EnvOptions } from '../../options';

import type { Project } from './project';
import { UtilsTerminal } from 'tnp-core/src';

// @ts-ignore TODO weird inheritance problem
export class TaonJson extends BaseFeatureForProject<Project> {
  private readonly data?: Models.TaonJson;

  /**
   * package.json override
   */
  public readonly overridePackageJsonManager: BasePackageJson;

  get path(): string {
    return this.project.pathFor(fileName.taon_jsonc);
  }

  //#region constructor

  //#region @backend
  constructor(project: Project, defaultValue?: Partial<Models.TaonJson>) {
    super(project);

    this.data = Helpers.readJson5([project.pathFor(taonJsonMainProject)]);
    if (!this.data && defaultValue) {
      this.data = _.cloneDeep(defaultValue as any);
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
  public reloadFromDisk(): void {
    //#region @backendFunc
    const newData =
      Helpers.readJson5([this.project.pathFor(taonJsonMainProject)]) ||
      this.data;

    walk.Object(
      newData,
      (value, lodashPath) => {
        if (_.isNil(value) || _.isFunction(value) || _.isObject(value)) {
          // skipping
        } else {
          _.set(this.data, lodashPath, value);
        }
      },
      { walkGetters: false },
    );
    //#endregion
  }
  //#endregion

  //#region exists
  get exists(): boolean {
    return Helpers.exists(this.project.pathFor(taonJsonMainProject));
  }
  //#endregion

  //#region save

  public preserveOldTaonProps(): void {
    if (
      this.project.framework.isContainer &&
      this.project.framework.isCoreProject
    ) {
      return;
    }
    const data = this.data as Models.TaonJsonStandalone;
    if (data.overrided?.includeOnly && !data.dependenciesNamesForNpmLib) {
      data.dependenciesNamesForNpmLib = _.cloneDeep(data.overrided.includeOnly);
      delete data.overrided.includeOnly;
    }
    if (this.project.framework.isStandaloneProject) {
      const dataToClean = this.data as Models.TaonJsonContainer;
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
      const mainConfig = EnvOptions.from(
        this.project.environmentConfig.getEnvMain(),
      );
      this.appId = Utils.uniqArray(
        (
          `${mainConfig.website.domain
            .replace(this.project.nameForNpmPackage, '')
            .replace(this.project.name, '')
            .split('.')
            .reverse()
            .join('.')}` +
          `.${this.project.nameForNpmPackage
            .replace(/\@/g, '')
            .replace(/\//g, '.')}`
        ).split('.'),
      ).join('.');
    }

    this.saveToDisk('preserve old taon props');
  }

  public preservePropsFromPackageJson(): void {
    if (
      this.project.framework.isContainer &&
      this.project.framework.isCoreProject
    ) {
      return;
    }
    const exitedPackageJson =
      this.project.packageJson.getAllData() || ({} as PackageJson);

    const packageJsonOverrideData =
      this.overridePackageJsonManager.getAllData() || ({} as PackageJson);

    const lastBuildTagHash = this.overridePackageJsonManager.getBuildHash();

    for (const prop of OVERRIDE_FROM_TNP) {
      if (
        _.isUndefined(packageJsonOverrideData[prop]) &&
        !_.isUndefined(exitedPackageJson[prop])
      ) {
        packageJsonOverrideData[prop] = exitedPackageJson[prop];
      }
    }

    this.overridePackageJsonManager.setAllData({
      ...packageJsonOverrideData,
      lastBuildTagHash,
    });
  }

  public saveToDisk(purpose?: string): void {
    //#region @backend
    Helpers.log(`Saving taon.jsonc ${purpose ? `(${purpose})` : ''}`);
    if (this.isCoreProject && this.project.framework.isContainer) {
      this.project.writeJsonC(taonJsonMainProject, this.data);
    } else {
      const sorted = Utils.sortKeys(_.cloneDeep(this.data)) as typeof this.data;
      const packageJsonOverride = sorted.packageJsonOverride || {};
      if (!packageJsonOverride.author) {
        packageJsonOverride.author = _.startCase(os.userInfo().username);
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
        delete ((destinationObject.packageJsonOverride || {}).scripts || {})[
          command
        ];
      });

      this.project.writeJsonC(taonJsonMainProject, destinationObject);
    }

    this.project.packageJson.saveToDisk();
    //#endregion
  }
  //#endregion

  //#region type
  get type(): CoreModels.LibType {
    const res = this.data?.type;
    if (_.isString(res)) {
      return res as CoreModels.LibType;
    }
    if (_.isString(this.project.hasFile(taonJsonMainProject))) {
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
  get resources(): string[] {
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
  get baseContentUrl(): string | undefined {
    //#region @backendFunc
    return (this.data as Models.TaonJsonStandalone)?.baseContentUrl;
    //#endregion
  }
  //#endregion

  //#region base images url
  /**
   * Base url for content (docs, md files etc.)
   * Required if README.md has relative pathes to images
   */
  get baseImagesUrl(): string | undefined {
    //#region @backendFunc
    return (this.data as Models.TaonJsonStandalone)?.baseImagesUrl;
    //#endregion
  }
  //#endregion

  //#region store generated assets in repo
  get storeGeneratedAssetsInRepository(): boolean {
    //#region @backendFunc

    return !!(this.data as Models.TaonJsonStandalone)
      ?.storeGeneratedAssetsInRepository;
    //#endregion
  }
  //#endregion

  //#region store local release files in repo
  get storeLocalReleaseFilesInRepository(): boolean {
    //#region @backendFunc

    return !!(this.data as Models.TaonJsonStandalone)
      ?.storeLocalReleaseFilesInRepository;
    //#endregion
  }
  //#endregion

  //#region dependencies names for npm lib
  /**
   * Dependencies for npm lib (non isomorphic)
   */
  get dependenciesNamesForNpmLib(): string[] {
    //#region @backendFunc
    let res = (this.data as Models.TaonJsonStandalone)
      ?.dependenciesNamesForNpmLib;

    if (!_.isArray(res)) {
      return this.data.overrided?.includeOnly || [];
    }

    return res || [];
    //#endregion
  }
  //#endregion

  private setDependenciesNamesForNpmLib(dependencies: string[]): void {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonStandalone;
    data.dependenciesNamesForNpmLib = dependencies;
    this.saveToDisk('updating dependencies for npm lib');
    //#endregion
  }

  //#region isomorphic dependencies names for npm lib
  /**
   * External isomorphic dependencies for npm lib
   * (build-in/core taon isomorphic packages will not be here)
   */
  get isomorphicDependenciesForNpmLib(): string[] {
    //#region @backendFunc
    let res = (this.data as Models.TaonJsonStandalone)
      ?.isomorphicDependenciesForNpmLib;

    return res || [];
    //#endregion
  }
  //#endregion

  //#region set isomorphic dependencies for npm lib
  private setIsomorphicDependenciesForNpmLib(dependencies: string[]): void {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonStandalone;
    data.isomorphicDependenciesForNpmLib = dependencies;
    this.saveToDisk('updating isomorphic dependencies for npm lib');
    //#endregion
  }
  //#endregion

  //#region additional externals for
  additionalExternalsFor(artifactName: ReleaseArtifactTaon): string[] {
    //#region @backendFunc
    let res = (
      this.data as Models.TaonJsonStandalone
    )?.singleFileBundlingPackages
      ?.filter(c => {
        return (
          c.isExternalFor === '*' || c.isExternalFor.includes(artifactName)
        );
      })
      .map(c => c.packageName);

    return res || [];
    //#endregion
  }
  //#endregion

  //#region additional replace with nothing for
  public additionalReplaceWithNothingFor(
    artifactName: ReleaseArtifactTaon,
  ): string[] {
    //#region @backendFunc
    let res = (
      this.data as Models.TaonJsonStandalone
    )?.singleFileBundlingPackages
      ?.filter(c => {
        return (
          c.replaceWithNothing === '*' ||
          (Array.isArray(c.replaceWithNothing) &&
            c.replaceWithNothing.includes(artifactName))
        );
      })
      .map(c => c.packageName);

    return res || [];
    //#endregion
  }
  //#endregion

  //#region native deps for
  public getNativeDepsFor(artifactName: ReleaseArtifactTaon): string[] {
    //#region @backendFunc
    let res = (
      this.data as Models.TaonJsonStandalone
    )?.singleFileBundlingPackages
      ?.filter(c => {
        return (
          c.includeInBundleNodeModules === '*' ||
          (Array.isArray(c.includeInBundleNodeModules) &&
            c.includeInBundleNodeModules.includes(artifactName))
        );
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
  get peerDependenciesNamesForNpmLib(): string[] {
    //#region @backendFunc
    let res = (this.data as Models.TaonJsonStandalone)
      ?.peerDependenciesNamesForNpmLib;

    return res || [];
    //#endregion
  }
  //#endregion

  private setPeerDependenciesNamesForNpmLib(dependencies: string[]): void {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonStandalone;
    data.peerDependenciesNamesForNpmLib = dependencies;
    this.saveToDisk('updating peer dependencies for npm lib');
    //#endregion
  }

  //#region peerDependencies names for npm lib
  /**
   * Peer deps to inlculde in npm lib
   * (relative paths to files or folders)
   */
  get optionalDependenciesNamesForNpmLib(): string[] {
    //#region @backendFunc
    let res = (this.data as Models.TaonJsonStandalone)
      ?.optionalDependenciesNamesForNpmLib;

    return res || [];
    //#endregion
  }
  //#endregion

  //#region set new version
  setType(type: CoreModels.LibType): void {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonContainer;
    Helpers.info(
      `Setting type to project  ${this.project.genericName}: ${type}`,
    );
    data.type = type as any;

    this.saveToDisk(`setting new type "${type}"`);
    //#endregion
  }
  //#endregion

  //#region set framework version
  async setFrameworkVersion(
    frameworkVersionArg: CoreModels.FrameworkVersion,
  ): Promise<void> {
    //#region @backendFunc
    this.data.version = frameworkVersionArg;
    this.saveToDisk('updating framework version');
    //#endregion
  }
  //#endregion

  //#region uses its own node_modules
  get isUsingOwnNodeModulesInsteadCoreContainer(): boolean {
    const data = this.data as Models.TaonJsonStandalone;

    //#region @backendFunc
    let res = data?.isUsingOwnNodeModulesInsteadCoreContainer;
    return !!res;
    //#endregion
  }
  //#endregion

  //#region uses its own node_modules
  get shouldGenerateAutogenIndexFile(): boolean {
    const data = this.data as Models.TaonJsonStandalone;

    //#region @backendFunc
    return !!data?.shouldGenerateAutogenIndexFile;
    //#endregion
  }
  //#endregion

  //#region is monorepo
  get isMonorepo(): boolean {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonContainer;
    return !!data?.monorepo;
    //#endregion
  }
  //#endregion

  //#region is organization
  get isOrganization(): boolean {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonContainer;
    return !!data?.organization;
    //#endregion
  }
  //#endregion

  //#region name when inside organization
  get nameWhenInsideOrganiation(): string | undefined {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonStandalone;
    return data?.overrideNameWhenInsideOrganization;
    //#endregion
  }
  //#endregion

  //#region override name for cli
  get overrideNameForCli(): string | undefined {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonStandalone;
    return data?.overrideNameForCli;
    //#endregion
  }
  //#endregion

  //#region name when inside organization
  get overrideNpmName(): string | undefined {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonStandalone;
    return data?.overrideNpmName;
    //#endregion
  }
  //#endregion

  //#region is core project
  get isCoreProject(): boolean {
    //#region @backendFunc
    return !!this.data?.isCoreProject;
    //#endregion
  }
  //#endregion

  //#region framework version
  get frameworkVersion(): CoreModels.FrameworkVersion | undefined {
    //#region @backendFunc
    return this.data?.version;
    //#endregion
  }
  //#endregion

  //#region app id
  get appId(): string {
    //#region @backendFunc
    return (this.data as Models.TaonJsonStandalone)?.appId;
    //#endregion
  }

  set appId(value: string) {
    //#region @backend
    const data = this.data as Models.TaonJsonStandalone;
    data.appId = value;
    this.saveToDisk('updating appId');
    //#endregion
  }
  //#endregion

  //#region folders to remove after pulling from git
  get removeAfterPullingFromGit(): string[] {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonContainer;
    return Array.isArray(data?.removeAfterPullingFromGit)
      ? data?.removeAfterPullingFromGit
      : [];
    //#endregion
  }
  //#endregion

  //#region link to
  linkTo(destination: string): void {
    //#region @backendFunc
    const source = this.project.pathFor(taonJsonMainProject);
    const dest = crossPlatformPath([destination, taonJsonMainProject]);
    Helpers.removeFileIfExists(dest);
    Helpers.createSymLink(source, dest);
    //#endregion
  }
  //#endregion

  //#region auto release config allowed items
  get autoReleaseConfigAllowedItems(): Models.TaonAutoReleaseItem[] {
    const data = this.data as Models.TaonJsonStandalone;
    return data?.autoReleaseConfigAllowedItems || [];
  }

  get createOnlyTagWhenRelease(): boolean {
    const data = this.data as Models.TaonJsonContainer;
    return !!data?.createOnlyTagWhenRelease;
  }

  set autoReleaseConfigAllowedItems(items: Models.TaonAutoReleaseItem[]) {
    const data = this.data as Models.TaonJsonStandalone;
    data.autoReleaseConfigAllowedItems = items;
    this.saveToDisk('updating auto release config allowed items');
  }
  //#endregion

  //#region update isomorphic external depenencies
  public updateIsomorphicExternalDependencies(): void {
    //#region @backendFunc
    Helpers.taskStarted(`Updating isomorphic external dependencies`);
    let allDetectedIsomorphicDeps =
      this.project.framework.allDetectedExternalIsomorphicDependenciesForNpmLib;

    allDetectedIsomorphicDeps = allDetectedIsomorphicDeps.filter(
      f => ![this.project.name, this.project.nameForNpmPackage].includes(f),
    );

    this.setIsomorphicDependenciesForNpmLib(allDetectedIsomorphicDeps);

    let isomorphicDependenciesForNpmLib =
      this.dependenciesNamesForNpmLib.filter(
        d => !allDetectedIsomorphicDeps.includes(d),
      );

    isomorphicDependenciesForNpmLib = isomorphicDependenciesForNpmLib.filter(
      f => ![this.project.name, this.project.nameForNpmPackage].includes(f),
    );

    this.setDependenciesNamesForNpmLib(isomorphicDependenciesForNpmLib);

    let peerDependenciesNamesForNpmLib =
      this.peerDependenciesNamesForNpmLib.filter(
        d => !allDetectedIsomorphicDeps.includes(d),
      );

    peerDependenciesNamesForNpmLib = peerDependenciesNamesForNpmLib.filter(
      f => ![this.project.name, this.project.nameForNpmPackage].includes(f),
    );

    this.setPeerDependenciesNamesForNpmLib(peerDependenciesNamesForNpmLib);
    Helpers.taskDone(`Done updating isomorphic external dependencies`);
    //#endregion
  }
  //#endregion

  async updateDependenciesFromNpm(options?: {
    onlyPackageNames?: string[];
  }): Promise<void> {
    //#region @backendFunc
    options = options || {};
    options.onlyPackageNames = options.onlyPackageNames || [];
    const allDeps = this.project.packageJson.allDependencies;
    // const overrideAndUpdateAllToLatest = false;
    // await Helpers.questionYesNo(
    //   'update all to latest ?',
    // );

    const allDepsKeys = Object.keys(allDeps);
    for (let index = 0; index < allDepsKeys.length; index++) {
      Helpers.clearConsole();

      const packageName = allDepsKeys[index];
      if (
        options.onlyPackageNames.length > 0 &&
        !options.onlyPackageNames.includes(packageName)
      ) {
        continue;
      }

      const currentPackageVersion = allDeps[packageName];
      // const currentVerObj = UtilsNpm.getVerObj(currentPackageVersion);
      const taonJsonContent = this.project.readFile(taonJsonMainProject);
      const tags = UtilsJson.getAtrributiesFromJsonWithComments(
        packageName,
        taonJsonContent,
      );

      Helpers.info(
        `(${index + 1} / ${allDepsKeys.length}) ` +
          `Downloading info about "${packageName}" (current ver: ${currentPackageVersion})`,
      );

      if (currentPackageVersion === 'latest') {
        console.log(`Package "${packageName}" is set to latest. Skipping.`);
        continue;
      }

      //#region resolve tags
      const updateToContainerMajor = tags.find(
        c => c.name === '@updateToContainerMajor',
      );

      const trustedMajor = !!tags.find(
        c => c.name === '@trusted' && c.value === 'major',
      );

      const trustedMinor = !!tags.find(
        c => c.name === '@trusted' && c.value === 'minor',
      );

      const trustedPath = !!tags.find(
        c => c.name === '@trusted' && c.value === 'patch',
      );
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
        console.log(
          `Package "${packageName}" is not trusted for any updates. Skipping.`,
        );
        continue;
      }

      const latestType = trustedMajor
        ? 'major'
        : trustedMinor
          ? 'minor'
          : 'patch';

      let latestToUpdate = await UtilsNpm.getLatestVersionFromNpm(packageName, {
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
