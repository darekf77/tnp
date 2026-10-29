//#region imports
import {
  chalk,
  config,
  LibTypeEnum,
  UtilsOs,
  UtilsTempFolder,
} from 'tnp-core/src';
import {
  CoreModels,
  _,
  crossPlatformPath,
  fse,
  glob,
  os,
  path,
} from 'tnp-core/src';
import { Helpers, HelpersTaon, UtilsVSCode } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import {
  MESSAGES,
  packageJsonMainProject,
  taonJsonMainProject,
  TEMP_DOCS,
} from '../../constants';
import { EnvOptions } from '../../options';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class $Proxy extends BaseCli {
  async __initialize__(): Promise<void> {
    await super.__initialize__();
  }

  public async _() {
    if (!this.firstArg) {
      Helpers.info(
        chalk.green(`

      With command "${chalk.bold(`${config.frameworkName} proxy <arg>`)}" you can trigger
      execution of any command for specyfic projects, but from safe cloned
      version of this project.

      ${this.project?.proxyCloned?.tempLocation || ''}

      `),
      );
      this._exit();
    }
    await this.project.proxyCloned.execute(this.argsWithParams);
    this._exit()
  }
}

export default {
  $Proxy: HelpersTaon.CLIWRAP($Proxy, '$Proxy'),
};
