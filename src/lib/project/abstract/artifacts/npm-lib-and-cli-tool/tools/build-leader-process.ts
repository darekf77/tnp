import { HttpResponseError, RestErrorResponseWrapper } from 'ng2-rest/src';
import {
  chalk,
  config,
  CoreModels,
  tnpPackageName,
  UtilsWaitNotifier,
  _,
  Utils,
} from 'tnp-core/src';
import { BaseFeatureForProject, Helpers } from 'tnp-helpers/src';

import { errorMainWorkerCommunication } from '../../../../../app-utils';
import {
  DEBOUCE_takeLeadOfBuildingDebounce,
  DEBOUNCE_trigerLeadBuilding,
  ERR_MESSAGE_PROJECT_ALREADY_PART_OF_BUILD,
  OBSERVER_PARALLELS,
  skipLightWeightWatcherFor_CjsESM,
} from '../../../../../constants';
import type { Project } from '../../../../abstract/project';
import { DevBuildController } from '../../../../abstract/taon-worker/dev-build/dev-build.controller';
import { DevMode } from '../../../../abstract/taon-worker/dev-mode/dev-mode.models';

import type { TaonBuildObserver } from './taon-build-observer';

// @ts-ignore TODO weird inheritance problem
export class BuildLeader extends BaseFeatureForProject<Project> {
  //#region lead build / fields
  public firstBuildDoneAndLeadBuildIsAllowed(): void {
    // @ts-expect-error
    this._firstBuildDoneAndLeadBuildIsAllowed = true;
  }

  public get isAllowedForLeadBuild(): boolean {
    return this._firstBuildDoneAndLeadBuildIsAllowed;
  }

  private readonly _firstBuildDoneAndLeadBuildIsAllowed = false;

  private projectStaredLeadingBuild = false;

  // public toNotifyBuildType: CoreModels.BuildType;

  private isDrityLeadBuild = false;

  private isBuildCanceled = false;

  public buildsNotifiers = new Map<
    CoreModels.BuildType,
    ReturnType<typeof UtilsWaitNotifier.getNotifier>
  >();

  //#endregion

  //#region constructor
  constructor(
    project: Project,
    private taonBuildObserver: TaonBuildObserver,
  ) {
    super(project);
  }
  //#endregion

  //#region public methods / set as dirty or cancel
  public setAsDirty(): void {
    Helpers.warn(`Lead Build dirty in this process - restarting.`);
    this.isDrityLeadBuild = true;
    for (const [key, notifer] of this.buildsNotifiers.entries()) {
      notifer.next();
    }
  }

  public setAsCanceled(): void {
    Helpers.warn(`Lead Build canceld in this process.`);
    this.isBuildCanceled = true;
    for (const [key, notifer] of this.buildsNotifiers.entries()) {
      notifer.next();
    }
  }
  //#endregion

  //#region public methods / trigger lead building debounced
  public trigerLeadBuilding = _.debounce(() => {
    if (this.projectStaredLeadingBuild) {
      this.setAsDirty();
      return;
    }
    this.takeLeadOfBuildingDebounce();
  }, DEBOUNCE_trigerLeadBuilding);
  //#endregion

