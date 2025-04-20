import { config } from 'tnp-config/src';
import {
  CoreModels,
  UtilsTerminal,
  _,
  crossPlatformPath,
  path,
} from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import {
  DEFAULT_FRAMEWORK_VERSION,
  MESSAGES,
  TEMP_DOCS,
} from '../../constants';
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
  public async _() {
    await this.project.init(
      EnvOptions.from({
        ...this.params,
        purpose: 'cli init',
        finishCallback: () => {
          console.log('DONE!');
          this._exit();
        },
      }),
    );
  }
  //#endregion

  //#region struct
  async struct() {
    await this.project.init(
      EnvOptions.from({
        ...this.params,
        purpose: 'cli struct init',
        init: {
          struct: true,
        },
        finishCallback: () => this._exit(),
      }),
    );
  }
  //#endregion

  async templatesBuilder() {
    await this.project.artifactsManager.artifact.npmLibAndCliTool.filesTemplatesBuilder.rebuild(
      this.params,
    );
    this._exit();
  }

  vscode() {
    this.project.artifactsManager.artifact.npmLibAndCliTool.filesRecreator.vscode.settings.hideOrShowFilesInVscode();
  }

  //#region ask when empty
  private async __askForWhenEmpty(): Promise<void> {
    if (
      Helpers.exists(
        crossPlatformPath(
          path.join(crossPlatformPath(this.cwd), config.file.package_json),
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
            { name: 'Container', value: 'container' },
            { name: 'Isomorphic Lib', value: 'isomorphic-lib' },
          ],
        );
      let smart = false;
      let monorepo = false;
      if (responseProjectType === 'container') {
        smart = await UtilsTerminal.confirm({
          message:
            'Do you wanna use smart container for organization project ?',
          defaultValue: false,
        });
        monorepo = await UtilsTerminal.confirm({
          message: 'Do you want your container to be monorepo ?',
          defaultValue: false,
        });
        Helpers.writeFile(
          [crossPlatformPath(this.cwd), config.file.package_json],
          {
            name: crossPlatformPath(path.basename(crossPlatformPath(this.cwd))),
            version: '0.0.0',
            tnp: {
              type: responseProjectType,
              monorepo,
              smart,
              version: DEFAULT_FRAMEWORK_VERSION, // OK
            },
          },
        );
      } else {
        Helpers.writeFile(
          [crossPlatformPath(this.cwd), config.file.package_json],
          {
            name: crossPlatformPath(path.basename(crossPlatformPath(this.cwd))),
            version: '0.0.0',
            tnp: {
              type: responseProjectType,
              version: DEFAULT_FRAMEWORK_VERSION, // OK
            },
          },
        );
      }

      proj = this.ins.From(crossPlatformPath(this.cwd)) as Project;
      this.project = proj;
    }
    this.project = proj;
  }
  //#endregion
}

export default {
  $Init: Helpers.CLIWRAP($Init, '$Init'),
};
