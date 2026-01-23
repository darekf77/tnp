//#region imports
import { RegionRemover } from 'isomorphic-region-loader/src';
import { ReplaceOptionsExtended } from 'isomorphic-region-loader/src';
import {
  chalk,
  config,
  extAllowedToReplace,
  frontEndOnly,
  TAGS,
  Utils,
  UtilsJson,
} from 'tnp-core/src';
import { _, path, fse, crossPlatformPath } from 'tnp-core/src';
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';

import { getCleanImport } from '../../../../../../../app-utils';
import {
  appFromSrc,
  assetsFor,
  assetsFromNgProj,
  assetsFromNpmPackage,
  assetsFromSrc,
  assetsFromTempSrc,
  browserFromImport,
  browserMainProject,
  browserNpmPackage,
  browserTypeString,
  indexTsFromLibFromSrc,
  libFromImport,
  libFromNpmPackage,
  libFromSrc,
  libTypeString,
  prodSuffix,
  splitNamespacesJson,
  srcFromTaonImport,
  srcMainProject,
  tmpSourceDist,
  tmpSrcAppDist,
  tmpSrcAppDistWebsql,
  tmpSrcDist,
  tmpSrcDistWebsql,
  TO_REMOVE_TAG,
  websqlFromImport,
  websqlMainProject,
  websqlNpmPackage,
  websqlTypeString,
} from '../../../../../../../constants';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';

