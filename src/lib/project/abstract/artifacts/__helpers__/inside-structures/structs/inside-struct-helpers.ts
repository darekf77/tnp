//#region imports
import { config } from 'tnp-config/src';
import { _, crossPlatformPath, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import {
  DOCKER_COMPOSE_FILE_NAME,
  DOCKER_FOLDER,
  THIS_IS_GENERATED_INFO_COMMENT,
} from '../../../../../../constants';
import { EnvOptions } from '../../../../../../options';
import { EXPORT_TEMPLATE } from '../../../../../../templates';
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

//#region recreate index.ts file
export function recreateIndex(project: Project) {
  //#region @backendFunc

  const indexInSrcFile = crossPlatformPath(
    path.join(project.location, config.folder.src, config.file.index_ts),
  );

  if (!Helpers.exists(indexInSrcFile)) {
    Helpers.writeFile(indexInSrcFile, EXPORT_TEMPLATE('lib'));
  }
  //#endregion
}
//#endregion

//#region recreate app
export function recreateApp(project: Project, initOptions: EnvOptions): void {
  //#region @backendFunc

  if (!project.framework.isCoreProject) {
    project.framework.recreateFileFromCoreProject({
      fileRelativePath: [config.folder.src, 'app.ts'],
    });

    project.framework.recreateFileFromCoreProject({
      fileRelativePath: [config.folder.src, 'global.scss'],
    });

    project.framework.recreateFileFromCoreProject({
      fileRelativePath: [config.folder.src, 'app.electron.ts'],
    });

    //#region recreate vars.scss file
    // TODO QUICK_FIX this will work in app - only if app is build with same base-href
    project.writeFile(
      'src/vars.scss',
      `${THIS_IS_GENERATED_INFO_COMMENT}
// CORE ASSETS BASENAME - use it only for asset from core container
$basename: '${
        (initOptions.build.baseHref?.startsWith('./')
          ? initOptions.build.baseHref.replace('./', '/')
          : initOptions.build.baseHref) || '/'
      }';
$website_title: '${initOptions.website.title}';
$website_domain: '${initOptions.website.domain}';
$project_npm_name: '${project.nameForNpmPackage}';
${THIS_IS_GENERATED_INFO_COMMENT}
`,
    );
    //#endregion
  }

  //#endregion
}
//#endregion
