//#region imports
import { config } from 'tnp-core/src';
import { crossPlatformPath, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import { angularProjProxyPath } from '../../../../constants';
import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';

import { Branding } from './branding';
//#endregion

/**
 * Global helper for artifacts
 */
export class ArtifactsGlobalHelper {
  public readonly branding: Branding;

  constructor(private project: Project) {
    this.branding = new Branding(project);
    // this.docker = new DockerHelper(project); /// TODO @UNCOMMENT when docker is ready
  }

  //#region get proxy project location
  __getProxyProjPath(client: string): string {
    //#region @backendFunc
    const workspaceOrContainerProject: Project = this.project;
    return crossPlatformPath([
      workspaceOrContainerProject.location,
      config.folder.dist,
      workspaceOrContainerProject.name,
      client,
    ]);
    //#endregion
  }
  //#endregion

  //#region get proxy projects
  targetProjFor(childProjectName: string): Project {
    //#region @backendFunc
    return this.project.ins.From(
      this.__getProxyProjPath(childProjectName),
    ) as any;
    //#endregion
  }
  //#endregion

  //#region get proxy ng projects
  getProxyNgProj(
    buildOptions: EnvOptions,
    targetArtifact: EnvOptions['release']['targetArtifact'],
  ): Project {
    //#region @backendFunc
    const projPath = crossPlatformPath([
      this.project.location,
      angularProjProxyPath({
        project: this.project,
        websql: buildOptions.build.websql,
        targetArtifact: targetArtifact,
      }),
    ]);
    const proj = this.project.ins.From(projPath);
    return proj as Project;
    //#endregion
  }
  //#endregion

  //#region add sources from core
  addSrcFolderFromCoreProject(): void {
    //#region @backend
    const corePath = this.project.framework.coreProject.pathFor('src');
    const dest = this.project.pathFor('src');

    Helpers.copy(corePath, dest, {
      recursive: true,
      overwrite: true,
      filter: src => {
        return ['app.ts', 'app.vscode.ts'].includes(path.basename(src));
      },
    });
    //#endregion
  }
  //#endregion

  //#region getters & methods / remove (m)js.map files from release
  /**
   * because of that
   * In vscode there is a mess..
   * TODO
   */
  __removeJsMapsFrom(absPathReleaseDistFolder: string) {
    //#region @backendFunc
    return; // TODO not a good idea
    Helpers.filesFrom(absPathReleaseDistFolder, true)
      .filter(f => f.endsWith('.js.map') || f.endsWith('.mjs.map'))
      .forEach(f => Helpers.removeFileIfExists(f));
    //#endregion
  }
  //#endregion
}
