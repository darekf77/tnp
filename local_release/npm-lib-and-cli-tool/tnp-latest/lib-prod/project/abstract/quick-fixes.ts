//#region imports
import { TaonTempDatabasesFolder, TaonTempRoutesFolder } from 'taon/lib-prod';
import { config, LibTypeEnum, UtilsFilesFoldersSync__NS__copy, UtilsFilesFoldersSync__NS__copyFile, UtilsFilesFoldersSync__NS__filterDontCopy, UtilsFilesFoldersSync__NS__filterOnlyCopy, UtilsFilesFoldersSync__NS__getFilesFrom, UtilsFilesFoldersSync__NS__getFoldersFrom, UtilsFilesFoldersSync__NS__IGNORE_FOLDERS_FILES_PATTERNS, UtilsFilesFoldersSync__NS__move, UtilsFilesFoldersSync__NS__readFile, UtilsFilesFoldersSync__NS__UtilsFilesFoldersSyncGetFilesFromOptions, UtilsFilesFoldersSync__NS__writeFile } from 'tnp-core/lib-prod';
import { glob, fse, chalk } from 'tnp-core/lib-prod';
import { path, crossPlatformPath, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith } from 'tnp-core/lib-prod';
import { HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray, UtilsTypescript__NS__addBelowPlaceholder, UtilsTypescript__NS__addOrUpdateImportIfNotExists, UtilsTypescript__NS__calculateRelativeImportPath, UtilsTypescript__NS__clearRequireCacheRecursive, UtilsTypescript__NS__collapseFluentChains, UtilsTypescript__NS__DeepWritable, UtilsTypescript__NS__eslintFixAllFilesInsideFolder, UtilsTypescript__NS__eslintFixAllFilesInsideFolderAsync, UtilsTypescript__NS__eslintFixFile, UtilsTypescript__NS__ExportedThirdPartyNamespaces, UtilsTypescript__NS__ExportInfo, UtilsTypescript__NS__exportsFromContent, UtilsTypescript__NS__exportsFromFile, UtilsTypescript__NS__exportsRedefinedFromContent, UtilsTypescript__NS__exportsRedefinedFromFile, UtilsTypescript__NS__extractAngularComponentSelectors, UtilsTypescript__NS__extractClassNameFromString, UtilsTypescript__NS__extractClassNamesFromFile, UtilsTypescript__NS__extractDefaultClassNameFromFile, UtilsTypescript__NS__extractDefaultClassNameFromString, UtilsTypescript__NS__extractRenamedImportsOrExport, UtilsTypescript__NS__fixHtmlTemplatesInDir, UtilsTypescript__NS__FlattenMapping, UtilsTypescript__NS__formatAllFilesInsideFolder, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__GatheredExportsMap, UtilsTypescript__NS__gatherExportsMapFromIndex, UtilsTypescript__NS__getCleanImport, UtilsTypescript__NS__getTaonContextFromContent, UtilsTypescript__NS__getTaonContextsNamesFromFile, UtilsTypescript__NS__hoistTrailingChainComments, UtilsTypescript__NS__injectImportsIntoImportsRegion, UtilsTypescript__NS__migrateFromNgModulesToStandaloneV21, UtilsTypescript__NS__normalizeBrokenLines, UtilsTypescript__NS__NSSPLITNAMESAPCE, UtilsTypescript__NS__ParsedTsDiagnostic, UtilsTypescript__NS__parseTsDiagnostic, UtilsTypescript__NS__recognizeImportsFromContent, UtilsTypescript__NS__recognizeImportsFromFile, UtilsTypescript__NS__RedefinedExportInfo, UtilsTypescript__NS__refactorClassToNamespace, UtilsTypescript__NS__removeRegionByName, UtilsTypescript__NS__removeTaggedArrayObjects, UtilsTypescript__NS__removeTaggedImportExport, UtilsTypescript__NS__removeTaggedLines, UtilsTypescript__NS__RenamedImportOrExport, UtilsTypescript__NS__replaceImportNamespaceWithWithExplodedNamespace, UtilsTypescript__NS__replaceNamespaceWithLongNames, UtilsTypescript__NS__setValueToVariableInTsFile, UtilsTypescript__NS__splitNamespaceForContent, UtilsTypescript__NS__splitNamespaceForFile, UtilsTypescript__NS__SplitNamespaceResult, UtilsTypescript__NS__transformComponentStandaloneOption, UtilsTypescript__NS__transformFlatImports, UtilsTypescript__NS__TsImportExport, UtilsTypescript__NS__updateSplitNamespaceReExports, UtilsTypescript__NS__updateSplitNamespaceResultMapReplaceObj, UtilsTypescript__NS__wrapContentClassMembersDecoratorsWithRegion, UtilsTypescript__NS__wrapFirstImportsInImportsRegion, UtilsTypescript__NS__wrapWithComment, UtilsZip__NS__splitFile, UtilsZip__NS__splitFile7Zip, UtilsZip__NS__unzipArchive, UtilsZip__NS__zipDir } from 'tnp-helpers/lib-prod';
import { BaseQuickFixes, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC } from 'tnp-helpers/lib-prod';

