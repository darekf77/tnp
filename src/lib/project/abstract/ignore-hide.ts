//#region imports
import { TaonTempDatabasesFolder, TaonTempRoutesFolder } from 'taon/src';
import { config, fileName, Utils } from 'tnp-core/src';
import { crossPlatformPath } from 'tnp-core/src';
import {
  BaseFeatureForProject,
  BaseIgnoreHideHelpers,
  Helpers,
} from 'tnp-helpers/src';

import {
  appAutoGenDocsMd,
  appAutoGenJs,
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
  vitestConfigJsonMainProject,
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

  private applyToChildren(toIgnore: string[]): string[] {
    return toIgnore;
    // TODO remvoe ?
    // const chilredn = Utils.uniqArray([
    //   ...(this.project.children || []).map(c => c.name),
    //   ...(this.project.linkedProjects?.linkedProjects || []).map(
    //     c => c.relativeClonePath,
    //   ),
    // ]).filter(f => !!f);
    // return [
    //   ...toIgnore,
    //   ...chilredn.reduce((a, childFolderName) => {
    //     return [...a, ...toIgnore.map(c => `${childFolderName}/${c}`)];
    //   }, []),
    // ];
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
      `/${srcMainProject}/${appAutoGenDocsMd}`,
      `/${srcMainProject}/${appAutoGenJs}`,
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

  // TODO use constants
  hideInProject = [
    'tmp-*',
    'dist*',
    '.tnp',
    '.taon',
    'tsconfig*',
    '*.schema.json',
    'eslint*',
    'run.js',
    'webpack*',
    'index.js',
    'index.js.map',
    'index.d.ts',
    vitestConfigJsonMainProject,
    '.gitignore',
    '.npmignore',
    '.npmrc',
    '.prettierrc',
    '.prettierignore',
    'update-vscode-package-json.js',
    '.editorconfig',
    'websql',
    'browser',
    'node_modules',
    'package.json',
  ];

  protected alwaysIgnoredHiddenPatterns(): string[] {
    const toIgnore = [
      ...super.alwaysIgnoredHiddenPatterns(),
      ...this.hideInProject,
      !this.project.framework.isCoreProject ? `*${dotFileTemplateExt}` : void 0,
    ].filter(f => !!f) as string[];

    return this.applyToChildren(toIgnore);
  }

  protected alwaysIgnoredAndHiddenFilesAndFolders(): string[] {
    const toIgnore = [
      ...super.alwaysIgnoredAndHiddenFilesAndFolders(),
      browserMainProject,
      websqlMainProject,
      websqlMainProject,
      vitestConfigJsonMainProject,
      esLintCustomRulesMainProject,
      distMainProject + prodSuffix,
      distNoCutSrcMainProject,
      distNoCutSrcMainProject + prodSuffix,
      packageJsonLockMainProject,
    ];
    return this.applyToChildren(toIgnore);
  }

  alwaysUseRecursivePattern(): string[] {
    return [
      ...super.alwaysUseRecursivePattern(),
      `*${dotFileTemplateExt}`,
      ...this.hideInProject,
    ];
  }

  protected hiddenButNotNecessaryIgnoredInRepoFilesAndFolders(): string[] {
    const toIgnore = [
      ...super.hiddenButNotNecessaryIgnoredInRepoFilesAndFolders(),
      runJsMainProject,
      indexDtsMainProject,
      indexJsMainProject,
      indexJsMapMainProject,
      updateVscodePackageJsonJsMainProject,
    ];
    return this.applyToChildren(toIgnore);
  }

  protected hiddenButNotNecessaryIgnoredInRepoPatterns(): string[] {
    const toIgnore = [
      ...super.hiddenButNotNecessaryIgnoredInRepoPatterns(),
      '*.schema.json',
    ].filter(f => !!f) as string[];
    return this.applyToChildren(toIgnore);
  }

  protected hiddenButNeverIgnoredInRepo(): string[] {
    const toIgnore = [
      ...super.hiddenButNeverIgnoredInRepo(),
      ...(Helpers.exists(this.project.pathFor(fileName.taon_jsonc))
        ? [fileName.package_json]
        : []),
    ];

    return this.applyToChildren(toIgnore);
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
