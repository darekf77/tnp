//#region imports
import * as JSON5 from 'json5';
import { config } from 'tnp-core/src';
import { fse, crossPlatformPath, CoreModels, chalk } from 'tnp-core/src';
import { path } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import {
  frameworkBuildFolders,
  taonConfigSchemaJsonStandalone,
  taonConfigSchemaJsonContainer,
  dotFileTemplateExt,
  tsconfigJsonMainProject,
  tsconfigBackendDistJson,
  tsconfigJsonIsomorphicMainProject,
  tsconfigIsomorphicFlatDistMainProject,
  tsconfigJsonBrowserMainProject,
  runJsMainProject,
  updateVscodePackageJsonJsMainProject,
  esLintConfigJsonMainProject,
  webpackConfigJsMainProject,
  indexJsMainProject,
  indexDtsMainProject,
  indexJsMapMainProject,
  tsconfigForSchemaJson,
} from '../../../../../../constants';
import { EnvOptions } from '../../../../../../options';
import type { Project } from '../../../../project';
//#endregion

export type RecreateFile = { where: string; from: string };

export class FilesRecreator // @ts-ignore TODO weird inheritance problem
  extends BaseFeatureForProject<Project>
{
  //#region recreate simple files
  public async init(): Promise<void> {
    //#region @backendFunc
    this.handleProjectSpecyficFiles();
    //#endregion
  }
  //#endregion

  projectSpecificFilesForStandalone(): string[] {
    let files = [
      indexJsMainProject,
      indexDtsMainProject,
      indexJsMapMainProject,
      tsconfigForSchemaJson,
    ];

    files = files.concat([
      taonConfigSchemaJsonStandalone,
      tsconfigJsonBrowserMainProject,
      webpackConfigJsMainProject,
      runJsMainProject,
      updateVscodePackageJsonJsMainProject,
      esLintConfigJsonMainProject,
      ...this.filesTemplates(),
    ]);

    if (this.project.framework.frameworkVersionAtLeast('v2')) {
      files = files.filter(f => f !== tsconfigJsonBrowserMainProject);
    }

    return files;
  }

  projectSpecificFilesForContainer(): string[] {
    return [taonConfigSchemaJsonContainer, esLintConfigJsonMainProject];
  }

  //#region getters & methods / project specify files
  /**
   * Return list of files that are copied from
   * core project each time struct method is called
   * @returns list of relative paths
   */
  projectSpecyficFiles(): string[] {
    //#region @backendFunc
    let files = [];

    if (this.project.framework.isContainer) {
      return this.projectSpecificFilesForContainer();
    }

    if (this.project.framework.isStandaloneProject) {
      files = this.projectSpecificFilesForStandalone();
    }

    return files;
    //#endregion
  }
  //#endregion

  //#region handle project specyfic files
  handleProjectSpecyficFiles(): void {
    //#region @backendFunc
    let defaultProjectProptotype: Project;

    defaultProjectProptotype = this.project.ins.by(
      this.project.type,
      this.project.framework.frameworkVersion,
    ) as Project;

    const files: RecreateFile[] = [];

    if (
      crossPlatformPath(this.project.location) ===
      crossPlatformPath(defaultProjectProptotype?.location)
    ) {
      // nothing
    } else if (defaultProjectProptotype) {
      const projectSpecyficFiles =
        this.project.artifactsManager.filesRecreator.projectSpecyficFiles();
      // console.log({
      //   projectSpecyficFiles,
      //   project: this.project.genericName
      // })
      projectSpecyficFiles.forEach(relativeFilePath => {
        relativeFilePath = crossPlatformPath(relativeFilePath);

        let from = crossPlatformPath(
          path.join(defaultProjectProptotype.location, relativeFilePath),
        );

        // console.log({ relativeFilePath, from });

        if (!Helpers.exists(from)) {
          if (
            defaultProjectProptotype.framework.frameworkVersionAtLeast('v2')
          ) {
            const notExistedTaonVersions = ['v17'];
            if (
              !notExistedTaonVersions.includes(
                // non existed taon versions here
                defaultProjectProptotype.framework.frameworkVersionMinusOne,
              )
            ) {
              const core = this.project.ins.by(
                defaultProjectProptotype.type,
                defaultProjectProptotype.framework.frameworkVersionMinusOne,
              );
              from = crossPlatformPath(
                path.join(core.location, relativeFilePath),
              );
            }
          }
        }

        const where = crossPlatformPath(
          path.join(this.project.location, relativeFilePath),
        );

        files.push({
          from,
          where,
        });
      });

      files.forEach(file => {
        Helpers.copyFile(file.from, file.where);
      });
    }
    //#endregion
  }
  //#endregion

  filesTemplatesForStandalone(): string[] {
    let templates = [];
    templates = [
      `${tsconfigJsonMainProject}${dotFileTemplateExt}`,
      `${tsconfigBackendDistJson}${dotFileTemplateExt}`,
    ];

    if (this.project.framework.frameworkVersionAtLeast('v2')) {
      templates = [
        `${tsconfigJsonIsomorphicMainProject}${dotFileTemplateExt}`,
        `${tsconfigIsomorphicFlatDistMainProject}${dotFileTemplateExt}`,
        `${tsconfigJsonBrowserMainProject}${dotFileTemplateExt}`,
        ...this.project.vsCodeHelpers.__vscodeFileTemplates,
        ...templates,
      ];
    }

    return templates;
  }

  //#region getters & methods / files templates
  /**
   * Generated automaticly file templates exmpale:
   * file.ts.filetemplate -> will generate file.ts
   * inside triple bracked: {{{  ENV. }}}
   * property ENV can be used to check files
   */
  public filesTemplates(): string[] {
    //#region @backendFunc
    // TODO should be abstract
    let templates = [];

    if (this.project.framework.isStandaloneProject) {
      return this.filesTemplatesForStandalone();
    }

    return templates;
    //#endregion
  }
  //#endregion
}
