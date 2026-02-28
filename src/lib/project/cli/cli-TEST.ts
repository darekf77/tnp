//#region imports
import { config, LibTypeEnum } from 'tnp-core/src';
import { CoreModels, _, crossPlatformPath, os, path } from 'tnp-core/src';
import { Helpers, HelpersTaon } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import {
  appFromSrc,
  MESSAGES,
  srcMainProject,
  TEMP_DOCS,
  testsFromSrc,
} from '../../constants';
import { Models } from '../../models';
import { EnvOptions } from '../../options';
import { BaseTestRunner } from '../abstract/artifacts/npm-lib-and-cli-tool/tools/test-runner/base-test-runner';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';
//#endregion
const runners = ['vite', 'mocha', 'jest', 'cypress'] as const;

// @ts-ignore TODO weird inheritance problem
export class $Test extends BaseCli {
  async __initialize__(): Promise<void> {
    Helpers.error(
      `UNIT/E2E tests command not implement yet. WORK IN PROGRESS.`,
      false,
      true,
    );
  }

  //#region aliases
  // constructor(...args) {
  //   // @ts-ignore
  //   super(...args);
  //   for (const runner of runners) {
  //     const upper = runner.toUpperCase();

  //     // RUN
  //     (this as any)[upper] = async () => this._runRunner(runner, false, false);

  //     // RUN DEBUG
  //     (this as any)[`${upper}_DEBUG`] = async () =>
  //       this._runRunner(runner, false, true);

  //     // WATCH
  //     (this as any)[`${upper}_WATCH`] = async () =>
  //       this._runRunner(runner, true, false);

  //     // WATCH DEBUG
  //     (this as any)[`${upper}_WATCH_DEBUG`] = async () =>
  //       this._runRunner(runner, true, true);
  //   }
  // }
  //#endregion

  //#region command methods
  async _() {
    await this._testSelectors(false, false);
  }

  async WATCH() {
    await this._testSelectors(true, false);
  }

  async WATCH_DEBUG() {
    await this._testSelectors(true, true);
  }

  async DEBUG() {
    await this._testSelectors(false, true);
  }
  //#endregion

  //#region 🔥 unified selector
  async _testSelectors(watch: boolean, debug: boolean) {
    //#region @backendFunc
    if (!this.project.framework.isStandaloneProject) {
      Helpers.error(
        `[${config.frameworkName}] Not supported test command`,
        false,
        true,
      );
    }

    const firstArg = this.firstArg as any;
    const argIsOption = runners.includes(firstArg);
    if (argIsOption) {
      this.args = this.args.filter(f => f !== firstArg);
    }

    const selected = argIsOption
      ? firstArg
      : await HelpersTaon.consoleGui.select<(typeof runners)[number]>(
          `What do you want to test ? ${
            !watch ? '(single run ' : '(watch mode '
          } ${debug ? '- with debugger' : ''})`,
          runners.map(r => ({
            name: r.toUpperCase(),
            value: r,
          })),
        );

    await this._runRunner(selected as any, watch, debug);
    //#endregion
  }
  //#endregion

  //#region 🔥 single unified runner executor
  private async _runRunner(
    runner: (typeof runners)[number],
    watch: boolean,
    debug: boolean,
  ) {
    //#region @backendFunc
    const args = this.args;
    // await this.project.init(
    //   EnvOptions.from({
    //     purpose: `initing before ${runner} tests`,
    //   }),
    // );

    const artifact = this.project.artifactsManager.artifact.npmLibAndCliTool;

    const map: Record<string, any> = {
      vite: artifact.testsVite,
      mocha: artifact.testsMocha,
      jest: artifact.testsJest,
      cypress: artifact.testsCypress,
    };

    const instance: BaseTestRunner = map[runner];

    if (!instance) {
      this._exit();
      return;
    }

    const parsedArgs = args.filter(Boolean);

    if (watch) {
      await instance.startAndWatch(parsedArgs, debug);
    } else {
      await instance.start(parsedArgs, debug);
      this._exit();
    }
    //#endregion
  }
  //#endregion
}

export default {
  $Test: HelpersTaon.CLIWRAP($Test, '$Test'),
};
