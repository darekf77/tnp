//#region imports
import { promisify } from 'util';

import { config, LibTypeEnum } from 'tnp-core/lib-prod';
import { chalk, child_process, crossPlatformPath, path, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, UtilsEtcHosts__NS__EtchostEntry, UtilsEtcHosts__NS__getEntriesByDomain, UtilsEtcHosts__NS__getEntriesByIp, UtilsEtcHosts__NS__getEntryByComment, UtilsEtcHosts__NS__getLines, UtilsEtcHosts__NS__getPath, UtilsEtcHosts__NS__getTokensData, UtilsEtcHosts__NS__removeEntryByDomain, UtilsEtcHosts__NS__SIMULATE_DOMAIN_TAG, UtilsEtcHosts__NS__simulateDomain, UtilsEtcHosts__NS__specificEntryExists, UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings, UtilsNetwork__NS__checkIfServerOnline, UtilsNetwork__NS__checkIfServerPings, UtilsNetwork__NS__checkPing, UtilsNetwork__NS__etcHostHasProperLocalhostIp4Entry, UtilsNetwork__NS__etcHostHasProperLocalhostIp6Entry, UtilsNetwork__NS__getCurrentPublicIpAddress, UtilsNetwork__NS__getEtcHostEntriesByDomain, UtilsNetwork__NS__getEtcHostEntryByComment, UtilsNetwork__NS__getEtcHostEntryByIp, UtilsNetwork__NS__getEtcHostsPath, UtilsNetwork__NS__getFirstIpV4LocalActiveIpAddress, UtilsNetwork__NS__getLocalIpAddresses, UtilsNetwork__NS__isValidDomain, UtilsNetwork__NS__isValidIp, UtilsNetwork__NS__LocalIpInfo, UtilsNetwork__NS__PingResult, UtilsNetwork__NS__removeEtcHost, UtilsNetwork__NS__setEtcHost, UtilsNetwork__NS__SIMULATE_DOMAIN_TAG, UtilsNetwork__NS__simulateDomain, UtilsNetwork__NS__urlParse } from 'tnp-core/lib-prod';
import { BaseCliWorker, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray, UtilsDocker__NS__cleanImagesAndContainersByDockerLabel, UtilsDocker__NS__DOCKER_LABEL_KEY, UtilsDocker__NS__DOCKER_TAON_PROJECT_LABEL, UtilsDocker__NS__DockerComposeActionOptions, UtilsDocker__NS__DockerComposeActionType, UtilsDocker__NS__getDockerComposeActionChildProcess, UtilsDocker__NS__getDockerComposeActionCommand, UtilsDocker__NS__linkPodmanAsDockerIfNecessary, UtilsDocker__NS__removeAllTaonContainersAndImagesFromDocker } from 'tnp-helpers/lib-prod';

import {
  globalSpinner,
  taonBasePathToGlobalDockerTemplates,
} from '../../../../constants';
import { TaonCloudStatus } from '../taon.models';
import type { TaonProjectsWorker } from '../taon.worker';

import { TraefikServiceProvider } from './treafik-service.provider';
//#endregion

export class TraefikProvider {

  //#region fields & getters
  public service = new TraefikServiceProvider(this);

  public readonly cloudIps: string[] = [];

  protected taonCloudStatus: TaonCloudStatus = TaonCloudStatus.NOT_STARED;

  protected reverseProxyNetworkName = 'traefik-net';

  //#region fields & getters / cloud is enabled
  public get cloudIsEnabled(): boolean {

    //#region @backendFunc
    return (
      this.taonCloudStatus === TaonCloudStatus.ENABLED_NOT_SECURE ||
      this.taonCloudStatus === TaonCloudStatus.ENABLED_SECURED
    );
    //#endregion

  }
  //#endregion

  //#region fields & getters / is dev mode
  public get isDevMode(): boolean {

    //#region @backendFunc
    return (
      this.taonCloudStatus === TaonCloudStatus.ENABLED_NOT_SECURE ||
      this.taonCloudStatus === TaonCloudStatus.STARTING_NOT_SECURE_MODE ||
      Helpers__NS__exists([
        this.pathToTraefikComposeDestCwd,
        `traefik-compose.local-dev.yml`,
      ])
    );
    //#endregion

  }
  //#endregion

  //#region fields & getters / get path to compose dest
  /**
   * Path to traefik docker compose cwd where
   * compose will be started
   */
  public get pathToTraefikComposeDestCwd(): string {

    //#region @backendFunc
    const pathToComposeDest = crossPlatformPath([
      taonBasePathToGlobalDockerTemplates,
      path.basename(this.pathToTraefikComposeSourceTemplateFilesCwd),
    ]);
    return pathToComposeDest;
    //#endregion

  }
  //#endregion

