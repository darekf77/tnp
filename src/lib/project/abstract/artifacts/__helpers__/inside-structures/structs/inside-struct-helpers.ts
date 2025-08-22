//#region imports
import { config } from 'tnp-config/src';
import { _, crossPlatformPath } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import type { Project } from '../../../../project';
//#endregion

//#region resolve browser path to asset
/**
 * TODO refactor and move to core project
 */
export function resolveBrowserPathToAssetFrom(
  projectTargetOrStandalone: Project,
  absolutePath: string,
) {
  //#region @backendFunc
  let resultBrowserPath = '';

  // `tmp-src-${outFolder}${websql ? '-websql' : ''}/assets/assets-for/${project.name}/`
  const relatievPath = absolutePath.replace(
    `${crossPlatformPath(projectTargetOrStandalone.location)}/`,
    '',
  );
  resultBrowserPath = `/${relatievPath}`;
  resultBrowserPath = resultBrowserPath.replace(
    `/${config.folder.src}/${config.folder.assets}/`,
    `/${config.folder.assets}/${config.folder.assets}-for/${projectTargetOrStandalone.name}/`,
  );

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
export function resolvePathToAsset(
  project: Project,
  relativePathToLoader: string | string[],
) {
  //#region @backendFunc
  relativePathToLoader = crossPlatformPath(relativePathToLoader);

  const loaderRelativePath = relativePathToLoader
    .replace(/^\.\//, '')
    .replace(/^\//, '');
  let absPathToAsset = '';
  let browserPath = '';

  // stratego for normal standalone project
  absPathToAsset = crossPlatformPath([project.location, loaderRelativePath]);
  if (!Helpers.exists(absPathToAsset)) {
    absPathToAsset = absPathToAsset.replace(
      `${project.name}/${loaderRelativePath}`,
      loaderRelativePath,
    );
  }

  browserPath = resolveBrowserPathToAssetFrom(project, absPathToAsset);

  return browserPath;
  //#endregion
}
//#endregion
