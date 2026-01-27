import { config, folderName, PREFIXES, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { crossPlatformPath, glob, path, fse, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith } from 'tnp-core/lib-prod';
import { fileName } from 'tnp-core/lib-prod';
import { Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray } from 'tnp-helpers/lib-prod';

import {
  assetsFromNpmPackage,
  assetsFromSrc,
  distMainProject,
  distNoCutSrcMainProject,
  indexDtsMainProject,
  indexDtsNpmPackage,
  nodeModulesMainProject,
  packageJsonNpmLib,
  prodSuffix,
  projectsFromNgTemplate,
  sharedFromAssets,
  sourceLinkInNodeModules,
  srcMainProject,
  THIS_IS_GENERATED_INFO_COMMENT,
  tmpLibsForDist,
  tmpLocalCopytoProjDist,
  tmpSourceDist,
  tmpSrcDist,
  tmpSrcDistWebsql,
} from '../../../../../../constants';
import {
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../../../options';
import type { Project } from '../../../../project';

import { CopyManager } from './copy-manager';
import { CopyMangerHelpers__NS__childPureName } from './copy-manager-helpers';
import { SourceMappingUrl } from './source-maping-url';
import { TypescriptDtsFixer } from './typescript-dts-fixer';

export class CopyManagerStandalone extends CopyManager {
  dtsFixer: TypescriptDtsFixer;

  //#region init
  public init(buildOptions: EnvOptions, renameDestinationFolder?: string) {
    //#region @backendFunc
    this.buildOptions = buildOptions;
    this.renameDestinationFolder = renameDestinationFolder;
    this.browserwebsqlFolders = this.getBrowserwebsqlFolders();

    this.sourceFoldersToRemoveFromNpmPackage = [
      srcMainProject,
      sourceLinkInNodeModules,
      nodeModulesMainProject,
      tmpSrcDist,
      tmpSrcDist + prodSuffix,
      tmpSrcDistWebsql,
      tmpSrcDistWebsql + prodSuffix,
      ...this.browserwebsqlFolders.map(currentBrowserFolder => {
        // TODO not needed?
        return crossPlatformPath([currentBrowserFolder, srcMainProject]);
      }),
    ];

    this.selectAllProjectCopyto();

    if (!Array.isArray(this.copyto)) {
      this.copyto = [];
    }

    if (this.copyto.length === 0) {
      Helpers__NS__log(
        `No need to --copyto on build finish...(only copy to local temp proj) `,
      );
    }

    // console.log('this.copyto', this.copyto);

    this._isomorphicPackages =
      this.project.packagesRecognition.allIsomorphicPackagesFromMemory;

    Helpers__NS__log(
      `Operating on ${this.isomorphicPackages.length} isomorphic packages...`,
    );
    this.recreateTempProj();

    const files = Helpers__NS__filesFrom(this.monitoredOutDir, true).filter(f =>
      f.endsWith('.js'),
    );

    for (let index = 0; index < files.length; index++) {
      const fileAbsPath = files[index];
      SourceMappingUrl.fixContent(fileAbsPath, buildOptions);
    }
    this.dtsFixer = TypescriptDtsFixer.for(this.isomorphicPackages);

    this.initWatching();
    //#endregion
  }
  //#endregion

  //#region links ofr packages are ok
  linksForPackageAreOk(destination: Project): boolean {
    //#region @backendFunc
    const destPackageLinkSourceLocation = destination.pathFor([
      nodeModulesMainProject,
      this.rootPackageName,
      sourceLinkInNodeModules,
    ]);
    // console.log({ destPackageLinkSourceLocation });

    return Helpers__NS__exists(destPackageLinkSourceLocation);
    //#endregion
  }
  //#endregion

  //#region recreate temp proj
  recreateTempProj() {
    //#region @backendFunc
    try {
      // QUICK_FIX remove old temp proj
      fse.unlinkSync(
        crossPlatformPath([
          this.project.framework.tmpLocalProjectFullPath,
          packageJsonNpmLib,
        ]),
      );
    } catch (error) {}
    Helpers__NS__removeSymlinks(this.localTempProjPath); // QUICK_FIX remove symlinks
    Helpers__NS__remove(this.localTempProjPath);
    Helpers__NS__writeFile([this.localTempProjPath, packageJsonNpmLib], {
      name: path.basename(this.localTempProjPath),
      version: '0.0.0',
    });
    Helpers__NS__mkdirp([this.localTempProjPath, nodeModulesMainProject]);
    //#endregion
  }
  //#endregion

  //#region init watching
  initWatching() {
    //#region @backendFunc
    const monitoredOutDir = this.monitoredOutDir;
    const monitoredOutDirSharedAssets = this.monitoredOutDirSharedAssets;

    this.initOptions({
      folderPath: [monitoredOutDir, ...monitoredOutDirSharedAssets],
      folderPathContentCheck: [monitoredOutDir],
      taskName: 'CopyManager',
    });
    //#endregion
  }
  //#endregion

  //#region local temp proj path
  get localTempProjPath() {
    //#region @backendFunc
    return this.project.pathFor(tmpLocalCopytoProjDist);
    //#endregion
  }
  //#endregion

  //#region root package name
  /**
   * first folder in node_modules for packge
   * example:
   * project/node_modules/<rootPackageName> # like 'ng2-rest' or '@angular'
   */
  get rootPackageName() {
    //#region @backendFunc
    const rootPackageName =
      ___NS__isString(this.renameDestinationFolder) &&
      this.renameDestinationFolder !== ''
        ? this.renameDestinationFolder
        : this.project.nameForNpmPackage;

    return rootPackageName;
    //#endregion
  }
  //#endregion

  //#region monitored out dir
  get monitoredOutDir(): string {
    //#region @backendFunc
    return this.project.pathFor(distMainProject);
    //#endregion
  }

  get monitoredOutDirSharedAssets(): string[] {
    //#region @backendFunc
    const monitorDir = this.project.pathFor([
      srcMainProject,
      assetsFromSrc,
      sharedFromAssets,
    ]);
    return [monitorDir];
    //#endregion
  }
  //#endregion

  //#region initial fix for destination pacakge
  initalFixForDestination(destination: Project): void {
    //#region @backendFunc

    const destPackageInNodeModules = destination.pathFor([
      nodeModulesMainProject,
      this.rootPackageName,
    ]);

    if (this.isStartFromScratch) {
      Helpers__NS__logInfo(
        `[copy-manager] Removing dest: ${destPackageInNodeModules}`,
      );
      Helpers__NS__remove(destPackageInNodeModules);
    }

    for (let index = 0; index < this.browserwebsqlFolders.length; index++) {
      const currentBrowserFolder = this.browserwebsqlFolders[index];
      const destPackageInNodeModulesBrowser = crossPlatformPath(
        path.join(destPackageInNodeModules, currentBrowserFolder),
      );

      if (Helpers__NS__isSymlinkFileExitedOrUnexisted(destPackageInNodeModules)) {
        Helpers__NS__removeFileIfExists(destPackageInNodeModules);
      }
      if (!Helpers__NS__exists(destPackageInNodeModules)) {
        Helpers__NS__mkdirp(destPackageInNodeModules);
      }
      if (
        Helpers__NS__isSymlinkFileExitedOrUnexisted(destPackageInNodeModulesBrowser)
      ) {
        Helpers__NS__removeFileIfExists(destPackageInNodeModulesBrowser);
      }
      if (!Helpers__NS__exists(destPackageInNodeModulesBrowser)) {
        Helpers__NS__mkdirp(destPackageInNodeModulesBrowser);
      }
    }
    //#endregion
  }
  //#endregion

  //#region fix map files
  changedJsMapFilesInternalPathesForDebug(
    content: string,
    isBrowser: boolean,
    isForLaunchJsonDebugging: boolean,
    absFilePath: string,
    releaseType: ReleaseType,
  ): string {
    //#region @backendFunc
    if (
      !content ||
      (!absFilePath.endsWith('.js.map') && !absFilePath.endsWith('.mjs.map'))
    ) {
      // Helpers__NS__warn(`[copytomanager] Empty content for ${absFilePath}`);
      return content;
    }

    // prod not need for debugging
    let toReplaceString2 = isBrowser
      ? `../${tmpLibsForDist}/${this.project.name}` +
        `/${projectsFromNgTemplate}/${this.project.name}/${srcMainProject}`
      : `../${tmpSourceDist}`;

    let toReplaceString1 = `"${toReplaceString2}`;

    if (isBrowser) {
      // TODO is angular maps not working in chrome debugger
      // content = content.replace(regex1, `"./${folderName.src}`);
      // content = content.replace(regex2, folderName.src);
    } else {
      if (isForLaunchJsonDebugging) {
        const regex2 = new RegExp(
          Utils__NS__escapeStringForRegEx(toReplaceString2),
          'g',
        );
        content = content.replace(regex2, `../${srcMainProject}`);
      } else {
        const regex1 = new RegExp(
          Utils__NS__escapeStringForRegEx(toReplaceString1),
          'g',
        );
        const regex2 = new RegExp(
          Utils__NS__escapeStringForRegEx(toReplaceString2),
          'g',
        );
        content = content.replace(regex1, `"./${srcMainProject}`);
        content = content.replace(regex2, srcMainProject);
      }
    }

    content = this.sourceMapContentFix(
      content,
      isBrowser,
      absFilePath,
      releaseType,
    );

    return content;
    //#endregion
  }
  //#endregion

  //#region source map content fix
  sourceMapContentFix(
    content: string,
    isBrowser: boolean,
    absFilePath: string,
    releaseType: ReleaseType,
  ) {
    //#region @backendFunc
    /**
     * QUICK_FIX backend debugging on window
     * (still third party debug does not work)
     */
    if (
      // process.platform === 'win32' &&
      !isBrowser
    ) {
      const json = JSON.parse(content);
      if (json) {
        json.sources = (json.sources || []).map((p: string) => {
          if (releaseType) {
            return '';
          }

          const localProjFolderName = `${tmpLocalCopytoProjDist}/${nodeModulesMainProject}/${this.rootPackageName}`;

          let dirnameAbs = crossPlatformPath(path.dirname(absFilePath));
          if (dirnameAbs.includes(localProjFolderName)) {
            dirnameAbs = dirnameAbs.replace(
              `/${this.project.name}/${localProjFolderName}`,
              `/${this.project.name}/`,
            );
          }

          const resolved = crossPlatformPath(
            path.resolve(
              dirnameAbs,
              p.startsWith('./') ? p.replace('./', '') : p,
            ),
          );
          // const resolved = crossPlatformPath(path.resolve(p));
          // console.log({
          //   resolved,
          //   dirnameAbs,
          //   p
          // });
          return resolved;
        });
      }
      content = JSON.stringify(json);
    }
    return content;
    //#endregion
  }
  //#endregion

  //#region remove source folder links
  removeSourceLinksFolders(pkgLocInDestNodeModules: string) {
    //#region @backendFunc
    this.sourceFoldersToRemoveFromNpmPackage.forEach(sourceFolder => {
      const toRemoveLink = crossPlatformPath(
        path.join(pkgLocInDestNodeModules, sourceFolder),
      );
      if (Helpers__NS__isSymlinkFileExitedOrUnexisted(toRemoveLink)) {
        Helpers__NS__remove(
          crossPlatformPath(path.join(pkgLocInDestNodeModules, sourceFolder)),
          true,
        );
      }
    });
    //#endregion
  }
  //#endregion

  //#region copy shared assets
  copySharedAssets(destination: Project, isTempLocalProj: boolean) {
    //#region @backendFunc
    const monitoredOutDirSharedAssets = this.monitoredOutDirSharedAssets;
    for (let index = 0; index < monitoredOutDirSharedAssets.length; index++) {
      const sharedAssetsPath = monitoredOutDirSharedAssets[index];
      const dest = destination.nodeModules.pathFor(
        `${
          this.project.framework.isStandaloneProject
            ? this.rootPackageName
            : `${this.rootPackageName}/${path.basename(
                path.dirname(path.dirname(path.dirname(sharedAssetsPath))),
              )}`
        }/${assetsFromSrc}/${sharedFromAssets}`,
      );

      HelpersTaon__NS__copy(sharedAssetsPath, dest, {
        copySymlinksAsFiles: true,
        overwrite: true,
        recursive: true,
      });
    }
    //#endregion
  }
  //#endregion

  //#region copy compiled sources and declarations
  copyCompiledSourcesAndDeclarations(
    destination: Project,
    isTempLocalProj: boolean,
  ) {
    //#region @backendFunc
    const monitorDir = isTempLocalProj //
      ? this.monitoredOutDir // other package are getting data from temp-local-projecg
      : this.localTempProj.nodeModules.pathFor(this.rootPackageName);

    if (isTempLocalProj) {
      // when destination === tmpLocalCopytoProjDist => fix d.ts imports in (dist)
      this.dtsFixer.processFolderWithBrowserWebsqlFolders(
        monitorDir,
        this.browserwebsqlFolders,
      );
    }

    //#region final copy from dist to node_moules/rootpackagename
    const pkgLocInDestNodeModules = destination.nodeModules.pathFor(
      this.rootPackageName,
    );
    const filter = HelpersTaon__NS__filterDontCopy(
      this.sourceFoldersToRemoveFromNpmPackage,
      monitorDir,
    );

    this.removeSourceLinksFolders(pkgLocInDestNodeModules);

    // TODO this thing is failing when copying unexisted file on macos
    HelpersTaon__NS__copy(monitorDir, pkgLocInDestNodeModules, {
      copySymlinksAsFiles: false,
      filter,
    });

    //#endregion

    //#endregion
  }
  //#endregion

  //#region replace d.ts files in destination after copy
  replaceIndexDtsForEntryProjectIndex(destination: Project) {
    //#region @backendFunc
    const location = destination.nodeModules.pathFor([
      this.rootPackageName,
      indexDtsNpmPackage,
    ]);
    Helpers__NS__writeFile(location, `export * from './${srcMainProject}';\n`);
    //#endregion
  }
  //#endregion

  //#region add source symlinks
  addSourceSymlinks(destination: Project) {
    //#region @backendFunc
    const source = crossPlatformPath([
      destination.nodeModules.pathFor(this.rootPackageName),
      sourceLinkInNodeModules,
    ]);

    const srcDts = crossPlatformPath([
      destination.nodeModules.pathFor(this.rootPackageName),
      'src.d.ts',
    ]);

    Helpers__NS__removeIfExists(source);
    Helpers__NS__createSymLink(this.sourcePathToLink, source);

    Helpers__NS__writeFile(
      srcDts,
      `
${THIS_IS_GENERATED_INFO_COMMENT}
export * from './source';
${THIS_IS_GENERATED_INFO_COMMENT}
// please use command: taon build:watch to see here links for your globally builded lib code files
${THIS_IS_GENERATED_INFO_COMMENT}
            `.trimStart(),
    );
    //#endregion
  }
  //#endregion

  //#region remove source symlinks
  removeSourceSymlinks(destination: Project) {
    //#region @backendFunc
    const srcDts = crossPlatformPath([
      destination.nodeModules.pathFor(this.rootPackageName),
      'src.d.ts',
    ]);

    Helpers__NS__writeFile(
      srcDts,
      `
${THIS_IS_GENERATED_INFO_COMMENT}
export * from './source';
${THIS_IS_GENERATED_INFO_COMMENT}
// please use command: taon build:watch to see here links for your globally builded lib code files
${THIS_IS_GENERATED_INFO_COMMENT}
            `.trimStart(),
    );

    const source = crossPlatformPath(
      path.join(
        destination.nodeModules.pathFor(this.rootPackageName),
        sourceLinkInNodeModules,
      ),
    );

    Helpers__NS__removeIfExists(source);
    //#endregion
  }
  //#endregion

  //#region copy source maps
  /**
   *
   * @param destination that already has node_modues/rootPackagename copied
   * @param isTempLocalProj
   */
  copySourceMaps(destination: Project, isTempLocalProj: boolean) {
    //#region @backendFunc
    if (isTempLocalProj) {
      // destination === tmpLocalCopytoProjDist
      this.fixBackendAndBrowserJsMapFilesInLocalProj();
    } else {
      this.copyBackendAndBrowserJsMapFilesFromLocalProjTo(destination);
    }
    //#endregion
  }
  //#endregion

  //#region fix js map files in destination folder
  fixJsMapFiles(
    destinationPackageLocation: string,
    /**
     * browser websql browser-prod websql-prod
     */
    currentBrowserFolder?:  string,
  ) {
    //#region @backendFunc
    const forBrowser = !!currentBrowserFolder;
    const filesPattern =
      `${destinationPackageLocation}` +
      `${forBrowser ? `/${currentBrowserFolder}` : ''}` +
      `/**/*.${forBrowser ? 'm' : ''}js.map`;

    // console.log({
    //   destinationPackageLocation,
    //   currentBrowserFolder,
    //   filesPattern
    // })
    const mapFiles = glob.sync(filesPattern, {
      ignore: forBrowser
        ? []
        : [`${folderName.browser}/**/*.*`, `${folderName.websql}/**/*.*`],
    });

    for (let index = 0; index < mapFiles.length; index++) {
      const absFilePath = mapFiles[index];
      const relative = crossPlatformPath(absFilePath).replace(
        destinationPackageLocation + '/',
        '',
      );
      this.writeFixedMapFile(forBrowser, relative, destinationPackageLocation);
    }
    //#endregion
  }
  //#endregion

  //#region fix backend and browser js (m)js.map files (for proper debugging)
  /**
   *  fix backend and browser js (m)js.map files (for proper debugging)
   *
   * destination is (should be) tmpLocalCopytoProjDist
   *
   * Fix for 2 things:
   * - debugging when in cli mode (fix in actual (dist)/(browser/websql)  )
   * - debugging when in node_modules of other project (fixing only tmpLocalCopytoProjDist)
   * @param destinationPackageLocation desitnation/node_modues/< rootPackageName >
   */
  fixBackendAndBrowserJsMapFilesInLocalProj() {
    //#region @backendFunc
    const destinationPackageLocation = this.localTempProj.nodeModules.pathFor(
      this.rootPackageName,
    );

    for (let index = 0; index < this.browserwebsqlFolders.length; index++) {
      const currentBrowserFolder = this.browserwebsqlFolders[index];
      this.fixJsMapFiles(destinationPackageLocation, currentBrowserFolder);
    }

    this.fixJsMapFiles(destinationPackageLocation);
    //#endregion
  }
  //#endregion

  //#region copy map files from local proj to copyto proj§
  copyMapFilesesFromLocalToCopyToProj(
    destination: Project,
    tmpLocalProjPackageLocation: string,
  ) {
    //#region @backendFunc
    const allMjsBrowserFiles = this.browserwebsqlFolders
      .map(currentBrowserFolder => {
        const mjsBrowserFilesPattern =
          `${tmpLocalProjPackageLocation}/` +
          `${currentBrowserFolder}` +
          `/**/*.mjs.map`;

        const mjsBrwoserFiles = glob.sync(mjsBrowserFilesPattern);
        return mjsBrwoserFiles;
      })
      .reduce((a, b) => a.concat(b), []);

    const mapBackendFilesPattern = `${tmpLocalProjPackageLocation}/**/*.js.map`;
    const mapBackendFiles = glob.sync(mapBackendFilesPattern, {
      ignore: [`${folderName.browser}/**/*.*`, `${folderName.websql}/**/*.*`],
    });

    const toCopy = [...allMjsBrowserFiles, ...mapBackendFiles];

    for (let index = 0; index < toCopy.length; index++) {
      const fileAbsPath = toCopy[index];
      const fileRelativePath = fileAbsPath.replace(
        `${tmpLocalProjPackageLocation}/`,
        '',
      );
      const destAbs = crossPlatformPath(
        path.join(
          destination.nodeModules.pathFor(this.rootPackageName),
          fileRelativePath,
        ),
      );
      HelpersTaon__NS__copyFile(fileAbsPath, destAbs, { dontCopySameContent: false });
    }
    //#endregion
  }
  //#endregion

  //#region copy backend and browser jsM (m)js.map files to destination location
  /**
   * Copy fixed maps from tmpLocalCopytoProjDist to other projects
   *
   * @param destination any project other than tmpLocalCopytoProjDist
   */
  copyBackendAndBrowserJsMapFilesFromLocalProjTo(destination: Project) {
    //#region @backendFunc
    const destinationPackageLocation = this.localTempProj.nodeModules.pathFor(
      this.rootPackageName,
    );
    this.copyMapFilesesFromLocalToCopyToProj(
      destination,
      destinationPackageLocation,
    );
    //#endregion
  }
  //#endregion

  //#region fix d.ts import with wrong package names
  fixDtsImportsWithWronPackageName(
    absOrgFilePathInDist: string,
    destinationFilePath: string,
  ) {
    //#region @backendFunc
    if (absOrgFilePathInDist.endsWith('.d.ts')) {
      const contentToWriteInDestination =
        Helpers__NS__readFile(absOrgFilePathInDist) || '';
      for (let index = 0; index < this.browserwebsqlFolders.length; index++) {
        const currentBrowserFolder = this.browserwebsqlFolders[index];
        const newContent = this.dtsFixer.forContent(
          contentToWriteInDestination,
          // sourceFile,
          currentBrowserFolder,
        );
        if (newContent !== contentToWriteInDestination) {
          Helpers__NS__writeFile(destinationFilePath, newContent);
        }
      }
    }
    //#endregion
  }
  //#endregion

  //#region handle copy of asset file
  handleCopyOfAssetFile(absoluteAssetFilePath: string, destination: Project) {
    //#region @backendFunc
    const monitoredOutDirSharedAssets = this.monitoredOutDirSharedAssets;
    for (let index = 0; index < monitoredOutDirSharedAssets.length; index++) {
      const folderAssetsShareAbsPath = monitoredOutDirSharedAssets[index];
      if (absoluteAssetFilePath.startsWith(folderAssetsShareAbsPath)) {
        const relativePath = absoluteAssetFilePath.replace(
          `${folderAssetsShareAbsPath}/`,
          '',
        );
        const dest = destination.nodeModules.pathFor(
          `${this.rootPackageName}/${assetsFromNpmPackage}/${sharedFromAssets}/${relativePath}`,
        );
        Helpers__NS__remove(dest, true);
        if (Helpers__NS__exists(absoluteAssetFilePath)) {
          HelpersTaon__NS__copyFile(absoluteAssetFilePath, dest);
        }
      }
    }
    //#endregion
  }
  //#endregion

  //#region handle copy of single file
  handleCopyOfSingleFile(
    destination: Project,
    isTempLocalProj: boolean,
    specificFileRelativePath: string,
    wasRecrusive = false,
  ): void {
    //#region @backendFunc
    specificFileRelativePath = specificFileRelativePath.replace(/^\//, '');

    // Helpers__NS__log(
    //   `Handle single file: ${specificFileRelativePath} for ${destination.location}`,
    // );

    if (this.notAllowedFiles.includes(specificFileRelativePath)) {
      return;
    }

    if (!wasRecrusive) {
      this.preventWeakDetectionOfchanges(
        specificFileRelativePath,
        destination,
        isTempLocalProj,
      );
    }

    const destinationFilePath = crossPlatformPath(
      path.normalize(
        path.join(
          destination.nodeModules.pathFor(this.rootPackageName),
          specificFileRelativePath,
        ),
      ),
    );

    if (!isTempLocalProj) {
      const readyToCopyFileInLocalTempProj = crossPlatformPath(
        path.join(
          this.localTempProj.nodeModules.pathFor(this.rootPackageName),
          specificFileRelativePath,
        ),
      );
      // Helpers__NS__log(`Eqal content with temp proj: ${}`)
      if (Helpers__NS__exists(readyToCopyFileInLocalTempProj)) {
        HelpersTaon__NS__copyFile(readyToCopyFileInLocalTempProj, destinationFilePath);
      }
      return;
    }

    let absOrgFilePathInDist = crossPlatformPath(
      path.normalize(
        this.project.pathFor([distMainProject, specificFileRelativePath]),
      ),
    );

    // TODO QUICK_FIOX DISTINC WHEN IT COM FROM BROWSER
    // and do not allow
    if (destinationFilePath.endsWith('d.ts')) {
      const newAbsOrgFilePathInDist = absOrgFilePathInDist.replace(
        `/${distMainProject}/${specificFileRelativePath}`,
        `/${distNoCutSrcMainProject}/${specificFileRelativePath}`,
      );
      if (!Helpers__NS__exists(newAbsOrgFilePathInDist)) {
        // Helpers__NS__log(
        //   `[copyto] New path does not exists or in browser | websql: ${newAbsOrgFilePathInDist}`,
        // );
      } else {
        absOrgFilePathInDist = newAbsOrgFilePathInDist;
      }
    }

    this.fixDtsImportsWithWronPackageName(
      absOrgFilePathInDist,
      destinationFilePath,
    );

    const isBackendMapsFile = destinationFilePath.endsWith('.js.map');
    const isBrowserMapsFile = destinationFilePath.endsWith('.mjs.map');

    if (isBackendMapsFile || isBrowserMapsFile) {
      if (isBackendMapsFile) {
        this.writeFixedMapFile(
          false,
          specificFileRelativePath,
          destination.nodeModules.pathFor(this.rootPackageName),
        );
      }
      if (isBrowserMapsFile) {
        this.writeFixedMapFile(
          true,
          specificFileRelativePath,
          destination.nodeModules.pathFor(this.rootPackageName),
        );
      }
    } else {
      Helpers__NS__writeFile(
        destinationFilePath,
        Helpers__NS__readFile(absOrgFilePathInDist) || '',
      );
    }

    // TODO check this
    if (specificFileRelativePath === fileName.package_json) {
      // TODO this is VSCODE/typescirpt new fucking issue
      // HelpersTaon__NS__copyFile(sourceFile, path.join(path.dirname(destinationFile), folderName.browser, path.basename(destinationFile)));
    }
    //#endregion
  }
  //#endregion

  //#region prevent not fixing files in dist when source map hasn't been changed
  /**
   * if I am changing just thing in single line - maps are not being triggered asynch (it is good)
   * BUT typescript/angular compiler changes maps files inside dist or dist/browser|websql
   *
   *
   */
  preventWeakDetectionOfchanges(
    specificFileRelativePath: string,
    destination: Project,
    isTempLocalProj: boolean,
  ) {
    //#region @backendFunc
    (() => {
      const specificFileRelativePathBackendMap =
        specificFileRelativePath.replace('.js', '.js.map');
      const possibleBackendMapFile = crossPlatformPath(
        path.normalize(
          path.join(this.monitoredOutDir, specificFileRelativePathBackendMap),
        ),
      );

      if (Helpers__NS__exists(possibleBackendMapFile)) {
        this.handleCopyOfSingleFile(
          destination,
          isTempLocalProj,
          specificFileRelativePathBackendMap,
          true,
        );
      }
    })();

    (() => {
      const specificFileRelativePathBackendMap =
        specificFileRelativePath.replace('.js', '.d.ts');
      const possibleBackendMapFile = crossPlatformPath(
        path.normalize(
          path.join(this.monitoredOutDir, specificFileRelativePathBackendMap),
        ),
      );

      if (Helpers__NS__exists(possibleBackendMapFile)) {
        this.handleCopyOfSingleFile(
          destination,
          isTempLocalProj,
          specificFileRelativePathBackendMap,
          true,
        );
      }
    })();

    for (let index = 0; index < this.browserwebsqlFolders.length; index++) {
      const browserFolder = this.browserwebsqlFolders[index];
      const specificFileRelativePathBrowserMap =
        specificFileRelativePath.replace('.mjs', '.mjs.map');
      const possibleBrowserMapFile = crossPlatformPath(
        path.normalize(
          path.join(
            this.monitoredOutDir,
            browserFolder,
            specificFileRelativePathBrowserMap,
          ),
        ),
      );
      if (Helpers__NS__exists(possibleBrowserMapFile)) {
        this.handleCopyOfSingleFile(
          destination,
          isTempLocalProj,
          specificFileRelativePathBrowserMap,
          true,
        );
      }
    }
    //#endregion
  }
  //#endregion

  //#region write fixed map files for non cli
  /**
   * fix content of map files in destination package location
   */
  writeFixedMapFileForNonCli(
    isForBrowser: boolean,
    specificFileRelativePath: string,
    destinationPackageLocation: string,
  ) {
    //#region @backendFunc

    //#region map fix for node_moules/pacakge
    const absMapFilePathInLocalProjNodeModulesPackage = crossPlatformPath(
      path.join(destinationPackageLocation, specificFileRelativePath),
    );

    // console.log('SHOULD FIX NON CLI', {
    //   absMapFilePathInLocalProjNodeModulesPackage
    // })

    if (
      Helpers__NS__exists(absMapFilePathInLocalProjNodeModulesPackage) &&
      !Helpers__NS__isFolder(absMapFilePathInLocalProjNodeModulesPackage) &&
      !Helpers__NS__isSymlinkFileExitedOrUnexisted(
        absMapFilePathInLocalProjNodeModulesPackage,
      ) &&
      path.basename(absMapFilePathInLocalProjNodeModulesPackage) !==
        packageJsonNpmLib // TODO QUICK_FIX
    ) {
      const fixedContentNonCLI = this.changedJsMapFilesInternalPathesForDebug(
        Helpers__NS__readFile(absMapFilePathInLocalProjNodeModulesPackage),
        isForBrowser,
        false,
        absMapFilePathInLocalProjNodeModulesPackage,
        this.buildOptions.release.releaseType,
      );

      Helpers__NS__writeFile(
        absMapFilePathInLocalProjNodeModulesPackage,
        fixedContentNonCLI,
      );
    }

    //#endregion

    //#endregion
  }

  writeFixedMapFileForCli(
    isForBrowser: boolean,
    specificFileRelativePath: string,
    destinationPackageLocation: string,
  ) {
    //#region @backendFunc

    //#region mpa fix for CLI
    const monitoredOutDirFileToReplaceBack = crossPlatformPath(
      path.join(this.monitoredOutDir, specificFileRelativePath),
    );

    // console.log('SHOULD FIX CLI', {
    //   monitoredOutDirFileToReplaceBack
    // })

    if (
      Helpers__NS__exists(monitoredOutDirFileToReplaceBack) &&
      !Helpers__NS__isFolder(monitoredOutDirFileToReplaceBack) &&
      !Helpers__NS__isSymlinkFileExitedOrUnexisted(
        monitoredOutDirFileToReplaceBack,
      ) &&
      path.basename(monitoredOutDirFileToReplaceBack) !== packageJsonNpmLib // TODO QUICK_FIX
    ) {
      const fixedContentCLIDebug = this.changedJsMapFilesInternalPathesForDebug(
        Helpers__NS__readFile(monitoredOutDirFileToReplaceBack),
        isForBrowser,
        true,
        monitoredOutDirFileToReplaceBack,
        this.buildOptions.release.releaseType,
      );

      Helpers__NS__writeFile(monitoredOutDirFileToReplaceBack, fixedContentCLIDebug);
    }

    //#endregion

    //#endregion
  }
  //#endregion

  //#region write fixed map files
  /**
   *
   * @param isForBrowser
   * @param specificFileRelativePath
   * @param destinationPackageLocation should be ONLY temp project
   */
  protected writeFixedMapFile(
    isForBrowser: boolean,
    specificFileRelativePath: string,
    destinationPackageLocation: string,
  ) {
    //#region @backendFunc
    this.writeFixedMapFileForNonCli(
      isForBrowser,
      specificFileRelativePath,
      destinationPackageLocation,
    );
    this.writeFixedMapFileForCli(
      isForBrowser,
      specificFileRelativePath,
      destinationPackageLocation,
    );
    //#endregion
  }
  //#endregion

  //#region update backend full dts files
  updateBackendFullDtsFiles(destinationOrDist: Project | string) {
    //#region @backendFunc
    const base = this.project.pathFor(distNoCutSrcMainProject);

    const filesToUpdate = Helpers__NS__filesFrom(base, true)
      .filter(f => f.endsWith('.d.ts'))
      .map(f => f.replace(`${base}/`, ''));

    for (let index = 0; index < filesToUpdate.length; index++) {
      const relativePath = filesToUpdate[index];
      const source = crossPlatformPath(path.join(base, relativePath));
      const dest = crossPlatformPath(
        path.join(
          ___NS__isString(destinationOrDist)
            ? this.monitoredOutDir
            : destinationOrDist.nodeModules.pathFor(this.rootPackageName),
          relativePath,
        ),
      );
      // if (Helpers__NS__exists(dest)) {
      // console.log(dest);
      const sourceContent = Helpers__NS__readFile(source);

      Helpers__NS__writeFile(dest, this.dtsFixer.forBackendContent(sourceContent));
      // }
    }
    //#endregion
  }
  //#endregion
}