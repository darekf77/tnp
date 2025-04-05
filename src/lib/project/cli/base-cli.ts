import { _ } from 'tnp-core/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';
import type { Project } from '../abstract/project';

// @ts-ignore TODO weird inheritance problem
export class BaseCli extends BaseCommandLineFeature<EnvOptions, Project> {
  async __initialize__(): Promise<void> {
    this.params = EnvOptions.from(this.params);
    this.__recreateEnvForArtifactAndEnvironment();
    // console.log('this.params', this.params);
    // this._tryResolveChildIfInsideArg();
  }

  protected __recreateEnvForArtifactAndEnvironment(): void {
    this.params = this.project.environmentConfig.envOptionsResolve(this.params);
  }

  public _() {}
}
