//#region imports
import { CoreModels, Helpers, UtilsTerminal, _ } from 'tnp-core/src';
import {
  BaseCliWorkerTerminalUI,
  BaseWorkerTerminalActionReturnType,
} from 'tnp-helpers/src';

import { SecretsKeychainWorker } from './secrets-keychain.worker';
//#endregion

export class SecretsKeychainTerminalUI extends BaseCliWorkerTerminalUI<SecretsKeychainWorker> {
  protected showWorkerInfoScreen: boolean = false;

  protected async headerText(): Promise<string> {
    return 'Secrets Keychain';
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
      getStuffFromBackend: {
        name: 'Get all project passwords saved',
        action: async () => {
          Helpers.info(`Stuff from backend will be fetched`);
          const ctrl = await this.worker.getRemoteControllerFor();

          const list =
            (await ctrl.getAllProjectLocationsSaved().request!())?.body?.json ||
            [];

          console.log(list.map((c, i) => `- ${i + 1} ${c}`).join('\n'));
          // Helpers.info(`Fetched ${list.length} entities`);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
    };

    return {
      ...this.chooseAction,
      ...myActions,
      ...super.getWorkerTerminalActions({ ...options, chooseAction: false }),
    };
    //#endregion
  }
}
