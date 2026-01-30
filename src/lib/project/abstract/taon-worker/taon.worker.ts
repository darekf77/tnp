//#region imports
import { config } from 'tnp-core/src';
import { _, UtilsTerminal } from 'tnp-core/src';
import {
  BaseCliWorker,
  BaseCliWorkerGuiUrlOptions,
  BaseCLiWorkerStartMode,
  Helpers,
  UtilsDocker,
} from 'tnp-helpers/src';

import { CURRENT_PACKAGE_VERSION } from '../../../build-info._auto-generated_';
import { skipCoreCheck } from '../../../constants';
import type { TaonProjectResolve } from '../project-resolve';

import { DeploymentsWorker } from './deployments/deployments.worker';
import { InstancesWorker } from './instances/instances.worker';
import { ProcessesWorker } from './processes/processes.worker';
import { TaonTerminalUI } from './taon-terminal-ui';
import { TaonProjectsContextTemplate } from './taon.context';
import { TaonProjectsController } from './taon.controller';
import { TraefikProvider } from './traefik/traefik.provider';
//#endregion

export class TaonProjectsWorker extends BaseCliWorker<
  TaonProjectsController,
  TaonTerminalUI
> {
  //#region properties

  // @ts-ignore
  terminalUI = new TaonTerminalUI(this);

  workerContextTemplate = TaonProjectsContextTemplate as any; // TODO for some reason as any is nessesary

  controllerClass = TaonProjectsController;

  public deploymentsWorker: DeploymentsWorker;

  public instancesWorker: InstancesWorker;

  public processesWorker: ProcessesWorker;

  public traefikProvider = new TraefikProvider(this);
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
    startCommandFn: () => string,
    public readonly ins: TaonProjectResolve,
  ) {
    super(serviceID, startCommandFn, CURRENT_PACKAGE_VERSION);
    // console.log({
    //   depoyments: UtilsCliClassMethod.getFrom($Cloud.prototype.deployments),
    //   instances: UtilsCliClassMethod.getFrom($Cloud.prototype.instances),
    //   processes: UtilsCliClassMethod.getFrom($Cloud.prototype.processes),
    // });
    // console.log('Initializing TaonProjectsWorker...');

    //#region @backend
    this.deploymentsWorker = new DeploymentsWorker(
      'taon-project-deployments-worker',
      () => `${config.frameworkName} cloud:deployments ${skipCoreCheck}`,
    );
    this.instancesWorker = new InstancesWorker(
      'taon-project-instances-worker',
      () => `${config.frameworkName} cloud:instances ${skipCoreCheck}`,
    );
    this.processesWorker = new ProcessesWorker(
      'taon-project-processes-worker',
      () => `${config.frameworkName} cloud:processes ${skipCoreCheck}`,
    );

    // this.deploymentsWorker = new DeploymentsWorker(
    //   'taon-project-deployments-worker',
    //   `${global.frameworkName} ${UtilsCliClassMethod.getFrom($Cloud.prototype.deployments)}`,
    // );
    // this.instancesWorker = new InstancesWorker(
    //   'taon-project-instances-worker',
    //   `${global.frameworkName} ${UtilsCliClassMethod.getFrom($Cloud.prototype.instances)}`,
    // );
    // this.processesWorker = new ProcessesWorker(
    //   'taon-project-processes-worker',
    //   `${global.frameworkName} ${UtilsCliClassMethod.getFrom($Cloud.prototype.processes)}`,
    // );

    if (config.frameworkName !== 'tnp') {
      // skip restarting ports worker for tnp development
      this.dependencyWorkers.set(
        this.ins.portsWorker.serviceID,
        this.ins.portsWorker,
      );
    }

    this.dependencyWorkers.set(
      this.processesWorker.serviceID,
      this.processesWorker,
    );
    this.dependencyWorkers.set(
      this.deploymentsWorker.serviceID,
      this.deploymentsWorker,
    );
    this.dependencyWorkers.set(
      this.instancesWorker.serviceID,
      this.instancesWorker,
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
    await this.ins.portsWorker.cliStartProcedure({
      methodOptions: {
        cliParams: {
          mode: BaseCLiWorkerStartMode.CHILD_PROCESS,
        },
        calledFrom: 'taon projects/portsWorker worker start',
      },
    });

    Helpers.taskStarted(`Waiting for processes manager to be started...`);
    await this.processesWorker.cliStartProcedure({
      methodOptions: {
        cliParams: {
          mode: BaseCLiWorkerStartMode.CHILD_PROCESS,
        },
        calledFrom: 'taon projects/processesWorker worker start',
      },
    });

    Helpers.taskStarted(`Waiting for deployments manager to be started...`);
    await this.deploymentsWorker.cliStartProcedure({
      methodOptions: {
        cliParams: {
          mode: BaseCLiWorkerStartMode.CHILD_PROCESS,
        },
        calledFrom: 'taon projects/deploymentsWorker worker start',
      },
    });

    Helpers.taskStarted(`Waiting for taon instances manager to be started...`);
    await this.instancesWorker.cliStartProcedure({
      methodOptions: {
        cliParams: {
          mode: BaseCLiWorkerStartMode.CHILD_PROCESS,
        },
        calledFrom: 'taon projects/instancesWorker worker start',
      },
    });

    await super.startNormallyInCurrentProcess({
      actionBeforeTerminalUI: async () => {
        Helpers.info(``);
        await this.traefikProvider.initialCloudStatusCheck();
      },
    });
    //#endregion
  }
  //#endregion

  //#region methods / enable cloud
  async enableCloud(): Promise<void> {
    //#region @backendFunc
    UtilsTerminal.clearConsole();
    const isTraefikStarted = await this.traefikProvider.startTraefik();
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
      return;
    }
    Helpers.taskDone(`Taon cloud started! Enjoy deploying new projects!`);
    await UtilsTerminal.pressAnyKeyToContinueAsync();
    //#endregion
  }
  //#endregion

  //#region methods / disable cloud
  async disableCloud(): Promise<void> {
    //#region @backendFunc
    while (true) {
      UtilsTerminal.clearConsole();

      await this.traefikProvider.stopTraefik();
      await UtilsDocker.removeAllTaonContainersAndImagesFromDocker();
      // await UtilsProcess.killProcessOnPort(80);
      // await UtilsProcess.killProcessOnPort(443);
      Helpers.taskDone(`Taon cloud disabled!`);
      await UtilsTerminal.pressAnyKeyToContinueAsync();
      break;
    }
    //#endregion
  }
  //#endregion
}
