import { crossPlatformPath } from 'tnp-core/lib-prod';
import { Helpers__NS__exists } from 'tnp-helpers/lib-prod';
import { assetsFor, assetsFromSrc, srcMainProject, } from '../../../../../../constants';
//#endregion
//#region resolve browser path to asset
/**
 * TODO refactor and move to core project
 */
export function resolveBrowserPathToAssetFrom(projectTargetOrStandalone, absolutePath) {
    //#region @backendFunc
    let resultBrowserPath = '';
    /**
     * example tmpSrcDist(Websql)/assets/assets-for/${project.name}/`
     */
    const relativePath = absolutePath.replace(`${projectTargetOrStandalone.location}/`, '');
    resultBrowserPath = `/${relativePath}`;
    resultBrowserPath = resultBrowserPath.replace(`/${srcMainProject}/${assetsFromSrc}/`, `/${assetsFromSrc}/${assetsFor}/${projectTargetOrStandalone.name}/`);
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
export function resolvePathToAsset(project, relativePathToLoader) {
    //#region @backendFunc
    relativePathToLoader = crossPlatformPath(relativePathToLoader);
    const loaderRelativePath = relativePathToLoader
        .replace(/^\.\//, '')
        .replace(/^\//, '');
    let absPathToAsset = '';
    let browserPath = '';
    // stratego for normal standalone project
    absPathToAsset = crossPlatformPath([project.location, loaderRelativePath]);
    if (!Helpers__NS__exists(absPathToAsset)) {
        absPathToAsset = absPathToAsset.replace(`${project.name}/${loaderRelativePath}`, loaderRelativePath);
    }
    browserPath = resolveBrowserPathToAssetFrom(project, absPathToAsset);
    return browserPath;
    //#endregion
}
//#endregion
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/__helpers__/inside-structures/structs/inside-struct-helpers.js.map