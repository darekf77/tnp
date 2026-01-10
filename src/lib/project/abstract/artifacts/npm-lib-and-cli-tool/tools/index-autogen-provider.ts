import { ChangeOfFile } from 'incremental-compiler/src';
import {
  config,
  extAllowedToReplace,
  fileName,
  frontendFiles,
} from 'tnp-core/src';
import { crossPlatformPath, Helpers, _, path } from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';
import { BaseCompilerForProject } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import {
  environmentsFolder,
  envTs,
  indexScssFromSrcLib,
  indexTsFromLibFromSrc,
  libFromSrc,
  srcMainProject,
  TaonGeneratedFiles,
  TaonGeneratedFolders,
  taonJsonMainProject,
} from '../../../../../constants';
import type { Project } from '../../../project';

// @ts-ignore TODO weird inheritance problem
export class IndexAutogenProvider extends BaseCompilerForProject<{}, Project> {
  public readonly propertyInTaonJsonc = 'shouldGenerateAutogenIndexFile';

  //#region @backend
  constructor(project: Project) {
    super(project, {
      folderPath: project.pathFor([srcMainProject, libFromSrc]),
      subscribeOnlyFor: ['ts', 'tsx'],
      taskName: 'IndexAutogenProvider',
    });
  }
  //#endregion

  get generateIndexAutogenFile(): boolean {
    //#region @backendFunc
    return this.project.taonJson.shouldGenerateAutogenIndexFile;
    //#endregion
  }

  get indexAutogenFileRelativePath() {
    //#region @backendFunc
    return crossPlatformPath([
      srcMainProject,
      libFromSrc,
      TaonGeneratedFiles.index_generated_ts,
    ]);
    //#endregion
  }

  private exportsToSave: string[] = [];

  private processFile(absFilePath: string) {
    //#region @backendFunc
    if (!Helpers.isFolder(absFilePath)) {
      const exportsFounded = UtilsTypescript.exportsFromFile(absFilePath);
      const relativePath = absFilePath.replace(
        this.project.pathFor([srcMainProject, libFromSrc]) + '/',
        '',
      );

      // TODO @LAST this is not watching files!
      // console.log(`Processing file for index autogen: ${relativePath}`);

      const isBrowserSpecific = frontendFiles.some(ext =>
        relativePath.endsWith(ext),
      );
      const exportString =
        `export * from ` +
        `'./${relativePath.replace(path.extname(relativePath), '')}'; ` +
        `${isBrowserSpecific ? `// @${'bro' + 'wser'}` : ''}`;

      if (exportsFounded.length > 0) {
        if (
          !this.exportsToSave.includes(exportString) &&
          !relativePath.startsWith(`${TaonGeneratedFolders.ENV_FOLDER}/`) &&
          !relativePath.startsWith(`${indexTsFromLibFromSrc}`)
        ) {
          this.exportsToSave.push(exportString);
        }
      } else {
        this.exportsToSave = this.exportsToSave.filter(e => e !== exportString);
      }
    }
    //#endregion
  }

  public writeIndexFile(isPlaceholderOnly = false) {
    //#region @backendFunc
    this.project.writeFile(
      this.indexAutogenFileRelativePath,

      `// @ts-no${'check'}
// This file is auto-generated during init process. Do not modify.
// ${
        isPlaceholderOnly
          ? `This is only placeholder.` +
            `\n// Use property "${this.propertyInTaonJsonc}: true" ` +
            `\n// in ${taonJsonMainProject} to enable ts exports auto generation.`
          : `This disable this auto generate file.` +
            `\n// set property "${this.propertyInTaonJsonc}: false" ` +
            `\n// in ${taonJsonMainProject} of your project.`
      } \n` + this.exportsToSave.join('\n'),
    );
    //#endregion
  }

  async syncAction(
    absolteFilesPathes?: string[],
    initialParams?: {},
  ): Promise<void> {
    //#region @backendFunc
    Helpers.logInfo(
      `IndexAutogenProvider for project: ${this.project.genericName}`,
    );
    // console.log(`Generating index autogen file...`, { absolteFilesPathes });
    for (const absFilePath of absolteFilesPathes) {
      this.processFile(absFilePath);
    }
    this.writeIndexFile();
    Helpers.taskDone(
      `IndexAutogenProvider for project: ${this.project.genericName}`,
    );
    //#endregion
  }
}
