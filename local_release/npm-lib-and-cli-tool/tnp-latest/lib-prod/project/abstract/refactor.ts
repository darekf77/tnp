//#region imports
import { BaseTaonClassesNames, TAON_FLATTEN_MAPPING } from 'taon/lib-prod';
import { config, fileName, frontendFiles, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds, UtilsFilesFoldersSync__NS__copy, UtilsFilesFoldersSync__NS__copyFile, UtilsFilesFoldersSync__NS__filterDontCopy, UtilsFilesFoldersSync__NS__filterOnlyCopy, UtilsFilesFoldersSync__NS__getFilesFrom, UtilsFilesFoldersSync__NS__getFoldersFrom, UtilsFilesFoldersSync__NS__IGNORE_FOLDERS_FILES_PATTERNS, UtilsFilesFoldersSync__NS__move, UtilsFilesFoldersSync__NS__readFile, UtilsFilesFoldersSync__NS__UtilsFilesFoldersSyncGetFilesFromOptions, UtilsFilesFoldersSync__NS__writeFile } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings } from 'tnp-core/lib-prod';
import { Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, UtilsTypescript__NS__addBelowPlaceholder, UtilsTypescript__NS__addOrUpdateImportIfNotExists, UtilsTypescript__NS__calculateRelativeImportPath, UtilsTypescript__NS__clearRequireCacheRecursive, UtilsTypescript__NS__collapseFluentChains, UtilsTypescript__NS__DeepWritable, UtilsTypescript__NS__eslintFixAllFilesInsideFolder, UtilsTypescript__NS__eslintFixAllFilesInsideFolderAsync, UtilsTypescript__NS__eslintFixFile, UtilsTypescript__NS__ExportedThirdPartyNamespaces, UtilsTypescript__NS__ExportInfo, UtilsTypescript__NS__exportsFromContent, UtilsTypescript__NS__exportsFromFile, UtilsTypescript__NS__exportsRedefinedFromContent, UtilsTypescript__NS__exportsRedefinedFromFile, UtilsTypescript__NS__extractAngularComponentSelectors, UtilsTypescript__NS__extractClassNameFromString, UtilsTypescript__NS__extractClassNamesFromFile, UtilsTypescript__NS__extractDefaultClassNameFromFile, UtilsTypescript__NS__extractDefaultClassNameFromString, UtilsTypescript__NS__extractRenamedImportsOrExport, UtilsTypescript__NS__fixHtmlTemplatesInDir, UtilsTypescript__NS__FlattenMapping, UtilsTypescript__NS__formatAllFilesInsideFolder, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__GatheredExportsMap, UtilsTypescript__NS__gatherExportsMapFromIndex, UtilsTypescript__NS__getCleanImport, UtilsTypescript__NS__getTaonContextFromContent, UtilsTypescript__NS__getTaonContextsNamesFromFile, UtilsTypescript__NS__hoistTrailingChainComments, UtilsTypescript__NS__injectImportsIntoImportsRegion, UtilsTypescript__NS__migrateFromNgModulesToStandaloneV21, UtilsTypescript__NS__normalizeBrokenLines, UtilsTypescript__NS__NSSPLITNAMESAPCE, UtilsTypescript__NS__ParsedTsDiagnostic, UtilsTypescript__NS__parseTsDiagnostic, UtilsTypescript__NS__recognizeImportsFromContent, UtilsTypescript__NS__recognizeImportsFromFile, UtilsTypescript__NS__RedefinedExportInfo, UtilsTypescript__NS__refactorClassToNamespace, UtilsTypescript__NS__removeRegionByName, UtilsTypescript__NS__removeTaggedArrayObjects, UtilsTypescript__NS__removeTaggedImportExport, UtilsTypescript__NS__removeTaggedLines, UtilsTypescript__NS__RenamedImportOrExport, UtilsTypescript__NS__replaceImportNamespaceWithWithExplodedNamespace, UtilsTypescript__NS__replaceNamespaceWithLongNames, UtilsTypescript__NS__setValueToVariableInTsFile, UtilsTypescript__NS__splitNamespaceForContent, UtilsTypescript__NS__splitNamespaceForFile, UtilsTypescript__NS__SplitNamespaceResult, UtilsTypescript__NS__transformComponentStandaloneOption, UtilsTypescript__NS__transformFlatImports, UtilsTypescript__NS__TsImportExport, UtilsTypescript__NS__updateSplitNamespaceReExports, UtilsTypescript__NS__updateSplitNamespaceResultMapReplaceObj, UtilsTypescript__NS__wrapContentClassMembersDecoratorsWithRegion, UtilsTypescript__NS__wrapFirstImportsInImportsRegion, UtilsTypescript__NS__wrapWithComment } from 'tnp-helpers/lib-prod';
import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';

