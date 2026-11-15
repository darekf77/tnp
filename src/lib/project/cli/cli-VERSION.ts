import { _ } from 'tnp-core/src';
import { Helpers, HelpersTaon } from 'tnp-helpers/src';

import { Project } from '../abstract/project'; // TODO QUICK FIX for version

import { BaseCli } from './base-cli';

declare const ENV: any;

// @ts-ignore TODO weird inheritance problem
export class $Version extends BaseCli {
  //#region _
  public async _(): Promise<void> {
    Helpers.success(`

  Tnp: ${Project.ins.Tnp ? `v${Project.ins.Tnp?.packageJson?.version}` : '-'}
  Taon: ${Project.ins.Taon ? `v${Project.ins.Taon?.packageJson?.version}` : '-'}

    `);

    this._exit();
  }
  //#endregion

  async path() {
    console.log(`

    next path
    ${this.project.packageJson.resolvePossibleNewVersion('patch')}

    `);
    this._exit();
  }
}

export default {
  $Version: HelpersTaon.CLIWRAP($Version, '$Version'),
};
