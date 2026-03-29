"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeCut = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const constants_1 = require("../../../../../../../constants");
const browser_code_cut_1 = require("./browser-code-cut");
//#endregion
class CodeCut {
    absPathTmpSrcDistFolder;
    options;
    project;
    buildOptions;
    //#region constructor
    //#region @backend
    constructor(
    /**
     * absolute path ex: <project-path>/tmpSrcDist(Websql)
     */
    absPathTmpSrcDistFolder, options, 
    /**
     * it may be not available for global, for all compilation
     */
    project, buildOptions) {
        this.absPathTmpSrcDistFolder = absPathTmpSrcDistFolder;
        this.options = options;
        this.project = project;
        this.buildOptions = buildOptions;
    }
    //#endregion
    //#endregion
    //#region methods
    isAllowedPathForSave(relativePath) {
        //#region @backendFunc
        // console.log({ relativePath })
        return (lib_3.path.basename(relativePath).search(lib_1.PREFIXES.BASELINE) === -1 &&
            lib_3.path.basename(relativePath).search(lib_1.PREFIXES.DELETED) === -1 &&
            !relativePath.replace(/^\\/, '').startsWith(`tests/`));
        //#endregion
    }
    /**
     * ex: assets/file.png or my-app/component.ts
     */
    files(relativeFilesToProcess, remove = false) {
        //#region @backendFunc
        for (let index = 0; index < relativeFilesToProcess.length; index++) {
            const relativeFilePath = relativeFilesToProcess[index];
            // console.log(`CUT: ${relativeFilePath}`)
            this.file(relativeFilePath, remove);
        }
        //#endregion
    }
    file(relativePathToFile, remove = false) {
        // console.log('CUT: ', relativePathToFile);
        //#region @backendFunc
        if (!this.isAllowedPathForSave(relativePathToFile)) {
            return;
        }
        const absSourceFromSrc = (0, lib_3.crossPlatformPath)([
            lib_3.path.dirname(this.absPathTmpSrcDistFolder),
            constants_1.srcMainProject,
            relativePathToFile,
        ]);
        const absolutePathToFile = (0, lib_3.crossPlatformPath)([
            this.absPathTmpSrcDistFolder,
            relativePathToFile,
        ]);
        // if (absSourceFromSrc.endsWith('/file.ts')) {
        //   debugger
        // }
        if (!lib_2.extAllowedToReplace.includes(lib_3.path.extname(relativePathToFile))) {
            return new browser_code_cut_1.BrowserCodeCut(absSourceFromSrc, absolutePathToFile, this.absPathTmpSrcDistFolder, this.project, this.buildOptions).processFile({
                isCuttableFile: false,
                fileRemovedEvent: remove,
                regionReplaceOptions: this.options,
            });
        }
        return new browser_code_cut_1.BrowserCodeCut(absSourceFromSrc, absolutePathToFile, this.absPathTmpSrcDistFolder, this.project, this.buildOptions).processFile({
            isCuttableFile: true,
            fileRemovedEvent: remove,
            regionReplaceOptions: this.options,
        });
        //#endregion
    }
}
exports.CodeCut = CodeCut;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/build-isomorphic-lib/code-cut/code-cut.js.map