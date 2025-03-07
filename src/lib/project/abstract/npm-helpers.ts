//#region imports
import { config } from 'tnp-config/src';
import {
  chalk,
  CoreModels,
  Helpers,
  PROGRESS_DATA,
  _,
  dateformat,
  fse,
  moment,
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
  project: Project;
  public _nodeModulesType = NodeModules as any;
  public _packageJsonType = PackageJSON as any;

  //#region last npm version
  /**
   * @deprecated
   */
  get lastNpmVersion(): string | undefined {
    //#region @backendFunc
    const lastVer = 'last npm version(s): ';
    if (this.project.framework.isSmartContainer) {
      return (
        lastVer +
        this.project.children
          .map(c => {
            let lastVer = void 0 as string;
            try {
              const ver = Helpers.run(
                `npm show @${this.project.name}/${c.name} version`,
                { output: false },
              )
                .sync()
                .toString();
              if (ver) {
                lastVer = ver.trim();
              }
            } catch (error) {}
            return `${this.project.name}/${c.name}=${lastVer}`;
          })
          .join(', ')
      );
    } else {
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
      return lastVer + lastVer;
    }
    //#endregion
  }
  //#endregion

  //#region check if ready for npm
  public checkProjectReadyForNpmRelease(): void {
    //#region @backendFunc
    if (this.project.framework.isSmartContainer) {
      return;
    }

    if (this.project.framework.isStandaloneProject) {
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
    if (
      this.project.framework.isContainerCoreProject &&
      this.project.framework.frameworkVersionAtLeast('v2')
    ) {
      return false;
    }

    if (this.project.framework.isSmartContainer) {
      return true;
    }

    if (this.project.framework.isSmartContainerChild) {
      return true;
    }

    if (this.project.taonJson.isUsingOwnNodeModulesInsteadCoreContainer) {
      return false;
    }

    return this.project.framework.isStandaloneProject;
    //#endregion
  }
  //#endregion

  //#region copy deps from core container
  copyDepsFromCoreContainer(purpose?: string): void {
    // TODO @LAST implement
  }
  //#endregion
}
