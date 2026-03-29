import { Level, Log__NS__create } from 'ng2-logger/lib-prod';
import { config, LibTypeEnum, taonPackageName, tnpPackageName, Utils__NS__escapeStringForRegEx, Utils__NS__uniqArray } from 'tnp-core/lib-prod';
import { crossPlatformPath, ___NS__debounce, ___NS__first } from 'tnp-core/lib-prod';
import { fse } from 'tnp-core/lib-prod';
import { BaseCompilerForProject, HelpersTaon__NS__copyFile } from 'tnp-helpers/lib-prod';
import { Helpers__NS__createSymLink, Helpers__NS__info, Helpers__NS__log, Helpers__NS__readFile, Helpers__NS__warn, Helpers__NS__writeFile } from 'tnp-helpers/lib-prod';
import { browserMainProject, dirnameFromSourceToProject, distFromNgBuild, nodeModulesMainProject, packageJsonMainProject, packageJsonNpmLib, prodSuffix, sourceLinkInNodeModules, srcJSFromNpmPackage, tmpAlreadyStartedCopyManager, TO_REMOVE_TAG, websqlMainProject, whatToLinkFromCore, } from '../../../../../../constants';
import { SourceMappingUrl } from './source-maping-url';
//#endregion
const REPLACE_INDEX_D_TS_IN_DEST_WHEN_WATCH = false;
const log = Log__NS__create('Base copy manager', Level.WARN, Level.ERROR);
export class BaseCopyManger extends BaseCompilerForProject {
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
        if (config.frameworkName === tnpPackageName &&
            this.project.name !== tnpPackageName) {
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
            browserMainProject,
            websqlMainProject,
            browserMainProject + prodSuffix,
            websqlMainProject + prodSuffix,
        ];
    }
    //#endregion
    sourceFoldersToRemoveFromNpmPackage;
    //#endregion
    //#region getters
    //#region getters / source path to link
    get sourcePathToLink() {
        //#region @backendFunc
        const sourceToLink = crossPlatformPath([
            this.project.location,
            whatToLinkFromCore,
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
        const isTaonProdCli = taonPackageName === config.frameworkName;
        //#region resolve all possible project for package distribution
        let projectForNodeModulesPkgUpdate = [
            this.project.ins.by(LibTypeEnum.CONTAINER, this.project.framework.frameworkVersion),
            this.project.framework.coreContainer,
        ];
        //#endregion
        projectForNodeModulesPkgUpdate.push(this.project.tnpCurrentCoreContainer);
        projectForNodeModulesPkgUpdate = projectForNodeModulesPkgUpdate.filter(f => !!f);
        if (isTaonProdCli &&
            this.project.framework.isLinkToNodeModulesDifferentThanCoreContainer) {
            try {
                const possibleTnpLocation = crossPlatformPath(dirnameFromSourceToProject(this.project.pathFor([
                    nodeModulesMainProject,
                    tnpPackageName,
                    sourceLinkInNodeModules,
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
        return Utils__NS__uniqArray(result, 'location');
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
    updateTriggered = ___NS__debounce(() => {
        Helpers__NS__log(`[copy-manager] update triggered`);
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
        let contentOrg = Helpers__NS__readFile(fileAbsolutePath) || '';
        const newContent = contentOrg.replace(new RegExp(Utils__NS__escapeStringForRegEx(TO_REMOVE_TAG), 'g'), '');
        if (newContent && contentOrg && newContent !== contentOrg) {
            Helpers__NS__writeFile(fileAbsolutePath, newContent);
            // console.log(`[copy-manager] content replaced in ${fileAbsolutePath}`);
        }
        //#endregion
    }
    //#region async action
    async asyncAction(event) {
        //#region @backendFunc
        const absoluteFilePath = crossPlatformPath(event.fileAbsolutePath);
        // console.log('async event '+ absoluteFilePath)
        this.contentReplaced(absoluteFilePath);
        SourceMappingUrl.fixContent(absoluteFilePath, this.buildOptions);
        let specificFileRelativePath;
        let absoluteAssetFilePath;
        if (absoluteFilePath.startsWith(this.monitoredOutDir)) {
            specificFileRelativePath = absoluteFilePath.replace(this.monitoredOutDir + '/', '');
        }
        else {
            absoluteAssetFilePath = absoluteFilePath;
        }
        const projectToCopyTo = this.projectToCopyTo;
        // Helpers__NS__log(`ASYNC ACTION
        // absoluteFilePath: ${absoluteFilePath}
        // specificFileRelativePath: ${specificFileRelativePath}
        // `);
        //     Helpers__NS__log(`
        //     copyto project:
        // ${projectToCopyTo.map(p => p.location).join('\n')}
        //     `)
        for (let index = 0; index < projectToCopyTo.length; index++) {
            const projectToCopy = projectToCopyTo[index];
            this._copyBuildedDistributionTo(projectToCopy, {
                absoluteAssetFilePath,
                specificFileRelativePath: event && specificFileRelativePath,
                outDir: distFromNgBuild,
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
        if (this.project.hasFile(tmpAlreadyStartedCopyManager) &&
            this.project.readFile(tmpAlreadyStartedCopyManager) === '-') {
            // @ts-ignore
            this.isStartFromScratch = false;
        }
        else {
            this.project.writeFile(tmpAlreadyStartedCopyManager, '-');
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
                ? `project "${___NS__first(projectToCopyTo).name}"`
                : `all ${projectToCopyTo.length} projects`;
            log.info(`From now... ${porjectINfo} will be updated after every change...`);
            Helpers__NS__info(`[buildable-project] copying compiled code/assets to ${projectToCopyTo.length} other projects...
${projectToCopyTo.map(proj => `- ${proj.location}`).join('\n')}
      `);
        }
        for (let index = 0; index < projectToCopyTo.length; index++) {
            const projectToCopy = projectToCopyTo[index];
            log.data(`copying to ${projectToCopy?.name}`);
            this._copyBuildedDistributionTo(projectToCopy, {
                outDir: distFromNgBuild,
            });
            // if (this.buildOptions.buildForRelease && !global.tnpNonInteractive) {
            //   Helpers__NS__info('Things copied to :' + projectToCopy?.name);
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
        //   Helpers__NS__warn(`Invalid project: ${destination?.name}`)
        //   return;
        // }
        if (!destination || !destination?.location) {
            Helpers__NS__warn(`Invalid project: ${destination?.name}`);
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
        //   Helpers__NS__log(`[${destination?.name}] Specyfic file change (allFolderLinksExists=${allFolderLinksExists}) (event:${event})`
        //   + ` ${outDir}${specificFileRelativePath}`);
        // }
        //#endregion
        if ((specificFileRelativePath || absoluteAssetFilePath) &&
            allFolderLinksExists) {
            // Helpers__NS__log(`handle ${specificFileRelativePath || absoluteAssetFilePath}`);
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
            // Helpers__NS__log('copying all files');
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
                nodeModulesMainProject,
                this.rootPackageName,
            ]);
            const packageJsonInDest = crossPlatformPath([
                destPackageInNodeModules,
                packageJsonNpmLib,
            ]);
            // console.log(`[copy-manager]
            //   copying package.json "${packageJsonInDest}"
            //   `);
            try {
                fse.unlinkSync(packageJsonInDest);
            }
            catch (e) { }
            if (this.isWatchCompilation && !isTempLocalProj) {
                Helpers__NS__createSymLink(this.project.pathFor(packageJsonMainProject), packageJsonInDest);
            }
            else {
                HelpersTaon__NS__copyFile(this.project.pathFor(packageJsonMainProject), packageJsonInDest);
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
            // HelpersTaon__NS__copyFile(projectOudBorwserSrc, projectOudBorwserDest);}
            //#endregion
        }
        //#endregion
    }
    //#region replace d.ts files in destination after copy
    addSrcJSToDestination(destination) {
        //#region @backendFunc
        const location = destination.nodeModules.pathFor([
            this.rootPackageName,
            srcJSFromNpmPackage,
        ]);
        Helpers__NS__writeFile(location, `"use strict";
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/copy-manager/base-copy-manager.js.map