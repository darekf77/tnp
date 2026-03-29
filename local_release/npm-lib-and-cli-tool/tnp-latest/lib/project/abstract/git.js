"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Git = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
//#endregion
// @ts-ignore TODO weird inheritance problem
class Git extends lib_2.BaseGit {
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
        // Helpers.error(`PLEASE RUN: `, true, true);
        // if (!tagOnly) {
        //   Helpers.error(`git reset --hard HEAD~1`, true, true);
        // }
        lib_2.Helpers.error(`'release problem... `, autoReleaseUsingConfig, true);
        // if (autoReleaseUsingConfig) {
        //   Helpers.error('release problem...', false, true);
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
            if (!lib_1._.isString(folder)) {
                return;
            }
            if (folder.includes('..')) {
                // prevent accessing parent folders
                return;
            }
            return this.project.pathFor(folder);
        })
            .filter(f => !!f && lib_2.Helpers.exists(f));
        if (absPaths.length > 0) {
            if (await lib_1.UtilsTerminal.confirm({
                message: `[taon][after-pull-action] Do you want to remove old folders: ` +
                    `\n${absPaths.map(c => `- /${c}`).join('\n, ')}\n?`,
            })) {
                for (let index = 0; index < absPaths.length; index++) {
                    const folderAbsPath = absPaths[index];
                    lib_2.Helpers.taskStarted(`(${index + 1}/${absPaths.length}) Removing old folder: ${lib_1.path.basename(folderAbsPath)}`);
                    lib_2.Helpers.removeSymlinks(folderAbsPath);
                    lib_2.Helpers.removeFolderIfExists(folderAbsPath);
                    lib_2.Helpers.taskDone(`(${index + 1}/${absPaths.length}) Removed old folder ${lib_1.path.basename(folderAbsPath)} done.`);
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
exports.Git = Git;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/git.js.map