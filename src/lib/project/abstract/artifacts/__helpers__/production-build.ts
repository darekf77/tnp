//#region imports
import { UtilsFilesFoldersSync, UtilsJson, _ } from 'tnp-core/src';
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';

import { getCleanImport } from '../../../../app-utils';
import {
  browserFromCompiledDist,
  browserNpmPackage,
  distMainProject,
  indexTsFromLibFromSrc,
  libFromCompiledDist,
  libFromNpmPackage,
  libFromSrc,
  prodSuffix,
  reExportJson,
  splitNamespacesJson,
  tmpSourceDist,
  tmpSrcDist,
  tmpSrcDistWebsql,
  websqlFromCompiledDist,
  websqlNpmPackage,
} from '../../../../constants';
import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';
//#endregion

export class ProductionBuild {
  //#region fields
  public namespacesForPackagesLib: Map<
    string,
    UtilsTypescript.SplitNamespaceResult
  >;

  public namespacesForPackagesBrowser: Map<
    string,
    UtilsTypescript.SplitNamespaceResult
  >;

  public namespacesForPackagesWebsql: Map<
    string,
    UtilsTypescript.SplitNamespaceResult
  >;

  public reExportsForPackagesLib: Map<
    string,
    UtilsTypescript.GatheredExportsMap
  >;

  public reExportsForPackagesBrowser: Map<
    string,
    UtilsTypescript.GatheredExportsMap
  >;

  public reExportsForPackagesWebsql: Map<
    string,
    UtilsTypescript.GatheredExportsMap
  >;

  private readonly nameForNpmPackage: string;
  //#endregion

  constructor(
    private buildOptions: EnvOptions,
    private project: Project,
  ) {
    //#region @backend
    this.project = project;
    this.buildOptions = buildOptions;
    this.nameForNpmPackage = project.nameForNpmPackage;

    if (!this.buildOptions.build.watch && this.buildOptions.build.prod) {
      //#region preparation process (namespaces, re-exports)
      this.namespacesForPackagesLib = new Map();
      this.namespacesForPackagesBrowser = new Map();
      this.namespacesForPackagesWebsql = new Map();

      this.reExportsForPackagesLib = new Map();
      this.reExportsForPackagesBrowser = new Map();
      this.reExportsForPackagesWebsql = new Map();

      //#region gather namespaces and re-exports data from isomorphic packages
      // I am doing this twice for each build
      this.project.packagesRecognition.allIsomorphicPackagesFromMemory.forEach(
        pkgName => {
          const namespacesLib = UtilsJson.readJson(
            this.project.nodeModules.pathFor([
              pkgName,
              libFromNpmPackage + prodSuffix + `.${splitNamespacesJson}`,
            ]),
            {},
          );
          this.namespacesForPackagesLib.set(pkgName, namespacesLib);

          const reExportsLib = UtilsJson.readJson(
            this.project.nodeModules.pathFor([
              pkgName,
              libFromNpmPackage + prodSuffix + `.${reExportJson}`,
            ]),
            {},
          );
          this.reExportsForPackagesLib.set(pkgName, reExportsLib);

          const namespacesBrowser = UtilsJson.readJson(
            this.project.nodeModules.pathFor([
              pkgName,
              browserNpmPackage + prodSuffix + `.${splitNamespacesJson}`,
            ]),
            {},
          );
          this.namespacesForPackagesBrowser.set(pkgName, namespacesBrowser);

          const reExportsBrowser = UtilsJson.readJson(
            this.project.nodeModules.pathFor([
              pkgName,
              browserNpmPackage + prodSuffix + `.${reExportJson}`,
            ]),
            {},
          );
          this.reExportsForPackagesBrowser.set(pkgName, reExportsBrowser);

          const namespacesWebsql = UtilsJson.readJson(
            this.project.nodeModules.pathFor([
              pkgName,
              websqlNpmPackage + prodSuffix + `.${splitNamespacesJson}`,
            ]),
            {},
          );
          this.namespacesForPackagesWebsql.set(pkgName, namespacesWebsql);

          const reExportsWebsql = UtilsJson.readJson(
            this.project.nodeModules.pathFor([
              pkgName,
              websqlNpmPackage + prodSuffix + `.${reExportJson}`,
            ]),
            {},
          );
          this.reExportsForPackagesWebsql.set(pkgName, reExportsWebsql);
        },
      );
      //#endregion

      //#region set/update re-exports fro current pacakge
      this.setGeneratedReExportsToMapForCurrentPackage(
        this.reExportsForPackagesLib,
        libFromCompiledDist,
      );
      this.setGeneratedReExportsToMapForCurrentPackage(
        this.reExportsForPackagesBrowser,
        browserFromCompiledDist,
      );
      this.setGeneratedReExportsToMapForCurrentPackage(
        this.reExportsForPackagesWebsql,
        websqlFromCompiledDist,
      );
      //#endregion

      //#region generate re-exports files in normal build
      Helpers.taskStarted(`Generating re-exports files...`);
      this.saveGenerateReExportsIndProdDistForCurrentPackage(
        this.project.pathFor([
          tmpSourceDist,
          libFromSrc,
          indexTsFromLibFromSrc,
        ]),
        this.namespacesForPackagesLib,
        libFromCompiledDist,
      );

      this.saveGenerateReExportsIndProdDistForCurrentPackage(
        this.project.pathFor([tmpSrcDist, libFromSrc, indexTsFromLibFromSrc]),
        this.namespacesForPackagesBrowser,
        browserFromCompiledDist,
      );

      this.saveGenerateReExportsIndProdDistForCurrentPackage(
        this.project.pathFor([
          tmpSrcDistWebsql,
          libFromSrc,
          indexTsFromLibFromSrc,
        ]),
        this.namespacesForPackagesWebsql,
        websqlFromCompiledDist,
      );
      Helpers.taskDone(`Done generating re-exports files.`);
      //#endregion

      //#region detect files
      const filesBrowser = UtilsFilesFoldersSync.getFilesFrom(
        this.project.pathFor(tmpSrcDist + prodSuffix),
        {
          recursive: true,
          followSymlinks: false,
        },
      );

      const filesWebsql = UtilsFilesFoldersSync.getFilesFrom(
        this.project.pathFor(tmpSrcDistWebsql + prodSuffix),
        {
          recursive: true,
          followSymlinks: false,
        },
      );

      const filesLib = UtilsFilesFoldersSync.getFilesFrom(
        this.project.pathFor(tmpSourceDist + prodSuffix),
        {
          recursive: true,
          followSymlinks: false,
        },
      );
      //#endregion

      //#region merge all namespaces metadata
      this.setGeneratedNamespacesDataForCurrentPackage(tmpSourceDist, filesLib);

      this.setGeneratedNamespacesDataForCurrentPackage(
        tmpSrcDist,
        filesBrowser,
      );

      this.setGeneratedNamespacesDataForCurrentPackage(
        tmpSrcDistWebsql,
        filesWebsql,
      );

      this.combineNamespacesForCurrentPackage(
        filesLib,
        this.namespacesForPackagesLib,
        libFromCompiledDist,
      );
      this.combineNamespacesForCurrentPackage(
        filesBrowser,
        this.namespacesForPackagesBrowser,
        browserFromCompiledDist,
      );
      this.combineNamespacesForCurrentPackage(
        filesWebsql,
        this.namespacesForPackagesWebsql,
        websqlFromCompiledDist,
      );
      //#endregion

      //#endregion

      //#region process production code
      this.productionCodeReplacement(
        filesLib,
        this.namespacesForPackagesLib,
        this.reExportsForPackagesLib,
      );
      this.productionCodeReplacement(
        filesBrowser,
        this.namespacesForPackagesBrowser,
        this.reExportsForPackagesBrowser,
      );
      this.productionCodeReplacement(
        filesWebsql,
        this.namespacesForPackagesWebsql,
        this.reExportsForPackagesWebsql,
      );
      //#endregion
    }
    //#endregion
  }

