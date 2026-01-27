//#region imports
import {
  config,
  dotTaonFolder,
  LibTypeEnum,
  taonContainers,
  taonPackageName,
  taonProjects,
  tnpPackageName,
  urlRepoTaonContainers,
} from 'tnp-core/lib-prod';
import { LibTypeArr } from 'tnp-core/lib-prod';
import { child_process, fse, os, requiredForDev, UtilsCliClassMethod__NS__decoratorMethod, UtilsCliClassMethod__NS__getFrom, UtilsCliClassMethod__NS__staticClassNameProperty } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings } from 'tnp-core/lib-prod';
import { CLI, UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor } from 'tnp-core/lib-prod';
import { fileName } from 'tnp-core/lib-prod';
import { BaseProjectResolver, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray } from 'tnp-helpers/lib-prod';

import { CURRENT_PACKAGE_VERSION } from '../../build-info._auto-generated_';
import {
  containerPrefix,
  DEFAULT_FRAMEWORK_VERSION,
  distMainProject,
  dotVscodeMainProject,
  nodeModulesMainProject,
  packageJsonMainProject,
  SKIP_CORE_CHECK_PARAM,
  taonJsonMainProject,
  taonRepoPathUserInUserDir,
} from '../../constants';
// import { $Global } from '../cli/cli-_GLOBAL_';

