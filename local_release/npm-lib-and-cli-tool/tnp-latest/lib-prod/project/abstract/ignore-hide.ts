//#region imports
import { TaonTempDatabasesFolder, TaonTempRoutesFolder } from 'taon/lib-prod';
import { config, fileName } from 'tnp-core/lib-prod';
import { crossPlatformPath } from 'tnp-core/lib-prod';
import { BaseFeatureForProject, BaseIgnoreHideHelpers, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC } from 'tnp-helpers/lib-prod';

import {
  assetsFromSrc,
  browserMainProject,
  distMainProject,
  distNoCutSrcMainProject,
  docsConfigSchema,
  dotFileTemplateExt,
  dotVscodeMainProject,
  esLintCustomRulesMainProject,
  frameworkBuildFolders,
  generatedFromAssets,
  indexDtsMainProject,
  indexJsMainProject,
  indexJsMapMainProject,
  libFromSrc,
  localReleaseMainProject,
  migrationsFromLib,
  packageJsonLockMainProject,
  prodSuffix,
  runJsMainProject,
  sharedFromAssets,
  srcMainProject,
  TaonGeneratedFiles,
  TaonGeneratedFolders,
  testEnvironmentsMainProject,
  testsFromSrc,
  updateVscodePackageJsonJsMainProject,
  websqlMainProject,
} from '../../constants';

import type { Project } from './project';
//#endregion

export class IgnoreHide // @ts-ignore TODO weird inheritance problem
  extends BaseIgnoreHideHelpers<Project>
{
  protected storeInRepoConfigFiles(): boolean {
    return true; // TODO for now true in future may be false - everything recreate from template
  }

  getPatternsIgnoredInRepoButVisibleToUser(): string[] {
    // TODO
    return [
      ...super.getPatternsIgnoredInRepoButVisibleToUser(),
      ...frameworkBuildFolders.filter(c => !!c).map(c => `/${c}`),
      this.project.framework.isStandaloneProject
        ? `/${testEnvironmentsMainProject}`
        : void 0,
      `/${srcMainProject}/${TaonGeneratedFiles.APP_HOSTS_TS}`,
      `/${srcMainProject}/${TaonGeneratedFiles.VARS_SCSS}`,
      `/${TaonGeneratedFiles.BUILD_INFO_MD}`,
      `/${docsConfigSchema}`,
      `/${TaonTempDatabasesFolder}/*.sqlite`,
      `/${TaonTempRoutesFolder}/*.rest`,
      `/${srcMainProject}/${libFromSrc}/${TaonGeneratedFiles.LIB_INFO_MD}`,
      `/${srcMainProject}/${libFromSrc}/${TaonGeneratedFolders.ENV_FOLDER}/**/*.*`,
      `/${srcMainProject}/${libFromSrc}/${migrationsFromLib}/${TaonGeneratedFiles.MIGRATIONS_INFO_MD}`,
      `/${srcMainProject}/${testsFromSrc}/${TaonGeneratedFiles.MOCHA_TESTS_INFO_MD}`,
      `/${srcMainProject}/${assetsFromSrc}/${sharedFromAssets}/${TaonGeneratedFiles.SHARED_FOLDER_INFO_TXT}`,
      `/${dotVscodeMainProject}/${TaonGeneratedFiles.LAUNCH_JSON}`,
      !this.project.taonJson.storeGeneratedAssetsInRepository
        ? `/${srcMainProject}/${assetsFromSrc}/${generatedFromAssets}`
        : void 0,
      !this.project.taonJson.storeLocalReleaseFilesInRepository
        ? `/${localReleaseMainProject}`
        : void 0,
      ...(this.project.isMonorepo
        ? []
        : this.project.linkedProjects.linkedProjects
            .map(f => f.relativeClonePath)
            .map(c => `${crossPlatformPath(c)}`)),
    ].filter(c => !!c) as string[];
  }

  protected alwaysIgnoredHiddenPatterns(): string[] {
    return [
      ...super.alwaysIgnoredHiddenPatterns(),
      !this.project.framework.isCoreProject ? `*${dotFileTemplateExt}` : void 0,
    ].filter(f => !!f) as string[];
  }

  protected alwaysIgnoredAndHiddenFilesAndFolders(): string[] {
    return [
      ...super.alwaysIgnoredAndHiddenFilesAndFolders(),
      browserMainProject,
      websqlMainProject,
      websqlMainProject,
      esLintCustomRulesMainProject,
      distMainProject + prodSuffix,
      distNoCutSrcMainProject,
      distNoCutSrcMainProject + prodSuffix,
      packageJsonLockMainProject,
    ];
  }

  alwaysUseRecursivePattern(): string[] {
    return [...super.alwaysUseRecursivePattern(), `*${dotFileTemplateExt}`];
  }

  protected hiddenButNotNecessaryIgnoredInRepoFilesAndFolders(): string[] {
    return [
      ...super.hiddenButNotNecessaryIgnoredInRepoFilesAndFolders(),
      runJsMainProject,
      indexDtsMainProject,
      indexJsMainProject,
      indexJsMapMainProject,
      updateVscodePackageJsonJsMainProject,
    ];
  }

  protected hiddenButNotNecessaryIgnoredInRepoPatterns(): string[] {
    return [
      ...super.hiddenButNotNecessaryIgnoredInRepoPatterns(),
      '*.schema.json',
    ].filter(f => !!f) as string[];
  }

  protected hiddenButNeverIgnoredInRepo(): string[] {
    return [
      ...super.hiddenButNeverIgnoredInRepo(),
      ...(Helpers__NS__exists(this.project.pathFor(fileName.taon_jsonc))
        ? [fileName.package_json]
        : []),
    ];
  }

  public getVscodeFilesFoldersAndPatternsToHide(): {
    [fileFolderOrPattern: string]: true;
  } {
    const result = {
      ...super.getVscodeFilesFoldersAndPatternsToHide(),
    };

    if (
      this.project.framework.isContainer &&
      this.project.taonJson.isOrganization
    ) {
      this.project.linkedProjects.linkedProjects
        .map(f => f.relativeClonePath)
        .map(c => `${crossPlatformPath(c)}`)
        .forEach(c => {
          result[c] = true;
        });
    }

    return result;
  }
}