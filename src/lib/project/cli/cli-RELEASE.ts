//#region imports
import { config } from 'tnp-config/src';
import { CoreModels, _, UtilsTerminal, path, chalk } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { Models } from '../../models';
import {
  ReleaseArtifactTaon,
  EnvOptions,
  ReleaseType,
  ReleaseArtifactTaonNamesArr,
} from '../../options';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem
class $Release extends BaseCli {
  async __initialize__(): Promise<void> {
    await super.__initialize__();
    if (this.project.framework.isStandaloneProject) {
      await this.project.nodeModules.makeSureInstalled();
    }
  }

  //#region _
  public async _() {
    await this.project.releaseProcess.displayReleaseProcessMenu(this.params);
    // await this.patch();
    this._exit();
  }
  //#endregion

  //#region release process
  async _releaseProcess(
    envOptions: EnvOptions,
    releaseType: ReleaseType,
    artifact?: ReleaseArtifactTaon,
  ): Promise<void> {
    await this.project.releaseProcess.releaseByType(releaseType, envOptions);
    this._exit();
  }
  //#endregion

  //#region local
  async local(): Promise<void> {
    await this._releaseProcess(this.params, 'local');
  }

  async localNpm(): Promise<void> {
    await this._releaseProcess(this.params, 'local', 'npm-lib-and-cli-tool');
  }

  async localVscode(): Promise<void> {
    await this._releaseProcess(this.params, 'local', 'vscode-plugin');
  }

  async localElectron(): Promise<void> {
    await this._releaseProcess(this.params, 'local', 'electron-app');
  }
  //#endregion

  //#region cloud
  async cloud(): Promise<void> {
    await this._releaseProcess(this.params, 'cloud');
  }
  //#endregion

  //#region manual
  async manual(): Promise<void> {
    await this._releaseProcess(this.params, 'manual');
  }
  //#endregion

  //#region static pages
  async staticPages(): Promise<void> {
    await this._releaseProcess(this.params, 'static-pages');
  }
  //#endregion

  //#region auto release

  //#region auto release / auto
  async auto(): Promise<void> {
    await this.project.release(
      this.params.clone({
        release: {
          autoReleaseUsingConfig: true,
          releaseVersionBumpType: 'patch',
          releaseType: 'manual',
        },
      }),
    );
    this._exit();
  }
  //#endregion

  //#region auto release / auto clear
  async autoClear(): Promise<void> {
    await this.project.clear();
    await this.project.release(
      this.params.clone({
        release: {
          autoReleaseUsingConfig: true,
          releaseVersionBumpType: 'patch',
          releaseType: 'manual',
        },
      }),
    );
    this._exit();
  }
  //#endregion

  //#region auto release / major
  async major(): Promise<void> {
    await this.project.release(
      this.params.clone({
        release: {
          autoReleaseUsingConfig: true,
          releaseVersionBumpType: 'major',
          releaseType: 'manual',
        },
      }),
    );
    this._exit();
  }
  //#endregion

  //#region auto release / minor
  async minor(): Promise<void> {
    await this.project.release(
      this.params.clone({
        release: {
          autoReleaseUsingConfig: true,
          releaseVersionBumpType: 'minor',
          releaseType: 'manual',
        },
      }),
    );
    this._exit();
  }
  //#endregion

  //#region auto release / patch
  async patch(): Promise<void> {
    await this.project.release(
      this.params.clone({
        release: {
          autoReleaseUsingConfig: true,
          releaseVersionBumpType: 'patch',
          releaseType: 'manual',
        },
      }),
    );
    this._exit();
  }
  //#endregion

  //#endregion

  //#region install locally
  async installLocallyVscodePlugin(): Promise<void> {
    await this._installLocally(true, {
      targetArtifact: 'vscode-plugin',
      removeReleaseOutputAfterLocalInstall: true,
    });
    this._exit();
  }

  async installLocallyCliTool(): Promise<void> {
    await this._installLocally(true, {
      targetArtifact: 'npm-lib-and-cli-tool',
      envName: 'dev',
    });
    this._exit();
  }

  private async _installLocally(
    skipLibBuild: boolean,
    releaseOpt: Pick<
      EnvOptions['release'],
      'targetArtifact' | 'removeReleaseOutputAfterLocalInstall' | 'envName' | 'envNumber'
    >,
  ): Promise<void> {
    await this.project.release(
      this.params.clone({
        build: {
          watch: false,
        },
        release: {
          envName: releaseOpt.envName,
          envNumber: releaseOpt.envNumber,
          skipTagGitPush: true,
          skipResolvingGitChanges: true,
          targetArtifact: releaseOpt.targetArtifact,
          removeReleaseOutputAfterLocalInstall:
            releaseOpt.removeReleaseOutputAfterLocalInstall,
          releaseType: 'local',
          releaseVersionBumpType: 'patch',
          installLocally: true,
          skipReleaseQuestion: skipLibBuild,
          skipBuildingArtifacts: skipLibBuild ? ['npm-lib-and-cli-tool'] : [],
        },
      }),
    );
  }

  async installLocally() {
    //#region @backendFunc
    const allowedArtifacts: ReleaseArtifactTaon[] = [
      'vscode-plugin',
      'npm-lib-and-cli-tool',
    ];

    const options = {
      ['_']: {
        name: '< Select artifact to build/install locally >',
      },
      ...ReleaseArtifactTaonNamesArr.reverse().reduce((a, b) => {
        return {
          ...a,
          ...{
            [b]: {
              disabled: !allowedArtifacts.includes(b as ReleaseArtifactTaon),
              name: b,
            },
          },
        };
      }, {}),
    };

    let option: ReleaseArtifactTaon;
    while (true) {
      option = await UtilsTerminal.select<ReleaseArtifactTaon>({
        choices: options,
        question: 'What you wanna build/install locally ?',
      });
      if (option && option !== ('_' as any)) {
        // console.log({ option });
        break;
      }
    }

    let skipLibBuild = false;

    if (option !== 'npm-lib-and-cli-tool') {
      skipLibBuild = await UtilsTerminal.confirm({
        message: 'Skip library build ?',
        defaultValue: true,
      });
    }

    if (option === 'vscode-plugin') {
      await this._installLocally(skipLibBuild, {
        targetArtifact: option,
      });
    }

    if (option === 'npm-lib-and-cli-tool') {
      skipLibBuild = true;
      await this._installLocally(skipLibBuild, {
        targetArtifact: option,
      });
    }

    this._exit();
    //#endregion
  }
  //#endregion

  // TODO
  // async config() {
  //   console.log(this.params);
  //   this._exit();
  //   this.project.releaseProcess.config.init();
  //   this._exit();
  // }

  // TODO
  // async configCreateFromTnp() {
  //   if (this.project.name !== 'tnp') {
  //     return;
  //   }
  //   this.project.releaseProcess.config.init();
  //   this.project.releaseProcess.config.create();
  //   this._exit();
  // }
}

export default {
  $Release: Helpers.CLIWRAP($Release, '$Release'),
};
