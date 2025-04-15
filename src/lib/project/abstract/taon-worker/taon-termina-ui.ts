//#region imports
import { config } from 'tnp-config/src';
import { UtilsTerminal, _, fse } from 'tnp-core/src';
import { BaseCliWorkerTerminalUI } from 'tnp-helpers/src';

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
      .by('container', config.defaultFrameworkVersion)
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
      previewPorts: {
        name: 'Show Environments builds',
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
      tcpUdPorts: {
        name: 'Manage TCP/UDP ports',
        action: async () => {
          await this.worker.ins.portsWorker.terminalUi.infoScreen({
            exitIsOnlyReturn: true,
          });
        },
      },
      ...super.getWorkerTerminalActions({ chooseAction: false }),
    };
    //#endregion
  }
  //#endregion
}
