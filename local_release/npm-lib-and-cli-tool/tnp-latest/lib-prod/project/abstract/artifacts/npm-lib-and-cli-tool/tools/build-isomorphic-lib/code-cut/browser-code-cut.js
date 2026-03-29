//#region imports
import { RegionRemover } from 'isomorphic-region-loader/lib-prod';
import { chalk, extAllowedToReplace, frontEndOnly, TAGS, Utils__NS__escapeStringForRegEx, UtilsFilesFoldersSync__NS__readFile } from 'tnp-core/lib-prod';
import { path, fse, crossPlatformPath, ___NS__clone, ___NS__cloneDeep, ___NS__debounce, ___NS__isString, ___NS__isUndefined, ___NS__times } from 'tnp-core/lib-prod';
import { Helpers__NS__exists, Helpers__NS__isFolder, Helpers__NS__logInfo, Helpers__NS__logWarn, Helpers__NS__readFile, Helpers__NS__removeIfExists, Helpers__NS__warn, Helpers__NS__writeFile, HelpersTaon__NS__copyFile, UtilsTypescript__NS__recognizeImportsFromContent } from 'tnp-helpers/lib-prod';
import { getCleanImport, } from '../../../../../../../app-utils';
import { appAutoGenDocsMd, appAutoGenJs, appFromSrc, appTsFromSrc, assetsFor, assetsFromNgProj, assetsFromNpmPackage, assetsFromSrc, assetsFromTempSrc, browserFromImport, browserTypeString, indexTsFromLibFromSrc, libFromImport, libFromSrc, libTypeString, prodSuffix, srcFromTaonImport, srcMainProject, tmpSourceDist, tmpSrcAppDist, tmpSrcAppDistWebsql, tmpSrcDist, tmpSrcDistWebsql, TO_REMOVE_TAG, websqlFromImport, websqlTypeString, } from '../../../../../../../constants';
import { SplitFileProcess } from './file-split-process';
//#endregion
const notAllowedToPRocess = [appAutoGenDocsMd, appAutoGenJs];
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
export class BrowserCodeCut {
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
                this.recreateAppTsPresentationFiles = ___NS__debounce(() => {
                    this.project.framework.recreateAppTsPresentationFiles();
                }, 1000);
            }
        }
        //#region recognize namespaces for isomorphic packages
        this.nameForNpmPackage = project.nameForNpmPackage;
        this.isLinuxWatchModeAllowde = project.isLinuxWatchModeAllowde();
        //#endregion
        // console.log(`[incremental-build-process INSIDE BROWSER!!! '${this.buildOptions.baseHref}'`)
        this.absPathTmpSrcDistFolder = crossPlatformPath(absPathTmpSrcDistFolder);
        this.absFileSourcePathBrowserOrWebsql = crossPlatformPath(absFileSourcePathBrowserOrWebsql);
        let replaceFrom = buildOptions.build.websql ? tmpSrcDistWebsql : tmpSrcDist;
        let replaceTo = buildOptions.build.websql
            ? tmpSrcAppDistWebsql
            : tmpSrcAppDist;
        if (buildOptions.build.prod) {
            replaceFrom = `${replaceFrom}${prodSuffix}`;
            replaceTo = `${replaceTo}${prodSuffix}`;
        }
        this.absFileSourcePathBrowserOrWebsqlAPPONLY =
            this.absFileSourcePathBrowserOrWebsql.replace(replaceFrom, replaceTo);
        this.absSourcePathFromSrc = crossPlatformPath(absSourcePathFromSrc);
        if (project.framework.isStandaloneProject) {
            if (absSourcePathFromSrc
                .replace(project.pathFor(srcMainProject), '')
                .startsWith(`/${assetsFromTempSrc}/`)) {
                this.isAssetsFile = true;
            }
        }
        this.relativePath = crossPlatformPath(this.absFileSourcePathBrowserOrWebsql).replace(`${this.absPathTmpSrcDistFolder}/`, '');
        this.debug = BrowserCodeCut.debugFile.some(d => this.relativePath.endsWith(d));
        this.absoluteBackendDestFilePath = crossPlatformPath([
            this.project.location,
            tmpSourceDist + (buildOptions.build.prod ? prodSuffix : ''),
            this.relativePath,
        ]);
        // console.log('RELATIVE ', this.relativePath)
        this.isWebsqlMode = this.relativePath.startsWith(tmpSrcDistWebsql + (buildOptions.build.prod ? prodSuffix : ''));
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
            .REPLACERegionsForIsomorphicLib(___NS__cloneDeep(options))
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
            Helpers__NS__removeIfExists(this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsql));
            Helpers__NS__removeIfExists(this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsqlAPPONLY));
            Helpers__NS__removeIfExists(this.replaceAssetsPath(this.absoluteBackendDestFilePath));
        }
        else {
            // this is needed for json in src/lib or something
            // if (this.absFileSourcePathBrowserOrWebsql.endsWith(debugFiles[0])) {
            //   debugger;
            // }
            const realAbsSourcePathFromSrc = fse.existsSync(this.absSourcePathFromSrc) &&
                fse.realpathSync(this.absSourcePathFromSrc);
            if (!realAbsSourcePathFromSrc ||
                !Helpers__NS__exists(realAbsSourcePathFromSrc) ||
                Helpers__NS__isFolder(realAbsSourcePathFromSrc)) {
                return;
            }
            try {
                HelpersTaon__NS__copyFile(this.absSourcePathFromSrc, this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsql));
                HelpersTaon__NS__copyFile(this.absSourcePathFromSrc, this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsqlAPPONLY));
                // final straight copy to tmpSourceFolder
                HelpersTaon__NS__copyFile(this.absSourcePathFromSrc, this.replaceAssetsPath(this.absoluteBackendDestFilePath));
            }
            catch (error) {
                Helpers__NS__warn(`[taon][browser-code-cut] file not found ${this.absSourcePathFromSrc}`);
            }
        }
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / init
    rawOrginalContent;
    init() {
        //#region @backendFunc
        const orgContent = Helpers__NS__readFile(this.absSourcePathFromSrc, void 0, true) || '';
        this.rawOrginalContent = orgContent;
        const allIsomorphicPackagesFromMemory = this.project.packagesRecognition.allIsomorphicPackagesFromMemory;
        this.splitFileProcess = new SplitFileProcess(orgContent, this.absSourcePathFromSrc, allIsomorphicPackagesFromMemory, this.project.name, this.nameForNpmPackage);
        const { modifiedContent: firstPass, rewriteFile: firstTimeRewriteFile } = this.splitFileProcess.content;
        const { modifiedContent: secondPass, rewriteFile: secondTimeRewriteFile } = new SplitFileProcess(firstPass, this.absSourcePathFromSrc, allIsomorphicPackagesFromMemory, this.project.name, this.nameForNpmPackage).content;
        if ((orgContent || '').trim() !== (firstPass || '')?.trim()) {
            if (firstTimeRewriteFile &&
                (firstPass || '').trim() === (secondPass || '').trim() // it means it is stable
            ) {
                Helpers__NS__logInfo(`Rewrite file ${this.absSourcePathFromSrc}`);
                Helpers__NS__writeFile(this.absSourcePathFromSrc, firstPass);
            }
            else {
                Helpers__NS__logWarn(`Unstable file modification ${this.absSourcePathFromSrc}`);
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
        if (!fse.existsSync(path.dirname(this.absFileSourcePathBrowserOrWebsql))) {
            // write empty instead unlink
            fse.mkdirpSync(path.dirname(this.absFileSourcePathBrowserOrWebsql));
        }
        if (!fse.existsSync(path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY))) {
            // write empty instead unlink
            fse.mkdirpSync(path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY));
        }
        if (isTsFile) {
            if (!this.relativePath.startsWith('app/')) {
                try {
                    // QUICK_FIX remove directory when trying to save as file
                    fse.removeSync(this.absFileSourcePathBrowserOrWebsql);
                }
                catch (error) { }
                fse.writeFileSync(this.absFileSourcePathBrowserOrWebsql, 'utf8');
            }
            try {
                // QUICK_FIX remove directory when trying to save as file
                fse.removeSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY);
            }
            catch (error) { }
            fse.writeFileSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY, 'utf8');
        }
        else {
            if (!this.relativePath.startsWith('app/')) {
                try {
                    // QUICK_FIX remove directory when trying to save as file
                    fse.removeSync(this.absFileSourcePathBrowserOrWebsql);
                }
                catch (error) { }
                fse.writeFileSync(this.absFileSourcePathBrowserOrWebsql, ``, 'utf8');
            }
            try {
                // QUICK_FIX remove directory when trying to save as file
                fse.removeSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY);
            }
            catch (error) { }
            fse.writeFileSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY, ``, 'utf8');
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
        if (!fse.existsSync(path.dirname(this.absFileSourcePathBrowserOrWebsql))) {
            fse.mkdirpSync(path.dirname(this.absFileSourcePathBrowserOrWebsql));
        }
        if (!fse.existsSync(path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY))) {
            fse.mkdirpSync(path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY));
        }
        this.processAssetsLinksForApp();
        if (!this.isAssetsFile && this.relativePath.endsWith('.backend.ts')) {
            return;
        }
        if (isTsFile) {
            //#region handle app.ts presentation files
            if (this.relativePath === appTsFromSrc &&
                this.recreateAppTsPresentationFiles) {
                this.recreateAppTsPresentationFiles();
            }
            //#endregion
            if (!this.relativePath.startsWith(`${appFromSrc}/`) &&
                !this.relativePath.startsWith(`${appFromSrc}.`)) {
                // NORMAL TS BROWSER FILE FOR LIB
                const absFileSourcePathBrowserOrWebsqlCurrent = this
                    .isLinuxWatchModeAllowde
                    ? UtilsFilesFoldersSync__NS__readFile(this.absFileSourcePathBrowserOrWebsql)
                    : undefined;
                const absFileSourcePathBrowserOrWebsqlNewContent = this.changeNpmNameToLocalLibNamePath(this.rawContentForBrowser, this.absFileSourcePathBrowserOrWebsql, { isBrowser: true });
                if (absFileSourcePathBrowserOrWebsqlCurrent?.trimEnd() !==
                    absFileSourcePathBrowserOrWebsqlNewContent.trimEnd()) {
                    fse.writeFileSync(this.absFileSourcePathBrowserOrWebsql, absFileSourcePathBrowserOrWebsqlNewContent, 'utf8');
                }
            }
            // NORMAL TS BROWSER FILE FOR APP
            const absFileSourcePathBrowserOrWebsqlAPPONLYCurrent = this
                .isLinuxWatchModeAllowde
                ? UtilsFilesFoldersSync__NS__readFile(this.absFileSourcePathBrowserOrWebsqlAPPONLY)
                : undefined;
            const absFileSourcePathBrowserOrWebsqlAPPONLYNewContent = this.changeNpmNameToLocalLibNamePath(this.rawContentForAPPONLYBrowser, this.absFileSourcePathBrowserOrWebsqlAPPONLY, { isBrowser: true, libForApp: true });
            if (absFileSourcePathBrowserOrWebsqlAPPONLYCurrent?.trimEnd() !==
                absFileSourcePathBrowserOrWebsqlAPPONLYNewContent.trimEnd()) {
                fse.writeFileSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY, absFileSourcePathBrowserOrWebsqlAPPONLYNewContent, 'utf8');
            }
        }
        else {
            if (!this.relativePath.startsWith(`${appFromSrc}/`)) {
                // NORMAL JSON, TXT (OR ANYTHING TEXT BASED) FOR BROWSER FILE FOR LIB
                const absFileSourcePathBrowserOrWebsqlCurrent = this
                    .isLinuxWatchModeAllowde
                    ? UtilsFilesFoldersSync__NS__readFile(this.absFileSourcePathBrowserOrWebsql)
                    : undefined;
                const absFileSourcePathBrowserOrWebsqlNewContent = this.rawContentForBrowser;
                if (absFileSourcePathBrowserOrWebsqlCurrent?.trimEnd() !==
                    absFileSourcePathBrowserOrWebsqlNewContent.trimEnd()) {
                    fse.writeFileSync(this.absFileSourcePathBrowserOrWebsql, absFileSourcePathBrowserOrWebsqlNewContent, 'utf8');
                }
            }
            // NORMAL JSON, TXT (OR ANYTHING TEXT BASED) FOR BROWSER FILE FOR APP
            const absFileSourcePathBrowserOrWebsqlAPPONLYCurrent = this
                .isLinuxWatchModeAllowde
                ? Helpers__NS__readFile(this.absFileSourcePathBrowserOrWebsqlAPPONLY)
                : undefined;
            const absFileSourcePathBrowserOrWebsqlAPPONLYNewContent = this.rawContentForAPPONLYBrowser;
            if (absFileSourcePathBrowserOrWebsqlAPPONLYCurrent?.trimEnd() !==
                absFileSourcePathBrowserOrWebsqlAPPONLYNewContent.trimEnd()) {
                fse.writeFileSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY, absFileSourcePathBrowserOrWebsqlAPPONLYNewContent, 'utf8');
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
        const prodPart = this.buildOptions.build.prod ? prodSuffix : '';
        if (___NS__isString(this.rawContentForBrowser)) {
            const toReplace = this.importExportsFromOrgContent.filter(imp => {
                imp.embeddedPathToFileResult = imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile.replace(`/${srcMainProject}`, `/${(this.buildOptions.build.websql
                    ? websqlFromImport
                    : browserFromImport) + prodPart}`));
                return imp.isIsomorphic;
            });
            this.rawContentForBrowser = this.splitFileProcess.replaceInFile(this.rawContentForBrowser, toReplace);
            this.importExportsFromOrgContent.forEach(imp => delete imp.embeddedPathToFileResult);
        }
        if (___NS__isString(this.rawContentBackend)) {
            const toReplace = this.importExportsFromOrgContent.filter(imp => {
                imp.embeddedPathToFileResult = imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile.replace(`/${srcFromTaonImport}`, `/${libFromImport + prodPart}`));
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
        options = ___NS__clone(options);
        // Helpers__NS__log(`[REPLACERegionsForIsomorphicLib] options.replacements ${this.absoluteFilePath}`)
        const ext = path.extname(this.relativePath);
        // console.log(`Ext: "${ext}" for file: ${path.basename(this.absoluteFilePath)}`)
        if (extAllowedToReplace.includes(ext)) {
            const orgContent = this.rawContentForBrowser;
            this.rawContentForBrowser = RegionRemover.from(this.relativePath, orgContent, options.replacements, this.project).output;
            if (this.project.framework.isStandaloneProject && !this.isWebsqlMode) {
                const regionsToRemove = [TAGS.BROWSER, TAGS.WEBSQL_ONLY];
                const orgContentBackend = this.rawContentBackend;
                // const debug =  this.relativePath.endsWith('layout-simple-small-app.component.ts');
                // if (debug ) {
                //   console.log(this.relativePath);
                //   console.log({ debugging: regionsToRemove });
                //   console.log(orgContentBackend);
                // }
                this.rawContentBackend = RegionRemover.from(this.absoluteBackendDestFilePath, orgContentBackend, regionsToRemove, this.project).output;
            }
        }
        (() => {
            const from = `${srcMainProject}/${assetsFromSrc}/`;
            const to = `${TO_REMOVE_TAG}${assetsFromNgProj}/` +
                `${assetsFor}/${this.nameForNpmPackage}/${assetsFromNpmPackage}/`;
            this.rawContentForBrowser = this.rawContentForBrowser.replace(new RegExp(Utils__NS__escapeStringForRegEx(`/${from}`), 'g'), to);
            this.rawContentForBrowser = this.rawContentForBrowser.replace(new RegExp(Utils__NS__escapeStringForRegEx(from), 'g'), to);
        })();
        return this;
        //#endregion
    }
    //#endregion
    //#region private / methods & getters / processing asset link for app
    processAssetsLinksForApp() {
        //#region @backendFunc
        this.rawContentForAPPONLYBrowser = this.rawContentForBrowser.replace(new RegExp(Utils__NS__escapeStringForRegEx(TO_REMOVE_TAG), 'g'), '');
        // console.log(`[incremental-build-process processAssetsLinksForApp '${this.buildOptions.baseHref}'`)
        const baseHref = this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(this.buildOptions.clone());
        // console.log(`Fixing with basehref: '${baseHref}'`)
        const howMuchBack = this.relativePath.split('/').length - 1;
        const back = howMuchBack === 0
            ? './'
            : ___NS__times(howMuchBack)
                .map(() => '../')
                .join('');
        const toReplaceFn = (relativeAssetPathPart) => {
            // console.log({ relativeAssetPathPart });
            return [
                {
                    from: `${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                    to: `${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                    makeSureSlashAtBegin: true,
                },
                {
                    from: ` '/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                    to: ` '${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: ` "/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                    to: ` "${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `src="/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                    to: `src="${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `[src]="'/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                    to: `[src]="'${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `href="/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                    to: `href="${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `[href]="'/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                    to: `[href]="'${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `url(/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                    to: `url(${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `url('/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                    to: `url('${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: `url("/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                    to: `url("${baseHref}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                },
                /**
                 *
        
          import * as json1 from '/shared/src/assets/hamsters/test.json';
          console.log({ json1 }) -> WORKS NOW
                 */
                {
                    from: ` from '/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                    to: ` from '${back}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                },
                {
                    from: ` from "/${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
                    to: ` from "${back}${assetsFromSrc}/${assetsFor}/${relativeAssetPathPart}/`,
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
                        this.rawContentForAPPONLYBrowser.replace(new RegExp(Utils__NS__escapeStringForRegEx(`/${from}`), 'g'), `/${to}`);
                    this.rawContentForAPPONLYBrowser =
                        this.rawContentForAPPONLYBrowser.replace(new RegExp(Utils__NS__escapeStringForRegEx(from), 'g'), `/${to}`);
                }
                else {
                    this.rawContentForAPPONLYBrowser =
                        this.rawContentForAPPONLYBrowser.replace(new RegExp(Utils__NS__escapeStringForRegEx(from), 'g'), to);
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
        // Helpers__NS__log(`saving ismoprhic file: ${this.absoluteFilePath}`, 1)
        const isTsFile = ['.ts', '.tsx'].includes(path.extname(this.absFileSourcePathBrowserOrWebsql));
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
            if (!fse.existsSync(path.dirname(absoluteBackendDestFilePath))) {
                fse.mkdirpSync(path.dirname(absoluteBackendDestFilePath));
            }
            const isFrontendFile = !___NS__isUndefined(frontEndOnly.find(f => absoluteBackendDestFilePath.endsWith(f)));
            if (isFrontendFile) {
                // console.log(`Ommiting for backend: ${absoluteBackendDestFilePath} `)
                return;
            }
            const absoluteBackendDestFilePathCurrent = this.isLinuxWatchModeAllowde
                ? UtilsFilesFoldersSync__NS__readFile(absoluteBackendDestFilePath)
                : undefined;
            const absoluteBackendDestFilePathNewContent = isEmptyModuleBackendFile && isTsFile
                ? `export function dummy${new Date().getTime()}() { }`
                : this.changeNpmNameToLocalLibNamePath(this.rawContentBackend, absoluteBackendDestFilePath, {
                    isBrowser: false,
                });
            if (absoluteBackendDestFilePathCurrent?.trimEnd() !==
                absoluteBackendDestFilePathNewContent.trimEnd()) {
                // SAVE BACKEND FILE
                fse.writeFileSync(absoluteBackendDestFilePath, absoluteBackendDestFilePathNewContent, 'utf8');
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
        const isLibFile = this.relativePath.startsWith(`${libFromSrc}/`);
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
                ? websqlTypeString
                : browserTypeString
            : libTypeString;
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
            : ___NS__times(howMuchBack)
                .map(() => '../')
                .join('');
        const backLibIndex = howMuchBackIndex === 0
            ? './'
            : ___NS__times(howMuchBackIndex)
                .map(() => '../')
                .join('');
        let toReplace = [];
        if (isBrowser) {
            toReplace = UtilsTypescript__NS__recognizeImportsFromContent(this.rawContentForBrowser).filter(f => {
                const fPkgBrowser = f.cleanEmbeddedPathToFile
                    .replace(new RegExp(Utils__NS__escapeStringForRegEx(`/${browserFromImport + prodSuffix}`) +
                    '$'), '')
                    .replace(new RegExp(Utils__NS__escapeStringForRegEx(`/${websqlFromImport + prodSuffix}`) +
                    '$'), '')
                    .replace(new RegExp(Utils__NS__escapeStringForRegEx(`/${browserFromImport}`) + '$'), '')
                    .replace(new RegExp(Utils__NS__escapeStringForRegEx(`/${websqlFromImport}`) + '$'), '');
                // this.debug && console.log({ fPkgBrowser });
                return projectOwnSmartPackages.includes(fPkgBrowser);
            });
        }
        else {
            toReplace = UtilsTypescript__NS__recognizeImportsFromContent(this.rawContentBackend).filter(f => {
                const fpkgBackend = f.cleanEmbeddedPathToFile
                    .replace(new RegExp(Utils__NS__escapeStringForRegEx(`/${libFromImport + prodSuffix}`) +
                    '$'), '')
                    .replace(new RegExp(Utils__NS__escapeStringForRegEx(`/${libFromImport}`) + '$'), '');
                // this.debug && console.log({ fpkgBackend });
                return projectOwnSmartPackages.includes(fpkgBackend);
            });
        }
        for (const imp of toReplace) {
            //#region handle stuff from /src/lib
            const cleanName = getCleanImport(imp.cleanEmbeddedPathToFile);
            // this.debug && console.log({ cleanName });
            if (isLibFile) {
                const indexInIfile = (this.rawOrginalContent || '')
                    .split('\n')
                    .findIndex(line => {
                    return line.includes(`${cleanName}/${srcFromTaonImport}`);
                });
                const key = `${cleanName}:${indexInIfile}:${this.relativePath}`;
                if (!this.initialWarnings[key]) {
                    // console.log(
                    //   `isBrowser: ${!!isBrowser}, libForApp: ${!!libForApp},ab ${absFilePath}, rel: ${this.relativePath}`,
                    // );
                    Helpers__NS__warn(`(illegal import ${chalk.bold(`${cleanName}/${srcFromTaonImport}`)})` +
                        ` Use relative path: ./${crossPlatformPath([srcMainProject, this.relativePath])}:${indexInIfile + 1}`);
                    this.initialWarnings[key] = true;
                }
            }
            imp.embeddedPathToFileResult = imp.wrapInParenthesis(`${isLibFile ? backLibIndex : backAppLibIndex}${indexTsFromLibFromSrc.replace('.tsx', '').replace('.ts', '')}`);
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
        const isAsset = this.relativePath.startsWith(`${assetsFromTempSrc}/`);
        // isAsset && console.log('isAsset', absDestinationPath);
        return isAsset
            ? absDestinationPath.replace(`/${assetsFromTempSrc}/`, `/${assetsFromNgProj}/${assetsFor}/${this.nameForNpmPackage}/${assetsFromNpmPackage}/`)
            : absDestinationPath;
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/build-isomorphic-lib/code-cut/browser-code-cut.js.map