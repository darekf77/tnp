//#region imports
import { Configuration as ElectronBuilderConfig } from 'electron-builder';
import { config, LibTypeEnum } from 'tnp-core/lib-prod';
import { crossPlatformPath, path, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, HelpersTaon__NS__actionWrapper, HelpersTaon__NS__applyMixins, HelpersTaon__NS__arrays__NS__arrayMoveElementAfterB, HelpersTaon__NS__arrays__NS__arrayMoveElementBefore, HelpersTaon__NS__arrays__NS__from, HelpersTaon__NS__arrays__NS__fuzzy, HelpersTaon__NS__arrays__NS__moveObjectAfter, HelpersTaon__NS__arrays__NS__moveObjectBefore, HelpersTaon__NS__arrays__NS__second, HelpersTaon__NS__arrays__NS__sortKeys, HelpersTaon__NS__arrays__NS__uniqArray, HelpersTaon__NS__autocompleteAsk, HelpersTaon__NS__bundleCodeIntoSingleFile, HelpersTaon__NS__changeCwd, HelpersTaon__NS__changeCwdWrapper, HelpersTaon__NS__checkEnvironment, HelpersTaon__NS__checkIfNameAllowedForTaonProj, HelpersTaon__NS__checksum, HelpersTaon__NS__cliTool__NS__cleanCommand, HelpersTaon__NS__cliTool__NS__fixUnexpectedCommandCharacters, HelpersTaon__NS__cliTool__NS__getPramsFromArgs, HelpersTaon__NS__cliTool__NS__globalArgumentsParserTnp, HelpersTaon__NS__cliTool__NS__match, HelpersTaon__NS__cliTool__NS__removeArg, HelpersTaon__NS__cliTool__NS__removeArgsFromCommand, HelpersTaon__NS__cliTool__NS__resolveItemFromArgsBegin, HelpersTaon__NS__cliTool__NS__resolveItemsFromArgsBegin, HelpersTaon__NS__CLIWRAP, HelpersTaon__NS__consoleGui__NS__multiselect, HelpersTaon__NS__consoleGui__NS__pressAnyKey, HelpersTaon__NS__consoleGui__NS__question__NS__yesNo, HelpersTaon__NS__consoleGui__NS__select, HelpersTaon__NS__consoleGui__NS__wait, HelpersTaon__NS__copy, HelpersTaon__NS__copyFile, HelpersTaon__NS__copyFolderOsNative, HelpersTaon__NS__filterDontCopy, HelpersTaon__NS__filterOnlyCopy, HelpersTaon__NS__findChildren, HelpersTaon__NS__findChildrenNavi, HelpersTaon__NS__fixWebpackEnv, HelpersTaon__NS__formatPath, HelpersTaon__NS__generatedFileWrap, HelpersTaon__NS__getLinesFromFiles, HelpersTaon__NS__getMethodName, HelpersTaon__NS__getMostRecentFileName, HelpersTaon__NS__getMostRecentFilesNames, HelpersTaon__NS__getRecrusiveFilesFrom, HelpersTaon__NS__getStringFrom, HelpersTaon__NS__getTempFolder, HelpersTaon__NS__getValueFromJSON, HelpersTaon__NS__getValueFromJSONC, HelpersTaon__NS__getWorkingDirOfProcess, HelpersTaon__NS__git__NS___pull, HelpersTaon__NS__git__NS__allOrigins, HelpersTaon__NS__git__NS__backupBranch, HelpersTaon__NS__git__NS__changeRemoteFromHttpsToSSh, HelpersTaon__NS__git__NS__changeRemoveFromSshToHttps, HelpersTaon__NS__git__NS__changesSummary, HelpersTaon__NS__git__NS__checkIfthereAreSomeUncommitedChange, HelpersTaon__NS__git__NS__checkout, HelpersTaon__NS__git__NS__checkoutDefaultBranch, HelpersTaon__NS__git__NS__checkoutFromTo, HelpersTaon__NS__git__NS__checkTagExists, HelpersTaon__NS__git__NS__cleanRepoFromAnyFilesExceptDotGitFolder, HelpersTaon__NS__git__NS__clone, HelpersTaon__NS__git__NS__commit, HelpersTaon__NS__git__NS__countCommits, HelpersTaon__NS__git__NS__currentBranchName, HelpersTaon__NS__git__NS__defaultRepoBranch, HelpersTaon__NS__git__NS__fetch, HelpersTaon__NS__git__NS__findGitRoot, HelpersTaon__NS__git__NS__getACTION_MSG_RESET_GIT_HARD_COMMIT, HelpersTaon__NS__git__NS__getAllTags, HelpersTaon__NS__git__NS__getBranchesNames, HelpersTaon__NS__git__NS__getChangedFiles, HelpersTaon__NS__git__NS__getChangedFilesInCommitByHash, HelpersTaon__NS__git__NS__getChangedFilesInCommitByIndex, HelpersTaon__NS__git__NS__getCommitHashByIndex, HelpersTaon__NS__git__NS__getCommitMessageByHash, HelpersTaon__NS__git__NS__getCommitMessageByIndex, HelpersTaon__NS__git__NS__getListOfCurrentGitChanges, HelpersTaon__NS__git__NS__getOriginURL, HelpersTaon__NS__git__NS__getRemoteProvider, HelpersTaon__NS__git__NS__getUserInfo, HelpersTaon__NS__git__NS__hasAnyCommits, HelpersTaon__NS__git__NS__isGitRoot, HelpersTaon__NS__git__NS__isInMergeProcess, HelpersTaon__NS__git__NS__isInsideGitRepo, HelpersTaon__NS__git__NS__isValidRepoUrl, HelpersTaon__NS__git__NS__lastCommitDate, HelpersTaon__NS__git__NS__lastCommitHash, HelpersTaon__NS__git__NS__lastCommitMessage, HelpersTaon__NS__git__NS__lastTagHash, HelpersTaon__NS__git__NS__lastTagNameForMajorVersion, HelpersTaon__NS__git__NS__lastTagVersionName, HelpersTaon__NS__git__NS__meltActionCommits, HelpersTaon__NS__git__NS__originHttpToSsh, HelpersTaon__NS__git__NS__originSshToHttp, HelpersTaon__NS__git__NS__penultimateCommitHash, HelpersTaon__NS__git__NS__penultimateCommitMessage, HelpersTaon__NS__git__NS__pullCurrentBranch, HelpersTaon__NS__git__NS__pushCurrentBranch, HelpersTaon__NS__git__NS__rebase, HelpersTaon__NS__git__NS__removeTag, HelpersTaon__NS__git__NS__resetFiles, HelpersTaon__NS__git__NS__resetHard, HelpersTaon__NS__git__NS__resetSoftHEAD, HelpersTaon__NS__git__NS__restoreLastVersion, HelpersTaon__NS__git__NS__revertFileChanges, HelpersTaon__NS__git__NS__setUserInfos, HelpersTaon__NS__git__NS__stageAllAndCommit, HelpersTaon__NS__git__NS__stageAllFiles, HelpersTaon__NS__git__NS__stagedFiles, HelpersTaon__NS__git__NS__stageFile, HelpersTaon__NS__git__NS__stash, HelpersTaon__NS__git__NS__stashApply, HelpersTaon__NS__git__NS__tagAndPushToGitRepo, HelpersTaon__NS__git__NS__thereAreSomeUncommitedChangeExcept, HelpersTaon__NS__git__NS__uncommitedFiles, HelpersTaon__NS__git__NS__unstageAllFiles, HelpersTaon__NS__goToDir, HelpersTaon__NS__HelpersNumber, HelpersTaon__NS__input, HelpersTaon__NS__isElevated, HelpersTaon__NS__isPlainFileOrFolder, HelpersTaon__NS__killAllNode, HelpersTaon__NS__killAllNodeExceptCurrentProcess, HelpersTaon__NS__list, HelpersTaon__NS__mesureExectionInMs, HelpersTaon__NS__mesureExectionInMsSync, HelpersTaon__NS__move, HelpersTaon__NS__multipleChoicesAsk, HelpersTaon__NS__osIsMacOs, HelpersTaon__NS__outputToVScode, HelpersTaon__NS__pathFromLink, HelpersTaon__NS__paths__NS__create, HelpersTaon__NS__paths__NS__PREFIX, HelpersTaon__NS__paths__NS__removeExt, HelpersTaon__NS__paths__NS__removeExtension, HelpersTaon__NS__paths__NS__removeRootFolder, HelpersTaon__NS__prepareWatchCommand, HelpersTaon__NS__pressKeyAndContinue, HelpersTaon__NS__pressKeyOrWait, HelpersTaon__NS__randomInteger, HelpersTaon__NS__readValueFromJson, HelpersTaon__NS__readValueFromJsonC, HelpersTaon__NS__removeExcept, HelpersTaon__NS__renameFiles, HelpersTaon__NS__renameFolder, HelpersTaon__NS__requireJs, HelpersTaon__NS__requireUncached, HelpersTaon__NS__resolve, HelpersTaon__NS__restartApplicationItself, HelpersTaon__NS__selectChoicesAsk, HelpersTaon__NS__setValueToJSON, HelpersTaon__NS__setValueToJSONC, HelpersTaon__NS__size, HelpersTaon__NS__slash, HelpersTaon__NS__strings__NS__interpolateString, HelpersTaon__NS__strings__NS__numValue, HelpersTaon__NS__strings__NS__plural, HelpersTaon__NS__strings__NS__removeDoubleOrMoreEmptyLines, HelpersTaon__NS__strings__NS__singular, HelpersTaon__NS__strings__NS__splitIfNeed, HelpersTaon__NS__terminalLine, HelpersTaon__NS__tryCopyFrom, HelpersTaon__NS__tryRecreateDir, HelpersTaon__NS__uniqArray, HelpersTaon__NS__waitForCondition, HelpersTaon__NS__waitForMessegeInStdout, HelpersTaon__NS__workerCalculateArray, UtilsTypescript__NS__addBelowPlaceholder, UtilsTypescript__NS__addOrUpdateImportIfNotExists, UtilsTypescript__NS__calculateRelativeImportPath, UtilsTypescript__NS__clearRequireCacheRecursive, UtilsTypescript__NS__collapseFluentChains, UtilsTypescript__NS__DeepWritable, UtilsTypescript__NS__eslintFixAllFilesInsideFolder, UtilsTypescript__NS__eslintFixAllFilesInsideFolderAsync, UtilsTypescript__NS__eslintFixFile, UtilsTypescript__NS__ExportedThirdPartyNamespaces, UtilsTypescript__NS__ExportInfo, UtilsTypescript__NS__exportsFromContent, UtilsTypescript__NS__exportsFromFile, UtilsTypescript__NS__exportsRedefinedFromContent, UtilsTypescript__NS__exportsRedefinedFromFile, UtilsTypescript__NS__extractAngularComponentSelectors, UtilsTypescript__NS__extractClassNameFromString, UtilsTypescript__NS__extractClassNamesFromFile, UtilsTypescript__NS__extractDefaultClassNameFromFile, UtilsTypescript__NS__extractDefaultClassNameFromString, UtilsTypescript__NS__extractRenamedImportsOrExport, UtilsTypescript__NS__fixHtmlTemplatesInDir, UtilsTypescript__NS__FlattenMapping, UtilsTypescript__NS__formatAllFilesInsideFolder, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__GatheredExportsMap, UtilsTypescript__NS__gatherExportsMapFromIndex, UtilsTypescript__NS__getCleanImport, UtilsTypescript__NS__getTaonContextFromContent, UtilsTypescript__NS__getTaonContextsNamesFromFile, UtilsTypescript__NS__hoistTrailingChainComments, UtilsTypescript__NS__injectImportsIntoImportsRegion, UtilsTypescript__NS__migrateFromNgModulesToStandaloneV21, UtilsTypescript__NS__normalizeBrokenLines, UtilsTypescript__NS__NSSPLITNAMESAPCE, UtilsTypescript__NS__ParsedTsDiagnostic, UtilsTypescript__NS__parseTsDiagnostic, UtilsTypescript__NS__recognizeImportsFromContent, UtilsTypescript__NS__recognizeImportsFromFile, UtilsTypescript__NS__RedefinedExportInfo, UtilsTypescript__NS__refactorClassToNamespace, UtilsTypescript__NS__removeRegionByName, UtilsTypescript__NS__removeTaggedArrayObjects, UtilsTypescript__NS__removeTaggedImportExport, UtilsTypescript__NS__removeTaggedLines, UtilsTypescript__NS__RenamedImportOrExport, UtilsTypescript__NS__replaceImportNamespaceWithWithExplodedNamespace, UtilsTypescript__NS__replaceNamespaceWithLongNames, UtilsTypescript__NS__setValueToVariableInTsFile, UtilsTypescript__NS__splitNamespaceForContent, UtilsTypescript__NS__splitNamespaceForFile, UtilsTypescript__NS__SplitNamespaceResult, UtilsTypescript__NS__transformComponentStandaloneOption, UtilsTypescript__NS__transformFlatImports, UtilsTypescript__NS__TsImportExport, UtilsTypescript__NS__updateSplitNamespaceReExports, UtilsTypescript__NS__updateSplitNamespaceResultMapReplaceObj, UtilsTypescript__NS__wrapContentClassMembersDecoratorsWithRegion, UtilsTypescript__NS__wrapFirstImportsInImportsRegion, UtilsTypescript__NS__wrapWithComment } from 'tnp-helpers/lib-prod';
import { PackageJson } from 'type-fest';

