import { BaseFeatureForProject, Helpers } from 'tnp-helpers/src';
import { Project } from './project';
import { Observable, Subject } from 'rxjs';
import { chokidar, CoreModels } from 'tnp-core/src';
import { crossPlatformPath, path } from 'tnp-core/src';
import {
  assetsFromTempSrc,
  packageJsonNpmLib,
  tmpSourceDist,
  tmpSrcDist,
  tmpSrcDistWebsql,
} from '../../constants';

// @ts-ignore TODO weird inheritance problem
export class LightWeightWatcher extends BaseFeatureForProject<Project> {
  //#region fields
  private codeWatchers = new Map<CoreModels.BuildType, Subject<{}>>();
  private rebuildWatchers = new Map<CoreModels.BuildType, Subject<{}>>();
  //#endregion

  //#region public methods

  //#region public methods / is taon light weight mode allowed
  public get isTaonLightWatcherMode(): boolean {
    //#region @backendFunc
    if (global.lightWatcherInArgs) {
      return global.lightWatcherInArgs;
    }
    if (process.platform === 'darwin') {
      return false;
    }
    if (process.platform === 'win32') {
      return false;
    }
    return true;
    //#endregion
  }
  //#endregion

  //#region public methods / trigger rebuild of
  public triggerRebuildOf(buildType: CoreModels.BuildType) {
    //#region @backendFunc

    if (!buildType || !CoreModels.BuildTypeArr.includes(buildType)) {
      Helpers.warn(`[triggerRebuildOf] Wrong trigger "${buildType}"`);
      return;
    }
    this.rebuildWatchers.get(buildType).next({});
    //#endregion
  }
  //#endregion

  //#region public methods / trigger rebuild of
  public cancelAndSetAsReadyForRebuildTrigger(buildType: CoreModels.BuildType) {
    //#region @backendFunc

    if (!buildType || !CoreModels.BuildTypeArr.includes(buildType)) {
      Helpers.warn(
        `[cancelAndSetAsReadyForRebuildTrigger] Wrong trigger "${buildType}"`,
      );
      return;
    }
    // TODO
    //#endregion
  }
  //#endregion

  //#region public methods / get rebuild trigger watcher
  public rebuildTriggerWatcher(
    buildType: CoreModels.BuildType,
  ): Subject<{}> | undefined {
    //#region @backendFunc
    if (!this.isTaonLightWatcherMode) {
      return;
    }
    if (!this.rebuildWatchers.has(buildType)) {
      const subject = new Subject();
      this.rebuildWatchers.set(buildType, subject);
    }
    return this.rebuildWatchers.get(buildType);
    //#endregion
  }
  //#endregion

  //#region public methods / get ts code obserable for
  public getTsCodeObservableFor(
    buildType: CoreModels.BuildType,
  ): Observable<{}> | undefined {
    if (buildType === 'backend') {
      return this.tmpSourceRebuildForBackendObs;
    }
    if (buildType === 'browser') {
      return this.tmpSourceRebuildForBrowserObs;
    }

    if (buildType === 'websql') {
      return this.tmpSourceRebuildForWebsqlObs;
    }
  }
  //#endregion

  //#endregion

  //#region private methods

  //#region private methods / get watcher for
  /**
   * Get source code watcher obserable watcher
   */
  private getWatcherFor(
    folders: string[],
    watcherType: CoreModels.BuildType,
  ): Observable<{}> {
    //#region @backendFunc
    if (this.codeWatchers.has(watcherType)) {
      return this.codeWatchers.get(watcherType).asObservable();
    }
    const watcher = new Subject<{}>();
    this.codeWatchers.set(watcherType, watcher);

    // const isomorphic = this.project.nodeModules.getIsomorphicPackagesNames();
    // console.log({ isomorphic });

    const pathsToWatch = [
      ...folders,
      // ...isomorphic.map(p =>
      //   this.project.nodeModules.pathFor([p, packageJsonNpmLib]),
      // ),
    ];

    // console.log('Watching for changes in:', pathsToWatch);

    chokidar
      .watch(pathsToWatch, {
        ignoreInitial: true,
      })
      .on('all', async (eventWatcher, pathToFile) => {
        const relative = crossPlatformPath(pathToFile).replace(
          this.project.location + '/' + path.basename(folders[0]) + '/',
          '',
        );

        if (watcherType === 'backend') {
          if (!relative.startsWith(`${assetsFromTempSrc}/`)) {
            // console.log('WATCHER CHANGE', {
            //   eventWatcher,
            //   pathToFile,
            //   watcherType,
            // });
            watcher.next({});
          }
        } else {
          if (
            !relative.startsWith(`${assetsFromTempSrc}/`) &&
            !relative.startsWith(`app/`) &&
            !relative.startsWith(`app.`)
          ) {
            // console.log('WATCHER CHANGE', {
            //   eventWatcher,
            //   pathToFile,
            //   watcherType,
            // });
            watcher.next({});
          }
        }
      });
    return watcher.asObservable();
    //#endregion
  }
  //#endregion

  //#region private methods / tmp srouce obserable
  private get tmpSourceRebuildForBackendObs(): Observable<{}> | undefined {
    const key = 'tmpSourceRebuildForBackendObs';
    if (this.project.cache[key]) {
      return this.project.cache[key];
    }
    const watcher = this.getWatcherFor(
      [this.project.pathFor(tmpSourceDist)],
      'backend',
    );

    this.project.cache[key] = watcher;
    return this.project.cache[key];
  }

  private get tmpSourceRebuildForBrowserObs(): Observable<{}> | undefined {
    const key = 'tmpSourceRebuildForBrowserObs';
    if (this.project.cache[key]) {
      return this.project.cache[key];
    }
    const watcher = this.getWatcherFor(
      [this.project.pathFor(tmpSrcDist)],
      'browser',
    );

    this.project.cache[key] = watcher;
    return this.project.cache[key];
  }

  private get tmpSourceRebuildForWebsqlObs(): Observable<{}> | undefined {
    const key = 'tmpSourceRebuildForWebsqlObs';
    if (this.project.cache[key]) {
      return this.project.cache[key];
    }
    const watcher = this.getWatcherFor(
      [this.project.pathFor(tmpSrcDistWebsql)],
      'websql',
    );

    this.project.cache[key] = watcher;
    return this.project.cache[key];
  }
  //#endregion

  //#endregion
}
