import { CoreModels, _, crossPlatformPath, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';
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
}

export default {
  $Branding: Helpers.CLIWRAP($Branding, '$Branding'),
};
