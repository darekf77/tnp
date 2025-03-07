import { config } from 'tnp-config/src';
import { CoreModels, path } from 'tnp-core/src';
import { Helpers, _ } from 'tnp-core/src';
import { BaseFeatureForProject, BasePackageJson } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import { Models } from '../../models';

import type { Project } from './project';

// @ts-ignore TODO weird inheritance problem
export class TaonJson extends BaseFeatureForProject<Project> {
  private readonly data?: Models.TaonJson;

  public readonly packageJsonOverride: BasePackageJson;

  //#region constructor
  //#region @backend
  constructor(
    public project: Project,
    defaultValue?: Partial<Models.TaonJson>,
  ) {
    super(project);

    this.data = Helpers.readJson5([project.pathFor(config.file.taon_jsonc)]);
    if (!this.data && defaultValue) {
      this.data = _.cloneDeep(defaultValue as any);
    }
    if (this.data) {
      this.packageJsonOverride = new BasePackageJson({
        jsonContent: this.data.packageJsonOverride || {},
        reloadInMemoryCallback: data => {
          this.data.packageJsonOverride = data;
          this.saveToDisk();
        },
      });
    }
  }
  //#endregion
  //#endregion

  //#region save
  private saveToDisk(purpose?: string): void {
    //#region @backend
    Helpers.log(`Saving taon.jsonc ${purpose ? `(${purpose})` : ''}`);

    this.project.writeJsonC(config.file.taon_jsonc, this.data);
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
   * Resource to include in npm lib
   * (relative paths to files or folders)
   */
  get dependenciesNamesForNpmLib(): string[] {
    //#region @backendFunc
    let res = (this.data as Models.TaonJsonStandalone)
      ?.dependenciesNamesForNpmLib;

    if (!_.isArray(res)) {
      return this.data.overrided.includeOnly || [];
    }

    return res || [];
    //#endregion
  }
  //#endregion

  //#region set new version
  setType(
    type: CoreModels.LibType,
    options?: {
      /**
       * smart container for organization npm project
       */
      smart?: boolean;
    },
  ): void {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonContainer;
    Helpers.info(
      `Setting type to project  ${this.project.genericName}: ${type}`,
    );
    data.type = type as any;
    if (options && _.isBoolean(options?.smart)) {
      data.smart = options?.smart;
    }
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

  //#region is monorepo
  get isMonorepo(): boolean {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonContainer;
    return !!data?.monorepo;
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

  //#region is smart container
  /**
   * is smart container for organization npm project
   */
  get isSmart(): boolean {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonContainer;
    return !!data?.smart;
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

  //#region smart container build target
  get smartContainerBuildTarget(): string | undefined {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonContainer;
    return data?.smartContainerBuildTarget;
    //#endregion
  }
  //#endregion

  //#region set smart container build target
  setSmartContainerBuildTarget(target: string): void {
    //#region @backendFunc
    const data = this.data as Models.TaonJsonContainer;
    data.smartContainerBuildTarget = target;
    this.saveToDisk('set smart container build target');
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

  //#region lib/cli release options
  get cliLibReleaseOptions(): Models.CliLibReleaseOptions | undefined {
    const data = this.data as Models.TaonJsonStandalone;
    return data?.cliLibReleaseOptions;
  }
  //#endregion

  //#region additional npm names
  /**
   * so I can release same npm lib with different name
   */
  get additionalNpmNames(): string[] {
    const data = this.data as Models.TaonJsonStandalone;
    return data?.additionalNpmNames || [];
  }
  //#endregion
}
