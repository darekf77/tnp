import { config, Utils } from 'tnp-core/src';
import { crossPlatformPath, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import { srcFromTaonImport } from '../../../../../../constants';

import { CopyMangerHelpers } from './copy-manager-helpers';

export const TS_NOCHECK = '// @ts-nocheck';

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
  public static for(isomorphicPackages: string[]) {
    return new TypescriptDtsFixer(isomorphicPackages);
  }

  private constructor(protected readonly isomorphicPackages: string[] = []) {}
  //#endregion

  //#region helpers / fix dts import

  forBackendContent(content: string) {
    //#region @backendFunc
    content = content ? content : '';
    const isomorphicPackages = this.isomorphicPackages;
    for (let index = 0; index < isomorphicPackages.length; index++) {
      const isomorphicPackageName = isomorphicPackages[index];
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
    }
    return content;
    //#endregion
  }

  /**
   * browserFolder = browser websql browser-prod websql-prod
   */
  forContent(content: string, browserFolder: string) {
    //#region @backendFunc
    content = content ? content : '';

    // if(path.basename(filepath) === 'framework-context.d.ts') {
    //   debugger
    // }
    const isomorphicPackages = this.isomorphicPackages;
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
  processFolderWithBrowserWebsqlFolders(
    absPathFolderLocationWithBrowserAdnWebsql: string,
    browserwebsqlFolders: string[],
  ) {
    //#region @backendFunc
    // console.log({ absPathFolderLocation: absPathFolderLocationWithBrowserAdnWebsql })

    for (let index = 0; index < browserwebsqlFolders.length; index++) {
      const currentBrowserFolder = browserwebsqlFolders[index];

      Helpers.log('Fixing .d.ts. files start...');
      const sourceBrowser = crossPlatformPath([
        absPathFolderLocationWithBrowserAdnWebsql,
        currentBrowserFolder,
      ]);
      this.processFolder(sourceBrowser, currentBrowserFolder);
      Helpers.log('Fixing .d.ts. files done.');
    }
    //#endregion
  }

  processFolder(absPathLocation: string, currentBrowserFolder: string) {
    //#region @backendFunc
    const browserDtsFiles = Helpers.filesFrom(absPathLocation, true).filter(f =>
      f.endsWith('.d.ts'),
    );

    for (let index = 0; index < browserDtsFiles.length; index++) {
      const dtsFileAbsolutePath = browserDtsFiles[index];
      this.forFile(dtsFileAbsolutePath, currentBrowserFolder);
    }
    //#endregion
  }

  //#endregion

  //#region write fixed version of dts file
  forFile(dtsFileAbsolutePath: string, currentBrowserFolder: string) {
    //#region @backendFunc
    if (!dtsFileAbsolutePath.endsWith('.d.ts')) {
      return;
    }
    // console.log({ dtsFileAbsolutePath })

    const dtsFileContent = Helpers.readFile(dtsFileAbsolutePath);
    const dtsFixedContent = this.forContent(
      dtsFileContent,
      // dtsFileAbsolutePath,
      currentBrowserFolder,
    );
    if (dtsFixedContent.trim() !== dtsFileContent.trim()) {
      Helpers.writeFile(dtsFileAbsolutePath, dtsFixedContent);
    }
    //#endregion
  }

  //#endregion
}
