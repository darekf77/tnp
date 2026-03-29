import { BaseCopyManger } from './base-copy-manager';
export class CopyManager extends BaseCopyManger {
    //#region static
    static for(project) {
        //#region @backendFunc
        const CopyManagerStandaloneClass = require('./copy-manager-standalone')
            .CopyManagerStandalone;
        return new CopyManagerStandaloneClass(project);
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/copy-manager/copy-manager.js.map