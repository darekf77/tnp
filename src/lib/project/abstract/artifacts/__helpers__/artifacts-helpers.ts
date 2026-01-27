//#region imports
import { config, UtilsFilesFoldersSync } from 'tnp-core/src';
import { Helpers, crossPlatformPath, path } from 'tnp-core/src';
import { HelpersTaon } from 'tnp-helpers/src';

import {
  appTsFromSrc,
  appVscodeTsFromSrc,
  srcMainProject,
} from '../../../../constants';
import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';

import { Branding } from './branding';
import { RenameRule } from 'magic-renamer/src';
//#endregion

/**
 * Global helper for artifacts
 */
export class ArtifactsGlobalHelper {
  public readonly branding: Branding;

  constructor(private project: Project) {
    //#region @backend
    this.branding = new (require('./branding').Branding as typeof Branding)(
      project,
    );
    //#endregion
    // this.docker = new DockerHelper(project); /// TODO @UNCOMMENT when docker is ready
  }

  //#region add sources from core
  addSrcFolderFromCoreProject(): void {
    //#region @backend
    const corePath = this.project.framework.coreProject.pathFor(srcMainProject);
    const dest = this.project.pathFor(srcMainProject);

    HelpersTaon.copy(corePath, dest, {
      recursive: true,
      overwrite: true,
      // filter: src => {
      //   return [appTsFromSrc, appVscodeTsFromSrc].includes(path.basename(src));
      // },
    });

    UtilsFilesFoldersSync.getFilesFrom(dest, {
      recursive: true,
      followSymlinks: false,
    }).forEach(f => {
      let content = Helpers.readFile(f);
      const rules = RenameRule.from(
        `${this.project.framework.coreProject.name} => ${this.project.name}`,
      );
      for (const rule of rules) {
        content = rule.replaceInString(content);
      }
      // content = content.replace(/from 'tnp-core\/src/g, `from '${config.npmScope}/core/source`);
      // content = content.replace(/from "tnp-core\/src/g, `from "${config.npmScope}/core/source`);
      Helpers.writeFile(f, content);
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
