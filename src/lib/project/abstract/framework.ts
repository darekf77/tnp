//#region imports
import {
  backendNodejsOnlyFiles,
  config,
  extAllowedToExportAndReplaceTSJSCodeFiles,
  frontendFiles,
  notNeededForExportFiles,
  TAGS,
} from 'tnp-config/src';
import {
  CoreModels,
  crossPlatformPath,
  path,
  _,
  Helpers,
  chalk,
  fse,
  Utils,
} from 'tnp-core/src';
import { BaseFeatureForProject, UtilsTypescript } from 'tnp-helpers/src';

import { Models } from '../../models';
import { EnvOptions } from '../../options';

import type { Project } from './project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class Framework extends BaseFeatureForProject<Project> {
  //#region is unknown npm project
  get isUnknownNpmProject(): boolean {
    //#region @backendFunc
    return this.project.typeIs('unknown-npm-project');
    //#endregion
  }
  //#endregion

  //#region is tnp
  /**
   * TODO make this more robust
   */
  get isTnp(): boolean {
    //#region @backendFunc
    if (this.project.typeIsNot('isomorphic-lib')) {
      return false;
    }
    return this.project.location === this.project.ins.Tnp.location;
    //#endregion
  }
  //#endregion

  //#region is core project
  /**
   * Core project with basic tested functionality
   */
  get isCoreProject(): boolean {
    //#region @backendFunc
    return this.project.taonJson.isCoreProject;
    //#endregion
  }
  //#endregion

  //#region is container or workspace with linked projects
  get isContainerWithLinkedProjects(): boolean {
    //#region @backendFunc
    return (
      this.isContainer && this.project.linkedProjects.linkedProjects.length > 0
    );
    //#endregion
  }
  //#endregion

  //#region is container
  /**
   * is normal or smart container
   */
  get isContainer(): boolean {
    //#region @backendFunc
    return this.project.typeIs('container');
    //#endregion
  }
  //#endregion

  //#region is container core project
  get isContainerCoreProject(): boolean {
    //#region @backendFunc
    return this.isContainer && this.isCoreProject;
    //#endregion
  }
  //#endregion

  //#region is temp container core project
  get isContainerCoreProjectTempProj(): boolean {
    //#region @backendFunc
    const dirOfParent = path.dirname(path.dirname(this.project.location));
    const isTemp = path.basename(dirOfParent) === 'tmp-smart-node_modules'; // TODO QUICK_FIX
    return this.isContainerCoreProject && isTemp;
    //#endregion
  }
  //#endregion

  //#region is container child
  get isContainerChild(): boolean {
    //#region @backendFunc
    return !!this.project.parent && this.project.parent.typeIs('container');
    //#endregion
  }
  //#endregion

  //#region is standalone project
  /**
   * Standalone project ready for publish on npm
   * Types of standalone project:
   * - isomorphic-lib : backend/fronded ts library with server,app preview
   * - angular-lib: frontend ui lib with angular preview
   */
  get isStandaloneProject(): boolean {
    //#region @backendFunc
    if (this.project.typeIs('unknown')) {
      return false;
    }
    return !this.isContainer && !this.isUnknownNpmProject;
    //#endregion
  }
  //#endregion

  //#region get framework version
  public get frameworkVersion(): CoreModels.FrameworkVersion {
    //#region @backendFunc
    return this.project.taonJson.frameworkVersion;
    //#endregion
  }
  //#endregion

  //#region get framework version minus 1
  public get frameworkVersionMinusOne(): CoreModels.FrameworkVersion {
    //#region @backendFunc
    const curr = Number(
      _.isString(this.frameworkVersion) &&
        this.frameworkVersion.replace('v', ''),
    );
    if (!isNaN(curr) && curr >= 2) {
      return `v${curr - 1}` as CoreModels.FrameworkVersion;
    }
    return 'v1';
    //#endregion
  }
  //#endregion

  //#region framework version equals
  public frameworkVersionEquals(version: CoreModels.FrameworkVersion): boolean {
    //#region @backendFunc
    const ver = Number(_.isString(version) && version.replace('v', ''));

    const curr = Number(
      _.isString(this.frameworkVersion) &&
        this.frameworkVersion.replace('v', ''),
    );
    return !isNaN(ver) && !isNaN(curr) && curr === ver;
    //#endregion
  }
  //#endregion

  //#region framework version at least
  public frameworkVersionAtLeast(
    version: CoreModels.FrameworkVersion,
  ): boolean {
    //#region @backendFunc
    const ver = Number(_.isString(version) && version.replace('v', ''));
    const curr = Number(
      _.isString(this.frameworkVersion) &&
        this.frameworkVersion.replace('v', ''),
    );
    return !isNaN(ver) && !isNaN(curr) && curr >= ver;
    //#endregion
  }
  //#endregion

  //#region fix core content
  fixCoreContent = (appTsContent: string): string => {
    const project = this.project;
    const coreName = _.upperFirst(_.camelCase(project.name));
    const coreNameKebab = _.kebabCase(project.name);
    return appTsContent
      .replace(
        new RegExp(
          `IsomorphicLibV${project.framework.frameworkVersion.replace('v', '')}`,
          'g',
        ),
        `${coreName}`,
      )
      .replace(
        new RegExp(
          `isomorphic-lib-v${project.framework.frameworkVersion.replace('v', '')}`,
          'g',
        ),
        `${coreNameKebab}`,
      );
  };
  //#endregion

  //#region recreate from core project

  recreateFileFromCoreProject = (options: {
    fileRelativePath?: string | string[];
    /**
     * if will override **fileRelativePath** with different path
     * to get file from core project
     * By default this helper will copy file from core project to this project:
     * <path-to-core-project><fileRelativePath>
     * <this-project><fileRelativePath>
     */
    relativePathInCoreProject?: string | string[];
    customDestinationLocation?: string | string[];
  }): void => {
    //#region @backendFunc
    let {
      fileRelativePath,
      customDestinationLocation,
      relativePathInCoreProject,
    } = options || {};
    customDestinationLocation = crossPlatformPath(customDestinationLocation);
    if (
      customDestinationLocation &&
      Helpers.exists(customDestinationLocation) &&
      Helpers.isFolder(customDestinationLocation)
    ) {
      Helpers.error(
        `[${config.frameworkName}] Custom destination "${customDestinationLocation}"` +
          ` location cannot be a folder, it must be a file path`,
      );
    }
    const project = this.project;
    fileRelativePath = crossPlatformPath(fileRelativePath);
    if (
      (_.isString(fileRelativePath) && !project.hasFile(fileRelativePath)) ||
      customDestinationLocation
    ) {
      const coreProject = project.framework.coreProject;
      const filePathSource = coreProject.pathFor(
        relativePathInCoreProject
          ? relativePathInCoreProject
          : fileRelativePath,
      );
      const sourceContent = Helpers.readFile(filePathSource);
      const fixedContent = this.fixCoreContent(sourceContent);
      if (customDestinationLocation) {
        Helpers.writeFile(customDestinationLocation, fixedContent);
      } else {
        project.writeFile(fileRelativePath, fixedContent);
      }
    }
    //#endregion
  };
  //#endregion

  //#region framework version less than or equal
  public frameworkVersionLessThanOrEqual(
    version: CoreModels.FrameworkVersion,
  ): boolean {
    //#region @backendFunc
    return (
      this.frameworkVersionEquals(version) ||
      this.frameworkVersionLessThan(version)
    );
    //#endregion
  }
  //#endregion

  //#region framework version less than
  public frameworkVersionLessThan(
    version: CoreModels.FrameworkVersion,
  ): boolean {
    //#region @backendFunc
    const ver = Number(_.isString(version) && version.replace('v', ''));
    const curr = Number(
      _.isString(this.frameworkVersion) &&
        this.frameworkVersion.replace('v', ''),
    );
    return !isNaN(ver) && !isNaN(curr) && curr < ver;
    //#endregion
  }
  //#endregion

  //#region core container data from node modules link
  get containerDataFromNodeModulesLink(): {
    isCoreContainer: boolean;
    coreContainerFromNodeModules: Project;
  } {
    //#region @backendFunc
    const realpathCCfromCurrentProj =
      fse.existsSync(this.project.nodeModules.path) &&
      fse.realpathSync(this.project.nodeModules.path);
    const pathCCfromCurrentProj =
      realpathCCfromCurrentProj &&
      crossPlatformPath(path.dirname(realpathCCfromCurrentProj));

    const coreContainerFromNodeModules: Project = (pathCCfromCurrentProj &&
      this.project.ins.From(pathCCfromCurrentProj)) as Project;

    const isCoreContainer =
      coreContainerFromNodeModules &&
      coreContainerFromNodeModules?.framework.isCoreProject &&
      coreContainerFromNodeModules?.framework.isContainer;

    return { isCoreContainer, coreContainerFromNodeModules };
    //#endregion
  }
  //#endregion

  //#region core project
  get coreProject(): Project {
    //#region @backendFunc
    return this.project.ins.by(this.project.type, this.frameworkVersion) as any;
    //#endregion
  }
  //#endregion

  //#region is link to node modules different than core container
  get isLinkToNodeModulesDifferentThanCoreContainer() {
    //#region @backendFunc
    const { isCoreContainer, coreContainerFromNodeModules } =
      this.containerDataFromNodeModulesLink;

    return (
      isCoreContainer &&
      coreContainerFromNodeModules.location !==
        this.project.ins.by('container', this.frameworkVersion).location
    );
    //#endregion
  }
  //#endregion

  //#region core container
  /**
   * Get automatic core container for project
   * WHEN NODE_MODULES BELONG TO TNP -> it uses tnp core container
   */
  get coreContainer(): Project {
    //#region @backendFunc
    // use core container from node_modules link first - if it is proper
    if (
      config.frameworkNames.productionFrameworkName.includes(
        config.frameworkName,
      )
    ) {
      const { isCoreContainer, coreContainerFromNodeModules } =
        this.containerDataFromNodeModulesLink;

      if (isCoreContainer) {
        // this.project.nodeModules.reinstallSync();
        return coreContainerFromNodeModules;
      }
    }
    const coreContainer = this.project.ins.by(
      'container',
      this.frameworkVersion,
    ) as Project;

    if (!coreContainer) {
      Helpers.error(
        `
        There is something wrong with core container-${this.frameworkVersion}

        You need to sync taon containers. Try command:

      ${config.frameworkName} sync

      `,
        false,
        true,
      );
    }
    // TODO I cloud install node_modules here automatically, but sometimes
    // is is not needed
    // coreContainer.nodeModules.reinstallSync();
    return coreContainer;
    //#endregion
  }
  //#endregion

  //#region getters & methods / name, names / get temp project name
  /**
   * project stores node_modules with compiles npm lib
   */
  getTempProjectNameForCopyTo(): string {
    //#region @backendFunc
    const tempProjName = `tmp-local-copyto-proj-${config.folder.dist}`;
    return tempProjName;
    //#endregion
  }
  //#endregion

  //#region tmp local project full path
  get tmpLocalProjectFullPath(): string {
    return this.project.pathFor([
      this.getTempProjectNameForCopyTo(),
      config.folder.node_modules,
      this.project.nameForNpmPackage,
    ]);
  }
  //#endregion

  //#region generate index.ts
  generateIndexTs(relativePath: string = '') {
    //#region @backendFunc
    const absPath = relativePath
      ? this.project.pathFor(relativePath)
      : this.project.location;
    const folders = [
      ...Helpers.foldersFrom(absPath).map(f => path.basename(f)),
      ...Helpers.filesFrom(absPath, false).map(f => path.basename(f)),
    ]
      .filter(f => !['index.ts'].includes(f))
      .filter(f => !f.startsWith('.'))
      .filter(f => !f.startsWith('_'))
      .filter(f =>
        _.isUndefined(notNeededForExportFiles.find(e => f.endsWith(e))),
      )
      .filter(
        f =>
          path.extname(f) === '' ||
          !_.isUndefined(
            extAllowedToExportAndReplaceTSJSCodeFiles.find(a => f.endsWith(a)),
          ),
      );
    Helpers.writeFile(
      crossPlatformPath([absPath, config.file.index_ts]),
      folders
        .map(f => {
          if (
            !_.isUndefined(frontendFiles.find(bigExt => f.endsWith(bigExt)))
          ) {
            // `${TAGS.COMMENT_REGION} ${TAGS.BROWSER}\n` +
            return `export * from './${f.replace(path.extname(f), '')}'; // ${TAGS.BROWSER}`;
            // +`\n${TAGS.COMMENT_END_REGION}\n`;
          }
          if (
            !_.isUndefined(
              backendNodejsOnlyFiles.find(bigExt => f.endsWith(bigExt)),
            )
          ) {
            return (
              // `${TAGS.COMMENT_REGION} ${TAGS.BACKEND}\n` +
              `export * from './${f.replace(path.extname(f), '')}'; // ${TAGS.BACKEND}`
              // +`\n${TAGS.COMMENT_END_REGION}\n`
            );
          }
          return `export * from './${f.replace(path.extname(f), '')}';`;
        })
        .join('\n') + '\n',
    );
    //#endregion
  }
  //#endregion

  //#region global
  async global(globalPackageName: string, packageOnly = false) {
    //#region @backendFunc
    const oldContainer = this.project.ins.by('container', 'v1') as Project;
    if (oldContainer.nodeModules.empty) {
      Helpers.info('initing container v1 for global packages');
      await oldContainer.init(
        EnvOptions.from({
          purpose: 'old container init',
        }),
      );
    }
    if (packageOnly) {
      return crossPlatformPath(
        path.join(oldContainer.nodeModules.path, globalPackageName),
      );
    }
    return crossPlatformPath(
      path.join(
        oldContainer.nodeModules.path,
        globalPackageName,
        `bin/${globalPackageName}`,
      ),
    );
    //#endregion
  }
  //#endregion

  /**
   * @returns by default it will always return at least one context
   */
  //#region detected contexts
  public getAllDetectedContextsNames(): string[] {
    return this.getAllDetectedTaonContexts()
      .map((f, i) =>
        (f?.contextName || `UnnamedContext${i}`)
          .replace('.sqlite', '')
          .replace('db-', ''),
      )
      .sort((a, b) => a.localeCompare(b));
  }

  /**
   * @returns by default it will always return at least one context
   */
  public getAllDetectedTaonContexts(): Models.TaonContext[] {
    const detectedContexts = [...this._allDetectedNestedContexts()];
    return detectedContexts.length > 0
      ? detectedContexts
      : [
          {
            contextName: 'NoContextDetected',
            fileRelativePath: '',
          },
        ];
  }

  contextFilter(relativePath: string): boolean {
    return (
      relativePath === 'app.ts' ||
      relativePath.endsWith('.worker.ts') ||
      relativePath.endsWith('.context.ts')
    );
  }

  private _allDetectedNestedContexts(): Models.TaonContext[] {
    //#region @backendFunc
    const basePath = this.project.pathFor([config.folder.src]);
    const filesForContext = Helpers.filesFrom(basePath, true).filter(
      absPath => {
        const relativePath = absPath.replace(`${basePath}/`, '');
        return this.contextFilter(relativePath);
      },
    );

    const detectedDatabaseFiles = filesForContext.reduce((a, absPathToFile) => {
      return a.concat(
        UtilsTypescript.getTaonContextsNamesFromFile(absPathToFile).map(
          contextName => {
            return {
              contextName: contextName,
              fileRelativePath: absPathToFile.replace(`${basePath}/`, ''),
            };
          },
        ),
      );
    }, [] as Models.TaonContext[]);
    return detectedDatabaseFiles;
    //#endregion
  }

  //#endregion
}
