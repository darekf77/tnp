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
    console.log(`Stopping deployment... please wait...`);
    await ctrl
      .triggerDeploymentStop(deployment.baseFileNameWithHashDatetime)
      .request();
    console.log(`Waiting until deployment stopped...`);
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
    while (true) {
      console.log(`Removing deployment... please wait...`);
      try {
        await ctrl
          .triggerDeploymentRemove(deployment.baseFileNameWithHashDatetime)
          .request();

        await ctrl.waitUntilDeploymentRemoved(deployment.id);

        console.log(`Removing done..`);
        break;
      } catch (error) {
        if (!(await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
          break;
        }
      }
    }
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
      console.log(`Waiting for deployment to start...`);
      await ctrl.waitUntilDeploymentHasComposeUpProcess(deployment.id);
      console.log(`deployment process started...`);
    } catch (error) {
      console.error('Fail to start deployment');
    }
    //#endregion

  }
  //#endregion

  //#region refetch deployment
  protected async refetchDeployment(
    deployment: Deployments,
    deploymentsController: DeploymentsController,
  ): Promise<Deployments> {

    //#region @backendFunc
    while (true) {
      try {
        deployment = (
          await deploymentsController.getByDeploymentId(deployment.id).request()
        ).body.json;
        return deployment;
      } catch (error) {
        const fetchAgain = await UtilsTerminal.confirm({
          message: `Not able to fetch deployment (id=${deployment.id}). Try again?`,
          defaultValue: true,
        });
        if (!fetchAgain) {
          return;
        }
      }
    }
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
      UtilsTerminal.clearConsole();
      Helpers.info(`Fetching deployment data...`);
      deployment = (
        await deploymentsController.getByDeploymentId(deployment.id).request()
      ).body.json;

      Helpers.info(`Selected deployment:
  for domain: ${deployment.destinationDomain}, version: ${deployment.version}
  current status: ${deployment.status}, arrived at: ${deployment.arrivalDate}
    `);

      const choices = {
        back: {
          name: ' - back - ',
        },
        startDeployment: {
          name: 'Start Deployment',
        },
        info: {
          name: 'Deployment info',
        },
        realtimeMonitor: {
          name: 'Realtime Progress Monitor',
        },
        displayDeploymentLog: {
          name: 'Display Log File',
        },
        displayDeploymentLogPath: {
          name: 'Display Log File Path',
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
        question: '[Deployments] What do you want to do?',
      });

      switch (selected) {
        case 'back':
          return;
        case 'displayDeploymentLogPath':
          deployment = await this.refetchDeployment(
            deployment,
            deploymentsController,
          );
          if (!deployment) {
            return;
          }
          UtilsTerminal.clearConsole();
          await (async () => {
            const processComposeUp = deployment.processIdComposeUp;
            try {
              const processFromDb = await processesController
                .getByProcessID(processComposeUp)
                .request()
                .then(r => r.body.json);
              console.log(
                `

                Log file path: ${processFromDb.fileLogAbsPath}

                `,
              );
              await UtilsTerminal.pressAnyKeyToContinueAsync({
                message: 'Press any key go back to previous menu',
              });
            } catch (error) {
              console.error(
                `Error fetching process log for process id: ${processComposeUp}`,
              );
              await UtilsTerminal.pressAnyKeyToContinueAsync();
            }
          })();

        case 'displayDeploymentLog':
          deployment = await this.refetchDeployment(
            deployment,
            deploymentsController,
          );
          if (!deployment) {
            return;
          }
          UtilsTerminal.clearConsole();
          const processComposeUp = deployment.processIdComposeUp;
          try {
            const processFromDb = await processesController
              .getByProcessID(processComposeUp)
              .request()
              .then(r => r.body.json);

            await UtilsTerminal.previewLongListGitLogLike(
              Helpers.readFile(processFromDb.fileLogAbsPath) ||
                '< empty log file >',
            );
          } catch (error) {
            console.error(
              `Error fetching process log for process id: ${processComposeUp}`,
            );
            await UtilsTerminal.pressAnyKeyToContinueAsync();
          }
          break;
        case 'info':
          deployment = await this.refetchDeployment(
            deployment,
            deploymentsController,
          );
          if (!deployment) {
            return;
          }
          UtilsTerminal.clearConsole();
          console.log(deployment.fullPreviewString({ boldValues: true }));
          await UtilsTerminal.pressAnyKeyToContinueAsync();
          break;
        case 'startDeployment':
          const displayRealtimePreview = await UtilsTerminal.confirm({
            message: `Would you like to see realtime preview in terminal after starting?`,
            defaultValue: true,
          });

          await this.startDeployment(deployment, deploymentsController, {
            forceStart: false,
          });

          if (displayRealtimePreview) {
            deployment = await this.refetchDeployment(
              deployment,
              deploymentsController,
            );
            if (!deployment) {
              return;
            }
            await DeploymentsUtils.displayRealtimeProgressMonitor(
              deployment,
              processesController,
            );
          } else {
            await UtilsTerminal.pressAnyKeyToContinueAsync();
          }

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
            await this.worker.getRemoteControllerFor({
              methodOptions: {
                calledFrom: 'Get stuff from backend action',
              },
            });

          const processesController =
            await Project.ins.taonProjectsWorker.processesWorker.getRemoteControllerFor(
              {
                methodOptions: {
                  calledFrom: 'Deployments.getStuffFromBackend',
                },
                controllerClass: ProcessesController,
              },
            );

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
              question: 'Select deployment',
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
      removeAllDeployments: {
        name: 'Remove all deployments',
        action: async () => {
          const confirm = await UtilsTerminal.confirm({
            message: `Are you sure you want to remove ALL deployments?`,
            defaultValue: false,
          });
          if (!confirm) {
            return;
          }

          while (true) {
            try {
              Helpers.info(`Removing all deployments...`);
              const deploymentController =
                await this.worker.getRemoteControllerFor({
                  methodOptions: {
                    calledFrom: 'Remove all deployments action',
                  },
                });

              await deploymentController
                .triggerAllDeploymentsRemove()
                .request();
              Helpers.info(`Waiting until all deployments are removed...`);
              await deploymentController.waitUntilAllDeploymentsRemoved();
              Helpers.info(`All deployments removed.`);
              break;
            } catch (error) {
              if (
                !(await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))
              ) {
                break;
              }
              continue;
            }
          }

          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      // insertDeployment: {
      //   name: 'Insert new deployment',
      //   action: async () => {
      //     Helpers.info(`Inserting new deployment`);
      //     const ctrl = await this.worker.getRemoteControllerFor({
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