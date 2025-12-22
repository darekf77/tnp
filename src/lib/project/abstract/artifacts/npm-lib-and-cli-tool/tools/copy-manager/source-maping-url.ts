import { crossPlatformPath, path, _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import { EnvOptions } from '../../../../../../options';
import type { Project } from '../../../../project';

export class SourceMappingUrl {
  public static readonly SOURCEMAPDES = '//# sourceMappingURL=';

  static fixContent(
    absFilePath: string,
    buildOptions: EnvOptions,
    // content?: string
  ) {

    //#region @backendFunc
    absFilePath = crossPlatformPath(absFilePath);
    if (
      !Helpers.exists(absFilePath) ||
      Helpers.isFolder(absFilePath) ||
      !absFilePath.endsWith('.js')
    ) {
      return;
    }
    return new SourceMappingUrl(
      absFilePath,
      // , content
    ).process(buildOptions);
    //#endregion

  }

  private readonly content: string;
  private readonly contentLines: string[];
  private readonly mappingLineIndex: number;

  //#region constructor

  //#region @backend
  private constructor(
    private absFilePath: string,
    // private passedContent?: string
  ) {
    // console.log(`Fixging ${absFilePath}`, 1)
    // this.content = (passedContent ? passedContent : (Helpers.readFile(absFilePath)) || '');
    this.content = Helpers.readFile(absFilePath) || '';
    this.contentLines = this.content.split(/\r?\n/);

    for (let index = this.contentLines.length - 1; index >= 0; index--) {
      const line = this.contentLines[index];
      if (line.trim().startsWith(SourceMappingUrl.SOURCEMAPDES)) {
        this.mappingLineIndex = index;
        break;
      }
    }
  }
  //#endregion

  //#endregion

  process(buildOptions: EnvOptions): string {

    //#region @backendFunc
    if (this.mappingLineIndex !== -1) {
      if (buildOptions.release.releaseType) {
        this.contentLines[this.mappingLineIndex] =
          `${SourceMappingUrl.SOURCEMAPDES}${path.basename(this.absFilePath)}.map`;
      } else {
        this.contentLines[this.mappingLineIndex] =
          `${SourceMappingUrl.SOURCEMAPDES}${crossPlatformPath(this.absFilePath)}.map`;
      }
    }
    const fixedContent = this.contentLines.join('\n');
    if (fixedContent !== this.content) {
      // if (!_.isNil(this.passedContent)) {
      //   return fixedContent;
      // }
      Helpers.writeFile(this.absFilePath, fixedContent);
    }
    return fixedContent;
    //#endregion

  }
}