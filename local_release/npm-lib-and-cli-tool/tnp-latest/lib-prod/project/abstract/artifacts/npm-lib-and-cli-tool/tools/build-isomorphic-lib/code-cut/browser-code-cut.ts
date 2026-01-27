//#region imports
import { RegionRemover } from 'isomorphic-region-loader/lib-prod';
import { ReplaceOptionsExtended } from 'isomorphic-region-loader/lib-prod';
import { chalk, config, extAllowedToReplace, frontEndOnly, TAGS, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds, UtilsJson__NS__AttrJsoncProp, UtilsJson__NS__getAtrributiesFromJsonWithComments, UtilsJson__NS__getAttributiesFromComment, UtilsJson__NS__readJson, UtilsJson__NS__readJsonWithComments } from 'tnp-core/lib-prod';
import { path, fse, crossPlatformPath, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith } from 'tnp-core/lib-prod';
import { Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray, UtilsTypescript__NS__addBelowPlaceholder, UtilsTypescript__NS__addOrUpdateImportIfNotExists, UtilsTypescript__NS__calculateRelativeImportPath, UtilsTypescript__NS__clearRequireCacheRecursive, UtilsTypescript__NS__collapseFluentChains, UtilsTypescript__NS__DeepWritable, UtilsTypescript__NS__eslintFixAllFilesInsideFolder, UtilsTypescript__NS__eslintFixAllFilesInsideFolderAsync, UtilsTypescript__NS__eslintFixFile, UtilsTypescript__NS__ExportedThirdPartyNamespaces, UtilsTypescript__NS__ExportInfo, UtilsTypescript__NS__exportsFromContent, UtilsTypescript__NS__exportsFromFile, UtilsTypescript__NS__exportsRedefinedFromContent, UtilsTypescript__NS__exportsRedefinedFromFile, UtilsTypescript__NS__extractAngularComponentSelectors, UtilsTypescript__NS__extractClassNameFromString, UtilsTypescript__NS__extractClassNamesFromFile, UtilsTypescript__NS__extractDefaultClassNameFromFile, UtilsTypescript__NS__extractDefaultClassNameFromString, UtilsTypescript__NS__extractRenamedImportsOrExport, UtilsTypescript__NS__fixHtmlTemplatesInDir, UtilsTypescript__NS__FlattenMapping, UtilsTypescript__NS__formatAllFilesInsideFolder, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__GatheredExportsMap, UtilsTypescript__NS__gatherExportsMapFromIndex, UtilsTypescript__NS__getCleanImport, UtilsTypescript__NS__getTaonContextFromContent, UtilsTypescript__NS__getTaonContextsNamesFromFile, UtilsTypescript__NS__hoistTrailingChainComments, UtilsTypescript__NS__injectImportsIntoImportsRegion, UtilsTypescript__NS__migrateFromNgModulesToStandaloneV21, UtilsTypescript__NS__normalizeBrokenLines, UtilsTypescript__NS__NSSPLITNAMESAPCE, UtilsTypescript__NS__ParsedTsDiagnostic, UtilsTypescript__NS__parseTsDiagnostic, UtilsTypescript__NS__recognizeImportsFromContent, UtilsTypescript__NS__recognizeImportsFromFile, UtilsTypescript__NS__RedefinedExportInfo, UtilsTypescript__NS__refactorClassToNamespace, UtilsTypescript__NS__removeRegionByName, UtilsTypescript__NS__removeTaggedArrayObjects, UtilsTypescript__NS__removeTaggedImportExport, UtilsTypescript__NS__removeTaggedLines, UtilsTypescript__NS__RenamedImportOrExport, UtilsTypescript__NS__replaceImportNamespaceWithWithExplodedNamespace, UtilsTypescript__NS__replaceNamespaceWithLongNames, UtilsTypescript__NS__setValueToVariableInTsFile, UtilsTypescript__NS__splitNamespaceForContent, UtilsTypescript__NS__splitNamespaceForFile, UtilsTypescript__NS__SplitNamespaceResult, UtilsTypescript__NS__transformComponentStandaloneOption, UtilsTypescript__NS__transformFlatImports, UtilsTypescript__NS__TsImportExport, UtilsTypescript__NS__updateSplitNamespaceReExports, UtilsTypescript__NS__updateSplitNamespaceResultMapReplaceObj, UtilsTypescript__NS__wrapContentClassMembersDecoratorsWithRegion, UtilsTypescript__NS__wrapFirstImportsInImportsRegion, UtilsTypescript__NS__wrapWithComment } from 'tnp-helpers/lib-prod';

