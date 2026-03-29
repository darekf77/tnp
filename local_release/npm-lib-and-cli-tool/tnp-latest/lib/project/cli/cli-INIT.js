"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Init = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
const base_cli_1 = require("./base-cli");
// @ts-ignore TODO weird inheritance problem
class $Init extends base_cli_1.BaseCli {
    //#region prepare args
    async __initialize__() {
        await super.__initialize__();
        await this.__askForWhenEmpty();
    }
    //#endregion
    //#region init
    async _(struct = false, recursiveAction = false) {
        await this.project.init(this.params.clone({
            purpose: 'cli init',
            recursiveAction,
            init: {
                struct,
            },
            finishCallback: () => {
                console.log('DONE!');
                this._exit();
            },
        }));
    }
    //#endregion
    async clearInit() {
        await this.project.clear();
        await this._();
    }
    async all() {
        await this._(false, true);
    }
    //#region struct
    async struct() {
        await this._(true);
    }
    //#endregion
    async templatesBuilder() {
        await this.project.artifactsManager.artifact.npmLibAndCliTool.filesTemplatesBuilder.rebuild(this.params);
        this._exit();
    }
    vscode() {
        this.project.vsCodeHelpers.toogleFilesVisibilityInVscode({
            action: 'hide-files',
        });
    }
    //#region ask when empty
    async __askForWhenEmpty() {
        if (lib_3.Helpers.exists((0, lib_2.crossPlatformPath)(lib_2.path.join((0, lib_2.crossPlatformPath)(this.cwd), constants_1.packageJsonMainProject)))) {
            return;
        }
        let proj;
        const yesNewProj = await lib_3.Helpers.questionYesNo(`Do you wanna init project in this folder ?`);
        if (yesNewProj) {
            const responseProjectType = // @ts-ignore
             await lib_3.Helpers.autocompleteAsk(`Choose type of project`, [
                { name: 'Container', value: lib_1.LibTypeEnum.CONTAINER },
                { name: 'Isomorphic Lib', value: lib_1.LibTypeEnum.ISOMORPHIC_LIB },
            ]);
            let organization = false;
            let monorepo = false;
            if (responseProjectType === lib_1.LibTypeEnum.CONTAINER) {
                organization = await lib_2.UtilsTerminal.confirm({
                    message: 'Do you wanna use smart container for organization project ?',
                    defaultValue: false,
                });
                monorepo = await lib_2.UtilsTerminal.confirm({
                    message: 'Do you want your container to be monorepo ?',
                    defaultValue: false,
                });
                lib_3.Helpers.writeFile([(0, lib_2.crossPlatformPath)(this.cwd), constants_1.packageJsonMainProject], {
                    name: (0, lib_2.crossPlatformPath)(lib_2.path.basename((0, lib_2.crossPlatformPath)(this.cwd))),
                    version: '0.0.0',
                });
                lib_3.Helpers.writeFile([(0, lib_2.crossPlatformPath)(this.cwd), constants_1.taonJsonMainProject], {
                    type: lib_1.LibTypeEnum.CONTAINER,
                    monorepo,
                    organization,
                    version: constants_1.DEFAULT_FRAMEWORK_VERSION, // OK
                });
            }
            else {
                lib_3.Helpers.writeFile([(0, lib_2.crossPlatformPath)(this.cwd), constants_1.packageJsonMainProject], {
                    name: (0, lib_2.crossPlatformPath)(lib_2.path.basename((0, lib_2.crossPlatformPath)(this.cwd))),
                    version: '0.0.0',
                    tnp: {
                        type: responseProjectType,
                        version: constants_1.DEFAULT_FRAMEWORK_VERSION, // OK
                    },
                });
                lib_3.Helpers.writeFile([(0, lib_2.crossPlatformPath)(this.cwd), constants_1.taonJsonMainProject], {
                    type: lib_1.LibTypeEnum.ISOMORPHIC_LIB,
                    version: constants_1.DEFAULT_FRAMEWORK_VERSION, // OK
                });
            }
            proj = this.ins.From((0, lib_2.crossPlatformPath)(this.cwd));
            this.project = proj;
        }
        this.project = proj;
    }
}
exports.$Init = $Init;
exports.default = {
    $Init: lib_3.HelpersTaon.CLIWRAP($Init, '$Init'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-INIT.js.map