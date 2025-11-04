//#region imports
import { CoreModels, frameworkName, path } from 'tnp-core/src';
import {
  _,
  crossPlatformPath,
  isElevated,
  UtilsNetwork,
  UtilsTerminal,
} from 'tnp-core/src';
import { UtilsCliClassMethod } from 'tnp-core/src';
import { BaseCLiWorkerStartMode, Helpers, UtilsZip } from 'tnp-helpers/src';
import { BaseCLiWorkerStartParams } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';
// import { ProcessWorker } from '../abstract/taon-worker/processes/process/process.worker';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem

export class $Cloud extends BaseCli {
  declare params: EnvOptions & Partial<BaseCLiWorkerStartParams>;
  static [UtilsCliClassMethod.staticClassNameProperty] = '$Cloud';

  //#region _
  async _(): Promise<void> {
    const { Project } = await import('../abstract/project');
    await Project.ins.taonProjectsWorker.cliStartProcedure({
      methodOptions: {
        cliParams: {
          ...this.params,
          mode: BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
        },
        calledFrom: 'cli-CLOUD/$Cloud._',
      },
    });
  }
  //#endregion

  //#region start file deploy
  @UtilsCliClassMethod.decoratorMethod('startFileDeploy')
  async startFileDeploy(): Promise<void> {
    let zipDeploymentFileAbsPath = this.firstArg;
    if (!zipDeploymentFileAbsPath) {
      throw new Error(
        'You have to provide path to file that should be deployed',
      );
    }
    if (!path.isAbsolute(zipDeploymentFileAbsPath)) {
      throw new Error(
        'You have to provide absolute path to file that should be deployed',
      );
    }
    if (!zipDeploymentFileAbsPath.endsWith('.zip')) {
      throw new Error('Provided file for deployment has to be .zip file');
    }
    if (!Helpers.exists(zipDeploymentFileAbsPath)) {
      throw new Error(
        `File provided for deployment does not exist: ${zipDeploymentFileAbsPath}`,
      );
    }

    const unpackedZipFolder = zipDeploymentFileAbsPath.replace('.zip', '');

    Helpers.remove(unpackedZipFolder);
    await UtilsZip.unzipArchive(zipDeploymentFileAbsPath);
    const { Project } = await import('../abstract/project');
    const dockerComposeProject = Project.ins.From(unpackedZipFolder);
    if (!dockerComposeProject) {
      throw new Error(
        `Docker compose project not found inside zip file. Make sure that you zipped the project folder.`,
      );
    }

    if (!dockerComposeProject) {
      throw new Error(
        `Project not found. You have to be inside project folder to use this command.`,
      );
    }
    await dockerComposeProject.docker.updateDockerComposePorts();
    await new Promise<void>(resolve => {
      dockerComposeProject.docker
        .getDockerComposeUpExecChildProcess('down')
        .once('exit', () => {
          resolve(void 0);
        })
        .once('error', () => {
          resolve(void 0);
        });
    });

    await new Promise<void>(resolve => {
      dockerComposeProject.docker
        .getDockerComposeUpExecChildProcess('up')
        .once('exit', () => {
          resolve(void 0);
        })
        .once('error', () => {
          process.exit(1);
        });
    });
    process.exit(0);
  }
  //#endregion

  //#region stop file deploy
  @UtilsCliClassMethod.decoratorMethod('stopFileDeploy')
  async stopFileDeploy(): Promise<void> {
    let zipDeploymentFileAbsPath = this.firstArg;
    if (!zipDeploymentFileAbsPath) {
      throw new Error(
        'You have to provide path to file that should be deployed',
      );
    }
    if (!path.isAbsolute(zipDeploymentFileAbsPath)) {
      throw new Error(
        'You have to provide absolute path to file that should be deployed',
      );
    }
    if (!zipDeploymentFileAbsPath.endsWith('.zip')) {
      throw new Error('Provided file for deployment has to be .zip file');
    }
    if (!Helpers.exists(zipDeploymentFileAbsPath)) {
      throw new Error(
        `File provided for deployment does not exist: ${zipDeploymentFileAbsPath}`,
      );
    }

    const unpackedZipFolder = zipDeploymentFileAbsPath.replace('.zip', '');

    const { Project } = await import('../abstract/project');
    const dockerComposeProject = Project.ins.From(unpackedZipFolder);
    if (!dockerComposeProject) {
      console.warn(
        `Docker compose project not found inside zip file. Make sure that you zipped the project folder.`,
      );
      process.exit(0);
    }

    if (!dockerComposeProject) {
      console.warn(
        `Project not found. You have to be inside project folder to use this command.`,
      );
      process.exit(1);
    }

    const child =
      dockerComposeProject.docker.getDockerComposeUpExecChildProcess('down');

    await new Promise<void>(resolve => {
      child.once('exit', () => {
        Helpers.remove(unpackedZipFolder);
        resolve(void 0);
      });
    });
    process.exit(0);
  }
  //#endregion

  //#region deployments
  @UtilsCliClassMethod.decoratorMethod('deployments')
  async deployments(): Promise<void> {
    // UtilsTerminal.drawBigText('Deployments');
    // await this.project.ins.taonProjectsWorker.deploymentsWorker.startNormallyInCurrentProcess();
    const { Project } = await import('../abstract/project');
    await Project.ins.taonProjectsWorker.deploymentsWorker.cliStartProcedure({
      methodOptions: {
        cliParams: {
          ...this.params,
          mode: BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
        },
        calledFrom: 'cli-CLOUD/$Cloud.deployments',
      },
    });
  }
  //#endregion

  //#region instances
  @UtilsCliClassMethod.decoratorMethod('instances')
  async instances(): Promise<void> {
    // UtilsTerminal.drawBigText('Deployments');
    const { Project } = await import('../abstract/project');
    await Project.ins.taonProjectsWorker.instancesWorker.cliStartProcedure({
      methodOptions: {
        cliParams: {
          ...this.params,
          mode: BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
        },
        calledFrom: 'cli-CLOUD/$Cloud.instances',
      },
    });
  }
  //#endregion

  //#region processes
  @UtilsCliClassMethod.decoratorMethod('processes')
  async processes(): Promise<void> {
    // UtilsTerminal.drawBigText('Deployments');
    const { Project } = await import('../abstract/project');
    await Project.ins.taonProjectsWorker.processesWorker.cliStartProcedure({
      methodOptions: {
        cliParams: {
          ...this.params,
          mode: BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
        },
        calledFrom: 'cli-CLOUD/$Cloud.processes',
      },
    });
  }
  //#endregion

  //#region send
  async send(): Promise<void> {
    // await this.project.ins.taonProjectsWorker.deploymentsWorker.startNormallyInCurrentProcess();
    const { Project } = await import('../abstract/project');
    const ctrl =
      await Project.ins.taonProjectsWorker.deploymentsWorker.getRemoteControllerFor(
        {
          methodOptions: {
            calledFrom: 'cli-CLOUD/$Cloud.send',
          },
        },
      );

    const filePath = path.isAbsolute(this.firstArg)
      ? crossPlatformPath(this.firstArg)
      : crossPlatformPath([this.cwd, this.firstArg]);

    Helpers.taskStarted(`Uploading file "${filePath}" to server...`);
    const data = await ctrl.uploadLocalFileToServer(filePath);
    console.log(data);
    Helpers.taskDone(`Done uploading file "${this.firstArg}" to server`);
    this._exit();
  }
  //#endregion
}

export default {
  $Cloud: Helpers.CLIWRAP($Cloud, '$Cloud'),
};
