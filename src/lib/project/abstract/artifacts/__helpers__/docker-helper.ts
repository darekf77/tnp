//#region imports
// import * as dockernode from 'dockerode';
import { ChangeOfFile } from 'incremental-compiler/src';
import { config } from 'tnp-config/src';
import { CoreModels, crossPlatformPath, path } from 'tnp-core/src';
import { fse } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import {
  BaseFeatureForProject,
  BaseDebounceCompilerForProject,
} from 'tnp-helpers/src';

import { DOCKER_COMPOSE_FILE_NAME, DOCKER_FOLDER } from '../../../../constants';
import { EnvOptions } from '../../../../options';
import { Project } from '../../project';
//#endregion

/**
 * handle dockers image in taon projects
 */
export class DockerHelper extends BaseDebounceCompilerForProject<
  {
    envOptions: EnvOptions;
  }, // @ts-ignore TODO weird inheritance problem
  Project
> {
  //#region constructor
  constructor(project: Project) {
    super(project, {
      folderPath: project.pathFor([config.folder.src, DOCKER_FOLDER]),
      taskName: 'MigrationHelper',
      notifyOnFileUnlink: true,
    });
  }
  //#endregion

  //#region getters
  get envOptions(): EnvOptions {
    return this.initialParams.envOptions;
  }
  get dockerComposeAbsPath(): string {
    return this.project.pathFor([
      config.folder.src,
      DOCKER_FOLDER,
      DOCKER_COMPOSE_FILE_NAME,
    ]);
  }
  //#endregion

  //#region rebuild base files
  public rebuildBaseFiles(): void {
    return; // TODO @UNCOMMENT when docker is ready
    //#region @backendFunc
    this.project.framework.recreateFromCoreProject([
      config.folder.src,
      DOCKER_FOLDER,
      '.env',
    ]);
    this.project.framework.recreateFromCoreProject([
      config.folder.src,
      DOCKER_FOLDER,
      DOCKER_COMPOSE_FILE_NAME,
    ]);
    this.project.framework.recreateFromCoreProject([
      config.folder.src,
      DOCKER_FOLDER,
      'hello-world/Dockerfile',
    ]);
    this.project.framework.recreateFromCoreProject([
      config.folder.src,
      DOCKER_FOLDER,
      'hello-world/index.js',
    ]);
    //#endregion
  }
  //#endregion

  //#region rebuild
  private rebuild(changeOfFiles: ChangeOfFile[], asyncEvent: boolean): void {
    //#region @backendFunc

    Helpers.taskStarted(`Rebuilding docker environment`);
    if (!asyncEvent) {
      this.rebuildBaseFiles();
      console.log('changeOfFiles', changeOfFiles);
      console.log('env release', this.envOptions.release);
    }
    process.exit(0); // TODO: remove this line when docker is ready
    Helpers.taskDone(`Rebuilding docker environment Done`);
    //#endregion
  }
  //#endregion

  //#region action
  action({
    changeOfFiles,
    asyncEvent,
  }: {
    changeOfFiles: ChangeOfFile[];
    asyncEvent: boolean;
  }): void {
    //#region @backendFunc

    this.rebuild(changeOfFiles, asyncEvent);
    //#endregion
  }
  //#endregion
}
