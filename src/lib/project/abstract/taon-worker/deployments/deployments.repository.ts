//#region imports
import { ChildProcess } from 'child_process';

import { Taon } from 'taon/src';
import { config } from 'tnp-config/src';
import {
  _,
  child_process,
  CoreModels,
  crossPlatformPath,
  fse,
  Helpers,
  path,
  UtilsProcess,
} from 'tnp-core/src';
import { UtilsCliMethod } from 'tnp-helpers/src';

import { $Cloud } from '../../../cli/cli-CLOUD';
import { Project } from '../../project';
import { Processes } from '../processes/processes';
import { ProcessesRepository } from '../processes/processes.repository';

import { Deployments } from './deployments';
import { DEPLOYMENT_LOCAL_FOLDER_PATH } from './deployments.constants';
import {
  DeploymentsAddingStatus,
  DeploymentsAddingStatusObj,
  DeploymentStatusNotAllowedToStart,
} from './deployments.models';
//#endregion

@Taon.Repository({
  className: 'DeploymentsRepository',
})
export class DeploymentsRepository extends Taon.Base.Repository<Deployments> {
  entityClassResolveFn: () => typeof Deployments = () => Deployments;
  processesRepository = this.injectCustomRepo(ProcessesRepository);

  //#region private zipfileAbsPath
  private zipfileAbsPath(zipFileBasenameMetadataPart: string): string {
    const zipfileAbsPath = crossPlatformPath([
      DEPLOYMENT_LOCAL_FOLDER_PATH,
      zipFileBasenameMetadataPart,
    ]);
    return zipfileAbsPath;
  }
  //#endregion

  //#region remove deployment process
  async removeDeploymetProcess({
    deployment,
    zipFileBasenameMetadataPart,
  }: {
    deployment: Deployments;
    zipFileBasenameMetadataPart: string;
  }): Promise<void> {
    //#region @backendFunc
    deployment = await this.findOne({
      where: {
        zipFileBasenameMetadataPart,
      },
    });
    if (!deployment) {
      throw new Error(
        `Deployment with name ${zipFileBasenameMetadataPart} not found`,
      );
    }

    const stoppedDeployment = await this.stopDeploymentProcess({
      zipFileBasenameMetadataPart,
      deployment,
    });

    await this.deleteById(stoppedDeployment.id);

    const unpackedZipfileAbsPath = crossPlatformPath([
      DEPLOYMENT_LOCAL_FOLDER_PATH,
      zipFileBasenameMetadataPart.replace('.zip', ''),
    ]);
    Helpers.remove(unpackedZipfileAbsPath);

    const zipfileAbsPath = crossPlatformPath([
      DEPLOYMENT_LOCAL_FOLDER_PATH,
      zipFileBasenameMetadataPart,
    ]);

    Helpers.remove(zipfileAbsPath);
    //#endregion
  }
  //#endregion

  //#region trigger deployment remove
  async triggerRemoveDeployment(
    zipFileBasenameMetadataPart: string,
  ): Promise<void> {
    //#region @backendFunc
    const deployment = await this.findOne({
      where: {
        zipFileBasenameMetadataPart,
      },
    });
    if (!deployment) {
      throw new Error(
        `Deployment with name ${zipFileBasenameMetadataPart} not found`,
      );
    }

    deployment.status = 'removing';
    await this.save(deployment);
    setTimeout(
      () =>
        this.removeDeploymetProcess({
          zipFileBasenameMetadataPart,
          deployment,
        }),
      1000,
    );
    //#endregion
  }
  //#endregion

  //#region stop deployment process
  private async stopDeploymentProcess({
    deployment,
    zipFileBasenameMetadataPart,
  }: {
    deployment: Deployments;
    zipFileBasenameMetadataPart: string;
  }): Promise<Deployments> {
    //#region @backendFunc
    deployment = await this.findOne({
      where: {
        zipFileBasenameMetadataPart,
      },
    });
    await this.processesRepository.stop(deployment.processId);

    const unpackedZipfileAbsPath = crossPlatformPath([
      DEPLOYMENT_LOCAL_FOLDER_PATH,
      zipFileBasenameMetadataPart.replace('.zip', ''),
    ]);

    const projectDockerCompose = Project.ins.From(unpackedZipfileAbsPath);

    const markDeploymentAsNotStarted = async () => {
      deployment = await this.findOne({
        where: {
          zipFileBasenameMetadataPart,
        },
      });
      deployment.status = 'not-started';
      await this.save(deployment);
      return deployment;
    };

    if (!projectDockerCompose) {
      return await markDeploymentAsNotStarted();
    }

    return await new Promise<Deployments>((resolve, rej) => {
      projectDockerCompose.docker
        .getDockerComposeUpExecChildProcess('down')
        .on('error', async err => {
          console.error(`Error while stopping docker compose down`);
          console.error(err);
          deployment = await markDeploymentAsNotStarted();
          resolve(deployment);
        })
        .on('close', async () => {
          deployment = await markDeploymentAsNotStarted();
          resolve(deployment);
        });
    });
    //#endregion
  }
  //#endregion

