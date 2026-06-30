//#region imports
import { CoreModels, Helpers } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { HelpersTaon } from 'tnp-helpers/src';
import { BaseCLiWorkerStartParams } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';
// import { ProcessWorker } from '../abstract/taon-worker/processes/process/process.worker';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem

export class $Lang extends BaseCli {
  declare params: EnvOptions & Partial<BaseCLiWorkerStartParams>;

  static [CoreModels.ClassNameStaticProperty] = '$Lang';

  //#region _
  async _(): Promise<void> {
    console.log('what the fuck');
    this._exit();
  }
  //#endregion

  async extract(): Promise<void> {
    //#region @backendFunc
    const task = Helpers.actionStarted('Extracting translations..');
    await this.project.framework.generateTranslations();

    task.done();
    this._exit();
    //#endregion
  }
}

export default {
  $Lang: HelpersTaon.CLIWRAP($Lang, '$Lang'),
};
