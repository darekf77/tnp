import { config, taonPackageName, Utils } from 'tnp-core/src';
import { CoreModels, fse, path } from 'tnp-core/src';
import { Helpers, HelpersTaon } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { globalSpinner } from '../../constants';
import { Project } from '../abstract/project'; // TODO QUICK FIX for version

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
    // globalSpinner.instance.stop();
    // globalSpinner.instance.stop();
    // Helpers.info('spinner stopped, waiting 2 second');
    // await Utils.wait(5);
    // Helpers.info('spinner started again, waiting 2 second');
    // globalSpinner.instance.start();
    // await Utils.wait(5);

    // globalSpinner.instance.succeed('niger!');
    // globalSpinner.instance.stop();

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
    // await Utils.wait(5);
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
