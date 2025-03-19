//#region @backend
import { watch } from 'fs';

import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { BuildOptions } from '../../options';
import type { Project } from '../abstract/project';

// @ts-ignore TODO weird inheritance problem
class $Docs extends BaseCommandLineFeature<{}, Project> {
  public async _() {
    await this.project.build(
      BuildOptions.from({
        ...this.params,
        targetArtifact: 'docs-webapp',
        finishCallback: () => this._exit(),
      }),
    );
    this._exit(0);
  }

  async watch() {
    await this.project.build(
      BuildOptions.from({
        ...this.params,
        watch: true,
        targetArtifact: 'docs-webapp',
        finishCallback: () => this._exit(),
      }),
    );
  }
}

export default {
  $Docs: Helpers.CLIWRAP($Docs, '$Docs'),
};
//#endregion
