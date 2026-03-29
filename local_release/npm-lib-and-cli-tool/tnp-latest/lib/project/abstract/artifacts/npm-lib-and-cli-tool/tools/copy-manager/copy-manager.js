"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyManager = void 0;
const base_copy_manager_1 = require("./base-copy-manager");
class CopyManager extends base_copy_manager_1.BaseCopyManger {
    //#region static
    static for(project) {
        //#region @backendFunc
        const CopyManagerStandaloneClass = require('./copy-manager-standalone')
            .CopyManagerStandalone;
        return new CopyManagerStandaloneClass(project);
        //#endregion
    }
}
exports.CopyManager = CopyManager;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/copy-manager/copy-manager.js.map