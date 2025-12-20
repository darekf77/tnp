//#region imports
import { MagicRenamer } from 'magic-renamer/src';
import { containerPrefix } from 'tnp/src';
import {
  config,
  CoreModels,
  frameworkName,
  path,
  tnpPackageName,
} from 'tnp-core/src';
import {
  _,
  crossPlatformPath,
  isElevated,
  UtilsNetwork,
  UtilsTerminal,
} from 'tnp-core/src';
import { UtilsCliClassMethod } from 'tnp-core/src';
import { BaseCLiWorkerStartMode, Helpers, UtilsZip } from 'tnp-helpers/src';
import { BaseCLiWorkerStartParams } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';
// import { ProcessWorker } from '../abstract/taon-worker/processes/process/process.worker';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem

export class $Core extends BaseCli {
  async __initialize__(): Promise<void> {
    if (config.frameworkName !== tnpPackageName) {
      Helpers.error(
        `

        This command is only for ${tnpPackageName} dev cli.

        `,
        false,
        true,
      );
    }
    await super.__initialize__();
  }

  async _() {
    console.log('hello world');
    this._exit();
  }

  async createNext(): Promise<void> {
    //#region @backendFunc
    const latestCoreContainer = this.project.framework.coreContainer;

    const coreContainerParentLocation = path.dirname(
      latestCoreContainer.location,
    );
    const latestCoreContainerVersion = _.first(
      Helpers.foldersFrom(coreContainerParentLocation)
        .filter(f => path.basename(f).startsWith(containerPrefix))
        .map(f => path.basename(f.replace(containerPrefix + 'v', '')))
        .map(c => Number(c))
        .sort((a, b) => b - a),
    );

    Helpers.info(
      `Latest core container version: ${latestCoreContainerVersion}`,
    );

    const continueOperatino = await UtilsTerminal.confirm({
      message: `Create new core container version v${
        latestCoreContainerVersion + 1
      } based on v${latestCoreContainerVersion}?`,
      defaultValue: true,
    });

    if (!continueOperatino) {
      Helpers.warn(`Operation cancelled by user.`);
      this._exit();
      return;
    }

    const newVersionOfCore = latestCoreContainerVersion + 1;
    const magicRenameRules = `v${latestCoreContainerVersion} -> v${newVersionOfCore}`;

    Helpers.info(`Creating new core... ${magicRenameRules} `);
    const ins = MagicRenamer.Instance(latestCoreContainer.location);
    ins.start(magicRenameRules);

    const newContainer = this.project.ins.From([
      coreContainerParentLocation,
      containerPrefix + 'v' + newVersionOfCore,
    ]);
    Helpers.taskDone(
      `New core created at ${crossPlatformPath(newContainer.location)}`,
    );

    Helpers.taskStarted(`Updating dependencies from NPM...`);
    await newContainer.taonJson.updateDependenciesFromNpm({
      // onlyPackageNames: this.args,
    });

    // console.log({
    //   newestCoreContainerVersion: latestCoreContainerVersion,
    //   coreContainerParentLocation,
    // });
    Helpers.taskDone(`Dependencies updated.`);

    Helpers.taskDone(
      `Done creating new core ${containerPrefix}v${newVersionOfCore}`,
    );
    this._exit();
    //#endregion
  }
}

export default {
  $Core: Helpers.CLIWRAP($Core, '$Core'),
};
