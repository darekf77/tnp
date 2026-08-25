import { UtilsTypescript } from 'tnp-helpers/src';

import { UtilsCodeCut } from './utils-code-cut';

describe('UtilsCodeCut.replaceInFile', () => {
  const source = `
import { TaonAdminService, TaonAdmin } from 'taon/src'; // @browser

import {
  TaonSessionContext,
  TaonSessionProvider,
  TaonSessionUser,
  TaonSessionUserRepository,
} from '@taon-dev/session/src';

import { TaonSessionComponent } from '@taon-dev/session/src'; // @browser

import { TaonStor } from 'taon-storage/lib';
`.trim();

  it('should replace taon session imports', () => {
    const imports =
      UtilsTypescript.recognizeImportsFromContent(source);

    const toReplace = imports.filter(
      imp => imp.cleanEmbeddedPathToFile === '@taon-dev/session/src',
    );

    for (const imp of toReplace) {
      imp.embeddedPathToFileResult =
        imp.wrapInParenthesis('./index');
    }

    const result = UtilsCodeCut.replaceInFile(
      source,
      toReplace,
    );

    expect(result).toBe(`
import { TaonAdminService, TaonAdmin } from 'taon/src'; // @browser

import {
  TaonSessionContext,
  TaonSessionProvider,
  TaonSessionUser,
  TaonSessionUserRepository,
} from './index';

import { TaonSessionComponent } from './index'; // @browser

import { TaonStor } from 'taon-storage/lib';
`.trim());
  });

  it('should replace both multiline and single-line imports', () => {
    const imports =
      UtilsTypescript.recognizeImportsFromContent(source);

    const sessionImports = imports.filter(
      imp => imp.cleanEmbeddedPathToFile === '@taon-dev/session/src',
    );

    expect(sessionImports).toHaveLength(2);

    expect(sessionImports[0].startRow).toBeLessThan(
      sessionImports[0].endRow,
    );

    expect(sessionImports[1].startRow).toBe(
      sessionImports[1].endRow,
    );

    for (const imp of sessionImports) {
      imp.embeddedPathToFileResult =
        imp.wrapInParenthesis('./index');
    }

    const result = UtilsCodeCut.replaceInFile(
      source,
      sessionImports,
    );

    expect(result).toContain(`} from './index';`);

    expect(result).toContain(
      `import { TaonSessionComponent } from './index'; // @browser`,
    );

    expect(result).not.toContain(
      `'@taon-dev/session/src'`,
    );
  });

  it('should demonstrate the problem when imports are recognized from different content', () => {
    const imports =
      UtilsTypescript.recognizeImportsFromContent(source);

    const sessionImports = imports.filter(
      imp => imp.cleanEmbeddedPathToFile === '@taon-dev/session/src',
    );

    for (const imp of sessionImports) {
      imp.embeddedPathToFileResult =
        imp.wrapInParenthesis('./index');
    }

    // Simulates ESM preprocessing/code cutting that changes line positions.
    const modifiedSource = `
const esmInjectedLine = true;

${source}
`.trim();

    const result = UtilsCodeCut.replaceInFile(
      modifiedSource,
      sessionImports,
    );

    // Current implementation uses row coordinates from `source`,
    // therefore they no longer point to the correct imports.
    expect(result).toContain(
      `'@taon-dev/session/src'`,
    );
  });
});
