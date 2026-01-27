//#region imports
import { Url } from 'url';

import { config } from 'tnp-core/lib-prod';
import { crossPlatformPath, path } from 'tnp-core/lib-prod';
import { Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, UtilsTypescript__NS__addBelowPlaceholder, UtilsTypescript__NS__addOrUpdateImportIfNotExists, UtilsTypescript__NS__calculateRelativeImportPath, UtilsTypescript__NS__clearRequireCacheRecursive, UtilsTypescript__NS__collapseFluentChains, UtilsTypescript__NS__DeepWritable, UtilsTypescript__NS__eslintFixAllFilesInsideFolder, UtilsTypescript__NS__eslintFixAllFilesInsideFolderAsync, UtilsTypescript__NS__eslintFixFile, UtilsTypescript__NS__ExportedThirdPartyNamespaces, UtilsTypescript__NS__ExportInfo, UtilsTypescript__NS__exportsFromContent, UtilsTypescript__NS__exportsFromFile, UtilsTypescript__NS__exportsRedefinedFromContent, UtilsTypescript__NS__exportsRedefinedFromFile, UtilsTypescript__NS__extractAngularComponentSelectors, UtilsTypescript__NS__extractClassNameFromString, UtilsTypescript__NS__extractClassNamesFromFile, UtilsTypescript__NS__extractDefaultClassNameFromFile, UtilsTypescript__NS__extractDefaultClassNameFromString, UtilsTypescript__NS__extractRenamedImportsOrExport, UtilsTypescript__NS__fixHtmlTemplatesInDir, UtilsTypescript__NS__FlattenMapping, UtilsTypescript__NS__formatAllFilesInsideFolder, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__GatheredExportsMap, UtilsTypescript__NS__gatherExportsMapFromIndex, UtilsTypescript__NS__getCleanImport, UtilsTypescript__NS__getTaonContextFromContent, UtilsTypescript__NS__getTaonContextsNamesFromFile, UtilsTypescript__NS__hoistTrailingChainComments, UtilsTypescript__NS__injectImportsIntoImportsRegion, UtilsTypescript__NS__migrateFromNgModulesToStandaloneV21, UtilsTypescript__NS__normalizeBrokenLines, UtilsTypescript__NS__NSSPLITNAMESAPCE, UtilsTypescript__NS__ParsedTsDiagnostic, UtilsTypescript__NS__parseTsDiagnostic, UtilsTypescript__NS__recognizeImportsFromContent, UtilsTypescript__NS__recognizeImportsFromFile, UtilsTypescript__NS__RedefinedExportInfo, UtilsTypescript__NS__refactorClassToNamespace, UtilsTypescript__NS__removeRegionByName, UtilsTypescript__NS__removeTaggedArrayObjects, UtilsTypescript__NS__removeTaggedImportExport, UtilsTypescript__NS__removeTaggedLines, UtilsTypescript__NS__RenamedImportOrExport, UtilsTypescript__NS__replaceImportNamespaceWithWithExplodedNamespace, UtilsTypescript__NS__replaceNamespaceWithLongNames, UtilsTypescript__NS__setValueToVariableInTsFile, UtilsTypescript__NS__splitNamespaceForContent, UtilsTypescript__NS__splitNamespaceForFile, UtilsTypescript__NS__SplitNamespaceResult, UtilsTypescript__NS__transformComponentStandaloneOption, UtilsTypescript__NS__transformFlatImports, UtilsTypescript__NS__TsImportExport, UtilsTypescript__NS__updateSplitNamespaceReExports, UtilsTypescript__NS__updateSplitNamespaceResultMapReplaceObj, UtilsTypescript__NS__wrapContentClassMembersDecoratorsWithRegion, UtilsTypescript__NS__wrapFirstImportsInImportsRegion, UtilsTypescript__NS__wrapWithComment } from 'tnp-helpers/lib-prod';

