import { path } from 'tnp-core/src';
import {
  _,
  crossPlatformPath,
  isElevated,
  UtilsNetwork,
  UtilsTerminal,
} from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';

import { BaseCli } from './base-cli';

// @ts-ignore TODO weird inheritance problem
class $Cloud extends BaseCli {
  async _(): Promise<void> {
    await this.project.ins.taonProjectsWorker.cliStartProcedure(this.params);
    // await this.ins.taonProjectsWorker.cliStartProcedure(this.params);
  }

  //#region deployments
  async deployments(): Promise<void> {
    // UtilsTerminal.drawBigText('Deployments');
    // await this.project.ins.taonProjectsWorker.deploymentsWorker.startNormallyInCurrentProcess();

    await this.project.ins.taonProjectsWorker.deploymentsWorker.cliStartProcedure(
      this.params,
    );
  }
  //#endregion

  //#region deployments
  async instances(): Promise<void> {
    // UtilsTerminal.drawBigText('Deployments');
    await this.project.ins.taonProjectsWorker.instancesWorker.cliStartProcedure(
      this.params,
    );
  }
  //#endregion

  //#region send
  async send() {
    // await this.project.ins.taonProjectsWorker.deploymentsWorker.startNormallyInCurrentProcess();
    const ctrl =
      await this.project.ins.taonProjectsWorker.deploymentsWorker.getControllerForRemoteConnection();

    const filePath = path.isAbsolute(this.firstArg)
      ? crossPlatformPath(this.firstArg)
      : crossPlatformPath([this.cwd, this.firstArg]);

    Helpers.taskStarted(`Uploading file "${filePath}" to server...`);
    const data = await ctrl.uploadLocalFileToServer(filePath);
    console.log(data);
    Helpers.taskDone(`Done uploading file "${this.firstArg}" to server`);
    this._exit();
  }
  //#endregion
}

export default {
  $Cloud: Helpers.CLIWRAP($Cloud, '$Cloud'),
};
