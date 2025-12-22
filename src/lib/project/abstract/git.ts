//#region imports
import { UtilsTerminal, _, path } from 'tnp-core/src';
import { BaseGit, Helpers } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';

import type { Project } from './project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class Git extends BaseGit<Project> {

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
  __removeTagAndCommit(autoReleaseUsingConfig: boolean) {

    //#region @backendFunc
    // Helpers.error(`PLEASE RUN: `, true, true);
    // if (!tagOnly) {
    //   Helpers.error(`git reset --hard HEAD~1`, true, true);
    // }
    Helpers.error(`'release problem... `, autoReleaseUsingConfig, true);
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
  protected async _beforePushProcessAction(setOrigin: 'ssh' | 'http') {

    //#region @backendFunc
    await super._beforePushProcessAction(setOrigin);

    if (
      !this.project.git.originURL &&
      this.project.framework.isContainerChild
    ) {
      this.project
        .run(
          `git remote add ${origin} ${this.project.parent.git.originURL.replace(
            this.project.parent.name,
            this.project.name,
          )}`,
        )
        .sync();
    }

    this.project.quickFixes.removeHuskyHooks();

    //#endregion

  }
  //#endregion

  protected async removeUnnecessaryFoldersAfterPullingFromGit(): Promise<void> {

    //#region @backendFunc
    this.project.taonJson.reloadFromDisk();
    const absPaths = (this.project.taonJson.removeAfterPullingFromGit || [])
      .map(folder => {
        if (!_.isString(folder)) {
          return;
        }
        if (folder.includes('..')) {
          // prevent accessing parent folders
          return;
        }
        return this.project.pathFor(folder);
      })
      .filter(f => !!f && Helpers.exists(f));

    if (absPaths.length > 0) {
      if (
         await UtilsTerminal.confirm({
          message:
            `[taon][after-pull-action] Do you want to remove old folders: ` +
            `\n${absPaths.map(c => `- /${c}`).join('\n, ')}\n?`,
        })
      ) {
        for (let index = 0; index < absPaths.length; index++) {
          const folderAbsPath = absPaths[index];
          Helpers.taskStarted(
            `(${index + 1}/${absPaths.length}) Removing old folder: ${path.basename(folderAbsPath)}`,
          );
          Helpers.removeSymlinks(folderAbsPath);
          Helpers.removeFolderIfExists(folderAbsPath);
          Helpers.taskDone(
            `(${index + 1}/${absPaths.length}) Removed old folder ${path.basename(folderAbsPath)} done.`,
          );
        }
      }
    }
    //#endregion

  }

  protected async _afterPullProcessAction(
    setOrigin: 'ssh' | 'http',
  ): Promise<void> {
    await this.removeUnnecessaryFoldersAfterPullingFromGit();
    await super._afterPullProcessAction(setOrigin);
  }

  //#region OVERRIDE / automatically add all changes when pushing to git
  automaticallyAddAllChangesWhenPushingToGit() {
    return (
      this.project.framework.isContainer ||
      this.project.framework.isStandaloneProject ||
      this.project?.parent?.framework.isContainer
    );
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
  //#endregion

  //#endregion

}