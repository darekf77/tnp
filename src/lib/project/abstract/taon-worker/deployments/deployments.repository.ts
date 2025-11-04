//#region imports
import { ChildProcess } from 'child_process';

import { Subscription } from 'rxjs';
import { EndpointContext, MulterFileUploadResponse, Taon } from 'taon/src';
import { baseTaonDevProjectsNames, config } from 'tnp-config/src';
import {
  _,
  child_process,
  CoreModels,
  crossPlatformPath,
  fse,
  Helpers,
  path,
  Utils,
  UtilsProcess,
} from 'tnp-core/src';
import { UtilsCliClassMethod } from 'tnp-core/src';

import { $Cloud } from '../../../cli/cli-CLOUD';
import { Project } from '../../project';
import { Processes } from '../processes/processes';
import { ProcessesController } from '../processes/processes.controller';
import { ProcessesRepository } from '../processes/processes.repository';

import { Deployments } from './deployments';
import { DEPLOYMENT_LOCAL_FOLDER_PATH } from './deployments.constants';
import {
  DeploymentsAddingStatus as DeploymentsIsAddingStatus,
  DeploymentsAddingStatusObj,
  DeploymentsStatesAllowedStart,
  DeploymentsStatus,
  DeploymentsStatesAllowedStop,
  DeploymentReleaseData,
} from './deployments.models';
import {
  ProcessesState,
  ProcessesStatesAllowedStart,
} from '../processes/processes.models';
import { UtilsTerminal } from 'tnp-core/src';
//#endregion

@Taon.Repository({
  className: 'DeploymentsRepository',
})
export class DeploymentsRepository extends Taon.Base.Repository<Deployments> {
  entityClassResolveFn: () => typeof Deployments = () => Deployments;

  //#region protected methods

  //#region protected methods / get processes controller
  protected async getProcessesController(): Promise<ProcessesController> {
    // const ctxProcess = await this.getCtxProcesses();
    const processesController =
      await Project.ins.taonProjectsWorker.processesWorker.getRemoteControllerFor<ProcessesController>(
        {
          methodOptions: {
            calledFrom: 'DeploymentsRepository.getCtxProcesses',
          },
          controllerClass: ProcessesController,
        },
      );
    return processesController;
  }
  //#endregion

  //#region protected methods / zipfileAbsPath
  protected zipfileAbsPath(baseFileNameWithHashDatetime: string): string {
    const zipfileAbsPath = crossPlatformPath([
      DEPLOYMENT_LOCAL_FOLDER_PATH,
      baseFileNameWithHashDatetime,
    ]);
    return zipfileAbsPath;
  }
  //#endregion

  protected jsonQueryParamsFileAbsPath(
    baseFileNameWithHashDatetime: string,
  ): string {
    return crossPlatformPath([
      `${this.zipfileAbsPath(baseFileNameWithHashDatetime)}.json`,
    ]);
  }

