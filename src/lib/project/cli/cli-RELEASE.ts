//#region imports
import { config } from 'tnp-config/src';
import { CoreModels, _, UtilsTerminal, path, chalk } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { Models } from '../../models';
import { ReleaseArtifactTaon, EnvOptions, ReleaseType } from '../../options';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem
class $Release extends BaseCli {
  //#region _
  public async _() {
    await this.project.releaseProcess.displayReleaseProcessMenu();
    // await this.patch();
    this._exit();
  }
  //#endregion

  //#region release process
  async _releaseProcess(
    releaseType: ReleaseType,
    artifact?: ReleaseArtifactTaon,
  ): Promise<void> {
    await this.project.releaseProcess.releaseByType(releaseType);
    this._exit();
  }
  //#endregion

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

  //#region cloud
  async cloud(): Promise<void> {
    await this._releaseProcess('cloud');
  }
  //#endregion

  //#region manual
  async manual(): Promise<void> {
    await this._releaseProcess('manual');
  }
  //#endregion

  //#region static pages
  async staticPages(): Promise<void> {
    await this._releaseProcess('static-pages');
  }
  //#endregion

  //#region old release functions

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
  ): Promise<void> {
    // const taonReleaseVersionType = await this.chooseTaonReleaseVersionType();

    const releaseOptions = EnvOptions.from({
      ...this.params,
      release: {
        releaseVersionBumpType: npmReleaseVersionType,
        autoReleaseUsingConfig,
      },
      finishCallback: () => {
        this._exit();
      },
    });

    await this.shouldReleaseLibMessage(releaseOptions, this.project);
    await this.project.release(releaseOptions);
    this._exit();
  }
  //#endregion

  //#region should release lib
  async shouldReleaseLibMessage(releaseOptions: EnvOptions, project: Project) {
    //#region @backendFunc

    let newVersion;
    if (releaseOptions.release.releaseVersionBumpType === 'major') {
      newVersion =
        project.packageJson.versionWithMajorPlusOneAndMinorZeroAndPatchZero;
    } else if (releaseOptions.release.releaseVersionBumpType === 'minor') {
      newVersion = project.packageJson.versionWithMinorPlusOneAndPatchZero;
    } else if (releaseOptions.release.releaseVersionBumpType === 'patch') {
      newVersion = project.packageJson.versionWithPatchPlusOne;
    }

    // TODO detecting changes for children when start container

    const message = `Proceed with release of new version: ${newVersion} ?`;
    return releaseOptions.release.autoReleaseUsingConfig
      ? true
      : await Helpers.questionYesNo(message);

    //#endregion
  }
  //#endregion

  //#endregion

  async config() {
    console.log(this.params);
    this._exit();
    this.project.releaseProcess.config.init();
    this._exit();
  }

  async configCreateFromTnp() {
    if (this.project.name !== 'tnp') {
      return;
    }
    this.project.releaseProcess.config.init();
    this.project.releaseProcess.config.create();
    this._exit();
  }
}

export default {
  $Release: Helpers.CLIWRAP($Release, '$Release'),
};
