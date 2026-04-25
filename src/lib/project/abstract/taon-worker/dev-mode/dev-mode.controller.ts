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
import { _ } from 'tnp-core/src';
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

  //#region add to dev mode pool
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

  //#region delete from dev mode pool
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

  //#region get db location
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

  //#region get log messages
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
}
