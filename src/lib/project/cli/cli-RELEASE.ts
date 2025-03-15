import { config } from 'tnp-config/src';
import { CoreModels, _, UtilsTerminal, path, chalk } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { Models } from '../../models';
import {
  BuildOptions,
  ReleaseArtifactTaon,
  ReleaseOptions,
  ReleaseType,
} from '../../options';
import type { Project } from '../abstract/project';

// @ts-ignore TODO weird inheritance problem
class $Release extends BaseCommandLineFeature<ReleaseOptions, Project> {
  //#region __initialize__
  __initialize__() {
    //#region resolve smart containter

    this.params = ReleaseOptions.from({ ...this.params });
    //#endregion
  }
  //#endregion

  //#region _
  public async _() {
    await this.project.releaseProcess.displayReleaseProcessMenu();
    // await this.patch();
    this._exit();
  }
  //#endregion
  async _releaseProcess(
    releaseType: ReleaseType,
    artifact?: ReleaseArtifactTaon,
  ): Promise<void> {
    const selectedProjects =
      await this.project.releaseProcess.displayProjectsSelectionMenu();
    const selectedArtifacts = artifact
      ? [artifact]
      : await this.project.releaseProcess.displaySelectArtifactsMenu(
          releaseType,
          selectedProjects,
        );
    await this.project.releaseProcess.releaseArtifacts(
      releaseType,
      selectedArtifacts,
      selectedProjects,
    );
    this._exit();
  }

  //#region local
  async local(): Promise<void> {
    await this._releaseProcess('local');
  }

  async localNpm(): Promise<void> {
    await this._releaseProcess('local', 'npm-lib-and-cli-tool');
  }

  async localVscode(): Promise<void> {
    await this._releaseProcess('local', 'vscode-plugin');
  }

  async localElectron(): Promise<void> {
    await this._releaseProcess('local', 'electron-app');
  }
  //#endregion

  async cloud(): Promise<void> {
    await this._releaseProcess('cloud');
  }

  async manual(): Promise<void> {
    await this._releaseProcess('manual');
  }

  //#region old release functions

  //#region install:locally
  async installLocally() {
    if (
      !this.project.hasFolder('out') ||
      Helpers.filesFrom(this.project.pathFor('out'), true).length === 0
    ) {
      Helpers.info('Building project...');
      await this.project.build(BuildOptions.from({ watch: false }));
    }
    await this.project.artifactsManager.artifact.vscodePlugin.installLocally(
      this.params,
    );
    this._exit();
  }

  async clearInstallLocally() {
    await this.project.artifactsManager.artifact.npmLibAndCliTool.clearPartial();
    await this.installLocally();
  }
  //#endregion

  //#region automatic release
  async auto() {
    await this._startLibCliReleaseProcess('patch', true);
  }
  //#endregion

  //#region major
  async major() {
    await this._startLibCliReleaseProcess('major');
  }
  //#endregion

  //#region minor
  async minor() {
    await this._startLibCliReleaseProcess('minor');
  }
  //#endregion

  //#region patch
  async patch() {
    await this._startLibCliReleaseProcess('patch');
  }
  //#endregion

  //#region start
  // TODO move this to release process separate class
  private async _startLibCliReleaseProcess(
    npmReleaseVersionType: CoreModels.ReleaseVersionType = 'patch',
    autoReleaseUsingConfig: boolean = false,
  ) {
    Helpers.clearConsole();
    // const taonReleaseVersionType = await this.chooseTaonReleaseVersionType();

    const releaseOptions = ReleaseOptions.from({
      ...this.params,
      releaseVersionBumpType: npmReleaseVersionType,
      autoReleaseUsingConfig,
      finishCallback: () => {
        this._exit();
      },
    });
    releaseOptions.specifiedVersion =
      this.args.find(
        k => k.startsWith('v') && Number(k.replace('v', '')) >= 3,
      ) || '';

    await this.shouldReleaseLibMessage(releaseOptions, this.project);
    await this.project.release(releaseOptions);
    this._exit();
  }
  //#endregion

  //#region should release lib
  async shouldReleaseLibMessage(
    releaseOptions: ReleaseOptions,
    project: Project,
  ) {
    //#region @backendFunc
    if (releaseOptions.autoReleaseUsingConfigDocs) {
      return false;
    }
    let newVersion;
    if (releaseOptions.releaseVersionBumpType === 'major') {
      newVersion =
        project.packageJson.versionWithMajorPlusOneAndMinorZeroAndPatchZero;
    } else if (releaseOptions.releaseVersionBumpType === 'minor') {
      newVersion = project.packageJson.versionWithMinorPlusOneAndPatchZero;
    } else if (releaseOptions.releaseVersionBumpType === 'patch') {
      newVersion = project.packageJson.versionWithPatchPlusOne;
    }

    // TODO detecting changes for children when start container

    const message = `Proceed with release of new version: ${newVersion} ?`;
    return releaseOptions.autoReleaseUsingConfig
      ? true
      : await Helpers.questionYesNo(message);

    //#endregion
  }
  //#endregion

  //#endregion
}

export default {
  $Release: Helpers.CLIWRAP($Release, '$Release'),
};
