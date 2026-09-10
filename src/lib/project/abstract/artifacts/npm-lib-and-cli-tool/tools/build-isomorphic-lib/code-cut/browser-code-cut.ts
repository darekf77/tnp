//#region imports
import { UtilsI18nHtml, UtilsPoFile } from '@taon-dev/i18n/src';
import { RegionRemover } from 'isomorphic-region-loader/src';
import { ReplaceOptionsExtended } from 'isomorphic-region-loader/src';
import {
  chalk,
  dateformat,
  extAllowedToReplace,
  extForStyles,
  frontEndOnly,
  TAGS,
  Utils,
  UtilsFilesFoldersSync,
  UtilsI18n,
  taonSkipCut,
  stateServiceSuffix,
  config,
  tnpPackageName,
} from 'tnp-core/src';
import { _, path, fse, crossPlatformPath } from 'tnp-core/src';
import { Helpers, HelpersTaon, UtilsTypescript } from 'tnp-helpers/src';

import {
  getCleanImport,
  isBrowserFilePath,
  isTestFile,
  replaceAssetsLinksForApp,
  replaceImportToAssetsIMport,
} from '../../../../../../../app-utils';
import {
  appAutoGenDocsMd,
  appAutoGenJs,
  appFromSrc,
  appTsFromSrc,
  assetsFor,
  assetsFromNgProj,
  assetsFromNpmPackage,
  assetsFromSrc,
  assetsFromTempSrc,
  browserFromImport,
  browserTypeString,
  cliTsFromSrc,
  CoreNgTemplateFiles,
  endingsStylesComponentsContainers,
  globalScssFromSrc,
  i18nDataTsFileExt,
  importsHtmlFromSrc,
  indexTsFromLibFromSrc,
  indexTsFromSrc,
  libEsm,
  libEsmFromImport,
  libFromImport,
  libFromSrc,
  libTypeString,
  ngProjectStylesScss,
  ngProjectTailwindCss,
  prodSuffix,
  srcFromTaonImport,
  srcMainProject,
  srcNgProxyProject,
  tailwindScssImportRegex,
  tailwindScssImportRegexGlobal,
  TaonGeneratedFiles,
  tempAppForFolder,
  tempSourceFolder,
  timestampPrefixComment,
  tmpAppsForDist,
  tmpAppsForDistElectron,
  tmpAppsForDistElectronWebsql,
  tmpAppsForDistWebsql,
  tmpSourceDist,
  tmpSourceEsmDist,
  tmpSrcAppDist,
  tmpSrcAppDistWebsql,
  tmpSrcDist,
  tmpSrcDistWebsql,
  websqlFromImport,
  websqlTypeString,
} from '../../../../../../../constants';
import {
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../../../../options';
import type { Project } from '../../../../../project';

import { isFirstTimeCompilation } from './constants-code-cut';
import { SplitFileProcess } from './file-split-process';
import { UtilsCodeCut } from './utils-code-cut';
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
  //#region constants
  public static debugFiles = [
    // 'taon-notification-recipient.entity.ts',
    // 'taon-auth-context.entity.ts',
    // 'app.ts',
    // 'app-utils.ts',
    // 'branding.ts'
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
  ] as string[];

  //#endregion

  //#region fields
  /**
   * slighted modifed app release dist
   */
  protected absFileSourcePathBrowserOrWebsqlAPPONLY: string;

  //#region fields & getters / raw content
  private rawContentForBrowser: string;

  private rawContentForAPPONLYBrowser: string;

  private rawContentBackend: string;

  private rawContentEsmBackend: string;
  //#endregion

  //#region recreate app ts presentation files
  static recreateAppTsPresentationFiles: () => void;

  get recreateAppTsPresentationFiles(): () => void {
    return BrowserCodeCut.recreateAppTsPresentationFiles;
  }

  set recreateAppTsPresentationFiles(v) {
    BrowserCodeCut.recreateAppTsPresentationFiles = v;
  }
  //#endregion

  public readonly isLibFile: boolean;

  public readonly isAppFile: boolean;

  /**
   * from "isAppFile" file to src/lib/index.ts
   *
   * @returns something like this:  ../../../
   */
  public readonly backFromAppCode_ToSrcLibIndex: string;

  /**
   * from "isLibFile" file to src/lib/index.ts
   *
   * @returns something like this:  ../../../
   *
   */
  public readonly backFromLibCode_ToSrcLibIndex: string;

  /**
   * from "isAppFile" file to src/index.ts
   *
   * @returns something like this:  ../../../..
   *
   */
  public get backFromAppCode_ToSrcIndex(): string {
    return `${this.backFromAppCode_ToSrcLibIndex}..`;
  }

  /**
   * from "isLibFile" file to lib/index.ts
   *
   * @returns something like this:  ../../../..
   *
   */
  public get backFromLibCode_ToSrcIndex(): string {
    return `${this.backFromLibCode_ToSrcLibIndex}..`;
  }

  public get importExportsFromOrgContent(): UtilsTypescript.TsImportExport[] {
    return this.splitFileProcess?._importExports || [];
  }

  private splitFileProcess: SplitFileProcess;

  /**
   * ex. path/to/file-somewhere.ts or assets/something/here
   * in src or tmpSrcDist etc.
   */
  public readonly relativePath: string;

  private readonly isWebsqlMode: boolean;

  private readonly isAssetsFile: boolean = false;

  private readonly absoluteBackendDestFilePath: string;

  private readonly absoluteBackendEsmDestFilePath: string;

  public readonly debug: boolean = false;

  private readonly nameForNpmPackage: string;

  private readonly isTsFile: boolean;

  private readonly isComponentHtmlFile: boolean;

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
    public project: Project,
    private buildOptions: EnvOptions,
  ) {
    //#region assign initial values
    if (buildOptions.build.watch) {
      if (!this.recreateAppTsPresentationFiles) {
        this.recreateAppTsPresentationFiles = _.debounce(() => {
          this.project.framework.recreateAppTsPresentationFiles();
        }, 1000);
      }
    }

    this.nameForNpmPackage = project.nameForNpmPackage;

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

    this.isLibFile = this.relativePath.startsWith(`${libFromSrc}/`);
    this.isAppFile = !this.isLibFile;

    const howMuchBack = this.relativePath.split('/').length - 1;
    const howMuchBackIndex = howMuchBack - 1;
    this.backFromAppCode_ToSrcLibIndex =
      howMuchBack === 0
        ? './'
        : _.times(howMuchBack)
            .map(() => '../')
            .join('');

    this.backFromLibCode_ToSrcLibIndex =
      howMuchBackIndex === 0
        ? './'
        : _.times(howMuchBackIndex)
            .map(() => '../')
            .join('');

    this.debug = BrowserCodeCut.debugFiles.some(
      d => path.basename(this.relativePath) === d,
    );

    // this.debug &&
    //   console.log({
    //     backFromLibCode_ToSrcLibIndex: this.backFromLibCode_ToSrcLibIndex,
    //     backFromAppCode_ToSrcLibIndex: this.backFromAppCode_ToSrcLibIndex,
    //     backFromAppCode_ToSrcIndex: this.backFromAppCode_ToSrcIndex,
    //     backFromLibCode_ToSrcIndex: this.backFromLibCode_ToSrcIndex,
    //   });

    this.absoluteBackendDestFilePath = crossPlatformPath([
      this.project.location,
      tmpSourceDist + (buildOptions.build.prod ? prodSuffix : ''),
      this.relativePath,
    ]);

    this.absoluteBackendEsmDestFilePath = crossPlatformPath([
      this.project.location,
      tmpSourceEsmDist + (buildOptions.build.prod ? prodSuffix : ''),
      this.relativePath,
    ]);

    // console.log('RELATIVE ', this.relativePath)

    this.isWebsqlMode = this.relativePath.startsWith(
      tmpSrcDistWebsql + (buildOptions.build.prod ? prodSuffix : ''),
    );

    this.isTsFile = ['.ts', '.tsx'].includes(path.extname(this.relativePath));
    this.isComponentHtmlFile = ['.component.html', '.container.html'].some(
      ext => this.relativePath.endsWith(ext),
    );
    //#endregion
  }
  //#endregion

  //#endregion

  //#region public / methods & getters / process file
  processFile({
    fileRemovedEvent,
    regionReplaceOptions,
    isCuttableFile,
    relativeFilesToProcess,
  }: {
    fileRemovedEvent?: boolean;
    isCuttableFile: boolean;
    regionReplaceOptions: ReplaceOptionsExtended;
    relativeFilesToProcess: Map<string, boolean>;
  }) {
    //#region @backendFunc
    if (isCuttableFile) {
      this.initAndSaveCuttableFile(
        regionReplaceOptions,
        relativeFilesToProcess,
      );
    } else {
      this.initAndSaveAssetFile(fileRemovedEvent);
    }
    return this;
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / init and save cuttabl file
  private initAndSaveCuttableFile(
    options: ReplaceOptionsExtended,
    relativeFilesToProcess: Map<string, boolean>,
  ): void {
    //#region @backendFunc
    if (notAllowedToPRocess.includes(this.relativePath)) {
      return;
    }
    return this.init(relativeFilesToProcess)
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
    if (notAllowedToPRocess.includes(this.relativePath)) {
      return;
    }

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
      Helpers.removeIfExists(
        this.replaceAssetsPath(this.absoluteBackendEsmDestFilePath),
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
        HelpersTaon.copyFile(
          this.absSourcePathFromSrc,
          this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsql),
        );
        HelpersTaon.copyFile(
          this.absSourcePathFromSrc,
          this.replaceAssetsPath(this.absFileSourcePathBrowserOrWebsqlAPPONLY),
        );
        // final straight copy to tmpSourceFolder
        HelpersTaon.copyFile(
          this.absSourcePathFromSrc,
          this.replaceAssetsPath(this.absoluteBackendDestFilePath),
        );
        HelpersTaon.copyFile(
          this.absSourcePathFromSrc,
          this.replaceAssetsPath(this.absoluteBackendEsmDestFilePath),
        );
      } catch (error) {
        Helpers.warn(
          `[taon][browser-code-cut] file not found ${this.absSourcePathFromSrc}`,
        );
      }

      //#region handle po files

      if (path.extname(this.absSourcePathFromSrc) === '.po') {
        const lang = path
          .extname(path.basename(this.absSourcePathFromSrc).replace(/.po$/, ''))
          .replace(/^\./, '') as UtilsI18n.CommonLocaleCode;

        const pathToTsData = crossPlatformPath([
          path.dirname(path.dirname(this.absSourcePathFromSrc)),
          path
            .basename(this.absSourcePathFromSrc)
            .replace(/.po$/, '')
            .replace(`.${lang}`, ''),
        ]);

        // Helpers.info(`Processing ${pathToTsData}`);

        const orgContent =
          UtilsFilesFoldersSync.readFile(this.absSourcePathFromSrc) || '';

        const tsFromPo = _.first(UtilsPoFile.extractPoToJson(orgContent));
        tsFromPo.fileRelativePath = crossPlatformPath([
          pathToTsData.replace(this.project.location + '/', ''),
        ]);

        // console.log({ tsFromPo: JSON.stringify(tsFromPo), lang });
        if (
          this.project.framework.translationI18n.saveTsFileData(
            pathToTsData,
            lang,
            tsFromPo,
          )
        ) {
          Helpers.info(
            `Done rewriting ${path.basename(pathToTsData)} from .po file`,
          );
        }
      }

      //#endregion
    }
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / init
  rawOrginalContent: string;

  private readonly filesWithoutProcessing: string[] = [
    TaonGeneratedFiles.APP_HOSTS_TS,
  ];

  private init(relativeFilesToProcess: Map<string, boolean>): BrowserCodeCut {
    //#region @backendFunc

    while (true) {
      const orgContent =
        Helpers.readFile(this.absSourcePathFromSrc, void 0, true) || '';
      this.rawOrginalContent = orgContent;

      if (!this.filesWithoutProcessing.includes(this.relativePath)) {
        const allIsomorphicPackagesFromMemory =
          this.project.packagesRecognition.allIsomorphicPackagesFromMemory;

        // this.debug &&
        //   console.log({
        //     allIsomorphicPackagesFromMemory,
        //   });

        this.splitFileProcess = new SplitFileProcess(
          orgContent,
          this.absSourcePathFromSrc,
          allIsomorphicPackagesFromMemory,
          this.project.name,
          this.nameForNpmPackage,
          this,
          relativeFilesToProcess,
        );
        const {
          modifiedContent: firstPassContent,
          rewriteFile: firstTimeRewriteFileFlag,
        } = this.splitFileProcess.content;

        //#region deep check if files modyfications are correct
        if (
          config.frameworkName === tnpPackageName ||
          Helpers.getIsVerboseMode()
        ) {
          const {
            modifiedContent: secondPassContent,
            // rewriteFile: secondTimeRewriteFile,
            // importsToAppend: importsToAppendSecond,
          } = new SplitFileProcess(
            firstPassContent,
            this.absSourcePathFromSrc,
            allIsomorphicPackagesFromMemory,
            this.project.name,
            this.nameForNpmPackage,
            this,
            relativeFilesToProcess,
          ).content;

          if ((orgContent || '').trim() !== (firstPassContent || '')?.trim()) {
            if (
              firstTimeRewriteFileFlag &&
              (firstPassContent || '').trim() ===
                (secondPassContent || '').trim() // it means it is stable
            ) {
              Helpers.logInfo(`Rewrite file ${this.absSourcePathFromSrc}`);
              Helpers.writeFile(this.absSourcePathFromSrc, firstPassContent);
              continue;
            } else {
              Helpers.logError(
                `

            FRAMEWORK BUILDIER ERROR


            [${config.frameworkName}]] Unstable file modification ${this.absSourcePathFromSrc}



            `,
              );
            }
          }
        }
        //#endregion
      }

      this.rawContentForBrowser = orgContent;
      this.rawContentForAPPONLYBrowser = this.rawContentForBrowser; // TODO not needed ?
      this.rawContentBackend = this.rawContentForBrowser; // at the beginning those are normal files from src
      this.rawContentEsmBackend = this.rawContentForBrowser;
      break;
    }
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

  private get isEmptyModuleEsmBackendFile(): boolean {
    //#region @backendFunc
    return (
      (this.rawContentEsmBackend || '').replace(/\/\*\ \*\//g, '').trim()
        .length === 0
    );
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / save empty file
  private saveEmptyFile(): void {
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
    if (this.isTsFile) {
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
  private saveNormalBrowserFile(): void {
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

    if (this.isTsFile) {
      //#region handle browser/websls ts files for app or lib

      if (
        UtilsI18nHtml.isAngularTsWithInlineHtml(
          this.rawContentForAPPONLYBrowser,
        )
      ) {
        // console.log(`is Angular ts inline template (app) ${this.relativePath}`);
        this.rawContentForAPPONLYBrowser =
          UtilsI18nHtml.replaceTranslatePipieDirectiveTContext(
            this.rawContentForAPPONLYBrowser,
            { angularTsWithInlineHtml: true },
          );
      }

      if (UtilsI18nHtml.isAngularTsWithInlineHtml(this.rawContentForBrowser)) {
        // console.log(`is Angular ts inline template (lib) ${this.relativePath}`);
        this.rawContentForBrowser =
          UtilsI18nHtml.replaceTranslatePipieDirectiveTContext(
            this.rawContentForBrowser,
            { angularTsWithInlineHtml: true },
          );
      }

      //#region handle app.ts presentation files
      if (
        this.relativePath === appTsFromSrc &&
        this.recreateAppTsPresentationFiles
      ) {
        this.recreateAppTsPresentationFiles();
      }
      //#endregion

      if (
        !this.relativePath.startsWith(`${appFromSrc}/`) &&
        !this.relativePath.startsWith(`${appFromSrc}.`)
      ) {
        // #region NORMAL TS BROWSER FILE FOR LIB
        const absFileSourcePathBrowserOrWebsqlCurrent = this.project.watcher
          .isTaonLightWatcherMode
          ? UtilsFilesFoldersSync.readFile(
              this.absFileSourcePathBrowserOrWebsql,
            )
          : undefined;

        const absFileSourcePathBrowserOrWebsqlNewContent =
          this.changeNpmNameToLocalLibNamePath(
            this.rawContentForBrowser,
            this.absFileSourcePathBrowserOrWebsql,
            { isBrowser: true },
          );
        const orgContentLib = UtilsTypescript.removeCommentsFromTsContent(
          absFileSourcePathBrowserOrWebsqlCurrent,
        )?.trimEnd();
        const newContentLib = UtilsTypescript.removeCommentsFromTsContent(
          absFileSourcePathBrowserOrWebsqlNewContent,
        )?.trimEnd();
        if (
          !isFirstTimeCompilation(this.relativePath, this.buildOptions) ||
          !orgContentLib ||
          orgContentLib !== newContentLib
        ) {
          fse.writeFileSync(
            this.absFileSourcePathBrowserOrWebsql,
            absFileSourcePathBrowserOrWebsqlNewContent,
            'utf8',
          );
        }
        //#endregion
      }
      // #region NORMAL TS BROWSER FILE FOR APP
      const absFileSourcePathBrowserOrWebsqlAPPONLYCurrent = this.project
        .watcher.isTaonLightWatcherMode
        ? UtilsFilesFoldersSync.readFile(
            this.absFileSourcePathBrowserOrWebsqlAPPONLY,
          )
        : undefined;

      const absFileSourcePathBrowserOrWebsqlAPPONLYNewContent =
        this.changeNpmNameToLocalLibNamePath(
          this.rawContentForAPPONLYBrowser,
          this.absFileSourcePathBrowserOrWebsqlAPPONLY,
          { isBrowser: true, libForApp: true },
        );
      const orgContentApp = UtilsTypescript.removeCommentsFromTsContent(
        absFileSourcePathBrowserOrWebsqlAPPONLYCurrent,
      )?.trimEnd();

      const newContentApp = UtilsTypescript.removeCommentsFromTsContent(
        absFileSourcePathBrowserOrWebsqlAPPONLYNewContent,
      )?.trimEnd();

      if (
        !isFirstTimeCompilation(this.relativePath, this.buildOptions) ||
        !orgContentApp ||
        orgContentApp !== newContentApp
      ) {
        fse.writeFileSync(
          this.absFileSourcePathBrowserOrWebsqlAPPONLY,
          absFileSourcePathBrowserOrWebsqlAPPONLYNewContent,
          'utf8',
        );
      }
      //#endregion

      //#endregion
    } else {
      //#region handle other files than ts
      if (this.isComponentHtmlFile) {
        // console.log(`Fixing ${this.relativePath}`);
        this.rawContentForAPPONLYBrowser =
          UtilsI18nHtml.replaceTranslatePipieDirectiveTContext(
            this.rawContentForAPPONLYBrowser,
          );

        this.rawContentForBrowser =
          UtilsI18nHtml.replaceTranslatePipieDirectiveTContext(
            this.rawContentForBrowser,
          );
      }
      if (!this.relativePath.startsWith(`${appFromSrc}/`)) {
        // NORMAL JSON, TXT (OR ANYTHING TEXT BASED) FOR BROWSER FILE FOR LIB
        const absFileSourcePathBrowserOrWebsqlCurrent = this.project.watcher
          .isTaonLightWatcherMode
          ? UtilsFilesFoldersSync.readFile(
              this.absFileSourcePathBrowserOrWebsql,
            )
          : undefined;

        const absFileSourcePathBrowserOrWebsqlNewContent =
          this.rawContentForBrowser;

        if (
          absFileSourcePathBrowserOrWebsqlCurrent?.trimEnd() !==
          absFileSourcePathBrowserOrWebsqlNewContent.trimEnd()
        ) {
          fse.writeFileSync(
            this.absFileSourcePathBrowserOrWebsql,
            absFileSourcePathBrowserOrWebsqlNewContent,
            'utf8',
          );
        }
      }
      // NORMAL JSON, TXT (OR ANYTHING TEXT BASED) FOR BROWSER FILE FOR APP
      const absFileSourcePathBrowserOrWebsqlAPPONLYCurrent = this.project
        .watcher.isTaonLightWatcherMode
        ? UtilsFilesFoldersSync.readFile(
            this.absFileSourcePathBrowserOrWebsqlAPPONLY,
          )
        : undefined;

      let absFileSourcePathBrowserOrWebsqlAPPONLYNewContent =
        this.rawContentForAPPONLYBrowser;

      //#region handle global.scss save
      if (this.relativePath === globalScssFromSrc) {
        //#region replace tailwind import if exits
        if (
          tailwindScssImportRegex.test(
            absFileSourcePathBrowserOrWebsqlAPPONLYNewContent,
          )
        ) {
          Helpers.logInfo(`Replacing for tailwind.css`);
          absFileSourcePathBrowserOrWebsqlAPPONLYNewContent =
            absFileSourcePathBrowserOrWebsqlAPPONLYNewContent.replace(
              tailwindScssImportRegexGlobal,
              '/* tailwind import separated */\n',
            );
        } else {
          Helpers.logInfo(`Does not include tailwind.css`);
        }
        //#endregion

        //#region updatae tailwind .css
        const placesWithGlobalScss = [
          tempAppForFolder({
            websql: this.buildOptions.build.websql,
            prod: this.buildOptions.build.prod,
            electron: false,
          }),
          tempAppForFolder({
            websql: this.buildOptions.build.websql,
            prod: this.buildOptions.build.prod,
            electron: true,
          }),
        ];

        placesWithGlobalScss.forEach(tmpFolderAppsFor => {
          const tailWindFileNgProjAbsPath = crossPlatformPath([
            this.project.location,
            tmpFolderAppsFor,
            this.project.name,
            srcNgProxyProject,
            ngProjectTailwindCss,
          ]);

          if (Helpers.exists(tailWindFileNgProjAbsPath)) {
            const currentContentTailwindCss = UtilsFilesFoldersSync.readFile(
              tailWindFileNgProjAbsPath,
            );
            const newContentTailwindCss =
              this.project.quickFixes.updateTailwindCssContent(
                tailWindFileNgProjAbsPath,
                this.buildOptions,
              );
            if (
              !currentContentTailwindCss ||
              currentContentTailwindCss !== newContentTailwindCss
            ) {
              Helpers.logInfo(`Updating tailwind.css`);
              UtilsFilesFoldersSync.writeFile(
                tailWindFileNgProjAbsPath,
                newContentTailwindCss,
              );
            }
          }
        });
        //#endregion
      }
      //#endregion

      //#region handle imports.scss
      if (this.relativePath === importsHtmlFromSrc) {
        const tempPlaces = [
          tempAppForFolder({
            websql: this.buildOptions.build.websql,
            prod: this.buildOptions.build.prod,
            electron: false,
          }),
          tempAppForFolder({
            websql: this.buildOptions.build.websql,
            prod: this.buildOptions.build.prod,
            electron: true,
          }),
        ];

        tempPlaces.forEach(tmpFolderAppsFor => {
          const indexHtmlNgProjAbsPAth = crossPlatformPath([
            this.project.location,
            tmpFolderAppsFor,
            this.project.name,
            srcNgProxyProject,
            CoreNgTemplateFiles.INDEX_HTML_NG_APP,
          ]);

          if (Helpers.exists(indexHtmlNgProjAbsPAth)) {
            const currentContentIndexHtmlNgApp = UtilsFilesFoldersSync.readFile(
              indexHtmlNgProjAbsPAth,
            );
            const newContentTailwindCss =
              this.project.quickFixes.updateTaonImportMetaHead(
                currentContentIndexHtmlNgApp,
                this.rawContentForAPPONLYBrowser,
              );

            if (currentContentIndexHtmlNgApp !== newContentTailwindCss) {
              Helpers.logInfo(`Updating new index.html imports`);
              UtilsFilesFoldersSync.writeFile(
                indexHtmlNgProjAbsPAth,
                newContentTailwindCss,
              );
            }
          }
        });
      }
      //#endregion

      if (
        absFileSourcePathBrowserOrWebsqlAPPONLYCurrent?.trimEnd() !==
        absFileSourcePathBrowserOrWebsqlAPPONLYNewContent.trimEnd()
      ) {
        fse.writeFileSync(
          this.absFileSourcePathBrowserOrWebsqlAPPONLY,
          absFileSourcePathBrowserOrWebsqlAPPONLYNewContent,
          'utf8',
        );
      }

      this.fixAngularNotWatchingScssOutsideComponents();
      //#endregion
    }
    //#endregion
  }

  //#endregion

  //#region private / methods & getters / quick fix scss hot relaod
  /**
   * QUICK_FIX angular is not watching non-component for hot reaload
   * -> saving anything to src/style.scss triggers reload of css
   */
  private fixAngularNotWatchingScssOutsideComponents() {
    //#region @backendFunc
    if (!this.buildOptions.release.releaseType) {
      if (extForStyles.some(c => this.relativePath.endsWith(c))) {
        if (
          endingsStylesComponentsContainers.some(c =>
            this.relativePath.endsWith(c),
          )
        ) {
          return;
        }

        // console.log('RELOADIN STYLE.SCSS');
        [
          tmpAppsForDist,
          tmpAppsForDistWebsql,
          tmpAppsForDistElectron,
          tmpAppsForDistElectronWebsql,
        ]
          .map(c =>
            this.project.pathFor([
              c,
              this.project.name,
              srcNgProxyProject,
              ngProjectStylesScss,
            ]),
          )
          .forEach(stylesAbsPathFile => {
            let content = UtilsFilesFoldersSync.readFile(stylesAbsPathFile);
            if (content) {
              content = content
                .split('\n')
                .filter(f => !f.includes(timestampPrefixComment))
                .join('\n');

              content = `${content}\n${timestampPrefixComment} ${dateformat(new Date(), 'dd-mm-yyyy_HH:MM:ss')}`;
              UtilsFilesFoldersSync.writeFile(stylesAbsPathFile, content);
              // console.info(`Fixing ${stylesAbsPathFile}`);
            }
          });
      }
    }
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / replace regions from ts import export
  private REPLACERegionsFromTsImportExport(): BrowserCodeCut {
    //#region @backendFunc
    if (
      this.isAssetsFile ||
      this.rawOrginalContent?.trim().startsWith(taonSkipCut)
    ) {
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

      this.rawContentForBrowser = UtilsCodeCut.replaceInFile(
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

      this.rawContentBackend = UtilsCodeCut.replaceInFile(
        this.rawContentBackend,
        toReplace,
      );
      this.importExportsFromOrgContent.forEach(
        imp => delete imp.embeddedPathToFileResult,
      );
    }

    if (_.isString(this.rawContentEsmBackend)) {
      const toReplace = this.importExportsFromOrgContent.filter(imp => {
        imp.embeddedPathToFileResult = imp.wrapInParenthesis(
          imp.cleanEmbeddedPathToFile.replace(
            `/${srcFromTaonImport}`,
            `/${libEsm + prodPart}`,
          ),
        );
        return imp.isIsomorphic;
      });

      this.rawContentEsmBackend = UtilsCodeCut.replaceInFile(
        this.rawContentEsmBackend,
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
    if (
      this.isAssetsFile ||
      this.rawOrginalContent?.trim().startsWith(taonSkipCut)
    ) {
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
        () => this.project.environmentConfig.getEnvMain(),
      ).output;

      if (this.project.framework.isStandaloneProject && !this.isWebsqlMode) {
        const regionsToRemoveCjs = [
          TAGS.BROWSER,
          TAGS.WEBSQL_ONLY,
          TAGS.CJS_REMOVE,
        ];
        const regionsToRemoveEsm = [
          TAGS.BROWSER,
          TAGS.WEBSQL_ONLY,
          TAGS.ESM_REMOVE,
        ];

        // const debug =  this.relativePath.endsWith('layout-simple-small-app.component.ts');
        // if (debug ) {
        //   console.log(this.relativePath);
        //   console.log({ debugging: regionsToRemove });
        //   console.log(orgContentBackend);
        // }

        this.rawContentBackend = RegionRemover.from(
          this.absoluteBackendDestFilePath,
          this.rawContentBackend,
          regionsToRemoveCjs,
          () => this.project.environmentConfig.getEnvMain(),
          // debug
        ).output;

        this.rawContentEsmBackend = RegionRemover.from(
          this.absoluteBackendEsmDestFilePath,
          this.rawContentEsmBackend,
          regionsToRemoveEsm,
          () => this.project.environmentConfig.getEnvMain(),
          // debug
        ).output;
      }
    }

    this.rawContentForBrowser = replaceImportToAssetsIMport(
      this.rawContentForBrowser,
      this.nameForNpmPackage,
      this.relativePath,
      this.project,
    );

    return this;
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / processing asset link for app
  private processAssetsLinksForApp(): void {
    //#region @backendFunc

    this.rawContentForAPPONLYBrowser = replaceAssetsLinksForApp(
      this.rawContentForBrowser,
      this.relativePath,
      this.project,
      this.buildOptions,
    );

    //#endregion
  }
  //#endregion

  //#region private / methods & getters / save
  private save(): void {
    //#region @backendFunc
    if (this.isAssetsFile) {
      this.saveNormalBrowserFile();
      return;
    }

    if (
      !this.buildOptions.build.watch &&
      this.buildOptions.release.releaseType &&
      this.buildOptions.release.targetArtifact ===
        ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL &&
      !this.relativePath.startsWith(`${libFromSrc}/`) &&
      ![cliTsFromSrc, indexTsFromSrc].includes(this.relativePath) &&
      (this.relativePath.endsWith('.ts') || this.relativePath.endsWith('.tsx'))
    ) {
      // skip app files for release
      UtilsFilesFoldersSync.writeFile(this.absoluteBackendEsmDestFilePath, '');
      UtilsFilesFoldersSync.writeFile(this.absoluteBackendDestFilePath, '');
      UtilsFilesFoldersSync.writeFile(
        this.absFileSourcePathBrowserOrWebsql,
        '',
      );

      UtilsFilesFoldersSync.writeFile(
        this.absFileSourcePathBrowserOrWebsqlAPPONLY,
        '',
      );

      return;
    }

    // Helpers.log(`saving ismoprhic file: ${this.absoluteFilePath}`, 1)

    const backendFileSaveMode = !this.isWebsqlMode; // websql does not do anything on be

    if (this.isEmptyBrowserFile) {
      this.saveEmptyFile();
    } else {
      this.saveNormalBrowserFile();
    }

    //#region backend file save
    if (backendFileSaveMode) {
      const isFirstTimeBackendCompilation = isFirstTimeCompilation(
        this.relativePath,
        this.buildOptions,
      );

      //#region save cjs backend
      (() => {
        if (!fse.existsSync(path.dirname(this.absoluteBackendDestFilePath))) {
          fse.mkdirpSync(path.dirname(this.absoluteBackendDestFilePath));
        }
        const isFrontendFile = isBrowserFilePath(
          this.absoluteBackendDestFilePath,
          {
            skipStateService: true,
          },
        );

        if (isFrontendFile) {
          // console.log(`Ommiting for backend: ${absoluteBackendDestFilePath} `)
          return;
        }

        const absoluteBackendDestFilePathCurrent = this.project.watcher
          .isTaonLightWatcherMode
          ? UtilsFilesFoldersSync.readFile(this.absoluteBackendDestFilePath)
          : undefined;

        let absoluteBackendDestFilePathNewContent =
          this.isEmptyModuleBackendFile && this.isTsFile
            ? `export function dummy${new Date().getTime()}() { }`
            : this.changeNpmNameToLocalLibNamePath(
                this.rawContentBackend,
                this.absoluteBackendDestFilePath,
                {
                  isBrowser: false,
                },
              );

        const currentBackendFile = UtilsTypescript.removeCommentsFromTsContent(
          absoluteBackendDestFilePathCurrent,
        )?.trimEnd();
        const newBackendFile = UtilsTypescript.removeCommentsFromTsContent(
          absoluteBackendDestFilePathNewContent,
        )?.trimEnd();

        if (
          !isFirstTimeBackendCompilation ||
          !currentBackendFile ||
          currentBackendFile !== newBackendFile
        ) {
          // SAVE BACKEND FILE
          // this.debug &&
          //   console.log(
          //     `WRING CJS BACKEND ${this.absFileSourcePathBrowserOrWebsql}`,
          //   );
          fse.writeFileSync(
            this.absoluteBackendDestFilePath,
            absoluteBackendDestFilePathNewContent,
            'utf8',
          );
        }
      })();
      //#endregion

      //#region save esm backend
      (() => {
        if (isTestFile(this.relativePath)) {
          return;
        }
        if (
          !fse.existsSync(path.dirname(this.absoluteBackendEsmDestFilePath))
        ) {
          fse.mkdirpSync(path.dirname(this.absoluteBackendEsmDestFilePath));
        }

        const isFrontendFile = isBrowserFilePath(
          this.absoluteBackendEsmDestFilePath,
          {
            skipStateService: true,
          },
        );

        if (isFrontendFile) {
          // console.log(`Ommiting for backend: ${absoluteBackendDestFilePath} `)
          return;
        }

        const absoluteBackendEsmDestFilePathCurrent = this.project.watcher
          .isTaonLightWatcherMode
          ? UtilsFilesFoldersSync.readFile(this.absoluteBackendEsmDestFilePath)
          : undefined;

        let absoluteBackendEsmDestFilePathNewContent =
          this.isEmptyModuleEsmBackendFile && this.isTsFile
            ? `export function dummy${new Date().getTime()}() { }`
            : this.changeNpmNameToLocalLibNamePath(
                this.rawContentEsmBackend,
                this.absoluteBackendEsmDestFilePath,
                {
                  isBrowser: false,
                  isForEsm: true,
                },
              );

        const currentBackendEsmFile =
          UtilsTypescript.removeCommentsFromTsContent(
            absoluteBackendEsmDestFilePathCurrent,
          )?.trimEnd();
        const newBackendEsmFile = UtilsTypescript.removeCommentsFromTsContent(
          absoluteBackendEsmDestFilePathNewContent,
        )?.trimEnd();

        if (
          !isFirstTimeBackendCompilation ||
          !currentBackendEsmFile ||
          currentBackendEsmFile !== newBackendEsmFile
        ) {
          // this.debug &&
          //   console.log(
          //     `WRING ESM BACKEND ${this.absFileSourcePathBrowserOrWebsql}`,
          //   );
          // SAVE BACKEND FILE
          fse.writeFileSync(
            this.absoluteBackendEsmDestFilePath,
            absoluteBackendEsmDestFilePathNewContent,
            'utf8',
          );
        }
      })();
      //#endregion
    }
    //#endregion

    //#endregion
  }
  //#endregion

  //#region private / methods & getters / production namespaces split
  private static initialWarning = {};

  get initialWarnings(): any {
    return BrowserCodeCut.initialWarning;
  }

  //#endregion

  //#region private / methods & getters / change content before saving file
  private changeNpmNameToLocalLibNamePath(
    content: string,
    absFilePath: string,
    options: {
      isBrowser: boolean;
      libForApp?: boolean;
      isForEsm?: boolean;
    },
  ): string {
    //#region @backendFunc

    if (!absFilePath.endsWith('.ts')) {
      if (absFilePath.endsWith('.tsx')) {
        // ok
      } else {
        // console.log(`NOT_FIXING: ${absFilePath}`)
        return content;
      }
    }

    // this.debug && console.log('-------------START----------------');
    // const typeOfOp = options.isBrowser
    //   ? this.buildOptions.build.websql
    //     ? 'WEBSQL CODE TRANSFORM'
    //     : 'BROWSER CODE TRANSFORM'
    //   : 'BACKEND CODE TRANSFORM';

    // this.debug &&
    //   console.log({
    //     ...options,
    //     typeOfOp,
    //   });

    // this.debug &&
    //   console.log(`

    //   relativePath: ${this.relativePath}
    //   isLibFile: ${isLibFile}

    //   `);

    // if (this.debug) {
    //   console.log(`Fixing imports in: ${absFilePath}`);
    //   console.log(`Fixing imports in: ${this.relativePath}`);
    // }

    const projectOwnSmartPackages = this.projectOwnSmartPackages;
    const { isBrowser } = options;

    let toReplace: UtilsTypescript.TsImportExport[] = [];

    if (isBrowser) {
      //#region handle browser
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
      //#endregion
    } else {
      //#region handle backend
      toReplace = UtilsTypescript.recognizeImportsFromContent(
        options.isForEsm ? this.rawContentEsmBackend : this.rawContentBackend,
      ).filter(f => {
        // this.debug &&
        //   console.log('f.cleanEmbeddedPathToFile', f.cleanEmbeddedPathToFile);

        const fpkgBackend = f.cleanEmbeddedPathToFile
          .replace(
            new RegExp(
              Utils.escapeStringForRegEx(`/${libFromImport + prodSuffix}`) +
                '$',
            ),
            '',
          )
          .replace(
            new RegExp(
              Utils.escapeStringForRegEx(`/${libEsmFromImport + prodSuffix}`) +
                '$',
            ),
            '',
          )
          .replace(
            new RegExp(
              Utils.escapeStringForRegEx(`/${libEsmFromImport}`) + '$',
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
      //#endregion
    }

    this.handleIllegalImports({
      toReplace,
    });
    content = UtilsCodeCut.replaceInFile(content, toReplace);
    // this.debug && console.log('-------------END----------------');
    return content;
    //#endregion
  }
  //#endregion

  //#region private / methods & getters / handle illegal imports
  private handleIllegalImports({
    toReplace,
  }: {
    toReplace: UtilsTypescript.TsImportExport[];
  }) {
    //#region @backendFunc
    // this.debug && console.log('to replace ', JSON.stringify(toReplace));

    for (const imp of toReplace) {
      //#region handle stuff from /src/lib
      const cleanName = getCleanImport(imp.cleanEmbeddedPathToFile);

      // this.debug && console.log({ cleanName });

      if (this.isLibFile) {
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
          if (!isTestFile(this.relativePath)) {
            Helpers.warn(
              `(illegal import ${chalk.bold(`${cleanName}/${srcFromTaonImport}`)})` +
                ` Use relative path: ./${crossPlatformPath([srcMainProject, this.relativePath])}:${indexInIfile + 1}`,
            );
          }

          this.initialWarnings[key] = true;
        }
      }

      const resultToReplace = `${
        this.isLibFile
          ? this.backFromLibCode_ToSrcLibIndex
          : this.backFromAppCode_ToSrcLibIndex
      }${indexTsFromLibFromSrc.replace('.tsx', '').replace('.ts', '')}`;
      const wrapperResultToReplace = imp.wrapInParenthesis(resultToReplace);
      // console.log({ resultToReplace, wrapperResultToReplace });

      imp.embeddedPathToFileResult = wrapperResultToReplace;
      //#endregion
    }
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
