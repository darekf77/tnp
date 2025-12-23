//#region imports
import { BaseTaonClassesNames, TAON_FLATTEN_MAPPING } from 'taon/src';
import { config, fileName, frontendFiles, Utils } from 'tnp-core/src';
import { _, CoreModels, crossPlatformPath, path } from 'tnp-core/src';
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import { srcMainProject } from '../../constants';
import type { Project } from '../abstract/project';
//#endregion

//#region format regions
/**
 * QUICK_FIX for spaces after and before each region
 * Formats TypeScript region comments:
 * - Ensures a blank line BEFORE each #region / region
 * - Ensures a blank line AFTER each #endregion / endregion
 *   (but skips the "after" blank line if it's the final region before a closing })
 */
export function formatRegions(code: string): string {
  const lines = code.split(/\r?\n/);
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const current = lines[i];
    const trimmed = current.trim();

    // === 1. Detect //#region or // region (with optional text after) ===
    const isRegionStart = /^\s*\/\/\s*#?\s*region\b/i.test(trimmed);

    if (isRegionStart) {
      // Ensure there's a blank line BEFORE this region (unless it's the very first line)
      if (result.length > 0) {
        const last = result[result.length - 1];
        if (last !== '') {
          result.push(''); // insert blank line before region
        }
      }
      result.push(current);
    }
    // === 2. Detect //#endregion or // endregion ===
    else if (/^\s*\/\/\s*#?\s*endregion\b/i.test(trimmed)) {
      result.push(current);

      // Look ahead: skip blank line after if next non-empty line is just "}" (or "};" / "},")
      let nextIdx = i + 1;
      while (nextIdx < lines.length && lines[nextIdx].trim() === '') {
        nextIdx++;
      }

      const nextLineTrimmed =
        nextIdx < lines.length ? lines[nextIdx].trim() : '';
      const isEndOfBlock = /^[\}\)];?,]?$/.test(nextLineTrimmed);

      if (!isEndOfBlock) {
        // Not the end of a block → ensure blank line after
        if (i + 1 >= lines.length || lines[i + 1].trim() !== '') {
          result.push(''); // insert blank line
        }
        // else: already has blank line(s), we'll keep just one later if needed
      }
      // else: do NOT add blank line — it's the final region before closing brace
    }
    // === 3. Regular line ===
    else {
      result.push(current);
    }

    i++;
  }

  // Optional: clean up multiple consecutive blank lines (keep only one)
  const cleaned = result
    .join('\n')
    .replace(/\n{3,}/g, '\n\n') // 3+ → 2
    .replace(/^\n+/, '') // remove leading newlines
    .replace(/\n+$/, '\n'); // ensure single trailing newline

  return cleaned;
}
//#endregion

// @ts-ignore TODO weird inheritance problem
export class Refactor extends BaseFeatureForProject<Project> {
  //#region prepare options
  private prepareOptions(options?: { fixSpecificFile?: string | undefined }) {
    options = options || {};
    if (options.fixSpecificFile) {
      if (
        path.isAbsolute(options.fixSpecificFile) &&
        Helpers.exists(options.fixSpecificFile)
      ) {
        // ok
      } else {
        options.fixSpecificFile = this.project.pathFor(options.fixSpecificFile);
        if (
          path.isAbsolute(options.fixSpecificFile) &&
          Helpers.exists(options.fixSpecificFile)
        ) {
          // ok
        } else {
          delete options.fixSpecificFile;
        }
      }
    }
    return options;
  }
  //#endregion

  async ALL(options?: {
    initingFromParent?: boolean;
    fixSpecificFile?: string | undefined;
  }) {
    options = this.prepareOptions(options);

    this.project.taonJson.setFrameworkVersion(
      ('v' +
        this.project.ins.angularMajorVersionForCurrentCli()) as CoreModels.FrameworkVersion,
    );
    if (this.project.framework.isContainer) {
      await this.project.init();
      for (const child of this.project.children) {
        await child.refactor.ALL(options);
      }
    }
    if (!options.initingFromParent) {
      await this.project.init();
    }
    this.project.taonJson.updateIsomorphicExternalDependencies();
    await this.changeCssToScss(options);

    await this.taonNames(options);
    await this.flattenImports(options);
    await this.removeBrowserRegion(options);
    await this.properStandaloneNg19(options);
    await this.eslint(options);
    await this.importsWrap(options);

    await this.prettier(options);
    this.project.vsCodeHelpers.toogleFilesVisibilityInVscode({
      action: 'hide-files',
    });
  }

