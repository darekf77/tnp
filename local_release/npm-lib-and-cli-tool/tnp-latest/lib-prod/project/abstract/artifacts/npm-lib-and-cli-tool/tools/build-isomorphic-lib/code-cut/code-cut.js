import { PREFIXES } from 'tnp-core/lib-prod';
import { extAllowedToReplace } from 'tnp-core/lib-prod';
import { crossPlatformPath, path } from 'tnp-core/lib-prod';
import { srcMainProject } from '../../../../../../../constants';
import { BrowserCodeCut } from './browser-code-cut';
//#endregion
export class CodeCut {
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
        return (path.basename(relativePath).search(PREFIXES.BASELINE) === -1 &&
            path.basename(relativePath).search(PREFIXES.DELETED) === -1 &&
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
            return new BrowserCodeCut(absSourceFromSrc, absolutePathToFile, this.absPathTmpSrcDistFolder, this.project, this.buildOptions).processFile({
                isCuttableFile: false,
                fileRemovedEvent: remove,
                regionReplaceOptions: this.options,
            });
        }
        return new BrowserCodeCut(absSourceFromSrc, absolutePathToFile, this.absPathTmpSrcDistFolder, this.project, this.buildOptions).processFile({
            isCuttableFile: true,
            fileRemovedEvent: remove,
            regionReplaceOptions: this.options,
        });
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/build-isomorphic-lib/code-cut/code-cut.js.map