import { getCleanImport } from '../../../../../../../app-utils';
import {
  appFromSrc,
  assetsFor,
  assetsFromNgProj,
  assetsFromNpmPackage,
  assetsFromSrc,
  assetsFromTempSrc,
  browserFromImport,
  browserMainProject,
  browserNpmPackage,
  browserTypeString,
  distMainProject,
  indexTsFromLibFromSrc,
  libFromImport,
  libFromNpmPackage,
  libFromSrc,
  libTypeString,
  prodSuffix,
  splitNamespacesJson,
  srcFromTaonImport,
  srcMainProject,
  tmpSourceDist,
  tmpSrcAppDist,
  tmpSrcAppDistWebsql,
  tmpSrcDist,
  tmpSrcDistWebsql,
  TO_REMOVE_TAG,
  websqlFromImport,
  websqlMainProject,
  websqlNpmPackage,
  websqlTypeString,
} from '../../../../../../../constants';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';

import { SplitFileProcess } from './file-split-process';
//#endregion

/**
 * Allow imports or exports with '/src' at the end
 *
 * import { ProcessController, Process } from '@codete-ngrx-quick-start/shared/src';
 * loadChildren: () => import(`@codete-ngrx-quick-start/realtime-process/src`)
 *
 * to be changed into:
 *
 * import { ProcessController, Process } from '@codete-ngrx-quick-start/shared/src';
 * loadChildren: () => import(`@codete-ngrx-quick-start/realtime-process/src`)
 *
 */
export class BrowserCodeCut {
  //#region constants
  public static debugFile = [
    // '/endpoint-context.ts',
    // 'rest.class.ts'
    // 'hello-world-simple.context.ts',
    // 'utils.ts',
    // 'helpers-process.ts'
    // 'base-compiler-for-project.ts',
    // 'helpers-check.container.ts',
  ];

  //#endregion
  //#region fields
  /**
   * slighted modifed app release dist
   */
  protected absFileSourcePathBrowserOrWebsqlAPPONLY: string;

  private rawContentForBrowser: string;

  private rawContentForAPPONLYBrowser: string;

  private rawContentBackend: string;

  public get importExportsFromOrgContent(): UtilsTypescript__NS__TsImportExport[] {
    return this.splitFileProcess?._importExports || [];
  }

  private splitFileProcess: SplitFileProcess;

  /**
   * ex. path/to/file-somewhere.ts or assets/something/here
   * in src or tmpSrcDist etc.
   */
  private readonly relativePath: string;

  private readonly isWebsqlMode: boolean;

  private readonly isAssetsFile: boolean = false;

  private readonly absoluteBackendDestFilePath: string;

  private readonly debug: boolean = false;

  //#endregion

  //#region constructor

  private readonly nameForNpmPackage: string;

  //#region @backend
  constructor(
    /**
     * ex.< project location >/src/something.ts
     */
    protected absSourcePathFromSrc: string,
    /**
     * ex. < project location >/tmpSrcDistWebsql/my/relative/path.ts
     */
    protected absFileSourcePathBrowserOrWebsql: string,
    /**
     * ex. < project location >/tmpSrcDist
     */
    protected absPathTmpSrcDistFolder: string,
    private project: Project,
    private buildOptions: EnvOptions,
  ) {
    //#region recognize namespaces for isomorphic packages
    this.nameForNpmPackage = project.nameForNpmPackage;

    //#endregion

    // console.log(`[incremental-build-process INSIDE BROWSER!!! '${this.buildOptions.baseHref}'`)

    this.absPathTmpSrcDistFolder = crossPlatformPath(absPathTmpSrcDistFolder);
    this.absFileSourcePathBrowserOrWebsql = crossPlatformPath(
      absFileSourcePathBrowserOrWebsql,
    );

    let replaceFrom = buildOptions.build.websql ? tmpSrcDistWebsql : tmpSrcDist;

    let replaceTo = buildOptions.build.websql
      ? tmpSrcAppDistWebsql
      : tmpSrcAppDist;

    if (buildOptions.build.prod) {
      replaceFrom = `${replaceFrom}${prodSuffix}`;
      replaceTo = `${replaceTo}${prodSuffix}`;
    }

    this.absFileSourcePathBrowserOrWebsqlAPPONLY =
      this.absFileSourcePathBrowserOrWebsql.replace(replaceFrom, replaceTo);

    this.absSourcePathFromSrc = crossPlatformPath(absSourcePathFromSrc);

    if (project.framework.isStandaloneProject) {
      if (
        absSourcePathFromSrc
          .replace(project.pathFor(srcMainProject), '')
          .startsWith(`/${assetsFromTempSrc}/`)
      ) {
        this.isAssetsFile = true;
      }
    }

    this.relativePath = crossPlatformPath(
      this.absFileSourcePathBrowserOrWebsql,
    ).replace(`${this.absPathTmpSrcDistFolder}/`, '');

    this.debug = BrowserCodeCut.debugFile.some(d =>
      this.relativePath.endsWith(d),
    );

    this.absoluteBackendDestFilePath = crossPlatformPath([
      this.project.location,
      tmpSourceDist + (buildOptions.build.prod ? prodSuffix : ''),
      this.relativePath,
    ]);

    // console.log('RELATIVE ', this.relativePath)

    this.isWebsqlMode = this.relativePath.startsWith(
      tmpSrcDistWebsql + (buildOptions.build.prod ? prodSuffix : ''),
    );
  }
  //#endregion