  async prettier(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers.info(`Running prettier...`);
    if (options.fixSpecificFile) {
      await UtilsTypescript.formatFile(options.fixSpecificFile);
      Helpers.info(`Prettier done for file ${options.fixSpecificFile}`);
      return;
    }
    UtilsTypescript.fixHtmlTemplatesInDir(this.project.pathFor(srcMainProject));
    this.project.formatAllFiles();
    Helpers.info(`Prettier done`);
    //#endregion
  }

  async eslint(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers.info(`Running eslint fix...`);

    if (options.fixSpecificFile) {
      await UtilsTypescript.eslintFixFile(options.fixSpecificFile);
      Helpers.info(`Eslint fix done for file ${options.fixSpecificFile}`);
      return;
    }
    await UtilsTypescript.eslintFixAllFilesInsideFolder([
      this.project.pathFor(srcMainProject),
    ]);
    Helpers.info(`Eslint fix done`);
    //#endregion
  }

  async removeBrowserRegion(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers.info(`Running ${'@bro' + 'wser'} region fixer...`);
    const removeBrowserRegion = (content: string): string => {
      const lines = content.trim().split('\n');

      const regionStartRegex = /^\s*\/\/#region\s+@browser\s*$/;
      const regionEndRegex = /^\s*\/\/#endregion\s*$/;

      if (regionStartRegex.test(lines[0])) {
        lines.shift();
      }

      if (regionEndRegex.test(lines[lines.length - 1])) {
        lines.pop();
      }

      return lines.join('\n').trim();
    };

    Helpers.getFilesFrom(this.project.pathFor(srcMainProject), {
      recursive: true,
      // followSymlinks: false TODO ? maybe ?
    })
      .filter(f => {
        return (
          f.endsWith('.ts') &&
          !_.isUndefined(
            frontendFiles.find(ff => path.basename(f).endsWith(ff)),
          )
        );
      })
      .forEach(f => {
        let content = Helpers.readFile(f);
        if (content) {
          const fixedContent = removeBrowserRegion(content);
          if (fixedContent.trim() !== content.trim()) {
            Helpers.info(`Removing browser region from ${f}`);
            Helpers.writeFile(f, fixedContent);
          }
        }
      });
    Helpers.taskDone(`@browser region fixer done`);
    //#endregion
  }

  async changeCssToScss(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers.info(`Changing css to scss replacer.`);

    Helpers.getFilesFrom(this.project.pathFor(srcMainProject), {
      recursive: true,
      followSymlinks: false,
    }).forEach(f => {
      if (options.fixSpecificFile && f !== options.fixSpecificFile) {
        return;
      }
      const tsFile = crossPlatformPath([
        path.dirname(f),
        path.basename(f).replace('.css', '.ts'),
      ]);
      const tsFileCmp = crossPlatformPath([
        path.dirname(f),
        path.basename(f).replace('.css', '.component.ts'),
      ]);
      const tsFileContainer = crossPlatformPath([
        path.dirname(f),
        path.basename(f).replace('.css', '.container.ts'),
      ]);
      if (
        f.endsWith('.css') &&
        (Helpers.exists(tsFile) ||
          Helpers.exists(tsFileCmp) ||
          Helpers.exists(tsFileContainer))
      ) {
        Helpers.writeFile(
          crossPlatformPath([
            path.dirname(f),
            path.basename(f).replace('.css', '.scss'),
          ]),
          Helpers.readFile(f),
        );
        Helpers.removeFileIfExists(f);
        const scssBaseName = path.basename(f).replace('.css', '.scss');

        if (Helpers.exists(tsFile)) {
          Helpers.writeFile(
            tsFile,
            (Helpers.readFile(tsFile) || '').replace(
              path.basename(f),
              scssBaseName,
            ),
          );
        }

        if (Helpers.exists(tsFileCmp)) {
          Helpers.writeFile(
            tsFileCmp,
            (Helpers.readFile(tsFileCmp) || '').replace(
              path.basename(f),
              scssBaseName,
            ),
          );
        }

        if (Helpers.exists(tsFileContainer)) {
          Helpers.writeFile(
            tsFileContainer,
            (Helpers.readFile(tsFileContainer) || '').replace(
              path.basename(f),
              scssBaseName,
            ),
          );
        }
      }
    });
    Helpers.taskDone(`Changing css to scss done`);
    //#endregion
  }

