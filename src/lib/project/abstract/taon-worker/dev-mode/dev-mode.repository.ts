//#region imports
import {
  EndpointContext,
  TaonBaseKvRepository,
  TaonBaseRepository,
  TaonContext,
  TaonRepository,
} from 'taon/src';
import { Raw } from 'taon-typeorm/src';
import { _, CoreModels, Utils, UtilsOs, UtilsProcess } from 'tnp-core/src';

import { DevMode } from './dev-mode.models';
import { TaonProjectResolve } from '../../project-resolve';
import { Project } from '../../project';
import { DevBuildUtils } from '../dev-build/dev-build.utils';
import { DevBuildController } from '../dev-build/dev-build.controller';
import { BaseProjectResolver } from 'tnp-helpers/src';
//#endregion

@TaonRepository({
  className: 'DevModeRepository',
})
export class DevModeRepository extends TaonBaseKvRepository<{
  /**
   * how update list of current porjects being build
   */
  poolOfDevModeProjects: {
    [frameworkVersion: string]: DevMode.ProjectBuildNotificaiton[];
  };

  /**
   * how update list of current porjects being build
   */
  last10NonWatchBuilds: {
    [frameworkVersion: string]: DevMode.ProjectBuildNotificaiton[];
  };

  /**
   * how update list of current porjects being build
   */
  buildQueue: {
    [frameworkVersion: string]: DevMode.ProjectBuildNotificaiton[];
  };

