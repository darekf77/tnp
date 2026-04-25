//#region imports
import { BehaviorSubject, debounceTime } from 'rxjs';
import { _, CoreModels, Helpers } from 'tnp-core/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import { DevMode } from '../../../../abstract/taon-worker/dev-mode/dev-mode.models';
import { Project } from '../../../project';
import { Record } from 'immutable';
//#endregion

const defaultValue = Record<DevMode.BuildStatusInfo>({
  backend: DevMode.ProjectBuildStatus.NOT_STARTED,
  browser: DevMode.ProjectBuildStatus.NOT_STARTED,
  websql: DevMode.ProjectBuildStatus.NOT_STARTED,
  errorMessage: undefined,
});

// @ts-ignore TODO weird inheritance problem
export class TaonBuildObserver extends BaseFeatureForProject<Project> {
  // TODO remove anyStd from exitprocess
  // TODO when in watch mode exit -> delete first all subprocesses (keep them here)

  //#region fields & getters
  public buildStatusInfo = defaultValue();

  private debouceUpdate = _.debounce(async () => {
    await this.updateAction();
  }, 1000);
  //#endregion

  //#region public method / update action
  /**
   * errors or non-watch mode needs to for instant predictable updates
   */
  public async updateAction(info?: DevMode.BuildStatusInfo) {
    //#region @backendFunc
    if (_.isObject(info)) {
      this.modifyNextStateWhenCancelBuild(info);
      this.buildStatusInfo = this.mergeSkipUndefined(
        this.buildStatusInfo,
        info,
      );
    }
    // console.log(this.buildStatusInfo.toJS());
    await this.project.ins.devBuildRepository.updatePool({
      buildStatusInfo: this.buildStatusInfo.toJS(),
    });
    //#endregion
  }
  //#endregion

  //#region public method / update action success
  public debouceUpdateSuccess = (info: DevMode.BuildStatusInfo): void => {
    //#region @backendFunc
    this.modifyNextStateWhenCancelBuild(info);
    this.buildStatusInfo = this.mergeSkipUndefined(this.buildStatusInfo, info);
    this.debouceUpdate();
    //#endregion
  };
  //#endregion

  //#region public method / update action error (immediate)
  public debouceUpdateError = async (info: DevMode.BuildStatusInfo) => {
    //#region @backendFunc
    this.modifyNextStateWhenCancelBuild(info);
    this.buildStatusInfo = this.mergeSkipUndefined(this.buildStatusInfo, info);
    await this.project.ins.devBuildRepository.updatePool({
      buildStatusInfo: this.buildStatusInfo.toJS(),
    });
    //#endregion
  };
  //#endregion

  //#region public method / update action status
  public debouceUdateStatus = (info: DevMode.BuildStatusInfo): void => {
    //#region @backendFunc
    this.modifyNextStateWhenCancelBuild(info);
    this.buildStatusInfo = this.mergeSkipUndefined(this.buildStatusInfo, info);
    this.debouceUpdate();
    //#endregion
  };
  //#endregion

  //#region public methods / trigger rebuild of
  public triggerRebuildOf(
    buildType: CoreModels.BuildType,
  ): DevMode.BuildStatusInfo {
    //#region @backendFunc
    this.buildStatusInfo.set(buildType, DevMode.ProjectBuildStatus.BUILDING);
    this.project.watcher.triggerRebuildOf(buildType);
    return this.buildStatusInfo.toJS();
    //#endregion
  }
  //#endregion

