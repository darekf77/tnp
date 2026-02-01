//#region imports
import {
  config,
  folderName,
  UtilsFilesFoldersSync,
  UtilsJson,
} from 'tnp-core/src';
import {
  crossPlatformPath,
  fse,
  path,
  _,
  CoreModels,
  chalk,
} from 'tnp-core/src';
import { Helpers, HelpersTaon, UtilsTypescript } from 'tnp-helpers/src';

import { getCleanImport } from '../../../../../../../app-utils';
import {
  appFromSrc,
  browserFromCompiledDist,
  browserMainProject,
  browserNpmPackage,
  distMainProject,
  distNoCutSrcMainProject,
  indexTsFromLibFromSrc,
  libFromCompiledDist,
  libFromNpmPackage,
  libFromSrc,
  libs,
  packageJsonLibDist,
  prodSuffix,
  reExportJson,
  splitNamespacesJson,
  srcMainProject,
  tmpSourceDist,
  tmpSrcDist,
  tmpSrcDistWebsql,
  tsconfigBackendDistJson,
  tsconfigBackendDistJson_PROD,
  websqlFromCompiledDist,
  websqlMainProject,
  websqlNpmPackage,
} from '../../../../../../../constants';
import { Models } from '../../../../../../../models';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
import { BrowserCodeCut } from '../code-cut/browser-code-cut';
//#endregion

export class BackendCompilation {
  //#region static
  static counter = 1;
  //#endregion

  //#region fields & getters
  public isEnableCompilation = true;

  protected compilerName = 'Backend Compiler';

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

  //#region constructor

  //#region @backend
  constructor(
    public buildOptions: EnvOptions,
    /**
     * Source location
     * Ex. src | components
     */
    public srcFolder: string,
    public project: Project,
  ) {
    this.nameForNpmPackage = project.nameForNpmPackage;
  }
  //#endregion

  //#endregion

  /**
   * @deprecated remove
   */
  async start({ taskName }): Promise<void> {
    //#region @backendFunc
    await this.syncAction([] /* not needed anything */);
    //#endregion
  }

  /**
   * @deprecated remove
   */
  async startAndWatch(options?: any): Promise<void> {
    //#region @backendFunc
    await this.start(options);
    //#endregion
  }

  //#region methods / sync action
  async syncAction(filesPathes: string[]) {
    //#region @backendFunc

    const outDistPath = this.project.pathFor(distMainProject);

    // Helpers.System.Operations.tryRemoveDir(outDistPath)
    try {
      fse.unlinkSync(outDistPath);
    } catch (error) {}
    if (!fse.existsSync(outDistPath)) {
      fse.mkdirpSync(outDistPath);
    }

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
    await this.libCompilation(this.buildOptions, {
      generateDeclarations: true,
    });

    //#region copy produciton lib into lib-prod
    if (!this.buildOptions.build.watch && this.buildOptions.build.prod) {
      HelpersTaon.copy(
        this.project.pathFor([
          distMainProject + prodSuffix,
          libFromCompiledDist,
        ]),
        this.project.pathFor([
          distMainProject,
          libFromCompiledDist + prodSuffix,
        ]),
        {
          recursive: true,
          overwrite: true,
        },
      );
    }
    //#endregion

    //#endregion
  }
  //#endregion

  //#region methods / regenerated namespaces for current package

  //#region methods /set generated re export to map
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

