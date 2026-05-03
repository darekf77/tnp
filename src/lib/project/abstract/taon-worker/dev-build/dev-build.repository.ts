//#region imports
import {
  Taon,
  TaonBaseRepository,
  TaonBaseKvRepository,
  TaonRepository,
  Symbols,
} from 'taon/src';
import { Raw } from 'taon-typeorm/src';
import { _ } from 'tnp-core/src';

import { EnvOptions } from '../../../../options';
import { Project } from '../../project';
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
  private project: Project = void 0;

  private envOptions: EnvOptions = void 0;

  setProject(project: Project): void {
    this.project = project;
  }

  setEnvOptions(envOptions: EnvOptions): void {
    this.envOptions = envOptions;
  }

  getProject(): Project {
    return this.project;
  }
  //#endregion

  //#region public methods / update pool
  async updatePool(opt: {
    buildStatusInfo: DevMode.BuildStatusInfo;
    lastError?: string;
  }): Promise<DevMode.ProjectBuildNotificaiton[]> {
    //#region @backendFunc
    const ctrl =
      await Project.ins.taonProjectsWorker.devModeWorker.getRemoteControllerFor(
        {
          methodOptions: {
            calledFrom: 'dev build controller',
          },
        },
      );

    const dataToRequest = this.dataToRequest(opt);

    const data = await ctrl.updatePool(dataToRequest).request!();

    return data.body.json;
    //#endregion
  }
  //#endregion

  //#region public methods / delete from pool
  public async deleteFromPool(): Promise<DevMode.ProjectBuildNotificaiton[]> {
    //#region @backendFunc
    const ctrl =
      await Project.ins.taonProjectsWorker.devModeWorker.getRemoteControllerFor(
        {
          methodOptions: {
            calledFrom: 'dev build controller',
          },
        },
      );

    const dataToRequest = this.dataToRequest();

    const data = await ctrl.deleteFromPool(dataToRequest).request!();

    return data.body.json;
    //#endregion
  }
  //#endregion

  //#region private method / data to request

  private dataToRequest(opt?: {
    buildStatusInfo?: DevMode.BuildStatusInfo;
    lastError?: string;
  }) {
    //#region @backendFunc
    opt = opt || {};
    const dataToRequest = DevMode.ProjectBuildNotificaiton.from({
      name: this.project.name,
      buildType: this.envOptions?.build?.watch ? 'watch' : 'normal',
      nameForNpmPackage: this.project.nameForNpmPackage,
      location: this.project.location,
      port: this.project.ins.currentActionPort,
      devModeDependenciesNames:
        this.project.taonJson.devModeDependenciesForNpmLib,

      buildStatusInfo: opt.buildStatusInfo,
      lastError: opt.lastError,
      coreContainerVersion: this.project.taonJson.frameworkVersion,
    });

    return dataToRequest;
    //#endregion
  }
  //#endregion
}
