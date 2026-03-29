"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Open = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
const base_cli_1 = require("./base-cli");
//#endregion
// @ts-ignore TODO weird inheritance problem
class $Open extends base_cli_1.BaseCli {
    _() {
        lib_3.Helpers.info('Opening folder...');
        let pathToFolder = this.firstArg;
        if (!pathToFolder) {
            pathToFolder = this.cwd;
        }
        if (!lib_2.path.isAbsolute(pathToFolder)) {
            pathToFolder = this.project.pathFor(pathToFolder);
        }
        lib_3.Helpers.openFolderInFileExplorer(pathToFolder);
        this._exit();
    }
    async CORE_CONTAINER() {
        if (!this.project?.framework?.coreContainer) {
            lib_3.Helpers.error(`This is not taon project`);
        }
        await this.project?.framework?.coreContainer?.openInEditor();
        this._exit();
    }
    async CORE_PROJECT() {
        if (!this.project?.framework?.coreProject) {
            lib_3.Helpers.error(`This is not taon project`);
        }
        await this.project?.framework?.coreProject?.openInEditor();
        this._exit();
    }
    async TNP_PROJECT() {
        if (!this.project?.ins?.Tnp) {
            lib_3.Helpers.error(`This is not taon project`);
        }
        await this.project.ins.Tnp?.openInEditor();
        this._exit();
    }
    async UNSTAGE() {
        const proj = this.project.ins.Current;
        const childrenThanAreLibs = proj.children.filter(c => {
            return c.typeIs(...[lib_1.LibTypeEnum.ISOMORPHIC_LIB]);
        });
        const unstageProjects = childrenThanAreLibs.filter(f => f.git.thereAreSomeUncommitedChangeExcept([
            constants_1.packageJsonMainProject,
            constants_1.taonJsonMainProject,
        ]));
        for (const unstageProj of unstageProjects) {
            await unstageProj.openInEditor();
        }
        this._exit();
    }
}
exports.$Open = $Open;
exports.default = {
    $Open: lib_3.HelpersTaon.CLIWRAP($Open, '$Open'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-OPEN.js.map