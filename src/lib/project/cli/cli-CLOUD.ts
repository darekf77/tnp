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

  async deployments(): Promise<void> {
    // UtilsTerminal.drawBigText('Deployments');
    await this.project.ins.taonProjectsWorker.deploymentsWorker.startNormallyInCurrentProcess();
  }

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
    this._exit()
  }
}

export default {
  $Cloud: Helpers.CLIWRAP($Cloud, '$Cloud'),
};
