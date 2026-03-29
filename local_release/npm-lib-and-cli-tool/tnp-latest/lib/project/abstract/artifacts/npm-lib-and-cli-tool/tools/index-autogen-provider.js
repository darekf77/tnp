"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexAutogenProvider = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const lib_4 = require("tnp-helpers/lib");
const constants_1 = require("../../../../../constants");
// @ts-ignore TODO weird inheritance problem
class IndexAutogenProvider extends lib_4.BaseCompilerForProject {
    propertyInTaonJsonc = 'shouldGenerateAutogenIndexFile';
    //#region @backend
    constructor(project) {
        super(project, {
            folderPath: project.pathFor([constants_1.srcMainProject, constants_1.libFromSrc]),
            subscribeOnlyFor: ['ts', 'tsx'],
            taskName: 'IndexAutogenProvider',
        });
    }
    //#endregion
    get indexAutogenFileRelativePath() {
        //#region @backendFunc
        return (0, lib_2.crossPlatformPath)([
            constants_1.srcMainProject,
            constants_1.libFromSrc,
            constants_1.TaonGeneratedFiles.index_generated_ts,
        ]);
        //#endregion
    }
    exportsToSave = [];
    processFile(absFilePath) {
        //#region @backendFunc
        if (!lib_2.Helpers.isFolder(absFilePath)) {
            const exportsFounded = lib_3.UtilsTypescript.exportsFromFile(absFilePath);
            const relativePath = absFilePath.replace(this.project.pathFor([constants_1.srcMainProject, constants_1.libFromSrc]) + '/', '');
            if (relativePath.startsWith(constants_1.migrationsFromLib)) {
                return;
            }
            // TODO @LAST this is not watching files!
            // console.log(`Processing file for index autogen: ${relativePath}`);
            const isBrowserSpecific = lib_1.frontendFiles.some(ext => relativePath.endsWith(ext));
            const exportString = `export * from ` +
                `'./${relativePath.replace(lib_2.path.extname(relativePath), '')}'; ` +
                `${isBrowserSpecific ? `// @${'bro' + 'wser'}` : ''}`;
            if (exportsFounded.length > 0) {
                if (!this.exportsToSave.includes(exportString) &&
                    !relativePath.startsWith(`${constants_1.TaonGeneratedFolders.ENV_FOLDER}/`) &&
                    !relativePath.startsWith(`${constants_1.indexTsFromLibFromSrc}`)) {
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
                `\n// in ${constants_1.taonJsonMainProject} to enable ts exports auto generation.`
            : `This disable this auto generate file.` +
                `\n// set property "${this.propertyInTaonJsonc}: false" ` +
                `\n// in ${constants_1.taonJsonMainProject} of your project.`} \n` + this.exportsToSave.join('\n'));
        //#endregion
    }
    async syncAction(absolteFilesPathes, initialParams) {
        //#region @backendFunc
        lib_2.Helpers.logInfo(`IndexAutogenProvider for project: ${this.project.genericName}`);
        // console.log(`Generating index autogen file...`, { absolteFilesPathes });
        for (const absFilePath of absolteFilesPathes) {
            this.processFile(absFilePath);
        }
        this.writeIndexFile();
        lib_2.Helpers.taskDone(`IndexAutogenProvider for project: ${this.project.genericName}`);
        //#endregion
    }
}
exports.IndexAutogenProvider = IndexAutogenProvider;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/index-autogen-provider.js.map