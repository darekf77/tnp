//#region @backend
import { CoreModels, _, crossPlatformPath, path } from "tnp-core/src";
import { Helpers } from "tnp-helpers/src";
import { CommandLineFeature } from "tnp-helpers/src";
import { Project } from "../abstract/project";
import { BuildOptions, InitOptions } from "../../build-options";
import { MESSAGES, TEMP_DOCS } from "../../constants";
import { config } from "tnp-config/src";

export class $Init extends CommandLineFeature<InitOptions, Project> {

  protected async __initialize__() {
    this.__askForWhenEmpty();
    this._tryResolveChildIfInsideArg();
    this.params = InitOptions.from(this.params);
  }


  public async _() {
    await this.project.init(InitOptions.from({
      finishCallback: () => this._exit()
    }));
  }

  async struct() {
    await this.project.init(InitOptions.from({
      struct: true,
      finishCallback: () => this._exit(),
    }));
  }

  async templatesBuilder() {
    await this.project.__filesTemplatesBuilder.rebuild();
    this._exit()
  }

  vscode() {
    this.project.__recreate.vscode.settings.hideOrShowFilesInVscode();
  }
  //#region ask when empty
  private async __askForWhenEmpty(): Promise<void> {
    if (Helpers.exists(crossPlatformPath(path.join(crossPlatformPath(
      this.cwd),
      config.file.package_json)))) {
      return;
    }
    let proj: Project;
    const yesNewProj = await Helpers.questionYesNo(`Do you wanna init project in this folder ?`);
    if (yesNewProj) {
      const responseProjectType = await Helpers.autocompleteAsk<CoreModels.LibType>(`Choose type of project`, [
        { name: 'Container', value: 'container' },
        { name: 'Isomorphic Lib', value: 'isomorphic-lib' },
      ]);
      let smart = false;
      let monorepo = false;
      if (responseProjectType === 'container') {
        smart = await Helpers.consoleGui.question.yesNo('Do you wanna use smart container for organization project ?');
        monorepo = await Helpers.consoleGui.question.yesNo('Do you want your container to be monorepo ?');
        Helpers.writeFile([crossPlatformPath(process.cwd()), config.file.package_json], {
          name: crossPlatformPath(path.basename(crossPlatformPath(process.cwd()))),
          version: '0.0.0',
          tnp: {
            type: responseProjectType,
            monorepo,
            smart,
            version: config.defaultFrameworkVersion, // OK
          }
        });
      } else {
        Helpers.writeFile([crossPlatformPath(process.cwd()), config.file.package_json], {
          name: crossPlatformPath(path.basename(crossPlatformPath(process.cwd()))),
          version: '0.0.0',
          tnp: {
            type: responseProjectType,
            version: config.defaultFrameworkVersion, // OK
          }
        });
      }

      proj = Project.ins.From(crossPlatformPath(process.cwd())) as Project;
      this.project = proj;
    }
    this.project = proj;
  };
  //#endregion
}


export default {
  $Init: Helpers.CLIWRAP($Init, '$Init'),
}
//#endregion
