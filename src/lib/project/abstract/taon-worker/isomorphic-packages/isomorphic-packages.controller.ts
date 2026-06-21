//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  GET,
  POST,
  Query,
  Body,
} from 'taon/src';
import { _, CoreModels } from 'tnp-core/src';
import { TaonBaseCliWorkerController } from 'tnp-helpers/src';

import { DevMode } from '../dev-mode/dev-mode.models';

import { IsomorphicPackagesRepository } from './isomorphic-packages.repository';
//#endregion

@TaonController({
  className: 'IsomorphicPackagesController',
})
export class IsomorphicPackagesController extends TaonBaseCliWorkerController {
  isomorphicPackagesRepository = this.injectCustomRepo(
    IsomorphicPackagesRepository,
  );

  //#region get all for framework version
  @GET()
  getAllFor(
    @Query('frameworkVersion') frameworkVersion: CoreModels.FrameworkVersion,
  ): Taon.Response<string[]> {
    //#region @backendFunc
    return async (req, res) => {
      return this.isomorphicPackagesRepository.getAllFor(frameworkVersion);
    };
    //#endregion
  }
  //#endregion

  //#region update isomorphic packages for framework version
  @POST()
  updateIsomoprhicFor(
    @Body() body: DevMode.ProjectBuildNotificaiton,
  ): Taon.Response<boolean> {
    //#region @backendFunc
    return async (req, res) => {
      body = DevMode.ProjectBuildNotificaiton.from(body);
      this.isomorphicPackagesRepository.updateIsomorphicArrayThrothle(body);
      return true;
    };
    //#endregion
  }
  //#endregion
}
