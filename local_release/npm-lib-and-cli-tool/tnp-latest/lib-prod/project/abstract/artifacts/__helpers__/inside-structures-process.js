//#region imports
import { config, fse } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, ___NS__isFunction } from 'tnp-core/lib-prod';
import { Helpers__NS__createSymLink, Helpers__NS__isFolder, Helpers__NS__isUnexistedLink, Helpers__NS__remove, Helpers__NS__removeFileIfExists, Helpers__NS__warn, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__resolve } from 'tnp-helpers/lib-prod';
import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';
//#endregion
const clearUnexistedLinks = (pathToClear) => {
    pathToClear = crossPlatformPath(pathToClear) || '';
    const orgPath = pathToClear;
    const splited = pathToClear.split('/');
    let previous;
    do {
        splited.pop();
        var pathDir = splited.join('/');
        if (pathDir === previous) {
            return orgPath;
        }
        if (Helpers__NS__isUnexistedLink(pathDir)) {
            Helpers__NS__removeFileIfExists(pathDir);
            return orgPath;
        }
        previous = pathDir;
    } while (!!pathDir);
    return orgPath;
};
// @ts-ignore TODO weird inheritance problem
export class InsideStructuresProcess extends BaseFeatureForProject {
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
                    from = crossPlatformPath([this.project.location, replacement(from)]);
                    let to = fun2(opt);
                    to = crossPlatformPath([this.project.location, replacement(to)]);
                    if (!to || !from || to === from) {
                        continue;
                    }
                    try {
                        fse.unlinkSync(to);
                    }
                    catch (error) { }
                }
            }
            //#region copying files
            if (struct?.relateivePathesFromContainer) {
                [...struct.relateivePathesFromContainer].forEach(f => {
                    const orgPath = crossPlatformPath(HelpersTaon__NS__resolve(path.join(struct.project.framework.coreProject.location, f)));
                    const destPath = clearUnexistedLinks(crossPlatformPath([this.project.location, replacement(f)]));
                    if (orgPath !== destPath) {
                        if (Helpers__NS__isFolder(orgPath)) {
                            HelpersTaon__NS__copy(orgPath, destPath);
                        }
                        else {
                            HelpersTaon__NS__copyFile(orgPath, destPath);
                        }
                    }
                    else {
                        Helpers__NS__warn(`${config.frameworkName} [initAngularAppStructure] trying to copy same thing:
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
                    const destPath = crossPlatformPath([
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
                    from = crossPlatformPath([this.project.location, replacement(from)]);
                    let to = fun2(opt);
                    to = crossPlatformPath([this.project.location, replacement(to)]);
                    if (!to || !from || to === from) {
                        continue;
                    }
                    // console.log({
                    //   from,
                    //   to,
                    // });
                    Helpers__NS__remove(to);
                    Helpers__NS__createSymLink(from, to, {
                        continueWhenExistedFolderDoesntExists: true,
                    });
                }
            }
            //#endregion
            //#region execute end function
            if (___NS__isFunction(struct?.endAction)) {
                await struct.endAction(opt);
            }
            //#endregion
        }
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/__helpers__/inside-structures-process.js.map