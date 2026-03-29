import { UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__selectActionAndExecute } from 'tnp-core/lib-prod';
import { chalk } from 'tnp-core/lib-prod';
import { HelpersTaon__NS__CLIWRAP, UtilsVSCode__NS__applyProperGlobalSettings, UtilsVSCode__NS__installAndRemoveDeprecatedExtensions, UtilsVSCode__NS__installedExtensions, UtilsVSCode__NS__installExtensions, UtilsVSCode__NS__removeDeprecated } from 'tnp-helpers/lib-prod';
import { BaseCli } from './base-cli';
//#endregion
export class $Vscode extends BaseCli {
    async _() {
        this._displayMenu();
    }
    //#region display menu
    async _displayMenu() {
        //#region @backendFunc
        try {
            while (true) {
                UtilsTerminal__NS__clearConsole();
                const items = {
                    firstLine: {
                        name: chalk.gray.bold('Please select Up/Down action or CTRL+C to exit'),
                    },
                    global: {
                        name: 'Apply global settings',
                        action: async () => {
                            await UtilsVSCode__NS__applyProperGlobalSettings();
                            await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
                        },
                    },
                    listInstalledExtensions: {
                        name: 'List installed extensions',
                        action: async () => {
                            UtilsTerminal__NS__clearConsole();
                            await UtilsTerminal__NS__previewLongList(UtilsVSCode__NS__installedExtensions().map((c, index) => `${index + 1}. ${c}`), 'List of installed extensions');
                            // UtilsTerminal__NS__pressAnyKey();
                        },
                    },
                    installExtensions: {
                        name: 'Install all recommended extensions',
                        action: async () => {
                            // UtilsTerminal__NS__clearConsole();
                            await UtilsVSCode__NS__installExtensions();
                        },
                    },
                    installUninstallExtensions: {
                        name: 'Install all recommended and uninstall deprecated extensions',
                        action: async () => {
                            // UtilsTerminal__NS__clearConsole();
                            await UtilsVSCode__NS__installAndRemoveDeprecatedExtensions();
                        },
                    },
                    removeDeprecated: {
                        name: 'Uninstall deprecated extensions',
                        action: async () => {
                            // UtilsTerminal__NS__clearConsole();
                            await UtilsVSCode__NS__removeDeprecated();
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
                await UtilsTerminal__NS__selectActionAndExecute(items, {
                    autocomplete: false,
                });
                // lastAction = res.selected !== 'firstLine';
            }
        }
        catch (error) {
            error && console.error('error', error);
            this._exit();
        }
        //#endregion
    }
    //#endregion
    //#region global
    GLOBAL() {
        UtilsVSCode__NS__applyProperGlobalSettings();
        this._exit();
    }
    //#endregion
    TEMP_SHOW() {
        if (!this.project) {
            return;
        }
        this._showfilesfor(this.project.ins.Current);
        this._exit();
    }
    TEMP_HIDE() {
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
    INIT() {
        if (!this.project) {
            return;
        }
        this._init();
        this._exit();
    }
    _showfilesfor(project) {
        project.vsCodeHelpers.toogleFilesVisibilityInVscode({
            action: 'show-files',
        });
    }
    _hidefilesfor(project) {
        project.vsCodeHelpers.toogleFilesVisibilityInVscode({
            action: 'hide-files',
        });
    }
}
export default {
    $Vscode: HelpersTaon__NS__CLIWRAP($Vscode, '$Vscode'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-VSCODE.js.map