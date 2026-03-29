//#region imports
import { crossPlatformPath, folderName, path, Helpers__NS__getFilesFrom } from 'tnp-core/lib-prod';
import { UtilsTypescript__NS__recognizeImportsFromContent } from 'tnp-helpers/lib-prod';
import { templateFolderForArtifact } from '../../../../../../app-utils';
import { libFromImport, srcFromTaonImport, } from '../../../../../../constants';
//#endregion
export class BaseInsideStruct {
    project;
    initOptions;
    relativePaths() {
        const root = this.project.framework.coreProject.pathFor(templateFolderForArtifact(this.getCurrentArtifact()));
        const files = Helpers__NS__getFilesFrom(root, {
            recursive: true,
            followSymlinks: false,
        }).map(f => f.replace(`${crossPlatformPath(path.dirname(root))}/`, ''));
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
        const importExports = UtilsTypescript__NS__recognizeImportsFromContent(fileContent);
        for (const imp of importExports) {
            if (imp.cleanEmbeddedPathToFile.endsWith(`/${srcFromTaonImport}`)) {
                fileContent = fileContent.replace(imp.cleanEmbeddedPathToFile, imp.cleanEmbeddedPathToFile.replace(`/${srcFromTaonImport}`, websql ? `/${folderName.websql}` : `/${folderName.browser}`));
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
        const importExports = UtilsTypescript__NS__recognizeImportsFromContent(fileContent);
        for (const imp of importExports) {
            if (imp.cleanEmbeddedPathToFile.endsWith(`/${srcFromTaonImport}`)) {
                fileContent = fileContent.replace(imp.cleanEmbeddedPathToFile, imp.cleanEmbeddedPathToFile.replace(`/${srcFromTaonImport}`, `/${libFromImport}`));
            }
        }
        return fileContent;
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/__helpers__/inside-structures/structs/base-inside-struct.js.map