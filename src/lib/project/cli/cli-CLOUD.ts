import { path } from 'tnp-core/src';
import {
  _,
  crossPlatformPath,
  isElevated,
  UtilsNetwork,
  UtilsTerminal,
} from 'tnp-core/src';
import { Helpers, UtilsZip } from 'tnp-helpers/src';
import { UtilsCliMethod } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';

import { BaseCli } from './base-cli';

// @ts-ignore TODO weird inheritance problem
export class $Cloud extends BaseCli {
  async _(): Promise<void> {
    const { Project } = await import('../abstract/project');
    await Project.ins.taonProjectsWorker.cliStartProcedure(this.params);
    // await this.ins.taonProjectsWorker.cliStartProcedure(this.params);
  }

  //#region start file deploy
  @UtilsCliMethod.decorator('startFileDeploy')
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
    dockerComposeProject.docker.getDockerComposeUpExecChildProcess('down');
    dockerComposeProject.docker.getDockerComposeUpExecChildProcess('up');
  }
  //#endregion

  //#region deployments
  @UtilsCliMethod.decorator('deployments')
  async deployments(): Promise<void> {
    // UtilsTerminal.drawBigText('Deployments');
    // await this.project.ins.taonProjectsWorker.deploymentsWorker.startNormallyInCurrentProcess();
    const { Project } = await import('../abstract/project');
    await Project.ins.taonProjectsWorker.deploymentsWorker.cliStartProcedure(
      this.params,
    );
  }
  //#endregion

  //#region instances
  async instances(): Promise<void> {
    // UtilsTerminal.drawBigText('Deployments');
    const { Project } = await import('../abstract/project');
    await Project.ins.taonProjectsWorker.instancesWorker.cliStartProcedure(
      this.params,
    );
  }
  //#endregion

  //#region send
  async send(): Promise<void> {
    // await this.project.ins.taonProjectsWorker.deploymentsWorker.startNormallyInCurrentProcess();
    const { Project } = await import('../abstract/project');
    const ctrl =
      await Project.ins.taonProjectsWorker.deploymentsWorker.getControllerForRemoteConnection();

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
