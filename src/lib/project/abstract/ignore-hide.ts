//#region imports
import { config, fileName } from 'tnp-core/src';
import { crossPlatformPath } from 'tnp-core/src';
import {
  BaseFeatureForProject,
  BaseIgnoreHideHelpers,
  Helpers,
} from 'tnp-helpers/src';

import { docsConfigSchema, frameworkBuildFolders } from '../../constants';

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
        ? `/${config.folder.testsEnvironments}`
        : void 0,
      '/src/app.hosts.ts',
      '/src/vars.scss',
      '/BUILD-INFO.md',
      `/${docsConfigSchema}`,
      '/src/lib/lib-info.md',
      '/src/lib/env/**/*.*',
      '/src/migrations/migrations-info.md',
      '/src/tests/mocha-tests-info.md',
      '/src/assets/shared/shared_folder_info.txt',
      '/.vscode/launch.json',
      !this.project.taonJson.storeGeneratedAssetsInRepository
        ? `/src/assets/generated`
        : void 0,
      !this.project.taonJson.storeLocalReleaseFilesInRepository
        ? `/local_release`
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
      !this.project.framework.isCoreProject ? '*.filetemplate' : void 0,
    ].filter(f => !!f) as string[];
  }

  protected alwaysIgnoredAndHiddenFilesAndFolders(): string[] {
    return [
      ...super.alwaysIgnoredAndHiddenFilesAndFolders(),
      'browser',
      'websql',
      'dist-nocutsrc',
      'package-lock.json',
    ];
  }

  alwaysUseRecursivePattern(): string[] {
    return [...super.alwaysUseRecursivePattern(), '*.filetemplate'];
  }

  protected hiddenButNotNecessaryIgnoredInRepoFilesAndFolders(): string[] {
    return [
      ...super.hiddenButNotNecessaryIgnoredInRepoFilesAndFolders(),
      'run.js',
      'index.d.ts',
      'index.js',
      'index.js.map',
      'update-vscode-package-json.js',
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
