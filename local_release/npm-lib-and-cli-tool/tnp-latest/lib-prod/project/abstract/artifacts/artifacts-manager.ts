//#region imports
import { config, dotTaonFolder, dotTnpFolder, LibTypeEnum, taonPackageName, UtilsFilesFoldersSync__NS__copy, UtilsFilesFoldersSync__NS__copyFile, UtilsFilesFoldersSync__NS__filterDontCopy, UtilsFilesFoldersSync__NS__filterOnlyCopy, UtilsFilesFoldersSync__NS__getFilesFrom, UtilsFilesFoldersSync__NS__getFoldersFrom, UtilsFilesFoldersSync__NS__IGNORE_FOLDERS_FILES_PATTERNS, UtilsFilesFoldersSync__NS__move, UtilsFilesFoldersSync__NS__readFile, UtilsFilesFoldersSync__NS__UtilsFilesFoldersSyncGetFilesFromOptions, UtilsFilesFoldersSync__NS__writeFile } from 'tnp-core/lib-prod';
import { chalk, crossPlatformPath, fse, path, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { fileName } from 'tnp-core/lib-prod';
import { tnpPackageName } from 'tnp-core/lib-prod';
import { Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray } from 'tnp-helpers/lib-prod';

import { CURRENT_PACKAGE_VERSION } from '../../../build-info._auto-generated_';
import {
  appElectronTsFromSrc,
  appTsFromSrc,
  containerPrefix,
  distMainProject,
  dotFileTemplateExt,
  dotVscodeMainProject,
  globalScssFromSrc,
  indexTsFromLibFromSrc,
  indexTsFromSrc,
  libFromSrc,
  migrationsFromLib,
  nodeModulesMainProject,
  srcMainProject,
  TaonGeneratedFiles,
  taonJsonMainProject,
} from '../../../constants';
import { ReleaseArtifactTaon, EnvOptions, ReleaseType } from '../../../options';
import { EXPORT_TEMPLATE } from '../../../templates';
import { Project } from '../project';

import { ArtifactsGlobalHelper } from './__helpers__/artifacts-helpers';
import type {
  BaseArtifact,
  IArtifactProcessObj,
  ReleasePartialOutput,
} from './base-artifact';
import { FilesRecreator } from './npm-lib-and-cli-tool/tools/files-recreation';
//#endregion

/**
 * Artifact manager
 * Responsible for group actions on
 * current project or/and children projects
 */
export class ArtifactManager {
  public readonly filesRecreator: FilesRecreator;

  static for(project: Project): ArtifactManager {
    //#region @backendFunc
    const artifactProcess = {
      angularNodeApp:
        new (require('./angular-node-app').ArtifactAngularNodeApp)(project),
      npmLibAndCliTool:
        new (require('./npm-lib-and-cli-tool').ArtifactNpmLibAndCliTool)(
          project,
        ),
      electronApp: new (require('./electron-app').ArtifactElectronApp)(project),
      mobileApp: new (require('./mobile-app').ArtifactMobileApp)(project),
      docsWebapp: new (require('./docs-webapp').ArtifactDocsWebapp)(project),
      vscodePlugin: new (require('./vscode-plugin').ArtifactVscodePlugin)(
        project,
      ),
    } as IArtifactProcessObj;
    const globalHelper = new ArtifactsGlobalHelper(project);
    const manager = new ArtifactManager(artifactProcess, project, globalHelper);
    for (const key of Object.keys(artifactProcess)) {
      const instance = artifactProcess[___NS__camelCase(key)] as BaseArtifact<
        any,
        any
      >;
      // @ts-expect-error
      instance.artifacts = artifactProcess;
      // @ts-expect-error
      instance.globalHelper = globalHelper;
    }

    return manager as ArtifactManager;
    //#endregion
  }

  //#region constructor
  private constructor(
    /**
     * @deprecated
     * this will be protected in future
     */
    public artifact: IArtifactProcessObj,
    private project: Project,
    public globalHelper: ArtifactsGlobalHelper,
  ) {
    //#region @backend
    this.filesRecreator =
      new (require('./npm-lib-and-cli-tool/tools/files-recreation')
        .FilesRecreator as typeof FilesRecreator)(project);
    //#endregion
  }
  //#endregion

  //#region public methods / clear
  async clear(options: EnvOptions): Promise<void> {
    Helpers__NS__taskStarted(`

      Clearing artifacts temp data in ${this.project.name}

      `);

    this.project.removeFile([TaonGeneratedFiles.BUILD_INFO_MD]);

    if (this.project.framework.isStandaloneProject) {
      this.project.removeFolderByRelativePath(dotTnpFolder);
      this.project.removeFolderByRelativePath(dotTaonFolder);
    }

    await this.artifact.npmLibAndCliTool.clearPartial(options);
    await this.artifact.angularNodeApp.clearPartial(options);
    await this.artifact.electronApp.clearPartial(options);
    await this.artifact.mobileApp.clearPartial(options);
    await this.artifact.docsWebapp.clearPartial(options);
    await this.artifact.vscodePlugin.clearPartial(options);

    if (this.project.framework.isContainer) {
      [
        srcMainProject,
        ...this.filesRecreator.projectSpecificFilesForContainer(),
        ...this.filesRecreator.projectSpecificFilesForStandalone(),
        ...this.filesRecreator.filesTemplatesForStandalone(),
        ...this.filesRecreator
          .filesTemplatesForStandalone()
          .map(f => f.replace(dotFileTemplateExt, '')),
      ].forEach(f => {
        console.log('removing', f);
        this.project.remove(f, true);
      });
    }

    Helpers__NS__taskDone(`

      Done cleaning artifacts temp data in ${this.project.name}

      `);
  }

  async clearAllChildren(options: EnvOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.clear(options);
    }
  }
  //#endregion

  //#region public methods / struct
  /**
   * struct current project only
   * struct() <=> init() with struct flag
   */
  async struct(initOptions: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc
    initOptions.purpose = 'only structure init';
    initOptions.init.struct = true;
    return await this.init(initOptions);
    //#endregion
  }

  /**
   * struct all children artifacts
   */
  async structAllChildren(options: EnvOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.struct(options);
    }
  }
  //#endregion

  //#region public methods / init
  public async init(initOptions: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc

    //#region prevent not requested framework version
    if (this.project.framework.frameworkVersionLessThan('v4')) {
      Helpers__NS__warn(`Skipping artifacts init for project: ${this.project.name}`);
      return;
    }
    if (this.project.framework.frameworkVersionLessThan('v18')) {
      // TODO QUICK_FIX @REMOVE
      if (this.project.framework.isCoreProject) {
        return;
      }
      Helpers__NS__error(
        `Please upgrade taon framework version to to at least v18
        in project: ${this.project.name}

        ${taonJsonMainProject} => version => should be at least 18
        inside file
        ${chalk.underline(this.project.pathFor(taonJsonMainProject))}

        `,
        false,
        true,
      );
    }
    //#endregion

    this.project.quickFixes.fixPrettierCreatingConfigInNodeModules();
    if (!initOptions.init.struct) {
      //#region prevent incorrect node_modules with tnp dev mode
      if (config.frameworkName === tnpPackageName) {
        let node_modules_path = this.project.nodeModules.path;
        let node_modules_real_path = this.project.nodeModules.realPath;
        if (node_modules_path !== node_modules_real_path) {
          // const containerName = path.basename(
          //   path.dirname(node_modules_real_path),
          // );
          const properRelativeNodeModulesPath = crossPlatformPath(
            path.resolve(
              config.dirnameForTnp,
              this.project.ins.taonProjectsRelative,
              `${containerPrefix}${this.project.taonJson.frameworkVersion}`,
              nodeModulesMainProject,
            ),
          );
          if (node_modules_real_path !== properRelativeNodeModulesPath) {
            console.warn(`
    (DEV MODE TNP) DETECTED NODE_MODULES LINK NOT FROM PROPER CONTAINER
    fixing/linking proper node_modules path
              `);
            try {
              fse.unlinkSync(node_modules_path);
            } catch (error) {}
          }
        }
      }
      //#endregion

      await this.project.nodeModules.makeSureInstalled();
    }

    //#region check isomorphic dependencies for npm lib
    if (this.project.framework.isStandaloneProject) {
      let missingDependencies: string[] = [];
      const isomorphicDependenciesForNpmLib =
        this.project.taonJson.isomorphicDependenciesForNpmLib;

      for (const packageName of isomorphicDependenciesForNpmLib) {
        if (!this.project.nodeModules.hasPackageInstalled(packageName)) {
          missingDependencies.push(packageName);
        }
      }

      missingDependencies = missingDependencies.filter(
        f => ![this.project.name, this.project.nameForNpmPackage].includes(f),
      );

      if (missingDependencies.length > 0) {
        Helpers__NS__error(
          `
            (taon.json) - isomorphicDependenciesForNpmLib property has defined packages
            that are not installed in node_modules.

            Please rebuild first your external dependency project(s):
    ${missingDependencies.map(d => `- ${chalk.bold(d)}`).join()}`,
          false,
          true,
        );
      }
    }
    //#endregion

    this.recreateAndFixCoreFiles();

    initOptions = await this.project.environmentConfig.update(initOptions, {
      saveEnvToLibEnv:
        initOptions.release.targetArtifact ===
          ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
        !initOptions.release.targetArtifact,
    });

    this.project.framework.recreateVarsScss(initOptions);

    // TODO QUICK_FIX change env to something else
    Helpers__NS__removeFileIfExists(
      path.join(this.project.location, fileName.tnpEnvironment_json),
    );

    if (!initOptions.isCiProcess && !this.project.framework.isCoreProject) {
      // do some fixing on dev machine
      // TODO QUICK_FIX
      // if (this.project.framework.isStandaloneProject) {
      //   try {
      //     this.project.remove(`app`, true);
      //   } catch (error) {}
      // }

      // TODO QUICK_FIX when somehow linked node_modules to dist
      // make electron use node_modules from dist no from ./node_modules
      try {
        fse.unlinkSync(
          this.project.pathFor(`${distMainProject}/${nodeModulesMainProject}`),
        );
      } catch (error) {}

      try {
        this.project
          .run(
            `git rm -f ${dotVscodeMainProject}/${TaonGeneratedFiles.LAUNCH_JSON}`,
            {
              output: false,
              silence: true,
            },
          )
          .sync();
      } catch (error) {}
      this.project.removeFile('tsconfig.isomorphic-flat-bundle.json');
      this.project.removeFile('webpack.backend-bundle-build.js');
      this.project.removeFile('.eslintrc.json');
      this.project.removeFile('eslint.config.js');
      this.project.removeFile('tslint.json');
      this.project.removeFile(
        `${dotVscodeMainProject}/${TaonGeneratedFiles.LAUNCH_BACKUP_JSON}`,
      );
      this.project.removeFile('run-org.js');
      if (this.project.typeIs(LibTypeEnum.CONTAINER)) {
        this.project.removeFile(
          `${srcMainProject}/${TaonGeneratedFiles.VARS_SCSS}`,
        );
      }
      this.project.remove(`${srcMainProject}/docker`, true);
      if (
        this.project.hasFolder([srcMainProject, migrationsFromLib]) &&
        !this.project.hasFolder([srcMainProject, libFromSrc, migrationsFromLib])
      ) {
        HelpersTaon__NS__copy(
          this.project.pathFor([srcMainProject, migrationsFromLib]),
          this.project.pathFor([srcMainProject, libFromSrc, migrationsFromLib]),
          { recursive: true, overwrite: true },
        );
        Helpers__NS__remove(
          this.project.pathFor([srcMainProject, migrationsFromLib]),
        );
      }
      try {
        this.project
          .run(
            `git rm -f ${dotVscodeMainProject}/${TaonGeneratedFiles.LAUNCH_BACKUP_JSON}`,
            {
              output: false,
              silence: true,
            },
          )
          .sync();
      } catch (error) {}
    }

    // if organization project - children should have the same framework version
    if (
      this.project.framework.isContainer &&
      this.project.taonJson.isOrganization
    ) {
      for (const orgChild of this.project.children) {
        orgChild.taonJson.setFrameworkVersion(
          this.project.taonJson.frameworkVersion,
        );
      }
    }

    this.project.taonJson.preservePropsFromPackageJson(); // TODO temporary remove
    this.project.taonJson.preserveOldTaonProps(); // TODO temporary remove
    this.project.taonJson.saveToDisk('init');
    this.project.environmentConfig.updateGeneratedValues(initOptions);

    this.project.packagesRecognition.addIsomorphicPackagesToFile([
      this.project.nameForNpmPackage,
    ]);
    if (this.project.framework.isStandaloneProject) {
      await this.project.artifactsManager.artifact.angularNodeApp.appHostsRecreateHelper.runTask(
        {
          watch: initOptions.build.watch,
          initialParams: {
            envOptions: initOptions,
          },
        },
      );
    }

    await this.project.ignoreHide.init();
    await this.filesRecreator.init();
    await this.project.vsCodeHelpers.init({
      skipHiddingTempFiles: !initOptions.init.struct,
    });

    await this.project.linter.init();

    if (this.project.framework.isStandaloneProject) {
      await this.project.artifactsManager.globalHelper.branding.apply(
        !!initOptions.init.branding,
      );
    }

    this.artifact.npmLibAndCliTool.unlinkNodeModulesWhenTnp();
    const targetArtifact = initOptions.release.targetArtifact;

    if (this.project.framework.isStandaloneProject) {
      if (
        !targetArtifact ||
        targetArtifact === ReleaseArtifactTaon.DOCS_DOCS_WEBAPP
      ) {
        initOptions = await this.artifact.docsWebapp.initPartial(initOptions);
      }
      if (
        !targetArtifact ||
        targetArtifact === ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL
      ) {
        initOptions =
          await this.artifact.npmLibAndCliTool.initPartial(initOptions);
      }
      if (
        !targetArtifact ||
        targetArtifact === ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
        targetArtifact === ReleaseArtifactTaon.ANGULAR_NODE_APP
      ) {
        initOptions =
          await this.artifact.angularNodeApp.initPartial(initOptions);
      }
      if (
        !targetArtifact ||
        targetArtifact === ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
        targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
      ) {
        initOptions = await this.artifact.electronApp.initPartial(initOptions);
      }
      if (
        !targetArtifact ||
        targetArtifact === ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
        targetArtifact === ReleaseArtifactTaon.MOBILE_APP
      ) {
        initOptions = await this.artifact.mobileApp.initPartial(initOptions);
      }
      if (
        !targetArtifact ||
        targetArtifact === ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
        targetArtifact === ReleaseArtifactTaon.VSCODE_PLUGIN
      ) {
        initOptions = await this.artifact.vscodePlugin.initPartial(initOptions);
      }
    }
    return initOptions;
    //#endregion
  }

  public async initAllChildren(options: EnvOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.init(options.clone({}));
    }
  }
  //#endregion

  //#region public methods / build

  //#region public methods / interactive menu TODO
  /**
   * @deprecated
   */
  private buildWatchCmdForArtifact = (
    artifact: ReleaseArtifactTaon,
    options?: Partial<EnvOptions>,
  ): string => {
    options = EnvOptions.from(options);
    let params = '';

    // try {
    params = EnvOptions.getParamsString({
      ...options,
      release: { targetArtifact: artifact },
    });
    // } catch (error) {
    //   Helpers__NS__error(error, true, true);
    //   Helpers__NS__throwError(
    //     `Error while creating params for ${artifact} build command`,
    //   );
    // }

    return `${config.frameworkName} build${options.build.watch ? ':watch' : ''} ${params}`;
  };
  //#endregion

  //#region public methods / build standalone
  async build(buildOptions: EnvOptions): Promise<void> {
    if (!buildOptions.release.targetArtifact) {
      //#region  build Menu
      // TODO for unified build menu is not efficient enouth
      Helpers__NS__error(
        `

        Please use commands:

        ${config.frameworkName} build:watch:lib
        ${config.frameworkName} build:watch:app
        ${config.frameworkName} build:watch:electron
        ${config.frameworkName} docs:watch

        `,
        false,
        true,
      );
      // await this.init(buildOptions.clone({ build: { watch: false } }));
      // const processManager = new BaseProcessManger(this.project as any);

      // const ngBuildLibCommand = CommandConfig.from({
      //   name: `Isomorphic Nodejs/Angular library`,
      //   cmd: this.buildWatchCmdForArtifact('npm-lib-and-cli-tool'),
      //   goToNextCommandWhenOutput: {
      //     stdoutContains: COMPILATION_COMPLETE_LIB_NG_BUILD,
      //   },
      // });

      // const ngNormalAppPort =
      //   await this.artifact.angularNodeApp.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
      //     buildOptions.clone({ build: { websql: false } }),
      //   );

      // const ngWebsqlAppPort =
      //   await this.artifact.angularNodeApp.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
      //     buildOptions.clone({ build: { websql: true } }),
      //   );

      // const nodeBeAppPort =
      //   await this.artifact.angularNodeApp.NODE_BACKEND_PORT_UNIQ_KEY(
      //     buildOptions.clone(),
      //   );

      // const ngServeAppCommand = CommandConfig.from({
      //   name: `Angular (for Nodejs backend) frontend app`,
      //   cmd: this.buildWatchCmdForArtifact('angular-node-app', {
      //     ports: { ngNormalAppPort, nodeBeAppPort, ngWebsqlAppPort },
      //   }),
      //   shouldBeActiveOrAlreadyBuild: [ngBuildLibCommand],
      //   goToNextCommandWhenOutput: {
      //     stdoutContains: COMPILATION_COMPLETE_APP_NG_SERVE,
      //   },
      //   headerMessageWhenActive:
      //     `Normal Angular App is running on ` +
      //     `http://localhost:${ngNormalAppPort}`,
      // });

      // const ngServeWebsqlAppCommand = CommandConfig.from({
      //   name: `Angular (for Websql backend) frontend app`,
      //   cmd: this.buildWatchCmdForArtifact('angular-node-app', {
      //     build: { websql: true },
      //     ports: { ngNormalAppPort, nodeBeAppPort, ngWebsqlAppPort },
      //   }),
      //   shouldBeActiveOrAlreadyBuild: [ngBuildLibCommand],
      //   goToNextCommandWhenOutput: {
      //     stdoutContains: COMPILATION_COMPLETE_APP_NG_SERVE,
      //   },
      //   headerMessageWhenActive:
      //     `Websql Angular App is running on ` +
      //     `http://localhost:${ngWebsqlAppPort}`,
      // });

      // const documenationCommand = CommandConfig.from({
      //   name: `Documentation (mkdocs, compodoc, typedoc)`,
      //   cmd: this.buildWatchCmdForArtifact('docs-webapp'),
      //   headerMessageWhenActive:
      //     `Documentation is running on http://localhost:` +
      //     `${await this.artifact.docsWebapp.DOCS_ARTIFACT_PORT_UNIQ_KEY(
      //       EnvOptions.from(buildOptions),
      //     )}`,
      // });

      // await processManager.init({
      //   watch: !!buildOptions.build.watch,
      //   header: `

      //   Build process for ${this.project.name}

      //   `,
      //   title: `Select what do you want to build ${buildOptions.build.watch ? 'in watch mode' : ''}?`,
      //   commands: [
      //     ngBuildLibCommand,
      //     ngServeAppCommand,
      //     ngServeWebsqlAppCommand,
      //     documenationCommand,
      //   ],
      // });
      //#endregion
    } else {
      //#region partial build

      //#region framework version check
      while (
        this.project.framework.frameworkVersionLessThan(
          CURRENT_PACKAGE_VERSION.split('.')[0] as any,
        )
      ) {
        if (
          this.project.parent &&
          this.project.parent?.framework.isContainer &&
          this.project.parent?.taonJson.isOrganization &&
          this.project.taonJson.frameworkVersion !==
            this.project.parent.taonJson.frameworkVersion
        ) {
          this.project.taonJson.setFrameworkVersion(
            this.project.parent.taonJson.frameworkVersion,
          );
          continue;
        }
        Helpers__NS__error(
          `
              Please upgrade taon framework version to at least v${CURRENT_PACKAGE_VERSION.split('.')[0]} (in taon.jsonc)
              or install previous version of taon cli tool for ${this.project.framework.frameworkVersion}:

              npm i -g ${taonPackageName}@${this.project.framework.frameworkVersion?.replace('v', '')}

            `,
          false,
          true,
        );
        break; // not needed but to be sure
      }
      //#endregion

      if (
        !buildOptions.release.targetArtifact ||
        buildOptions.release.targetArtifact ===
          ReleaseArtifactTaon.DOCS_DOCS_WEBAPP
      ) {
        await this.artifact.docsWebapp.buildPartial(buildOptions.clone());
      }
      if (
        !buildOptions.release.targetArtifact ||
        buildOptions.release.targetArtifact ===
          ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL
      ) {
        await this.artifact.npmLibAndCliTool.buildPartial(buildOptions.clone());
      }
      if (
        !buildOptions.release.targetArtifact ||
        buildOptions.release.targetArtifact ===
          ReleaseArtifactTaon.ANGULAR_NODE_APP
      ) {
        await this.artifact.angularNodeApp.buildPartial(buildOptions.clone());
      }
      if (
        !buildOptions.release.targetArtifact ||
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
      ) {
        await this.artifact.electronApp.buildPartial(buildOptions.clone());
      }
      if (
        !buildOptions.release.targetArtifact ||
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.MOBILE_APP
      ) {
        await this.artifact.mobileApp.buildPartial(buildOptions.clone());
      }
      if (
        !buildOptions.release.targetArtifact ||
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.MOBILE_APP
      ) {
        await this.artifact.vscodePlugin.buildPartial(buildOptions.clone());
      }
      //#endregion
    }
  }
  //#endregion

  //#region public methods / build all children
  async buildAllChildren(
    options: EnvOptions,
    children = this.project.children,
  ): Promise<void> {
    children = this.project.ins // @ts-ignore BaseProject inheritace compatiblity with Project problem
      .sortGroupOfProject<Project>(
        children,
        proj => [
          ...proj.taonJson.dependenciesNamesForNpmLib,
          ...proj.taonJson.isomorphicDependenciesForNpmLib,
          ...proj.taonJson.peerDependenciesNamesForNpmLib,
        ],
        proj => proj.nameForNpmPackage,
        this.project.taonJson.overridePackagesOrder,
      );

    if (options.container.only.length > 0) {
      children = children.filter(c => {
        return options.container.only.includes(c.name);
      });
    }

    if (options.container.skip.length > 0) {
      children = children.filter(c => {
        return !options.container.skip.includes(c.name);
      });
    }

    const endIndex = this.project.children.findIndex(
      c => c.name === options.container.end,
    );
    if (endIndex !== -1) {
      children = children.filter((c, i) => {
        return i <= endIndex;
      });
    }
    const startIndex = this.project.children.findIndex(
      c => c.name === options.container.start,
    );
    if (startIndex !== -1) {
      children = children.filter((c, i) => {
        return i >= startIndex;
      });
    }

    if (options.container.skipReleased) {
      children = children.filter((c, i) => {
        const lastCommitMessage = c?.git?.lastCommitMessage()?.trim();
        return !lastCommitMessage?.startsWith('release: ');
      });
    }

    if (
      !(await this.project.npmHelpers.shouldReleaseMessage({
        releaseVersionBumpType: options.release.releaseVersionBumpType,
        children: children as any,
        whatToRelease: {
          itself: false,
          children: true,
        },
        skipQuestionToUser: options.isCiProcess,
        actionType: 'build',
      }))
    ) {
      return;
    }

    for (const child of children) {
      await child.artifactsManager.build(options);
    }
  }
  //#endregion

  //#endregion

  //#region public methods / release
  public async release(
    releaseOptions: EnvOptions,
    autoReleaseProcess = false,
  ): Promise<void> {
    //#region @backendFunc

    //#region handle autorelease
    if (!autoReleaseProcess && releaseOptions.release.autoReleaseUsingConfig) {
      let artifactsToRelease =
        this.project.taonJson.autoReleaseConfigAllowedItems.filter(item => {
          if (
            !releaseOptions.release.autoReleaseTaskName ||
            this.project.taonJson.createOnlyTagWhenRelease
          ) {
            return true;
          }
          const allowed =
            item.taskName === releaseOptions.release.autoReleaseTaskName;
          if (!allowed) {
            Helpers__NS__logWarn(`Skipping task ${item.taskName}`);
          }
          return allowed;
        });

      for (const item of artifactsToRelease) {
        const clonedOptions = releaseOptions.clone({
          release: {
            targetArtifact: item.artifactName,
            envName: item.envName || '__',
            envNumber: item.envNumber,
            releaseType: item.releaseType || releaseOptions.release.releaseType,
            taonInstanceIp: item.taonInstanceIp,
          },
        });
        if (!this.project.taonJson.isUsingOwnNodeModulesInsteadCoreContainer) {
          await this.project.clear();
        }
        await this.release(clonedOptions, true);
      }
      return;
    }
    //#endregion

    releaseOptions =
      await this.project.environmentConfig.update(releaseOptions);

    let releaseOutput: ReleasePartialOutput;

    //#region npm build helper
    const npmLibBUild = async (options: EnvOptions): Promise<void> => {
      const libConfig = options.clone({
        build: {
          watch: false,
        },
        release: {
          skipCodeCutting: true,
          targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        },
      });

      // normal lib build
      await this.artifact.npmLibAndCliTool.buildPartial(
        libConfig.clone({
          build: {
            prod: false,
          },
        }),
      );

      // prod lib build
      await this.artifact.npmLibAndCliTool.buildPartial(
        libConfig.clone({
          build: {
            prod: true,
          },
        }),
      );
    };
    //#endregion

    //#region docs app
    if (
      !releaseOptions.release.targetArtifact ||
      releaseOptions.release.targetArtifact ===
        ReleaseArtifactTaon.DOCS_DOCS_WEBAPP
    ) {
      releaseOutput =
        await this.artifact.docsWebapp.releasePartial(releaseOptions);
    }
    //#endregion

    //#region npm lib and cli tool
    if (
      !releaseOptions.release.targetArtifact ||
      releaseOptions.release.targetArtifact ===
        ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL
    ) {
      releaseOutput =
        await this.artifact.npmLibAndCliTool.releasePartial(releaseOptions);
    }
    //#endregion

    //#region angular-node-app
    if (
      !releaseOptions.release.targetArtifact ||
      releaseOptions.release.targetArtifact ===
        ReleaseArtifactTaon.ANGULAR_NODE_APP
    ) {
      if (releaseOptions.release.releaseType === ReleaseType.STATIC_PAGES) {
        releaseOptions.build.baseHref =
          this.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(
            releaseOptions,
          );
      }
      await npmLibBUild(releaseOptions);
      releaseOutput =
        await this.artifact.angularNodeApp.releasePartial(releaseOptions);
    }
    //#endregion

    //#region electron app
    if (
      !releaseOptions.release.targetArtifact ||
      releaseOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
    ) {
      await npmLibBUild(
        releaseOptions.clone({
          build: {
            pwa: {
              disableServiceWorker: true,
            },
            baseHref: `./`,
          },
          copyToManager: {
            skip: true,
          },
          release: {
            targetArtifact: ReleaseArtifactTaon.ELECTRON_APP,
          },
        }),
      );

      releaseOutput =
        await this.artifact.electronApp.releasePartial(releaseOptions);
    }
    //#endregion

    //#region mobile app
    if (
      !releaseOptions.release.targetArtifact ||
      releaseOptions.release.targetArtifact === ReleaseArtifactTaon.MOBILE_APP
    ) {
      await npmLibBUild(releaseOptions);
      releaseOutput =
        await this.artifact.mobileApp.releasePartial(releaseOptions);
    }
    //#endregion

    //#region vscode plugin
    if (
      !releaseOptions.release.targetArtifact ||
      releaseOptions.release.targetArtifact ===
        ReleaseArtifactTaon.VSCODE_PLUGIN
    ) {
      await npmLibBUild(releaseOptions);
      releaseOutput =
        await this.artifact.vscodePlugin.releasePartial(releaseOptions);
    }
    //#endregion

    //#region tag and push
    if (!releaseOptions.release.skipTagGitPush) {
      if (!releaseOptions.release.autoReleaseUsingConfig) {
        Helpers__NS__info(
          `Checking project path "${releaseOutput.releaseProjPath}" ..`,
        );
        await this.project.releaseProcess.checkBundleQuestion(
          releaseOutput.releaseProjPath,
          `[${releaseOptions.release.releaseType}] Check ${chalk.bold('bundled code')} before tagging/pushing`,
        );
      }

      releaseOutput.projectsReposToPush =
        releaseOutput.projectsReposToPush || [];

      for (const repoAbsPath of Utils__NS__uniqArray(
        releaseOutput.projectsReposToPush,
      )) {
        Helpers__NS__info(`Checking  path "${repoAbsPath}" `);
        if (!releaseOptions.release.autoReleaseUsingConfig) {
          await this.project.releaseProcess.checkBundleQuestion(
            repoAbsPath,
            `[${releaseOptions.release.releaseType}] Check ${chalk.bold('project repo')} before pushing`,
          );
        }
        await HelpersTaon__NS__git__NS__tagAndPushToGitRepo(repoAbsPath, {
          newVersion: releaseOutput.resolvedNewVersion,
          autoReleaseUsingConfig: releaseOptions.release.autoReleaseUsingConfig,
          isCiProcess: releaseOptions.isCiProcess,
          skipTag: true,
        });
      }

      for (const repoAbsPath of Utils__NS__uniqArray(
        releaseOutput.projectsReposToPushAndTag,
      )) {
        if (!releaseOptions.release.autoReleaseUsingConfig) {
          Helpers__NS__info(`Checking  path "${repoAbsPath}" ..`);
          await this.project.releaseProcess.checkBundleQuestion(
            repoAbsPath,
            `[${releaseOptions.release.releaseType}] Check ${chalk.bold('project repo')} before tagging/pushing`,
          );
        }
        await HelpersTaon__NS__git__NS__tagAndPushToGitRepo(repoAbsPath, {
          newVersion: releaseOutput.resolvedNewVersion,
          autoReleaseUsingConfig: releaseOptions.release.autoReleaseUsingConfig,
          isCiProcess: releaseOptions.isCiProcess,
        });
      }
    }

    if (releaseOutput.deploymentFunction) {
      if (releaseOptions.release.skipDeploy) {
        Helpers__NS__warn(`Skipping deployment as per release.skipDeploy`);
      } else {
        await releaseOutput.deploymentFunction();
      }
    }
    //#endregion

    //#endregion
  }

  async releaseAllChildren(
    options: EnvOptions,
    children = this.project.children,
  ): Promise<void> {
    //#region @backendFunc
    const howManyChildren = children.length;
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (!options.isCiProcess) {
        UtilsTerminal__NS__clearConsole();
      }
      Helpers__NS__info(
        `Releasing container child: ${child.name}  (${howManyChildren}/${index + 1}) `,
      );
      await this.tryCatchWrapper(
        async () => {
          await child.artifactsManager.release(options);
        },
        'release',
        child,
      );
    }

    //#endregion
  }
  //#endregion

  //#region public methods / try catch wrapper
  public async tryCatchWrapper(
    action: () => any,
    actionName: 'release' | 'build' | 'init' | 'clear' | 'struct' | 'brand',
    project: Project = this.project,
  ): Promise<void> {
    //#region @backendFunc
    while (true) {
      try {
        await action();
        return;
      } catch (error) {
        if (error instanceof Error && error?.name === 'ExitPromptError') {
          process.exit(0);
        }
        console.error(error);
        Helpers__NS__error(
          `Not able to ${actionName} your project ${chalk.bold(project.genericName)}`,
          true,
          true,
        );
        const errorOptions = {
          tryAgain: { name: 'Try again' },
          skipPackage: { name: `Skip ${actionName} for this project` },
          openInVscode: { name: `Open in VSCode ... try release again` },
          exit: { name: 'Exit process' },
        };
        const res = await UtilsTerminal__NS__select<keyof typeof errorOptions>({
          choices: errorOptions,
          question: 'What you wanna do ?',
        });

        if (res === 'openInVscode') {
          project.vsCodeHelpers.openInVscode();
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
            message: 'Press any key to try release again',
          });
        }

        if (res === 'exit') {
          process.exit(0);
        } else if (res === 'skipPackage') {
          break;
        }
      }
    }
    //#endregion
  }
  //#endregion

  //#region private methods / recreation and fixing core files
  private recreateAndFixCoreFiles(): void {
    //#region @backendFunc
    const project = this.project;
    if (
      !project.framework.isCoreProject &&
      project.framework.isStandaloneProject
    ) {
      project.framework.recreateFileFromCoreProject({
        fileRelativePath: [srcMainProject, appTsFromSrc],
      });

      project.framework.preventNotExistedComponentAndModuleInAppTs();

      project.framework.recreateFileFromCoreProject({
        fileRelativePath: [srcMainProject, globalScssFromSrc],
      });

      project.framework.recreateFileFromCoreProject({
        fileRelativePath: [srcMainProject, appElectronTsFromSrc],
      });

      const indexInSrcFile = project.pathFor([srcMainProject, indexTsFromSrc]);

      if (!Helpers__NS__exists(indexInSrcFile)) {
        Helpers__NS__writeFile(indexInSrcFile, EXPORT_TEMPLATE(libFromSrc));
      }
    }
    //#endregion
  }
  //#endregion
}