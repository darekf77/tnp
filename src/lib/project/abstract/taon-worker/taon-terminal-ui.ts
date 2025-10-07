//#region imports
import { config } from 'tnp-config/src';
import { Helpers, UtilsTerminal, _, chalk, fse } from 'tnp-core/src';
import { UtilsOs } from 'tnp-core/src';
import { BaseCliWorkerTerminalUI } from 'tnp-helpers/src';

import { DEFAULT_FRAMEWORK_VERSION } from '../../../constants';

import type { TaonProjectsWorker } from './taon.worker';
//#endregion

export class TaonTerminalUI extends BaseCliWorkerTerminalUI<TaonProjectsWorker> {
  //#region methods / header text
  protected async headerText(): Promise<string> {
    return 'Taon.dev';
  }
  //#endregion

  //#region methods / header
  async header(): Promise<void> {
    //#region @backendFunc
    // return super.header();
    let consoleLogoPath: string;
    let currentVersion = Number(DEFAULT_FRAMEWORK_VERSION.replace('v', ''));
    while (true) {
      try {
        consoleLogoPath = this.worker.ins
          .by('container', `v${currentVersion}` as any)
          .pathFor('../__images/logo/logo-console.png');
        break;
      } catch (error) {
        currentVersion--;
        if (currentVersion < 18) {
          throw new Error(
            '[taon] Could not find console logo image for any version',
          );
        }
      }
    }

    // console.log({ logoLight });
    const pngStringify = require('console-png');
    // consolePng.attachTo(console);
    const image = fse.readFileSync(consoleLogoPath);
    return new Promise((resolve, reject) => {
      pngStringify(image, function (err, string) {
        if (err) {
          throw err;
        }
        console.log(string);
        resolve();
      });
    });
    //#endregion
  }
  //#endregion

  //#region methods / get worker terminal actions
  getWorkerTerminalActions() {
    //#region @backendFunc

    const myActions = {
      enableCloud: {
        name: '',
        action: async () => {
          if (this.worker.cloudIsEnabled) {
            if (
              await UtilsTerminal.confirm({
                message: `Are you sure you want to disable cloud?`,
              })
            ) {
              Helpers.logInfo(`Disabling cloud...`);
              await this.worker.disableCloud();
            }
          } else {
            Helpers.info(`${chalk.bold('Enabling cloud...')}

            port 80 will redirect to port 443
            port 443 will be used for https connections

            Use deployments to deploy your projects.

              `);
            await this.worker.enableCloud();
          }
        },
      },
      projects: {
        name: 'Manage Taon Projects',
        action: async () => {
          await this.worker.ins.portsWorker.terminalUI.infoScreen({
            exitIsOnlyReturn: true,
          });
        },
      },
      ports: {
        name: 'Manage Ports (TCP/UDP)',
        action: async () => {
          await this.worker.ins.portsWorker.terminalUI.infoScreen({
            exitIsOnlyReturn: true,
          });
        },
      },
      domains: {
        name: 'Manage Domains (and /etc/hosts file)',
        action: async () => {
          Helpers.info(`This feature is not yet implemented.`);
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      deployments: {
        name: 'Manage Deployments',
        action: async () => {
          await this.worker.deploymentsWorker.terminalUI.infoScreen({
            exitIsOnlyReturn: true,
          });
        },
      },
      instances: {
        name: 'Manage Instances',
        action: async () => {
          await this.worker.instancesWorker.terminalUI.infoScreen({
            exitIsOnlyReturn: true,
          });
        },
      },
      environments: {
        name: 'Manage Environments',
        action: async () => {
          console.log('hello world');
          const ctrl = await this.worker.getControllerForRemoteConnection({
            calledFrom: 'Manage Environments action',
          });
          const list =
            (await ctrl.getEnvironments().request())?.body.json || [];
          await UtilsTerminal.previewLongList(
            list.map(s => `${s.name} ${s.type}`),
          );
          await UtilsTerminal.pressAnyKeyToContinueAsync();
        },
      },
    };

    delete myActions.environments;
    if (this.worker.cloudIsEnabled) {
      myActions.enableCloud.name = 'Disable Cloud';
    } else {
      myActions.enableCloud.name =
        'Enable Cloud (add possibility of deploying projects)';
      delete myActions.deployments;
      delete myActions.environments;
      delete myActions.projects;
    }

    return {
      ...this.chooseAction,
      ...myActions,
      ...super.getWorkerTerminalActions({ chooseAction: false }),
    };
    //#endregion
  }
  //#endregion

  async infoScreen(options?: { exitIsOnlyReturn?: boolean }): Promise<void> {
    const isDockerRunning = await UtilsOs.isDockerAvailable();
    if (isDockerRunning) {
      Helpers.logInfo(`Docker is running.. checking if Traefik is enabled...`);
      this.worker.cloudIsEnabled = await this.worker.checkIfTreafikIsRunning();
    }
    await super.infoScreen(options);
  }
}