  //#region public methods / recreat notifiers
  public recreateNotifiers(): void {
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
  //#endregion

  //#region public methods / set leader as dirty if running
  public setLeadBuildDirtyIfRunning(): void {
    Helpers.warn(`Trying to set lead build as dirty.`);
    if (this.projectStaredLeadingBuild) {
      this.setAsDirty();
    }
  }
  //#endregion

  //#region public methods / cancel leader build if running
  public cancelLeadBuildIfRunning(): void {
    Helpers.warn(`Trying to cancel lead build.`);
    if (this.projectStaredLeadingBuild) {
      this.setAsCanceled();
    }
  }
  //#endregion

  //#region private methods / take lead of building
  private takeLeadOfBuildingDebounce = _.debounce(async () => {
    await this.takeLeadOfBuilding();
  }, DEBOUCE_takeLeadOfBuildingDebounce);

  public async takeLeadOfBuilding(options?: {
    skipProjectsNames?: string[];
  }): Promise<void> {
    //#region @backend
    if (!this.project.watcher.isTaonLightWatcherMode) {
      return;
    }
    options = options || {};
    this.projectStaredLeadingBuild = true;

    //#region error message
    const cancelMessage = 'Canceling lead build. Other process will take over.';
    const noLongerLeadMessage =
      'Project is no longer build leader. Other process will take over.';
    const dirtyMessage =
      'Restarting lead build - current (or external) project code changes.';
    //#endregion

    while (true) {
      Helpers.log('Taking lead of building');
      this.isDrityLeadBuild = false;
      this.isBuildCanceled = false;

      //#region get current project data fn
      const getCurrentProjectData = () =>
        this.project.ins.devBuildRepository.dataToRequest({
          buildStatusInfo: this.taonBuildObserver.buildStatusInfo,
        });
      //#endregion

      //#region prepare dev controller
      const devModeControllerWorker =
        await this.project.ins.taonProjectsWorker.buildsWorker.getRemoteControllerFor(
          {
            methodOptions: {
              calledFrom: 'taon build observer',
            },
          },
        );
      //#endregion

      //#region set as leader and get all project for building
      try {
        //#region try request projects for build
        const dirtyBuild = Array.from(
          this.taonBuildObserver.dirtyBuild.entries(),
        )
          .filter(([key, value]) => value)
          .reduce(
            (a, [key, value]) => {
              return { ...a, [key]: value };
            },
            {} as { [key in CoreModels.BuildWatcherType]: boolean },
          );
        var allDepProjectData = await devModeControllerWorker
          .setAsLeadProjectAndReturnDependcies(
            getCurrentProjectData(),
            dirtyBuild,
          )!
          .request();
        //#endregion
      } catch (error) {
        //#region handle request project errors
        if (error instanceof HttpResponseError) {
          const err = error as HttpResponseError<RestErrorResponseWrapper>;
          if (
            err?.body?.json?.code === ERR_MESSAGE_PROJECT_ALREADY_PART_OF_BUILD
          ) {
            Helpers.logInfo(`Taking over lead build.`);
            this.setAsDirty();
            continue;
          } else {
            config.frameworkName === tnpPackageName && console.error(error);
            Helpers.error(err.body.json.message || err.body.text, true, true);
          }
        }
        this.projectStaredLeadingBuild = false;
        this.isDrityLeadBuild = false;
        this.isBuildCanceled = false;
        return;
        //#endregion
      }
      //#endregion

      //#region filter porject for build
      let allDepProject = (allDepProjectData.body.json || []).map(c =>
        DevMode.ProjectBuildNotificaiton.from(c),
      );

      if (options.skipProjectsNames) {
        allDepProject = allDepProject.filter(
          f => !options.skipProjectsNames.includes(f.nameForNpmPackage),
        );
      }

      Helpers.info(`
        Rebuilding in order...

${allDepProject.map((c, i) => `${i + 1}. ${c.nameForNpmPackage} (port=${c.port})`).join('\n')}

        `);
      //#endregion

      //#region leader check fn
      const isLeaderCheck = async (): Promise<boolean> => {
        try {
          let isStillLeader = await devModeControllerWorker
            .checkIfStillBuildLeader(getCurrentProjectData())!
            .request();

          return isStillLeader.body.booleanValue;
        } catch (error) {
          config.frameworkName === tnpPackageName &&
            console.error(`ERROR leader check`);
          config.frameworkName === tnpPackageName && console.error(error);
          errorMainWorkerCommunication();
          return false;
        }
      };
      //#endregion

      //#region check worker healty fn
      const isProjectHealty = async (
        devBuildControllerForProj: DevBuildController,
      ): Promise<boolean> => {
        let maxTrys = 3;
        do {
          try {
            await devBuildControllerForProj.healthCheck().request({
              timeout: 500,
            });
            return true;
          } catch (error) {
            config.frameworkName === tnpPackageName &&
              console.error(`is project healty`, error);
            await Utils.waitMilliseconds(100);
          }
          break;
        } while (--maxTrys > 0);
        Helpers.warn(`Project is down.`);
        errorMainWorkerCommunication();
        return false;
      };
      //#endregion

      //#region resolve what should be rebuild (backend or browser or whatever)
      let shouldBeRebuildArr = CoreModels.BuildTypeArr;
      try {
        var shouoldBeRebuildData = await devModeControllerWorker
          .getWhatShouldBeRebuild(getCurrentProjectData())!
          .request();

        shouldBeRebuildArr = Object.keys(
          shouoldBeRebuildData.body.json,
        ) as CoreModels.BuildType[];
      } catch (error) {
        config.frameworkName === tnpPackageName &&
          console.error('resove what to rebuild', error);

        Helpers.warn(`Not able to access worker to get partial rebuild info`);
        errorMainWorkerCommunication();
      }

      if (skipLightWeightWatcherFor_CjsESM) {
        shouldBeRebuildArr = shouldBeRebuildArr.filter(
          f => f !== 'backend-cjs' && f !== 'backend-esm',
        );
      }

      Helpers.info(
        `Should be rebuild: ${shouldBeRebuildArr.length > 0 ? shouldBeRebuildArr.join(',') : `< nothing >`}`,
      );
      //#endregion

      //#region build project by project in order
      for (
        let projectIndex = 0;
        projectIndex < allDepProject.length;
        projectIndex++
      ) {
        //#region prepare child project controller
        const proj = allDepProject[projectIndex];

        const devBuildControllerForProj =
          await this.project.ins.taonProjectsWorker.getDevBuildControllerForPort(
            proj.port,
          );
        //#endregion

        //#region skip build project worker not healty
        if (!(await isProjectHealty(devBuildControllerForProj))) {
          break;
        }
        //#endregion

        //#region skip/restart build if is dirty
        if (this.isBuildCanceled) {
          Helpers.logInfo(cancelMessage);
          return;
        }
        if (this.isDrityLeadBuild) {
          Helpers.logInfo(dirtyMessage);
          break;
        }
        //#endregion

        if (OBSERVER_PARALLELS) {
          //#region execute parallels builds

          const taskBuilding = Helpers.actionStarted(
            `Building ${proj.nameForNpmPackage}(port=${proj.port}) ${shouldBeRebuildArr.join(',')},`,
          );

          //#region process build and wait fn
          const processBuildAndWaitFn = async (
            rebuildArr,
          ): Promise<boolean> => {
            const promises = [] as Promise<any>[];
            for (const buildType of rebuildArr) {
              promises.push(this.buildsNotifiers.get(buildType).wait());
            }

            for (const buildType of rebuildArr) {
              await devBuildControllerForProj
                .updateTaonBuildStatus(
                  buildType,
                  DevMode.ProjectBuildStatus.__START_BUILD__,
                  this.project.ins.currentActionPort,
                )
                .request();
            }

            try {
              await Promise.all(promises);
              return true;
            } catch (error) {
              config.frameworkName === tnpPackageName &&
                console.error(`update trigger build status`, error);
              Helpers.warn(`Update/wait failed.`);
              errorMainWorkerCommunication();
              return false;
            }
          };
          //#endregion

          //#region start all build and wait for all to finish (backend)
          if (
            shouldBeRebuildArr.includes('backend-cjs') ||
            shouldBeRebuildArr.includes('backend-esm') ||
            shouldBeRebuildArr.includes('backend-js-maps')
          ) {
            const buildOK = await processBuildAndWaitFn(
              shouldBeRebuildArr.filter(f =>
                (
                  [
                    'backend-cjs',
                    'backend-esm',
                    'backend-js-maps',
                  ] as CoreModels.BuildType[]
                ).includes(f),
              ),
            );
            if (!buildOK) {
              this.setAsDirty();
            }
          }
          //#endregion

          //#region skip/restart build if is dirty
          if (this.isBuildCanceled) {
            Helpers.logInfo(cancelMessage);
            return;
          }
          if (this.isDrityLeadBuild) {
            Helpers.logInfo(dirtyMessage);
            break;
          }
          //#endregion

          //#region check if build is still leader
          if (!(await isLeaderCheck())) {
            this.projectStaredLeadingBuild = false;
            Helpers.logInfo(noLongerLeadMessage);
            return;
          }
          //#endregion

          //#region start all build and wait for all to finish (frontend)
          if (
            shouldBeRebuildArr.includes('browser') ||
            shouldBeRebuildArr.includes('websql')
          ) {
            const buildOK = await processBuildAndWaitFn(
              shouldBeRebuildArr.filter(f =>
                (['browser', 'websql'] as CoreModels.BuildType[]).includes(f),
              ),
            );
            if (!buildOK) {
              this.setAsDirty();
            }
          }
          //#endregion

          taskBuilding.done();
          //#endregion
        } else {
          //#region execute builds
          for (const buildType of shouldBeRebuildArr) {
            Helpers.taskStarted(
              `Building build type "${buildType}" for ${proj.port} ${proj.nameForNpmPackage}`,
            );

            //#region skip/restart build if is dirty
            if (this.isBuildCanceled) {
              Helpers.logInfo(cancelMessage);
              return;
            }
            if (this.isDrityLeadBuild) {
              Helpers.logInfo(dirtyMessage);
              break;
            }
            //#endregion

            //#region check if build is still leader
            if (!(await isLeaderCheck())) {
              this.projectStaredLeadingBuild = false;
              Helpers.logInfo(noLongerLeadMessage);
              return;
            }
            //#endregion

            //#region skip/restart build if is dirty
            if (this.isBuildCanceled) {
              Helpers.logInfo(cancelMessage);
              return;
            }
            if (this.isDrityLeadBuild) {
              Helpers.logInfo(dirtyMessage);
              break;
            }
            //#endregion

            //#region trigger single build
            await devBuildControllerForProj
              .updateTaonBuildStatus(
                buildType,
                DevMode.ProjectBuildStatus.__START_BUILD__,
                this.project.ins.currentActionPort,
              )
              .request();
            //#endregion

            //#region check if build is still leader
            if (!(await isLeaderCheck())) {
              this.projectStaredLeadingBuild = false;
              Helpers.logInfo(noLongerLeadMessage);
              return;
            }
            //#endregion

            //#region wait for single build to finish
            Helpers.logInfo(
              `Waiting for build "${buildType}" done  in  ${proj.nameForNpmPackage} (port=${proj.port}) `,
            );

            await this.buildsNotifiers.get(buildType).wait();
            //#endregion

            //#region check if build is still leader
            if (!(await isLeaderCheck())) {
              this.projectStaredLeadingBuild = false;
              Helpers.logInfo(noLongerLeadMessage);
              return;
            }
            //#endregion

            //#region skip/restart build if is dirty
            if (this.isBuildCanceled) {
              Helpers.logInfo(cancelMessage);
              return;
            }
            if (this.isDrityLeadBuild) {
              Helpers.logInfo(dirtyMessage);
              break;
            }
            //#endregion

            Helpers.taskDone(
              `Build "${buildType}" done  in  ${proj.nameForNpmPackage}`,
            );
          }
          //#endregion
        }

        //#region display done message for project when build done
        if (!getCurrentProjectData().isEqual(proj)) {
          try {
            await devBuildControllerForProj
              .displayRebuildDoneMessage(this.project.nameForNpmPackage)
              .request({
                timeout: 500,
              });
          } catch (error) {
            config.frameworkName === tnpPackageName &&
              console.error(`display rebuild done message`, error);
            Helpers.warn(`Can't display rebuild message in child build.`);
            errorMainWorkerCommunication();
          }
        }
        //#endregion

        //#region skip/restart build if is dirty
        if (this.isBuildCanceled) {
          Helpers.logInfo(cancelMessage);
          return;
        }
        if (this.isDrityLeadBuild) {
          Helpers.logInfo(dirtyMessage);
          break;
        }
        //#endregion
      } // end projects loop

      //#endregion

      //#region restart when dirty build
      if (this.isBuildCanceled) {
        return;
      }

      if (this.isDrityLeadBuild) {
        continue;
      }
      //#endregion

      //#region finish lead build and flush projects
      // UtilsTerminal.drawHorizontalLine();
      console.log(
        chalk.green(`

    BUILD (CURRENT LIB + DEPENDECIES) ${chalk.bold('DONE')}.

        `),
      );
      // UtilsTerminal.drawHorizontalLine();

      try {
        await devModeControllerWorker
          .finishLeadBuildAndUnregisterLeadProject(getCurrentProjectData())!
          .request({
            timeout: 500,
          });
      } catch (error) {
        config.frameworkName === tnpPackageName &&
          console.log(`finish build lead`, error);
        Helpers.warn(`Not able to unregister lead build project`);
        errorMainWorkerCommunication();
      }
      //#endregion

      break;
    }
    this.projectStaredLeadingBuild = false;
    //#endregion
  }
  //#endregion
}
