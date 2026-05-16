//#region imports
import { Record } from 'immutable';
import {
  ErrorBody,
  HttpResponseError,
  RestErrorResponseWrapper,
} from 'ng2-rest/src';
import { debounceTime } from 'rxjs';
import {
  _,
  chalk,
  chokidar,
  config,
  CoreModels,
  Helpers,
  tnpPackageName,
  Utils,
  UtilsOs,
  UtilsTerminal,
  UtilsWaitNotifier,
} from 'tnp-core/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import {
  debugModeTaonLightWeightWatchMode,
  TaonGeneratedFiles,
  watcherPrefix,
} from '../../../../../constants';
import { DevMode } from '../../../../abstract/taon-worker/dev-mode/dev-mode.models';
import { Project } from '../../../project';

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
      [DevMode.ProjectBuildStatus.BUILDING],
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
      [DevMode.ProjectBuildStatus.BUILDING],
    ],
    [
      DevMode.ProjectBuildStatus.BUILDING_WITH_REBUILD_AT_THE_END,
      [DevMode.ProjectBuildStatus.BUILDING],
    ],
    [
      DevMode.ProjectBuildStatus.COMPILATION_ERROR,
      [
        DevMode.ProjectBuildStatus.BUILDING,
        DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS, // TODO_QUICK_FIX
      ],
    ],
    [
      DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
      [DevMode.ProjectBuildStatus.BUILDING],
    ],
  ]);
  //#endregion

  //#region fields & getters / effect
  effect = (
    buildType: CoreModels.BuildType,
    nextState: DevMode.ProjectBuildStatus,
    currentState: DevMode.ProjectBuildStatus,
    debugMode: boolean,
  ): void => {
    if (currentState !== nextState) {
      if (nextState === DevMode.ProjectBuildStatus.BUILDING_BUT_CANCELLED) {
        this.project.watcher.cancelAndSetAsReadyForRebuildTrigger(buildType);
      }
      if (nextState === DevMode.ProjectBuildStatus.BUILDING) {
        debugMode &&
          console.log(`

          START BUILD FOR ${buildType}

          `);
        this.project.watcher.triggerRebuildOf(buildType);
      }
      if (nextState === DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS) {
        const buildWatcherTypeKey = CoreModels.buildTypeToWatcherFn(buildType);
        this.dirtyBuild.set(buildWatcherTypeKey, false);

        if (this.toNotifyBuildType === buildType && this.toNotifyLeaderPort) {
          this.notifyLeaderAboutBuildDone();
        }
      }
      this.writeBuildStatus();
    }
    this.debouceUpdate();
  };
  //#endregion

  dirtyBuild = new Map<CoreModels.BuildWatcherType, boolean>([
    ['backend-watcher', false],
    ['browser-watcher', false],
    ['websql-watcher', false],
  ]);

  writeBuildStatus = _.throttle(() => {
    //#region @backend
    this.project.writeFile(
      TaonGeneratedFiles.BUILD_STATUS_MD,
      `# CURRENT BUILD STATUS
### Backend
**CommonJS** : ${this.buildStatusInfo['backend-cjs']} <br>
**ESM**:  ${this.buildStatusInfo['backend-esm']}<br>
**Maps**: ${this.buildStatusInfo['backend-js-maps']}<br>
ERROR: ${this.buildStatusInfo['backend-watcher-error'] ? `${this.buildStatusInfo['backend-watcher-error']}` : '-'}
### Client
**browser**: ${this.buildStatusInfo['browser']}<br>
ERROR: ${this.buildStatusInfo['browser-watcher-error'] ? `${this.buildStatusInfo['browser-watcher-error']}` : '-'}<br>
**websql**: ${this.buildStatusInfo['websql']}<br>
ERROR: ${this.buildStatusInfo['websql-watcher-error'] ? `${this.buildStatusInfo['websql-watcher-error']}` : '-'}<br>

      `,
    );
    //#endregion
  }, 300);

  //#region fields & getters / notifye build leader about child build done
  private notifyLeaderAboutBuildDone = _.debounce(async () => {
    //#region @backend
    Helpers.log(
      `Notifying leader that build status changed ${this.toNotifyBuildType}`,
    );
    try {
      const devBuildControllerForProj =
        await this.project.ins.taonProjectsWorker.getDevBuildControllerForPort(
          this.toNotifyLeaderPort,
        );

      await devBuildControllerForProj.unlockLeaderQueue(this.toNotifyBuildType)
        .request!();
      Helpers.log(
        `Done notifying leader that build status changed ${this.toNotifyBuildType} (port=${this.toNotifyLeaderPort})`,
      );
    } catch (error) {
      Helpers.error(
        `Not able to notify build leader about status chagne of ${this.toNotifyBuildType}`,
      );
    }
    //#endregion
  }, 500);
  //#endregion

  //#region fields & getters / modify state before setting
  modifyStateBeforeSetting = (
    buildType: CoreModels.BuildType,
    nextState: DevMode.ProjectBuildStatus,
    currentState: DevMode.ProjectBuildStatus,
  ): DevMode.ProjectBuildStatus => {
    //#region handle BUILD_CANCEL_DONE after build
    if (
      [
        DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
        DevMode.ProjectBuildStatus.COMPILATION_ERROR,
      ].includes(nextState) &&
      currentState === DevMode.ProjectBuildStatus.BUILDING_BUT_CANCELLED
    ) {
      return DevMode.ProjectBuildStatus.BUILD_CANCEL_DONE;
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

    //#region handle BUILDING_WITH_REBUILD_AT_THE_END when done building
    if (
      currentState ===
        DevMode.ProjectBuildStatus.BUILDING_WITH_REBUILD_AT_THE_END &&
      [
        DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
        DevMode.ProjectBuildStatus.COMPILATION_ERROR,
      ].includes(nextState)
    ) {
      return DevMode.ProjectBuildStatus.BUILDING;
    }
    //#endregion

    //#region external state __SET_READY_FOR_REBUILD__
    if (nextState === DevMode.ProjectBuildStatus.__START_BUILD__) {
      if (currentState === DevMode.ProjectBuildStatus.BUILDING) {
        return DevMode.ProjectBuildStatus.BUILDING_WITH_REBUILD_AT_THE_END;
      }
      return DevMode.ProjectBuildStatus.BUILDING;
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

  //#region fields & getters / machine state

  //#region fields & getters / machine state / backend state
  public backendCjsState = new TaonStateMachine<DevMode.ProjectBuildStatus>({
    defaultValue: DevMode.ProjectBuildStatus.NOT_STARTED,
    debugMode: debugModeTaonLightWeightWatchMode,

    modifyStateBeforeSetting: (next, prev) =>
      this.modifyStateBeforeSetting('backend-cjs', next, prev),
    allowedStateMap: this.allowedStateMap,
    effect: (nextState, previousState, debugMode) => {
      debugMode &&
        console.log(
          `Backend commonjs state changed: ${previousState} -> ${nextState}`,
        );
      this.effect('backend-cjs', nextState, previousState, debugMode);
    },
  });

  public backendEsmState = new TaonStateMachine<DevMode.ProjectBuildStatus>({
    defaultValue: DevMode.ProjectBuildStatus.NOT_STARTED,
    debugMode: debugModeTaonLightWeightWatchMode,

    modifyStateBeforeSetting: (next, prev) =>
      this.modifyStateBeforeSetting('backend-esm', next, prev),
    allowedStateMap: this.allowedStateMap,
    effect: (nextState, previousState, debugMode) => {
      debugMode &&
        console.log(
          `Backend esm state changed: ${previousState} -> ${nextState}`,
        );
      this.effect('backend-esm', nextState, previousState, debugMode);
    },
  });

  public backendJsMapsState = new TaonStateMachine<DevMode.ProjectBuildStatus>({
    defaultValue: DevMode.ProjectBuildStatus.NOT_STARTED,
    debugMode: debugModeTaonLightWeightWatchMode,

    modifyStateBeforeSetting: (next, prev) =>
      this.modifyStateBeforeSetting('backend-js-maps', next, prev),
    allowedStateMap: this.allowedStateMap,
    effect: (nextState, previousState, debugMode) => {
      debugMode &&
        console.log(
          `Backend js maps state changed: ${previousState} -> ${nextState}`,
        );
      this.effect('backend-js-maps', nextState, previousState, debugMode);
    },
  });
  //#endregion

  //#region fields & getters / machine state / browser state
  public browserState = new TaonStateMachine<DevMode.ProjectBuildStatus>({
    defaultValue: DevMode.ProjectBuildStatus.NOT_STARTED,
    debugMode: debugModeTaonLightWeightWatchMode,
    modifyStateBeforeSetting: (next, prev) =>
      this.modifyStateBeforeSetting('browser', next, prev),
    allowedStateMap: this.allowedStateMap,
    effect: (nextState, previousState, debugMode) => {
      debugMode &&
        console.log(`Browser state changed: ${previousState} -> ${nextState}`);
      this.effect('browser', nextState, previousState, debugMode);
    },
  });
  //#endregion

  //#region fields & getters / machine state / websql state
  public websqlState = new TaonStateMachine<DevMode.ProjectBuildStatus>({
    defaultValue: DevMode.ProjectBuildStatus.NOT_STARTED,
    debugMode: debugModeTaonLightWeightWatchMode,
    modifyStateBeforeSetting: (next, prev) =>
      this.modifyStateBeforeSetting('websql', next, prev),
    allowedStateMap: this.allowedStateMap,
    effect: (nextState, previousState, debugMode) => {
      debugMode &&
        console.log(`Websql state changed: ${previousState} -> ${nextState}`);
      this.effect('websql', nextState, previousState, debugMode);
    },
  });
  //#endregion

  //#region fields & getters / machine state / copy manager state
  // public copyManagerState = new TaonStateMachine<DevMode.ProjectBuildStatus>({
  //   defaultValue: DevMode.ProjectBuildStatus.NOT_STARTED,
  //   debugMode: debugModeTaonLightWeightWatchMode,
  //   modifyStateBeforeSetting: (next, prev) =>
  //     this.modifyStateBeforeSetting('copy-manager', next, prev),
  //   allowedStateMap: this.allowedStateMap,
  //   effect: (nextState, previousState, debugMode) => {
  //     debugMode &&
  //       console.log(
  //         `Copy manager state changed: ${previousState} -> ${nextState}`,
  //       );
  //     this.effect('copy-manager', nextState, previousState, debugMode);
  //   },
  // });
  //#endregion

  //#region fields & getters / machine state / isomorphic state
  // public isomorphicCompilationState =
  //   new TaonStateMachine<DevMode.ProjectBuildStatus>({
  //     defaultValue: DevMode.ProjectBuildStatus.NOT_STARTED,
  //     debugMode: debugModeTaonLightWeightWatchMode,
  //     modifyStateBeforeSetting: (next, prev) =>
  //       this.modifyStateBeforeSetting('isomorphic', next, prev),
  //     allowedStateMap: this.allowedStateMap,
  //     effect: (nextState, previousState, debugMode) => {
  //       debugMode &&
  //         console.log(
  //           `Isomorphic compilation state changed: ${previousState} -> ${nextState}`,
  //         );
  //       this.effect('isomorphic', nextState, previousState, debugMode);
  //     },
  //   });
  //#endregion

  //#region fields & getters / machine state / error backend
  public errorBackend = new TaonStateMachine<string | undefined>({
    debugMode: debugModeTaonLightWeightWatchMode,
    defaultValue: void 0 as string,
  });
  //#endregion

  //#region fields & getters / machine state / error browser
  public errorBrowser = new TaonStateMachine<string | undefined>({
    defaultValue: void 0 as string,
    debugMode: debugModeTaonLightWeightWatchMode,
  });
  //#endregion

  //#region fields & getters / machine state / error websql
  public errorWebsql = new TaonStateMachine<string | undefined>({
    defaultValue: void 0 as string,
    debugMode: debugModeTaonLightWeightWatchMode,
  });
  //#endregion

  //#region fields & getters / machine state / states
  public states = new Map<
    CoreModels.BuildType,
    TaonStateMachine<DevMode.ProjectBuildStatus>
  >([
    ['backend-cjs', this.backendCjsState],
    ['backend-esm', this.backendEsmState],
    ['backend-js-maps', this.backendJsMapsState],
    ['browser', this.browserState],
    ['websql', this.websqlState],
    // ['isomorphic', this.isomorphicCompilationState],
    // ['copy-manager', this.copyManagerState],
  ]);

  public stateError = new Map<
    CoreModels.BuildWatcherErrorType,
    TaonStateMachine<string | undefined>
  >([
    ['backend-watcher-error', this.errorBackend],
    ['browser-watcher-error', this.errorBrowser],
    ['websql-watcher-error', this.errorWebsql],
  ]);
  //#endregion

  //#endregion

  //#region fields & getters / build status info
  public get buildStatusInfo(): DevMode.BuildStatusInfo {
    return {
      'backend-cjs': this.backendCjsState.currentValue,
      'backend-esm': this.backendEsmState.currentValue,
      'backend-js-maps': this.backendJsMapsState.currentValue,
      browser: this.browserState.currentValue,
      websql: this.websqlState.currentValue,
      // isomorphic: this.isomorphicCompilationState.currentValue,
      // 'copy-manager': this.copyManagerState.currentValue,
      'backend-watcher-error': this.errorBackend.currentValue,
      'browser-watcher-error': this.errorBrowser.currentValue,
      'websql-watcher-error': this.errorWebsql.currentValue,
    };
  }
  //#endregion

  //#region private methods / merge status
  private mergeStatus(info: DevMode.BuildStatusInfo): void {
    if (!_.isObject(info)) {
      return;
    }

    Object.keys(this.buildStatusInfo).forEach(key => {
      if (!_.isUndefined(info[key])) {
        if (key.includes(watcherPrefix)) {
          this.stateError
            .get(key as CoreModels.BuildWatcherErrorType)
            .set(info[key]);
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

  //#region lead build

  public firstBuildDoneAndLeadBuildIsAllowed() {
    // @ts-expect-error
    this._firstBuildDoneAndLeadBuildIsAllowed = true;
  }
  private readonly _firstBuildDoneAndLeadBuildIsAllowed = false;
  public toNotifyLeaderPort: number;

  public toNotifyBuildType: CoreModels.BuildType;

  private isDrityLeadBuild = false;

  public setAsDirty(): void {
    Helpers.warn(`Build dirty. Starting build again.`);
    this.isDrityLeadBuild = true;
    for (const [key, notifer] of this.buildsNotifiers.entries()) {
      notifer.next();
    }
  }

  private projectStaredLeadingBuild = false;

  private trigerLeadBuilding = _.debounce(() => {
    if (this.projectStaredLeadingBuild) {
      this.setAsDirty();
      return;
    }
    this.takeLeadOfBuildingDebounce();
  }, 200);

  public buildsNotifiers = new Map<
    CoreModels.BuildType,
    ReturnType<typeof UtilsWaitNotifier.getNotifier>
  >();

  private recreateNotifiers(): void {
    //#region @backend
    for (const buildType of CoreModels.BuildTypeArr) {
      if (!this.buildsNotifiers.has(buildType)) {
        this.buildsNotifiers.set(
          buildType,
          UtilsWaitNotifier.getNotifier({
            // max 3 minutes to finish build part
            exitTimeoutMs: 200 * 1000,
          }),
        );
      }
    }
    //#endregion
  }

  public setLeadBuildDirtyIfRunning(): void {
    Helpers.warn(`Trying to set lead build as dirty.`);
    if (this.projectStaredLeadingBuild) {
      this.setAsDirty();
    }
  }

  private takeLeadOfBuildingDebounce = _.debounce(async () => {
    await this.takeLeadOfBuilding();
  }, 1000);

  public async takeLeadOfBuilding(options?: {
    skipSelf?: boolean;
  }): Promise<void> {
    //#region @
    options = options || {};
    this.projectStaredLeadingBuild = true;

    while (true) {
      Helpers.logInfo('Taking lead of building');
      this.isDrityLeadBuild = false;

      //#region get all project for building
      const devModeControllerWorker =
        await this.project.ins.taonProjectsWorker.devModeWorker.getRemoteControllerFor(
          {
            methodOptions: {
              calledFrom: 'taon build observer',
            },
          },
        );

      let currentProjectData =
        this.project.ins.devBuildRepository.dataToRequest({
          buildStatusInfo: this.buildStatusInfo,
        });

      try {
        const dirtyBuild = Array.from(this.dirtyBuild.entries())
          .filter(([key, value]) => value)
          .reduce(
            (a, [key, value]) => {
              return { ...a, [key]: value };
            },
            {} as { [key in CoreModels.BuildWatcherType]: boolean },
          );
        var allDepProjectData = await devModeControllerWorker
          .setAsLeadProjectAndReturnDependcies(currentProjectData, dirtyBuild)!
          .request();
      } catch (error) {
        if (error instanceof HttpResponseError) {
          const err = error as HttpResponseError<RestErrorResponseWrapper>;
          Helpers.error(err.body.json.message, true, true);
        }
        this.projectStaredLeadingBuild = false;
        this.isDrityLeadBuild = false;
        return;
      }

      let allDepProject = (allDepProjectData.body.json || []).map(c =>
        DevMode.ProjectBuildNotificaiton.from(c),
      );

      if (options.skipSelf) {
        allDepProject = allDepProject.filter(
          f => f.uniqueKey !== currentProjectData.uniqueKey,
        );
      }

      Helpers.info(`
        Rebuilding in order...

${allDepProject.map((c, i) => `${i + 1}. ${c.port} ${c.nameForNpmPackage}`).join('\n')}

        `);

      //#endregion

      //#region leader check fn
      const isLeaderCheck = async (): Promise<boolean> => {
        let isStillLeader = await devModeControllerWorker
          .checkIfStillBuildLeader(currentProjectData)!
          .request();

        return isStillLeader.body.booleanValue;
      };
      //#endregion

      let shouldBeRebuildArr = CoreModels.BuildTypeArr;
      try {
        var shouoldBeRebuildData = await devModeControllerWorker
          .getWhatShouldBeRebuild(currentProjectData)!
          .request();

        shouldBeRebuildArr = Object.keys(
          shouoldBeRebuildData.body.json,
        ) as CoreModels.BuildType[];
      } catch (error) {
        Helpers.warn(`Not able to access worker to get partial rebuild info`);
      }

      Helpers.info(`Should be rebuild: ${shouldBeRebuildArr}`);

      //#region build project by project in order
      for (let projInde = 0; projInde < allDepProject.length; projInde++) {
        //#region prepare child project controller
        const proj = allDepProject[projInde];

        const devBuildControllerForProj =
          await this.project.ins.taonProjectsWorker.getDevBuildControllerForPort(
            proj.port,
          );
        //#endregion

        let workerHealty = true;

        //#region execute builds
        for (const buildType of shouldBeRebuildArr) {
          Helpers.taskStarted(
            `Building build type "${buildType}" for ${proj.port} ${proj.nameForNpmPackage}`,
          );

          currentProjectData =
            this.project.ins.devBuildRepository.dataToRequest({
              buildStatusInfo: this.buildStatusInfo,
            });

          if (this.isDrityLeadBuild) {
            Helpers.logInfo(
              'Restarting lead build - current project code changes.',
            );
            break;
          }

          const cancelMessage = () => {
            Helpers.logInfo(
              chalk.green(
                'Lead build cancel - project is no longer leading build',
              ),
            );
          };

          //#region check if build is still leader
          if (!(await isLeaderCheck())) {
            this.projectStaredLeadingBuild = false;
            cancelMessage();
            return;
          }
          //#endregion

          if (this.isDrityLeadBuild) {
            Helpers.logInfo(
              'Restarting lead build - current project code changes.',
            );
            break;
          }

          //#region check if worker healty
          let maxTrys = 3;
          do {
            try {
              await devBuildControllerForProj.healthCheck().request({
                timeout: 500,
              });
            } catch (error) {
              workerHealty = false;
            }
            break;
          } while (--maxTrys > 0);
          if (!workerHealty) {
            break;
          }
          //#endregion

          if (this.isDrityLeadBuild) {
            Helpers.logInfo(
              'Restarting lead build - current project code changes.',
            );
            break;
          }

          await devBuildControllerForProj
            .updateTaonBuildStatus(
              buildType,
              DevMode.ProjectBuildStatus.__START_BUILD__,
              this.project.ins.currentActionPort,
            )
            .request();

          //#region check if build is still leader
          if (!(await isLeaderCheck())) {
            this.projectStaredLeadingBuild = false;
            cancelMessage();
            return;
          }
          //#endregion

          Helpers.logInfo(
            `Waiting for build "${buildType}" done  in  ${proj.nameForNpmPackage} (port=${proj.port}) `,
          );

          await this.buildsNotifiers.get(buildType).wait();

          //#region check if build is still leader
          if (!(await isLeaderCheck())) {
            this.projectStaredLeadingBuild = false;
            cancelMessage();
            return;
          }
          //#endregion

          Helpers.taskDone(
            `Build "${buildType}" done  in  ${proj.nameForNpmPackage}`,
          );

          if (this.isDrityLeadBuild) {
            Helpers.logInfo(
              'Restarting lead build - current project code changes.',
            );
            break;
          }
        }
        //#endregion

        if (!currentProjectData.isEqual(proj)) {
          try {
            await devBuildControllerForProj
              .displayRebuildDoneMessage(this.project.nameForNpmPackage)
              .request({
                timeout: 500,
              });
          } catch (error) {}
        }

        if (!workerHealty) {
          continue;
        }
        if (this.isDrityLeadBuild) {
          break;
        }
      }
      //#endregion

      if (this.isDrityLeadBuild) {
        continue;
      }

      // UtilsTerminal.drawHorizontalLine();
      console.log(
        chalk.green(`

    BUILD (CURRENT LIB + DEPENDECIES) ${chalk.bold('DONE')}.

        `),
      );
      // UtilsTerminal.drawHorizontalLine();

      try {
        await devModeControllerWorker
          .finishLeadBuildAndUnregisterLeadProject(currentProjectData)!
          .request({
            timeout: 500,
          });
      } catch (error) {
        config.frameworkName === tnpPackageName && console.log(error);
        Helpers.logWarn(`Not able to unregister lead build project`, false);
      }
      break;
    }
    this.projectStaredLeadingBuild = false;
    //#endregion
  }

  //#endregion

  //#region public methods / start
  start(): void {
    //#region @backendFunc
    Helpers.info(`

      STARING TAON LIGHTWEIGHT WATCHER MODE

      `);
    this.recreateNotifiers();

    //#region handle code changes
    const handleCodeChanges = (
      buildType: CoreModels.BuildWatcherType,
    ): void => {
      this.project.watcher
        .getTsCodeObservableFor(buildType)
        // .pipe()
        .subscribe(() => {
          if (!this._firstBuildDoneAndLeadBuildIsAllowed) {
            //#region handle error before allowed lead build
            if (buildType === 'backend-watcher' && this.anyBackendError) {
              if (
                this.backendCjsState.currentValue ===
                DevMode.ProjectBuildStatus.COMPILATION_ERROR
              ) {
                this.backendCjsState.set(
                  DevMode.ProjectBuildStatus.__START_BUILD__,
                );
              }
              if (
                this.backendEsmState.currentValue ===
                DevMode.ProjectBuildStatus.COMPILATION_ERROR
              ) {
                this.backendEsmState.set(
                  DevMode.ProjectBuildStatus.__START_BUILD__,
                );
              }
              if (
                this.backendJsMapsState.currentValue ===
                DevMode.ProjectBuildStatus.COMPILATION_ERROR
              ) {
                this.backendJsMapsState.set(
                  DevMode.ProjectBuildStatus.__START_BUILD__,
                );
              }
            } else if (
              buildType === 'browser-watcher' &&
              this.anyBrowserError
            ) {
              this.browserState.set(DevMode.ProjectBuildStatus.__START_BUILD__);
            } else if (buildType === 'websql-watcher' && this.anyWebsqlError) {
              this.websqlState.set(DevMode.ProjectBuildStatus.__START_BUILD__);
            }
            //#endregion
            return;
          }
          this.dirtyBuild.set(buildType, true);
          this.trigerLeadBuilding();
        });
    };
    //#endregion

    for (const watcherType of CoreModels.BuildWatcherTypeArr) {
      handleCodeChanges(watcherType);
    }

    chokidar.watch(this.project.taonJson.path).on('change', () => {
      this.debouceUpdate();
    });

    //#endregion
  }
  //#endregion

  //#region private methods / any errors checks
  private get anyBackendError(): boolean {
    return (
      this.backendCjsState.currentValue ===
        DevMode.ProjectBuildStatus.COMPILATION_ERROR ||
      this.backendEsmState.currentValue ===
        DevMode.ProjectBuildStatus.COMPILATION_ERROR ||
      this.backendJsMapsState.currentValue ===
        DevMode.ProjectBuildStatus.COMPILATION_ERROR
    );
  }

  private get anyBrowserError(): boolean {
    return (
      this.browserState.currentValue ===
      DevMode.ProjectBuildStatus.COMPILATION_ERROR
    );
  }

  private get anyWebsqlError(): boolean {
    return (
      this.websqlState.currentValue ===
      DevMode.ProjectBuildStatus.COMPILATION_ERROR
    );
  }
  //#endregion
}
