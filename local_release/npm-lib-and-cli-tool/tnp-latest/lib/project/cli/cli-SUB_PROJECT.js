"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$SubProject = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const base_cli_1 = require("./base-cli");
class $SubProject extends base_cli_1.BaseCli {
    static [lib_1.CoreModels.ClassNameStaticProperty] = '$SubProject';
    async _() {
        //#region @backend
        const choices = {
            add: {
                name: 'Add new subproject to this project (with deployment)',
            },
            test: {
                name: 'Test subproject',
            },
            mode: {
                name: 'Set production/development mode for subproject',
            },
            secrets: {
                name: 'Set stripe secrets keys',
            },
            deploy: {
                name: 'Deploy subproject',
            },
            init: {
                name: 'Init all sub-projects',
            },
            exit: {
                name: 'EXIT',
            },
        };
        let overrideSelect = Object.keys(choices).includes(this.firstArg)
            ? this.firstArg
            : void 0;
        while (true) {
            let select = overrideSelect
                ? overrideSelect
                : await lib_1.UtilsTerminal.select({
                    question: 'Select action',
                    choices,
                });
            if (overrideSelect) {
                overrideSelect = void 0;
            }
            if (select === 'add') {
                await this.project.subProject.addAndConfigure();
            }
            else if (select === 'test') {
                await this.project.subProject.testWithExampleData();
            }
            else if (select === 'mode') {
                await this.project.subProject.setModeForWorker();
            }
            else if (select === 'secrets') {
                await this.project.subProject.setWorkerSecrets();
            }
            else if (select === 'deploy') {
                await this.project.subProject.deployWorker();
            }
            else if (select === 'init') {
                await this.project.subProject.initAll();
            }
            else if (select === 'exit') {
                this._exit();
            }
        }
        //#endregion
    }
}
exports.$SubProject = $SubProject;
exports.default = {
    $SubProject: lib_2.HelpersTaon.CLIWRAP($SubProject, '$SubProject'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-SUB_PROJECT.js.map