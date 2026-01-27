//#region imports
import type { AxiosProgressEvent } from 'axios';
import { MulterFileUploadResponse } from 'taon/lib-prod';
import { config, dotTaonFolder } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, dateformat, chalk, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings, UtilsYaml__NS__jsonToYaml, UtilsYaml__NS__readYamlAsJson, UtilsYaml__NS__writeJsonToYaml, UtilsYaml__NS__yamlToJson } from 'tnp-core/lib-prod';
import { UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { UtilsDotFile__NS__addCommentAtTheBeginningOfDotFile, UtilsDotFile__NS__getCommentsKeysAsJsonObject, UtilsDotFile__NS__getValueFromDotFile, UtilsDotFile__NS__getValuesKeysAsJsonObject, UtilsDotFile__NS__setCommentToKeyInDotFile, UtilsDotFile__NS__setValuesKeysFromObject, UtilsDotFile__NS__setValueToDotFile } from 'tnp-core/lib-prod';
import { FilePathMetaData__NS__embedData, FilePathMetaData__NS__extractData, FilePathMetaData__NS__getOnlyMetadataString } from 'tnp-core/lib-prod';
import { LibTypeEnum } from 'tnp-core/lib-prod';
import { DockerComposeFile, BaseCliWorkerConfigGetContextOptions, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray, UtilsZip__NS__splitFile, UtilsZip__NS__splitFile7Zip, UtilsZip__NS__unzipArchive, UtilsZip__NS__zipDir } from 'tnp-helpers/lib-prod';
import { UtilsDocker__NS__cleanImagesAndContainersByDockerLabel, UtilsDocker__NS__DOCKER_LABEL_KEY, UtilsDocker__NS__DOCKER_TAON_PROJECT_LABEL, UtilsDocker__NS__DockerComposeActionOptions, UtilsDocker__NS__DockerComposeActionType, UtilsDocker__NS__getDockerComposeActionChildProcess, UtilsDocker__NS__getDockerComposeActionCommand, UtilsDocker__NS__linkPodmanAsDockerIfNecessary, UtilsDocker__NS__removeAllTaonContainersAndImagesFromDocker } from 'tnp-helpers/lib-prod';
import { PackageJson } from 'type-fest';

import {
  angularProjProxyPath,
  getProxyNgProj,
  templateFolderForArtifact,
} from '../../../../app-utils';
import {
  ACTIVE_CONTEXT,
  AngularJsonAppOrElectronTaskNameResolveFor,
  AngularJsonTaskName,
  appFromSrcInsideNgApp,
  assetsFromNgProj,
  browserNgBuild,
  COMPILATION_COMPLETE_APP_NG_SERVE,
  CoreAssets,
  CoreNgTemplateFiles,
  databases,
  defaultConfiguration,
  distFromNgBuild,
  distFromSassLoader,
  distMainProject,
  dockerTemplatesFolder,
  DockerTemplatesFolders,
  dotEnvFile,
  ENV_INJECT_COMMENT,
  globalSpinner,
  keysMap,
  libFromCompiledDist,
  localReleaseMainProject,
  ngProjectStylesScss,
  packageJsonMainProject,
  packageJsonNpmLib,
  prodSuffix,
  readmeMdMainProject,
  routes,
  runJsMainProject,
  srcMainProject,
  srcNgProxyProject,
  suffixLatest,
  TaonCommands,
  TaonGeneratedFiles,
  THIS_IS_GENERATED_STRING,
  tmpBaseHrefOverwrite,
  tmpSrcDist,
  tmpSrcDistWebsql,
  tsconfigJsonIsomorphicMainProject,
} from '../../../../constants';
import {
  Development,
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { DeploymentsController } from '../../taon-worker/deployments';
import type { DeploymentReleaseData } from '../../taon-worker/deployments/deployments.models';
import { DeploymentsUtils__NS__displayRealtimeProgressMonitor } from '../../taon-worker/deployments/deployments.utils';
import { ProcessesController } from '../../taon-worker/processes/processes.controller';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';
import { InsideStructuresElectron } from '../electron-app/tools/inside-struct-electron';

import { AppHostsRecreateHelper } from './tools/app-hosts-recreate-helper';
import { AngularFeBasenameManager } from './tools/basename-manager';
import { InsideStructuresApp } from './tools/inside-struct-app';
import { MigrationHelper } from './tools/migrations-helper';
//#endregion

export class ArtifactAngularNodeApp extends BaseArtifact<
  {
    appDistOutBrowserAngularAbsPath: string;
    appDistOutBackendNodeAbsPath: string;
    angularNgServeAddress: URL;
  },
  ReleasePartialOutput
> {
  //#region fields & getters
  public readonly migrationHelper: MigrationHelper;

  public readonly angularFeBasenameManager: AngularFeBasenameManager;

  public readonly insideStructureApp: InsideStructuresApp;

  public readonly insideStructureElectron: InsideStructuresElectron;

  public readonly appHostsRecreateHelper: AppHostsRecreateHelper;

  //#endregion

  //#region constructor
  constructor(readonly project: Project) {
    super(project, ReleaseArtifactTaon.ANGULAR_NODE_APP);
    this.migrationHelper = new MigrationHelper(project);
    this.angularFeBasenameManager = new AngularFeBasenameManager(project);
    this.insideStructureApp = new InsideStructuresApp(project);
    this.insideStructureElectron = new InsideStructuresElectron(project);
    this.appHostsRecreateHelper = new AppHostsRecreateHelper(project);
  }
  //#endregion

  //#region clear partial
  async clearPartial(options: EnvOptions): Promise<void> {
    this.project.remove(`${routes}/*.rest`, false);
    this.project.remove(`${databases}/*.sqlite`, false);
  }
  //#endregion

  //#region init partial
  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc
    if (!initOptions.release.targetArtifact) {
      initOptions.release.targetArtifact = ReleaseArtifactTaon.ANGULAR_NODE_APP;
    }
    if (
      initOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
    ) {
      await this.insideStructureElectron.init(initOptions);
    } else {
      await this.insideStructureApp.init(initOptions);
    }

    // await this.project.docker.runTask({
    //   watch: initOptions.build.watch,
    //   initialParams: {
    //     envOptions: initOptions,
    //   },
    // });

    const copyFromCoreAssets = (fileName: string) => {
      const coreSource = crossPlatformPath([
        this.project.ins
          .by(
            LibTypeEnum.ISOMORPHIC_LIB,
            this.project.framework.frameworkVersion,
          )
          .pathFor(
            `${templateFolderForArtifact(
              initOptions.release.targetArtifact ===
                ReleaseArtifactTaon.ELECTRON_APP
                ? ReleaseArtifactTaon.ELECTRON_APP
                : ReleaseArtifactTaon.ANGULAR_NODE_APP,
            )}/${srcNgProxyProject}/${assetsFromNgProj}/${fileName}`,
          ),
      ]);

      let browserTsCode = initOptions.build.websql
        ? tmpSrcDistWebsql
        : tmpSrcDist;

      if (initOptions.build.prod) {
        browserTsCode = `${browserTsCode}${prodSuffix}`;
      }

      const tmpDest = this.project.pathFor(
        `${browserTsCode}/${assetsFromNgProj}/${fileName}`,
      );
      HelpersTaon__NS__copyFile(coreSource, tmpDest);
    };

    copyFromCoreAssets(CoreAssets.sqlWasmFile);
    copyFromCoreAssets(CoreAssets.mainFont);

    return initOptions;
    //#endregion
  }
  //#endregion

  //#region build partial

  async buildPartial(buildOptions: EnvOptions): Promise<{
    appDistOutBrowserAngularAbsPath: string;
    appDistOutBackendNodeAbsPath: string;
    angularNgServeAddress: URL;
  }> {
    //#region @backendFunc

    // TODO @REMOVE when microfrontends for container ready
    if (this.project.typeIsNot(LibTypeEnum.ISOMORPHIC_LIB)) {
      Helpers__NS__error(
        `Only project type isomorphic-lib can use artifact angular-node-app!`,
        false,
        true,
      );
    }

    buildOptions = await this.project.artifactsManager.init(
      EnvOptions.from(buildOptions),
    );

    if (
      buildOptions.release.targetArtifact !==
        ReleaseArtifactTaon.ANGULAR_NODE_APP &&
      buildOptions.build.ssr
    ) {
      Helpers__NS__warn(
        `SSR option is not supported for artifact ${buildOptions.release.targetArtifact}, disabling SSR...`,
      );
      buildOptions.build.ssr = false;
    }

    if (buildOptions.build.ssr) {
      Helpers__NS__info(`

      NOTE: You are building APP with SSR (Server Side Rendering) enabled.

      `);
    }

    const shouldSkipBuild = this.shouldSkipBuild(buildOptions);

    //#region prevent empty base href
    if (
      !___NS__isUndefined(buildOptions.build.baseHref) &&
      !buildOptions.release.releaseType &&
      !buildOptions.build.watch
    ) {
      Helpers__NS__error(
        `Build baseHref only can be specify when build lib code:

      try commands:
      ${config.frameworkName} build:lib --base-href ` +
          `${buildOptions.build.baseHref} ` +
          `# it will do lib code build

      `,
        false,
        true,
      );
    }
    //#endregion

    const appDistOutBackendNodeAbsPath =
      this.getOutDirNodeBackendAppAbsPath(buildOptions);

    if (
      buildOptions.release.releaseType === ReleaseType.LOCAL ||
      buildOptions.release.releaseType === ReleaseType.MANUAL
    ) {
      await this.buildBackend(buildOptions, appDistOutBackendNodeAbsPath);
    }

    const angularTempProj = getProxyNgProj(
      this.project,
      buildOptions,
      buildOptions.release.targetArtifact,
    );

    const appDistOutBrowserAngularAbsPath =
      buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
        ? angularTempProj.pathFor(distFromNgBuild)
        : this.getOutDirAngularBrowserAppAbsPath(buildOptions);

    const fromFileBaseHref = Helpers__NS__readFile(
      this.project.pathFor(tmpBaseHrefOverwrite),
    );
    buildOptions.build.baseHref = buildOptions.build.baseHref
      ? buildOptions.build.baseHref
      : fromFileBaseHref;

    const portAssignedToAppBuild: number =
      await this.appHostsRecreateHelper.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
        buildOptions,
      );

    if (buildOptions.build.watch) {
      await Helpers__NS__killProcessByPort(portAssignedToAppBuild);
    }

    //#region prepare angular command
    const outPutPathCommand = ` --output-path ${appDistOutBrowserAngularAbsPath} `;
    const baseHrefCommand = buildOptions.build.baseHref
      ? ` --base-href ${buildOptions.build.baseHref} `
      : '';

    if (!buildOptions.build.watch) {
      Helpers__NS__remove(appDistOutBrowserAngularAbsPath);
    }

    //#region serve command
    const serveCommand =
      `${this.NPM_RUN_NG_COMMAND} serve ${
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
          ? AngularJsonTaskName.ELECTRON_APP
          : AngularJsonTaskName.ANGULAR_APP
      } ` +
      ` ${`--port=${portAssignedToAppBuild}`} ` +
      ` --host 0.0.0.0`; // make it accessible in network for development
    //#endregion

    if (buildOptions.build.watch) {
      Helpers__NS__logInfo(`Using ng serve command: ${serveCommand}`);
    }

    //#region build command
    const angularBuildCommand =
      `${this.NPM_RUN_NG_COMMAND} build ${
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
          ? AngularJsonTaskName.ELECTRON_APP
          : AngularJsonTaskName.ANGULAR_APP
        // : buildOptions.build.angularSsr
        //   ? 'ssr'
      }` +
      ` ${buildOptions.build.watch ? '--watch' : ''}` +
      ` ${outPutPathCommand} ${baseHrefCommand}`;
    //#endregion

    const tmpAppForDistRelativePath = angularProjProxyPath({
      project: this.project,
      targetArtifact: buildOptions.release.targetArtifact,
      envOptions: buildOptions,
    });

    // set correct default config for build/serve in angular.json
    const angularJsonSelectedTask =
      AngularJsonAppOrElectronTaskNameResolveFor(buildOptions);

    Helpers__NS__logInfo(
      `Setting angular.json default config for ${angularJsonSelectedTask}  `,
    );

    if (!buildOptions.build.watch) {
      // not needed for watch - watch uses app.hosts.ts
      const indexHtmlAbsPath = crossPlatformPath([
        tmpAppForDistRelativePath,
        srcNgProxyProject,
        CoreNgTemplateFiles.INDEX_HTML_NG_APP,
      ]);
      let contentIndexHtml = Helpers__NS__readFile(indexHtmlAbsPath);
      const ENV_DATA_JSON = await this.getBrowserENVJSON(buildOptions);
      contentIndexHtml = contentIndexHtml.replace(
        ENV_INJECT_COMMENT,
        `<script>window.ENV = ${JSON.stringify(ENV_DATA_JSON)};</script>`,
      );
      Helpers__NS__writeFile(indexHtmlAbsPath, contentIndexHtml);
    }

    this.project.setValueToJSONC(
      [tmpAppForDistRelativePath, CoreNgTemplateFiles.ANGULAR_JSON],
      `projects.${
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
          ? AngularJsonTaskName.ELECTRON_APP
          : AngularJsonTaskName.ANGULAR_APP
      }.architect.${buildOptions.build.watch ? 'serve' : 'build'}.${defaultConfiguration}`,
      angularJsonSelectedTask,
    );

    // remove angular cache to prevent weird issues
    this.project.remove([tmpAppForDistRelativePath, '.angular']);

    // quick fix for tsconfig pathing in ng proxy project
    Helpers__NS__createSymLink(
      this.project.pathFor(tsconfigJsonIsomorphicMainProject),
      this.project.pathFor([
        tmpAppForDistRelativePath,
        srcNgProxyProject,
        tsconfigJsonIsomorphicMainProject,
      ]),
    );

    // remove server.ts for electron build
    if (
      buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
    ) {
      this.project.removeFile([
        tmpAppForDistRelativePath,
        srcNgProxyProject,
        CoreNgTemplateFiles.SERVER_TS,
      ]);
    }

    const angularBuildAppCmd = buildOptions.build.watch
      ? serveCommand
      : angularBuildCommand;

    //#endregion

    const showInfoAngular = () => {
      Helpers__NS__logInfo(`

  ARTIFACT ${buildOptions.release.targetArtifact} BUILD COMMAND: ${angularBuildAppCmd}

  inside: ${angularTempProj.location}

  `);
    };

    showInfoAngular();

    const projectBasePath = this.project.location;

    const appBaseName = ___NS__upperFirst(___NS__camelCase(this.project.name));
    const noConfigError = `TS2724: '"./app/app"' has no exported member named '${appBaseName}AppConfig'. Did you mean '${appBaseName}Config'?`;
    const noCompoenntError = `TS2614: Module '"./app/app"' has no exported member '${appBaseName}App'. Did you mean to use 'import ${appBaseName}App from "./app/app"' instead?`;

    if (!shouldSkipBuild) {
      await angularTempProj.execute(angularBuildAppCmd, {
        similarProcessKey: TaonCommands.NG,
        resolvePromiseMsg: {
          stdout: COMPILATION_COMPLETE_APP_NG_SERVE,
        },

        //#region command execute params
        exitOnErrorCallback: async code => {
          if (buildOptions.release.releaseType) {
            throw 'Angular compilation lib error!';
          } else {
            Helpers__NS__error(
              `[${config.frameworkName}] Typescript compilation error (code=${code})`,
              false,
              true,
            );
          }
        },
        outputLineReplace: (line: string) => {
          //#region replace outut line for better debugging
          // console.log('LINE:', line);

          line = line.replace(tmpAppForDistRelativePath + '/', '');

          if (line.includes('Warning:')) {
            line = line.replace(projectBasePath + '/', './');
          }

          // TODO QUICK_FIXES for clean errors
          if (
            line.includes(`${ngProjectStylesScss}?ngGlobalStyle`) ||
            (line.includes(`./${srcMainProject}/${ngProjectStylesScss}`) &&
              line.includes(`/sass-loader/${distFromSassLoader}/cjs.js`)) ||
            (line.includes('HookWebpackError: Module build failed') &&
              line.includes(`/sass-loader/${distFromSassLoader}/cjs.js`))
          ) {
            return '';
          }

          line = line.replace(
            `${srcNgProxyProject}/${appFromSrcInsideNgApp}/`,
            `./${srcMainProject}/`,
          );

          line = line.replace(
            `${srcNgProxyProject}\\${appFromSrcInsideNgApp}\\`,
            `.\\${srcMainProject}\\`,
          );

          line = line.replace(
            `${srcNgProxyProject}/${appFromSrcInsideNgApp}/${this.project.name}/`,
            `./${srcMainProject}/`,
          );

          line = line.replace(
            `${this.project.location}/.angular/cache/`,
            this.project.pathFor(
              `${tmpAppForDistRelativePath}/.angular/cache/`,
            ),
          );

          if (line.includes(noConfigError)) {
            line = line.replace(
              noConfigError,
              `Please export ${appBaseName}AppConfig in your ./src/app.ts file. Check core project example for reference.`,
            );
          }
          if (line.includes(noCompoenntError)) {
            line = line.replace(
              noCompoenntError,
              `Please export ${appBaseName}App in your ./src/app.ts file. Check core project example for reference.`,
            );
          }
          // /Users/dfilipiak/npm/taon-projects/application-quiz/.angular/cache/21.0.4/app/vite/deps_ssr/chunk-NX6GOWNM.js:27649:15

          return line;
          //#endregion
        },
        //#endregion
      });
    }

    if (!buildOptions.build.watch) {
      this.project.framework.recreateFileFromCoreProject({
        relativePathInCoreProject: `${dockerTemplatesFolder}/${
          buildOptions.build.ssr
            ? DockerTemplatesFolders.ANGULAR_APP_SSR_NODE
            : DockerTemplatesFolders.ANGULAR_APP_NODE
        }/Dockerfile`,
        customDestinationLocation: [
          appDistOutBrowserAngularAbsPath,
          'Dockerfile',
        ],
      });

      if (!buildOptions.build.ssr) {
        this.project.framework.recreateFileFromCoreProject({
          relativePathInCoreProject: `${dockerTemplatesFolder}/${DockerTemplatesFolders.ANGULAR_APP_NODE}/nginx.conf`,
          customDestinationLocation: [
            appDistOutBrowserAngularAbsPath,
            'nginx.conf',
          ],
        });
      }
    }

    return {
      appDistOutBackendNodeAbsPath,
      appDistOutBrowserAngularAbsPath,
      angularNgServeAddress: new URL(
        `http://localhost:${portAssignedToAppBuild}`,
      ),
    };
    //#endregion
  }

  private async buildBackend(
    buildOptions: EnvOptions,
    appDistOutBackendNodeAbsPath,
  ): Promise<void> {
    //#region @backendFunc
    Helpers__NS__remove(appDistOutBackendNodeAbsPath);
    await HelpersTaon__NS__bundleCodeIntoSingleFile(
      this.project.pathFor('dist/app.js'),
      crossPlatformPath([appDistOutBackendNodeAbsPath, 'dist/app.js']),
      {
        minify: buildOptions.release.nodeBackendApp.minify,
        strategy: 'node-app',
        additionalExternals: [
          ...this.project.taonJson.additionalExternalsFor(
            ReleaseArtifactTaon.ANGULAR_NODE_APP,
          ),
        ],
        additionalReplaceWithNothing: [
          ...this.project.taonJson.additionalReplaceWithNothingFor(
            ReleaseArtifactTaon.ANGULAR_NODE_APP,
          ),
        ],
      },
    );

    const copyToBackendBundle = [
      runJsMainProject,
      readmeMdMainProject,
      `${distMainProject}/${libFromCompiledDist}/${TaonGeneratedFiles.BUILD_INFO_AUTO_GENERATED_JS}`,
    ];

    for (const relativePathBundleBackend of copyToBackendBundle) {
      HelpersTaon__NS__copyFile(
        this.project.pathFor(relativePathBundleBackend),
        crossPlatformPath([
          appDistOutBackendNodeAbsPath,
          relativePathBundleBackend,
        ]),
      );
    }

    const nodeJsAppNativeDeps = [
      ...this.project.taonJson.getNativeDepsFor(
        ReleaseArtifactTaon.ANGULAR_NODE_APP,
      ),
      'lodash',
      'minimist',
      'fs-extra',
      'sql.js',
    ];

    const dependenciesNodeJsApp =
      this.project.framework.coreProject.getValueFromJSON(
        'docker-templates/backend-app-node/package.json',
        'dependencies',
      );

    for (const nativeDepName of nodeJsAppNativeDeps) {
      const version = this.project.packageJson.dependencies[nativeDepName];
      if (version) {
        Helpers__NS__logInfo(
          `Setting native dependency ${nativeDepName} to version ${version}`,
        );
        dependenciesNodeJsApp[nativeDepName] =
          this.project.packageJson.dependencies[nativeDepName];
      } else {
        Helpers__NS__warn(
          `Native dependency ${nativeDepName} not found in taon package.json dependencies`,
        );
      }
    }

    Helpers__NS__writeJson([appDistOutBackendNodeAbsPath, packageJsonNpmLib], {
      name: this.project.packageJson.name,
      version: this.project.packageJson.version,
      dependencies: dependenciesNodeJsApp,
    } as PackageJson);

    this.project.framework.recreateFileFromCoreProject({
      relativePathInCoreProject: 'docker-templates/backend-app-node/Dockerfile',
      customDestinationLocation: [appDistOutBackendNodeAbsPath, 'Dockerfile'],
    });

    this.project.framework.recreateFileFromCoreProject({
      relativePathInCoreProject: `${templateFolderForArtifact(
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
          ? ReleaseArtifactTaon.ELECTRON_APP
          : ReleaseArtifactTaon.ANGULAR_NODE_APP,
      )}/${srcNgProxyProject}/${assetsFromNgProj}/${CoreAssets.sqlWasmFile}`,
      customDestinationLocation: [
        appDistOutBackendNodeAbsPath,
        `${distFromNgBuild}/${CoreAssets.sqlWasmFile}`,
      ],
    });

    //#endregion
  }

  //#endregion

  async getBrowserENVJSON(releaseOptions: EnvOptions): Promise<any> {
    //#region @backendFunc

    // TODO @LAST handle when domain is ip address

    const data = {};
    const contextsNames = this.project.framework.getAllDetectedTaonContexts({
      skipLibFolder: true,
    });

    // TODO maybe this compute property based
    const useDomain = releaseOptions.website.useDomain;
    const domain = releaseOptions.website.domain;

    // create one env file for all docker containers
    for (let i = 0; i < contextsNames.length; i++) {
      const contextRealIndex = i + 1; // start from 1
      const contextName = contextsNames[i].contextName;
      const taskNameBackendReleasePort =
        `docker release ${domain} ${releaseOptions.release.releaseType} ` +
        `backend port for ${contextName} (n=${contextRealIndex})`;
      const portBackendRelease = await this.project.registerAndAssignPort(
        taskNameBackendReleasePort,
      );

      const taskNameFrontendreleasePort =
        `docker release ${domain} ${releaseOptions.release.releaseType} ` +
        `frontend port for ${contextName} (n=${contextRealIndex})`;
      const portFrontendRelease = await this.project.registerAndAssignPort(
        taskNameFrontendreleasePort,
      );

      const domainForContextFE = useDomain
        ? domain
        : `http://localhost:${portFrontendRelease}`;

      const domainForContextBE = useDomain
        ? domain
        : `http://localhost:${portBackendRelease}`;

      // data[`HOST_BACKEND_PORT_${contextRealIndex}`] = portBackendRelease;
      data[`HOST_URL_${contextRealIndex}`] = domainForContextBE;
      // data[`FRONTEND_NORMAL_APP_PORT_${contextRealIndex}`] =
      //   portFrontendRelease;
      data[`FRONTEND_HOST_URL_${contextRealIndex}`] = domainForContextFE;
      if (i === 0) {
        // data[`HOST_BACKEND_PORT`] = portBackendRelease;
        data[`HOST_URL`] = domainForContextBE;
        // data[`FRONTEND_NORMAL_APP_PORT`] = portFrontendRelease;
        data[`FRONTEND_HOST_URL`] = domainForContextFE;
      }
    }

    return data;
    //#endregion
  }

  //#region release partial
  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<ReleasePartialOutput> {
    //#region @backendFunc
    let deploymentFunction: () => Promise<void> = void 0;

    //#region update resolved variables
    releaseOptions = this.updateResolvedVersion(releaseOptions);
    const projectsReposToPushAndTag: string[] = [this.project.location];
    const projectsReposToPush: string[] = [];

    let { appDistOutBrowserAngularAbsPath, appDistOutBackendNodeAbsPath } =
      await this.buildPartial(
        releaseOptions.clone({
          build: {
            watch: false,
          },
        }),
      );

    let releaseProjPath: string = appDistOutBrowserAngularAbsPath;

    releaseOptions.release.skipStaticPagesVersioning = ___NS__isUndefined(
      releaseOptions.release.skipStaticPagesVersioning,
    )
      ? true
      : releaseOptions.release.skipStaticPagesVersioning;
    //#endregion

    if (releaseOptions.release.releaseType === ReleaseType.STATIC_PAGES) {
      //#region static pages release
      if (!releaseOptions.build.ssr) {
        appDistOutBrowserAngularAbsPath = crossPlatformPath([
          appDistOutBrowserAngularAbsPath,
          browserNgBuild,
        ]);
      }

      const releaseData = await this.staticPagesDeploy(
        appDistOutBrowserAngularAbsPath,
        releaseOptions,
      );
      releaseProjPath = releaseData.releaseProjPath;
      projectsReposToPush.push(...releaseData.projectsReposToPush);
      //#endregion
    } else if (
      releaseOptions.release.releaseType === ReleaseType.LOCAL ||
      releaseOptions.release.releaseType === ReleaseType.MANUAL
    ) {
      //#region copy to local release folder
      const localReleaseOutputBasePath =
        releaseOptions.release.releaseType === ReleaseType.LOCAL
          ? this.project.pathFor([
              localReleaseMainProject,
              this.currentArtifactName,
              `${this.project.name}${suffixLatest}`,
            ])
          : this.project.pathFor([
              `.${config.frameworkName}`,
              'release-manual',
              this.currentArtifactName,
            ]);

      HelpersTaon__NS__copy(appDistOutBrowserAngularAbsPath, [
        localReleaseOutputBasePath,
        path.basename(appDistOutBrowserAngularAbsPath),
      ]);
      HelpersTaon__NS__copy(appDistOutBackendNodeAbsPath, [
        localReleaseOutputBasePath,
        path.basename(appDistOutBackendNodeAbsPath),
      ]);
      releaseProjPath = localReleaseOutputBasePath;
      //#endregion

      //#region update package.json in backend app
      HelpersTaon__NS__setValueToJSON(
        [
          localReleaseOutputBasePath,
          path.basename(appDistOutBackendNodeAbsPath),
          packageJsonNpmLib,
        ],
        'name',
        path.basename(appDistOutBackendNodeAbsPath),
      );

      HelpersTaon__NS__setValueToJSON(
        [
          localReleaseOutputBasePath,
          path.basename(appDistOutBackendNodeAbsPath),
          packageJsonNpmLib,
        ],
        'version',
        releaseOptions.release.resolvedNewVersion,
      );
      //#endregion

      //#region update docker-compose files

      const dockerComposeRelativePath = 'docker-templates/docker-compose.yml';
      const dockerComposeYmlDestPath = crossPlatformPath([
        localReleaseOutputBasePath,
        path.basename(dockerComposeRelativePath),
      ]);

      this.project.framework.recreateFileFromCoreProject({
        relativePathInCoreProject: dockerComposeRelativePath,
        customDestinationLocation: dockerComposeYmlDestPath,
      });

      //#endregion

      const contextsNames = this.project.framework.getAllDetectedTaonContexts({
        skipLibFolder: true,
      });

      const useDomain = releaseOptions.website.useDomain;
      const domain = releaseOptions.website.domain;

      //#region create one env file for all docker containers
      for (let i = 0; i < contextsNames.length; i++) {
        const contextRealIndex = i + 1; // start from 1
        const contextName = contextsNames[i].contextName;
        const taskNameBackendReleasePort =
          `docker release ${domain} ${releaseOptions.release.releaseType} ` +
          `backend port for ${contextName} (n=${contextRealIndex})`;
        const portBackendRelease = await this.project.registerAndAssignPort(
          taskNameBackendReleasePort,
        );

        const taskNameFrontendreleasePort =
          `docker release ${domain} ${releaseOptions.release.releaseType} ` +
          `frontend port for ${contextName} (n=${contextRealIndex})`;
        const portFrontendRelease = await this.project.registerAndAssignPort(
          taskNameFrontendreleasePort,
        );

        // const unknownProtocol = `https://`;

        // const domainForContextFE = useDomain
        //   ? domain.startsWith('http')
        //     ? domain
        //     : `${unknownProtocol}${domain}`
        //   : `http://localhost:${portFrontendRelease}`;

        const domainForContextFE = useDomain
          ? domain
          : `http://localhost:${portFrontendRelease}`;

        // const domainForContextBE = useDomain
        //   ? domain.startsWith('http')
        //     ? domain
        //     : `${unknownProtocol}${domain}`
        //   : `http://localhost:${portBackendRelease}`;

        const domainForContextBE = useDomain
          ? domain
          : `http://localhost:${portBackendRelease}`;

        UtilsDotFile__NS__setValuesKeysFromObject(
          [localReleaseOutputBasePath, dotEnvFile],
          {
            [`HOST_BACKEND_PORT_${contextRealIndex}`]: portBackendRelease,
            [`HOST_URL_${contextRealIndex}`]: domainForContextBE,
            [`FRONTEND_NORMAL_APP_PORT_${contextRealIndex}`]:
              portFrontendRelease,
            [`FRONTEND_HOST_URL_${contextRealIndex}`]: domainForContextFE,

            ...(i === 0 // fallback to old taon app.hosts values
              ? {
                  [`HOST_BACKEND_PORT`]: portBackendRelease,
                  [`HOST_URL`]: domainForContextBE,
                  [`FRONTEND_NORMAL_APP_PORT`]: portFrontendRelease,
                  [`FRONTEND_HOST_URL`]: domainForContextFE,
                }
              : {}),
          },
        );

        UtilsDotFile__NS__setCommentToKeyInDotFile(
          [localReleaseOutputBasePath, dotEnvFile],
          `HOST_BACKEND_PORT_${contextRealIndex}`,
          `${CoreModels__NS__tagForTaskName}="${taskNameBackendReleasePort}"`,
        );
        if (i === 0) {
          UtilsDotFile__NS__setCommentToKeyInDotFile(
            [localReleaseOutputBasePath, dotEnvFile],
            `HOST_BACKEND_PORT`,
            `${CoreModels__NS__tagForTaskName}="${taskNameBackendReleasePort}"`,
          );
        }
        UtilsDotFile__NS__setCommentToKeyInDotFile(
          [localReleaseOutputBasePath, dotEnvFile],
          `FRONTEND_NORMAL_APP_PORT_${contextRealIndex}`,
          `${CoreModels__NS__tagForTaskName}="${taskNameFrontendreleasePort}"`,
        );
      }

      if (!useDomain) {
        UtilsDotFile__NS__addCommentAtTheBeginningOfDotFile(
          [localReleaseOutputBasePath, dotEnvFile],
          `HINT! IF YOU NEED DOMAIN USE userDomain=true in env.ts`,
        );
      }

      UtilsDotFile__NS__setValueToDotFile(
        [localReleaseOutputBasePath, '.env'],
        'COMPOSE_PROJECT_NAME',
        (
          'TaonDeployment__' +
          ___NS__camelCase(releaseOptions.website.domain) +
          '__' +
          `v${___NS__kebabCase(this.project.packageJson.version)}` +
          '__' +
          `release-type-${releaseOptions.release.releaseType}` +
          `--env--${
            !releaseOptions.release.envName ||
            releaseOptions.release.envName === '__'
              ? 'default'
              : releaseOptions.release.envName
          }${releaseOptions.release.envNumber || ''}`
        ).toLowerCase(),
      );

      UtilsDotFile__NS__setValueToDotFile(
        [localReleaseOutputBasePath, dotEnvFile],
        'BUILD_DATE',
        `${dateformat(new Date(), 'dd-mm-yyyy_HH:MM:ss')}`,
      );

      UtilsDotFile__NS__setValueToDotFile(
        [localReleaseOutputBasePath, dotEnvFile],
        'NODE_ENV',
        `production`,
      );
      //#endregion

      const allValuesDotEnv = UtilsDotFile__NS__getValuesKeysAsJsonObject([
        localReleaseOutputBasePath,
        dotEnvFile,
      ]);

      //#region update docker-compose file with env variables
      const dockerComposeFile = UtilsYaml__NS__readYamlAsJson<DockerComposeFile>(
        dockerComposeYmlDestPath,
      );

      //#region prepare backend containers
      const backendTemplapteObj =
        dockerComposeFile.services['backend-app-node'];

      delete dockerComposeFile.services['backend-app-node'];

      const containerLabel = `${UtilsDocker__NS__DOCKER_LABEL_KEY}="\${COMPOSE_PROJECT_NAME}"`;

      for (let i = 0; i < contextsNames.length; i++) {
        const index = i + 1; // start from 1
        const contextName = contextsNames[i].contextName;
        const ctxBackend = ___NS__cloneDeep(backendTemplapteObj);

        const containerIdentifierBackendNOde =
          `backend-app-node--${___NS__kebabCase(releaseOptions.website.domain)}--` +
          `v${___NS__kebabCase(this.project.packageJson.version)}--${contextName}--ctxIndex${index}`.toLowerCase();

        //#region updating cloned backend template
        const traefikKeyBackend =
          `${containerIdentifierBackendNOde}--` +
          `${releaseOptions.release.envName}${releaseOptions.release.envNumber || ''}`;

        const traefikLabelsBE = [
          `traefik.enable=true`,
          `traefik.http.routers.${traefikKeyBackend}.rule=Host(\`${releaseOptions.website.domain}\`) && PathPrefix(\`/api/CTX/\`)`,
          `traefik.http.routers.${traefikKeyBackend}.entrypoints=websecure`,
          // `traefik.http.routers.${traefikKeyBackend}.tls.certresolver=myresolver`,
          `traefik.http.services.${traefikKeyBackend}.loadbalancer.server.port=$\{HOST_BACKEND_PORT_1\}`,
          containerLabel,
          UtilsDocker__NS__DOCKER_TAON_PROJECT_LABEL,
          // only when sripping prefix
          // 'traefik.http.middlewares.strip-api.stripprefix.prefixes=/api',
          // 'traefik.http.routers.backend.middlewares=strip-api',
        ];
        const traefikLabelsBEObject: Record<string, string> = {};
        traefikLabelsBE.forEach(label => {
          const [key, value] = label.split('=');
          traefikLabelsBEObject[key] = value;
        });
        ctxBackend.labels = { ...ctxBackend.labels, ...traefikLabelsBEObject };
        ctxBackend.container_name = containerIdentifierBackendNOde;
        const all = ___NS__cloneDeep(allValuesDotEnv) as Record<string, string>;
        for (const key of Object.keys(all)) {
          all[key] = `\${${key}}`;
        }
        ctxBackend.environment = all;
        ctxBackend.environment[ACTIVE_CONTEXT] = contextName;
        (() => {
          const keyLoadBalancerServerPort = `traefik.http.services.${traefikKeyBackend}.loadbalancer.server.port`;
          const loadBalancerValue =
            ctxBackend.labels[keyLoadBalancerServerPort];
          ctxBackend.labels[keyLoadBalancerServerPort] =
            loadBalancerValue?.replace('1', index.toString());
        })();

        (() => {
          const httpRouterBackendPortKey = `traefik.http.routers.${traefikKeyBackend}.rule`;
          const loadBalancerValue = ctxBackend.labels[httpRouterBackendPortKey];
          ctxBackend.labels[httpRouterBackendPortKey] =
            loadBalancerValue?.replace('CTX', contextName);
        })();

        const specificForProjectSQliteDbLocation = crossPlatformPath([
          UtilsOs__NS__getRealHomeDir(),
          dotTaonFolder,
          'cloud/docker-backend-databases',
          releaseOptions.website.domain,
          this.project.packageJson.version,
          contextName,
          databases,
        ]);

        ctxBackend.volumes = [
          `${specificForProjectSQliteDbLocation}:/app/${databases}`,
        ];
        //#endregion

        dockerComposeFile.services[containerIdentifierBackendNOde] = ctxBackend;
      }
      //#endregion

      //#region prepare frontend container
      const frontendTemplapteObj =
        dockerComposeFile.services['angular-app-node'];

      delete dockerComposeFile.services['angular-app-node'];

      const ctxFrontend = ___NS__cloneDeep(frontendTemplapteObj);

      const newKeyForContainerFrontendAngular = (
        `angular-app-node--${___NS__kebabCase(releaseOptions.website.domain)}` +
        `--v${___NS__kebabCase(this.project.packageJson.version)}`
      ).toLowerCase();

      //#region set traefik labels for frontend app

      const all = ___NS__cloneDeep(allValuesDotEnv) as Record<string, string>;
      for (const key of Object.keys(all)) {
        all[key] = `\${${key}}`;
      }
      ctxFrontend.environment = all;

      const traefikKeyFrontend =
        `${newKeyForContainerFrontendAngular}--` +
        `${releaseOptions.release.envName}${releaseOptions.release.envNumber || ''}`;

      const traefikLabelsFE = [
        `traefik.enable=true`,
        `traefik.http.routers.${traefikKeyFrontend}.rule=Host(\`${releaseOptions.website.domain}\`)`,
        `traefik.http.routers.${traefikKeyFrontend}.entrypoints=websecure`,
        // `traefik.http.routers.${traefikKeyFronend}.tls.certresolver=myresolver`,
        `traefik.http.services.${traefikKeyFrontend}.loadbalancer.server.port=80`,
        containerLabel,
      ];
      const traefikLabelsFEObject: Record<string, string> = {};
      traefikLabelsFE.forEach(label => {
        const [key, value] = label.split('=');
        traefikLabelsFEObject[key] = value;
      });
      ctxFrontend.labels = traefikLabelsFEObject;
      //#endregion

      ctxFrontend.container_name = newKeyForContainerFrontendAngular;

      dockerComposeFile.services[newKeyForContainerFrontendAngular] =
        ctxFrontend;
      //#endregion

      UtilsYaml__NS__writeJsonToYaml(dockerComposeYmlDestPath, dockerComposeFile);

      //#region add info comment to docker-compose.yml file
      const dockerComposeYmlFileContent = Helpers__NS__readFile(
        dockerComposeYmlDestPath,
      );

      Helpers__NS__writeFile(
        dockerComposeYmlDestPath,
        `# ${THIS_IS_GENERATED_STRING}
# FRONTEND APP can ONLY READ VARIABLES THAT START WITH "FRONTEND_", "PUIBLIC_" or "HOST_"
${dockerComposeYmlFileContent}
# ${THIS_IS_GENERATED_STRING}`,
      );
      //#endregion

      //#endregion

      //#region create package.json with start script for whole build
      HelpersTaon__NS__copyFile(this.project.pathFor(packageJsonMainProject), [
        localReleaseOutputBasePath,
        packageJsonNpmLib,
      ]);
      HelpersTaon__NS__setValueToJSON(
        [localReleaseOutputBasePath, packageJsonNpmLib],
        'scripts',
        {},
      );

      HelpersTaon__NS__setValueToJSON(
        [localReleaseOutputBasePath, packageJsonNpmLib],
        'scripts.start',
        `taon preview ./docker-compose.yml`,
      );
      //#endregion

      //#region display final build info
      Helpers__NS__info(`

      Dockerized version of your app is ready.
      you can run: ${chalk.bold('docker compose up -d')}
      in ${localReleaseOutputBasePath}

      or quick script:
      taon preview ./docker-compose.yml

      `);
      //#endregion

      if (releaseOptions.release.releaseType === ReleaseType.LOCAL) {
        Helpers__NS__taskDone(`Local release done!`);
        // TODO
      } else if (releaseOptions.release.releaseType === ReleaseType.MANUAL) {
        Helpers__NS__taskDone(`Manual release prepared!`);
        deploymentFunction = async () => {
          await this.deployToTaonCloud({
            releaseOptions,
            localReleaseOutputBasePath,
          });
        };
      }
    }

    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      releaseProjPath,
      releaseType: releaseOptions.release.releaseType,
      projectsReposToPushAndTag,
      projectsReposToPush,
      deploymentFunction,
    };
    //#endregion
  }
  //#endregion

  //#region deploy to cloud
  private async deployToTaonCloud({
    releaseOptions,
    localReleaseOutputBasePath,
  }: {
    releaseOptions: EnvOptions;
    localReleaseOutputBasePath?: string;
  }): Promise<void> {
    //#region @backendFunc

    //#region prepare zip newZipFileName file for upload
    const tmpZipLocalReleaseFileAbsPath = await UtilsZip__NS__zipDir(
      localReleaseOutputBasePath,
      {
        overrideIfZipFileExists: true,
      },
    );

    const tmpProjDataForUpload = {
      destinationDomain: releaseOptions.website.domain,
      version: releaseOptions.release.resolvedNewVersion,
      envName: releaseOptions.release.envName,
      envNumber: releaseOptions.release.envNumber || '',
      releaseType: releaseOptions.release.releaseType as ReleaseType,
      projectName: this.project.name,
      targetArtifact: releaseOptions.release.targetArtifact,
    } as DeploymentReleaseData;

    const newBasenameZipFile = FilePathMetaData__NS__embedData(
      ___NS__pick(tmpProjDataForUpload, ['destinationDomain', 'version']),
      path.basename(tmpZipLocalReleaseFileAbsPath),
      {
        skipAddingBasenameAtEnd: true,
        keysMap,
      },
    );

    const newZipFileName = crossPlatformPath([
      path.dirname(tmpZipLocalReleaseFileAbsPath),
      newBasenameZipFile,
    ]);

    HelpersTaon__NS__copyFile(tmpZipLocalReleaseFileAbsPath, newZipFileName);

    Helpers__NS__taskDone(`
      Release zip file prepared for taon cloud deployment!
      Destination taon instance ip (or domain): "${releaseOptions.release.taonInstanceIp}"

      Zip file ready for taon cloud deployment:
${path.dirname(newZipFileName)}
/${path.basename(newZipFileName)}

      `);
    //#endregion

    //#region prepare cloud connections and controllers
    const connectionOptionsDeployments = {
      ipAddressOfTaonInstance: releaseOptions.release.taonInstanceIp,
      port:
        releaseOptions.release.taonInstanceIp === CoreModels__NS__localhostIp127
          ? Number(
              this.project.ins.taonProjectsWorker.deploymentsWorker
                .processLocalInfoObj.port,
            )
          : null,
    } as BaseCliWorkerConfigGetContextOptions;

    const connectionOptionsProcesses = {
      ipAddressOfTaonInstance: releaseOptions.release.taonInstanceIp,
      port:
        releaseOptions.release.taonInstanceIp === CoreModels__NS__localhostIp127
          ? Number(
              this.project.ins.taonProjectsWorker.processesWorker
                .processLocalInfoObj.port,
            )
          : null,
    } as BaseCliWorkerConfigGetContextOptions;

    const deploymentController =
      await this.project.ins.taonProjectsWorker.deploymentsWorker.getRemoteControllerFor(
        {
          methodOptions: {
            connectionOptions: connectionOptionsDeployments,
            calledFrom: 'artifact-angular-node-app.releasePartial',
          },
          controllerClass: DeploymentsController,
        },
      );

    const processesController =
      await this.project.ins.taonProjectsWorker.processesWorker.getRemoteControllerFor(
        {
          methodOptions: {
            connectionOptions: connectionOptionsProcesses,
            calledFrom: 'artifact-angular-node-app.releasePartial',
          },
          controllerClass: ProcessesController,
        },
      );
    //#endregion

    //#region try to upload release to taon cloud
    let uploadResponse: MulterFileUploadResponse[];
    while (true) {
      try {
        Helpers__NS__info(`Uploading zip file to taon server...`);
        globalSpinner.instance.start();
        uploadResponse = await deploymentController.uploadLocalFileToServer(
          newZipFileName,
          {
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              globalSpinner.instance.text = `Upload progress: ${percentCompleted}%`;
              // console.log(`Upload progress: ${percentCompleted}%`);
            },
          },
          tmpProjDataForUpload,
        );

        globalSpinner.instance.succeed(`Deployment upload done!`);
        break;
      } catch (error) {
        globalSpinner.instance.fail(`Error during upload zip file to taon server!`);
        const errMsg = (
          error instanceof Error ? error.message : error
        ) as string;
        config.frameworkName === 'tnp' && console.error(errMsg);
        if (releaseOptions.release.autoReleaseUsingConfig) {
          throw `Error during upload zip file to taon server...`;
        } else {
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
            message: `Error during upload zip file to taon server...press any key to continue`,
          });
        }
      }
    }
    //#endregion

    //#region trigger deployment start
    Helpers__NS__info(`Starting deployment...`);
    const forceStart = true;
    let deployment = (
      await deploymentController
        .triggerDeploymentStart(uploadResponse[0].savedAs, forceStart)
        .request()
    ).body.json;
    await deploymentController.waitUntilDeploymentHasComposeUpProcess(
      deployment.id,
    );
    deployment = (
      await deploymentController.getByDeploymentId(deployment.id).request()
    ).body.json;

    Helpers__NS__info(`Deployment started! `);
    //#endregion

    //#region display realtime deployment log
    if (!releaseOptions.isCiProcess && !UtilsOs__NS__isRunningNodeDebugger()) {
      Helpers__NS__info(`

STARTING DEPLOYMENT PREVIEW (PRESS ANY KEY TO MOVE BACK TO RELEASE FINISH SCREEN)

              `);

      await DeploymentsUtils__NS__displayRealtimeProgressMonitor(
        deployment,
        processesController,
        {
          resolveWhenTextInOutput: CoreModels__NS__SPECIAL_APP_READY_MESSAGE,
        },
      );
    }
    //#endregion

    //#endregion
  }
  //#endregion

  //#region public methods

  //#endregion

  //#region private methods

  //#region private methods / get out dir app
  /**
   * Absolute path to the output directory for the app
   */
  getOutDirNodeBackendAppAbsPath(buildOptions: EnvOptions): string {
    let outDirApp =
      `.${config.frameworkName}/${this.currentArtifactName}/` +
      `${buildOptions.release.releaseType ? buildOptions.release.releaseType : Development}/` +
      `backend-app${buildOptions.build.websql ? '-websql' : '-node'}`;

    return this.project.pathFor(outDirApp);
  }
  //#endregion

  //#region private methods / get out dir app
  /**
   * Absolute path to the output directory for the app
   */
  getOutDirAngularBrowserAppAbsPath(buildOptions: EnvOptions): string {
    let outDirApp =
      `.${config.frameworkName}/${buildOptions.release.targetArtifact}/` +
      `${buildOptions.release.releaseType ? buildOptions.release.releaseType : Development}/` +
      `angular-app${buildOptions.build.websql ? '-websql' : '-node'}`;

    return this.project.pathFor(outDirApp);
  }
  //#endregion

  //#endregion
}