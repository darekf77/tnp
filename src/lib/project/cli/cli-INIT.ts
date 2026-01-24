import { config, LibTypeEnum } from 'tnp-core/src';
import {
  CoreModels,
  UtilsTerminal,
  _,
  crossPlatformPath,
  path,
} from 'tnp-core/src';
import { Helpers, HelpersTaon } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import {
  DEFAULT_FRAMEWORK_VERSION,
  MESSAGES,
  packageJsonMainProject,
  taonJsonMainProject,
  TEMP_DOCS,
} from '../../constants';
import { Models } from '../../models';
import { EnvOptions } from '../../options';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';

// @ts-ignore TODO weird inheritance problem
export class $Init extends BaseCli {

  //#region prepare args
  async __initialize__(): Promise<void> {
    await super.__initialize__();
    await this.__askForWhenEmpty();
  }
  //#endregion

  //#region init
  public async _(struct = false, recursiveAction = false): Promise<void> {
    await this.project.init(
      this.params.clone({
        purpose: 'cli init',
        recursiveAction,
        init: {
          struct,
        },
        finishCallback: () => {
          console.log('DONE!');
          this._exit();
        },
      }),
    );
  }
  //#endregion

  async clearInit() {
    await this.project.clear();
    await this._();
  }

  async all(): Promise<void> {
    await this._(false, true);
  }

  //#region struct
  async struct(): Promise<void> {
    await this._(true);
  }
  //#endregion

  async templatesBuilder(): Promise<void> {
    await this.project.artifactsManager.artifact.npmLibAndCliTool.filesTemplatesBuilder.rebuild(
      this.params,
    );
    this._exit();
  }

  vscode(): void {
    this.project.vsCodeHelpers.toogleFilesVisibilityInVscode({
      action: 'hide-files',
    });
  }

  //#region ask when empty
  private async __askForWhenEmpty(): Promise<void> {
    if (
      Helpers.exists(
        crossPlatformPath(
          path.join(crossPlatformPath(this.cwd), packageJsonMainProject),
        ),
      )
    ) {
      return;
    }
    let proj: Project;
    const yesNewProj = await Helpers.questionYesNo(
      `Do you wanna init project in this folder ?`,
    );
    if (yesNewProj) {
      const responseProjectType = // @ts-ignore
        await Helpers.autocompleteAsk<CoreModels.LibType>(
          `Choose type of project`,
          [
            { name: 'Container', value: LibTypeEnum.CONTAINER },
            { name: 'Isomorphic Lib', value: LibTypeEnum.ISOMORPHIC_LIB },
          ],
        );
      let organization = false;
      let monorepo = false;
      if (responseProjectType === LibTypeEnum.CONTAINER) {
        organization = await UtilsTerminal.confirm({
          message:
            'Do you wanna use smart container for organization project ?',
          defaultValue: false,
        });
        monorepo = await UtilsTerminal.confirm({
          message: 'Do you want your container to be monorepo ?',
          defaultValue: false,
        });
        Helpers.writeFile(
          [crossPlatformPath(this.cwd), packageJsonMainProject],
          {
            name: crossPlatformPath(path.basename(crossPlatformPath(this.cwd))),
            version: '0.0.0',
          },
        );

        Helpers.writeFile([crossPlatformPath(this.cwd), taonJsonMainProject], {
          type: LibTypeEnum.CONTAINER,
          monorepo,
          organization,
          version: DEFAULT_FRAMEWORK_VERSION, // OK
        } as Partial<Models.TaonJsonContainer>);
      } else {
        Helpers.writeFile(
          [crossPlatformPath(this.cwd), packageJsonMainProject],
          {
            name: crossPlatformPath(path.basename(crossPlatformPath(this.cwd))),
            version: '0.0.0',
            tnp: {
              type: responseProjectType,
              version: DEFAULT_FRAMEWORK_VERSION, // OK
            },
          },
        );
        Helpers.writeFile([crossPlatformPath(this.cwd), taonJsonMainProject], {
          type: LibTypeEnum.ISOMORPHIC_LIB,
          version: DEFAULT_FRAMEWORK_VERSION, // OK
        } as Partial<Models.TaonJsonStandalone>);
      }

      proj = this.ins.From(crossPlatformPath(this.cwd)) as Project;
      this.project = proj;
    }
    this.project = proj;
  }
  //#endregion

}

export default {
  $Init: HelpersTaon.CLIWRAP($Init, '$Init'),
};
