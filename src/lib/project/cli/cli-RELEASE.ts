//#region imports
import { config } from 'tnp-core/src';
import { CoreModels, _, UtilsTerminal, path, chalk } from 'tnp-core/src';
import { Helpers, HelpersTaon } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { friendlyNameForReleaseAutoConfigIsRequired } from '../../constants';
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
    await this._releaseProcess(this.params, ReleaseType.LOCAL);
  }

  async localNpm(): Promise<void> {
    await this._releaseProcess(
      this.params,
      ReleaseType.LOCAL,
      ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    );
  }

  async localVscode(): Promise<void> {
    await this._releaseProcess(
      this.params,
      ReleaseType.LOCAL,
      ReleaseArtifactTaon.VSCODE_PLUGIN,
    );
  }

  async localElectron(): Promise<void> {
    await this._releaseProcess(
      this.params,
      ReleaseType.LOCAL,
      ReleaseArtifactTaon.ELECTRON_APP,
    );
  }
  //#endregion

  //#region cloud
  async cloud(): Promise<void> {
    await this._releaseProcess(this.params, ReleaseType.CLOUD);
  }
  //#endregion

  //#region manual
  async manual(): Promise<void> {
    await this._releaseProcess(this.params, ReleaseType.MANUAL);
  }
  //#endregion

  //#region static pages
  async staticPages(): Promise<void> {
    await this._releaseProcess(this.params, ReleaseType.STATIC_PAGES);
  }
  //#endregion

  //#region auto release

  //#region auto release / auto
  async auto(): Promise<void> {
    await this.project.release(
      this.params.clone({
        release: {
          autoReleaseUsingConfig: true,
          autoReleaseTaskName: this.firstArg,
          releaseVersionBumpType: 'patch',
          releaseType: ReleaseType.MANUAL,
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
          autoReleaseTaskName: this.firstArg,
          releaseVersionBumpType: 'patch',
          releaseType: ReleaseType.MANUAL,
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
          autoReleaseTaskName: this.firstArg,
          releaseVersionBumpType: 'major',
          releaseType: ReleaseType.MANUAL,
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
          autoReleaseTaskName: this.firstArg,
          releaseVersionBumpType: 'minor',
          releaseType: ReleaseType.MANUAL,
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
          autoReleaseTaskName: this.firstArg,
          releaseVersionBumpType: 'patch',
          releaseType: ReleaseType.MANUAL,
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
      targetArtifact: ReleaseArtifactTaon.VSCODE_PLUGIN,
    });
    this._exit();
  }

  async installLocallyVscodePluginProd(): Promise<void> {
    await this._installLocally(
      false,
      {
        targetArtifact: ReleaseArtifactTaon.VSCODE_PLUGIN,
      },
      true,
    );
    this._exit();
  }

  async installLocallyCliTool(): Promise<void> {
    await this._installLocally(true, {
      targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    });
    this._exit();
  }

  async installLocallyCliToolProd(): Promise<void> {
    await this._installLocally(
      false,
      {
        targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
      },
      true,
    );
    this._exit();
  }

  private async _installLocally(
    skipLibBuild: boolean,
    releaseOpt: Pick<
      EnvOptions['release'],
      | 'targetArtifact'
      | 'removeReleaseOutputAfterLocalInstall'
      | 'envName'
      | 'envNumber'
    >,
    prod?: boolean,
  ): Promise<void> {
    await this.project.release(
      this.params.clone({
        build: {
          watch: false,
          prod,
        },
        release: {
          envName: releaseOpt.envName,
          envNumber: releaseOpt.envNumber,
          skipTagGitPush: true,
          skipResolvingGitChanges: true,
          targetArtifact: releaseOpt.targetArtifact,
          removeReleaseOutputAfterLocalInstall:
            releaseOpt.removeReleaseOutputAfterLocalInstall,
          releaseType: ReleaseType.LOCAL,
          releaseVersionBumpType: 'patch',
          installLocally: true,
          skipReleaseQuestion: skipLibBuild,
          skipBuildingArtifacts: skipLibBuild
            ? [ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL]
            : [],
        },
      }),
    );
  }

  async installLocally() {
    //#region @backendFunc
    const allowedArtifacts: ReleaseArtifactTaon[] = [
      ReleaseArtifactTaon.VSCODE_PLUGIN,
      ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
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
}

export default {
  $Release: HelpersTaon.CLIWRAP($Release, '$Release'),
};
