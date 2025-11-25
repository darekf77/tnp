//#region imports
import { config, frontendFiles } from 'tnp-core/src';
import { _, CoreModels, crossPlatformPath, path } from 'tnp-core/src';
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import type { Project } from '../abstract/project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class Refactor extends BaseFeatureForProject<Project> {
  async ALL(initingFromParent = false) {
    this.project.taonJson.setFrameworkVersion(
      ('v' +
        this.project.ins.angularMajorVersionForCurrentCli()) as CoreModels.FrameworkVersion,
    );
    if (this.project.framework.isContainer) {
      await this.project.init();
      for (const child of this.project.children) {
        await child.refactor.ALL(true);
      }
    }
    if (!initingFromParent) {
      await this.project.init();
    }
    await this.changeCssToScss();
    await this.removeBrowserRegion();
    await this.properStandaloneNg19();
    await this.eslint();
    await this.prettier();
    await this.importsWrap();
    this.project.vsCodeHelpers.toogleFilesVisibilityInVscode({
      action: 'hide-files',
    });
  }

  async prettier() {
    //#region @backendFunc
    Helpers.info(`Running prettier...`);
    UtilsTypescript.fixHtmlTemplatesInDir(
      this.project.pathFor(config.folder.src),
    );
    this.project.formatAllFiles();
    Helpers.info(`Prettier done`);
    //#endregion
  }

  async eslint() {
    //#region @backendFunc
    Helpers.info(`Running eslint fix...`);
    await UtilsTypescript.eslintFixAllFilesInsideFolder([
      this.project.location,
    ]);
    Helpers.info(`Eslint fix done`);
    //#endregion
  }

  async removeBrowserRegion() {
    //#region @backendFunc
    Helpers.info(`Running @browser region fixer...`);
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

    Helpers.filesFrom(this.project.pathFor(config.folder.src), true)
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

  async changeCssToScss() {
    //#region @backendFunc
    Helpers.info(`Changing css to scss replacer.`);

    Helpers.filesFrom(this.project.pathFor(config.folder.src), true).forEach(
      f => {
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
      },
    );
    Helpers.taskDone(`Changing css to scss done`);
    //#endregion
  }

  async properStandaloneNg19() {
    //#region @backendFunc
    Helpers.info(`Setting proper standalone property for ng19+...`);

    Helpers.filesFrom(this.project.pathFor(config.folder.src), true).forEach(
      f => {
        if (f.endsWith('.ts')) {
          let content = Helpers.readFile(f);
          const fixedComponent =
            UtilsTypescript.transformComponentStandaloneOption(content);
          if (fixedComponent.trim() !== content.trim()) {
            Helpers.info(`Fixing standalone option in ${f}`);
            Helpers.writeFile(f, fixedComponent);
          }
        }
      },
    );
    Helpers.taskDone(`Done setting standalone property for ng19+...`);
    //#endregion
  }

  async importsWrap() {
    //#region @backendFunc
    Helpers.info(`Wrapping first imports with imports region...`);

    Helpers.filesFrom(this.project.pathFor(config.folder.src), true).forEach(
      f => {
        if (f.endsWith('.ts')) {
          let content = Helpers.readFile(f);
          const fixedComponent =
            UtilsTypescript.wrapFirstImportsInImportsRegion(content);
          if (fixedComponent.trim() !== content.trim()) {
            Helpers.info(`Fixing imports region in ${f}`);
            Helpers.writeFile(f, fixedComponent);
          }
        }
      },
    );
    Helpers.taskDone(`Done wrapping first imports with region...`);
    //#endregion
  }
}
