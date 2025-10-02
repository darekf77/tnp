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

import { Deployments } from './deployments';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsWorker } from './deployments.worker';
import {
  debounceTime,
  exhaustMap,
  map,
  Subscription,
  throttle,
  throttleTime,
} from 'rxjs';
import { ProcessesController } from '../processes/processes.controller';
import { DeploymentsUtils } from './deployments.utils';
//#endregion

export class DeploymentsTerminalUI extends BaseCliWorkerTerminalUI<DeploymentsWorker> {
  async headerText(): Promise<string> {
    return 'Taon Deployments';
  }

  textHeaderStyle(): CoreModels.CfontStyle {
    return 'shade';
  }

  //#region stop deployment
  private async stopDeployment(
    deployment: Deployments,
    ctrl: DeploymentsController,
  ): Promise<void> {
    //#region @backendFunc
    console.log(`Stopping deployment...`);
    await ctrl.stopDeployment(deployment.zipFileBasenameMetadataPart).request();

    console.log(`Stopping done..`);
    await UtilsTerminal.pressAnyKeyToContinueAsync();
    //#endregion
  }
  //#endregion

  //#region remove deployment
  private async removeDeployment(
    deployment: Deployments,
    ctrl: DeploymentsController,
  ): Promise<void> {
    //#region @backendFunc
    console.log(`Removing deployment...`);
    await ctrl
      .removeDeployment(deployment.zipFileBasenameMetadataPart)
      .request();

    console.log(`Removing done..`);
    await UtilsTerminal.pressAnyKeyToContinueAsync();
    //#endregion
  }
  //#endregion

  //#region start deployment
  private async startDeployment(
    deployment: Deployments,
    ctrl: DeploymentsController,
  ): Promise<void> {
    //#region @backendFunc
    console.log(`Starting deployment...`);
    try {
      await ctrl
        .startDeployment(deployment.zipFileBasenameMetadataPart)
        .request();

      console.log(`deployment process started...`);
    } catch (error) {
      console.error('Fail to start deployment');
    }
    await UtilsTerminal.pressAnyKeyToContinueAsync();
    //#endregion
  }
  //#endregion

  //#region crud menu for single deployment
  protected async crudMenuForSingleDeployment(
    deployment: Deployments,
    ctrl: DeploymentsController,
  ): Promise<void> {
    //#region @backendFunc
    while (true) {
      Helpers.info(`Fetching deployment data...`);
      deployment = (await ctrl.getByDeploymentId(deployment.id).request()).body
        .json;

      // UtilsTerminal.clearConsole();
      Helpers.info(`You selected deployment:

${deployment.fullPreviewString({
  boldValues: true,
})}

    `);

      const choices = {
        back: {
          name: ' - back - ',
        },
        startDeployment: {
          name: 'Start Deployment',
        },
        displayProgress: {
          name: 'Display Progress log',
        },
        stopDeployment: {
          name: 'Stop Deployment',
        },
        removeDeployment: {
          name: 'Remove Deployment',
        },
      };

      if (deployment.status === 'in-progress') {
        delete choices.startDeployment;
      } else {
        delete choices.stopDeployment;
        delete choices.displayProgress;
      }

      const selected = await UtilsTerminal.select<keyof typeof choices>({
        choices,
        question: 'What do you want to do?',
      });

      switch (selected) {
        case 'back':
          return;
        case 'startDeployment':
          await this.startDeployment(deployment, ctrl);
          deployment = (await ctrl.getByDeploymentId(deployment.id).request())
            .body.json;
          await DeploymentsUtils.displayDeploymentProgress(deployment, ctrl);
          break;
        case 'displayProgress':
          await DeploymentsUtils.displayDeploymentProgress(deployment, ctrl);
          break;
        case 'stopDeployment':
          await this.stopDeployment(deployment, ctrl);
          break;
        case 'removeDeployment':
          await this.removeDeployment(deployment, ctrl);
          return;
      }
    }
    //#endregion
  }
  //#endregion

  //#region terminal actions
  getWorkerTerminalActions(options?: {
    exitIsOnlyReturn?: boolean;
    chooseAction?: boolean;
  }): BaseWorkerTerminalActionReturnType {
    //#region @backendFunc
    const myActions: BaseWorkerTerminalActionReturnType = {
      getStuffFromBackend: {
        name: 'Get deployments from backend',
        action: async () => {
          Helpers.info(`Fetching deployments data...`);
          const ctrl = await this.worker.getControllerForRemoteConnection({
            calledFrom: 'Get stuff from backend action',
          });

          while (true) {
            const list = (await ctrl.getEntities().request())?.body.json || [];
            Helpers.info(`Fetched ${list.length} entities`);

            const options = [
              { name: ' - back - ', value: 'back' },
              ...list.map(c => ({
                name: c.previewString,
                value: c.id,
              })),
            ];

            const selected = await UtilsTerminal.select<string>({
              choices: options,
              question: 'Select what to do',
            });

            if (selected !== 'back') {
              await this.crudMenuForSingleDeployment(
                list.find(l => l.id === selected),
                ctrl,
              );
            }

            if (selected === 'back') {
              return;
            }
          }
        },
      },
      // insertDeployment: {
      //   name: 'Insert new deployment',
      //   action: async () => {
      //     Helpers.info(`Inserting new deployment`);
      //     const ctrl = await this.worker.getControllerForRemoteConnection({
      //       calledFrom: 'Insert new deployment action',
      //     });
      //     try {
      //       const response = await ctrl.insertEntity().request();
      //       console.info(`Entity saved successfully: ${response.body.text}`);
      //     } catch (error) {
      //       console.error('Error inserting entity:', error);
      //     }

      //     // console.log(response);
      //     await UtilsTerminal.pressAnyKeyToContinueAsync({
      //       message: 'Press any key to go back to main menu',
      //     });
      //   },
      // },
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
  //#endregion
}