      const isLib = folder === tmpSourceDist;
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
          namespacesMapObj: isLib
            ? data.namespacesMapObjJS
            : data.namespacesMapObj,
          namespacesReplace: isLib
            ? data.namespacesReplaceJS
            : data.namespacesReplace,
        },
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

  //#region methods / lib compilation
  async libCompilation(
    buildOptions: EnvOptions,
    {
      generateDeclarations = false,
      tsExe = 'npm-run tsc',
      diagnostics = false,
    }: Models.TscCompileOptions,
  ) {
    //#region @backendFunc
    const watch = buildOptions.build.watch;

    if (!this.isEnableCompilation) {
      Helpers.log(
        `Compilation disabled for ${_.startCase(BackendCompilation.name)}`,
      );
      return;
    }
    const paramasCommon = {
      watch: watch ? ' -w ' : '',
      outDir: ` --outDir ${distMainProject + (buildOptions.build.prod ? prodSuffix : '')} `,
      noEmitOnError: !watch ? ' --noEmitOnError true ' : '',
      extendedDiagnostics: diagnostics ? ' --extendedDiagnostics ' : '',
      preserveWatchOutput: ` --preserveWatchOutput `,
    };

    //#region cmd
    let prepareCmd = (specificTsconfig: string) => {
      let commandJs, commandMaps;
      let nocutsrcFolder = this.project.pathFor(
        distNoCutSrcMainProject + (buildOptions.build.prod ? prodSuffix : ''),
      );

      const paramsJS = {
        mapRoot: ` --mapRoot ${nocutsrcFolder} `,
        project: `--project ${specificTsconfig}`,
        ...paramasCommon,
      };
      const paramsMaps = { ...paramasCommon };
      paramsMaps.outDir = ` --outDir ${nocutsrcFolder}`;
      paramsMaps.noEmitOnError = !watch ? ' --noEmitOnError false ' : '';

      commandJs = `${tsExe} ${Object.values(paramsJS).join(' ')}  `;
      commandMaps = `${tsExe} ${Object.values(paramsMaps).join(' ')} `;
      return {
        commandJs, // use tsconfig.backend.dist<.prod>.json
        commandMaps, // uses main tsconfig.json to from /src directly everything
        // commandDts
      };
    };
    //#endregion

    const tsconfigBackendPath = crossPlatformPath(
      this.project.pathFor(
        buildOptions.build.prod
          ? tsconfigBackendDistJson_PROD
          : tsconfigBackendDistJson,
      ),
    );

    await this.buildStandardLibVer(buildOptions, {
      ...prepareCmd(tsconfigBackendPath),
      generateDeclarations,
    });

    //#endregion
  }

  //#endregion

  //#region methods / build standard lib version
  protected async buildStandardLibVer(
    buildOptions: EnvOptions,
    options: {
      commandJs: string;
      commandMaps: string;
      generateDeclarations: boolean;
    },
  ): Promise<void> {
    //#region @backendFunc

    let { commandJs, commandMaps } = options;

    Helpers.getIsVerboseMode() &&
      console.log({
        commandJs,
        commandMaps,
      });

    Helpers.info(`

Starting (${
      buildOptions.build.watch ? 'watch' : 'normal'
    }) backend TypeScript build....

    `);
    const additionalReplace = (line: string) => {
      // nothing to replace for now
      return line;
    };

    await this.project.nodeModules.makeSureInstalled();
    const cwd = this.project.location;
    await Helpers.execute(commandJs, cwd, {
      similarProcessKey: 'tsc',
      exitOnErrorCallback: async code => {
        //#region handle error
        if (buildOptions.release.releaseType) {
          throw 'Typescript compilation (backend)';
        } else {
          Helpers.error(
            `[${config.frameworkName}] Typescript compilation (backend) error (code=${code})`,
            false,
            true,
          );
        }
        //#endregion
      },
      outputLineReplace: (line: string) => {
        //#region outputs replacement
        if (line.startsWith(`${tmpSourceDist + prodSuffix}/`)) {
          return additionalReplace(
            line.replace(
              `${tmpSourceDist + prodSuffix}/`,
              `./${srcMainProject}/`,
            ),
          );
        }

        if (line.startsWith(`${tmpSourceDist}/`)) {
          return additionalReplace(
            line.replace(`${tmpSourceDist}/`, `./${srcMainProject}/`),
          );
        }

        return additionalReplace(
          line
            .replace(
              `../${tmpSourceDist + prodSuffix}/`,
              `./${srcMainProject}/`,
            )
            .replace(`../${tmpSourceDist}/`, `./${srcMainProject}/`),
        );
        //#endregion
      },
      resolvePromiseMsg: {
        stdout: ['Found 0 errors. Watching for file changes'],
      },
    });

    Helpers.logInfo(`* Typescript compilation first part done`);

    await this.project.nodeModules.makeSureInstalled();

    await Helpers.execute(commandMaps, cwd, {
      similarProcessKey: 'tsc',
      hideOutput: {
        stderr: true,
        stdout: true,
        acceptAllExitCodeAsSuccess: true,
      },
      resolvePromiseMsg: {
        stdout: ['Watching for file changes.'],
      },
    });

    // Helpers.writeJson(
    //   [
    //     cwd,
    //     this.buildOptions.build.prod
    //       ? `${distMainProject}${prodSuffix}`
    //       : distMainProject,
    //     libFromCompiledDist,
    //     packageJsonLibDist,
    //   ],
    //   {
    //     name: `${this.project.nameForNpmPackage}/${
    //       libFromCompiledDist + this.buildOptions.build.prod ? prodSuffix : ''
    //     }`,
    //     type: 'module',
    //     exports: {
    //       '.': './index.js',
    //     },
    //   },
    // );

    Helpers.logInfo(`* Typescript compilation second part done`);
    Helpers.info(`

    Backend TypeScript build done....

        `);

    if (buildOptions.build.watch) {
      // console.log(Helpers.terminalLine());
      Helpers.info(`

    ${chalk.bold('YOU CAN ATTACH YOUR CODE DEBUGGER NOW')}

    `);
      // console.log(Helpers.terminalLine());
    }
    //#endregion
  }
  //#endregion
}