  //#region public methods / save deployment
  public async saveDeployment(
    file?: MulterFileUploadResponse,
    queryParams?: DeploymentReleaseData,
  ): Promise<Deployments> {
    //#region @backendFunc
    const baseFileNameWithHashDatetime = path.basename(file.savedAs);
    const partialDeployment = {
      baseFileNameWithHashDatetime,
      size: file.size,
      projectName: queryParams.projectName,
      envName: queryParams.envName,
      envNumber: queryParams.envNumber,
      targetArtifact: queryParams.targetArtifact,
      releaseType: queryParams.releaseType,
      version: queryParams.version,
      destinationDomain: queryParams.destinationDomain,
    } as Partial<Deployments>;
    const deployment = await this.save(
      new Deployments().clone(partialDeployment),
    );
    Helpers.writeJson(
      this.jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime),
      partialDeployment,
    );
    return deployment;
    //#endregion
  }
  //#endregion

  //#region protected methods / wait until process killed
  protected async waitUntilProcessKilled(
    processId: string | number,
    callback: () => void | Promise<void>,
  ): Promise<void> {
    //#region @backendFunc
    setTimeout(async () => {
      const processController = await this.getProcessesController();
      while (true) {
        try {
          const proc = await processController
            .getByProcessID(processId)
            .request();
          if (ProcessesStatesAllowedStart.includes(proc.body.json.state)) {
            await callback();
            return;
          }
        } catch (error) {
          console.warn(
            `Process with id ${processId} not found, assuming it is killed or not exists.`,
          );
          await callback();
          return;
        }
        await Utils.wait(1);
      }
    });
    //#endregion
  }
  //#endregion

  //#region protected methods / repeat refresh deployment until final state
  /**
   * wait until deployment reach final state
   * starting => started
   * stopping => stopped
   * + handle failure states
   */
  protected repeatRefreshDeploymentStateUntil(
    deploymentId: string | number,
    options?: {
      refreshEveryMs?: number;
      operation: DeploymentsStatus;
      callback?: () => void | Promise<void>;
    },
  ): void {
    //#region @backendFunc
    options = options || ({} as any);
    options.refreshEveryMs = options.refreshEveryMs || 2000;

    setTimeout(async () => {
      while (true) {
        if (
          await this.refreshDeploymentStateForStartStop(deploymentId, options)
        ) {
          if (options.callback) {
            await options.callback();
          }
          return;
        }
        await Utils.waitMilliseconds(options.refreshEveryMs || 2000);
      }
    }, 1000);
    //#endregion
  }
  //#endregion

  //#region protected methods / refresh deployment state for start stop
  /**
   * refresh deployment state for start and stop
   */
  async refreshDeploymentStateForStartStop(
    deploymentId: string | number,
    options?: {
      refreshEveryMs?: number;
      operation: DeploymentsStatus;
    },
  ): Promise<boolean> {
    //#region @backendFunc
    options = options || ({} as any);

    //#region fetch deployment
    let deployment: Deployments = null;
    try {
      deployment = await this.findOne({
        where: {
          id: deploymentId?.toString(),
        },
      });
    } catch (error) {}

    if (!deployment) {
      console.warn(
        `Deployment with id ${deploymentId} not found. Exiting refresh.`,
      );
      return true; // exit refresh
    }
    //#endregion

    //#region fetch processes
    const processesController = await this.getProcessesController();
    let processComposeUp: Processes = null;
    if (deployment.processIdComposeUp) {
      try {
        const processComposeUpReq = await processesController
          .getByProcessID(deployment.processIdComposeUp)
          .request();
        processComposeUp = processComposeUpReq.body.json;
      } catch (error) {}
    }

    let processComposeDown: Processes = null;
    if (deployment.processIdComposeDown) {
      try {
        const processComposeUpReq = await processesController
          .getByProcessID(deployment.processIdComposeDown)
          .request();
        processComposeDown = processComposeUpReq.body.json;
      } catch (error) {}
    }
    //#endregion

    //#region update deployment status based on processes
    if (processComposeUp && processComposeDown) {
      // both processes exists - should never happen
      throw `

        Both docker up/down exists for deployment ${deployment.id}

        `;
    } else {
      if (processComposeUp) {
        if (options.operation === DeploymentsStatus.STARING) {
          if (processComposeUp.state === ProcessesState.ACTIVE) {
            deployment.status = DeploymentsStatus.STARTED_AND_ACTIVE;
            await this.save(deployment);
            return true; // achieved final state
          }
          if (processComposeUp.state === ProcessesState.ENDED_WITH_ERROR) {
            deployment.status = DeploymentsStatus.FAILED_START;
            await this.save(deployment);
            return true; // achieved final state
          }
        }
      }

      if (processComposeDown) {
        if (options.operation === DeploymentsStatus.STOPPING) {
          if (processComposeDown.state === ProcessesState.ENDED_OK) {
            deployment.status = DeploymentsStatus.STOPPED;
            await this.save(deployment);
            return true; // achieved final state
          }
          if (processComposeDown.state === ProcessesState.ENDED_WITH_ERROR) {
            deployment.status = DeploymentsStatus.STOPPED;
            await this.save(deployment);
            return true; // achieved final state
          }
        }
      }
    }

    //#endregion

    return false; // not achieved final state
    //#endregion
  }
  //#endregion

  //#endregion

  //#region trigger deployment stop
  async triggerDeploymentStop(
    baseFileNameWithHashDatetime: string,
    options?: {
      removeAfterStop?: boolean;
    },
  ): Promise<Deployments> {
    //#region @backendFunc
    options = options || {};
    options.removeAfterStop = options.removeAfterStop || false;

    //#region find deployment
    let deployment = await this.findOne({
      where: {
        baseFileNameWithHashDatetime,
      },
    });
    //#endregion

    //#region handle errors
    if (!deployment) {
      throw new Error(
        `Deployment with base file name ${baseFileNameWithHashDatetime} not found`,
      );
    }

    if (!DeploymentsStatesAllowedStop.includes(deployment.status)) {
      throw new Error(
        `Deployment can't be stopped when process in status "${deployment.status}"`,
      );
    }

    if (!Helpers.exists(this.zipfileAbsPath(baseFileNameWithHashDatetime))) {
      throw new Error(
        `File for deployment not found: ${this.zipfileAbsPath(baseFileNameWithHashDatetime)}`,
      );
    }
    //#endregion

    deployment.status = DeploymentsStatus.STOPPING;
    await this.save(deployment);

    //#region trigger docker compose down process
    const triggerStop = async (): Promise<void> => {
      const zipfileAbsPath = this.zipfileAbsPath(baseFileNameWithHashDatetime);

      const commandComposeDown = `${config.frameworkName} ${UtilsCliClassMethod.getFrom(
        $Cloud.prototype.stopFileDeploy,
      )} ${zipfileAbsPath}`;

      const processComposeDownRequest = await processesController
        .save(
          new Processes().clone({
            command: commandComposeDown,
            cwd: DEPLOYMENT_LOCAL_FOLDER_PATH,
          }),
        )
        .request();

      const processComposeDown = processComposeDownRequest.body.json;

      deployment.processIdComposeDown = processComposeDown.id;

      await this.save(deployment);

      await processesController.triggerStart(processComposeDown.id).request();

      this.repeatRefreshDeploymentStateUntil(deployment.id, {
        operation: DeploymentsStatus.STOPPING,
        callback: async () => {
          await this.remove(deployment);
        },
      });
    };
    //#endregion

    //#region handle existing up process
    const processesController = await this.getProcessesController();
    if (deployment.processIdComposeUp) {
      await processesController
        .triggerStop(deployment.processIdComposeUp)
        .request();

      await this.waitUntilProcessKilled(
        deployment.processIdComposeUp,
        async () => {
          deployment.processIdComposeUp = null;
          await this.save(deployment);
          triggerStop();
        },
      );
    } else {
      triggerStop();
    }
    //#endregion

    return deployment;
    //#endregion
  }
  //#endregion

  //#region trigger deployment start
  async triggerDeploymentStart(
    baseFileNameWithHashDatetime: string,
    options?: {
      // forceStart?: boolean;
    },
  ): Promise<Deployments> {
    //#region @backendFunc

    //#region find deployment
    options = options || {};
    let deployment = await this.findOne({
      where: {
        baseFileNameWithHashDatetime,
      },
    });
    //#endregion

    //#region handle errors
    if (!deployment) {
      throw new Error(
        `Deployment with base file name "${baseFileNameWithHashDatetime}" not found`,
      );
    }

    if (!DeploymentsStatesAllowedStart.includes(deployment.status)) {
      throw new Error(
        `Deployment can't be started when process in status "${deployment.status}"`,
      );
    }

    if (!Helpers.exists(this.zipfileAbsPath(baseFileNameWithHashDatetime))) {
      throw new Error(
        `File for deployment not found: ${this.zipfileAbsPath(baseFileNameWithHashDatetime)}`,
      );
    }
    //#endregion

    deployment.status = DeploymentsStatus.STARING;
    await this.save(deployment);

    //#region trigger docker compose up process
    const triggerStart = async (): Promise<void> => {
      const zipfileAbsPath = this.zipfileAbsPath(baseFileNameWithHashDatetime);

      const commandComposeUp = `${config.frameworkName} ${UtilsCliClassMethod.getFrom(
        $Cloud.prototype.startFileDeploy,
      )} ${zipfileAbsPath}`;

      const cwd = DEPLOYMENT_LOCAL_FOLDER_PATH;

      const procFromReq = await processesController
        .save(
          new Processes().clone({
            command: commandComposeUp,
            cwd,
            conditionProcessActiveStderr: [
              CoreModels.SPECIAL_WORKER_READY_MESSAGE,
            ],
            conditionProcessActiveStdout: [
              CoreModels.SPECIAL_WORKER_READY_MESSAGE,
            ],
          }),
        )
        .request();

      const procFromDb = procFromReq.body.json;

      deployment.processIdComposeUp = procFromDb.id;

      await this.save(deployment);

      await processesController.triggerStart(procFromDb.id).request();

      this.repeatRefreshDeploymentStateUntil(deployment.id, {
        operation: DeploymentsStatus.STARING,
      });
    };
    //#endregion

    //#region handle existing down process
    const processesController = await this.getProcessesController();
    if (deployment.processIdComposeDown) {
      await processesController
        .triggerStop(deployment.processIdComposeUp)
        .request();
      await this.waitUntilProcessKilled(
        deployment.processIdComposeDown,
        async () => {
          deployment.processIdComposeDown = null;
          await this.save(deployment);
          triggerStart();
        },
      );
    } else {
      triggerStart();
    }
    //#endregion

    return deployment;
    //#endregion
  }
  //#endregion

  //#region add existed

  //#region add existed deployments process
  async clearAndAddExistedDeploymentsProcess(): Promise<void> {
    //#region @backendFunc

    // clear all deployments first
    console.log('Clearing existing deployments from database...');
    await this.clear();
    console.log('Existing deployments cleared.');

    const allZips = Helpers.getFilesFrom(DEPLOYMENT_LOCAL_FOLDER_PATH).filter(
      f => f.endsWith('.zip'),
    );

    console.log(`Found ${allZips.length} zip files in deployments folder.`);

    for (const zipAbsPath of allZips) {
      const baseFileNameWithHashDatetime = path.basename(zipAbsPath);
      const existing = await this.findOne({
        where: {
          baseFileNameWithHashDatetime,
        },
      });
      if (!existing) {
        const queryParamsJsonAbsPath = this.jsonQueryParamsFileAbsPath(
          baseFileNameWithHashDatetime,
        );
        if (!fse.existsSync(queryParamsJsonAbsPath)) {
          return;
        }
        const dataJson = Helpers.readFile(
          this.jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime),
        ) as Partial<Deployments>;
        const deployment = new Deployments().clone(dataJson);
        await this.save(deployment);
      }
    }
    this.deploymentsIsAddingStatus = DeploymentsIsAddingStatus.DONE;
    //#endregion
  }
  //#endregion

  //#region trigger add existed deployments
  private deploymentsIsAddingStatus: DeploymentsIsAddingStatus =
    DeploymentsIsAddingStatus.NOT_STARTED;

  triggerAddExistedDeployments(): void {
    //#region @backendFunc
    this.deploymentsIsAddingStatus = DeploymentsIsAddingStatus.IN_PROGRESS;
    setTimeout(async () => {
      try {
        await this.clearAndAddExistedDeploymentsProcess();
      } catch (error) {
        this.deploymentsIsAddingStatus = DeploymentsIsAddingStatus.FAILED;
        return;
      }
    }, 1000);
    //#endregion
  }

  isAddingDeploymentStatus(): DeploymentsAddingStatusObj {
    return {
      status: this.deploymentsIsAddingStatus,
    };
  }

  //#endregion

  //#endregion
}
