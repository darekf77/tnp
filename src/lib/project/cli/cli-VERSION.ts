import { config, taonPackageName, Utils, _ } from 'tnp-core/src';
import { CoreModels, fse, path } from 'tnp-core/src';
import { Helpers, HelpersTaon } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { globalSpinner } from '../../constants';
import { Project } from '../abstract/project'; // TODO QUICK FIX for version

import { BaseCli } from './base-cli';
import { DevBuildModels } from '../abstract/taon-worker/dev-build/dev-build.models';

declare const ENV: any;

// @ts-ignore TODO weird inheritance problem
export class $Version extends BaseCli {
  //#region _
  public async _(): Promise<void> {
    const tnpProj = Project.ins.Tnp;

    const taonProj = Project.ins.From([
      fse.realpathSync(path.dirname(tnpProj.location)),
      taonPackageName,
    ]);
    Helpers.success(`

  Taon: ${taonProj?.packageJson.version ? `v${taonProj.packageJson.version}` : '-'}
  Tnp: ${tnpProj?.packageJson.version ? `v${tnpProj.packageJson.version}` : '-'}

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
