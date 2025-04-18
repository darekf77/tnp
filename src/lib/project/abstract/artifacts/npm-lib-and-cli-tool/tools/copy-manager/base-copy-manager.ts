//#region imports
import { IncCompiler } from 'incremental-compiler/src';
import { Log } from 'ng2-logger/src';
import { config } from 'tnp-config/src';
import { crossPlatformPath, _ } from 'tnp-core/src';
import { fse } from 'tnp-core/src';
import { path } from 'tnp-core/src';
import { BaseCompilerForProject } from 'tnp-helpers/src';
import { Helpers } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import { TO_REMOVE_TAG } from '../../../../../../constants';
import { Models } from '../../../../../../models';
import { EnvOptions } from '../../../../../../options';
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

    if (config.frameworkName === 'tnp' && this.project.name !== 'tnp') {
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
    // config.file.index_d_ts,
  ];

  protected readonly sourceFolders = [
    //#region @backend
    config.folder.src,
    config.folder.source,
    config.folder.node_modules,
    config.folder.tempSrcDist,
    config.file.package_json,
    ...CopyMangerHelpers.browserwebsqlFolders.map(currentBrowserFolder => {
      return crossPlatformPath(
        path.join(currentBrowserFolder, config.folder.src),
      );
    }),
    // probably is not needed -> I ma not using dist for node_modules
    crossPlatformPath(
      path.join(config.folder.client, config.file.package_json),
    ),
    //#endregion
  ];

  //#endregion

  //#region getters

  //#region getters / source path to link

  get sourcePathToLink() {
    //#region @backendFunc
    const sourceToLink = crossPlatformPath(
      path.join(this.project.location, config.folder.src),
    );
    return sourceToLink;
    //#endregion
  }
  //#endregion

  //#region getters / temp project name
  get tempProjName() {
    //#region @backendFunc
    const tempProjName = this.project.framework.getTempProjectNameForCopyTo();
    return tempProjName;
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
   * taon - uses ~/.taon/taon/projects/container-vXX
   * tnp - uses ../taon/projects/container-vXX
   *
   * but when tnp is in deep refactor I need to use taon to build tnp
   * and force taon to recognize core container from node_modules link
   * inside project (instead normally from taon.json[frameworkVersion] property)
   */
  get projectToCopyTo() {
    //#region @backendFunc

    let result: Project[] = [];

    const isTaonProdCli =
      config.frameworkNames.productionFrameworkName.includes(
        config.frameworkName,
      );

    //#region resolve all possible project for package distribution
    let projectForNodeModulesPkgUpdate: Project[] = [
      ...(config.activeFrameworkVersions.length > 1
        ? [
            ...config.activeFrameworkVersions.map(
              // this may be different then this.project.coreContainer
              v => this.project.ins.by('container', v),
            ),
          ]
        : []),
      ...[this.project.framework.coreContainer],
    ];
    //#endregion

    // QUICK_FIX
    if (
      isTaonProdCli &&
      !!this.project.tnpCurrentCoreContainer &&
      (this.project.framework.isLinkToNodeModulesDifferentThanCoreContainer ||
        this.project.name === 'tnp') // BIG QUICK FIX
    ) {
      projectForNodeModulesPkgUpdate.push(this.project.tnpCurrentCoreContainer);
      projectForNodeModulesPkgUpdate = projectForNodeModulesPkgUpdate.filter(
        p => {
          return (
            p.location !==
            this.project.ins.by(
              'container',
              this.project.framework.frameworkVersion,
            ).location
          );
        },
      );
    }

    if (
      isTaonProdCli &&
      this.project.framework.isLinkToNodeModulesDifferentThanCoreContainer
    ) {
      try {
        const possibleTnpLocation = crossPlatformPath(
          path.dirname(
            fse.realpathSync(
              this.project.pathFor([
                config.folder.node_modules,
                'tnp',
                'source',
              ]),
            ),
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

    return Helpers.uniqArray<Project>(result, 'location');
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

  //#region generate source copy in
  public generateSourceCopyIn(
    destinationLocation: string,
    options?: Models.GenerateProjectCopyOpt,
  ): boolean {
    //#region @backendFunc
    destinationLocation = crossPlatformPath(destinationLocation);
    //#region fix options
    if (_.isUndefined(options)) {
      options = {} as any;
    }
    if (_.isUndefined(options.filterForReleaseDist)) {
      options.filterForReleaseDist = true;
    }
    if (_.isUndefined(options.forceCopyPackageJSON)) {
      options.forceCopyPackageJSON = false;
    }
    if (_.isUndefined(options.ommitSourceCode)) {
      options.ommitSourceCode = false;
    }
    if (_.isUndefined(options.override)) {
      options.override = true;
    }
    if (_.isUndefined(options.showInfo)) {
      options.showInfo = true;
    }
    if (_.isUndefined(options.regenerateProjectChilds)) {
      options.regenerateProjectChilds = false;
    }
    if (_.isUndefined(options.useTempLocation)) {
      options.useTempLocation = true;
    }

    if (_.isUndefined(options.regenerateOnlyCoreProjects)) {
      options.regenerateOnlyCoreProjects = true;
    }
    //#endregion

    const { override, showInfo } = options;

    const sourceLocation = this.project.location;
    //#region modify package.json for generated
    var packageJson: PackageJson = fse.readJsonSync(
      path.join(sourceLocation, config.file.package_json),
      {
        encoding: 'utf8',
      },
    );
    //#endregion

    //#region execute copy
    if (fse.existsSync(destinationLocation)) {
      if (override) {
        Helpers.tryRemoveDir(destinationLocation);
        Helpers.mkdirp(destinationLocation);
      } else {
        if (showInfo) {
          Helpers.warn(
            `Destination for project "${this.project.name}" already exists, only: source copy`,
          );
        }
      }
    }

    CopyMangerHelpers.executeCopy(
      sourceLocation,
      destinationLocation,
      options,
      this.project,
    );
    //#endregion

    //#region handle additional package.json markings
    if (this.project.framework.isContainer || options.forceCopyPackageJSON) {
      const packageJsonLocation = crossPlatformPath(
        path.join(destinationLocation, config.file.package_json),
      );
      // console.log(`packageJsonLocation: ${ packageJsonLocation } `)
      // console.log('packageJson', packageJson)
      fse.writeJsonSync(packageJsonLocation, packageJson, {
        spaces: 2,
        encoding: 'utf8',
      });
      // console.log(`packageJsonLocation saved: ${ packageJsonLocation } `)
    }
    //#endregion

    if (showInfo) {
      //#region show info about generation
      let dir = path.basename(path.dirname(destinationLocation));
      if (fse.existsSync(path.dirname(path.dirname(destinationLocation)))) {
        dir = `${path.basename(
          path.dirname(path.dirname(destinationLocation)),
        )}/${dir}`;
      }
      Helpers.log(
        `Source of project "${this.project.genericName}" generated in ${dir} /(< here >) `,
      );
      //#endregion
    }

    //#region recrusive execution for childrens
    if (options.regenerateProjectChilds && this.project.framework.isContainer) {
      let childs = this.project.children.filter(
        f => !['lib', 'app'].includes(path.basename(f.location)),
      );

      if (options.regenerateOnlyCoreProjects) {
        if (this.project.framework.isCoreProject) {
          if (this.project.framework.isContainer) {
            childs = this.project.children.filter(c => c.name === 'workspace');
          }
        } else {
          childs = [];
        }
      }

      childs.forEach(c => {
        // console.log('GENERATING CHILD ' + c.genericName)
        c.artifactsManager.artifact.npmLibAndCliTool.copyNpmDistLibManager.generateSourceCopyIn(
          crossPlatformPath(path.join(destinationLocation, c.name)),
          options,
        );
      });
    }
    //#endregion

    return true;
    //#endregion
  }
  //#endregion

  updateTriggered = _.debounce(() => {
    Helpers.log(`[copy-manager] update triggered`);
  }, 1000);

  /**
   * @returns if trus - skip futher processing
   */
  protected contentReplaced(fileAbsolutePath: string): boolean {
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
      return false;
    }
    let contentOrg = Helpers.readFile(fileAbsolutePath) || '';
    const newContent = contentOrg.replace(
      new RegExp(Helpers.escapeStringForRegEx(TO_REMOVE_TAG), 'g'),
      '',
    );
    if (newContent && contentOrg && newContent !== contentOrg) {
      Helpers.writeFile(fileAbsolutePath, newContent);
      // console.log(`[copy-manager] content replaced in ${fileAbsolutePath}`);
      return true;
    }
    return false;
    //#endregion
  }

  //#region async action
  async asyncAction(event: IncCompiler.Change) {
    //#region @backendFunc
    const absoluteFilePath = crossPlatformPath(event.fileAbsolutePath);
    if (this.contentReplaced(absoluteFilePath)) {
      return;
    }

    // console.log('async event '+ absoluteFilePath)
    SourceMappingUrl.fixContent(absoluteFilePath, this.buildOptions);

    const outDir = config.folder.dist;
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

    Helpers.log(`ASYNC ACTION
    absoluteFilePath: ${absoluteFilePath}
    specificFileRelativePath: ${specificFileRelativePath}
    `);

    //     Helpers.log(`
    //     copyto project:
    // ${projectToCopyTo.map(p => p.location).join('\n')}

    //     `)

    for (let index = 0; index < projectToCopyTo.length; index++) {
      const projectToCopy = projectToCopyTo[index];
      this._copyBuildedDistributionTo(projectToCopy, {
        absoluteAssetFilePath,
        specificFileRelativePath: event && specificFileRelativePath,
        outDir: outDir as any,
        event,
      });
    }
    this.updateTriggered();
    //#endregion
  }
  //#endregion

  readonly isStartFromScratch: boolean = true;

  //#region sync action
  async syncAction(
    files: string[],
    initialParams: BaseCopyMangerInitialParams,
  ) {
    //#region @backendFunc

    const startFromScratchFileBasename = 'tmp-already-started-copy-manager';
    if (
      this.project.hasFile(startFromScratchFileBasename) &&
      this.project.readFile(startFromScratchFileBasename) === '-'
    ) {
      // @ts-ignore
      this.isStartFromScratch = false;
    } else {
      this.project.writeFile(startFromScratchFileBasename, '-');
      // @ts-ignore
      this.isStartFromScratch = true;
    }

    for (const fileAbsPath of files) {
      this.contentReplaced(fileAbsPath);
    }

    // files: string[]
    const outDir = config.folder.dist;

    const projectToCopyTo = this.projectToCopyTo;
    if (initialParams?.skipCopyDistToLocalTempProject) {
      projectToCopyTo.splice(
        projectToCopyTo.findIndex(
          p => p.location === this.localTempProj.location,
        ),
        1,
      );
    }

    // (${proj.location}/${config.folder.node_modules}/${this.rootPackageName})

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
        outDir: outDir as any,
      });
      // if (this.buildOptions.buildForRelease && !global.tnpNonInteractive) {
      //   Helpers.info('Things copied to :' + projectToCopy?.name);
      //   if (!(await Helpers.consoleGui.question.yesNo('Is there everywthing ok with build ?'))) {
      //     process.exit(0)
      //   }
      // }
      log.data('copy done...');
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

      // TODO not working werid tsc issue with browser/index
      // {const projectOudBorwserSrc = path.join(destination.location,
      //   config.folder.node_modules,
      //   rootPackageName,
      //   config.file.package_json
      // );
      // const projectOudBorwserDest = path.join(destination.location,
      //   config.folder.node_modules,
      //   rootPackageName,
      //   config.folder.browser,
      //   config.file.package_json
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
