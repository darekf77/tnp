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
  AgentsMdMainProject,
  appAutoGenDocsMd,
  appAutoGenJs,
  assetsFromSrc,
  browserMainProject,
  distMainProject,
  distNoCutSrcMainProject,
  docsConfigSchema,
  dotAI,
  dotFileTemplateExt,
  dotGithubCopilotInstructions,
  dotGitIgnoreMainProject,
  dotVscodeMainProject,
  esLintCustomRulesMainProject,
  frameworkBuildFolders,
  generatedDocsFromMd,
  generatedFromAssets,
  i18nDataTsFileExt,
  indexDtsMainProject,
  indexJsMainProject,
  indexJsMapMainProject,
  libFromSrc,
  localReleaseMainProject,
  migrationsFromLib,
  packageJsonLockMainProject,
  packageJsonMainProject,
  packageJsonSubProject,
  prodSuffix,
  runJsMainProject,
  sharedFromAssets,
  srcMainProject,
  TaonGeneratedFiles,
  TaonGeneratedFolders,
  TemplateFolder,
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
  //#region getters

  //#region getters / core container exceptins
  get notIgnoredFilesAndFolderInStandaloneCoreProject(): string[] {
    if (!this.project.framework.isStandaloneProject) {
      return [];
    }
    const files = [
      'run.js',
      'index.js',
      'index.js.map',
      'index.d.ts',
      'vitest.config.ts',
      'eslint-rules',
      '.gitignore',
      '.npmignore',
      '.npmrc',
      '.prettierrc',
      '.prettierignore',
      'docs-config.schema.json',
      'update-vscode-package-json.js',
      '.editorconfig',
      'AGENTS.md',
      'package.json',
      '.github/copilot-instructions.md',
      'run.js',
      '.ai',
    ];
    return files;
  }

  get notIgnoredPatternsInStandaloneCoreProject(): string[] {
    if (!this.project.framework.isStandaloneProject) {
      return [];
    }
    const files = [
      'webpack*',
      'tsconfig*',
      'eslint*',
      '*.filetemplate',
      '*.i18n.data.ts',
    ];
    return files;
  }
  //#endregion

  //#region getters / ignored but visible to user
  get ignoredAlwaysForStandaloneFilesButVisibleToUSer(): string[] {
    if (!this.project.framework.isStandaloneProject) {
      return [];
    }
    const files = [
      `src/app.auto-gen-docs.md`,
      `src/app.auto-gen-ver.js`,
      '.vscode/launch.json',
      'src/vars.scss',
      'src/app.hosts.ts',
      'BUILD-INFO.md',
      'BUILD-STATUS.m',
    ];
    return files;
  }

  get ignoredAlwaysForStandalonePatternsButVisibleToUSer(): string[] {
    if (!this.project.framework.isStandaloneProject) {
      return [];
    }
    const patterns = [
      'src/assets/shared/shared_folder_info.txt',
      'src/tests/tests-folder-info.md',
      'src/lib/migrations/migrations-info.md',
      'src/lib/lib-info.md',
      'src/lib/env/**/*.*',
      `src/lib/build-info._auto-generated_.ts`,
      `databases/bucket`,
      `databases/**/*.sqlite`,
      `databases/**/*.sqlite`,
      `databases/**/*.sqlite.png`,
      `databases/**/*.sqlite.drawio`,
      `databases/**/*.sqlite.txt`,
      `databases/**/*.sqlite.schema.txt`,
      `databases/**/*.sqlite.overview.txt`,
      `databases/**/*.json`,
      `routes/*.rest`,
    ];

    return patterns;
  }
  //#endregion

  //#endregion

  //#region methods

  //#region methods don't store core container fiels

  protected storeInRepoConfigFiles(): boolean {
    return false; // TODO for now true in future may be false - everything recreate from template
  }
  //#endregion

  //#region get patterns ignore but visible to use
  getPatternsIgnoredInRepoButVisibleToUser(): string[] {
    let patternsFilesFolders = [
      'sub-projects/**/browser',
      'sub-projects/**/tmp-taon-migrations',
      'sub-projects/**/node_modules',
      'sub-projects/**/package.json',
      '*.schema.json',
      '.tnp',
      '.taon',
      ...super.getPatternsIgnoredInRepoButVisibleToUser(),
    ];

    if (this.project.taonJson.gitignoreGenDocsFiles) {
      patternsFilesFolders.push(
        ...[
          `src/assets/shared/generated-docs-from-md-files`,
          `src/lib/generated-docs-from-md-files`,
        ],
      );
    }

    if (!this.project.taonJson.storeGeneratedAssetsInRepository) {
      patternsFilesFolders.push(`src/assets/generated`);
    }

    if (!this.project.taonJson.storeLocalReleaseFilesInRepository) {
      patternsFilesFolders.push(`local_release`);
    }

    patternsFilesFolders.push(
      ...this.project.linkedProjects.linkedProjects
        .map(f => f.relativeClonePath)
        .map(c => `${crossPlatformPath(c)}`),
    );

    patternsFilesFolders.push(
      ...this.ignoredAlwaysForStandaloneFilesButVisibleToUSer,
    );

    patternsFilesFolders.push(
      ...this.ignoredAlwaysForStandalonePatternsButVisibleToUSer,
    );

    //#region handle core container exceptions
    if (
      this.project.framework.isCoreProject &&
      this.project.framework.isStandaloneProject
    ) {
      patternsFilesFolders = patternsFilesFolders.filter(f => {
        return !this.notIgnoredFilesAndFolderInStandaloneCoreProject.includes(
          f,
        );
      });
    } else {
      patternsFilesFolders.push(
        ...this.notIgnoredFilesAndFolderInStandaloneCoreProject,
      );
    }

    if (
      this.project.framework.isCoreProject &&
      this.project.framework.isStandaloneProject
    ) {
      patternsFilesFolders = patternsFilesFolders.filter(f => {
        return !this.notIgnoredPatternsInStandaloneCoreProject.includes(f);
      });
    } else {
      patternsFilesFolders.push(
        ...this.notIgnoredPatternsInStandaloneCoreProject,
      );
    }
    //#endregion

    return patternsFilesFolders.filter(c => !!c) as string[];
  }
  //#endregion

  //#region get patterns always ignored and hidden
  protected getPatternsAlwaysIgnoredHidden(): string[] {
    const patternsFilesFolders = [
      'tmp-*',
      'dist*',
      'dist-*',
      'node_modules',
      'package.json',
      'websql',
      'browser',
      'sub-projects/**/tsconfig.json',
      ...super.getPatternsAlwaysIgnoredHidden(),
    ];

    patternsFilesFolders.push(
      ...this.project.linkedProjects.linkedProjects
        .map(f => f.relativeClonePath)
        .map(c => `${crossPlatformPath(c)}.worktrees`),
    );

    return patternsFilesFolders.filter(f => !!f) as string[];
  }
  //#endregion

  //#region always use as recursive patterns
  protected alwaysUseRecursivePattern(): string[] {
    const patterns = super.alwaysUseRecursivePattern();

    patterns.push('*.i18n.data.ts');

    return patterns;
  }
  //#endregion

  //#region files and folders Always Ignored And hidden
  protected filesAndFoldersAlwaysIgnoredAndHidden(): string[] {
    const filesAndFolders = [...super.filesAndFoldersAlwaysIgnoredAndHidden()];
    return filesAndFolders.filter(f => !!f) as string[];
  }
  //#endregion

  //#region hidden but not necesary ignored in repo files and folders
  protected hiddenButNotNecessaryIgnoredInRepoFilesAndFolders(): string[] {
    let filesAndFolders = [
      ...super.hiddenButNotNecessaryIgnoredInRepoFilesAndFolders(),
    ];

    if (
      this.project.framework.isCoreProject &&
      this.project.framework.isStandaloneProject
    ) {
      filesAndFolders = filesAndFolders.filter(f => {
        return !this.notIgnoredFilesAndFolderInStandaloneCoreProject.includes(
          f,
        );
      });
    }

    return filesAndFolders;
  }
  //#endregion

  //#region hidden but not necessary ignored in repo patterns
  protected hiddenButNotNecessaryIgnoredInRepoPatterns(): string[] {
    let patterns = [
      ...super.hiddenButNotNecessaryIgnoredInRepoPatterns(),
      `!templates-subprojects/**/package.json`,
    ];

    if (
      this.project.framework.isCoreProject &&
      this.project.framework.isStandaloneProject
    ) {
      patterns = patterns.filter(f => {
        return !this.notIgnoredPatternsInStandaloneCoreProject.includes(f);
      });
    }

    return patterns.filter(f => !!f) as string[];
  }
  //#endregion

  //#endregion
}
