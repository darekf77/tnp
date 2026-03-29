//#region imports
import { LibTypeEnum } from 'tnp-core/lib-prod';
import { path } from 'tnp-core/lib-prod';
import { Helpers__NS__error, Helpers__NS__info, Helpers__NS__openFolderInFileExplorer, HelpersTaon__NS__CLIWRAP } from 'tnp-helpers/lib-prod';
import { packageJsonMainProject, taonJsonMainProject, } from '../../constants';
import { BaseCli } from './base-cli';
//#endregion
// @ts-ignore TODO weird inheritance problem
export class $Open extends BaseCli {
    _() {
        Helpers__NS__info('Opening folder...');
        let pathToFolder = this.firstArg;
        if (!pathToFolder) {
            pathToFolder = this.cwd;
        }
        if (!path.isAbsolute(pathToFolder)) {
            pathToFolder = this.project.pathFor(pathToFolder);
        }
        Helpers__NS__openFolderInFileExplorer(pathToFolder);
        this._exit();
    }
    async CORE_CONTAINER() {
        if (!this.project?.framework?.coreContainer) {
            Helpers__NS__error(`This is not taon project`);
        }
        await this.project?.framework?.coreContainer?.openInEditor();
        this._exit();
    }
    async CORE_PROJECT() {
        if (!this.project?.framework?.coreProject) {
            Helpers__NS__error(`This is not taon project`);
        }
        await this.project?.framework?.coreProject?.openInEditor();
        this._exit();
    }
    async TNP_PROJECT() {
        if (!this.project?.ins?.Tnp) {
            Helpers__NS__error(`This is not taon project`);
        }
        await this.project.ins.Tnp?.openInEditor();
        this._exit();
    }
    async UNSTAGE() {
        const proj = this.project.ins.Current;
        const childrenThanAreLibs = proj.children.filter(c => {
            return c.typeIs(...[LibTypeEnum.ISOMORPHIC_LIB]);
        });
        const unstageProjects = childrenThanAreLibs.filter(f => f.git.thereAreSomeUncommitedChangeExcept([
            packageJsonMainProject,
            taonJsonMainProject,
        ]));
        for (const unstageProj of unstageProjects) {
            await unstageProj.openInEditor();
        }
        this._exit();
    }
}
export default {
    $Open: HelpersTaon__NS__CLIWRAP($Open, '$Open'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-OPEN.js.map