import {
  Development,
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';

import { Docs } from './docs';
//#endregion

export class ArtifactDocsWebapp extends BaseArtifact<
  {
    docsWebappDistOutPath: string;
    combinedDocsHttpServerUrl: Url;
  },
  ReleasePartialOutput
> {
  public docs: Docs;

  constructor(protected readonly project: Project) {
    super(project, ReleaseArtifactTaon.DOCS_DOCS_WEBAPP);
    this.docs = new Docs(this.project);
  }

  //#region clear partial
  async clearPartial(clearOptions: EnvOptions): Promise<void> {
    [
      this.project.pathFor(`.${config.frameworkName}/temp-docs-folders`),
    ].forEach(f => {
      Helpers__NS__removeSymlinks(f);
      Helpers__NS__removeFolderIfExists(f);
    });
  }
  //#endregion

  //#region init partial
  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    if (!initOptions.release.targetArtifact) {
      initOptions.release.targetArtifact = ReleaseArtifactTaon.DOCS_DOCS_WEBAPP;
    }
    await this.docs.initializeWatchers(initOptions);
    await this.docs.init();
    return initOptions;
  }
  //#endregion

  //#region build partial
  async buildPartial(buildOptions: EnvOptions): Promise<{
    docsWebappDistOutPath: string;
    combinedDocsHttpServerUrl: Url;
  }> {
    //#region @backendFunc
    buildOptions = await this.project.artifactsManager.init(
      EnvOptions.from(buildOptions),
    );

    const shouldSkipBuild = this.shouldSkipBuild(buildOptions);
    const combinedDocsHttpServerUrl: Url = void 0; // TODO implement
    const docsWebappDistOutPath: string = buildOptions.build.overrideOutputPath
      ? buildOptions.build.overrideOutputPath
      : this.getOutDirTempDocsPath(buildOptions);

    const port = await this.DOCS_ARTIFACT_PORT_UNIQ_KEY(buildOptions);

    if (!shouldSkipBuild) {
      await this.docs.runTask({
        watch: buildOptions.build.watch,
        initialParams: {
          docsOutFolder: docsWebappDistOutPath.replace(
            this.project.location + '/',
            '',
          ),
          ciBuild: buildOptions.isCiProcess,
          port,
        },
      });
    }

    if (!buildOptions.build.watch) {
      buildOptions.finishCallback?.();
    }

    return { docsWebappDistOutPath, combinedDocsHttpServerUrl };
    //#endregion
  }
  //#endregion

  //#region release partial
  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<ReleasePartialOutput> {
    //#region @backendFunc
    let releaseProjPath: string;
    const releaseType: ReleaseType = releaseOptions.release.releaseType;
    const projectsReposToPushAndTag: string[] = [this.project.location];
    const projectsReposToPush: string[] = [];
    releaseOptions = this.updateResolvedVersion(releaseOptions);

    const { docsWebappDistOutPath } = await this.buildPartial(
      releaseOptions.clone({
        isCiProcess: true,
      }),
    );

    releaseOptions.release.overrideStaticPagesReleaseType = releaseOptions
      .release.overrideStaticPagesReleaseType
      ? releaseOptions.release.overrideStaticPagesReleaseType
      : 'major';

    if (releaseOptions.release.releaseType === ReleaseType.STATIC_PAGES) {
      //#region static-pages release
      const releaseData = await this.staticPagesDeploy(
        docsWebappDistOutPath,
        releaseOptions,
      );

      projectsReposToPush.push(...releaseData.projectsReposToPush);
      releaseProjPath = releaseData.releaseProjPath;
      //#endregion
    }

    if (releaseOptions.release.releaseType === ReleaseType.LOCAL) {
      //#region static-pages release
      const releaseData = await this.localReleaseDeploy(
        docsWebappDistOutPath,
        releaseOptions,
      );

      projectsReposToPushAndTag.push(...releaseData.projectsReposToPushAndTag);
      //#endregion
    }

    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      releaseProjPath,
      releaseType,
      projectsReposToPushAndTag,
      projectsReposToPush,
    };
    //#endregions
  }
  //#endregion

  //#region helpers
  async DOCS_ARTIFACT_PORT_UNIQ_KEY(buildOptions: EnvOptions): Promise<number> {
    const key = 'docs port for http server';
    return await this.project.registerAndAssignPort(key, {
      startFrom: 3950,
    });
  }

  private getOutDirTempDocsPath(buildOptions: EnvOptions): string {
    let outDirApp =
      `.${config.frameworkName}/${this.currentArtifactName}/` +
      `${
        buildOptions.release.releaseType
          ? buildOptions.release.releaseType
          : Development
      }/` +
      this.project.packageJson.version;

    return this.project.pathFor(outDirApp);
  }
  //#endregion
}