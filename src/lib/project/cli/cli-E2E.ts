//#region imports
import { _, Helpers } from 'tnp-core/src';
import { HelpersTaon } from 'tnp-helpers/src';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class $E2E extends BaseCli {
  async _() {
    Helpers.error(`E2E not implemented yet.`, false, true);
  }
}

export default {
  $E2E: HelpersTaon.CLIWRAP($E2E, '$E2E'),
};