  //#region fields & getters / get path to compose source
  /**
   * Path to traefik docker compose template files
   */
  private get pathToTraefikComposeSourceTemplateFilesCwd(): string {

    //#region @backendFunc
    const pathToComposeSource = this.taonProjectsWorker.ins
      .by(LibTypeEnum.ISOMORPHIC_LIB)
      .pathFor(`docker-templates/traefik`);

    return pathToComposeSource;
    //#endregion

  }
  //#endregion

  //#endregion

  constructor(private taonProjectsWorker: TaonProjectsWorker) {}

  //#region protected methods

  //#region protected methods / set enabled mode
  protected setEnabledMode(): void {
    if (this.isDevMode) {
      this.taonCloudStatus = TaonCloudStatus.ENABLED_NOT_SECURE;
    } else {
      this.taonCloudStatus = TaonCloudStatus.ENABLED_SECURED;
    }
    BaseCliWorker.cloudIp.next(___NS__first(this.cloudIps));
    BaseCliWorker.isCloudEnable.next(true);
  }
  //#endregion

  //#region protected methods / check if docker enabled
  protected async checkIfDockerEnabled(): Promise<boolean> {

    //#region @backendFunc
    Helpers__NS__taskStarted(`Checking if docker is enabled...`);
    const isEnableDocker = await UtilsOs__NS__isDockerAvailable();
    if (!isEnableDocker) {
      Helpers__NS__error(
        `

        Docker is not enabled, please enable docker to use cloud features

        `,
        true,
        true,
      );
      await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
      return false;
    }
    Helpers__NS__taskDone(`Docker is enabled!`);
    return true;
    //#endregion

  }
  //#endregion

  //#region protected methods / delete traefik network
  protected async deleteTraefikNetwork(): Promise<void> {

    //#region @backendFunc

    try {
      child_process.execSync(
        `docker network rm ${this.reverseProxyNetworkName}`,
        { stdio: 'inherit' },
      );
      console.log(`🗑️  Network deleted: ${this.reverseProxyNetworkName}`);
    } catch (error: any) {
      console.log(
        `ℹ️ Network '${this.reverseProxyNetworkName}' probably does not exist, skipping.`,
      );
    }
    //#endregion

  }
  //#endregion

  //#region protected methods / make sure traefik network created
  protected async makeSureTraefikNetworkCreated(): Promise<void> {

    //#region @backendFunc
    try {
      child_process.execSync(
        `docker network create ${this.reverseProxyNetworkName}`,
        {
          stdio: 'ignore',
        },
      );
      console.log(`✅ Network created: ${this.reverseProxyNetworkName}`);
    } catch (error: any) {
      console.log(
        `ℹ️ Network '${this.reverseProxyNetworkName}' probably already exists, skipping.`,
      );
    }
    //#endregion

  }
  //#endregion

  //#region protected methods / select mode explain
  protected async selectModeExplain(): Promise<void> {

    //#region @backendFunc
    UtilsTerminal__NS__clearConsole();

    Helpers__NS__info(
      `Taon Cloud Modes Explanation:
=> ${chalk.bold.yellow('DEV MODE (ENABLED_NOT_SECURE)')}:
  In this mode, Taon Cloud is enabled without SSL/TLS encryption.
  This mode is suitable for development and testing purposes.
=> ${chalk.bold.green('PRODUCTION MODE (ENABLED_SECURED)')}:
  In this mode, Taon Cloud is enabled with SSL/TLS encryption.
  This mode is intended for production environments where security is crucial.
    `,
    );
    await UtilsTerminal__NS__pressAnyKeyToContinueAsync();

    //#endregion

  }
  //#endregion

