//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  GET,
  POST,
  Body,
  Query,
} from 'taon/src';
import { _, CoreModels } from 'tnp-core/src';
import { TaonBaseCliWorkerController } from 'tnp-helpers/src';

import { Project } from '../../project';

import { DevMode } from './dev-mode.models';
import { DevModeRepository } from './dev-mode.repository';
//#endregion

@TaonController({
  className: 'DevModeController',
})
export class DevModeController extends TaonBaseCliWorkerController {
  devModeRepository = this.injectKvRepository(DevModeRepository);

  //#region  get all dev mode projects for given framework version
  @POST()
  setAsLeadProjectAndReturnDependcies(
    @Body() body: DevMode.ProjectBuildNotificaiton,
    @Query('dirtyBuild')
    dirtyBuild: { [key in CoreModels.BuildWatcherType]: boolean },
  ): Taon.Response<DevMode.ProjectBuildNotificaiton[]> {
    //#region @backendFunc
    return async (req, res) => {
      body = DevMode.ProjectBuildNotificaiton.from(body);
      return await this.devModeRepository.setAsLeadProjectAndReturnDependcies(
        body,
        dirtyBuild,
      );
    };
    //#endregion
  }
  //#endregion

  @GET()
  getWhatShouldBeRebuild(
    @Body() body: DevMode.ProjectBuildNotificaiton,
  ): Taon.Response<{
    [key in CoreModels.BuildType]: boolean;
  }> {
    //#region @backendFunc
    return async (req, res) => {
      body = DevMode.ProjectBuildNotificaiton.from(body);
      return await this.devModeRepository.getWhatShouldBeRebuild(body);
    };
    //#endregion
  }

  //#region  get all dev mode projects for given framework version
  @POST()
  finishLeadBuildAndUnregisterLeadProject(
    @Body() body: DevMode.ProjectBuildNotificaiton,
  ): Taon.Response<boolean> {
    //#region @backendFunc
    return async (req, res) => {
      body = DevMode.ProjectBuildNotificaiton.from(body);
      return await this.devModeRepository.finishLeadBuildAndUnregisterLeadProject(
        body,
      );
    };
    //#endregion
  }
  //#endregion

  //#region  check if still build leader
  @GET()
  checkIfStillBuildLeader(
    @Body() body: DevMode.ProjectBuildNotificaiton,
  ): Taon.Response<boolean> {
    //#region @backendFunc
    return async (req, res) => {
      body = DevMode.ProjectBuildNotificaiton.from(body);
      return await this.devModeRepository.checkIfStillBuildLeader(body);
    };
    //#endregion
  }
  //#endregion

  //#region API

  //#region API / update dev mode pool
  @POST()
  updatePool(
    @Body() body: DevMode.ProjectBuildNotificaiton,
  ): Taon.Response<DevMode.ProjectBuildNotificaiton[]> {
    //#region @backendFunc
    return async (req, res) => {
      body = DevMode.ProjectBuildNotificaiton.from(body);
      return this.devModeRepository.updatePool(body);
    };
    //#endregion
  }
  //#endregion

  //#region API / update dev mode pool
  @POST()
  checkIfProjectAlreadyInBuildPool(
    @Body() body: DevMode.ProjectBuildNotificaiton,
  ): Taon.Response<boolean> {
    //#region @backendFunc
    return async (req, res) => {
      body = DevMode.ProjectBuildNotificaiton.from(body);
      return this.devModeRepository.checkIfProjectAlreadyInBuildPool(body);
    };
    //#endregion
  }
  //#endregion

  //#region API / delete from dev mode pool
  @POST()
  deleteFromPool(
    @Body() body: DevMode.ProjectBuildNotificaiton,
  ): Taon.Response<DevMode.ProjectBuildNotificaiton[]> {
    //#region @backendFunc
    return async (req, res) => {
      body = DevMode.ProjectBuildNotificaiton.from(body);
      return this.devModeRepository.deleteFromPool(body);
    };
    //#endregion
  }
  //#endregion

  //#region API / get all dev mode projects for given framework version
  @GET()
  getAllDevModeProjects(
    @Query('frameworkVersion') frameworkVersion: CoreModels.FrameworkVersion,
  ): Taon.Response<DevMode.ProjectBuildNotificaiton[]> {
    //#region @backendFunc
    return async (req, res) => {
      const data =
        await this.devModeRepository.getPoolOfDevModePorjects(frameworkVersion);
      return data;
    };
    //#endregion
  }
  //#endregion

  //#region API / get all framework version in dev mode
  @GET()
  getAllFrameworkVersionInDevMode(): Taon.Response<
    CoreModels.FrameworkVersion[]
  > {
    //#region @backendFunc
    return async (req, res) => {
      const data =
        await this.devModeRepository.getAllFrameworkVersionInDevMode();
      return data;
    };
    //#endregion
  }
  //#endregion

  //#region API / get db location
  @GET()
  getDbLocation(): Taon.Response<string> {
    //#region @backendFunc
    return async (req, res) => {
      const data = await this.devModeRepository.jsonDbLocation;
      return data;
    };
    //#endregion
  }
  //#endregion

  //#region API / get log messages
  @GET()
  getLogMessages(@Query('last') last: number): Taon.Response<string[]> {
    //#region @backendFunc
    return async (req, res) => {
      const data = await this.devModeRepository
        .getAllLogMessage()
        .slice(-1 * Number(last));
      return data;
    };
    //#endregion
  }
  //#endregion

  //#region API / get log messages
  @GET()
  clearLogMessages(): Taon.Response<boolean> {
    //#region @backendFunc
    return async (req, res) => {
      await this.devModeRepository.clearMessage();
      return true;
    };
    //#endregion
  }
  //#endregion

  //#endregion
}
