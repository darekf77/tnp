//#region imports
import { config } from 'tnp-config/src';
import {
  CoreModels,
  Helpers,
  UtilsNetwork,
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

import { localhostIpAddress } from '../../../../constants';

import { Instances } from './instances';
import { InstancesWorker } from './instances.worker';
//#endregion

export class InstancesTerminalUI extends BaseCliWorkerTerminalUI<InstancesWorker> {
  async headerText(): Promise<string> {
    return 'Taon Instances';
  }

  textHeaderStyle(): CoreModels.CfontStyle {
    return 'slick';
  }

  getWorkerTerminalActions(options?: {
    exitIsOnlyReturn?: boolean;
    chooseAction?: boolean;
  }): BaseWorkerTerminalActionReturnType {
    //#region @backendFunc
    const myActions: BaseWorkerTerminalActionReturnType = {
      getStuffFromBackend: {
        name: 'Get instances list',
        action: async () => {
          Helpers.info(`Stuff from backend will be fetched`);
          const ctrl = await this.worker.getControllerForRemoteConnection({
            calledFrom: 'Get stuff from backend action',
          });
          const list = (await ctrl.getEntities().request())?.body.json || [];
          console.log(
            list.map(c => `- ${c.id} ${c.name} ${c.ipAddress}`).join('\n'),
          );
          Helpers.info(`Fetched ${list.length} entities`);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      insertDeployment: {
        name: 'Create new instance',
        action: async () => {
          Helpers.info(`Inserting new deployment`);
          const ctrl = await this.worker.getControllerForRemoteConnection({
            calledFrom: 'Insert new deployment action',
          });

          const ipAddress = await UtilsTerminal.input({
            required: true,
            question: 'Enter IP address of the instance',
            validate: val => {
              if (val?.trim() === localhostIpAddress) {
                return false;
              }
              if (val?.trim() === 'localhost') {
                return false;
              }
              return UtilsNetwork.isValidIp(val);
            },
          });

          const nameOfInstance = await UtilsTerminal.input({
            required: true,
            question: 'Enter name of instance',
            validate: val => {
              if (!val || val.trim() === '') {
                return false;
              }
              return val.trim().length > 3;
            },
          });

          try {
            const response = await ctrl
              .insertEntity(
                new Instances().clone({
                  ipAddress,
                  name: nameOfInstance,
                }),
              )
              .request();
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
      ...super.getWorkerTerminalActions({
        ...options,
        chooseAction: false,
      }),
    };
    //#endregion
  }
}
