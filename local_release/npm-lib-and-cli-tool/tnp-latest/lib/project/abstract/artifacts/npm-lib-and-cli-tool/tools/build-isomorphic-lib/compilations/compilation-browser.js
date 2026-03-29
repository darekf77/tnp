"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserCompilation = void 0;
//#region imports
const lib_1 = require("incremental-compiler/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const lib_5 = require("tnp-helpers/lib");
const constants_1 = require("../../../../../../../constants");
const code_cut_1 = require("../code-cut/code-cut");
const cut_fn_1 = require("../code-cut/cut-fn");
//#endregion
class BrowserCompilation extends lib_1.BaseClientCompiler {
    project;
    srcFolder;
    buildOptions;
    //#region fields & getters
    compilerName = 'Browser standard compiler';
    codecutNORMAL;
    codecutWEBSQL;
    get customCompilerName() {
        //#region @backendFunc
        return `Browser compilation`;
        //#endregion
    }
    //#endregion
    //#region constructor
    absPathTmpSrcDistFolderWEBSQL;
    absPathTmpSrcDistFolderNORMAL;
    //#region @backend
    constructor(project, 
    /**
     * tmpSrcDist(Websql)
     */
    srcFolder, buildOptions) {
        super({
            folderPath: (0, lib_4.crossPlatformPath)([project.location, srcFolder]),
            notifyOnFileUnlink: true,
            followSymlinks: true,
            taskName: 'BrowserCompilation',
        });
        this.project = project;
        this.srcFolder = srcFolder;
        this.buildOptions = buildOptions;
        this.project = project;
        this.compilerName = this.customCompilerName;
        this.absPathTmpSrcDistFolderWEBSQL = (0, lib_4.crossPlatformPath)(lib_4.path.join(this.project.location || '', constants_1.tmpSrcDistWebsql + (buildOptions.build.prod ? constants_1.prodSuffix : '')));
        this.absPathTmpSrcDistFolderNORMAL = (0, lib_4.crossPlatformPath)(lib_4.path.join(this.project.location || '', constants_1.tmpSrcDist + (buildOptions.build.prod ? constants_1.prodSuffix : '')));
    }
    //#endregion
    //#endregion
    //#region methods
    //#region methods / sync action
    async syncAction(absFilesFromSrc) {
        //#region @backendFunc
        const isProd = this.buildOptions.build.prod;
        //#region tags to cut
        const tagsNormal = [
            [lib_3.TAGS.BACKEND_FUNC, `return (void 0);`],
            lib_3.TAGS.BACKEND,
            lib_3.TAGS.WEBSQL_ONLY,
            [lib_3.TAGS.WEBSQL_FUNC, `return (void 0);`],
            lib_3.TAGS.WEBSQL,
            [lib_3.TAGS.CUT_CODE_IF_TRUE, (0, cut_fn_1.codeCuttFn)(true)],
            [lib_3.TAGS.CUT_CODE_IF_FALSE, (0, cut_fn_1.codeCuttFn)(false)],
        ].filter(f => !!f);
        const tagsWebsql = [
            [lib_3.TAGS.BACKEND_FUNC, `return (void 0);`],
            lib_3.TAGS.BACKEND,
            [lib_3.TAGS.CUT_CODE_IF_TRUE, (0, cut_fn_1.codeCuttFn)(true)],
            [lib_3.TAGS.CUT_CODE_IF_FALSE, (0, cut_fn_1.codeCuttFn)(false)],
        ].filter(f => !!f);
        //#endregion
        //#region build options for codecut
        const buildOptForNormal = this.buildOptions.clone({
            build: {
                websql: false,
            },
        });
        const buildOptForWebsql = this.buildOptions.clone({
            build: {
                websql: true,
            },
        });
        //#endregion
        //#region codecuts init
        this.codecutNORMAL = new code_cut_1.CodeCut(this.absPathTmpSrcDistFolderNORMAL, {
            replacements: tagsNormal,
            env: buildOptForNormal,
        }, this.project, buildOptForNormal);
        this.codecutWEBSQL = new code_cut_1.CodeCut(this.absPathTmpSrcDistFolderWEBSQL, {
            replacements: tagsWebsql,
            env: buildOptForWebsql,
        }, this.project, buildOptForWebsql);
        //#endregion
        //#region prepare tmp folders
        const tmpSource = this.project.pathFor(constants_1.tmpSourceDist + isProd ? constants_1.prodSuffix : '');
        lib_5.Helpers.removeFolderIfExists(this.absPathTmpSrcDistFolderWEBSQL);
        lib_5.Helpers.removeFolderIfExists(this.absPathTmpSrcDistFolderNORMAL);
        lib_5.Helpers.mkdirp(this.absPathTmpSrcDistFolderNORMAL);
        lib_5.Helpers.mkdirp(this.absPathTmpSrcDistFolderWEBSQL);
        lib_5.Helpers.mkdirp(tmpSource);
        lib_5.Helpers.removeFolderIfExists(tmpSource);
        //#endregion
        // TODO @LAST fix everywhere _PROD
        this.project.quickFixes.recreateTempSourceNecessaryFilesForTesting(this.buildOptions);
        const filesBase = this.project.pathFor(this.srcFolder);
        const relativePathesToProcess = absFilesFromSrc.map(absFilePath => {
            const relativePath = absFilePath.replace(`${filesBase}/`, '');
            const isScssOrSass = lib_2.extForSassLikeFiles.includes(lib_4.path.extname(lib_4.path.basename(relativePath)));
            if (isScssOrSass) {
                const destScss = this.sassDestFor(relativePath);
                lib_5.HelpersTaon.copyFile(absFilePath, destScss);
            }
            return relativePath;
        });
        this.codecutNORMAL.files(relativePathesToProcess);
        this.codecutWEBSQL.files(relativePathesToProcess);
        // process.exit(0)
        //#endregion
    }
    //#endregion
    sassDestFor(relativePath) {
        //#region @backendFunc
        const destScss = this.project.pathFor(`${constants_1.distMainProject}/${lib_4.path
            .extname(lib_4.path.basename(relativePath))
            .replace('.', '')}/${relativePath}`);
        return destScss;
        //#endregion
    }
    //#region methods / async action
    async asyncAction(event) {
        // console.log(`${event.eventName?.toUpperCase()}: ${event.fileAbsolutePath}`)
        if (!this.codecutWEBSQL || !this.codecutNORMAL) {
            // TODO QUICK - but I thin it make sense => there is not backedn compilation for websql
            return;
        }
        this.asyncActionFor(event, false);
        this.asyncActionFor(event, true);
        // PROD NOT ALLOWED IN WATCH MODE
    }
    async asyncActionFor(event, websql) {
        //#region @backendFunc
        // console.log('ASYNC ACTION CODE CUT ', event.fileAbsolutePath);
        const absoluteFilePath = (0, lib_4.crossPlatformPath)(event.fileAbsolutePath);
        const relativeFilePath = (0, lib_4.crossPlatformPath)(absoluteFilePath.replace(`${(0, lib_4.crossPlatformPath)(lib_4.path.join(this.project.location, this.srcFolder))}/`, ''));
        if (lib_4.path.basename(relativeFilePath) === constants_1.DS_Store) {
            return;
        }
        //#region handle backend & scss files
        if (!websql) {
            //#region backend file
            (() => {
                const destinationFileBackendPath = (0, lib_4.crossPlatformPath)([
                    this.project.location,
                    constants_1.tmpSourceDist, // prod not need for async
                    relativeFilePath,
                ]);
                if (event.eventName === 'unlinkDir') {
                    lib_5.Helpers.removeFolderIfExists(destinationFileBackendPath);
                }
                else {
                    if (event.eventName === 'unlink') {
                        if (relativeFilePath.startsWith(`${constants_1.assetsFromTempSrc}/`)) {
                            // nothing
                        }
                        else {
                            try {
                                lib_5.Helpers.removeFileIfExists(destinationFileBackendPath);
                            }
                            catch (error) {
                                lib_5.Helpers.warn(`Error during removing file ${destinationFileBackendPath}`);
                            }
                        }
                    }
                    else {
                        if (lib_4.fse.existsSync(absoluteFilePath)) {
                            //#region mkdirp basedir
                            if (!lib_4.fse.existsSync(lib_4.path.dirname(destinationFileBackendPath))) {
                                lib_4.fse.mkdirpSync(lib_4.path.dirname(destinationFileBackendPath));
                            }
                            //#endregion
                            //#region remove deist if directory
                            if (lib_4.fse.existsSync(destinationFileBackendPath) &&
                                lib_4.fse.lstatSync(destinationFileBackendPath).isDirectory()) {
                                lib_4.fse.removeSync(destinationFileBackendPath);
                            }
                            //#endregion
                        }
                    }
                }
            })();
            //#endregion
            //#region scss file
            (() => {
                const isScssOrSass = lib_2.extForSassLikeFiles.includes(lib_4.path.extname(lib_4.path.basename(relativeFilePath)));
                if (!isScssOrSass) {
                    return;
                }
                const destinationFileScssPath = this.sassDestFor(relativeFilePath);
                if (event.eventName === 'unlinkDir') {
                    try {
                        lib_5.Helpers.removeFolderIfExists(destinationFileScssPath);
                    }
                    catch (error) {
                        lib_5.Helpers.warn(`Error during removing folder ${destinationFileScssPath}`);
                    }
                }
                else {
                    if (event.eventName === 'unlink') {
                        if (relativeFilePath.startsWith(`${constants_1.assetsFromTempSrc}/`)) {
                            // nothing
                        }
                        else {
                            try {
                                lib_5.Helpers.removeFileIfExists(destinationFileScssPath);
                            }
                            catch (error) {
                                lib_5.Helpers.warn(`Error during removing file ${destinationFileScssPath}`);
                            }
                        }
                    }
                    else {
                        if (lib_4.fse.existsSync(absoluteFilePath)) {
                            //#region mkdirp basedir
                            if (!lib_4.fse.existsSync(lib_4.path.dirname(destinationFileScssPath))) {
                                lib_4.fse.mkdirpSync(lib_4.path.dirname(destinationFileScssPath));
                            }
                            //#endregion
                            //#region remove deist if directory
                            if (lib_4.fse.existsSync(destinationFileScssPath) &&
                                lib_4.fse.lstatSync(destinationFileScssPath).isDirectory()) {
                                lib_4.fse.removeSync(destinationFileScssPath);
                            }
                            //#endregion
                            lib_5.HelpersTaon.copyFile(absoluteFilePath, destinationFileScssPath);
                        }
                    }
                }
            })();
            //#endregion
        }
        //#endregion
        //#region browser file
        (() => {
            const destinationFilePath = (0, lib_4.crossPlatformPath)(lib_4.path.join(this.project.location, websql ? constants_1.tmpSrcDistWebsql : constants_1.tmpSrcDist, // prod not need for async
            relativeFilePath));
            if (event.eventName === 'unlinkDir') {
                lib_5.Helpers.removeFolderIfExists(destinationFilePath);
            }
            else {
                if (event.eventName === 'unlink') {
                    if (relativeFilePath.startsWith(`${constants_1.assetsFromTempSrc}/`)) {
                        websql
                            ? this.codecutWEBSQL.files([relativeFilePath], true)
                            : this.codecutNORMAL.files([relativeFilePath], true);
                    }
                    else {
                        try {
                            lib_5.Helpers.removeFileIfExists(destinationFilePath);
                        }
                        catch (error) {
                            lib_5.Helpers.warn(`Error during removing file ${destinationFilePath}`);
                        }
                    }
                }
                else {
                    if (lib_4.fse.existsSync(absoluteFilePath)) {
                        //#region mkdirp basedir
                        if (!lib_4.fse.existsSync(lib_4.path.dirname(destinationFilePath))) {
                            lib_4.fse.mkdirpSync(lib_4.path.dirname(destinationFilePath));
                        }
                        //#endregion
                        //#region remove deist if directory
                        if (lib_4.fse.existsSync(destinationFilePath) &&
                            lib_4.fse.lstatSync(destinationFilePath).isDirectory()) {
                            lib_4.fse.removeSync(destinationFilePath);
                        }
                        //#endregion
                        if (websql) {
                            this.codecutWEBSQL.files([relativeFilePath]);
                        }
                        else {
                            this.codecutNORMAL.files([relativeFilePath]);
                        }
                    }
                }
            }
        })();
        //#endregion
        //#endregion
    }
}
exports.BrowserCompilation = BrowserCompilation;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/build-isomorphic-lib/compilations/compilation-browser.js.map