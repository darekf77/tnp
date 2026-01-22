//#region imports
import { TaonTempDatabasesFolder, TaonTempRoutesFolder } from 'taon/src';
import { config, LibTypeEnum, UtilsFilesFoldersSync } from 'tnp-core/src';
import { glob, fse, chalk } from 'tnp-core/src';
import { path, _, crossPlatformPath } from 'tnp-core/src';
import { UtilsTypescript, UtilsZip } from 'tnp-helpers/src';
import { Helpers, BaseQuickFixes } from 'tnp-helpers/src';

import { templateFolderForArtifact } from '../../app-utils';
import {
  appFromSrc,
  appFromSrcInsideNgApp,
  assetsFromSrc,
  CoreNgTemplateFiles,
  distMainProject,
  folder_shared_folder_info,
  indexScssFromSrc,
  indexScssFromSrcLib,
  indexTsFromLibFromSrc,
  libFromSrc,
  migrationsFromLib,
  nodeModulesMainProject,
  sharedFromAssets,
  srcMainProject,
  srcNgProxyProject,
  TaonGeneratedFiles,
  tempSourceFolder,
  testsFromSrc,
  THIS_IS_GENERATED_INFO_COMMENT,
  THIS_IS_GENERATED_STRING,
  tsconfigForUnitTestsNgProject,
  tsconfigJsonBrowserMainProject,
  tsconfigJsonIsomorphicMainProject,
  tsconfigJsonMainProject,
  tsconfigNgProject,
  tsconfigSpecNgProject,
} from '../../constants';
import { EnvOptions, ReleaseArtifactTaon } from '../../options';
import type { Project } from '../abstract/project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class QuickFixes extends BaseQuickFixes<Project> {
  removeHuskyHooks(): void {
    //#region @backendFunc
    this.project.removeFolderByRelativePath('node_modules/husky');
    //#endregion
  }

  fixPrettierCreatingConfigInNodeModules(): void {
    //#region @backendFunc
    const node_modules_path = this.project.nodeModules.path;

    const folderExists =
      Helpers.exists(node_modules_path) && Helpers.isFolder(node_modules_path);
    const isNotSymlink =
      folderExists && !fse.lstatSync(node_modules_path).isSymbolicLink();

    const allFolders = isNotSymlink
      ? UtilsFilesFoldersSync.getFoldersFrom(node_modules_path, {
          followSymlinks: false,
          recursive: false,
        })
      : [];

    if (
      folderExists &&
      isNotSymlink &&
      allFolders.length === 1 &&
      path.basename(allFolders[0]) === '.cache'
    ) {
      Helpers.info(`QUICK FIX: removing empty node_modules with only .cache`);
      Helpers.remove(node_modules_path);
    }
    //#endregion
  }

  //#region recreate temp source necessary files for tests
  recreateTempSourceNecessaryFilesForTesting(initOptions: EnvOptions): void {
    //#region @backendFunc
    if (this.project.typeIsNot(LibTypeEnum.ISOMORPHIC_LIB)) {
      return;
    }

    (() => {
      const tsconfigBrowserPath = path.join(
        this.project.location,
        tsconfigJsonBrowserMainProject,
      );
      const tempDirs = [
        tempSourceFolder(true, true),
        tempSourceFolder(false, false),
        tempSourceFolder(true, false),
        tempSourceFolder(false, true),
        tempSourceFolder(true, true, true),
        tempSourceFolder(false, false, true),
        tempSourceFolder(true, false, true),
        tempSourceFolder(false, true, true),
      ];
      tempDirs.forEach(tempSrcDirName => {
        // console.log(`

        //   REBUILDING: ${dirName}

        //   `)
        const destTsconfigBrowser = path.join(
          this.project.location,
          tempSrcDirName,
          tsconfigNgProject,
        );
        Helpers.copyFile(tsconfigBrowserPath, destTsconfigBrowser);
        Helpers.setValueToJSONC(
          destTsconfigBrowser,
          'extends',
          `../${tsconfigJsonIsomorphicMainProject}`,
        );

        const appTemplateFolder = templateFolderForArtifact(
          initOptions.release.targetArtifact ===
            ReleaseArtifactTaon.ELECTRON_APP
            ? ReleaseArtifactTaon.ELECTRON_APP
            : ReleaseArtifactTaon.ANGULAR_NODE_APP,
        );

        this.project.framework.recreateFileFromCoreProject({
          fileRelativePath: [tempSrcDirName, tsconfigSpecNgProject],
          relativePathInCoreProject: `${appTemplateFolder}/${tsconfigForUnitTestsNgProject}`,
        });

        this.project.framework.recreateFileFromCoreProject({
          fileRelativePath: [
            tempSrcDirName,
            CoreNgTemplateFiles.JEST_CONFIG_JS,
          ],
          relativePathInCoreProject: `${appTemplateFolder}/${CoreNgTemplateFiles.JEST_CONFIG_JS}`,
        });

        this.project.framework.recreateFileFromCoreProject({
          fileRelativePath: [tempSrcDirName, CoreNgTemplateFiles.SETUP_JEST_TS],
          relativePathInCoreProject: `${appTemplateFolder}/${srcNgProxyProject}/${CoreNgTemplateFiles.SETUP_JEST_TS}`,
        });

        this.project.framework.recreateFileFromCoreProject({
          fileRelativePath: [
            tempSrcDirName,
            CoreNgTemplateFiles.JEST_GLOBAL_MOCKS_TS,
          ],
          relativePathInCoreProject: `${appTemplateFolder}/${srcNgProxyProject}/${CoreNgTemplateFiles.JEST_GLOBAL_MOCKS_TS}`,
        });
      });
    })();
    //#endregion
  }
  //#endregion

  //#region fix build dirs
  makeSureDistFolderExists(): void {
    //#region @backendFunc
    const p = this.project.pathFor(distMainProject);
    if (!Helpers.isFolder(p)) {
      Helpers.remove(p);
      Helpers.mkdirp(p);
    }
    //#endregion
  }
  //#endregion

  //#region add missing angular files
  public missingAngularLibFiles(): void {
    //#region @backendFunc
    Helpers.taskStarted(`[quick fixes] missing angular lib fles start`, true);
    if (
      this.project.framework.frameworkVersionAtLeast('v3') &&
      this.project.typeIs(LibTypeEnum.ISOMORPHIC_LIB)
    ) {
      (() => {
        if (this.project.framework.isStandaloneProject) {
          (() => {
            const indexTs = crossPlatformPath([
              this.project.location,
              srcMainProject,
              libFromSrc,
              indexTsFromLibFromSrc,
            ]);
            if (!Helpers.exists(indexTs)) {
              Helpers.writeFile(
                indexTs,
                `
              export function helloWorldFrom${_.upperFirst(
                _.camelCase(this.project.name),
              )}() { }
              `.trimLeft(),
              );
            }
          })();
          (() => {
            const indexTs = this.project.pathFor([
              srcMainProject,
              libFromSrc,
              indexScssFromSrcLib,
            ]);

            if (!Helpers.exists(indexTs)) {
              Helpers.writeFile(
                indexTs,
                `
// EXPORT SCSS STYLES FOR THIS LIBRARY IN THIS FILE
// @forward './my-scss-file.scss'; # => it is similar to export * from './my-scss-file.scss' in TypeScript
              `.trimLeft(),
              );
            }
          })();

          (() => {
            const indexScss = this.project.pathFor([
              srcMainProject,
              indexScssFromSrc,
            ]);
            if (!Helpers.exists(indexScss)) {
              Helpers.writeFile(
                indexScss,
                `
// EXPORT SCSS STYLES FOR THIS APP or LIBRARY IN THIS FILE
@forward './lib/index.scss';

              `.trimLeft(),
              );
            }
          })();
        }
      })();

      (() => {
        const shared_folder_info = this.project.pathFor([
          srcMainProject,
          assetsFromSrc,
          sharedFromAssets,
          folder_shared_folder_info,
        ]);

        Helpers.writeFile(
          shared_folder_info,
          `
${THIS_IS_GENERATED_STRING}

Assets from this folder are being shipped with this npm package (${this.project.nameForNpmPackage})
created from this project.

${THIS_IS_GENERATED_STRING}
          `.trimLeft(),
        );
      })();

      (() => {
        const shared_folder_info = this.project.pathFor([
          srcMainProject,
          libFromSrc,
          migrationsFromLib,
          TaonGeneratedFiles.MIGRATIONS_INFO_MD,
        ]);

        Helpers.writeFile(
          shared_folder_info,
          `
${THIS_IS_GENERATED_STRING}

This folder is only for storing migration files with auto-generated names.

${THIS_IS_GENERATED_STRING}
          `.trimLeft(),
        );
      })();

      (() => {
        const shared_folder_info = this.project.pathFor([
          srcMainProject,
          libFromSrc,
          TaonGeneratedFiles.LIB_INFO_MD,
        ]);

        Helpers.writeFile(
          shared_folder_info,
          `
${THIS_IS_GENERATED_STRING}

This folder is an entry point for npm Angular/NodeJS library

DON'T USE STUFF FROM PARENT FOLDER app.* FILES HERE (except src/migrations/** files).

${THIS_IS_GENERATED_STRING}
          `.trimLeft(),
        );
      })();

      (() => {
        const shared_folder_info = this.project.pathFor([
          srcMainProject,
          testsFromSrc,
          TaonGeneratedFiles.MOCHA_TESTS_INFO_MD,
        ]);

        Helpers.writeFile(
          shared_folder_info,
          `
${THIS_IS_GENERATED_STRING}

# Purpose of this folder
Put your backend **mocha** tests (with *.test.ts extension) in this folder or any other *tests*
folder inside project.

\`\`\`
/src/lib/my-feature/features.test.ts                          # -> NOT ok, test omitted
/src/lib/my-feature/tests/features.test.ts                    # -> OK
/src/lib/my-feature/nested-feature/tests/features.test.ts     # -> OK
\`\`\`

# How to test your isomorphic backend ?

1. By using console select menu:
\`\`\`
taon test                   # single run
taon test:watch             # watch mode
taon test:debug             # and start "attach" VSCode debugger
taon test:watch:debug       # and start "attach" VSCode debugger
\`\`\`

2. Directly:
\`\`\`
taon mocha                        # single run
taon mocha:watch                  # watch mode
taon mocha:debug                  # and start "attach" VSCode debugger
taon mocha:watch:debug            # and start "attach" VSCode debugger
\`\`\`

# Example
example.test.ts
\`\`\`ts
import { describe, before, it } from 'mocha'
import { expect } from 'chai';

describe('Set name for function or class', () => {

  it('should keep normal function name ', () => {
    expect(1).to.be.eq(Number(1));
  })
});
\`\`\`

${THIS_IS_GENERATED_STRING}

          `.trimLeft(),
        );
      })();
    }

    const appFolderInfoMdAbsPath = this.project.pathFor([
      srcMainProject,
      appFromSrc,
      TaonGeneratedFiles.APP_FOLDER_INFO_MD,
    ]);

    Helpers.writeFile(
      appFolderInfoMdAbsPath,
      `${THIS_IS_GENERATED_STRING}

# HOW TO USE THIS FOLDER

Put here files that you don't want to share through npm package.

*src/lib* - it is for **npm library** code

*src/app* - it is for **app only** code
(app -> means here: webapp, nodejs server, electron, vscode plugin etc.)

${THIS_IS_GENERATED_STRING}`,
    );

    Helpers.writeFile(
      [
        this.project.location,
        TaonTempDatabasesFolder,
        'databases-folder-info.md',
      ],
      `${THIS_IS_GENERATED_STRING}

# PURPOSE OF THIS FOLDER

You will see here *.sqlite database files only after you run your application
that uses HOST_CONFIG from src/app.hosts.ts

${THIS_IS_GENERATED_STRING}`,
    );

    Helpers.writeFile(
      [this.project.location, TaonTempRoutesFolder, 'routes-folder-info.md'],
      `${THIS_IS_GENERATED_STRING}

# PURPOSE OF THIS FOLDER

You will see here *.rest routes for each context/controller of your application
that uses HOST_CONFIG from src/app.hosts.ts

${THIS_IS_GENERATED_STRING}`,
    );

    Helpers.taskDone(`[quick fixes] missing angular lib fles end`);
    //#endregion
  }
  //#endregion

  //#region bad types in node modules
  removeBadTypesInNodeModules(): void {
    //#region @backendFunc
    if (!fse.existsSync(this.project.nodeModules.path)) {
      Helpers.warn(
        `Cannot remove bad types from node_modules. Folder node_modules does not exist.`,
      );
      return;
    }

    [
      '@types/prosemirror-*',
      '@types/mocha',
      '@types/jasmine*',
      '@types/puppeteer-core',
      '@types/puppeteer',
      '@types/oauth2orize',
      '@types/lowdb',
      '@types/eslint',
      '@types/eslint-scope',
      '@types/inquirer',
      'ts-json-schema-generator/node_modules/.bin', // problem with symlinks
    ].forEach(name => {
      Helpers.info(`Removing bad folders from node_modules: ${name}`);
      Helpers.removeFolderIfExists(
        path.join(this.project.nodeModules.path, name),
      );
    });
    const globalsDts = this.project.readFile(
      'node_modules/@types/node/globals.d.ts',
    );
    try {
      this.project.writeFile(
        'node_modules/@types/node/globals.d.ts',
        UtilsTypescript.removeRegionByName(globalsDts, 'borrowed'),
      );
    } catch (error) {
      Helpers.error(
        `Problem with removing borrowed types from globals.d.ts`,
        true,
        false,
      );
      this.project.writeFile(
        'node_modules/@types/node/globals.d.ts',
        globalsDts,
      );
    }

    //#endregion
  }
  //#endregion

  //#region add missing source folder
  public addMissingSrcFolderToEachProject(): void {
    //#region @backendFunc
    /// QUCIK_FIX make it more generic
    if (this.project.framework.frameworkVersionEquals('v1')) {
      return;
    }
    Helpers.taskStarted(`[quick fixes] missing source folder start`, true);
    if (!fse.existsSync(this.project.location)) {
      return;
    }
    if (this.project.framework.isStandaloneProject) {
      const srcFolderAbsPath = this.project.pathFor(srcMainProject);

      if (!fse.existsSync(srcFolderAbsPath)) {
        Helpers.mkdirp(srcFolderAbsPath);
      }
    }
    Helpers.taskDone(`[quick fixes] missing source folder end`);
    //#endregion
  }
  //#endregion

  //#region node_modules replacements zips
  public get nodeModulesPkgsReplacements() {
    //#region @backendFunc
    const npmReplacements = glob
      .sync(`${this.project.pathFor(nodeModulesMainProject)}-*.zip`)
      .map(p => p.replace(this.project.location, '').slice(1));

    return npmReplacements;
    //#endregion
  }

  /**
   * @deprecated
   * FIX for missing npm packages from npmjs.com
   *
   * Extract each file: node_modules-<package Name>.zip
   * to node_modules folder before instalation.
   * This will prevent packages deletion from npm
   */
  public unpackNodeModulesPackagesZipReplacements() {
    //#region @backendFunc
    return; // TODO @UNCOMMENT zip refactored
    const nodeModulesPath = this.project.pathFor(nodeModulesMainProject);

    if (!fse.existsSync(nodeModulesPath)) {
      Helpers.mkdirp(nodeModulesPath);
    }
    this.nodeModulesPkgsReplacements.forEach(p => {
      const nameZipReplacementPackage = p.replace(
        `${nodeModulesMainProject}-`,
        '',
      );

      const moduleInNodeModules = this.project.pathFor([
        nodeModulesMainProject,
        nameZipReplacementPackage,
      ]);

      if (fse.existsSync(moduleInNodeModules)) {
        Helpers.info(
          `Extraction ${chalk.bold(
            nameZipReplacementPackage,
          )} already exists in ` +
            ` ${chalk.bold(
              this.project.genericName,
            )}/${nodeModulesMainProject}`,
        );
      } else {
        Helpers.info(
          `Extraction before installation ${chalk.bold(
            nameZipReplacementPackage,
          )} in ` +
            ` ${chalk.bold(
              this.project.genericName,
            )}/${nodeModulesMainProject}`,
        );

        UtilsZip.unzipArchive(p);
        // TODO extract-zip removed - find alternative
        // this.project.run(`extract-zip ${p} ${nodeModulesPath}`).sync();
      }
    });
    //#endregion
  }
  //#endregion
}
