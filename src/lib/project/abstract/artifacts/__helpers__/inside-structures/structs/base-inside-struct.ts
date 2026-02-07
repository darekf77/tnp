//#region imports
import { crossPlatformPath, folderName, Helpers, path } from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';

import { templateFolderForArtifact } from '../../../../../../app-utils';
import {
  libFromImport,
  srcFromTaonImport,
  srcNgProxyProject,
  TemplateFolder,
} from '../../../../../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../../../../../options';
import type { Project } from '../../../../project';
import { InsideStruct } from '../inside-struct';
//#endregion

export abstract class BaseInsideStruct {
  relativePaths(): string[] {
    const root = this.project.framework.coreProject.pathFor(
      templateFolderForArtifact(this.getCurrentArtifact()),
    );
    const files = Helpers.getFilesFrom(root, {
      recursive: true,
      followSymlinks: false,
    }).map(f => f.replace(`${crossPlatformPath(path.dirname(root))}/`, ''));
    // console.log({
    //   files
    // })

    return files;
  }

  abstract insideStruct(): InsideStruct;

  abstract getCurrentArtifact(): ReleaseArtifactTaon;

  constructor(
    public readonly project: Project,
    public readonly initOptions: EnvOptions,
  ) {}

  //#region replace imports for browser or websql
  replaceImportsForBrowserOrWebsql(
    fileContent: string,
    { websql }: { websql: boolean },
  ): string {
    //#region @backendFunc
    const importExports =
      UtilsTypescript.recognizeImportsFromContent(fileContent);
    for (const imp of importExports) {
      if (imp.cleanEmbeddedPathToFile.endsWith(`/${srcFromTaonImport}`)) {
        fileContent = fileContent.replace(
          imp.cleanEmbeddedPathToFile,
          imp.cleanEmbeddedPathToFile.replace(
            `/${srcFromTaonImport}`,
            websql ? `/${folderName.websql}` : `/${folderName.browser}`,
          ),
        );
      }
    }
    if (websql) {
      fileContent = fileContent.replace(
        'const websqlMode = false;',
        'const websqlMode = true;',
      );
    }

    return fileContent;
    //#endregion
  }
  //#endregion

  //#region replace imports for backend
  replaceImportsForBackend(fileContent: string): string {
    //#region @backendFunc
    const importExports =
      UtilsTypescript.recognizeImportsFromContent(fileContent);
    for (const imp of importExports) {
      if (imp.cleanEmbeddedPathToFile.endsWith(`/${srcFromTaonImport}`)) {
        fileContent = fileContent.replace(
          imp.cleanEmbeddedPathToFile,
          imp.cleanEmbeddedPathToFile.replace(
            `/${srcFromTaonImport}`,
            `/${libFromImport}`,
          ),
        );
      }
    }
    return fileContent;
    //#endregion
  }
  //#endregion
}
