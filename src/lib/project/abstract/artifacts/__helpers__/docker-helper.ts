//#region imports
// import * as dockernode from 'dockerode';
import { ChangeOfFile } from 'incremental-compiler/src';
import { config } from 'tnp-core/src';
import { CoreModels, crossPlatformPath, path } from 'tnp-core/src';
import { fse } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import {
  BaseFeatureForProject,
  BaseDebounceCompilerForProject,
} from 'tnp-helpers/src';

import { DOCKER_COMPOSE_FILE_NAME, DOCKER_FOLDER } from '../../../../constants';
import {
  Development,
  EnvOptions,
  ReleaseArtifactTaonNames,
} from '../../../../options';
import { Project } from '../../project';
//#endregion

/**
 * @deprecated TODO not needed ?
 * handle dockers image in taon projects
 */
export class DockerHelper extends BaseDebounceCompilerForProject<
  {
    envOptions: EnvOptions;
  }, // @ts-ignore TODO weird inheritance problem
  Project
> {
  //#region private methods / get out dir app
  /**
   * Absolute path to the output directory for the app
   */
  getOutDirDockersRelease(buildOptions: EnvOptions): string {
    let outDirApp =
      `.${config.frameworkName}/${ReleaseArtifactTaonNames.ANGULAR_NODE_APP}/` +
      `${buildOptions.release.releaseType ? buildOptions.release.releaseType : Development}/` +
      `dockers-to-build`;

    return this.project.pathFor(outDirApp);
  }
  //#endregion

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
    //#region @backendFunc
    return;
    this.project.framework.recreateFileFromCoreProject({
      fileRelativePath: [config.folder.src, DOCKER_FOLDER, '.env'],
    });
    this.project.framework.recreateFileFromCoreProject({
      fileRelativePath: [
        config.folder.src,
        DOCKER_FOLDER,
        DOCKER_COMPOSE_FILE_NAME,
      ],
    });
    this.project.framework.recreateFileFromCoreProject({
      fileRelativePath: [
        config.folder.src,
        DOCKER_FOLDER,
        'hello-world/Dockerfile',
      ],
    });
    this.project.framework.recreateFileFromCoreProject({
      fileRelativePath: [
        config.folder.src,
        DOCKER_FOLDER,
        'hello-world/index.js',
      ],
    });

    const dockerFolder = this.getOutDirDockersRelease(this.envOptions);
    Helpers.mkdirp(dockerFolder);
    console.log(`Rebuilding docker files in ${dockerFolder}`);

    //#endregion
  }
  //#endregion

  //#region rebuild
  private rebuild(changeOfFiles: ChangeOfFile[], asyncEvent: boolean): void {
    //#region @backendFunc

    Helpers.taskStarted(`Rebuilding docker environment`);
    if (!asyncEvent) {
      this.rebuildBaseFiles();
      // console.log('changeOfFiles', changeOfFiles);
      // console.log('env release', this.envOptions.release);
    }
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