import { templateFolderForArtifact } from '../../../../app-utils';
import {
  assetsFor,
  assetsFromNgProj,
  assetsFromNpmLib,
  assetsFromSrc,
  BundledFiles,
  CoreAssets,
  CoreNgTemplateFiles,
  distElectronProj,
  electronNgProj,
  packageJsonNgProject,
  srcNgProxyProject,
  TemplateFolder,
  tmpAppsForDistElectron,
} from '../../../../constants';
import {
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';

//#endregion

export class ArtifactElectronApp extends BaseArtifact<
  {
    electronDistOutAppPath: string;
  },
  ReleasePartialOutput
> {
  constructor(project: Project) {
    super(project, ReleaseArtifactTaon.ELECTRON_APP);
  }

  //#region clear partial
  async clearPartial(options: EnvOptions): Promise<void> {
    [this.project.pathFor(tmpAppsForDistElectron)].forEach(f => {
      Helpers__NS__removeSymlinks(f);
      Helpers__NS__removeFolderIfExists(f);
    });
  }
  //#endregion

  //#region init partial
  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    if (!initOptions.release.targetArtifact) {
      initOptions.release.targetArtifact = ReleaseArtifactTaon.ELECTRON_APP;
    }
    const result = await this.artifacts.angularNodeApp.initPartial(initOptions);
    return result;
  }
  //#endregion

  //#region build partial
  async buildPartial(buildOptions: EnvOptions): Promise<{
    electronDistOutAppPath: string;
    proxyProj: Project;
  }> {

    //#region @backendFunc

    const { appDistOutBrowserAngularAbsPath } =
      await this.artifacts.angularNodeApp.buildPartial(
        buildOptions.clone({
          build: {
            pwa: {
              disableServiceWorker: true,
            },
            baseHref: buildOptions.release.releaseType ? `./` : void 0,
          },
          release: {
            targetArtifact: this.currentArtifactName,
          },
        }),
      );
    const proxyProj = this.project.ins.From(
      path.dirname(appDistOutBrowserAngularAbsPath),
    );

    const electronDistOutAppPath = this.project.pathFor([
      `.${config.frameworkName}`,
      this.currentArtifactName,
      // 'release',
      `release-${new Date().getTime()}`, // to avoid asar lock in os
      this.project.packageJson.version,
    ]);

    return {
      electronDistOutAppPath,
      proxyProj,
    };
    //#endregion

  }
  //#endregion

  //#region release partial
  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<ReleasePartialOutput> {

    //#region @backendFunc
    releaseOptions = this.updateResolvedVersion(releaseOptions);

    const projectsReposToPushAndTag: string[] = [this.project.location];
    const projectsReposToPush: string[] = [];

    const { electronDistOutAppPath, proxyProj } =
      await this.buildPartial(releaseOptions);

    //#region set native dependencies
    const electronNativeDeps = this.project.taonJson.getNativeDepsFor(
      ReleaseArtifactTaon.ELECTRON_APP,
    );

    for (const nativeDepName of electronNativeDeps) {
      const version = this.project.packageJson.dependencies[nativeDepName];
      if (version) {
        Helpers__NS__logInfo(
          `Setting native dependency ${nativeDepName} to version ${version}`,
        );
        HelpersTaon__NS__setValueToJSON(
          proxyProj.pathFor(`${electronNgProj}/package.json`),
          'dependencies',
          {
            [nativeDepName]:
              this.project.packageJson.dependencies[nativeDepName],
          },
        );
      } else {
        Helpers__NS__warn(
          `Native dependency ${nativeDepName} not found in taon package.json dependencies`,
        );
      }
    }
    //#endregion

    //#region bundling backend node_modules
    await HelpersTaon__NS__bundleCodeIntoSingleFile(
      proxyProj.pathFor(`${electronNgProj}/main.js`),
      proxyProj.pathFor(`${electronNgProj}/index.js`),
      {
        additionalExternals: [
          ...electronNativeDeps,
          ...this.project.taonJson.additionalExternalsFor(
            ReleaseArtifactTaon.ELECTRON_APP,
          ),
        ],
        additionalReplaceWithNothing: [
          ...this.project.taonJson.additionalReplaceWithNothingFor(
            ReleaseArtifactTaon.ELECTRON_APP,
          ),
        ],
        strategy: ReleaseArtifactTaon.ELECTRON_APP,
      },
    );
    //#endregion

    proxyProj.run(`cd ${electronNgProj} && npm install`).sync();

    //#region modify electron-builder.json
    const electronConfigPath = proxyProj.pathFor(`electron-builder.json`);

    const electronConfig = Helpers__NS__readJson(
      electronConfigPath,
    ) as UtilsTypescript__NS__DeepWritable<ElectronBuilderConfig>;
    electronConfig.directories.output = electronDistOutAppPath;
    electronConfig.appId =
      releaseOptions.appId ||
      `${releaseOptions.website.domain.split('.').reverse().join('.')}` +
        `.${this.project.nameForNpmPackage}`;
    electronConfig.productName = this.project.nameForNpmPackage;

    Helpers__NS__info(`

      AppId: ${electronConfig.appId}
      ProductName: ${electronConfig.productName}

      `);

    Helpers__NS__writeJson(electronConfigPath, electronConfig);
    let electronConfigFile = Helpers__NS__readFile(electronConfigPath);
    electronConfigFile = electronConfigFile.replace(
      new RegExp(Utils__NS__escapeStringForRegEx(`${assetsFromSrc}/`), 'g'),
      `${distElectronProj}/${assetsFromNgProj}/${assetsFor}/${this.project.nameForNpmPackage}/${assetsFromNpmLib}/`,
    );
    Helpers__NS__writeFile(electronConfigPath, electronConfigFile);
    //#endregion

    //#region Copy wasm file
    const wasmfileSource = crossPlatformPath([
      this.project.ins
        .by(LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion)
        .pathFor([
          templateFolderForArtifact(ReleaseArtifactTaon.ELECTRON_APP),
          srcNgProxyProject,
          assetsFromNgProj,
          CoreAssets.sqlWasmFile,
        ]),
    ]);
    const wasmfileDest = crossPlatformPath([
      proxyProj.location,
      electronNgProj,
      CoreAssets.sqlWasmFile,
    ]);
    HelpersTaon__NS__copyFile(wasmfileSource, wasmfileDest);
    //#endregion

    //#region modify index.html
    const indexHtmlPath = proxyProj.pathFor([
      distElectronProj,
      BundledFiles.INDEX_HTML,
    ]);

    Helpers__NS__writeFile(
      indexHtmlPath,
      Helpers__NS__readFile(indexHtmlPath),
      // Helpers__NS__readFile(indexHtmlPath).replace(
      //   `<base href="/">`,
      //   '<base href="./">',
      // ),
      // .replace(`<base href="/">`, '<base href="./">'),
      // .replace(/\/assets\//g, 'assets/'),
    );

    // Helpers__NS__replaceLinesInFile(indexHtmlPath, line => {
    //   if (line.search(`rel="manifest"`) !== -1) {
    //     return '';
    //   }
    //   return line;
    // });
    //#endregion

    //#region modify package.json
    const electronPackageJson = proxyProj.pathFor(packageJsonNgProject);
    const electronPackageJsonContent = Helpers__NS__readJson(
      electronPackageJson,
    ) as PackageJson;
    electronPackageJsonContent.dependencies = {};
    electronPackageJsonContent.devDependencies =
      this.project.packageJson.dependencies || {};
    Helpers__NS__writeJson(electronPackageJson, electronPackageJsonContent);
    //#endregion

    proxyProj.run(`npm-run electron-builder build --publish=never`).sync();

    // proxyProj.run(`npm-run electron-forge package`).sync();
    // process.exit(0);

    let releaseProjPath: string;

    if (releaseOptions.release.releaseType === ReleaseType.LOCAL) {

      //#region local release
      const releaseData = await this.localReleaseDeploy(
        electronDistOutAppPath,
        releaseOptions,
        {
          copyOnlyExtensions: ['.zip'],
          distinctArchitecturePrefix: { platform: process.platform },
        },
      );
      projectsReposToPushAndTag.push(...releaseData.projectsReposToPushAndTag);
      releaseProjPath = releaseData.releaseProjPath;
      //#endregion

    }
    if (releaseOptions.release.releaseType === ReleaseType.STATIC_PAGES) {

      //#region static pages release
      const releaseData = await this.staticPagesDeploy(
        electronDistOutAppPath,
        releaseOptions,
        {
          copyOnlyExtensions: ['.zip'],
          distinctArchitecturePrefix: { platform: process.platform },
        },
      );
      projectsReposToPush.push(...releaseData.projectsReposToPush);
      releaseProjPath = releaseData.releaseProjPath;
      //#endregion

    }

    projectsReposToPushAndTag.push(electronDistOutAppPath);
    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      projectsReposToPushAndTag,
      projectsReposToPush,
      releaseProjPath,
      releaseType: releaseOptions.release.releaseType,
    };
    //#endregion

  }
  //#endregion

}