import type { Project } from './project';
import { TaonProjectsWorker } from './taon-worker/taon.worker';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class TaonProjectResolve extends BaseProjectResolver<Project> {
  taonProjectsWorker: TaonProjectsWorker;

  private hasResolveCoreDepsAndFolder = false;

  //#region constructor
  constructor(
    protected classFn: typeof Project,
    public cliToolNameFn: () => string,
  ) {
    super(classFn, cliToolNameFn);

    // if (!this.cliToolName) {
    //   Helpers__NS__throwError(`cliToolName is not provided`);
    // }
    if (UtilsOs__NS__isRunningInVscodeExtension()) {
      //#region @backend
      config.frameworkName = config.frameworkName || (taonPackageName as any);

      const allTaonContainersCoreContainers = Helpers__NS__foldersFrom(
        [UtilsOs__NS__getRealHomeDir(), dotTaonFolder, taonContainers],
        { recursive: false },
      )
        .map(c => this.From(c))
        .filter(c => c?.typeIs(LibTypeEnum.CONTAINER))
        .sort((a, b) => {
          const numA =
            Number(
              a.name
                ?.replace(LibTypeEnum.CONTAINER, '')
                .replace('-', '')
                .replace('v', ''),
            ) || 0;
          const numB =
            Number(
              b.name
                ?.replace(LibTypeEnum.CONTAINER, '')
                .replace('-', '')
                .replace('v', ''),
            ) || 0;
          return numB - numA; // highest numbers first
        });
      const firstContainer = ___NS__first(allTaonContainersCoreContainers);
      config.dirnameForTnp =
        firstContainer?.pathFor(
          `${nodeModulesMainProject}/${tnpPackageName}`,
        ) || config.dirnameForTnp;
      //#endregion
    }

    // TODO $Global not available here
    // const commandStartWorker = `${cliToolName} ${UtilsCliClassMethod__NS__getFrom(
    //   $Global.prototype.startCliServiceTaonProjectsWorker,
    //   { globalMethod: true, argsToParse: { skipCoreCheck: true } },
    // )}`;

    // const commandStartWorker = `${cliToolName} ${
    //   'startCliServiceTaonProjectsWorker ${SKIP_CORE_CHECK_PARAM}'
    //   // as keyof $Global
    // }`;

    this.taonProjectsWorker = new TaonProjectsWorker(
      taonProjects,
      () =>
        `${cliToolNameFn()} ${
          `startCliServiceTaonProjectsWorker ${SKIP_CORE_CHECK_PARAM}`
          // as keyof $Global
        }`,
      this,
    );
  }
  //#endregion

  //#region methods / type from
  typeFrom(location: string): CoreModels__NS__LibType {
    //#region @backendFunc
    location = crossPlatformPath(location);
    if (!fse.existsSync(location)) {
      return void 0;
    }

    const taonJson = Helpers__NS__readJsonC([location, taonJsonMainProject]);
    if (!___NS__isObject(taonJson) || !taonJson.type) {
      return Helpers__NS__exists([location, packageJsonMainProject])
        ? LibTypeEnum.UNKNOWN_NPM_PROJECT
        : LibTypeEnum.UNKNOWN;
    }
    const type = taonJson.type;
    return type;
    //#endregion
  }
  //#endregion

  //#region methods / from
  /**
   * TODO use base resolve
   */
  From(locationOfProj: string | string[]): Project {
    //#region @backendFunc
    if (Array.isArray(locationOfProj)) {
      locationOfProj = locationOfProj.join('/');
    }
    if (!locationOfProj) {
      return;
    }
    let location = locationOfProj.replace(/\/\//g, '/');

    if (!___NS__isString(location)) {
      Helpers__NS__warn(`[project.from] location is not a string`);
      return;
    }
    if (path.basename(location) === distMainProject) {
      location = path.dirname(location);
    }
    location = crossPlatformPath(path.resolve(location));
    if (this.emptyLocations.includes(location)) {
      if (location.search(`/${distMainProject}`) === -1) {
        Helpers__NS__log(`[project.from] empty location ${location}`, 2);
        return;
      }
    }

    const alreadyExist = this.projects.find(
      l => l.location.trim() === location.trim(),
    );
    if (alreadyExist) {
      return alreadyExist as any;
    }
    if (!fse.existsSync(location)) {
      Helpers__NS__log(
        `[taon/project][project.from] Cannot find project in location: ${location}`,
        1,
      );
      this.emptyLocations.push(location);
      return;
    }

    let type = this.typeFrom(location);

    // console.log(`type ${type} for location ${location}`);

    let resultProject: Project;
    if (type === LibTypeEnum.ISOMORPHIC_LIB) {
      resultProject = new this.classFn(location);
    }
    if (type === LibTypeEnum.CONTAINER) {
      resultProject = new this.classFn(location);
    }
    if (type === LibTypeEnum.UNKNOWN_NPM_PROJECT) {
      resultProject = new this.classFn(location);
    }

    return resultProject as any;
    //#endregion
  }
  //#endregion

  //#region methods / nearest to
  nearestTo<T = Project>(
    absoluteLocation: string,
    options?: {
      type?: CoreModels__NS__LibType;
      findGitRoot?: boolean;
      onlyOutSideNodeModules?: boolean;
    },
  ): T {
    //#region @backendFunc

    options = options || {};
    const { type, findGitRoot, onlyOutSideNodeModules } = options;

    if (___NS__isString(type) && !LibTypeArr.includes(type)) {
      Helpers__NS__error(
        `[taon/project][project.nearestTo] wrong type: ${type}`,
        false,
        true,
      );
    }
    if (fse.existsSync(absoluteLocation)) {
      absoluteLocation = fse.realpathSync(absoluteLocation);
    }
    if (
      fse.existsSync(absoluteLocation) &&
      !fse.lstatSync(absoluteLocation).isDirectory()
    ) {
      absoluteLocation = path.dirname(absoluteLocation);
    }

    let project: Project;
    let previousLocation: string;
    while (true) {
      if (
        onlyOutSideNodeModules &&
        path.basename(path.dirname(absoluteLocation)) === nodeModulesMainProject
      ) {
        absoluteLocation = path.dirname(path.dirname(absoluteLocation));
      }
      project = this.From(absoluteLocation);
      if (___NS__isString(type)) {
        if (project?.typeIs(type)) {
          if (findGitRoot) {
            if (project.git.isGitRoot) {
              break;
            }
          } else {
            break;
          }
        }
      } else {
        if (project) {
          if (findGitRoot) {
            if (project.git.isGitRoot) {
              break;
            }
          } else {
            break;
          }
        }
      }

      previousLocation = absoluteLocation;
      const newAbsLocation = path.join(absoluteLocation, '..');
      if (!path.isAbsolute(newAbsLocation)) {
        return;
      }
      absoluteLocation = crossPlatformPath(path.resolve(newAbsLocation));
      if (
        !fse.existsSync(absoluteLocation) &&
        absoluteLocation.split('/').length < 2
      ) {
        return;
      }
      if (previousLocation === absoluteLocation) {
        return;
      }
    }
    return project as any;
    //#endregion
  }
  //#endregion

  //#region methods / tnp
  get Tnp(): Project {
    //#region @backendFunc
    let tnpProject = this.From(config.dirnameForTnp);
    Helpers__NS__log(
      `Using ${config.frameworkName} path: ${config.dirnameForTnp}`,
      1,
    );
    if (!tnpProject && !global.globalSystemToolMode) {
      Helpers__NS__error(
        `Not able to find tnp project in "${config.dirnameForTnp}".`,
      );
    }
    return tnpProject;
    //#endregion
  }
  //#endregion

  //#region by
  public by(
    libraryType: CoreModels__NS__NewFactoryType,

    //#region @backend
    version: CoreModels__NS__FrameworkVersion = DEFAULT_FRAMEWORK_VERSION,
    //#endregion
  ): Project {
    //#region @backendFunc

    // console.log({ libraryType, version });

    if (libraryType === LibTypeEnum.CONTAINER) {
      const pathToContainer = this.resolveCoreProjectsPathes(version).container;
      // console.log({ pathToContainer });
      const containerProject = this.From(pathToContainer);
      return containerProject as any;
    }
    if (libraryType !== LibTypeEnum.ISOMORPHIC_LIB) {
      return void 0;
    }

    const projectPath =
      this.resolveCoreProjectsPathes(version).projectByType(libraryType);

    // console.log({ projectPath });

    if (!fse.existsSync(projectPath)) {
      Helpers__NS__error(
        `
    path: ${crossPlatformPath(projectPath)}
    config.dirnameForTnp: ${config.dirnameForTnp}

     [taon/project] Bad library type "${libraryType}" for this framework version "${version}"

     `,
        false,
        false,
      );
    }
    return this.From(projectPath);
    //#endregion
  }
  //#endregion

  //#region projects in user folder
  private get projectsInUserFolder() {
    //#region @backendFunc
    const projectsInUserFolder = crossPlatformPath([
      UtilsOs__NS__getRealHomeDir(),
      dotTaonFolder,
      taonContainers,
    ]);
    return projectsInUserFolder;
    //#endregion
  }
  //#endregion

  //#region sync core project
  /**
   * taon sync command
   */
  sync({ syncFromCommand }: { syncFromCommand?: boolean } = {}): void {
    //#region @backendFunc
    const cwd = taonRepoPathUserInUserDir;

    const oldTaonFolder = crossPlatformPath([
      path.dirname(taonRepoPathUserInUserDir),
      taonPackageName,
    ]);

    if (Helpers__NS__exists(oldTaonFolder)) {
      Helpers__NS__taskStarted(`Removing old taon folder: ${oldTaonFolder}`);
      Helpers__NS__removeSymlinks(oldTaonFolder);
      Helpers__NS__remove(oldTaonFolder);
      Helpers__NS__taskDone('Old taon folder removed');
    }

    Helpers__NS__info(`Syncing... Fetching git data... `);
    CLI.installEnvironment(requiredForDev);

    //#region reset origin of taon repo
    try {
      // ! TODO this can cause error when (link is committed in git repo)
      // $ git clean -df or git reset --hard
      //warning: could not open directory 'projects/container-v18/isomorphic-lib
      // -v18/docs-config.schema.json/': Function not implemented
      // this may be temporary
      Helpers__NS__run(`git reset --hard && git clean -df && git fetch`, {
        cwd,
        output: false,
      }).sync();
    } catch (error) {
      Helpers__NS__error(
        `[${config.frameworkName} Not able to reset origin of taon repo: ${urlRepoTaonContainers} in: ${cwd}`,
        false,
        true,
      );
    }
    //#endregion

    //#region checkout master
    try {
      Helpers__NS__run(`git checkout master`, { cwd, output: false }).sync();
      Helpers__NS__log('DONE CHECKING OUT MASTER');
    } catch (error) {
      Helpers__NS__log(error);
      Helpers__NS__error(
        `[${config.frameworkName} Not able to checkout master branch for :${urlRepoTaonContainers} in: ${cwd}`,
        false,
        true,
      );
    }
    //#endregion

    //#region pull master with tags
    try {
      HelpersTaon__NS__git__NS__meltActionCommits(cwd);
    } catch (error) {}
    try {
      Helpers__NS__run(
        `git reset --hard HEAD~2 && git reset --hard && git clean -df && git pull --tags origin master`,
        { cwd, output: false },
      ).sync();
      Helpers__NS__log('DONE PULLING MASTER');
    } catch (error) {
      Helpers__NS__log(error);
      Helpers__NS__error(
        `[${config.frameworkName} Not able to pull master branch for :` +
          `${urlRepoTaonContainers} in: ${crossPlatformPath(cwd)}`,
        false,
        true,
      );
    }
    try {
      HelpersTaon__NS__git__NS__meltActionCommits(cwd);
    } catch (error) {}
    try {
      Helpers__NS__run(`git reset --hard`, { cwd, output: false }).sync();
    } catch (error) {}
    //#endregion

    //#region checkout lastest tag
    // TODO remove ? taon-containers gonna be constantly update and
    // no need for checking out specific tag

    const tagToCheckout = this.taonTagToCheckoutForCurrentCliVersion(cwd);
    const currentBranch = HelpersTaon__NS__git__NS__currentBranchName(cwd);

    Helpers__NS__taskStarted(
      `Checking out latest tag ${tagToCheckout} for taon framework...`,
    );
    if (currentBranch !== tagToCheckout) {
      try {
        Helpers__NS__run(
          `git reset --hard && git clean -df && git checkout ${tagToCheckout}`,
          { cwd },
        ).sync();
      } catch (error) {
        console.log(error);
        Helpers__NS__warn(
          `[${config.frameworkName} ERROR Not able to checkout latest tag of taon framework: ${urlRepoTaonContainers} in: ${cwd}`,
          false,
        );
      }
    }
    //#endregion

    //#region pull latest tag
    try {
      Helpers__NS__run(`git pull origin ${tagToCheckout}`, { cwd }).sync();
    } catch (error) {
      console.log(error);
      Helpers__NS__warn(
        `[${config.frameworkName}] ERROR Not able to pull latest tag of taon framework: ${urlRepoTaonContainers} in: ${cwd}`,
        false,
      );
    }
    //#endregion

    //#region remove vscode folder
    try {
      Helpers__NS__run(`rimraf ${dotVscodeMainProject}`, { cwd }).sync();
    } catch (error) {}
    //#endregion

    if (syncFromCommand) {
      // const command =
      //   `${config.frameworkName} ` +
      //   `${UtilsCliClassMethod__NS__getFrom(
      //     $Global.prototype.reinstallCoreContainers,
      //     { globalMethod: true, argsToParse: { skipCoreCheck: true } },
      //   )}`;
      // Helpers__NS__run(command).sync();
      Helpers__NS__run(
        // $Global.prototype.reinstallCoreContainers.name
        `${config.frameworkName} ${'reinstallCoreContainers'} ${SKIP_CORE_CHECK_PARAM}`,
      ).sync();
    }

    Helpers__NS__success('taon framework synced ok');
    //#endregion
  }
  //#endregion

  //#region initial check
  public initialCheck() {
    //#region @backendFunc
    if (this.hasResolveCoreDepsAndFolder) {
      return;
    }
    const morhiVscode = crossPlatformPath([
      path.dirname(taonRepoPathUserInUserDir),
      `${taonProjects}/${dotVscodeMainProject}`,
    ]);

    if (!fse.existsSync(taonRepoPathUserInUserDir) && !global.skipCoreCheck) {
      if (!fse.existsSync(path.dirname(taonRepoPathUserInUserDir))) {
        fse.mkdirpSync(path.dirname(taonRepoPathUserInUserDir));
      }

      CLI.installEnvironment(requiredForDev);

      // const commandEnvInstall = `${config.frameworkName} ${UtilsCliClassMethod__NS__getFrom(
      //   $Global.prototype.ENV_INSTALL,
      //   {
      //     globalMethod: true,
      //     argsToParse: { skipCoreCheck: true },
      //   },
      // )}`;
      // child_process.execSync(commandEnvInstall, { stdio: [0, 1, 2] });
      try {
        child_process.execSync(
          //$Global.prototype.ENV_INSTALL.name
          `${config.frameworkName}  ${'ENV_INSTALL'} ${SKIP_CORE_CHECK_PARAM}`,
          { stdio: [0, 1, 2] },
        );
      } catch (error) {
        Helpers__NS__error(
          `[${config.frameworkName}][config] Not able to install local global environment`,
          false,
          true,
        );
      }

      try {
        child_process.execSync(`git clone ${urlRepoTaonContainers}`, {
          cwd: path.dirname(taonRepoPathUserInUserDir),
          stdio: [0, 1, 2],
        });
        Helpers__NS__remove(morhiVscode);
      } catch (error) {
        Helpers__NS__error(
          `[${config.frameworkName}][config] Not able to clone repository: ${urlRepoTaonContainers} in:
       ${taonRepoPathUserInUserDir}`,
          false,
          true,
        );
      }

      this.sync();

      this.hasResolveCoreDepsAndFolder = true;
    }

    //#endregion
  }
  //#endregion

  //#region path resolved
  private pathResolved(...partOfPath: string[]) {
    //#region @backendFunc
    // console.log('pathResolved', partOfPath);

    if (
      (global['frameworkName'] &&
        global['frameworkName'] === taonPackageName) ||
      UtilsOs__NS__isRunningInVscodeExtension()
    ) {
      const joined = partOfPath.join('/');

      let pathResult = joined.replace(
        config.dirnameForTnp + '/' + this.taonProjectsRelative,
        this.projectsInUserFolder,
      );

      pathResult = crossPlatformPath(path.resolve(pathResult));
      this.initialCheck();
      return pathResult;
    }
    return crossPlatformPath(path.resolve(path.join(...partOfPath)));
    //#endregion
  }
  //#endregion

  //#region resolve core projects paths
  private resolveCoreProjectsPathes(version?: CoreModels__NS__FrameworkVersion) {
    //#region @backendFunc

    if (Number(version.replace('v', '')) < 18) {
      Helpers__NS__warn(
        `[taon/project] ${version} is not supported anymore.. use v19 instead`,
      );
    }

    version = !version || version === 'v1' ? ('' as any) : version;

    // console.log(({ dirnameForTnp: config.dirnameForTnp, taonProjectsRelative: this.taonProjectsRelative, version }));

    const coreContainerPath = this.pathResolved(
      config.dirnameForTnp,
      `${this.taonProjectsRelative}/${containerPrefix}${version}`,
    );

    const result = {
      container: coreContainerPath,
      projectByType: (libType: CoreModels__NS__NewFactoryType) => {
        const resultByType = this.pathResolved(
          config.dirnameForTnp,
          `${this.taonProjectsRelative}/${containerPrefix}${version}/${libType}-${version}`,
        );
        // console.log(`resultByType ${libType}`, resultByType);
        return resultByType;
      },
    };
    return result;
    //#endregion
  }
  //#endregion

  //#region taon relative projects paths
  /**
   * only for tnp dev mode cli
   */
  public get taonProjectsRelative(): string {
    return `../${taonContainers}`;
  }
  //#endregion

  //#region angular major version for current cli
  angularMajorVersionForCurrentCli(): number {
    //#region @backendFunc
    return Number(CURRENT_PACKAGE_VERSION.split('.')[0]);
    //#endregion
  }
  //#endregion

  //#region taon tag to checkout for current cli version
  taonTagToCheckoutForCurrentCliVersion(cwd: string): string {
    //#region @backendFunc
    const ngVer = this.angularMajorVersionForCurrentCli();
    const lastTagForVer = (
      this.From(cwd) as Project
    ).git.lastTagNameForMajorVersion(ngVer);
    return lastTagForVer;
    //#endregion
  }
  //#endregion
}