import { libFromSrc, srcMainProject } from '../../constants';
import type { Project } from '../abstract/project';
//#endregion

//#region format regions
/**
 * QUICK_FIX for spaces after and before each region
 * Formats TypeScript region comments:
 * - Ensures a blank line BEFORE each #region / region
 * - Ensures a blank line AFTER each #endregion / endregion
 *   (but skips the "after" blank line if it's the final region before a closing })
 */
export function formatRegions(code: string): string {
  const lines = code.split(/\r?\n/);
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const current = lines[i];
    const trimmed = current.trim();

    // === 1. Detect //#region or // region (with optional text after) ===
    const isRegionStart = /^\s*\/\/\s*#?\s*region\b/i.test(trimmed);

    if (isRegionStart) {
      // Ensure there's a blank line BEFORE this region (unless it's the very first line)
      if (result.length > 0) {
        const last = result[result.length - 1];
        if (last !== '') {
          result.push(''); // insert blank line before region
        }
      }
      result.push(current);
    }
    // === 2. Detect //#endregion or // endregion ===
    else if (/^\s*\/\/\s*#?\s*endregion\b/i.test(trimmed)) {
      result.push(current);

      // Look ahead: skip blank line after if next non-empty line is just "}" (or "};" / "},")
      let nextIdx = i + 1;
      while (nextIdx < lines.length && lines[nextIdx].trim() === '') {
        nextIdx++;
      }

      const nextLineTrimmed =
        nextIdx < lines.length ? lines[nextIdx].trim() : '';
      const isEndOfBlock = /^[\}\)];?,]?$/.test(nextLineTrimmed);

      if (!isEndOfBlock) {
        // Not the end of a block → ensure blank line after
        if (i + 1 >= lines.length || lines[i + 1].trim() !== '') {
          result.push(''); // insert blank line
        }
        // else: already has blank line(s), we'll keep just one later if needed
      }
      // else: do NOT add blank line — it's the final region before closing brace
    }
    // === 3. Regular line ===
    else {
      result.push(current);
    }

    i++;
  }

  // Optional: clean up multiple consecutive blank lines (keep only one)
  const cleaned = result
    .join('\n')
    .replace(/\n{3,}/g, '\n\n') // 3+ → 2
    .replace(/^\n+/, '') // remove leading newlines
    .replace(/\n+$/, '\n'); // ensure single trailing newline

  return cleaned;
}
//#endregion

// @ts-ignore TODO weird inheritance problem
export class Refactor extends BaseFeatureForProject<Project> {
  //#region prepare options
  private prepareOptions(options?: { fixSpecificFile?: string | undefined }) {
    options = options || {};
    if (options.fixSpecificFile) {
      if (
        path.isAbsolute(options.fixSpecificFile) &&
        Helpers__NS__exists(options.fixSpecificFile)
      ) {
        // ok
      } else {
        options.fixSpecificFile = this.project.pathFor(options.fixSpecificFile);
        if (
          path.isAbsolute(options.fixSpecificFile) &&
          Helpers__NS__exists(options.fixSpecificFile)
        ) {
          // ok
        } else {
          delete options.fixSpecificFile;
        }
      }
    }
    return options;
  }
  //#endregion

  //#region ALL
  async ALL(options?: {
    initingFromParent?: boolean;
    fixSpecificFile?: string | undefined;
  }) {
    options = this.prepareOptions(options);

    this.project.taonJson.setFrameworkVersion(
      ('v' +
        this.project.ins.angularMajorVersionForCurrentCli()) as CoreModels__NS__FrameworkVersion,
    );
    if (this.project.framework.isContainer) {
      await this.project.init();
      for (const child of this.project.children) {
        await child.refactor.ALL(options);
      }
    }
    if (!options.initingFromParent) {
      await this.project.init();
    }
    this.project.taonJson.detectAndUpdateNpmExternalDependencies();
    this.project.taonJson.detectAndUpdateIsomorphicExternalDependencies();
    await this.changeCssToScss(options);

    await this.taonNames(options);
    await this.flattenImports(options);
    await this.removeBrowserRegion(options);
    await this.properStandaloneNg19(options);
    await this.eslint(options);
    await this.importsWrap(options);

    await this.prettier(options);
    this.project.vsCodeHelpers.toogleFilesVisibilityInVscode({
      action: 'hide-files',
    });
  }
  //#endregion

