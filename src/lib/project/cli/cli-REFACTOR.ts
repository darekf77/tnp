//#region imports
import { config, frontendFiles } from 'tnp-core/src';
import { CoreModels, _, crossPlatformPath, os, path } from 'tnp-core/src';
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { MESSAGES, TEMP_DOCS } from '../../constants';
import { Models } from '../../models';
import { EnvOptions } from '../../options';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class $Refactor extends BaseCli {
  //#region refactor
  async _() {
    await this.project.init(
      EnvOptions.from({ purpose: 'initing before refactor' }),
    );
    Helpers.taskStarted('Refactoring...');
    await this.project.refactor.ALL();
    Helpers.taskDone(`Done refactoring...`);
    this._exit();
  }
  //#endregion

  //#region prettier
  async prettier() {
    Helpers.info(`Initing before prettier...`);
    await this.project.init(
      EnvOptions.from({ purpose: 'initing before prettier' }),
    );
    await this.project.refactor.prettier();
    this._exit();
  }
  //#endregion

  //#region eslint
  async eslint() {
    Helpers.info(`Initing before eslint fix...`);
    await this.project.init(
      EnvOptions.from({ purpose: 'initing before eslint fix' }),
    );
    await this.project.refactor.eslint();
    this._exit();
  }
  //#endregion

  //#region removeBrowserRegion
  async removeBrowserRegion() {
    Helpers.info(`Initing before removing browser region...`);
    await this.project.init(
      EnvOptions.from({ purpose: 'initing before removing browser region' }),
    );
    await this.project.refactor.removeBrowserRegion();
    this._exit();
  }
  //#endregion

  //#region changeCssToScss
  async changeCssToScss() {
    Helpers.info(`Initing before changing css to scss...`);
    await this.project.init(
      EnvOptions.from({ purpose: 'initing before changing css to scss' }),
    );
    await this.project.refactor.changeCssToScss();
    this._exit();
  }
  //#endregion

  //#region properStandaloneNg19
  async properStandaloneNg19() {
    Helpers.info(`Initing before changing standalone property..`);
    await this.project.init(
      EnvOptions.from({ purpose: 'initing before changing standalone property' }),
    );
    await this.project.refactor.properStandaloneNg19();
    this._exit();
  }
  //#endregion

  //#region imports region wrap
  async importsWrap() {
    Helpers.info(`Initing before wrapping imports..`);
    await this.project.init(
      EnvOptions.from({ purpose: 'initing before wrapping imports' }),
    );
    await this.project.refactor.importsWrap();
    this._exit();
  }
  //#endregion
}
export default {
  $Refactor: Helpers.CLIWRAP($Refactor, '$Refactor'),
};
