//#region imports
import { TaonTempDatabasesFolder, TaonTempRoutesFolder } from 'taon/src';
import { config, fileName } from 'tnp-core/src';
import { crossPlatformPath } from 'tnp-core/src';
import {
  BaseFeatureForProject,
  BaseIgnoreHideHelpers,
  Helpers,
} from 'tnp-helpers/src';

import {
  assetsFromSrc,
  browserMainProject,
  distMainProject,
  distNoCutSrcMainProject,
  docsConfigSchema,
  dotFileTemplateExt,
  dotVscodeMainProject,
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
      ...(Helpers.exists(this.project.pathFor(fileName.taon_jsonc))
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
