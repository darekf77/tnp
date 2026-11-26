//#region imports
import { _, Helpers } from 'tnp-core/src';
import { HelpersTaon } from 'tnp-helpers/src';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class $Test extends BaseCli {
  async _() {
    //#region @backend
    await this.project.artifactsManager.artifact.npmLibAndCliTool.testsVite.runVitest(
      'backend',
    );
    this._exit(0);
    //#endregion
  }
}

export default {
  $Test: HelpersTaon.CLIWRAP($Test, '$Test'),
};
