import os from 'os';

import { CoreModels, UtilsTerminal } from 'tnp-core/src';
import { BaseCLiWorkerStartParams, HelpersTaon } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';

import { BaseCli } from './base-cli';
import { CloudFlarePorjectsUtils } from '../abstract/cloud-flare-projects/cloud-flare-projects.utils';

export class $SubProject extends BaseCli {
  declare params: EnvOptions & Partial<BaseCLiWorkerStartParams>;

  static [CoreModels.ClassNameStaticProperty] = '$SubProject';

  async _() {
    //#region @backend

    const choices = {
      info: {
        name: 'Get info about subproject embeded in this taon project',
      },
      add: {
        name: 'Add new subproject to this project (with deployment)',
      },
      teststripe: {
        name: 'Test stripe worker subproject',
      },
      login: {
        name: 'Authenticate this computer with wrangler',
      },
      mode: {
        name: 'Set production/development mode for subproject',
      },
      secrets: {
        name: 'Set secrets keys to worker environment',
      },
      deploy: {
        name: 'Deploy subproject',
      },
      initall: {
        name: 'Init all sub-projects',
      },
      exit: {
        name: 'EXIT',
      },
    };

    let overrideSelect: keyof typeof choices = Object.keys(choices).includes(
      this.firstArg?.toLowerCase(),
    )
      ? (this.firstArg?.toLowerCase() as any)
      : void 0;

    while (true) {
      UtilsTerminal.clearConsole();

      let select = overrideSelect
        ? overrideSelect
        : await UtilsTerminal.select<keyof typeof choices>({
            question: 'Select action',
            choices,
          });

      if (overrideSelect) {
        overrideSelect = void 0;
      }

      if (select === 'info') {
        await this.project.subProject.getInfo();
      } else if (select === 'add') {
        await this.project.subProject.addAndConfigure();
      } else if (select === 'teststripe') {
        await this.project.subProject.testStripeProjectWithExampleData();
      } else if (select === 'mode') {
        await this.project.subProject.setModeForWorker();
      } else if (select === 'secrets') {
        await this.project.subProject.setWorkerSecrets();
      } else if (select === 'deploy') {
        await this.project.subProject.deployWorker();
      } else if (select === 'initall') {
        await this.project.subProject.repo.initAll();
      } else if (select === 'login') {
        await CloudFlarePorjectsUtils.loginCliCloudFlare();
      } else if (select === 'exit') {
        this._exit();
      }
      await UtilsTerminal.pressAnyKeyToContinueAsync({
        message: 'Press any key to show main menu',
      });
    }

    //#endregion
  }
}

export default {
  $SubProject: HelpersTaon.CLIWRAP($SubProject, '$SubProject'),
};
