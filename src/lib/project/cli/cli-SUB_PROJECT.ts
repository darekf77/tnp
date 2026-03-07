import os from 'os';

import { EnvOptions } from 'tnp/src';
import { CoreModels, UtilsTerminal } from 'tnp-core/src';
import { BaseCLiWorkerStartParams, HelpersTaon } from 'tnp-helpers/src';

import { BaseCli } from './base-cli';

export class $SubProject extends BaseCli {
  declare params: EnvOptions & Partial<BaseCLiWorkerStartParams>;

  static [CoreModels.ClassNameStaticProperty] = '$SubProject';

  async _() {
    //#region @backend

    const choices = {
      add: {
        name: 'Add new subproject to this project (with deployment)',
      },
      test: {
        name: 'Test subproject',
      },
      mode: {
        name: 'Set production/development mode for subproject',
      },
      deploy: {
        name: 'Deploy subproject',
      },
    };

    const select = Object.keys(choices).includes(this.firstArg)
      ? this.firstArg
      : await UtilsTerminal.select<keyof typeof choices>({
          question: 'Select action',
          choices,
        });

    if (select === 'add') {
      await this.project.subProject.selectConfigureAndAdd();
    } else if (select === 'test') {
      await this.project.subProject.testWithExampleData();
    } else if (select === 'mode') {
      await this.project.subProject.setModeForWorker();
    } else if (select === 'deploy') {
      await this.project.subProject.deployWorker();
    }

    this._exit();
    //#endregion
  }
}

export default {
  $SubProject: HelpersTaon.CLIWRAP($SubProject, '$SubProject'),
};
