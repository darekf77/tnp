//#region @backend
import { watch } from 'fs';

import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import type { Project } from '../abstract/project';

// @ts-ignore TODO weird inheritance problem
class $Docs extends BaseCommandLineFeature<{}, Project> {
  public async _() {
    await this.project.artifactsManager.artifact.docsWebapp.docs.runTask({
      initalParams: {
        docsOutFolder: this.firstArg,
      },
    });
    this._exit(0);
  }

  async watch() {
    await this.project.artifactsManager.artifact.docsWebapp.docs.runTask({
      watch: true,
    });
  }
}

export default {
  $Docs: Helpers.CLIWRAP($Docs, '$Docs'),
};
//#endregion
