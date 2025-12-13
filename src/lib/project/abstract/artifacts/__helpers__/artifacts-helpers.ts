//#region imports
import { config } from 'tnp-core/src';
import { crossPlatformPath, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import { appTsFromSrc, appVscodeTsFromSrc, srcMainProject } from '../../../../constants';
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

  //#region add sources from core
  addSrcFolderFromCoreProject(): void {
    //#region @backend
    const corePath = this.project.framework.coreProject.pathFor(srcMainProject);
    const dest = this.project.pathFor(srcMainProject);

    Helpers.copy(corePath, dest, {
      recursive: true,
      overwrite: true,
      filter: src => {
        return [appTsFromSrc, appVscodeTsFromSrc].includes(path.basename(src));
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
