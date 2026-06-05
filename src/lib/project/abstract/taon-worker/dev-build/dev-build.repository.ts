//#region imports
import {
  Taon,
  TaonBaseRepository,
  TaonBaseKvRepository,
  TaonRepository,
  Symbols,
} from 'taon/src';
import { Raw } from 'taon-typeorm/src';
import { _, Helpers } from 'tnp-core/src';

import { EnvOptions } from '../../../../options';
import { Project } from '../../project';
import type { DevModeController } from '../dev-mode/dev-mode.controller';
import { DevMode } from '../dev-mode/dev-mode.models';

import { DevBuildModels } from './dev-build.models';
//#endregion

@TaonRepository({
  className: 'DevBuildRepository',
})
export class DevBuildRepository extends TaonBaseKvRepository<{
  currentCommand?: string;
  commandStatus?: DevBuildModels.CommandStatus;
}> {
  //#region fields & getters
  static projectsInBuild: {
    project: Project;
    port: DevMode.ProjectBuildNotificaiton['port'];
    buildType: DevMode.ProjectBuildNotificaiton['buildType'];
  }[] = [];

  private project: Project = void 0;

  private envOptions: EnvOptions = void 0;

  setProject({
    project,
    port,
    buildType,
  }: {
    project: Project;
    port: DevMode.ProjectBuildNotificaiton['port'];
    buildType: DevMode.ProjectBuildNotificaiton['buildType'];
  }): void {
    DevBuildRepository.projectsInBuild.push({ project, port, buildType });
    this.project = project;
  }

  setEnvOptions(envOptions: EnvOptions): void {
    this.envOptions = envOptions;
  }

  getProject(): Project {
    return this.project;
  }

  async getProjectInfo(): Promise<DevMode.ProjectBuildNotificaiton> {
    //#region @backendFunc
    const dataToRequest = this.dataToRequest({
      buildStatusInfo: this.project.taonBuildObserver.buildStatusInfo,
    });
    return dataToRequest;
    //#endregion
  }

  //#region private methods / get main worker contorller
  private async getMainWorkerController(): Promise<DevModeController> {
    //#region @backendFunc
    const devModeController =
      await Project.ins.taonProjectsWorker.buildsWorker.getRemoteControllerFor({
        methodOptions: {
          calledFrom: 'dev build repository',
        },
      });
    return devModeController;
    //#endregion
  }

  //#endregion

  //#region public methods / update pool
  async updatePool(opt: {
    buildStatusInfo: DevMode.BuildStatusInfo;
  }): Promise<void> {
    //#region @backendFunc
    const devModeControllerMainWorker = await this.getMainWorkerController();
    const dataToRequest = this.dataToRequest(opt);

    await devModeControllerMainWorker.updatePool(dataToRequest).request!();
    //#endregion
  }
  //#endregion\

  async checkIfProjectAlreadyInBuildPool(): Promise<boolean> {
    //#region @backendFunc
    const devModeControllerMainWorker = await this.getMainWorkerController();
    const dataToRequest = this.dataToRequest();

    Helpers.logInfo(
      `Checking if already in progress ${dataToRequest.uniqueKey}`,
    );

    const data =
      await devModeControllerMainWorker.checkIfProjectAlreadyInBuildPool(
        dataToRequest,
      ).request!();

    return data.body.booleanValue;
    //#endregion
  }

  //#region public methods / delete from pool
  public async deleteFromPool(
    data: DevMode.ProjectBuildNotificaiton,
  ): Promise<DevMode.ProjectBuildNotificaiton[]> {
    //#region @backendFunc
    const devModeControllerMainWorker = await this.getMainWorkerController();

    const deleteFromPoolData =
      await devModeControllerMainWorker.deleteFromPool(data).request!();

    return deleteFromPoolData.body.json;
    //#endregion
  }
  //#endregion

  //#region public method / get all projects in process
  public allProjectsInProcess(): DevMode.ProjectBuildNotificaiton[] {
    return DevBuildRepository.projectsInBuild.map(child => {
      return DevMode.ProjectBuildNotificaiton.from({
        name: child.project.name,
        nameForNpmPackage: child.project.nameForNpmPackage,
        location: child.project.location,
        port: child.port,
        buildType: child.buildType,
        devModeDependenciesNames:
          this.project.taonJson.devModeDependenciesForNpmLib,
        coreContainerVersion: child.project.framework.frameworkVersion,
      });
    });
  }
  //#endregion

  //#region private method / data to request
  public dataToRequest(opt?: {
    buildStatusInfo?: DevMode.BuildStatusInfo;
  }): DevMode.ProjectBuildNotificaiton {
    //#region @backendFunc
    opt = opt || {};
    this.project.taonJson.reloadFromDisk();
    const dataToRequest = DevMode.ProjectBuildNotificaiton.from({
      name: this.project.name,
      buildType: this.envOptions?.build?.watch ? 'watch' : 'normal',
      nameForNpmPackage: this.project.nameForNpmPackage,
      location: this.project.location,
      port: this.project.ins.currentActionPort,
      devModeDependenciesNames:
        this.project.taonJson.devModeDependenciesForNpmLib,

      buildStatusInfo: opt.buildStatusInfo,
      coreContainerVersion: this.project.taonJson.frameworkVersion,
    });

    return dataToRequest;
    //#endregion
  }
  //#endregion
}
