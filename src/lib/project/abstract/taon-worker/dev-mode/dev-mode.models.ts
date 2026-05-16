import { TaonBaseClass } from 'taon/src';
import { CoreModels, UtilsProjects, _ } from 'tnp-core/src';

import { watcherPrefix } from '../../../../constants';

export namespace DevMode {
  export const MAX_NUMBER_OF_CONCURENT_BUILDS = 1;

  export enum ProjectBuildStatus {
    /**
     * External command to cancel build (TODO implement killing of processes)
     */
    __CANCEL_BUILD__ = '__CANCEL_BUILD__',

    /**
     * External command to start building (or repeat build if build active)
     */
    __START_BUILD__ = '__START_BUILD__',

    /**
     * 1. default state of porject
     */
    NOT_STARTED = 'NOT_STARTED',

    /**
     * Each project is immediatlly building because of BehaviorSubject()
     */
    BUILDING = 'BUILDING',

    /**
     * Cancelled build of project (but still building - I am not killing processes)
     */
    BUILDING_BUT_CANCELLED = 'BUILDING_BUT_CANCELLED',

    /**
     * Auto rebuild of project at the end of building
     */
    BUILDING_WITH_REBUILD_AT_THE_END = 'BUILDING_WITH_REBUILD_AT_THE_END',

    /**
     * Done building
     */
    DONE_BUILDING_SUCCESS = 'DONE_BUILDING_SUCCESS',

    /**
     * Cancelled build of project (process idle)
     */
    BUILD_CANCEL_DONE = 'BUILD_CANCEL_DONE',
    /**
     * Build error.
     */
    COMPILATION_ERROR = 'COMPILATION_ERROR',
  }

  export type BuildStatusInfo = {
    [key in CoreModels.BuildType]: ProjectBuildStatus;
  } & { [key in CoreModels.BuildWatcherErrorType]?: string | undefined };

  export class ProjectBuildNotificaiton extends TaonBaseClass {
    static from(
      json: Partial<ProjectBuildNotificaiton>,
    ): ProjectBuildNotificaiton {
      if (!_.isObject(json)) {
        return;
      }
      return new ProjectBuildNotificaiton().clone(json);
    }

    //#region is equal
    isEqual(build: ProjectBuildNotificaiton): boolean {
      build = ProjectBuildNotificaiton.from(build);
      return build.uniqueKey === this.uniqueKey;
    }
    //#endregion

    private get allStatusValues(): ProjectBuildStatus[] {
      const values = Object.keys(this.buildStatusInfo || {})
        .filter(f => !f.includes(watcherPrefix))
        .map(key => (this.buildStatusInfo || {})[key]);
      return values;
    }

    //#region every build with status
    private everyBuildsWithStatus(status: ProjectBuildStatus): boolean {
      if (!this.buildStatusInfo) {
        return false;
      }
      return this.allStatusValues.every(s => s === status);
    }
    //#endregion

    //#region any build with status
    private anyBuildsWithStatus(status: ProjectBuildStatus): boolean {
      if (!this.buildStatusInfo) {
        return false;
      }
      return this.allStatusValues.some(s => s === status);
    }
    //#endregion

    get allBuildsSucceed(): boolean {
      return this.everyBuildsWithStatus(
        ProjectBuildStatus.DONE_BUILDING_SUCCESS,
      );
    }

    get someBuildsFailed(): boolean {
      return this.anyBuildsWithStatus(ProjectBuildStatus.COMPILATION_ERROR);
    }

    get uniqueKey(): string {
      return `${this.location}__${this.nameForNpmPackage}__${this.port}`;
    }

    get isWatchBuild(): boolean {
      return this.buildType === 'watch';
    }



    declare buildStatusInfo?: BuildStatusInfo;

    declare name?: string;

    declare buildType?: 'watch' | 'normal';

    declare nameForNpmPackage?: string;

    declare coreContainerVersion?: CoreModels.FrameworkVersion;

    declare port?: string | number;

    declare location?: string;

    declare devModeDependenciesNames?: string[];
  }
}