  //#region public methods / cancel and set as ready for rebuild trigger
  public cancelAndSetAsReadyForRebuildTrigger(
    buildType: CoreModels.BuildType,
  ): DevMode.BuildStatusInfo {
    //#region @backendFunc
    const currentBuildStatus = this.buildStatusInfo.toJS()[buildType];

    if (
      [
        DevMode.ProjectBuildStatus.BUILDING,
        DevMode.ProjectBuildStatus.BUILDING_WITH_REBUILD_AT_THE_END,
      ].includes(currentBuildStatus)
    ) {
      this.buildStatusInfo.set(
        buildType,
        DevMode.ProjectBuildStatus.BUILDING_BUT_CANCELLED,
      );
    } else if (
      [
        DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
        DevMode.ProjectBuildStatus.COMPILATION_ERROR,
      ].includes(currentBuildStatus)
    ) {
      this.buildStatusInfo.set(
        buildType,
        DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER,
      );
    }

    this.project.watcher.cancelAndSetAsReadyForRebuildTrigger(buildType); // TODO not implenented yet
    return this.buildStatusInfo.toJS();
    //#endregion
  }
  //#endregion

  //#region public methods / start
  start(): void {
    //#region @backendFunc
    Helpers.info(`

      STARING TAON LIGHTWEIGHT WATCHER MODE

      `)


    //#region handle code changes
    const handleCodeChanges = (buildType: CoreModels.BuildType) => {
      this.project.watcher
        .getTsCodeObservableFor(buildType)
        .pipe(debounceTime(1000))
        .subscribe(async () => {
          // if changes of project during build => rebuild current project again
          if (
            this.buildStatusInfo.toJS()[buildType] ===
            DevMode.ProjectBuildStatus.BUILDING
          ) {
            this.debouceUdateStatus({
              [buildType]:
                DevMode.ProjectBuildStatus.BUILDING_WITH_REBUILD_AT_THE_END,
            });
            return;
          }

          // if build error or success and code changes => ready to receive build trigger
          if (
            this.buildStatusInfo.toJS()[buildType] ===
              DevMode.ProjectBuildStatus.COMPILATION_ERROR ||
            this.buildStatusInfo.toJS()[buildType] ===
              DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS
          ) {
            this.debouceUdateStatus({
              [buildType]: DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER,
            });
            return;
          }
        });
    };
    //#endregion

    handleCodeChanges('backend');
    handleCodeChanges('browser');
    handleCodeChanges('websql');
    //#endregion
  }
  //#endregion

  //#region private methods / modify next state for proper build cancel
  /**
   * build cancelled by main worker, but still current process want
   * to set status after build => do not allow for this
   */
  private modifyNextStateWhenCancelBuildFor(
    nextState: DevMode.BuildStatusInfo,
    buildType: CoreModels.BuildType,
  ) {
    //#region @backendFunc
    const currentBuild = this.buildStatusInfo.toJS();
    if (!!nextState[buildType]) {
      if (
        currentBuild[buildType] ===
        DevMode.ProjectBuildStatus.BUILDING_BUT_CANCELLED
      ) {
        const nextStateSkipToReadForBuildTrigger = [
          DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
          DevMode.ProjectBuildStatus.COMPILATION_ERROR,
        ];
        if (nextStateSkipToReadForBuildTrigger.includes(nextState[buildType])) {
          nextState[buildType] =
            DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER;
        } else if (
          nextState[buildType] ===
          DevMode.ProjectBuildStatus.BUILDING_WITH_REBUILD_AT_THE_END
        ) {
          delete nextState[buildType];
        }
      }
    }
    //#endregion
  }
  private modifyNextStateWhenCancelBuild(
    nextState: DevMode.BuildStatusInfo,
  ): void {
    //#region @backendFunc
    CoreModels.BuildTypeArr.forEach(buildType => {
      this.modifyNextStateWhenCancelBuildFor(nextState, buildType);
    });
    //#endregion
  }
  //#endregion

  //#region private methods / merge and skip undefined
  private mergeSkipUndefined<T extends object = any>(
    record: Immutable.Record<T> & Readonly<T>,
    patch: Partial<T>,
  ) {
    return record.mergeWith(
      (oldValue, newValue) => (newValue === undefined ? oldValue : newValue),
      patch,
    );
  }
  //#endregion
}
