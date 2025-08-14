//#region imports
import { config } from 'tnp-config/src';
import {
  CoreModels,
  Helpers,
  UtilsTerminal,
  _,
  chalk,
  fse,
} from 'tnp-core/src';
import { UtilsOs } from 'tnp-core/src';
import {
  BaseCliWorkerTerminalUI,
  BaseWorkerTerminalActionReturnType,
} from 'tnp-helpers/src';

import { DeploymentsWorker } from './deployments.worker';
//#endregion

export class DeploymentsTerminalUI extends BaseCliWorkerTerminalUI<DeploymentsWorker> {
  async headerText(): Promise<string> {
    return 'Taon Deployments';
  }

  textHeaderStyle(): CoreModels.CfontStyle {
    return 'shade';
  }

  getWorkerTerminalActions(options?: {
    exitIsOnlyReturn?: boolean;
    chooseAction?: boolean;
  }): BaseWorkerTerminalActionReturnType {
    //#region @backendFunc
    const myActions: BaseWorkerTerminalActionReturnType = {
      getStuffFromBackend: {
        name: 'Get stuff from backend',
        action: async () => {
          Helpers.info(`Stuff from backend will be fetched`);
          const ctrl = await this.worker.getControllerForRemoteConnection({
            calledFrom: 'Get stuff from backend action',
          });
          const list = (await ctrl.getEntities().received)?.body.json || [];
          console.log(list.map(c => `- ${c.id} ${c.deploymentDescriptionFromZip}`).join('\n'));
          Helpers.info(`Fetched ${list.length} entities`);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      insertDeployment: {
        name: 'Insert new deployment',
        action: async () => {
          Helpers.info(`Inserting new deployment`);
          const ctrl = await this.worker.getControllerForRemoteConnection({
            calledFrom: 'Insert new deployment action',
          });
          try {
            const response = await ctrl.insertEntity().received;
            console.info(`Entity saved successfully: ${response.body.text}`);
          } catch (error) {
            console.error('Error inserting entity:', error);
          }

          // console.log(response);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
    };

    return {
      ...this.chooseAction,
      ...myActions,
      ...super.getWorkerTerminalActions({ chooseAction: false }),
    };
    //#endregion
  }
}
