import { config, taonPackageName } from 'tnp-core/src';
import { CoreModels, fse, path } from 'tnp-core/src';
import { Helpers, HelpersTaon } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

// TODO QUICK FIX for version
import { Project } from '../abstract/project';

import { BaseCli } from './base-cli';

declare const ENV: any;

// @ts-ignore TODO weird inheritance problem
export class $Version extends BaseCli {

  //#region _
  public async _(): Promise<void> {
    // Helpers.log(`Framework name: '${config.frameworkName}'`);

    //#region @notForNpm
    if (ENV.notForNpm) {
      Helpers.success(`I am secret project!!!`);
    }
    //#endregion

    // global.spinner?.start();
    // a(1);
    // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
    // await Utils.wait(1);
    // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
    // await Utils.wait(1);
    // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
    // await Utils.wait(1);
    // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
    // await Utils.wait(1);
    // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
    // Helpers.info('waiting...');

    // global.spinner?.start();
    // Helpers.info('waiting next time!!. ..');
    // await Utils.wait(5);
    // global.spinner?.stop();
    // log.data('Hellleoeoeo')

    // TODO QUICK FIX
    const tnpProj = Project.ins.Tnp;
    //
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
