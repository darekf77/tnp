//#region imports
import { config, Utils, UtilsFilesFoldersSync } from 'tnp-core/src';
import { crossPlatformPath, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import {
  sourceLinkInNodeModules,
  srcFromTaonImport,
  TS_NOCHECK,
} from '../../../../../../constants';

import type { CopyManagerStandalone } from './copy-manager-standalone';
//#endregion

/**
 * TODO QUICK_FIX: for typescript compiler doing wrong imports/exports in d.ts files
 * example in file base context.d.ts
 * readonly __refSync: import("taon").EndpointContext;
 * instead of
 * readonly __refSync: import("taon/browser").EndpointContext;
 *
 * 1, import('') fixes for
 * - browser
 * - websql
 * 2. @dts nocheck fix at beginning
 * - browser
 * - websql
 * - nodejs
 */
export class TypescriptDtsFixer {
  //#region singleton
  public static for(copyManagerStandalone: CopyManagerStandalone) {
    return new TypescriptDtsFixer(copyManagerStandalone);
  }

  private constructor(
    protected readonly copyManagerStandalone: CopyManagerStandalone,
  ) {}
  //#endregion

  //#region helpers / fix dts import

  forBackendContent(content: string) {
    //#region @backendFunc
    content = content ? content : '';
    const isomorphicPackages =
      this.copyManagerStandalone.project.packagesRecognition
        .allIsomorphicPackagesFromMemory;

    for (let index = 0; index < isomorphicPackages.length; index++) {
      const isomorphicPackageName = isomorphicPackages[index];

      //#region replace package/src
      content = (content || '').replace(
        new RegExp(
          Utils.escapeStringForRegEx(
            `${isomorphicPackageName}/${srcFromTaonImport}'`,
          ),
          'g',
        ),
        `${isomorphicPackageName}'`,
      );

      content = (content || '').replace(
        new RegExp(
          Utils.escapeStringForRegEx(
            `${isomorphicPackageName}/${srcFromTaonImport}"`,
          ),
          'g',
        ),
        `${isomorphicPackageName}"`,
      );
      //#endregion

      //#region replace package/source
      content = (content || '').replace(
        new RegExp(
          Utils.escapeStringForRegEx(
            `${isomorphicPackageName}/${sourceLinkInNodeModules}'`,
          ),
          'g',
        ),
        `${isomorphicPackageName}'`,
      );

      content = (content || '').replace(
        new RegExp(
          Utils.escapeStringForRegEx(
            `${isomorphicPackageName}/${sourceLinkInNodeModules}"`,
          ),
          'g',
        ),
        `${isomorphicPackageName}"`,
      );
      //#endregion
    }
    return content;
    //#endregion
  }

  /**
   * browserFolder = browser websql browser-prod websql-prod
   */
  getBrowserDtsFileContentFor(content: string, browserFolder: string): string {
    //#region @backendFunc
    content = content ? content : '';

    // if(path.basename(filepath) === 'framework-context.d.ts') {
    //   debugger
    // }
    const isomorphicPackages =
      this.copyManagerStandalone.project.packagesRecognition
        .allIsomorphicPackagesFromMemory;

    for (let index = 0; index < isomorphicPackages.length; index++) {
      const isomorphicPackageName = isomorphicPackages[index];
      content = (content || '').replace(
        new RegExp(
          Utils.escapeStringForRegEx(`import("${isomorphicPackageName}"`),
          'g',
        ),
        `import("${isomorphicPackageName}/${browserFolder}"`,
      );
    }

    if (!content.trimLeft().startsWith(TS_NOCHECK)) {
      content = `${TS_NOCHECK}\n${content}`;
    }

    return content;
    //#endregion
  }
  //#endregion

  //#region helpers / fix d.ts import files in folder
  /**
   *  fixing d.ts for (dist)/(browser|websql) when destination local project
   * @param absPathFolderLocationWithBrowserAdnWebsql usually dist
   * @param isTempLocalProj
   */
  public processFolderWithBrowserWebsqlFolders(
    absPathFolderLocationWithBrowserAdnWebsql: string,
    browserwebsqlFolders: string[],
  ): void {
    //#region @backendFunc
    // console.log({ absPathFolderLocation: absPathFolderLocationWithBrowserAdnWebsql })

    for (let index = 0; index < browserwebsqlFolders.length; index++) {
      const currentBrowserFolder = browserwebsqlFolders[index];

      Helpers.log('Fixing .d.ts. files start...');
      const sourceBrowser = crossPlatformPath([
        absPathFolderLocationWithBrowserAdnWebsql,
        currentBrowserFolder,
      ]);
      this.processBrowserCodeFolder(sourceBrowser, currentBrowserFolder);
      Helpers.log('Fixing .d.ts. files done.');
    }
    //#endregion
  }

  private processBrowserCodeFolder(
    absPathLocation: string,
    currentBrowserFolder: string,
  ): void {
    //#region @backendFunc
    const browserDtsFiles = UtilsFilesFoldersSync.getFilesFrom(
      absPathLocation,
      {
        recursive: true,
      },
    ).filter(f => f.endsWith('.d.ts'));

    for (let index = 0; index < browserDtsFiles.length; index++) {
      const dtsFileAbsolutePath = browserDtsFiles[index];
      this.saveBrowserDtsContentFor(dtsFileAbsolutePath, currentBrowserFolder);
    }
    //#endregion
  }

  //#endregion

  //#region write fixed version of dts file
  private saveBrowserDtsContentFor(
    dtsFileAbsolutePath: string,
    currentBrowserFolder: string,
  ): void {
    //#region @backendFunc
    if (!dtsFileAbsolutePath.endsWith('.d.ts')) {
      return;
    }
    // console.log({ dtsFileAbsolutePath })

    const dtsFileContent = UtilsFilesFoldersSync.readFile(dtsFileAbsolutePath);
    const dtsFixedContent = this.getBrowserDtsFileContentFor(
      dtsFileContent,
      // dtsFileAbsolutePath,
      currentBrowserFolder,
    );
    if (dtsFixedContent.trim() !== dtsFileContent.trim()) {
      UtilsFilesFoldersSync.writeFile(dtsFileAbsolutePath, dtsFixedContent);
    }
    //#endregion
  }

  //#endregion

  //#region fix d.ts import with wrong package names
  public fixDtsImportsWithWronPackageName(
    absOrgFilePathInDist: string,
    destinationFilePath: string,
    browserwebsqlFolders: string[],
  ): void {
    //#region @backendFunc
    if (absOrgFilePathInDist.endsWith('.d.ts')) {
      const contentToWriteInDestination =
        UtilsFilesFoldersSync.readFile(absOrgFilePathInDist) || '';

      for (let index = 0; index < browserwebsqlFolders.length; index++) {
        const currentBrowserFolder = browserwebsqlFolders[index];
        const newContent = this.getBrowserDtsFileContentFor(
          contentToWriteInDestination,
          // sourceFile,
          currentBrowserFolder,
        );
        if (newContent !== contentToWriteInDestination) {
          UtilsFilesFoldersSync.writeFile(destinationFilePath, newContent);
        }
      }
    }
    //#endregion
  }
  //#endregion
}
