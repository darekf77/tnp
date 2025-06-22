import { CoreModels, _, crossPlatformPath, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { iconVscode128Basename } from '../../constants';
import { EnvOptions, ReleaseTypeWithDevelopmentArr } from '../../options';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';

/**
 # Branding of assets
- from logo.svg or logo.png
  + create icon
  + create favicons
  + create splashscreens
  + create logos inside apps


# Branding of existed modules/projects
  - rename to create similar module or project:
    + files
    + folders
    + files contents

 */ // @ts-ignore TODO weird inheritance problem
export class $Branding extends BaseCli {
  public async _(): Promise<void> {
    await this.project.artifactsManager.globalHelper.branding.apply(true);
    this._exit();
  }

  //#region create vscode icons
  async logoVscode() {
    //#region @backendFunc
    await this.project.artifactsManager.globalHelper.branding.generateLogoFroVscodeLocations();
    this._exit();
    //#endregion
  }
  //#endregion
}

export default {
  $Branding: Helpers.CLIWRAP($Branding, '$Branding'),
};
