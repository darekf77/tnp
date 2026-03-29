//#endregion
//namespace CopyMangerHelpers
//#region helpers / pure child name
export function CopyMangerHelpers__NS__childPureName(child) {
    //#region @backendFunc
    return child.name.startsWith('@') ? child.name.split('/')[1] : child.name; // pure name
    //#endregion
}
//#endregion
//end of namespace CopyMangerHelpers
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/copy-manager/copy-manager-helpers.js.map