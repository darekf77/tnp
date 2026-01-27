//#region imports
import { ChangeOfFile } from 'incremental-compiler/lib-prod';
import { RenameRule } from 'magic-renamer/lib-prod';
import { config, LibTypeEnum, UtilsExecProc__NS__executeUntilEndOrThrow, UtilsExecProc__NS__getStdoutWithoutShowingOrThrow, UtilsExecProc__NS__spawnAdminSudo, UtilsExecProc__NS__spawnAsync, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { chalk, chokidar, fse, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith } from 'tnp-core/lib-prod';
import { UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor } from 'tnp-core/lib-prod';
import { UtilsStringRegex__NS__containsNonAscii } from 'tnp-core/lib-prod';
import { UtilsFilesFoldersSync__NS__copy, UtilsFilesFoldersSync__NS__copyFile, UtilsFilesFoldersSync__NS__filterDontCopy, UtilsFilesFoldersSync__NS__filterOnlyCopy, UtilsFilesFoldersSync__NS__getFilesFrom, UtilsFilesFoldersSync__NS__getFoldersFrom, UtilsFilesFoldersSync__NS__IGNORE_FOLDERS_FILES_PATTERNS, UtilsFilesFoldersSync__NS__move, UtilsFilesFoldersSync__NS__readFile, UtilsFilesFoldersSync__NS__UtilsFilesFoldersSyncGetFilesFromOptions, UtilsFilesFoldersSync__NS__writeFile } from 'tnp-core/lib-prod';
import { dotTaonFolder, dotTnpFolder } from 'tnp-core/lib-prod';
import { HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray, UtilsMd__NS__getAssets, UtilsMd__NS__getAssetsFromFile, UtilsMd__NS__getLinksToOtherMdFiles, UtilsMd__NS__moveAssetsPathsToLevel, UtilsMd__NS__moveAssetsPathsToLevelFromFile } from 'tnp-helpers/lib-prod';
import { BaseDebounceCompilerForProject } from 'tnp-helpers/lib-prod';
import { Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, UtilsHttp__NS__startHttpServer } from 'tnp-helpers/lib-prod';

import {
  browserMainProject,
  combinedDocsAllMdFilesFolder,
  customDefaultCss,
  customDefaultJs,
  distMainProject,
  docsConfigJsonFileName,
  docsConfigSchema,
  projectsFromMainProject,
  projectsFromNgTemplate,
  srcMainProject,
  websqlMainProject,
} from '../../../../constants';
import { Models__NS__CreateJsonSchemaOptions, Models__NS__DocsConfig, Models__NS__NewSiteOptions, Models__NS__PsListInfo, Models__NS__RootArgsType, Models__NS__TaonArtifactInclude, Models__NS__TaonAutoReleaseItem, Models__NS__TaonContext, Models__NS__TaonJson, Models__NS__TaonJsonContainer, Models__NS__TaonJsonStandalone, Models__NS__TaonLoaderConfig, Models__NS__TaonLoaders, Models__NS__TestTypeTaon, Models__NS__TestTypeTaonArr, Models__NS__TscCompileOptions } from '../../../../models';
import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';
//#endregion

//#region models / EntrypointFile
type EntrypointFile = {
  title: string;
  relativePath: string;
  // packageName: string;
  contentToWrite?: string;
};
//#endregion

export class Docs extends BaseDebounceCompilerForProject<
  {
    disableMkdocsCompilation?: boolean;
    /**
     * Relative or absolute (TODO) path to the folder where the docs will be generated
     */
    docsOutFolder?: string;
    ciBuild?: boolean;
    port?: number;
  },
  // @ts-ignore TODO weird inheritance problem
  Project
> {
  //#region fields & getters
  private envOptions: EnvOptions;

  protected mkdocsServePort: number;

  private linkedAlreadProjects = {};

  //#region fields & getters / docs config current proj abs path
  public get docsConfigCurrentProjAbsPath(): string {
    //#region @backendFunc
    return this.project.pathFor(docsConfigJsonFileName);
    //#endregion
  }
  //#endregion

  //#region fields & getters / docs config
  get config(): Models__NS__DocsConfig {
    //#region @backendFunc
    return this.project.readJson(docsConfigJsonFileName) as Models__NS__DocsConfig;
    //#endregion
  }
  //#endregion

  //#region fields & getters / linkd docs to global container
  private linkDocsToGlobalContainer(): void {
    //#region @backendFunc
    if (!Helpers__NS__exists(path.dirname(this.docsConfigGlobalContainerAbsPath))) {
      Helpers__NS__mkdirp(path.dirname(this.docsConfigGlobalContainerAbsPath));
    }
    try {
      fse.unlinkSync(this.docsConfigGlobalContainerAbsPath);
    } catch (error) {}
    Helpers__NS__createSymLink(
      this.project.pathFor(this.tmpDocsFolderRootDocsDirRelativePath),
      this.docsConfigGlobalContainerAbsPath,
    );

    this.writeGlobalWatcherTimestamp();
    //#endregion
  }
  //#endregion

  //#region fields & getters / tmp docs folder path
  /**
   * mkdocs temp folder
   */
  public readonly tmpDocsFolderRoot: string = `.${config.frameworkName}/temp-docs-folder`;

  /**
   * Example:
   * .taon/temp-docs-folder/allmdfiles
   */
  get tmpDocsFolderRootDocsDirRelativePath(): string {
    //#region @backendFunc
    return crossPlatformPath([
      this.tmpDocsFolderRoot,
      combinedDocsAllMdFilesFolder,
    ]);
    //#endregion
  }

  //#endregion

  //#region fields & getters / out docs folder path
  get outDocsDistFolderAbs() {
    //#region @backendFunc
    return this.project.pathFor([
      this.initialParams.docsOutFolder || `.${config.frameworkName}/docs-dist`,
    ]);
    //#endregion
  }
  //#endregion

  //#region n fields & getters / docs config global container abs path
  get docsConfigGlobalContainerAbsPath() {
    //#region @backendFunc
    const globalContainer = this.project.ins.by(
      LibTypeEnum.CONTAINER,
      this.project.framework.frameworkVersion,
    );
    return globalContainer.pathFor(
      `.${config.frameworkName}/docs-from-projects/${this.project.nameForNpmPackage}`,
    );
    //#endregion
  }
  //#endregion

  //#region fields & getters / docs global timestamp for watcher abs path
  get docsGlobalTimestampForWatcherAbsPath() {
    //#region @backendFunc
    return this.getTimestampWatcherForPackageName(
      this.project.nameForNpmPackage,
    );
    //#endregion
  }
  //#endregion

  //#region n fields & getters / docs config schema path
  get docsConfigSchemaPath(): string {
    //#region @backendFunc
    return this.project.ins
      .by(LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion)
      .pathFor(docsConfigSchema);
    //#endregion
  }
  //#endregion

  //#endregion

  //#region methods / init
  async init() {
    //#region @backendFunc

    this.project.removeFolderByRelativePath(
      this.tmpDocsFolderRootDocsDirRelativePath,
    );
    this.project.createFolder(this.tmpDocsFolderRootDocsDirRelativePath);
    if (!this.project.hasFile(docsConfigJsonFileName)) {
      this.project.writeJson(docsConfigJsonFileName, this.defaultDocsConfig());
    }

    if (!this.project.framework.isCoreProject) {
      try {
        fse.unlinkSync(this.project.pathFor(docsConfigSchema));
      } catch (error) {}

      if (Helpers__NS__exists(this.docsConfigSchemaPath)) {
        // TODO @LAST GENERATE DOCS CONFIG SCHAMA IN CORE PROJECTS
        Helpers__NS__createSymLink(
          this.docsConfigSchemaPath,
          this.project.pathFor(docsConfigSchema),
          { continueWhenExistedFolderDoesntExists: true },
        );
      }
    }

    this.linkDocsToGlobalContainer();

    //#endregion
  }
  //#endregion

  //#region methods / initialize watchers
  initializeWatchers(envOptions: EnvOptions): void {
    this.envOptions = envOptions;
    const project = this.project;
    this.initOptions({
      taskName: `DocsProviderFor${___NS__upperFirst(
        ___NS__camelCase(this.project.location),
      )}`,
      folderPath: project.location,
      ignoreFolderPatter: [
        project.pathFor('tmp-*/**'),
        project.pathFor('tmp-*'),
        project.pathFor(`${distMainProject}/**`),
        project.pathFor(distMainProject),
        project.pathFor(`${distMainProject}-*/**`),
        project.pathFor(`${browserMainProject}/**`),
        project.pathFor(browserMainProject),
        project.pathFor(`${websqlMainProject}/**`),
        project.pathFor(websqlMainProject),
        project.pathFor(`${projectsFromMainProject}/**`),
        project.pathFor(projectsFromMainProject),
        project.pathFor(`${dotTaonFolder}/**`),
        project.pathFor(dotTaonFolder),
        project.pathFor(`${dotTnpFolder}/**`),
        project.pathFor(dotTnpFolder),
        ...['ts', 'tsx', 'scss', 'html'].map(ext =>
          project.pathFor(`${srcMainProject}/**/*.${ext}`),
        ),
        // TODO I may include in feature for example .ts files in md files with handlebars
      ],
      subscribeOnlyFor: ['md', 'yml' as any, 'jpg', 'png', 'gif', 'svg'],
    });
  }
  //#endregion

  //#region methods / action
  async action({
    changeOfFiles,
    asyncEvent,
  }: {
    changeOfFiles: ChangeOfFile[];
    asyncEvent: boolean;
  }): Promise<void> {
    //#region @backendFunc
    // if (asyncEvent) {
    //   console.log(
    //     'changeOfFiles',
    //     changeOfFiles.map(f => f.fileAbsolutePath),
    //   );
    // }
    // QUICK_FIX
    if (
      asyncEvent &&
      changeOfFiles.length === 1 &&
      ___NS__first(changeOfFiles)?.fileAbsolutePath ===
        this.docsGlobalTimestampForWatcherAbsPath
    ) {
      return;
    }

    if (!asyncEvent) {
      await this.init();
    }

    await this.recreateFilesInTempFolder(asyncEvent);

    if (!asyncEvent) {
      await this.buildMkdocs({ watch: this.isWatchCompilation });

      chokidar
        .watch(this.project.pathFor(docsConfigJsonFileName), {
          ignoreInitial: true,
        })
        .on('all', async () => {
          Helpers__NS__info(
            'Docs config changed (docs-config.jsonc).. rebuilding..',
          );
          await this.action({
            changeOfFiles: [],
            asyncEvent: true,
          });
        });

      Helpers__NS__info(
        `${this.isWatchCompilation ? 'Watch' : 'Normal'} docs build done` +
          `${this.isWatchCompilation ? '. Watching..' : '.'}`,
      );
    }
    if (asyncEvent) {
      this.writeGlobalWatcherTimestamp();
    }
    //#endregion
  }
  //#endregion

  //#region methods / docs config json $schema content
  protected docsConfigSchemaContent(): string {
    //#region @backendFunc
    return Helpers__NS__readFile(this.docsConfigSchemaPath);
    //#endregion
  }
  //#endregion

  //#region private methods

  //#region private methods / default docs config
  private defaultDocsConfig(): Models__NS__DocsConfig {
    //#region @backendFunc
    return {
      site_name: this.project.name,
      // additionalAssets: [], // TODO MAKE IT AUTOMATIC
      externalDocs: {
        mdfiles: [],
        projects: [],
      },
      omitFilesPatters: [],
      priorityOrder: [],
      mapTitlesNames: {
        'README.md': 'Introduction',
      },
      customCssPath: 'custom.css',
      customJsPath: 'custom.js',
    } as Models__NS__DocsConfig;
    //#endregion
  }
  //#endregion

  //#region private methods / apply priority order

  private applyPriorityOrder(files: EntrypointFile[]): EntrypointFile[] {
    //#region @backendFunc
    const orderByPriority = (items: EntrypointFile[], priority: string[]) => {
      return items.sort((a, b) => {
        // Get the index of the 'title' in the priorityOrder array
        const indexA = priority.indexOf(a.title.replace('.md', ''));
        const indexB = priority.indexOf(b.title.replace('.md', ''));

        // If either title is not in the priority order, move it to the end (assign a large index)
        const priorityA = indexA === -1 ? priority.length : indexA;
        const priorityB = indexB === -1 ? priority.length : indexB;

        // Compare by priority order
        return priorityA - priorityB;
      });
    };

    files = orderByPriority(
      files,
      (this.config.priorityOrder || []).map(p => p.replace('.md', '')),
    );

    // Return prioritized files first, followed by the rest
    const omitFilesPatters = this.config.omitFilesPatters || [];
    const result = Utils__NS__uniqArray(
      // [...prioritizedFiles, ...nonPrioritizedFiles]
      files.filter(
        f =>
          f.title &&
          !omitFilesPatters
            .map(a => a.replace('.md', ''))
            .includes(f.title.replace('.md', '')),
      ),
      'relativePath',
    );

    return result as EntrypointFile[];
    //#endregion
  }
  //#endregion

  //#region private methods / mkdocs.yml content
  private mkdocsYmlContent(
    entryPointFilesRelativePaths: EntrypointFile[],
  ): string {
    //#region @backendFunc
    // console.log({
    //   entryPointFilesRelativePaths,
    // });
    // example:
    // - Introduction: introduction/index.md
    // - Setup: setup/index.md
    // - Isomorphic Code: isomorphic-code/index.md
    // - Development: development/index.md
    // - Tutorials: tutorials/index.md
    // - Changelog: changelog/index.md
    // - QA: qa/index.md
    // docs_dir: ./
    return `site_name: ${
      this.config.site_name
        ? this.config.site_name
        : ___NS__upperFirst(this.project.name) + 'Documentation'
    }
# site_url:  ${this.envOptions.website.domain}
nav:
${this.applyPriorityOrder(entryPointFilesRelativePaths)
  .map(p => {
    if (p.relativePath === p.title) {
      `  - ${___NS__replace(p.title, /[_\s]/g, ' ')}`;
    }
    return `  - ${___NS__replace(p.title, /[_\s]/g, ' ')}: ${p.relativePath}`;
  })
  .join('\n')}
docs_dir: ./${combinedDocsAllMdFilesFolder}
theme:
  name: material
  features:
    - navigation.tabs
    - navigation.sections
    - toc.integrate
    - navigation.top
    - search.suggest
    - search.highlight
    - content.tabs.link
    - content.code.annotation
    - content.code.copy
  language: en
  palette:
    primary: custom
    accent: custom
    # - scheme: default
    #   toggle:
    #     icon: material/toggle-switch-off-outline
    #     name: Switch to dark mode
    # primary: red
    # accent: red
    # - scheme: slate
    #   toggle:
    #     icon: material/toggle-switch
    #     name: Switch to light mode
    # primary: red
    # accent: red

extra_css:
  - ${this.config.customCssPath || customDefaultCss}

extra_javascript:
  - ${this.config.customJsPath || customDefaultJs}

# plugins:
#   - social

# extra:
#   social:
#     - icon: fontawesome/brands/github-alt
#       link: https://github.com/james-willett
#     - icon: fontawesome/brands/twitter
#       link: https://twitter.com/TheJamesWillett
#     - icon: fontawesome/brands/linkedin
#       link: https://www.linkedin.com/in/willettjames/

markdown_extensions:
  - pymdownx.highlight:
      anchor_linenums: true
  - pymdownx.inlinehilite
  - pymdownx.snippets
  - admonition
  - pymdownx.arithmatex:
      generic: true
  - footnotes
  - pymdownx.details
  - pymdownx.superfences
  - pymdownx.mark
  - attr_list
  # - pymdownx.emoji:
  #     emoji_index: !!python/name:materialx.emoji.twemoji
  #     emoji_generator: !!python/name:materialx.emoji.to_svg

  `;
    //#endregion
  }
  //#endregion

  async validateEnvironemntForMkdocsBuild(): Promise<boolean> {
    //#region @backendFunc
    const pythonExists = await UtilsOs__NS__commandExistsAsync('python3');
    if (!pythonExists) {
      Helpers__NS__error(
        `Python3 is not installed.
        Please install Python3 to build mkdocs documentation.`,
        true,
        true,
      );
      return false;
    }
    let mkdocsExists = await UtilsOs__NS__pythonModuleExists('mkdocs');
    if (!mkdocsExists) {
      Helpers__NS__logWarn(
        `Mkdocs module not found in python3 environment. Checking pipx..`,
      );
      mkdocsExists = await UtilsOs__NS__pipxPackageExists('mkdocs');
      if (!mkdocsExists) {
        Helpers__NS__error(
          `Mkdocs is not installed in your Python3 environment.
          Please install mkdocs module.`,
          true,
          true,
        );
        return false;
      }
    }

    return true;

    //#region TODO checking mkdocs-material cross platform
    // let mkdocsMaterialExists =
    //   await UtilsOs__NS__pythonModuleExists('mkdocs-material');
    // if (!mkdocsMaterialExists) {
    //   Helpers__NS__logWarn(
    //     `Mkdocs Material theme module not found in python3 environment. Checking pipx..`,
    //   );
    //   mkdocsMaterialExists = await UtilsOs__NS__pipxPackageExists('mkdocs-material');
    //   if (!mkdocsMaterialExists) {
    //     Helpers__NS__logWarn(
    //       `Mkdocs Material not found in pipx mkdocs package. Checking nested mkdocs..`,
    //     );
    //     mkdocsMaterialExists = await UtilsOs__NS__pipxNestedPackageExists(
    //       'mkdocs',
    //       'mkdocs-material',
    //     );
    //   }

    //   if (!mkdocsMaterialExists) {
    //     Helpers__NS__error(
    //       `Mkdocs Material theme is not installed in your Python3 environment.
    //       Please install mkdocs-material module.`,
    //       true,
    //       true,
    //     );
    //     return false;
    //   }
    // }
    // return true;
    //#endregion

    //#endregion
  }

  //#region private methods / build mkdocs
  private async buildMkdocs({ watch }: { watch: boolean }) {
    //#region @backendFunc

    const isEnvValid = await this.validateEnvironemntForMkdocsBuild();
    if (!isEnvValid) {
      Helpers__NS__error(`Cannot build mkdocs documentation. `, true, true);
      process.exit(1);
    }

    if (watch) {
      this.mkdocsServePort = await this.project.registerAndAssignPort(
        'mkdocs serve',
        {
          startFrom: 3900,
        },
      );
      await Helpers__NS__killOnPort(this.mkdocsServePort);
      const quiet = true;
      const serveCommand =
        process.platform !== 'win32'
          ? `mkdocs serve -a localhost:${this.mkdocsServePort} ${quiet ? '--quiet' : ''}`
          : //--quiet
            `python3 -m mkdocs serve -a localhost:${this.mkdocsServePort} ${quiet ? '--quiet' : ''}`;

      // console.log({
      //   serveCommand,
      // });

      Helpers__NS__run(serveCommand, {
        cwd: this.project.pathFor([this.tmpDocsFolderRoot]),
      }).async();

      Helpers__NS__info(
        chalk.bold(`Mkdocs server started on  http://localhost:${this.mkdocsServePort}
         Serving docs from temp folder: ${this.tmpDocsFolderRoot}
        `),
      );
    } else {
      if (!Helpers__NS__exists(this.outDocsDistFolderAbs)) {
        Helpers__NS__mkdirp(this.outDocsDistFolderAbs);
      }
      Helpers__NS__run(
        process.platform !== 'win32'
          ? `mkdocs build --site-dir ${this.outDocsDistFolderAbs}`
          : //
            `python3 -m mkdocs build --site-dir ${this.outDocsDistFolderAbs}`,
        {
          cwd: this.project.pathFor([this.tmpDocsFolderRoot]),
        },
      ).sync();
    }
    //#endregion
  }
  //#endregion

  // TODO @LAST hande @render tag in md files

  //#region private methods / copy files to docs folder
  private copyFilesToTempDocsFolder(
    relativeFilePathesToCopy: string[],
    asyncEvent: boolean,
  ) {
    //#region @backendFunc
    let counterCopy = 0;

    //#region handle custom js/css files
    Helpers__NS__info(`Handling custom js/css custom files..
      css: ${this.config.customCssPath || customDefaultCss}
      js: ${this.config.customJsPath || customDefaultJs}
      `);
    if (
      this.config.customCssPath &&
      this.project.hasFile(this.config.customCssPath)
    ) {
      HelpersTaon__NS__copyFile(
        this.project.pathFor(this.config.customCssPath),
        this.project.pathFor([
          this.tmpDocsFolderRootDocsDirRelativePath,
          this.config.customCssPath,
        ]),
      );
    } else {
      this.project.writeFile(
        [this.tmpDocsFolderRootDocsDirRelativePath, customDefaultCss],
        '',
      );
    }

    if (
      this.config.customJsPath &&
      this.project.hasFile(this.config.customJsPath)
    ) {
      HelpersTaon__NS__copyFile(
        this.project.pathFor(this.config.customJsPath),
        this.project.pathFor([
          this.tmpDocsFolderRootDocsDirRelativePath,
          this.config.customJsPath,
        ]),
      );
    } else {
      this.project.writeFile(
        [this.tmpDocsFolderRootDocsDirRelativePath, customDefaultJs],
        '',
      );
    }
    //#endregion

    for (const asbFileSourcePath of relativeFilePathesToCopy) {
      if (
        Helpers__NS__isFolder(asbFileSourcePath) ||
        Helpers__NS__isSymlinkFileExitedOrUnexisted(asbFileSourcePath)
      ) {
        continue;
      }
      const relativeFileSourcePath = this.project.relative(asbFileSourcePath);
      // console.log(
      //   `(${asyncEvent ? 'async' : 'sync'}) Files changed:`,
      //   relativeFileSourcePath,
      // );
      const isNotInRootMdFile =
        path.basename(asbFileSourcePath) !== relativeFileSourcePath;

      if (isNotInRootMdFile) {
        // console.info('repalcign...');
        const contentWithReplacedSomeLinks =
          UtilsMd__NS__moveAssetsPathsToLevelFromFile(asbFileSourcePath);
        // console.info('repalcign done...');
        UtilsFilesFoldersSync__NS__writeFile(
          this.project.pathFor([
            this.tmpDocsFolderRootDocsDirRelativePath,
            relativeFileSourcePath,
          ]),
          contentWithReplacedSomeLinks,
          {
            writeImagesWithoutEncodingUtf8: true,
          },
        );
      } else {
        HelpersTaon__NS__copyFile(
          asbFileSourcePath,
          this.project.pathFor([
            this.tmpDocsFolderRootDocsDirRelativePath,
            relativeFileSourcePath,
          ]),
        );
      }

      counterCopy++;
      const assetsFromMdFile = UtilsMd__NS__getAssetsFromFile(asbFileSourcePath);
      // if (path.basename(asbFilePath) === 'QA.md') {
      // console.log(`assets for ${relativeFileSourcePath}`, assetsFromMdFile);
      // }

      // TODO add assets to watching list
      for (const assetRelativePathFromFile of assetsFromMdFile) {
        const hasSlash = relativeFileSourcePath.includes('/');
        const slash = hasSlash ? '/' : '';

        const relativeAssetPath = relativeFileSourcePath.replace(
          slash + path.basename(relativeFileSourcePath),
          slash + assetRelativePathFromFile,
        );

        if (UtilsStringRegex__NS__containsNonAscii(relativeAssetPath)) {
          // console.log({
          //   assetRelativePathFromFile,
          //   relativeAssetPath,
          // })
          Helpers__NS__warn(
            `Omitting file with non-ascii characters in path: ${relativeAssetPath}`,
          );
          continue;
        }

        const assetSourcetAbsPath = this.project.pathFor(relativeAssetPath);

        const assetDestLocationAbsPath = this.project.pathFor([
          this.tmpDocsFolderRootDocsDirRelativePath,
          relativeAssetPath,
        ]);
        // console.log({
        //   assetRelativePathFromFile,
        //   relativeAssetPath,
        //   relativeFileSourcePath,
        //   assetDestAbsPath: assetSourcetAbsPath,
        //   assetDestLocationAbsPath,
        // });

        console.log(
          `Copy asset
          "${assetRelativePathFromFile}"
          "${chalk.bold(relativeAssetPath)}"
          to "${assetDestLocationAbsPath}"
          `,
        );

        HelpersTaon__NS__copyFile(assetSourcetAbsPath, assetDestLocationAbsPath);

        counterCopy++;
      }
    }
    const asyncInfo = asyncEvent
      ? `\nRefreshing http://localhost:${this.mkdocsServePort}..`
      : '';

    Helpers__NS__info(
      `(${
        asyncEvent ? 'async' : 'sync'
      }) [${Utils__NS__fullDateTime()}] Copied ${counterCopy} ` +
        `files to temp docs folder. ${asyncInfo}`,
    );
    //#endregion
  }
  //#endregion

  //#region private methods / get root files
  private async getRootFiles(): Promise<EntrypointFile[]> {
    //#region @backendFunc

    return [
      ...Helpers__NS__getFilesFrom(this.project.location, {
        recursive: false,
      })
        .filter(f => f.toLowerCase().endsWith('.md'))
        .map(f => path.basename(f)),
    ].map(f => ({
      title: f.replace('.md', ''),
      relativePath: f,
      // packageName: this.project.universalPackageName,
    }));
    //#endregion
  }
  //#endregion

  //#region private methods / link project to docs folder
  private linkProjectToDocsFolder(packageName: string) {
    //#region @backendFunc

    if (this.project.nameForNpmPackage === packageName) {
      // Helpers__NS__warn(
      //   `Project ${packageName} is the same as current project ${this.project.universalPackageName}`,
      // );
      return;
    }

    // console.log('packageName', packageName);
    let orgLocation: string;
    try {
      orgLocation = fse.realpathSync(
        crossPlatformPath([
          path.dirname(this.docsConfigGlobalContainerAbsPath),
          packageName,
        ]),
      );
    } catch (error) {
      Helpers__NS__error(
        `Not found "${chalk.bold(packageName)}" in global docs container. ` +
          `Update your externalDocs.project config.`,
        false,
        true,
      );
    }

    const dest = this.project.pathFor([
      this.tmpDocsFolderRootDocsDirRelativePath,
      packageName,
    ]);

    if (Helpers__NS__filesFrom(orgLocation).length === 0) {
      const nearestProj = this.project.ins.nearestTo(orgLocation);
      Helpers__NS__warn(
        `

        Please rebuild docs for this project ${chalk.bold(
          nearestProj?.genericName,
        )}.

        `,
      );
      return;
    }

    if (!this.linkedAlreadProjects[orgLocation]) {
      try {
        fse.unlinkSync(dest);
      } catch (error) {}
      Helpers__NS__createSymLink(orgLocation, dest);

      // TODO unlink watcher when project no longer in docs-config.json
      Helpers__NS__info(`Listening changes of external project "${packageName}"..`);
      chokidar
        .watch(this.getTimestampWatcherForPackageName(packageName), {
          ignoreInitial: true,
        })
        .on('all', () => {
          Helpers__NS__info(
            `Docs changed  in external project "${chalk.bold(
              packageName,
            )}".. rebuilding..`,
          );
          this.action({
            changeOfFiles: [],
            asyncEvent: true,
          });
        });
    }

    this.linkedAlreadProjects[orgLocation] = true;
    //#endregion
  }
  //#endregion

  //#region private methods / resolve package data from
  private resolvePackageDataFrom(packageNameWithPath: string): {
    /**
     * global linked package name
     */
    packageName: string;
    /**
     * relative path of the file
     */
    destRelativePath: string;
  } {
    //#region @backendFunc

    const isRelativePath =
      packageNameWithPath.startsWith('../') &&
      packageNameWithPath.startsWith('./');

    const isNpmOrgPath = packageNameWithPath.startsWith('@');
    // const isNormalNpmPackagePath = !isRelativePath && !isNpmOrgPath;
    if (isRelativePath) {
      Helpers__NS__error(
        `Relative pathes are not supported: ${this.docsConfigCurrentProjAbsPath}`,
        false,
        true,
      );
    }

    const packageName = isNpmOrgPath
      ? packageNameWithPath.split('/').slice(0, 2).join('/')
      : ___NS__first(packageNameWithPath.split('/'));

    this.linkProjectToDocsFolder(packageName);

    const destRelativePath = packageNameWithPath
      .replace(packageName + '/', '')
      .replace(packageName, '');

    return { packageName, destRelativePath };
    //#endregion
  }
  //#endregion

  //#region private methods / process md files
  private async getExternalMdFiles(): Promise<EntrypointFile[]> {
    //#region @backendFunc
    const externalMdFiles: EntrypointFile[] = [];
    const externalMdFies = this.config.externalDocs.mdfiles;

    for (const file of externalMdFies) {
      const { packageName, destRelativePath } = this.resolvePackageDataFrom(
        file.packageNameWithPath,
      );

      const filePath = crossPlatformPath([
        path.dirname(this.docsConfigGlobalContainerAbsPath),
        packageName,
        destRelativePath,
      ]);

      if (!Helpers__NS__exists(filePath)) {
        Helpers__NS__warn(`File not found: ${filePath}. Skipping..`);
        continue;
      }

      const sourceAbsPath = fse.realpathSync(filePath);

      const destinationAbsPath = this.project.pathFor([
        this.tmpDocsFolderRootDocsDirRelativePath,
        packageName,
        destRelativePath,
      ]);

      const destMagicRelativePath = file.overrideTitle
        ? file.overrideTitle + '.md'
        : crossPlatformPath([packageName, destRelativePath])
            .split('/')
            .map(p => ___NS__kebabCase(p.replace('.md', '')))
            .join('__') + '.md';

      const destinationMagicAbsPath = this.project.pathFor([
        this.tmpDocsFolderRootDocsDirRelativePath,
        destMagicRelativePath,
      ]);

      HelpersTaon__NS__copyFile(sourceAbsPath, destinationAbsPath);

      if (file.magicRenameRules) {
        let content = Helpers__NS__readFile(destinationAbsPath);
        const rules = RenameRule.from(file.magicRenameRules);
        for (const rule of rules) {
          content = rule.replaceInString(content);
        }
        Helpers__NS__writeFile(destinationMagicAbsPath, content);
      }

      externalMdFiles.push({
        // packageName,
        relativePath: file.magicRenameRules
          ? destMagicRelativePath
          : crossPlatformPath([packageName, destRelativePath]),
        title: file.overrideTitle
          ? file.overrideTitle
          : destRelativePath.replace('.md', ''),
      });
    }
    return externalMdFiles;
    //#endregion
  }
  //#endregion

  //#region private methods / get/process externalDocs.projects files
  private async getProjectsFiles(): Promise<EntrypointFile[]> {
    //#region @backendFunc

    return (this.config.externalDocs.projects || []).map(p => {
      const {
        packageName: firstPackageName,
        destRelativePath: firstDestRelativePath,
      } = this.resolvePackageDataFrom(
        Array.isArray(p.packageNameWithPath)
          ? ___NS__first(p.packageNameWithPath)
          : p.packageNameWithPath,
      );

      let title: string = p.overrideTitle
        ? p.overrideTitle
        : crossPlatformPath([firstPackageName, firstDestRelativePath]);

      if (Array.isArray(p.packageNameWithPath)) {
        const joinEntrypointName = p.overrideTitle
          ? p.overrideTitle + '.md'
          : p.packageNameWithPath
              .map(p => ___NS__snakeCase(p.replace('.md', '')))
              .join('__') + '.md';

        return {
          title,
          relativePath: joinEntrypointName,
          // packageName: p.packageName,
          contentToWrite: p.packageNameWithPath
            .map(singlePackageNameWithPath => {
              const { packageName, destRelativePath } =
                this.resolvePackageDataFrom(singlePackageNameWithPath);

              const orgLocation =
                this.project.nameForNpmPackage === packageName
                  ? this.project.pathFor(
                      this.tmpDocsFolderRootDocsDirRelativePath,
                    )
                  : fse.realpathSync(
                      crossPlatformPath([
                        path.dirname(this.docsConfigGlobalContainerAbsPath),
                        packageName,
                      ]),
                    );

              let fileContent = Helpers__NS__readFile([
                orgLocation,
                destRelativePath,
              ]);

              // if (singlePackageNameWithPath === 'taon/README.md') {
              //   debugger;
              // }

              fileContent = UtilsMd__NS__moveAssetsPathsToLevel(fileContent);

              const exterFileConfig = this.config.externalDocs.mdfiles.find(
                f => f.packageNameWithPath === singlePackageNameWithPath,
              );
              if (exterFileConfig?.magicRenameRules) {
                const rules = RenameRule.from(exterFileConfig.magicRenameRules);
                for (const rule of rules) {
                  fileContent = rule.replaceInString(fileContent);
                }
              }
              return fileContent;
            })
            .join('\n'),
        };
      }
      return {
        title,
        // packageName: p.packageName,
        relativePath:
          `${firstPackageName}/` +
          `${firstDestRelativePath ? firstDestRelativePath : 'README.md'}`,
      };
    });
    //#endregion
  }
  //#endregion

  //#region private methods / recreate files in temp folder
  private async recreateFilesInTempFolder(asyncEvent: boolean) {
    //#region @backendFunc
    const files: string[] = this.exitedFilesAbsPathes.filter(f => {
      if (UtilsStringRegex__NS__containsNonAscii(f)) {
        Helpers__NS__warn(`Omitting file with non-ascii characters in path: ${f}`);
        return false;
      }
      return true;
    });

    this.copyFilesToTempDocsFolder(files, asyncEvent);

    let rootFiles = await this.getRootFiles();
    const externalMdFiles = await this.getExternalMdFiles();
    const projectsFiles = await this.getProjectsFiles();
    const mapTitlesNames = this.config.mapTitlesNames || {};
    // Object.keys(mapTitlesNames).forEach(k => {
    //   mapTitlesNames[k] = mapTitlesNames[k].replace('.md', '');
    // });

    const allFiles = [...rootFiles, ...externalMdFiles, ...projectsFiles].map(
      //#region allow own packages redirection
      // QUICKFIX
      f => {
        if (f.relativePath.startsWith(`${this.project.nameForNpmPackage}/`)) {
          f.relativePath = f.relativePath.replace(
            `${this.project.nameForNpmPackage}/`,
            '',
          );
        }
        if (mapTitlesNames[f.title]) {
          f.title = mapTitlesNames[f.title];
        } else if (mapTitlesNames[f.title.replace('.md', '')]) {
          f.title = mapTitlesNames[f.title.replace('.md', '')];
        } else if (mapTitlesNames[f.title + '.md']) {
          f.title = mapTitlesNames[f.title + '.md'];
        }
        return f;
      },
      //#endregion
    );

    //#region write join entrypoint files
    for (const projectFile of allFiles) {
      if ('contentToWrite' in projectFile) {
        this.project.writeFile(
          [this.tmpDocsFolderRootDocsDirRelativePath, projectFile.relativePath],
          projectFile.contentToWrite,
        );
      }
    }
    //#endregion

    this.project.writeFile(
      [this.tmpDocsFolderRoot, 'mkdocs.yml'],
      this.mkdocsYmlContent(allFiles),
    );
    //#endregion
  }
  //#endregion

  //#region private methods / write global watcher timestamp
  private writeGlobalWatcherTimestamp() {
    //#region @backendFunc
    try {
      Helpers__NS__mkdirp(path.dirname(this.docsGlobalTimestampForWatcherAbsPath));
    } catch (error) {}
    Helpers__NS__writeFile(
      this.docsGlobalTimestampForWatcherAbsPath,
      new Date().getTime().toString(),
    );
    //#endregion
  }
  //#endregion

  //#region private methods / get timestamp watcher for package name

  private getTimestampWatcherForPackageName(universalPackageName: string) {
    //#region @backendFunc
    const globalContainer = this.project.ins.by(
      LibTypeEnum.CONTAINER,
      this.project.framework.frameworkVersion,
    );
    return globalContainer.pathFor(
      `.${config.frameworkName}/watcher-timestamps-for/${universalPackageName}`,
    );
    //#endregion
  }
  //#endregion

  //#endregion
}