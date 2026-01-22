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
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';

import { getCleanImport } from '../../../../../../../app-utils';
import {
  browserFromCompiledDist,
  browserMainProject,
  distMainProject,
  distNoCutSrcMainProject,
  libFromCompiledDist,
  libFromSrc,
  libs,
  prodSuffix,
  splitNamespacesJson,
  srcMainProject,
  tmpSourceDist,
  tmpSrcDist,
  tmpSrcDistWebsql,
  tsconfigBackendDistJson,
  tsconfigBackendDistJson_PROD,
  websqlFromCompiledDist,
  websqlMainProject,
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
  ) {}
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

    if (this.buildOptions.build.prod) {
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
      // lib
      Helpers.writeJson(
        this.project.pathFor([
          distMainProject + prodSuffix,
          libFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
        ]),
        filesLib
          .filter(f => f.endsWith(`.${splitNamespacesJson}`))
          .reduce((a, b) => {
            const jsonMap: UtilsTypescript.SplitNamespaceResult =
              UtilsJson.readJson(b) || {};
            return _.merge(a, jsonMap);
          }, {} as UtilsTypescript.SplitNamespaceResult),
      );

      // browser
      Helpers.writeJson(
        this.project.pathFor([
          distMainProject + prodSuffix,
          browserFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
        ]),
        filesBrowser
          .filter(f => f.endsWith(`.${splitNamespacesJson}`))
          .reduce((a, b) => {
            const jsonMap: UtilsTypescript.SplitNamespaceResult =
              UtilsJson.readJson(b) || {};

            return _.merge(a, jsonMap);
          }, {} as UtilsTypescript.SplitNamespaceResult),
      );

      // websql
      Helpers.writeJson(
        this.project.pathFor([
          distMainProject + prodSuffix,
          websqlFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
        ]),
        filesWebsql
          .filter(f => f.endsWith(`.${splitNamespacesJson}`))
          .reduce((a, b) => {
            const jsonMap: UtilsTypescript.SplitNamespaceResult =
              UtilsJson.readJson(b) || {};

            return _.merge(a, jsonMap);
          }, {} as UtilsTypescript.SplitNamespaceResult),
      );
      //#endregion

      //#region process production code
      const nameForNpmPackage = this.project.nameForNpmPackage;

      //#region process production code / browser
      filesBrowser
        .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
        .forEach(f => {
          // Helpers.logInfo(`Processing browser prod file: ${f}`);

          let content = Helpers.readFile(f);
          const namespacesForPackagesBrowser =
            BrowserCodeCut.namespacesForPackagesBrowser;

          const importsExportInFile = UtilsTypescript.recognizeImportsFromFile(
            f,
          )
            .filter(c => !c.cleanEmbeddedPathToFile.startsWith('.'))
            .map(c => getCleanImport(c.cleanEmbeddedPathToFile));

          // const debug = BrowserCodeCut.debugFile.some(d => f.endsWith(d));
          // if (debug) {
          //   debugger;
          // }

          namespacesForPackagesBrowser.forEach((namespaceData, libName) => {
            if (
              libName !== nameForNpmPackage &&
              !importsExportInFile.includes(libName)
            ) {
              return;
            }
            content = UtilsTypescript.replaceNamespaceWithLongNames(
              content,
              namespaceData.namespacesMapObj,
            );
          });

          namespacesForPackagesBrowser.forEach((namespaceData, libName) => {
            if (
              libName !== nameForNpmPackage &&
              !importsExportInFile.includes(libName)
            ) {
              return;
            }
            content =
              UtilsTypescript.replaceImportNamespaceWithWithExplodedNamespace(
                content,
                namespaceData.namespacesReplace,
                libName === nameForNpmPackage,
              );
          });
          Helpers.writeFile(f, content);
        });

      //#endregion

      //#region process production code / websql
      filesWebsql
        .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
        .forEach(f => {
          // Helpers.logInfo(`Processing websql prod file: ${f}`);
          let content = Helpers.readFile(f);

          const importsExportInFile = UtilsTypescript.recognizeImportsFromFile(
            f,
          )
            .filter(c => !c.cleanEmbeddedPathToFile.startsWith('.'))
            .map(c => getCleanImport(c.cleanEmbeddedPathToFile));

          // const debug = BrowserCodeCut.debugFile.some(d => f.endsWith(d));
          // if (debug) {
          //   debugger;
          // }

          const namespacesForPackagesWebsql =
            BrowserCodeCut.namespacesForPackagesWebsql;

          namespacesForPackagesWebsql.forEach((namespaceData, libName) => {
            if (
              libName !== nameForNpmPackage &&
              !importsExportInFile.includes(libName)
            ) {
              return;
            }
            content = UtilsTypescript.replaceNamespaceWithLongNames(
              content,
              namespaceData.namespacesMapObj,
            );
          });

          namespacesForPackagesWebsql.forEach((namespaceData, libName) => {
            if (
              libName !== nameForNpmPackage &&
              !importsExportInFile.includes(libName)
            ) {
              return;
            }
            content =
              UtilsTypescript.replaceImportNamespaceWithWithExplodedNamespace(
                content,
                namespaceData.namespacesReplace,
                libName === nameForNpmPackage,
              );
          });
          Helpers.writeFile(f, content);
        });
      //#endregion

      //#region process production code / lib
      filesLib
        .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
        .forEach(f => {
          let content = Helpers.readFile(f);
          // Helpers.logInfo(`Processing lib prod file: ${f}`);

          const namespacesForPackagesLib =
            BrowserCodeCut.namespacesForPackagesLib;

          const importsExportInFile = UtilsTypescript.recognizeImportsFromFile(
            f,
          )
            .filter(c => !c.cleanEmbeddedPathToFile.startsWith('.'))
            .map(c => getCleanImport(c.cleanEmbeddedPathToFile));

          // const debug = BrowserCodeCut.debugFile.some(d => f.endsWith(d));
          // if (debug) {
          //   debugger;
          // }

          namespacesForPackagesLib.forEach((namespaceData, libName) => {
            if (
              libName !== nameForNpmPackage &&
              !importsExportInFile.includes(libName)
            ) {
              return;
            }
            content = UtilsTypescript.replaceNamespaceWithLongNames(
              content,
              namespaceData.namespacesMapObj,
            );
          });

          namespacesForPackagesLib.forEach((namespaceData, libName) => {
            if (
              libName !== nameForNpmPackage &&
              !importsExportInFile.includes(libName)
            ) {
              return;
            }
            content =
              UtilsTypescript.replaceImportNamespaceWithWithExplodedNamespace(
                content,
                namespaceData.namespacesReplace,
                libName === nameForNpmPackage,
              );
          });
          Helpers.writeFile(f, content);
        });
      //#endregion

      //#endregion
    }
    // debugger;

    await this.libCompilation(this.buildOptions, {
      generateDeclarations: true,
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

    // console.log({
    //   commandJs,
    //   commandMaps,
    // });

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
