"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserCodeCut = void 0;
//#region imports
const lib_1 = require("isomorphic-region-loader/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const app_utils_1 = require("../../../../../../../app-utils");
const constants_1 = require("../../../../../../../constants");
const file_split_process_1 = require("./file-split-process");
//#endregion
const notAllowedToPRocess = [constants_1.appAutoGenDocsMd, constants_1.appAutoGenJs];
/**
 * Allow imports or exports with '/src' at the end
 *
 * import { ProcessController, Process } from '@codete-ngrx-quick-start/shared/src';
 * loadChildren: () => import(`@codete-ngrx-quick-start/realtime-process/src`)
 *
 * to be changed into:
 *
 * import { ProcessController, Process } from '@codete-ngrx-quick-start/shared/src';
 * loadChildren: () => import(`@codete-ngrx-quick-start/realtime-process/src`)
 *
 */
class BrowserCodeCut {
    absSourcePathFromSrc;
    absFileSourcePathBrowserOrWebsql;
    absPathTmpSrcDistFolder;
    project;
    buildOptions;
    //#region constants
    static debugFile = [
    // 'lib/start-cli.ts',
    // 'rest-request.ts',
    // 'models.ts',
    // '/endpoint-context.ts',
    // 'rest.class.ts'
    // 'hello-world-simple.context.ts',
    // 'utils.ts',
    // 'helpers-process.ts'
    // 'base-compiler-for-project.ts',
    // 'helpers-check.container.ts',
    ];
    //#endregion
    //#region fields
    /**
     * slighted modifed app release dist
     */
    absFileSourcePathBrowserOrWebsqlAPPONLY;
    rawContentForBrowser;
    rawContentForAPPONLYBrowser;
    rawContentBackend;
    //#region recreate app ts presentation files
    static recreateAppTsPresentationFiles;
    get recreateAppTsPresentationFiles() {
        return BrowserCodeCut.recreateAppTsPresentationFiles;
    }
    set recreateAppTsPresentationFiles(v) {
        BrowserCodeCut.recreateAppTsPresentationFiles = v;
    }
    //#endregion
    get importExportsFromOrgContent() {
        return this.splitFileProcess?._importExports || [];
    }
    splitFileProcess;
    /**
     * ex. path/to/file-somewhere.ts or assets/something/here
     * in src or tmpSrcDist etc.
     */
    relativePath;
    isWebsqlMode;
    isAssetsFile = false;
    absoluteBackendDestFilePath;
    debug = false;
    //#endregion
    //#region constructor
    nameForNpmPackage;
    isLinuxWatchModeAllowde;
    //#region @backend
    constructor(
    /**
     * ex.< project location >/src/something.ts
     */
    absSourcePathFromSrc, 
    /**
     * ex. < project location >/tmpSrcDistWebsql/my/relative/path.ts
     */
    absFileSourcePathBrowserOrWebsql, 
    /**
     * ex. < project location >/tmpSrcDist
     */
    absPathTmpSrcDistFolder, project, buildOptions) {
        this.absSourcePathFromSrc = absSourcePathFromSrc;
        this.absFileSourcePathBrowserOrWebsql = absFileSourcePathBrowserOrWebsql;
        this.absPathTmpSrcDistFolder = absPathTmpSrcDistFolder;
        this.project = project;
        this.buildOptions = buildOptions;
        if (buildOptions.build.watch) {
            if (!this.recreateAppTsPresentationFiles) {
                this.recreateAppTsPresentationFiles = lib_3._.debounce(() => {
                    this.project.framework.recreateAppTsPresentationFiles();
                }, 1000);
            }
        }
        //#region recognize namespaces for isomorphic packages
        this.nameForNpmPackage = project.nameForNpmPackage;
        this.isLinuxWatchModeAllowde = project.isLinuxWatchModeAllowde();
        //#endregion
        // console.log(`[incremental-build-process INSIDE BROWSER!!! '${this.buildOptions.baseHref}'`)
        this.absPathTmpSrcDistFolder = (0, lib_3.crossPlatformPath)(absPathTmpSrcDistFolder);
        this.absFileSourcePathBrowserOrWebsql = (0, lib_3.crossPlatformPath)(absFileSourcePathBrowserOrWebsql);
        let replaceFrom = buildOptions.build.websql ? constants_1.tmpSrcDistWebsql : constants_1.tmpSrcDist;
        let replaceTo = buildOptions.build.websql
            ? constants_1.tmpSrcAppDistWebsql
            : constants_1.tmpSrcAppDist;
        if (buildOptions.build.prod) {
            replaceFrom = `${replaceFrom}${constants_1.prodSuffix}`;
            replaceTo = `${replaceTo}${constants_1.prodSuffix}`;
        }
        this.absFileSourcePathBrowserOrWebsqlAPPONLY =
            this.absFileSourcePathBrowserOrWebsql.replace(replaceFrom, replaceTo);
        this.absSourcePathFromSrc = (0, lib_3.crossPlatformPath)(absSourcePathFromSrc);
        if (project.framework.isStandaloneProject) {
            if (absSourcePathFromSrc
                .replace(project.pathFor(constants_1.srcMainProject), '')
                .startsWith(`/${constants_1.assetsFromTempSrc}/`)) {
                this.isAssetsFile = true;
            }
        }
        this.relativePath = (0, lib_3.crossPlatformPath)(this.absFileSourcePathBrowserOrWebsql).replace(`${this.absPathTmpSrcDistFolder}/`, '');
        this.debug = BrowserCodeCut.debugFile.some(d => this.relativePath.endsWith(d));
        this.absoluteBackendDestFilePath = (0, lib_3.crossPlatformPath)([
            this.project.location,
            constants_1.tmpSourceDist + (buildOptions.build.prod ? constants_1.prodSuffix : ''),
            this.relativePath,
        ]);
        // console.log('RELATIVE ', this.relativePath)
        this.isWebsqlMode = this.relativePath.startsWith(constants_1.tmpSrcDistWebsql + (buildOptions.build.prod ? constants_1.prodSuffix : ''));
    }
    //#endregion
    //#endregion
    //#region public / methods & getters / process file
    processFile({ fileRemovedEvent, regionReplaceOptions, isCuttableFile, }) {
        //#region @backendFunc
        if (isCuttableFile) {
            this.initAndSaveCuttableFile(regionReplaceOptions);
        }
        else {
            this.initAndSaveAssetFile(fileRemovedEvent);
        }
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / init and save cuttabl file
    initAndSaveCuttableFile(options) {
        //#region @backendFunc
        if (notAllowedToPRocess.includes(this.relativePath)) {
            return;
        }
        return this.init()
            .REPLACERegionsForIsomorphicLib(lib_3._.cloneDeep(options))
            .REPLACERegionsFromTsImportExport()
            .save();
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / init and save
    initAndSaveAssetFile(remove = false) {
        // const debugFiles = ['assets/cutsmall.jpg'];
        //#region @backendFunc
        if (notAllowedToPRocess.includes(this.relativePath)) {
            return;
        }
        if (remove) {
            lib_4.Helpers.removeIfExists(this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsql));
            lib_4.Helpers.removeIfExists(this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsqlAPPONLY));
            lib_4.Helpers.removeIfExists(this.replaceAssetsPath(this.absoluteBackendDestFilePath));
        }
        else {
            // this is needed for json in src/lib or something
            // if (this.absFileSourcePathBrowserOrWebsql.endsWith(debugFiles[0])) {
            //   debugger;
            // }
            const realAbsSourcePathFromSrc = lib_3.fse.existsSync(this.absSourcePathFromSrc) &&
                lib_3.fse.realpathSync(this.absSourcePathFromSrc);
            if (!realAbsSourcePathFromSrc ||
                !lib_4.Helpers.exists(realAbsSourcePathFromSrc) ||
                lib_4.Helpers.isFolder(realAbsSourcePathFromSrc)) {
                return;
            }
            try {
                lib_4.HelpersTaon.copyFile(this.absSourcePathFromSrc, this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsql));
                lib_4.HelpersTaon.copyFile(this.absSourcePathFromSrc, this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsqlAPPONLY));
                // final straight copy to tmpSourceFolder
                lib_4.HelpersTaon.copyFile(this.absSourcePathFromSrc, this.replaceAssetsPath(this.absoluteBackendDestFilePath));
            }
            catch (error) {
                lib_4.Helpers.warn(`[taon][browser-code-cut] file not found ${this.absSourcePathFromSrc}`);
            }
        }
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / init
    rawOrginalContent;
    init() {
        //#region @backendFunc
        const orgContent = lib_4.Helpers.readFile(this.absSourcePathFromSrc, void 0, true) || '';
        this.rawOrginalContent = orgContent;
        const allIsomorphicPackagesFromMemory = this.project.packagesRecognition.allIsomorphicPackagesFromMemory;
        this.splitFileProcess = new file_split_process_1.SplitFileProcess(orgContent, this.absSourcePathFromSrc, allIsomorphicPackagesFromMemory, this.project.name, this.nameForNpmPackage);
        const { modifiedContent: firstPass, rewriteFile: firstTimeRewriteFile } = this.splitFileProcess.content;
        const { modifiedContent: secondPass, rewriteFile: secondTimeRewriteFile } = new file_split_process_1.SplitFileProcess(firstPass, this.absSourcePathFromSrc, allIsomorphicPackagesFromMemory, this.project.name, this.nameForNpmPackage).content;
        if ((orgContent || '').trim() !== (firstPass || '')?.trim()) {
            if (firstTimeRewriteFile &&
                (firstPass || '').trim() === (secondPass || '').trim() // it means it is stable
            ) {
                lib_4.Helpers.logInfo(`Rewrite file ${this.absSourcePathFromSrc}`);
                lib_4.Helpers.writeFile(this.absSourcePathFromSrc, firstPass);
            }
            else {
                lib_4.Helpers.logWarn(`Unstable file modification ${this.absSourcePathFromSrc}`);
            }
        }
        this.rawContentForBrowser = orgContent;
        this.rawContentForAPPONLYBrowser = this.rawContentForBrowser; // TODO not needed ?
        this.rawContentBackend = this.rawContentForBrowser; // at the beginning those are normal files from src
        return this;
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / project own smart packages
    get projectOwnSmartPackages() {
        //#region @backendFunc
        return [this.nameForNpmPackage];
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / is empty browser file
    get isEmptyBrowserFile() {
        //#region @backendFunc
        return this.rawContentForBrowser.replace(/\s/g, '').trim() === '';
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / is empty module backend file
    get isEmptyModuleBackendFile() {
        //#region @backendFunc
        return ((this.rawContentBackend || '').replace(/\/\*\ \*\//g, '').trim()
            .length === 0);
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / save empty file
    saveEmptyFile(isTsFile) {
        //#region @backendFunc
        if (!lib_3.fse.existsSync(lib_3.path.dirname(this.absFileSourcePathBrowserOrWebsql))) {
            // write empty instead unlink
            lib_3.fse.mkdirpSync(lib_3.path.dirname(this.absFileSourcePathBrowserOrWebsql));
        }
        if (!lib_3.fse.existsSync(lib_3.path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY))) {
            // write empty instead unlink
            lib_3.fse.mkdirpSync(lib_3.path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY));
        }
        if (isTsFile) {
            if (!this.relativePath.startsWith('app/')) {
                try {
                    // QUICK_FIX remove directory when trying to save as file
                    lib_3.fse.removeSync(this.absFileSourcePathBrowserOrWebsql);
                }
                catch (error) { }
                lib_3.fse.writeFileSync(this.absFileSourcePathBrowserOrWebsql, 'utf8');
            }
            try {
                // QUICK_FIX remove directory when trying to save as file
                lib_3.fse.removeSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY);
            }
            catch (error) { }
            lib_3.fse.writeFileSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY, 'utf8');
        }
        else {
            if (!this.relativePath.startsWith('app/')) {
                try {
                    // QUICK_FIX remove directory when trying to save as file
                    lib_3.fse.removeSync(this.absFileSourcePathBrowserOrWebsql);
                }
                catch (error) { }
                lib_3.fse.writeFileSync(this.absFileSourcePathBrowserOrWebsql, ``, 'utf8');
            }
            try {
                // QUICK_FIX remove directory when trying to save as file
                lib_3.fse.removeSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY);
            }
            catch (error) { }
            lib_3.fse.writeFileSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY, ``, 'utf8');
        }
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / save normal file
    saveNormalBrowserFile(isTsFile) {
        //#region @backendFunc
        // console.log('SAVE NORMAL FILE')
        if (this.isAssetsFile) {
            this.absFileSourcePathBrowserOrWebsql = this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsql);
            // console.log(`ASSETE: ${this.absFileSourcePathBrowserOrWebsql}`)
        }
        if (this.isAssetsFile) {
            this.absFileSourcePathBrowserOrWebsqlAPPONLY = this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsqlAPPONLY);
            // console.log(`ASSETE: ${this.absFileSourcePathBrowserOrWebsql}`)
        }
        if (!lib_3.fse.existsSync(lib_3.path.dirname(this.absFileSourcePathBrowserOrWebsql))) {
            lib_3.fse.mkdirpSync(lib_3.path.dirname(this.absFileSourcePathBrowserOrWebsql));
        }
        if (!lib_3.fse.existsSync(lib_3.path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY))) {
            lib_3.fse.mkdirpSync(lib_3.path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY));
        }
        this.processAssetsLinksForApp();
        if (!this.isAssetsFile && this.relativePath.endsWith('.backend.ts')) {
            return;
        }
        if (isTsFile) {
            //#region handle app.ts presentation files
            if (this.relativePath === constants_1.appTsFromSrc &&
                this.recreateAppTsPresentationFiles) {
                this.recreateAppTsPresentationFiles();
            }
            //#endregion
            if (!this.relativePath.startsWith(`${constants_1.appFromSrc}/`) &&
                !this.relativePath.startsWith(`${constants_1.appFromSrc}.`)) {
                // NORMAL TS BROWSER FILE FOR LIB
                const absFileSourcePathBrowserOrWebsqlCurrent = this
                    .isLinuxWatchModeAllowde
                    ? lib_2.UtilsFilesFoldersSync.readFile(this.absFileSourcePathBrowserOrWebsql)
                    : undefined;
                const absFileSourcePathBrowserOrWebsqlNewContent = this.changeNpmNameToLocalLibNamePath(this.rawContentForBrowser, this.absFileSourcePathBrowserOrWebsql, { isBrowser: true });
                if (absFileSourcePathBrowserOrWebsqlCurrent?.trimEnd() !==
                    absFileSourcePathBrowserOrWebsqlNewContent.trimEnd()) {
                    lib_3.fse.writeFileSync(this.absFileSourcePathBrowserOrWebsql, absFileSourcePathBrowserOrWebsqlNewContent, 'utf8');
                }
            }
            // NORMAL TS BROWSER FILE FOR APP
            const absFileSourcePathBrowserOrWebsqlAPPONLYCurrent = this
                .isLinuxWatchModeAllowde
                ? lib_2.UtilsFilesFoldersSync.readFile(this.absFileSourcePathBrowserOrWebsqlAPPONLY)
                : undefined;
            const absFileSourcePathBrowserOrWebsqlAPPONLYNewContent = this.changeNpmNameToLocalLibNamePath(this.rawContentForAPPONLYBrowser, this.absFileSourcePathBrowserOrWebsqlAPPONLY, { isBrowser: true, libForApp: true });
            if (absFileSourcePathBrowserOrWebsqlAPPONLYCurrent?.trimEnd() !==
                absFileSourcePathBrowserOrWebsqlAPPONLYNewContent.trimEnd()) {
                lib_3.fse.writeFileSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY, absFileSourcePathBrowserOrWebsqlAPPONLYNewContent, 'utf8');
            }
        }
        else {
            if (!this.relativePath.startsWith(`${constants_1.appFromSrc}/`)) {
                // NORMAL JSON, TXT (OR ANYTHING TEXT BASED) FOR BROWSER FILE FOR LIB
                const absFileSourcePathBrowserOrWebsqlCurrent = this
                    .isLinuxWatchModeAllowde
                    ? lib_2.UtilsFilesFoldersSync.readFile(this.absFileSourcePathBrowserOrWebsql)
                    : undefined;
                const absFileSourcePathBrowserOrWebsqlNewContent = this.rawContentForBrowser;
                if (absFileSourcePathBrowserOrWebsqlCurrent?.trimEnd() !==
                    absFileSourcePathBrowserOrWebsqlNewContent.trimEnd()) {
                    lib_3.fse.writeFileSync(this.absFileSourcePathBrowserOrWebsql, absFileSourcePathBrowserOrWebsqlNewContent, 'utf8');
                }
            }
            // NORMAL JSON, TXT (OR ANYTHING TEXT BASED) FOR BROWSER FILE FOR APP
            const absFileSourcePathBrowserOrWebsqlAPPONLYCurrent = this
                .isLinuxWatchModeAllowde
                ? lib_4.Helpers.readFile(this.absFileSourcePathBrowserOrWebsqlAPPONLY)
                : undefined;
            const absFileSourcePathBrowserOrWebsqlAPPONLYNewContent = this.rawContentForAPPONLYBrowser;
            if (absFileSourcePathBrowserOrWebsqlAPPONLYCurrent?.trimEnd() !==
                absFileSourcePathBrowserOrWebsqlAPPONLYNewContent.trimEnd()) {
                lib_3.fse.writeFileSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY, absFileSourcePathBrowserOrWebsqlAPPONLYNewContent, 'utf8');
            }
        }
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / replace regions from ts import export
    REPLACERegionsFromTsImportExport() {
        //#region @backendFunc
        if (this.isAssetsFile) {
            return this;
        }
        if (!this.relativePath.endsWith('.ts')) {
            if (this.relativePath.endsWith('.tsx')) {
                // ok
            }
            else {
                return this;
            }
        }
        const prodPart = this.buildOptions.build.prod ? constants_1.prodSuffix : '';
        if (lib_3._.isString(this.rawContentForBrowser)) {
            const toReplace = this.importExportsFromOrgContent.filter(imp => {
                imp.embeddedPathToFileResult = imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile.replace(`/${constants_1.srcMainProject}`, `/${(this.buildOptions.build.websql
                    ? constants_1.websqlFromImport
                    : constants_1.browserFromImport) + prodPart}`));
                return imp.isIsomorphic;
            });
            this.rawContentForBrowser = this.splitFileProcess.replaceInFile(this.rawContentForBrowser, toReplace);
            this.importExportsFromOrgContent.forEach(imp => delete imp.embeddedPathToFileResult);
        }
        if (lib_3._.isString(this.rawContentBackend)) {
            const toReplace = this.importExportsFromOrgContent.filter(imp => {
                imp.embeddedPathToFileResult = imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile.replace(`/${constants_1.srcFromTaonImport}`, `/${constants_1.libFromImport + prodPart}`));
                return imp.isIsomorphic;
            });
            this.rawContentBackend = this.splitFileProcess.replaceInFile(this.rawContentBackend, toReplace);
            this.importExportsFromOrgContent.forEach(imp => delete imp.embeddedPathToFileResult);
        }
        return this;
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / replace regions for isomorphic lib
    REPLACERegionsForIsomorphicLib(options) {
        //#region @backendFunc
        if (this.isAssetsFile) {
            return this;
        }
        options = lib_3._.clone(options);
        // Helpers.log(`[REPLACERegionsForIsomorphicLib] options.replacements ${this.absoluteFilePath}`)
        const ext = lib_3.path.extname(this.relativePath);
        // console.log(`Ext: "${ext}" for file: ${path.basename(this.absoluteFilePath)}`)
        if (lib_2.extAllowedToReplace.includes(ext)) {
            const orgContent = this.rawContentForBrowser;
            this.rawContentForBrowser = lib_1.RegionRemover.from(this.relativePath, orgContent, options.replacements, this.project).output;
            if (this.project.framework.isStandaloneProject && !this.isWebsqlMode) {
                const regionsToRemove = [lib_2.TAGS.BROWSER, lib_2.TAGS.WEBSQL_ONLY];
                const orgContentBackend = this.rawContentBackend;
                // const debug =  this.relativePath.endsWith('layout-simple-small-app.component.ts');
                // if (debug ) {
                //   console.log(this.relativePath);
                //   console.log({ debugging: regionsToRemove });
                //   console.log(orgContentBackend);
                // }
                this.rawContentBackend = lib_1.RegionRemover.from(this.absoluteBackendDestFilePath, orgContentBackend, regionsToRemove, this.project).output;
            }
        }
        (() => {
            const from = `${constants_1.srcMainProject}/${constants_1.assetsFromSrc}/`;
            const to = `${constants_1.TO_REMOVE_TAG}${constants_1.assetsFromNgProj}/` +
                `${constants_1.assetsFor}/${this.nameForNpmPackage}/${constants_1.assetsFromNpmPackage}/`;
            this.rawContentForBrowser = this.rawContentForBrowser.replace(new RegExp(lib_2.Utils.escapeStringForRegEx(`/${from}`), 'g'), to);
            this.rawContentForBrowser = this.rawContentForBrowser.replace(new RegExp(lib_2.Utils.escapeStringForRegEx(from), 'g'), to);
        })();
        return this;
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / processing asset link for app
    processAssetsLinksForApp() {
        //#region @backendFunc
        this.rawContentForAPPONLYBrowser = this.rawContentForBrowser.replace(new RegExp(lib_2.Utils.escapeStringForRegEx(constants_1.TO_REMOVE_TAG), 'g'), '');
        // console.log(`[incremental-build-process processAssetsLinksForApp '${this.buildOptions.baseHref}'`)
        const baseHref = this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(this.buildOptions.clone());
        // console.log(`Fixing with basehref: '${baseHref}'`)
        const howMuchBack = this.relativePath.split('/').length - 1;
        const back = howMuchBack === 0
            ? './'
            : lib_3._.times(howMuchBack)
                .map(() => '../')
                .join('');
        const toReplaceFn = (relativeAssetPathPart) => {
            // console.log({ relativeAssetPathPart });
            return [
                {
                    from: `${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                    to: `${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                    makeSureSlashAtBegin: true,
                },
                {
                    from: ` '/${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                    to: ` '${baseHref}${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: ` "/${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                    to: ` "${baseHref}${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `src="/${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                    to: `src="${baseHref}${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `[src]="'/${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                    to: `[src]="'${baseHref}${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `href="/${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                    to: `href="${baseHref}${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `[href]="'/${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                    to: `[href]="'${baseHref}${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `url(/${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                    to: `url(${baseHref}${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `url('/${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                    to: `url('${baseHref}${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `url("/${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                    to: `url("${baseHref}${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                },
                /**
                 *
        
          import * as json1 from '/shared/src/assets/hamsters/test.json';
          console.log({ json1 }) -> WORKS NOW
                 */
                {
                    from: ` from '/${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                    to: ` from '${back}${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: ` from "/${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                    to: ` from "${back}${constants_1.assetsFromSrc}/${constants_1.assetsFor}/${relativeAssetPathPart}/`,
                },
                /**
                 * what can be done more
                 * import * as json2 from '@codete-rxjs-quick-start/shared/assets/shared//src';
          console.log({ json2 })
        
          declare module "*.json" {
          const value: any;
          export default value;
          }
        
                 */
            ];
        };
        (() => {
            const cases = toReplaceFn(this.nameForNpmPackage);
            for (let index = 0; index < cases.length; index++) {
                const { to, from, makeSureSlashAtBegin } = cases[index];
                if (makeSureSlashAtBegin) {
                    this.rawContentForAPPONLYBrowser =
                        this.rawContentForAPPONLYBrowser.replace(new RegExp(lib_2.Utils.escapeStringForRegEx(`/${from}`), 'g'), `/${to}`);
                    this.rawContentForAPPONLYBrowser =
                        this.rawContentForAPPONLYBrowser.replace(new RegExp(lib_2.Utils.escapeStringForRegEx(from), 'g'), `/${to}`);
                }
                else {
                    this.rawContentForAPPONLYBrowser =
                        this.rawContentForAPPONLYBrowser.replace(new RegExp(lib_2.Utils.escapeStringForRegEx(from), 'g'), to);
                }
            }
        })();
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / save
    save() {
        //#region @backendFunc
        if (this.isAssetsFile) {
            this.saveNormalBrowserFile(false);
            return;
        }
        // Helpers.log(`saving ismoprhic file: ${this.absoluteFilePath}`, 1)
        const isTsFile = ['.ts', '.tsx'].includes(lib_3.path.extname(this.absFileSourcePathBrowserOrWebsql));
        const backendFileSaveMode = !this.isWebsqlMode; // websql does not do anything on be
        if (this.isEmptyBrowserFile) {
            this.saveEmptyFile(isTsFile);
        }
        else {
            this.saveNormalBrowserFile(isTsFile);
        }
        if (backendFileSaveMode) {
            const isEmptyModuleBackendFile = this.isEmptyModuleBackendFile;
            const absoluteBackendDestFilePath = this.absoluteBackendDestFilePath;
            if (!lib_3.fse.existsSync(lib_3.path.dirname(absoluteBackendDestFilePath))) {
                lib_3.fse.mkdirpSync(lib_3.path.dirname(absoluteBackendDestFilePath));
            }
            const isFrontendFile = !lib_3._.isUndefined(lib_2.frontEndOnly.find(f => absoluteBackendDestFilePath.endsWith(f)));
            if (isFrontendFile) {
                // console.log(`Ommiting for backend: ${absoluteBackendDestFilePath} `)
                return;
            }
            const absoluteBackendDestFilePathCurrent = this.isLinuxWatchModeAllowde
                ? lib_2.UtilsFilesFoldersSync.readFile(absoluteBackendDestFilePath)
                : undefined;
            const absoluteBackendDestFilePathNewContent = isEmptyModuleBackendFile && isTsFile
                ? `export function dummy${new Date().getTime()}() { }`
                : this.changeNpmNameToLocalLibNamePath(this.rawContentBackend, absoluteBackendDestFilePath, {
                    isBrowser: false,
                });
            if (absoluteBackendDestFilePathCurrent?.trimEnd() !==
                absoluteBackendDestFilePathNewContent.trimEnd()) {
                // SAVE BACKEND FILE
                lib_3.fse.writeFileSync(absoluteBackendDestFilePath, absoluteBackendDestFilePathNewContent, 'utf8');
            }
        }
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / production namespaces split
    static initialWarning = {};
    get initialWarnings() {
        return BrowserCodeCut.initialWarning;
    }
    //#endregion
    //#region private / methods & getters / change content before saving file
    changeNpmNameToLocalLibNamePath(content, absFilePath, options) {
        //#region @backendFunc
        const isLibFile = this.relativePath.startsWith(`${constants_1.libFromSrc}/`);
        if (!absFilePath.endsWith('.ts')) {
            if (absFilePath.endsWith('.tsx')) {
                // ok
            }
            else {
                // console.log(`NOT_FIXING: ${absFilePath}`)
                return content;
            }
        }
        const typeOfOp = options.isBrowser
            ? this.buildOptions.build.websql
                ? constants_1.websqlTypeString
                : constants_1.browserTypeString
            : constants_1.libTypeString;
        // this.debug &&
        //   console.log(`
        //   relativePath: ${this.relativePath}
        //   isLibFile: ${isLibFile}
        //   type of operation: ${typeOfOp}
        //   `);
        // if (this.debug) {
        //   console.log(`Fixing imports in: ${absFilePath}`);
        //   console.log(`Fixing imports in: ${this.relativePath}`);
        // }
        const projectOwnSmartPackages = this.projectOwnSmartPackages;
        const { isBrowser, libForApp } = options;
        const howMuchBack = this.relativePath.split('/').length - 1;
        const howMuchBackIndex = howMuchBack - 1;
        const backAppLibIndex = howMuchBack === 0
            ? './'
            : lib_3._.times(howMuchBack)
                .map(() => '../')
                .join('');
        const backLibIndex = howMuchBackIndex === 0
            ? './'
            : lib_3._.times(howMuchBackIndex)
                .map(() => '../')
                .join('');
        let toReplace = [];
        if (isBrowser) {
            toReplace = lib_4.UtilsTypescript.recognizeImportsFromContent(this.rawContentForBrowser).filter(f => {
                const fPkgBrowser = f.cleanEmbeddedPathToFile
                    .replace(new RegExp(lib_2.Utils.escapeStringForRegEx(`/${constants_1.browserFromImport + constants_1.prodSuffix}`) +
                    '$'), '')
                    .replace(new RegExp(lib_2.Utils.escapeStringForRegEx(`/${constants_1.websqlFromImport + constants_1.prodSuffix}`) +
                    '$'), '')
                    .replace(new RegExp(lib_2.Utils.escapeStringForRegEx(`/${constants_1.browserFromImport}`) + '$'), '')
                    .replace(new RegExp(lib_2.Utils.escapeStringForRegEx(`/${constants_1.websqlFromImport}`) + '$'), '');
                // this.debug && console.log({ fPkgBrowser });
                return projectOwnSmartPackages.includes(fPkgBrowser);
            });
        }
        else {
            toReplace = lib_4.UtilsTypescript.recognizeImportsFromContent(this.rawContentBackend).filter(f => {
                const fpkgBackend = f.cleanEmbeddedPathToFile
                    .replace(new RegExp(lib_2.Utils.escapeStringForRegEx(`/${constants_1.libFromImport + constants_1.prodSuffix}`) +
                    '$'), '')
                    .replace(new RegExp(lib_2.Utils.escapeStringForRegEx(`/${constants_1.libFromImport}`) + '$'), '');
                // this.debug && console.log({ fpkgBackend });
                return projectOwnSmartPackages.includes(fpkgBackend);
            });
        }
        for (const imp of toReplace) {
            //#region handle stuff from /src/lib
            const cleanName = (0, app_utils_1.getCleanImport)(imp.cleanEmbeddedPathToFile);
            // this.debug && console.log({ cleanName });
            if (isLibFile) {
                const indexInIfile = (this.rawOrginalContent || '')
                    .split('\n')
                    .findIndex(line => {
                    return line.includes(`${cleanName}/${constants_1.srcFromTaonImport}`);
                });
                const key = `${cleanName}:${indexInIfile}:${this.relativePath}`;
                if (!this.initialWarnings[key]) {
                    // console.log(
                    //   `isBrowser: ${!!isBrowser}, libForApp: ${!!libForApp},ab ${absFilePath}, rel: ${this.relativePath}`,
                    // );
                    lib_4.Helpers.warn(`(illegal import ${lib_2.chalk.bold(`${cleanName}/${constants_1.srcFromTaonImport}`)})` +
                        ` Use relative path: ./${(0, lib_3.crossPlatformPath)([constants_1.srcMainProject, this.relativePath])}:${indexInIfile + 1}`);
                    this.initialWarnings[key] = true;
                }
            }
            imp.embeddedPathToFileResult = imp.wrapInParenthesis(`${isLibFile ? backLibIndex : backAppLibIndex}${constants_1.indexTsFromLibFromSrc.replace('.tsx', '').replace('.ts', '')}`);
            //#endregion
        }
        content = this.splitFileProcess.replaceInFile(content, toReplace);
        return content;
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / replace assets path
    replaceAssetsPath(absDestinationPath) {
        //#region @backendFunc
        const isAsset = this.relativePath.startsWith(`${constants_1.assetsFromTempSrc}/`);
        // isAsset && console.log('isAsset', absDestinationPath);
        return isAsset
            ? absDestinationPath.replace(`/${constants_1.assetsFromTempSrc}/`, `/${constants_1.assetsFromNgProj}/${constants_1.assetsFor}/${this.nameForNpmPackage}/${constants_1.assetsFromNpmPackage}/`)
            : absDestinationPath;
        //#endregion
    }
}
exports.BrowserCodeCut = BrowserCodeCut;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/build-isomorphic-lib/code-cut/browser-code-cut.js.map