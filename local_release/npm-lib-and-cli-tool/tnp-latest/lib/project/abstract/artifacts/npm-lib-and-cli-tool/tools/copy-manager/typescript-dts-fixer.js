"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypescriptDtsFixer = exports.TS_NOCHECK = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const constants_1 = require("../../../../../../constants");
exports.TS_NOCHECK = '// @ts-nocheck';
/**
 * TODO QUICK_FIX: for typescript compiler doing wrong imports/exports in d.ts files
 * example in file base context.d.ts
 * readonly __refSync: import("taon").EndpointContext;
 * instead of
 * readonly __refSync: import("taon/browser").EndpointContext;
 *
 * 1, import('') fixes for
 * - browser
 * - websql
 * 2. @dts nocheck fix at beginning
 * - browser
 * - websql
 * - nodejs
 */
class TypescriptDtsFixer {
    isomorphicPackages;
    //#region singleton
    static for(isomorphicPackages) {
        return new TypescriptDtsFixer(isomorphicPackages);
    }
    constructor(isomorphicPackages = []) {
        this.isomorphicPackages = isomorphicPackages;
    }
    //#endregion
    //#region helpers / fix dts import
    forBackendContent(content) {
        //#region @backendFunc
        content = content ? content : '';
        const isomorphicPackages = this.isomorphicPackages;
        for (let index = 0; index < isomorphicPackages.length; index++) {
            const isomorphicPackageName = isomorphicPackages[index];
            content = (content || '').replace(new RegExp(lib_1.Utils.escapeStringForRegEx(`${isomorphicPackageName}/${constants_1.srcFromTaonImport}'`), 'g'), `${isomorphicPackageName}'`);
            content = (content || '').replace(new RegExp(lib_1.Utils.escapeStringForRegEx(`${isomorphicPackageName}/${constants_1.srcFromTaonImport}"`), 'g'), `${isomorphicPackageName}"`);
        }
        return content;
        //#endregion
    }
    /**
     * browserFolder = browser websql browser-prod websql-prod
     */
    forContent(content, browserFolder) {
        //#region @backendFunc
        content = content ? content : '';
        // if(path.basename(filepath) === 'framework-context.d.ts') {
        //   debugger
        // }
        const isomorphicPackages = this.isomorphicPackages;
        for (let index = 0; index < isomorphicPackages.length; index++) {
            const isomorphicPackageName = isomorphicPackages[index];
            content = (content || '').replace(new RegExp(lib_1.Utils.escapeStringForRegEx(`import("${isomorphicPackageName}"`), 'g'), `import("${isomorphicPackageName}/${browserFolder}"`);
        }
        if (!content.trimLeft().startsWith(exports.TS_NOCHECK)) {
            content = `${exports.TS_NOCHECK}\n${content}`;
        }
        return content;
        //#endregion
    }
    //#endregion
    //#region helpers / fix d.ts import files in folder
    /**
     *  fixing d.ts for (dist)/(browser|websql) when destination local project
     * @param absPathFolderLocationWithBrowserAdnWebsql usually dist
     * @param isTempLocalProj
     */
    processFolderWithBrowserWebsqlFolders(absPathFolderLocationWithBrowserAdnWebsql, browserwebsqlFolders) {
        //#region @backendFunc
        // console.log({ absPathFolderLocation: absPathFolderLocationWithBrowserAdnWebsql })
        for (let index = 0; index < browserwebsqlFolders.length; index++) {
            const currentBrowserFolder = browserwebsqlFolders[index];
            lib_3.Helpers.log('Fixing .d.ts. files start...');
            const sourceBrowser = (0, lib_2.crossPlatformPath)([
                absPathFolderLocationWithBrowserAdnWebsql,
                currentBrowserFolder,
            ]);
            this.processFolder(sourceBrowser, currentBrowserFolder);
            lib_3.Helpers.log('Fixing .d.ts. files done.');
        }
        //#endregion
    }
    processFolder(absPathLocation, currentBrowserFolder) {
        //#region @backendFunc
        const browserDtsFiles = lib_3.Helpers.filesFrom(absPathLocation, true).filter(f => f.endsWith('.d.ts'));
        for (let index = 0; index < browserDtsFiles.length; index++) {
            const dtsFileAbsolutePath = browserDtsFiles[index];
            this.forFile(dtsFileAbsolutePath, currentBrowserFolder);
        }
        //#endregion
    }
    //#endregion
    //#region write fixed version of dts file
    forFile(dtsFileAbsolutePath, currentBrowserFolder) {
        //#region @backendFunc
        if (!dtsFileAbsolutePath.endsWith('.d.ts')) {
            return;
        }
        // console.log({ dtsFileAbsolutePath })
        const dtsFileContent = lib_3.Helpers.readFile(dtsFileAbsolutePath);
        const dtsFixedContent = this.forContent(dtsFileContent, 
        // dtsFileAbsolutePath,
        currentBrowserFolder);
        if (dtsFixedContent.trim() !== dtsFileContent.trim()) {
            lib_3.Helpers.writeFile(dtsFileAbsolutePath, dtsFixedContent);
        }
        //#endregion
    }
}
exports.TypescriptDtsFixer = TypescriptDtsFixer;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/copy-manager/typescript-dts-fixer.js.map