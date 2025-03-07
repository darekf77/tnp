import { config } from 'tnp-config/src';
import { crossPlatformPath, path, _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import type { Project } from '../../../../project';

import { CopyMangerHelpers } from './copy-manager-helpers';
import type { CopyManagerOrganization } from './copy-manager-organization';
import { MjsFesmModuleSpliter } from './mjs-fesm-module-spliter';

export class CopyMangerOrganizationAngularFiles {
  //#region  getters
  get targetProj() {
    return this.manager.targetProj;
  }

  get dtsFixer() {
    return this.manager.dtsFixer;
  }

  get targetProjName() {
    return this.manager.targetProjName;
  }

  get localTempProj() {
    return this.manager.localTempProj;
  }
  get monitoredOutDir() {
    return this.manager.monitoredOutDir;
  }

  get rootPackageName() {
    return this.manager.rootPackageName;
  }

  get children() {
    return this.manager.getChildren();
  }
  //#endregion

  //#region constructor
  constructor(private manager: CopyManagerOrganization) {}
  //#endregion

  //#region api

  //#region api / handle single file
  /**
   *
   * For handling files:
   *
   *  "websql/esm2022/lib/index.mjs"
   *  "browser/esm2022/lib/index.mjs"
   *  "browser/fesm2022/<targetProjName>.mjs.map"
   *  "browser/fesm2022/<targetProjName>.mjs"
   *  "websql/fesm2022/<targetProjName>.mjs.map"
   *  "websql/fesm2022/<targetProjName>.mjs"
   *  "websql/package.json"
   *  "browser/package.json"
   *
   * This function populatest modules children
   *
   */
  handleCopyOfSingleFile(
    specificFileRelativePath: string,
    destination: Project,
    isTempLocalProj: boolean,
    wasRecrusive: boolean,
  ): void {
    //#region @backendFunc
    const angularCompilationFolderOrLibs = _.first(
      specificFileRelativePath.split('/').slice(1),
    ) as keyof typeof CopyMangerHelpers.angularBrowserComiplationFolders;

    if (
      CopyMangerHelpers.angularBrowserComiplationFoldersArr.includes(
        angularCompilationFolderOrLibs,
      )
    ) {
      const currentBrowserFolder: 'browser' | 'websql' | string = _.first(
        specificFileRelativePath.split('/'),
      ) as 'browser' | 'websql' | string;
      this.actionForFolder(
        destination,
        isTempLocalProj,
        currentBrowserFolder,
        angularCompilationFolderOrLibs,
        {
          specificFileRelativePathForBrowserModule: specificFileRelativePath
            .split('/')
            .slice(2)
            .join('/'),
          singleFile: true,
        },
      );
    } else if (angularCompilationFolderOrLibs === config.folder.libs) {
      for (
        let index = 0;
        index < CopyMangerHelpers.browserwebsqlFolders.length;
        index++
      ) {
        const browserFolder = CopyMangerHelpers.browserwebsqlFolders[index];
        const childName = _.first(specificFileRelativePath.split('/').slice(2));
        const child = this.children.find(c => c.name === childName);
        const rootPackageNameForChildBrowser =
          this.rootPackageNameForChildBrowser(child, browserFolder);
        const relativePath = specificFileRelativePath
          .split('/')
          .splice(3)
          .join('/');
        const absSourcePath = isTempLocalProj
          ? crossPlatformPath(
              path.join(this.monitoredOutDir, specificFileRelativePath),
            )
          : crossPlatformPath(
              path.join(
                this.localTempProj.nodeModules.pathFor(
                  rootPackageNameForChildBrowser,
                ),
                relativePath,
              ),
            );

        let content = Helpers.readFile(absSourcePath);
        if (isTempLocalProj && relativePath.endsWith('.d.ts')) {
          content = this.dtsFixer.forContent(content, browserFolder);
        }
        const detinationFilePath = crossPlatformPath(
          path.join(
            destination.nodeModules.pathFor(rootPackageNameForChildBrowser),
            relativePath,
          ),
        );
        Helpers.writeFile(detinationFilePath, content);
      }
    } else if (angularCompilationFolderOrLibs === config.folder.lib) {
      const child = this.targetProj;

      for (
        let index = 0;
        index < CopyMangerHelpers.browserwebsqlFolders.length;
        index++
      ) {
        const browserFolder = CopyMangerHelpers.browserwebsqlFolders[index];
        const rootPackageNameForChildBrowser =
          this.rootPackageNameForChildBrowser(child, browserFolder);
        const relativePath = specificFileRelativePath
          .split('/')
          .splice(2)
          .join('/');

        const absSourcePath = isTempLocalProj
          ? crossPlatformPath(
              path.join(this.monitoredOutDir, specificFileRelativePath),
            )
          : crossPlatformPath(
              path.join(
                this.localTempProj.nodeModules.pathFor(
                  rootPackageNameForChildBrowser,
                ),
                relativePath,
              ),
            );

        let content = Helpers.readFile(absSourcePath);
        if (isTempLocalProj && relativePath.endsWith('.d.ts')) {
          content = this.dtsFixer.forContent(content, browserFolder);
        }
        const detinationFilePath = crossPlatformPath(
          path.join(
            destination.nodeModules.pathFor(rootPackageNameForChildBrowser),
            relativePath,
          ),
        );
        Helpers.writeFile(detinationFilePath, content);
      }
    } else {
      // console.log('should be something here?')
      // TODO
      // copyt file ?? or fix package json ?
      // debugger
    }
    //#endregion
  }
  //#endregion

  //#region api / action for folder
  actionForFolder(
    destinationOrLocalTempProj: Project,
    isTempLocalProj: boolean,
    currentBrowserFolder: 'browser' | 'websql' | string | string,
    angularCompilationFolder: keyof typeof CopyMangerHelpers.angularBrowserComiplationFolders,
    options?: {
      specificFileRelativePathForBrowserModule?: string;
      singleFile?: boolean;
    },
  ) {
    //#region @backendFunc
    const { specificFileRelativePathForBrowserModule, singleFile } =
      options || {
        specificFileRelativePathForBrowserModule: void 0 as string,
      };

    const isEsm202w =
      angularCompilationFolder ===
      CopyMangerHelpers.angularBrowserComiplationFolders.esm2022;

    const children = this.children;
    for (let index = 0; index < children.length; index++) {
      const child = children[index];

      // ex: @codete-ngrx-blog-post/main/(browser|websql)
      const rootPackageNameForChildBrowser =
        this.manager.rootPackageNameForChildBrowser(
          child,
          currentBrowserFolder,
        );

      const childBrowserOrWebsqlDestAbsPath = crossPlatformPath(
        path.join(
          destinationOrLocalTempProj.nodeModules.pathFor(
            rootPackageNameForChildBrowser,
          ),
          angularCompilationFolder,
        ),
      );

      const path_InMonitoredLocation = crossPlatformPath(
        path.join(
          this.monitoredOutDir,
          currentBrowserFolder,
          angularCompilationFolder,
        ),
      );

      const path_InLocalTempProj = crossPlatformPath(
        path.join(
          this.localTempProj.nodeModules.pathFor(
            rootPackageNameForChildBrowser,
          ),
          angularCompilationFolder,
        ),
      );

      const sourceBrowserOrWerbsqlFolderAbsPath = isTempLocalProj
        ? path_InMonitoredLocation
        : path_InLocalTempProj;

      if (!singleFile) {
        Helpers.remove(childBrowserOrWebsqlDestAbsPath); // TODO This may be expensive
      }
      // console.log({ singleFile })
      Helpers.copy(
        sourceBrowserOrWerbsqlFolderAbsPath,
        childBrowserOrWebsqlDestAbsPath,
        {
          copySymlinksAsFiles: false,
          dontAskOnError: true,
        },
      );

      if (isTempLocalProj) {
        this.fixBrowserFolderMjsFilesInLocalTempProj(
          sourceBrowserOrWerbsqlFolderAbsPath,
          child,
          angularCompilationFolder,
          currentBrowserFolder,
          destinationOrLocalTempProj,
          {
            isMap: false,
            useModuleSpliter: !isEsm202w, // esm has embeded maps
          },
        );
        if (isEsm202w) {
          this.fixNotNeededFilesInESMforChildLocalTempProj(
            child,
            angularCompilationFolder,
            currentBrowserFolder,
            destinationOrLocalTempProj,
          );
        } else {
          this.fixBrowserFolderMjsFilesInLocalTempProj(
            sourceBrowserOrWerbsqlFolderAbsPath,
            child,
            angularCompilationFolder,
            currentBrowserFolder,
            destinationOrLocalTempProj,
            {
              isMap: true,
              useModuleSpliter: false,
            },
          );
        }
      }
    }
    //#endregion
  }
  //#endregion

  //#region api / copy browser folders

  //#endregion

  //#region api / fix angular package.json
  fixPackageJson(
    child: Project,
    destination: Project,
    currentBrowserFolder?: 'browser' | 'websql' | string,
  ) {
    //#region @backendFunc
    const childPackageName = crossPlatformPath(
      path.join(this.rootPackageName, child.name),
    );

    if (currentBrowserFolder) {
      const rootPackageNameForChildBrowser = crossPlatformPath(
        path.join(childPackageName, currentBrowserFolder),
      );
      const location = destination.nodeModules.pathFor(
        rootPackageNameForChildBrowser,
      );
      const childName = child.name;
      const pj = {
        name: rootPackageNameForChildBrowser,
        version: '0.0.0',
        module: `fesm2022/${childName}.mjs`,
        typings: `${childName}.d.ts`,
        exports: {
          './package.json': {
            default: './package.json',
          },
          '.': {
            types: `./${childName}.d.ts`,
            esm2022: `./esm2022/${childName}.mjs`,
            esm: `./esm2022/${childName}.mjs`,
            default: `./fesm2022/${childName}.mjs`,
          },
        },
        sideEffects: false,
      };
      Helpers.writeJson([location, config.file.package_json], pj);
    } else {
      const location = destination.nodeModules.pathFor(childPackageName);
      // const childName = child.name;
      const pj = {
        name: childPackageName,
        version: '0.0.0',
      };
      // const exportsKey = 'exports';
      // pj[exportsKey] = {};
      for (
        let index = 0;
        index < CopyMangerHelpers.browserwebsqlFolders.length;
        index++
      ) {
        const currentBrowserFolder =
          CopyMangerHelpers.browserwebsqlFolders[index];
        // TODO
        // - check if workspace package install possible in non-taon project
        // - should be ./ ?
        pj[`.${currentBrowserFolder}`] = `./${currentBrowserFolder}`;
        // pj[`${exportsKey}${currentBrowserFolder}`] =
      }
      Helpers.writeJson([location, config.file.package_json], pj);
    }
    //#endregion
  }
  //#endregion

  //#region api / fix build releate files
  fixBuildRelatedFiles(
    child: Project,
    destination: Project,
    currentBrowserFolder: 'browser' | 'websql' | string,
  ) {
    //#region @backendFunc
    const childPackageName = crossPlatformPath(
      path.join(this.rootPackageName, child.name),
    );
    const rootPackageNameForChildBrowser = crossPlatformPath(
      path.join(childPackageName, currentBrowserFolder),
    );
    const location = destination.nodeModules.pathFor(
      rootPackageNameForChildBrowser,
    );

    //#region <child-name>.d.ts
    Helpers.writeFile(
      [location, `${child.name}.d.ts`],
      `
/**
 * Generated dist release index. Do not edit.
 */
/// <amd-module name="main" />
export * from './${config.file.public_api}';
    `.trimLeft(),
    );
    //#endregion

    //#region public api.ts
    Helpers.writeFile(
      [location, config.file.public_api_d_ts],
      `
     /**
      * Generated  dist release index. Do not edit.
      */
     /// <amd-module name="main" />
     export * from './${config.file.index}';
         `.trimLeft(),
    );
    //#endregion
    //#endregion
  }
  //#endregion

  //#endregion

  //#region private metods

  //#region private metods / fix not needed files in esm 2020 (ONLY when tmp-local-proj)
  /**
   * only for tmp-local-proj as destination
   */
  private fixNotNeededFilesInESMforChildLocalTempProj(
    child: Project,
    angularCompilationFolder: keyof typeof CopyMangerHelpers.angularBrowserComiplationFolders,
    currentBrowserFolder: 'browser' | 'websql' | string,
    destinationTempProj: Project,
  ) {
    //#region @backendFunc
    // ex:  '@angular/core/(browser|websql)'
    const rootPackageNameForChildBrowser =
      this.manager.rootPackageNameForChildBrowser(child, currentBrowserFolder);

    const destinationPathMjs_publcApi = crossPlatformPath(
      path.join(
        destinationTempProj.nodeModules.pathFor(rootPackageNameForChildBrowser),
        angularCompilationFolder,
        'public-api.mjs',
      ),
    );

    const destinationPathLibsFolder = crossPlatformPath(
      path.join(
        destinationTempProj.nodeModules.pathFor(rootPackageNameForChildBrowser),
        angularCompilationFolder,
        config.folder.libs,
      ),
    );

    if (child.name === this.targetProjName) {
      const libFolderPathSource = crossPlatformPath(
        path.join(
          destinationTempProj.nodeModules.pathFor(
            rootPackageNameForChildBrowser,
          ),
          angularCompilationFolder,
          config.folder.lib,
        ),
      );
      const libFolderPathDest = crossPlatformPath(
        path.join(
          destinationTempProj.nodeModules.pathFor(
            rootPackageNameForChildBrowser,
          ),
          angularCompilationFolder,
          config.folder.libs,
          child.name,
        ),
      );
      Helpers.removeFolderIfExists(libFolderPathDest);
      Helpers.move(libFolderPathSource, libFolderPathDest);
    }

    Helpers.writeFile(
      destinationPathMjs_publcApi,
      `export * from './libs/${child.name}';\n`,
    );

    Helpers.foldersFrom(destinationPathLibsFolder)
      .filter(f => path.basename(f) !== child.name)
      .forEach(f => Helpers.removeFolderIfExists(f));

    // Helpers.removeFolderIfExists(crossPlatformPath(path.join(
    //   destinationTempProj.node_modules.pathFor(rootPackageNameForChildBrowser),
    //   angularCompilationFolder,
    //   config.folder.lib,
    // )));
    //#endregion
  }
  //#endregion

  //#region private metods / fix for module files in fesm2022 or fesm2022 (ONLY when tmp-local-proj)
  /**
   * only for tmp-local-proj as destination
   *
   * for each (f)esm(2015|2022) there is <targetname.mjs> file
   * that needs to be copy to proper module (with maps)
   */
  private fixBrowserFolderMjsFilesInLocalTempProj(
    sourceBrowserOrWerbsqlFolderAbsPath: string,
    child: Project,
    angularCompilationFolder: keyof typeof CopyMangerHelpers.angularBrowserComiplationFolders,
    currentBrowserFolder: 'browser' | 'websql' | string,
    destinationTempProj: Project,
    options: {
      isMap: boolean;
      useModuleSpliter: boolean;
    },
  ) {
    //#region @backendFunc
    const { isMap, useModuleSpliter } = options;

    // ex:  '@angular/core/(browser|websql)'
    const rootPackageNameForChildBrowser =
      this.manager.rootPackageNameForChildBrowser(child, currentBrowserFolder);

    const sourceMjsFile = crossPlatformPath(
      path.join(
        sourceBrowserOrWerbsqlFolderAbsPath,
        `${this.targetProjName}.mjs${isMap ? '.map' : ''}`,
      ),
    );

    const destinationLocationMjsFileDest = crossPlatformPath(
      path.join(
        destinationTempProj.nodeModules.pathFor(rootPackageNameForChildBrowser),
        angularCompilationFolder,
        `${child.name}.mjs${isMap ? '.map' : ''}`,
      ),
    );

    Helpers.copyFile(sourceMjsFile, destinationLocationMjsFileDest);

    if (child.name !== this.targetProjName) {
      const destinationLocationMjsFileDestTargeFileToRemove = crossPlatformPath(
        path.join(
          destinationTempProj.nodeModules.pathFor(
            rootPackageNameForChildBrowser,
          ),
          angularCompilationFolder,
          `${this.targetProjName}.mjs${isMap ? '.map' : ''}`,
        ),
      );
      Helpers.removeFileIfExists(
        destinationLocationMjsFileDestTargeFileToRemove,
      );
    }

    if (useModuleSpliter && !isMap) {
      MjsFesmModuleSpliter.fixForTarget(
        child,
        destinationLocationMjsFileDest,
        currentBrowserFolder,
      );
    }

    // if (child.name !== this.targetProjName) {
    //   const destinationLocationMjsFileDestToRemove = path.join(
    //     destinationTempProj.node_modules.pathFor(rootPackageNameForChildBrowser),
    //     angularCompilationFolder,
    //     `${this.targetProjName}.mjs${isMap ? '.map' : ''}`,
    //   );
    //   Helpers.removeIfExists(destinationLocationMjsFileDestToRemove);
    // }
    //#endregion
  }
  //#endregion

  rootPackageNameForChildBrowser(
    child: Project,
    currentBrowserFolder: 'browser' | 'websql' | string,
  ) {
    //#region @backendFunc
    return this.manager.rootPackageNameForChildBrowser(
      child,
      currentBrowserFolder,
    );
    //#endregion
  }

  //#endregion
}
