import { _ } from 'tnp-core/src';
import { Helpers, HelpersTaon } from 'tnp-helpers/src';

import { CURRENT_PACKAGE_VERSION } from '../../build-info._auto-generated_';
import { Project } from '../abstract/project'; // TODO QUICK FIX for version

import { BaseCli } from './base-cli';

declare const ENV: any;

// @ts-ignore TODO weird inheritance problem
export class $Version extends BaseCli {
  //#region _
  public async _(): Promise<void> {
    Helpers.success(`

  Tnp (linked): ${Project.ins.Tnp ? `v${Project.ins.Tnp?.packageJson?.version}` : '-'}
  Taon: (linked) ${Project.ins.Taon ? `v${Project.ins.Taon?.packageJson?.version}` : '-'}
  Tnp: ${CURRENT_PACKAGE_VERSION}

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