  //#endregion

  //#region public / methods & getters / process file
  processFile({
    fileRemovedEvent,
    regionReplaceOptions,
    isCuttableFile,
  }: {
    fileRemovedEvent?: boolean;
    isCuttableFile: boolean;
    regionReplaceOptions: ReplaceOptionsExtended;
  }) {
    //#region @backendFunc
    if (isCuttableFile) {
      this.initAndSaveCuttableFile(regionReplaceOptions);
    } else {
      this.initAndSaveAssetFile(fileRemovedEvent);
    }
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / init and save cuttabl file
  private initAndSaveCuttableFile(options: ReplaceOptionsExtended): void {
    //#region @backendFunc
    return this.init()
      .REPLACERegionsForIsomorphicLib(___NS__cloneDeep(options) as any)
      .REPLACERegionsFromTsImportExport()
      .save();
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / init and save
  private initAndSaveAssetFile(remove = false): BrowserCodeCut {
    // const debugFiles = ['assets/cutsmall.jpg'];

    //#region @backendFunc
    if (remove) {
      Helpers__NS__removeIfExists(
        this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsql),
      );
      Helpers__NS__removeIfExists(
        this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsqlAPPONLY),
      );
      Helpers__NS__removeIfExists(
        this.replaceAssetsPath(this.absoluteBackendDestFilePath),
      );
    } else {
      // this is needed for json in src/lib or something
      // if (this.absFileSourcePathBrowserOrWebsql.endsWith(debugFiles[0])) {
      //   debugger;
      // }
      const realAbsSourcePathFromSrc =
        fse.existsSync(this.absSourcePathFromSrc) &&
        fse.realpathSync(this.absSourcePathFromSrc);

      if (
        !realAbsSourcePathFromSrc ||
        !Helpers__NS__exists(realAbsSourcePathFromSrc) ||
        Helpers__NS__isFolder(realAbsSourcePathFromSrc)
      ) {
        return;
      }

      try {
        HelpersTaon__NS__copyFile(
          this.absSourcePathFromSrc,
          this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsql),
        );
        HelpersTaon__NS__copyFile(
          this.absSourcePathFromSrc,
          this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsqlAPPONLY),
        );
        // final straight copy to tmpSourceFolder
        HelpersTaon__NS__copyFile(
          this.absSourcePathFromSrc,
          this.replaceAssetsPath(this.absoluteBackendDestFilePath),
        );
      } catch (error) {
        Helpers__NS__warn(
          `[taon][browser-code-cut] file not found ${this.absSourcePathFromSrc}`,
        );
      }
    }
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / init
  rawOrginalContent: string;

  private init(): BrowserCodeCut {
    //#region @backendFunc
    const orgContent =
      Helpers__NS__readFile(this.absSourcePathFromSrc, void 0, true) || '';
    this.rawOrginalContent = orgContent;

    const allIsomorphicPackagesFromMemory =
      this.project.packagesRecognition.allIsomorphicPackagesFromMemory;

    this.splitFileProcess = new SplitFileProcess(
      orgContent,
      this.absSourcePathFromSrc,
      allIsomorphicPackagesFromMemory,
      this.project.name,
      this.nameForNpmPackage,
    );
    const { modifiedContent: firstPass, rewriteFile: firstTimeRewriteFile } =
      this.splitFileProcess.content;

    const { modifiedContent: secondPass, rewriteFile: secondTimeRewriteFile } =
      new SplitFileProcess(
        firstPass,
        this.absSourcePathFromSrc,
        allIsomorphicPackagesFromMemory,
        this.project.name,
        this.nameForNpmPackage,
      ).content;

    if ((orgContent || '').trim() !== (firstPass || '')?.trim()) {
      if (
        firstTimeRewriteFile &&
        (firstPass || '').trim() === (secondPass || '').trim() // it means it is stable
      ) {
        Helpers__NS__logInfo(`Rewrite file ${this.absSourcePathFromSrc}`);
        Helpers__NS__writeFile(this.absSourcePathFromSrc, firstPass);
      } else {
        Helpers__NS__logWarn(
          `Unstable file modification ${this.absSourcePathFromSrc}`,
        );
      }
    }

    this.rawContentForBrowser = orgContent;
    this.rawContentForAPPONLYBrowser = this.rawContentForBrowser; // TODO not needed ?
    this.rawContentBackend = this.rawContentForBrowser; // at the beginning those are normal files from src
    return this;
    //#endregion
  }

  //#endregion

  //#region private / methods & getters / project own smart packages
  get projectOwnSmartPackages(): string[] {
    //#region @backendFunc
    return [this.nameForNpmPackage];
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / is empty browser file
  private get isEmptyBrowserFile(): boolean {
    //#region @backendFunc
    return this.rawContentForBrowser.replace(/\s/g, '').trim() === '';
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / is empty module backend file
  private get isEmptyModuleBackendFile(): boolean {
    //#region @backendFunc
    return (
      (this.rawContentBackend || '').replace(/\/\*\ \*\//g, '').trim()
        .length === 0
    );
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / save empty file
  private saveEmptyFile(isTsFile: boolean): void {
    //#region @backendFunc
    if (!fse.existsSync(path.dirname(this.absFileSourcePathBrowserOrWebsql))) {
      // write empty instead unlink
      fse.mkdirpSync(path.dirname(this.absFileSourcePathBrowserOrWebsql));
    }
    if (
      !fse.existsSync(
        path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY),
      )
    ) {
      // write empty instead unlink
      fse.mkdirpSync(
        path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY),
      );
    }
    if (isTsFile) {
      if (!this.relativePath.startsWith('app/')) {
        try {
          // QUICK_FIX remove directory when trying to save as file
          fse.removeSync(this.absFileSourcePathBrowserOrWebsql);
        } catch (error) {}
        fse.writeFileSync(this.absFileSourcePathBrowserOrWebsql, 'utf8');
      }
      try {
        // QUICK_FIX remove directory when trying to save as file
        fse.removeSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY);
      } catch (error) {}
      fse.writeFileSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY, 'utf8');
    } else {
      if (!this.relativePath.startsWith('app/')) {
        try {
          // QUICK_FIX remove directory when trying to save as file
          fse.removeSync(this.absFileSourcePathBrowserOrWebsql);
        } catch (error) {}
        fse.writeFileSync(this.absFileSourcePathBrowserOrWebsql, ``, 'utf8');
      }
      try {
        // QUICK_FIX remove directory when trying to save as file
        fse.removeSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY);
      } catch (error) {}
      fse.writeFileSync(
        this.absFileSourcePathBrowserOrWebsqlAPPONLY,
        ``,
        'utf8',
      );
    }
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / save normal file
  private saveNormalBrowserFile(isTsFile: boolean): void {
    //#region @backendFunc
    // console.log('SAVE NORMAL FILE')
    if (this.isAssetsFile) {
      this.absFileSourcePathBrowserOrWebsql = this.replaceAssetsPath(
        this.absFileSourcePathBrowserOrWebsql,
      );
      // console.log(`ASSETE: ${this.absFileSourcePathBrowserOrWebsql}`)
    }
    if (this.isAssetsFile) {
      this.absFileSourcePathBrowserOrWebsqlAPPONLY = this.replaceAssetsPath(
        this.absFileSourcePathBrowserOrWebsqlAPPONLY,
      );
      // console.log(`ASSETE: ${this.absFileSourcePathBrowserOrWebsql}`)
    }
    if (!fse.existsSync(path.dirname(this.absFileSourcePathBrowserOrWebsql))) {
      fse.mkdirpSync(path.dirname(this.absFileSourcePathBrowserOrWebsql));
    }
    if (
      !fse.existsSync(
        path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY),
      )
    ) {
      fse.mkdirpSync(
        path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY),
      );
    }

    this.processAssetsLinksForApp();

    if (!this.isAssetsFile && this.relativePath.endsWith('.backend.ts')) {
      return;
    }

    if (isTsFile) {
      if (
        !this.relativePath.startsWith(`${appFromSrc}/`) &&
        !this.relativePath.startsWith(`${appFromSrc}.`)
      ) {
        // NORMAL TS BROWSER FILE FOR LIB
        fse.writeFileSync(
          this.absFileSourcePathBrowserOrWebsql,
          this.changeNpmNameToLocalLibNamePath(
            this.rawContentForBrowser,
            this.absFileSourcePathBrowserOrWebsql,
            { isBrowser: true },
          ),
          'utf8',
        );
      }
      // NORMAL TS BROWSER FILE FOR APP
      fse.writeFileSync(
        this.absFileSourcePathBrowserOrWebsqlAPPONLY,
        this.changeNpmNameToLocalLibNamePath(
          this.rawContentForAPPONLYBrowser,
          this.absFileSourcePathBrowserOrWebsqlAPPONLY,
          { isBrowser: true, libForApp: true },
        ),
        'utf8',
      );
    } else {
      if (!this.relativePath.startsWith(`${appFromSrc}/`)) {
        // NORMAL JSON, TXT (OR ANYTHING TEXT BASED) FOR BROWSER FILE FOR LIB
        fse.writeFileSync(
          this.absFileSourcePathBrowserOrWebsql,
          this.rawContentForBrowser,
          'utf8',
        );
      }
      // NORMAL JSON, TXT (OR ANYTHING TEXT BASED) FOR BROWSER FILE FOR APP
      fse.writeFileSync(
        this.absFileSourcePathBrowserOrWebsqlAPPONLY,
        this.rawContentForAPPONLYBrowser,
        'utf8',
      );
    }
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / replace regions from ts import export
  private REPLACERegionsFromTsImportExport(): BrowserCodeCut {
    //#region @backendFunc
    if (this.isAssetsFile) {
      return this;
    }
    if (!this.relativePath.endsWith('.ts')) {
      if (this.relativePath.endsWith('.tsx')) {
        // ok
      } else {
        return this;
      }
    }
    const prodPart = this.buildOptions.build.prod ? prodSuffix : '';
    if (___NS__isString(this.rawContentForBrowser)) {
      const toReplace = this.importExportsFromOrgContent.filter(imp => {
        imp.embeddedPathToFileResult = imp.wrapInParenthesis(
          imp.cleanEmbeddedPathToFile.replace(
            `/${srcMainProject}`,
            `/${
              (this.buildOptions.build.websql
                ? websqlFromImport
                : browserFromImport) + prodPart
            }`,
          ),
        );
        return imp.isIsomorphic;
      });

      this.rawContentForBrowser = this.splitFileProcess.replaceInFile(
        this.rawContentForBrowser,
        toReplace,
      );
      this.importExportsFromOrgContent.forEach(
        imp => delete imp.embeddedPathToFileResult,
      );
    }

    if (___NS__isString(this.rawContentBackend)) {
      const toReplace = this.importExportsFromOrgContent.filter(imp => {
        imp.embeddedPathToFileResult = imp.wrapInParenthesis(
          imp.cleanEmbeddedPathToFile.replace(
            `/${srcFromTaonImport}`,
            `/${libFromImport + prodPart}`,
          ),
        );
        return imp.isIsomorphic;
      });

      this.rawContentBackend = this.splitFileProcess.replaceInFile(
        this.rawContentBackend,
        toReplace,
      );
      this.importExportsFromOrgContent.forEach(
        imp => delete imp.embeddedPathToFileResult,
      );
    }

    return this;
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / replace regions for isomorphic lib
  private REPLACERegionsForIsomorphicLib(
    options: ReplaceOptionsExtended,
  ): BrowserCodeCut {
    //#region @backendFunc
    if (this.isAssetsFile) {
      return this;
    }
    options = ___NS__clone(options);
    // Helpers__NS__log(`[REPLACERegionsForIsomorphicLib] options.replacements ${this.absoluteFilePath}`)
    const ext = path.extname(this.relativePath);
    // console.log(`Ext: "${ext}" for file: ${path.basename(this.absoluteFilePath)}`)
    if (extAllowedToReplace.includes(ext)) {
      const orgContent = this.rawContentForBrowser;

      this.rawContentForBrowser = RegionRemover.from(
        this.relativePath,
        orgContent,
        options.replacements,
        this.project,
      ).output;

      if (this.project.framework.isStandaloneProject && !this.isWebsqlMode) {
        const regionsToRemove = [TAGS.BROWSER, TAGS.WEBSQL_ONLY];

        const orgContentBackend = this.rawContentBackend;

        // const debug =  this.relativePath.endsWith('layout-simple-small-app.component.ts');
        // if (debug ) {
        //   console.log(this.relativePath);
        //   console.log({ debugging: regionsToRemove });
        //   console.log(orgContentBackend);
        // }

        this.rawContentBackend = RegionRemover.from(
          this.absoluteBackendDestFilePath,
          orgContentBackend,
          regionsToRemove,
          this.project,
          // debug
        ).output;
      }
    }

    (() => {
      const from = `${srcMainProject}/${assetsFromSrc}/`;
      const to =
        `${TO_REMOVE_TAG}${assetsFromNgProj}/` +
        `${assetsFor}/${this.nameForNpmPackage}/${assetsFromNpmPackage}/`;
      this.rawContentForBrowser = this.rawContentForBrowser.replace(
        new RegExp(Utils__NS__escapeStringForRegEx(`/${from}`), 'g'),
        to,
      );
      this.rawContentForBrowser = this.rawContentForBrowser.replace(
        new RegExp(Utils__NS__escapeStringForRegEx(from), 'g'),
        to,
      );
    })();

    return this;
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / processing asset link for app
  private processAssetsLinksForApp(): void {
    //#region @backendFunc
    this.rawContentForAPPONLYBrowser = this.rawContentForBrowser.replace(
      new RegExp(Utils__NS__escapeStringForRegEx(TO_REMOVE_TAG), 'g'),
      '',
    );
    // console.log(`[incremental-build-process processAssetsLinksForApp '${this.buildOptions.baseHref}'`)
    const baseHref =
      this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(
        this.buildOptions.clone(),
      );
    // console.log(`Fixing with basehref: '${baseHref}'`)

    const howMuchBack = this.relativePath.split('/').length - 1;
    const back =
      howMuchBack === 0
        ? './'
        : ___NS__times(howMuchBack)
            .map(() => '../')
            .join('');

    const toReplaceFn = (relativeAssetPathPart: string) => {
      // console.log({ relativeAssetPathPart });
      return [
        {
          from: `${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
          to: `${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
          makeSureSlashAtBegin: true,
        },
        {
          from: ` '/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
          to: ` '${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        },
        {
          from: ` "/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
          to: ` "${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        },
        {
          from: `src="/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
          to: `src="${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        },
        {
          from: `[src]="'/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
          to: `[src]="'${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        },
        {
          from: `href="/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
          to: `href="${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        },
        {
          from: `[href]="'/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
          to: `[href]="'${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        },
        {
          from: `url(/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
          to: `url(${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        },
        {
          from: `url('/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
          to: `url('${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        },
        {
          from: `url("/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
          to: `url("${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        },
        /**
         *

  import * as json1 from '/shared/src/assets/hamsters/test.json';
  console.log({ json1 }) -> WORKS NOW
         */
        {
          from: ` from '/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
          to: ` from '${back}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        },
        {
          from: ` from "/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
          to: ` from "${back}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
        },
        /**
         * what can be done more
         * import * as json2 from '@codete-rxjs-quick-start/shared/assets/shared//src';
  console.log({ json2 })

  declare module "*.json" {
  const value: any;
  export default value;
  }

         */
      ] as {
        from: string;
        to: string;
        makeSureSlashAtBegin?: boolean;
      }[];
    };

    (() => {
      const cases = toReplaceFn(this.nameForNpmPackage);
      for (let index = 0; index < cases.length; index++) {
        const { to, from, makeSureSlashAtBegin } = cases[index];
        if (makeSureSlashAtBegin) {
          this.rawContentForAPPONLYBrowser =
            this.rawContentForAPPONLYBrowser.replace(
              new RegExp(Utils__NS__escapeStringForRegEx(`/${from}`), 'g'),
              `/${to}`,
            );

          this.rawContentForAPPONLYBrowser =
            this.rawContentForAPPONLYBrowser.replace(
              new RegExp(Utils__NS__escapeStringForRegEx(from), 'g'),
              `/${to}`,
            );
        } else {
          this.rawContentForAPPONLYBrowser =
            this.rawContentForAPPONLYBrowser.replace(
              new RegExp(Utils__NS__escapeStringForRegEx(from), 'g'),
              to,
            );
        }
      }
    })();

    //#endregion
  }
  //#endregion

  //#region private / methods & getters / save
  private save(): void {
    //#region @backendFunc
    if (this.isAssetsFile) {
      this.saveNormalBrowserFile(false);
      return;
    }
    // Helpers__NS__log(`saving ismoprhic file: ${this.absoluteFilePath}`, 1)

    const isTsFile = ['.ts', '.tsx'].includes(
      path.extname(this.absFileSourcePathBrowserOrWebsql),
    );
    const backendFileSaveMode = !this.isWebsqlMode; // websql does not do anything on be

    if (this.isEmptyBrowserFile) {
      this.saveEmptyFile(isTsFile);
    } else {
      this.saveNormalBrowserFile(isTsFile);
    }

    if (backendFileSaveMode) {
      const isEmptyModuleBackendFile = this.isEmptyModuleBackendFile;

      const absoluteBackendDestFilePath = this.absoluteBackendDestFilePath;

      if (!fse.existsSync(path.dirname(absoluteBackendDestFilePath))) {
        fse.mkdirpSync(path.dirname(absoluteBackendDestFilePath));
      }
      const isFrontendFile = !___NS__isUndefined(
        frontEndOnly.find(f => absoluteBackendDestFilePath.endsWith(f)),
      );

      if (isFrontendFile) {
        // console.log(`Ommiting for backend: ${absoluteBackendDestFilePath} `)
        return;
      }

      const contentStandalone =
        isEmptyModuleBackendFile && isTsFile
          ? `export function dummy${new Date().getTime()}() { }`
          : this.changeNpmNameToLocalLibNamePath(
              this.rawContentBackend,
              absoluteBackendDestFilePath,
              {
                isBrowser: false,
              },
            );

      // SAVE BACKEND FILE
      fse.writeFileSync(absoluteBackendDestFilePath, contentStandalone, 'utf8');
    }
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / production namespaces split
  private static initialWarning = {};

  get initialWarnings() {
    return BrowserCodeCut.initialWarning;
  }

  private productionSplitNamespaces(
    content: string,
    absFilePath: string,
    fileType:
      | typeof libTypeString
      | typeof browserTypeString
      | typeof websqlTypeString,
  ): string {
    //#region @backendFunc
    // if(this.debug) {
    //   debugger
    // }
    const data = UtilsTypescript__NS__splitNamespaceForContent(content);

    // this.debug &&
    //   console.log(`(${fileType}) SAVING NAMESPACES FOR`, absFilePath);

    fse.writeFileSync(
      absFilePath
        .replace('.tsx', `.${splitNamespacesJson}`)
        .replace('.ts', `.${splitNamespacesJson}`),
      JSON.stringify(
        {
          namespacesMapObj: data.namespacesMapObj,
          namespacesReplace: data.namespacesReplace,
        },
        null,
        2,
      ),
      'utf-8',
    );

    return data.content;
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / change content before saving file
  private changeNpmNameToLocalLibNamePath(
    content: string,
    absFilePath: string,
    options: {
      isBrowser: boolean;
      libForApp?: boolean;
    },
  ): string {
    //#region @backendFunc

    const isLibFile = this.relativePath.startsWith(`${libFromSrc}/`);
    if (!absFilePath.endsWith('.ts')) {
      if (absFilePath.endsWith('.tsx')) {
        // ok
      } else {
        // console.log(`NOT_FIXING: ${absFilePath}`)
        return content;
      }
    }

    const typeOfOp = options.isBrowser
      ? this.buildOptions.build.websql
        ? websqlTypeString
        : browserTypeString
      : libTypeString;

    // this.debug &&
    //   console.log(`

    //   relativePath: ${this.relativePath}
    //   isLibFile: ${isLibFile}
    //   type of operation: ${typeOfOp}

    //   `);

    // if (this.debug) {
    //   console.log(`Fixing imports in: ${absFilePath}`);
    //   console.log(`Fixing imports in: ${this.relativePath}`);
    // }

    const projectOwnSmartPackages = this.projectOwnSmartPackages;
    const { isBrowser, libForApp } = options;

    const howMuchBack = this.relativePath.split('/').length - 1;
    const howMuchBackIndex = howMuchBack - 1;
    const backAppLibIndex =
      howMuchBack === 0
        ? './'
        : ___NS__times(howMuchBack)
            .map(() => '../')
            .join('');

    const backLibIndex =
      howMuchBackIndex === 0
        ? './'
        : ___NS__times(howMuchBackIndex)
            .map(() => '../')
            .join('');

    let toReplace: UtilsTypescript__NS__TsImportExport[] = [];

    if (isBrowser) {
      toReplace = UtilsTypescript__NS__recognizeImportsFromContent(
        this.rawContentForBrowser,
      ).filter(f => {
        const fPkgBrowser = f.cleanEmbeddedPathToFile
          .replace(
            new RegExp(
              Utils__NS__escapeStringForRegEx(`/${browserFromImport + prodSuffix}`) +
                '$',
            ),
            '',
          )
          .replace(
            new RegExp(
              Utils__NS__escapeStringForRegEx(`/${websqlFromImport + prodSuffix}`) +
                '$',
            ),
            '',
          )
          .replace(
            new RegExp(
              Utils__NS__escapeStringForRegEx(`/${browserFromImport}`) + '$',
            ),
            '',
          )
          .replace(
            new RegExp(
              Utils__NS__escapeStringForRegEx(`/${websqlFromImport}`) + '$',
            ),
            '',
          );
        // this.debug && console.log({ fPkgBrowser });
        return projectOwnSmartPackages.includes(fPkgBrowser);
      });
    } else {
      toReplace = UtilsTypescript__NS__recognizeImportsFromContent(
        this.rawContentBackend,
      ).filter(f => {
        const fpkgBackend = f.cleanEmbeddedPathToFile
          .replace(
            new RegExp(
              Utils__NS__escapeStringForRegEx(`/${libFromImport + prodSuffix}`) +
                '$',
            ),
            '',
          )
          .replace(
            new RegExp(Utils__NS__escapeStringForRegEx(`/${libFromImport}`) + '$'),
            '',
          );
        // this.debug && console.log({ fpkgBackend });
        return projectOwnSmartPackages.includes(fpkgBackend);
      });
    }

    for (const imp of toReplace) {
      //#region handle stuff from /src/lib
      const cleanName = getCleanImport(imp.cleanEmbeddedPathToFile);

      // this.debug && console.log({ cleanName });

      if (isLibFile) {
        const indexInIfile = (this.rawOrginalContent || '')
          .split('\n')
          .findIndex(line => {
            return line.includes(`${cleanName}/${srcFromTaonImport}`);
          });
        const key = `${cleanName}:${indexInIfile}:${this.relativePath}`;
        if (!this.initialWarnings[key]) {
          // console.log(
          //   `isBrowser: ${!!isBrowser}, libForApp: ${!!libForApp},ab ${absFilePath}, rel: ${this.relativePath}`,
          // );
          Helpers__NS__warn(
            `(illegal import ${chalk.bold(`${cleanName}/${srcFromTaonImport}`)})` +
              ` Use relative path: ./${crossPlatformPath([srcMainProject, this.relativePath])}:${indexInIfile + 1}`,
          );

          this.initialWarnings[key] = true;
        }
      }

      imp.embeddedPathToFileResult = imp.wrapInParenthesis(
        `${isLibFile ? backLibIndex : backAppLibIndex}${indexTsFromLibFromSrc.replace('.tsx', '').replace('.ts', '')}`,
      );
      //#endregion
    }
    content = this.splitFileProcess.replaceInFile(content, toReplace);

    if (this.buildOptions.build.prod) {
      content = this.productionSplitNamespaces(content, absFilePath, typeOfOp);
    }

    return content;
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / replace assets path
  private replaceAssetsPath(absDestinationPath: string): string {
    //#region @backendFunc
    const isAsset = this.relativePath.startsWith(`${assetsFromTempSrc}/`);

    // isAsset && console.log('isAsset', absDestinationPath);
    return isAsset
      ? absDestinationPath.replace(
          `/${assetsFromTempSrc}/`,
          `/${assetsFromNgProj}/${assetsFor}/${
            this.nameForNpmPackage
          }/${assetsFromNpmPackage}/`,
        )
      : absDestinationPath;
    //#endregion
  }
  //#endregion
}