import { frontendFiles, } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, Helpers__NS__isFolder, Helpers__NS__logInfo, Helpers__NS__taskDone } from 'tnp-core/lib-prod';
import { UtilsTypescript__NS__exportsFromFile } from 'tnp-helpers/lib-prod';
import { BaseCompilerForProject } from 'tnp-helpers/lib-prod';
import { indexTsFromLibFromSrc, libFromSrc, migrationsFromLib, srcMainProject, TaonGeneratedFiles, TaonGeneratedFolders, taonJsonMainProject, } from '../../../../../constants';
// @ts-ignore TODO weird inheritance problem
export class IndexAutogenProvider extends BaseCompilerForProject {
    propertyInTaonJsonc = 'shouldGenerateAutogenIndexFile';
    //#region @backend
    constructor(project) {
        super(project, {
            folderPath: project.pathFor([srcMainProject, libFromSrc]),
            subscribeOnlyFor: ['ts', 'tsx'],
            taskName: 'IndexAutogenProvider',
        });
    }
    //#endregion
    get indexAutogenFileRelativePath() {
        //#region @backendFunc
        return crossPlatformPath([
            srcMainProject,
            libFromSrc,
            TaonGeneratedFiles.index_generated_ts,
        ]);
        //#endregion
    }
    exportsToSave = [];
    processFile(absFilePath) {
        //#region @backendFunc
        if (!Helpers__NS__isFolder(absFilePath)) {
            const exportsFounded = UtilsTypescript__NS__exportsFromFile(absFilePath);
            const relativePath = absFilePath.replace(this.project.pathFor([srcMainProject, libFromSrc]) + '/', '');
            if (relativePath.startsWith(migrationsFromLib)) {
                return;
            }
            // TODO @LAST this is not watching files!
            // console.log(`Processing file for index autogen: ${relativePath}`);
            const isBrowserSpecific = frontendFiles.some(ext => relativePath.endsWith(ext));
            const exportString = `export * from ` +
                `'./${relativePath.replace(path.extname(relativePath), '')}'; ` +
                `${isBrowserSpecific ? `// @${'bro' + 'wser'}` : ''}`;
            if (exportsFounded.length > 0) {
                if (!this.exportsToSave.includes(exportString) &&
                    !relativePath.startsWith(`${TaonGeneratedFolders.ENV_FOLDER}/`) &&
                    !relativePath.startsWith(`${indexTsFromLibFromSrc}`)) {
                    this.exportsToSave.push(exportString);
                }
            }
            else {
                this.exportsToSave = this.exportsToSave.filter(e => e !== exportString);
            }
        }
        //#endregion
    }
    writeIndexFile(isPlaceholderOnly = false) {
        //#region @backendFunc
        this.project.writeFile(this.indexAutogenFileRelativePath, `// @ts-no${'check'}
// This file is auto-generated during init process. Do not modify.
// ${isPlaceholderOnly
            ? `This is only placeholder.` +
                `\n// Use property "${this.propertyInTaonJsonc}: true" ` +
                `\n// in ${taonJsonMainProject} to enable ts exports auto generation.`
            : `This disable this auto generate file.` +
                `\n// set property "${this.propertyInTaonJsonc}: false" ` +
                `\n// in ${taonJsonMainProject} of your project.`} \n` + this.exportsToSave.join('\n'));
        //#endregion
    }
    async syncAction(absolteFilesPathes, initialParams) {
        //#region @backendFunc
        Helpers__NS__logInfo(`IndexAutogenProvider for project: ${this.project.genericName}`);
        // console.log(`Generating index autogen file...`, { absolteFilesPathes });
        for (const absFilePath of absolteFilesPathes) {
            this.processFile(absFilePath);
        }
        this.writeIndexFile();
        Helpers__NS__taskDone(`IndexAutogenProvider for project: ${this.project.genericName}`);
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/index-autogen-provider.js.map