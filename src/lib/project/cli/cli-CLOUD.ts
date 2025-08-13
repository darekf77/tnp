import { _, isElevated, UtilsNetwork, UtilsTerminal } from 'tnp-core/src';
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
}

export default {
  $Cloud: Helpers.CLIWRAP($Cloud, '$Cloud'),
};
