//#region imports
import { RegionRemover } from 'isomorphic-region-loader/src';
import { ReplaceOptionsExtended } from 'isomorphic-region-loader/src';
import { config, extAllowedToReplace, frontEndOnly, TAGS } from 'tnp-core/src';
import { _, path, fse, crossPlatformPath } from 'tnp-core/src';
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';

import {
  appFromSrc,
  assetsFor,
  assetsFromNgProj,
  assetsFromNpmPackage,
  assetsFromSrc,
  assetsFromTempSrc,
  browserMainProject,
  libFromImport,
  srcFromTaonImport,
  srcMainProject,
  tmpSourceDist,
  tmpSrcAppDist,
  tmpSrcAppDistWebsql,
  tmpSrcDist,
  tmpSrcDistWebsql,
  TO_REMOVE_TAG,
  websqlMainProject,
} from '../../../../../../../constants';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';

import { SplitFileProcess } from './file-split-process';
//#endregion

//#region constants
const debugFile = [
  // 'helpers-process.ts'
];
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
    // console.log(`[incremental-build-process INSIDE BROWSER!!! '${this.buildOptions.baseHref}'`)

    this.absPathTmpSrcDistFolder = crossPlatformPath(absPathTmpSrcDistFolder);
    this.absFileSourcePathBrowserOrWebsql = crossPlatformPath(
      absFileSourcePathBrowserOrWebsql,
    );
    const replaceFrom = buildOptions.build.websql
      ? tmpSrcDistWebsql
      : tmpSrcDist;
    const replaceTo = buildOptions.build.websql
      ? tmpSrcAppDistWebsql
      : tmpSrcAppDist;

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

    this.debug = debugFile.some(d => this.relativePath.endsWith(d));

    this.absoluteBackendDestFilePath = crossPlatformPath([
      this.project.location,
      tmpSourceDist,
      this.relativePath,
    ]);

    // console.log('RELATIVE ', this.relativePath)

    this.isWebsqlMode = this.relativePath.startsWith(tmpSrcDistWebsql);
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
  private init(): BrowserCodeCut {
    //#region @backendFunc
    const orgContent =
      Helpers.readFile(this.absSourcePathFromSrc, void 0, true) || '';

    const allIsomorphicPackagesFromMemory =
      this.project.packagesRecognition.allIsomorphicPackagesFromMemory;

    this.splitFileProcess = new SplitFileProcess(
      orgContent,
      this.absSourcePathFromSrc,
      allIsomorphicPackagesFromMemory,
      this.project.name,
      this.project.nameForNpmPackage,
    );
    const { modifiedContent: firstPass, rewriteFile: firstTimeRewriteFile } =
      this.splitFileProcess.content;

    const { modifiedContent: secondPass, rewriteFile: secondTimeRewriteFile } =
      new SplitFileProcess(
        firstPass,
        this.absSourcePathFromSrc,
        allIsomorphicPackagesFromMemory,
        this.project.name,
        this.project.nameForNpmPackage,
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
    return [this.project.nameForNpmPackage];
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
          { isBrowser: true },
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
      return this;
    }
    if (_.isString(this.rawContentForBrowser)) {
      const toReplace = this.importExportsFromOrgContent.filter(imp => {
        imp.embeddedPathToFileResult = imp.wrapInParenthesis(
          imp.cleanEmbeddedPathToFile.replace(
            `/${srcMainProject}`,
            `/${
              this.buildOptions.build.websql
                ? websqlMainProject
                : browserMainProject
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
            `/${libFromImport}`,
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
      const from = `src/assets/`;
      const to = `${TO_REMOVE_TAG}assets/assets-for/${this.project.nameForNpmPackage}/assets/`;
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
        EnvOptions.fromBuild(this.buildOptions),
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
          from: `assets/assets-for/${relativeAssetPathPart}/`,
          to: `assets/assets-for/${relativeAssetPathPart}/`,
          makeSureSlashAtBegin: true,
        },
        {
          from: ` '/assets/assets-for/${relativeAssetPathPart}/`,
          to: ` '${baseHref}assets/assets-for/${relativeAssetPathPart}/`,
        },
        {
          from: ` "/assets/assets-for/${relativeAssetPathPart}/`,
          to: ` "${baseHref}assets/assets-for/${relativeAssetPathPart}/`,
        },
        {
          from: `src="/assets/assets-for/${relativeAssetPathPart}/`,
          to: `src="${baseHref}assets/assets-for/${relativeAssetPathPart}/`,
        },
        {
          from: `[src]="'/assets/assets-for/${relativeAssetPathPart}/`,
          to: `[src]="'${baseHref}assets/assets-for/${relativeAssetPathPart}/`,
        },
        {
          from: `href="/assets/assets-for/${relativeAssetPathPart}/`,
          to: `href="${baseHref}assets/assets-for/${relativeAssetPathPart}/`,
        },
        {
          from: `[href]="'/assets/assets-for/${relativeAssetPathPart}/`,
          to: `[href]="'${baseHref}assets/assets-for/${relativeAssetPathPart}/`,
        },
        {
          from: `url(/assets/assets-for/${relativeAssetPathPart}/`,
          to: `url(${baseHref}assets/assets-for/${relativeAssetPathPart}/`,
        },
        {
          from: `url('/assets/assets-for/${relativeAssetPathPart}/`,
          to: `url('${baseHref}assets/assets-for/${relativeAssetPathPart}/`,
        },
        {
          from: `url("/assets/assets-for/${relativeAssetPathPart}/`,
          to: `url("${baseHref}assets/assets-for/${relativeAssetPathPart}/`,
        },
        /**
         *

  import * as json1 from '/shared/src/assets/hamsters/test.json';
  console.log({ json1 }) -> WORKS NOW
         */
        {
          from: ` from '/assets/assets-for/${relativeAssetPathPart}/`,
          to: ` from '${back}assets/assets-for/${relativeAssetPathPart}/`,
        },
        {
          from: ` from "/assets/assets-for/${relativeAssetPathPart}/`,
          to: ` from "${back}assets/assets-for/${relativeAssetPathPart}/`,
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
      const nameForNpmPackage = this.project.nameForNpmPackage;
      const cases = toReplaceFn(nameForNpmPackage);
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

    const isTsFile = ['.ts'].includes(
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

  //#region private / methods & getters / change content before saving file
  private changeNpmNameToLocalLibNamePath(
    content: string,
    absFilePath: string,
    options: {
      isBrowser: boolean;
    },
  ): string {
    //#region @backendFunc
    if (!absFilePath.endsWith('.ts')) {
      // console.log(`NOT_FIXING: ${absFilePath}`)
      return content;
    }

    const projectOwnSmartPackages = this.projectOwnSmartPackages;
    const { isBrowser } = options;

    const howMuchBack = this.relativePath.split('/').length - 1;
    const back =
      howMuchBack === 0
        ? './'
        : _.times(howMuchBack)
            .map(() => '../')
            .join('');

    let toReplace: UtilsTypescript.TsImportExport[] = [];

    if (isBrowser) {
      toReplace = UtilsTypescript.recognizeImportsFromContent(
        this.rawContentForBrowser,
      ).filter(f => {
        return projectOwnSmartPackages.includes(
          f.cleanEmbeddedPathToFile
            .replace(/\/browser$/, '')
            .replace(/\/websql$/, ''),
        );
      });
    } else {
      toReplace = UtilsTypescript.recognizeImportsFromContent(
        this.rawContentBackend,
      ).filter(f => {
        return projectOwnSmartPackages.includes(
          f.cleanEmbeddedPathToFile.replace(/\/lib$/, ''),
        );
      });
    }

    for (const imp of toReplace) {
      imp.embeddedPathToFileResult = imp.wrapInParenthesis(
        `${back}${libFromImport}`,
      );
    }
    content = this.splitFileProcess.replaceInFile(content, toReplace);

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
          `/${assetsFromNgProj}/${assetsFor}/${this.project.nameForNpmPackage}/${assetsFromNpmPackage}/`,
        )
      : absDestinationPath;
    //#endregion
  }
  //#endregion
}
