//#region imports
import { BaseGit, Helpers } from 'tnp-helpers/src';

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

  //#region push to git repo
  /**
   *
   * @param newVersion
   * @param pushWithoutAsking
   */
  async tagAndPushToGitRepo(newVersion: string, pushWithoutAsking = false):Promise<void> {
    //#region @backendFunc
    const pushFun = async () => {
      if (newVersion) {
        const tagName = `v${newVersion}`;
        const commitMessage = 'new version ' + newVersion;
        try {
          this.project
            .run(`git tag -a ${tagName} ` + `-m "${commitMessage}"`, {
              output: false,
            })
            .sync();
        } catch (error) {
          Helpers.error(`Not able to tag project`, false, true);
        }
        const lastCommitHash = this.project.git.lastCommitHash();
        this.project.packageJson.setBuildHash(lastCommitHash);

        this.project.git.__commitRelease(newVersion, `release: `);
      } else {
        this.project.git.__commitRelease();
      }

      Helpers.log('Pushing to git repository... ');
      Helpers.log(`Git branch: ${this.project.git.currentBranchName}`);
      await this.project.git.pushCurrentBranch({ askToRetry: true });
      Helpers.info('Pushing to git repository done.');
    };

    if (pushWithoutAsking) {
      await pushFun();
    } else {
      await Helpers.questionYesNo('Push changes to git repo ?', async () => {
        await pushFun();
      });
    }
    //#endregion
  }
  //#endregion

  //#region commit release
  public __commitRelease(newVer?: string, message = 'new version') {
    //#region @backendFunc
    if (newVer) {
      this.stageAllAndCommit(`${message} v${newVer}`);
    } else {
      this.stageAllAndCommit('relese update');
    }
    //#endregion
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

    this.project.removeFolderByRelativePath('node_modules/husky');

    // if (this.project.framework.isStandaloneProject) {
    //   if (this.project.hasFile(`.vscode/launch.json`)) {
    //     const launchJson =
    //       this.project.readJson<LaunchJson>(`.vscode/launch.json`);

    //     const typeNode = launchJson.configurations.find(
    //       (c: any) => c.type === 'node',
    //     );
    //     if (typeNode) {
    //       typeNode.outFiles = this.project.defaultOutFilesLaunchJson;
    //     }
    //   }
    // }

    // ? TODO not needed anymore
    // if (this.project.name === config.frameworkNames.productionFrameworkName) {
    //   config.activeFramewrokVersions.forEach(frameworkVersion => {
    //     // console.log(`Active Framework: ${frameworkVersion}`)
    //     const taonProjectContainerPath = path.join(
    //       this.project.location,
    //       'projects',
    //       `container${frameworkVersion === 'v1' ? '' : `-${frameworkVersion}`}`,
    //     );
    //     const containerCoreForVersion = this.project.ins.From(
    //       taonProjectContainerPath,
    //     ) as Project;
    //     if (containerCoreForVersion) {
    //       Helpers.info(
    //         `[${config.frameworkName}] updating on push global container${
    //           frameworkVersion === 'v1' ? '' : `-${frameworkVersion}`
    //         } in ${this.project.name}`,
    //       );
    //       containerCoreForVersion.packageJson.save(
    //         'Updating taon container',
    //       );
    //     } else {
    //       Helpers.warn(
    //         `[taon][hotfix] Not able to find container for framework version ${frameworkVersion}`,
    //       );
    //     }
    //   });
    // }

    //#endregion
  }
  //#endregion

  //#region OVERRIDE / before pull action
  protected async _beforePullProcessAction(setOrigin: 'ssh' | 'http') {
    //#region @backendFunc
    await super._beforePullProcessAction(setOrigin);
    // await Helpers.killAllNodeExceptCurrentProcess();
    //#endregion
  }
  //#endregion

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
