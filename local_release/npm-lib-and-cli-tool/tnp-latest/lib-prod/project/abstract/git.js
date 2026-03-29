//#region imports
import { path, ___NS__isString, UtilsTerminal__NS__confirm } from 'tnp-core/lib-prod';
import { BaseGit, Helpers__NS__error, Helpers__NS__exists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeSymlinks, Helpers__NS__taskDone, Helpers__NS__taskStarted } from 'tnp-helpers/lib-prod';
//#endregion
// @ts-ignore TODO weird inheritance problem
export class Git extends BaseGit {
    //#region overridden is using action commit
    /**
     * @overload
     */
    isUsingActionCommit() {
        return true;
    }
    //#endregion
    //#region remove tag nad commit
    /**
     * @deprecated
     */
    __removeTagAndCommit(autoReleaseUsingConfig) {
        //#region @backendFunc
        // Helpers__NS__error(`PLEASE RUN: `, true, true);
        // if (!tagOnly) {
        //   Helpers__NS__error(`git reset --hard HEAD~1`, true, true);
        // }
        Helpers__NS__error(`'release problem... `, autoReleaseUsingConfig, true);
        // if (autoReleaseUsingConfig) {
        //   Helpers__NS__error('release problem...', false, true);
        // }
        //#endregion
    }
    //#endregion
    //#region OVERRIDE
    //#region OVERRIDE / use git branches when commting and pushing
    useGitBranchesWhenCommitingAndPushing() {
        return false;
    }
    //#endregion
    //#region OVERRIDE / use git branches as metadata for commits
    useGitBranchesAsMetadataForCommits() {
        return false;
    }
    //#endregion
    //#region OVERRIDE / before push action
    async _beforePushProcessAction(setOrigin) {
        //#region @backendFunc
        await super._beforePushProcessAction(setOrigin);
        if (!this.project.git.originURL &&
            this.project.framework.isContainerChild) {
            this.project
                .run(`git remote add ${origin} ${this.project.parent.git.originURL.replace(this.project.parent.name, this.project.name)}`)
                .sync();
        }
        this.project.quickFixes.removeHuskyHooks();
        //#endregion
    }
    //#endregion
    async removeUnnecessaryFoldersAfterPullingFromGit() {
        //#region @backendFunc
        this.project.taonJson.reloadFromDisk();
        const absPaths = (this.project.taonJson.removeAfterPullingFromGit || [])
            .map(folder => {
            if (!___NS__isString(folder)) {
                return;
            }
            if (folder.includes('..')) {
                // prevent accessing parent folders
                return;
            }
            return this.project.pathFor(folder);
        })
            .filter(f => !!f && Helpers__NS__exists(f));
        if (absPaths.length > 0) {
            if (await UtilsTerminal__NS__confirm({
                message: `[taon][after-pull-action] Do you want to remove old folders: ` +
                    `\n${absPaths.map(c => `- /${c}`).join('\n, ')}\n?`,
            })) {
                for (let index = 0; index < absPaths.length; index++) {
                    const folderAbsPath = absPaths[index];
                    Helpers__NS__taskStarted(`(${index + 1}/${absPaths.length}) Removing old folder: ${path.basename(folderAbsPath)}`);
                    Helpers__NS__removeSymlinks(folderAbsPath);
                    Helpers__NS__removeFolderIfExists(folderAbsPath);
                    Helpers__NS__taskDone(`(${index + 1}/${absPaths.length}) Removed old folder ${path.basename(folderAbsPath)} done.`);
                }
            }
        }
        //#endregion
    }
    async _afterPullProcessAction(setOrigin) {
        await this.removeUnnecessaryFoldersAfterPullingFromGit();
        await super._afterPullProcessAction(setOrigin);
    }
    //#region OVERRIDE / automatically add all changes when pushing to git
    automaticallyAddAllChangesWhenPushingToGit() {
        return (this.project.framework.isContainer ||
            this.project.framework.isStandaloneProject ||
            this.project?.parent?.framework.isContainer);
    }
    //#endregion
    //#region OVERRIDE / during push warn if project not on specyfic dev branch
    duringPushWarnIfProjectNotOnSpecyficDevBranch() {
        return 'master';
    }
    //#endregion
    //#region OVERRIDE / overridden get default develop Branch
    getDefaultDevelopmentBranch() {
        return 'master';
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/git.js.map