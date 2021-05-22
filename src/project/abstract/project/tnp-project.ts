//#region @backend
import { fse } from 'tnp-core'
import { path } from 'tnp-core'
import { _ } from 'tnp-core';
import { PackagesRecognitionExtended } from '../../features/packages-recognition-extended';
import { FILE_NAME_ISOMORPHIC_PACKAGES } from 'morphi';
import { config as configMorphi } from 'morphi';
//#endregion
import type { Project } from './project';
import { Project as $Project } from 'tnp-helpers';
import { Helpers } from 'tnp-helpers';
import { ConfigModels } from 'tnp-config';

export abstract class TnpProject {

  public get _frameworkVersion(this: Project) {
    //#region @backendFunc
    return this.packageJson.frameworkVersion
    //#endregion
  }

  public get frameworkVersionMinusOne(this: Project): ConfigModels.FrameworkVersion {
    //#region @backendFunc
    const curr = Number(_.isString(this._frameworkVersion) && this._frameworkVersion.replace('v', ''))
    if (!isNaN(curr) && curr >= 2) {
      return `v${curr - 1}` as ConfigModels.FrameworkVersion;
    };
    return 'v1';
    //#endregion
  }

  //#region @backend
  public frameworkVersionEquals(this: Project, version: ConfigModels.FrameworkVersion) {
    const ver = Number(_.isString(version) && version.replace('v', ''));
    const curr = Number(_.isString(this._frameworkVersion) && this._frameworkVersion.replace('v', ''))
    return !isNaN(ver) && !isNaN(curr) && (curr === ver);
  }
  public frameworkVersionAtLeast(this: Project, version: ConfigModels.FrameworkVersion) {
    const ver = Number(_.isString(version) && version.replace('v', ''));
    const curr = Number(_.isString(this._frameworkVersion) && this._frameworkVersion.replace('v', ''))
    return !isNaN(ver) && !isNaN(curr) && (curr >= ver);
  }
  //#endregion

  //#region @backend
  /**
   * available frameworks in project
   */
  get frameworks(this: Project) {
    if (this.typeIs('unknow')) {
      return [];
    }
    return this.packageJson.frameworks;
  }
  //#endregion

  get isTnp(this: Project) {
    if (Helpers.isBrowser) {
      return this.browser.isTnp;
    }
    //#region @backend
    if (this.typeIsNot('isomorphic-lib')) {
      return false;
    }
    return this.location === $Project.Tnp.location;
    //#endregion
  }

  get isNaviCli(this: Project) {
    if (Helpers.isBrowser) {
      return this.browser.isNaviCli;
    }
    //#region @backend
    if (this.typeIsNot('isomorphic-lib')) {
      return false;
    }
    return this.location === $Project.NaviCliLocation;
    //#endregion
  }

  get useFramework(this: Project) {
    if (Helpers.isBrowser) {
      return this.browser.useFramework;
    }
    //#region @backend
    if (this.typeIs('unknow')) {
      return false;
    }
    if (!!this.baseline) {
      const baselineValue = this.baseline.packageJson.useFramework;
      if (!_.isUndefined(this.packageJson.useFramework)) {
        this.packageJson.data.tnp.useFramework = void 0;
        this.packageJson.writeToDisc();
      }
      return this.baseline.packageJson.useFramework;
    }
    return this.packageJson.useFramework;
    //#endregion
  }

  //#region @backend
  get isomorphicPackages(this: Project) {
    const isomorphicPackagesArr = [];

    if (this.typeIs('unknow')) {
      return isomorphicPackagesArr;
    }
    try {
      var p = path.join(this.location, FILE_NAME_ISOMORPHIC_PACKAGES)
      if (!fse.existsSync(p)) {
        PackagesRecognitionExtended.fromProject(this as any).start();
      }
      const f = fse.readJSONSync(p, {
        encoding: 'utf8'
      });
      const arr = f[configMorphi.array.isomorphicPackages];
      if (_.isArray(arr)) {
        return isomorphicPackagesArr.concat(arr);
      } else {
        return isomorphicPackagesArr;
      }
      // warn(`Isomorphic package file does not exists : ${p}`);
    } catch (e) {
      if (global.globalSystemToolMode) {
        Helpers.log(e);
        Helpers.error(`Erro while reading ismorphic package file: ${p}`, true, true);
      }
      return isomorphicPackagesArr;
    };
  }
  //#endregion
}
