//#region imports
import { config } from 'tnp-config/src';
import { Helpers, UtilsTerminal, _, fse } from 'tnp-core/src';
import { BaseCliWorkerTerminalUI } from 'tnp-helpers/src';

import { DEFAULT_FRAMEWORK_VERSION } from '../../../constants';

import type { TaonProjectsWorker } from './taon.worker';
//#endregion

export class TaonTerminalUI extends BaseCliWorkerTerminalUI<TaonProjectsWorker> {
  //#region methods / header text
  protected async headerText(): Promise<string> {
    return 'Taon.dev';
  }
  //#endregion

  //#region methods / header
  protected async header(): Promise<void> {
    //#region @backendFunc
    // return super.header();
    const consoleLogoPath = this.worker.ins
      .by('container', DEFAULT_FRAMEWORK_VERSION)
      .pathFor('../../__images/logo/logo-console.png');

    // console.log({ logoLight });
    const pngStringify = require('console-png');
    // consolePng.attachTo(console);
    const image = fse.readFileSync(consoleLogoPath);
    return new Promise((resolve, reject) => {
      pngStringify(image, function (err, string) {
        if (err) {
          throw err;
        }
        console.log(string);
        resolve();
      });
    });
    //#endregion
  }
  //#endregion

  //#region methods / get worker terminal actions
  getWorkerTerminalActions() {
    //#region @backendFunc

    return {
      ...this.chooseAction,
      projects: {
        name: 'Manage Taon Projects',
        action: async () => {
          await this.worker.ins.portsWorker.terminalUI.infoScreen({
            exitIsOnlyReturn: true,
          });
        },
      },
      ports: {
        name: 'Manage Ports (TCP/UDP)',
        action: async () => {
          await this.worker.ins.portsWorker.terminalUI.infoScreen({
            exitIsOnlyReturn: true,
          });
        },
      },
      domains: {
        name: 'Manage Domains (and /etc/hosts file)',
        action: async () => {
          Helpers.info(`This feature is not yet implemented.`);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      deployments: {
        name: 'Manage Deployments',
        action: async () => {
          Helpers.info(`This feature is not yet implemented.`);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      previewPorts: {
        name: 'Manage Environments',
        action: async () => {
          console.log('hello world');
          const ctrl = await this.worker.getControllerForRemoteConnection();
          const list = (await ctrl.getEnvironments().received)?.body.json || [];
          await UtilsTerminal.previewLongList(
            list.map(s => `${s.name} ${s.type}`),
          );
          await UtilsTerminal.pressAnyKeyToContinueAsync();
        },
      },
      ...super.getWorkerTerminalActions({ chooseAction: false }),
    };
    //#endregion
  }
  //#endregion
}
