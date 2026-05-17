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
import { DevBuildController } from '../../../../abstract/taon-worker/dev-build/dev-build.controller';
import { BaseFeatureForProject, Helpers } from 'tnp-helpers/src';

import {
  DEBOUCE_takeLeadOfBuildingDebounce,
  DEBOUNCE_trigerLeadBuilding,
  OBSERVER_PARALLELS,
} from '../../../../../constants';
import type { Project } from '../../../../abstract/project';
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

  //#region public methods / set as dirty
  public setAsDirty(): void {
    Helpers.warn(`Build dirty. Starting build again.`);
    this.isDrityLeadBuild = true;
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

  //#region private methods / tak lead of building debouced
  private takeLeadOfBuildingDebounce = _.debounce(async () => {
    await this.takeLeadOfBuilding();
  }, DEBOUCE_takeLeadOfBuildingDebounce);
  //#endregion

  //#region private methods / take lead of building
  public async takeLeadOfBuilding(options?: {
    skipSelf?: boolean;
  }): Promise<void> {
    //#region @backend
    options = options || {};
    this.projectStaredLeadingBuild = true;

    while (true) {
      Helpers.log('Taking lead of building');
      this.isDrityLeadBuild = false;

      //#region get current project data fn
      const getCurrentProjectData = () =>
        this.project.ins.devBuildRepository.dataToRequest({
          buildStatusInfo: this.taonBuildObserver.buildStatusInfo,
        });
      //#endregion

      //#region set as leader and get all project for building
      const devModeControllerWorker =
        await this.project.ins.taonProjectsWorker.devModeWorker.getRemoteControllerFor(
          {
            methodOptions: {
              calledFrom: 'taon build observer',
            },
          },
        );

      try {
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
      } catch (error) {
        if (error instanceof HttpResponseError) {
          const err = error as HttpResponseError<RestErrorResponseWrapper>;
          Helpers.error(err.body.json.message, true, true);
        } else {
          Helpers.warn(`Not able to communicate with watch mode main worker`);
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
          f => f.uniqueKey !== getCurrentProjectData().uniqueKey,
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
          config.frameworkName === tnpPackageName && console.log(error);
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
            config.frameworkName === tnpPackageName && console.log(error);
            await Utils.waitMilliseconds(100);
          }
          break;
        } while (--maxTrys > 0);
        return false;
      };
      //#endregion

      //#region cancel mesage fn
      const cancelMessage = () => {
        Helpers.logInfo(
          chalk.green('Lead build cancel - project is no longer leading build'),
        );
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
        config.frameworkName === tnpPackageName && console.error(error);
        Helpers.warn(`Not able to access worker to get partial rebuild info`);
      }

      Helpers.info(`Should be rebuild: ${shouldBeRebuildArr}`);
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
        if (this.isDrityLeadBuild) {
          Helpers.logInfo(
            'Restarting lead build - current project code changes.',
          );
          break;
        }
        //#endregion

        if (OBSERVER_PARALLELS) {
          //#region execute parallels builds

          Helpers.taskStarted(
            `Building ${proj.nameForNpmPackage}(port=${proj.port}) ${shouldBeRebuildArr.join(',')},`,
          );

          //#region start all build and wait for all to finish
          const promises = [] as Promise<any>[];
          for (const buildType of shouldBeRebuildArr) {
            promises.push(this.buildsNotifiers.get(buildType).wait());
          }

          for (const buildType of shouldBeRebuildArr) {
            await devBuildControllerForProj
              .updateTaonBuildStatus(
                buildType,
                DevMode.ProjectBuildStatus.__START_BUILD__,
                this.project.ins.currentActionPort,
              )
              .request();
          }

          await Promise.all(promises);
          //#endregion

          Helpers.taskDone(
            `Done Building ${proj.nameForNpmPackage}(port=${proj.port})`,
          );
          //#endregion
        } else {
          //#region execute builds
          for (const buildType of shouldBeRebuildArr) {
            Helpers.taskStarted(
              `Building build type "${buildType}" for ${proj.port} ${proj.nameForNpmPackage}`,
            );

            //#region skip/restart build if is dirty
            if (this.isDrityLeadBuild) {
              Helpers.logInfo(
                'Restarting lead build - current project code changes.',
              );
              break;
            }
            //#endregion

            //#region check if build is still leader
            if (!(await isLeaderCheck())) {
              this.projectStaredLeadingBuild = false;
              cancelMessage();
              return;
            }
            //#endregion

            //#region skip/restart build if is dirty
            if (this.isDrityLeadBuild) {
              Helpers.logInfo(
                'Restarting lead build - current project code changes.',
              );
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
              cancelMessage();
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
              cancelMessage();
              return;
            }
            //#endregion

            //#region skip/restart build if is dirty
            if (this.isDrityLeadBuild) {
              Helpers.logInfo(
                'Restarting lead build - current project code changes.',
              );
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
            config.frameworkName === tnpPackageName && console.log(error);
          }
        }
        //#endregion

        //#region skip/restart build if is dirty
        if (this.isDrityLeadBuild) {
          Helpers.logInfo(
            'Restarting lead build - current project code changes.',
          );
          break;
        }
        //#endregion
      } // end projects loop

      //#endregion

      //#region restart when dirty build
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
        config.frameworkName === tnpPackageName && console.log(error);
        Helpers.logWarn(`Not able to unregister lead build project`, false);
      }
      //#endregion

      break;
    }
    this.projectStaredLeadingBuild = false;
    //#endregion
  }
  //#endregion
}
