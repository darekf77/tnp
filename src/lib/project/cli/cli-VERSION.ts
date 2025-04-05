import { config } from 'tnp-config/src';
import { CoreModels, fse, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';

declare const ENV: any;

// @ts-ignore TODO weird inheritance problem
export class $Version extends BaseCli {
  //#region _
  public _() {
    // Helpers.log(`Framework name: '${config.frameworkName}'`);
    //#region @notForNpm
    if (ENV.notForNpm) {
      Helpers.success(`I am secret project!!!`);
    }
    //#endregion
    // global.spinner?.start();
    // Helpers.sleep(1);
    // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
    // Helpers.sleep(1);
    // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
    // Helpers.sleep(1);
    // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
    // Helpers.sleep(1);
    // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
    // Helpers.sleep(1);
    // Helpers.info(`${config.frameworkName} location: ${ this.Tnp.location}`)
    // Helpers.info('waiting...');

    // global.spinner?.start();
    // Helpers.info('waiting next time!!. ..');
    // Helpers.sleep(5);
    // global.spinner?.stop();
    // log.data('Hellleoeoeo')
    const tnpProj = this.project.ins.Tnp;
    const taonProj = this.ins.From([
      fse.realpathSync(path.dirname(tnpProj.location)),
      config.frameworkNames.productionFrameworkName,
    ]);
    Helpers.success(`

  Taon: ${taonProj?.packageJson.version ? `v${taonProj.packageJson.version}` : '-'}
  Tnp: ${tnpProj?.packageJson.version ? `v${tnpProj.packageJson.version}` : '-'}

    `);
    this._exit();
  }
  //#endregion

  //#region set
  set() {
    // TODO menu for updating npm and framework version
    // for standalone and container
  }
  //#endregion

  //#region set minor version
  async setMinorVersion() {
    // let children = this.project.ins.Current.children as Project[];
    // const minorVersionToSet = Number(
    //   _.first(this.args).trim().replace('v', ''),
    // );
    // for (let index = 0; index < children.length; index++) {
    //   const child = children[index] as Project;
    //   // if (child.minorVersion === minorVersionToSet) {
    //   //   Helpers.info(`[${child.name}] Minor version ${minorVersionToSet} alread set.`);
    //   // } else {
    //   Helpers.info(
    //     `[${child.name}] Updating minor version for ${child.name}@${child.packageJson.data.version} => ${minorVersionToSet} ... `,
    //   );
    //   await child.framework.setMinorVersion(minorVersionToSet, true);
    //   // }
    //   // Helpers.taskDone();
    // }
    // this._exit();
  }
  //#endregion

  //#region set major version
  /**
   * TODO
   * settin npm version
   */
  async setMajorVersion() {
    // let children = this.project.children;
    // const majorVersionToSet = Number(
    //   _.first(this.args).trim().replace('v', ''),
    // );
    // const frameworkVersion = (this.params.frameworkVersion ||
    //   this.params['frameworkVer'] ||
    //   this.params['fver']) as string;
    //#region quesitons
    // if (frameworkVersion) {
    //   Helpers.info(
    //     `
    //   Setting major npm version "${majorVersionToSet}" for this
    //   and for all ${children.length} children packages.
    //   (Framework version from parameters "v${frameworkVersion}"
    //   will be set for this and all children packages as well)
    //   `,
    //   );
    //   if (!(await Helpers.questionYesNo(`Proceed ?`))) {
    //     this._exit();
    //   }
    // } else {
    //   Helpers.info(
    //     `
    //   Setting major npm version "${majorVersionToSet}" for this
    //   and for all ${children.length} children packages.`,
    //   );
    //   if (!(await Helpers.questionYesNo(`Proceed ?`))) {
    //     this._exit();
    //   }
    // }
    //#endregion
    //#region setting major version (and optionally framework ver.) for current project
    // if (frameworkVersion) {
    //   if (this.project.frameworkVersion === `v${frameworkVersion}`) {
    //     Helpers.info(
    //       `[${this.project.universalPackageName}] Framework version v${frameworkVersion} alread set.`,
    //     );
    //   }
    //   Helpers.info(
    //     `[${this.project.universalPackageName}] Updating framework version for ` +
    //       `${this.project.frameworkVersion} => v${frameworkVersion} ... `,
    //   );
    //   await this.project.setFrameworkVersion(
    //     `v${frameworkVersion}` as CoreModels.FrameworkVersion,
    //   );
    // }
    // if (this.project.npmHelpers.majorVersion === majorVersionToSet) {
    //   Helpers.info(
    //     `[${this.project.universalPackageName}] Major version ${majorVersionToSet} alread set.`,
    //   );
    // }
    // Helpers.info(
    //   `[${this.project.universalPackageName}] Updating version ` +
    //     `${this.project.packageJson.data.version} => ${majorVersionToSet} ... `,
    // );
    // await this.project.__setMajorVersion(majorVersionToSet);
    //#endregion
    //#region setting major version (and optionally framework ver.) for children
    // for (let index = 0; index < children.length; index++) {
    //   const child = children[index] as Project;
    //   if (frameworkVersion) {
    //     if (child.frameworkVersion === `v${frameworkVersion}`) {
    //       Helpers.info(
    //         `[${child.name}] Framework version v${frameworkVersion} alread set.`,
    //       );
    //     }
    //     Helpers.info(
    //       `[${child.name}] Updating framework version for ` +
    //         `${child.frameworkVersion} => v${frameworkVersion} ... `,
    //     );
    //     await child.setFrameworkVersion(
    //       `v${frameworkVersion}` as CoreModels.FrameworkVersion,
    //     );
    //   }
    //   if (child.npmHelpers.majorVersion === majorVersionToSet) {
    //     Helpers.info(
    //       `[${child.name}] Major version ${majorVersionToSet} alread set.`,
    //     );
    //   }
    //   Helpers.info(
    //     `[${child.name}] Updating version for ${child.name}` +
    //       `@${child.packageJson.data.version} => ${majorVersionToSet} ... `,
    //   );
    //   await child.__setMajorVersion(majorVersionToSet);
    // Helpers.taskDone();
    // }
    //#endregion
    // Helpers.taskDone(`Major version set to ${majorVersionToSet}`);
    // this._exit();
  }
  //#endregion

  //#region set framework version
  async setFrameworkVersion() {
    // const newFrameworkVersion =
    //   `v${this.firstArg.replace('v', '')}` as CoreModels.FrameworkVersion;
    // Helpers.info(
    //   `Setting framework version (${newFrameworkVersion}) for ${this.project.name}... and children`,
    // );
    // await this.project.setFrameworkVersion(newFrameworkVersion);
    // for (const child of this.project.children) {
    //   await child.setFrameworkVersion(newFrameworkVersion);
    // }
    // Helpers.taskDone(`Framework version set to ${newFrameworkVersion}`);
    // this._exit();
  }
  //#endregion
}

export default {
  $Version: Helpers.CLIWRAP($Version, '$Version'),
};
