import { crossPlatformPath, fse, path, LibTypeEnum, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds, UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor } from 'tnp-core/lib-prod';
import { CommandType } from 'tnp-helpers/lib-prod';
import type { Uri } from 'vscode';

import { dirnameFromSourceToProject, whatToLinkFromCore } from './constants';
import { Project } from './project/abstract/project';

interface CopyPasteTaonProjectJson {
  toCopy?: string;
  toMove?: string;
}

export const vscodeExtMethods = (FRAMEWORK_NAME: string): CommandType[] => {
  //#region @backendFunc
  const toolName = `${FRAMEWORK_NAME.toUpperCase()} CLI `;
  const group = `${toolName}`;
  const groupOpen = `${toolName} open`;
  const groupGENERATE = `${toolName} generate`;
  const groupRefactor = `${toolName} refactor`;
  const groupGroupOperations = `${toolName} projects operations`;
  // const groupTempFiles = `${toolName} temporary files`;
  // const groupOpen = `${toolName} open`;

  const taonHomeDirForCopyPathJson = crossPlatformPath([
    UtilsOs__NS__getRealHomeDir(),
    `.taon/vscode-copy-buffor/path.json`,
  ]);
  if (!Helpers__NS__exists(path.dirname(taonHomeDirForCopyPathJson))) {
    Helpers__NS__mkdirp(path.dirname(taonHomeDirForCopyPathJson));
  }
  if (!Helpers__NS__exists(taonHomeDirForCopyPathJson)) {
    Helpers__NS__writeJson(taonHomeDirForCopyPathJson, {});
  }

  //#region copy or cut project
  const copyOrCutProject = async (
    action: keyof CopyPasteTaonProjectJson,
    vscode: typeof import('vscode'),
    uri: Uri,
  ): Promise<void> => {
    //#region @backendFunc

    const WORKSPACE_MAIN_FOLDER_PATH = crossPlatformPath(uri.path);

    const nearestProject = Project.ins.From(WORKSPACE_MAIN_FOLDER_PATH);
    if (!nearestProject) {
      vscode.window.showErrorMessage(
        `Cannot find project nearest project in path ${WORKSPACE_MAIN_FOLDER_PATH}`,
      );
      return;
    }
    if (!Helpers__NS__exists(taonHomeDirForCopyPathJson)) {
      Helpers__NS__writeJson(taonHomeDirForCopyPathJson, {});
    }
    const currentContent = Helpers__NS__readJson(
      taonHomeDirForCopyPathJson,
    ) as CopyPasteTaonProjectJson;

    const resultContent = ___NS__merge(currentContent, {
      [action]: nearestProject.location,
    } as CopyPasteTaonProjectJson);

    if (action === 'toCopy') {
      delete resultContent.toMove;
    }
    if (action === 'toMove') {
      delete resultContent.toCopy;
    }

    Helpers__NS__writeJson(taonHomeDirForCopyPathJson, resultContent);
    vscode.window.showInformationMessage(`
            Path ${nearestProject.location} saved ${___NS__startCase(action)?.toLowerCase()} .
            `);

    //#endregion
  };
  //#endregion

  return (
    [
      //#region COPY/CUT PASTE PROJECT
      // {
      //   group: groupGroupOperations,
      //   title: `init project`,
      //   options: {
      //     // showSuccessMessage: false,
      //   },
      //   async exec({ vscode, uri }) {
      //     const nearestProject = Project.ins.From(crossPlatformPath(uri.path));
      //     await nearestProject?.init();
      //   },
      // },
      // {
      //   group: groupGroupOperations,
      //   title: `refresh project`,
      //   options: {
      //     // showSuccessMessage: false,
      //   },
      //   async exec({ vscode, uri }) {
      //     const nearestProject = Project.ins.From(crossPlatformPath(uri.path));
      //     await nearestProject?.refreshChildrenProjects();
      //   },
      // },
      {
        group: groupGroupOperations,
        title: `copy project`,
        options: {
          showSuccessMessage: false,
        },
        async exec({ vscode, uri }) {
          await copyOrCutProject('toCopy', vscode, uri);
        },
      },
      {
        group: groupGroupOperations,
        title: `cut project`,
        options: {
          showSuccessMessage: false,
        },
        async exec({ vscode, uri }) {
          await copyOrCutProject('toMove', vscode, uri);
        },
      },
      //#endregion

      //#region PASTE PROJECT
      {
        group: groupGroupOperations,
        options: {
          showSuccessMessage: false,
        },
        title: `paste project`,
        async exec({ vscode, uri, rootFolderPath }) {
          //#region @backendFunc

          let MAIN_CLICKED_PATH =
            crossPlatformPath(uri.path) || crossPlatformPath(rootFolderPath);
          if (!MAIN_CLICKED_PATH) {
            return;
          }
          if (!Helpers__NS__isFolder(MAIN_CLICKED_PATH)) {
            MAIN_CLICKED_PATH = crossPlatformPath(
              path.dirname(MAIN_CLICKED_PATH),
            );
          }

          if (!Helpers__NS__exists(taonHomeDirForCopyPathJson)) {
            Helpers__NS__writeJson(taonHomeDirForCopyPathJson, {});
          }
          const currentContent = Helpers__NS__readJson(
            taonHomeDirForCopyPathJson,
          ) as CopyPasteTaonProjectJson;

          const copyOrMove = async (action: keyof CopyPasteTaonProjectJson) => {
            const copyOrMoveSource = Project.ins.nearestTo(
              currentContent[action],
            );
            if (!copyOrMoveSource) {
              vscode.window.showErrorMessage(
                `Cannot find project in path ${currentContent[action]}`,
              );
              return;
            }
            if (action === 'toMove') {
              await copyOrMoveSource.fileFoldersOperations.moveProjectTo(
                MAIN_CLICKED_PATH,
              );
            } else if (action === 'toCopy') {
              await copyOrMoveSource.fileFoldersOperations.copyProjectTo(
                MAIN_CLICKED_PATH,
              );
            } else {
              vscode.window.showWarningMessage(`NOTHING TO PASTE!`);
              return;
            }

            //#region refresh projects in container
            const mainProj = Project.ins.From(MAIN_CLICKED_PATH);
            if (mainProj) {
              try {
                await mainProj.refreshChildrenProjects();
              } catch (error) {}
            }
            //#endregion

            //#region init copied project
            const destProj = Project.ins.From([
              MAIN_CLICKED_PATH,
              copyOrMoveSource.basename,
            ]);
            if (destProj) {
              try {
                destProj.run(`${FRAMEWORK_NAME.toLowerCase()} init`).sync();
              } catch (error) {}
            }
            //#endregion

            Helpers__NS__writeJson(taonHomeDirForCopyPathJson, {});
            const actionName = action === 'toCopy' ? 'copied' : 'moved';
            vscode.window.showInformationMessage(`Done ${actionName}!`);
          };

          if (currentContent.toCopy) {
            await copyOrMove('toCopy');
          } else if (currentContent.toMove) {
            await copyOrMove('toMove');
          } else {
            vscode.window.showWarningMessage(`NOTHING TO PASTE!`);
            return;
          }
          //#endregion
        },
      },
      //#endregion

      //#region OPEN DEBUGGABLE PATH
      {
        group: null,
        title: `${toolName} open debuggable path`,
        async exec({ vscode }) {
          // opt.vscode.
          const editorOrgFilePath = crossPlatformPath(
            vscode.window.activeTextEditor.document.uri.fsPath,
          );
          let currentFilePath = editorOrgFilePath;
          let relativePath: string = '';
          let projectRoot = '';
          while (true) {
            currentFilePath = crossPlatformPath(path.dirname(currentFilePath));
            if (
              currentFilePath === '/' ||
              !currentFilePath ||
              currentFilePath.length < 3
            ) {
              break;
            }
            if (Helpers__NS__isUnexistedLink(currentFilePath)) {
              break;
            }
            if (fse.lstatSync(currentFilePath).isSymbolicLink()) {
              projectRoot = dirnameFromSourceToProject(currentFilePath);
              relativePath = crossPlatformPath([
                whatToLinkFromCore,
                editorOrgFilePath.replace(currentFilePath + '/', ''),
              ]);
              break;
            }
          }

          const targetPath = crossPlatformPath([projectRoot, relativePath]);

          // now close the original file if it's open
          const unwantedUri = vscode.Uri.file(editorOrgFilePath);
          const editors = vscode.window.visibleTextEditors;
          const unwantedEditorPath = crossPlatformPath(unwantedUri.fsPath);

          for (const editor of editors) {
            const editorPath = crossPlatformPath(editor.document.uri.fsPath);

            if (editorPath === unwantedEditorPath) {
              await vscode.window.showTextDocument(editor.document); // bring it to front
              await vscode.commands.executeCommand(
                'workbench.action.closeActiveEditor',
              );
            }
          }

          const doc = await vscode.workspace.openTextDocument(targetPath);
          await vscode.window.showTextDocument(doc);
        },
        options: {
          titleWhenProcessing: `taon opening debuggable version of file.`,
        },
      },
      //#endregion

      //#region OPEN WORKBENCH PATH
      {
        group: null,
        title: `${toolName} OPEN NEW WORKBENCH HERE`,
        async exec({ vscode, uri }) {
          // Fallback: invoked from editor / command palette
          if (!uri && vscode.window.activeTextEditor) {
            uri = vscode.window.activeTextEditor.document.uri;
          }

          if (!uri) {
            vscode.window.showErrorMessage('No file or folder context found');
            return;
          }

          let fsPath = uri.fsPath;

          // If file → use its directory
          let stat = fse.lstatSync(fsPath);

          if (stat.isSymbolicLink()) {
            fsPath = fse.realpathSync(fsPath);
          }
          stat = fse.lstatSync(fsPath);

          if (!stat.isDirectory()) {
            fsPath = path.dirname(fsPath);
          }

          // Resolve symlinks (real path)

          const finalUri = vscode.Uri.file(fsPath);

          await vscode.commands.executeCommand(
            'vscode.openFolder',
            finalUri,
            true, // forceNewWindow
          );
        },
        options: {
          showOutputDataOnSuccess: false,
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region CREATE MIGRATION
      {
        group: groupGENERATE,
        title: `new migration`,
        exec: `${FRAMEWORK_NAME} migration:create %migrationname%`,
        options: {
          titleWhenProcessing: `taon is adding new migration..`,
          cancellable: false,
          findNearestProject: true,
          findNearestProjectType: LibTypeEnum.ISOMORPHIC_LIB,
          resolveVariables: [
            { variable: 'migrationname', placeholder: `my new db change` },
          ],
        },
      },
      //#endregion

      //#region MAGIC COPY AND RENAME
      {
        title: `magic copy and rename`,
        exec: `${FRAMEWORK_NAME} copy:and:rename '%rules%'`,
        options: {
          titleWhenProcessing: `taon is magically renaming files and folders..`,
          cancellable: false,
          resolveVariables: [
            {
              variable: 'rules',
              placeholder: `%fileName% -> %fileName%-new`,
              encode: true,
            },
          ],
        },
      },
      //#endregion

      //#region OPEN CORE CONTAINER
      {
        group,
        title: `open core container`,
        exec: `${FRAMEWORK_NAME} open:core:container`,
        options: {
          titleWhenProcessing: 'opening core container',
          findNearestProject: true,
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region OPEN CORE PROJECT
      {
        group,
        title: `open core project`,
        exec: `${FRAMEWORK_NAME} open:core:project`,
        options: {
          title: 'opening core project',
          findNearestProject: true,
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region GENERATE index.ts in selected folder
      {
        group: groupGENERATE,
        title: `generate ./index.ts with all isomorphic imports in selected folder`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% generated-index-exports_custom`,
        options: {
          titleWhenProcessing: 'generating index.ts',
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region GENERATE @websql regions for entity
      {
        group: groupRefactor,
        title: `class fields @websql regions`,
        exec: `${FRAMEWORK_NAME} generate:fieldsWebsqlRegions %absolutePath%`,
        options: {
          titleWhenProcessing: 'refactoring class field with @websql regions',
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region GENERATE taon simple example
      {
        group: groupGENERATE,
        title: `taon simple example (context, ctrl, entity, repo, api-service)`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-simple %entity%`,
        options: {
          titleWhenProcessing: 'generating taon simple example code',
          showSuccessMessage: false,
          resolveVariables: [
            {
              variable: 'entity',
              placeholder: `my-entity`,
              encode: true,
            },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon full example
      {
        group: groupGENERATE,
        title: `taon full example (all taon framework building blocks)`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-full %entity%`,
        options: {
          titleWhenProcessing: 'generating taon full example code',
          showSuccessMessage: false,
          resolveVariables: [
            {
              variable: 'entity',
              placeholder: `my-entity`,
              encode: true,
            },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon entity ui components
      {
        group: groupGENERATE,
        title: `taon entity ui components (list, page, form etc..)`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-entity-components %entity%`,
        options: {
          titleWhenProcessing: 'generating taon entity ui components',
          showSuccessMessage: false,
          resolveVariables: [
            {
              variable: 'entity',
              placeholder: `my-entity`,
              encode: true,
            },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon worker example
      {
        group: groupGENERATE,
        title: `taon worker (worker, ui, context, ctrl, entity, repo, api-service)`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-worker %entity%`,
        options: {
          titleWhenProcessing: 'generating taon worker code',
          showSuccessMessage: false,
          resolveVariables: [
            {
              variable: 'entity',
              placeholder: `my-entity`,
              encode: true,
            },
          ],
        },
      },
      //#endregion

      //#region WRAP FILE WITH @BROWSER TAG
      {
        group: groupRefactor,
        title: `wrap file with @browser TAG`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% wrap-with-browser-regions_custom`,
        options: {
          title: 'wrapping file with @browser',
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region WRAP FILE WITH @BROWSER TAG
      {
        group: groupRefactor,
        title: `class into namespace`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% refactor-class-into-namespace_custom`,
        options: {
          title: 'refactoring class into namespace',
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region GENERATE taon backend repository file
      {
        group: groupGENERATE,
        title: `taon .repository.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-repo_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon backend repository file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon controller file
      {
        group: groupGENERATE,
        title: `taon .controller.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-controller_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon controller file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon active context file
      {
        group: groupGENERATE,
        title: `taon .active.context.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-active-context_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon context file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon abstract context file
      {
        group: groupGENERATE,
        title: `taon .abstract.context.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-abstract-context_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon context file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon provider file
      {
        group: groupGENERATE,
        title: `taon .provider.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-provider_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon provider file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon middleware file
      {
        group: groupGENERATE,
        title: `taon .middleware.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-middleware_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon middleware file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon middleware file
      {
        group: groupGENERATE,
        title: `taon .subscriber.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-subscriber_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon subscriber file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon api-service file
      {
        group: groupGENERATE,
        title: `taon .api-service.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-api-service_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon api-service file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE dummy angular component structure
      {
        group: groupGENERATE,
        title: `angular component structure`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% dummy-angular-standalone-component %entity%`,
        options: {
          titleWhenProcessing: 'generating angular component structure',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-component`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE dummy angular container structure
      {
        group: groupGENERATE,
        title: `angular container structure with active context`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% dummy-angular-standalone-container %entity%`,
        options: {
          titleWhenProcessing: 'generating angular container structure',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-container`, encode: true },
          ],
        },
      },
      //#endregion

      //#region temp files show
      {
        title: `show vscode temporary files`,
        exec: `${FRAMEWORK_NAME} vscode:temp:show`,
        options: {
          title: 'show temporary files',
          findNearestProject: true,
          debug: true,
          cancellable: false,
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region temp files hide
      {
        title: `hide vscode temporary files`,
        exec: `${FRAMEWORK_NAME} vscode:temp:hide`,
        options: {
          title: 'hide temporary files',
          debug: true,
          findNearestProject: true,
          cancellable: false,
          showSuccessMessage: false,
        },
      },
      //#endregion
    ] as CommandType[]
  ).map(c => {
    if (!c.command) {
      c.command = `extension.${FRAMEWORK_NAME}.${Utils__NS__camelize(c.title)}`;
    }
    if (c.group === undefined) {
      c.group = group;
    }
    return c;
  }) as CommandType[];
  //#endregion
};