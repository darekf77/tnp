"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBrowserPathToAssetFrom = resolveBrowserPathToAssetFrom;
exports.resolvePathToAsset = resolvePathToAsset;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const constants_1 = require("../../../../../../constants");
//#endregion
//#region resolve browser path to asset
/**
 * TODO refactor and move to core project
 */
function resolveBrowserPathToAssetFrom(projectTargetOrStandalone, absolutePath) {
    //#region @backendFunc
    let resultBrowserPath = '';
    /**
     * example tmpSrcDist(Websql)/assets/assets-for/${project.name}/`
     */
    const relativePath = absolutePath.replace(`${projectTargetOrStandalone.location}/`, '');
    resultBrowserPath = `/${relativePath}`;
    resultBrowserPath = resultBrowserPath.replace(`/${constants_1.srcMainProject}/${constants_1.assetsFromSrc}/`, `/${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${projectTargetOrStandalone.name}/`);
    return resultBrowserPath;
    //#endregion
}
//#endregion
//#region resolve path to asset
/**
 * return ex.
 * my-path-to/asdasd
 * test
 */
function resolvePathToAsset(project, relativePathToLoader) {
    //#region @backendFunc
    relativePathToLoader = (0, lib_1.crossPlatformPath)(relativePathToLoader);
    const loaderRelativePath = relativePathToLoader
        .replace(/^\.\//, '')
        .replace(/^\//, '');
    let absPathToAsset = '';
    let browserPath = '';
    // stratego for normal standalone project
    absPathToAsset = (0, lib_1.crossPlatformPath)([project.location, loaderRelativePath]);
    if (!lib_2.Helpers.exists(absPathToAsset)) {
        absPathToAsset = absPathToAsset.replace(`${project.name}/${loaderRelativePath}`, loaderRelativePath);
    }
    browserPath = resolveBrowserPathToAssetFrom(project, absPathToAsset);
    return browserPath;
    //#endregion
}
//#endregion
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/__helpers__/inside-structures/structs/inside-struct-helpers.js.map