  async properStandaloneNg19(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers.info(`Setting proper standalone property for ng19+...`);

    Helpers.getFilesFrom(this.project.pathFor(srcMainProject), {
      recursive: true,
      followSymlinks: false,
    }).forEach(f => {
      if (options.fixSpecificFile && f !== options.fixSpecificFile) {
        return;
      }
      if (f.endsWith('.ts')) {
        let content = Helpers.readFile(f);
        const fixedComponent =
          UtilsTypescript.transformComponentStandaloneOption(content);
        if (fixedComponent.trim() !== content.trim()) {
          Helpers.info(`Fixing standalone option in ${f}`);
          Helpers.writeFile(f, fixedComponent);
        }
      }
    });
    Helpers.taskDone(`Done setting standalone property for ng19+...`);
    //#endregion
  }

  async importsWrap(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers.info(`Wrapping first imports with imports region...`);

    Helpers.getFilesFrom(this.project.pathFor(srcMainProject), {
      recursive: true,
      followSymlinks: false,
    }).forEach(f => {
      if (options.fixSpecificFile && f !== options.fixSpecificFile) {
        return;
      }
      if (f.endsWith('.ts')) {
        let content = Helpers.readFile(f);
        const fixedComponent = formatRegions(
          UtilsTypescript.wrapFirstImportsInImportsRegion(content),
        );
        if (fixedComponent.trim() !== content.trim()) {
          Helpers.info(`Fixing imports region in ${f}`);
          Helpers.writeFile(f, fixedComponent);
        }
      }
    });
    Helpers.taskDone(`Done wrapping first imports with region...`);
    //#endregion
  }

  async flattenImports(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    options = this.prepareOptions(options);
    Helpers.info(`Flattening imports...`);

    Helpers.getFilesFrom(this.project.pathFor(srcMainProject), {
      recursive: true,
      followSymlinks: false,
    }).forEach(f => {
      if (options.fixSpecificFile && f !== options.fixSpecificFile) {
        return;
      }
      if (f.endsWith('.ts')) {
        let content = Helpers.readFile(f);
        const fixedComponent = formatRegions(
          UtilsTypescript.transformFlatImports(content, TAON_FLATTEN_MAPPING),
        );
        if (fixedComponent.trim() !== content.trim()) {
          Helpers.info(`Fixing imports region in ${f}`);
          Helpers.writeFile(f, fixedComponent);
        }
      }
    });
    Helpers.taskDone(`Done flattening imports...`);
    //#endregion
  }

  async taonNames(options: { fixSpecificFile?: string }) {
    //#region @backendFunc
    const names = [
      ...BaseTaonClassesNames,
      Utils.escapeStringForRegEx('tnp-config'),
    ];
    options = this.prepareOptions(options);
    Helpers.info(`Fixing taon class names...`);
    Helpers.getFilesFrom(this.project.pathFor(srcMainProject), {
      recursive: true,
      followSymlinks: false,
    }).forEach(f => {
      if (options.fixSpecificFile && f !== options.fixSpecificFile) {
        return;
      }
      if (f.endsWith('.ts')) {
        let content = Helpers.readFile(f);
        let fixedComponent = content;
        for (const taonClassName of names) {
          fixedComponent = fixedComponent
            .replace(
              new RegExp(`(?<!Taon)${taonClassName}`, 'g'),
              `Taon${taonClassName}`,
            )
            .replace(
              new RegExp(`TaonTaon${taonClassName}`, 'g'),
              `Taon${taonClassName}`,
            );
        }

        if (fixedComponent.trim() !== content.trim()) {
          Helpers.info(`Fixing taon class names in ${f}`);
          Helpers.writeFile(f, fixedComponent);
        }
      }
    });
    Helpers.taskDone(`Done fixing taon class names...`);
    //#endregion
  }
}
