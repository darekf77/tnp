//#region imports
import { promisify } from 'util';

import { config } from 'tnp-config/src';
import {
  _,
  child_process,
  fse,
  UtilsOs,
  UtilsProcess,
  UtilsTerminal,
} from 'tnp-core/src';
import { BaseCliWorker, Helpers } from 'tnp-helpers/src';

import { CURRENT_PACKAGE_VERSION } from '../../../build-info._auto-generated_';
import type { TaonProjectResolve } from '../project-resolve';

import { TaonTerminalUI } from './taon-terminal-ui';
import { TaonProjectsContextTemplate } from './taon.context';
import { TaonProjectsController } from './taon.controller';
//#endregion

export class TaonProjectsWorker extends BaseCliWorker<
  TaonProjectsController,
  TaonTerminalUI
> {
  public cloudIsEnabled = false;

  // @ts-ignore
  terminalUI = new TaonTerminalUI(this);

  workerContextTemplate = TaonProjectsContextTemplate as any; // TODO for some reason as any is nessesary
  controllerClass = TaonProjectsController;

  //#region constructor
  constructor(
    /**
     * unique id for service
     */
    serviceID: string,
    /**
     * external command that will start service
     */
    startCommand: string,
    public readonly ins: TaonProjectResolve,
  ) {
    super(serviceID, startCommand, CURRENT_PACKAGE_VERSION);
  }
  //#endregion

  //#region methods / start normally in current process
  /**
   * start normally process
   * this will crash if process already started
   */
  async startNormallyInCurrentProcess(): Promise<void> {
    //#region @backendFunc
    Helpers.taskStarted(`Waiting for ports manager to be started...`);
    await this.ins.portsWorker.startDetachedIfNeedsToBeStarted({
      useCurrentWindowForDetach: true,
    });
    Helpers.taskDone(`Ports manager started !`);
    await super.startNormallyInCurrentProcess();
    //#endregion
  }
  //#endregion

  //#region methods / start traefik
  protected async startTraefik(): Promise<boolean> {
    //#region @backendFunc
    console.log('🚀 Starting Traefik...');
    const execAsync = promisify(child_process.exec);
    // Start traefik in detached mode
    const pathToCompose = this.ins
      .by('isomorphic-lib')
      .pathFor(`docker-templates/terafik`);
    if (!Helpers.exists(pathToCompose)) {
      return false;
    }

    await execAsync(`docker compose -f traefik-compose.yml up -d traefik`, {
      cwd: pathToCompose,
    });

    // Wait until container health becomes healthy
    while (true) {
      const { stdout } = await execAsync(
        `docker inspect --format='{{json .State.Health.Status}}' traefik`,
      );

      const status = stdout.trim().replace(/"/g, '');
      console.log('Traefik health:', status);

      if (status === 'healthy') {
        console.log('✅ Traefik is ready');
        break;
      }

      await UtilsTerminal.wait(1);
    }
    return true;
    //#endregion
  }

  //#endregion

  //#region methods / stop traefik
  protected async stopTraefik(): Promise<boolean> {
    //#region @backendFunc
    console.log('Stopping Traefik...');
    const execAsync = promisify(child_process.exec);
    // Start traefik in detached mode
    const pathToCompose = this.ins
      .by('isomorphic-lib')
      .pathFor(`docker-templates/terafik`);
    if (!Helpers.exists(pathToCompose)) {
      return false;
    }

    await execAsync(`docker compose stop traefik`, {
      cwd: pathToCompose,
    });

    // docker compose rm -f traefik
    // docker compose down --remove-orphans

    return true;
    //#endregion
  }
  //#endregion

  //#region methods / enable cloud
  async enableCloud(): Promise<void> {
    //#region @backendFunc
    while (true) {
      Helpers.clearConsole();

      //#region docker check
      Helpers.taskStarted(`Checking if docker is enabled...`);
      const isEnableDocker = await UtilsOs.isDockerAvailable();
      if (!isEnableDocker) {
        Helpers.error(
          `

          Docker is not enabled, please enable docker to use cloud features


          `,
          true,
          true,
        );
        await UtilsTerminal.pressAnyKeyToContinueAsync();
        break;
      }
      Helpers.taskDone(`Docker is enabled!`);
      //#endregion

      //#region kill processes on ports 80 and 443
      // try {
      //   await UtilsProcess.killProcessOnPort(80);
      // } catch (error) {
      //   Helpers.error(
      //     `

      //     Not able to kill process on port 80, please close it manually
      //     and start again...

      //     `,
      //     true,
      //     true,
      //   );
      //   await UtilsTerminal.pressAnyKeyToContinueAsync();
      //   break;
      // }

      // try {
      //   await UtilsProcess.killProcessOnPort(443);
      // } catch (error) {
      //   Helpers.error(
      //     `

      //     Not able to kill process on port 80, please close it manually
      //     and start again...

      //     `,
      //     true,
      //     true,
      //   );
      //   await UtilsTerminal.pressAnyKeyToContinueAsync();
      //   break;
      // }
      //#endregion

      //#region traefik check
      const isTraefikStarted = await this.startTraefik();
      if (!isTraefikStarted) {
        Helpers.error(
          `

          Please pull the latest version of Taon to get the latest docker templates
          Use command: ${config.frameworkName} sync


          `,
          true,
          true,
        );
        await UtilsTerminal.pressAnyKeyToContinueAsync();
        break;
      }
      //#endregion

      Helpers.taskDone(`Taon cloud started! Enjoy deploying new projects!`);
      this.cloudIsEnabled = true;
      await UtilsTerminal.pressAnyKeyToContinueAsync();
      break;
    }
    //#endregion
  }
  //#endregion

  //#region methods / disable cloud
  async disableCloud(): Promise<void> {
    //#region @backendFunc
    while (true) {
      Helpers.clearConsole();

      await this.stopTraefik();
      // await UtilsProcess.killProcessOnPort(80);
      // await UtilsProcess.killProcessOnPort(443);
      Helpers.taskDone(`Taon cloud disabled!`);
      this.cloudIsEnabled = false;
      await UtilsTerminal.pressAnyKeyToContinueAsync();
      break;
    }
    //#endregion
  }
  //#endregion
}
