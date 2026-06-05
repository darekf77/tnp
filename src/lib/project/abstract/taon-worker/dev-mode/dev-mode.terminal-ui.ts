//#region imports
import { CoreModels, Helpers, UtilsTerminal, _, config } from 'tnp-core/src';
import {
  BaseCliWorkerTerminalUI,
  BaseWorkerTerminalActionReturnType,
} from 'tnp-helpers/src';

import { DevMode } from './dev-mode.models';
import { DevModeUtils } from './dev-mode.utils';
import { DevModeWorker } from './dev-mode.worker';
//#endregion

export class DevModeTerminalUI extends BaseCliWorkerTerminalUI<DevModeWorker> {
  protected showWorkerInfoScreen: boolean = false;

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
      //#region monitor log messages
      monitorLogMessages: {
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
              const data = await ctrl.getLogMessages(60).request!({
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
      //#endregion

      //#region clear messages
      clearMessages: {
        name: 'Clear messages log',
        action: async () => {
          this.worker.getRemoteControllerFor;
          const ctrl = await this.worker.getRemoteControllerFor({
            methodOptions: {
              calledFrom: 'Dev mode controller',
            },
          });

          await ctrl.clearLogMessages().request!({
            timeout: 1000,
          });

          Helpers.info(`Done clearing message`);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      //#endregion

      //#region get db location
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
      //#endregion

      //#region trigger rebuild
      getStuffFromBackend: {
        name: 'Get list of builds',
        action: async () => {
          this.worker.getRemoteControllerFor;
          const devModeWorker = await this.worker.getRemoteControllerFor({
            methodOptions: {
              calledFrom: 'Dev mode controller',
            },
          });

          const frameworkVersionChoices = (
            await devModeWorker.getAllFrameworkVersionInDevMode().request!()
          ).body.json.map(f => {
            return { name: f, value: f };
          });

          if (frameworkVersionChoices.length === 0) {
            await UtilsTerminal.pressAnyKeyToContinueAsync({
              message:
                'No active dev builds for any framework version. Press any key to go back to main menu',
            });
            return;
          }

          const currentFrameworkVersion = await UtilsTerminal.select({
            question: 'Select dev framework version',
            choices: frameworkVersionChoices,
          });

          const listOfPool = (
            await devModeWorker.getAllDevModeProjects(currentFrameworkVersion)
              .request!()
          ).body.json.map(f => DevMode.ProjectBuildNotificaiton.from(f));

          if (listOfPool.length === 0) {
            await UtilsTerminal.pressAnyKeyToContinueAsync({
              message:
                'No active dev builds. Press any key to go back to main menu',
            });
            return;
          }
          const buildChoices = listOfPool.map(f => {
            return { name: `${f.port} in ${f.location}`, value: f.uniqueKey };
          });

          const currentActionBuildKey = await UtilsTerminal.select({
            question: 'Select build version',
            choices: buildChoices,
          });

          const currentActionBuild = listOfPool.find(
            c => c.uniqueKey === currentActionBuildKey,
          );

          // console.log('selected', currentActionBuild);

          if (currentActionBuild) {
            const choicesActions = {
              displayDetails: {
                name: 'Display details',
              },
              healthCheck: {
                name: 'Health check',
              },
              back: {
                name: 'Back to previous menu',
              },
            };

            const selectedAction = await UtilsTerminal.select<
              keyof typeof choicesActions
            >({
              question: 'Select action',
              choices: choicesActions,
            });

            if (selectedAction === 'displayDetails') {
              //#region display details
              const devBuildController =
                await devModeWorker.devModeRepository.getDevBuildControllerForPort(
                  currentActionBuild.port,
                );

              Helpers.info(
                `Details of build (port=${currentActionBuild.port}})${currentActionBuild.location}

                loading...
                `,
              );
              try {
                const data =
                  await devBuildController.getProjectInfo().request!();

                const projBuild = data.body.json;
                console.table(`Build type: ${projBuild.buildType}`);
                console.table(
                  `Dependencies: ${(projBuild.devModeDependenciesNames || []).join(',')}`,
                );
                console.table(projBuild.buildStatusInfo);
              } catch (error) {
                config.frameworkName === 'tnp' && console.log(error);
                await UtilsTerminal.pressAnyKeyToContinueAsync({
                  message:
                    'Not able to perform action.. Press any key to continue.',
                });
              }
              //#endregion
            }

            if (selectedAction === 'healthCheck') {
              //#region display details
              const devBuildController =
                await devModeWorker.devModeRepository.getDevBuildControllerForPort(
                  currentActionBuild.port,
                );

              Helpers.info(
                `Checking health of build (port=${currentActionBuild.port}})${currentActionBuild.location}`,
              );
              try {
                await DevModeUtils.healthCheck(devBuildController);
                console.log('BUILD IS OK');
              } catch (error) {
                config.frameworkName === 'tnp' && console.log(error);

                console.log('BUILD IS NOT OK');
                await UtilsTerminal.pressAnyKeyToContinueAsync({
                  message:
                    'Not able to perform action.. Press any key to continue.',
                });
              }
              //#endregion
            }
          }

          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      //#endregion
    };

    return {
      ...this.chooseAction,
      ...myActions,
      ...super.getWorkerTerminalActions({ ...options, chooseAction: false }),
    };
    //#endregion
  }
}
