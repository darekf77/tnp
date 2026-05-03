//#region imports
import { ChangeOfFile } from 'incremental-compiler/src';
import { Level, Log } from 'ng2-logger/src';
import {
  config,
  dateformat,
  folderName,
  LibTypeEnum,
  PREFIXES,
  taonPackageName,
  tnpPackageName,
  Utils,
  UtilsFilesFoldersSync,
} from 'tnp-core/src';
import { crossPlatformPath, glob, path, _, fse } from 'tnp-core/src';
import { fileName } from 'tnp-core/src';
import { BaseCompilerForProject, Helpers, HelpersTaon } from 'tnp-helpers/src';

import {
  assetsFromNpmPackage,
  assetsFromSrc,
  browserMainProject,
  dirnameFromSourceToProject,
  distFromNgBuild,
  distMainProject,
  distNoCutSrcMainProject,
  indexDtsMainProject,
  indexDtsNpmPackage,
  nodeModulesMainProject,
  packageJsonMainProject,
  packageJsonNpmLib,
  prodSuffix,
  projectsFromNgTemplate,
  sharedFromAssets,
  sourceLinkInNodeModules,
  srcJSFromNpmPackage,
  srcMainProject,
  TaonVerifiedBuild,
  THIS_IS_GENERATED_INFO_COMMENT,
  tmpAlreadyStartedCopyManager,
  tmpLibsForDist,
  tmpLocalCopytoProjDist,
  tmpSourceDist,
  tmpSrcDist,
  tmpSrcDistWebsql,
  TO_REMOVE_TAG,
  VERIFIED_BUILD_DATA,
  websqlMainProject,
  whatToLinkFromCore,
} from '../../../../../../constants';
import {
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../../../options';
import type { Project } from '../../../../project';

import { SourceMappingUrl } from './source-maping-url';
import { TypescriptDtsFixer } from './typescript-dts-fixer';
//#endregion

const log = Log.create('Base copy manager', Level.WARN, Level.ERROR);

const REPLACE_INDEX_D_TS_IN_DEST_WHEN_WATCH = false;

export interface BaseCopyMangerInitialParams {
  // TOOD this does not work
  skipCopyDistToLocalTempProject?: boolean;
}

export class CopyManagerStandalone extends BaseCompilerForProject<
  BaseCopyMangerInitialParams,
  // @ts-ignore TODO weird inheritance problem
  Project
> {
  //#region fields
  dtsFixer: TypescriptDtsFixer;

  isStartFromScratch: boolean = true;

  public _isomorphicPackages = [] as string[];

  protected buildOptions: EnvOptions;

  protected copyto: Project[] = [];

  protected renameDestinationFolder?: string;

  updateTriggered = _.debounce(() => {
    Helpers.log(`[copy-manager] update triggered`);
  }, 1000);

  protected async selectAllProjectCopyto() {
    //#region  @backendFunc
    const containerCoreProj = this.project.framework.coreContainer;

    const independentProjects = [containerCoreProj];

    if (
      config.frameworkName === tnpPackageName &&
      this.project.name !== tnpPackageName
    ) {
      // tnp in tnp is not being used at all
      independentProjects.push(this.project.ins.Tnp);
    }

    this.copyto = [...independentProjects];
    // console.log(this.copyto.map(c => 'COPYTO ' + c.nodeModules.path))
    //#endregion
  }

  protected readonly notAllowedFiles: string[] = [
    '.DS_Store',
    // fileName.index_d_ts,
  ];

  protected browserwebsqlFolders: string[];

  protected sourceFoldersToRemoveFromNpmPackage: string[];

  //#endregion

  //#region getters

  //#region getters / source path to link

  get sourcePathToLink(): string {
    //#region @backendFunc
    const sourceToLink = crossPlatformPath([
      this.project.location,
      whatToLinkFromCore,
    ]);
    return sourceToLink;
    //#endregion
  }
  //#endregion

  //#region getters / local temp proj path
  get localTempProj() {
    //#region @backendFunc
    let localProj = this.project.ins.From(this.localTempProjPath) as Project;
    return localProj;
    //#endregion
  }
  //#endregion

  //#region getters / project to copy to
  /**
   * when building from scratch:
   * taon - uses ~/.taon/taon-containers/container-vXX
   * tnp - uses ../taon-containers/container-vXX
   *
   * but when tnp is in deep refactor I need to use taon to build tnp
   * and force taon to recognize core container from node_modules link
   * inside project (instead normally from taon.json[frameworkVersion] property)
   */
  get projectToCopyTo() {
    //#region @backendFunc

    let result: Project[] = [];

    const isTaonProdCli = taonPackageName === config.frameworkName;

    //#region resolve all possible project for package distribution
    let projectForNodeModulesPkgUpdate: Project[] = [
      this.project.ins.by(
        LibTypeEnum.CONTAINER,
        this.project.framework.frameworkVersion,
      ),
      this.project.framework.coreContainer,
    ];
    //#endregion

    projectForNodeModulesPkgUpdate.push(this.project.tnpCurrentCoreContainer);
    projectForNodeModulesPkgUpdate = projectForNodeModulesPkgUpdate.filter(
      f => !!f,
    );

    if (
      isTaonProdCli &&
      this.project.framework.isLinkToNodeModulesDifferentThanCoreContainer
    ) {
      try {
        const possibleTnpLocation = crossPlatformPath(
          dirnameFromSourceToProject(
            this.project.pathFor([
              nodeModulesMainProject,
              tnpPackageName,
              sourceLinkInNodeModules,
            ]),
          ),
        );
        const tnpProject = this.project.ins.From(possibleTnpLocation);
        if (tnpProject) {
          projectForNodeModulesPkgUpdate.push(tnpProject);
        }
      } catch (error) {}
    }

    if (this.project.taonJson.isUsingOwnNodeModulesInsteadCoreContainer) {
      projectForNodeModulesPkgUpdate.push(this.project);
    }

    if (Array.isArray(this.copyto) && this.copyto.length > 0) {
      result = [
        this.localTempProj,
        ...this.copyto,
        ...projectForNodeModulesPkgUpdate,
      ] as Project[];
    } else {
      result = [this.localTempProj, ...projectForNodeModulesPkgUpdate];
    }

    return Utils.uniqArray<Project>(result, 'location' as keyof Project);
    //#endregion
  }
  //#endregion

  //#region getters / isomorphic pacakges
  get isomorphicPackages() {
    //#region @backendFunc
    const isomorphicPackages = [
      ...this._isomorphicPackages,
      this.rootPackageName,
    ];
    return isomorphicPackages;
    //#endregion
  }
  //#endregion

  //#endregion

  //#region async action
  async asyncAction(event: ChangeOfFile): Promise<void> {
    //#region @backendFunc
    const absoluteFilePath = crossPlatformPath(event.fileAbsolutePath);
    // console.log('async event '+ absoluteFilePath)
    this.contentReplaced(absoluteFilePath);

    SourceMappingUrl.fixContent(absoluteFilePath, this.buildOptions);

    let specificFileRelativePath: string;
    let absoluteAssetFilePath: string;
    if (absoluteFilePath.startsWith(this.monitoredOutDir)) {
      specificFileRelativePath = absoluteFilePath.replace(
        this.monitoredOutDir + '/',
        '',
      );
    } else {
      absoluteAssetFilePath = absoluteFilePath;
    }

    const projectToCopyTo = this.projectToCopyTo;

    // Helpers.log(`ASYNC ACTION
    // absoluteFilePath: ${absoluteFilePath}
    // specificFileRelativePath: ${specificFileRelativePath}
    // `);

    //     Helpers.log(`
    //     copyto project:
    // ${projectToCopyTo.map(p => p.location).join('\n')}

    //     `)

    for (let index = 0; index < projectToCopyTo.length; index++) {
      const projectToCopy = projectToCopyTo[index];
      this._copyBuildedDistributionTo(projectToCopy, {
        absoluteAssetFilePath,
        specificFileRelativePath: event && specificFileRelativePath,
        outDir: distFromNgBuild,
        event,
      });
    }
    this.updateTriggered();
    //#endregion
  }
  //#endregion

  //#region sync action
  async syncAction(
    files: string[],
    initialParams: BaseCopyMangerInitialParams,
  ): Promise<void> {
    //#region @backendFunc

    if (
      this.project.hasFile(tmpAlreadyStartedCopyManager) &&
      this.project.readFile(tmpAlreadyStartedCopyManager) === '-'
    ) {
      // @ts-ignore
      this.isStartFromScratch = false;
    } else {
      this.project.writeFile(tmpAlreadyStartedCopyManager, '-');
      // @ts-ignore
      this.isStartFromScratch = true;
    }

    for (const fileAbsPath of files) {
      this.contentReplaced(fileAbsPath);
    }

    const projectToCopyTo = this.projectToCopyTo;
    if (initialParams?.skipCopyDistToLocalTempProject) {
      projectToCopyTo.splice(
        projectToCopyTo.findIndex(
          p => p.location === this.localTempProj.location,
        ),
        1,
      );
    }

    // (${proj.location}/${folderName.node_modules}/${this.rootPackageName})

    if (projectToCopyTo.length > 0) {
      const porjectINfo =
        projectToCopyTo.length === 1
          ? `project "${(_.first(projectToCopyTo as any) as Project).name}"`
          : `all ${projectToCopyTo.length} projects`;

      log.info(
        `From now... ${porjectINfo} will be updated after every change...`,
      );

      Helpers.info(`[buildable-project] copying compiled code/assets to ${
        projectToCopyTo.length
      } other projects...
${projectToCopyTo.map(proj => `- ${proj.location}`).join('\n')}
      `);
    }

    for (let index = 0; index < projectToCopyTo.length; index++) {
      const projectToCopy = projectToCopyTo[index];
      log.data(`copying to ${projectToCopy?.name}`);
      this._copyBuildedDistributionTo(projectToCopy, {
        outDir: distFromNgBuild,
      });
      // if (this.buildOptions.buildForRelease && !global.tnpNonInteractive) {
      //   Helpers.info('Things copied to :' + projectToCopy?.name);
      //   if (!(await Helpers.consoleGui.question.yesNo('Is there everywthing ok with build ?'))) {
      //     process.exit(0)
      //   }
      // }
      log.data('copy done...');
    }
    if (this.isStartFromScratch) {
      this.isStartFromScratch = false;
    }
    this.updateTriggered();
    //#endregion
  }
  //#endregion

  //#region content replace
  /**
   * @returns if trus - skip futher processing
   */
  protected contentReplaced(fileAbsolutePath: string): void {
    //#region @backendFunc
    // console.log('processing', fileAbsolutePath);
    if (
      !(
        fileAbsolutePath.endsWith('.js') ||
        fileAbsolutePath.endsWith('.js.map') ||
        fileAbsolutePath.endsWith('.mjs') ||
        fileAbsolutePath.endsWith('.mjs.map')
      )
    ) {
      return;
    }
    let contentOrg = Helpers.readFile(fileAbsolutePath) || '';
    const newContent = contentOrg.replace(
      new RegExp(Utils.escapeStringForRegEx(TO_REMOVE_TAG), 'g'),
      '',
    );
    if (newContent && contentOrg && newContent !== contentOrg) {
      Helpers.writeFile(fileAbsolutePath, newContent);
      // console.log(`[copy-manager] content replaced in ${fileAbsolutePath}`);
    }
    //#endregion
  }
  //#endregion

  //#region copy to builded distribution
  public copyBuildedDistributionTo(destination: Project) {
    //#region @backendFunc
    return this._copyBuildedDistributionTo(destination);
    //#endregion
  }

  /**
   * There are 3 typese of --copyto build
   * 1. dist build (wihout source maps buit without links)
   * 2. dist build (with source maps and links) - when no buildOptions
   * 3. same as 2 buit with watch
   */
  protected _copyBuildedDistributionTo(
    destination: Project,
    options?: {
      absoluteAssetFilePath?: string;
      specificFileRelativePath?: string;
      outDir?: string;
      event?: any;
    },
  ) {
    //#region @backendFunc

    //#region init & prepare parameters
    const {
      specificFileRelativePath = void 0,
      absoluteAssetFilePath = void 0,
    } = options || {};

    // if (!specificFileRelativePath) {
    //   debugger
    //   Helpers.warn(`Invalid project: ${destination?.name}`)
    //   return;
    // }
    if (!destination || !destination?.location) {
      Helpers.warn(`Invalid project: ${destination?.name}`);
      return;
    }

    const isTempLocalProj = destination.location === this.localTempProjPath;

    if (!specificFileRelativePath) {
      this.initalFixForDestination(destination);
    }

    const allFolderLinksExists = !this.buildOptions.build.watch
      ? true
      : this.linksForPackageAreOk(destination);

    // if(specificFileRelativePath) {
    //   Helpers.log(`[${destination?.name}] Specyfic file change (allFolderLinksExists=${allFolderLinksExists}) (event:${event})`
    //   + ` ${outDir}${specificFileRelativePath}`);
    // }
    //#endregion

    if (
      (specificFileRelativePath || absoluteAssetFilePath) &&
      allFolderLinksExists
    ) {
      // Helpers.log(`handle ${specificFileRelativePath || absoluteAssetFilePath}`);
      if (absoluteAssetFilePath) {
        this.handleCopyOfAssetFile(absoluteAssetFilePath, destination);
      } else {
        //#region handle single file

        this.handleCopyOfSingleFile(
          destination,
          isTempLocalProj,
          specificFileRelativePath,
        );
        if (
          REPLACE_INDEX_D_TS_IN_DEST_WHEN_WATCH &&
          this.buildOptions.build.watch &&
          specificFileRelativePath.endsWith('/index.d.ts')
        ) {
          // TODO could be limited more
          this.replaceIndexDtsForEntryProjectIndex(destination);
        }
        //#endregion
      }
    } else {
      //#region handle all files
      // Helpers.log('copying all files');
      this.copyCompiledSourcesAndDeclarations(destination, isTempLocalProj);

      log.d('copying surce maps');
      this.copySourceMaps(destination, isTempLocalProj);
      this.copySharedAssets(destination, isTempLocalProj);

      this.removeSourceSymlinks(destination);
      this.addSourceSymlinks(destination);

      this.updateBackendFullDtsFiles(destination);
      this.updateBackendFullDtsFiles(this.monitoredOutDir);

      if (
        REPLACE_INDEX_D_TS_IN_DEST_WHEN_WATCH &&
        this.buildOptions.build.watch
      ) {
        this.replaceIndexDtsForEntryProjectIndex(destination);
      }

      this.addSrcJSToDestination(destination);

      //#region copy/link package.json
      const destPackageInNodeModules = destination.pathFor([
        nodeModulesMainProject,
        this.rootPackageName,
      ]);

      const packageJsonInDest = crossPlatformPath([
        destPackageInNodeModules,
        packageJsonNpmLib,
      ]);

      // console.log(`[copy-manager]

      //   copying package.json "${packageJsonInDest}"

      //   `);

      try {
        fse.unlinkSync(packageJsonInDest);
      } catch (e) {}
      if (this.isWatchCompilation && !isTempLocalProj) {
        Helpers.createSymLink(
          this.project.pathFor(packageJsonMainProject),
          packageJsonInDest,
        );
      } else {
        HelpersTaon.copyFile(
          this.project.pathFor(packageJsonMainProject),
          packageJsonInDest,
        );
        // for (
        //   let index = 0;
        //   index < CopyMangerHelpers.browserwebsqlFolders.length;
        //   index++
        // ) {
        //   const currentBrowserFolder =
        //     CopyMangerHelpers.browserwebsqlFolders[index];
        //   const borwserOrWebsqlFolder = crossPlatformPath([
        //     destPackageInNodeModules,
        //     currentBrowserFolder,
        //     packageJsonNpmLib,
        //   ]);
        //   console.log(`[copy-manager]

        // copying package.json to "${borwserOrWebsqlFolder}"

        // `);
        // }
      }
      //#endregion

      // TODO not working werid tsc issue with browser/index
      // {const projectOudBorwserSrc = path.join(destination.location,
      //   folderName.node_modules,
      //   rootPackageName,
      //   fileName.package_json
      // );
      // const projectOudBorwserDest = path.join(destination.location,
      //   folderName.node_modules,
      //   rootPackageName,
      //   folderName.browser,
      //   fileName.package_json
      // );
      // HelpersTaon.copyFile(projectOudBorwserSrc, projectOudBorwserDest);}
      //#endregion
    }
    //#endregion
  }
  //#endregion

  //#region get browser websql folders
  getBrowserwebsqlFolders(): string[] {
    // const isProd = this.buildOptions.build.prod;
    return [
      browserMainProject,
      websqlMainProject,
      browserMainProject + prodSuffix,
      websqlMainProject + prodSuffix,
    ];
  }
  //#endregion

  //#region init
  public init(buildOptions: EnvOptions, renameDestinationFolder?: string) {
    //#region @backendFunc
    this.buildOptions = buildOptions;
    this.renameDestinationFolder = renameDestinationFolder;
    this.browserwebsqlFolders = this.getBrowserwebsqlFolders();

    this.sourceFoldersToRemoveFromNpmPackage = [
      srcMainProject,
      sourceLinkInNodeModules,
      nodeModulesMainProject,
      tmpSrcDist,
      tmpSrcDist + prodSuffix,
      tmpSrcDistWebsql,
      tmpSrcDistWebsql + prodSuffix,
      ...this.browserwebsqlFolders.map(currentBrowserFolder => {
        // TODO not needed?
        return crossPlatformPath([currentBrowserFolder, srcMainProject]);
      }),
    ];

    this.selectAllProjectCopyto();

    if (!Array.isArray(this.copyto)) {
      this.copyto = [];
    }

    if (this.copyto.length === 0) {
      Helpers.log(
        `No need to --copyto on build finish...(only copy to local temp proj) `,
      );
    }

    // console.log('this.copyto', this.copyto);

    this._isomorphicPackages =
      this.project.packagesRecognition.allIsomorphicPackagesFromMemory;

    Helpers.log(
      `Operating on ${this.isomorphicPackages.length} isomorphic packages...`,
    );
    this.recreateTempProj();

    const files = Helpers.filesFrom(this.monitoredOutDir, true).filter(f =>
      f.endsWith('.js'),
    );

    for (let index = 0; index < files.length; index++) {
      const fileAbsPath = files[index];
      SourceMappingUrl.fixContent(fileAbsPath, buildOptions);
    }
    this.dtsFixer = TypescriptDtsFixer.for(this.isomorphicPackages);

    this.initWatching();
    //#endregion
  }
  //#endregion

  //#region replace d.ts files in destination after copy
  addSrcJSToDestination(destination: Project) {
    //#region @backendFunc
    const location = destination.nodeModules.pathFor([
      this.rootPackageName,
      srcJSFromNpmPackage,
    ]);
    Helpers.writeFile(
      location,
      `"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./lib"), exports);
//# sourceMappingURL=index.js.map

      `,
    );
    //#endregion
  }
  //#endregion

  //#region links ofr packages are ok
  linksForPackageAreOk(destination: Project): boolean {
    //#region @backendFunc
    const destPackageLinkSourceLocation = destination.pathFor([
      nodeModulesMainProject,
      this.rootPackageName,
      sourceLinkInNodeModules,
    ]);
    // console.log({ destPackageLinkSourceLocation });

    return Helpers.exists(destPackageLinkSourceLocation);
    //#endregion
  }
  //#endregion

  //#region recreate temp proj
  recreateTempProj() {
    //#region @backendFunc
    try {
      // QUICK_FIX remove old temp proj
      fse.unlinkSync(
        crossPlatformPath([
          this.project.framework.tmpLocalProjectFullPath,
          packageJsonNpmLib,
        ]),
      );
    } catch (error) {}
    Helpers.removeSymlinks(this.localTempProjPath); // QUICK_FIX remove symlinks
    Helpers.remove(this.localTempProjPath);
    Helpers.writeFile([this.localTempProjPath, packageJsonNpmLib], {
      name: path.basename(this.localTempProjPath),
      version: '0.0.0',
    });
    Helpers.mkdirp([this.localTempProjPath, nodeModulesMainProject]);
    //#endregion
  }
  //#endregion

  //#region init watching
  initWatching() {
    //#region @backendFunc
    const monitoredOutDir = this.monitoredOutDir;
    const monitoredOutDirSharedAssets = this.monitoredOutDirSharedAssets;

    this.initOptions({
      folderPath: [monitoredOutDir, ...monitoredOutDirSharedAssets],
      folderPathContentCheck: [monitoredOutDir],
      taskName: 'CopyManager',
    });
    //#endregion
  }
  //#endregion

  //#region local temp proj path
  get localTempProjPath() {
    //#region @backendFunc
    return this.project.pathFor(tmpLocalCopytoProjDist);
    //#endregion
  }
  //#endregion

  //#region root package name
  /**
   * first folder in node_modules for packge
   * example:
   * project/node_modules/<rootPackageName> # like 'ng2-rest' or '@angular'
   */
  get rootPackageName() {
    //#region @backendFunc
    const rootPackageName =
      _.isString(this.renameDestinationFolder) &&
      this.renameDestinationFolder !== ''
        ? this.renameDestinationFolder
        : this.project.nameForNpmPackage;

    return rootPackageName;
    //#endregion
  }
  //#endregion

  //#region monitored out dir
  get monitoredOutDir(): string {
    //#region @backendFunc
    return this.project.pathFor(distMainProject);
    //#endregion
  }

  get monitoredOutDirSharedAssets(): string[] {
    //#region @backendFunc
    const monitorDir = this.project.pathFor([
      srcMainProject,
      assetsFromSrc,
      sharedFromAssets,
    ]);
    return [monitorDir];
    //#endregion
  }
  //#endregion

  //#region initial fix for destination pacakge
  initalFixForDestination(destination: Project): void {
    //#region @backendFunc

    const destPackageInNodeModules = destination.pathFor([
      nodeModulesMainProject,
      this.rootPackageName,
    ]);

    if (this.isStartFromScratch) {
      Helpers.logInfo(
        `[copy-manager] Removing dest: ${destPackageInNodeModules}`,
      );
      Helpers.remove(destPackageInNodeModules);
    }

    for (let index = 0; index < this.browserwebsqlFolders.length; index++) {
      const currentBrowserFolder = this.browserwebsqlFolders[index];
      const destPackageInNodeModulesBrowser = crossPlatformPath(
        path.join(destPackageInNodeModules, currentBrowserFolder),
      );

      if (Helpers.isSymlinkFileExitedOrUnexisted(destPackageInNodeModules)) {
        Helpers.removeFileIfExists(destPackageInNodeModules);
      }
      if (!Helpers.exists(destPackageInNodeModules)) {
        Helpers.mkdirp(destPackageInNodeModules);
      }
      if (
        Helpers.isSymlinkFileExitedOrUnexisted(destPackageInNodeModulesBrowser)
      ) {
        Helpers.removeFileIfExists(destPackageInNodeModulesBrowser);
      }
      if (!Helpers.exists(destPackageInNodeModulesBrowser)) {
        Helpers.mkdirp(destPackageInNodeModulesBrowser);
      }
    }
    //#endregion
  }
  //#endregion

  //#region fix map files
  changedJsMapFilesInternalPathesForDebug(
    content: string,
    isBrowser: boolean,
    isForLaunchJsonDebugging: boolean,
    absFilePath: string,
    releaseType: ReleaseType,
  ): string {
    //#region @backendFunc
    if (
      !content ||
      (!absFilePath.endsWith('.js.map') && !absFilePath.endsWith('.mjs.map'))
    ) {
      // Helpers.warn(`[copytomanager] Empty content for ${absFilePath}`);
      return content;
    }

    // prod not need for debugging
    let toReplaceString2 = isBrowser
      ? `../${tmpLibsForDist}/${this.project.name}` +
        `/${projectsFromNgTemplate}/${this.project.name}/${srcMainProject}`
      : `../${tmpSourceDist}`;

    let toReplaceString1 = `"${toReplaceString2}`;

    if (isBrowser) {
      // TODO is angular maps not working in chrome debugger
      // content = content.replace(regex1, `"./${folderName.src}`);
      // content = content.replace(regex2, folderName.src);
    } else {
      if (isForLaunchJsonDebugging) {
        const regex2 = new RegExp(
          Utils.escapeStringForRegEx(toReplaceString2),
          'g',
        );
        content = content.replace(regex2, `../${srcMainProject}`);
      } else {
        const regex1 = new RegExp(
          Utils.escapeStringForRegEx(toReplaceString1),
          'g',
        );
        const regex2 = new RegExp(
          Utils.escapeStringForRegEx(toReplaceString2),
          'g',
        );
        content = content.replace(regex1, `"./${srcMainProject}`);
        content = content.replace(regex2, srcMainProject);
      }
    }

    content = this.sourceMapContentFix(
      content,
      isBrowser,
      absFilePath,
      releaseType,
    );

    return content;
    //#endregion
  }
  //#endregion

  //#region source map content fix
  sourceMapContentFix(
    content: string,
    isBrowser: boolean,
    absFilePath: string,
    releaseType: ReleaseType,
  ) {
    //#region @backendFunc
    /**
     * QUICK_FIX backend debugging on window
     * (still third party debug does not work)
     */
    if (
      // process.platform === 'win32' &&
      !isBrowser
    ) {
      const json = JSON.parse(content);
      if (json) {
        json.sources = (json.sources || []).map((p: string) => {
          if (releaseType) {
            return '';
          }

          const localProjFolderName = `${tmpLocalCopytoProjDist}/${nodeModulesMainProject}/${this.rootPackageName}`;

          let dirnameAbs = crossPlatformPath(path.dirname(absFilePath));
          if (dirnameAbs.includes(localProjFolderName)) {
            dirnameAbs = dirnameAbs.replace(
              `/${this.project.name}/${localProjFolderName}`,
              `/${this.project.name}/`,
            );
          }

          const resolved = crossPlatformPath(
            path.resolve(
              dirnameAbs,
              p.startsWith('./') ? p.replace('./', '') : p,
            ),
          );
          // const resolved = crossPlatformPath(path.resolve(p));
          // console.log({
          //   resolved,
          //   dirnameAbs,
          //   p
          // });
          return resolved;
        });
      }
      content = JSON.stringify(json);
    }
    return content;
    //#endregion
  }
  //#endregion

  //#region remove source folder links
  removeSourceLinksFolders(pkgLocInDestNodeModules: string) {
    //#region @backendFunc
    this.sourceFoldersToRemoveFromNpmPackage.forEach(sourceFolder => {
      const toRemoveLink = crossPlatformPath(
        path.join(pkgLocInDestNodeModules, sourceFolder),
      );
      if (Helpers.isSymlinkFileExitedOrUnexisted(toRemoveLink)) {
        Helpers.remove(
          crossPlatformPath(path.join(pkgLocInDestNodeModules, sourceFolder)),
          true,
        );
      }
    });
    //#endregion
  }
  //#endregion

  //#region copy shared assets
  copySharedAssets(destination: Project, isTempLocalProj: boolean) {
    //#region @backendFunc
    const monitoredOutDirSharedAssets = this.monitoredOutDirSharedAssets;
    for (let index = 0; index < monitoredOutDirSharedAssets.length; index++) {
      const sharedAssetsPath = monitoredOutDirSharedAssets[index];
      const dest = destination.nodeModules.pathFor(
        `${
          this.project.framework.isStandaloneProject
            ? this.rootPackageName
            : `${this.rootPackageName}/${path.basename(
                path.dirname(path.dirname(path.dirname(sharedAssetsPath))),
              )}`
        }/${assetsFromSrc}/${sharedFromAssets}`,
      );

      HelpersTaon.copy(sharedAssetsPath, dest, {
        copySymlinksAsFiles: true,
        overwrite: true,
        recursive: true,
      });
    }
    //#endregion
  }
  //#endregion

  //#region copy compiled sources and declarations
  copyCompiledSourcesAndDeclarations(
    destination: Project,
    isTempLocalProj: boolean,
  ) {
    //#region @backendFunc
    const monitorDir = isTempLocalProj //
      ? this.monitoredOutDir // other package are getting data from temp-local-projecg
      : this.localTempProj.nodeModules.pathFor(this.rootPackageName);

    if (isTempLocalProj) {
      // when destination === tmpLocalCopytoProjDist => fix d.ts imports in (dist)
      this.dtsFixer.processFolderWithBrowserWebsqlFolders(
        monitorDir,
        this.browserwebsqlFolders,
      );
    }

    //#region final copy from dist to node_moules/rootpackagename
    const pkgLocInDestNodeModules = destination.nodeModules.pathFor(
      this.rootPackageName,
    );
    const filter = HelpersTaon.filterDontCopy(
      this.sourceFoldersToRemoveFromNpmPackage,
      monitorDir,
    );

    // TODO QUIKC_FIX
    try {
      this.removeSourceLinksFolders(pkgLocInDestNodeModules);
      UtilsFilesFoldersSync.copyFolder(monitorDir, pkgLocInDestNodeModules, {
        copySymlinksAsFiles: false,
        filter,
      });
    } catch (error) {
      Helpers.remove(pkgLocInDestNodeModules);
      UtilsFilesFoldersSync.copyFolder(monitorDir, pkgLocInDestNodeModules, {
        copySymlinksAsFiles: false,
        filter,
      });
    }

    //#endregion

    //#endregion
  }
  //#endregion

  //#region replace d.ts files in destination after copy
  replaceIndexDtsForEntryProjectIndex(destination: Project) {
    //#region @backendFunc
    const location = destination.nodeModules.pathFor([
      this.rootPackageName,
      indexDtsNpmPackage,
    ]);
    Helpers.writeFile(location, `export * from './${srcMainProject}';\n`);
    //#endregion
  }
  //#endregion

  //#region add source symlinks
  addSourceSymlinks(destination: Project) {
    //#region @backendFunc
    const source = crossPlatformPath([
      destination.nodeModules.pathFor(this.rootPackageName),
      sourceLinkInNodeModules,
    ]);

    const srcDts = crossPlatformPath([
      destination.nodeModules.pathFor(this.rootPackageName),
      'src.d.ts',
    ]);

    Helpers.removeIfExists(source);
    Helpers.createSymLink(this.sourcePathToLink, source);

    Helpers.writeFile(
      srcDts,
      `
${THIS_IS_GENERATED_INFO_COMMENT}
export * from './source';
${THIS_IS_GENERATED_INFO_COMMENT}
// please use command: taon build:watch to see here links for your globally builded lib code files
${THIS_IS_GENERATED_INFO_COMMENT}
            `.trimStart(),
    );

    const verifyBuild = crossPlatformPath([
      destination.nodeModules.pathFor(this.rootPackageName),
      VERIFIED_BUILD_DATA,
    ]);

    if (
      this.buildOptions.build.watch ||
      (!this.buildOptions.build.watch && !this.buildOptions.build.prod)
    ) {
      Helpers.removeFileIfExists(verifyBuild);
    } else {
      if (
        this.buildOptions.build.prod ||
        this.buildOptions.release.releaseType
      ) {
        try {
          const lastCommitDate = this.project.git.lastCommitDate();
          Helpers.writeJsonC(verifyBuild, {
            commitHash: this.project.git.lastCommitHash() || '',
            commitName: this.project.git.lastCommitMessage() || '',
            commitDate: lastCommitDate
              ? dateformat(lastCommitDate, 'dd-mm-yyyy HH:MM:ss')
              : void 0,
          } as TaonVerifiedBuild);
        } catch (error) {}
      }
    }

    //#endregion
  }
  //#endregion

  //#region remove source symlinks
  removeSourceSymlinks(destination: Project) {
    //#region @backendFunc
    const srcDts = crossPlatformPath([
      destination.nodeModules.pathFor(this.rootPackageName),
      'src.d.ts',
    ]);

    Helpers.writeFile(
      srcDts,
      `
${THIS_IS_GENERATED_INFO_COMMENT}
export * from './source';
${THIS_IS_GENERATED_INFO_COMMENT}
// please use command: taon build:watch to see here links for your globally builded lib code files
${THIS_IS_GENERATED_INFO_COMMENT}
            `.trimStart(),
    );

    const source = crossPlatformPath(
      path.join(
        destination.nodeModules.pathFor(this.rootPackageName),
        sourceLinkInNodeModules,
      ),
    );

    Helpers.removeIfExists(source);
    //#endregion
  }
  //#endregion

  //#region copy source maps
  /**
   *
   * @param destination that already has node_modues/rootPackagename copied
   * @param isTempLocalProj
   */
  copySourceMaps(destination: Project, isTempLocalProj: boolean) {
    //#region @backendFunc
    if (isTempLocalProj) {
      // destination === tmpLocalCopytoProjDist
      this.fixBackendAndBrowserJsMapFilesInLocalProj();
    } else {
      this.copyBackendAndBrowserJsMapFilesFromLocalProjTo(destination);
    }
    //#endregion
  }
  //#endregion

  //#region fix js map files in destination folder
  fixJsMapFiles(
    destinationPackageLocation: string,
    /**
     * browser websql browser-prod websql-prod
     */
    currentBrowserFolder?: string,
  ) {
    //#region @backendFunc
    const forBrowser = !!currentBrowserFolder;
    const filesPattern =
      `${destinationPackageLocation}` +
      `${forBrowser ? `/${currentBrowserFolder}` : ''}` +
      `/**/*.${forBrowser ? 'm' : ''}js.map`;

    // console.log({
    //   destinationPackageLocation,
    //   currentBrowserFolder,
    //   filesPattern
    // })
    const mapFiles = glob.sync(filesPattern, {
      ignore: forBrowser
        ? []
        : [`${folderName.browser}/**/*.*`, `${folderName.websql}/**/*.*`],
    });

    for (let index = 0; index < mapFiles.length; index++) {
      const absFilePath = mapFiles[index];
      const relative = crossPlatformPath(absFilePath).replace(
        destinationPackageLocation + '/',
        '',
      );
      this.writeFixedMapFile(forBrowser, relative, destinationPackageLocation);
    }
    //#endregion
  }
  //#endregion

  //#region fix backend and browser js (m)js.map files (for proper debugging)
  /**
   *  fix backend and browser js (m)js.map files (for proper debugging)
   *
   * destination is (should be) tmpLocalCopytoProjDist
   *
   * Fix for 2 things:
   * - debugging when in cli mode (fix in actual (dist)/(browser/websql)  )
   * - debugging when in node_modules of other project (fixing only tmpLocalCopytoProjDist)
   * @param destinationPackageLocation desitnation/node_modues/< rootPackageName >
   */
  fixBackendAndBrowserJsMapFilesInLocalProj() {
    //#region @backendFunc
    const destinationPackageLocation = this.localTempProj.nodeModules.pathFor(
      this.rootPackageName,
    );

    for (let index = 0; index < this.browserwebsqlFolders.length; index++) {
      const currentBrowserFolder = this.browserwebsqlFolders[index];
      this.fixJsMapFiles(destinationPackageLocation, currentBrowserFolder);
    }

    this.fixJsMapFiles(destinationPackageLocation);
    //#endregion
  }
  //#endregion

  //#region copy map files from local proj to copyto proj§
  copyMapFilesesFromLocalToCopyToProj(
    destination: Project,
    tmpLocalProjPackageLocation: string,
  ) {
    //#region @backendFunc
    const allMjsBrowserFiles = this.browserwebsqlFolders
      .map(currentBrowserFolder => {
        const mjsBrowserFilesPattern =
          `${tmpLocalProjPackageLocation}/` +
          `${currentBrowserFolder}` +
          `/**/*.mjs.map`;

        const mjsBrwoserFiles = glob.sync(mjsBrowserFilesPattern);
        return mjsBrwoserFiles;
      })
      .reduce((a, b) => a.concat(b), []);

    const mapBackendFilesPattern = `${tmpLocalProjPackageLocation}/**/*.js.map`;
    const mapBackendFiles = glob.sync(mapBackendFilesPattern, {
      ignore: [`${folderName.browser}/**/*.*`, `${folderName.websql}/**/*.*`],
    });

    const toCopy = [...allMjsBrowserFiles, ...mapBackendFiles];

    for (let index = 0; index < toCopy.length; index++) {
      const fileAbsPath = toCopy[index];
      const fileRelativePath = fileAbsPath.replace(
        `${tmpLocalProjPackageLocation}/`,
        '',
      );
      const destAbs = crossPlatformPath(
        path.join(
          destination.nodeModules.pathFor(this.rootPackageName),
          fileRelativePath,
        ),
      );
      HelpersTaon.copyFile(fileAbsPath, destAbs, {
        dontCopySameContent: false,
      });
    }
    //#endregion
  }
  //#endregion

  //#region copy backend and browser jsM (m)js.map files to destination location
  /**
   * Copy fixed maps from tmpLocalCopytoProjDist to other projects
   *
   * @param destination any project other than tmpLocalCopytoProjDist
   */
  copyBackendAndBrowserJsMapFilesFromLocalProjTo(destination: Project) {
    //#region @backendFunc
    const destinationPackageLocation = this.localTempProj.nodeModules.pathFor(
      this.rootPackageName,
    );
    this.copyMapFilesesFromLocalToCopyToProj(
      destination,
      destinationPackageLocation,
    );
    //#endregion
  }
  //#endregion

  //#region fix d.ts import with wrong package names
  fixDtsImportsWithWronPackageName(
    absOrgFilePathInDist: string,
    destinationFilePath: string,
  ) {
    //#region @backendFunc
    if (absOrgFilePathInDist.endsWith('.d.ts')) {
      const contentToWriteInDestination =
        Helpers.readFile(absOrgFilePathInDist) || '';
      for (let index = 0; index < this.browserwebsqlFolders.length; index++) {
        const currentBrowserFolder = this.browserwebsqlFolders[index];
        const newContent = this.dtsFixer.forContent(
          contentToWriteInDestination,
          // sourceFile,
          currentBrowserFolder,
        );
        if (newContent !== contentToWriteInDestination) {
          Helpers.writeFile(destinationFilePath, newContent);
        }
      }
    }
    //#endregion
  }
  //#endregion

  //#region handle copy of asset file
  handleCopyOfAssetFile(absoluteAssetFilePath: string, destination: Project) {
    //#region @backendFunc
    const monitoredOutDirSharedAssets = this.monitoredOutDirSharedAssets;
    for (let index = 0; index < monitoredOutDirSharedAssets.length; index++) {
      const folderAssetsShareAbsPath = monitoredOutDirSharedAssets[index];
      if (absoluteAssetFilePath.startsWith(folderAssetsShareAbsPath)) {
        const relativePath = absoluteAssetFilePath.replace(
          `${folderAssetsShareAbsPath}/`,
          '',
        );
        const dest = destination.nodeModules.pathFor(
          `${this.rootPackageName}/${assetsFromNpmPackage}/${sharedFromAssets}/${relativePath}`,
        );
        Helpers.remove(dest, true);
        if (Helpers.exists(absoluteAssetFilePath)) {
          HelpersTaon.copyFile(absoluteAssetFilePath, dest);
        }
      }
    }
    //#endregion
  }
  //#endregion

  //#region handle copy of single file
  handleCopyOfSingleFile(
    destination: Project,
    isTempLocalProj: boolean,
    specificFileRelativePath: string,
    wasRecrusive = false,
  ): void {
    //#region @backendFunc
    specificFileRelativePath = specificFileRelativePath.replace(/^\//, '');

    // Helpers.log(
    //   `Handle single file: ${specificFileRelativePath} for ${destination.location}`,
    // );

    if (this.notAllowedFiles.includes(specificFileRelativePath)) {
      return;
    }

    if (!wasRecrusive) {
      this.preventWeakDetectionOfchanges(
        specificFileRelativePath,
        destination,
        isTempLocalProj,
      );
    }

    const destinationFilePath = crossPlatformPath(
      path.normalize(
        path.join(
          destination.nodeModules.pathFor(this.rootPackageName),
          specificFileRelativePath,
        ),
      ),
    );

    if (!isTempLocalProj) {
      const readyToCopyFileInLocalTempProj = crossPlatformPath(
        path.join(
          this.localTempProj.nodeModules.pathFor(this.rootPackageName),
          specificFileRelativePath,
        ),
      );
      // Helpers.log(`Eqal content with temp proj: ${}`)
      if (
        Helpers.exists(readyToCopyFileInLocalTempProj) &&
        !Helpers.isFolder(readyToCopyFileInLocalTempProj)
      ) {
        HelpersTaon.copyFile(
          readyToCopyFileInLocalTempProj,
          destinationFilePath,
        );
      }
      return;
    }

    let absOrgFilePathInDist = crossPlatformPath(
      path.normalize(
        this.project.pathFor([distMainProject, specificFileRelativePath]),
      ),
    );

    // TODO QUICK_FIOX DISTINC WHEN IT COM FROM BROWSER
    // and do not allow
    if (destinationFilePath.endsWith('d.ts')) {
      const newAbsOrgFilePathInDist = absOrgFilePathInDist.replace(
        `/${distMainProject}/${specificFileRelativePath}`,
        `/${distNoCutSrcMainProject}/${specificFileRelativePath}`,
      );
      if (!Helpers.exists(newAbsOrgFilePathInDist)) {
        // Helpers.log(
        //   `[copyto] New path does not exists or in browser | websql: ${newAbsOrgFilePathInDist}`,
        // );
      } else {
        absOrgFilePathInDist = newAbsOrgFilePathInDist;
      }
    }

    this.fixDtsImportsWithWronPackageName(
      absOrgFilePathInDist,
      destinationFilePath,
    );

    const isBackendMapsFile = destinationFilePath.endsWith('.js.map');
    const isBrowserMapsFile = destinationFilePath.endsWith('.mjs.map');

    if (isBackendMapsFile || isBrowserMapsFile) {
      if (isBackendMapsFile) {
        this.writeFixedMapFile(
          false,
          specificFileRelativePath,
          destination.nodeModules.pathFor(this.rootPackageName),
        );
      }
      if (isBrowserMapsFile) {
        this.writeFixedMapFile(
          true,
          specificFileRelativePath,
          destination.nodeModules.pathFor(this.rootPackageName),
        );
      }
    } else {
      const fileContentWrite = Helpers.readFile(absOrgFilePathInDist) || '';
      if (Helpers.isFolder(destinationFilePath) && !fileContentWrite?.trim()) {
        // nothing to do
      } else {
        UtilsFilesFoldersSync.writeFile(destinationFilePath, fileContentWrite);
      }
    }

    // TODO check this
    if (specificFileRelativePath === fileName.package_json) {
      // TODO this is VSCODE/typescirpt new fucking issue
      // HelpersTaon.copyFile(sourceFile, path.join(path.dirname(destinationFile), folderName.browser, path.basename(destinationFile)));
    }
    //#endregion
  }
  //#endregion

  //#region prevent not fixing files in dist when source map hasn't been changed
  /**
   * if I am changing just thing in single line - maps are not being triggered asynch (it is good)
   * BUT typescript/angular compiler changes maps files inside dist or dist/browser|websql
   *
   *
   */
  preventWeakDetectionOfchanges(
    specificFileRelativePath: string,
    destination: Project,
    isTempLocalProj: boolean,
  ) {
    //#region @backendFunc
    (() => {
      const specificFileRelativePathBackendMap =
        specificFileRelativePath.replace('.js', '.js.map');
      const possibleBackendMapFile = crossPlatformPath(
        path.normalize(
          path.join(this.monitoredOutDir, specificFileRelativePathBackendMap),
        ),
      );

      if (Helpers.exists(possibleBackendMapFile)) {
        this.handleCopyOfSingleFile(
          destination,
          isTempLocalProj,
          specificFileRelativePathBackendMap,
          true,
        );
      }
    })();

    (() => {
      const specificFileRelativePathBackendMap =
        specificFileRelativePath.replace('.js', '.d.ts');
      const possibleBackendMapFile = crossPlatformPath(
        path.normalize(
          path.join(this.monitoredOutDir, specificFileRelativePathBackendMap),
        ),
      );

      if (Helpers.exists(possibleBackendMapFile)) {
        this.handleCopyOfSingleFile(
          destination,
          isTempLocalProj,
          specificFileRelativePathBackendMap,
          true,
        );
      }
    })();

    for (let index = 0; index < this.browserwebsqlFolders.length; index++) {
      const browserFolder = this.browserwebsqlFolders[index];
      const specificFileRelativePathBrowserMap =
        specificFileRelativePath.replace('.mjs', '.mjs.map');
      const possibleBrowserMapFile = crossPlatformPath(
        path.normalize(
          path.join(
            this.monitoredOutDir,
            browserFolder,
            specificFileRelativePathBrowserMap,
          ),
        ),
      );
      if (Helpers.exists(possibleBrowserMapFile)) {
        this.handleCopyOfSingleFile(
          destination,
          isTempLocalProj,
          specificFileRelativePathBrowserMap,
          true,
        );
      }
    }
    //#endregion
  }
  //#endregion

  //#region write fixed map files for non cli
  /**
   * fix content of map files in destination package location
   */
  writeFixedMapFileForNonCli(
    isForBrowser: boolean,
    specificFileRelativePath: string,
    destinationPackageLocation: string,
  ) {
    //#region @backendFunc

    //#region map fix for node_moules/pacakge
    const absMapFilePathInLocalProjNodeModulesPackage = crossPlatformPath(
      path.join(destinationPackageLocation, specificFileRelativePath),
    );

    // console.log('SHOULD FIX NON CLI', {
    //   absMapFilePathInLocalProjNodeModulesPackage
    // })

    if (
      Helpers.exists(absMapFilePathInLocalProjNodeModulesPackage) &&
      !Helpers.isFolder(absMapFilePathInLocalProjNodeModulesPackage) &&
      !Helpers.isSymlinkFileExitedOrUnexisted(
        absMapFilePathInLocalProjNodeModulesPackage,
      ) &&
      path.basename(absMapFilePathInLocalProjNodeModulesPackage) !==
        packageJsonNpmLib // TODO QUICK_FIX
    ) {
      const fixedContentNonCLI = this.changedJsMapFilesInternalPathesForDebug(
        Helpers.readFile(absMapFilePathInLocalProjNodeModulesPackage),
        isForBrowser,
        false,
        absMapFilePathInLocalProjNodeModulesPackage,
        this.buildOptions.release.releaseType,
      );

      Helpers.writeFile(
        absMapFilePathInLocalProjNodeModulesPackage,
        fixedContentNonCLI,
      );
    }

    //#endregion

    //#endregion
  }

  writeFixedMapFileForCli(
    isForBrowser: boolean,
    specificFileRelativePath: string,
    destinationPackageLocation: string,
  ) {
    //#region @backendFunc

    //#region mpa fix for CLI
    const monitoredOutDirFileToReplaceBack = crossPlatformPath(
      path.join(this.monitoredOutDir, specificFileRelativePath),
    );

    // console.log('SHOULD FIX CLI', {
    //   monitoredOutDirFileToReplaceBack
    // })

    if (
      Helpers.exists(monitoredOutDirFileToReplaceBack) &&
      !Helpers.isFolder(monitoredOutDirFileToReplaceBack) &&
      !Helpers.isSymlinkFileExitedOrUnexisted(
        monitoredOutDirFileToReplaceBack,
      ) &&
      path.basename(monitoredOutDirFileToReplaceBack) !== packageJsonNpmLib // TODO QUICK_FIX
    ) {
      const fixedContentCLIDebug = this.changedJsMapFilesInternalPathesForDebug(
        Helpers.readFile(monitoredOutDirFileToReplaceBack),
        isForBrowser,
        true,
        monitoredOutDirFileToReplaceBack,
        this.buildOptions.release.releaseType,
      );

      Helpers.writeFile(monitoredOutDirFileToReplaceBack, fixedContentCLIDebug);
    }

    //#endregion

    //#endregion
  }
  //#endregion

  //#region write fixed map files
  /**
   *
   * @param isForBrowser
   * @param specificFileRelativePath
   * @param destinationPackageLocation should be ONLY temp project
   */
  protected writeFixedMapFile(
    isForBrowser: boolean,
    specificFileRelativePath: string,
    destinationPackageLocation: string,
  ) {
    //#region @backendFunc
    this.writeFixedMapFileForNonCli(
      isForBrowser,
      specificFileRelativePath,
      destinationPackageLocation,
    );
    this.writeFixedMapFileForCli(
      isForBrowser,
      specificFileRelativePath,
      destinationPackageLocation,
    );
    //#endregion
  }
  //#endregion

  //#region update backend full dts files
  updateBackendFullDtsFiles(destinationOrDist: Project | string) {
    //#region @backendFunc
    const base = this.project.pathFor(distNoCutSrcMainProject);

    const filesToUpdate = Helpers.filesFrom(base, true)
      .filter(f => f.endsWith('.d.ts'))
      .map(f => f.replace(`${base}/`, ''));

    for (let index = 0; index < filesToUpdate.length; index++) {
      const relativePath = filesToUpdate[index];
      const source = crossPlatformPath(path.join(base, relativePath));
      const dest = crossPlatformPath(
        path.join(
          _.isString(destinationOrDist)
            ? this.monitoredOutDir
            : destinationOrDist.nodeModules.pathFor(this.rootPackageName),
          relativePath,
        ),
      );
      // if (Helpers.exists(dest)) {
      // console.log(dest);
      const sourceContent = Helpers.readFile(source);

      Helpers.writeFile(dest, this.dtsFixer.forBackendContent(sourceContent));
      // }
    }
    //#endregion
  }
  //#endregion
}
