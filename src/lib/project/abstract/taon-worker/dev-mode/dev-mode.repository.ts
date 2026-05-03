//#region imports
import { HttpResponseError, RestErrorResponseWrapper } from 'ng2-rest/src';
import {
  EndpointContext,
  TaonBaseKvRepository,
  TaonBaseRepository,
  TaonContext,
  TaonRepository,
} from 'taon/src';
import { Raw } from 'taon-typeorm/src';
import {
  _,
  CoreModels,
  crossPlatformPath,
  Helpers,
  taonPackageName,
  Utils,
  UtilsOs,
  UtilsProcess,
} from 'tnp-core/src';
import { BaseProjectResolver } from 'tnp-helpers/src';

import { Project } from '../../project';
import { TaonProjectResolve } from '../../project-resolve';
import { DevBuildController } from '../dev-build/dev-build.controller';
import { DevBuildUtils } from '../dev-build/dev-build.utils';

import { DevMode } from './dev-mode.models';

//#endregion

const WRITE_LOG_TO_FILE = true;
const LOG_ENABLED = true;

@TaonRepository({
  className: 'DevModeRepository',
})
export class DevModeRepository extends TaonBaseKvRepository<{
  //#region database model
  /**
   * hot updated list of watch and non-watch projects
   * currenlty being in dev-mode
   */
  poolOfDevModeProjects: {
    [frameworkVersion: string]: DevMode.ProjectBuildNotificaiton[];
  };

  /**
   * non-watch builds that should in theory thrigger rebuild of some
   * watch build in build queue)
   */
  last10NonWatchBuilds: {
    [frameworkVersion: string]: DevMode.ProjectBuildNotificaiton[];
  };

  /**
   * how update list of current projects being build
   */
  buildQueue: {
    [frameworkVersion: string]: DevMode.ProjectBuildNotificaiton[];
  };

