import { CoreModels__NS__ClassNameStaticProperty, UtilsTerminal__NS__select } from 'tnp-core/lib-prod';
import { HelpersTaon__NS__CLIWRAP } from 'tnp-helpers/lib-prod';
import { BaseCli } from './base-cli';
export class $SubProject extends BaseCli {
    static [CoreModels__NS__ClassNameStaticProperty] = '$SubProject';
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
                : await UtilsTerminal__NS__select({
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
export default {
    $SubProject: HelpersTaon__NS__CLIWRAP($SubProject, '$SubProject'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-SUB_PROJECT.js.map