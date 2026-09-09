//#region imports
import { extAllowedToExportAndReplaceTSJSCodeFiles } from 'tnp-core/src';
import { path, _, Utils } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { UtilsTypescript } from 'tnp-helpers/src';

import { DUMMY_LIB, taonIgnore } from '../../../../../../../constants';

import type { BrowserCodeCut } from './browser-code-cut';
import { CodeSplitProcess } from './code-split-process.enum';
import type { CallBackProcess } from './code-split-process.enum';
import { UtilsCodeCut } from './utils-code-cut';
//#endregion

export class SplitFileProcess {
  declare _importExports: UtilsTypescript.TsImportExport[];

  get importExports(): UtilsTypescript.TsImportExport[] {
    return this._importExports;
  }

  private rewriteFile: boolean = false;

  constructor(
    private readonly fileContent: string,
    private readonly filePath: string,
    private readonly isomorphicLibraries: string[],
    private readonly currentProjectName: string,
    private readonly currentProjectNpmName: string,
    private readonly browserCodeCut: BrowserCodeCut,
    private readonly relativeFilesToProcess: Map<string, boolean>,
  ) {
    this._importExports =
      UtilsTypescript.recognizeImportsFromContent(fileContent);
    this.processImportsExports();
  }

  //#region get content
  get content(): {
    modifiedContent: string;
    rewriteFile: boolean;
  } {
    //#region @backendFunc
    if (
      _.isUndefined(
        extAllowedToExportAndReplaceTSJSCodeFiles.find(a =>
          this.filePath.endsWith(a),
        ),
      )
    ) {
      // console.error(`Not allowed to export and replace file: ${this.filePath}`);
      return {
        modifiedContent: this.fileContent,
        rewriteFile: false,
        // importsToAppend: [],
      };
    }

    const BEFORE_PROCESSES = Object.values(
      CodeSplitProcess.Before.Split.ImportExport,
    );
    const importsToAppend: Pick<
      UtilsTypescript.TsImportExport,
      'cleanEmbeddedPathToFile' | 'importElements'
    >[] = [];

    for (const imp of this._importExports) {
      for (const processFun of BEFORE_PROCESSES) {
        if (_.isFunction(processFun)) {
          const rewrite = (processFun as ReturnType<typeof CallBackProcess>)(
            imp,
            this.isomorphicLibraries,
            this.currentProjectName,
            this.currentProjectNpmName,
            this.browserCodeCut,
            this.relativeFilesToProcess,
            importToAppend => {
              importsToAppend.push(importToAppend);
            },
          );
          if (!this.rewriteFile && (rewrite || importsToAppend.length > 0)) {
            this.rewriteFile = true;
            break;
          }
        }
      }
    }

    let tsFileContent = UtilsCodeCut.replaceInFile(
      this.fileContent,
      this._importExports,
    );

    tsFileContent = this.deleteMarkedForDeletion(tsFileContent);

    tsFileContent = this.deleteMarkedImportElements(tsFileContent);

    for (const imp of importsToAppend) {
      tsFileContent = UtilsTypescript.addOrUpdateImportIfNotExists(
        tsFileContent,
        imp.importElements,
        imp.cleanEmbeddedPathToFile,
      );
    }

    return {
      modifiedContent: tsFileContent,
      rewriteFile: this.rewriteFile,
      // importsToAppend,
    };
    //#endregion
  }
  //#endregion

  private deleteMarkedImportElements(tsFileContent: string): string {
    //#region @backendFunc
    let contentLines = tsFileContent.split('\n');

    const importsToModify = this._importExports
      .filter(f => f.markForDeletionImportElems?.length > 0)
      .sort((a, b) => b.startRow - a.startRow);

    for (const imp of importsToModify) {
      const startLineIdx = imp.startRow - 1;
      const endLineIdx = imp.endRow - 1;

      if (
        startLineIdx >= contentLines.length ||
        endLineIdx >= contentLines.length ||
        startLineIdx > endLineIdx
      ) {
        continue;
      }

      const importContent = contentLines
        .slice(startLineIdx, endLineIdx + 1)
        .join('\n');

      const updatedImportContent = importContent.replace(
        /\{([\s\S]*?)\}/,
        (_, importsInside: string) => {
          const importElements = importsInside
            .split(',')
            .map(elem => elem.trim())
            .filter(Boolean);

          const remainingImportElements = importElements.filter(elem => {
            return !imp.markForDeletionImportElems.some(toDelete => {
              const importedName = elem
                .replace(/^type\s+/, '')
                .split(/\s+as\s+/)[0]
                .trim();

              return importedName === toDelete;
            });
          });

          if (remainingImportElements.length === 0) {
            return `{ /* nothing here */ }`;
          }

          return `{ ${remainingImportElements.join(', ')} }`;
        },
      );

      contentLines.splice(
        startLineIdx,
        endLineIdx - startLineIdx + 1,
        ...updatedImportContent.split('\n'),
      );
    }

    tsFileContent = contentLines.join('\n');
    return tsFileContent;
    //#endregion
  }

  private deleteMarkedForDeletion(tsFileContent: string): string {
    //#region @backendFunc
    let contentLines = tsFileContent.split('\n');

    const toDelete = this._importExports
      .filter(f => f.markForDeletion)
      .sort((a, b) => b.startRow - a.startRow);

    for (const imp of toDelete) {
      const startLineIdx = imp.startRow - 1;
      const endLineIdx = imp.endRow - 1;

      if (
        startLineIdx >= contentLines.length ||
        endLineIdx >= contentLines.length ||
        startLineIdx > endLineIdx
      ) {
        continue;
      }

      contentLines.splice(startLineIdx, endLineIdx - startLineIdx + 1);
    }

    tsFileContent = contentLines.join('\n');
    return tsFileContent;
    //#endregion
  }

  private processImportsExports(): void {
    //#region @backendFunc
    for (const imp of this._importExports) {
      // TODO better detect deep isomorphic packages
      const matchRegex = new RegExp(
        `^(${this.isomorphicLibraries
          .sort((a, b) => b.length - a.length)
          .map(a => Utils.escapeStringForRegEx(a))
          .join('|')})`,
      );
      const match = imp.cleanEmbeddedPathToFile.match(matchRegex);

      // console.log(`match: >>${matchRegex.source}<< for >>${imp.embeddedPathToFile}<<`);
      const isDummyLib =
        imp.cleanEmbeddedPathToFile.startsWith(`${DUMMY_LIB}/`) ||
        imp.cleanEmbeddedPathToFile === DUMMY_LIB;

      imp.isIsomorphic =
        (Array.isArray(match) && match.length > 0) || isDummyLib;

      if (imp.isIsomorphic) {
        if (isDummyLib) {
          imp.packageName = DUMMY_LIB;
        } else {
          imp.packageName = _.first(match);
        }
        // console.log('isIsomorphic', imp.packageName, imp.embeddedPathToFile);
      } else {
        // I am not doing anything with non-isomorphic packages
        // imp.packageName = imp.cleanEmbeddedPathToFile.startsWith('@')
        //   ? imp.cleanEmbeddedPathToFile.split('/').slice(0, 2).join('/')
        //   : imp.cleanEmbeddedPathToFile.split('/')[0];
        // console.log(
        //   'non isIsomorphic',
        //   imp.packageName,
        //   imp.embeddedPathToFile,
        // );
      }
    }
    //#endregion
  }
}
