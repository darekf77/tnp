import { extAllowedToExportAndReplaceTSJSCodeFiles } from 'tnp-core/src';
import { path, _, Utils } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { UtilsTypescript } from 'tnp-helpers/src';

import { DUMMY_LIB, taonIgnore } from '../../../../../../../constants';

import { CodeSplitProcess } from './code-split-process.enum';
import type { CallBackProcess } from './code-split-process.enum';
import { UtilsCodeCut } from './utils-code-cut';

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
  ) {
    this._importExports =
      UtilsTypescript.recognizeImportsFromContent(fileContent);
    this.processImportsExports();
  }

  //#region get content
  get content(): { modifiedContent: string; rewriteFile: boolean } {
    //#region @backendFunc
    if (
      _.isUndefined(
        extAllowedToExportAndReplaceTSJSCodeFiles.find(a =>
          this.filePath.endsWith(a),
        ),
      )
    ) {
      // console.error(`Not allowed to export and replace file: ${this.filePath}`);
      return { modifiedContent: this.fileContent, rewriteFile: false };
    }

    const BEFORE_PROCESSES = Object.values(
      CodeSplitProcess.Before.Split.ImportExport,
    );
    for (const imp of this._importExports) {
      if (!imp.isIsomorphic) {
        continue;
      }
      for (const processFun of BEFORE_PROCESSES) {
        if (_.isFunction(processFun)) {
          const rewrite = (processFun as ReturnType<typeof CallBackProcess>)(
            imp,
            this.isomorphicLibraries,
            this.currentProjectName,
            this.currentProjectNpmName,
          );
          if (!this.rewriteFile && rewrite) {
            this.rewriteFile = true;
            break;
          }
        }
      }
    }

    const result = UtilsCodeCut.replaceInFile(this.fileContent, this._importExports);
    return { modifiedContent: result, rewriteFile: this.rewriteFile };
    //#endregion
  }
  //#endregion

  private processImportsExports(): void {
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
  }

}
