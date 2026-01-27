import { config, fileName, folderName, taonPackageName } from 'tnp-core/lib-prod';
import { chalk, crossPlatformPath, glob, path, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor } from 'tnp-core/lib-prod';
import { UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { BaseCommandLineFeature, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray } from 'tnp-helpers/lib-prod';

import {
  binMainProject,
  cliTsFromSrc,
  distMainProject,
  libFromImport,
  libFromNpmPackage,
  localReleaseMainProject,
  nodeModulesMainProject,
  srcMainProject,
  debugSuffix,
  debugBrkSuffix,
  suffixLatest,
  inspectSuffix,
  inspectBrkSuffix,
  startJsFromBin,
  libFromSrc,
  startTsFromLib,
  indexTsFromSrc,
} from '../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../options';
import type { Project } from '../abstract/project';

import { BaseCli } from './base-cli';

/**
 * TODO refactor move to tnp-helpers
 */ // @ts-ignore TODO weird inheritance problem
export class $Link extends BaseCli {
  async _() {
    let project = this.project;

    if (!project.framework.isStandaloneProject) {
      Helpers__NS__error(`Command not supported in this project`, false, true);
    }
    const localClis = this._getDetectedLocalCLi();
    if (localClis.length === 0) {
      await this.global();
    } else {
      const options = {
        global: {
          name: 'Link current project as global cli tool',
        },
        ...localClis.reduce((a, b) => {
          return {
            ...a,
            [b]: {
              name: `Link local/repo cli version from ./${this.project.relative(b)}`,
            },
          };
        }, {}),
      };
      const res = await UtilsTerminal__NS__select<keyof typeof options>({
        question: 'What would you like to link?',
        choices: options,
        autocomplete: false,
      });

      if (res === 'global') {
        await this.global();
      } else {
        await this.local(res);
      }
    }

    Helpers__NS__info(`Linking DONE!`);
    this._exit();
  }

  _getDetectedLocalCLi() {
    const destBaseLatest = this.project.pathFor(
      `${nodeModulesMainProject}/${ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL}`,
    );
    return Helpers__NS__foldersFrom(destBaseLatest).filter(f => {
      const proj = this.ins.From(f);
      return !!proj;
    });
  }

  async local(pathToFolder: string) {
    const localReleaseFolder =
      pathToFolder ||
      this.firstArg ||
      `${localReleaseMainProject}/${
        ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL
      }/${this.project.nameForCli}${suffixLatest}`;

    this.recreateCliBasicStructure();

    Helpers__NS__info(`Linking

      ${localReleaseFolder}

    as global cli tool, please wait...

    `);
    Helpers__NS__run(`npm link`, { cwd: localReleaseFolder, output: true }).sync();
    Helpers__NS__info(
      `Global link created for ` +
        `local/repo version of ${chalk.bold(this.project.nameForCli)}`,
    );
    this._exit();
  }

  recreateCliBasicStructure(globalBinFolderPath?: string) {
    //#region @backendFunc

    const pattern = `${this.project.pathFor(binMainProject)}/*`;
    const countLinkInPackageJsonBin = glob
      .sync(pattern)
      .map(f => crossPlatformPath(f))
      .filter(f => {
        return (Helpers__NS__readFile(f) || '').startsWith('#!/usr/bin/env');
      });

    // if (countLinkInPackageJsonBin.length === 0) {
    const pathNormalLink = this.project.pathFor([
      binMainProject,
      this.project.name,
    ]);

    Helpers__NS__writeFile(
      pathNormalLink,
      `#!/usr/bin/env -S node --no-deprecation
//#${'reg' + 'ion'} @${'back' + 'end'}
// --stack-trace-limit=10000
${'req' + 'uire'}('./start');
//#${'endreg' + 'ion'}
`,
    );
    countLinkInPackageJsonBin.push(pathNormalLink);

    const pathDebugLink = this.project.pathFor([
      binMainProject,
      `${this.project.name}${debugSuffix.replace('--', '-')}`,
    ]);

    Helpers__NS__writeFile(
      pathDebugLink,
      `#!/usr/bin/env -S node --inspect --stack-trace-limit=10000 --no-deprecation
//#${'reg' + 'ion'} @${'back' + 'end'}
// --stack-trace-limit=10000
${'req' + 'uire'}('./start');
//#${'endreg' + 'ion'}
`,
    );
    countLinkInPackageJsonBin.push(pathDebugLink);

    const pathBrkDebugLink = this.project.pathFor([
      binMainProject,
      `${this.project.name}${debugBrkSuffix.replace('--', '-')}`,
    ]);

    Helpers__NS__writeFile(
      pathBrkDebugLink,
      `#!/usr/bin/env -S node --inspect-brk --stack-trace-limit=10000 --no-deprecation
//#${'reg' + 'ion'} @${'back' + 'end'}
${'req' + 'uire'}('./start');
//#${'endreg' + 'ion'}
`,
    );
    countLinkInPackageJsonBin.push(pathBrkDebugLink);

    if (this.project.name !== taonPackageName) { // QUICK_FIX For custom taon cli
      this.project.framework.recreateFileFromCoreProject({
        forceRecrete: true,
        fileRelativePath: crossPlatformPath([srcMainProject, cliTsFromSrc]),
      });
    }

    this.project.framework.recreateFileFromCoreProject({
      forceRecrete: true,
      fileRelativePath: crossPlatformPath([srcMainProject, indexTsFromSrc]),
    });

    this.project.framework.recreateFileFromCoreProject({
      forceRecrete: true,
      fileRelativePath: crossPlatformPath([binMainProject, startJsFromBin]),
    });

    if (!this.project.hasFile([srcMainProject, libFromSrc, startTsFromLib])) {
      this.project.framework.recreateFileFromCoreProject({
        fileRelativePath: crossPlatformPath([
          srcMainProject,
          libFromSrc,
          startTsFromLib,
        ]),
      });
    }

    // }

    const bin = {};
    countLinkInPackageJsonBin.forEach(p => {
      bin[path.basename(p)] = `${binMainProject}/${path.basename(p)}`;
    });
    this.project.packageJson.bin = bin;

    if (globalBinFolderPath && ___NS__isObject(this.project.packageJson.bin)) {
      Object.keys(this.project.packageJson.bin).forEach(globalName => {
        const localPath = path.join(
          this.project.location,
          this.project.packageJson.bin[globalName],
        );
        const destinationGlobalLink = path.join(
          globalBinFolderPath,
          globalName,
        );
        Helpers__NS__removeIfExists(destinationGlobalLink);

        const inspect =
          globalName.endsWith(debugSuffix.replace('--', '')) ||
          globalName.endsWith(inspectSuffix.replace('--', ''));

        const selectedInspect: boolean =
          globalName.endsWith(debugBrkSuffix.replace('--', '')) ||
          globalName.endsWith(inspectBrkSuffix.replace('--', ''));

        const attachDebugParam: '--inspect' | '--inspect-brk' | '' = inspect
          ? inspectSuffix
          : selectedInspect
            ? inspectBrkSuffix
            : '';

        if (process.platform === 'win32') {
          this._writeWin32LinkFiles({
            attachDebugParam,
            destinationGlobalLink,
            globalBinFolderPath,
            globalName,
          });
        } else {
          Helpers__NS__createSymLink(localPath, destinationGlobalLink);
          const command = `chmod +x ${destinationGlobalLink}`;
          Helpers__NS__log(`Trying to make file executable global command "${chalk.bold(
            globalName,
          )}".

            command: ${command}
            `);
          Helpers__NS__run(command).sync();
        }

        Helpers__NS__info(`Global link created for: ${chalk.bold(globalName)}`);
      });
    }
    //#endregion
  }

  //#region global link
  async global() {
    let project = this.project;
    // if (process.platform !== 'win32') {
    //   await Helpers.isElevated();
    // }

    //#region linking to global/local bin
    let globalBinFolderPath = path.dirname(
      (
        ___NS__first(
          Helpers__NS__run(
            `${UtilsOs__NS__isRunningInWindowsPowerShell() ? 'where.exe' : 'which'} ${config.frameworkName}`,
            { output: false },
          )
            .sync()
            .toString()
            .split('\n'),
        ) || ''
      ).trim(),
    );

    // console.log(`globalBinFolderPath "${globalBinFolderPath}"`, );
    // process.exit(0)
    if (process.platform === 'win32') {
      globalBinFolderPath = crossPlatformPath(globalBinFolderPath);
      if (/^\/[a-z]\//.test(globalBinFolderPath)) {
        globalBinFolderPath = globalBinFolderPath.replace(
          /^\/[a-z]\//,
          `${globalBinFolderPath.charAt(1).toUpperCase()}:/`,
        );
      }
    }

    const globalNodeModules = crossPlatformPath(
      path.join(
        globalBinFolderPath,
        process.platform === 'win32'
          ? folderName.node_modules
          : `../${libFromNpmPackage}/${folderName.node_modules}`,
      ),
    );

    const packageInGlobalNodeModules = crossPlatformPath(
      path.resolve(path.join(globalNodeModules, project.name)),
    );

    // packageInGlobalNodeModules
    Helpers__NS__removeIfExists(packageInGlobalNodeModules);
    project.linkTo(packageInGlobalNodeModules);

    if (!Helpers__NS__exists(project.pathFor(binMainProject))) {
      Helpers__NS__mkdirp(project.pathFor(binMainProject));
    }

    this.recreateCliBasicStructure(globalBinFolderPath);

    this._exit();
    //#endregion
  }
  //#endregion

  //#region write win 32 link files
  _writeWin32LinkFiles(options: {
    destinationGlobalLink: string;
    attachDebugParam: '--inspect' | '--inspect-brk' | '';
    globalName: string;
    globalBinFolderPath: string;
  }) {
    const {
      attachDebugParam,
      destinationGlobalLink,
      globalName,
      globalBinFolderPath,
    } = options;
    try {
      Helpers__NS__writeFile(
        destinationGlobalLink,
        `
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
*CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;
esac

if [ -x "$basedir/node" ]; then
"$basedir/node" ${attachDebugParam} "$basedir/node_modules/${
          this.project.nameForNpmPackage
        }/bin/${globalName}" "$@"
ret=$?
else
node ${attachDebugParam} "$basedir/node_modules/${
          this.project.nameForNpmPackage
        }/bin/${globalName}" "$@"
ret=$?
fi
exit $ret
      `.trim() + '\n',
      );

      const destinationGlobalLinkPS1File = path.join(
        globalBinFolderPath,
        `${globalName}.ps1`,
      );
      Helpers__NS__writeFile(
        destinationGlobalLinkPS1File,
        attachDebugParam
          ? `#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$basedir = Split-Path $MyInvocation.MyCommand.Definition -Parent
$exe = if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) { ".exe" } else { "" }

$nodePath = if (Test-Path "$basedir/node$exe") { "$basedir/node$exe" } else { "node$exe" }
$scriptToRun = "$basedir/node_modules/${
              this.project.nameForNpmPackage
            }/${binMainProject}/${globalName}"

$ret = & $nodePath ${`"${attachDebugParam}"`} $scriptToRun @args
exit $ret
`.trim() + '\n'
          : `
#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
# Fix case when both the Windows and Linux builds of Node
# are installed in the same directory
$exe=".exe"
}
$ret=0
if (Test-Path "$basedir/node$exe") {
& "$basedir/node$exe"  "$basedir/node_modules/${
              this.project.nameForNpmPackage
            }/${binMainProject}/${globalName}" $args
$ret=$LASTEXITCODE
} else {
& "node$exe"  "$basedir/node_modules/${
              this.project.nameForNpmPackage
            }/${binMainProject}/${globalName}" $args
$ret=$LASTEXITCODE
}
exit $ret
      `.trim() + '\n',
      );
      const destinationGlobalLinkCmdFile = path.join(
        globalBinFolderPath,
        `${globalName}.cmd`,
      );
      Helpers__NS__writeFile(
        destinationGlobalLinkCmdFile,
        `
@ECHO off
SETLOCAL
CALL :find_dp0

IF EXIST "%dp0%\\node.exe" (
SET "_prog=%dp0%\\node.exe"
) ELSE (
SET "_prog=node"
SET PATHEXT=%PATHEXT:;.JS;=;%
)

"%_prog%"  "%dp0%\\node_modules\\${
          this.project.nameForNpmPackage
        }\\bin\\${globalName}" %*
ENDLOCAL
EXIT /b %errorlevel%
:find_dp0
SET dp0=%~dp0
EXIT /b

      `.trim() + '\n',
      );
    } catch (error) {
      Helpers__NS__error(
        `Check if you cli is not active in another terminal and try again`,
        false,
        true,
      );
    }
  }
  //#endregion
}

export default {
  $Link: HelpersTaon__NS__CLIWRAP($Link, '$Link'),
};