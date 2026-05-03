//#region imports
import { BehaviorSubject, debounceTime } from 'rxjs';
import { _, CoreModels, Helpers } from 'tnp-core/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import { DevMode } from '../../../../abstract/taon-worker/dev-mode/dev-mode.models';
import { Project } from '../../../project';
import { Record } from 'immutable';
import { TaonStateMachine } from './taon-build-state-machine';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class TaonBuildObserver extends BaseFeatureForProject<Project> {
  // TODO remove anyStd from exitprocess
  // TODO when in watch mode exit -> delete first all subprocesses (keep them here)

  //#region fields & getters / allowed state map
  private allowedStateMap = new Map<
    DevMode.ProjectBuildStatus,
    DevMode.ProjectBuildStatus[]
  >([
    [
      DevMode.ProjectBuildStatus.NOT_STARTED,
      [DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER],
    ],
    [
      DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER,
      [
        DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER,
        DevMode.ProjectBuildStatus.BUILDING,
        DevMode.ProjectBuildStatus.BUILDING_BUT_CANCELLED,
        DevMode.ProjectBuildStatus.BUILDING_WITH_REBUILD_AT_THE_END,
      ],
    ],
    [
      DevMode.ProjectBuildStatus.BUILDING,
      [
        DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
        DevMode.ProjectBuildStatus.COMPILATION_ERROR,
        DevMode.ProjectBuildStatus.BUILDING_BUT_CANCELLED,
        DevMode.ProjectBuildStatus.BUILDING_WITH_REBUILD_AT_THE_END,
      ],
    ],
    [
      DevMode.ProjectBuildStatus.BUILDING_BUT_CANCELLED,
      [DevMode.ProjectBuildStatus.BUILD_CANCEL_DONE],
    ],
    [
      DevMode.ProjectBuildStatus.BUILD_CANCEL_DONE,
      [DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER],
    ],
    [
      DevMode.ProjectBuildStatus.BUILDING_WITH_REBUILD_AT_THE_END,
      [DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER],
    ],
    [
      DevMode.ProjectBuildStatus.COMPILATION_ERROR,
      [DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER],
    ],
    [
      DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
      [DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER],
    ],
  ]);
  //#endregion

  //#region fields & getters / effect
  effect = (
    buildType: CoreModels.BuildType,
    nextState: DevMode.ProjectBuildStatus,
    currentState: DevMode.ProjectBuildStatus,
  ): void => {
    if (currentState !== nextState) {
      if (nextState === DevMode.ProjectBuildStatus.BUILDING_BUT_CANCELLED) {
        this.project.watcher.cancelAndSetAsReadyForRebuildTrigger(buildType);
      }
      if (nextState === DevMode.ProjectBuildStatus.BUILDING) {
        this.project.watcher.triggerRebuildOf(buildType);
      }
    }
    this.debouceUpdate();
  };
  //#endregion

  //#region fields & getters / modify state before setting
  modifyStateBeforeSetting = (
    buildType: CoreModels.BuildType,
    nextState: DevMode.ProjectBuildStatus,
    currentState: DevMode.ProjectBuildStatus,
  ): DevMode.ProjectBuildStatus => {
    const stateFromAngularOrTsc = [
      DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
      DevMode.ProjectBuildStatus.COMPILATION_ERROR,
    ];

    const states_for_READ_FOR_BUILD_TRIGGER = [
      DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER,
      DevMode.ProjectBuildStatus.NOT_STARTED,
      DevMode.ProjectBuildStatus.BUILD_CANCEL_DONE,
      ...stateFromAngularOrTsc,
    ];

    //#region handle BUILD_CANCEL_DONE after build
    if (
      (nextState === DevMode.ProjectBuildStatus.COMPILATION_ERROR ||
        nextState === DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS) &&
      currentState === DevMode.ProjectBuildStatus.BUILDING_BUT_CANCELLED
    ) {
      return DevMode.ProjectBuildStatus.BUILD_CANCEL_DONE;
    }
    //#endregion

    //#region handle BUILDING_WITH_REBUILD_AT_THE_END when building
    if (
      nextState === DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER &&
      currentState === DevMode.ProjectBuildStatus.BUILDING
    ) {
      return DevMode.ProjectBuildStatus.BUILDING_WITH_REBUILD_AT_THE_END;
    }
    //#endregion

    //#region handle BUILDING_WITH_REBUILD_AT_THE_END when done building
    if (
      currentState ===
        DevMode.ProjectBuildStatus.BUILDING_WITH_REBUILD_AT_THE_END &&
      stateFromAngularOrTsc.includes(nextState)
    ) {
      return DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER;
    }
    //#endregion

    //#region external state __SET_READY_FOR_REBUILD__
    if (nextState === DevMode.ProjectBuildStatus.__SET_READY_FOR_REBUILD__) {
      if (currentState === DevMode.ProjectBuildStatus.BUILDING) {
        return DevMode.ProjectBuildStatus.BUILDING_WITH_REBUILD_AT_THE_END;
      }
      if (states_for_READ_FOR_BUILD_TRIGGER.includes(currentState)) {
        return DevMode.ProjectBuildStatus.READ_FOR_BUILD_TRIGGER;
      }
    }
    //#endregion

    //#region external state __CANCEL_BUILD__
    if (nextState === DevMode.ProjectBuildStatus.__CANCEL_BUILD__) {
      if (currentState === DevMode.ProjectBuildStatus.BUILDING) {
        return DevMode.ProjectBuildStatus.BUILDING_BUT_CANCELLED;
      }
      return currentState;
    }
    //#endregion

    return nextState;
  };
  //#endregion

  //#region fields & getters / debouce update
  private debouceUpdate = _.debounce(async () => {
    await this.updateAction();
  }, 1000);
  //#endregion

  //#region fields & getters / backend state
  public backendState = new TaonStateMachine<DevMode.ProjectBuildStatus>({
    defaultValue: DevMode.ProjectBuildStatus.NOT_STARTED,

    modifyStateBeforeSetting: (next, prev) =>
      this.modifyStateBeforeSetting('backend', next, prev),
    allowedStateMap: this.allowedStateMap,
    effect: (nextState, previousState) => {
      console.log(`Backend state changed: ${previousState} -> ${nextState}`);
      this.effect('backend', nextState, previousState);
    },
  });
  //#endregion

  //#region fields & getters / browser state
  public browserState = new TaonStateMachine<DevMode.ProjectBuildStatus>({
    defaultValue: DevMode.ProjectBuildStatus.NOT_STARTED,

    modifyStateBeforeSetting: (next, prev) =>
      this.modifyStateBeforeSetting('browser', next, prev),
    allowedStateMap: this.allowedStateMap,
    effect: (nextState, previousState) => {
      console.log(`Browser state changed: ${previousState} -> ${nextState}`);
      this.effect('browser', nextState, previousState);
    },
  });
  //#endregion

  //#region fields & getters / websql state
  public websqlState = new TaonStateMachine<DevMode.ProjectBuildStatus>({
    defaultValue: DevMode.ProjectBuildStatus.NOT_STARTED,

    modifyStateBeforeSetting: (next, prev) =>
      this.modifyStateBeforeSetting('websql', next, prev),
    allowedStateMap: this.allowedStateMap,
    effect: (nextState, previousState) => {
      console.log(`Websql state changed: ${previousState} -> ${nextState}`);
      this.effect('websql', nextState, previousState);
    },
  });
  //#endregion

  //#region fields & getters / error backend
  public errorBackend = new TaonStateMachine<string | undefined>({
    defaultValue: void 0 as string,
  });
  //#endregion

  //#region fields & getters / error browser
  public errorBrowser = new TaonStateMachine<string | undefined>({
    defaultValue: void 0 as string,
  });
  //#endregion

  //#region fields & getters / error websql
  public errorWebsql = new TaonStateMachine<string | undefined>({
    defaultValue: void 0 as string,
  });
  //#endregion

  //#region fields & getters / states
  public states = new Map<
    CoreModels.BuildType,
    TaonStateMachine<DevMode.ProjectBuildStatus>
  >([
    ['backend', this.backendState],
    ['browser', this.browserState],
    ['websql', this.websqlState],
  ]);
  //#endregion

  //#region fields & getters / states for error
  public statesForError = new Map<
    CoreModels.BuildType,
    TaonStateMachine<string | undefined>
  >([
    ['backend', this.errorBackend],
    ['browser', this.errorBrowser],
    ['websql', this.errorWebsql],
  ]);
  //#endregion

  //#region fields & getters / build status info
  public get buildStatusInfo(): DevMode.BuildStatusInfo {
    return {
      backend: this.backendState.currentValue,
      browser: this.browserState.currentValue,
      websql: this.websqlState.currentValue,
      errorBackend: this.errorBackend.currentValue,
      errorBrowser: this.errorBrowser.currentValue,
      errorWebsql: this.errorWebsql.currentValue,
    };
  }
  //#endregion

  //#region private methods / is building
  private isBuilding(currentStatus: DevMode.ProjectBuildStatus): boolean {
    return [
      DevMode.ProjectBuildStatus.BUILDING,
      DevMode.ProjectBuildStatus.BUILDING_BUT_CANCELLED,
      DevMode.ProjectBuildStatus.BUILDING_WITH_REBUILD_AT_THE_END,
    ].includes(currentStatus);
  }
  //#endregion

  //#region private methods / merge status
  private mergeStatus(info: DevMode.BuildStatusInfo): void {
    if (!_.isObject(info)) {
      return;
    }

    Object.keys(this.buildStatusInfo).forEach(key => {
      if (!_.isUndefined(info[key])) {
        if (key.startsWith('error')) {
          this.statesForError.get(key as CoreModels.BuildType).set(info[key]);
        } else {
          this.states.get(key as CoreModels.BuildType).set(info[key]);
        }
      }
    });
  }
  //#endregion

  //#region public method / update action
  /**
   * errors or non-watch mode needs to for instant predictable updates
   */
  public async updateAction(info?: DevMode.BuildStatusInfo): Promise<void> {
    //#region @backendFunc
    this.mergeStatus(info);
    await this.project.ins.devBuildRepository.updatePool({
      buildStatusInfo: this.buildStatusInfo,
    });
    //#endregion
  }
  //#endregion

  //#region public methods / start
  start(): void {
    //#region @backendFunc
    Helpers.info(`

      STARING TAON LIGHTWEIGHT WATCHER MODE

      `);

    //#region handle code changes
    const handleCodeChanges = (buildType: CoreModels.BuildType) => {
      this.project.watcher
        .getTsCodeObservableFor(buildType)
        .pipe(debounceTime(1000))
        .subscribe(async () => {
          this.states
            .get(buildType)
            .set(DevMode.ProjectBuildStatus.__SET_READY_FOR_REBUILD__);
        });
    };
    //#endregion

    for (const buildType of CoreModels.BuildTypeArr) {
      handleCodeChanges(buildType);
    }
    //#endregion
  }
  //#endregion
}
