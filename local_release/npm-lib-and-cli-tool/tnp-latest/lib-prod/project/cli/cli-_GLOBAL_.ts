//#region imports
import {
  IncrementalWatcherOptions,
  incrementalWatcher,
} from 'incremental-compiler/lib-prod';
import { walk } from 'lodash-walk-object/lib-prod';
import * as semver from 'semver';
import { config, dotTaonFolder, fg, LibTypeEnum, taonContainers, tnpPackageName, UtilsFilesFoldersSync__NS__copy, UtilsFilesFoldersSync__NS__copyFile, UtilsFilesFoldersSync__NS__filterDontCopy, UtilsFilesFoldersSync__NS__filterOnlyCopy, UtilsFilesFoldersSync__NS__getFilesFrom, UtilsFilesFoldersSync__NS__getFoldersFrom, UtilsFilesFoldersSync__NS__IGNORE_FOLDERS_FILES_PATTERNS, UtilsFilesFoldersSync__NS__move, UtilsFilesFoldersSync__NS__readFile, UtilsFilesFoldersSync__NS__UtilsFilesFoldersSyncGetFilesFromOptions, UtilsFilesFoldersSync__NS__writeFile } from 'tnp-core/lib-prod';
import {
  TAGS,
  backendNodejsOnlyFiles,
  extAllowedToExportAndReplaceTSJSCodeFiles,
  frontendFiles,
  notNeededForExportFiles,
} from 'tnp-core/lib-prod';
import { psList, UtilsEtcHosts__NS__EtchostEntry, UtilsEtcHosts__NS__getEntriesByDomain, UtilsEtcHosts__NS__getEntriesByIp, UtilsEtcHosts__NS__getEntryByComment, UtilsEtcHosts__NS__getLines, UtilsEtcHosts__NS__getPath, UtilsEtcHosts__NS__getTokensData, UtilsEtcHosts__NS__removeEntryByDomain, UtilsEtcHosts__NS__SIMULATE_DOMAIN_TAG, UtilsEtcHosts__NS__simulateDomain, UtilsEtcHosts__NS__specificEntryExists, UtilsJson__NS__AttrJsoncProp, UtilsJson__NS__getAtrributiesFromJsonWithComments, UtilsJson__NS__getAttributiesFromComment, UtilsJson__NS__readJson, UtilsJson__NS__readJsonWithComments, UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor, UtilsProcessLogger__NS__baseDirTaonProcessLogs, UtilsProcessLogger__NS__createStickyTopBox, UtilsProcessLogger__NS__getLogsFiles, UtilsProcessLogger__NS__ProcessFileLogger, UtilsProcessLogger__NS__ProcessFileLoggerOptions, UtilsProcessLogger__NS__SpecialEventInProcessLogger } from 'tnp-core/lib-prod';
import { chokidar, dateformat, requiredForDev, UtilsProcess__NS__getBashOrShellName, UtilsProcess__NS__getChildPidsOnce, UtilsProcess__NS__getCurrentProcessAndChildUsage, UtilsProcess__NS__getGitBashPath, UtilsProcess__NS__getPathOfExecutable, UtilsProcess__NS__getUsageForPid, UtilsProcess__NS__isNodeVersionOk, UtilsProcess__NS__killAllJava, UtilsProcess__NS__killAllOtherNodeProcesses, UtilsProcess__NS__killProcess, UtilsProcess__NS__killProcessOnPort, UtilsProcess__NS__ProcessStartOptions, UtilsProcess__NS__startAsync, UtilsProcess__NS__startAsyncChildProcessCommandUntil, UtilsProcess__NS__startInNewTerminalWindow, UtilsString__NS__kebabCaseNoSplitNumbers } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, PROGRESS_DATA, chalk, glob, os, fse, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { CLI } from 'tnp-core/lib-prod';
import { UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { FilePathMetaData__NS__embedData, FilePathMetaData__NS__extractData, FilePathMetaData__NS__getOnlyMetadataString } from 'tnp-core/lib-prod';
import { UtilsCliClassMethod__NS__decoratorMethod, UtilsCliClassMethod__NS__getFrom, UtilsCliClassMethod__NS__staticClassNameProperty } from 'tnp-core/lib-prod';
import { UtilsNetwork__NS__checkIfServerOnline, UtilsNetwork__NS__checkIfServerPings, UtilsNetwork__NS__checkPing, UtilsNetwork__NS__etcHostHasProperLocalhostIp4Entry, UtilsNetwork__NS__etcHostHasProperLocalhostIp6Entry, UtilsNetwork__NS__getCurrentPublicIpAddress, UtilsNetwork__NS__getEtcHostEntriesByDomain, UtilsNetwork__NS__getEtcHostEntryByComment, UtilsNetwork__NS__getEtcHostEntryByIp, UtilsNetwork__NS__getEtcHostsPath, UtilsNetwork__NS__getFirstIpV4LocalActiveIpAddress, UtilsNetwork__NS__getLocalIpAddresses, UtilsNetwork__NS__isValidDomain, UtilsNetwork__NS__isValidIp, UtilsNetwork__NS__LocalIpInfo, UtilsNetwork__NS__PingResult, UtilsNetwork__NS__removeEtcHost, UtilsNetwork__NS__setEtcHost, UtilsNetwork__NS__SIMULATE_DOMAIN_TAG, UtilsNetwork__NS__simulateDomain, UtilsNetwork__NS__urlParse } from 'tnp-core/lib-prod';
import { BaseGlobalCommandLine, BaseProject, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray, UtilsFileSync__NS__forFolders, UtilsNpm__NS__checkIfPackageVersionAvailable, UtilsNpm__NS__clearVersion, UtilsNpm__NS__fixMajorVerNumber, UtilsNpm__NS__getLastMajorVersions, UtilsNpm__NS__getLastMinorVersionsForMajor, UtilsNpm__NS__getLastVersions, UtilsNpm__NS__getLatestVersionFromNpm, UtilsNpm__NS__getVerObj, UtilsNpm__NS__isProperVersion, UtilsNpm__NS__isSpecialVersion, UtilsNpm__NS__VersionObjectNpm, UtilsTypescript__NS__addBelowPlaceholder, UtilsTypescript__NS__addOrUpdateImportIfNotExists, UtilsTypescript__NS__calculateRelativeImportPath, UtilsTypescript__NS__clearRequireCacheRecursive, UtilsTypescript__NS__collapseFluentChains, UtilsTypescript__NS__DeepWritable, UtilsTypescript__NS__eslintFixAllFilesInsideFolder, UtilsTypescript__NS__eslintFixAllFilesInsideFolderAsync, UtilsTypescript__NS__eslintFixFile, UtilsTypescript__NS__ExportedThirdPartyNamespaces, UtilsTypescript__NS__ExportInfo, UtilsTypescript__NS__exportsFromContent, UtilsTypescript__NS__exportsFromFile, UtilsTypescript__NS__exportsRedefinedFromContent, UtilsTypescript__NS__exportsRedefinedFromFile, UtilsTypescript__NS__extractAngularComponentSelectors, UtilsTypescript__NS__extractClassNameFromString, UtilsTypescript__NS__extractClassNamesFromFile, UtilsTypescript__NS__extractDefaultClassNameFromFile, UtilsTypescript__NS__extractDefaultClassNameFromString, UtilsTypescript__NS__extractRenamedImportsOrExport, UtilsTypescript__NS__fixHtmlTemplatesInDir, UtilsTypescript__NS__FlattenMapping, UtilsTypescript__NS__formatAllFilesInsideFolder, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__GatheredExportsMap, UtilsTypescript__NS__gatherExportsMapFromIndex, UtilsTypescript__NS__getCleanImport, UtilsTypescript__NS__getTaonContextFromContent, UtilsTypescript__NS__getTaonContextsNamesFromFile, UtilsTypescript__NS__hoistTrailingChainComments, UtilsTypescript__NS__injectImportsIntoImportsRegion, UtilsTypescript__NS__migrateFromNgModulesToStandaloneV21, UtilsTypescript__NS__normalizeBrokenLines, UtilsTypescript__NS__NSSPLITNAMESAPCE, UtilsTypescript__NS__ParsedTsDiagnostic, UtilsTypescript__NS__parseTsDiagnostic, UtilsTypescript__NS__recognizeImportsFromContent, UtilsTypescript__NS__recognizeImportsFromFile, UtilsTypescript__NS__RedefinedExportInfo, UtilsTypescript__NS__refactorClassToNamespace, UtilsTypescript__NS__removeRegionByName, UtilsTypescript__NS__removeTaggedArrayObjects, UtilsTypescript__NS__removeTaggedImportExport, UtilsTypescript__NS__removeTaggedLines, UtilsTypescript__NS__RenamedImportOrExport, UtilsTypescript__NS__replaceImportNamespaceWithWithExplodedNamespace, UtilsTypescript__NS__replaceNamespaceWithLongNames, UtilsTypescript__NS__setValueToVariableInTsFile, UtilsTypescript__NS__splitNamespaceForContent, UtilsTypescript__NS__splitNamespaceForFile, UtilsTypescript__NS__SplitNamespaceResult, UtilsTypescript__NS__transformComponentStandaloneOption, UtilsTypescript__NS__transformFlatImports, UtilsTypescript__NS__TsImportExport, UtilsTypescript__NS__updateSplitNamespaceReExports, UtilsTypescript__NS__updateSplitNamespaceResultMapReplaceObj, UtilsTypescript__NS__wrapContentClassMembersDecoratorsWithRegion, UtilsTypescript__NS__wrapFirstImportsInImportsRegion, UtilsTypescript__NS__wrapWithComment } from 'tnp-helpers/lib-prod';
import { BaseCLiWorkerStartMode } from 'tnp-helpers/lib-prod';
import {
  Config,
  createGenerator,
  SchemaGenerator,
} from 'ts-json-schema-generator';

import {
  containerPrefix,
  DEFAULT_FRAMEWORK_VERSION,
  globalSpinner,
  keysMap,
  nodeModulesMainProject,
  packageJsonMainProject,
  readmeMdMainProject,
  result_packages_json,
  srcMainProject,
  taonConfigSchemaJsonContainer,
  taonConfigSchemaJsonStandalone,
  taonJsonMainProject,
  tmpIsomorphicPackagesJson,
  tsconfigForSchemaJson,
} from '../../constants';
import { Models__NS__CreateJsonSchemaOptions, Models__NS__DocsConfig, Models__NS__NewSiteOptions, Models__NS__PsListInfo, Models__NS__RootArgsType, Models__NS__TaonArtifactInclude, Models__NS__TaonAutoReleaseItem, Models__NS__TaonContext, Models__NS__TaonJson, Models__NS__TaonJsonContainer, Models__NS__TaonJsonStandalone, Models__NS__TaonLoaderConfig, Models__NS__TaonLoaders, Models__NS__TestTypeTaon, Models__NS__TestTypeTaonArr, Models__NS__TscCompileOptions } from '../../models';
import { EnvOptions, ReleaseArtifactTaon, ReleaseType } from '../../options';
import { Project } from '../abstract/project';
import type { TaonProjectResolve } from '../abstract/project-resolve';
import { CURRENT_PACKAGE_VERSION } from '../../build-info._auto-generated_';
//#endregion

export class $Global extends BaseGlobalCommandLine<
  {
    watch?: boolean;
    w?: boolean;
  },
  // @ts-ignore TODO weird inheritance problem
  Project,
  TaonProjectResolve
> {
  public async _() {
    //#region @backendFunc
    await this.ins.taonProjectsWorker.terminalUI.infoScreen();
    //#endregion
  }

  async hasSudoCommand(): Promise<void> {
    //#region @backendFunc
    const hasSudo = await UtilsOs__NS__commandExistsAsync('sudo');
    console.log(`Your os has sudo: ${hasSudo}`);
    this._exit();
    //#endregion
  }

  anymatch() {
    //#region @backendFunc
    // const anymatch = require('anymatch');
    // const f = '/home/dfilipiak/projects/npm/taon-dev/taon/tmp-all-assets-linked';
    // const exclude = anymatch([
    //   '/home/dfilipiak/projects/npm/taon-dev/taon/tmp-*/**',
    //   '/home/dfilipiak/projects/npm/taon-dev/taon/tmp-*',
    //   '/home/dfilipiak/projects/npm/taon-dev/taon/tmp-all-assets-linked',
    // ], path.basename(f));
    // Helpers__NS__info(`
    //           exclude folder ${f} : ${exclude}`);
    // this._exit();
    //#endregion
  }

  //#region add etc hosts entry
  @UtilsCliClassMethod__NS__decoratorMethod('addEtcHostsEntry')
  addEtcHostsEntry(): void {
    //#region @backendFunc
    const [ip, domain, comment] = this.args || [];
    UtilsNetwork__NS__setEtcHost(domain, ip, comment);
    Helpers__NS__info(
      `Added entry: ${chalk.bold(`${ip} ${domain}`)} to ${UtilsEtcHosts__NS__getPath()} `,
    );
    this._exit();
    //#endregion
  }
  //#endregion

  //#region simulate domain
  simulateDomain(): Promise<void> {
    //#region @backendFunc
    if (this.project?.framework?.isStandaloneProject) {
      const domain =
        this.project.environmentConfig.getEnvMain()?.website?.domain;
      if (domain) {
        this.args = [domain, ...this.args];
        return super.simulateDomain();
      }
    }
    super.simulateDomain();
    //#endregion
  }
  //#endregion

  //#region detect packages
  async detectPackages() {
    //#region @backendFunc
    this.project.removeFile(tmpIsomorphicPackagesJson);
    await this.project.packagesRecognition.start('detecting packages');
    this._exit();
    //#endregion
  }
  //#endregion

  //#region kill process on port
  async killonport() {
    //#region @backendFunc
    const port = parseInt(this.firstArg);
    await Helpers__NS__killProcessByPort(port);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region kill all node processes
  killAllNode() {
    //#region @backendFunc
    HelpersTaon__NS__killAllNode();
    this._exit();
    //#endregion
  }
  //#endregion

  //#region kill all node
  async killAllJava() {
    //#region @backendFunc
    Helpers__NS__info('Killing all java processes...');
    await UtilsProcess__NS__killAllJava();
    Helpers__NS__info('DONE KILL ALL JAVA PROCESSES');
    this._exit();
    //#endregion
  }
  //#endregion

  //#region fork
  async fork() {
    //#region @backendFunc
    Helpers__NS__error(`Not implemented yet`, false, true);
    return; // TODO @LAST
    const argv = this.args;
    const githubUrl = ___NS__first(argv);
    let projectName = ___NS__last(githubUrl.replace('.git', '').split('/'));
    if (argv.length > 1) {
      projectName = argv[1];
    }
    Helpers__NS__info(`Forking ${githubUrl} with name ${projectName}`);
    await this.project.git.clone(githubUrl, projectName);
    let newProj = this.ins.From(
      path.join(this.project.location, projectName),
    ) as Project;
    HelpersTaon__NS__setValueToJSON(
      path.join(newProj.location, packageJsonMainProject),
      'name',
      projectName,
    );
    HelpersTaon__NS__setValueToJSON(
      path.join(newProj.location, packageJsonMainProject),
      'version',
      '0.0.0',
    );

    Helpers__NS__writeFile(
      newProj.pathFor(readmeMdMainProject),
      `
  # ${projectName}

  based on ${githubUrl}

    `,
    );
    Helpers__NS__run(`${UtilsOs__NS__detectEditor()} ${newProj.location}`).sync();
    Helpers__NS__info(`Done`);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region watcher linux
  watchersfix() {
    //#region @backendFunc
    Helpers__NS__run(
      `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`,
    ).sync();
    this._exit();
    //#endregion
  }

  watchers() {
    //#region @backendFunc
    Helpers__NS__run(
      `find /proc/*/fd -user "$USER" -lname anon_inode:inotify -printf '%hinfo/%f\n' 2>/dev/null | xargs cat | grep -c '^inotify'`,
    ).sync();
    this._exit();
    //#endregion
  }
  //#endregion

  //#region code instal ext
  code() {
    //#region @backendFunc
    this.project
      .run(
        `${UtilsOs__NS__detectEditor()} --install-extension ${this.args.join(' ')}`,
      )
      .sync();
    this._exit();
    //#endregion
  }
  //#endregion

  //#region proper watcher test
  async PROPERWATCHERTEST(engine: string) {
    //#region @backendFunc
    // const proj = this.project as Project;
    const cwd = this.cwd;
    const watchLocation = crossPlatformPath([cwd, srcMainProject]);
    const symlinkCatalog = crossPlatformPath([cwd, 'symlinkCatalog']);
    const symlinkCatalogInWatch = crossPlatformPath([watchLocation, 'symlink']);
    const symlinkCatalogFile = crossPlatformPath([
      cwd,
      'symlinkCatalog',
      'aaa.txt',
    ]);
    const options: IncrementalWatcherOptions = {
      name: `[taon]  properwatchtest (testing only)`,
      // ignoreInitial: true,
      followSymlinks: false,
    };

    Helpers__NS__remove(watchLocation);
    Helpers__NS__remove(symlinkCatalog);
    Helpers__NS__writeFile(symlinkCatalogFile, 'hello aaa');
    Helpers__NS__writeFile(
      crossPlatformPath([watchLocation, 'a1', 'aa']),
      'asdasdasdhello aaa',
    );
    Helpers__NS__writeFile(
      crossPlatformPath([watchLocation, 'a2', 'ccc']),
      'heasdasdllo asdasd',
    );
    Helpers__NS__createSymLink(symlinkCatalog, symlinkCatalogInWatch);

    incrementalWatcher([watchLocation], { ...options, engine: 'chokidar' }).on(
      'all',
      (a, b) => {
        console.log('CHOKIDAR', a, b);
      },
    );

    incrementalWatcher([watchLocation], {
      ...options,
      engine: '@parcel/watcher',
    }).on('all', (a, b) => {
      console.log('PARCEL', a, b);
    });

    //#endregion
  }
  //#endregion

  //#region add import src
  /**
   * @deprecated
   */
  ADD_IMPORT_SRC() {
    //#region @backendFunc
    const project = this.project as Project;

    const regexEnd = /from\s+(\'|\").+(\'|\")/g;
    const singleLineImporrt = /import\((\'|\"|\`).+(\'|\"|\`)\)/g;
    const singleLineRequire = /require\((\'|\"|\`).+(\'|\"|\`)\)/g;
    const srcEnd = /\/src(\'|\"|\`)/;
    const betweenApos = /(\'|\"|\`).+(\'|\"|\`)/g;

    const commentMultilieStart = /^\/\*/;
    const commentSingleLineStart = /^\/\//;

    const processAddSrcAtEnd = (
      regexEnd: RegExp,
      line: string,
      packages: string[],
      matchType: 'from_import_export' | 'imports' | 'require',
    ): string => {
      const matches = line.match(regexEnd);
      const firstMatch = ___NS__first(matches) as string;
      const importMatch = (
        ___NS__first(firstMatch.match(betweenApos)) as string
      ).replace(/(\'|\"|\`)/g, '');
      const isOrg = importMatch.startsWith('@');
      const packageName = importMatch
        .split('/')
        .slice(0, isOrg ? 2 : 1)
        .join('/');
      if (packages.includes(packageName) && !srcEnd.test(firstMatch)) {
        let clean: string;
        if (matchType === 'require' || matchType === 'imports') {
          const endCharacters = firstMatch.slice(-2);
          clean =
            firstMatch.slice(0, firstMatch.length - 2) + '/src' + endCharacters;
        } else {
          let endCharacters = firstMatch.slice(-1);
          clean =
            firstMatch.slice(0, firstMatch.length - 1) + '/src' + endCharacters;
        }

        return line.replace(firstMatch, clean);
      }
      return line;
    };

    const changeImport = (content: string, packages: string[]) => {
      return (
        content
          .split(/\r?\n/)
          .map((line, index) => {
            const trimedLine = line.trimStart();
            if (
              commentMultilieStart.test(trimedLine) ||
              commentSingleLineStart.test(trimedLine)
            ) {
              return line;
            }
            if (regexEnd.test(line)) {
              return processAddSrcAtEnd(
                regexEnd,
                line,
                packages,
                'from_import_export',
              );
            }
            if (singleLineImporrt.test(line)) {
              return processAddSrcAtEnd(
                singleLineImporrt,
                line,
                packages,
                'imports',
              );
            }
            if (singleLineRequire.test(line)) {
              return processAddSrcAtEnd(
                singleLineRequire,
                line,
                packages,
                'require',
              );
            }
            return line;
          })
          .join('\n') + '\n'
      );
    };

    const addImportSrc = (proj: Project) => {
      const pacakges = [
        ...proj.packagesRecognition.allIsomorphicPackagesFromMemory,
      ];
      // console.log(pacakges)

      const files = Helpers__NS__filesFrom(proj.pathFor('src'), true).filter(f =>
        f.endsWith('.ts'),
      );

      for (const file of files) {
        const originalContent = Helpers__NS__readFile(file);
        const changed = changeImport(originalContent, pacakges);
        if (
          originalContent &&
          changed &&
          originalContent?.trim().replace(/\s/g, '') !==
            changed?.trim().replace(/\s/g, '')
        ) {
          Helpers__NS__writeFile(file, changed);
        }
      }
    };

    if (project.framework.isStandaloneProject) {
      addImportSrc(project);
    } else if (project.framework.isContainer) {
      for (const child of project.children) {
        addImportSrc(child);
      }
    }

    this._exit();
    //#endregion
  }
  //#endregion

  //#region move js to ts
  $MOVE_JS_TO_TS(args) {
    //#region @backendFunc
    Helpers__NS__filesFrom(crossPlatformPath([this.cwd, args]), true).forEach(f => {
      if (path.extname(f) === '.js') {
        HelpersTaon__NS__move(
          f,
          crossPlatformPath([
            path.dirname(f),
            path.basename(f).replace('.js', '.ts'),
          ]),
        );
      }
    });
    Helpers__NS__info('DONE');
    this._exit();
    //#endregion
  }
  //#endregion

  //#region show messages
  ASYNC_PROC = async args => {
    //#region @backendFunc
    global.tnpShowProgress = true;
    let p = Helpers__NS__run(`${config.frameworkName} show:loop ${args}`, {
      output: false,
      cwd: this.cwd,
    }).async();
    p.stdout.on('data', chunk => {
      console.log('prod:' + chunk);
    });
    p.on('exit', c => {
      console.log('process exited with code: ' + c);
      this._exit();
    });
    //#endregion
  };

  SYNC_PROC = async args => {
    //#region @backendFunc
    global.tnpShowProgress = true;
    try {
      let p = Helpers__NS__run(`${config.frameworkName} show:loop ${args}`, {
        output: false,
        cwd: this.cwd,
      }).sync();
      this._exit();
    } catch (err) {
      console.log('Erroroejk');
      this._exit(1);
    }
    //#endregion
  };

  async SHOW_RANDOM_HAMSTERS() {
    //#region @backendFunc
    while (true) {
      const arr = ['Pluszla', 'Łapczuch', 'Misia', 'Chrupka'];
      console.log(arr[HelpersTaon__NS__randomInteger(0, arr.length - 1)]);
      await Utils__NS__wait(1);
    }
    //#endregion
  }

  @UtilsCliClassMethod__NS__decoratorMethod('showRandomHamstersTypes')
  async showRandomHamstersTypes(): Promise<void> {
    //#region @backendFunc
    while (true) {
      const arr = [
        chalk.red('djungarian'),
        chalk.magenta('syrian golden'),
        chalk.bold('syrian teddy bear'),
        chalk.red('dwarf roborowski'),
        chalk.underline('dwarf russian'),
        'dwarf winter white',
        'chinese hamster',
      ];
      console.log(arr[HelpersTaon__NS__randomInteger(0, arr.length - 1)]);
      await Utils__NS__wait(1);
    }
    //#endregion
  }

  SHOW_LOOP_MESSAGES(args) {
    //#region @backendFunc
    console.log(`

    platform: ${process.platform}
    terminal: ${UtilsProcess__NS__getBashOrShellName()}

    `);
    global.tnpShowProgress = true;
    console.log('process pid', process.pid);
    console.log('process ppid', process.ppid);
    // process.on('SIGTERM', () => {
    //   this._exit()
    // })
    this._SHOW_LOOP_MESSAGES();
    //#endregion
  }

  async newTermMessages() {
    //#region @backendFunc
    UtilsProcess__NS__startInNewTerminalWindow(`tnp showloopmessages 10`);
    this._exit();
    //#endregion
  }

  _SHOW_LOOP(c = 0 as any, maximum = Infinity, errExit = false) {
    //#region @backendFunc
    if (___NS__isString(c)) {
      var { max = Infinity, err = false } = require('minimist')(c.split(' '));
      maximum = max;
      errExit = err;
      // console.log('max',max)
      // console.log('err',err)
      c = 0;
    }
    if (c === maximum) {
      this._exit(errExit ? 1 : 0);
    }
    console.log(`counter: ${c}`);
    setTimeout(() => {
      this._SHOW_LOOP(++c, maximum, errExit);
    }, 1000);
    //#endregion
  }

  _SHOW_LOOP_MESSAGES(
    c = 0 as any,
    maximum = Infinity,
    errExit = false,
    throwErr = false,
  ) {
    //#region @backendFunc
    if (___NS__isString(c)) {
      const obj = require('minimist')(c.split(' '));
      var { max = Infinity, err = false } = obj;
      maximum = ___NS__isNumber(max) ? max : Infinity;
      errExit = err;
      throwErr = obj.throw;
      // console.log('max',max)
      // console.log('err',err)
      c = 0;
    }
    if (c === maximum) {
      if (throwErr) {
        throw new Error('Custom error!');
      }
      if (errExit) {
        this._exit(1);
      }
      this._exit();
    }
    console.log(`counter: ${c}`);
    PROGRESS_DATA.log({ msg: `counter: ${c}`, value: c * 7 });
    setTimeout(() => {
      this._SHOW_LOOP_MESSAGES(++c, maximum, errExit, throwErr);
    }, 2000);
    //#endregion
  }
  //#endregion

  //#region dedupe

  dedupecore() {
    //#region @backendFunc
    const coreProject = Project.ins.by(LibTypeEnum.CONTAINER) as Project;
    coreProject.nodeModules.dedupe(
      this.args.join(' ').trim() === '' ? void 0 : this.args,
    );
    this._exit();
    //#endregion
  }

  dedupecorefake() {
    //#region @backendFunc
    const coreProject = Project.ins.by(LibTypeEnum.CONTAINER) as Project;
    coreProject.nodeModules.dedupe(
      this.args.join(' ').trim() === '' ? void 0 : this.args,
      true,
    );
    this._exit();
    //#endregion
  }

  DEDUPE() {
    //#region @backendFunc
    this.project.nodeModules.dedupe(
      this.args.join(' ').trim() === '' ? void 0 : this.args,
    );
    this._exit();
    //#endregion
  }

  DEDUPE_FAKE() {
    //#region @backendFunc
    this.project.nodeModules.dedupe(
      this.args.join(' ').trim() === '' ? void 0 : this.args,
      true,
    );
    this._exit();
    //#endregion
  }

  DEDUPE_COUNT() {
    //#region @backendFunc
    this.project.nodeModules.dedupeCount(this.args);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region deps

  /**
   * generate deps json
   */
  DEPS_JSON() {
    //#region @backendFunc
    const node_moduels = crossPlatformPath([this.cwd, nodeModulesMainProject]);
    const result = {};
    Helpers__NS__foldersFrom(node_moduels)
      .filter(f => path.basename(f) !== '.bin')
      .forEach(f => {
        const packageName = path.basename(f);
        if (packageName.startsWith('@')) {
          const orgPackageRootName = packageName;
          Helpers__NS__foldersFrom(f).forEach(f2 => {
            try {
              result[`${orgPackageRootName}/${path.basename(f2)}`] =
                HelpersTaon__NS__readValueFromJson(
                  path.join(f2, packageJsonMainProject),
                  'version',
                  '',
                );
            } catch (error) {}
          });
        } else {
          try {
            result[packageName] = HelpersTaon__NS__readValueFromJson(
              path.join(f, packageJsonMainProject),
              'version',
              '',
            );
          } catch (error) {}
        }
      });
    Helpers__NS__writeJson(path.join(this.cwd, result_packages_json), result);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region reinstall
  async reinstall() {
    //#region @backendFunc
    Helpers__NS__taskStarted(`Reinstalling ${this.project.genericName}...`);
    if (!this.project) {
      Helpers__NS__error(`Project not found in ${this.cwd}`, true, false);
      this._exit();
    }
    await this.project?.nodeModules?.reinstall();
    Helpers__NS__info(`Done reinstalling ${this.project.genericName}`);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region reinstall core containers
  @UtilsCliClassMethod__NS__decoratorMethod('reinstallCoreContainers')
  async reinstallCoreContainers(): Promise<void> {
    //#region @backendFunc
    const toReinstallCoreContainers = crossPlatformPath([
      Project.ins.by(LibTypeEnum.CONTAINER).location,
      '..',
    ]);

    const ommitedVersion = ['v20'] as CoreModels__NS__FrameworkVersion[];
    const foldersAbsPaths = Helpers__NS__foldersFrom(toReinstallCoreContainers, {
      recursive: false,
    })
      .filter(f => path.basename(f).startsWith(LibTypeEnum.CONTAINER))
      .filter(f => {
        const project = this.ins.From(f) as Project;
        return (
          project &&
          project.framework.frameworkVersionAtLeast(
            `v${___NS__first(CURRENT_PACKAGE_VERSION.split('.'))}` as any,
          ) &&
          !ommitedVersion.includes(project.framework.frameworkVersion)
        );
      });

    const projectsFoldersAbsPaths =
      foldersAbsPaths.length === 1
        ? foldersAbsPaths
        : await UtilsTerminal__NS__multiselect({
            question: `Select core containers to reinstall`,
            choices: foldersAbsPaths.map(absFolderPath => {
              return {
                name: path.basename(absFolderPath),
                value: absFolderPath,
              };
            }),
          });

    for (let index = 0; index < projectsFoldersAbsPaths.length; index++) {
      const project = this.ins.From(projectsFoldersAbsPaths[index]) as Project;
      await project.nodeModules.reinstall();
    }
    Helpers__NS__info(`Done reinstalling core containers`);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region file info
  FILEINFO = args => {
    //#region @backendFunc
    console.log(
      HelpersTaon__NS__getMostRecentFilesNames(crossPlatformPath(this.cwd)),
    );

    this._exit();
    //#endregion
  };
  //#endregion

  //#region versions
  VERSIONS() {
    //#region @backendFunc
    const children = this.project.children;

    for (let index = 0; index < children.length; index++) {
      const child = children[index] as Project;
      Helpers__NS__info(`v${child.packageJson.version}\t - ${child.genericName}`);
    }

    this._exit();
    //#endregion
  }
  //#endregion

  //#region path
  path() {
    //#region @backendFunc
    console.log(this.ins.Tnp.location);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region env
  ENV_CHECK(args) {
    //#region @backendFunc
    HelpersTaon__NS__checkEnvironment();
    this._exit();
    //#endregion
  }

  @UtilsCliClassMethod__NS__decoratorMethod('ENV_INSTALL')
  ENV_INSTALL() {
    //#region @backendFunc
    CLI.installEnvironment(requiredForDev);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region throw error
  THROW_ERR() {
    //#region @backendFunc
    Helpers__NS__error(`Erororoororo here`, false, true);
    //#endregion
  }
  //#endregion

  //#region brew
  BREW(args) {
    //#region @backendFunc
    const isM1MacOS = os.cpus()[0].model.includes('Apple M1');
    if (process.platform === 'darwin') {
      if (isM1MacOS) {
        Helpers__NS__run(`arch -x86_64 brew ${args}`).sync();
      } else {
        Helpers__NS__run(`brew ${args}`).sync();
      }
    }
    this._exit();
    //#endregion
  }
  //#endregion

  //#region run
  run() {
    //#region @backendFunc
    Helpers__NS__run(`node run.js`, {
      output: true,
      silence: false,
    }).sync();
    this._exit(0);
    //#endregion
  }
  //#endregion

  //#region ps info
  async PSINFO(args: string) {
    //#region @backendFunc
    const pid = Number(args);

    let ps: Models__NS__PsListInfo[] = await psList();

    let psinfo = ps.find(p => p.pid == pid);
    if (!psinfo) {
      Helpers__NS__error(`No process found with pid: ${args}`, false, true);
    }
    console.log(psinfo);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region sync core repositories

  get absPathToLocalTaonContainers(): string | undefined {
    //#region @backendFunc
    if (!this.project) {
      return;
    }
    const localTaonRepoPath = crossPlatformPath([
      this.project.location,
      this.project.ins.taonProjectsRelative,
    ]);
    return localTaonRepoPath;
    //#endregion
  }

  async TNP_SYNC() {
    //#region @backendFunc

    const currentFrameworkVersion = this.project.taonJson.frameworkVersion;
    const pathToTaonContainerNodeModules = crossPlatformPath([
      UtilsOs__NS__getRealHomeDir(),
      dotTaonFolder,
      taonContainers,
      `${containerPrefix}${currentFrameworkVersion}`,
      nodeModulesMainProject,
    ]);
    Helpers__NS__taskStarted(`Syncing node_modules from taon container to tnp...`);

    //#region copy from .taon to tnp
    await HelpersTaon__NS__copyFolderOsNative(
      pathToTaonContainerNodeModules,
      this.project.nodeModules.path,
      { removeDestination: true },
    );
    HelpersTaon__NS__copyFile(
      crossPlatformPath([
        pathToTaonContainerNodeModules,
        `../${tmpIsomorphicPackagesJson}`,
      ]),
      this.project.pathFor(tmpIsomorphicPackagesJson),
    );
    //#endregion

    Helpers__NS__taskDone(`Done syncing node_modules from container to tnp...`);
    Helpers__NS__taskStarted(
      `Syncing node_modules from tnp to ../taon-container...`,
    );

    //#region copy from tnp to ../taon
    await HelpersTaon__NS__copyFolderOsNative(
      this.project.nodeModules.path,
      crossPlatformPath(
        `${this.absPathToLocalTaonContainers}/${containerPrefix}${currentFrameworkVersion}/${nodeModulesMainProject}`,
      ),
      { removeDestination: true },
    );

    HelpersTaon__NS__copyFile(
      this.project.pathFor(tmpIsomorphicPackagesJson),
      crossPlatformPath(
        `${this.absPathToLocalTaonContainers}/${containerPrefix}${currentFrameworkVersion}/${tmpIsomorphicPackagesJson}`,
      ),
    );

    //#endregion

    Helpers__NS__taskDone(
      `Done syncing node_modules from tnp to ../${taonContainers} ...`,
    );
    this._exit();
    //#endregion
  }

  async SYNC() {
    //#region @backendFunc
    const isInsideTnpAndTaonDev =
      this.project?.name === 'tnp' &&
      this.project?.parent.name === 'taon-dev' &&
      Helpers__NS__exists(this.absPathToLocalTaonContainers);

    if (isInsideTnpAndTaonDev) {
      Helpers__NS__info(`

        You are inside taon-dev/tnp project.

        `);
    }

    const updateTnpAndLocalTona =
      isInsideTnpAndTaonDev &&
      (await UtilsTerminal__NS__confirm({
        message: `Would you like to update tnp and ../${taonContainers} (after sync command) ?`,
        defaultValue: true,
      }));

    this.ins.sync({ syncFromCommand: true });
    if (updateTnpAndLocalTona) {
      await this.TNP_SYNC();
    }
    this._exit();
    //#endregion
  }
  //#endregion

  //#region clear
  async CLEAN() {
    //#region @backendFunc
    await this.project.artifactsManager.clear(
      EnvOptions.from(this.params as any),
    );
    this._exit();
    //#endregion
  }

  CLEAR() {
    //#region @backendFunc
    this.CLEAN();
    //#endregion
  }

  CL() {
    //#region @backendFunc
    this.CLEAN();
    //#endregion
  }
  //#endregion

  //#region show git in progress
  inprogress() {
    //#region @backendFunc
    Helpers__NS__info(`
    In progress
${this.project.children
  .filter(f =>
    f.git
      .lastCommitMessage()
      .startsWith(HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT()),
  )
  .map((c, index) => `${index + 1}. ${c.genericName}`)}

    `);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region update deps for core container

  async depsupdate(): Promise<void> {
    await this.updatedeps();
  }

  async updatedeps(): Promise<void> {
    //#region @backendFunc
    if (!this.project || !this.project.framework.isCoreProject) {
      if (this.project && this.project.typeIs(LibTypeEnum.ISOMORPHIC_LIB)) {
        // await this.project.init(
        //   EnvOptions.from({
        //     purpose: 'updating isomorphic-lib external deps',
        //   }),
        // );
        this.project.taonJson.detectAndUpdateNpmExternalDependencies();
        this.project.taonJson.detectAndUpdateIsomorphicExternalDependencies();
        UtilsTypescript__NS__formatFile(this.project.taonJson.path);
      } else {
        Helpers__NS__error(
          `This command can be used only inside:` +
            `\n- core container projects` +
            `\n-isomorphic-lib projects`,
          false,
          true,
        );
      }
      this._exit();
    }
    await this.project.taonJson.updateDependenciesFromNpm({
      onlyPackageNames: this.args,
    });
    this._exit();
    //#endregion
  }
  //#endregion

  //#region compare containers
  compareContainers() {
    //#region @backendFunc
    Helpers__NS__clearConsole();
    const [c1ver, c2ver] = this.args;
    const c1 = this.ins.by(
      LibTypeEnum.CONTAINER,
      `v${c1ver.replace('v', '')}` as any,
    );
    const c2 = this.ins.by(
      LibTypeEnum.CONTAINER,
      `v${c2ver.replace('v', '')}` as any,
    );
    const c1Deps = c1.packageJson.allDependencies;
    const c2Deps = c2.packageJson.allDependencies;
    const displayCompare = (
      depName: string,
      c1depVer: string,
      c2depVer: string,
    ) => {
      // console.log(`Comparing ${depName} ${c1depVer} => ${c2depVer}`);
      c1depVer = UtilsNpm__NS__fixMajorVerNumber(c1depVer);
      c2depVer = UtilsNpm__NS__fixMajorVerNumber(c2depVer);

      if ([c1depVer, c2depVer].includes('latest')) {
        console.log(`${chalk.gray(depName)}@(${c1depVer} => ${c2depVer})\t`);
      } else if (c2depVer && c1depVer) {
        if (semver.lt(c2depVer, c1depVer)) {
          console.log(`${chalk.red(depName)}@(${c1depVer} => ${c2depVer})\t`);
        } else if (semver.gte(c2depVer, c1depVer)) {
          console.log(`${chalk.gray(depName)}@(${c1depVer} => ${c2depVer})\t`);
        }
      } else {
        console.log(`${chalk.bold(depName)}@(${c1depVer} => ${c2depVer})\t`);
      }
    };
    const allDepsKeys = Object.keys(c1Deps).concat(Object.keys(c2Deps));
    for (const packageName of allDepsKeys) {
      displayCompare(
        packageName,
        UtilsNpm__NS__clearVersion(c1Deps[packageName], { removePrefixes: true }),
        UtilsNpm__NS__clearVersion(c2Deps[packageName], { removePrefixes: true }),
      );
    }
    this._exit();
    //#endregion
  }
  //#endregion

  //#region not for npm / get trusted

/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
  

  //#endregion

  //#region not for npm / tnp fix taon json

/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
/* */
  

  //#endregion

  //#region start taon projects worker
  @UtilsCliClassMethod__NS__decoratorMethod('startCliServiceTaonProjectsWorker')
  async startCliServiceTaonProjectsWorker() {
    //#region @backendFunc
    await this.ins.taonProjectsWorker.cliStartProcedure({
      methodOptions: {
        cliParams: {
          ...this.params,
          mode: BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
        },
        calledFrom: 'cli-GLobal',
      },
    });
    //#endregion
  }
  //#endregion

  //#region json schema docs watcher
  async recreateDocsConfigJsonSchema(): Promise<void> {
    //#region @backendFunc
    await this.project.init(
      EnvOptions.from({
        purpose: 'initing before json schema docs watch',
      }),
    );
    if (this.project.name !== 'tnp') {
      Helpers__NS__error(`This command is only for tnp project`, false, true);
    }
    const fileToWatchRelative = 'src/lib/models.ts';
    const fileToWatch = this.project.pathFor(fileToWatchRelative);

    const recreate = async () => {
      const schema = await this._createJsonSchemaFrom({
        nameOfTypeOrInterface: 'Models__NS__DocsConfig',
        project: this.project,
        relativePathToTsFile: fileToWatch,
      });
      Helpers__NS__writeFile(
        this.project.artifactsManager.artifact.docsWebapp.docs
          .docsConfigSchemaPath,
        schema,
      );
      Helpers__NS__info(
        `DocsConfig schema updated ${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}`,
      );
    };

    const debounceRecreate = ___NS__debounce(recreate, 100);
    Helpers__NS__taskStarted('Recreating... src/lib/models.ts');
    await recreate();
    Helpers__NS__taskDone('Recreation done src/lib/models.ts');
    Helpers__NS__taskStarted('Watching for changes in src/lib/models.ts');
    if (this.params.watch || this.params.w) {
      chokidar.watch(fileToWatch).on('change', () => {
        debounceRecreate();
      });
    } else {
      await recreate();
      this._exit();
    }
    //#endregion
  }
  //#endregion

  //#region json schema taon watch
  async recreateTaonJsonSchema(): Promise<void> {
    //#region @backendFunc
    // await this.project.init(
    //   EnvOptions.from({
    //     purpose: 'initing before json schema docs watch',
    //   }),
    // );
    if (this.project.name !== 'tnp') {
      Helpers__NS__error(`This command is only for tnp project`, false, true);
    }
    const fileToWatchRelative = 'src/lib/models.ts';
    const fileToWatch = this.project.pathFor(fileToWatchRelative);

    const recreate = async () => {
      await (async () => {
        const projectsOfInterest = [
          this.project.framework.coreProject,
          this.project,
        ];

        const schemaStandalone = await this._createJsonSchemaFrom({
          nameOfTypeOrInterface: 'Models__NS__TaonJsonStandalone',
          project: this.project,
          relativePathToTsFile: fileToWatch,
        });
        for (const proj of projectsOfInterest) {
          proj.vsCodeHelpers.recreateJsonSchemaForTaon();
          Helpers__NS__writeFile(
            proj.pathFor(taonConfigSchemaJsonStandalone),
            schemaStandalone,
          );
        }
      })();

      await (async () => {
        const projectsOfInterest = [
          this.project.framework.coreContainer,
          this.project.parent,
        ];

        const schemaContainer = await this._createJsonSchemaFrom({
          nameOfTypeOrInterface: 'Models__NS__TaonJsonContainer',
          project: this.project,
          relativePathToTsFile: fileToWatch,
        });
        for (const proj of projectsOfInterest) {
          proj.vsCodeHelpers.recreateJsonSchemaForTaon();
          Helpers__NS__writeFile(
            proj.pathFor(taonConfigSchemaJsonContainer),
            schemaContainer,
          );
        }
      })();

      Helpers__NS__info(
        `TaonConfig schema updated ${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}`,
      );
    };

    const debounceRecreate = ___NS__debounce(recreate, 100);
    Helpers__NS__taskStarted('Recreating... src/lib/models.ts');
    await recreate();
    Helpers__NS__taskDone('Recreation done src/lib/models.ts');
    if (this.params.watch || this.params.w) {
      Helpers__NS__taskStarted('Watching for changes in src/lib/models.ts');
      chokidar.watch(fileToWatch).on('change', () => {
        debounceRecreate();
      });
    } else {
      await recreate();
      this._exit();
    }
    //#endregion
  }

  jsonSchema() {
    //#region @backendFunc
    return this.schemaJson();
    //#endregion
  }

  async _createJsonSchemaFrom(options: Models__NS__CreateJsonSchemaOptions) {
    //#region @backendFunc
    const { project, relativePathToTsFile, nameOfTypeOrInterface } = options;

    // Create the config for ts-json-schema-generator
    const config = {
      path: relativePathToTsFile, // Path to the TypeScript file
      tsconfig: project.pathFor(tsconfigForSchemaJson), // Path to the tsconfig.json file
      type: nameOfTypeOrInterface, // Type or interface name
      skipTypeCheck: true, // Optional: Skip type checking
    } as Config;

    try {
      // Create the schema generator using the config
      const generator: SchemaGenerator = createGenerator(config);

      // Generate the schema
      const schema = generator.createSchema(config.type);

      // Convert the schema object to JSON string
      const schemaJson = JSON.stringify(schema, null, 2);

      return schemaJson;
    } catch (error) {
      const diagnostics = UtilsTypescript__NS__parseTsDiagnostic(
        error.diagnostic ?? error,
      );

      for (const d of diagnostics) {
        if (d.file) {
          console.error(
            `[TS ${d.category}] (${d.code})`,
            `${d.file}:${d.line}:${d.character}`,
            '\n' + d.message,
          );
        } else {
          console.error(`[TS ${d.category}] (${d.code})`, d.message);
        }
      }
    }

    return {};
    //#endregion
  }

  schemaJson() {
    //#region @backendFunc
    console.log(
      this._createJsonSchemaFrom({
        project: this.project,
        relativePathToTsFile: this.firstArg,
        nameOfTypeOrInterface: this.lastArg,
      }),
    );
    this._exit();
    //#endregion
  }
  //#endregion

  //#region ts testing functions
  public async ts() {
    //#region @backendFunc
    Helpers__NS__clearConsole();
    await UtilsTerminal__NS__selectActionAndExecute({
      recognizeImportExportRequire: {
        name: 'Recognize import/export/require',
        action: async () => {
          const files = Helpers__NS__getFilesFrom([this.cwd, srcMainProject], {
            followSymlinks: false,
            recursive: true,
          });
          const selectedFileAbsPath = await UtilsTerminal__NS__select({
            question: 'Select file to recognize imports/exports/requires',
            choices: files.map(f => {
              return {
                name: f,
                value: f,
              };
            }),
          });

          const importsExports = UtilsTypescript__NS__recognizeImportsFromFile(
            Helpers__NS__readFile(selectedFileAbsPath),
          ).map(i => {
            return `(${i.type}) ${chalk.bold(i.cleanEmbeddedPathToFile)}`;
          });
          console.log(importsExports.join('\n '));
        },
      },
    });
    this._exit();
    //#endregion
  }
  //#endregion

  //#region update core container deps
  async coreContainerDepsUpdate() {
    //#region @backendFunc
    if (
      this.project.name !== 'taon' &&
      this.project?.parent?.typeIsNot(LibTypeEnum.CONTAINER)
    ) {
      Helpers__NS__error(
        `This command is only for taon project in taon-dev container`,
        false,
        true,
      );
    }
    const containerCore = this.project.framework.coreContainer;
    for (const child of this.project.parent.children.filter(
      f => f.framework.isStandaloneProject,
    )) {
      Helpers__NS__info(`Updating ${child.name} version from npm...`);
      const version = await child.npmHelpers.getPackageVersionFromNpmRegistry(
        child.nameForNpmPackage,
      );
      console.info(`Found version: ${version} for ${child.nameForNpmPackage}`);
      containerCore.taonJson.overridePackageJsonManager.updateDependency({
        packageName: child.nameForNpmPackage,
        version: `~${version}`,
      });
    }
    Helpers__NS__info(`Container deps updated`);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region wrapper for ng
  ng() {
    //#region @backendFunc
    // check if for example v18 in args
    const latest = 'latest';
    const version = this.args.find(arg => arg.startsWith('v')) || latest;
    let argsWithParams = this.argsWithParams;
    if (version !== latest) {
      this.args = this.args.filter(arg => !arg.startsWith('v'));
      argsWithParams = this.argsWithParams.replace(version, '');
    }
    Helpers__NS__run(
      `npx -p @angular/cli@${version.replace('v', '').replace('@', '')} ng ${argsWithParams}`,
      {
        output: true,
        silence: false,
      },
    ).sync();
    this._exit();
    //#endregion
  }
  //#endregion

  //#region are linked node_modules
  isLinkNodeModules() {
    //#region @backendFunc
    console.log(this.project.nodeModules.isLink);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region link node_modules from core container
  linkNodeModulesFromCoreContainer() {
    //#region @backendFunc
    const coreContainer = this.project.ins.by(
      LibTypeEnum.CONTAINER,
      this.firstArg as any,
    );
    if (!coreContainer) {
      Helpers__NS__error(
        `Please specify proper container version in argument`,
        false,
        true,
      );
    }
    this.project.nodeModules.unlinkNodeModulesWhenLinked();
    coreContainer.nodeModules.linkToProject(this.project as any);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region recognize imports from file
  /**
   * Display all imports from specific project file
   */
  imports(): void {
    //#region @backendFunc
    const imports = UtilsTypescript__NS__recognizeImportsFromFile(
      this.project.pathFor(this.firstArg),
    );
    console.log(imports);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region recognize imports from file
  /**
   * Display all imports from specific project
   */
  allImports() {
    //#region @backendFunc
    Helpers__NS__taskStarted(`Recognizing all imports from project...`);
    const displayList =
      this.project.framework
        .allDetectedExternalIsomorphicDependenciesForNpmLibCode;

    console.log(displayList.map(i => `"${i}"`).join('\n'));
    Helpers__NS__info(`Total unique imports found: ${displayList.length}`);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region dirname for tnp
  @UtilsCliClassMethod__NS__decoratorMethod('dirnameForTnp')
  dirnameForTnp() {
    //#region @backendFunc
    console.log(
      `cli method: ${config.frameworkName} ${UtilsCliClassMethod__NS__getFrom(
        $Global.prototype.dirnameForTnp,
        {
          globalMethod: true,
        },
      )}`,
    );
    console.log(config.dirnameForTnp);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region detect contexts
  contexts() {
    //#region @backendFunc
    Helpers__NS__taskStarted(`Detecting contexts...`);
    const contexts = this.project.framework.getAllDetectedTaonContexts();
    console.log(`Detected contexts: ${contexts.length} `);
    for (const context of contexts) {
      console.log(`- ${context.contextName} (${context.fileRelativePath})`);
    }
    Helpers__NS__taskDone(`Contexts detected`);
    this._exit();
    //#endregion
  }
  //#endregion

  //#region regenerate vscode settings colors
  _regenerateVscodeSettingsColors() {
    //#region @backendFunc
    const overrideBottomColor =
      this.project.vsCodeHelpers.getVscodeBottomColor();

    super._regenerateVscodeSettingsColors(overrideBottomColor);
    //#endregion
  }
  //#endregion

  //#region test messages
  messagesTest() {
    //#region @backendFunc
    console.log('-----1');
    Helpers__NS__log(`Helpers__NS__log`);
    Helpers__NS__info(`Helpers__NS__info`);
    Helpers__NS__error(`Helpers__NS__error`, true, true);
    Helpers__NS__warn(`Helpers__NS__warn`);
    Helpers__NS__success(`Helpers__NS__success`);
    Helpers__NS__taskStarted(`Helpers__NS__taskStarted`);
    Helpers__NS__taskDone(`Helpers__NS__taskDone`);
    console.log('-----2');
    Helpers__NS__logInfo(`Helpers__NS__logInfo`);
    Helpers__NS__logError(`Helpers__NS__logError`, true, true);
    Helpers__NS__logWarn(`Helpers__NS__logWarn`);
    Helpers__NS__logSuccess(`Helpers__NS__logSuccess`);
    console.log('-----3');
    this._exit();
    //#endregion
  }
  //#endregion

  //#region extract string metadata
  // projectName|-|www-domgrubegozwierzaka-pl||--||releaseType|-|manual||--||version|-|0.0.8||--||
  // envName|-|__||--||envNumber|-|||--||targetArtifact|-|angular-node-app|||||-1759151320202-fa12e3a5cfdd
  extractStringMetadata() {
    //#region @backendFunc
    const str = this.firstArg || '';
    console.log(str);
    console.log(
      FilePathMetaData__NS__extractData(str, {
        keysMap,
      }),
    );
    this._exit();
    //#endregion
  }
  //#endregion

  //#region aaa (test command)
  async aaa() {
    //#region @backendFunc
    // const stuff = await UtilsTerminal__NS__select({
    //   choices: [],
    //   question: 'Select something',
    // });
    //   const coreProject1 = this.project.framework.coreProject;
    //   const coreProject2 = Project.ins.by(LibTypeEnum.ISOMORPHIC_LIB);
    //   console.log('coreProject2');
    //   console.log(coreProject1.pathFor(`docker-templates/terafik`));
    //   console.log('coreProject2');
    //   console.log(coreProject2.pathFor(`docker-templates/terafik`));
    // const wrap = UtilsProcessLogger__NS__createStickyTopBox('AAA TEST');
    // const ui = UtilsProcessLogger__NS__createStickyTopBox(
    //   '🐹 PROCESS OUTPUT — last 40 lines — Press ENTER to stop',
    // );
    // let iteration = 0;
    // const allLogs: string[] = [];
    // function makeChunk(chunkNo: number): string[] {
    //   const lines: string[] = [];
    //   for (let i = 0; i < 40; i++) {
    //     const now = new Date().toLocaleTimeString();
    //     lines.push(
    //       `[chunk ${chunkNo.toString().padStart(2, '0')}] line ${i
    //         .toString()
    //         .padStart(2, '0')} — ${now}`,
    //     );
    //   }
    //   return lines;
    // }
    // function feedChunk() {
    //   iteration++;
    //   allLogs.push(...makeChunk(iteration));
    //   ui.update(allLogs.join('\n'));
    // }
    // console.clear();
    // console.log('Starting stress test...\n');
    // // generate a new 40-line chunk every second
    // const timer = setInterval(feedChunk, 1000);
    // // stop after 10 chunks (≈ 400 lines)
    // setTimeout(() => {
    //   clearInterval(timer);
    //   console.log('\n\n✅ Finished streaming 10 chunks of 40 lines each.');
    // }, 10000);
    // this._exit();
    //#endregion
  }
  //#endregion

  //#region local sync
  async localSync() {
    //#region @backendFunc
    if (!this.project) {
      Helpers__NS__error(`No project found in cwd: ${this.cwd}`, false, true);
    }
    if (this.project.name !== 'taon-dev') {
      Helpers__NS__error(
        `This command is only for ${chalk.bold('taon-dev')} project`,
        false,
        true,
      );
    }
    await UtilsProcess__NS__killAllOtherNodeProcesses();

    const tnpProjectInTaonDev = this.project.children.find(
      c => c.name === tnpPackageName,
    );
    const taonContainersProj = this.project.ins.From(
      this.project.pathFor(taonContainers),
    );
    if (!taonContainersProj) {
      Helpers__NS__error(
        `No taon-containers project found in ${this.project.pathFor(taonContainers)}`,
        false,
        true,
      );
    }
    if (!tnpProjectInTaonDev) {
      Helpers__NS__error(`No tnp project found inside taon-dev`, false, true);
    }
    const tnpContainer = taonContainersProj.children.find(
      c =>
        c.name ===
        `${containerPrefix}${tnpProjectInTaonDev.taonJson.frameworkVersion}`,
    );
    await tnpContainer.nodeModules.reinstall();
    tnpContainer.nodeModules.copyToProject(tnpProjectInTaonDev as any);
    // Helpers__NS__info(`Done syncing node_modules from container to tnp...`);

    let children = this.project.children.filter(c =>
      c.typeIs(LibTypeEnum.ISOMORPHIC_LIB),
    );

    for (const child of children) {
      child.git.meltActionCommits();
    }

    children = children.filter((c, i) => {
      const lastCommitMessage = c?.git?.lastCommitMessage()?.trim();
      return !lastCommitMessage?.startsWith('release: ');
    });

    children = this.ins // @ts-ignore BaseProject inheritace compatiblity with Project problem
      .sortGroupOfProject<Project>(
        children,
        proj => [
          ...proj.taonJson.dependenciesNamesForNpmLib,
          ...proj.taonJson.isomorphicDependenciesForNpmLib,
          ...proj.taonJson.peerDependenciesNamesForNpmLib,
        ],
        proj => proj.nameForNpmPackage,
        this.project.taonJson.overridePackagesOrder,
      )
      .filter(d => d.framework.isStandaloneProject);

    if (children.length > 0) {
      Helpers__NS__info(
        `Found ${children.length} children isomorphic projects to rebuild...

${children.map((c, i) => `  ${i + 1}. ${c.name}`).join(',')}

        `,
      );
    }

    await Project.ins.taonProjectsWorker.cliStartProcedure({
      methodOptions: {
        cliParams: {
          mode: BaseCLiWorkerStartMode.DETACHED_WINDOW,
        },
        calledFrom: 'start framework function',
      },
    });

    const rebuildChildren = await UtilsTerminal__NS__confirm({
      message: `Rebuild ${children.length} children isomorphic projects ?`,
      defaultValue: true,
    });

    if (rebuildChildren) {
      for (let index = 0; index < children.length; index++) {
        const child = children[index];
        Helpers__NS__info(
          `Rebuilding ${index + 1} / ${children.length}: ${child.name} ...`,
        );
        await child.build(
          EnvOptions.from({
            purpose: 'local-sync',
            build: {
              watch: false,
            },
            release: {
              targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
            },
          }),
        );
      }
    }

    Helpers__NS__info(`Dony local sync of taon-dev`);
    this._exit();
    //#endregion
  }
  //#endregion

  tagsFor() {
    //#region @backendFunc
    const taonJsonContent = this.project.readFile(taonJsonMainProject);
    const tags = UtilsJson__NS__getAtrributiesFromJsonWithComments(
      `[zone.js]`,
      taonJsonContent,
    );

    console.log(tags);
    this._exit();
    //#endregion
  }

  testGlob() {
    //#region @backendFunc
    // Helpers__NS__taskStarted('Testing glob...');
    // const fullPattern = `${this.project.location}/**/*`;
    // const ignorePatterns = [
    //   '**/node_modules/**/*.*',
    //   '**/node_modules',
    //   '**/.git/**/*.*',
    //   '**/.git',
    //   '**/tmp-*/**',
    //   '**/tmp-*',
    //   '**/dist/**',
    //   '**/dist',
    //   '**/dist-*/**',
    //   '**/browser/**',
    //   '**/browser',
    //   '**/websql/**',
    //   '**/websql',
    //   // '**/projects/**',
    //   // '**/projects',
    //   '**/.taon/**',
    //   '**/.taon',
    //   '**/.tnp/**',
    //   '**/.tnp',
    //   '**/src/**/*.ts',
    //   '**/src/**/*.js',
    //   '**/src/**/*.scss',
    //   '**/src/**/*.css',
    //   '**/src/**/*.html',
    // ];
    // const entries = fg.sync(fullPattern, {
    //   absolute: true,
    //   dot: true,
    //   extglob: true,
    //   globstar: true,
    //   followSymbolicLinks: false,
    //   ignore: [
    //     // ...IGNORE_BY_DEFAULT
    //     ...ignorePatterns,
    //   ],
    //   onlyFiles: false,
    //   stats: true, // This is key!
    // });
    // Helpers__NS__taskDone(`Found entries: ${entries.length}`);
    //#endregion
  }

  async killOthers() {
    //#region @backendFunc
    await UtilsProcess__NS__killAllOtherNodeProcesses();
    //#endregion
  }

  copyimage() {
    //#region @backendFunc
    // let source = this.args[0];
    // let destination = this.args[1];
    // if(!path.isAbsolute(source)){
    //   source = this.project.pathFor(source);
    // }
    // if(!path.isAbsolute(destination)){
    //   destination = this.project.pathFor(destination);
    // }
    // const content = UtilsFilesFoldersSync__NS__readFile(this.args[0], {
    //   readImagesWithoutEncodingUtf8: true,
    // });
    // UtilsFilesFoldersSync__NS__writeFile(this.args[1], content,{
    //   writeImagesWithoutEncodingUtf8: true,
    // });
    // Helpers__NS__info(`Image copied from ${this.args[0]} to ${this.args[1]}`);
    // this._exit();
    //#endregion
  }

  setDefaultAutoConfigTaskName() {
    //#region @backendFunc
    Helpers__NS__taskStarted(`Setting default autoReleaseConfig task names...`);
    this.project.children.forEach(child => {
      Helpers__NS__info(`Processing project: ${child.name}`);
      const items = child.taonJson.autoReleaseConfigAllowedItems;
      items.forEach(item => {
        if (!item.taskName && item.artifactName === 'npm-lib-and-cli-tool') {
          item.taskName = 'npm';
        }
      });
      child.taonJson.autoReleaseConfigAllowedItems = items;
    });
    this._exit();
    //#endregion
  }

  setTsNoCheckForAppTs() {
    //#region @backendFunc
    Helpers__NS__taskStarted(`Setting default autoReleaseConfig task names...`);
    this.project.children.forEach(child => {
      Helpers__NS__info(`Processing project: ${child.name}`);
      const appTsPath = child.pathFor('src/app.ts');
      const fileContent = Helpers__NS__readFile(appTsPath) || '';
      if (fileContent) {
        if (!fileContent.startsWith(`// @ts-${'nocheck'}`)) {
          const contentFixed = `// @ts-${'nocheck'}\n${fileContent}`;
          if (fileContent !== contentFixed) {
            Helpers__NS__writeFile(appTsPath, contentFixed);
          }
        }
      }
    });
    this._exit();
    //#endregion
  }

  getFilesFrom() {
    //#region @backendFunc
    const pathForFiles = crossPlatformPath([this.cwd, this.firstArg]);
    Helpers__NS__taskStarted(`Getting files from path...

      ${pathForFiles}

      `);
    const files = UtilsFilesFoldersSync__NS__getFilesFrom(pathForFiles, {
      recursive: true,
      followSymlinks: false,
      omitPatterns: UtilsFilesFoldersSync__NS__IGNORE_FOLDERS_FILES_PATTERNS,
    });

    Helpers__NS__taskDone(`Files found: ${files.length}`);
    this._exit();
    //#endregion
  }

  getFoldersFrom() {
    //#region @backendFunc
    const pathForFolders = crossPlatformPath([this.cwd, this.firstArg]);
    Helpers__NS__taskStarted(`Getting folders from path...

      ${pathForFolders}

      `);

    const folders = UtilsFilesFoldersSync__NS__getFoldersFrom(
      crossPlatformPath([this.cwd, this.firstArg]),
      {
        recursive: true,
        followSymlinks: false,
        omitPatterns: UtilsFilesFoldersSync__NS__IGNORE_FOLDERS_FILES_PATTERNS,
      },
    );

    Helpers__NS__taskDone(`Folders found: ${folders.length}`);
    this._exit();
    //#endregion
  }

  aaaaa() {
    console.info('GLOBAL COMMAND WORKS!');
    this._exit();
  }

  async spinner() {
    //#region @backend
    console.info('starting spinner');
    globalSpinner.instance.start();
    await Utils__NS__wait(2);
    globalSpinner.instance.text = 'Hello world !';
    await Utils__NS__wait(2);
    console.info('stoppiong spinner and waiting 2 seconds');
    globalSpinner.instance.stop();
    this._exit();
    //#endregion
  }
}

export default {
  // registerd as empty
  $Global: HelpersTaon__NS__CLIWRAP($Global, ''),
};