"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickFixes = void 0;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-helpers/lib");
const lib_6 = require("tnp-helpers/lib");
const app_utils_1 = require("../../app-utils");
const constants_1 = require("../../constants");
const options_1 = require("../../options");
//#endregion
// @ts-ignore TODO weird inheritance problem
class QuickFixes extends lib_6.BaseQuickFixes {
    removeHuskyHooks() {
        //#region @backendFunc
        this.project.removeFolderByRelativePath('node_modules/husky');
        //#endregion
    }
    fixPrettierCreatingConfigInNodeModules() {
        //#region @backendFunc
        const node_modules_path = this.project.nodeModules.path;
        const folderExists = lib_6.Helpers.exists(node_modules_path) && lib_6.Helpers.isFolder(node_modules_path);
        const isNotSymlink = folderExists && !lib_3.fse.lstatSync(node_modules_path).isSymbolicLink();
        const allFolders = isNotSymlink
            ? lib_2.UtilsFilesFoldersSync.getFoldersFrom(node_modules_path, {
                followSymlinks: false,
                recursive: false,
            })
            : [];
        if (folderExists &&
            isNotSymlink &&
            allFolders.length === 1 &&
            lib_4.path.basename(allFolders[0]) === '.cache') {
            lib_6.Helpers.info(`QUICK FIX: removing empty node_modules with only .cache`);
            lib_6.Helpers.remove(node_modules_path);
        }
        //#endregion
    }
    //#region recreate temp source necessary files for tests
    recreateTempSourceNecessaryFilesForTesting(initOptions) {
        //#region @backendFunc
        if (!this.project.framework.isStandaloneProject) {
            return;
        }
        (() => {
            const tsconfigBrowserPath = lib_4.path.join(this.project.location, constants_1.tsconfigJsonBrowserMainProject);
            const tempDirs = [
                (0, constants_1.tempSourceFolder)(true, true),
                (0, constants_1.tempSourceFolder)(false, false),
                (0, constants_1.tempSourceFolder)(true, false),
                (0, constants_1.tempSourceFolder)(false, true),
                (0, constants_1.tempSourceFolder)(true, true, true),
                (0, constants_1.tempSourceFolder)(false, false, true),
                (0, constants_1.tempSourceFolder)(true, false, true),
                (0, constants_1.tempSourceFolder)(false, true, true),
            ];
            tempDirs.forEach(tempSrcDirName => {
                // console.log(`
                //   REBUILDING: ${dirName}
                //   `)
                const destTsconfigBrowser = lib_4.path.join(this.project.location, tempSrcDirName, constants_1.tsconfigNgProject);
                lib_5.HelpersTaon.copyFile(tsconfigBrowserPath, destTsconfigBrowser);
                lib_5.HelpersTaon.setValueToJSONC(destTsconfigBrowser, 'extends', `../${constants_1.tsconfigJsonIsomorphicMainProject}`);
                const appTemplateFolder = (0, app_utils_1.templateFolderForArtifact)(initOptions.release.targetArtifact ===
                    options_1.ReleaseArtifactTaon.ELECTRON_APP
                    ? options_1.ReleaseArtifactTaon.ELECTRON_APP
                    : options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP);
                // this.project.framework.recreateFileFromCoreProject({
                //   fileRelativePath: [tempSrcDirName, tsconfigSpecNgProject],
                //   relativePathInCoreProject: `${appTemplateFolder}/${tsconfigForUnitTestsNgProject}`,
                // });
                this.project.framework.recreateFileFromCoreProject({
                    fileRelativePath: [
                        tempSrcDirName,
                        constants_1.CoreNgTemplateFiles.JEST_CONFIG_JS,
                    ],
                    relativePathInCoreProject: `${appTemplateFolder}/${constants_1.CoreNgTemplateFiles.JEST_CONFIG_JS}`,
                });
                this.project.framework.recreateFileFromCoreProject({
                    fileRelativePath: [tempSrcDirName, constants_1.CoreNgTemplateFiles.SETUP_JEST_TS],
                    relativePathInCoreProject: `${appTemplateFolder}/${constants_1.srcNgProxyProject}/${constants_1.CoreNgTemplateFiles.SETUP_JEST_TS}`,
                });
                this.project.framework.recreateFileFromCoreProject({
                    fileRelativePath: [
                        tempSrcDirName,
                        constants_1.CoreNgTemplateFiles.JEST_GLOBAL_MOCKS_TS,
                    ],
                    relativePathInCoreProject: `${appTemplateFolder}/${constants_1.srcNgProxyProject}/${constants_1.CoreNgTemplateFiles.JEST_GLOBAL_MOCKS_TS}`,
                });
            });
        })();
        //#endregion
    }
    //#endregion
    //#region fix build dirs
    makeSureDistFolderExists() {
        //#region @backendFunc
        const p = this.project.pathFor(constants_1.distMainProject);
        if (!lib_6.Helpers.isFolder(p)) {
            lib_6.Helpers.remove(p);
            lib_6.Helpers.mkdirp(p);
        }
        //#endregion
    }
    //#endregion
    //#region add missing angular files
    missingAngularLibFiles() {
        //#region @backendFunc
        lib_6.Helpers.taskStarted(`[quick fixes] missing angular lib fles start`, true);
        if (this.project.framework.frameworkVersionAtLeast('v3') &&
            this.project.typeIs(lib_2.LibTypeEnum.ISOMORPHIC_LIB)) {
            (() => {
                if (this.project.framework.isStandaloneProject) {
                    (() => {
                        const indexTs = (0, lib_4.crossPlatformPath)([
                            this.project.location,
                            constants_1.srcMainProject,
                            constants_1.libFromSrc,
                            constants_1.indexTsFromLibFromSrc,
                        ]);
                        if (!lib_6.Helpers.exists(indexTs)) {
                            lib_6.Helpers.writeFile(indexTs, `
              export function helloWorldFrom${lib_4._.upperFirst(lib_4._.camelCase(this.project.name))}() { }
              `.trimLeft());
                        }
                    })();
                    (() => {
                        const indexTs = this.project.pathFor([
                            constants_1.srcMainProject,
                            constants_1.libFromSrc,
                            constants_1.indexScssFromSrcLib,
                        ]);
                        if (!lib_6.Helpers.exists(indexTs)) {
                            lib_6.Helpers.writeFile(indexTs, `
// EXPORT SCSS STYLES FOR THIS LIBRARY IN THIS FILE
// @forward './my-scss-file.scss'; # => it is similar to export * from './my-scss-file.scss' in TypeScript
              `.trimLeft());
                        }
                    })();
                    (() => {
                        const indexScss = this.project.pathFor([
                            constants_1.srcMainProject,
                            constants_1.indexScssFromSrc,
                        ]);
                        if (!lib_6.Helpers.exists(indexScss)) {
                            lib_6.Helpers.writeFile(indexScss, `
// EXPORT SCSS STYLES FOR THIS APP or LIBRARY IN THIS FILE
@forward './lib/index.scss';

              `.trimLeft());
                        }
                    })();
                }
            })();
            (() => {
                const shared_folder_info = this.project.pathFor([
                    constants_1.srcMainProject,
                    constants_1.assetsFromSrc,
                    constants_1.sharedFromAssets,
                    constants_1.folder_shared_folder_info,
                ]);
                lib_6.Helpers.writeFile(shared_folder_info, `
${constants_1.THIS_IS_GENERATED_STRING}

Assets from this folder are being shipped with this npm package (${this.project.nameForNpmPackage})
created from this project.

${constants_1.THIS_IS_GENERATED_STRING}
          `.trimLeft());
            })();
            (() => {
                const shared_folder_info = this.project.pathFor([
                    constants_1.srcMainProject,
                    constants_1.libFromSrc,
                    constants_1.migrationsFromLib,
                    constants_1.TaonGeneratedFiles.MIGRATIONS_INFO_MD,
                ]);
                lib_6.Helpers.writeFile(shared_folder_info, `
${constants_1.THIS_IS_GENERATED_STRING}

This folder is only for storing migration files with auto-generated names.

${constants_1.THIS_IS_GENERATED_STRING}
          `.trimLeft());
            })();
            (() => {
                const shared_folder_info = this.project.pathFor([
                    constants_1.srcMainProject,
                    constants_1.libFromSrc,
                    constants_1.TaonGeneratedFiles.LIB_INFO_MD,
                ]);
                lib_6.Helpers.writeFile(shared_folder_info, `
${constants_1.THIS_IS_GENERATED_STRING}

This folder is an entry point for npm Angular/NodeJS library

DON'T USE STUFF FROM PARENT FOLDER app.* FILES HERE (except src/migrations/** files).

${constants_1.THIS_IS_GENERATED_STRING}
          `.trimLeft());
            })();
            (() => {
                const shared_folder_info = this.project.pathFor([
                    constants_1.srcMainProject,
                    constants_1.testsFromSrc,
                    constants_1.TaonGeneratedFiles.MOCHA_TESTS_INFO_MD,
                ]);
                lib_6.Helpers.writeFile(shared_folder_info, `
${constants_1.THIS_IS_GENERATED_STRING}

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

${constants_1.THIS_IS_GENERATED_STRING}

          `.trimLeft());
            })();
        }
        const appFolderInfoMdAbsPath = this.project.pathFor([
            constants_1.srcMainProject,
            constants_1.appFromSrc,
            constants_1.TaonGeneratedFiles.APP_FOLDER_INFO_MD,
        ]);
        lib_6.Helpers.writeFile(appFolderInfoMdAbsPath, `${constants_1.THIS_IS_GENERATED_STRING}

# HOW TO USE THIS FOLDER

Put here files that you don't want to share through npm package.

*src/lib* - it is for **npm library** code

*src/app* - it is for **app only** code
(app -> means here: webapp, nodejs server, electron, vscode plugin etc.)

${constants_1.THIS_IS_GENERATED_STRING}`);
        lib_6.Helpers.writeFile([
            this.project.location,
            lib_1.TaonTempDatabasesFolder,
            'databases-folder-info.md',
        ], `${constants_1.THIS_IS_GENERATED_STRING}

# PURPOSE OF THIS FOLDER

You will see here *.sqlite database files only after you run your application
that uses HOST_CONFIG from src/app.hosts.ts

${constants_1.THIS_IS_GENERATED_STRING}`);
        lib_6.Helpers.writeFile([this.project.location, lib_1.TaonTempRoutesFolder, 'routes-folder-info.md'], `${constants_1.THIS_IS_GENERATED_STRING}

# PURPOSE OF THIS FOLDER

You will see here *.rest routes for each context/controller of your application
that uses HOST_CONFIG from src/app.hosts.ts

${constants_1.THIS_IS_GENERATED_STRING}`);
        lib_6.Helpers.taskDone(`[quick fixes] missing angular lib fles end`);
        //#endregion
    }
    //#endregion
    //#region bad types in node modules
    removeBadTypesInNodeModules() {
        //#region @backendFunc
        if (!lib_3.fse.existsSync(this.project.nodeModules.path)) {
            lib_6.Helpers.warn(`Cannot remove bad types from node_modules. Folder node_modules does not exist.`);
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
            lib_6.Helpers.info(`Removing bad folders from node_modules: ${name}`);
            lib_6.Helpers.removeFolderIfExists(lib_4.path.join(this.project.nodeModules.path, name));
        });
        const globalsDts = this.project.readFile('node_modules/@types/node/globals.d.ts');
        try {
            this.project.writeFile('node_modules/@types/node/globals.d.ts', lib_5.UtilsTypescript.removeRegionByName(globalsDts, 'borrowed'));
        }
        catch (error) {
            lib_6.Helpers.error(`Problem with removing borrowed types from globals.d.ts`, true, false);
            this.project.writeFile('node_modules/@types/node/globals.d.ts', globalsDts);
        }
        //#endregion
    }
    //#endregion
    //#region add missing source folder
    addMissingSrcFolderToEachProject() {
        //#region @backendFunc
        /// QUCIK_FIX make it more generic
        if (this.project.framework.frameworkVersionEquals('v1')) {
            return;
        }
        lib_6.Helpers.taskStarted(`[quick fixes] missing source folder start`, true);
        if (!lib_3.fse.existsSync(this.project.location)) {
            return;
        }
        if (this.project.framework.isStandaloneProject) {
            const srcFolderAbsPath = this.project.pathFor(constants_1.srcMainProject);
            if (!lib_3.fse.existsSync(srcFolderAbsPath)) {
                lib_6.Helpers.mkdirp(srcFolderAbsPath);
            }
        }
        lib_6.Helpers.taskDone(`[quick fixes] missing source folder end`);
        //#endregion
    }
    //#endregion
    //#region node_modules replacements zips
    get nodeModulesPkgsReplacements() {
        //#region @backendFunc
        const npmReplacements = lib_3.glob
            .sync(`${this.project.pathFor(constants_1.nodeModulesMainProject)}-*.zip`)
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
    unpackNodeModulesPackagesZipReplacements() {
        //#region @backendFunc
        return; // TODO @UNCOMMENT zip refactored
        const nodeModulesPath = this.project.pathFor(constants_1.nodeModulesMainProject);
        if (!lib_3.fse.existsSync(nodeModulesPath)) {
            lib_6.Helpers.mkdirp(nodeModulesPath);
        }
        this.nodeModulesPkgsReplacements.forEach(p => {
            const nameZipReplacementPackage = p.replace(`${constants_1.nodeModulesMainProject}-`, '');
            const moduleInNodeModules = this.project.pathFor([
                constants_1.nodeModulesMainProject,
                nameZipReplacementPackage,
            ]);
            if (lib_3.fse.existsSync(moduleInNodeModules)) {
                lib_6.Helpers.info(`Extraction ${lib_3.chalk.bold(nameZipReplacementPackage)} already exists in ` +
                    ` ${lib_3.chalk.bold(this.project.genericName)}/${constants_1.nodeModulesMainProject}`);
            }
            else {
                lib_6.Helpers.info(`Extraction before installation ${lib_3.chalk.bold(nameZipReplacementPackage)} in ` +
                    ` ${lib_3.chalk.bold(this.project.genericName)}/${constants_1.nodeModulesMainProject}`);
                lib_5.UtilsZip.unzipArchive(p);
                // TODO extract-zip removed - find alternative
                // this.project.run(`extract-zip ${p} ${nodeModulesPath}`).sync();
            }
        });
        //#endregion
    }
}
exports.QuickFixes = QuickFixes;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/quick-fixes.js.map