import { SplitFileProcess } from './file-split-process';
//#endregion

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
  //#region constants
  public static debugFile = [
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
  protected absFileSourcePathBrowserOrWebsqlAPPONLY: string;

  private rawContentForBrowser: string;

  private rawContentForAPPONLYBrowser: string;

  private rawContentBackend: string;

  public get importExportsFromOrgContent(): UtilsTypescript.TsImportExport[] {
    return this.splitFileProcess?._importExports || [];
  }

  private splitFileProcess: SplitFileProcess;

  /**
   * ex. path/to/file-somewhere.ts or assets/something/here
   * in src or tmpSrcDist etc.
   */
  private readonly relativePath: string;

  private readonly isWebsqlMode: boolean;

  private readonly isAssetsFile: boolean = false;

  private readonly absoluteBackendDestFilePath: string;

  private readonly debug: boolean = false;

  //#endregion

  //#region constructor

  public static namespacesForPackagesLib: Map<
    string,
    UtilsTypescript.SplitNamespaceResult
  >;

  public static namespacesForPackagesBrowser: Map<
    string,
    UtilsTypescript.SplitNamespaceResult
  >;

  public static namespacesForPackagesWebsql: Map<
    string,
    UtilsTypescript.SplitNamespaceResult
  >;

  get namespacesForPackagesLib() {
    return BrowserCodeCut.namespacesForPackagesLib;
  }

  get namespacesForPackagesBrowser() {
    return BrowserCodeCut.namespacesForPackagesBrowser;
  }

  get namespacesForPackagesWebsql() {
    return BrowserCodeCut.namespacesForPackagesWebsql;
  }

  private readonly nameForNpmPackage: string;

  //#region @backend
  constructor(
    /**
     * ex.< project location >/src/something.ts
     */
    protected absSourcePathFromSrc: string,
    /**
     * ex. < project location >/tmpSrcDistWebsql/my/relative/path.ts
     */
    protected absFileSourcePathBrowserOrWebsql: string,
    /**
     * ex. < project location >/tmpSrcDist
     */
    protected absPathTmpSrcDistFolder: string,
    private project: Project,
    private buildOptions: EnvOptions,
  ) {
    //#region recognize namespaces for isomorphic packages
    this.nameForNpmPackage = project.nameForNpmPackage;
    if (!this.namespacesForPackagesLib && buildOptions.build.prod) {
      BrowserCodeCut.namespacesForPackagesLib = new Map();
      BrowserCodeCut.namespacesForPackagesBrowser = new Map();
      BrowserCodeCut.namespacesForPackagesWebsql = new Map();

      //#region gather all isomorphic production namespaces metadata
      project.nodeModules.getIsomorphicPackagesNames().forEach(pkgName => {
        const namespacesLib = UtilsJson.readJson(
          project.nodeModules.pathFor([
            pkgName,
            libFromNpmPackage + prodSuffix + `.${splitNamespacesJson}`,
          ]),
          {},
        );
        this.namespacesForPackagesLib.set(pkgName, namespacesLib);

        const namespacesBrowser = UtilsJson.readJson(
          project.nodeModules.pathFor([
            pkgName,
            browserNpmPackage + prodSuffix + `.${splitNamespacesJson}`,
          ]),
          {},
        );
        this.namespacesForPackagesBrowser.set(pkgName, namespacesBrowser);

        const namespacesWebsql = UtilsJson.readJson(
          project.nodeModules.pathFor([
            pkgName,
            websqlNpmPackage + prodSuffix + `.${splitNamespacesJson}`,
          ]),
          {},
        );
        this.namespacesForPackagesWebsql.set(pkgName, namespacesWebsql);
      });
      //#endregion

      //#region clear project own package to be filled later
      this.namespacesForPackagesLib.set(this.nameForNpmPackage, {
        namespacesMapObj: {},
        namespacesReplace: {},
      });
      this.namespacesForPackagesBrowser.set(this.nameForNpmPackage, {
        namespacesMapObj: {},
        namespacesReplace: {},
      });
      this.namespacesForPackagesWebsql.set(this.nameForNpmPackage, {
        namespacesMapObj: {},
        namespacesReplace: {},
      });
      //#endregion
    }
    //#endregion

    // console.log(`[incremental-build-process INSIDE BROWSER!!! '${this.buildOptions.baseHref}'`)

    this.absPathTmpSrcDistFolder = crossPlatformPath(absPathTmpSrcDistFolder);
    this.absFileSourcePathBrowserOrWebsql = crossPlatformPath(
      absFileSourcePathBrowserOrWebsql,
    );

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
      if (
        absSourcePathFromSrc
          .replace(project.pathFor(srcMainProject), '')
          .startsWith(`/${assetsFromTempSrc}/`)
      ) {
        this.isAssetsFile = true;
      }
    }

    this.relativePath = crossPlatformPath(
      this.absFileSourcePathBrowserOrWebsql,
    ).replace(`${this.absPathTmpSrcDistFolder}/`, '');

    this.debug = BrowserCodeCut.debugFile.some(d =>
      this.relativePath.endsWith(d),
    );

    this.absoluteBackendDestFilePath = crossPlatformPath([
      this.project.location,
      tmpSourceDist + (buildOptions.build.prod ? prodSuffix : ''),
      this.relativePath,
    ]);

    // console.log('RELATIVE ', this.relativePath)

    this.isWebsqlMode = this.relativePath.startsWith(
      tmpSrcDistWebsql + (buildOptions.build.prod ? prodSuffix : ''),
    );
  }
  //#endregion

  //#endregion

  //#region public / methods & getters / process file
  processFile({
    fileRemovedEvent,
    regionReplaceOptions,
    isCuttableFile,
  }: {
    fileRemovedEvent?: boolean;
    isCuttableFile: boolean;
    regionReplaceOptions: ReplaceOptionsExtended;
  }) {
    //#region @backendFunc
    if (isCuttableFile) {
      this.initAndSaveCuttableFile(regionReplaceOptions);
    } else {
      this.initAndSaveAssetFile(fileRemovedEvent);
    }
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / init and save cuttabl file
  private initAndSaveCuttableFile(options: ReplaceOptionsExtended): void {
    //#region @backendFunc
    return this.init()
      .REPLACERegionsForIsomorphicLib(_.cloneDeep(options) as any)
      .REPLACERegionsFromTsImportExport()
      .save();
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / init and save
  private initAndSaveAssetFile(remove = false): BrowserCodeCut {
    // const debugFiles = ['assets/cutsmall.jpg'];

    //#region @backendFunc
    if (remove) {
      Helpers.removeIfExists(
        this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsql),
      );
      Helpers.removeIfExists(
        this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsqlAPPONLY),
      );
      Helpers.removeIfExists(
        this.replaceAssetsPath(this.absoluteBackendDestFilePath),
      );
    } else {
      // this is needed for json in src/lib or something
      // if (this.absFileSourcePathBrowserOrWebsql.endsWith(debugFiles[0])) {
      //   debugger;
      // }
      const realAbsSourcePathFromSrc =
        fse.existsSync(this.absSourcePathFromSrc) &&
        fse.realpathSync(this.absSourcePathFromSrc);

      if (
        !realAbsSourcePathFromSrc ||
        !Helpers.exists(realAbsSourcePathFromSrc) ||
        Helpers.isFolder(realAbsSourcePathFromSrc)
      ) {
        return;
      }

      try {
        Helpers.copyFile(
          this.absSourcePathFromSrc,
          this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsql),
        );
        Helpers.copyFile(
          this.absSourcePathFromSrc,
          this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsqlAPPONLY),
        );
        // final straight copy to tmpSourceFolder
        Helpers.copyFile(
          this.absSourcePathFromSrc,
          this.replaceAssetsPath(this.absoluteBackendDestFilePath),
        );
      } catch (error) {
        Helpers.warn(
          `[taon][browser-code-cut] file not found ${this.absSourcePathFromSrc}`,
        );
      }
    }
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / init
  rawOrginalContent: string;

  private init(): BrowserCodeCut {
    //#region @backendFunc
    const orgContent =
      Helpers.readFile(this.absSourcePathFromSrc, void 0, true) || '';
    this.rawOrginalContent = orgContent;

    const allIsomorphicPackagesFromMemory =
      this.project.packagesRecognition.allIsomorphicPackagesFromMemory;

    this.splitFileProcess = new SplitFileProcess(
      orgContent,
      this.absSourcePathFromSrc,
      allIsomorphicPackagesFromMemory,
      this.project.name,
      this.nameForNpmPackage,
    );
    const { modifiedContent: firstPass, rewriteFile: firstTimeRewriteFile } =
      this.splitFileProcess.content;

    const { modifiedContent: secondPass, rewriteFile: secondTimeRewriteFile } =
      new SplitFileProcess(
        firstPass,
        this.absSourcePathFromSrc,
        allIsomorphicPackagesFromMemory,
        this.project.name,
        this.nameForNpmPackage,
      ).content;

    if ((orgContent || '').trim() !== (firstPass || '')?.trim()) {
      if (
        firstTimeRewriteFile &&
        (firstPass || '').trim() === (secondPass || '').trim() // it means it is stable
      ) {
        Helpers.logInfo(`Rewrite file ${this.absSourcePathFromSrc}`);
        Helpers.writeFile(this.absSourcePathFromSrc, firstPass);
      } else {
        Helpers.logWarn(
          `Unstable file modification ${this.absSourcePathFromSrc}`,
        );
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
  get projectOwnSmartPackages(): string[] {
    //#region @backendFunc
    return [this.nameForNpmPackage];
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / is empty browser file
  private get isEmptyBrowserFile(): boolean {
    //#region @backendFunc
    return this.rawContentForBrowser.replace(/\s/g, '').trim() === '';
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / is empty module backend file
  private get isEmptyModuleBackendFile(): boolean {
    //#region @backendFunc
    return (
      (this.rawContentBackend || '').replace(/\/\*\ \*\//g, '').trim()
        .length === 0
    );
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / save empty file
  private saveEmptyFile(isTsFile: boolean): void {
    //#region @backendFunc
    if (!fse.existsSync(path.dirname(this.absFileSourcePathBrowserOrWebsql))) {
      // write empty instead unlink
      fse.mkdirpSync(path.dirname(this.absFileSourcePathBrowserOrWebsql));
    }
    if (
      !fse.existsSync(
        path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY),
      )
    ) {
      // write empty instead unlink
      fse.mkdirpSync(
        path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY),
      );
    }
    if (isTsFile) {
      if (!this.relativePath.startsWith('app/')) {
        try {
          // QUICK_FIX remove directory when trying to save as file
          fse.removeSync(this.absFileSourcePathBrowserOrWebsql);
        } catch (error) {}
        fse.writeFileSync(this.absFileSourcePathBrowserOrWebsql, 'utf8');
      }
      try {
        // QUICK_FIX remove directory when trying to save as file
        fse.removeSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY);
      } catch (error) {}
      fse.writeFileSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY, 'utf8');
    } else {
      if (!this.relativePath.startsWith('app/')) {
        try {
          // QUICK_FIX remove directory when trying to save as file
          fse.removeSync(this.absFileSourcePathBrowserOrWebsql);
        } catch (error) {}
        fse.writeFileSync(this.absFileSourcePathBrowserOrWebsql, ``, 'utf8');
      }
      try {
        // QUICK_FIX remove directory when trying to save as file
        fse.removeSync(this.absFileSourcePathBrowserOrWebsqlAPPONLY);
      } catch (error) {}
      fse.writeFileSync(
        this.absFileSourcePathBrowserOrWebsqlAPPONLY,
        ``,
        'utf8',
      );
    }
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / save normal file
  private saveNormalFile(isTsFile: boolean): void {
    //#region @backendFunc
    // console.log('SAVE NORMAL FILE')
    if (this.isAssetsFile) {
      this.absFileSourcePathBrowserOrWebsql = this.replaceAssetsPath(
        this.absFileSourcePathBrowserOrWebsql,
      );
      // console.log(`ASSETE: ${this.absFileSourcePathBrowserOrWebsql}`)
    }
    if (this.isAssetsFile) {
      this.absFileSourcePathBrowserOrWebsqlAPPONLY = this.replaceAssetsPath(
        this.absFileSourcePathBrowserOrWebsqlAPPONLY,
      );
      // console.log(`ASSETE: ${this.absFileSourcePathBrowserOrWebsql}`)
    }
    if (!fse.existsSync(path.dirname(this.absFileSourcePathBrowserOrWebsql))) {
      fse.mkdirpSync(path.dirname(this.absFileSourcePathBrowserOrWebsql));
    }
    if (
      !fse.existsSync(
        path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY),
      )
    ) {
      fse.mkdirpSync(
        path.dirname(this.absFileSourcePathBrowserOrWebsqlAPPONLY),
      );
    }

    this.processAssetsLinksForApp();

    if (!this.isAssetsFile && this.relativePath.endsWith('.backend.ts')) {
      return;
    }

    if (isTsFile) {
      if (
        !this.relativePath.startsWith(`${appFromSrc}/`) &&
        !this.relativePath.startsWith(`${appFromSrc}.`)
      ) {
        fse.writeFileSync(
          this.absFileSourcePathBrowserOrWebsql,
          this.changeNpmNameToLocalLibNamePath(
            this.rawContentForBrowser,
            this.absFileSourcePathBrowserOrWebsql,
            { isBrowser: true },
          ),
          'utf8',
        );
      }
      fse.writeFileSync(
        this.absFileSourcePathBrowserOrWebsqlAPPONLY,
        this.changeNpmNameToLocalLibNamePath(
          this.rawContentForAPPONLYBrowser,
          this.absFileSourcePathBrowserOrWebsqlAPPONLY,
          { isBrowser: true, libForApp: true },
        ),
        'utf8',
      );
    } else {
      if (!this.relativePath.startsWith(`${appFromSrc}/`)) {
        fse.writeFileSync(
          this.absFileSourcePathBrowserOrWebsql,
          this.rawContentForBrowser,
          'utf8',
        );
      }
      fse.writeFileSync(
        this.absFileSourcePathBrowserOrWebsqlAPPONLY,
        this.rawContentForAPPONLYBrowser,
        'utf8',
      );
    }
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / replace regions from ts import export
  private REPLACERegionsFromTsImportExport(): BrowserCodeCut {
    //#region @backendFunc
    if (this.isAssetsFile) {
      return this;
    }
    if (!this.relativePath.endsWith('.ts')) {
      if (this.relativePath.endsWith('.tsx')) {
        // ok
      } else {
        return this;
      }
    }
    const prodPart = this.buildOptions.build.prod ? prodSuffix : '';
    if (_.isString(this.rawContentForBrowser)) {
      const toReplace = this.importExportsFromOrgContent.filter(imp => {
        imp.embeddedPathToFileResult = imp.wrapInParenthesis(
          imp.cleanEmbeddedPathToFile.replace(
            `/${srcMainProject}`,
            `/${
              (this.buildOptions.build.websql
                ? websqlFromImport
                : browserFromImport) + prodPart
            }`,
          ),
        );
        return imp.isIsomorphic;
      });

      this.rawContentForBrowser = this.splitFileProcess.replaceInFile(
        this.rawContentForBrowser,
        toReplace,
      );
      this.importExportsFromOrgContent.forEach(
        imp => delete imp.embeddedPathToFileResult,
      );
    }

    if (_.isString(this.rawContentBackend)) {
      const toReplace = this.importExportsFromOrgContent.filter(imp => {
        imp.embeddedPathToFileResult = imp.wrapInParenthesis(
          imp.cleanEmbeddedPathToFile.replace(
            `/${srcFromTaonImport}`,
            `/${libFromImport + prodPart}`,
          ),
        );
        return imp.isIsomorphic;
      });

      this.rawContentBackend = this.splitFileProcess.replaceInFile(
        this.rawContentBackend,
        toReplace,
      );
      this.importExportsFromOrgContent.forEach(
        imp => delete imp.embeddedPathToFileResult,
      );
    }

    return this;
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / replace regions for isomorphic lib
  private REPLACERegionsForIsomorphicLib(
    options: ReplaceOptionsExtended,
  ): BrowserCodeCut {
    //#region @backendFunc
    if (this.isAssetsFile) {
      return this;
    }
    options = _.clone(options);
    // Helpers.log(`[REPLACERegionsForIsomorphicLib] options.replacements ${this.absoluteFilePath}`)
    const ext = path.extname(this.relativePath);
    // console.log(`Ext: "${ext}" for file: ${path.basename(this.absoluteFilePath)}`)
    if (extAllowedToReplace.includes(ext)) {
      const orgContent = this.rawContentForBrowser;

      this.rawContentForBrowser = RegionRemover.from(
        this.relativePath,
        orgContent,
        options.replacements,
        this.project,
      ).output;

      if (this.project.framework.isStandaloneProject && !this.isWebsqlMode) {
        const regionsToRemove = [TAGS.BROWSER, TAGS.WEBSQL_ONLY];

        const orgContentBackend = this.rawContentBackend;

        // const debug =  this.relativePath.endsWith('layout-simple-small-app.component.ts');
        // if (debug ) {
        //   console.log(this.relativePath);
        //   console.log({ debugging: regionsToRemove });
        //   console.log(orgContentBackend);
        // }

        this.rawContentBackend = RegionRemover.from(
          this.absoluteBackendDestFilePath,
          orgContentBackend,
          regionsToRemove,
          this.project,
          // debug
        ).output;
      }
    }

    (() => {
      const from = `${srcMainProject}/${assetsFromSrc}/`;
      const to =
        `${TO_REMOVE_TAG}${assetsFromNgProj}/` +
        `${assetsFor}/${this.nameForNpmPackage}/${assetsFromNpmPackage}/`;
      this.rawContentForBrowser = this.rawContentForBrowser.replace(
        new RegExp(Helpers.escapeStringForRegEx(`/${from}`), 'g'),
        to,
      );
      this.rawContentForBrowser = this.rawContentForBrowser.replace(
        new RegExp(Helpers.escapeStringForRegEx(from), 'g'),
        to,
      );
    })();

    return this;
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / processing asset link for app
  private processAssetsLinksForApp(): void {
    //#region @backendFunc
    this.rawContentForAPPONLYBrowser = this.rawContentForBrowser.replace(
      new RegExp(Helpers.escapeStringForRegEx(TO_REMOVE_TAG), 'g'),
      '',
    );
    // console.log(`[incremental-build-process processAssetsLinksForApp '${this.buildOptions.baseHref}'`)
    const baseHref =
      this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(
        this.buildOptions.clone(),
      );
    // console.log(`Fixing with basehref: '${baseHref}'`)

    const howMuchBack = this.relativePath.split('/').length - 1;
    const back =
      howMuchBack === 0
        ? './'
        : _.times(howMuchBack)
            .map(() => '../')
            .join('');

    const toReplaceFn = (relativeAssetPathPart: string) => {
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
      ] as {
        from: string;
        to: string;
        makeSureSlashAtBegin?: boolean;
      }[];
    };

    (() => {
      const cases = toReplaceFn(this.nameForNpmPackage);
      for (let index = 0; index < cases.length; index++) {
        const { to, from, makeSureSlashAtBegin } = cases[index];
        if (makeSureSlashAtBegin) {
          this.rawContentForAPPONLYBrowser =
            this.rawContentForAPPONLYBrowser.replace(
              new RegExp(Helpers.escapeStringForRegEx(`/${from}`), 'g'),
              `/${to}`,
            );

          this.rawContentForAPPONLYBrowser =
            this.rawContentForAPPONLYBrowser.replace(
              new RegExp(Helpers.escapeStringForRegEx(from), 'g'),
              `/${to}`,
            );
        } else {
          this.rawContentForAPPONLYBrowser =
            this.rawContentForAPPONLYBrowser.replace(
              new RegExp(Helpers.escapeStringForRegEx(from), 'g'),
              to,
            );
        }
      }
    })();

    //#endregion
  }
  //#endregion

  //#region private / methods & getters / save
  private save(): void {
    //#region @backendFunc
    if (this.isAssetsFile) {
      this.saveNormalFile(false);
      return;
    }
    // Helpers.log(`saving ismoprhic file: ${this.absoluteFilePath}`, 1)

    const isTsFile = ['.ts', '.tsx'].includes(
      path.extname(this.absFileSourcePathBrowserOrWebsql),
    );
    const backendFileSaveMode = !this.isWebsqlMode; // websql does not do anything on be

    if (this.isEmptyBrowserFile) {
      this.saveEmptyFile(isTsFile);
    } else {
      this.saveNormalFile(isTsFile);
    }

    if (backendFileSaveMode) {
      const isEmptyModuleBackendFile = this.isEmptyModuleBackendFile;

      const absoluteBackendDestFilePath = this.absoluteBackendDestFilePath;

      if (!fse.existsSync(path.dirname(absoluteBackendDestFilePath))) {
        fse.mkdirpSync(path.dirname(absoluteBackendDestFilePath));
      }
      const isFrontendFile = !_.isUndefined(
        frontEndOnly.find(f => absoluteBackendDestFilePath.endsWith(f)),
      );

      if (isFrontendFile) {
        // console.log(`Ommiting for backend: ${absoluteBackendDestFilePath} `)
        return;
      }

      const contentStandalone =
        isEmptyModuleBackendFile && isTsFile
          ? `export function dummy${new Date().getTime()}() { }`
          : this.changeNpmNameToLocalLibNamePath(
              this.rawContentBackend,
              absoluteBackendDestFilePath,
              {
                isBrowser: false,
              },
            );

      fse.writeFileSync(absoluteBackendDestFilePath, contentStandalone, 'utf8');
    }
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / production namespaces split
  private static initialWarning = {};

  get initialWarnings() {
    return BrowserCodeCut.initialWarning;
  }

  private productionSplitNamespaces(
    content: string,
    absFilePath: string,
    fileType:
      | typeof libTypeString
      | typeof browserTypeString
      | typeof websqlTypeString,
  ): string {
    //#region @backendFunc
    // if(this.debug) {
    //   debugger
    // }
    const data = UtilsTypescript.splitNamespaceForContent(content);
    if (fileType === libTypeString) {
      const current = this.namespacesForPackagesLib.get(this.nameForNpmPackage);
      _.merge(current.namespacesMapObj, data.namespacesMapObj);
      _.merge(current.namespacesReplace, data.namespacesReplace);
    } else if (fileType === browserTypeString) {
      const current = this.namespacesForPackagesBrowser.get(
        this.nameForNpmPackage,
      );
      _.merge(current.namespacesMapObj, data.namespacesMapObj);
      _.merge(current.namespacesReplace, data.namespacesReplace);
    } else if (fileType === websqlTypeString) {
      const current = this.namespacesForPackagesWebsql.get(
        this.nameForNpmPackage,
      );
      _.merge(current.namespacesMapObj, data.namespacesMapObj);
      _.merge(current.namespacesReplace, data.namespacesReplace);
    }

    // this.debug &&
    //   console.log(`(${fileType}) SAVING NAMESPACES FOR`, absFilePath);

    fse.writeFileSync(
      absFilePath
        .replace('.tsx', `.${splitNamespacesJson}`)
        .replace('.ts', `.${splitNamespacesJson}`),
      JSON.stringify(
        {
          namespacesMapObj: data.namespacesMapObj,
          namespacesReplace: data.namespacesReplace,
        },
        null,
        2,
      ),
      'utf-8',
    );

    return data.content;
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / change content before saving file
  private changeNpmNameToLocalLibNamePath(
    content: string,
    absFilePath: string,
    options: {
      isBrowser: boolean;
      libForApp?: boolean;
    },
  ): string {
    //#region @backendFunc

    const isLibFile = this.relativePath.startsWith(`${libFromSrc}/`);
    if (!absFilePath.endsWith('.ts')) {
      if (absFilePath.endsWith('.tsx')) {
        // ok
      } else {
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
    const backAppLibIndex =
      howMuchBack === 0
        ? './'
        : _.times(howMuchBack)
            .map(() => '../')
            .join('');

    const backLibIndex =
      howMuchBackIndex === 0
        ? './'
        : _.times(howMuchBackIndex)
            .map(() => '../')
            .join('');

    let toReplace: UtilsTypescript.TsImportExport[] = [];

    if (isBrowser) {
      toReplace = UtilsTypescript.recognizeImportsFromContent(
        this.rawContentForBrowser,
      ).filter(f => {
        const fPkgBrowser = f.cleanEmbeddedPathToFile
          .replace(
            new RegExp(
              Utils.escapeStringForRegEx(`/${browserFromImport + prodSuffix}`) +
                '$',
            ),
            '',
          )
          .replace(
            new RegExp(
              Utils.escapeStringForRegEx(`/${websqlFromImport + prodSuffix}`) +
                '$',
            ),
            '',
          )
          .replace(
            new RegExp(
              Utils.escapeStringForRegEx(`/${browserFromImport}`) + '$',
            ),
            '',
          )
          .replace(
            new RegExp(
              Utils.escapeStringForRegEx(`/${websqlFromImport}`) + '$',
            ),
            '',
          );
        // this.debug && console.log({ fPkgBrowser });
        return projectOwnSmartPackages.includes(fPkgBrowser);
      });
    } else {
      toReplace = UtilsTypescript.recognizeImportsFromContent(
        this.rawContentBackend,
      ).filter(f => {
        const fpkgBackend = f.cleanEmbeddedPathToFile
          .replace(
            new RegExp(
              Utils.escapeStringForRegEx(`/${libFromImport + prodSuffix}`) +
                '$',
            ),
            '',
          )
          .replace(
            new RegExp(Utils.escapeStringForRegEx(`/${libFromImport}`) + '$'),
            '',
          );
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
          Helpers.warn(
            `(illegal import ${chalk.bold(`${cleanName}/${srcFromTaonImport}`)})` +
              ` Use relative path: ./${crossPlatformPath([srcMainProject, this.relativePath])}:${indexInIfile + 1}`,
          );

          this.initialWarnings[key] = true;
        }
      }

      imp.embeddedPathToFileResult = imp.wrapInParenthesis(
        `${isLibFile ? backLibIndex : backAppLibIndex}${indexTsFromLibFromSrc.replace('.tsx', '').replace('.ts', '')}`,
      );
      //#endregion
    }
    content = this.splitFileProcess.replaceInFile(content, toReplace);

    if (this.buildOptions.build.prod) {
      content = this.productionSplitNamespaces(content, absFilePath, typeOfOp);
    }

    return content;
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / replace assets path
  private replaceAssetsPath(absDestinationPath: string): string {
    //#region @backendFunc
    const isAsset = this.relativePath.startsWith(`${assetsFromTempSrc}/`);

    // isAsset && console.log('isAsset', absDestinationPath);
    return isAsset
      ? absDestinationPath.replace(
          `/${assetsFromTempSrc}/`,
          `/${assetsFromNgProj}/${assetsFor}/${
            this.nameForNpmPackage
          }/${assetsFromNpmPackage}/`,
        )
      : absDestinationPath;
    //#endregion
  }
  //#endregion
}
