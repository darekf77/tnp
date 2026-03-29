"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$App = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const options_1 = require("../../options");
const base_cli_1 = require("./base-cli");
//#endregion
// @ts-ignore TODO weird inheritance problem
class $App extends base_cli_1.BaseCli {
    async _() {
        //#region @backendFunc
        const choices = {
            startAppWatch: {
                name: 'Start ng serve app for watch NORMAL node',
            },
            startAppWatchWebsql: {
                name: 'Start ng serve app for watch WEBSQL mode',
            },
            startElectronWatch: {
                name: 'Start ng serve app for watch ELECTRON mode',
            },
        };
        const chosen = this.params['websql']
            ? 'startAppWatchWebsql'
            : await lib_1.UtilsTerminal.select({
                choices,
                question: 'Select app development start mode:',
            });
        await this._build({
            websql: chosen === 'startAppWatchWebsql',
            electron: chosen === 'startElectronWatch',
        });
        //#endregion
    }
    async _build({ websql, electron, }) {
        lib_2.Helpers.info(`Starting ${websql ? 'WEBSQL' : 'NORMAL'} APP in watch mode...`);
        await this.project.build(this.params.clone({
            release: {
                targetArtifact: electron
                    ? options_1.ReleaseArtifactTaon.ELECTRON_APP
                    : options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP,
            },
            build: {
                watch: true,
                websql,
            },
        }));
    }
    async electron() {
        await this._build({ websql: false, electron: true });
    }
    async el() {
        await this.electron();
    }
    async electronWebsql() {
        await this._build({ websql: true, electron: true });
    }
    async websql() {
        await this._build({ websql: true });
    }
    async normal() {
        await this._build({ websql: false });
    }
}
exports.$App = $App;
exports.default = {
    $App: lib_2.HelpersTaon.CLIWRAP($App, '$App'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-APP.js.map