//#region imports
import { frontendFiles } from 'tnp-core/src';
import { Helpers, _, path } from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';
import { BaseCompilerForProject } from 'tnp-helpers/src';

import {
  indexTsFromLibFromSrc,
  libFromSrc,
  srcMainProject,
  TaonGeneratedFolders,
} from '../../../../../constants';
import type { Project } from '../../../project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class AppRoutesAutogenProvider extends BaseCompilerForProject<
  {},
  // @ts-ignore TODO weird inheritance problem
  Project
> {
  public readonly propertyInTaonJsonc = 'shouldGenerateAutogenIndexFile';

  //#region @backend
  constructor(project: Project) {
    super(project, {
      folderPath: project.pathFor([srcMainProject, libFromSrc]),
      subscribeOnlyFor: ['ts', 'tsx'],
      taskName: 'AppTsRoutesAutogenProvider',
    });
  }
  //#endregion

  private contextsRelativePaths: string[] = [];
  private routesRelativePaths: string[] = [];

  private processFile(absFilePath: string) {
    //#region @backendFunc
    // if (!Helpers.isFolder(absFilePath)) {
    //   const exportsFounded = UtilsTypescript.exportsFromFile(absFilePath);
    //   const relativePath = absFilePath.replace(
    //     this.project.pathFor([srcMainProject, libFromSrc]) + '/',
    //     '',
    //   );

    //   // TODO @LAST this is not watching files!
    //   // console.log(`Processing file for index autogen: ${relativePath}`);

    //   const isBrowserSpecific = frontendFiles.some(ext =>
    //     relativePath.endsWith(ext),
    //   );
    //   const exportString =
    //     `export * from ` +
    //     `'./${relativePath.replace(path.extname(relativePath), '')}'; ` +
    //     `${isBrowserSpecific ? `// @${'bro' + 'wser'}` : ''}`;

    //   if (exportsFounded.length > 0) {
    //     if (
    //       !this.lazyRoutesPaths.includes(exportString) &&
    //       !relativePath.startsWith(`${TaonGeneratedFolders.ENV_FOLDER}/`) &&
    //       !relativePath.startsWith(`${indexTsFromLibFromSrc}`)
    //     ) {
    //       this.lazyRoutesPaths.push(exportString);
    //     }
    //   } else {
    //     this.lazyRoutesPaths = this.lazyRoutesPaths.filter(
    //       e => e !== exportString,
    //     );
    //   }
    // }
    //#endregion
  }

  public writeDataIntoAppTs() {
    //#region @backendFunc
    const contextsFromSrcAppFolder = [];
    const routesFromSrcAppFolder = [];
    // @TODO @LAST
    //#endregion
  }

  async syncAction(
    absolteFilesPathes?: string[],
    initialParams?: {},
  ): Promise<void> {
    //#region @backendFunc
    Helpers.logInfo(`App.ts provider for project: ${this.project.genericName}`);
    // console.log(`Generating index autogen file...`, { absolteFilesPathes });
    for (const absFilePath of absolteFilesPathes) {
      this.processFile(absFilePath);
    }
    this.writeDataIntoAppTs();
    Helpers.taskDone(
      `App.ts provider for project: ${this.project.genericName}`,
    );
    //#endregion
  }
}
