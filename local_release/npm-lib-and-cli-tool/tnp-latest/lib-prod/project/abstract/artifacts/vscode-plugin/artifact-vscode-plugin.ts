//#region imports
import { config, UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor } from 'tnp-core/lib-prod';
import { crossPlatformPath, fse, path, chalk, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings } from 'tnp-core/lib-prod';
import { Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray, UtilsQuickFixes__NS__replaceElectronWithNothing, UtilsQuickFixes__NS__replaceKnownFaultyCode } from 'tnp-helpers/lib-prod';

import {
  appVscodeJSFromBuild,
  appVscodeTsFromSrc,
  DEFAULT_PORT,
  defaultLicenseVscodePlugin,
  distMainProject,
  distVscodeProj,
  iconVscode128Basename,
  nodeModulesMainProject,
  outVscodeProj,
  packageJsonVscodePlugin,
  prodSuffix,
  srcMainProject,
  tmpVscodeProj,
  updateVscodePackageJsonJsMainProject,
} from '../../../../constants';
import { Models__NS__CreateJsonSchemaOptions, Models__NS__DocsConfig, Models__NS__NewSiteOptions, Models__NS__PsListInfo, Models__NS__RootArgsType, Models__NS__TaonArtifactInclude, Models__NS__TaonAutoReleaseItem, Models__NS__TaonContext, Models__NS__TaonJson, Models__NS__TaonJsonContainer, Models__NS__TaonJsonStandalone, Models__NS__TaonLoaderConfig, Models__NS__TaonLoaders, Models__NS__TestTypeTaon, Models__NS__TestTypeTaonArr, Models__NS__TscCompileOptions } from '../../../../models';
import {
  ReleaseArtifactTaonNamesArr,
  EnvOptions,
  ReleaseType,
  Development,
  ReleaseArtifactTaon,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';
//#endregion

export class ArtifactVscodePlugin extends BaseArtifact<
  {
    vscodeVsixOutPath: string;
  },
  ReleasePartialOutput
> {
  constructor(project: Project) {
    super(project, ReleaseArtifactTaon.VSCODE_PLUGIN);
  }

  //#region clear partial
  async clearPartial(clearOption: EnvOptions) {
    [this.project.pathFor(tmpVscodeProj)].forEach(f => {
      Helpers__NS__removeSymlinks(f);
      Helpers__NS__removeFolderIfExists(f);
    });
  }
  //#endregion

  //#region init partial
  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc
    if (!initOptions.release.targetArtifact) {
      initOptions.release.targetArtifact = ReleaseArtifactTaon.VSCODE_PLUGIN;
    }
    if (!this.project.framework.isStandaloneProject) {
      return initOptions;
    }

    const tmpVscodeProjPath = this.getTmpVscodeProjPath(
      initOptions.release.releaseType,
    );

    const packageJsonForVscode = {
      name: this.project.name,
      version:
        initOptions.release.resolvedNewVersion ||
        this.project.packageJson.version,
      main: `./out/${initOptions.release.releaseType ? 'extension.js' : 'app.vscode.js'}`,
      categories: ['Other'],
      activationEvents: ['*'],
      displayName:
        this.project.packageJson.displayName ||
        `${this.project.name}-vscode-ext`,
      publisher: this.project.packageJson.publisher || 'taon-dev-local',
      icon: `${iconVscode128Basename}`,
      description:
        this.project.packageJson.description ||
        `Description of ${this.project.nameForNpmPackage} extension`,
      license: this.project.packageJson.license || defaultLicenseVscodePlugin,
      engines: {
        /**
         * ! TODO increase this !!!
         */
        vscode: '^1.30.0',
      },
      repository: this.project.packageJson.repository || {
        url: this.project.git.remoteOriginUrl,
        type: 'git',
      },
    };

    // will be done by update-vscode-package-json.js
    if (this.project.taonJson.overridePackageJsonManager.contributes) {
      packageJsonForVscode['contributes'] =
        this.project.taonJson.overridePackageJsonManager.contributes;
    }

    Helpers__NS__writeJson(
      crossPlatformPath([tmpVscodeProjPath, packageJsonVscodePlugin]),
      packageJsonForVscode,
    );

    for (const resourceRelative of this.project.taonJson.resources) {
      HelpersTaon__NS__copyFile(
        this.project.pathFor(resourceRelative),
        crossPlatformPath([tmpVscodeProjPath, resourceRelative]),
      );
    }

    Helpers__NS__createSymLink(
      this.project.pathFor(
        // use dist-prod if prod mode
        distMainProject + (initOptions.build.prod ? prodSuffix : ''),
      ),
      crossPlatformPath([
        tmpVscodeProjPath,
        initOptions.release.releaseType ? distVscodeProj : outVscodeProj,
      ]),
      { tryRemoveDesPath: true, continueWhenExistedFolderDoesntExists: true },
    );

    Helpers__NS__createSymLink(
      this.project.pathFor(nodeModulesMainProject),
      crossPlatformPath([tmpVscodeProjPath, nodeModulesMainProject]),
      { tryRemoveDesPath: true, continueWhenExistedFolderDoesntExists: true },
    );

    Helpers__NS__createSymLink(
      this.project.pathFor(updateVscodePackageJsonJsMainProject),
      crossPlatformPath([
        tmpVscodeProjPath,
        updateVscodePackageJsonJsMainProject,
      ]),
      { tryRemoveDesPath: true, continueWhenExistedFolderDoesntExists: true },
    );

    //#region recreate app.vscode.js

    const relativeAppVscodeJsPath = crossPlatformPath(
      `${srcMainProject}/${appVscodeTsFromSrc}`,
    );
    if (!this.project.hasFile(relativeAppVscodeJsPath)) {
      const coreName = ___NS__upperFirst(___NS__camelCase(this.project.name));
      const coreNameKebab = ___NS__kebabCase(this.project.name);
      const contentOrgVscode = this.project.framework.coreProject.readFile(
        `${srcMainProject}/${appVscodeTsFromSrc}`,
      );

      this.project.writeFile(
        relativeAppVscodeJsPath,
        contentOrgVscode
          .replace(
            new RegExp(
              `IsomorphicLibV${this.project.framework.frameworkVersion.replace('v', '')}`,
              'g',
            ),
            `${coreName}`,
          )
          .replace(
            new RegExp(
              `isomorphic-lib-v${this.project.framework.frameworkVersion.replace('v', '')}`,
              'g',
            ),
            `${coreNameKebab}`,
          ),
      );
    }
    //#endregion

    return initOptions;
    //#endregion
  }
  //#endregion

  //#region build partial
  async buildPartial(buildOptions: EnvOptions): Promise<{
    vscodeVsixOutPath: string;
  }> {
    //#region @backendFunc

    buildOptions = await this.project.artifactsManager.init(
      buildOptions.clone(),
    );
    const shouldSkipBuild = this.shouldSkipBuild(buildOptions);

    const tmpVscodeProjPath = this.getTmpVscodeProjPath(
      buildOptions.release.releaseType,
    );
    const extProj = this.project.ins.From(tmpVscodeProjPath);
    const vscodeVsixOutPath: string = extProj.pathFor(
      this.extensionVsixNameFrom(buildOptions),
    );
    const destExtensionJs = this.getDestExtensionJs(
      buildOptions.release.releaseType,
    );

    if (buildOptions.build.watch) {
      // NOTHING TO DO HERE
      // extProj
      //   .run(
      //     `node ${this.vcodeProjectUpdatePackageJsonFilename} ` +
      //       ` ${!buildOptions.releaseType ? 'app.vscode' : ''} ` +
      //       ` ${buildOptions.watch ? '--watch' : ''}`,
      //   )
      //   .async();
    } else {
      if (buildOptions.release.releaseType) {
        await this.project.artifactsManager.globalHelper.branding.generateLogoFroVscodeLocations();
        if (!shouldSkipBuild) {
          await HelpersTaon__NS__bundleCodeIntoSingleFile(
            crossPlatformPath([
              tmpVscodeProjPath,
              distMainProject,
              appVscodeJSFromBuild,
            ]),
            destExtensionJs,
            {
              strategy: 'vscode-ext',
              additionalExternals: [
                ...this.project.taonJson.additionalExternalsFor(
                  ReleaseArtifactTaon.VSCODE_PLUGIN,
                ),
              ],
              additionalReplaceWithNothing: [
                ...this.project.taonJson.additionalReplaceWithNothingFor(
                  ReleaseArtifactTaon.VSCODE_PLUGIN,
                ),
              ],
            },
          );
        }
      }

      if (!shouldSkipBuild) {
        extProj
          .run(
            `node ${updateVscodePackageJsonJsMainProject} ` +
              `${!buildOptions.release.releaseType ? appVscodeJSFromBuild.replace('.js', '') : ''} `,
          )
          .sync();
      }
    }

    if (!buildOptions.build.watch && buildOptions.release.releaseType) {
      try {
        const args = [
          ...(this.project.taonJson.baseContentUrl
            ? [`--baseContentUrl "${this.project.taonJson.baseContentUrl}"`]
            : []),
          ...(this.project.taonJson.baseImagesUrl
            ? [`--baseImagesUrl "${this.project.taonJson.baseImagesUrl}"`]
            : []),
        ];
        extProj.run(`taon-vsce package ${args.join(' ')}`).sync();
      } catch (error) {
        throw 'Problem with vscode package metadata';
      }
    }

    return { vscodeVsixOutPath };
    //#endregion
  }
  //#endregion

  //#region release partial
  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<ReleasePartialOutput> {
    //#region @backendFunc
    let releaseProjPath: string;
    let releaseType: ReleaseType = releaseOptions.release.releaseType;
    releaseOptions = this.updateResolvedVersion(releaseOptions);
    let projectsReposToPushAndTag: string[] = [this.project.location];
    let projectsReposToPush: string[] = [];

    const { vscodeVsixOutPath } = await this.buildPartial(
      releaseOptions.clone({
        build: {
          watch: false,
        },
      }),
    );

    if (releaseOptions.release.releaseType === ReleaseType.LOCAL) {
      //#region local release
      const releaseData = await this.localReleaseDeploy(
        path.dirname(vscodeVsixOutPath),
        releaseOptions,
        {
          copyOnlyExtensions: ['.vsix'],
          createReadme: `# Installation

Right click on the file **${path.basename(this.extensionVsixNameFrom(releaseOptions))}**
and select "Install Extension VSIX" to install it in your
local VSCode instance.

`,
        },
      );

      projectsReposToPushAndTag.push(...releaseData.projectsReposToPushAndTag);
      releaseProjPath = releaseData.releaseProjPath;
      //#endregion
    }
    if (releaseOptions.release.releaseType === ReleaseType.STATIC_PAGES) {
      //#region local release
      const releaseData = await this.staticPagesDeploy(
        path.dirname(vscodeVsixOutPath),
        releaseOptions,
        {
          copyOnlyExtensions: ['.vsix'],
        },
      );

      projectsReposToPush.push(...releaseData.projectsReposToPush);
      releaseProjPath = releaseData.releaseProjPath;
      //#endregion
    }
    if (releaseOptions.release.releaseType === ReleaseType.MANUAL) {
      // TODO release to microsoft store or serve with place to put assets
    }
    if (releaseOptions.release.releaseType === ReleaseType.CLOUD) {
      // TODO trigger cloud release (it will actually be manual on remote server)
    }

    if (releaseOptions.release.installLocally) {
      await this.installLocally(vscodeVsixOutPath);
    }

    if (releaseOptions.release.removeReleaseOutputAfterLocalInstall) {
      Helpers__NS__removeFolderIfExists(releaseProjPath);
    }

    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      releaseProjPath,
      releaseType,
      projectsReposToPushAndTag,
      projectsReposToPush,
    };
    //#endregion
  }
  //#endregion

  //#region private methods

  //#region private methods / get tmp vscode proj path (for any build)
  public getTmpVscodeProjPath(releaseType?: ReleaseType): string {
    const tmpVscodeProjPath = this.project.pathFor(
      `${tmpVscodeProj}/${
        releaseType ? releaseType : Development
      }/${this.project.name}`,
    );
    return tmpVscodeProjPath;
  }
  //#endregion

  //#region private methods / get dest extension js
  private getDestExtensionJs(releaseType: ReleaseType): string {
    const tmpVscodeProjPath = this.getTmpVscodeProjPath(releaseType);
    const res = crossPlatformPath([tmpVscodeProjPath, 'out/extension.js']);
    return res;
  }
  //#endregion

  //#region private methods / extension vsix name
  private extensionVsixNameFrom(initOptions: EnvOptions): string {
    return `${this.project.name}-${
      initOptions.release.resolvedNewVersion || this.project.packageJson.version
    }.vsix`;
  }
  //#endregion

  //#region private methods / install locally
  /**
   * TODO move this to local release
   */
  public async installLocally(pathToVsixFile: string): Promise<void> {
    //#region @backendFunc
    Helpers__NS__info(
      `Installing extension: ${path.basename(pathToVsixFile)} ` +
        `with creation date: ${fse.lstatSync(pathToVsixFile).birthtime}...`,
    );
    Helpers__NS__run(
      `${UtilsOs__NS__detectEditor()} --install-extension ${path.basename(pathToVsixFile)}`,
      {
        cwd: crossPlatformPath(path.dirname(pathToVsixFile)),
      },
    ).sync();
    //#endregion
  }
  //#endregion

  //#endregion
}