  async prettier(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers__NS__info(`Running prettier...`);
    if (options.fixSpecificFile) {
      await UtilsTypescript__NS__formatFile(options.fixSpecificFile);
      Helpers__NS__info(`Prettier done for file ${options.fixSpecificFile}`);
      return;
    }
    UtilsTypescript__NS__fixHtmlTemplatesInDir(this.project.pathFor(srcMainProject));
    this.project.formatAllFiles();
    Helpers__NS__info(`Prettier done`);
    //#endregion
  }

  async eslint(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers__NS__info(`Running eslint fix...`);

    if (options.fixSpecificFile) {
      await UtilsTypescript__NS__eslintFixFile(options.fixSpecificFile);
      Helpers__NS__info(`Eslint fix done for file ${options.fixSpecificFile}`);
      return;
    }
    await UtilsTypescript__NS__eslintFixAllFilesInsideFolderAsync([
      this.project.pathFor(srcMainProject),
    ]);
    Helpers__NS__info(`Eslint fix done`);
    //#endregion
  }

  async removeBrowserRegion(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers__NS__info(`Running ${'@bro' + 'wser'} region fixer...`);
    const removeBrowserRegion = (content: string): string => {
      const lines = content.trim().split('\n');

      const regionStartRegex = /^\s*\/\/#region\s+@browser\s*$/;
      const regionEndRegex = /^\s*\/\/#endregion\s*$/;

      if (regionStartRegex.test(lines[0])) {
        lines.shift();
      }

      if (regionEndRegex.test(lines[lines.length - 1])) {
        lines.pop();
      }

      return lines.join('\n').trim();
    };

    Helpers__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
      recursive: true,
      // followSymlinks: false TODO ? maybe ?
    })
      .filter(f => {
        return (
          f.endsWith('.ts') &&
          !___NS__isUndefined(
            frontendFiles.find(ff => path.basename(f).endsWith(ff)),
          )
        );
      })
      .forEach(f => {
        let content = Helpers__NS__readFile(f);
        if (content) {
          const fixedContent = removeBrowserRegion(content);
          if (fixedContent.trim() !== content.trim()) {
            Helpers__NS__info(`Removing browser region from ${f}`);
            Helpers__NS__writeFile(f, fixedContent);
          }
        }
      });
    Helpers__NS__taskDone(`@browser region fixer done`);
    //#endregion
  }

  async changeCssToScss(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers__NS__info(`Changing css to scss replacer.`);

    Helpers__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
      recursive: true,
      followSymlinks: false,
    }).forEach(f => {
      if (options.fixSpecificFile && f !== options.fixSpecificFile) {
        return;
      }
      const tsFile = crossPlatformPath([
        path.dirname(f),
        path.basename(f).replace('.css', '.ts'),
      ]);
      const tsFileCmp = crossPlatformPath([
        path.dirname(f),
        path.basename(f).replace('.css', '.component.ts'),
      ]);
      const tsFileContainer = crossPlatformPath([
        path.dirname(f),
        path.basename(f).replace('.css', '.container.ts'),
      ]);
      if (
        f.endsWith('.css') &&
        (Helpers__NS__exists(tsFile) ||
          Helpers__NS__exists(tsFileCmp) ||
          Helpers__NS__exists(tsFileContainer))
      ) {
        Helpers__NS__writeFile(
          crossPlatformPath([
            path.dirname(f),
            path.basename(f).replace('.css', '.scss'),
          ]),
          Helpers__NS__readFile(f),
        );
        Helpers__NS__removeFileIfExists(f);
        const scssBaseName = path.basename(f).replace('.css', '.scss');

        if (Helpers__NS__exists(tsFile)) {
          Helpers__NS__writeFile(
            tsFile,
            (Helpers__NS__readFile(tsFile) || '').replace(
              path.basename(f),
              scssBaseName,
            ),
          );
        }

        if (Helpers__NS__exists(tsFileCmp)) {
          Helpers__NS__writeFile(
            tsFileCmp,
            (Helpers__NS__readFile(tsFileCmp) || '').replace(
              path.basename(f),
              scssBaseName,
            ),
          );
        }

        if (Helpers__NS__exists(tsFileContainer)) {
          Helpers__NS__writeFile(
            tsFileContainer,
            (Helpers__NS__readFile(tsFileContainer) || '').replace(
              path.basename(f),
              scssBaseName,
            ),
          );
        }
      }
    });
    Helpers__NS__taskDone(`Changing css to scss done`);
    //#endregion
  }

  async properStandaloneNg19(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers__NS__info(`Setting proper standalone property for ng19+...`);

    Helpers__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
      recursive: true,
      followSymlinks: false,
    }).forEach(f => {
      if (options.fixSpecificFile && f !== options.fixSpecificFile) {
        return;
      }
      if (f.endsWith('.ts')) {
        let content = Helpers__NS__readFile(f);
        const fixedComponent =
          UtilsTypescript__NS__transformComponentStandaloneOption(content);
        if (fixedComponent.trim() !== content.trim()) {
          Helpers__NS__info(`Fixing standalone option in ${f}`);
          Helpers__NS__writeFile(f, fixedComponent);
        }
      }
    });
    Helpers__NS__taskDone(`Done setting standalone property for ng19+...`);
    //#endregion
  }

  async importsWrap(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers__NS__info(`Wrapping first imports with imports region...`);

    Helpers__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
      recursive: true,
      followSymlinks: false,
    }).forEach(f => {
      if (options.fixSpecificFile && f !== options.fixSpecificFile) {
        return;
      }
      if (f.endsWith('.ts')) {
        let content = Helpers__NS__readFile(f);
        const fixedComponent = formatRegions(
          UtilsTypescript__NS__wrapFirstImportsInImportsRegion(content),
        );
        if (fixedComponent.trim() !== content.trim()) {
          Helpers__NS__info(`Fixing imports region in ${f}`);
          Helpers__NS__writeFile(f, fixedComponent);
        }
      }
    });
    Helpers__NS__taskDone(`Done wrapping first imports with region...`);
    //#endregion
  }

  async flattenImports(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers__NS__info(`Flattening imports...`);

    Helpers__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
      recursive: true,
      followSymlinks: false,
    }).forEach(f => {
      if (options.fixSpecificFile && f !== options.fixSpecificFile) {
        return;
      }
      if (f.endsWith('.ts')) {
        let content = Helpers__NS__readFile(f);
        const fixedComponent = formatRegions(
          UtilsTypescript__NS__transformFlatImports(content, TAON_FLATTEN_MAPPING),
        );
        if (fixedComponent.trim() !== content.trim()) {
          Helpers__NS__info(`Fixing imports region in ${f}`);
          Helpers__NS__writeFile(f, fixedComponent);
        }
      }
    });
    Helpers__NS__taskDone(`Done flattening imports...`);
    //#endregion
  }

  async taonNames(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    const names = [
      ...BaseTaonClassesNames,
      Utils__NS__escapeStringForRegEx('tnp-config'),
    ];
    options = this.prepareOptions(options);
    Helpers__NS__info(`Fixing taon class names...`);
    Helpers__NS__getFilesFrom(this.project.pathFor(srcMainProject), {
      recursive: true,
      followSymlinks: false,
    }).forEach(f => {
      if (options.fixSpecificFile && f !== options.fixSpecificFile) {
        return;
      }
      if (f.endsWith('.ts')) {
        let content = Helpers__NS__readFile(f);
        let fixedComponent = content;
        for (const taonClassName of names) {
          fixedComponent = fixedComponent
            .replace(
              new RegExp(`(?<!Taon)${taonClassName}`, 'g'),
              `Taon${taonClassName}`,
            )
            .replace(
              new RegExp(`TaonTaon${taonClassName}`, 'g'),
              `Taon${taonClassName}`,
            );
        }

        if (fixedComponent.trim() !== content.trim()) {
          Helpers__NS__info(`Fixing taon class names in ${f}`);
          Helpers__NS__writeFile(f, fixedComponent);
        }
      }
    });
    Helpers__NS__taskDone(`Done fixing taon class names...`);
    //#endregion
  }

  /**
   * Replaces self imports (imports using the package name) with proper relative paths.
   */
  async selfImports(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers__NS__info(`Using proper relative paths instead package full name...`);

    const baseLibPath = this.project.pathFor([srcMainProject, libFromSrc]);
    const projectNameForNpmPackage = this.project.nameForNpmPackage;
    const allSymbolsWithPathsAsValue: Record<string, string> = {};

    //#region gather all files
    const allFiles = UtilsFilesFoldersSync__NS__getFilesFrom(
      this.project.pathFor(srcMainProject),
      {
        followSymlinks: false,
        recursive: true,
      },
    );
    //#endregion

    //#region gather all symbols with paths
    for (const absFilePath of allFiles) {
      const content = Helpers__NS__readFile(absFilePath);
      const exportsFromFile = [
        ...UtilsTypescript__NS__exportsFromContent(content).map(e => e.name),
        ...UtilsTypescript__NS__exportsRedefinedFromContent(content).map(
          e => e.exportedName,
        ),
      ];

      exportsFromFile.forEach(exportElemName => {
        allSymbolsWithPathsAsValue[exportElemName] = absFilePath;
      });
    }
    //#endregion

    //#region fix imports
    allFiles
      .filter(f => f.startsWith(baseLibPath + '/'))
      .map(f => {
        const content = Helpers__NS__readFile(f);
        const imports = UtilsTypescript__NS__recognizeImportsFromContent(content);
        return {
          imports,
          filePath: f,
        };
      })
      .filter(
        f =>
          f.imports?.length > 0 &&
          f.imports.some(
            i =>
              i.type === 'import' &&
              i.cleanEmbeddedPathToFile?.startsWith(
                projectNameForNpmPackage + '/',
              ),
          ),
      )
      .forEach(f => {
        let content = Helpers__NS__readFile(f.filePath);
        let currentFileRelativePath = f.filePath.replace(baseLibPath + '/', '');
        const importsToFix = f.imports.filter(
          i =>
            i.type === 'import' &&
            i.cleanEmbeddedPathToFile?.startsWith(
              projectNameForNpmPackage + '/',
            ),
        );
        const fixedImportsPaths = [] as string[];
        const toReplaceToNothing = [] as string[];
        for (const importInfo of importsToFix) {
          const importToDelete = importInfo.getStringPartFrom(content);

          toReplaceToNothing.push(importToDelete);

          for (const importElem of importInfo.importElements) {
            const absPathForExport = allSymbolsWithPathsAsValue[importElem];
            if (!absPathForExport) {
              continue;
            }
            let exportFileRelativePath = absPathForExport.replace(
              baseLibPath + '/',
              '',
            );
            // mypath/to/file/here.ts
            // mypath/to/other/file/there.ts

            const relativeForExport =
              UtilsTypescript__NS__calculateRelativeImportPath(
                currentFileRelativePath,
                exportFileRelativePath,
              );
            fixedImportsPaths.push(
              `import { ${importElem} } from '${relativeForExport}';`,
            );
          }
        }
        for (const reaplceLine of toReplaceToNothing) {
          content = content.replace(reaplceLine, ' ');
        }
        content = UtilsTypescript__NS__injectImportsIntoImportsRegion(
          content,
          fixedImportsPaths,
        );
        const contentOnDisk = Helpers__NS__readFile(f.filePath);
        if (contentOnDisk && contentOnDisk?.trim() !== content?.trim()) {
          console.log(`FIXING CIRCULAR DEPS: ${f.filePath}`);
          Helpers__NS__writeFile(f.filePath, content);
        }
      });
    //#endregion

    Helpers__NS__taskDone(`Done wrapping first imports with region...`);

    await this.eslint(options);
    //#endregion
  }

  async classIntoNs(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers__NS__info(`Changing classes into namespaces..`);
    const baseLibPath = this.project.pathFor([srcMainProject, libFromSrc]);
    const projectNameForNpmPackage = this.project.nameForNpmPackage;
    const allSymbolsWithPathsAsValue: Record<string, string> = {};

    //#region gather all files
    const allFiles = UtilsFilesFoldersSync__NS__getFilesFrom(
      this.project.pathFor(srcMainProject),
      {
        followSymlinks: false,
        recursive: true,
      },
    );
    //#endregion

    allFiles.forEach(f => {
      if(!f.endsWith('.ts')) {
        return;
      }
      if (options.fixSpecificFile && f !== options.fixSpecificFile) {
        return;
      }
      let content = Helpers__NS__readFile(f);

      const fixedComponent = UtilsTypescript__NS__refactorClassToNamespace(content);
      if (fixedComponent.trim() !== content.trim()) {
        Helpers__NS__info(`Fixing classes into namespaces in ${f}`);
        Helpers__NS__writeFile(f, fixedComponent);
      }
    });

    Helpers__NS__taskDone(`Done wrapping first imports with region...`);
    //#endregion
  }
}