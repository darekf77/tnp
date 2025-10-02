//#region imports
import { ChildProcess } from 'child_process';

import { Taon } from 'taon/src';
import { config } from 'tnp-config/src';
import {
  _,
  child_process,
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
//#endregion

@Taon.Repository({
  className: 'DeploymentsRepository',
})
export class DeploymentsRepository extends Taon.Base.Repository<Deployments> {
  entityClassResolveFn: () => typeof Deployments = () => Deployments;
  processesRepository = this.injectCustomRepo(ProcessesRepository);

  getLast100linesOfOutput(zipFileBasenameMetadataPart: string): string[] {
    //#region @backendFunc

    return [];
    //#endregion
  }

  //#region remove deployment
  async removeDeployment(zipFileBasenameMetadataPart: string): Promise<void> {
    //#region @backendFunc
    const stoppedDeployment = await this.stopDeploymentFor(
      zipFileBasenameMetadataPart,
    );
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

  //#region stop deployment
  async stopDeploymentFor(
    zipFileBasenameMetadataPart: string,
  ): Promise<Deployments> {
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

    deployment.status = 'stopping';
    await this.save(deployment);

    await this.processesRepository.stop(deployment.processId);

    const unpackedZipfileAbsPath = crossPlatformPath([
      DEPLOYMENT_LOCAL_FOLDER_PATH,
      zipFileBasenameMetadataPart.replace('.zip', ''),
    ]);

    const projectDockerCompose = Project.ins.From(unpackedZipfileAbsPath);

    return await new Promise<Deployments>((resolve, rej) => {
      projectDockerCompose.docker
        .getDockerComposeUpExecChildProcess('down')
        .on('error', err => {
          console.error(`Error while stopping docker compose down`);
          console.error(err);
          resolve(deployment);
        })
        .on('close', async () => {
          deployment.status = 'not-started';
          await this.save(deployment);
          resolve(deployment);
        });
    });
    //#endregion
  }
  //#endregion

  //#region start deployment
  async startDeploymentFor(zipFileBasenameMetadataPart: string): Promise<Deployments> {
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
    if (deployment.status == 'in-progress') {
      throw new Error(
        `Deployment with name ${zipFileBasenameMetadataPart} is already in progress`,
      );
    }

    // zipFileBasenameMetadataPart = deployment.zipFileBasenameMetadataPart;

    const zipfileAbsPath = crossPlatformPath([
      DEPLOYMENT_LOCAL_FOLDER_PATH,
      zipFileBasenameMetadataPart,
    ]);
    if (!Helpers.exists(zipfileAbsPath)) {
      throw new Error(`File for deployment not found: ${zipfileAbsPath}`);
    }
    deployment.status = 'in-progress';

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
    await this.save(deployment);

    await this.processesRepository.start(procFromDb.id);
    return deployment;
    //#endregion
  }
  //#endregion

  //#region add existed deployments
  async addExistedDeployments(): Promise<void> {
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
}
