//#region imports
import { HttpResponseError, RestErrorResponseWrapper } from 'ng2-rest/src';
import {
  EndpointContext,
  Taon,
  TaonBaseKvRepository,
  TaonBaseRepository,
  TaonContext,
  TaonRepository,
} from 'taon/src';
import { Raw } from 'taon-typeorm/src';
import {
  _,
  config,
  CoreModels,
  crossPlatformPath,
  Helpers,
  taonPackageName,
  tnpPackageName,
  Utils,
  UtilsOs,
  UtilsProcess,
  UtilsProjects,
  UtilsTerminal,
  UtilsWaitNotifier,
} from 'tnp-core/src';
import { BaseProjectResolver } from 'tnp-helpers/src';

import { debugModeTaonLightWeightWatchMode } from '../../../../constants';
import { Project } from '../../project';
import { TaonProjectResolve } from '../../project-resolve';
import { DevBuildController } from '../dev-build/dev-build.controller';
import { DevBuildUtils } from '../dev-build/dev-build.utils';

import { DevMode } from './dev-mode.models';
import { DevModeUtils } from './dev-mode.utils';
import { DevBuildModels } from '../dev-build/dev-build.models';

//#endregion

const WRITE_LOG_TO_FILE = debugModeTaonLightWeightWatchMode;

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

  requiredToBeInLeadBuild: {
    [frameworkVersion: string]: DevMode.ProjectBuildNotificaiton[];
  };

  currentLeadProject?: DevMode.ProjectBuildNotificaiton;

  frameworkVersions: CoreModels.FrameworkVersion[];

  shouldBeRebuild: {
    [frameworkVersion: string]: {
      [key in CoreModels.BuildWatcherType]: boolean;
    };
  };
  //#endregion
}> {
  //#region fields
  private logMessages: string[] = [];

  private deletingNow = new Map<string, DevMode.ProjectBuildNotificaiton>();

  private contexts = new Map<number, EndpointContext>();

  //#endregion

  //#region API

  //#region API / public methods / uniregister as build leader
  async finishLeadBuildAndUnregisterLeadProject(
    body: DevMode.ProjectBuildNotificaiton,
  ): Promise<boolean> {
    //#region @backendFunc

    const currentLead = DevMode.ProjectBuildNotificaiton.from(
      await this.get('currentLeadProject'),
    );
    if (currentLead && currentLead.isEqual(body)) {
      await this.set('currentLeadProject', null);

      //#region remove required builds when normal lead build
      const frameworkVersion = currentLead.coreContainerVersion;
      await this.merge('requiredToBeInLeadBuild', {
        [frameworkVersion]: [],
      });

      await this.merge('shouldBeRebuild', {
        [frameworkVersion]: CoreModels.BuildWatcherTypeArr.reduce(
          (a, b) => {
            return { ...a, [b]: false };
          },
          {} as { [key in CoreModels.BuildWatcherType]: boolean },
        ),
      });
      //#endregion

      return true;
    }

    return false;
    //#endregion
  }
  //#endregion

  //#region API / private methods / get deps tree for
  private async getDepsTreeFor(
    projects: DevMode.ProjectBuildNotificaiton[],
    onlyAffectedByProject: string,
    frameworkVersion: CoreModels.FrameworkVersion,
  ): Promise<DevMode.ProjectBuildNotificaiton[]> {
    //#region @backendFunc
    const requiredToBeInLeadBuildData =
      (await this.get('requiredToBeInLeadBuild')) || {};
    const requiredToBeInLeadBuildArr = (
      (requiredToBeInLeadBuildData[frameworkVersion] ||
        []) as DevMode.ProjectBuildNotificaiton[]
    ).map(c => c.nameForNpmPackage);

    projects = DevModeUtils.dependenciesTreeForBuild(projects, [
      onlyAffectedByProject,
      ...requiredToBeInLeadBuildArr,
    ]);
    return projects;
    //#endregion
  }
  //#endregion

  //#region API / private methods / get what should be rebuild
  async getWhatShouldBeRebuild(
    body: DevMode.ProjectBuildNotificaiton,
  ): Promise<{
    [key in CoreModels.BuildType]: boolean;
  }> {
    //#region @backendFunc
    const frameworkVersion = body.coreContainerVersion;
    const data = (await this.get('shouldBeRebuild')) || {};
    const result = {} as {
      [key in CoreModels.BuildType]: boolean;
    };
    data[frameworkVersion] = data[frameworkVersion] ?? ({} as any);
    if (data[frameworkVersion]['backend-watcher']) {
      result['backend-cjs'] = true;
      result['backend-esm'] = true;
      result['backend-js-maps'] = true;
    }
    if (data[frameworkVersion]['browser-watcher']) {
      result['browser'] = true;
    }
    if (data[frameworkVersion]['websql-watcher']) {
      result['websql'] = true;
    }
    return result;
    //#endregion
  }
  //#endregion

  //#region API / public methods / set as leader project and return dependencies
  async setAsLeadProjectAndReturnDependcies(
    projectRequestestingLeadPos: DevMode.ProjectBuildNotificaiton,
    dirtyBuild: { [key in CoreModels.BuildWatcherType]: boolean },
  ): Promise<DevMode.ProjectBuildNotificaiton[]> {
    //#region @backendFunc

    const frameworkVersion = projectRequestestingLeadPos.coreContainerVersion;

    await this.merge('shouldBeRebuild', {
      [frameworkVersion]: dirtyBuild,
    });

    const data = (await this.get('poolOfDevModeProjects')) || {
      [frameworkVersion]: [],
    };
    // console.log({ data });
    let projects = (data[frameworkVersion] || []).map(c =>
      DevMode.ProjectBuildNotificaiton.from(c),
    );

    //#region start build if some lead build already builds this project
    let currentLeadProject = DevMode.ProjectBuildNotificaiton.from(
      await this.get('currentLeadProject'),
    );
    if (
      currentLeadProject &&
      currentLeadProject.uniqueKey !== projectRequestestingLeadPos.uniqueKey
    ) {
      const currentLeadDepsTree = await this.getDepsTreeFor(
        projects,
        currentLeadProject.nameForNpmPackage,
        currentLeadProject.coreContainerVersion,
      );

      if (
        currentLeadDepsTree.some(
          f => f.uniqueKey === projectRequestestingLeadPos.uniqueKey,
        )
      ) {
        try {
          const leadController = await this.getDevBuildControllerForPort(
            currentLeadProject.port,
          );
          await leadController.setLeadBuildDirtyIfRunning()!.request({
            timeout: 500,
          });
        } catch (error) {
          this.addMessage(`Not able to set lead build as dirty`);
          throw error;
        }

        await Taon.error({
          message: `Project already part of "${currentLeadProject.nameForNpmPackage}" build`,
        });
        return;
      }
    }
    //#endregion

    await this.set('currentLeadProject', projectRequestestingLeadPos);

    this.addMessage(
      `Before sorting for ${projectRequestestingLeadPos.nameForNpmPackage}: ${projects.map(c => c.nameForNpmPackage).join(',')}`,
    );

    projects = await this.getDepsTreeFor(
      projects,
      projectRequestestingLeadPos.nameForNpmPackage,
      frameworkVersion,
    );

    await this.addToRequireBuilds(projects, frameworkVersion);

    this.addMessage(
      `After sorting for ${projectRequestestingLeadPos.nameForNpmPackage}: ${projects.map(c => c.nameForNpmPackage).join(',')}`,
    );

    return projects;
    //#endregion
  }
  //#endregion

  //#region API / public methods / check if still build leader
  async checkIfStillBuildLeader(
    body: DevMode.ProjectBuildNotificaiton,
  ): Promise<boolean> {
    //#region @backendFunc
    const buildLeader = DevMode.ProjectBuildNotificaiton.from(
      await this.get('currentLeadProject'),
    );
    return buildLeader.uniqueKey === body.uniqueKey;
    //#endregion
  }
  //#endregion

  //#region API/ private methods / update pool of dev projects
  private async updatePoolOfDevProjects(opt: {
    oldListOfProjects: DevMode.ProjectBuildNotificaiton[];
    newListOfPorjects: DevMode.ProjectBuildNotificaiton[];
    addedProjects?: DevMode.ProjectBuildNotificaiton[];
    changedProjects?: DevMode.ProjectBuildNotificaiton[];
    deletedProjects?: DevMode.ProjectBuildNotificaiton[];
    frameworkVersion: CoreModels.FrameworkVersion;
  }): Promise<void> {
    //#region @backendFunc

    //#region save/update/sort pool of dev mode projects

    const sortedPoolOfDevModeProjects = UtilsProjects.sortGroupOfProject({
      projects: opt.newListOfPorjects,
      resoveDepsArray: proj => proj.devModeDependenciesNames || [],
      projNameToCompare: proj => proj.nameForNpmPackage,
      projUniqueKeyToCompare: proj => proj.uniqueKey,
    });

    this.addMessage(
      `saving pool (${sortedPoolOfDevModeProjects.length}) ${sortedPoolOfDevModeProjects.map(c => `(${c.port})${c.nameForNpmPackage}`).join(',')}`,
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

    if (Array.isArray(opt.deletedProjects) && opt.deletedProjects.length > 0) {
      //#region add non watch build to last 10 cyclic queue

      const leadProj = DevMode.ProjectBuildNotificaiton.from(
        await this.get('currentLeadProject'),
      );

      for (const deletedBuild of opt.deletedProjects || []) {
        await this.deleteContextByPort(deletedBuild.port);
        if (leadProj && leadProj.isEqual(deletedBuild)) {
          await this.set('currentLeadProject', null);
        }
      }

      //#endregion
    }

    //#endregion
  }
  //#endregion

  //#region API/ private methods / deletec context by port
  private async deleteContextByPort(port: number | string): Promise<void> {
    //#region @backendFunc
    port = Number(port);
    const ref = this.contexts.get(port);
    if (ref) {
      await ref.destroy();
    }
    this.contexts.delete(port);
    //#endregion
  }
  //#endregion

  //#region API/ public methods / delete from pool

  public async deleteFromPool(
    projectsToDelete:
      | DevMode.ProjectBuildNotificaiton
      | DevMode.ProjectBuildNotificaiton[],
  ): Promise<DevMode.ProjectBuildNotificaiton[]> {
    //#region @backendFunc
    if (!Array.isArray(projectsToDelete)) {
      projectsToDelete = [projectsToDelete];
    }
    this.deletingNow = new Map(projectsToDelete.map(c => [c.uniqueKey, c]));

    const allDeleted: DevMode.ProjectBuildNotificaiton[] = [];

    this.addMessage(`to delete ${allDeleted.map(c => c.uniqueKey).join(',')}`);

    for (let index = 0; index < projectsToDelete.length; index++) {
      const projToDelete = projectsToDelete[index];
      const frameworkVersion = projToDelete.coreContainerVersion;
      const poolOfDevModeProjectsData = (await this.get(
        'poolOfDevModeProjects',
      )) || {
        [projToDelete.coreContainerVersion]: [],
      };

      const requiredToBeInLeadBuildData = (await this.get(
        'requiredToBeInLeadBuild',
      )) || {
        [projToDelete.coreContainerVersion]: [],
      };

      poolOfDevModeProjectsData[frameworkVersion] =
        poolOfDevModeProjectsData[frameworkVersion] || [];

      requiredToBeInLeadBuildData[frameworkVersion] =
        requiredToBeInLeadBuildData[frameworkVersion] || [];

      let poolOfDevModeProjects = poolOfDevModeProjectsData[
        frameworkVersion
      ].map(f => DevMode.ProjectBuildNotificaiton.from(f));

      let requiredToBeInLeadBuild = requiredToBeInLeadBuildData[
        frameworkVersion
      ].map(f => DevMode.ProjectBuildNotificaiton.from(f));

      const requiredToBeInLeadBuildMap = new Map(
        requiredToBeInLeadBuild.map(c => [c.uniqueKey, c]),
      );

      const oldListOfProjects = [...poolOfDevModeProjects];

      const deletedProjects: DevMode.ProjectBuildNotificaiton[] = [];
      poolOfDevModeProjects = poolOfDevModeProjects.filter(f => {
        const isDeleted = f.isEqual(projToDelete);
        if (isDeleted) {
          this.addMessage(`Deleting ${f.uniqueKey}`);
          requiredToBeInLeadBuildMap.delete(f.uniqueKey);
          deletedProjects.push(f);
          allDeleted.push(f);
          return false;
        } else {
          this.addMessage(`no equal to ${f.uniqueKey}`);
        }
        return true;
      });

      await this.merge('requiredToBeInLeadBuild', {
        [frameworkVersion]: Array.from(requiredToBeInLeadBuildMap.values()),
      });

      await this.updatePoolOfDevProjects({
        newListOfPorjects: poolOfDevModeProjects,
        oldListOfProjects,
        deletedProjects,
        frameworkVersion,
      });

      this.addMessage(
        `removing from pool - package "${projToDelete.nameForNpmPackage}" port ${projToDelete.port}`,
      );
      this.deletingNow = new Map();
    }

    return allDeleted;
    //#endregion
  }
  //#endregion

  //#region API/ public methods / add to required builds
  public async addToRequireBuilds(
    projects: DevMode.ProjectBuildNotificaiton[],
    frameworkVersion: CoreModels.FrameworkVersion,
  ): Promise<DevMode.ProjectBuildNotificaiton[]> {
    //#region @backendFunc

    const requiredToBeInLeadBuildData = (await this.get(
      'requiredToBeInLeadBuild',
    )) || {
      [frameworkVersion]: [],
    };
    requiredToBeInLeadBuildData[frameworkVersion] =
      requiredToBeInLeadBuildData[frameworkVersion] || [];

    let requiredToBeInLeadBuild = requiredToBeInLeadBuildData[
      frameworkVersion
    ].map(f => DevMode.ProjectBuildNotificaiton.from(f));

    requiredToBeInLeadBuild.push(...projects);
    requiredToBeInLeadBuild = Utils.uniqArray(
      requiredToBeInLeadBuild,
      'uniqueKey',
    );

    await this.merge('requiredToBeInLeadBuild', {
      [frameworkVersion]: requiredToBeInLeadBuild,
    });

    return requiredToBeInLeadBuild;
    //#endregion
  }
  //#endregion

  //#region API/ public methods / update pool
  public async updatePool(body: DevMode.ProjectBuildNotificaiton) {
    //#region @backendFunc
    if (this.deletingNow.has(body.uniqueKey)) {
      return;
    }
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

  //#region API / private methods / get dev build controller
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

  //#region API / private methods / quick health check
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

  //#region API / public methods / get all frameowrk verisons in dev mode
  public async getAllFrameworkVersionInDevMode(): Promise<
    CoreModels.FrameworkVersion[]
  > {
    //#region @backendFunc
    return (await this.get('frameworkVersions')) || [];
    //#endregion
  }
  //#endregion

  //#region API / public methods / get pool of dev mode projects
  async getPoolOfDevModePorjects(
    frameworkVersion: CoreModels.FrameworkVersion,
  ): Promise<DevMode.ProjectBuildNotificaiton[]> {
    //#region @backendFunc
    const data = await this.get('poolOfDevModeProjects');
    // console.log({ data });
    return data[frameworkVersion];
    //#endregion
  }
  //#endregion

  //#region API / public methods / get all messages
  public getAllLogMessage(): string[] {
    return this.logMessages;
  }
  //#endregion

  //#region API / private fields / get path to log
  pathToLog = crossPlatformPath([
    UtilsOs.getRealHomeDir(),
    `.${taonPackageName}`,
    `log-files-for/deb-mode-worker.json`,
  ]);
  //#endregion

  //#region API / private fields / debouce write log
  debouceWriteLog = _.debounce(() => {
    //#region @backendFunc
    if (!WRITE_LOG_TO_FILE) {
      return;
    }

    Helpers.writeJson(this.pathToLog, this.logMessages);
    //#endregion
  }, 1000);
  //#endregion

  //#region API /  private methods / add message
  private addMessage(msg: string): void {
    //#region @backendFunc
    if (debugModeTaonLightWeightWatchMode) {
      this.logMessages.push(msg);
      this.logMessages = this.logMessages.slice(-100);
      this.debouceWriteLog();
    }
    //#endregion
  }
  //#endregion

  //#region API / public methods / clear message
  public clearMessage(): void {
    //#region @backendFunc
    this.logMessages.length = 0;
    if (WRITE_LOG_TO_FILE) {
      Helpers.writeJson(this.pathToLog, []);
    }
    //#endregion
  }
  //#endregion

  //#region API / protected methods / use in db memory
  protected useInMemoryDB(): boolean {
    return !debugModeTaonLightWeightWatchMode;
  }
  //#endregion

  //#region API /  private methods / scann for processes
  async scanAndAddExitingProcesses(): Promise<void> {
    //#region @backendFunc
    Helpers.taskStarted(`Scanning for existing build processes...`);
    const limit = 20;

    for (let index = 0; index < limit; index++) {
      const portToCheck = DevBuildModels.START_PORT_BUID_PROCESS + index;
      const possibleDevBuildController =
        await this.getDevBuildControllerForPort(portToCheck);
      try {
        await possibleDevBuildController.healthCheck()!.request({
          timeout: 500,
        });
        const statusData = await possibleDevBuildController
          .getProjectInfo()!
          .request({
            timeout: 500,
          });

        const frameworkVersion = statusData.body.json.coreContainerVersion;
        const data = (await this.get('poolOfDevModeProjects')) || {
          [frameworkVersion]: [],
        };
        const newProjBuild = DevMode.ProjectBuildNotificaiton.from(
          statusData.body.json,
        );
        const newListOfPorjects = (data[frameworkVersion] || []).map(c =>
          DevMode.ProjectBuildNotificaiton.from(c),
        );
        const oldListOfProjects = [...newListOfPorjects];
        const projectsMap = new Map(
          newListOfPorjects.map(c => [c.uniqueKey, c]),
        );
        if (!projectsMap.has(newProjBuild.uniqueKey)) {
          newListOfPorjects.push(newProjBuild);
          await this.updatePoolOfDevProjects({
            frameworkVersion,
            newListOfPorjects,
            oldListOfProjects,
          });
          Helpers.info(
            `Added existed porject build from port ${newProjBuild.port}`,
          );
        } else {
          await this.deleteContextByPort(portToCheck);
        }
      } catch (error) {
        config.frameworkName === tnpPackageName && console.log(error);
      }
      // await UtilsTerminal.pressAnyKeyToContinueAsync();
    }
    Helpers.taskDone('Done scanning for existing build processes');
    //#endregion
  }
  //#endregion

  //#region API / init _
  async _() {
    await this.set('poolOfDevModeProjects', {});
    await this.set('requiredToBeInLeadBuild', {});
    await this.set('frameworkVersions', []);
    await this.set('currentLeadProject', null);
    await this.set('shouldBeRebuild', {});
    if (WRITE_LOG_TO_FILE) {
      Helpers.writeJson(this.pathToLog, []);
    }
    await this.scanAndAddExitingProcesses();
  }
  //#endregion

  //#endregion
}
