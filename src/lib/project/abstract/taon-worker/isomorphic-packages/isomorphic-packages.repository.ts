//#region imports
import {
  EndpointContext,
  TaonBaseKvRepository,
  TaonBaseRepository,
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
  UtilsTerminal,
} from 'tnp-core/src';

import { CURRENT_PACKAGE_TAON_VERSION } from '../../../../build-info._auto-generated_';
import { debugModeTaonLightWeightWatchMode } from '../../../../constants';
import { DevBuildController } from '../dev-build/dev-build.controller';
import { DevBuildUtils } from '../dev-build/dev-build.utils';
import { DevMode } from '../dev-mode/dev-mode.models';

//#endregion

const WRITE_LOG_TO_FILE = true;

@TaonRepository({
  className: 'IsomorphicPackagesRepository',
})
export class IsomorphicPackagesRepository extends TaonBaseKvRepository<{
  isomorphicPackages: {
    [frameworkVersion: string]: string[];
  };
}> {
  private logMessages: string[] = [];

  private contexts = new Map<number, EndpointContext>();

  //#region _ init
  async _() {
    await this.set('isomorphicPackages', {} as any);
    if (WRITE_LOG_TO_FILE) {
      Helpers.writeJson(this.pathToLog, []);
    }
    this.addMessage(`Started worker`);

    await this.updateIsomoprhicFor([CURRENT_PACKAGE_TAON_VERSION]);
    // await UtilsTerminal.pressAnyKeyToContinueAsync();
  }
  //#endregion

  //#region API / private fields / get path to log
  pathToLog = crossPlatformPath([
    UtilsOs.getRealHomeDir(),
    `.${taonPackageName}`,
    `log-files-for/isomorphic-packages-worker.json`,
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

    this.logMessages.push(msg);
    this.logMessages = this.logMessages.slice(-100);
    this.debouceWriteLog();

    //#endregion
  }
  //#endregion

  //#region API / public methods / get all isomorphic packages
  async getAllFor(
    frameworkVersion: CoreModels.FrameworkVersion,
  ): Promise<string[]> {
    //#region @backendFunc
    const poolOfDevModeProjectsData = (await this.get(
      'isomorphicPackages',
    )) || {
      [frameworkVersion]: [],
    };
    poolOfDevModeProjectsData[frameworkVersion] =
      poolOfDevModeProjectsData[frameworkVersion] || [];

    const poolOfDevModeProjects = poolOfDevModeProjectsData[frameworkVersion];

    return poolOfDevModeProjects;
    //#endregion
  }
  //#endregion

  //#region API / public methods / update isomorphic pcakges throttle

  private updateIsomorphicPackagesThrottleMap = new Map<
    CoreModels.FrameworkVersion,
    Function
  >();

  private packgesQueueForUpdate = new Map<
    CoreModels.FrameworkVersion,
    DevMode.ProjectBuildNotificaiton[]
  >();

  public updateIsomorphicArrayThrothle(
    body: DevMode.ProjectBuildNotificaiton,
  ): void {
    const frameworkVersion = body.coreContainerVersion;
    this.addMessage(
      `notify that update needed of framework ${frameworkVersion}`,
    );
    if (!this.packgesQueueForUpdate.get(frameworkVersion)) {
      this.packgesQueueForUpdate.set(frameworkVersion, []);
    }

    this.packgesQueueForUpdate.get(frameworkVersion).push(body);

    if (!this.updateIsomorphicPackagesThrottleMap.has(frameworkVersion)) {
      this.updateIsomorphicPackagesThrottleMap.set(
        frameworkVersion,
        _.throttle(() => this.updateIsomoprhicFor(), 1000),
      );
    }
    this.updateIsomorphicPackagesThrottleMap.get(frameworkVersion)();
  }

  //#endregion

  //#region API / protected methods / use in db memory
  protected useInMemoryDB(): boolean {
    return false;
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

  //#region API / private methods / update isomorphic pcakges
  private async updateIsomoprhicFor(
    detectFor?: CoreModels.FrameworkVersion[],
  ): Promise<void> {
    //#region @backendFunc

    const frameworkVersions = detectFor
      ? detectFor
      : (Utils.uniqArray(
          Array.from(this.packgesQueueForUpdate.keys()).map(c => c),
        ) as CoreModels.FrameworkVersion[]);

    for (const frameworkVersion of frameworkVersions) {
      // const frameworkVersion =

      this.addMessage(`staring detection for version "${frameworkVersion}"`);
      const { Project } = await import('../../../abstract/project');
      const coreContainer = Project.ins.by('container', frameworkVersion);
      const allIsomorphicPackagesFromNodeModules: string[] =
        coreContainer.nodeModules.getIsomorphicPackagesNames();

      const devModeController =
        await Project.ins.taonProjectsWorker.buildsWorker.getRemoteControllerFor();

      const poolBuildsData =
        await devModeController.getAllDevModeProjects(frameworkVersion)
          .request!();

      let poolProjectsBuilds = poolBuildsData.body.json || [];

      const projectsInQueue = (
        this.packgesQueueForUpdate.get(frameworkVersion) || []
      ).map(c => DevMode.ProjectBuildNotificaiton.from(c));

      if (projectsInQueue.length > 0) {
        poolProjectsBuilds.push(...projectsInQueue);
      }

      poolProjectsBuilds = Utils.uniqArray(poolProjectsBuilds, 'uniqueKey');

      this.addMessage(
        `poolProjectsBuilds for "${frameworkVersion}" ` +
          poolProjectsBuilds
            .map(c => `${c.nameForNpmPackage}(${c.coreContainerVersion})`)
            .join(','),
      );

      const namesFromActiveBuilds = poolProjectsBuilds.reduce((a, b) => {
        return [...a, b.nameForNpmPackage, ...b.devModeDependenciesNames];
      }, [] as string[]);

      const sorted = Utils.uniqArray(
        [...allIsomorphicPackagesFromNodeModules, ...namesFromActiveBuilds]
          .filter(f => !!f)
          .sort((a, b) => a.localeCompare(b)),
      );

      await this.merge('isomorphicPackages', {
        [frameworkVersion]: sorted,
      });

      this.addMessage(`saving for "${frameworkVersion}" ${sorted.join(',')}`);

      // if (!body) {
      //   this.addMessage(
      //     `initing and skipping pool update (no body of new package)`,
      //   );
      // } else {
      Helpers.info(
        `Starting update of ${poolProjectsBuilds.length} child(s) for "${frameworkVersion}"`,
      );
      for (const projBUild of poolProjectsBuilds) {
        this.addMessage(`updating  ${projBUild.nameForNpmPackage}`);
        const ctrl = await this.getDevBuildControllerForPort(projBUild.port);
        try {
          await ctrl.setIsomorphicPackages(sorted, frameworkVersion).request!();
        } catch (error) {
          this.addMessage(error);
          this.addMessage(
            `Error during update of ${projBUild.nameForNpmPackage} from ${projBUild.location}`,
          );
        }
      }
      // }
      this.packgesQueueForUpdate.set(frameworkVersion, []);
      this.addMessage(
        `Done update of isomorphic packages for "${frameworkVersion}`,
      );
    }

    //#endregion
  }
  //#endregion
}
