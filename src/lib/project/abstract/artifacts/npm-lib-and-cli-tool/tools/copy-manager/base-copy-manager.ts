//#region imports
import { ChangeOfFile } from 'incremental-compiler/src';
import { Log } from 'ng2-logger/src';
import {
  config,
  folderName,
  LibTypeEnum,
  taonPackageName,
  tnpPackageName,
} from 'tnp-core/src';
import { crossPlatformPath, _ } from 'tnp-core/src';
import { fse } from 'tnp-core/src';
import { path } from 'tnp-core/src';
import { BaseCompilerForProject } from 'tnp-helpers/src';
import { Helpers } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import {
  dirnameFromSourceToProject,
  distFromNgBuild,
  nodeModulesMainProject,
  packageJsonMainProject,
  packageJsonNpmLib,
  sourceLinkInNodeModules,
  srcMainProject,
  tmpAlreadyStartedCopyManager,
  tmpSrcDist,
  TO_REMOVE_TAG,
  whatToLinkFromCore,
} from '../../../../../../constants';
import { Models } from '../../../../../../models';
import {
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../../../options';
import type { Project } from '../../../../project';

import { CopyMangerHelpers } from './copy-manager-helpers';
import { SourceMappingUrl } from './source-maping-url';
//#endregion

const REPLACE_INDEX_D_TS_IN_DEST_WHEN_WATCH = false;

const log = Log.create(_.startCase(path.basename(__filename)));

export interface BaseCopyMangerInitialParams {
  // TOOD this does not work
  skipCopyDistToLocalTempProject?: boolean;
}

export abstract class BaseCopyManger extends BaseCompilerForProject<
  BaseCopyMangerInitialParams,
  // @ts-ignore TODO weird inheritance problem
  Project
> {

  //#region fields
  public _isomorphicPackages = [] as string[];

  protected buildOptions: EnvOptions;

  protected copyto: Project[] = [];

  protected renameDestinationFolder?: string;

  //#region getters & methods / select all project to copy to
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
  //#endregion

  get customCompilerName(): string {
    return `Copyto manager compilation`;
  }

  protected readonly notAllowedFiles: string[] = [
    '.DS_Store',
    // fileName.index_d_ts,
  ];

  protected readonly sourceFolders = [

    //#region @backend
    srcMainProject,
    sourceLinkInNodeModules,
    nodeModulesMainProject,
    tmpSrcDist,
    ...CopyMangerHelpers.browserwebsqlFolders.map(currentBrowserFolder => {
      return crossPlatformPath([currentBrowserFolder, srcMainProject]);
    }),
    //#endregion

  ];

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

    return Helpers.uniqArray<Project>(result, 'location' as keyof Project);
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

  updateTriggered = _.debounce(() => {
    Helpers.log(`[copy-manager] update triggered`);
  }, 1000);

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
      new RegExp(Helpers.escapeStringForRegEx(TO_REMOVE_TAG), 'g'),
      '',
    );
    if (newContent && contentOrg && newContent !== contentOrg) {
      Helpers.writeFile(fileAbsolutePath, newContent);
      // console.log(`[copy-manager] content replaced in ${fileAbsolutePath}`);
    }
    //#endregion

  }

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
        outDir: distFromNgBuild as 'dist',
        event,
      });
    }
    this.updateTriggered();
    //#endregion

  }
  //#endregion

  isStartFromScratch: boolean = true;

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
        outDir: distFromNgBuild as 'dist',
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

  //#region copy builded distribution to
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
      outDir?: 'dist';
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

      //#region copy/link package.json
      const destPackageInNodeModules = destination.pathFor([
        nodeModulesMainProject,
        this.rootPackageName,
      ]);

      const packageJsonInDest = crossPlatformPath([
        destPackageInNodeModules,
        packageJsonNpmLib,
      ]);

      try {
        fse.unlinkSync(packageJsonInDest);
      } catch (e) {}
      if (this.isWatchCompilation && !isTempLocalProj) {
        Helpers.createSymLink(
          this.project.pathFor(packageJsonMainProject),
          packageJsonInDest,
        );
      } else {
        Helpers.copyFile(
          this.project.pathFor(packageJsonMainProject),
          packageJsonInDest,
        );
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
      // Helpers.copyFile(projectOudBorwserSrc, projectOudBorwserDest);}
      //#endregion

    }
    //#endregion

  }
  //#endregion

  //#region abstract
  /**
   * first folder in node_modules for packge
   * example:
   * project/node_modules/<rootPackageName> # like 'ng2-rest' or '@angular'
   */
  abstract get rootPackageName(): string;

  /**
   * Path for local-temp-project-path
   */
  abstract get localTempProjPath(): string;

  /**
   * connected with specificRelativeFilePath
   * gives file in compilation folder... meaning:
   *
   * monitoredOutDir/specificRelativeFilePath
   * equals:
   * projectLocation/(dist)/specificRelativeFilePath
   */
  abstract get monitoredOutDir(): string;

  abstract changedJsMapFilesInternalPathesForDebug(
    content: string,
    isBrowser: boolean,
    isForCliDebuggerToWork: boolean,
    filePath: string,
    releaseType: ReleaseType,
  ): string;

  abstract initalFixForDestination(destination: Project): void;

  abstract copySourceMaps(destination: Project, isTempLocalProj: boolean);

  abstract addSourceSymlinks(destination: Project);

  abstract removeSourceSymlinks(destination: Project);

  abstract handleCopyOfSingleFile(
    destination: Project,
    isTempLocalProj: boolean,
    specificFileRelativePath: string,
  );

  abstract handleCopyOfAssetFile(
    absoluteAssetFilePath: string,
    destination: Project,
  );

  abstract replaceIndexDtsForEntryProjectIndex(destination: Project);

  /**
   * fix d.ts files in angular build - problem with require() in d.ts with wrong name
   */
  abstract copyCompiledSourcesAndDeclarations(
    destination: Project,
    isTempLocalProj: boolean,
  );

  abstract copySharedAssets(destination: Project, isTempLocalProj: boolean);

  abstract linksForPackageAreOk(destination: Project): boolean;

  abstract updateBackendFullDtsFiles(destinationOrDist: Project | string): void;

  //#endregion

}