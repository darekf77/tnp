"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsideStructuresProcess = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const lib_4 = require("tnp-helpers/lib");
//#endregion
const clearUnexistedLinks = (pathToClear) => {
    pathToClear = (0, lib_2.crossPlatformPath)(pathToClear) || '';
    const orgPath = pathToClear;
    const splited = pathToClear.split('/');
    let previous;
    do {
        splited.pop();
        var pathDir = splited.join('/');
        if (pathDir === previous) {
            return orgPath;
        }
        if (lib_3.Helpers.isUnexistedLink(pathDir)) {
            lib_3.Helpers.removeFileIfExists(pathDir);
            return orgPath;
        }
        previous = pathDir;
    } while (!!pathDir);
    return orgPath;
};
// @ts-ignore TODO weird inheritance problem
class InsideStructuresProcess extends lib_4.BaseFeatureForProject {
    async process(structs, initOptions) {
        //#region @backendFunc
        for (let indexOuter = 0; indexOuter < structs.length; indexOuter++) {
            const insideStruct = structs[indexOuter];
            if (!insideStruct) {
                continue;
            }
            const struct = insideStruct.insideStruct();
            const opt = {};
            const replacement = pathOrg => {
                const replacedPart = struct.pathReplacements.reduce((a, b) => {
                    return pathOrg.replace(b[0], b[1](opt));
                }, pathOrg);
                return replacedPart;
            };
            opt.replacement = replacement;
            if (Array.isArray(struct?.linksFuncs)) {
                for (let index = 0; index < struct.linksFuncs.length; index++) {
                    const [fun1, fun2] = struct.linksFuncs[index];
                    let from = fun1(opt);
                    from = (0, lib_2.crossPlatformPath)([this.project.location, replacement(from)]);
                    let to = fun2(opt);
                    to = (0, lib_2.crossPlatformPath)([this.project.location, replacement(to)]);
                    if (!to || !from || to === from) {
                        continue;
                    }
                    try {
                        lib_1.fse.unlinkSync(to);
                    }
                    catch (error) { }
                }
            }
            //#region copying files
            if (struct?.relateivePathesFromContainer) {
                [...struct.relateivePathesFromContainer].forEach(f => {
                    const orgPath = (0, lib_2.crossPlatformPath)(lib_3.HelpersTaon.resolve(lib_2.path.join(struct.project.framework.coreProject.location, f)));
                    const destPath = clearUnexistedLinks((0, lib_2.crossPlatformPath)([this.project.location, replacement(f)]));
                    if (orgPath !== destPath) {
                        if (lib_3.Helpers.isFolder(orgPath)) {
                            lib_3.HelpersTaon.copy(orgPath, destPath);
                        }
                        else {
                            lib_3.HelpersTaon.copyFile(orgPath, destPath);
                        }
                    }
                    else {
                        lib_3.Helpers.warn(`${lib_1.config.frameworkName} [initAngularAppStructure] trying to copy same thing:
              ${orgPath}
              `);
                    }
                });
            }
            //#endregion
            //#region linking node_modules
            if (struct?.linkNodeModulesTo && !initOptions.init.struct) {
                for (let index = 0; index < struct.linkNodeModulesTo.length; index++) {
                    const f = struct.linkNodeModulesTo[index];
                    const destPath = (0, lib_2.crossPlatformPath)([
                        this.project.location,
                        replacement(f),
                    ]);
                    this.project.nodeModules.linkToLocation(destPath);
                }
            }
            //#endregion
            //#region linking files and folders
            if (Array.isArray(struct?.linksFuncs)) {
                for (let index = 0; index < struct.linksFuncs.length; index++) {
                    const [fun1, fun2] = struct.linksFuncs[index];
                    let from = fun1(opt);
                    from = (0, lib_2.crossPlatformPath)([this.project.location, replacement(from)]);
                    let to = fun2(opt);
                    to = (0, lib_2.crossPlatformPath)([this.project.location, replacement(to)]);
                    if (!to || !from || to === from) {
                        continue;
                    }
                    // console.log({
                    //   from,
                    //   to,
                    // });
                    lib_3.Helpers.remove(to);
                    lib_3.Helpers.createSymLink(from, to, {
                        continueWhenExistedFolderDoesntExists: true,
                    });
                }
            }
            //#endregion
            //#region execute end function
            if (lib_2._.isFunction(struct?.endAction)) {
                await struct.endAction(opt);
            }
            //#endregion
        }
        //#endregion
    }
}
exports.InsideStructuresProcess = InsideStructuresProcess;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/__helpers__/inside-structures-process.js.map