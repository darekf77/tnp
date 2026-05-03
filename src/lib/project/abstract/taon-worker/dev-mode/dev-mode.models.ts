import { TaonBaseClass } from 'taon/src';
import { CoreModels } from 'tnp-core/src';

export namespace DevMode {
  export const MAX_NUMBER_OF_CONCURENT_BUILDS = 1;

  export enum ProjectBuildStatus {
    __CANCEL_BUILD__ = '__CANCEL_BUILD__',
    __SET_READY_FOR_REBUILD__ = '__SET_READY_FOR_REBUILD__',

    /**
     * 1. default state of porject
     */
    NOT_STARTED = 'NOT_STARTED',
    /**
     * 2. project is requesting permission to start build
     * - main worker check if dependencies of this project are in watch
     * mode being build -> if yes -> build cancel build
     * (dont'kill - just finish build and put current project as priorityu )
     * - update isomorphic packages list
     */
    READ_FOR_BUILD_TRIGGER = 'READ_FOR_BUILD_TRIGGER',
    /**
     * 3. workers request trigger build in project
     */
    BUILDING = 'BUILDING',

    /**
     * 4. project is going to repeat build (user triggered changes)
     */
    BUILDING_WITH_REBUILD_AT_THE_END = 'BUILDING_WITH_REBUILD_AT_THE_END',

    /**
     * 4. project is going to repeat build (user triggered changes)
     */
    BUILDING_BUT_CANCELLED = 'BUILDING_BUT_CANCELLED',
    /**
     * 5. project build done - now other projects can rebuild
     */
    DONE_BUILDING_SUCCESS = 'DONE_BUILDING_SUCCESS',

    /**
     * After BUILDING_BUT_CANCELLED triggerd
     */
    BUILD_CANCEL_DONE = 'BUILD_CANCEL_DONE',
    /**
     * 6. build error - other project are being build
     * BUT when user again start building this -> this project has priority
     * again.
     */
    COMPILATION_ERROR = 'COMPILATION_ERROR',
  }

  // export const statusesAllowedForBuildTrigger = [
  //   ProjectBuildStatus.READ_FOR_BUILD_TRIGGER,
  //   ProjectBuildStatus.DONE_BUILDING_SUCCESS,
  //   ProjectBuildStatus.NOT_STARTED,
  //   ProjectBuildStatus.COMPILATION_ERROR,
  // ];

  export interface BuildStatusInfo {
    browser?: ProjectBuildStatus;
    websql?: ProjectBuildStatus;
    backend?: ProjectBuildStatus;
    errorBackend?: string;
    errorBrowser?: string;
    errorWebsql?: string;
  }

  export class ProjectBuildNotificaiton extends TaonBaseClass {
    static from(
      json: Partial<ProjectBuildNotificaiton>,
    ): ProjectBuildNotificaiton {
      return new ProjectBuildNotificaiton().clone(json);
    }

    //#region is equal
    isEqual(build: ProjectBuildNotificaiton): boolean {
      return (
        build.location === this.location &&
        build.name === this.name &&
        build.nameForNpmPackage === this.nameForNpmPackage &&
        Number(build.port) === Number(this.port)
      );
    }
    //#endregion

    //#region every build with status
    private everyBuildsWithStatus(status: ProjectBuildStatus): boolean {
      if (!this.buildStatusInfo) {
        return false;
      }
      return (
        this.buildStatusInfo.backend === status &&
        this.buildStatusInfo.browser === status &&
        this.buildStatusInfo.websql === status
      );
    }
    //#endregion

    //#region any build with status
    private anyBuildsWithStatus(status: ProjectBuildStatus): boolean {
      if (!this.buildStatusInfo) {
        return false;
      }
      return (
        this.buildStatusInfo.backend === status ||
        this.buildStatusInfo.browser === status ||
        this.buildStatusInfo.websql === status
      );
    }
    //#endregion

    get allBuildsSucceed() {
      return this.everyBuildsWithStatus(
        ProjectBuildStatus.DONE_BUILDING_SUCCESS,
      );
    }

    get uniqueKey(): string {
      return `${this.location}__${this.nameForNpmPackage}__${this.port}`;
    }

    get isWatchBuild(): boolean {
      return this.buildType === 'watch';
    }

    declare buildStatusInfo?: BuildStatusInfo;

    declare lastError?: string;

    declare name?: string;

    declare buildType?: 'watch' | 'normal';

    declare nameForNpmPackage?: string;

    declare coreContainerVersion?: CoreModels.FrameworkVersion;

    declare port?: string | number;

    declare location?: string;

    declare devModeDependenciesNames?: string[];
  }
}
