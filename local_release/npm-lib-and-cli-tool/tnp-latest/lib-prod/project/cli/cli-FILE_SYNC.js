import { UtilsOs__NS__getRealHomeDir } from 'tnp-core/lib-prod';
import { crossPlatformPath } from 'tnp-core/lib-prod';
import { dotTaonFolder } from 'tnp-core/lib-prod';
import { HelpersTaon__NS__CLIWRAP } from 'tnp-helpers/lib-prod';
import { UtilsFileSync__NS__forFolders } from 'tnp-helpers/lib-prod';
import { BaseCli } from './base-cli';
//#endregion
// @ts-ignore TODO weird inheritance problem
class $FileSync extends BaseCli {
    async _() {
        // TODO @LAST in progress
        return;
        const [androidFolder, macPhotosLibrary, ...onlyProcessFiles] = this.args;
        await UtilsFileSync__NS__forFolders({
            androidFolder,
            macPhotosLibrary,
            onlyProcessFiles,
            tempConvertFolder: crossPlatformPath([
                UtilsOs__NS__getRealHomeDir(),
                dotTaonFolder,
                'temp-data',
                'file-sync-convert',
            ]),
        });
    }
}
export default {
    $FileSync: HelpersTaon__NS__CLIWRAP($FileSync, '$FileSync'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-FILE_SYNC.js.map