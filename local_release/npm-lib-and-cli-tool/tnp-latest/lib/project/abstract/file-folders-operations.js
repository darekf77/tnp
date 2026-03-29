"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileFoldersOperations = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
// @ts-ignore TODO weird inheritance problem
class FileFoldersOperations extends lib_2.BaseFileFoldersOperations {
    fielsAndFoldersToCopy() {
        const original = super.fielsAndFoldersToCopy();
        return [
            ...original,
            lib_1.fileName.taon_jsonc,
            `__${lib_1.folderName.assets}`,
            constants_1.dotVscodeMainProject,
            constants_1.envTs,
            'logo.png',
            'logo.svg',
            constants_1.environmentsFolder,
        ];
    }
}
exports.FileFoldersOperations = FileFoldersOperations;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/file-folders-operations.js.map