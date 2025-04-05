//#region @backend
import { watch } from 'fs';

import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';

import { BaseCli } from './base-cli';

// @ts-ignore TODO weird inheritance problem
class $Docs extends BaseCli {
  public async _(): Promise<void> {
    await this.project.build(
      EnvOptions.from({
        ...this.params,
        release: {
          targetArtifact: 'docs-webapp',
        },
        finishCallback: () => this._exit(),
      }),
    );
    this._exit(0);
  }

  async watch() {
    await this.project.build(
      EnvOptions.from({
        ...this.params,
        build: {
          watch: true,
        },
        release: {
          targetArtifact: 'docs-webapp',
        },
        finishCallback: () => this._exit(),
      }),
    );
  }
}

export default {
  $Docs: Helpers.CLIWRAP($Docs, '$Docs'),
};
//#endregion
