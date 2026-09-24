//#region imports
import {
  CoreModels,
  crossPlatformPath,
  Helpers,
  path,
  UtilsFilesFoldersSync,
  UtilsSecretEnv,
  UtilsTerminal,
} from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { HelpersTaon, UtilsClipboard, UtilsTypescript } from 'tnp-helpers/src';
import { BaseCLiWorkerStartParams } from 'tnp-helpers/src';

import { environmentsFolder, envTs } from '../../constants';
import { EnvOptions } from '../../options';
// import { ProcessWorker } from '../abstract/taon-worker/processes/process/process.worker';

import type { Project } from '../abstract/project';
import { SecretsKeychainController } from '../abstract/taon-worker/secrets-keychain/secrets-keychain.controller';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem

export class $Env extends BaseCli {
  declare params: EnvOptions & Partial<BaseCLiWorkerStartParams>;

  static [CoreModels.ClassNameStaticProperty] = '$Env';

  async _() {
    //#region @backendFunc
    while (true) {
      UtilsTerminal.clearConsole();
      const choices = {
        getSafePass: { name: 'Generate safe password' },
        encode: { name: 'Encode env secrets' },
        decode: { name: 'Decode env secrets' },
        deleteSecret: { name: 'Delete env secrets from taon worker' },
        exit: { name: 'exit' },
      };

      const choice = await UtilsTerminal.select<keyof typeof choices>({
        choices,
        question: `Select action`,
      });

      if (choice === 'decode') {
        await this.decode(true);
      }
      if (choice === 'encode') {
        await this.encode(true);
      }

      if (choice === 'getSafePass') {
        await this.pass(true);
      }

      if (choice === 'deleteSecret') {
        await this.deletePass(true);
      }
      if (choice === 'exit') {
        this._exit();
      }
      await UtilsTerminal.pressAnyKeyToContinueAsync();
    }

    //#endregion
  }

  async deletePass(notExit = false) {
    const ctrl =
      await this.project.ins.taonProjectsWorker.secretsKeychainPackagesWorker.getRemoteControllerFor(
        {
          methodOptions: {
            calledFrom: 'cli env deletePass ',
          },
          // controllerClass: SecretsKeychainController,
        },
      );
    try {
      await ctrl.forgetMasterPassword(this.project.location).request!();
    } catch (error) {
      Helpers.warn(`Not able to forget password for this project`);
    }
    if (!notExit) {
      this._exit();
    }
  }

  async pass(notExit = false) {
    const pass = UtilsSecretEnv.generateRandomPassword();
    await UtilsClipboard.copyText(pass);
    console.log(
      `

      You secret password: ${pass}
      (password is now in your clipboard)

      `,
    );

    if (!notExit) {
      this._exit();
    }
  }

  async encode(notExit = false) {
    await this.project.secretEnv.encodeOriginal(notExit ? void 0 : this.firstArg);
    Helpers.info('Done encoding.');
    if (!notExit) {
      this._exit();
    }
  }

  async decode(notExit = false) {
    await this.project.secretEnv.decodeOriginal(notExit ? void 0 : this.firstArg);
    Helpers.info('Done decoding.');
    if (!notExit) {
      this._exit();
    }
  }
}

export default {
  $Env: HelpersTaon.CLIWRAP($Env, '$Env'),
};
