//#region imports
import { _, Helpers } from 'tnp-core/src';
import { HelpersTaon } from 'tnp-helpers/src';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class $Spec extends BaseCli {
  async _() {
    //#region @backend
    await this.project.artifactsManager.artifact.npmLibAndCliTool.testsVite.runVitest(
      'browser',
    );
    this._exit(0);
    //#endregion
  }
}

export default {
  $Spec: HelpersTaon.CLIWRAP($Spec, '$Spec'),
};
