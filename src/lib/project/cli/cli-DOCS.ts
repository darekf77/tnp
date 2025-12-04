import { watch } from 'fs'; // @backend

import { _, chalk } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';

import { BaseCli } from './base-cli';

// @ts-ignore TODO weird inheritance problem
class $Docs extends BaseCli {
  //#region _
  public async _(): Promise<void> {
    //#region @backendFunc
    await this.project.build(
      this.params.clone({
        build: {
          watch: false,
        },
        release: {
          targetArtifact: 'docs-webapp',
        },
        finishCallback: () => this._exit(),
      }),
    );
    this._exit(0);
    //#endregion
  }
  //#endregion

  //#region watch
  async watch() {
    //#region @backendFunc
    await this.project.build(
      this.params.clone({
        build: {
          watch: true,
        },
        release: {
          targetArtifact: 'docs-webapp',
        },
        finishCallback: () => this._exit(),
      }),
    );
    //#endregion
  }
  //#endregion

  async envCheck(options: EnvOptions): Promise<void> {
    //#region @backendFunc
    const envOK =
      await this.project.artifactsManager.artifact.docsWebapp.docs.validateEnvironemntForMkdocsBuild();
    console.log(
      `Environment for DOCS build is ${envOK ? chalk.green('OK') : chalk.red('NOT OK')}`,
    );
    this._exit();
    //#endregion
  }
}

export default {
  $Docs: Helpers.CLIWRAP($Docs, '$Docs'),
};
