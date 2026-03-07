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
      init: {
        name: 'Init all sub-projects',
      },
      exit: {
        name: 'EXIT',
      },
    };

    let overrideSelect: keyof typeof choices = Object.keys(choices).includes(
      this.firstArg,
    )
      ? (this.firstArg as any)
      : void 0;

    while (true) {
      let select = overrideSelect
        ? overrideSelect
        : await UtilsTerminal.select<keyof typeof choices>({
            question: 'Select action',
            choices,
          });

      if (overrideSelect) {
        overrideSelect = void 0;
      }

      if (select === 'add') {
        await this.project.subProject.addAndConfigure();
      } else if (select === 'test') {
        await this.project.subProject.testWithExampleData();
      } else if (select === 'mode') {
        await this.project.subProject.setModeForWorker();
      } else if (select === 'deploy') {
        await this.project.subProject.deployWorker();
      } else if (select === 'init') {
        await this.project.subProject.initAll();
      } else if (select === 'exit') {
        this._exit();
      }
    }

    //#endregion
  }
}

export default {
  $SubProject: HelpersTaon.CLIWRAP($SubProject, '$SubProject'),
};
