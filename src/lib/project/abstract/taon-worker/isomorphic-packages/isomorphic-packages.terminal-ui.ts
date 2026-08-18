//#region imports
import {
  CoreModels,
  Helpers,
  Utils,
  UtilsTerminal,
  _,
  config,
  tnpPackageName,
} from 'tnp-core/src';
import {
  BaseCliWorkerTerminalUI,
  BaseWorkerTerminalActionReturnType,
} from 'tnp-helpers/src';

import { CURRENT_PACKAGE_TAON_VERSION } from '../../../../build-info._auto-generated_';

import { IsomorphicPackagesWorker } from './isomorphic-packages.worker';
//#endregion

export class IsomorphicPackagesTerminalUI extends BaseCliWorkerTerminalUI<IsomorphicPackagesWorker> {
  protected showWorkerInfoScreen: boolean = false;

  protected async headerText(): Promise<string> {
    return 'Isomorphic Packages';
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
      //#region get all from backend
      getStuffFromBackend: {
        name: 'Get all from backend',
        action: async () => {
          const { Project } = await import('../../../abstract/project');
          const devModeWorker =
            await Project.ins.taonProjectsWorker.buildsWorker.getRemoteControllerFor(
              {
                methodOptions: {
                  calledFrom: 'builds controller',
                },
              },
            );

          let frameworkVersionChoices = (
            await devModeWorker.getAllFrameworkVersionInDevMode().request!()
          ).body.json.map(f => {
            return { name: f, value: f };
          });

          frameworkVersionChoices.push({
            name: CURRENT_PACKAGE_TAON_VERSION,
            value: CURRENT_PACKAGE_TAON_VERSION,
          });

          frameworkVersionChoices = Utils.uniqArray(
            frameworkVersionChoices,
            'value',
          );

          const currentFrameworkVersion = await UtilsTerminal.select({
            question: 'Select dev framework version',
            choices: frameworkVersionChoices,
          });

          const ctrl = await this.worker.getRemoteControllerFor();
          const list =
            (await ctrl.getAllFor(currentFrameworkVersion).request())?.body
              .json || [];
          console.log(list.join(', '));
          Helpers.info(`Fetched ${list.length} packages names`);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      //#endregion

      //#region delete package
      deletePackage: {
        name: 'Delete pacakge name',
        action: async () => {
          const { Project } = await import('../../../abstract/project');
          const devModeWorker =
            await Project.ins.taonProjectsWorker.buildsWorker.getRemoteControllerFor(
              {
                methodOptions: {
                  calledFrom: 'builds controller',
                },
              },
            );

          let frameworkVersionChoices = (
            await devModeWorker.getAllFrameworkVersionInDevMode().request!()
          ).body.json.map(f => {
            return { name: f, value: f };
          });

          frameworkVersionChoices.push({
            name: CURRENT_PACKAGE_TAON_VERSION,
            value: CURRENT_PACKAGE_TAON_VERSION,
          });

          frameworkVersionChoices = Utils.uniqArray(
            frameworkVersionChoices,
            'value',
          );

          const currentFrameworkVersion = await UtilsTerminal.select({
            question: 'Select dev framework version',
            choices: frameworkVersionChoices,
          });

          const ctrl = await this.worker.getRemoteControllerFor();
          const list =
            (await ctrl.getAllFor(currentFrameworkVersion).request())?.body
              .json || [];
          console.log(list.join(', '));

          const packageToDelete = await UtilsTerminal.select({
            choices: [
              { name: `<none>` },
              ...list.map(c => ({ name: c, value: c })),
            ],
            question: `What package you would like to delete`,
          });

          if (packageToDelete) {
            let packageWasDeleted = false;
            while (true) {
              try {
                packageWasDeleted = (
                  await ctrl.deletePackage(
                    packageToDelete,
                    currentFrameworkVersion,
                  ).request!()
                ).body.booleanValue;
                break;
              } catch (error) {
                if (
                  !(await UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(
                    error,
                  ))
                ) {
                  break;
                } else {
                  continue;
                }
              }
            }

            await UtilsTerminal.pressAnyKeyToContinueAsync({
              message: `Package was ${packageWasDeleted ? 'succesfully' : 'not'} deleted. Press any key`,
            });
            return;
          }

          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      //#endregion
    };

    if (config.frameworkName !== tnpPackageName) {
      delete myActions['deletePackage'];
    }

    return {
      ...this.chooseAction,
      ...myActions,
      ...super.getWorkerTerminalActions({ ...options, chooseAction: false }),
    };
    //#endregion
  }
}
