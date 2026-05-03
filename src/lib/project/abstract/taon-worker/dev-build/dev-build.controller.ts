//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  GET,
  Query,
  TaonBaseController,
  HTML,
  POST,
  Body,
  Symbols,
} from 'taon/src';
import { _, CoreModels } from 'tnp-core/src';

import type { EnvOptions } from '../../../../options';
import { Project } from '../../project';
import { DevMode } from '../dev-mode/dev-mode.models';

import { DevBuildRepository } from './dev-build.repository';
//#endregion

@TaonController({
  className: 'DevBuildController',
})
export class DevBuildController extends TaonBaseController {
  devBuildRepository = this.injectKvRepository(DevBuildRepository);

  //#region html info
  @HTML({
    pathIsGlobal: true,
    path: '/info',
  })
  info(): Taon.ResponseHtml {
    //#region @backendFunc
    return async (req, res) => {
      const currentCommand =
        await this.devBuildRepository.get('currentCommand');
      const commandStatus = await this.devBuildRepository.get('commandStatus');
      // const jsonDbLocation = this.devBuildRepository.jsonDbLocation;
      // console.log({
      //   currentCommand,
      //   commandStatus,
      //   jsonDbLocation,
      // });
      const project = this.devBuildRepository.getProject();
      return `
<html>
<head><title>Action on project Info</title></head>
<body>
    <h1>Project path: "${project?.location}" is</h1>
    <h1>command name: ${currentCommand} </h1>
    <h1>command status: ${commandStatus} </h1>
    <h4>version: ${project?.packageJson?.version}</h4>
    <h4>pid: ${process.pid}</h4><br>
    <script>
     // setTimeout(() => {
     //   location.reload();
     // }, 2000);
    </script>
</body>
<html>
      `;
    };
    //#endregion
  }
  //#endregion

  //#region get all data
  @GET()
  getAllData(): Taon.Response<{}> {
    //#region @websqlFunc
    return async (req, res) => {
      return await this.devBuildRepository.getAllData();
    };
    //#endregion
  }
  //#endregion

  //#region give permission to build
  @GET()
  getStatusInfo(): Taon.Response<DevMode.BuildStatusInfo> {
    //#region @backenFunc
    return async (req, res) => {
      // console.log(`instance ${this[Symbols.taonInstanceId]}`);
      const project = this.devBuildRepository.getProject();
      return project.taonBuildObserver.buildStatusInfo;
    };
    //#endregion
  }
  //#endregion

  //#region give permission to build
  @POST()
  triggerRebuildOf(
    @Query('buildType') buildType: CoreModels.BuildType,
  ): Taon.Response<DevMode.BuildStatusInfo> {
    //#region @backenFunc
    return async (req, res) => {
      const project = this.devBuildRepository.getProject();
      project.taonBuildObserver.states
        .get(buildType)
        .set(DevMode.ProjectBuildStatus.__SET_READY_FOR_REBUILD__);
      return project.taonBuildObserver.buildStatusInfo;
    };
    //#endregion
  }
  //#endregion

  //#region health heck
  @POST()
  healthCheck(): Taon.Response<boolean> {
    //#region @backenFunc
    return async (req, res) => {
      return true;
    };
    //#endregion
  }
  //#endregion

  //#region give permission to build
  @POST()
  cancelAndSetAsReadyForRebuildTrigger(
    @Query('buildType') buildType: CoreModels.BuildType,
  ): Taon.Response<DevMode.BuildStatusInfo> {
    //#region @backenFunc
    return async (req, res) => {
      const project = this.devBuildRepository.getProject();
      project.taonBuildObserver.states
        .get(buildType)
        .set(DevMode.ProjectBuildStatus.__CANCEL_BUILD__);
      return project.taonBuildObserver.buildStatusInfo;
    };
    //#endregion
  }
  //#endregion
}
