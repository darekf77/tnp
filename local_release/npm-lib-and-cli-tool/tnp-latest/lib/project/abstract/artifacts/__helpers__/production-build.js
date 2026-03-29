"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionBuild = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const app_utils_1 = require("../../../../app-utils");
const constants_1 = require("../../../../constants");
//#endregion
class ProductionBuild {
    project;
    //#region fields
    namespacesForPackagesLib;
    namespacesForPackagesBrowser;
    namespacesForPackagesWebsql;
    reExportsForPackagesLib;
    reExportsForPackagesBrowser;
    reExportsForPackagesWebsql;
    nameForNpmPackage;
    //#endregion
    constructor(project) {
        this.project = project;
        this.project = project;
        this.nameForNpmPackage = project.nameForNpmPackage;
    }
    //#region methods / run task
    /**
     *
     * @param generatingAppCode mode for building app code (that contains lib code as well)
     */
    runTask(buildOptions, generatingAppCode = false) {
        //#region @backendFunc
        if (!buildOptions.build.prod) {
            return;
        }
        //#region preparation process (namespaces, re-exports)
        this.namespacesForPackagesLib = new Map();
        this.namespacesForPackagesBrowser = new Map();
        this.namespacesForPackagesWebsql = new Map();
        this.reExportsForPackagesLib = new Map();
        this.reExportsForPackagesBrowser = new Map();
        this.reExportsForPackagesWebsql = new Map();
        //#region gather namespaces and re-exports data from isomorphic packages
        // I am doing this twice for each build
        this.project.packagesRecognition.allIsomorphicPackagesFromMemory.forEach(pkgName => {
            const namespacesLib = lib_1.UtilsJson.readJson(this.project.nodeModules.pathFor([
                pkgName,
                constants_1.libFromNpmPackage + constants_1.prodSuffix + `.${constants_1.splitNamespacesJson}`,
            ]), {});
            this.namespacesForPackagesLib.set(pkgName, namespacesLib);
            const reExportsLib = lib_1.UtilsJson.readJson(this.project.nodeModules.pathFor([
                pkgName,
                constants_1.libFromNpmPackage + constants_1.prodSuffix + `.${constants_1.reExportJson}`,
            ]), {});
            this.reExportsForPackagesLib.set(pkgName, reExportsLib);
            const namespacesBrowser = lib_1.UtilsJson.readJson(this.project.nodeModules.pathFor([
                pkgName,
                constants_1.browserNpmPackage + constants_1.prodSuffix + `.${constants_1.splitNamespacesJson}`,
            ]), {});
            this.namespacesForPackagesBrowser.set(pkgName, namespacesBrowser);
            const reExportsBrowser = lib_1.UtilsJson.readJson(this.project.nodeModules.pathFor([
                pkgName,
                constants_1.browserNpmPackage + constants_1.prodSuffix + `.${constants_1.reExportJson}`,
            ]), {});
            this.reExportsForPackagesBrowser.set(pkgName, reExportsBrowser);
            const namespacesWebsql = lib_1.UtilsJson.readJson(this.project.nodeModules.pathFor([
                pkgName,
                constants_1.websqlNpmPackage + constants_1.prodSuffix + `.${constants_1.splitNamespacesJson}`,
            ]), {});
            this.namespacesForPackagesWebsql.set(pkgName, namespacesWebsql);
            const reExportsWebsql = lib_1.UtilsJson.readJson(this.project.nodeModules.pathFor([
                pkgName,
                constants_1.websqlNpmPackage + constants_1.prodSuffix + `.${constants_1.reExportJson}`,
            ]), {});
            this.reExportsForPackagesWebsql.set(pkgName, reExportsWebsql);
        });
        //#endregion
        //#region set/update re-exports fro current pacakge
        if (!generatingAppCode) {
            this.setGeneratedReExportsToMapForCurrentPackage(this.reExportsForPackagesLib, constants_1.libFromCompiledDist);
            this.setGeneratedReExportsToMapForCurrentPackage(this.reExportsForPackagesBrowser, constants_1.browserFromCompiledDist);
            this.setGeneratedReExportsToMapForCurrentPackage(this.reExportsForPackagesWebsql, constants_1.websqlFromCompiledDist);
        }
        //#endregion
        //#region generate re-exports files in normal build
        if (!generatingAppCode) {
            lib_2.Helpers.taskStarted(`Generating re-exports files...`);
            this.saveGenerateReExportsIndProdDistForCurrentPackage(this.project.pathFor([
                constants_1.tmpSourceDist,
                constants_1.libFromSrc,
                constants_1.indexTsFromLibFromSrc,
            ]), this.namespacesForPackagesLib, constants_1.libFromCompiledDist);
            this.saveGenerateReExportsIndProdDistForCurrentPackage(this.project.pathFor([constants_1.tmpSrcDist, constants_1.libFromSrc, constants_1.indexTsFromLibFromSrc]), this.namespacesForPackagesBrowser, constants_1.browserFromCompiledDist);
            this.saveGenerateReExportsIndProdDistForCurrentPackage(this.project.pathFor([
                constants_1.tmpSrcDistWebsql,
                constants_1.libFromSrc,
                constants_1.indexTsFromLibFromSrc,
            ]), this.namespacesForPackagesWebsql, constants_1.websqlFromCompiledDist);
            lib_2.Helpers.taskDone(`Done generating re-exports files.`);
        }
        //#endregion
        //#region detect files
        const filesBrowser = lib_1.UtilsFilesFoldersSync.getFilesFrom(this.project.pathFor((generatingAppCode ? constants_1.tmpSrcAppDist : constants_1.tmpSrcDist) + constants_1.prodSuffix), {
            recursive: true,
            followSymlinks: false,
        });
        const filesWebsql = lib_1.UtilsFilesFoldersSync.getFilesFrom(this.project.pathFor((generatingAppCode ? constants_1.tmpSrcAppDistWebsql : constants_1.tmpSrcDistWebsql) +
            constants_1.prodSuffix), {
            recursive: true,
            followSymlinks: false,
        });
        const filesLib = generatingAppCode
            ? [] // already done when generatingAppCode === false in npm lib build
            : lib_1.UtilsFilesFoldersSync.getFilesFrom(this.project.pathFor(constants_1.tmpSourceDist + constants_1.prodSuffix), {
                recursive: true,
                followSymlinks: false,
            });
        //#endregion
        //#region merge all namespaces metadata
        this.setGeneratedNamespacesDataForCurrentPackage(
        // tmpSourceDist,
        filesLib);
        this.setGeneratedNamespacesDataForCurrentPackage(
        // generatingAppCode ? tmpSrcAppDist : tmpSrcDist,
        filesBrowser);
        this.setGeneratedNamespacesDataForCurrentPackage(
        // generatingAppCode ? tmpSrcAppDistWebsql : tmpSrcDistWebsql,
        filesWebsql);
        this.combineNamespacesForCurrentPackage(filesLib, this.namespacesForPackagesLib, constants_1.libFromCompiledDist, generatingAppCode);
        this.combineNamespacesForCurrentPackage(filesBrowser, this.namespacesForPackagesBrowser, constants_1.browserFromCompiledDist, generatingAppCode);
        this.combineNamespacesForCurrentPackage(filesWebsql, this.namespacesForPackagesWebsql, constants_1.websqlFromCompiledDist, generatingAppCode);
        //#endregion
        //#endregion
        //#region process production code
        lib_2.Helpers.taskStarted(`Production code replacement started`);
        this.productionCodeReplacement(filesLib, this.namespacesForPackagesLib, this.reExportsForPackagesLib);
        this.productionCodeReplacement(filesBrowser, this.namespacesForPackagesBrowser, this.reExportsForPackagesBrowser);
        this.productionCodeReplacement(filesWebsql, this.namespacesForPackagesWebsql, this.reExportsForPackagesWebsql);
        lib_2.Helpers.taskDone(`Production code replacement done`);
        //#endregion
        //#endregion
    }
    //#endregion
    //#region methods / set generated re export to map
    setGeneratedReExportsToMapForCurrentPackage(reExportForPackages, folderInDist) {
        //#region @backendFunc
        const data = this.project.readJson([
            constants_1.distMainProject + constants_1.prodSuffix,
            folderInDist + constants_1.prodSuffix + `.${constants_1.reExportJson}`,
        ]);
        reExportForPackages.set(this.nameForNpmPackage, data);
        //#endregion
    }
    //#endregion
    //#region methods / generate re export files
    saveGenerateReExportsIndProdDistForCurrentPackage(indexFileInLibAbsPath, namespacesForPackages, folderInDist) {
        //#region @backendFunc
        const data = lib_2.UtilsTypescript.gatherExportsMapFromIndex(indexFileInLibAbsPath, namespacesForPackages);
        lib_2.Helpers.writeJson(this.project.pathFor([
            constants_1.distMainProject + constants_1.prodSuffix,
            folderInDist + constants_1.prodSuffix + `.${constants_1.reExportJson}`,
        ]), data);
        //#endregion
    }
    //#endregion
    //#region methods / set genearted namespaces data for current pacakges
    setGeneratedNamespacesDataForCurrentPackage(
    // folder:
    //   | typeof tmpSrcAppDist
    //   | typeof tmpSrcAppDistWebsql
    //   | typeof tmpSrcDist
    //   | typeof tmpSrcDistWebsql
    //   | typeof tmpSourceDist,
    files) {
        //#region @backendFunc
        files = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
        for (const fileAbsPath of files) {
            let content = lib_1.UtilsFilesFoldersSync.readFile(fileAbsPath);
            // const debug = BrowserCodeCut.debugFile.some(d => fileAbsPath.endsWith(d));
            // if (debug) {
            //   debugger;
            // }
            // Helpers.writeFile(fileAbsPath.replace('.ts', `.org`), content);
            const data = lib_2.UtilsTypescript.splitNamespaceForContent(content);
            content = data.content;
            // const isLib = folder === tmpSourceDist;
            // if (isLib) {
            //   content = UtilsTypescript.stripTsTypesIntoJsFromContent(
            //     content,
            //     fileAbsPath,
            //   );
            // }
            lib_2.Helpers.writeJson(fileAbsPath
                .replace('.tsx', `.${constants_1.splitNamespacesJson}`)
                .replace('.ts', `.${constants_1.splitNamespacesJson}`), {
                namespacesMapObj: data.namespacesMapObj || {},
                namespacesReplace: data.namespacesReplace || {},
                // namespacesMapObj: isLib
                //   ? data.namespacesMapObjJS
                //   : data.namespacesMapObj,
                // namespacesReplace: isLib
                //   ? data.namespacesReplaceJS
                //   : data.namespacesReplace,
            });
            lib_1.UtilsFilesFoldersSync.writeFile(fileAbsPath, content);
        }
        //#endregion
    }
    //#endregion
    //#region methods / combine namespaces for current package
    combineNamespacesForCurrentPackage(files, namespacesForPackages, folderInDist, generatingAppCode) {
        //#region @backendFunc
        const data = files
            .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
            .reduce((a, b) => {
            const jsonMap = lib_1.UtilsJson.readJson(b
                .replace('.tsx', `.${constants_1.splitNamespacesJson}`)
                .replace('.ts', `.${constants_1.splitNamespacesJson}`)) || {};
            return lib_1._.merge(a, jsonMap);
        }, {});
        // no need saving just gather data for app build
        if (!generatingAppCode) {
            lib_2.Helpers.writeJson(this.project.pathFor([
                constants_1.distMainProject + constants_1.prodSuffix,
                folderInDist + constants_1.prodSuffix + `.${constants_1.splitNamespacesJson}`,
            ]), data);
        }
        namespacesForPackages.set(this.nameForNpmPackage, data);
        //#endregion
    }
    //#endregion
    //#region methods / production code replacement
    productionCodeReplacement(files, namespacesForPackages, reExports) {
        //#region @backendFunc
        files
            .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
            .forEach(f => {
            // Helpers.logInfo(`Processing browser prod file: ${f}`);
            // const debug = BrowserCodeCut.debugFile.some(d => f.endsWith(d));
            // if (debug) {
            //   debugger;
            // }
            let content = lib_2.Helpers.readFile(f);
            namespacesForPackages = new Map([...namespacesForPackages].map(([k, v]) => [
                lib_1._.cloneDeep(k),
                lib_1._.cloneDeep(v),
            ]));
            lib_2.UtilsTypescript.updateSplitNamespaceReExports(namespacesForPackages, reExports);
            const importsExportInFile = lib_2.UtilsTypescript.recognizeImportsFromFile(f)
                .filter(c => !c.cleanEmbeddedPathToFile.startsWith('.'))
                .map(c => (0, app_utils_1.getCleanImport)(c.cleanEmbeddedPathToFile))
                .filter(f => !!f);
            const renamedImportsOrExports = lib_2.UtilsTypescript.extractRenamedImportsOrExport(content).map(c => {
                c.packageName = (0, app_utils_1.getCleanImport)(c.packageName);
                return c;
            });
            if (renamedImportsOrExports.length > 0) {
                namespacesForPackages.forEach((namespaceData, libName) => {
                    for (const renamed of renamedImportsOrExports) {
                        if (renamed.packageName === libName ||
                            (libName === this.nameForNpmPackage && !renamed.packageName)) {
                            namespacesForPackages.set(libName, lib_2.UtilsTypescript.updateSplitNamespaceResultMapReplaceObj(namespaceData, renamedImportsOrExports));
                        }
                    }
                });
            }
            namespacesForPackages.forEach((namespaceData, libName) => {
                if (libName !== this.nameForNpmPackage &&
                    !importsExportInFile.includes(libName)) {
                    return;
                }
                content = lib_2.UtilsTypescript.replaceNamespaceWithLongNames(content, namespaceData.namespacesMapObj);
            });
            namespacesForPackages.forEach((namespaceData, libName) => {
                if (libName !== this.nameForNpmPackage &&
                    !importsExportInFile.includes(libName)) {
                    return;
                }
                content =
                    lib_2.UtilsTypescript.replaceImportNamespaceWithWithExplodedNamespace(content, namespaceData.namespacesReplace, renamedImportsOrExports, libName, libName === this.nameForNpmPackage);
            });
            lib_2.Helpers.writeFile(f, content);
        });
        //#endregion
    }
}
exports.ProductionBuild = ProductionBuild;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/__helpers__/production-build.js.map