  //#region protected methods / select mode
  protected async selectMode(options?: {
    // skipDisabled?: boolean;
  }): Promise<TaonCloudStatus> {

    //#region @backendFunc
    options = options || {};
    // options.skipDisabled = options.skipDisabled || false;
    while (true) {
      try {
        let status: TaonCloudStatus;
        const isOsWithoutGui =
          !UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment();

        const optSecure = {
          [TaonCloudStatus.STARTING_SECURE_MODE]:
            'Enable Taon Cloud (PRODUCTION MODE)',
        };
        const optNotSecure = {
          [TaonCloudStatus.STARTING_NOT_SECURE_MODE]:
            'Enable Taon Cloud (DEV MODE)',
        };
        const optExplain = {
          explain: {
            name: '< Explain Taon Cloud modes >',
          },
        };

        const choices = isOsWithoutGui
          ? {
              ...optSecure,
              ...optNotSecure,
              ...optExplain,
            }
          : {
              ...optExplain,
              ...optNotSecure,
              ...optSecure,
            };

        const answer = await UtilsTerminal__NS__select<keyof typeof choices>({
          choices: choices as any,
          question: `Select Taon Cloud mode:`,
        });

        if (answer === 'explain') {
          await this.selectModeExplain();
          continue;
        }

        status = answer as TaonCloudStatus;

        return status;
      } catch (error) {
        if (!(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))) {
          break;
        }
      }
    }
    //#endregion

  }
  //#endregion

  //#region protected methods / get worker terminal actions
  protected async checkIfTraefikIsRunning(options?: {
    waitUntilHealthy?: boolean;
    maxTries?: number;
  }): Promise<boolean> {

    //#region @backendFunc
    let tries = 0;
    options = options || {};
    if (options.waitUntilHealthy) {
      options.maxTries = options.maxTries || 50;
    }
    const execAsync = promisify(child_process.exec);

    globalSpinner.instance.start(`Traefik health: checking...`);

    while (true) {
      tries++;
      if (options.maxTries && tries > options.maxTries) {
        globalSpinner.instance.fail(
          `Traefik is not running or not healthy after ${tries} tries`,
        );
        return false;
      }
      try {
        const { stdout } = await execAsync(
          process.platform === 'win32'
            ? `docker inspect --format="{{json .State.Health.Status}}" traefik`
            : `docker inspect --format='{{json .State.Health.Status}}' traefik`,
        );

        const status = stdout.trim().replace(/"/g, '');
        globalSpinner.instance.text = `Traefik health: ${status}`;

        if (status === 'healthy') {
          globalSpinner.instance.succeed(`Traefik is ready`);
          await UtilsTerminal__NS__wait(1);
          return true;
        }
        if (status === 'unhealthy') {
          if (options.waitUntilHealthy) {
            globalSpinner.instance.text = 'Traefik state is not healthy yet, waiting...';
          } else {
            globalSpinner.instance.fail(`Traefik state is not running or not healthy`);
            return false;
          }
        }
      } catch (error) {
        if (options.waitUntilHealthy) {
          globalSpinner.instance.text = 'Traefik is not healthy yet, waiting...';
        } else {
          globalSpinner.instance.fail('Traefik is not running or not healthy');
          return false;
        }
      }

      await UtilsTerminal__NS__wait(1);
    }
    //#endregion

  }
  //#endregion

  //#region protected methods / select cloud ips
  protected async selectCloudIps(): Promise<boolean> {

    //#region @backendFunc

    //#region select ip type
    const localIps = await UtilsNetwork__NS__getLocalIpAddresses();
    const optPublic = {
      usePublic: {
        name: 'Use Public IP Address (recommended on server)',
      },
    };
    const optLocal = {
      useLocal: {
        name: 'Use Local IP Address',
      },
    };
    const isOsWithoutGui =
      !UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment();
    const choicesIpType = isOsWithoutGui
      ? {
          ...optPublic,
          ...optLocal,
        }
      : {
          ...optLocal,
          ...optPublic,
        };

    const useIp = await UtilsTerminal__NS__select<keyof typeof choicesIpType>({
      choices: choicesIpType,
    });
    //#endregion

    if (useIp === 'usePublic') {

      //#region use public ip
      while (true) {
        try {
          Helpers__NS__info(`Detecting public IP address...`);
          let publicIp = await UtilsNetwork__NS__getCurrentPublicIpAddress();

          const choicesPublicIp = {
            confirm: {
              name: `Use detected public IP: ${chalk.bold(publicIp)}`,
            },
            manual: {
              name: 'Enter public IP manually',
            },
            abort: {
              name: '< abort and go back >',
            },
          };

          const selectedChoice = await UtilsTerminal__NS__select<
            keyof typeof choicesPublicIp
          >({
            choices: choicesPublicIp,
            question: `Select option for public IP address:`,
          });

          if (selectedChoice === 'abort') {
            return false;
          }

          if (selectedChoice === 'manual') {
            publicIp = await UtilsTerminal__NS__input({
              question: `Enter public IP address to be used by Taon Cloud:`,
              required: true,
              validate: ip => {
                return UtilsNetwork__NS__isValidIp(ip);
              },
            });
          }

          this.cloudIps.length = 0;
          this.cloudIps.push(publicIp);

          if (!(await this.areCloudIpsValid())) {
            continue;
          }

          return true;
        } catch (error) {
          if (
            !(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))
          ) {
            return false;
          } else {
            continue;
          }
        }
      }
      //#endregion

    } else {

      //#region use local ip
      let i = 0;
      while (true) {
        i++;
        try {
          if (i > 1) {
            const shouldContinue = await UtilsTerminal__NS__confirm({
              message: `Selecting again IP addresses. Do you want to continue?`,
              defaultValue: true,
            });
            if (!shouldContinue) {
              return false;
            }
          }
          const choices = [
            ...localIps
              .filter(f => f.family === 'IPv4')
              .map(ip => ({
                name: `Local IP: ${ip.address} (${ip.type})`,
                value: ip.address,
              })),
          ];
          const selected = await UtilsTerminal__NS__select<string>({
            choices: choices,
            question: `Select IP addresses to be used by Taon Cloud:`,
          });

          this.cloudIps.length = 0;
          this.cloudIps.push(selected);
          if (!(await this.areCloudIpsValid())) {
            continue;
          }
          return true;
        } catch (error) {
          if (
            !(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))
          ) {
            break;
          }
          continue;
        }
      }
      //#endregion

    }
    //#endregion

  }
  //#endregion

  //#endregion

  //#region public methods

  //#region protected methods / validate ips
  protected async areCloudIpsValid(): Promise<boolean> {

    //#region @backendFunc
    for (const localIp of this.cloudIps) {
      Helpers__NS__info(`Validating IP address (ping): ${localIp}...`);
      if (!(await UtilsNetwork__NS__checkIfServerPings(localIp))) {
        Helpers__NS__error(
          `Server with IP ${localIp} is not reachable! Please select only reachable IPs.`,
          true,
          true,
        );
        return false;
      }
    }
    return true;
    //#endregion

  }
  //#endregion

  //#region public methods / initial cloud status check
  public async initialCloudStatusCheck(): Promise<void> {

    //#region @backendFunc
    const isDockerRunning = await UtilsOs__NS__isDockerAvailable();
    if (isDockerRunning) {
      Helpers__NS__logInfo(`Docker is running.. checking if Traefik is enabled...`);
    } else {
      return;
    }

    const ipFromYml = this.service.getIpFromYml();

    if (!ipFromYml) {
      console.warn(
        `Can find ip from traefik dynamic config yml, assuming Traefik is not configured.`,
      );
      Helpers__NS__info(`Shutting down Traefik if running...`);
      await this.stopTraefik();
      return;
    }
    this.cloudIps.push(ipFromYml);

    const isTraefikRunning = await this.checkIfTraefikIsRunning();
    if (isTraefikRunning) {
      Helpers__NS__info(`Traefik is running with IP: ${ipFromYml}`);
      Helpers__NS__info(`Restarting Traefik to refresh new settings...`);
      await this.restartTraefik();
      this.setEnabledMode();
    } else {
      console.warn(
        `Traefik is not running even if configured with IP: ${ipFromYml}`,
      );
      Helpers__NS__info(`Shutting down Traefik if running...`);
      await this.stopTraefik();
      return;
    }
    //#endregion

  }
  //#endregion

  //#region public methods / restart traefik
  public async restartTraefik(options?: {
    hardRestart?: boolean;
  }): Promise<void> {

    //#region @backendFunc
    options = options || {};
    if (options.hardRestart) {
      await this.stopTraefik();
      await this.startTraefik();
      return;
    }
    console.log(`🚀 Restarting Traefik ${this.isDevMode ? 'DEV' : 'PROD'}...`);
    const execAsync = promisify(child_process.exec);
    try {
      await execAsync(
        `docker compose -f ` +
          ` traefik-compose${this.isDevMode ? '.local-dev' : ''}.yml down`,
        {
          cwd: this.pathToTraefikComposeDestCwd,
        },
      );
      await execAsync(
        `docker compose -f ` +
          ` traefik-compose${this.isDevMode ? '.local-dev' : ''}.yml up -d traefik`,
        {
          cwd: this.pathToTraefikComposeDestCwd,
        },
      );
    } catch (error) {
      config.frameworkName === 'tnp' && console.error(error);
      Helpers__NS__warn('Error restarting Traefik:');
    }
    //#endregion

  }
  //#endregion

  //#region public methods / start traefik
  public async startTraefik(): Promise<boolean> {

    //#region @backendFunc

    if (!(await this.checkIfDockerEnabled())) {
      return false;
    }

    this.taonCloudStatus = await this.selectMode({
      skipDisabled: true,
    });

    if (!(await this.selectCloudIps())) {
      console.error('No IPs selected, cannot start Traefik');
      this.taonCloudStatus = TaonCloudStatus.NOT_STARED;
      return false;
    }

    await this.makeSureTraefikNetworkCreated();

    console.log(`🚀 Starting Traefik ${this.isDevMode ? 'DEV' : 'PROD'}...`);
    const execAsync = promisify(child_process.exec);

    Helpers__NS__removeFolderIfExists(this.pathToTraefikComposeDestCwd);
    HelpersTaon__NS__copy(
      this.pathToTraefikComposeSourceTemplateFilesCwd,
      this.pathToTraefikComposeDestCwd,
      {
        recursive: true,
      },
    );

    this.service.initServiceReadme();

    // remove not used file
    Helpers__NS__removeFileIfExists([
      this.pathToTraefikComposeDestCwd,
      `traefik-compose${!this.isDevMode ? '.local-dev' : ''}.yml`,
    ]);

    await execAsync(
      `docker compose -f ` +
        ` traefik-compose${this.isDevMode ? '.local-dev' : ''}.yml up -d traefik`,
      {
        cwd: this.pathToTraefikComposeDestCwd,
      },
    );

    // Wait until container health becomes healthy
    const isTraefikRunning = await this.checkIfTraefikIsRunning({
      waitUntilHealthy: true,
    });

    if (isTraefikRunning) {
      this.setEnabledMode();
      for (const cloudIp of this.cloudIps) {
        const workers =
          BaseCliWorker.getAllWorkersStartedInSystemFromCurrentCli();
        await this.service.registerWorkers(cloudIp, workers);
      }
      await this.restartTraefik();
    } else {
      this.taonCloudStatus = TaonCloudStatus.NOT_STARED;
    }

    return isTraefikRunning;
    //#endregion

  }
  //#endregion

  //#region public methods / stop traefik
  public async stopTraefik(): Promise<void> {

    //#region @backendFunc
    this.taonCloudStatus = TaonCloudStatus.KILLING;
    console.log('Stopping Traefik...');

    await this.deleteTraefikNetwork();

    const execAsync = promisify(child_process.exec);
    const localDevFileBasename = `traefik-compose.local-dev.yml`;
    const prodFileBasename = `traefik-compose.yml`;
    // Start traefik in detached mode
    const devFileExists = Helpers__NS__exists([
      this.pathToTraefikComposeDestCwd,
      localDevFileBasename,
    ]);
    const prodFileExists = Helpers__NS__exists([
      this.pathToTraefikComposeDestCwd,
      prodFileBasename,
    ]);

    let composeDownBothFiles = devFileExists && prodFileExists;
    if (!Helpers__NS__exists(this.pathToTraefikComposeDestCwd)) {
      HelpersTaon__NS__copy(
        this.pathToTraefikComposeSourceTemplateFilesCwd,
        this.pathToTraefikComposeDestCwd,
        {
          recursive: true,
        },
      );
      composeDownBothFiles = true;
    }

    const composeDownFile = async (filename: string) => {
      return await execAsync(`docker compose -f ${filename} down`, {
        cwd: this.pathToTraefikComposeDestCwd,
      });
    };

    if (composeDownBothFiles) {
      Helpers__NS__logInfo('Composing down both dev and production mode traefik...');
      try {
        await composeDownFile(localDevFileBasename);
      } catch (error) {
        console.log('Error stopping Traefik dev mode');
      }
      try {
        await composeDownFile(prodFileBasename);
      } catch (error) {
        console.log('Error stopping Traefik production mode');
      }
    } else {
      while (true) {
        try {
          if (
            Helpers__NS__exists([
              this.pathToTraefikComposeDestCwd,
              localDevFileBasename,
            ])
          ) {
            Helpers__NS__logInfo('Composing down dev mode traefik...');
            await composeDownFile(localDevFileBasename);
          }
          if (
            Helpers__NS__exists([this.pathToTraefikComposeDestCwd, prodFileBasename])
          ) {
            Helpers__NS__logInfo('Composing down production mode traefik...');
            await composeDownFile(prodFileBasename);
          }
          break;
        } catch (error) {
          Helpers__NS__error('Error stopping Traefik', true, true);
          const tryAgain =
            await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error);
          if (!tryAgain) {
            break;
          }
        }
      }
    }

    await UtilsDocker__NS__cleanImagesAndContainersByDockerLabel(
      'org.opencontainers.image.title',
      'Traefik',
    );

    Helpers__NS__removeFolderIfExists(this.pathToTraefikComposeDestCwd);
    this.taonCloudStatus = TaonCloudStatus.NOT_STARED;
    BaseCliWorker.isCloudEnable.next(false);
    // docker compose rm -f traefik
    // docker compose down --remove-orphans

    //#endregion

  }
  //#endregion

  //#endregion

}