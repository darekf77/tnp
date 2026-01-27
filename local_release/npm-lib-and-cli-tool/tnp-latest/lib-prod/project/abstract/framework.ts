//#region imports
import { backendNodejsOnlyFiles, config, extAllowedToExportAndReplaceTSJSCodeFiles, frontendFiles, LibTypeEnum, notNeededForExportFiles, TAGS, taonPackageName, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, chalk, fse, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds, UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor } from 'tnp-core/lib-prod';
import { fileName } from 'tnp-core/lib-prod';
import { BaseFeatureForProject, UtilsNpm__NS__checkIfPackageVersionAvailable, UtilsNpm__NS__clearVersion, UtilsNpm__NS__fixMajorVerNumber, UtilsNpm__NS__getLastMajorVersions, UtilsNpm__NS__getLastMinorVersionsForMajor, UtilsNpm__NS__getLastVersions, UtilsNpm__NS__getLatestVersionFromNpm, UtilsNpm__NS__getVerObj, UtilsNpm__NS__isProperVersion, UtilsNpm__NS__isSpecialVersion, UtilsNpm__NS__VersionObjectNpm, UtilsTypescript__NS__addBelowPlaceholder, UtilsTypescript__NS__addOrUpdateImportIfNotExists, UtilsTypescript__NS__calculateRelativeImportPath, UtilsTypescript__NS__clearRequireCacheRecursive, UtilsTypescript__NS__collapseFluentChains, UtilsTypescript__NS__DeepWritable, UtilsTypescript__NS__eslintFixAllFilesInsideFolder, UtilsTypescript__NS__eslintFixAllFilesInsideFolderAsync, UtilsTypescript__NS__eslintFixFile, UtilsTypescript__NS__ExportedThirdPartyNamespaces, UtilsTypescript__NS__ExportInfo, UtilsTypescript__NS__exportsFromContent, UtilsTypescript__NS__exportsFromFile, UtilsTypescript__NS__exportsRedefinedFromContent, UtilsTypescript__NS__exportsRedefinedFromFile, UtilsTypescript__NS__extractAngularComponentSelectors, UtilsTypescript__NS__extractClassNameFromString, UtilsTypescript__NS__extractClassNamesFromFile, UtilsTypescript__NS__extractDefaultClassNameFromFile, UtilsTypescript__NS__extractDefaultClassNameFromString, UtilsTypescript__NS__extractRenamedImportsOrExport, UtilsTypescript__NS__fixHtmlTemplatesInDir, UtilsTypescript__NS__FlattenMapping, UtilsTypescript__NS__formatAllFilesInsideFolder, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__GatheredExportsMap, UtilsTypescript__NS__gatherExportsMapFromIndex, UtilsTypescript__NS__getCleanImport, UtilsTypescript__NS__getTaonContextFromContent, UtilsTypescript__NS__getTaonContextsNamesFromFile, UtilsTypescript__NS__hoistTrailingChainComments, UtilsTypescript__NS__injectImportsIntoImportsRegion, UtilsTypescript__NS__migrateFromNgModulesToStandaloneV21, UtilsTypescript__NS__normalizeBrokenLines, UtilsTypescript__NS__NSSPLITNAMESAPCE, UtilsTypescript__NS__ParsedTsDiagnostic, UtilsTypescript__NS__parseTsDiagnostic, UtilsTypescript__NS__recognizeImportsFromContent, UtilsTypescript__NS__recognizeImportsFromFile, UtilsTypescript__NS__RedefinedExportInfo, UtilsTypescript__NS__refactorClassToNamespace, UtilsTypescript__NS__removeRegionByName, UtilsTypescript__NS__removeTaggedArrayObjects, UtilsTypescript__NS__removeTaggedImportExport, UtilsTypescript__NS__removeTaggedLines, UtilsTypescript__NS__RenamedImportOrExport, UtilsTypescript__NS__replaceImportNamespaceWithWithExplodedNamespace, UtilsTypescript__NS__replaceNamespaceWithLongNames, UtilsTypescript__NS__setValueToVariableInTsFile, UtilsTypescript__NS__splitNamespaceForContent, UtilsTypescript__NS__splitNamespaceForFile, UtilsTypescript__NS__SplitNamespaceResult, UtilsTypescript__NS__transformComponentStandaloneOption, UtilsTypescript__NS__transformFlatImports, UtilsTypescript__NS__TsImportExport, UtilsTypescript__NS__updateSplitNamespaceReExports, UtilsTypescript__NS__updateSplitNamespaceResultMapReplaceObj, UtilsTypescript__NS__wrapContentClassMembersDecoratorsWithRegion, UtilsTypescript__NS__wrapFirstImportsInImportsRegion, UtilsTypescript__NS__wrapWithComment } from 'tnp-helpers/lib-prod';
import {
  createSourceFile,
  isClassDeclaration,
  ScriptTarget,
  Node,
  forEachChild,
} from 'typescript';

