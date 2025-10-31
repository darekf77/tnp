//#region imports
import { CoreModels, Helpers, UtilsTerminal, _ } from 'tnp-core/src';
import {
  BaseCliWorkerTerminalUI,
  BaseWorkerTerminalActionReturnType,
} from 'tnp-helpers/src';

import { Project } from '../../project';
import { ProcessesController } from '../processes/processes.controller';

import { Deployments } from './deployments';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsStatesAllowedStart } from './deployments.models';
import { DeploymentsUtils } from './deployments.utils';
import { DeploymentsWorker } from './deployments.worker';
//#endregion

// @ts-ignore TODO weird inheritance problem
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
    await ctrl
      .triggerDeploymentStop(deployment.baseFileNameWithHashDatetime)
      .request();

    await ctrl.waitUntilDeploymentStopped(deployment.id);

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
      .triggerDeploymentRemove(deployment.baseFileNameWithHashDatetime)
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
    options?: { forceStart?: boolean },
  ): Promise<void> {
    //#region @backendFunc
    options = options || {};
    console.log(`Starting deployment...`);
    try {
      await ctrl
        .triggerDeploymentStart(
          deployment.baseFileNameWithHashDatetime,
          !!options.forceStart,
        )
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
    deploymentsController: DeploymentsController,
    processesController: ProcessesController,
  ): Promise<void> {
    //#region @backendFunc
    while (true) {
      Helpers.info(`Fetching deployment data...`);
      deployment = (
        await deploymentsController.getByDeploymentId(deployment.id).request()
      ).body.json;

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
        realtimeMonitor: {
          name: 'Realtime Progress Monitor',
        },
        displayLog: {
          name: 'Display Log File',
        },
        stopDeployment: {
          name: 'Stop Deployment',
        },
        removeDeployment: {
          name: 'Remove Deployment',
        },
      };

      if (DeploymentsStatesAllowedStart.includes(deployment.status)) {
        delete choices.stopDeployment;
        delete choices.realtimeMonitor;
      } else {
        delete choices.startDeployment;
      }

      const selected = await UtilsTerminal.select<keyof typeof choices>({
        choices,
        question: 'What do you want to do?',
      });

      switch (selected) {
        case 'back':
          return;
        case 'startDeployment':
          await this.startDeployment(deployment, deploymentsController, {
            forceStart: false,
          });
          deployment = (
            await deploymentsController
              .getByDeploymentId(deployment.id)
              .request()
          ).body.json;
          await DeploymentsUtils.displayRealtimeProgressMonitor(
            deployment,
            processesController,
          );
          break;
        case 'realtimeMonitor':
          await DeploymentsUtils.displayRealtimeProgressMonitor(
            deployment,
            processesController,
          );
          break;
        case 'stopDeployment':
          await this.stopDeployment(deployment, deploymentsController);
          break;
        case 'removeDeployment':
          await this.removeDeployment(deployment, deploymentsController);
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
          const deploymentsController =
            await this.worker.getControllerForRemoteConnection({
              calledFrom: 'Get stuff from backend action',
            });

          const remoteContextProcesses =
            await Project.ins.taonProjectsWorker.processesWorker.gerContextForRemoteConnection();

          const processesController =
            remoteContextProcesses.getInstanceBy(ProcessesController);

          while (true) {
            const list =
              (await deploymentsController.getEntities().request())?.body
                .json || [];
            Helpers.info(`Fetched ${list.length} entities`);

            const options = [
              { name: ' - back - ', value: 'back' },
              ...list.map(c => ({
                name: c.previewString,
                value: c.id?.toString(),
              })),
            ];

            const selected = await UtilsTerminal.select<string>({
              choices: options,
              question: 'Select what to do',
            });

            if (selected !== 'back') {
              await this.crudMenuForSingleDeployment(
                list.find(l => l.id?.toString() === selected),
                deploymentsController,
                processesController,
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
