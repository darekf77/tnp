"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceMappingUrl = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
class SourceMappingUrl {
    absFilePath;
    static SOURCEMAPDES = '//# sourceMappingURL=';
    static fixContent(absFilePath, buildOptions) {
        //#region @backendFunc
        absFilePath = (0, lib_1.crossPlatformPath)(absFilePath);
        if (!lib_2.Helpers.exists(absFilePath) ||
            lib_2.Helpers.isFolder(absFilePath) ||
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
        // this.content = (passedContent ? passedContent : (Helpers.readFile(absFilePath)) || '');
        this.content = lib_2.Helpers.readFile(absFilePath) || '';
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
                    `${SourceMappingUrl.SOURCEMAPDES}${lib_1.path.basename(this.absFilePath)}.map`;
            }
            else {
                this.contentLines[this.mappingLineIndex] =
                    `${SourceMappingUrl.SOURCEMAPDES}${(0, lib_1.crossPlatformPath)(this.absFilePath)}.map`;
            }
        }
        const fixedContent = this.contentLines.join('\n');
        if (fixedContent !== this.content) {
            // if (!_.isNil(this.passedContent)) {
            //   return fixedContent;
            // }
            lib_2.Helpers.writeFile(this.absFilePath, fixedContent);
        }
        return fixedContent;
        //#endregion
    }
}
exports.SourceMappingUrl = SourceMappingUrl;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/copy-manager/source-maping-url.js.map