import { templateFolderForArtifact } from '../../app-utils';
import {
  appFromSrc,
  appFromSrcInsideNgApp,
  assetsFromSrc,
  CoreNgTemplateFiles,
  distMainProject,
  folder_shared_folder_info,
  indexScssFromSrc,
  indexScssFromSrcLib,
  indexTsFromLibFromSrc,
  libFromSrc,
  migrationsFromLib,
  nodeModulesMainProject,
  sharedFromAssets,
  srcMainProject,
  srcNgProxyProject,
  TaonGeneratedFiles,
  tempSourceFolder,
  testsFromSrc,
  THIS_IS_GENERATED_INFO_COMMENT,
  THIS_IS_GENERATED_STRING,
  tsconfigForUnitTestsNgProject,
  tsconfigJsonBrowserMainProject,
  tsconfigJsonIsomorphicMainProject,
  tsconfigJsonMainProject,
  tsconfigNgProject,
  tsconfigSpecNgProject,
} from '../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../options';
import type { Project } from '../abstract/project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class QuickFixes extends BaseQuickFixes<Project> {
  removeHuskyHooks(): void {
    //#region @backendFunc
    this.project.removeFolderByRelativePath('node_modules/husky');
    //#endregion
  }

  fixPrettierCreatingConfigInNodeModules(): void {
    //#region @backendFunc
    const node_modules_path = this.project.nodeModules.path;

    const folderExists =
      Helpers__NS__exists(node_modules_path) && Helpers__NS__isFolder(node_modules_path);
    const isNotSymlink =
      folderExists && !fse.lstatSync(node_modules_path).isSymbolicLink();

    const allFolders = isNotSymlink
      ? UtilsFilesFoldersSync__NS__getFoldersFrom(node_modules_path, {
          followSymlinks: false,
          recursive: false,
        })
      : [];

    if (
      folderExists &&
      isNotSymlink &&
      allFolders.length === 1 &&
      path.basename(allFolders[0]) === '.cache'
    ) {
      Helpers__NS__info(`QUICK FIX: removing empty node_modules with only .cache`);
      Helpers__NS__remove(node_modules_path);
    }
    //#endregion
  }

  //#region recreate temp source necessary files for tests
  recreateTempSourceNecessaryFilesForTesting(initOptions: EnvOptions): void {
    //#region @backendFunc
    if (this.project.typeIsNot(LibTypeEnum.ISOMORPHIC_LIB)) {
      return;
    }

    (() => {
      const tsconfigBrowserPath = path.join(
        this.project.location,
        tsconfigJsonBrowserMainProject,
      );
      const tempDirs = [
        tempSourceFolder(true, true),
        tempSourceFolder(false, false),
        tempSourceFolder(true, false),
        tempSourceFolder(false, true),
        tempSourceFolder(true, true, true),
        tempSourceFolder(false, false, true),
        tempSourceFolder(true, false, true),
        tempSourceFolder(false, true, true),
      ];
      tempDirs.forEach(tempSrcDirName => {
        // console.log(`

        //   REBUILDING: ${dirName}

        //   `)
        const destTsconfigBrowser = path.join(
          this.project.location,
          tempSrcDirName,
          tsconfigNgProject,
        );
        HelpersTaon__NS__copyFile(tsconfigBrowserPath, destTsconfigBrowser);
        HelpersTaon__NS__setValueToJSONC(
          destTsconfigBrowser,
          'extends',
          `../${tsconfigJsonIsomorphicMainProject}`,
        );

        const appTemplateFolder = templateFolderForArtifact(
          initOptions.release.targetArtifact ===
            ReleaseArtifactTaon.ELECTRON_APP
            ? ReleaseArtifactTaon.ELECTRON_APP
            : ReleaseArtifactTaon.ANGULAR_NODE_APP,
        );

        this.project.framework.recreateFileFromCoreProject({
          fileRelativePath: [tempSrcDirName, tsconfigSpecNgProject],
          relativePathInCoreProject: `${appTemplateFolder}/${tsconfigForUnitTestsNgProject}`,
        });

        this.project.framework.recreateFileFromCoreProject({
          fileRelativePath: [
            tempSrcDirName,
            CoreNgTemplateFiles.JEST_CONFIG_JS,
          ],
          relativePathInCoreProject: `${appTemplateFolder}/${CoreNgTemplateFiles.JEST_CONFIG_JS}`,
        });

        this.project.framework.recreateFileFromCoreProject({
          fileRelativePath: [tempSrcDirName, CoreNgTemplateFiles.SETUP_JEST_TS],
          relativePathInCoreProject: `${appTemplateFolder}/${srcNgProxyProject}/${CoreNgTemplateFiles.SETUP_JEST_TS}`,
        });

        this.project.framework.recreateFileFromCoreProject({
          fileRelativePath: [
            tempSrcDirName,
            CoreNgTemplateFiles.JEST_GLOBAL_MOCKS_TS,
          ],
          relativePathInCoreProject: `${appTemplateFolder}/${srcNgProxyProject}/${CoreNgTemplateFiles.JEST_GLOBAL_MOCKS_TS}`,
        });
      });
    })();
    //#endregion
  }
  //#endregion

  //#region fix build dirs
  makeSureDistFolderExists(): void {
    //#region @backendFunc
    const p = this.project.pathFor(distMainProject);
    if (!Helpers__NS__isFolder(p)) {
      Helpers__NS__remove(p);
      Helpers__NS__mkdirp(p);
    }
    //#endregion
  }
  //#endregion

  //#region add missing angular files
  public missingAngularLibFiles(): void {
    //#region @backendFunc
    Helpers__NS__taskStarted(`[quick fixes] missing angular lib fles start`, true);
    if (
      this.project.framework.frameworkVersionAtLeast('v3') &&
      this.project.typeIs(LibTypeEnum.ISOMORPHIC_LIB)
    ) {
      (() => {
        if (this.project.framework.isStandaloneProject) {
          (() => {
            const indexTs = crossPlatformPath([
              this.project.location,
              srcMainProject,
              libFromSrc,
              indexTsFromLibFromSrc,
            ]);
            if (!Helpers__NS__exists(indexTs)) {
              Helpers__NS__writeFile(
                indexTs,
                `
              export function helloWorldFrom${___NS__upperFirst(
                ___NS__camelCase(this.project.name),
              )}() { }
              `.trimLeft(),
              );
            }
          })();
          (() => {
            const indexTs = this.project.pathFor([
              srcMainProject,
              libFromSrc,
              indexScssFromSrcLib,
            ]);

            if (!Helpers__NS__exists(indexTs)) {
              Helpers__NS__writeFile(
                indexTs,
                `
// EXPORT SCSS STYLES FOR THIS LIBRARY IN THIS FILE
// @forward './my-scss-file.scss'; # => it is similar to export * from './my-scss-file.scss' in TypeScript
              `.trimLeft(),
              );
            }
          })();

          (() => {
            const indexScss = this.project.pathFor([
              srcMainProject,
              indexScssFromSrc,
            ]);
            if (!Helpers__NS__exists(indexScss)) {
              Helpers__NS__writeFile(
                indexScss,
                `
// EXPORT SCSS STYLES FOR THIS APP or LIBRARY IN THIS FILE
@forward './lib/index.scss';

              `.trimLeft(),
              );
            }
          })();
        }
      })();

      (() => {
        const shared_folder_info = this.project.pathFor([
          srcMainProject,
          assetsFromSrc,
          sharedFromAssets,
          folder_shared_folder_info,
        ]);

        Helpers__NS__writeFile(
          shared_folder_info,
          `
${THIS_IS_GENERATED_STRING}

Assets from this folder are being shipped with this npm package (${this.project.nameForNpmPackage})
created from this project.

${THIS_IS_GENERATED_STRING}
          `.trimLeft(),
        );
      })();

      (() => {
        const shared_folder_info = this.project.pathFor([
          srcMainProject,
          libFromSrc,
          migrationsFromLib,
          TaonGeneratedFiles.MIGRATIONS_INFO_MD,
        ]);

        Helpers__NS__writeFile(
          shared_folder_info,
          `
${THIS_IS_GENERATED_STRING}

This folder is only for storing migration files with auto-generated names.

${THIS_IS_GENERATED_STRING}
          `.trimLeft(),
        );
      })();

      (() => {
        const shared_folder_info = this.project.pathFor([
          srcMainProject,
          libFromSrc,
          TaonGeneratedFiles.LIB_INFO_MD,
        ]);

        Helpers__NS__writeFile(
          shared_folder_info,
          `
${THIS_IS_GENERATED_STRING}

This folder is an entry point for npm Angular/NodeJS library

DON'T USE STUFF FROM PARENT FOLDER app.* FILES HERE (except src/migrations/** files).

${THIS_IS_GENERATED_STRING}
          `.trimLeft(),
        );
      })();

      (() => {
        const shared_folder_info = this.project.pathFor([
          srcMainProject,
          testsFromSrc,
          TaonGeneratedFiles.MOCHA_TESTS_INFO_MD,
        ]);

        Helpers__NS__writeFile(
          shared_folder_info,
          `
${THIS_IS_GENERATED_STRING}

# Purpose of this folder
Put your backend **mocha** tests (with *.test.ts extension) in this folder or any other *tests*
folder inside project.

\`\`\`
/src/lib/my-feature/features.test.ts                          # -> NOT ok, test omitted
/src/lib/my-feature/tests/features.test.ts                    # -> OK
/src/lib/my-feature/nested-feature/tests/features.test.ts     # -> OK
\`\`\`

# How to test your isomorphic backend ?

1. By using console select menu:
\`\`\`
taon test                   # single run
taon test:watch             # watch mode
taon test:debug             # and start "attach" VSCode debugger
taon test:watch:debug       # and start "attach" VSCode debugger
\`\`\`

2. Directly:
\`\`\`
taon mocha                        # single run
taon mocha:watch                  # watch mode
taon mocha:debug                  # and start "attach" VSCode debugger
taon mocha:watch:debug            # and start "attach" VSCode debugger
\`\`\`

# Example
example.test.ts
\`\`\`ts
import { describe, before, it } from 'mocha'
import { expect } from 'chai';

describe('Set name for function or class', () => {

  it('should keep normal function name ', () => {
    expect(1).to.be.eq(Number(1));
  })
});
\`\`\`

${THIS_IS_GENERATED_STRING}

          `.trimLeft(),
        );
      })();
    }

    const appFolderInfoMdAbsPath = this.project.pathFor([
      srcMainProject,
      appFromSrc,
      TaonGeneratedFiles.APP_FOLDER_INFO_MD,
    ]);

    Helpers__NS__writeFile(
      appFolderInfoMdAbsPath,
      `${THIS_IS_GENERATED_STRING}

# HOW TO USE THIS FOLDER

Put here files that you don't want to share through npm package.

*src/lib* - it is for **npm library** code

*src/app* - it is for **app only** code
(app -> means here: webapp, nodejs server, electron, vscode plugin etc.)

${THIS_IS_GENERATED_STRING}`,
    );

    Helpers__NS__writeFile(
      [
        this.project.location,
        TaonTempDatabasesFolder,
        'databases-folder-info.md',
      ],
      `${THIS_IS_GENERATED_STRING}

# PURPOSE OF THIS FOLDER

You will see here *.sqlite database files only after you run your application
that uses HOST_CONFIG from src/app.hosts.ts

${THIS_IS_GENERATED_STRING}`,
    );

    Helpers__NS__writeFile(
      [this.project.location, TaonTempRoutesFolder, 'routes-folder-info.md'],
      `${THIS_IS_GENERATED_STRING}

# PURPOSE OF THIS FOLDER

You will see here *.rest routes for each context/controller of your application
that uses HOST_CONFIG from src/app.hosts.ts

${THIS_IS_GENERATED_STRING}`,
    );

    Helpers__NS__taskDone(`[quick fixes] missing angular lib fles end`);
    //#endregion
  }
  //#endregion

  //#region bad types in node modules
  removeBadTypesInNodeModules(): void {
    //#region @backendFunc
    if (!fse.existsSync(this.project.nodeModules.path)) {
      Helpers__NS__warn(
        `Cannot remove bad types from node_modules. Folder node_modules does not exist.`,
      );
      return;
    }

    [
      '@types/prosemirror-*',
      '@types/mocha',
      '@types/jasmine*',
      '@types/puppeteer-core',
      '@types/puppeteer',
      '@types/oauth2orize',
      '@types/lowdb',
      '@types/eslint',
      '@types/eslint-scope',
      '@types/inquirer',
      'ts-json-schema-generator/node_modules/.bin', // problem with symlinks
    ].forEach(name => {
      Helpers__NS__info(`Removing bad folders from node_modules: ${name}`);
      Helpers__NS__removeFolderIfExists(
        path.join(this.project.nodeModules.path, name),
      );
    });
    const globalsDts = this.project.readFile(
      'node_modules/@types/node/globals.d.ts',
    );
    try {
      this.project.writeFile(
        'node_modules/@types/node/globals.d.ts',
        UtilsTypescript__NS__removeRegionByName(globalsDts, 'borrowed'),
      );
    } catch (error) {
      Helpers__NS__error(
        `Problem with removing borrowed types from globals.d.ts`,
        true,
        false,
      );
      this.project.writeFile(
        'node_modules/@types/node/globals.d.ts',
        globalsDts,
      );
    }

    //#endregion
  }
  //#endregion

  //#region add missing source folder
  public addMissingSrcFolderToEachProject(): void {
    //#region @backendFunc
    /// QUCIK_FIX make it more generic
    if (this.project.framework.frameworkVersionEquals('v1')) {
      return;
    }
    Helpers__NS__taskStarted(`[quick fixes] missing source folder start`, true);
    if (!fse.existsSync(this.project.location)) {
      return;
    }
    if (this.project.framework.isStandaloneProject) {
      const srcFolderAbsPath = this.project.pathFor(srcMainProject);

      if (!fse.existsSync(srcFolderAbsPath)) {
        Helpers__NS__mkdirp(srcFolderAbsPath);
      }
    }
    Helpers__NS__taskDone(`[quick fixes] missing source folder end`);
    //#endregion
  }
  //#endregion

  //#region node_modules replacements zips
  public get nodeModulesPkgsReplacements() {
    //#region @backendFunc
    const npmReplacements = glob
      .sync(`${this.project.pathFor(nodeModulesMainProject)}-*.zip`)
      .map(p => p.replace(this.project.location, '').slice(1));

    return npmReplacements;
    //#endregion
  }

  /**
   * @deprecated
   * FIX for missing npm packages from npmjs.com
   *
   * Extract each file: node_modules-<package Name>.zip
   * to node_modules folder before instalation.
   * This will prevent packages deletion from npm
   */
  public unpackNodeModulesPackagesZipReplacements() {
    //#region @backendFunc
    return; // TODO @UNCOMMENT zip refactored
    const nodeModulesPath = this.project.pathFor(nodeModulesMainProject);

    if (!fse.existsSync(nodeModulesPath)) {
      Helpers__NS__mkdirp(nodeModulesPath);
    }
    this.nodeModulesPkgsReplacements.forEach(p => {
      const nameZipReplacementPackage = p.replace(
        `${nodeModulesMainProject}-`,
        '',
      );

      const moduleInNodeModules = this.project.pathFor([
        nodeModulesMainProject,
        nameZipReplacementPackage,
      ]);

      if (fse.existsSync(moduleInNodeModules)) {
        Helpers__NS__info(
          `Extraction ${chalk.bold(
            nameZipReplacementPackage,
          )} already exists in ` +
            ` ${chalk.bold(
              this.project.genericName,
            )}/${nodeModulesMainProject}`,
        );
      } else {
        Helpers__NS__info(
          `Extraction before installation ${chalk.bold(
            nameZipReplacementPackage,
          )} in ` +
            ` ${chalk.bold(
              this.project.genericName,
            )}/${nodeModulesMainProject}`,
        );

        UtilsZip__NS__unzipArchive(p);
        // TODO extract-zip removed - find alternative
        // this.project.run(`extract-zip ${p} ${nodeModulesPath}`).sync();
      }
    });
    //#endregion
  }
  //#endregion
}