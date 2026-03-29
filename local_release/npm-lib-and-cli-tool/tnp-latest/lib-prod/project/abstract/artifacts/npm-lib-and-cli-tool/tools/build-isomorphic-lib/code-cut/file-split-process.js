import { extAllowedToExportAndReplaceTSJSCodeFiles } from 'tnp-core/lib-prod';
import { ___NS__first, ___NS__isFunction, ___NS__isUndefined, Utils__NS__escapeStringForRegEx } from 'tnp-core/lib-prod';
import { UtilsTypescript__NS__recognizeImportsFromContent } from 'tnp-helpers/lib-prod';
import { DUMMY_LIB, taonIgnore } from '../../../../../../../constants';
import { CodeSplitProcess__NS__Before__NS__Split__NS__ImportExport } from './code-split-process.enum';
export class SplitFileProcess {
    fileContent;
    filePath;
    isomorphicLibraries;
    currentProjectName;
    currentProjectNpmName;
    get importExports() {
        return this._importExports;
    }
    rewriteFile = false;
    constructor(fileContent, filePath, isomorphicLibraries, currentProjectName, currentProjectNpmName) {
        this.fileContent = fileContent;
        this.filePath = filePath;
        this.isomorphicLibraries = isomorphicLibraries;
        this.currentProjectName = currentProjectName;
        this.currentProjectNpmName = currentProjectNpmName;
        this._importExports =
            UtilsTypescript__NS__recognizeImportsFromContent(fileContent);
        this.processImportsExports();
    }
    //#region get content
    get content() {
        //#region @backendFunc
        if (___NS__isUndefined(extAllowedToExportAndReplaceTSJSCodeFiles.find(a => this.filePath.endsWith(a)))) {
            // console.error(`Not allowed to export and replace file: ${this.filePath}`);
            return { modifiedContent: this.fileContent, rewriteFile: false };
        }
        const BEFORE_PROCESSES = Object.values(CodeSplitProcess__NS__Before__NS__Split__NS__ImportExport);
        for (const imp of this._importExports) {
            if (!imp.isIsomorphic) {
                continue;
            }
            for (const processFun of BEFORE_PROCESSES) {
                if (___NS__isFunction(processFun)) {
                    const rewrite = processFun(imp, this.isomorphicLibraries, this.currentProjectName, this.currentProjectNpmName);
                    if (!this.rewriteFile && rewrite) {
                        this.rewriteFile = true;
                        break;
                    }
                }
            }
        }
        const result = this.replaceInFile(this.fileContent, this._importExports);
        return { modifiedContent: result, rewriteFile: this.rewriteFile };
        //#endregion
    }
    //#endregion
    processImportsExports() {
        for (const imp of this._importExports) {
            // TODO @LAST better detect deep isomorphic packages
            const matchRegex = new RegExp(`^(${this.isomorphicLibraries
                .sort((a, b) => b.length - a.length)
                .map(a => Utils__NS__escapeStringForRegEx(a))
                .join('|')})`);
            const match = imp.cleanEmbeddedPathToFile.match(matchRegex);
            // console.log(`match: >>${matchRegex.source}<< for >>${imp.embeddedPathToFile}<<`);
            const isDummyLib = imp.cleanEmbeddedPathToFile.startsWith(`${DUMMY_LIB}/`) ||
                imp.cleanEmbeddedPathToFile === DUMMY_LIB;
            imp.isIsomorphic =
                (Array.isArray(match) && match.length > 0) || isDummyLib;
            if (imp.isIsomorphic) {
                if (isDummyLib) {
                    imp.packageName = DUMMY_LIB;
                }
                else {
                    imp.packageName = ___NS__first(match);
                }
                // console.log('isIsomorphic', imp.packageName, imp.embeddedPathToFile);
            }
            else {
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
    replaceInFile(fileContent, imports, debug = false) {
        // Split the content into lines
        const lines = fileContent.split('\n');
        // Sort the imports by descending order of startRow and startCol
        // This ensures that changes do not affect the indices of upcoming replacements
        imports.sort((a, b) => {
            if (a.startRow === b.startRow) {
                return b.startCol - a.startCol; // Sort by column when in the same row
            }
            return b.startRow - a.startRow; // Otherwise, sort by row
        });
        // if (debug) debugger;
        // Perform replacements from last to first
        for (const imp of imports) {
            const startLineIdx = imp.startRow - 1;
            const endLineIdx = imp.endRow - 1;
            if (startLineIdx >= lines.length ||
                endLineIdx >= lines.length ||
                startLineIdx > endLineIdx) {
                continue;
            }
            // Check if previous line contains ignore tag
            const prevLine = lines[startLineIdx - 1];
            if (prevLine && prevLine.includes(taonIgnore)) {
                continue;
            }
            // Extract the full original content of the import/export
            const originalBlock = lines
                .slice(startLineIdx, endLineIdx + 1)
                .join('\n');
            // Replace the embeddedPathToFile with embeddedPathToFileResult
            const modifiedBlock = originalBlock.replace(imp.embeddedPathToFile, imp.embeddedPathToFileResult);
            // Split modified block back into lines and replace the original lines
            const modifiedLines = modifiedBlock.split('\n');
            lines.splice(startLineIdx, endLineIdx - startLineIdx + 1, ...modifiedLines);
        }
        // Join the modified lines back into a single string
        return lines.join('\n');
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/build-isomorphic-lib/code-cut/file-split-process.js.map