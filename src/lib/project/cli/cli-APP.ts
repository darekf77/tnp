//#region imports
import { MagicRenamer } from 'magic-renamer/src';
import { config, CoreModels, path, tnpPackageName } from 'tnp-core/src';
import { _, crossPlatformPath, UtilsTerminal } from 'tnp-core/src';
import { BasePackageJson, Helpers } from 'tnp-helpers/src';

import { ReleaseArtifactTaon, ReleaseType } from '../../options';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem

export class $App extends BaseCli {
  async _() {
    //#region @backendFunc
    const choices = {
      startAppWatch: {
        name: 'Start app in watch NORMAL node',
      },
      startAppWatchWebsql: {
        name: 'Start app in watch WEBSQL mode',
      },
    };

    const chosen = this.params['websql']
      ? 'startAppWatchWebsql'
      : await UtilsTerminal.select<keyof typeof choices>({
          choices,
          question: 'Select app development start mode:',
        });

    await this._build({ websql: chosen === 'startAppWatchWebsql' });
    //#endregion
  }

  private async _build({
    websql,
    electron,
  }: {
    websql: boolean;
    electron?: boolean;
  }): Promise<void> {
    Helpers.info(
      `Starting ${websql ? 'WEBSQL' : 'NORMAL'} APP in watch mode...`,
    );
    await this.project.build(
      this.params.clone({
        release: {
          targetArtifact: electron
            ? ReleaseArtifactTaon.ELECTRON_APP
            : ReleaseArtifactTaon.ANGULAR_NODE_APP,
        },
        build: {
          watch: true,
          websql,
        },
      }),
    );
  }

  async electron() {
    await this._build({ websql: false, electron: true });
  }

  async el() {
    await this.electron();
  }

  async electronWebsql() {
    await this._build({ websql: true, electron: true });
  }

  async websql() {
    await this._build({ websql: true });
  }

  async normal() {
    await this._build({ websql: false });
  }
}

export default {
  $App: Helpers.CLIWRAP($App, '$App'),
};
