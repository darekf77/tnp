//#region imports
import { _, chalk, UtilsTerminal } from 'tnp-core/src';
import { Helpers, UtilsHttp } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { EnvOptions, ReleaseArtifactTaon } from '../../options';

import { BaseCli } from './base-cli';
//#endregion

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
          targetArtifact: ReleaseArtifactTaon.DOCS_DOCS_WEBAPP,
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
          targetArtifact: ReleaseArtifactTaon.DOCS_DOCS_WEBAPP,
        },
        finishCallback: () => this._exit(),
      }),
    );
    //#endregion

  }
  //#endregion

  async serve() {

    //#region @backendFunc
    const port = await this.project.registerAndAssignPort(
      'serving static docs',
      {
        startFrom: 8000,
      },
    );
    const buildedDocsFolder =
      this.project.artifactsManager.artifact.docsWebapp.docs
        .outDocsDistFolderAbs;

    await UtilsHttp.startHttpServer(buildedDocsFolder, port, {
      startMessage: `

        Serving static docs pages on http://localhost:${port}
        From folder:
        ${buildedDocsFolder}

        Press Ctrl+C to stop the server.

        `,
    });
    //#endregion

  }

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