import { fileName, folderName } from 'tnp-core/lib-prod';
import { BaseFileFoldersOperations } from 'tnp-helpers/lib-prod';
import { dotVscodeMainProject, environmentsFolder, envTs, } from '../../constants';
// @ts-ignore TODO weird inheritance problem
export class FileFoldersOperations extends BaseFileFoldersOperations {
    fielsAndFoldersToCopy() {
        const original = super.fielsAndFoldersToCopy();
        return [
            ...original,
            fileName.taon_jsonc,
            `__${folderName.assets}`,
            dotVscodeMainProject,
            envTs,
            'logo.png',
            'logo.svg',
            environmentsFolder,
        ];
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/file-folders-operations.js.map