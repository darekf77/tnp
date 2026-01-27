import { _ } from 'tnp-core/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { globalSpinner } from '../../constants';
import { EnvOptions } from '../../options';
import type { Project } from '../abstract/project';

// @ts-ignore TODO weird inheritance problem
export class BaseCli extends BaseCommandLineFeature<EnvOptions, Project> {
  async __initialize__(): Promise<void> {
    this.params = EnvOptions.from(this.params);
    // await this.__recreateEnvForArtifactAndEnvironment(); // TODO this taks too much time
    // console.log('this.params', this.params);
    // this._tryResolveChildIfInsideArg();

    if (this.params['skipMenu']) {
      this.params = await EnvOptions.releaseSkipMenu(this.params, {
        args: this.allParamsAfterFrameworName.split(' '),
      });
      delete this.params['skipMenu'];
    }

    if (this.params['skipMenuAuto']) {
      this.params = await EnvOptions.releaseSkipMenu(this.params, {
        selectDefaultValues: true,
        args: this.allParamsAfterFrameworName.split(' '),
      });
      delete this.params['skipMenuAuto'];
    }

  }

  protected async __recreateEnvForArtifactAndEnvironment(): Promise<void> {
    // this.params = this.project // I am recreating only basic things
    //   ? await this.project.environmentConfig.update(this.params)
    //   : this.params;
  }

  public _() {}
}