  frameworkVersions: CoreModels.FrameworkVersion[];
}> {
  //#region fields
  private logMessages: string[] = [];
  private contexts = new Map<number, EndpointContext>();
  private isBuilding = false;
  private debouceBuildImmediiate = false;

  private debouceBuildImmediiateTimeoutSeconds = 2;
  //#endregion

  //#region debouce update build queue
  private debouceUpdateBuildQueue = _.debounce(async () => {
    //#region @backendFunc
    if (this.isBuilding) {
      this.debouceBuildImmediiate = true;
      return;
    }

    while (true) {
      this.isBuilding = true;

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

        await this.updateQueueBuildFromPool(buildQueue, frameworkVersion);

        buildQueue = buildQueue.filter(f => !!f);

        for (let index = 0; index < buildQueue.length; index++) {
          const build = buildQueue[index];
          if (index < DevMode.MAX_NUMBER_OF_CONCURENT_BUILDS) {
            if (build.allBuildsSucceed) {
              buildQueue[index] = void 0;
            }
          }
        }

        buildQueue = buildQueue.filter(f => !!f);

        // TODO @LAST
        for (let index = 0; index < buildQueue.length; index++) {
          let build = buildQueue[index];
          if (index + 1 <= DevMode.MAX_NUMBER_OF_CONCURENT_BUILDS) {
            await this.givePermissionToBuildIfNeeded(build, 'backend');
            await this.givePermissionToBuildIfNeeded(build, 'browser');
            await this.givePermissionToBuildIfNeeded(build, 'websql');
          } else {
            await this.cancelAndSetAsReadyForRebuildTrigger(build, 'backend');
            await this.cancelAndSetAsReadyForRebuildTrigger(build, 'browser');
            await this.cancelAndSetAsReadyForRebuildTrigger(build, 'websql');
          }
        }

        await this.updateQueueBuildFromPool(buildQueue, frameworkVersion);
        buildQueue = buildQueue.filter(f => !!f);
        await this.merge('buildQueue', { [frameworkVersion]: buildQueue });
      }
      //#endregion

      if (this.debouceBuildImmediiate) {
        await Utils.wait(this.debouceBuildImmediiateTimeoutSeconds);
        this.debouceBuildImmediiate = false;
        continue;
      }
      this.isBuilding = false;
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

    return {
      currentPool,
    };
    //#endregion
  }
  //#endregion

  //#region private methods / get dev build controller
  private async getDevBuildControllerForPort(
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

  //#region private methods / give persmission & trigger in child build
  private async givePermissionToBuildIfNeeded(
    project: DevMode.ProjectBuildNotificaiton,
    buildType: CoreModels.BuildType,
  ) {
    //#region @backendFunc
    if (
      project.buildStatusInfo &&
      project.buildStatusInfo[buildType] ===
        DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER
    ) {
      const devBuildController = await this.getDevBuildControllerForPort(
        project.port,
      );

      try {
        await devBuildController.givePermissionForBuild(buildType).request!({
          // timeout: 1000,
        });
      } catch (error) {
        this.addMessage(`[givePermissionToBuildIfNeeded] request error`);
      }
    }
    //#endregion
  }
  //#endregion

  //#region private methods / cancel and set as ready for rebuild trigger
  private async cancelAndSetAsReadyForRebuildTrigger(
    project: DevMode.ProjectBuildNotificaiton,
    buildType: CoreModels.BuildType,
  ) {
    //#region @backendFunc

    const devBuildController = await this.getDevBuildControllerForPort(
      project.port,
    );
    try {
      await devBuildController.cancelAndSetAsReadyForRebuildTrigger(buildType)
        .request!({
        // timeout: 1000,
      });
    } catch (error) {
      this.addMessage(`[cancelAndSetAsReadyForRebuildTrigger] request error`);
    }

    //#endregion
  }
  //#endregion

  //#region private methods update
  private async updatePoolOfDevProjects(opt: {
    oldListOfProjects: DevMode.ProjectBuildNotificaiton[];
    newListOfPorjects: DevMode.ProjectBuildNotificaiton[];
    addedProjects?: DevMode.ProjectBuildNotificaiton[];
    changedProjects?: DevMode.ProjectBuildNotificaiton[];
    deletedProjects?: DevMode.ProjectBuildNotificaiton[];
    frameworkVersion: CoreModels.FrameworkVersion;
  }) {
    //#region @backendFunc
    // build queue update algorithm

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

    if (opt.deletedProjects || []) {
      const last10Data = (await this.get('last10NonWatchBuilds')) || {
        [opt.frameworkVersion]: [],
      };
      last10Data[opt.frameworkVersion] = last10Data[opt.frameworkVersion] || [];
      const last10 = last10Data[opt.frameworkVersion].map(f =>
        DevMode.ProjectBuildNotificaiton.from(f),
      );

      for (const deletedBuild of opt.deletedProjects || []) {
        const ref = this.contexts.get(Number(deletedBuild.port));
        if (ref) {
          await ref.destroy();
        }
        this.contexts.delete(Number(deletedBuild.port));
        last10.push(deletedBuild);
      }

      await this.merge('last10NonWatchBuilds', {
        [opt.frameworkVersion]:
          Utils.uniqArray<DevMode.ProjectBuildNotificaiton>(
            last10,
            'uniqueKey',
          ).slice(-10),
      });
    }

    this.debouceUpdateBuildQueue();
    //#endregion
  }
  //#endregion

  //#region delete from pool
  public async deleteFromPool(body: DevMode.ProjectBuildNotificaiton) {
    //#region @backendFunc
    const frameworkVersion = body.coreContainerVersion;
    const poolOfDevModeProjectsData = (await this.get(
      'poolOfDevModeProjects',
    )) || {
      [body.coreContainerVersion]: [],
    };

    poolOfDevModeProjectsData[frameworkVersion] =
      poolOfDevModeProjectsData[frameworkVersion] || [];

    let poolOfDevModeProjects = poolOfDevModeProjectsData[frameworkVersion].map(
      f => DevMode.ProjectBuildNotificaiton.from(f),
    );
    const oldListOfProjects = [...poolOfDevModeProjects];

    const deletedProjects: DevMode.ProjectBuildNotificaiton[] = [];
    poolOfDevModeProjects = poolOfDevModeProjects.filter(f => {
      const isBuildFromBody = f.isEqual(body);
      if (isBuildFromBody) {
        deletedProjects.push(f);
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

    this.addMessage(`removing from pool ${JSON.stringify(body)}`);

    return poolOfDevModeProjects;
    //#endregion
  }
  //#endregion

  //#region update pool
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

    this.addMessage(`updating pool ${JSON.stringify(body)}`);

    return poolOfDevModeProjects;
    //#endregion
  }
  //#endregion

  //#region get all messages
  getAllLogMessage(): string[] {
    return this.logMessages;
  }
  //#endregion

  //#region add message
  addMessage(msg: string): void {
    //#region @backendFunc
    this.logMessages.push(msg);
    //#endregion
  }
  //#endregion

  //#region use in db memory
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
  }
  //#endregion
}
