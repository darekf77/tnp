"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const lib_5 = require("tnp-helpers/lib");
const base_cli_1 = require("./base-cli");
//#endregion
// @ts-ignore TODO weird inheritance problem
class $FileSync extends base_cli_1.BaseCli {
    async _() {
        // TODO @LAST in progress
        return;
        const [androidFolder, macPhotosLibrary, ...onlyProcessFiles] = this.args;
        await lib_5.UtilsFileSync.forFolders({
            androidFolder,
            macPhotosLibrary,
            onlyProcessFiles,
            tempConvertFolder: (0, lib_2.crossPlatformPath)([
                lib_1.UtilsOs.getRealHomeDir(),
                lib_3.dotTaonFolder,
                'temp-data',
                'file-sync-convert',
            ]),
        });
    }
}
exports.default = {
    $FileSync: lib_4.HelpersTaon.CLIWRAP($FileSync, '$FileSync'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-FILE_SYNC.js.map