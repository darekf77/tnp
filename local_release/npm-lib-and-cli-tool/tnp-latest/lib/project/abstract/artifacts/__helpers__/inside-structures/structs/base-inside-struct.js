"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseInsideStruct = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const app_utils_1 = require("../../../../../../app-utils");
const constants_1 = require("../../../../../../constants");
//#endregion
class BaseInsideStruct {
    project;
    initOptions;
    relativePaths() {
        const root = this.project.framework.coreProject.pathFor((0, app_utils_1.templateFolderForArtifact)(this.getCurrentArtifact()));
        const files = lib_1.Helpers.getFilesFrom(root, {
            recursive: true,
            followSymlinks: false,
        }).map(f => f.replace(`${(0, lib_1.crossPlatformPath)(lib_1.path.dirname(root))}/`, ''));
        // console.log({
        //   files
        // })
        return files;
    }
    constructor(project, initOptions) {
        this.project = project;
        this.initOptions = initOptions;
    }
    //#region replace imports for browser or websql
    replaceImportsForBrowserOrWebsql(fileContent, { websql }) {
        //#region @backendFunc
        const importExports = lib_2.UtilsTypescript.recognizeImportsFromContent(fileContent);
        for (const imp of importExports) {
            if (imp.cleanEmbeddedPathToFile.endsWith(`/${constants_1.srcFromTaonImport}`)) {
                fileContent = fileContent.replace(imp.cleanEmbeddedPathToFile, imp.cleanEmbeddedPathToFile.replace(`/${constants_1.srcFromTaonImport}`, websql ? `/${lib_1.folderName.websql}` : `/${lib_1.folderName.browser}`));
            }
        }
        if (websql) {
            fileContent = fileContent.replace('const websqlMode = false;', 'const websqlMode = true;');
        }
        return fileContent;
        //#endregion
    }
    //#endregion
    //#region replace imports for backend
    replaceImportsForBackend(fileContent) {
        //#region @backendFunc
        const importExports = lib_2.UtilsTypescript.recognizeImportsFromContent(fileContent);
        for (const imp of importExports) {
            if (imp.cleanEmbeddedPathToFile.endsWith(`/${constants_1.srcFromTaonImport}`)) {
                fileContent = fileContent.replace(imp.cleanEmbeddedPathToFile, imp.cleanEmbeddedPathToFile.replace(`/${constants_1.srcFromTaonImport}`, `/${constants_1.libFromImport}`));
            }
        }
        return fileContent;
        //#endregion
    }
}
exports.BaseInsideStruct = BaseInsideStruct;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/__helpers__/inside-structures/structs/base-inside-struct.js.map