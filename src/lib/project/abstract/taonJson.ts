import { OVERRIDE_FROM_TNP, scriptsCommands } from 'tnp/src';
import { config } from 'tnp-config/src';
import { CoreModels, path } from 'tnp-core/src';
import { Helpers, _ } from 'tnp-core/src';
import { Utils } from 'tnp-core/src';
import { BaseFeatureForProject, BasePackageJson } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import { Models } from '../../models';

import type { Project } from './project';

// @ts-ignore TODO weird inheritance problem
export class TaonJson extends BaseFeatureForProject<Project> {
  private readonly data?: Models.TaonJson;

  /**
   * package.json override
   */
  public readonly overridePackageJsonManager: BasePackageJson;

  //#region constructor
  //#region @backend
  constructor(project: Project, defaultValue?: Partial<Models.TaonJson>) {
    super(project);

    this.data = Helpers.readJson5([project.pathFor(config.file.taon_jsonc)]);
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

  get exists(): boolean {
    return Helpers.exists(this.project.pathFor(config.file.taon_jsonc));
  }

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
      this.project.writeJsonC(config.file.taon_jsonc, this.data);
    } else {
      const sorted = Utils.sortKeys(_.cloneDeep(this.data)) as typeof this.data;
      const packageJsonOverride = sorted.packageJsonOverride;
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

      this.project.writeJsonC(config.file.taon_jsonc, destinationObject);
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
    if (_.isString(this.project.hasFile(config.file.package_json))) {
      return 'unknown-npm-project';
    }
    return 'unknown';
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

  //#region dependencies names for npm lib
  /**
   * deps to inlculde in npm lib
   * (relative paths to files or folders)
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
    if (!res) {
      res = data?.usesItsOwnNodeModules;
    }
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

  //#region framework version
  get numberOfContexts(): number {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonStandalone;
    const value = Math.floor(Math.abs(Number(data.numberOfContexts || 2)));
    if (isNaN(value) || value < 2) {
      return 2;
    }
    return value;
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
    const source = path.join(this.project.location, config.file.taon_jsonc);
    const dest = path.join(destination, config.file.taon_jsonc);
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

  set autoReleaseConfigAllowedItems(items: Models.TaonAutoReleaseItem[]) {
    const data = this.data as Models.TaonJsonStandalone;
    data.autoReleaseConfigAllowedItems = items;
    this.saveToDisk('updating auto release config allowed items');
  }
  //#endregion
}
