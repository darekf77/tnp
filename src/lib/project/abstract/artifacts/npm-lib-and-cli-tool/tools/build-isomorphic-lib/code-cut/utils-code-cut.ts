import { UtilsTypescript } from 'tnp-helpers/src';

import { taonIgnore } from '../../../../../../../constants';

export namespace UtilsCodeCut {
  export const replaceInFile = (
    fileContent: string,
    imports: UtilsTypescript.TsImportExport[],
    debug: boolean = false,
  ): string => {
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

      if (
        startLineIdx >= lines.length ||
        endLineIdx >= lines.length ||
        startLineIdx > endLineIdx
      ) {
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
      const modifiedBlock = originalBlock.replace(
        imp.embeddedPathToFile,
        imp.embeddedPathToFileResult,
      );

      // Split modified block back into lines and replace the original lines
      const modifiedLines = modifiedBlock.split('\n');
      lines.splice(
        startLineIdx,
        endLineIdx - startLineIdx + 1,
        ...modifiedLines,
      );
    }
    // Join the modified lines back into a single string
    return lines.join('\n');
  };
}
