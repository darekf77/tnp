//#region imports
import { config } from 'tnp-core/src';
import {
  chalk,
  CoreModels,
  Helpers,
  PROGRESS_DATA,
  _,
  dateformat,
  fse,
} from 'tnp-core/src';
import {
  BaseNodeModules,
  BaseNpmHelpers,
  BasePackageJson,
} from 'tnp-helpers/src';

import { NodeModules } from './node-modules';
import { PackageJSON } from './package-json';
import type { Project } from './project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class NpmHelpers extends BaseNpmHelpers<Project> {
  public _nodeModulesType = NodeModules as any;
  public _packageJsonType = PackageJSON as any;
  // @ts-ignore TODO weird inheritance problem
  public readonly packageJson: PackageJSON;
  // @ts-ignore TODO weird inheritance problem
  public readonly nodeModules: NodeModules;

  constructor(project: Project) {
    super(project);
    this.packageJson = new this._packageJsonType(
      { cwd: project.location },
      project,
    );
    this.nodeModules = new (this._nodeModulesType as typeof NodeModules)(
      project,
      this,
    );
  }

  //#region last npm version
  /**
   * @deprecated
   */
  get lastNpmVersion(): string | undefined {
    //#region @backendFunc

    let lastVer = void 0 as string;
    try {
      const ver = this.project
        .run(`npm show ${this.project.name} version`, { output: false })
        .sync()
        .toString();
      if (ver) {
        lastVer = ver.trim();
      }
    } catch (error) {}
    return lastVer;
    //#endregion
  }
  //#endregion

  //#region check if ready for npm
  public checkProjectReadyForNpmRelease(): void {
    //#region @backendFunc

    const standaloneAndNotCore =
      !this.project.framework.isCoreProject && this.project.framework;

    const containerNotCore =
      (this.project.framework.isContainer &&
        !this.project.framework.isCoreProject) ||
      (this.project.framework.isContainer &&
        this.project.framework.isCoreProject &&
        this.project.taonJson.createOnlyTagWhenRelease);

    if (standaloneAndNotCore || containerNotCore) {
      return;
    }

    Helpers.error(
      `Project "${this.project.genericName}" can't be used in npm release`,
      false,
      true,
    );
    //#endregion
  }
  //#endregion

  //#region use link as node modules
  /**
   * check whether node_modules installed
   * or linked from core container
   * @returns boolean - true if linked from core container
   */
  get useLinkAsNodeModules(): boolean {
    //#region @backendFunc
    if (this.project.taonJson.linkNodeModulesFromCoreContainer) {
      return true;
    }
    if (
      this.project.framework.isContainerCoreProject &&
      this.project.framework.frameworkVersionAtLeast('v2')
    ) {
      return false;
    }

    if (this.project.taonJson.isUsingOwnNodeModulesInsteadCoreContainer) {
      return false;
    }

    return this.project.framework.isStandaloneProject;
    //#endregion
  }
  //#endregion
}
