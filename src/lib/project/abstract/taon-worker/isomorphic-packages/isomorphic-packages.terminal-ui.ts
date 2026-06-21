//#region imports
import { CoreModels, Helpers, UtilsTerminal, _ } from 'tnp-core/src';
import {
  BaseCliWorkerTerminalUI,
  BaseWorkerTerminalActionReturnType,
} from 'tnp-helpers/src';

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

          const ctrl = await this.worker.getRemoteControllerFor();
          const list =
            (await ctrl.getAllFor(currentFrameworkVersion).request())?.body
              .json || [];
          console.log(list.join('\n'));
          Helpers.info(`Fetched ${list.length} packages names`);
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