  //#region trigger deployment stop
  async triggerDeploymentStop(
    zipFileBasenameMetadataPart: string,
    options?: {
      skipThrowingErrorIfNotFound?: boolean;
      removing?: boolean;
    },
  ): Promise<Deployments> {
    //#region @backendFunc
    options = options || {};
    let deployment = await this.findOne({
      where: {
        zipFileBasenameMetadataPart,
      },
    });

    if (!deployment) {
      if (options.skipThrowingErrorIfNotFound) {
        return void 0;
      }
      throw new Error(
        `Deployment with name ${zipFileBasenameMetadataPart} not found`,
      );
    }

    deployment.status = options.removing ? 'removing' : 'stopping';
    await this.save(deployment);
    setTimeout(
      () =>
        this.stopDeploymentProcess({
          deployment,
          zipFileBasenameMetadataPart,
        }),
      1000,
    );
    //#endregion
  }
  //#endregion

  //#region start deployment process
  private async startDeploymentProcess({
    deployment,
    zipFileBasenameMetadataPart,
  }: {
    deployment: Deployments;
    zipFileBasenameMetadataPart: string;
  }): Promise<Deployments> {
    deployment = await this.findOne({
      where: {
        zipFileBasenameMetadataPart,
      },
    });
    const zipfileAbsPath = this.zipfileAbsPath(zipFileBasenameMetadataPart);

    const command = `${config.frameworkName} ${UtilsCliMethod.getFrom(
      $Cloud.prototype.startFileDeploy,
    )} ${zipfileAbsPath}`;

    const procFromDb = await this.processesRepository.save(
      new Processes().clone({
        command,
        cwd: DEPLOYMENT_LOCAL_FOLDER_PATH,
      }),
    );

    deployment.processId = procFromDb.id;
    deployment.status = 'in-progress';

    await this.save(deployment);

    return new Promise<Deployments>(async resolve => {
      const callbackWhenAppReady = async () => {
        deployment = await this.findOne({
          where: {
            zipFileBasenameMetadataPart,
          },
        });
        deployment.status = 'success';
        await this.save(deployment);
        resolve(deployment);
      };

      await this.processesRepository
        .start(procFromDb.id, {
          processName: `taon-deployment`,
          specialEvent: {
            stdout: [
              {
                stringInStream: CoreModels.SPECIAL_APP_READY_MESSAGE,
                callback: () => callbackWhenAppReady(),
              },
            ],
            stderr: [
              {
                stringInStream: CoreModels.SPECIAL_APP_READY_MESSAGE,
                callback: () => callbackWhenAppReady(),
              },
            ],
          },
        })
        .catch(async err => {
          deployment.status = 'error';
          await this.save(deployment);
        });
    });
  }
  //#endregion

  //#region start deployment start
  async triggerDeploymentStart(
    zipFileBasenameMetadataPart: string,
    options?: {
      // forceStart?: boolean;
    },
  ): Promise<Deployments> {
    //#region @backendFunc
    options = options || {};
    let deployment = await this.findOne({
      where: {
        zipFileBasenameMetadataPart,
      },
    });
    if (deployment) {
      if (DeploymentStatusNotAllowedToStart.includes(deployment.status)) {
        throw new Error(
          `Deployment can't be started in status "${deployment.status}"`,
        );
      }
    }

    if (!Helpers.exists(this.zipfileAbsPath(zipFileBasenameMetadataPart))) {
      throw new Error(
        `File for deployment not found: ${this.zipfileAbsPath(zipFileBasenameMetadataPart)}`,
      );
    }
    deployment.status = 'starting';
    await this.save(deployment);

    setTimeout(
      () =>
        this.startDeploymentProcess({
          deployment,
          zipFileBasenameMetadataPart,
        }),
      1000,
    );

    return deployment;
    //#endregion
  }
  //#endregion

  //#region add existed deployments process

  /**
   * TODO disable http timeout for large files
   */
  async addExistedDeploymentsProcess(): Promise<void> {
    //#region @backendFunc
    const allZips = Helpers.getFilesFrom(DEPLOYMENT_LOCAL_FOLDER_PATH).filter(
      f => f.endsWith('.zip'),
    );

    // console.log(`Found ${allZips.length} zip files in deployment folder.`);

    for (const zipAbsPath of allZips) {
      const existing = await this.findOne({
        where: {
          zipFileBasenameMetadataPart: path.basename(zipAbsPath),
        },
      });
      if (!existing) {
        const deployment = new Deployments().clone({
          zipFileBasenameMetadataPart: path.basename(zipAbsPath),
          size: fse.statSync(zipAbsPath).size,
        });
        await this.save(deployment);
      }
    }
    //#endregion
  }
  //#endregion

  //#region trigger add existed deployments
  private isAddingDeployment: DeploymentsAddingStatus = 'not-started';
  triggerAddExistedDeployments(): void {
    //#region @backendFunc
    this.isAddingDeployment = 'started';
    setTimeout(() => this.addExistedDeploymentsProcess(), 1000);
    //#endregion
  }

  isAddingDeploymentStatus(): DeploymentsAddingStatusObj {
    return {
      status: this.isAddingDeployment,
    };
  }

  //#endregion
}
