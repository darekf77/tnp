"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCopyManger = void 0;
const lib_1 = require("ng2-logger/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-helpers/lib");
const lib_6 = require("tnp-helpers/lib");
const constants_1 = require("../../../../../../constants");
const source_maping_url_1 = require("./source-maping-url");
//#endregion
const REPLACE_INDEX_D_TS_IN_DEST_WHEN_WATCH = false;
const log = lib_1.Log.create('Base copy manager', lib_1.Level.WARN, lib_1.Level.ERROR);
class BaseCopyManger extends lib_5.BaseCompilerForProject {
    //#region fields
    _isomorphicPackages = [];
    buildOptions;
    copyto = [];
    renameDestinationFolder;
    //#region getters & methods / select all project to copy to
    async selectAllProjectCopyto() {
        //#region  @backendFunc
        const containerCoreProj = this.project.framework.coreContainer;
        const independentProjects = [containerCoreProj];
        if (lib_2.config.frameworkName === lib_2.tnpPackageName &&
            this.project.name !== lib_2.tnpPackageName) {
            // tnp in tnp is not being used at all
            independentProjects.push(this.project.ins.Tnp);
        }
        this.copyto = [...independentProjects];
        // console.log(this.copyto.map(c => 'COPYTO ' + c.nodeModules.path))
        //#endregion
    }
    //#endregion
    get customCompilerName() {
        return `Copyto manager compilation`;
    }
    notAllowedFiles = [
        '.DS_Store',
        // fileName.index_d_ts,
    ];
    //#region helpers / browser websql folders
    browserwebsqlFolders;
    getBrowserwebsqlFolders() {
        // const isProd = this.buildOptions.build.prod;
        return [
            constants_1.browserMainProject,
            constants_1.websqlMainProject,
            constants_1.browserMainProject + constants_1.prodSuffix,
            constants_1.websqlMainProject + constants_1.prodSuffix,
        ];
    }
    //#endregion
    sourceFoldersToRemoveFromNpmPackage;
    //#endregion
    //#region getters
    //#region getters / source path to link
    get sourcePathToLink() {
        //#region @backendFunc
        const sourceToLink = (0, lib_3.crossPlatformPath)([
            this.project.location,
            constants_1.whatToLinkFromCore,
        ]);
        return sourceToLink;
        //#endregion
    }
    //#endregion
    //#region getters / local temp proj path
    get localTempProj() {
        //#region @backendFunc
        let localProj = this.project.ins.From(this.localTempProjPath);
        return localProj;
        //#endregion
    }
    //#endregion
    //#region getters / project to copy to
    /**
     * when building from scratch:
     * taon - uses ~/.taon/taon-containers/container-vXX
     * tnp - uses ../taon-containers/container-vXX
     *
     * but when tnp is in deep refactor I need to use taon to build tnp
     * and force taon to recognize core container from node_modules link
     * inside project (instead normally from taon.json[frameworkVersion] property)
     */
    get projectToCopyTo() {
        //#region @backendFunc
        let result = [];
        const isTaonProdCli = lib_2.taonPackageName === lib_2.config.frameworkName;
        //#region resolve all possible project for package distribution
        let projectForNodeModulesPkgUpdate = [
            this.project.ins.by(lib_2.LibTypeEnum.CONTAINER, this.project.framework.frameworkVersion),
            this.project.framework.coreContainer,
        ];
        //#endregion
        projectForNodeModulesPkgUpdate.push(this.project.tnpCurrentCoreContainer);
        projectForNodeModulesPkgUpdate = projectForNodeModulesPkgUpdate.filter(f => !!f);
        if (isTaonProdCli &&
            this.project.framework.isLinkToNodeModulesDifferentThanCoreContainer) {
            try {
                const possibleTnpLocation = (0, lib_3.crossPlatformPath)((0, constants_1.dirnameFromSourceToProject)(this.project.pathFor([
                    constants_1.nodeModulesMainProject,
                    lib_2.tnpPackageName,
                    constants_1.sourceLinkInNodeModules,
                ])));
                const tnpProject = this.project.ins.From(possibleTnpLocation);
                if (tnpProject) {
                    projectForNodeModulesPkgUpdate.push(tnpProject);
                }
            }
            catch (error) { }
        }
        if (this.project.taonJson.isUsingOwnNodeModulesInsteadCoreContainer) {
            projectForNodeModulesPkgUpdate.push(this.project);
        }
        if (Array.isArray(this.copyto) && this.copyto.length > 0) {
            result = [
                this.localTempProj,
                ...this.copyto,
                ...projectForNodeModulesPkgUpdate,
            ];
        }
        else {
            result = [this.localTempProj, ...projectForNodeModulesPkgUpdate];
        }
        return lib_2.Utils.uniqArray(result, 'location');
        //#endregion
    }
    //#endregion
    //#region getters / isomorphic pacakges
    get isomorphicPackages() {
        //#region @backendFunc
        const isomorphicPackages = [
            ...this._isomorphicPackages,
            this.rootPackageName,
        ];
        return isomorphicPackages;
        //#endregion
    }
    //#endregion
    //#endregion
    updateTriggered = lib_3._.debounce(() => {
        lib_6.Helpers.log(`[copy-manager] update triggered`);
    }, 1000);
    /**
     * @returns if trus - skip futher processing
     */
    contentReplaced(fileAbsolutePath) {
        //#region @backendFunc
        // console.log('processing', fileAbsolutePath);
        if (!(fileAbsolutePath.endsWith('.js') ||
            fileAbsolutePath.endsWith('.js.map') ||
            fileAbsolutePath.endsWith('.mjs') ||
            fileAbsolutePath.endsWith('.mjs.map'))) {
            return;
        }
        let contentOrg = lib_6.Helpers.readFile(fileAbsolutePath) || '';
        const newContent = contentOrg.replace(new RegExp(lib_2.Utils.escapeStringForRegEx(constants_1.TO_REMOVE_TAG), 'g'), '');
        if (newContent && contentOrg && newContent !== contentOrg) {
            lib_6.Helpers.writeFile(fileAbsolutePath, newContent);
            // console.log(`[copy-manager] content replaced in ${fileAbsolutePath}`);
        }
        //#endregion
    }
    //#region async action
    async asyncAction(event) {
        //#region @backendFunc
        const absoluteFilePath = (0, lib_3.crossPlatformPath)(event.fileAbsolutePath);
        // console.log('async event '+ absoluteFilePath)
        this.contentReplaced(absoluteFilePath);
        source_maping_url_1.SourceMappingUrl.fixContent(absoluteFilePath, this.buildOptions);
        let specificFileRelativePath;
        let absoluteAssetFilePath;
        if (absoluteFilePath.startsWith(this.monitoredOutDir)) {
            specificFileRelativePath = absoluteFilePath.replace(this.monitoredOutDir + '/', '');
        }
        else {
            absoluteAssetFilePath = absoluteFilePath;
        }
        const projectToCopyTo = this.projectToCopyTo;
        // Helpers.log(`ASYNC ACTION
        // absoluteFilePath: ${absoluteFilePath}
        // specificFileRelativePath: ${specificFileRelativePath}
        // `);
        //     Helpers.log(`
        //     copyto project:
        // ${projectToCopyTo.map(p => p.location).join('\n')}
        //     `)
        for (let index = 0; index < projectToCopyTo.length; index++) {
            const projectToCopy = projectToCopyTo[index];
            this._copyBuildedDistributionTo(projectToCopy, {
                absoluteAssetFilePath,
                specificFileRelativePath: event && specificFileRelativePath,
                outDir: constants_1.distFromNgBuild,
                event,
            });
        }
        this.updateTriggered();
        //#endregion
    }
    //#endregion
    isStartFromScratch = true;
    //#region sync action
    async syncAction(files, initialParams) {
        //#region @backendFunc
        if (this.project.hasFile(constants_1.tmpAlreadyStartedCopyManager) &&
            this.project.readFile(constants_1.tmpAlreadyStartedCopyManager) === '-') {
            // @ts-ignore
            this.isStartFromScratch = false;
        }
        else {
            this.project.writeFile(constants_1.tmpAlreadyStartedCopyManager, '-');
            // @ts-ignore
            this.isStartFromScratch = true;
        }
        for (const fileAbsPath of files) {
            this.contentReplaced(fileAbsPath);
        }
        const projectToCopyTo = this.projectToCopyTo;
        if (initialParams?.skipCopyDistToLocalTempProject) {
            projectToCopyTo.splice(projectToCopyTo.findIndex(p => p.location === this.localTempProj.location), 1);
        }
        // (${proj.location}/${folderName.node_modules}/${this.rootPackageName})
        if (projectToCopyTo.length > 0) {
            const porjectINfo = projectToCopyTo.length === 1
                ? `project "${lib_3._.first(projectToCopyTo).name}"`
                : `all ${projectToCopyTo.length} projects`;
            log.info(`From now... ${porjectINfo} will be updated after every change...`);
            lib_6.Helpers.info(`[buildable-project] copying compiled code/assets to ${projectToCopyTo.length} other projects...
${projectToCopyTo.map(proj => `- ${proj.location}`).join('\n')}
      `);
        }
        for (let index = 0; index < projectToCopyTo.length; index++) {
            const projectToCopy = projectToCopyTo[index];
            log.data(`copying to ${projectToCopy?.name}`);
            this._copyBuildedDistributionTo(projectToCopy, {
                outDir: constants_1.distFromNgBuild,
            });
            // if (this.buildOptions.buildForRelease && !global.tnpNonInteractive) {
            //   Helpers.info('Things copied to :' + projectToCopy?.name);
            //   if (!(await Helpers.consoleGui.question.yesNo('Is there everywthing ok with build ?'))) {
            //     process.exit(0)
            //   }
            // }
            log.data('copy done...');
        }
        if (this.isStartFromScratch) {
            this.isStartFromScratch = false;
        }
        this.updateTriggered();
        //#endregion
    }
    //#endregion
    //#region copy builded distribution to
    copyBuildedDistributionTo(destination) {
        //#region @backendFunc
        return this._copyBuildedDistributionTo(destination);
        //#endregion
    }
    /**
     * There are 3 typese of --copyto build
     * 1. dist build (wihout source maps buit without links)
     * 2. dist build (with source maps and links) - when no buildOptions
     * 3. same as 2 buit with watch
     */
    _copyBuildedDistributionTo(destination, options) {
        //#region @backendFunc
        //#region init & prepare parameters
        const { specificFileRelativePath = void 0, absoluteAssetFilePath = void 0, } = options || {};
        // if (!specificFileRelativePath) {
        //   debugger
        //   Helpers.warn(`Invalid project: ${destination?.name}`)
        //   return;
        // }
        if (!destination || !destination?.location) {
            lib_6.Helpers.warn(`Invalid project: ${destination?.name}`);
            return;
        }
        const isTempLocalProj = destination.location === this.localTempProjPath;
        if (!specificFileRelativePath) {
            this.initalFixForDestination(destination);
        }
        const allFolderLinksExists = !this.buildOptions.build.watch
            ? true
            : this.linksForPackageAreOk(destination);
        // if(specificFileRelativePath) {
        //   Helpers.log(`[${destination?.name}] Specyfic file change (allFolderLinksExists=${allFolderLinksExists}) (event:${event})`
        //   + ` ${outDir}${specificFileRelativePath}`);
        // }
        //#endregion
        if ((specificFileRelativePath || absoluteAssetFilePath) &&
            allFolderLinksExists) {
            // Helpers.log(`handle ${specificFileRelativePath || absoluteAssetFilePath}`);
            if (absoluteAssetFilePath) {
                this.handleCopyOfAssetFile(absoluteAssetFilePath, destination);
            }
            else {
                //#region handle single file
                this.handleCopyOfSingleFile(destination, isTempLocalProj, specificFileRelativePath);
                if (REPLACE_INDEX_D_TS_IN_DEST_WHEN_WATCH &&
                    this.buildOptions.build.watch &&
                    specificFileRelativePath.endsWith('/index.d.ts')) {
                    // TODO could be limited more
                    this.replaceIndexDtsForEntryProjectIndex(destination);
                }
                //#endregion
            }
        }
        else {
            //#region handle all files
            // Helpers.log('copying all files');
            this.copyCompiledSourcesAndDeclarations(destination, isTempLocalProj);
            log.d('copying surce maps');
            this.copySourceMaps(destination, isTempLocalProj);
            this.copySharedAssets(destination, isTempLocalProj);
            this.removeSourceSymlinks(destination);
            this.addSourceSymlinks(destination);
            this.updateBackendFullDtsFiles(destination);
            this.updateBackendFullDtsFiles(this.monitoredOutDir);
            if (REPLACE_INDEX_D_TS_IN_DEST_WHEN_WATCH &&
                this.buildOptions.build.watch) {
                this.replaceIndexDtsForEntryProjectIndex(destination);
            }
            this.addSrcJSToDestination(destination);
            //#region copy/link package.json
            const destPackageInNodeModules = destination.pathFor([
                constants_1.nodeModulesMainProject,
                this.rootPackageName,
            ]);
            const packageJsonInDest = (0, lib_3.crossPlatformPath)([
                destPackageInNodeModules,
                constants_1.packageJsonNpmLib,
            ]);
            // console.log(`[copy-manager]
            //   copying package.json "${packageJsonInDest}"
            //   `);
            try {
                lib_4.fse.unlinkSync(packageJsonInDest);
            }
            catch (e) { }
            if (this.isWatchCompilation && !isTempLocalProj) {
                lib_6.Helpers.createSymLink(this.project.pathFor(constants_1.packageJsonMainProject), packageJsonInDest);
            }
            else {
                lib_5.HelpersTaon.copyFile(this.project.pathFor(constants_1.packageJsonMainProject), packageJsonInDest);
                // for (
                //   let index = 0;
                //   index < CopyMangerHelpers.browserwebsqlFolders.length;
                //   index++
                // ) {
                //   const currentBrowserFolder =
                //     CopyMangerHelpers.browserwebsqlFolders[index];
                //   const borwserOrWebsqlFolder = crossPlatformPath([
                //     destPackageInNodeModules,
                //     currentBrowserFolder,
                //     packageJsonNpmLib,
                //   ]);
                //   console.log(`[copy-manager]
                // copying package.json to "${borwserOrWebsqlFolder}"
                // `);
                // }
            }
            //#endregion
            // TODO not working werid tsc issue with browser/index
            // {const projectOudBorwserSrc = path.join(destination.location,
            //   folderName.node_modules,
            //   rootPackageName,
            //   fileName.package_json
            // );
            // const projectOudBorwserDest = path.join(destination.location,
            //   folderName.node_modules,
            //   rootPackageName,
            //   folderName.browser,
            //   fileName.package_json
            // );
            // HelpersTaon.copyFile(projectOudBorwserSrc, projectOudBorwserDest);}
            //#endregion
        }
        //#endregion
    }
    //#region replace d.ts files in destination after copy
    addSrcJSToDestination(destination) {
        //#region @backendFunc
        const location = destination.nodeModules.pathFor([
            this.rootPackageName,
            constants_1.srcJSFromNpmPackage,
        ]);
        lib_6.Helpers.writeFile(location, `"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./lib"), exports);
//# sourceMappingURL=index.js.map

      `);
        //#endregion
    }
}
exports.BaseCopyManger = BaseCopyManger;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/copy-manager/base-copy-manager.js.map