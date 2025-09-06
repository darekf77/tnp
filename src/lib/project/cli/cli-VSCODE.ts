//#region imports
import { config } from 'tnp-config/src';
import { CoreModels, _, crossPlatformPath, os, path } from 'tnp-core/src';
import { UtilsTerminal } from 'tnp-core/src';
import { chalk } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { MESSAGES, TEMP_DOCS } from '../../constants';
import { EnvOptions } from '../../options';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';
//#endregion

export class $Vscode extends BaseCli {
  public async _(): Promise<void> {
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
  GLOBAL(): void {
    this.project.vsCodeHelpers.applyProperGlobalSettings();
    this._exit();
  }
  //#endregion

  TEMP_SHOW(): void {
    this._showfilesfor(this.project.ins.Current);
    this._exit();
  }

  TEMP_HIDE(): void {
    this._hidefilesfor(this.project);
    this._exit();
  }

  INIT(): void {
    this.project.vsCodeHelpers.toogleFilesVisibilityInVscode({
      action: 'hide-files',
    });
    this._exit();
  }

  _showfilesfor(project: Project): void {
    project.vsCodeHelpers.toogleFilesVisibilityInVscode({
      action: 'show-files',
    });
  }

  _hidefilesfor(project: Project): void {
    project.vsCodeHelpers.toogleFilesVisibilityInVscode({
      action: 'hide-files',
    });
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