import {
  appTsFromSrc,
  containerPrefix,
  libFromSrc,
  migrationIndexAutogeneratedTsFileRelativeToSrcPath,
  nodeModulesMainProject,
  srcFromTaonImport,
  srcMainProject,
  TaonFileExtension,
  THIS_IS_GENERATED_INFO_COMMENT,
  tmpLocalCopytoProjDist,
} from '../../constants';
import { Models__NS__CreateJsonSchemaOptions, Models__NS__DocsConfig, Models__NS__NewSiteOptions, Models__NS__PsListInfo, Models__NS__RootArgsType, Models__NS__TaonArtifactInclude, Models__NS__TaonAutoReleaseItem, Models__NS__TaonContext, Models__NS__TaonJson, Models__NS__TaonJsonContainer, Models__NS__TaonJsonStandalone, Models__NS__TaonLoaderConfig, Models__NS__TaonLoaders, Models__NS__TestTypeTaon, Models__NS__TestTypeTaonArr, Models__NS__TscCompileOptions } from '../../models';
import { EnvOptions } from '../../options';

import type { Project } from './project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class Framework extends BaseFeatureForProject<Project> {
  //#region is unknown npm project
  get isUnknownNpmProject(): boolean {
    //#region @backendFunc
    return this.project.typeIs(LibTypeEnum.UNKNOWN_NPM_PROJECT);
    //#endregion
  }
  //#endregion

  //#region is tnp
  /**
   * TODO make this more robust
   */
  get isTnp(): boolean {
    //#region @backendFunc
    if (this.project.typeIsNot(LibTypeEnum.ISOMORPHIC_LIB)) {
      return false;
    }
    return this.project.location === this.project.ins.Tnp.location;
    //#endregion
  }
  //#endregion

  //#region is core project
  /**
   * Core project with basic tested functionality
   */
  get isCoreProject(): boolean {
    //#region @backendFunc
    return this.project.taonJson.isCoreProject;
    //#endregion
  }
  //#endregion

  //#region is container or workspace with linked projects
  get isContainerWithLinkedProjects(): boolean {
    //#region @backendFunc
    return (
      this.isContainer && this.project.linkedProjects.linkedProjects.length > 0
    );
    //#endregion
  }
  //#endregion

  //#region is container
  /**
   * is normal or smart container
   */
  get isContainer(): boolean {
    //#region @backendFunc
    return this.project.typeIs(LibTypeEnum.CONTAINER);
    //#endregion
  }
  //#endregion

  //#region is container core project
  get isContainerCoreProject(): boolean {
    //#region @backendFunc
    return this.isContainer && this.isCoreProject;
    //#endregion
  }
  //#endregion

  //#region is container child
  get isContainerChild(): boolean {
    //#region @backendFunc
    return (
      !!this.project.parent && this.project.parent.typeIs(LibTypeEnum.CONTAINER)
    );
    //#endregion
  }
  //#endregion

  //#region is standalone project
  /**
   * Standalone project ready for publish on npm
   * Types of standalone project:
   * - isomorphic-lib : backend/fronded ts library with server,app preview
   * - angular-lib: frontend ui lib with angular preview
   */
  get isStandaloneProject(): boolean {
    //#region @backendFunc
    if (this.project.typeIs(LibTypeEnum.UNKNOWN)) {
      return false;
    }
    return !this.isContainer && !this.isUnknownNpmProject;
    //#endregion
  }
  //#endregion

  //#region get framework version
  public get frameworkVersion(): CoreModels__NS__FrameworkVersion {
    //#region @backendFunc
    return this.project.taonJson.frameworkVersion;
    //#endregion
  }
  //#endregion

  //#region get framework version minus 1
  public get frameworkVersionMinusOne(): CoreModels__NS__FrameworkVersion {
    //#region @backendFunc
    const curr = Number(
      ___NS__isString(this.frameworkVersion) &&
        this.frameworkVersion.replace('v', ''),
    );
    if (!isNaN(curr) && curr >= 2) {
      return `v${curr - 1}` as CoreModels__NS__FrameworkVersion;
    }
    return 'v1';
    //#endregion
  }
  //#endregion

  //#region framework version equals
  public frameworkVersionEquals(version: CoreModels__NS__FrameworkVersion): boolean {
    //#region @backendFunc
    const ver = Number(___NS__isString(version) && version.replace('v', ''));

    const curr = Number(
      ___NS__isString(this.frameworkVersion) &&
        this.frameworkVersion.replace('v', ''),
    );
    return !isNaN(ver) && !isNaN(curr) && curr === ver;
    //#endregion
  }
  //#endregion

  //#region framework version at least
  public frameworkVersionAtLeast(
    version: CoreModels__NS__FrameworkVersion,
  ): boolean {
    //#region @backendFunc
    const ver = Number(___NS__isString(version) && version.replace('v', ''));
    const curr = Number(
      ___NS__isString(this.frameworkVersion) &&
        this.frameworkVersion.replace('v', ''),
    );
    return !isNaN(ver) && !isNaN(curr) && curr >= ver;
    //#endregion
  }
  //#endregion

  //#region private methods / add missing components/modules
  public migrateFromNgModulesToStandaloneV21(tsFileContent: string): string {
    if (this.project.framework.frameworkVersionLessThan('v21')) {
      return tsFileContent;
    }
    return UtilsTypescript__NS__migrateFromNgModulesToStandaloneV21(
      tsFileContent,
      ___NS__upperFirst(___NS__camelCase(this.project.name)),
    );
  }

  public replaceModuleAndComponentName(tsFileContent: string): string {
    //#region @backendFunc
    if (this.project.framework.frameworkVersionAtLeast('v21')) {
      return tsFileContent;
    }
    // Parse the source file using TypeScript API
    const projectName = this.project.name;
    const sourceFile = createSourceFile(
      'temp.ts',
      tsFileContent,
      ScriptTarget.Latest,
      true,
    );

    let moduleName: string | null = null;
    let componentName: string | null = null;
    let tooMuchToProcess = false;

    const newComponentName = `${___NS__upperFirst(
      ___NS__camelCase(projectName),
    )}Component`;
    const newModuleName = `${___NS__upperFirst(___NS__camelCase(projectName))}Module`;
    let orignalComponentClassName: string;
    let orignalModuleClassName: string;

    // Visitor to analyze the AST
    const visit = (node: Node) => {
      if (isClassDeclaration(node) && node.name) {
        const className = node.name.text;

        if (className.endsWith('Module')) {
          if (moduleName) {
            // More than one module found, return original content
            tooMuchToProcess = true;
            return;
          }
          moduleName = className;
          orignalModuleClassName = className;
        }

        if (className.endsWith('Component')) {
          if (componentName) {
            // More than one component found, return original content
            tooMuchToProcess = true;
            return;
          }
          componentName = className;
          orignalComponentClassName = className;
        }
      }

      forEachChild(node, visit);
    };

    visit(sourceFile);

    if (tooMuchToProcess) {
      return tsFileContent;
    }

    const moduleTempalte =
      [`\n//#re`, `gion  ${this.project.name} module `].join('') +
      ['\n//#re', 'gion @bro', 'wser'].join('') +
      `\n@NgModule({ declarations: [${newComponentName}],` +
      ` imports: [CommonModule], exports: [${newComponentName}] })\n` +
      `export class ${newModuleName} {}` +
      ['\n//#endre', 'gion'].join('') +
      ['\n//#endre', 'gion'].join('');

    const componentTemplate =
      [`\n//#re`, `gion  ${this.project.name} component `].join('') +
      ['\n//#re', 'gion @bro', 'wser'].join('') +
      `\n@Component({
      standalone: false,
      template: \`

      hello world fromr ${this.project.name}

      \` })` +
      `\nexport class ${newComponentName} {}` +
      ['\n//#endre', 'gion'].join('') +
      ['\n//#endre', 'gion'].join('');

    if (orignalModuleClassName) {
      tsFileContent = tsFileContent.replace(
        new RegExp(orignalModuleClassName, 'g'),
        newModuleName,
      );
      return tsFileContent;
    }

    if (orignalComponentClassName) {
      tsFileContent = tsFileContent.replace(
        new RegExp(orignalComponentClassName, 'g'),
        newComponentName,
      );
      return tsFileContent;
    }

    if (moduleName === null && componentName === null) {
      // No module or component found, append new ones
      return (
        tsFileContent + '\n\n' + componentTemplate + '\n\n' + moduleTempalte
      );
    }

    if (moduleName === null && componentName !== null) {
      // append only module
      return tsFileContent + '\n\n' + moduleTempalte;
    }

    if (moduleName !== null && componentName === null) {
      // Either module or component is missing; leave content unchanged
      return tsFileContent + '\n\n' + componentTemplate;
    }

    return tsFileContent;
    //#endregion
  }
  //#endregion

  //#region fix core content
  fixCoreContent = (appTsContent: string): string => {
    const project = this.project;
    const coreName = ___NS__upperFirst(___NS__camelCase(project.name));
    const coreNameKebab = ___NS__kebabCase(project.name);
    return appTsContent
      .replace(
        new RegExp(
          `IsomorphicLibV${project.framework.frameworkVersion.replace(
            'v',
            '',
          )}`,
          'g',
        ),
        `${coreName}`,
      )
      .replace(
        new RegExp(
          `isomorphic-lib-v${project.framework.frameworkVersion.replace(
            'v',
            '',
          )}`,
          'g',
        ),
        `${coreNameKebab}`,
      );
  };
  //#endregion

  //#region recreate vars scss
  recreateVarsScss(initOptions: EnvOptions): void {
    //#region @backendFunc
    if (!this.project.typeIs(LibTypeEnum.ISOMORPHIC_LIB)) {
      return;
    }

    //#region recreate vars.scss file
    // TODO QUICK_FIX this will work in app - only if app is build with same base-href
    this.project.writeFile(
      'src/vars.scss',
      `${THIS_IS_GENERATED_INFO_COMMENT}
  // CORE ASSETS BASENAME - use it only for asset from core container
  $basename: '${
    (initOptions.build.baseHref?.startsWith('./')
      ? initOptions.build.baseHref.replace('./', '/')
      : initOptions.build.baseHref) || '/'
  }';
  $website_title: '${initOptions.website.title}';
  $website_domain: '${initOptions.website.domain}';
  $project_npm_name: '${this.project.nameForNpmPackage}';
  ${THIS_IS_GENERATED_INFO_COMMENT}
  `,
    );
    //#endregion

    //#endregion
  }
  //#endregion

  //#region prevent not existed component and module in app.ts
  preventNotExistedComponentAndModuleInAppTs(): void {
    //#region @backendFunc
    const relativeAppTs = crossPlatformPath([srcMainProject, appTsFromSrc]);
    const appFile = this.project.pathFor(relativeAppTs);

    let contentAppFile = Helpers__NS__readFile(appFile);
    let newContentAppFile = contentAppFile;

    if (this.project.framework.frameworkVersionAtLeast('v21')) {
      // newContentAppFile =
      //   this.project.framework.migrateFromNgModulesToStandaloneV21(
      //     contentAppFile,
      //   );
    } else {
      newContentAppFile =
        this.project.framework.replaceModuleAndComponentName(contentAppFile);
    }

    Helpers__NS__writeFile(appFile, newContentAppFile);
    try {
      this.project.formatFile(relativeAppTs);
    } catch (error) {}

    //#endregion
  }
  //#endregion

  //#region recreate from core project

  recreateFileFromCoreProject = (options: {
    fileRelativePath?: string | string[];
    forceRecrete?: boolean;
    /**
     * if will override **fileRelativePath** with different path
     * to get file from core project
     * By default this helper will copy file from core project to this project:
     * <path-to-core-project><fileRelativePath>
     * <this-project><fileRelativePath>
     */
    relativePathInCoreProject?: string | string[];
    customDestinationLocation?: string | string[];
  }): void => {
    //#region @backendFunc
    let {
      fileRelativePath,
      customDestinationLocation,
      relativePathInCoreProject,
      forceRecrete,
    } = options || {};
    customDestinationLocation = crossPlatformPath(customDestinationLocation);
    if (
      customDestinationLocation &&
      Helpers__NS__exists(customDestinationLocation) &&
      Helpers__NS__isFolder(customDestinationLocation)
    ) {
      Helpers__NS__error(
        `[${config.frameworkName}] Custom destination "${customDestinationLocation}"` +
          ` location cannot be a folder, it must be a file path`,
      );
    }
    const project = this.project;
    fileRelativePath = crossPlatformPath(fileRelativePath);
    if (
      (___NS__isString(fileRelativePath) &&
        (!project.hasFile(fileRelativePath) || forceRecrete)) ||
      customDestinationLocation
    ) {
      const filePathSource = project.framework.coreProject.pathFor(
        relativePathInCoreProject
          ? relativePathInCoreProject
          : fileRelativePath,
      );
      // console.log({filePathSource})

      const sourceContent = Helpers__NS__readFile(filePathSource);
      const fixedContent = this.fixCoreContent(sourceContent);
      if (customDestinationLocation) {
        Helpers__NS__writeFile(customDestinationLocation, fixedContent);
      } else {
        project.writeFile(fileRelativePath, fixedContent);
      }
    }
    //#endregion
  };
  //#endregion

  //#region framework version less than or equal
  public frameworkVersionLessThanOrEqual(
    version: CoreModels__NS__FrameworkVersion,
  ): boolean {
    //#region @backendFunc
    return (
      this.frameworkVersionEquals(version) ||
      this.frameworkVersionLessThan(version)
    );
    //#endregion
  }
  //#endregion

  //#region framework version less than
  public frameworkVersionLessThan(
    version: CoreModels__NS__FrameworkVersion,
  ): boolean {
    //#region @backendFunc
    const ver = Number(___NS__isString(version) && version.replace('v', ''));
    const curr = Number(
      ___NS__isString(this.frameworkVersion) &&
        this.frameworkVersion.replace('v', ''),
    );
    return !isNaN(ver) && !isNaN(curr) && curr < ver;
    //#endregion
  }
  //#endregion

  //#region core container data from node modules link
  get containerDataFromNodeModulesLink(): {
    isCoreContainer: boolean;
    coreContainerFromNodeModules: Project;
  } {
    //#region @backendFunc
    const realpathCCfromCurrentProj =
      fse.existsSync(this.project.nodeModules.path) &&
      fse.realpathSync(this.project.nodeModules.path);
    const pathCCfromCurrentProj =
      realpathCCfromCurrentProj &&
      crossPlatformPath(path.dirname(realpathCCfromCurrentProj));

    const coreContainerFromNodeModules: Project = (pathCCfromCurrentProj &&
      this.project.ins.From(pathCCfromCurrentProj)) as Project;

    const isCoreContainer =
      coreContainerFromNodeModules &&
      coreContainerFromNodeModules?.framework.isCoreProject &&
      coreContainerFromNodeModules?.framework.isContainer;

    return { isCoreContainer, coreContainerFromNodeModules };
    //#endregion
  }
  //#endregion

  //#region core project
  get coreProject(): Project {
    //#region @backendFunc
    return this.project.ins.by(this.project.type, this.frameworkVersion) as any;
    //#endregion
  }
  //#endregion

  //#region is link to node modules different than core container
  get isLinkToNodeModulesDifferentThanCoreContainer() {
    //#region @backendFunc
    const { isCoreContainer, coreContainerFromNodeModules } =
      this.containerDataFromNodeModulesLink;

    return (
      isCoreContainer &&
      coreContainerFromNodeModules.location !==
        this.project.ins.by(LibTypeEnum.CONTAINER, this.frameworkVersion)
          .location
    );
    //#endregion
  }
  //#endregion

  //#region core container
  /**
   * Get automatic core container for project
   * WHEN NODE_MODULES BELONG TO TNP -> it uses tnp core container
   */
  get coreContainer(): Project {
    //#region @backendFunc
    // use core container from node_modules link first - if it is proper

    // TODO QUICK_FIX FOR 'update-vscode-package-json.js'
    const emptyFrameworkName = !config.frameworkName;

    if (taonPackageName === config.frameworkName || emptyFrameworkName) {
      const { isCoreContainer, coreContainerFromNodeModules } =
        this.containerDataFromNodeModulesLink;

      if (isCoreContainer) {
        // this.project.nodeModules.reinstallSync();
        return coreContainerFromNodeModules;
      }
    }
    const coreContainer = this.project.ins.by(
      LibTypeEnum.CONTAINER,
      this.frameworkVersion,
    ) as Project;

    if (!coreContainer) {
      if (!UtilsOs__NS__isRunningInVscodeExtension()) {
        Helpers__NS__error(
          `
        There is something wrong with core ${containerPrefix}${this.frameworkVersion}

        You need to sync taon containers. Try command:

      ${config.frameworkName} sync

      `,
          false,
          true,
        );
      } else {
        console.warn(`Not able to find core container for
           project name: ${this.project.nameForNpmPackage}
           location: ${this.project.location}
           type: ${this.project.type}
           config.frameworkName: ${config.frameworkName}

           `);
      }
    }
    // TODO I cloud install node_modules here automatically, but sometimes
    // is is not needed
    // coreContainer.nodeModules.reinstallSync();
    return coreContainer;
    //#endregion
  }
  //#endregion

  //#region tmp local project full path
  get tmpLocalProjectFullPath(): string {
    return this.project.pathFor([
      tmpLocalCopytoProjDist,
      nodeModulesMainProject,
      this.project.nameForNpmPackage,
    ]);
  }
  //#endregion

  //#region generate index.ts
  private resolveAbsPath(relativePath: string): string {
    //#region @backendFunc
    if (!relativePath || relativePath === '') {
      return this.project.location;
    }
    if (path.isAbsolute(relativePath)) {
      return relativePath;
    }
    return this.project.pathFor(relativePath);
    //#endregion
  }

  generateIndexTs(relativePath: string = '') {
    //#region @backendFunc
    const absPath = this.resolveAbsPath(relativePath);

    // const absPath = path.isAbsolute(relativePath)
    //   ? relativePath
    //   : relativePath
    //   ? this.project.pathFor(relativePath)
    //   : this.project.location;

    const folders = [
      ...Helpers__NS__foldersFrom(absPath).map(f => path.basename(f)),
      ...Helpers__NS__filesFrom(absPath, false).map(f => path.basename(f)),
    ]
      .filter(f => ![fileName.index_ts].includes(f))
      .filter(f => !f.startsWith('.'))
      .filter(f => !f.startsWith('_'))
      .filter(f =>
        ___NS__isUndefined(notNeededForExportFiles.find(e => f.endsWith(e))),
      )
      .filter(
        f =>
          path.extname(f) === '' ||
          !___NS__isUndefined(
            extAllowedToExportAndReplaceTSJSCodeFiles.find(a => f.endsWith(a)),
          ),
      );
    Helpers__NS__writeFile(
      crossPlatformPath([absPath, fileName.index_ts]),
      folders
        .map(f => {
          if (
            !___NS__isUndefined(frontendFiles.find(bigExt => f.endsWith(bigExt)))
          ) {
            // `${TAGS.COMMENT_REGION} ${TAGS.BROWSER}\n` +
            return `export * from './${f.replace(path.extname(f), '')}'; // ${
              TAGS.BROWSER
            }`;
            // +`\n${TAGS.COMMENT_END_REGION}\n`;
          }
          if (
            !___NS__isUndefined(
              backendNodejsOnlyFiles.find(bigExt => f.endsWith(bigExt)),
            )
          ) {
            return (
              // `${TAGS.COMMENT_REGION} ${TAGS.BACKEND}\n` +
              `export * from './${f.replace(path.extname(f), '')}'; // ${
                TAGS.BACKEND
              }`
              // +`\n${TAGS.COMMENT_END_REGION}\n`
            );
          }
          return `export * from './${f.replace(path.extname(f), '')}';`;
        })
        .join('\n') + '\n',
    );
    //#endregion
  }
  //#endregion

  //#region global
  async global(globalPackageName: string, packageOnly = false) {
    //#region @backendFunc
    const oldContainer = this.project.ins.by(
      LibTypeEnum.CONTAINER,
      'v1',
    ) as Project;
    if (oldContainer.nodeModules.empty) {
      Helpers__NS__info('initing container v1 for global packages');
      await oldContainer.init(
        EnvOptions.from({
          purpose: 'old container init',
        }),
      );
    }
    if (packageOnly) {
      return crossPlatformPath(
        path.join(oldContainer.nodeModules.path, globalPackageName),
      );
    }
    return crossPlatformPath(
      path.join(
        oldContainer.nodeModules.path,
        globalPackageName,
        `bin/${globalPackageName}`,
      ),
    );
    //#endregion
  }
  //#endregion

  //#region detected contexts
  /**
   * @returns by default it will always return at least one context
   */
  public getAllDetectedContextsNames(): string[] {
    return this.getAllDetectedTaonContexts()
      .map((f, i) =>
        (f?.contextName || `UnnamedContext${i}`)
          .replace('.sqlite', '')
          .replace('db-', ''),
      )
      .sort((a, b) => a.localeCompare(b));
  }

  /**
   * @returns by default it will always return at least one context
   */
  public getAllDetectedTaonContexts(options?: {
    skipLibFolder?: boolean;
  }): Models__NS__TaonContext[] {
    options = options || {};
    const detectedContexts = [...this._allDetectedNestedContexts(options)];
    return detectedContexts.length > 0 ? detectedContexts : [];
  }

  contextFilter(relativePath: string): boolean {
    return (
      relativePath === appTsFromSrc ||
      relativePath === migrationIndexAutogeneratedTsFileRelativeToSrcPath ||
      relativePath.endsWith(TaonFileExtension.DOT_WORKER_TS) ||
      relativePath.endsWith(TaonFileExtension.DOT_CONTEXT_TS)
    );
  }

  private _allDetectedNestedContexts(options?: {
    skipLibFolder?: boolean;
  }): Models__NS__TaonContext[] {
    //#region @backendFunc
    options = options || {};
    const basePath = this.project.pathFor([srcMainProject]);
    const notAllowedFolders = [...(options.skipLibFolder ? [libFromSrc] : [])];

    const filesForContext = Helpers__NS__getFilesFrom(basePath, {
      recursive: true,
    }).filter(absPath => {
      const relativePath = absPath.replace(`${basePath}/`, '');
      if (notAllowedFolders.find(f => relativePath.startsWith(`${f}/`))) {
        return false;
      }
      return this.contextFilter(relativePath);
    });

    const detectedDatabaseFiles = filesForContext.reduce((a, absPathToFile) => {
      return a.concat(
        UtilsTypescript__NS__getTaonContextsNamesFromFile(absPathToFile).map(
          contextName => {
            return {
              contextName: contextName,
              fileRelativePath: absPathToFile.replace(`${basePath}/`, ''),
            };
          },
        ),
      );
    }, [] as Models__NS__TaonContext[]);
    return detectedDatabaseFiles;
    //#endregion
  }

  //#endregion

  //#region get all external isomorphic dependencies for npm lib
  get allDetectedExternalIsomorphicDependenciesForNpmLibCode(): string[] {
    //#region @backendFunc
    const allFiles = Helpers__NS__getFilesFrom(
      this.project.pathFor([srcMainProject, libFromSrc]),
      {
        recursive: true,
        followSymlinks: false,
      },
    ).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

    const allImports: UtilsTypescript__NS__TsImportExport[] = [];
    for (const fileAbsPath of allFiles) {
      const imports = UtilsTypescript__NS__recognizeImportsFromFile(fileAbsPath);
      allImports.push(...imports);
    }

    const isomorphicLibs =
      this.project.nodeModules.getIsomorphicPackagesNames();

    // const taonCoreImports = Object.keys(
    //   this.project.framework.coreProject.packageJson.allDependencies,
    // ).filter(f => !isomorphicLibs.includes(f));

    const displayList = Utils__NS__uniqArray(
      allImports
        .filter(
          f =>
            f.type === 'import' ||
            f.type === 'require' ||
            f.type === 'async-import',
        )
        .map(i => `${i.cleanEmbeddedPathToFile}`)
        .filter(
          i =>
            !i.startsWith('.') &&
            isomorphicLibs.includes(
              i.replace(
                new RegExp(
                  Utils__NS__escapeStringForRegEx(`/${srcFromTaonImport}`) + '$',
                ),
                '',
              ),
            ),
        )
        .map(i =>
          i.replace(
            new RegExp(
              Utils__NS__escapeStringForRegEx(`/${srcFromTaonImport}`) + '$',
            ),
            '',
          ),
        ),
    ).sort();

    return displayList;
    //#endregion
  }
  //#endregion

  //#region get all external isomorphic dependencies for npm lib
  get allDetectedExternalNPmDependenciesForNpmLibCode(): string[] {
    //#region @backendFunc
    const allFiles = Helpers__NS__getFilesFrom(
      this.project.pathFor([srcMainProject, libFromSrc]),
      {
        recursive: true,
        followSymlinks: false,
      },
    ).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

    const allImports: UtilsTypescript__NS__TsImportExport[] = [];
    for (const fileAbsPath of allFiles) {
      const imports = UtilsTypescript__NS__recognizeImportsFromFile(fileAbsPath);
      allImports.push(...imports);
    }

    let displayList = Utils__NS__uniqArray(
      allImports
        .filter(
          f =>
            f.type === 'import' ||
            f.type === 'require' ||
            f.type === 'async-import',
        )
        .map(i => `${i.cleanEmbeddedPathToFile}`)
        .filter(i => !i.startsWith('.'))
        .map(i =>
          i.replace(
            new RegExp(
              Utils__NS__escapeStringForRegEx(`/${srcFromTaonImport}`) + '$',
            ),
            '',
          ),
        ),
    ).sort();

    const allIsomorphicDeps =
      this.project.nodeModules.getIsomorphicPackagesNames();

    displayList = displayList.filter(d => !allIsomorphicDeps.includes(d));

    displayList = displayList.filter(
      d => !this.NODE_BUILTIN_MODULES.includes(d),
    );

    return displayList;
    //#endregion
  }
  //#endregion

  NODE_BUILTIN_MODULES = [
    'node:child_process',
    'node:crypto',
    'node:fs',
    'node:fs/promises',
    'node:path',
    'node:url',
    'node:util',
    // --- File system & paths ---
    'fs',
    'fs/promises',
    'path',

    // --- Networking ---
    'net',
    'tls',
    'dgram',
    'http',
    'http2',
    'https',

    // --- Streams & buffers ---
    'stream',
    'stream/promises',
    'stream/consumers',
    'buffer',

    // --- Process & OS ---
    'process',
    'os',
    'worker_threads',
    'cluster',

    // --- Timers & async ---
    'timers',
    'timers/promises',
    'async_hooks',

    // --- Crypto & security ---
    'crypto',
    'zlib',

    // --- Utilities ---
    'util',
    'util/types',
    'assert',
    'assert/strict',

    // --- URL & encoding ---
    'url',
    'querystring',
    'punycode',

    // --- VM / internals ---
    'vm',
    'v8',
    'perf_hooks',
    'diagnostics_channel',

    // --- Modules & loaders ---
    'module',

    // --- REPL / CLI ---
    'repl',
    'readline',
    'readline/promises',

    // --- Child processes ---
    'child_process',

    // --- DNS ---
    'dns',
    'dns/promises',

    // --- Inspector / debugging ---
    'inspector',

    // --- Intl / Web ---
    'intl',
    'webcrypto',

    // --- WASI ---
    'wasi',

    // --- Node-specific helpers ---
    'events',
    'constants',
    'domain',
  ];

  async setFrameworkVersion(
    newFrameworkVersion: CoreModels__NS__FrameworkVersion,
    options?: { confirm?: boolean },
  ): Promise<void> {
    //#region @backendFunc
    if (!newFrameworkVersion || !newFrameworkVersion.startsWith('v')) {
      Helpers__NS__error(
        `Invalid framework version: ${newFrameworkVersion}`,
        false,
        true,
      );
    }
    const rawNumber = Number(newFrameworkVersion.replace('v', ''));
    if (isNaN(rawNumber) || rawNumber < 1) {
      Helpers__NS__error(
        `Invalid framework version: ${newFrameworkVersion}`,
        false,
        true,
      );
    }

    options = options || {};
    Helpers__NS__info(
      `Setting framework version (${newFrameworkVersion}) for ${this.project.name}... and children`,
    );
    const confirm = !options.confirm
      ? true
      : await UtilsTerminal__NS__confirm({
          message: `Are you sure you want to set framework version to ${newFrameworkVersion} for project ${this.project.name} and all its children ?`,
          defaultValue: false,
        });

    if (!confirm) {
      Helpers__NS__warn(`Operation cancelled by user.`);
      return;
    }
    await this.project.taonJson.setFrameworkVersion(newFrameworkVersion);
    for (const child of this.project.children) {
      await child.taonJson.setFrameworkVersion(newFrameworkVersion);
    }
    Helpers__NS__taskDone(`Framework version set to ${newFrameworkVersion}`);
    //#endregion
  }

  async setNpmVersion(
    npmVersion: string,
    options?: { confirm?: boolean },
  ): Promise<void> {
    //#region @backendFunc

    if (!UtilsNpm__NS__isProperVersion(npmVersion)) {
      Helpers__NS__error(`Invalid npm version: ${npmVersion}`, false, true);
    }

    options = options || {};
    Helpers__NS__info(
      `Setting npm version (${npmVersion}) for ${this.project.name}... and children`,
    );
    const confirm = !options.confirm
      ? true
      : await UtilsTerminal__NS__confirm({
          message: `Are you sure you want to set npm version to ${npmVersion} for project ${this.project.name} and all its children ?`,
          defaultValue: false,
        });
    if (!confirm) {
      Helpers__NS__warn(`Operation cancelled by user.`);
      return;
    }
    await this.project.packageJson.setVersion(npmVersion);
    for (const child of this.project.children) {
      await child.packageJson.setVersion(npmVersion);
    }
    //#endregion
  }
}