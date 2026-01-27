import { config, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { crossPlatformPath, path } from 'tnp-core/lib-prod';
import { Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC } from 'tnp-helpers/lib-prod';

import { srcFromTaonImport } from '../../../../../../constants';

import { CopyMangerHelpers__NS__childPureName } from './copy-manager-helpers';

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
          Utils__NS__escapeStringForRegEx(
            `${isomorphicPackageName}/${srcFromTaonImport}'`,
          ),
          'g',
        ),
        `${isomorphicPackageName}'`,
      );

      content = (content || '').replace(
        new RegExp(
          Utils__NS__escapeStringForRegEx(
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
          Utils__NS__escapeStringForRegEx(`import("${isomorphicPackageName}"`),
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

      Helpers__NS__log('Fixing .d.ts. files start...');
      const sourceBrowser = crossPlatformPath([
        absPathFolderLocationWithBrowserAdnWebsql,
        currentBrowserFolder,
      ]);
      this.processFolder(sourceBrowser, currentBrowserFolder);
      Helpers__NS__log('Fixing .d.ts. files done.');
    }
    //#endregion
  }

  processFolder(absPathLocation: string, currentBrowserFolder: string) {
    //#region @backendFunc
    const browserDtsFiles = Helpers__NS__filesFrom(absPathLocation, true).filter(f =>
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

    const dtsFileContent = Helpers__NS__readFile(dtsFileAbsolutePath);
    const dtsFixedContent = this.forContent(
      dtsFileContent,
      // dtsFileAbsolutePath,
      currentBrowserFolder,
    );
    if (dtsFixedContent.trim() !== dtsFileContent.trim()) {
      Helpers__NS__writeFile(dtsFileAbsolutePath, dtsFixedContent);
    }
    //#endregion
  }

  //#endregion
}