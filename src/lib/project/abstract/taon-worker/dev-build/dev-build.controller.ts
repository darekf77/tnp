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
import { _, chalk, CoreModels, Helpers, UtilsTerminal } from 'tnp-core/src';

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

  //#region API / html info
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

  //#region API / get all data
  @GET()
  getAllData(): Taon.Response<{}> {
    //#region @websqlFunc
    return async (req, res) => {
      return await this.devBuildRepository.getAllData();
    };
    //#endregion
  }
  //#endregion

  //#region API / get status info
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

  //#region API / health heck
  @POST()
  healthCheck(): Taon.Response<boolean> {
    //#region @backenFunc
    return async (req, res) => {
      return true;
    };
    //#endregion
  }
  //#endregion

  //#region API / unlock leader build queue
  @POST()
  unlockLeaderQueue(
    @Query('buildType') buildType: CoreModels.BuildType,
  ): Taon.Response<boolean> {
    //#region @backenFunc
    return async (req, res) => {
      const project = this.devBuildRepository.getProject();
      const notifier = project.taonBuildObserver.buildsNotifiers.get(buildType);
      // Helpers.logInfo(`unlocking ${buildType} in leader`)
      notifier.next();
      return true;
    };
    //#endregion
  }
  //#endregion

  //#region API / unlock leader build queue
  @POST()
  setLeadBuildDirtyIfRunning(): Taon.Response<boolean> {
    //#region @backenFunc
    return async (req, res) => {
      const project = this.devBuildRepository.getProject();
      project.taonBuildObserver.setLeadBuildDirtyIfRunning();
      return true;
    };
    //#endregion
  }
  //#endregion

  //#region API / display rebuild done message
  @POST()
  displayRebuildDoneMessage(
    @Query('startedBy') startedBy: string,
  ): Taon.Response<boolean> {
    //#region @backenFunc
    return async (req, res) => {
      const project = this.devBuildRepository.getProject();
      UtilsTerminal.drawHorizontalLine();
      console.log(
        chalk.green(`

    REBUILD STARED BY ${startedBy}
    DONE FOR ${chalk.bold(project.nameForNpmPackage)}

        `),
      );
      UtilsTerminal.drawHorizontalLine();
      return true;
    };
    //#endregion
  }
  //#endregion

  //#region API / update taon build status in child
  @POST()
  updateTaonBuildStatus(
    @Query('buildType') buildType: CoreModels.BuildType,
    @Query('status') status: DevMode.ProjectBuildStatus,
    @Query('leaderPort') leaderPort?: number | string,
  ): Taon.Response<DevMode.BuildStatusInfo> {
    //#region @backenFunc
    return async (req, res) => {
      if (leaderPort) {
        leaderPort = Number(leaderPort);
      }

      const project = this.devBuildRepository.getProject();
      project.taonBuildObserver.toNotifyLeaderPort = Number(leaderPort);
      project.taonBuildObserver.toNotifyBuildType = buildType;
      project.taonBuildObserver.states.get(buildType).set(status);
      return project.taonBuildObserver.buildStatusInfo;
    };
    //#endregion
  }
  //#endregion
}
