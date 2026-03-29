import { crossPlatformPath, path } from 'tnp-core/lib-prod';
import { Helpers__NS__exists, Helpers__NS__isFolder, Helpers__NS__readFile, Helpers__NS__writeFile } from 'tnp-helpers/lib-prod';
export class SourceMappingUrl {
    absFilePath;
    static SOURCEMAPDES = '//# sourceMappingURL=';
    static fixContent(absFilePath, buildOptions) {
        //#region @backendFunc
        absFilePath = crossPlatformPath(absFilePath);
        if (!Helpers__NS__exists(absFilePath) ||
            Helpers__NS__isFolder(absFilePath) ||
            !absFilePath.endsWith('.js')) {
            return;
        }
        return new SourceMappingUrl(absFilePath).process(buildOptions);
        //#endregion
    }
    content;
    contentLines;
    mappingLineIndex;
    //#region constructor
    //#region @backend
    constructor(absFilePath) {
        this.absFilePath = absFilePath;
        // console.log(`Fixging ${absFilePath}`, 1)
        // this.content = (passedContent ? passedContent : (Helpers__NS__readFile(absFilePath)) || '');
        this.content = Helpers__NS__readFile(absFilePath) || '';
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
    process(buildOptions) {
        //#region @backendFunc
        if (this.mappingLineIndex !== -1) {
            if (buildOptions.release.releaseType) {
                this.contentLines[this.mappingLineIndex] =
                    `${SourceMappingUrl.SOURCEMAPDES}${path.basename(this.absFilePath)}.map`;
            }
            else {
                this.contentLines[this.mappingLineIndex] =
                    `${SourceMappingUrl.SOURCEMAPDES}${crossPlatformPath(this.absFilePath)}.map`;
            }
        }
        const fixedContent = this.contentLines.join('\n');
        if (fixedContent !== this.content) {
            // if (!___NS__isNil(this.passedContent)) {
            //   return fixedContent;
            // }
            Helpers__NS__writeFile(this.absFilePath, fixedContent);
        }
        return fixedContent;
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/copy-manager/source-maping-url.js.map