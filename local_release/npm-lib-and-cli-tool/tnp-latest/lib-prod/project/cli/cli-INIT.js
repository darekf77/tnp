import { LibTypeEnum } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, UtilsTerminal__NS__confirm } from 'tnp-core/lib-prod';
import { Helpers__NS__exists, Helpers__NS__questionYesNo, Helpers__NS__writeFile, HelpersTaon__NS__CLIWRAP } from 'tnp-helpers/lib-prod';
import { DEFAULT_FRAMEWORK_VERSION, packageJsonMainProject, taonJsonMainProject, } from '../../constants';
import { BaseCli } from './base-cli';
// @ts-ignore TODO weird inheritance problem
export class $Init extends BaseCli {
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
        if (Helpers__NS__exists(crossPlatformPath(path.join(crossPlatformPath(this.cwd), packageJsonMainProject)))) {
            return;
        }
        let proj;
        const yesNewProj = await Helpers__NS__questionYesNo(`Do you wanna init project in this folder ?`);
        if (yesNewProj) {
            const responseProjectType = // @ts-ignore
             await Helpers.autocompleteAsk(`Choose type of project`, [
                { name: 'Container', value: LibTypeEnum.CONTAINER },
                { name: 'Isomorphic Lib', value: LibTypeEnum.ISOMORPHIC_LIB },
            ]);
            let organization = false;
            let monorepo = false;
            if (responseProjectType === LibTypeEnum.CONTAINER) {
                organization = await UtilsTerminal__NS__confirm({
                    message: 'Do you wanna use smart container for organization project ?',
                    defaultValue: false,
                });
                monorepo = await UtilsTerminal__NS__confirm({
                    message: 'Do you want your container to be monorepo ?',
                    defaultValue: false,
                });
                Helpers__NS__writeFile([crossPlatformPath(this.cwd), packageJsonMainProject], {
                    name: crossPlatformPath(path.basename(crossPlatformPath(this.cwd))),
                    version: '0.0.0',
                });
                Helpers__NS__writeFile([crossPlatformPath(this.cwd), taonJsonMainProject], {
                    type: LibTypeEnum.CONTAINER,
                    monorepo,
                    organization,
                    version: DEFAULT_FRAMEWORK_VERSION, // OK
                });
            }
            else {
                Helpers__NS__writeFile([crossPlatformPath(this.cwd), packageJsonMainProject], {
                    name: crossPlatformPath(path.basename(crossPlatformPath(this.cwd))),
                    version: '0.0.0',
                    tnp: {
                        type: responseProjectType,
                        version: DEFAULT_FRAMEWORK_VERSION, // OK
                    },
                });
                Helpers__NS__writeFile([crossPlatformPath(this.cwd), taonJsonMainProject], {
                    type: LibTypeEnum.ISOMORPHIC_LIB,
                    version: DEFAULT_FRAMEWORK_VERSION, // OK
                });
            }
            proj = this.ins.From(crossPlatformPath(this.cwd));
            this.project = proj;
        }
        this.project = proj;
    }
}
export default {
    $Init: HelpersTaon__NS__CLIWRAP($Init, '$Init'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-INIT.js.map