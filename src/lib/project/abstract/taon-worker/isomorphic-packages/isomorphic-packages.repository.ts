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
} from 'tnp-core/src';

import { debugModeTaonLightWeightWatchMode } from '../../../../constants';
import { DevBuildController } from '../dev-build/dev-build.controller';
import { DevBuildUtils } from '../dev-build/dev-build.utils';
import { DevMode } from '../dev-mode/dev-mode.models';

//#endregion

const WRITE_LOG_TO_FILE = debugModeTaonLightWeightWatchMode;

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
    this.addMessage(`Started worker`);
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
    if (debugModeTaonLightWeightWatchMode) {
      this.logMessages.push(msg);
      this.logMessages = this.logMessages.slice(-100);
      this.debouceWriteLog();
    }
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
  updateIsomorphicPackagesThrottle = _.throttle(
    (
      frameworkVersion: CoreModels.FrameworkVersion,
      body: DevMode.ProjectBuildNotificaiton,
    ) => this.updateIsomoprhicFor(frameworkVersion, body),
    1000,
  );
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
    frameworkVersion: CoreModels.FrameworkVersion,
    body: DevMode.ProjectBuildNotificaiton,
  ): Promise<string[]> {
    //#region @backendFunc

    this.addMessage(`staring detection`);
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

    poolProjectsBuilds.push(body);

    poolProjectsBuilds = Utils.uniqArray(poolProjectsBuilds, 'uniqueKey');

    this.addMessage(
      `poolProjectsBuilds ` +
        poolProjectsBuilds.map(c => c.nameForNpmPackage).join(','),
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

    this.addMessage(`saving ${sorted.join(',')}`);

    for (const projBUild of poolProjectsBuilds) {
      this.addMessage(`updating ${projBUild.nameForNpmPackage}`);
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
    this.addMessage(`Done update of isomorphic packages`);

    return sorted;
    //#endregion
  }
  //#endregion
}
