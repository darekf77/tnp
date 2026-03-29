"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Vscode = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const base_cli_1 = require("./base-cli");
//#endregion
class $Vscode extends base_cli_1.BaseCli {
    async _() {
        this._displayMenu();
    }
    //#region display menu
    async _displayMenu() {
        //#region @backendFunc
        try {
            while (true) {
                lib_1.UtilsTerminal.clearConsole();
                const items = {
                    firstLine: {
                        name: lib_2.chalk.gray.bold('Please select Up/Down action or CTRL+C to exit'),
                    },
                    global: {
                        name: 'Apply global settings',
                        action: async () => {
                            await lib_3.UtilsVSCode.applyProperGlobalSettings();
                            await lib_1.UtilsTerminal.pressAnyKeyToContinueAsync();
                        },
                    },
                    listInstalledExtensions: {
                        name: 'List installed extensions',
                        action: async () => {
                            lib_1.UtilsTerminal.clearConsole();
                            await lib_1.UtilsTerminal.previewLongList(lib_3.UtilsVSCode.installedExtensions().map((c, index) => `${index + 1}. ${c}`), 'List of installed extensions');
                            // UtilsTerminal.pressAnyKey();
                        },
                    },
                    installExtensions: {
                        name: 'Install all recommended extensions',
                        action: async () => {
                            // UtilsTerminal.clearConsole();
                            await lib_3.UtilsVSCode.installExtensions();
                        },
                    },
                    installUninstallExtensions: {
                        name: 'Install all recommended and uninstall deprecated extensions',
                        action: async () => {
                            // UtilsTerminal.clearConsole();
                            await lib_3.UtilsVSCode.installAndRemoveDeprecatedExtensions();
                        },
                    },
                    removeDeprecated: {
                        name: 'Uninstall deprecated extensions',
                        action: async () => {
                            // UtilsTerminal.clearConsole();
                            await lib_3.UtilsVSCode.removeDeprecated();
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
                await lib_1.UtilsTerminal.selectActionAndExecute(items, {
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
        lib_3.UtilsVSCode.applyProperGlobalSettings();
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
exports.$Vscode = $Vscode;
exports.default = {
    $Vscode: lib_3.HelpersTaon.CLIWRAP($Vscode, '$Vscode'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-VSCODE.js.map