//#region imports
import { promisify } from 'util';

import { config } from 'tnp-config/src';
import {
  _,
  child_process,
  crossPlatformPath,
  fse,
  path,
  UtilsOs,
  UtilsProcess,
  UtilsTerminal,
} from 'tnp-core/src';
import { BaseCliWorker, Helpers } from 'tnp-helpers/src';

import { CURRENT_PACKAGE_VERSION } from '../../../build-info._auto-generated_';
import { taonBasePathToGlobalDockerTemplates } from '../../../constants';
import type { TaonProjectResolve } from '../project-resolve';

import { DeploymentsWorker } from './deployments/deployments.worker';
import { InstancesWorker } from './instances/instances.worker';
import { TaonTerminalUI } from './taon-terminal-ui';
import { TaonProjectsContextTemplate } from './taon.context';
import { TaonProjectsController } from './taon.controller';
//#endregion

export class TaonProjectsWorker extends BaseCliWorker<
  TaonProjectsController,
  TaonTerminalUI
> {
  //#region properties
  public cloudIsEnabled = false;
  protected reverseProxyNetworkName = 'traefik-net';

  // @ts-ignore
  terminalUI = new TaonTerminalUI(this);

  workerContextTemplate = TaonProjectsContextTemplate as any; // TODO for some reason as any is nessesary
  controllerClass = TaonProjectsController;
  public deploymentsWorker: DeploymentsWorker;
  public instancesWorker: InstancesWorker;
  //#endregion

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
    //#region @backend
    this.deploymentsWorker = new DeploymentsWorker(
      'taon-project-deployments-worker',
      `${global.frameworkName} cloud:deployments`,
    );
    this.instancesWorker = new InstancesWorker(
      'taon-project-instances-worker',
      `${global.frameworkName} cloud:instances`,
    );
    //#endregion
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

    Helpers.taskStarted(`Waiting for deployments manager to be started...`);
    await this.deploymentsWorker.startDetachedIfNeedsToBeStarted({
      useCurrentWindowForDetach: true,
    });

    Helpers.taskStarted(`Waiting for taon instances manager to be started...`);
    await this.instancesWorker.startDetachedIfNeedsToBeStarted({
      useCurrentWindowForDetach: true,
    });

    Helpers.taskDone(`Ports manager started !`);
    await super.startNormallyInCurrentProcess();
    //#endregion
  }
  //#endregion

  //#region methods / get worker terminal actions
  async checkIfTreafikIsRunning(options?: {
    waitUntilHealthy?: boolean;
    maxTries?: number;
  }): Promise<boolean> {
    //#region @backendFunc
    let tries = 0;
    options = options || {};
    if (options.waitUntilHealthy) {
      options.maxTries = options.maxTries || 50;
    }
    const execAsync = promisify(child_process.exec);
    while (true) {
      tries++;
      if (options.maxTries && tries > options.maxTries) {
        console.log(
          `Traefik is not running or not healthy after ${tries} tries`,
        );
        return false;
      }
      try {
        const { stdout } = await execAsync(
          process.platform === 'win32'
            ? `docker inspect --format="{{json .State.Health.Status}}" traefik`
            : `docker inspect --format='{{json .State.Health.Status}}' traefik`,
        );

        const status = stdout.trim().replace(/"/g, '');
        Helpers.logInfo(`Traefik health: ${status}`);

        if (status === 'healthy') {
          console.log('✅ Traefik is ready');
          return true;
        }
        if (status === 'unhealthy') {
          console.log('❌ Traefik is unhealthy');
          if (options.waitUntilHealthy) {
            console.log('Traefik state is not healthy yet, waiting...');
          } else {
            console.log('Traefik state is not running or not healthy');
            return false;
          }
        }
      } catch (error) {
        // console.error(error);
        if (options.waitUntilHealthy) {
          console.log('Traefik is not healthy yet, waiting...');
        } else {
          console.log('Traefik is not running or not healthy');
          return false;
        }
      }

      await UtilsTerminal.wait(1);
    }
    //#endregion
  }
  //#endregion

  //#region methods / delete traefik network
  async deleteTraefikNetwork(): Promise<void> {
    //#region @backendFunc

    try {
      child_process.execSync(
        `docker network rm ${this.reverseProxyNetworkName}`,
        { stdio: 'inherit' },
      );
      console.log(`🗑️  Network deleted: ${this.reverseProxyNetworkName}`);
    } catch (error: any) {
      console.log(
        `ℹ️ Network '${this.reverseProxyNetworkName}' probably does not exist, skipping.`,
      );
    }
    //#endregion
  }
  //#endregion

  //#region methods / make sure traefik network created
  async makeSureTraefikNetworkCreated(): Promise<void> {
    //#region @backendFunc
    try {
      child_process.execSync(
        `docker network create ${this.reverseProxyNetworkName}`,
        {
          stdio: 'inherit',
        },
      );
      console.log(`✅ Network created: ${this.reverseProxyNetworkName}`);
    } catch (error: any) {
      console.log(
        `ℹ️ Network '${this.reverseProxyNetworkName}' probably already exists, skipping.`,
      );
    }
    //#endregion
  }
  //#endregion

  //#region methods / start traefik
  protected async startTraefik(): Promise<boolean> {
    //#region @backendFunc

    await this.makeSureTraefikNetworkCreated();

    const isOsWithGraphicalInterface =
      UtilsOs.isRunningInOsWithGraphicsCapableEnvironment();

    console.log(
      `🚀 Starting Traefik ${isOsWithGraphicalInterface ? 'DEV' : 'PROD'}...`,
    );
    const execAsync = promisify(child_process.exec);

    Helpers.removeFolderIfExists(this.pathToTreafikComposeDest);
    Helpers.copy(this.pathToComposeSource, this.pathToTreafikComposeDest, {
      recursive: true,
    });

    await execAsync(
      `docker compose -f ` +
        ` traefik-compose${isOsWithGraphicalInterface ? '.local-dev' : ''}.yml up -d traefik`,
      {
        cwd: this.pathToTreafikComposeDest,
      },
    );

    // Wait until container health becomes healthy
    const isHealthy = await this.checkIfTreafikIsRunning({
      waitUntilHealthy: true,
    });

    return isHealthy;
    //#endregion
  }
  //#endregion

  //#region get path to compose source
  private get pathToComposeSource(): string {
    //#region @backendFunc
    const pathToComposeSource = this.ins
      .by('isomorphic-lib')
      .pathFor(`docker-templates/terafik`);

    return pathToComposeSource;
    //#endregion
  }
  //#endregion

  //#region get path to compose dest
  get pathToTreafikComposeDest(): string {
    //#region @backendFunc
    const pathToComposeDest = crossPlatformPath([
      taonBasePathToGlobalDockerTemplates,
      path.basename(this.pathToComposeSource),
    ]);
    return pathToComposeDest;
    //#endregion
  }
  //#endregion

  //#region methods / stop traefik
  async stopTraefik(): Promise<boolean> {
    //#region @backendFunc
    console.log('Stopping Traefik...');

    await this.deleteTraefikNetwork();

    const execAsync = promisify(child_process.exec);
    // Start traefik in detached mode

    try {
      await execAsync(`docker compose -f traefik-compose.yml down`, {
        cwd: this.pathToTreafikComposeDest,
      });
    } catch (error) {
      Helpers.error(error, true, true);
      Helpers.warn('Error stopping Traefik:');
      return false;
    }

    Helpers.removeFolderIfExists(this.pathToTreafikComposeDest);

    // docker compose rm -f traefik
    // docker compose down --remove-orphans

    return true;
    //#endregion
  }
  //#endregion

  //#region methods / check if docker enabled
  async checkIfDockerEnabled(): Promise<boolean> {
    //#region @backendFunc
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
      return false;
    }
    Helpers.taskDone(`Docker is enabled!`);
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
      if (!(await this.checkIfDockerEnabled())) {
        return;
      }
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
