//#region imports
import { CoreModels, Helpers, UtilsTerminal, _ } from 'tnp-core/src';
import {
  BaseCliWorkerTerminalUI,
  BaseWorkerTerminalActionReturnType,
} from 'tnp-helpers/src';

import { DevModeWorker } from './dev-mode.worker';
//#endregion

export class DevModeTerminalUI extends BaseCliWorkerTerminalUI<DevModeWorker> {
  protected async headerText(): Promise<string> {
    return `Dev Mode Worker`;
  }

  textHeaderStyle(): CoreModels.CfontStyle {
    return 'block';
  }

  getWorkerTerminalActions(options?: {
    exitIsOnlyReturn?: boolean;
    chooseAction?: boolean;
  }): BaseWorkerTerminalActionReturnType {
    //#region @backendFunc
    const myActions: BaseWorkerTerminalActionReturnType = {
      monitorDatabase: {
        name: 'Get messages log messages',
        action: async () => {
          this.worker.getRemoteControllerFor;
          const ctrl = await this.worker.getRemoteControllerFor({
            methodOptions: {
              calledFrom: 'Dev mode controller',
            },
          });

          await UtilsTerminal.fetchAndDisplay<string>({
            title: 'Dev mode log messages ',
            refreshEveryMs: 2000,
            requestTimeoutMs: 2000,
            fetchFn: async () => {
              const data = await ctrl.getLogMessages(30).request!({
                timeout: 1000,
              });
              return data.body.json;
            },
          });

          // const data = await ctrl.getDbLocation().request!();
          // Helpers.info(`location: ${data.body.text}`);
          // await UtilsTerminal.pressAnyKeyToContinueAsync({
          //   message: 'Press any key to go back to main menu',
          // });
        },
      },
      getDbLocation: {
        name: 'Get db location',
        action: async () => {
          this.worker.getRemoteControllerFor;
          const ctrl = await this.worker.getRemoteControllerFor({
            methodOptions: {
              calledFrom: 'Dev mode controller',
            },
          });
          const data = await ctrl.getDbLocation().request!();
          Helpers.info(`location: ${data.body.text}`);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      // getStuffFromBackend: {
      //   name: 'Get last projects notyfications',
      //   action: async () => {
      //     Helpers.info(`Stuff from backend will be fetched`);
      //     this.worker.getRemoteControllerFor;
      //     const ctrl = await this.worker.getRemoteControllerFor({
      //       methodOptions: {
      //         calledFrom: 'Dev mode controller',
      //       },
      //     });

      //     const list =
      //       (await ctrl.lastProjectsNotifications().request!())?.body.json ||
      //       [];
      //     console.log(
      //       list
      //         .map(
      //           c => `- ${c.location}
      //           ${c.devModeDependenciesNames.join(',')}`,
      //         )
      //         .join('\n'),
      //     );
      //     Helpers.info(`Fetched ${list.length} entities`);
      //     await UtilsTerminal.pressAnyKeyToContinueAsync({
      //       message: 'Press any key to go back to main menu',
      //     });
      //   },
      // },
    };

    return {
      ...this.chooseAction,
      ...myActions,
      ...super.getWorkerTerminalActions({ ...options, chooseAction: false }),
    };
    //#endregion
  }
}
