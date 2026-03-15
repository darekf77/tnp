//#region imports
import { config, UtilsOs } from 'tnp-core/src';
import { CoreModels, _, crossPlatformPath, os, path } from 'tnp-core/src';
import { UtilsTerminal } from 'tnp-core/src';
import { chalk } from 'tnp-core/src';
import {
  BaseVscodeHelpers,
  Helpers,
  HelpersTaon,
  UtilsVSCode,
} from 'tnp-helpers/src';
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

        const items = {
          firstLine: {
            name: chalk.gray.bold(
              'Please select Up/Down action or CTRL+C to exit',
            ),
          },
          global: {
            name: 'Apply global settings',
            action: async () => {
              await UtilsVSCode.applyProperGlobalSettings();
              await UtilsTerminal.pressAnyKeyToContinueAsync();
            },
          },
          listInstalledExtensions: {
            name: 'List installed extensions',
            action: async () => {
              UtilsTerminal.clearConsole();
              await UtilsTerminal.previewLongList(
                UtilsVSCode.installedExtensions().map(
                  (c, index) => `${index + 1}. ${c}`,
                ),
                'List of installed extensions',
              );
              // UtilsTerminal.pressAnyKey();
            },
          },
          installExtensions: {
            name: 'Install all recommended extensions',
            action: async () => {
              // UtilsTerminal.clearConsole();
              await UtilsVSCode.installExtensions();
            },
          },
          initLocalSettings: {
            name: 'Init local settings',
            action: async () => {
              await this._init();
            },
          },
        };

        if (!this.project) {
          delete items.initLocalSettings;
        }

        await UtilsTerminal.selectActionAndExecute(items, {
          autocomplete: false,
        });
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
    UtilsVSCode.applyProperGlobalSettings();
    this._exit();
  }
  //#endregion

  TEMP_SHOW(): void {
    if (!this.project) {
      return;
    }
    this._showfilesfor(this.project.ins.Current);
    this._exit();
  }

  TEMP_HIDE(): void {
    if (!this.project) {
      return;
    }
    this._hidefilesfor(this.project);
    this._exit();
  }

  _init() {
    this.project.vsCodeHelpers.toogleFilesVisibilityInVscode({
      action: 'hide-files',
    });
  }

  INIT(): void {
    if (!this.project) {
      return;
    }
    this._init();
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
}

export default {
  $Vscode: HelpersTaon.CLIWRAP($Vscode, '$Vscode'),
};