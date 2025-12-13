//#region imports
import { ReplaceOptionsExtended } from 'isomorphic-region-loader/src';
import { config, PREFIXES } from 'tnp-core/src';
import { extAllowedToReplace } from 'tnp-core/src';
import { crossPlatformPath, fse, path, _ } from 'tnp-core/src';

import { srcMainProject } from '../../../../../../../constants';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';

import { BrowserCodeCut } from './browser-code-cut';
//#endregion

export class CodeCut {
  //#region constructor
  //#region @backend
  constructor(
    /**
     * absolute path ex: <project-path>/tmpSrcDist(Websql)
     */
    protected absPathTmpSrcDistFolder: string,
    protected options: ReplaceOptionsExtended,
    /**
     * it may be not available for global, for all compilation
     */
    private project: Project,
    private buildOptions: EnvOptions,
  ) {}
  //#endregion
  //#endregion

  //#region methods

  private isAllowedPathForSave(relativePath: string) {
    //#region @backendFunc
    // console.log({ relativePath })
    return (
      path.basename(relativePath).search(PREFIXES.BASELINE) === -1 &&
      path.basename(relativePath).search(PREFIXES.DELETED) === -1 &&
      !relativePath.replace(/^\\/, '').startsWith(`tests/`)
    );
    //#endregion
  }

  /**
   * ex: assets/file.png or my-app/component.ts
   */
  files(relativeFilesToProcess: string[], remove: boolean = false) {
    //#region @backendFunc
    for (let index = 0; index < relativeFilesToProcess.length; index++) {
      const relativeFilePath = relativeFilesToProcess[index];
      // console.log(`CUT: ${relativeFilePath}`)
      this.file(relativeFilePath, remove);
    }
    //#endregion
  }

  file(relativePathToFile: string, remove: boolean = false): void {
    // console.log('CUT: ', relativePathToFile);
    //#region @backendFunc
    if (!this.isAllowedPathForSave(relativePathToFile)) {
      return;
    }

    const absSourceFromSrc = crossPlatformPath([
      path.dirname(this.absPathTmpSrcDistFolder),
      srcMainProject,
      relativePathToFile,
    ]);

    const absolutePathToFile = crossPlatformPath([
      this.absPathTmpSrcDistFolder,
      relativePathToFile,
    ]);

    // if (absSourceFromSrc.endsWith('/file.ts')) {
    //   debugger
    // }

    if (!extAllowedToReplace.includes(path.extname(relativePathToFile))) {
      return new BrowserCodeCut(
        absSourceFromSrc,
        absolutePathToFile,
        this.absPathTmpSrcDistFolder,
        this.project,
        this.buildOptions,
      ).processFile({
        isCuttableFile: false,
        fileRemovedEvent: remove,
        regionReplaceOptions: this.options,
      });
    }

    return new BrowserCodeCut(
      absSourceFromSrc,
      absolutePathToFile,
      this.absPathTmpSrcDistFolder,
      this.project,
      this.buildOptions,
    ).processFile({
      isCuttableFile: true,
      fileRemovedEvent: remove,
      regionReplaceOptions: this.options,
    });
    //#endregion
  }

  //#endregion
}