  frameworkVersions: CoreModels.FrameworkVersion[];
  //#endregion
}> {
  //#region fields
  private logMessages: string[] = [];

  private contexts = new Map<number, EndpointContext>();

  private isBuilding = false;

  private debouceBuildImmediiate = false;

  private debouceBuildImmediiateTimeoutSeconds = 2;
  //#endregion

  private debouceCheckIfQueueEmpty = _.debounce(() => {
    this.addMessage(`Debounce idle queue check trigger`);
    this.debouceUpdateBuildQueue();
  }, 2000);

  //#region private method / debouce update build queue
  private debouceUpdateBuildQueue = _.debounce(async () => {
    //#region @backendFunc
    if (this.isBuilding) {
      this.debouceBuildImmediiate = true;
      return;
    }

    while (true) {
      this.isBuilding = true;
      this.addMessage('Startin debouce update build queue');

      const frameworkVersions = (await this.get('frameworkVersions')) || [];

      //#region loop over groupped build by framework version
      for (const frameworkVersion of frameworkVersions) {
        const buildQueueData = (await this.get('buildQueue')) || {
          [frameworkVersion]: [],
        };
        buildQueueData[frameworkVersion] =
          buildQueueData[frameworkVersion] || [];

        let buildQueue = buildQueueData[frameworkVersion]
          .map(f => DevMode.ProjectBuildNotificaiton.from(f))
          .filter(f => f.coreContainerVersion === frameworkVersion);

        const resolver = new BaseProjectResolver(
          DevMode.ProjectBuildNotificaiton,
          () => 'test-cli-dummy',
        );

        buildQueue = await this.updateQueueBuildFromPool(
          buildQueue,
          frameworkVersion,
        );

        buildQueue = buildQueue.filter(f => !!f);

        buildQueue =
          resolver.sortGroupOfProject<DevMode.ProjectBuildNotificaiton>(
            buildQueue,
            proj => proj.devModeDependenciesNames || [],
            proj => proj.nameForNpmPackage,
            proj => `${proj.nameForNpmPackage}___${proj.port}`,
          );

        const buildsThatAreNonWatch: DevMode.ProjectBuildNotificaiton[] = [];
        const watchBuildWithoutProcess: DevMode.ProjectBuildNotificaiton[] = [];
        for (let index = 0; index < buildQueue.length; index++) {
          const build = buildQueue[index];
          if (index < DevMode.MAX_NUMBER_OF_CONCURENT_BUILDS) {
            if (build.allBuildsSucceed) {
              buildQueue[index] = void 0;
            }
          }

          const isOK = await this.childQuickHealthCheck(build);
          if (!isOK) {
            if (build.isWatchBuild) {
              watchBuildWithoutProcess.push(build);
            } else {
              if (build.allBuildsSucceed) {
                buildsThatAreNonWatch.push(build);
              }
            }
            buildQueue[index] = void 0;
          }
        }

        await this.deleteFromPool(watchBuildWithoutProcess);

        await this.updateAddLast10NonWatch(
          frameworkVersion,
          buildsThatAreNonWatch,
        );

        buildQueue = buildQueue.filter(f => !!f);

        this.addMessage(`buildQueue size for operations ${buildQueue.length}`);

        // TODO @LAST
        // from worker invalidate porjec ?

        for (let index = 0; index < buildQueue.length; index++) {
          let build = buildQueue[index];
          if (index + 1 <= DevMode.MAX_NUMBER_OF_CONCURENT_BUILDS) {
            build.buildStatusInfo = await this.triggerRebuildOf(
              build,
              'backend',
            );
            build.buildStatusInfo = await this.triggerRebuildOf(
              build,
              'browser',
            );
            build.buildStatusInfo = await this.triggerRebuildOf(
              build,
              'websql',
            );
          } else {
            build.buildStatusInfo =
              await this.cancelAndSetAsReadyForRebuildTrigger(build, 'backend');
            build.buildStatusInfo =
              await this.cancelAndSetAsReadyForRebuildTrigger(build, 'browser');
            build.buildStatusInfo =
              await this.cancelAndSetAsReadyForRebuildTrigger(build, 'websql');
          }
        }

        await this.merge('buildQueue', { [frameworkVersion]: buildQueue });
      }
      //#endregion

      if (this.debouceBuildImmediiate) {
        await Utils.wait(this.debouceBuildImmediiateTimeoutSeconds);
        this.debouceBuildImmediiate = false;
        continue;
      }
      this.isBuilding = false;
      this.debouceCheckIfQueueEmpty();
      this.addMessage('Done debouce update build queue');
      return;
    }

    //#endregion
  }, 1000);
  //#endregion

  //#region private methods / update queue build from pool
  private async updateQueueBuildFromPool(
    queueBuilds: DevMode.ProjectBuildNotificaiton[],
    frameworkVersion: CoreModels.FrameworkVersion,
  ) {
    //#region @backendFunc
    queueBuilds = queueBuilds || [];
    const currentPoolData = (await this.get('poolOfDevModeProjects')) || {
      [frameworkVersion]: [],
    };
    currentPoolData[frameworkVersion] = currentPoolData[frameworkVersion] || [];

    const currentPool = currentPoolData[frameworkVersion]
      .map(f => DevMode.ProjectBuildNotificaiton.from(f))
      .filter(f => f.coreContainerVersion === frameworkVersion);

    const currentPoolMap = new Map<string, DevMode.ProjectBuildNotificaiton>(
      currentPool.map(c => [c.uniqueKey, c]),
    );
    for (let index = 0; index < queueBuilds.length; index++) {
      const build = queueBuilds[index];
      if (currentPoolMap.has(build.uniqueKey)) {
        queueBuilds[index] = currentPoolMap.get(build.uniqueKey);
      } else {
        queueBuilds[index] = void 0;
      }
    }
    queueBuilds = queueBuilds.filter(f => !!f);

    const queueBuildMap = new Map<string, DevMode.ProjectBuildNotificaiton>(
      queueBuilds.map(c => [c.uniqueKey, c]),
    );

    for (let index = 0; index < currentPool.length; index++) {
      const poolBuild = currentPool[index];
      if (!queueBuildMap.has(poolBuild.uniqueKey)) {
        queueBuilds.push(poolBuild);
      }
    }

    return queueBuilds;
    //#endregion
  }
  //#endregion

  //#region private methods / get dev build controller
  public async getDevBuildControllerForPort(
    port: number | string,
  ): Promise<DevBuildController> {
    //#region @backendFunc
    port = Number(port);
    let contextForPort = this.contexts.get(Number(port));
    if (!contextForPort) {
      const ref = await DevBuildUtils.context
        .cloneAsRemote({
          overrideRemoteHost: `http://localhost:${port}`,
        })
        .initialize();
      contextForPort = ref;
      this.contexts.set(Number(port), ref);
    }

    const devBuildController = contextForPort.getInstanceBy(DevBuildController);
    return devBuildController;
    //#endregion
  }
  //#endregion

  //#region private methods / quick health check
  private async childQuickHealthCheck(
    project: DevMode.ProjectBuildNotificaiton,
  ) {
    //#region @backendFunc

    const devBuildController = await this.getDevBuildControllerForPort(
      project.port,
    );

    this.addMessage(`Health check in ${project.nameForNpmPackage}`);
    let maxTrys = 3;
    do {
      try {
        await devBuildController.healthCheck().request!({
          timeout: 500,
        });
        return true;
      } catch (error) {}
    } while (--maxTrys > 0);
    return false;
    //#endregion
  }
  //#endregion

  //#region private methods / trigger rebuild of
  private async triggerRebuildOf(
    project: DevMode.ProjectBuildNotificaiton,
    buildType: CoreModels.BuildType,
  ): Promise<DevMode.BuildStatusInfo> {
    //#region @backendFunc
    if (
      project.buildStatusInfo &&
      project.buildStatusInfo[buildType] ===
        DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER
    ) {
      const devBuildController = await this.getDevBuildControllerForPort(
        project.port,
      );

      this.addMessage(
        `Give persmission for build ${buildType} in ${project.nameForNpmPackage}`,
      );
      try {
        const data = await devBuildController.triggerRebuildOf(buildType)
          .request!({
          // timeout: 1000,
        });
        return data.body.json;
      } catch (error) {
        if (error instanceof HttpResponseError) {
          const err = error as HttpResponseError<RestErrorResponseWrapper>;
          this.addMessage(err.body.json.message.trim());
          this.addMessage(err.body.json.details.trim());
        }

        this.addMessage(`[givePermissionToBuildIfNeeded] request error`);
      }
      return project.buildStatusInfo;
    }
    //#endregion
  }
  //#endregion

  //#region private methods / cancel and set as ready for rebuild trigger
  private async cancelAndSetAsReadyForRebuildTrigger(
    project: DevMode.ProjectBuildNotificaiton,
    buildType: CoreModels.BuildType,
  ): Promise<DevMode.BuildStatusInfo> {
    //#region @backendFunc

    const devBuildController = await this.getDevBuildControllerForPort(
      project.port,
    );

    this.addMessage(
      `Cancel build ${buildType} in ${project.nameForNpmPackage}`,
    );

    try {
      const data =
        await devBuildController.cancelAndSetAsReadyForRebuildTrigger(buildType)
          .request!({
          // timeout: 1000,
        });
      return data.body.json;
    } catch (error) {
      this.addMessage(`[cancelAndSetAsReadyForRebuildTrigger] request error`);
    }

    //#endregion
  }
  //#endregion

  //#region private methods / update-delete last 10
  private async updateDeleteLast10NonWatch(
    frameworkVersion: CoreModels.FrameworkVersion,
    addedProjects: DevMode.ProjectBuildNotificaiton[],
  ) {
    //#region @backendFunc
    const last10Data = (await this.get('last10NonWatchBuilds')) || {
      [frameworkVersion]: [],
    };
    last10Data[frameworkVersion] = last10Data[frameworkVersion] || [];
    let last10 = last10Data[frameworkVersion].map(f =>
      DevMode.ProjectBuildNotificaiton.from(f),
    );
    const addedProjectsMap = new Map(addedProjects.map(c => [c.uniqueKey, c]));
    for (let index = 0; index < last10.length; index++) {
      const normalBuild = last10[index];

      if (addedProjectsMap.has(normalBuild.uniqueKey)) {
        last10[index] = undefined;
      }
    }
    last10 = last10.filter(f => !!f);
    await this.merge('last10NonWatchBuilds', {
      [frameworkVersion]: Utils.uniqArray<DevMode.ProjectBuildNotificaiton>(
        last10,
        'uniqueKey',
      ).slice(-10),
    });
    //#endregion
  }
  //#endregion

  //#region private methods / update-add-to last 10
  private async updateAddLast10NonWatch(
    frameworkVersion: CoreModels.FrameworkVersion,
    addIfNotAdded: DevMode.ProjectBuildNotificaiton[],
  ) {
    //#region @backendFunc
    addIfNotAdded = addIfNotAdded.filter(f => !f.isWatchBuild);

    const last10Data = (await this.get('last10NonWatchBuilds')) || {
      [frameworkVersion]: [],
    };
    last10Data[frameworkVersion] = last10Data[frameworkVersion] || [];
    let last10 = last10Data[frameworkVersion].map(f =>
      DevMode.ProjectBuildNotificaiton.from(f),
    );
    const existed = new Map(last10.map(c => [c.uniqueKey, c]));
    for (let index = 0; index < addIfNotAdded.length; index++) {
      const maybeToAdd = addIfNotAdded[index];
      if (!existed.has(maybeToAdd.uniqueKey)) {
        last10.push(maybeToAdd);
      }
    }
    last10 = last10.filter(f => !!f);
    await this.merge('last10NonWatchBuilds', {
      [frameworkVersion]: Utils.uniqArray<DevMode.ProjectBuildNotificaiton>(
        last10,
        'uniqueKey',
      ).slice(-10),
    });
    //#endregion
  }
  //#endregion

  //#region private methods / update pool of dev projects
  private async updatePoolOfDevProjects(opt: {
    oldListOfProjects: DevMode.ProjectBuildNotificaiton[];
    newListOfPorjects: DevMode.ProjectBuildNotificaiton[];
    addedProjects?: DevMode.ProjectBuildNotificaiton[];
    changedProjects?: DevMode.ProjectBuildNotificaiton[];
    deletedProjects?: DevMode.ProjectBuildNotificaiton[];
    frameworkVersion: CoreModels.FrameworkVersion;
  }) {
    //#region @backendFunc

    //#region update and sort build queue
    const resolver = new BaseProjectResolver(
      DevMode.ProjectBuildNotificaiton,
      () => 'test-cli-dummy',
    );

    const sortedPoolOfDevModeProjects =
      resolver.sortGroupOfProject<DevMode.ProjectBuildNotificaiton>(
        opt.newListOfPorjects,
        proj => proj.devModeDependenciesNames || [],
        proj => proj.nameForNpmPackage,
        proj => `${proj.nameForNpmPackage}___${proj.port}`,
      );

    await this.merge('poolOfDevModeProjects', {
      [opt.frameworkVersion]: sortedPoolOfDevModeProjects,
    });
    //#endregion

    //#region update framework versions
    const frameworkVersions: CoreModels.FrameworkVersion[] = [
      ...opt.newListOfPorjects,
      ...opt.oldListOfProjects,
    ].reduce((a, b) => {
      return [...a, b.coreContainerVersion];
    }, []);

    await this.set(
      'frameworkVersions',
      Utils.uniqArray(frameworkVersions).sort(),
    );
    //#endregion

    if (Array.isArray(opt.addedProjects) && opt.addedProjects.length > 0) {
      //#region if project goes into watch mode -> remove it from non watch list
      await this.updateDeleteLast10NonWatch(
        opt.frameworkVersion,
        opt.addedProjects,
      );
      //#endregion
    }

    if (Array.isArray(opt.deletedProjects) && opt.deletedProjects.length > 0) {
      //#region add non watch build to last 10 cyclic queue
      await this.updateAddLast10NonWatch(
        opt.frameworkVersion,
        opt.deletedProjects,
      );

      for (const deletedBuild of opt.deletedProjects || []) {
        const ref = this.contexts.get(Number(deletedBuild.port));
        if (ref) {
          await ref.destroy();
        }
        this.contexts.delete(Number(deletedBuild.port));
      }

      //#endregion
    }

    this.debouceUpdateBuildQueue();
    //#endregion
  }
  //#endregion

  //#region public methods / delete from pool
  public async deleteFromPool(
    projs:
      | DevMode.ProjectBuildNotificaiton
      | DevMode.ProjectBuildNotificaiton[],
  ) {
    //#region @backendFunc
    if (!Array.isArray(projs)) {
      projs = [projs];
    }

    const allDeleted: DevMode.ProjectBuildNotificaiton[] = [];

    for (let index = 0; index < projs.length; index++) {
      const proj = projs[index];
      const frameworkVersion = proj.coreContainerVersion;
      const poolOfDevModeProjectsData = (await this.get(
        'poolOfDevModeProjects',
      )) || {
        [proj.coreContainerVersion]: [],
      };

      poolOfDevModeProjectsData[frameworkVersion] =
        poolOfDevModeProjectsData[frameworkVersion] || [];

      let poolOfDevModeProjects = poolOfDevModeProjectsData[
        frameworkVersion
      ].map(f => DevMode.ProjectBuildNotificaiton.from(f));
      const oldListOfProjects = [...poolOfDevModeProjects];

      const deletedProjects: DevMode.ProjectBuildNotificaiton[] = [];
      poolOfDevModeProjects = poolOfDevModeProjects.filter(f => {
        const isBuildFromBody = f.isEqual(proj);
        if (isBuildFromBody) {
          deletedProjects.push(f);
          allDeleted.push(f);
          return false;
        }
        return true;
      });

      await this.updatePoolOfDevProjects({
        newListOfPorjects: poolOfDevModeProjects,
        oldListOfProjects,
        deletedProjects,
        frameworkVersion,
      });

      this.addMessage(
        `removing from pool - package "${proj.nameForNpmPackage}" port ${proj.port}`,
      );
    }

    return allDeleted;
    //#endregion
  }
  //#endregion

  //#region public methods / update pool
  public async updatePool(body: DevMode.ProjectBuildNotificaiton) {
    //#region @backendFunc
    const frameworkVersion = body.coreContainerVersion;
    const poolOfDevModeProjectsData = (await this.get(
      'poolOfDevModeProjects',
    )) || {
      [frameworkVersion]: [],
    };
    poolOfDevModeProjectsData[frameworkVersion] =
      poolOfDevModeProjectsData[frameworkVersion] || [];

    let poolOfDevModeProjects = poolOfDevModeProjectsData[frameworkVersion].map(
      f => DevMode.ProjectBuildNotificaiton.from(f),
    );
    const changedProjects: DevMode.ProjectBuildNotificaiton[] = [];
    const addedProjects: DevMode.ProjectBuildNotificaiton[] = [];
    const oldListOfProjects = [...poolOfDevModeProjects];

    // const toCanel = _.cloneDeep(buildQueue);
    const existedIndex = poolOfDevModeProjects.findIndex(c => c.isEqual(body));
    if (existedIndex === -1) {
      poolOfDevModeProjects.push(body);
      addedProjects.push(body);
    } else {
      poolOfDevModeProjects[existedIndex] = body;
      changedProjects.push(body);
    }

    await this.updatePoolOfDevProjects({
      newListOfPorjects: poolOfDevModeProjects,
      oldListOfProjects,
      changedProjects,
      addedProjects,
      frameworkVersion,
    });

    this.addMessage(
      `updating pool - package "${body.nameForNpmPackage}" port ${body.port}`,
    );

    return poolOfDevModeProjects;
    //#endregion
  }
  //#endregion

  //#region public methods / get all frameowrk verisons in dev mode
  public async getAllFrameworkVersionInDevMode(): Promise<
    CoreModels.FrameworkVersion[]
  > {
    //#region @backendFunc
    return (await this.get('frameworkVersions')) || [];
    //#endregion
  }
  //#endregion

  //#region public methods / get pool of dev mode projects
  async getPoolOfDevModePorjects(
    frameworkVersion: CoreModels.FrameworkVersion,
  ): Promise<DevMode.ProjectBuildNotificaiton[]> {
    //#region @backendFunc
    const data = await this.get('poolOfDevModeProjects');
    console.log({ data });
    return data[frameworkVersion];
    //#endregion
  }
  //#endregion

  //#region public methods / get all messages
  public getAllLogMessage(): string[] {
    return this.logMessages;
  }
  //#endregion

  //#region private fields / get path to log
  pathToLog = crossPlatformPath([
    UtilsOs.getRealHomeDir(),
    `.${taonPackageName}`,
    `log-files-for/deb-mode-worker.json`,
  ]);
  //#endregion

  //#region private fields / debouce write log
  debouceWriteLog = _.debounce(() => {
    //#region @backendFunc
    if (!WRITE_LOG_TO_FILE) {
      return;
    }

    Helpers.writeJson(this.pathToLog, this.logMessages);
    //#endregion
  }, 1000);
  //#endregion

  //#region private methods / add message
  private addMessage(msg: string): void {
    //#region @backendFunc
    if (LOG_ENABLED) {
      this.logMessages.push(msg);
      this.logMessages = this.logMessages.slice(-100);
      this.debouceWriteLog();
    }
    //#endregion
  }
  //#endregion

  //#region public methods / clear message
  public clearMessage(): void {
    //#region @backendFunc
    this.logMessages.length = 0;
    if (WRITE_LOG_TO_FILE) {
      Helpers.writeJson(this.pathToLog, []);
    }
    //#endregion
  }
  //#endregion

  //#region protected methods / use in db memory
  protected useInMemoryDB(): boolean {
    return false;
  }
  //#endregion

  //#region init _
  async _() {
    await this.set('poolOfDevModeProjects', {});
    await this.set('buildQueue', {});
    await this.set('last10NonWatchBuilds', {});
    await this.set('frameworkVersions', []);
    if (WRITE_LOG_TO_FILE) {
      Helpers.writeJson(this.pathToLog, []);
    }
  }
  //#endregion
}