  //#region methods / set generated re export to map
  private setGeneratedReExportsToMapForCurrentPackage(
    reExportForPackages: Map<string, UtilsTypescript.GatheredExportsMap>,
    folderInDist:
      | typeof libFromCompiledDist
      | typeof browserFromCompiledDist
      | typeof websqlFromCompiledDist,
  ): void {
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
  private saveGenerateReExportsIndProdDistForCurrentPackage(
    indexFileInLibAbsPath: string,
    namespacesForPackages: Map<string, UtilsTypescript.SplitNamespaceResult>,
    folderInDist:
      | typeof libFromCompiledDist
      | typeof browserFromCompiledDist
      | typeof websqlFromCompiledDist,
  ): void {
    //#region @backendFunc

    const data = UtilsTypescript.gatherExportsMapFromIndex(
      indexFileInLibAbsPath,
      namespacesForPackages,
    );

    Helpers.writeJson(
      this.project.pathFor([
        distMainProject + prodSuffix,
        folderInDist + prodSuffix + `.${reExportJson}`,
      ]),
      data,
    );

    //#endregion
  }
  //#endregion

  //#region methods / set genearted namespaces data for current pacakges
  private setGeneratedNamespacesDataForCurrentPackage(
    folder: typeof tmpSrcDist | typeof tmpSrcDistWebsql | typeof tmpSourceDist,
    files: string[],
  ): void {
    //#region @backendFunc
    files = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

    for (const fileAbsPath of files) {
      let content = UtilsFilesFoldersSync.readFile(fileAbsPath);

      // const debug = BrowserCodeCut.debugFile.some(d => fileAbsPath.endsWith(d));
      // if (debug) {
      //   debugger;
      // }

      // Helpers.writeFile(fileAbsPath.replace('.ts', `.org`), content);

      const data = UtilsTypescript.splitNamespaceForContent(content);
      content = data.content;

      // const isLib = folder === tmpSourceDist;
      // if (isLib) {
      //   content = UtilsTypescript.stripTsTypesIntoJsFromContent(
      //     content,
      //     fileAbsPath,
      //   );
      // }

      Helpers.writeJson(
        fileAbsPath
          .replace('.tsx', `.${splitNamespacesJson}`)
          .replace('.ts', `.${splitNamespacesJson}`),
        {
          namespacesMapObj: data.namespacesMapObj || {},
          namespacesReplace: data.namespacesReplace || {},
          // namespacesMapObj: isLib
          //   ? data.namespacesMapObjJS
          //   : data.namespacesMapObj,
          // namespacesReplace: isLib
          //   ? data.namespacesReplaceJS
          //   : data.namespacesReplace,
        } as typeof data,
      );
      UtilsFilesFoldersSync.writeFile(fileAbsPath, content);
    }
    //#endregion
  }
  //#endregion

  //#region methods / combine namespaces for current package
  private combineNamespacesForCurrentPackage(
    files: string[],
    namespacesForPackages: Map<string, UtilsTypescript.SplitNamespaceResult>,
    folderInDist:
      | typeof libFromCompiledDist
      | typeof browserFromCompiledDist
      | typeof websqlFromCompiledDist,
  ): void {
    //#region @backendFunc
    const data = files
      .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
      .reduce((a, b) => {
        const jsonMap: UtilsTypescript.SplitNamespaceResult =
          UtilsJson.readJson(
            b
              .replace('.tsx', `.${splitNamespacesJson}`)
              .replace('.ts', `.${splitNamespacesJson}`),
          ) || {};
        return _.merge(a, jsonMap);
      }, {} as UtilsTypescript.SplitNamespaceResult);

    Helpers.writeJson(
      this.project.pathFor([
        distMainProject + prodSuffix,
        folderInDist + prodSuffix + `.${splitNamespacesJson}`,
      ]),
      data,
    );
    namespacesForPackages.set(this.nameForNpmPackage, data);
    //#endregion
  }
  //#endregion

  //#region methods / production code replacement
  private productionCodeReplacement(
    files: string[],
    namespacesForPackages: Map<string, UtilsTypescript.SplitNamespaceResult>,
    reExports: Map<string, UtilsTypescript.GatheredExportsMap>,
  ): void {
    //#region @backendFunc
    files
      .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
      .forEach(f => {
        // Helpers.logInfo(`Processing browser prod file: ${f}`);

        // const debug = BrowserCodeCut.debugFile.some(d => f.endsWith(d));
        // if (debug) {
        //   debugger;
        // }

        let content = Helpers.readFile(f);
        namespacesForPackages = new Map(
          [...namespacesForPackages].map(([k, v]) => [
            _.cloneDeep(k),
            _.cloneDeep(v),
          ]),
        );

        UtilsTypescript.updateSplitNamespaceReExports(
          namespacesForPackages,
          reExports,
        );

        const importsExportInFile = UtilsTypescript.recognizeImportsFromFile(f)
          .filter(c => !c.cleanEmbeddedPathToFile.startsWith('.'))
          .map(c => getCleanImport(c.cleanEmbeddedPathToFile))
          .filter(f => !!f);

        const renamedImportsOrExports =
          UtilsTypescript.extractRenamedImportsOrExport(content).map(c => {
            c.packageName = getCleanImport(c.packageName);
            return c;
          });

        if (renamedImportsOrExports.length > 0) {
          namespacesForPackages.forEach((namespaceData, libName) => {
            for (const renamed of renamedImportsOrExports) {
              if (
                renamed.packageName === libName ||
                (libName === this.nameForNpmPackage && !renamed.packageName)
              ) {
                namespacesForPackages.set(
                  libName,
                  UtilsTypescript.updateSplitNamespaceResultMapReplaceObj(
                    namespaceData,
                    renamedImportsOrExports,
                  ),
                );
              }
            }
          });
        }

        namespacesForPackages.forEach((namespaceData, libName) => {
          if (
            libName !== this.nameForNpmPackage &&
            !importsExportInFile.includes(libName)
          ) {
            return;
          }

          content = UtilsTypescript.replaceNamespaceWithLongNames(
            content,
            namespaceData.namespacesMapObj,
          );
        });

        namespacesForPackages.forEach((namespaceData, libName) => {
          if (
            libName !== this.nameForNpmPackage &&
            !importsExportInFile.includes(libName)
          ) {
            return;
          }
          content =
            UtilsTypescript.replaceImportNamespaceWithWithExplodedNamespace(
              content,
              namespaceData.namespacesReplace,
              renamedImportsOrExports,
              libName,
              libName === this.nameForNpmPackage,
            );
        });
        Helpers.writeFile(f, content);
      });
    //#endregion
  }
  //#endregion
}
