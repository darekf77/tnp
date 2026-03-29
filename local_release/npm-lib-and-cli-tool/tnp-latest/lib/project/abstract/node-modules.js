"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeModules = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const constants_1 = require("../../constants");
//#endregion
// @ts-ignore TODO weird inheritance problem
class NodeModules extends lib_4.BaseNodeModules {
    project;
    npmHelpers;
    constructor(project, npmHelpers) {
        super(project.location, 
        // @ts-ignore TODO weird inheritance problem
        npmHelpers);
        this.project = project;
        this.npmHelpers = npmHelpers;
    }
    /**
     * TODO use this when async not available
     */
    reinstallSync() {
        //#region @backendFunc
        // TODO in future - check if node_modules are empty
        // the problem is that I don't wanna check each time I am acessing core container
        if (this.project.nodeModules.empty) {
            this.project
                .run(`${lib_1.config.frameworkName} reinstall ${constants_1.skipCoreCheck}`)
                .sync();
        }
        //#endregion
    }
    //#region has package installed
    hasPackageInstalled(packageName) {
        //#region @backendFunc
        const packagePath = (0, lib_2.crossPlatformPath)([
            this.path,
            ...packageName.split('/'),
            lib_1.fileName.package_json,
        ]);
        return lib_4.Helpers.exists(packagePath);
        //#endregion
    }
    //#region reinstall
    /**
     * OVERRIDDEN METHOD for taon use case
     */
    async reinstall(options) {
        //#region @backendFunc
        options = options || {};
        if (this.project.framework.isContainer &&
            !this.project.framework.isContainerCoreProject) {
            lib_4.Helpers.log(`No need for package installation in normal container`);
            return;
        }
        if (!global.globalSystemToolMode) {
            return;
        }
        if (global.tnpNonInteractive) {
            lib_2.PROGRESS_DATA.log({
                msg: `${this.npmHelpers.useLinkAsNodeModules ? 'SMART ' : ''} ` +
                    `npm installation for "${this.project.genericName}" started..`,
            });
        }
        lib_4.Helpers.log(`Packages full installation for ${this.project.genericName}`);
        if (this.npmHelpers.useLinkAsNodeModules) {
            await this.project.nodeModules.linkFromCoreContainer();
        }
        else {
            //#region display message about long process for core container
            if (lib_1.config.frameworkName === lib_1.taonPackageName &&
                this.project.framework.isContainerCoreProject) {
                lib_4.Helpers.info(`
      [${(0, lib_2.dateformat)(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
      This may take a long time (usually 10-15min on 0.5Gb/s internet connection)...
      more than 1GB to download from npm...
      `);
            }
            //#endregion
            // TODO UNCOMMENT WHEN REALLY GOOD PACKGES CLOUD DEPLOYMENT
            // options.generateYarnOrPackageJsonLock = true;
            // options.removeYarnOrPackageJsonLock = false;
            // options.skipRemovingNodeModules = true;
            await super.reinstall(options);
            //#region after npm install taon things
            // TODO not a good idea
            // this.project.quickFixes.unpackNodeModulesPackagesZipReplacements();
            this.project.quickFixes.createDummyEmptyLibsReplacements([]); // TODO
            this.project.quickFixes.removeBadTypesInNodeModules();
            await this.project.packagesRecognition.start('after npm install');
            if (!options.generateYarnOrPackageJsonLock) {
                if (options.useYarn) {
                    const yarnLockPath = this.project.pathFor(constants_1.yarnLockMainProject);
                    const yarnLockExists = lib_2.fse.existsSync(yarnLockPath);
                    if (yarnLockExists) {
                        if (this.project.git.isInsideGitRepo) {
                            this.project.git.resetFiles(constants_1.yarnLockMainProject);
                        }
                    }
                    else {
                        lib_2.fse.existsSync(yarnLockPath) &&
                            lib_4.Helpers.removeFileIfExists(yarnLockPath);
                    }
                }
                else {
                    const packageLockPath = this.project.pathFor(constants_1.packageJsonLockMainProject);
                    lib_2.fse.existsSync(packageLockPath) &&
                        lib_4.Helpers.removeFileIfExists(packageLockPath);
                }
            }
            lib_4.Helpers.writeFile([this.project.nodeModules.path, constants_1.dotInstallDate], `[${(0, lib_2.dateformat)(new Date(), 'dd-mm-yyyy HH:MM:ss')}]`);
            if (this.project.nodeModules.shouldDedupePackages) {
                this.project.nodeModules.dedupe();
            }
            // TODO QUICK FIX in version 19 fix all d.ts
            this.project.quickFixes.excludeNodeModulesDtsFromTypescriptCheck([
                this.project.nodeModules.pathFor('@types/glob/index.d.ts'),
                this.project.nodeModules.pathFor('@types/lodash-es/debounce.d.ts'),
                this.project.nodeModules.pathFor('chokidar/types/index.d.ts'),
                this.project.nodeModules.pathFor('@angular/core/types/_discovery-chunk.d.ts'),
                this.project.nodeModules.pathFor('@types/node/process.d.ts'),
                this.project.nodeModules.pathFor('electron/electron.d.ts'),
                this.project.nodeModules.pathFor('@angular/platform-browser/types/platform-browser.d.ts'),
                this.project.nodeModules.pathFor('undici/types/formdata.d.ts'),
                this.project.nodeModules.pathFor('@sweetalert2/ngx-sweetalert2/index.d.ts'),
            ]);
            this.project.quickFixes.fixSQLLiteModuleInNodeModules();
            //#endregion
        }
        if (global.tnpNonInteractive) {
            lib_2.PROGRESS_DATA.log({ msg: `npm installation finish ok` });
        }
        //#endregion
    }
    //#endregion
    //#region link from core container
    async linkFromCoreContainer() {
        //#region @backendFunc
        const coreContainer = this.project.ins.by(lib_1.LibTypeEnum.CONTAINER, this.project.framework.frameworkVersion);
        if (this.project.location === coreContainer.location) {
            lib_4.Helpers.logInfo(`Reinstalling node_modules for core container ${coreContainer.name}`);
            await coreContainer.nodeModules.makeSureInstalled();
            return;
        }
        // console.log(
        //   `Linking from core container ${coreContainer.name} ${this.project.genericName}`,
        // );
        await coreContainer.nodeModules.makeSureInstalled();
        //#region respect other proper core container linked node_modules
        if (lib_1.taonPackageName === lib_1.config.frameworkName) {
            try {
                const realpathCCfromCurrentProj = lib_2.fse.realpathSync(this.project.nodeModules.path);
                const pathCCfromCurrentProj = (0, lib_2.crossPlatformPath)(lib_2.path.dirname(realpathCCfromCurrentProj));
                const coreContainerFromNodeModules = this.project.ins.From(pathCCfromCurrentProj);
                const isCoreContainer = coreContainerFromNodeModules?.framework.isCoreProject &&
                    coreContainerFromNodeModules?.framework.isContainer &&
                    coreContainerFromNodeModules.framework.frameworkVersionEquals(this.project.framework.frameworkVersion);
                // console.log({
                //   realpathCCfromCurrentProj,
                //   pathCCfromCurrentProj,
                //   isCoreContainer,
                // });
                if (isCoreContainer) {
                    return;
                }
            }
            catch (error) { }
        }
        //#endregion
        try {
            lib_2.fse.unlinkSync(this.project.nodeModules.path);
        }
        catch (error) {
            lib_4.Helpers.remove(this.project.nodeModules.path);
        }
        try {
            if (lib_4.Helpers.exists(this.project.nodeModules.path)) {
                lib_4.Helpers.removeFolderIfExists(this.project.nodeModules.path);
            }
        }
        catch (error) { }
        lib_4.Helpers.createSymLink(coreContainer.nodeModules.path, this.project.nodeModules.path);
        // Helpers.taskDone(
        //   `Linking from core container ${coreContainer.name} ${this.project.genericName}`,
        // );
        //#endregion
    }
    //#endregion
    //#region should dedupe packages
    get shouldDedupePackages() {
        if (this.project.framework.isContainer &&
            !this.project.framework.isCoreProject) {
            return false;
        }
        return (!this.project.npmHelpers.useLinkAsNodeModules &&
            !this.project.nodeModules.isLink);
    }
    //#endregion
    //#region compiled project files and folder
    /**
     * BIG TODO Organization project when compiled in dist folder
     * should store backend files in lib folder
     */
    get compiledProjectFilesAndFolders() {
        //#region @backendFunc
        const jsDtsMapsArr = ['.js', '.js.map', '.d.ts'];
        if (this.project.framework.isStandaloneProject) {
            return [
                constants_1.binMainProject,
                constants_1.libFromCompiledDist,
                constants_1.assetsFromNgProj,
                constants_1.websqlMainProject,
                constants_1.browserMainProject,
                constants_1.taonJsonMainProject,
                lib_1.fileName.tnpEnvironment_json,
                constants_1.dotGitIgnoreMainProject,
                constants_1.dotNpmIgnoreMainProject,
                constants_1.dotNpmrcMainProject,
                constants_1.srcDtsFromNpmPackage,
                ...this.project.taonJson.resources,
                constants_1.packageJsonMainProject,
                constants_1.packageJsonLockMainProject,
                ...jsDtsMapsArr.reduce((a, b) => {
                    return a.concat([
                        ...['cli', 'index', 'start', 'run', 'global-typings'].map(aa => `${aa}${b}`),
                    ]);
                }, []),
            ];
        }
        return [];
        //#endregion
    }
    //#endregion
    //#region dedupe
    dedupe(selectedPackages, fake = false) {
        //#region @backendFunc
        const packages = (lib_3._.isArray(selectedPackages) && selectedPackages.length >= 1
            ? selectedPackages
            : this.packagesToDedupe);
        this.dedupePackages(packages, false, fake);
        //#endregion
    }
    //#endregion
    //#region dedupe count
    dedupeCount(selectedPackages) {
        //#region @backendFunc
        const packages = (lib_3._.isArray(selectedPackages) && selectedPackages.length >= 1
            ? selectedPackages
            : this.packagesToDedupe);
        this.dedupePackages(packages, true);
        //#endregion
    }
    //#endregion
    //#region packages to dedupe
    get packagesToDedupe() {
        return [
            'tnp-models', // TODO remove
            'tnp-helpers',
            'tnp-db', // TODO remove
            'tnp-core',
            'tnp-cli', // TODO remove
            'tnp-config', // TODO remove
            'tnp-tools', // TODO remove
            'taon',
            'taon-ui',
            'taon-typeorm',
            'taon-storage',
            // "better-sqlite3",
            // "any-project-cli",
            'node-cli-test',
            'fs-extra',
            '@types/fs-extra',
            'ng2-rest',
            'ng2-logger',
            'json10',
            'lodash-walk-object',
            'typescript-class-helpers',
            'background-worker-process',
            '@ngtools/webpack',
            'portfinder',
            'socket.io-client',
            'socket.io',
            'incremental-compiler',
            'rxjs',
            'webpack',
            'webpack-dev-server',
            '@angular/animations',
            '@angular/cdk',
            '@angular/common',
            '@angular/compiler',
            '@angular/http',
            '@angular/core',
            '@angular/forms',
            '@angular/material',
            '@angular/platform-browser',
            '@angular/platform-browser-dynamic',
            '@angular/pwa',
            '@angular/platform-server',
            '@angular/ssr',
            '@angular/router',
            '@angular/service-worker',
            'zone.js',
            'typescript',
            'hammerjs',
            'tslib',
            '@angular-devkit/build-optimizer',
            '@angular-devkit/build-angular',
            '@angular-devkit/schematics',
            '@angular-devkit/build-webpack',
            '@angular/cli',
            '@angular/compiler-cli',
            '@angular-builders/custom-webpack',
            '@angular/language-service',
            'ts-node',
            'tslint',
            'prettier',
            '@types/node',
            'record-replay-req-res-scenario',
            // [
            //   'core-js',
            //   '!babel-register',
            //   '!babel-runtime',
            //   '!babel-polyfill',
            //   '@jimp*',
            // ],
            {
                package: 'core-js',
                excludeFrom: ['babel-register', 'babel-runtime', 'babel-polyfill'],
                includeOnlyIn: ['@jimp'],
            },
            'core-js-compat',
            '@ngx-formly/bootstrap',
            '@ngx-formly/core',
            '@ngx-formly/ionic',
            '@ngx-formly/material',
            'sql.js',
            'axios',
            'mocha',
            'jest',
            'chai',
            'vpn-split',
        ];
    }
    //#endregion
    //#region remove tnp from itself
    /**
     * Remove already compiled package from node_modules
     * in project with the same name
     *
     * let say we have project "my-project" and we want to remove
     * "my-project" from node_modules of "my-project"
     *
     * This helper is helpful when we want to minified whole library
     * into single file (using ncc)
     */
    async removeOwnPackage(actionwhenNotInNodeModules) {
        //#region @backendFunc
        const nodeModulesPath = this.project.nodeModules.path;
        if (lib_4.Helpers.exists(nodeModulesPath)) {
            const folderToMove = (0, lib_2.crossPlatformPath)([
                (0, lib_2.crossPlatformPath)(lib_2.fse.realpathSync(nodeModulesPath)),
                this.project.name,
            ]);
            const folderTemp = (0, lib_2.crossPlatformPath)([
                (0, lib_2.crossPlatformPath)(lib_2.fse.realpathSync(nodeModulesPath)),
                `temp-location-${this.project.name}`,
            ]);
            lib_4.HelpersTaon.move(folderToMove, folderTemp, {
                purpose: `Moving own "${this.project.nameForNpmPackage}" package to temp location`,
            });
            await actionwhenNotInNodeModules();
            lib_4.HelpersTaon.move(folderTemp, folderToMove, {
                purpose: `Restoring own "${this.project.nameForNpmPackage}" package after action`,
            });
        }
        //#endregion
    }
    //#endregion
    getIsomorphicPackagesNames() {
        //#region @backendFunc
        return this.getAllPackagesNames().filter(packageName => this.checkIsomorphic(packageName));
        //#endregion
    }
    getIsomorphicPackagesNamesInDevMode() {
        //#region @backendFunc
        return this.getAllPackagesNames().filter(packageName => this.checkIsomorphic(packageName) && this.checkIfInDevMode(packageName));
        //#endregion
    }
    //#region get folders with packages
    getAllPackagesNames = (options) => {
        //#region @backendFunc
        options = options || {};
        const followSymlinks = !!options.followSymlinks;
        let fromNodeModulesFolderSearch = lib_1.UtilsFilesFoldersSync.getFoldersFrom(this.path, {
            recursive: false,
            followSymlinks,
        })
            .reduce((a, b) => {
            if (lib_2.path.basename(b).startsWith('@')) {
                const foldersFromB = lib_4.Helpers.foldersFrom(b)
                    .filter(f => !constants_1.notAllowedAsPacakge.includes(lib_2.path.basename(f)))
                    // .filter(f => Helpers.exists([path.dirname(f), fileName.index_d_ts])) // QUICK_FIX @angular/animation
                    .map(f => {
                    return `${lib_2.path.basename(b)}/${lib_2.path.basename(f)}`;
                });
                return [...a, ...foldersFromB];
            }
            return [...a, b];
        }, [])
            .map(f => {
            if (f.startsWith('@')) {
                return f;
            }
            return lib_2.path.basename(f);
        });
        return fromNodeModulesFolderSearch;
        //#endregion
    };
    //#endregion
    checkIfInDevMode(packageName) {
        //#region @backendFunc
        const packageInNodeModulesPath = (0, lib_2.crossPlatformPath)([
            this.realPath,
            packageName,
        ]);
        return lib_4.Helpers.isExistedSymlink([
            packageInNodeModulesPath,
            constants_1.sourceLinkInNodeModules,
        ]);
        //#endregion
    }
    checkIsomorphic(packageName) {
        //#region @backendFunc
        let isIsomorphic = false;
        // !  TODO this in probably incorrect packages is never a link
        const packageInNodeModulesPath = (0, lib_2.crossPlatformPath)([
            this.realPath,
            packageName,
        ]);
        const browser = (0, lib_2.crossPlatformPath)([
            packageInNodeModulesPath,
            constants_1.browserMainProject,
            constants_1.packageJsonNpmLibAngular,
        ]);
        const websql = (0, lib_2.crossPlatformPath)([
            packageInNodeModulesPath,
            constants_1.websqlMainProject,
            constants_1.packageJsonNpmLibAngular,
        ]);
        const lib = (0, lib_2.crossPlatformPath)([
            packageInNodeModulesPath,
            constants_1.libFromCompiledDist,
            'index.js'
        ]);
        isIsomorphic =
            lib_4.Helpers.exists(browser) && lib_4.Helpers.exists(websql) && lib_4.Helpers.exists(lib);
        return isIsomorphic;
        //#endregion
    }
}
exports.NodeModules = NodeModules;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/node-modules.js.map