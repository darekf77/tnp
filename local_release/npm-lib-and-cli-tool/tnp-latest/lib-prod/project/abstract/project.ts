//#region imports
import { config, dotTaonFolder, LibTypeEnum } from 'tnp-core/lib-prod';
import { chalk, fse, os, requiredForDev } from 'tnp-core/lib-prod';
import { child_process } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings } from 'tnp-core/lib-prod';
import { UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { BaseProject, PushProcessOptions, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray } from 'tnp-helpers/lib-prod';

import {
  binMainProject,
  containerPrefix,
  distMainProject,
  docsMainProject,
  nodeModulesMainProject,
  srcMainProject,
  taonJsonMainProject,
} from '../../constants';
import { EnvOptions, ReleaseType } from '../../options';

import type { EnvironmentConfig } from './artifacts/__helpers__/environment-config/environment-config';
import { ArtifactManager } from './artifacts/artifacts-manager';
import { FileFoldersOperations } from './file-folders-operations';
import type { Framework } from './framework';
import { Git } from './git';
import { IgnoreHide } from './ignore-hide';
import { LibraryBuild } from './library-build';
import { LinkedProjects } from './linked-projects';
import { Linter } from './linter';
import { NodeModules } from './node-modules';
import { NpmHelpers } from './npm-helpers';
import { PackageJSON } from './package-json';
import { PackagesRecognition } from './packages-recognition';
import { TaonProjectResolve } from './project-resolve';
import { QuickFixes } from './quick-fixes';
import { Refactor } from './refactor';
import type { ReleaseProcess } from './release-process';
import { TaonJson } from './taonJson';
import { Vscode } from './vscode-helper';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class Project extends BaseProject<Project, CoreModels__NS__LibType> {
  //#region static

  //#region static / instance of resolve
  static ins = new TaonProjectResolve(Project, () => {
    //#region @backendFunc
    return global.frameworkName;
    //#endregion
  });
  //#endregion

  //#endregion

  //#region fields
  // @ts-ignore TODO weird inheritance problem
  public readonly type: CoreModels__NS__LibType;

  // @ts-ignore TODO weird inheritance problem
  public readonly vsCodeHelpers: Vscode;

  // @ts-ignore TODO weird inheritance problem
  public readonly releaseProcess: ReleaseProcess;

  // @ts-ignore TODO weird inheritance problem
  public readonly npmHelpers: NpmHelpers;

  get packageJson(): PackageJSON {
    return this.npmHelpers.packageJson as any;
  }

  // @ts-ignore TODO weird inheritance problem
  get nodeModules(): NodeModules {
    return this.npmHelpers.nodeModules as any;
  }

  // @ts-ignore TODO weird inheritance problem
  public readonly linter: Linter;

  public readonly framework: Framework;

  // @ts-ignore TODO weird inheritance problem
  public readonly quickFixes: QuickFixes;

  public readonly artifactsManager: ArtifactManager;

  // @ts-ignore TODO weird inheritance problem
  public readonly git: Git;

  // @ts-ignore TODO weird inheritance problem
  public readonly ignoreHide: IgnoreHide;

  public readonly taonJson: TaonJson;

  public readonly packagesRecognition: PackagesRecognition;

  public readonly environmentConfig: EnvironmentConfig;

  public readonly refactor: Refactor;

  //#endregion

  //#region constructor

  //#region @backend
  constructor(location?: string) {
    super(crossPlatformPath(___NS__isString(location) ? location : ''));
    this.taonJson = new TaonJson(this);

    this.setType(this.taonJson.type || LibTypeEnum.UNKNOWN);

    this.framework = new (require('./framework').Framework as typeof Framework)(
      this as any,
    );

    this.git = new (require('./git').Git as typeof Git)(this as any);

    this.ignoreHide = new (require('./ignore-hide')
      .IgnoreHide as typeof IgnoreHide)(this as any);

    this.fileFoldersOperations = new (require('./file-folders-operations')
      .FileFoldersOperations as typeof FileFoldersOperations)(this as any);

    this.libraryBuild = new (require('./library-build')
      .LibraryBuild as typeof LibraryBuild)(this as any) as any;

    this.npmHelpers = new (require('./npm-helpers')
      .NpmHelpers as typeof NpmHelpers)(this);

    this.linkedProjects = new (require('./linked-projects')
      .LinkedProjects as typeof LinkedProjects)(this as any);

    this.vsCodeHelpers = new (require('./vscode-helper')
      .Vscode as typeof Vscode)(this);

    this.releaseProcess = new (require('./release-process')
      .ReleaseProcess as typeof ReleaseProcess)(this);

    this.quickFixes = new (require('./quick-fixes')
      .QuickFixes as typeof QuickFixes)(this);

    this.linter = new (require('./linter').Linter as typeof Linter)(this);

    this.packagesRecognition = new (require('./packages-recognition')
      .PackagesRecognition as typeof PackagesRecognition)(this);

    this.artifactsManager = ArtifactManager.for(this);

    this.environmentConfig =
      new (require('./artifacts/__helpers__/environment-config/environment-config')
        .EnvironmentConfig as typeof EnvironmentConfig)(this);

    this.refactor = new Refactor(this);
    Project.ins.add(this);
  }
  //#endregion

  //#endregion

  //#region api / struct
  async struct(initOptions?: EnvOptions): Promise<void> {
    initOptions = EnvOptions.from(initOptions);

    if (this.framework.isStandaloneProject) {
      await this.artifactsManager.struct(initOptions);
    }
    if (this.framework.isContainer) {
      await this.artifactsManager.struct(initOptions);
      await this.artifactsManager.structAllChildren(initOptions);
    }

    initOptions.finishCallback();
  }
  //#endregion

  //#region api / init
  async init(initOptions?: EnvOptions): Promise<void> {
    initOptions = EnvOptions.from(initOptions);

    if (this.framework.isStandaloneProject) {
      await this.artifactsManager.init(initOptions);
    }
    if (this.framework.isContainer) {
      await this.artifactsManager.init(initOptions);
      if (initOptions.recursiveAction) {
        await this.artifactsManager.initAllChildren(initOptions);
      }
    }

    if (!initOptions.build.watch) {
      initOptions.finishCallback();
    }
  }
  //#endregion

  //#region api / build
  async build(buildOptions?: EnvOptions): Promise<void> {
    buildOptions = EnvOptions.from(buildOptions);

    if (this.framework.isStandaloneProject) {
      await this.artifactsManager.build(buildOptions);
    }
    if (this.framework.isContainer) {
      buildOptions.build.watch = false; // there is no need to watch for container ever
      await this.artifactsManager.build(buildOptions);
      if (buildOptions.recursiveAction) {
        await this.artifactsManager.buildAllChildren(buildOptions);
      }
    }

    if (!buildOptions.build.watch && !!buildOptions.release.targetArtifact) {
      buildOptions.finishCallback();
    }
  }
  //#endregion

  //#region api / release
  public async release(releaseOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    releaseOptions = EnvOptions.from(releaseOptions);

    const endCallback = (): void => {
      releaseOptions.finishCallback && releaseOptions.finishCallback();
    };

    if (
      this.framework.isStandaloneProject &&
      !this.hasValidAutoReleaseConfig(releaseOptions)
    ) {
      endCallback();
      return;
    }

    await this.npmHelpers.checkProjectReadyForNpmRelease();
    if (
      releaseOptions.release.targetArtifact === 'npm-lib-and-cli-tool' &&
      releaseOptions.release.releaseType !== 'local' &&
      releaseOptions.release.releaseType !== 'static-pages'
    ) {
      await this.npmHelpers.makeSureLoggedInToNpmRegistry();
    }

    const newVersion = this.packageJson.resolvePossibleNewVersion(
      releaseOptions.release.releaseVersionBumpType,
    );

    //#region prepare release children
    let children = releaseOptions.release.autoReleaseUsingConfig
      ? this.children.filter(
          f =>
            f.taonJson.autoReleaseConfigAllowedItems.length > 0 ||
            (f.framework.isContainer && f.taonJson.createOnlyTagWhenRelease),
        )
      : this.children;

    // console.log('before sorting ',children.map(c => c.name));

    if (this.framework.isContainer) {
      if (this.taonJson.createOnlyTagWhenRelease) {
        Helpers__NS__warn(
          `Container project is set to only create git tag during release process.` +
            `No releases will be done inside children projects.`,
        );
        this.packageJson.setVersion(newVersion);
        await HelpersTaon__NS__git__NS__tagAndPushToGitRepo(this.location, {
          newVersion,
          autoReleaseUsingConfig: releaseOptions.release.autoReleaseUsingConfig,
          isCiProcess: releaseOptions.isCiProcess,
          skipTag: false,
        });
        endCallback();
        return;
      }

      children = this.ins // @ts-ignore BaseProject inheritace compatiblity with Project problem
        .sortGroupOfProject<Project>(
          children,
          proj => [
            ...proj.taonJson.dependenciesNamesForNpmLib,
            ...proj.taonJson.isomorphicDependenciesForNpmLib,
            ...proj.taonJson.peerDependenciesNamesForNpmLib,
          ],
          proj => proj.nameForNpmPackage,
          this.taonJson.overridePackagesOrder,
        )
        .filter(
          d =>
            d.framework.isStandaloneProject ||
            (d.framework.isContainer && d.taonJson.createOnlyTagWhenRelease),
        );

      // console.log({
      //   overridePackagesOrder: this.taonJson.overridePackagesOrder,
      // });

      if (releaseOptions.container.only.length > 0) {
        children = children.filter(c => {
          return releaseOptions.container.only.includes(c.name);
        });
      }

      if (releaseOptions.container.skip.length > 0) {
        children = children.filter(c => {
          return !releaseOptions.container.skip.includes(c.name);
        });
      }

      const endIndex = children.findIndex(
        c => c.name === releaseOptions.container.end,
      );
      if (endIndex !== -1) {
        children = children.filter((c, i) => {
          return i <= endIndex;
        });
      }

      const startIndex = children.findIndex(
        c => c.name === releaseOptions.container.start,
      );
      if (startIndex !== -1) {
        children = children.filter((c, i) => {
          return i >= startIndex;
        });
      }

      if (releaseOptions.container.skipReleased) {
        children = children.filter((c, i) => {
          const lastCommitMessage = c?.git?.lastCommitMessage()?.trim();
          return !lastCommitMessage?.startsWith('release: ');
        });
      }
    }

    if (releaseOptions.release.autoReleaseUsingConfig) {
      children = children.filter(child => {
        if (!child.framework.isStandaloneProject) {
          return true;
        }
        const hasConfigForAutoRelease = child.hasValidAutoReleaseConfig(
          releaseOptions,
          { project: child, hideTaskErrors: true },
        );
        return hasConfigForAutoRelease;
      });
    }

    // console.log('after sorting ',children.map(c => c.name));
    //#endregion

    //#region question about release
    if (!releaseOptions.isCiProcess) {
      Helpers__NS__clearConsole();
    }
    if (
      !(await this.npmHelpers.shouldReleaseMessage({
        releaseVersionBumpType: releaseOptions.release.releaseVersionBumpType,
        versionToUse: newVersion,
        children: children as any,
        whatToRelease: {
          itself: this.framework.isStandaloneProject,
          children: this.framework.isContainer,
        },
        skipQuestionToUser:
          (this.framework.isStandaloneProject &&
            releaseOptions.release.autoReleaseUsingConfig) ||
          releaseOptions.release.skipReleaseQuestion,
        messagePrefix: `${releaseOptions.release.releaseType}-release`,
      }))
    ) {
      return;
    }
    //#endregion

    //#region resolve taon instances
    if (
      ([ReleaseType.MANUAL, ReleaseType.CLOUD] as ReleaseType[]).includes(
        releaseOptions.release.releaseType,
      ) &&
      releaseOptions.release.targetArtifact === 'angular-node-app'
    ) {
      if (releaseOptions.release.autoReleaseUsingConfig) {
        // use from config
      } else {
        const ctrl =
          await this.ins.taonProjectsWorker.instancesWorker.getRemoteControllerFor(
            {
              methodOptions: {
                calledFrom: 'Project.release',
              },
            },
          );

        const instances = (await ctrl.getEntities().request())?.body.json || [];
        const options = instances.map(i => ({
          name: `${i.name} (${i.ipAddress})`,
          value: i.ipAddress,
        }));
        releaseOptions.release.taonInstanceIp = await UtilsTerminal__NS__select({
          choices: options,
          autocomplete: true,
          question: `[${releaseOptions.release.releaseType}-release] Select to what instance you want to release`,
        });
      }

      console.log(
        chalk.gray(
          `You selected to release to instance: ${releaseOptions.release.taonInstanceIp}`,
        ),
      );
    }
    //#endregion

    //#region resolve git changes

    if (!releaseOptions.release.skipTagGitPush) {
      if (!releaseOptions.isCiProcess) {
        Helpers__NS__clearConsole();
      }
      if (this.framework.isStandaloneProject) {
        if (!releaseOptions.release.skipResolvingGitChanges) {
          await this.git.resolveLastChanges({
            tryAutomaticActionFirst:
              releaseOptions.release.autoReleaseUsingConfig,
          });
        }
      }
      if (this.framework.isContainer) {
        if (!releaseOptions.release.skipResolvingGitChanges) {
          for (const child of children) {
            if (!releaseOptions.isCiProcess) {
              Helpers__NS__clearConsole();
            }
            Helpers__NS__info(
              `Checking if project has any unfinished/uncommitted git changes: ${child.name}`,
            );
            await child.git.resolveLastChanges({
              tryAutomaticActionFirst:
                releaseOptions.release.autoReleaseUsingConfig,
              projectNameAsOutputPrefix: child.name,
            });
          }
        }
      }
    }
    if (!releaseOptions.isCiProcess) {
      Helpers__NS__clearConsole();
    }
    //#endregion

    //#region actual release process

    if (this.framework.isStandaloneProject) {
      await this.artifactsManager.tryCatchWrapper(async () => {
        await this.artifactsManager.release(releaseOptions);
      }, 'release');
    }
    if (this.framework.isContainer) {
      await this.artifactsManager.releaseAllChildren(releaseOptions, children);
    }
    //#endregion

    endCallback();
    //#endregion
  }
  //#endregion

  //#region api / lint
  async lint(lintOptions?: PushProcessOptions) {
    // await this.linter.start()
  }
  //#endregion

  //#region api / clear
  public async clear(clearOptions?: Partial<EnvOptions>) {
    clearOptions = EnvOptions.from(clearOptions);
    await this.artifactsManager.clear(clearOptions as EnvOptions);
    if (clearOptions.recursiveAction) {
      await this.artifactsManager.clearAllChildren(clearOptions as EnvOptions);
    }
  }
  //#endregion

  protected hasValidAutoReleaseConfig(
    envOptions: EnvOptions,
    options?: {
      project?: Project;
      hideTaskErrors?: boolean;
    },
  ): boolean {
    //#region @backendFunc
    options = options || {};
    const project = options.project || this;

    if (!envOptions.release.autoReleaseUsingConfig) {
      return true;
    }

    if (
      envOptions.release.autoReleaseUsingConfig &&
      !envOptions.release.autoReleaseTaskName
    ) {
      Helpers__NS__error(
        `When using auto releae config (from taon.json) you have to provide task name as argument.`,
        false,
        true,
      );
    }

    const task = project.taonJson.autoReleaseConfigAllowedItems.find(
      i => i.taskName === envOptions.release.autoReleaseTaskName,
    );
    const taskNames = project.taonJson.autoReleaseConfigAllowedItems
      .filter(f => f.taskName)
      .map(i => i.taskName);

    if (!task) {
      if (!options.hideTaskErrors) {
        Helpers__NS__error(
          `Auto release task name: "${envOptions.release.autoReleaseTaskName}" is not ` +
            `present in project auto release configuration.` +
            ` Available task names are: ${taskNames.join(', ')}`,
          true,
          true,
        );
      }
      return false;
    }
    const regexContainerOnlySmallLettersAndDash = /^[a-z\-]+$/;
    if (regexContainerOnlySmallLettersAndDash.test(task.taskName) === false) {
      if (!options.hideTaskErrors) {
        Helpers__NS__error(
          `

            invalid item ${chalk.bold(task.taskName)} in "autoReleaseConfigAllowedItems" in taon.json

            ${chalk.bold('taskName')} can contains only small letters and dash(-).

            Current value: "${chalk.bold(task.taskName)}"

            `,
          true,
          true,
        );
      }
      return false;
    }
    return true;

    //#endregion
  }

  // get env(): EnvOptions  //
  //   return this.environmentConfig.config;
  // }

  get branding() {
    return this.artifactsManager.globalHelper.branding;
  }

  //#region taon relative projects paths
  /**
   * @deprecated
   */
  get tnpCurrentCoreContainer(): Project {
    return this.ins.From(
      this.pathFor(
        `${this.ins.taonProjectsRelative}/${containerPrefix}${this.framework.frameworkVersion}`,
      ),
    );
  }

  //#endregion

  //#region name
  /**
   * @overload
   */
  public get name(): string {
    //#region @backendFunc
    if (this.typeIs(LibTypeEnum.UNKNOWN_NPM_PROJECT)) {
      if (
        this.packageJson.name !== path.basename(this.location) &&
        path.basename(path.dirname(this.location)) === 'external'
      ) {
        return path.basename(this.location);
      }
    }
    return path.basename(this.location);
    //#endregion
  }
  //#endregion

  get nameForCli(): string {
    if (this.taonJson.overrideNameForCli) {
      return this.taonJson.overrideNameForCli;
    }
    return this.name;
  }

  //#region name for npm package
  /**
   * @overload
   */
  get nameForNpmPackage(): string {
    //#region @backendFunc
    if (
      this.framework.isStandaloneProject &&
      this.parent?.framework?.isContainer &&
      this.parent?.taonJson.isOrganization
    ) {
      let nameWhenInOrganization = this.taonJson.nameWhenInsideOrganiation
        ? this.taonJson.nameWhenInsideOrganiation
        : this.name;

      nameWhenInOrganization = this.taonJson.overrideNpmName
        ? this.taonJson.overrideNpmName
        : nameWhenInOrganization;

      return `@${this.parent.name}/${nameWhenInOrganization}`;
    }
    return this.taonJson.overrideNpmName
      ? this.taonJson.overrideNpmName
      : this.name;
    //#endregion
  }
  //#endregion

  //#region info
  async info(): Promise<string> {
    //#region @backendFunc
    const children = (this.children || [])
      .map(c => '- ' + c.genericName)
      .join('\n');

    const linkedProjects = (this.linkedProjects.linkedProjects || [])
      .map(c => '- ' + c.relativeClonePath)
      .join('\n');

    const gitChildren = (this.git.gitChildren || [])
      .map(c => '- ' + c.genericName)
      .join('\n');

    return `

    name: ${this.name}
    basename: ${this.basename}
    nameForNpmPackage: ${this.nameForNpmPackage}
    has node_modules :${!this.nodeModules.empty}
    uses it own node_modules: ${this.taonJson.isUsingOwnNodeModulesInsteadCoreContainer}
    version: ${this.packageJson.version}
    private: ${this.packageJson?.isPrivate}
    monorepo: ${this.isMonorepo}
    parent: ${this.parent?.name}
    grandpa: ${this.grandpa?.name}
    children: ${this.children.length}
    core container location: ${this.framework.coreContainer?.location}
    core project location: ${this.framework.coreProject?.location}

    isStandaloneProject: ${this.framework.isStandaloneProject}
    isCoreProject: ${this.framework.isCoreProject}
    isContainer: ${this.framework.isContainer}
    isOrganization: ${this.taonJson.isOrganization}
    should dedupe packages ${this.nodeModules.shouldDedupePackages}

    genericName: ${this.genericName}

    frameworkVersion: ${this.framework.frameworkVersion}
    type: ${this.type}
    parent name: ${this.parent && this.parent.name}
    grandpa name: ${this.grandpa && this.grandpa.name}
    git origin: ${this.git.originURL}
    git branch name: ${this.git.currentBranchName}
    git commits number: ${this.git.countCommits()}

    location: ${this.location}

    children (${(this.children || []).length}):
${children}

    linked projects (${(this.linkedProjects.linkedProjects || []).length}):
${linkedProjects}

    git children (${(this.git.gitChildren || []).length}):
${gitChildren}

    `;

    //#endregion
  }
  //#endregion

  //#region ins
  /**
   * @overload
   */
  public get ins(): TaonProjectResolve {
    return Project.ins;
  }
  //#endregion

  //#region children
  /**
   * @overload
   */
  get children(): Project[] {
    //#region @backendFunc
    let location = this.location;
    const absExternalPathToChildren = this.pathFor([
      dotTaonFolder,
      CoreModels__NS__pathToChildren,
    ]);
    let usingExternalLocation = false;
    if (Helpers__NS__exists(absExternalPathToChildren)) {
      const externalLocation = Helpers__NS__readFile(absExternalPathToChildren);
      if (externalLocation && Helpers__NS__exists(externalLocation)) {
        location = externalLocation;
        usingExternalLocation = true;
      }
    }
    if (this.pathExists(taonJsonMainProject) || usingExternalLocation) {
      const folders = Helpers__NS__foldersFrom(location).filter(
        f =>
          crossPlatformPath(f) !== crossPlatformPath(location) &&
          !path.basename(f).startsWith('.') &&
          !path.basename(f).startsWith('__') &&
          !path.basename(f).startsWith(distMainProject) &&
          !path.basename(f).startsWith(srcMainProject) &&
          !path.basename(f).startsWith(binMainProject) &&
          !path.basename(f).startsWith(docsMainProject) &&
          !path.basename(f).startsWith('tmp') &&
          ![nodeModulesMainProject].includes(path.basename(f)),
      );
      // console.log({ folders });
      const taonChildren = folders
        .map(f => this.ins.From(f) as Project)
        .filter(f => !!f);
      // console.log({
      //   taonChildren: taonChildren.map(c => c.location)
      // })
      return taonChildren;
    }
    return [];
    //#endregion
  }
  //#endregion

  //#region is monorepo
  get isMonorepo(): boolean {
    return this.taonJson?.isMonorepo;
  }
  //#endregion
}