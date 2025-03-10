//#region imports
import { config } from 'tnp-config/src';
import { CoreModels, _, crossPlatformPath, os, path } from 'tnp-core/src';
import { UtilsTerminal } from 'tnp-core/src';
import { chalk } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { MESSAGES, TEMP_DOCS } from '../../constants';
import { BuildOptions, InitOptions } from '../../options';
import type { Project } from '../abstract/project';
//#endregion

export class $Vscode extends BaseCommandLineFeature<
  {
    o: string;
    copyto?: string[];
    copytoall?: boolean;
  }, // @ts-ignore TODO weird inheritance problem
  Project
> {
  public async _() {
    this._displayMenu();
  }

  //#region display menu
  async _displayMenu(): Promise<void> {
    //#region @backendFunc
    try {
      while (true) {
        UtilsTerminal.clearConsole();
        await UtilsTerminal.selectActionAndExecute(
          {
            firstLine: {
              name: chalk.gray.bold(
                'Please select Up/Down action or CTRL+C to exit',
              ),
            },
            global: {
              name: 'Apply global settings',
              action: async () => {
                await this.project.vsCodeHelpers.applyProperGlobalSettings();
                await UtilsTerminal.pressAnyKeyToContinueAsync();
              },
            },
            listInstalledExtensions: {
              name: 'List installed extensions',
              action: async () => {
                UtilsTerminal.clearConsole();
                await UtilsTerminal.previewLongList(
                  this.project.vsCodeHelpers.installedExtensions,
                  'List of installed extensions',
                );
                // UtilsTerminal.pressAnyKey();
              },
            },
            installExtensions: {
              name: 'Install all recommended extensions',
              action: async () => {
                // UtilsTerminal.clearConsole();
                await this.project.vsCodeHelpers.installExtensions();
              },
            },
            initLocalSettings: {
              name: 'Init local settings',
              action: async () => {
                await this.INIT();
              },
            },
          },
          {
            autocomplete: false,
          },
        );
        // lastAction = res.selected !== 'firstLine';
      }
    } catch (error) {
      error && console.error('error', error);
      this._exit();
    }
    //#endregion
  }
  //#endregion

  //#region global
  GLOBAL() {
    this.project.vsCodeHelpers.applyProperGlobalSettings();
    this._exit();
  }
  //#endregion

  TEMP_SHOW() {
    this._showfilesfor(this.project.ins.Current);
    this._exit();
  }

  TEMP_HIDE() {
    this._hidefilesfor(this.project);
    this._exit();
  }

  INIT() {
    this.project.artifactsManager.artifact.npmLibAndCliTool.filesRecreator.vscode.settings.hideOrShowFilesInVscode();
    this._exit();
  }

  _showfilesfor(project: Project) {
    project.artifactsManager.artifact.npmLibAndCliTool.filesRecreator.vscode.settings.hideOrShowFilesInVscode(
      false,
    );
  }

  _hidefilesfor(project: Project) {
    project.artifactsManager.artifact.npmLibAndCliTool.filesRecreator.vscode.settings.hideOrShowFilesInVscode(
      true,
    );
  }

  async vsce() {
    await this.project.artifactsManager.artifact.vscodePlugin.createVscePackage(
      {
        args: this.argsWithParams,
      },
    );
    this._exit();
  }
}

export default {
  $Vscode: Helpers.CLIWRAP($Vscode, '$Vscode'),
};
