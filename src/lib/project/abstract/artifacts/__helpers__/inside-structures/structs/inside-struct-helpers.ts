//#region imports
import { config } from 'tnp-config/src';
import { _, crossPlatformPath, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import { THIS_IS_GENERATED_INFO_COMMENT } from '../../../../../../constants';
import { EnvOptions } from '../../../../../../options';
import { EXPORT_TEMPLATE } from '../../../../../../templates';
import type { Project } from '../../../../project';
//#endregion

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

/**
 * return ex.
 * my-path-to/asdasd
 * test
 */
export function resolvePathToAsset(
  project: Project,
  relativePathToLoader: string,
) {
  //#region @backendFunc
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

export function recreateApp(project: Project, initOptions: EnvOptions): void {
  //#region @backendFunc
  //#region when app.ts or app is not available is not

  const appFile = crossPlatformPath(
    path.join(project.location, config.folder.src, 'app.ts'),
  );

  const appElectornFile = crossPlatformPath(
    path.join(project.location, config.folder.src, 'app.electron.ts'),
  );

  const appHostsFile = crossPlatformPath(
    path.join(project.location, config.folder.src, 'app.hosts.ts'),
  );

  const appFolderWithIndex = crossPlatformPath(
    path.join(project.location, config.folder.src, 'app', 'index.ts'),
  );

  const globaScss = crossPlatformPath(
    path.join(project.location, config.folder.src, 'global.scss'),
  );

  if (!project.framework.isCoreProject) {
    if (
      !Helpers.exists(appFile)
      // && !Helpers.exists(appFolderWithIndex)
    ) {
      Helpers.writeFile(appFile, appfileTemplate(project));
    } else {
      const content = Helpers.readFile(appFile);
      const fixedContent = fixCoreContent(content, project);
      Helpers.writeFile(appFile, fixedContent);
    }

    if (
      !Helpers.exists(globaScss)
      // && !Helpers.exists(appFolderWithIndex)
    ) {
      const coreGlobalScss =
        project.framework.coreProject.readFile('src/global.scss');
      Helpers.writeFile(globaScss, coreGlobalScss);
    }

    if (
      !Helpers.exists(appElectornFile)
      // && !Helpers.exists(appFolderWithIndex) // TODO @QUESTION why not to remove this
    ) {
      Helpers.writeFile(appElectornFile, appElectronTemplate(project));
    }

    // TODO QUICK_FIX this will work in app - only if app is build with same base-href
    project.writeFile(
      'src/vars.scss',
      `${THIS_IS_GENERATED_INFO_COMMENT}
// CORE ASSETS BASENAME - use it only for asset from core container
$basename: '${
        initOptions.build.baseHref?.startsWith('./')
          ? initOptions.build.baseHref.replace('./', '/')
          : initOptions.build.baseHref
      }';
$website_title: '${initOptions.website.title}';
$website_domain: '${initOptions.website.domain}';
$project_npm_name: '${project.nameForNpmPackage}';
${THIS_IS_GENERATED_INFO_COMMENT}
`,
    );
  }

  if (
    !Helpers.exists(appHostsFile)
    // && !Helpers.exists(appFolderWithIndex) // TODO @QUESTION why not to remove this
  ) {
    project.artifactsManager.artifact.angularNodeApp.writePortsToFile();
  }

  //#endregion
  //#endregion
}

export function appfileTemplate(project: Project): string {
  //#region @backendFunc

  // TODO quick fix for @ browser remover
  const content = project.framework.coreProject.readFile('src/app.ts');

  return fixCoreContent(content, project);
  //#endregion
}

export function fixCoreContent(appTsContent: string, project: Project): string {
  const coreName = _.upperFirst(_.camelCase(project.name));
  const coreNameKebab = _.kebabCase(project.name);
  return appTsContent
    .replace(
      new RegExp(
        `IsomorphicLibV${project.framework.frameworkVersion.replace('v', '')}`,
        'g',
      ),
      `${coreName}`,
    )
    .replace(
      new RegExp(
        `isomorphic-lib-v${project.framework.frameworkVersion.replace('v', '')}`,
        'g',
      ),
      `${coreNameKebab}`,
    );
}

export function appElectronTemplate(project: Project): string {
  //#region @backendFunc
  const content = project.framework.coreProject.readFile('src/app.electron.ts');
  return content;
  //#endregion
}
