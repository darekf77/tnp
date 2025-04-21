import { ChangeOfFile } from 'incremental-compiler/src';
import { config, extAllowedToReplace } from 'tnp-config/src';
import { crossPlatformPath, Helpers, _, path } from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';
import { BaseCompilerForProject } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import type { Project } from '../../../project';

// @ts-ignore TODO weird inheritance problem
export class IndexAutogenProvider extends BaseCompilerForProject<{}, Project> {
  public readonly propertyInTaonJsonc = 'shouldGenerateAutogenIndexFile';

  //#region @backend
  constructor(project: Project) {
    super(project, {
      folderPath: project.pathFor([config.folder.src, config.folder.lib]),
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
      config.folder.src,
      config.folder.lib,
      config.file.index_generated_ts,
    ]);
    //#endregion
  }

  private exportsToSave: string[] = [];

  private processFile(absFilePath: string, writeAsync = false) {
    //#region @backendFunc
    if (!Helpers.isFolder(absFilePath)) {
      const exportsFounded = UtilsTypescript.exportsFromFile(absFilePath);
      const exportString =
        `export * from ` +
        `'./${absFilePath
          .replace(this.project.location + '/src/lib/', '')
          .replace(path.extname(absFilePath), '')}';`;

      if (exportsFounded.length > 0) {
        if (!this.exportsToSave.includes(exportString)) {
          this.exportsToSave.push(exportString);
        }
      } else {
        this.exportsToSave = this.exportsToSave.filter(e => e !== exportString);
      }
      if (writeAsync) {
        this.debounceWrite();
      }
    }
    //#endregion
  }

  public writeIndexFile(isPlaceholderOnly = false) {
    //#region @backendFunc
    this.project.writeFile(
      this.indexAutogenFileRelativePath,

      `// @ts-no${'check'}
// This file is auto-generated. Do not modify.
// ${
        isPlaceholderOnly
          ? `This is only placeholder.` +
            `\n// Use property "${this.propertyInTaonJsonc}: true" ` +
            `\n// in ${config.file.taon_jsonc} to enable ts exports auto generation.`
          : `This disable this auto generate file.` +
            `\n// set property "${this.propertyInTaonJsonc}: false" ` +
            `\n// in ${config.file.taon_jsonc} of your project.`
      } \n` + this.exportsToSave.join('\n'),
    );
    //#endregion
  }

  private debounceWrite = _.debounce(() => {
    this.writeIndexFile();
  }, 1000);

  async syncAction(
    absolteFilesPathes?: string[],
    initialParams?: {},
  ): Promise<void> {
    //#region @backendFunc
    Helpers.logInfo(
      `IndexAutogenProvider for project: ${this.project.genericName}`,
    );
    for (const absFilePath of absolteFilesPathes) {
      this.processFile(absFilePath);
    }
    this.writeIndexFile();
    Helpers.taskDone(
      `IndexAutogenProvider for project: ${this.project.genericName}`,
    );
    //#endregion
  }

  async asyncAction(
    asyncEvents: ChangeOfFile,
    initialParams?: {},
  ): Promise<void> {
    //#region @backendFunc
    this.processFile(asyncEvents.fileAbsolutePath, true);
    //#endregion
  }
}
