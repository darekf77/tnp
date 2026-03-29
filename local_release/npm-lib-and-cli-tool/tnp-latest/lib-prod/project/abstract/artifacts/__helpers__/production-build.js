//#region imports
import { ___NS__cloneDeep, ___NS__merge, UtilsFilesFoldersSync__NS__getFilesFrom, UtilsFilesFoldersSync__NS__readFile, UtilsFilesFoldersSync__NS__writeFile, UtilsJson__NS__readJson } from 'tnp-core/lib-prod';
import { Helpers__NS__readFile, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__writeFile, Helpers__NS__writeJson, UtilsTypescript__NS__extractRenamedImportsOrExport, UtilsTypescript__NS__gatherExportsMapFromIndex, UtilsTypescript__NS__recognizeImportsFromFile, UtilsTypescript__NS__replaceImportNamespaceWithWithExplodedNamespace, UtilsTypescript__NS__replaceNamespaceWithLongNames, UtilsTypescript__NS__splitNamespaceForContent, UtilsTypescript__NS__updateSplitNamespaceReExports, UtilsTypescript__NS__updateSplitNamespaceResultMapReplaceObj } from 'tnp-helpers/lib-prod';
import { getCleanImport } from '../../../../app-utils';
import { browserFromCompiledDist, browserNpmPackage, distMainProject, indexTsFromLibFromSrc, libFromCompiledDist, libFromNpmPackage, libFromSrc, prodSuffix, reExportJson, splitNamespacesJson, tmpSourceDist, tmpSrcAppDist, tmpSrcAppDistWebsql, tmpSrcDist, tmpSrcDistWebsql, websqlFromCompiledDist, websqlNpmPackage, } from '../../../../constants';
//#endregion
export class ProductionBuild {
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
            const namespacesLib = UtilsJson__NS__readJson(this.project.nodeModules.pathFor([
                pkgName,
                libFromNpmPackage + prodSuffix + `.${splitNamespacesJson}`,
            ]), {});
            this.namespacesForPackagesLib.set(pkgName, namespacesLib);
            const reExportsLib = UtilsJson__NS__readJson(this.project.nodeModules.pathFor([
                pkgName,
                libFromNpmPackage + prodSuffix + `.${reExportJson}`,
            ]), {});
            this.reExportsForPackagesLib.set(pkgName, reExportsLib);
            const namespacesBrowser = UtilsJson__NS__readJson(this.project.nodeModules.pathFor([
                pkgName,
                browserNpmPackage + prodSuffix + `.${splitNamespacesJson}`,
            ]), {});
            this.namespacesForPackagesBrowser.set(pkgName, namespacesBrowser);
            const reExportsBrowser = UtilsJson__NS__readJson(this.project.nodeModules.pathFor([
                pkgName,
                browserNpmPackage + prodSuffix + `.${reExportJson}`,
            ]), {});
            this.reExportsForPackagesBrowser.set(pkgName, reExportsBrowser);
            const namespacesWebsql = UtilsJson__NS__readJson(this.project.nodeModules.pathFor([
                pkgName,
                websqlNpmPackage + prodSuffix + `.${splitNamespacesJson}`,
            ]), {});
            this.namespacesForPackagesWebsql.set(pkgName, namespacesWebsql);
            const reExportsWebsql = UtilsJson__NS__readJson(this.project.nodeModules.pathFor([
                pkgName,
                websqlNpmPackage + prodSuffix + `.${reExportJson}`,
            ]), {});
            this.reExportsForPackagesWebsql.set(pkgName, reExportsWebsql);
        });
        //#endregion
        //#region set/update re-exports fro current pacakge
        if (!generatingAppCode) {
            this.setGeneratedReExportsToMapForCurrentPackage(this.reExportsForPackagesLib, libFromCompiledDist);
            this.setGeneratedReExportsToMapForCurrentPackage(this.reExportsForPackagesBrowser, browserFromCompiledDist);
            this.setGeneratedReExportsToMapForCurrentPackage(this.reExportsForPackagesWebsql, websqlFromCompiledDist);
        }
        //#endregion
        //#region generate re-exports files in normal build
        if (!generatingAppCode) {
            Helpers__NS__taskStarted(`Generating re-exports files...`);
            this.saveGenerateReExportsIndProdDistForCurrentPackage(this.project.pathFor([
                tmpSourceDist,
                libFromSrc,
                indexTsFromLibFromSrc,
            ]), this.namespacesForPackagesLib, libFromCompiledDist);
            this.saveGenerateReExportsIndProdDistForCurrentPackage(this.project.pathFor([tmpSrcDist, libFromSrc, indexTsFromLibFromSrc]), this.namespacesForPackagesBrowser, browserFromCompiledDist);
            this.saveGenerateReExportsIndProdDistForCurrentPackage(this.project.pathFor([
                tmpSrcDistWebsql,
                libFromSrc,
                indexTsFromLibFromSrc,
            ]), this.namespacesForPackagesWebsql, websqlFromCompiledDist);
            Helpers__NS__taskDone(`Done generating re-exports files.`);
        }
        //#endregion
        //#region detect files
        const filesBrowser = UtilsFilesFoldersSync__NS__getFilesFrom(this.project.pathFor((generatingAppCode ? tmpSrcAppDist : tmpSrcDist) + prodSuffix), {
            recursive: true,
            followSymlinks: false,
        });
        const filesWebsql = UtilsFilesFoldersSync__NS__getFilesFrom(this.project.pathFor((generatingAppCode ? tmpSrcAppDistWebsql : tmpSrcDistWebsql) +
            prodSuffix), {
            recursive: true,
            followSymlinks: false,
        });
        const filesLib = generatingAppCode
            ? [] // already done when generatingAppCode === false in npm lib build
            : UtilsFilesFoldersSync__NS__getFilesFrom(this.project.pathFor(tmpSourceDist + prodSuffix), {
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
        this.combineNamespacesForCurrentPackage(filesLib, this.namespacesForPackagesLib, libFromCompiledDist, generatingAppCode);
        this.combineNamespacesForCurrentPackage(filesBrowser, this.namespacesForPackagesBrowser, browserFromCompiledDist, generatingAppCode);
        this.combineNamespacesForCurrentPackage(filesWebsql, this.namespacesForPackagesWebsql, websqlFromCompiledDist, generatingAppCode);
        //#endregion
        //#endregion
        //#region process production code
        Helpers__NS__taskStarted(`Production code replacement started`);
        this.productionCodeReplacement(filesLib, this.namespacesForPackagesLib, this.reExportsForPackagesLib);
        this.productionCodeReplacement(filesBrowser, this.namespacesForPackagesBrowser, this.reExportsForPackagesBrowser);
        this.productionCodeReplacement(filesWebsql, this.namespacesForPackagesWebsql, this.reExportsForPackagesWebsql);
        Helpers__NS__taskDone(`Production code replacement done`);
        //#endregion
        //#endregion
    }
    //#endregion
    //#region methods / set generated re export to map
    setGeneratedReExportsToMapForCurrentPackage(reExportForPackages, folderInDist) {
        //#region @backendFunc
        const data = this.project.readJson([
            distMainProject + prodSuffix,
            folderInDist + prodSuffix + `.${reExportJson}`,
        ]);
        reExportForPackages.set(this.nameForNpmPackage, data);
        //#endregion
    }
    //#endregion
    //#region methods / generate re export files
    saveGenerateReExportsIndProdDistForCurrentPackage(indexFileInLibAbsPath, namespacesForPackages, folderInDist) {
        //#region @backendFunc
        const data = UtilsTypescript__NS__gatherExportsMapFromIndex(indexFileInLibAbsPath, namespacesForPackages);
        Helpers__NS__writeJson(this.project.pathFor([
            distMainProject + prodSuffix,
            folderInDist + prodSuffix + `.${reExportJson}`,
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
            let content = UtilsFilesFoldersSync__NS__readFile(fileAbsPath);
            // const debug = BrowserCodeCut.debugFile.some(d => fileAbsPath.endsWith(d));
            // if (debug) {
            //   debugger;
            // }
            // Helpers__NS__writeFile(fileAbsPath.replace('.ts', `.org`), content);
            const data = UtilsTypescript__NS__splitNamespaceForContent(content);
            content = data.content;
            // const isLib = folder === tmpSourceDist;
            // if (isLib) {
            //   content = UtilsTypescript__NS__stripTsTypesIntoJsFromContent(
            //     content,
            //     fileAbsPath,
            //   );
            // }
            Helpers__NS__writeJson(fileAbsPath
                .replace('.tsx', `.${splitNamespacesJson}`)
                .replace('.ts', `.${splitNamespacesJson}`), {
                namespacesMapObj: data.namespacesMapObj || {},
                namespacesReplace: data.namespacesReplace || {},
                // namespacesMapObj: isLib
                //   ? data.namespacesMapObjJS
                //   : data.namespacesMapObj,
                // namespacesReplace: isLib
                //   ? data.namespacesReplaceJS
                //   : data.namespacesReplace,
            });
            UtilsFilesFoldersSync__NS__writeFile(fileAbsPath, content);
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
            const jsonMap = UtilsJson__NS__readJson(b
                .replace('.tsx', `.${splitNamespacesJson}`)
                .replace('.ts', `.${splitNamespacesJson}`)) || {};
            return ___NS__merge(a, jsonMap);
        }, {});
        // no need saving just gather data for app build
        if (!generatingAppCode) {
            Helpers__NS__writeJson(this.project.pathFor([
                distMainProject + prodSuffix,
                folderInDist + prodSuffix + `.${splitNamespacesJson}`,
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
            // Helpers__NS__logInfo(`Processing browser prod file: ${f}`);
            // const debug = BrowserCodeCut.debugFile.some(d => f.endsWith(d));
            // if (debug) {
            //   debugger;
            // }
            let content = Helpers__NS__readFile(f);
            namespacesForPackages = new Map([...namespacesForPackages].map(([k, v]) => [
                ___NS__cloneDeep(k),
                ___NS__cloneDeep(v),
            ]));
            UtilsTypescript__NS__updateSplitNamespaceReExports(namespacesForPackages, reExports);
            const importsExportInFile = UtilsTypescript__NS__recognizeImportsFromFile(f)
                .filter(c => !c.cleanEmbeddedPathToFile.startsWith('.'))
                .map(c => getCleanImport(c.cleanEmbeddedPathToFile))
                .filter(f => !!f);
            const renamedImportsOrExports = UtilsTypescript__NS__extractRenamedImportsOrExport(content).map(c => {
                c.packageName = getCleanImport(c.packageName);
                return c;
            });
            if (renamedImportsOrExports.length > 0) {
                namespacesForPackages.forEach((namespaceData, libName) => {
                    for (const renamed of renamedImportsOrExports) {
                        if (renamed.packageName === libName ||
                            (libName === this.nameForNpmPackage && !renamed.packageName)) {
                            namespacesForPackages.set(libName, UtilsTypescript__NS__updateSplitNamespaceResultMapReplaceObj(namespaceData, renamedImportsOrExports));
                        }
                    }
                });
            }
            namespacesForPackages.forEach((namespaceData, libName) => {
                if (libName !== this.nameForNpmPackage &&
                    !importsExportInFile.includes(libName)) {
                    return;
                }
                content = UtilsTypescript__NS__replaceNamespaceWithLongNames(content, namespaceData.namespacesMapObj);
            });
            namespacesForPackages.forEach((namespaceData, libName) => {
                if (libName !== this.nameForNpmPackage &&
                    !importsExportInFile.includes(libName)) {
                    return;
                }
                content =
                    UtilsTypescript__NS__replaceImportNamespaceWithWithExplodedNamespace(content, namespaceData.namespacesReplace, renamedImportsOrExports, libName, libName === this.nameForNpmPackage);
            });
            Helpers__NS__writeFile(f, content);
        });
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/__helpers__/production-build.js.map