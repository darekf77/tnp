"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyMangerHelpers = void 0;
//#endregion
var CopyMangerHelpers;
(function (CopyMangerHelpers) {
    //#region helpers / pure child name
    function childPureName(child) {
        //#region @backendFunc
        return child.name.startsWith('@') ? child.name.split('/')[1] : child.name; // pure name
        //#endregion
    }
    CopyMangerHelpers.childPureName = childPureName;
    //#endregion
})(CopyMangerHelpers || (exports.CopyMangerHelpers = CopyMangerHelpers = {}));
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/copy-manager/copy-manager-helpers.js.map