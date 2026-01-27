//#region imports

import { config, folderName, LibTypeEnum } from 'tnp-core/lib-prod';
import { chalk, crossPlatformPath, dateformat, fse, glob, path, rimraf, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings } from 'tnp-core/lib-prod';
import { ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith } from 'tnp-core/lib-prod';
import { fileName } from 'tnp-core/lib-prod';
import { BasePackageJson, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray } from 'tnp-helpers/lib-prod';

import {
  angularProjProxyPath,
  getProxyNgProj,
  templateFolderForArtifact,
} from '../../../../app-utils';
import {
  AngularJsonLibTaskNameResolveFor,
  appFromSrc,
  assetsFromNgProj,
  assetsFromSrc,
  binMainProject,
  browserFromCompiledDist,
  browserMainProject,
  BundledFiles,
  cliDtsNpmPackage,
  cliJSMapNpmPackage,
  cliJSNpmPackage,
  COMPILATION_COMPLETE_LIB_NG_BUILD,
  CoreAssets,
  CoreNgTemplateFiles,
  defaultConfiguration,
  distMainProject,
  dotFileTemplateExt,
  dotGitIgnoreMainProject,
  dotNpmIgnoreMainProject,
  dotNpmrcMainProject,
  indexDtsNpmPackage,
  indexJSNpmPackage,
  indexTsProd,
  libFromCompiledDist,
  libFromNpmPackage,
  libFromSrc,
  libs,
  localReleaseMainProject,
  MESSAGES,
  migrationsFromLib,
  nodeModulesMainProject,
  packageJsonNpmLib,
  prodSuffix,
  reExportJson,
  sourceLinkInNodeModules,
  splitNamespacesJson,
  srcMainProject,
  srcNgProxyProject,
  suffixLatest,
  TaonCommands,
  TaonGeneratedFiles,
  taonJsonMainProject,
  testsFromSrc,
  THIS_IS_GENERATED_INFO_COMMENT,
  tmpBaseHrefOverwrite,
  tmpLocalCopytoProjDist,
  tmpSrcDist,
  tmpSrcDistWebsql,
  websqlFromCompiledDist,
  websqlMainProject,
} from '../../../../constants';
import {
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { AssetsManager } from '../angular-node-app/tools/assets-manager';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';

import { IncrementalBuildProcess } from './tools/build-isomorphic-lib/compilations/incremental-build-process';
import { CopyManager } from './tools/copy-manager/copy-manager';
import { FilesTemplatesBuilder } from './tools/files-recreation';
import { IndexAutogenProvider } from './tools/index-autogen-provider';
import { InsideStructuresLib } from './tools/inside-struct-lib';
import { CypressTestRunner } from './tools/test-runner/cypress-test-runner';
import { JestTestRunner } from './tools/test-runner/jest-test-runner';
import { MochaTestRunner } from './tools/test-runner/mocha-test-runner';
import { AppRoutesAutogenProvider } from './tools/app-routes-autogen-provider';
//#endregion

export class ArtifactNpmLibAndCliTool extends BaseArtifact<
  {
    //#region build output options
    /**
     * for non org: <path-to-release-folder>/tmpLocalCopytoProjDist/my-library/node_modules/my-library
     * for org: <path-to-release-folder>/tmpLocalCopytoProjDist/my-library/node_modules/@my-library
     */
    tmpProjNpmLibraryInNodeModulesAbsPath: string;
    /**
     * check if produced package is an organization package
     * (this can be from standalone with custom name OR container organization)
     */
    isOrganizationPackage?: boolean;
    /**
     * my-library or @my-library/my-inside-lib or @my-library/my-inside-lib/deep-core-lib
     */
    packageName?: string;
    //#endregion
  },
  ReleasePartialOutput
> {
  //#region fields

  public readonly __tests: MochaTestRunner;

  public readonly __testsJest: JestTestRunner;

  public readonly __testsCypress: CypressTestRunner;

  public readonly copyNpmDistLibManager: CopyManager;

  public readonly insideStructureLib: InsideStructuresLib;

  public readonly indexAutogenProvider: IndexAutogenProvider;
  public readonly appTsRoutesAutogenProvider: AppRoutesAutogenProvider;

  public readonly filesTemplatesBuilder: FilesTemplatesBuilder;

  public readonly assetsManager: AssetsManager;

  //#endregion

  //#region constructor

  //#region @backend
  constructor(project: Project) {
    super(project, ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL);

    this.__tests = new MochaTestRunner(project);
    this.__testsJest = new JestTestRunner(project);
    this.__testsCypress = new CypressTestRunner(project);

    this.copyNpmDistLibManager = CopyManager.for(project);
    this.indexAutogenProvider = new IndexAutogenProvider(project);
    this.appTsRoutesAutogenProvider = new AppRoutesAutogenProvider(project);
    this.filesTemplatesBuilder = new FilesTemplatesBuilder(project);
    this.insideStructureLib = new InsideStructuresLib(project);
    this.assetsManager = new AssetsManager(project);
  }
  //#endregion

  //#endregion

  //#region init partial

  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc

    Helpers__NS__taskStarted(
      `Initing project: ${chalk.bold(this.project.genericName)} ${
        initOptions.init.struct ? '(without packages install)' : ''
      } `,
    );

    // const updatedConfig =
    // if (updatedConfig) {
    //   initOptions = updatedConfig;
    // }

    if (this.project.framework.isStandaloneProject) {
      await this.insideStructureLib.init(initOptions);
      this.filesTemplatesBuilder.rebuild(initOptions);
    }

    if (this.project.framework.isStandaloneProject) {
      this.project.quickFixes.addMissingSrcFolderToEachProject();
      this.project.quickFixes.missingAngularLibFiles();
    }

    if (this.project.framework.isContainerCoreProject) {
      this.project.quickFixes.createDummyEmptyLibsReplacements([]); // TODO
      this.project.quickFixes.removeBadTypesInNodeModules();
    }

    if (this.project.framework.isStandaloneProject) {
      await this.project.artifactsManager.artifact.angularNodeApp.migrationHelper.runTask(
        {
          watch: false,
        },
      );
      await this.creteBuildInfoFile(initOptions);
      if (this.project.taonJson.shouldGenerateAutogenIndexFile) {
        await this.indexAutogenProvider.runTask({
          // watch: initOptions.build.watch, // TODO watching sucks here
        });
      } else {
        this.indexAutogenProvider.writeIndexFile(true);
      }
      if (this.project.taonJson.shouldGenerateAutogenAppRoutesFile) {
        await this.appTsRoutesAutogenProvider.runTask({
          // watch: initOptions.build.watch, // TODO watching sucks here
        });
      }
    }

    Helpers__NS__log(
      `Init DONE for project: ${chalk.bold(this.project.genericName)} `,
    );

    this.project.quickFixes.makeSureDistFolderExists();

    // Helpers__NS__info(`[buildLib] start of building ${websql ? '[WEBSQL]' : ''}`);

    this.copyEssentialFilesTo([
      crossPlatformPath([this.project.pathFor(distMainProject)]),
    ]);
    return initOptions;
    //#endregion
  }
  //#endregion

  //#region build partial
  async buildPartial(buildOptions: EnvOptions): Promise<{
    tmpProjNpmLibraryInNodeModulesAbsPath: string;
    isOrganizationPackage?: boolean;
    packageName?: string;
  }> {
    //#region @backendFunc

    if (!this.project.framework.isStandaloneProject) {
      Helpers__NS__warn(
        `Project is not standalone. Skipping npm-lib-and-cli-tool build.`,
      );
      return;
    }
    const orgParams = buildOptions.clone();

    buildOptions = await this.project.artifactsManager.init(buildOptions);

    if (buildOptions.build.watch) {
      this.project.environmentConfig.watchAndRecreate(async () => {
        await this.project.environmentConfig.update(
          orgParams.clone({
            release: {
              targetArtifact: buildOptions.release.targetArtifact,
              envName: '__',
            },
          }),
          { fromWatcher: true, saveEnvToLibEnv: true },
        );
      });
    }

    const shouldSkipBuild = this.shouldSkipBuild(buildOptions);

    const packageName = this.project.nameForNpmPackage;
    const tmpProjNpmLibraryInNodeModulesAbsPath = this.project.pathFor([
      tmpLocalCopytoProjDist,
      nodeModulesMainProject,
      packageName,
    ]);
    const isOrganizationPackage =
      this.project.nameForNpmPackage.startsWith('@');

    if (shouldSkipBuild) {
      Helpers__NS__warn(`

        Skipping build of npm-lib-and-cli-tool artifact...

        `);
      return {
        tmpProjNpmLibraryInNodeModulesAbsPath,
        isOrganizationPackage,
        packageName,
      };
    }

    Helpers__NS__logInfo(
      `Start of (${buildOptions.build.watch ? 'watch' : 'normal'}) lib building...`,
    );

    //#region init incremental process
    const incrementalBuildProcess = new IncrementalBuildProcess(
      this.project,
      buildOptions,
    );
    //#endregion

    //#region init proxy projects
    const proxyProject = getProxyNgProj(
      this.project,
      buildOptions.clone({
        build: {
          websql: false,
        },
      }),
      ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    );

    const proxyProjectWebsql = getProxyNgProj(
      this.project,
      buildOptions.clone({
        build: {
          websql: true,
        },
      }),
      ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    );
    Helpers__NS__log(`

    proxy Proj = ${proxyProject?.location}
    proxy Proj websql = ${proxyProjectWebsql?.location}

    `);
    //#endregion

    //#region prepare commands + base href
    // const command = `${loadNvm} && ${this.npmRunNg} build ${this.name} ${watch ? '--watch' : ''}`;
    const commandForLibraryBuild = `${this.NPM_RUN_NG_COMMAND} build ${this.project.name} ${
      buildOptions.build.watch ? '--watch' : ''
    }`;

    const showInfoAngular = () => {
      Helpers__NS__info(
        `Starting browser Angular/TypeScirpt build.... ${
          buildOptions.build.websql ? '[WEBSQL]' : ''
        }`,
      );
      Helpers__NS__log(`

      ANGULAR ${this.project.framework.coreContainer?.packageJson.version} ${
        buildOptions.build.watch ? 'WATCH ' : ''
      } LIB BUILD STARTED... ${buildOptions.build.websql ? '[WEBSQL]' : ''}

      `);

      Helpers__NS__log(` command: ${commandForLibraryBuild}`);
    };

    buildOptions.build.baseHref = !___NS__isUndefined(buildOptions.build.baseHref)
      ? buildOptions.build.baseHref
      : this.artifacts.angularNodeApp.angularFeBasenameManager.rootBaseHref;

    this.project.writeFile(tmpBaseHrefOverwrite, buildOptions.build.baseHref);

    Helpers__NS__logInfo(`

    ${buildOptions.build.prod ? '[PROD]' : '[DEV]'} Building lib for base href: ${
      !___NS__isUndefined(buildOptions.build.baseHref)
        ? `'` + buildOptions.build.baseHref + `'`
        : '/ (default)'
    }

      `);
    //#endregion

    if (
      !buildOptions.build.watch &&
      buildOptions.release.releaseType &&
      !buildOptions.release.skipCodeCutting
    ) {
      this.__cutReleaseCodeFromSrc(buildOptions);
    }

    //#region incremental build
    if (!shouldSkipBuild) {
      await incrementalBuildProcess.runTask({
        taskName: 'isomorphic compilation',
        watch: buildOptions.build.watch,
      });
      await this.assetsManager.runTask({
        watch: buildOptions.build.watch,
      });
    }
    //#endregion

    showInfoAngular();

    //#region ng build
    const outputOptions = await this.outputFixNgLibBuild(buildOptions);

    const runNgBuild = async () => {
      await proxyProject.execute(commandForLibraryBuild, {
        similarProcessKey: TaonCommands.NG,
        resolvePromiseMsg: {
          stdout: buildOptions.build.watch
            ? COMPILATION_COMPLETE_LIB_NG_BUILD
            : undefined,
        },
        ...outputOptions,
      });
      await proxyProjectWebsql.execute(commandForLibraryBuild, {
        similarProcessKey: TaonCommands.NG,
        resolvePromiseMsg: {
          stdout: buildOptions.build.watch
            ? COMPILATION_COMPLETE_LIB_NG_BUILD
            : undefined,
        },
        ...outputOptions,
      });
    };
    //#endregion

    //#region set angular.json default tasks

    const tmpLibForDistNormalRelativePath = angularProjProxyPath({
      project: this.project,
      targetArtifact: buildOptions.release.targetArtifact,
      envOptions: buildOptions.clone({
        build: { websql: false },
      }),
    });

    const tmpLibForDistWebsqlRelativePath = angularProjProxyPath({
      project: this.project,
      targetArtifact: buildOptions.release.targetArtifact,
      envOptions: buildOptions.clone({
        build: { websql: true },
      }),
    });

    this.project.setValueToJSONC(
      [tmpLibForDistNormalRelativePath, CoreNgTemplateFiles.ANGULAR_JSON],
      `projects["${this.project.name}"].architect.build.${defaultConfiguration}`,
      AngularJsonLibTaskNameResolveFor(buildOptions),
    );

    this.project.setValueToJSONC(
      [tmpLibForDistWebsqlRelativePath, CoreNgTemplateFiles.ANGULAR_JSON],
      `projects["${this.project.name}"].architect.build.${defaultConfiguration}`,
      AngularJsonLibTaskNameResolveFor(buildOptions),
    );

    this.project.remove([tmpLibForDistNormalRelativePath, '.angular']);

    this.project.remove([tmpLibForDistWebsqlRelativePath, '.angular']);

    //#endregion

    //#region  handle watch & normal mode
    if (!shouldSkipBuild) {
      if (buildOptions.build.watch) {
        await runNgBuild();
      } else {
        try {
          await runNgBuild();
        } catch (e) {
          console.error(e);

          Helpers__NS__throwError(
            `
          Command failed: ${commandForLibraryBuild}

          Not able to build project: ${this.project.genericName}`,
          );
        }
      }
    }
    //#endregion

    if (
      !buildOptions.build.watch &&
      buildOptions.release.releaseType &&
      !buildOptions.release.skipCodeCutting
    ) {
      this.__restoreCuttedReleaseCodeFromSrc(buildOptions);
    }

    //#region start copy manager
    if (!shouldSkipBuild) {
      if (!buildOptions.copyToManager.skip) {
        if (___NS__isFunction(buildOptions.copyToManager.beforeCopyHook)) {
          await buildOptions.copyToManager.beforeCopyHook();
        }
        this.copyNpmDistLibManager.init(buildOptions);
        await this.copyNpmDistLibManager.runTask({
          taskName: 'copyto manger',
          watch: buildOptions.build.watch,
        });
      }
    }
    //#endregion

    //#region show ending info
    this.showMesageWhenBuildLibDone(buildOptions);

    Helpers__NS__info(
      buildOptions.build.watch
        ? `
     [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
     Files watcher started.. ${buildOptions.build.websql ? '[WEBSQL]' : ''}
   `
        : `
     [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
     End of Building ${this.project.genericName} ${buildOptions.build.websql ? '[WEBSQL]' : ''}

   `,
    );
    //#endregion

    return {
      tmpProjNpmLibraryInNodeModulesAbsPath,
      isOrganizationPackage,
      packageName,
    };
    //#endregion
  }
  //#endregion

  //#region release partial
  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<ReleasePartialOutput> {
    //#region @backendFunc

    //#region prepare variables
    let releaseType: ReleaseType = releaseOptions.release.releaseType;

    releaseOptions = this.updateResolvedVersion(releaseOptions);

    // DEV BUILD
    const { tmpProjNpmLibraryInNodeModulesAbsPath } = await this.buildPartial(
      releaseOptions.clone({
        build: { prod: false, watch: false },
        copyToManager: {
          skip: true,
        },
      }),
    );

    // PROD BUILD

    await this.buildPartial(
      releaseOptions.clone({
        build: { prod: true, watch: false },
        copyToManager: {
          beforeCopyHook: () => {
            //#region copy prod build files to dist folder
            Helpers__NS__logInfo(`Copying production build files to dist folder...`);

            //browser namespaces json
            HelpersTaon__NS__copyFile(
              this.project.pathFor([
                distMainProject + prodSuffix,
                browserFromCompiledDist +
                  prodSuffix +
                  `.${splitNamespacesJson}`,
              ]),
              this.project.pathFor([
                distMainProject,
                browserFromCompiledDist +
                  prodSuffix +
                  `.${splitNamespacesJson}`,
              ]),
            );

            HelpersTaon__NS__copyFile(
              this.project.pathFor([
                distMainProject + prodSuffix,
                browserFromCompiledDist + prodSuffix + `.${reExportJson}`,
              ]),
              this.project.pathFor([
                distMainProject,
                browserFromCompiledDist + prodSuffix + `.${reExportJson}`,
              ]),
            );

            //websql namespaces json
            HelpersTaon__NS__copyFile(
              this.project.pathFor([
                distMainProject + prodSuffix,
                websqlFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
              ]),
              this.project.pathFor([
                distMainProject,
                websqlFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
              ]),
            );

            HelpersTaon__NS__copyFile(
              this.project.pathFor([
                distMainProject + prodSuffix,
                websqlFromCompiledDist + prodSuffix + `.${reExportJson}`,
              ]),
              this.project.pathFor([
                distMainProject,
                websqlFromCompiledDist + prodSuffix + `.${reExportJson}`,
              ]),
            );

            //lib namespaces json
            HelpersTaon__NS__copyFile(
              this.project.pathFor([
                distMainProject + prodSuffix,
                libFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
              ]),
              this.project.pathFor([
                distMainProject,
                libFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
              ]),
            );

            HelpersTaon__NS__copyFile(
              this.project.pathFor([
                distMainProject + prodSuffix,
                libFromCompiledDist + prodSuffix + `.${reExportJson}`,
              ]),
              this.project.pathFor([
                distMainProject,
                libFromCompiledDist + prodSuffix + `.${reExportJson}`,
              ]),
            );

            HelpersTaon__NS__copy(
              this.project.pathFor([
                distMainProject + prodSuffix,
                browserMainProject,
              ]),
              this.project.pathFor([
                distMainProject,
                browserMainProject + prodSuffix,
              ]),
              { recursive: true, overwrite: true },
            );

            HelpersTaon__NS__copy(
              this.project.pathFor([
                distMainProject + prodSuffix,
                websqlMainProject,
              ]),
              this.project.pathFor([
                distMainProject,
                websqlMainProject + prodSuffix,
              ]),
              { recursive: true, overwrite: true },
            );

            HelpersTaon__NS__copy(
              this.project.pathFor([
                distMainProject + prodSuffix,
                libFromCompiledDist,
              ]),
              this.project.pathFor([
                distMainProject,
                libFromCompiledDist + prodSuffix,
              ]),
              { recursive: true, overwrite: true },
            );
            //#endregion
          },
        },
      }),
    );

    let releaseProjPath: string = tmpProjNpmLibraryInNodeModulesAbsPath;

    //#endregion

    if (releaseOptions.release.releaseType !== ReleaseType.LOCAL) {
      this.removeNotNpmRelatedFilesFromReleaseBundle(releaseProjPath);
    }

    this.copyEssentialFilesTo([tmpProjNpmLibraryInNodeModulesAbsPath]);

    this.packResource(tmpProjNpmLibraryInNodeModulesAbsPath);

    this.fixPackageJsonForRelease(
      tmpProjNpmLibraryInNodeModulesAbsPath,
      releaseOptions.release.resolvedNewVersion,
    );

    this.preparePackageJsonForReleasePublish(
      tmpProjNpmLibraryInNodeModulesAbsPath,
    );

    await this.runAfterReleaseJsCodeActions(
      tmpProjNpmLibraryInNodeModulesAbsPath,
      releaseOptions,
    );

    const projFromCompiled = this.project.ins.From(
      tmpProjNpmLibraryInNodeModulesAbsPath,
    );

    const allowedToNpmReleases: ReleaseType[] = [
      ReleaseType.MANUAL,
      ReleaseType.CLOUD,
    ];

    // console.log(`

    //   doNotIncludeLibFiles: ${releaseOptions.release.lib.doNotIncludeLibFiles}

    //   `);

    const clearLibFiles = (folderAbsPath: string) => {
      Helpers__NS__remove([folderAbsPath, libFromSrc]);
      Helpers__NS__remove([folderAbsPath, sourceLinkInNodeModules]);
      Helpers__NS__remove([folderAbsPath, assetsFromSrc]);
      Helpers__NS__remove([folderAbsPath, browserMainProject]);
      Helpers__NS__remove([folderAbsPath, browserMainProject + prodSuffix]);
      Helpers__NS__remove([folderAbsPath, folderName.client]); // TODO REMOVE
      Helpers__NS__remove([folderAbsPath, websqlMainProject]);
      Helpers__NS__remove([folderAbsPath, websqlMainProject + prodSuffix]);
      Helpers__NS__remove([folderAbsPath, migrationsFromLib]);
      Helpers__NS__remove([folderAbsPath, srcMainProject]);
      Helpers__NS__remove([folderAbsPath, 'src.*']);
      Helpers__NS__remove([folderAbsPath, 'index.*']);
      Helpers__NS__remove([folderAbsPath, cliDtsNpmPackage]);
      Helpers__NS__remove([folderAbsPath, cliJSMapNpmPackage]);
      HelpersTaon__NS__setValueToJSON(
        [folderAbsPath, packageJsonNpmLib],
        'scripts',
        {},
      );
    };

    if (
      releaseOptions.release.lib.doNotIncludeLibFiles &&
      releaseOptions.release.releaseType !== ReleaseType.LOCAL
    ) {
      clearLibFiles(releaseProjPath);
    }

    //#region remove lagacy file from final bundle
    Helpers__NS__remove([
      tmpProjNpmLibraryInNodeModulesAbsPath,
      fileName.package_json__devDependencies_json,
    ]);

    Helpers__NS__remove([
      tmpProjNpmLibraryInNodeModulesAbsPath,
      fileName.package_json__tnp_json5,
    ]);

    Helpers__NS__remove([
      tmpProjNpmLibraryInNodeModulesAbsPath,
      fileName.package_json__tnp_json,
    ]);

    Helpers__NS__remove([
      tmpProjNpmLibraryInNodeModulesAbsPath,
      fileName.tnpEnvironment_json,
    ]);

    Helpers__NS__remove([
      tmpProjNpmLibraryInNodeModulesAbsPath,
      taonJsonMainProject,
    ]);
    Helpers__NS__remove([tmpProjNpmLibraryInNodeModulesAbsPath, migrationsFromLib]);
    Helpers__NS__remove([tmpProjNpmLibraryInNodeModulesAbsPath, 'firedev.jsonc']);
    Helpers__NS__remove([tmpProjNpmLibraryInNodeModulesAbsPath, 'client']);
    //#endregion

    if (allowedToNpmReleases.includes(releaseOptions.release.releaseType)) {
      if (!releaseOptions.release.skipNpmPublish) {
        await projFromCompiled.releaseProcess.publishToNpm(
          tmpProjNpmLibraryInNodeModulesAbsPath,
          releaseOptions.release.autoReleaseUsingConfig,
        );
      }
    } else {
      if (releaseOptions.release.releaseType === ReleaseType.LOCAL) {
        //#region local release
        const releaseDest = this.project.pathFor([
          localReleaseMainProject,
          this.currentArtifactName,
          `${this.project.name}${suffixLatest}`,
        ]);
        Helpers__NS__remove(releaseDest, true);
        HelpersTaon__NS__copy(releaseProjPath, releaseDest);

        Helpers__NS__taskStarted(`Installing dependencies for local release...`);
        Helpers__NS__run(`npm install`, { cwd: releaseProjPath }).sync();
        Helpers__NS__taskDone(`Dependencies installed for local release.`);

        releaseProjPath = releaseDest;
        if (releaseOptions.release.lib.doNotIncludeLibFiles) {
          clearLibFiles(releaseProjPath);
        }
        this.removeNotNpmRelatedFilesFromReleaseBundle(releaseProjPath);

        if (releaseOptions.release.installLocally) {
          // console.log('SHOULD INSTALL LOCALLY');
          Helpers__NS__taskStarted('Linking local package globally...');
          Helpers__NS__run(`npm link`, { cwd: releaseProjPath }).sync();
          Helpers__NS__taskDone(`Done linking local package globally.

            Now you can use it globally via CLI:
            ${this.project.nameForCli} <command>

            `);
        }

        Helpers__NS__info(`Local release done: ${releaseDest}`);
        //#endregion
      }
    }

    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      releaseProjPath,
      releaseType,
      projectsReposToPushAndTag: [this.project.location],
    };
    //#endregion
  }
  //#endregion

  //#region clear partial
  async clearPartial(options?: EnvOptions): Promise<void> {
    // TODO make it better
    while (true) {
      try {
        rimraf.sync(this.project.pathFor(distMainProject) + '*');
        rimraf.sync(this.project.pathFor(folderName.tmp) + '*');
        return;
      } catch (error) {
        HelpersTaon__NS__pressKeyAndContinue(
          MESSAGES.SHUT_DOWN_FOLDERS_AND_DEBUGGERS,
        );
        continue;
      }
    }
  }

  /**
   * TODO
   * @param options
   * @returns
   */
  async clearLib(options: EnvOptions) {
    //#region @backendFunc
    Helpers__NS__taskStarted(`Cleaning project: ${this.project.genericName}`);

    if (
      this.project.typeIs(LibTypeEnum.UNKNOWN) ||
      this.project.typeIs(LibTypeEnum.UNKNOWN_NPM_PROJECT)
    ) {
      return;
    }

    while (true) {
      try {
        rimraf.sync(
          crossPlatformPath([this.project.location, folderName.tmp + '*']),
        );
        rimraf.sync(
          crossPlatformPath([this.project.location, folderName.dist + '*']),
        );
        try {
          this.project.removeFile(nodeModulesMainProject);
        } catch (error) {
          this.project.remove(nodeModulesMainProject);
        }
        this.project.removeFile(browserMainProject);
        this.project.removeFile(websqlMainProject);
        this.project.removeFile(browserMainProject + prodSuffix);
        this.project.removeFile(websqlMainProject + prodSuffix);
        this.project.removeFile(fileName.tnpEnvironment_json);
        if (this.project.framework.isCoreProject) {
          return;
        }

        glob
          .sync(`${this.project.location}/*${dotFileTemplateExt}`)
          .forEach(fileTemplate => {
            Helpers__NS__remove(fileTemplate);
            Helpers__NS__remove(fileTemplate.replace(dotFileTemplateExt, ''));
          });

        this.project.removeFile(fileName.tnpEnvironment_json);
        break;
      } catch (error) {
        HelpersTaon__NS__pressKeyAndContinue(
          MESSAGES.SHUT_DOWN_FOLDERS_AND_DEBUGGERS,
        );
      }
    }

    this.project.quickFixes.addMissingSrcFolderToEachProject();
    Helpers__NS__info(`Cleaning project: ${this.project.genericName} done`);

    if (options.recursiveAction) {
      for (const child of this.project.children) {
        await child.clear(options);
      }
    }
    //#endregion
  }

  //#endregion

  //#region unlink node_modules when tnp
  public unlinkNodeModulesWhenTnp(): void {
    //#region @backendFunc
    let shouldUnlinkNodeModules = false;
    if (config.frameworkName === 'tnp') {
      // TODO QUICK_FIX
      const { isCoreContainer, coreContainerFromNodeModules } =
        this.project.framework.containerDataFromNodeModulesLink;

      const isIncorrectLinkToNodeModules =
        !!coreContainerFromNodeModules &&
        this.project.taonJson.frameworkVersion !==
          coreContainerFromNodeModules.taonJson.frameworkVersion;

      shouldUnlinkNodeModules =
        isCoreContainer &&
        isIncorrectLinkToNodeModules &&
        this.project.nodeModules.isLink;
    }

    if (shouldUnlinkNodeModules) {
      this.project.nodeModules.unlinkNodeModulesWhenLinked();
    }

    //#region TODO LAST TEST THIS ON WINDOWS
    // if (
    //   !Helpers__NS__isSymlinkFileExitedOrUnexisted(this.project.nodeModules.path)
    // ) {
    //   Helpers__NS__taskStarted('Checking if node_modules folder is correct...');
    //   const minDepsLength = Object.keys(
    //     this.project.npmHelpers.packageJson.allDependencies,
    //   ).length;

    //   const notFullyInstalled =
    //     Helpers.findChildren(this.project.nodeModules.path, c => c).length <
    //     minDepsLength + 1;

    //   if (notFullyInstalled) {
    //     try {
    //       Helpers__NS__info(`Removing incorrect node_modules folder...`);
    //       Helpers__NS__removeSymlinks(this.project.nodeModules.path);
    //       Helpers__NS__remove(this.project.nodeModules.path, true);
    //     } catch (error) {}
    //   }
    //   Helpers__NS__taskDone('Checking if node_modules folder is correct DONE...');
    // }
    //#endregion

    //#endregion
  }
  //#endregion

  //#region private methods

  //#region private methods / fix release package.json
  private fixPackageJsonForRelease(
    releaseProjPath: string,
    newVersion: string,
  ): void {
    //#region @backendFunc
    const folderToFix = [
      browserMainProject,
      websqlMainProject,
      browserMainProject + prodSuffix,
      websqlMainProject + prodSuffix,
    ];

    for (const folder of folderToFix) {
      const folderAbsPath = crossPlatformPath([releaseProjPath, folder]);
      Helpers__NS__remove([folderAbsPath, dotNpmIgnoreMainProject]);

      // const rootPackageNameForChildBrowser = crossPlatformPath([
      //   this.project.nameForNpmPackage,
      //   folder,
      // ]);
      // const childName = ___NS__kebabCase(this.project.nameForNpmPackage);
      // const browserOrWebsql = ___NS__last(rootPackageNameForChildBrowser.split('/'));
      HelpersTaon__NS__setValueToJSON(
        [folderAbsPath, packageJsonNpmLib],
        'sideEffects',
        this.project.packageJson.sideEffects,
      );
      HelpersTaon__NS__setValueToJSON(
        [folderAbsPath, packageJsonNpmLib],
        'version',
        newVersion,
      );
    }

    const prodbrowsefoldersToFix = [
      browserMainProject + prodSuffix,
      websqlMainProject + prodSuffix,
    ];

    for (const folder of prodbrowsefoldersToFix) {
      const folderAbsPath = crossPlatformPath([releaseProjPath, folder]);
      HelpersTaon__NS__setValueToJSON(
        [folderAbsPath, packageJsonNpmLib],
        'name',
        crossPlatformPath([this.project.nameForNpmPackage, folder]),
      );
    }

    const folderToFixBackend = [
      libFromNpmPackage,
      libFromNpmPackage + prodSuffix,
    ];

    for (const folder of folderToFixBackend) {
      const folderAbsPath = crossPlatformPath([releaseProjPath, folder]);
      Helpers__NS__remove([folderAbsPath, dotNpmIgnoreMainProject]);

      const packageName = crossPlatformPath([
        this.project.nameForNpmPackage,
        folder,
      ]);

      const pjBackendLib = {
        name: packageName,
        version: newVersion,
        // ! TODO @LAST ADD ESM SUPPORT
        // sideEffects: this.project.packageJson.sideEffects,
        // module: 'fesm2022/json10-writer-browser.mjs',
        // typings: 'types/json10-writer-browser.d.ts',
        // exports: {
        //   './package.json': {
        //     default: './package.json',
        //   },
        //   '.': {
        //     types: './types/json10-writer-browser.d.ts',
        //     default: './fesm2022/json10-writer-browser.mjs',
        //   },
        // },
      };
      Helpers__NS__writeJson([folderAbsPath, packageJsonNpmLib], pjBackendLib);
    }

    //#endregion
  }
  //#endregion

  //#region private methods / run after release js code actions
  private async runAfterReleaseJsCodeActions(
    releaseAbsPath: string,
    releaseOptions: EnvOptions,
  ): Promise<void> {
    //#region cli
    if (releaseOptions.release.cli.includeNodeModules) {
      // await this.project.nodeModules.removeOwnPackage(async () => {
      await this.backendIncludeNodeModulesInCompilation(
        releaseAbsPath,
        releaseOptions.release.cli.minify,
        releaseOptions.build.prod,
      );
      // });
    }

    const reservedNames = ['reservedExpSec', 'reservedExpOne'];

    if (releaseOptions.release.cli.uglify) {
      await this.backendMinifyCode({
        releaseAbsPath,
        strategy: 'cli-only',
        reservedNames,
        compress: releaseOptions.release.cli.compress,
      });
    }

    if (releaseOptions.release.cli.obscure) {
      await this.backendObscureCode({
        releaseAbsPath,
        strategy: 'cli-only',
        reservedNames,
      });
    }
    //#endregion

    //#region lib
    if (releaseOptions.release.lib.removeDts) {
      await this.backendReleaseRemoveDts(releaseAbsPath);
    }

    if (releaseOptions.release.lib.uglifyFileByFile) {
      await this.backendMinifyCode({
        releaseAbsPath,
        strategy: 'lib-only',
        reservedNames,
        compress: releaseOptions.release.lib.compress,
      });
    }

    if (releaseOptions.release.lib.obscureFileByFile) {
      await this.backendObscureCode({
        releaseAbsPath,
        strategy: 'lib-only',
        reservedNames,
      });
    }
    //#endregion

    // await this.backendRemoveJsMapsFrom(releaseAbsPath);
  }

  //#endregion

  //#region private methods / prepare package json for release publish
  private preparePackageJsonForReleasePublish(relaseAbsPath: string): void {
    //#region @backendFunc
    const pathInRelease = crossPlatformPath([relaseAbsPath, packageJsonNpmLib]);
    HelpersTaon__NS__copyFile(this.project.packageJson.path, pathInRelease);

    const pj = new BasePackageJson({
      cwd: relaseAbsPath,
    });
    const dependencies = pj.dependencies;
    pj.setDependencies({});
    if (this.project.taonJson.dependenciesNamesForNpmLib) {
      pj.setDependencies(
        [
          ...this.project.taonJson.dependenciesNamesForNpmLib,
          ...this.project.taonJson.isomorphicDependenciesForNpmLib,
        ].reduce((a, b) => {
          return { ...a, [b]: dependencies[b] };
        }, {}),
      );
    }

    if (this.project.taonJson.peerDependenciesNamesForNpmLib) {
      pj.setPeerDependencies(
        this.project.taonJson.peerDependenciesNamesForNpmLib.reduce((a, b) => {
          return { ...a, [b]: dependencies[b] };
        }, {}),
      );
    }

    if (this.project.taonJson.devDependenciesNamesForNpmLib) {
      pj.setDevDependencies(
        this.project.taonJson.devDependenciesNamesForNpmLib.reduce((a, b) => {
          return { ...a, [b]: dependencies[b] };
        }, {}),
      );
    }

    const optionalDeps = pj.optionalDependencies;

    if (this.project.taonJson.optionalDependenciesNamesForNpmLib) {
      pj.setOptionalDependencies(
        this.project.taonJson.optionalDependenciesNamesForNpmLib.reduce(
          (a, b) => {
            return { ...a, [b]: optionalDeps[b] };
          },
          {},
        ),
      );
    }

    if (!pj.repository) {
      pj.setRepository({
        type: 'git',
        url: HelpersTaon__NS__git__NS__originSshToHttp(this.project.git.originURL),
      });
    }

    //#endregion
  }
  //#endregion

  //#region private methods / remove not npm releated files from release bundle
  private removeNotNpmRelatedFilesFromReleaseBundle(
    releaseAbsPath: string,
  ): void {
    //#region @backendFunc
    Helpers__NS__remove(`${releaseAbsPath}/${appFromSrc}*`); // QUICK_FIX
    Helpers__NS__remove(`${releaseAbsPath}/${testsFromSrc}*`); // QUICK_FIX
    Helpers__NS__remove(`${releaseAbsPath}/${srcMainProject}`, true); // QUICK_FIX
    // Helpers__NS__removeFileIfExists(`${relaseAbsPath}/source`);

    // regenerate src.d.ts
    Helpers__NS__writeFile(
      crossPlatformPath([releaseAbsPath, 'src.d.ts']),
      `
${THIS_IS_GENERATED_INFO_COMMENT}
export * from './${libFromSrc}';
${THIS_IS_GENERATED_INFO_COMMENT}
// please use command: taon build:watch to see here links for your globally builded lib code files
${THIS_IS_GENERATED_INFO_COMMENT}
    `.trimStart(),
    );

    //#endregion
  }

  //#endregion

  //#region private methods / fix terminal output paths
  private async outputFixNgLibBuild(buildOptions: EnvOptions): Promise<any> {
    return {
      // askToTryAgainOnError: true,
      exitOnErrorCallback: async code => {
        if (buildOptions.release.releaseType) {
          throw 'Typescript compilation lib error';
        } else {
          Helpers__NS__error(
            `[${config.frameworkName}] Typescript compilation lib error (code=${code})`,
            false,
            true,
          );
        }
      },
      outputLineReplace: (line: string) => {
        // line = UtilsString.removeChalkSpecialChars(line);
        if (line.startsWith('WARNING: postcss-url')) {
          return ' --- [taon] IGNORED WARN ---- ';
        }
        line = line.replace(
          `projects/${this.project.name}/${srcMainProject}/`,
          `./${srcMainProject}/`,
        );

        if (line.includes(`../../${nodeModulesMainProject}/`)) {
          line = line.replace(
            `../../${nodeModulesMainProject}/`,
            `./${nodeModulesMainProject}/`,
          );
        }

        // ../../../../tmpSrcDistWebsql/lib/layout-proj-ng-related/layout-proj-ng-related.component.scss
        if (line.includes(`../../../../${tmpSrcDistWebsql + prodSuffix}/`)) {
          line = line.replace(
            `../../../../${tmpSrcDistWebsql + prodSuffix}/`,
            `./${srcMainProject}/`,
          );
        }

        if (line.includes(`../../../../${tmpSrcDistWebsql}/`)) {
          line = line.replace(
            `../../../../${tmpSrcDistWebsql}/`,
            `./${srcMainProject}/`,
          );
        }

        if (line.includes(`../../../../${tmpSrcDist + prodSuffix}/`)) {
          line = line.replace(
            `../../../../${tmpSrcDist + prodSuffix}/`,
            `./${srcMainProject}/`,
          );
        }

        if (line.includes(`../../../../${tmpSrcDist}/`)) {
          line = line.replace(
            `../../../../${tmpSrcDist}/`,
            `./${srcMainProject}/`,
          );
        }

        if (line.search(`/${srcMainProject}/${libs}/`) !== -1) {
          const [__, ___, ____, moduleName] = line.split('/');
          // console.log({
          //   moduleName,
          //   standalone: 'inlib'
          // })
          return line.replace(
            `/${srcMainProject}/${libs}/${moduleName}/`,
            `/${moduleName}/${srcMainProject}/${libFromSrc}/`,
          );
        }

        return line;
      },
    } as CoreModels__NS__ExecuteOptions;
  }
  //#endregion

  //#region private methods / pack resources
  private packResource(releaseDistFolder: string): void {
    //#region @backendFunc
    if (!fse.existsSync(releaseDistFolder)) {
      fse.mkdirSync(releaseDistFolder);
    }

    [...this.project.taonJson.resources].forEach(res => {
      //  copy resource to org build and copy shared assets
      const file = path.join(this.project.location, res);
      const dest = path.join(releaseDistFolder, res);

      if (!fse.existsSync(file)) {
        throw new Error(
          `[${config.frameworkName}][lib-project] Resource file: ${chalk.bold(
            path.basename(file),
          )} does not ` +
            `exist in "${this.project.genericName}"  (package.json > resources[])
        `,
        );
      }

      if (fse.lstatSync(file).isDirectory()) {
        // console.log('IS DIRECTORY', file)
        // console.log('IS DIRECTORY DEST', dest)
        const filter = src => {
          return !/.*node_modules.*/g.test(src);
        };
        HelpersTaon__NS__copy(file, dest, { filter });
      } else {
        // console.log('IS FILE', file)
        fse.copyFileSync(file, dest);
      }
    });
    Helpers__NS__logInfo(`Resources copied to release folder: ${distMainProject}`);
    //#endregion
  }
  //#endregion

  //#region private methods / copy essential files
  private copyEssentialFilesTo(toDestinations: string[]): void {
    //#region @backendFunc
    this.copyWhenExist(binMainProject, toDestinations);

    this.copyWhenExist(dotNpmrcMainProject, toDestinations);
    this.copyWhenExist(dotNpmIgnoreMainProject, toDestinations);
    this.copyWhenExist(dotGitIgnoreMainProject, toDestinations);
    //#endregion
  }
  //#endregion

  //#region private methods / copy when exists
  private copyWhenExist(relativePath: string, destinations: string[]): void {
    //#region @backendFunc
    const absPath = crossPlatformPath([this.project.location, relativePath]);

    for (let index = 0; index < destinations.length; index++) {
      const dest = crossPlatformPath([destinations[index], relativePath]);
      if (Helpers__NS__exists(absPath)) {
        if (Helpers__NS__isFolder(absPath)) {
          Helpers__NS__remove(dest, true);
          HelpersTaon__NS__copy(absPath, dest, { recursive: true });
        } else {
          HelpersTaon__NS__copyFile(absPath, dest);
        }
      } else {
        Helpers__NS__log(`[isomorphic-lib][copyWhenExist] not exists: ${absPath}`);
      }
    }
    //#endregion
  }
  //#endregion

  //#region private methods / link when exists
  private linkWhenExist(relativePath: string, destinations: string[]): void {
    //#region @backendFunc
    let absPath = path.join(this.project.location, relativePath);

    if (Helpers__NS__exists(absPath) && Helpers__NS__isExistedSymlink(absPath)) {
      absPath = HelpersTaon__NS__pathFromLink(absPath);
    }

    for (let index = 0; index < destinations.length; index++) {
      const dest = crossPlatformPath([destinations[index], relativePath]);
      if (Helpers__NS__exists(absPath)) {
        Helpers__NS__remove(dest, true);
        Helpers__NS__createSymLink(absPath, dest);
      }
    }
    //#endregion
  }
  //#endregion

  //#region private methods / compile/cliBuildUglify backend code
  private backendMinifyCode(options: {
    strategy: 'lib-and-cli' | 'cli-only' | 'lib-only';
    releaseAbsPath: string;
    reservedNames: string[];
    compress: boolean;
  }): void {
    //#region @backendFunc
    const { strategy, releaseAbsPath, reservedNames, compress } = options;
    Helpers__NS__taskStarted(`Minifying started , strategy: ${strategy}`);
    const cliJsPath = crossPlatformPath([releaseAbsPath, 'cli.js']);

    const files =
      strategy === 'cli-only'
        ? [cliJsPath]
        : [
            ...(strategy === 'lib-and-cli' ? [cliJsPath] : []),
            ...Helpers__NS__filesFrom([releaseAbsPath, 'lib'], true).filter(f =>
              f.endsWith('.js'),
            ),
          ];

    for (const fileAbsPath of files) {
      const uglifiedTempPath = crossPlatformPath([
        path.dirname(fileAbsPath),
        path.basename(fileAbsPath).replace('.js', '') + '.min.js',
      ]);
      Helpers__NS__logInfo(
        `minifying ${fileAbsPath} to ${path.basename(uglifiedTempPath)}`,
      );
      const command =
        `npm-run uglifyjs ${fileAbsPath} ${compress ? '--compress' : ''} ` +
        ` --output ${uglifiedTempPath} -b` +
        ` --mangle reserved=[${reservedNames.map(n => `'${n}'`).join(',')}]`;
      // + ` --mangle-props reserved=[${reservedNames.join(',')}]` // it breakes code
      this.project.run(command, { biggerBuffer: false }).sync();
      Helpers__NS__removeFileIfExists(fileAbsPath);
      HelpersTaon__NS__copyFile(uglifiedTempPath, fileAbsPath);
      Helpers__NS__removeFileIfExists(uglifiedTempPath);
    }
    Helpers__NS__taskDone(`Minifying done , strategy: ${strategy}`);
    //#endregion
  }
  //#endregion

  //#region private methods / compile/cliBuildObscure backend code
  private backendObscureCode(options: {
    strategy: 'lib-and-cli' | 'cli-only' | 'lib-only';
    releaseAbsPath: string;
    reservedNames: string[];
  }): void {
    //#region @backendFunc
    const { strategy, releaseAbsPath, reservedNames } = options;
    const cliJsPath = crossPlatformPath([releaseAbsPath, 'cli.js']);

    const files =
      strategy === 'cli-only'
        ? [cliJsPath]
        : [
            ...(strategy === 'lib-and-cli' ? [cliJsPath] : []),
            ...Helpers__NS__filesFrom([releaseAbsPath, 'lib'], true).filter(f =>
              f.endsWith('.js'),
            ),
          ];

    for (const fileAbsPath of files) {
      const uglifiedTempPath = crossPlatformPath([
        path.dirname(fileAbsPath),
        path.basename(fileAbsPath).replace('.js', '') + '.min.js',
      ]);
      const command =
        `npm-run javascript-obfuscator ${fileAbsPath} ` +
        ` --output ${uglifiedTempPath}` +
        ` --target node` +
        ` --string-array-rotate true` +
        // + ` --stringArray true`
        ` --string-array-encoding base64` +
        ` --reserved-names '${reservedNames.join(',')}'` +
        ` --reserved-strings '${reservedNames.join(',')}'`;

      this.project.run(command, { biggerBuffer: false }).sync();
      Helpers__NS__removeFileIfExists(fileAbsPath);
      HelpersTaon__NS__copyFile(uglifiedTempPath, fileAbsPath);
      Helpers__NS__removeFileIfExists(uglifiedTempPath);
    }

    //#endregion
  }
  //#endregion

  //#region getters & methods / remove (m)js.map files from release
  /**
   * because of that
   * In vscode there is a mess..
   * TODO
   */
  private async backendRemoveJsMapsFrom(
    absPathReleaseDistFolder: string,
  ): Promise<void> {
    //#region @backendFunc
    Helpers__NS__getFilesFrom([absPathReleaseDistFolder, libFromCompiledDist], {
      recursive: true,
    })
      .filter(f => f.endsWith('.js.map') || f.endsWith('.mjs.map'))
      .forEach(f => Helpers__NS__removeFileIfExists(f));

    Helpers__NS__removeFileIfExists([absPathReleaseDistFolder, cliJSMapNpmPackage]);
    //#endregion
  }
  //#endregion

  //#region private methods / include remove dts
  /**
   * remove dts files from release
   */
  private async backendReleaseRemoveDts(
    releaseFolderAbsPath: string,
  ): Promise<void> {
    //#region @backendFunc

    Helpers__NS__getFilesFrom([releaseFolderAbsPath, libFromCompiledDist], {
      recursive: true,
    })
      .filter(f => f.endsWith('.d.ts'))
      .forEach(f => Helpers__NS__removeFileIfExists(f));

    Helpers__NS__removeFileIfExists([releaseFolderAbsPath, cliDtsNpmPackage]);

    Helpers__NS__writeFile(
      [releaseFolderAbsPath, `${libFromSrc}/${indexDtsNpmPackage}`],
      `export declare const dummy${new Date().getTime()};`,
    );
    //#endregion
  }
  //#endregion

  //#region private methods / build info
  private async creteBuildInfoFile(initOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    initOptions = EnvOptions.from(initOptions);
    if (this.project.framework.isStandaloneProject) {
      const dest = this.project.pathFor([
        srcMainProject,
        libFromSrc,
        TaonGeneratedFiles.build_info_generated_ts,
      ]);
      Helpers__NS__writeFile(
        dest,
        `${THIS_IS_GENERATED_INFO_COMMENT}
/**
 *  Autogenerated by current cli tool
 */
export const BUILD_FRAMEWORK_CLI_NAME = '${config.frameworkName}';
/**
 *  This value can be change in taon.jsonc (appId)
 */
export const APP_ID = '${initOptions.appId}';
/**
 *  Autogenerated by current cli tool
 */
export const BUILD_BASE_HREF = '${initOptions.build?.baseHref || ''}';
/**
 *  This value can be change in taon.jsonc (overrideNpmName)
 */
export const PROJECT_NPM_NAME = '${this.project.nameForNpmPackage}';
/**
 * Taon version from you project taon.json
 */
export const CURRENT_PACKAGE_TAON_VERSION = '${this.project.taonJson.frameworkVersion}';
/**
 *  Autogenerated by current cli tool. Use *${config.frameworkName} release* to bump version.
 */
export const CURRENT_PACKAGE_VERSION = '${
          initOptions.release.releaseType &&
          initOptions.release.resolvedNewVersion
            ? initOptions.release.resolvedNewVersion
            : this.project.packageJson.version
        }';
${THIS_IS_GENERATED_INFO_COMMENT}
      `,
      );
    }

    //#endregion
  }
  //#endregion

  //#region private methods / show message when build lib done for smart container
  private showMesageWhenBuildLibDone(buildOptions: EnvOptions): void {
    //#region @backendFunc
    if (buildOptions.release.releaseType) {
      Helpers__NS__logInfo(
        `${buildOptions.build.prod ? '[PROD]' : '[DEV]'} Lib build part done...  `,
      );
      return;
    }
    const buildLibDone = `LIB BUILD DONE.. `;
    const ifapp =
      'if you want to start app build -> please run in other terminal command:';

    // const bawOrba = buildOptions.watch ? 'baw' : 'ba';
    const bawOrbaLong = buildOptions.build.watch
      ? ' build:app:watch '
      : ' build:app ';
    const bawOrbaLongWebsql = buildOptions.build.watch
      ? 'build:app:watch --websql'
      : 'build:app --websql';

    Helpers__NS__taskDone(`${chalk.underline(`${buildLibDone}...`)}`);
    Helpers__NS__success(`

      ${ifapp}

      ${chalk.bold(config.frameworkName + bawOrbaLong)}
      or
      ${config.frameworkName} ${bawOrbaLongWebsql}
      `);

    //#endregion
  }
  //#endregion

  //#region private methods / include node_modules in compilation
  async backendIncludeNodeModulesInCompilation(
    releaseAbsLocation: string,
    minify: boolean,
    prod: boolean,
  ): Promise<void> {
    //#region @backendFunc

    const destCliTSProd = crossPlatformPath([
      releaseAbsLocation,
      indexTsProd,
    ]);

    let destCli = crossPlatformPath([releaseAbsLocation, indexJSNpmPackage]);
    const destCliMin = crossPlatformPath([releaseAbsLocation, cliJSNpmPackage]);

    if (prod) {
      Helpers__NS__writeFile(destCliTSProd, `export * from './${libFromCompiledDist}${prodSuffix}';\n`);
      destCli = destCliTSProd;
    }

    await HelpersTaon__NS__bundleCodeIntoSingleFile(destCli, destCliMin, {
      minify,
      additionalExternals: [
        ...this.project.taonJson.additionalExternalsFor(
          ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        ),
      ],
      additionalReplaceWithNothing: [
        ...this.project.taonJson.additionalReplaceWithNothingFor(
          ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        ),
      ],
    });

    // copy wasm file for dest
    const wasmfileSource = crossPlatformPath([
      this.project.ins
        .by(LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion)
        .pathFor([
          templateFolderForArtifact(this.currentArtifactName),
          srcNgProxyProject,
          assetsFromNgProj,
          CoreAssets.sqlWasmFile,
        ]),
    ]);

    const wasmfileDest = crossPlatformPath([
      releaseAbsLocation,
      CoreAssets.sqlWasmFile,
    ]);
    HelpersTaon__NS__copyFile(wasmfileSource, wasmfileDest);

    const destStartJS = crossPlatformPath([
      releaseAbsLocation,
      `${binMainProject}/start.js`,
    ]);
    Helpers__NS__writeFile(
      destStartJS,
      `console.log('<<< USING BUNDLED CLI >>>');global.taonUsingBundledCliMode = true;` +
        `\n${Helpers__NS__readFile(destStartJS)}`,
    );

    Helpers__NS__writeFile(
      crossPlatformPath([releaseAbsLocation, BundledFiles.CLI_README_MD]),
      `# ${this.project.name} CLI\n\n
## Installation as global tool
\`\`\`bash
npm link
\`\`\`
    `,
    );
    //#endregion
  }
  //#endregion

  //#endregion
}