import { config } from 'tnp-config/src';
import { crossPlatformPath, glob, path, _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import { BuildOptions } from '../../../../../../options';
import type { Project } from '../../../../project';

import { CopyMangerHelpers } from './copy-manager-helpers';
import { CopyMangerOrganizationAngularFiles } from './copy-manager-organization-angular-files';
import { CopyManagerStandalone } from './copy-manager-standalone';

export class CopyManagerOrganization extends CopyManagerStandalone {
  protected children: Project[];
  protected angularCopyManger: CopyMangerOrganizationAngularFiles;

  //#region target project name
  /**
   * target name for organizaiton (smart container) build
   */
  get targetProjName() {
    //#region @backendFunc
    return this.project.framework.smartContainerBuildTarget.name;
    //#endregion
  }
  //#endregion

  //#region target project path
  get targetProjPath() {
    //#region @backendFunc
    return crossPlatformPath(
      path.join(
        this.project.location,
        this.buildOptions.outDir,
        this.project.name,
        this.targetProjName,
      ),
    );
    //#endregion
  }
  //#endregion

  //#region target project
  get targetProj() {
    //#region @backendFunc
    return this.project.ins.From(this.targetProjPath) as Project;
    //#endregion
  }
  //#endregion

  //#region init
  init(buildOptions: BuildOptions, renameDestinationFolder?: string) {
    //#region @backendFunc
    super.init(buildOptions, renameDestinationFolder);
    this.children = this.getChildren() as any;
    this.angularCopyManger = new CopyMangerOrganizationAngularFiles(this);
    //#endregion
  }
  //#endregion

  //#region recreate temp proj
  recreateTempProj() {
    //#region @backendFunc
    super.recreateTempProj();
    //#endregion
  }
  //#endregion

  //#region _ copy builded distibutino to

  _copyBuildedDistributionTo(
    destination: Project,
    options?: {
      specificFileRelativePath?: string;
      outDir?: 'dist';
      event?: any;
      files?: string[];
    },
  ) {
    //#region @backendFunc
    super._copyBuildedDistributionTo(destination, options);
    //#endregion
  }
  //#endregion

  //#region local temp proj path
  get localTempProjPath() {
    //#region @backendFunc
    const targetProjPath = crossPlatformPath(
      path.join(this.targetProjPath, this.tempProjName),
    );
    return crossPlatformPath(targetProjPath);
    //#endregion
  }
  //#endregion

  //#region root package name
  get rootPackageName() {
    //#region @backendFunc
    const rootPackageName =
      _.isString(this.renameDestinationFolder) &&
      this.renameDestinationFolder !== ''
        ? this.renameDestinationFolder
        : `@${this.project.name}`;
    return rootPackageName;
    //#endregion
  }
  //#endregion

  //#region monitored out dir
  get monitoredOutDir(): string {
    //#region @backendFunc
    const monitorDir: string = crossPlatformPath(
      path.join(this.targetProjPath, this.buildOptions.outDir),
    );
    return monitorDir;
    //#endregion
  }
  //#endregion

  //#region monitored out dir shared assets
  get monitoredOutDirSharedAssets(): string[] {
    //#region @backendFunc
    const assetsFolders = this.project.children.map(c => {
      const monitorDir: string = crossPlatformPath([
        c.location,
        config.folder.src,
        config.folder.assets,
        config.folder.shared,
      ]);
      return monitorDir;
    });

    return assetsFolders;
    //#endregion
  }
  //#endregion

  //#region get chhildren
  getChildren(): Project[] {
    //#region @backendFunc
    return [
      this.project.children.find(c => c.name === this.targetProjName),
      ...this.project.children.filter(c => c.name !== this.targetProjName),
    ].filter(f => !!f);
    //#endregion
  }
  //#endregion

  //#region links for packages are ok
  linksForPackageAreOk(destination: Project): boolean {
    //#region @backendFunc
    for (const child of this.children) {
      const destPackageLinkSourceLocation = crossPlatformPath(
        path.join(
          destination.location,
          config.folder.node_modules,
          this.rootPackageName,
          child.name,
          config.folder.src,
        ),
      );
      if (Helpers.exists(destPackageLinkSourceLocation)) {
        return false;
      }
    }
    return true;
    //#endregion
  }
  //#endregion

  //#region initial fix for destination pacakge
  initalFixForDestination(destination: Project): void {
    //#region @backendFunc
    const destPackageInNodeModules = crossPlatformPath(
      path.join(
        destination.location,
        config.folder.node_modules,
        this.rootPackageName,
      ),
    );

    for (
      let index = 0;
      index < CopyMangerHelpers.browserwebsqlFolders.length;
      index++
    ) {
      const currentBrowserFolder =
        CopyMangerHelpers.browserwebsqlFolders[index];
      const destPackageInNodeModulesBrowser = crossPlatformPath(
        path.join(destPackageInNodeModules, currentBrowserFolder),
      );

      try {
        // TODO QUICK_FIX
        Helpers.remove(destPackageInNodeModulesBrowser);
      } catch (error) {}

      const children = this.children;

      for (let index = 0; index < children.length; index++) {
        const child = children[index];
        // if (!child) {
        //   debugger
        // }
        const childDestPackageInNodeModules = crossPlatformPath(
          path.join(
            destPackageInNodeModules,
            CopyMangerHelpers.childPureName(child),
          ),
        );

        const childDestPackageInNodeModulesBrowser = crossPlatformPath(
          path.join(
            destPackageInNodeModules,
            CopyMangerHelpers.childPureName(child),
            currentBrowserFolder,
          ),
        );

        if (
          Helpers.isSymlinkFileExitedOrUnexisted(childDestPackageInNodeModules)
        ) {
          Helpers.removeFileIfExists(childDestPackageInNodeModules);
        }
        if (!Helpers.exists(childDestPackageInNodeModules)) {
          try {
            // TODO QUICK_FIX
            Helpers.mkdirp(childDestPackageInNodeModules);
          } catch (error) {}
        }
        if (
          Helpers.isSymlinkFileExitedOrUnexisted(
            childDestPackageInNodeModulesBrowser,
          )
        ) {
          Helpers.removeFileIfExists(childDestPackageInNodeModulesBrowser);
        }
        if (!Helpers.exists(childDestPackageInNodeModulesBrowser)) {
          try {
            // TODO QUICK_FIX
            Helpers.mkdirp(childDestPackageInNodeModulesBrowser);
          } catch (error) {}
        }
      }
    }
    //#endregion
  }
  //#endregion

  //#region transform map files
  changedJsMapFilesInternalPathesForDebug(
    content: string,
    isBrowser: boolean,
    isForLaunchJsonDebugging: boolean,
    absFilePath: string,
  ): string {
    //#region @backendFunc
    if (
      !content ||
      (!absFilePath.endsWith('.js.map') && !absFilePath.endsWith('.mjs.map'))
    ) {
      // Helpers.warn(`[copytomanager] Empty content for ${absFilePath}`);
      return content;
    }

    // console.log({ fixing: absFilePath })

    if (isBrowser) {
      // TODO is angular maps not working in chrome debugger (the did not work whe switch lazy modules)
      // content = content.replace(regex1, `"./${config.folder.src}`);
      // content = content.replace(regex2, config.folder.src);
    } else {
      if (isForLaunchJsonDebugging) {
        // files is in dist or container target project
        // I am not allowing organizaition as cli tool

        const relative = crossPlatformPath(absFilePath).replace(
          `${this.monitoredOutDir}/`,
          '',
        );

        if (this.isForSpecyficTargetCompilation(relative)) {
          let toReplaceString2 = `../tmp-source-${this.buildOptions.outDir}`;

          // let toReplaceString1 = `"${toReplaceString2}`;

          const regex2 = new RegExp(
            Helpers.escapeStringForRegEx(toReplaceString2),
            'g',
          );
          // console.log(`[changeamp] relative: ${relative}`)
          content = content.replace(
            regex2,
            `../../../../${this.targetProjName}/${config.folder.src}`,
          );
          // console.log({ absFilePathTARGET: absFilePath })
        } else {
          const childName = relative.startsWith(config.folder.libs)
            ? _.first(relative.split('/').slice(1))
            : void 0;
          let toReplaceString2 = `../tmp-source-${this.buildOptions.outDir}/${config.folder.libs}/${childName}`;
          const regex2 = new RegExp(
            Helpers.escapeStringForRegEx(toReplaceString2),
            'g',
          );

          // let toReplaceString1 = `"${toReplaceString2}`;
          // console.log(`[changeamp]
          // childName: ${childName} relative: ${relative}`)
          if (childName) {
            content = content.replace(
              regex2,
              `../../../../${childName}/${config.folder.src}/${config.folder.lib}`,
            );
          } else {
            // don not modify anything
          }
          // console.log({ absFilePathLIBS: absFilePath })
        }
      } else {
        // debugging inside someone else project/node_modules/<pacakge>
        let toReplaceString2 = isBrowser
          ? `../tmp-${config.folder.libs}-for-${this.buildOptions.outDir}/${this.project.name}/projects/${this.project.name}/${config.folder.src}`
          : `../../../tmp-${config.folder.source}-${this.buildOptions.outDir}`;

        let toReplaceString1 = `"${toReplaceString2}`;
        const addon = `/${config.folder.libs}/(${this.children
          .map(c => {
            return Helpers.escapeStringForRegEx(
              CopyMangerHelpers.childPureName(c),
            );
          })
          .join('|')})`;

        const regex1 = new RegExp(
          Helpers.escapeStringForRegEx(toReplaceString1) + addon,
          'g',
        );
        const regex2 = new RegExp(
          Helpers.escapeStringForRegEx(toReplaceString2) + addon,
          'g',
        );

        content = content.replace(regex1, `"./${config.folder.src}`);
        content = content.replace(regex2, `${config.folder.src}`);
      }
    }

    content = this.sourceMapContentFix(content, isBrowser, absFilePath);

    return content;
    //#endregion
  }
  //#endregion

  //#region source map content fix
  sourceMapContentFix(
    content: string,
    isBrowser: boolean,
    absFilePath: string,
  ) {
    //#region @backendFunc
    if (
      // process.platform === 'win32' &&
      !isBrowser
    ) {
      const json = JSON.parse(content);
      if (json) {
        json.sources = (json.sources || []).map((pathToJoin: string) => {
          if (this.targetProj.releaseProcess.isInCiReleaseProject) {
            return '';
          }

          let dirnameAbs = crossPlatformPath(path.dirname(absFilePath));

          let resolved = crossPlatformPath(
            path.resolve(
              dirnameAbs,
              pathToJoin.startsWith('./')
                ? pathToJoin.replace('./', '')
                : pathToJoin,
            ),
          );

          const children = this.children;
          for (let index = 0; index < children.length; index++) {
            const child = children[index];

            // rule 1
            (() => {
              const localProjFolderName = `/${this.buildOptions.outDir}/${this.project.name}/${child.name}/tmp-source-${this.buildOptions.outDir}/`;
              if (resolved.includes(localProjFolderName)) {
                resolved = resolved.replace(
                  localProjFolderName,
                  `/${child.name}/src/`,
                );
              }
            })();

            // rule 2
            (() => {
              const ifFromLocal =
                `/${this.buildOptions.outDir}/${this.project.name}/${child.name}/tmp-local-copyto-proj-` +
                `${this.buildOptions.outDir}/${config.folder.node_modules}/${this.rootPackageName}/`;

              if (resolved.includes(ifFromLocal)) {
                const [child] = resolved
                  .replace(this.project.location, '')
                  .replace(ifFromLocal, '')
                  .split('/');
                // console.log('child: ' + child)
                resolved = resolved
                  .replace(ifFromLocal, `/`)
                  .replace(
                    `${this.project.location}/${child}/src/`,
                    `${this.project.location}/${child}/src/lib/`,
                  );
              }
            })();

            // rule 3
            (() => {
              const isFromNonTarget = `/-/${child.name}/`;
              if (resolved.includes(isFromNonTarget)) {
                // const toRep = `/${config.folder.src}/-/`;
                let [__, relative] = resolved.split(isFromNonTarget);
                // console.log(`relative "${relative}"`)
                const child = path.basename(resolved.replace(relative, ''));
                // console.log(`CHILD "${child}"`)
                // const relative = resolved.replace(this.project.location, '').split('/').slice(4).join('/');
                resolved = crossPlatformPath([
                  this.project.location,
                  child,
                  config.folder.src,
                  relative,
                ]);
              }
            })();
          }

          return resolved;
        });
      }
      content = JSON.stringify(json);
    }
    return content;
    //#endregion
  }
  //#endregion

  //#region write specific for child dts files
  /**
   * final copy from dist to node_moules/rootpackagename
   */
  writeSpecyficForChildDtsFiles(
    destination: Project,
    rootPackageNameForChildBrowser: string,
    monitorDirForModuleBrowser: string,
  ) {
    //#region @backendFunc
    const pkgLocInDestNodeModulesForChildBrowser =
      destination.nodeModules.pathFor(rootPackageNameForChildBrowser);
    const filter = Helpers.filterDontCopy(
      this.sourceFolders,
      monitorDirForModuleBrowser,
    );
    // console.log('COPY', {
    //   monitorDirForModuleBrowser, pkgLocInDestNodeModulesForChildBrowser
    // })
    this.removeSourceLinksFolders(pkgLocInDestNodeModulesForChildBrowser);
    Helpers.copy(
      monitorDirForModuleBrowser,
      pkgLocInDestNodeModulesForChildBrowser,
      {
        copySymlinksAsFiles: false,
        filter,
      },
    );
    //#endregion
  }
  //#endregion

  //#region child package name
  /**
   * example: '@angular/core'
   */
  childPackageName(child: Project) {
    //#region @backendFunc
    return crossPlatformPath([this.rootPackageName, child.name]);
    //#endregion
  }
  //#endregion

  //#region root pacakge name for child + browser
  /**
   * example: '@angular/core/(browser|websql)'
   */
  rootPackageNameForChildBrowser(
    child: Project,
    currentBrowserFolder: 'browser' | 'websql' | string,
  ) {
    //#region @backendFunc
    return crossPlatformPath([
      this.childPackageName(child),
      currentBrowserFolder,
    ]);
    //#endregion
  }
  //#endregion

  //#region fixes for dts child files
  fixesForChildDtsFile(
    destination: Project,
    isTempLocalProj: boolean,
    child: Project,
    currentBrowserFolder: 'browser' | 'websql' | string,
  ) {
    //#region @backendFunc
    // ex. @anguar/code/browser or @anguar/code/websql
    const rootPackageNameForChildBrowser = this.rootPackageNameForChildBrowser(
      child,
      currentBrowserFolder,
    );

    if (child.name === this.targetProjName) {
      // target is in lib.... -> no need for target also being in libs
      const monitorDirForModuleBrowser = isTempLocalProj //
        ? crossPlatformPath(
            path.join(
              this.monitoredOutDir,
              currentBrowserFolder,
              config.folder.lib,
            ),
          )
        : this.localTempProj.nodeModules.pathFor(
            rootPackageNameForChildBrowser,
          );

      if (isTempLocalProj) {
        // when destination === tmp-local-proj => fix d.ts imports in (dist)
        this.dtsFixer.processFolder(
          monitorDirForModuleBrowser,
          currentBrowserFolder,
        );
      }
      this.writeSpecyficForChildDtsFiles(
        destination,
        rootPackageNameForChildBrowser,
        monitorDirForModuleBrowser,
      );
    } else {
      const monitorDirForModuleBrowser = isTempLocalProj //
        ? crossPlatformPath(
            path.join(
              this.monitoredOutDir,
              currentBrowserFolder,
              config.folder.libs,
              child.name,
            ),
          )
        : this.localTempProj.nodeModules.pathFor(
            rootPackageNameForChildBrowser,
          );

      if (isTempLocalProj) {
        // when destination === tmp-local-proj => fix d.ts imports in (dist)
        this.dtsFixer.processFolder(
          monitorDirForModuleBrowser,
          currentBrowserFolder,
        );
      }
      this.writeSpecyficForChildDtsFiles(
        destination,
        rootPackageNameForChildBrowser,
        monitorDirForModuleBrowser,
      );
    }
    //#endregion
  }
  //#endregion

  //#region copy compiled source and declaration (browser)
  /**
   * Problem here: spliting es2022, esfm2015 to modules
   */
  copyCompiledSourcesAndDeclarationsBrowsersFolders(
    destination: Project,
    isTempLocalProj: boolean,
  ) {
    //#region @backendFunc
    // TODO LAST copy app.ts
    for (let index = 0; index < this.children.length; index++) {
      //#region prepare variables
      const child = this.children[index];
      this.angularCopyManger.fixPackageJson(child, destination);
      for (
        let index = 0;
        index < CopyMangerHelpers.browserwebsqlFolders.length;
        index++
      ) {
        const currentBrowserFolder =
          CopyMangerHelpers.browserwebsqlFolders[index];
        this.fixesForChildDtsFile(
          destination,
          isTempLocalProj,
          child,
          currentBrowserFolder,
        );
        this.angularCopyManger.fixPackageJson(
          child,
          destination,
          currentBrowserFolder,
        );
        this.angularCopyManger.fixBuildRelatedFiles(
          child,
          destination,
          currentBrowserFolder,
        );
        //#endregion
      }
    }

    for (
      let index = 0;
      index < CopyMangerHelpers.browserwebsqlFolders.length;
      index++
    ) {
      const currentBrowserFolder =
        CopyMangerHelpers.browserwebsqlFolders[index];
      CopyMangerHelpers.angularBrowserComiplationFoldersArr.forEach(
        angularCompilationFolder => {
          this.angularCopyManger.actionForFolder(
            destination,
            isTempLocalProj,
            currentBrowserFolder,
            angularCompilationFolder,
          );
        },
      );
    }
    //#endregion
  }
  //#endregion

  //#region files for specific target
  isForSpecyficTargetCompilation(specificFileRelativePath: string) {
    //#region @backendFunc
    specificFileRelativePath = crossPlatformPath(
      specificFileRelativePath,
    ).replace(/^\//, '');

    const shouldNotStartWith = [
      ...CopyMangerHelpers.browserwebsqlFolders,
      config.folder.libs,
      config.folder.node_modules,
      config.folder.src,
    ];
    for (let index = 0; index < shouldNotStartWith.length; index++) {
      const folder = shouldNotStartWith[index];
      if (specificFileRelativePath.startsWith(folder)) {
        return false;
      }
    }
    return true;
    //#endregion
  }

  filesForSpecyficTarget() {
    //#region @backendFunc
    const base = this.monitoredOutDir;
    const appFiles = Helpers.filesFrom([base, config.folder.app], true);
    const libFiles = Helpers.filesFrom([base, config.folder.lib], true);
    const otherLibsApps = this.children
      .filter(c => c.name !== this.targetProjName)
      .map(c => {
        const baseName = crossPlatformPath([base, '-', c.name]);
        // console.log(baseName)
        return Helpers.exists(baseName)
          ? Helpers.filesFrom(baseName, true)
          : [];
      })
      .reduce((a, b) => {
        return a.concat(b);
      }, []);

    // TODO add for children
    const appFlatFiles = Helpers.filesFrom(base);

    const allFiles = [
      ...appFiles,
      ...libFiles,
      ...appFlatFiles,
      ...otherLibsApps,
    ];

    return allFiles;
    //#endregion
  }
  //#endregion

  //#region fix additonal files and folder
  fixAdditonalFilesAndFolders(destination: Project) {
    //#region @backendFunc
    const additonakFiles = this.filesForSpecyficTarget();
    // console.log({
    //   additonakFiles
    // })
    additonakFiles.forEach(specificFileAbsPath => {
      const specificFileRelativePath = specificFileAbsPath.replace(
        `${this.monitoredOutDir}/`,
        '',
      );
      // if (specificFileRelativePath.endsWith('.d.ts')) {
      //   CopyMangerHelpers.browserwebsqlFolders.forEach(currentBrowserFolder => {
      //     const dtsFileAbsolutePath = crossPlatformPath(path.join(this.monitoredOutDir, specificFileRelativePath));
      //     this.dtsFixer.forFile(
      //       dtsFileAbsolutePath,
      //       currentBrowserFolder,
      //     );
      //   });
      // } else if (specificFileRelativePath.endsWith('.js.map')) {
      this.writeFixedMapFile(
        true,
        specificFileRelativePath,
        this.monitoredOutDir,
      );
      this.writeFixedMapFile(
        false,
        specificFileRelativePath,
        this.monitoredOutDir,
      );
      // }
    });
    //#endregion
  }
  //#endregion

  //#region replace d.ts files in destination after copy
  replaceIndexDtsForEntryPorjIndex(destination: Project) {
    //#region @backendFunc
    const children = this.getChildren();
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      const rootPackageNameForChild = crossPlatformPath(
        path.join(this.rootPackageName, child.name),
      );
      const location = destination.nodeModules.pathFor(rootPackageNameForChild);
      Helpers.writeFile(
        path.join(
          // override dts to easly debugging
          location,
          config.file.index_d_ts,
        ),
        `export * from './${config.folder.src}';\n`,
      );
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
    if (isTempLocalProj) {
      this.fixAdditonalFilesAndFolders(destination);
    }

    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];
      const rootPackageNameForChild = crossPlatformPath(
        path.join(this.rootPackageName, child.name),
      );
      const monitorDirForModule = isTempLocalProj //
        ? crossPlatformPath(
            path.join(this.monitoredOutDir, config.folder.libs, child.name),
          )
        : this.localTempProj.nodeModules.pathFor(rootPackageNameForChild);

      // if (isTempLocalProj) { // when destination === tmp-local-proj => fix d.ts imports in (dist)
      //   this.dtsFixer.processFolderWithBrowserWebsqlFolders(monitorDirForModule); // no need for fixing backend
      // }

      //#region final copy from dist to node_moules/rootpackagename
      const pkgLocInDestNodeModulesForChild = destination.nodeModules.pathFor(
        rootPackageNameForChild,
      );

      const filter = Helpers.filterDontCopy(
        this.sourceFolders,
        monitorDirForModule,
      );
      this.removeSourceLinksFolders(pkgLocInDestNodeModulesForChild);
      Helpers.copy(monitorDirForModule, pkgLocInDestNodeModulesForChild, {
        copySymlinksAsFiles: process.platform === 'win32',
        filter,
      });
      //#endregion
    }
    this.copyCompiledSourcesAndDeclarationsBrowsersFolders(
      destination,
      isTempLocalProj,
    );

    this.replaceIndexDtsFilesRootLevel(destination);
    //#endregion
  }
  //#endregion

  //#region replace d.ts files in destination after copy
  replaceIndexDtsFilesRootLevel(destination: Project) {
    //#region @backendFunc
    Helpers.writeFile(
      path.join(
        destination.location,
        config.folder.node_modules,
        this.rootPackageName,
        config.file.index_d_ts,
      ),
      `// Plase use: import { < anything > } from '@${
        this.project.name
      }/<${this.children.map(c => c.name).join('|')}>';\n`,
    );
    //#endregion
  }
  //#endregion

  //#region source for child
  sourcePathToLinkFor(child: Project) {
    //#region @backendFunc
    const sourceToLink = crossPlatformPath(
      path.join(
        this.project.location,
        child.name,
        config.folder.src,
        config.folder.lib,
      ),
    );
    return sourceToLink;
    //#endregion
  }
  //#endregion

  //#region destination packge link source (usuall 'src' folder) location
  /**
   * source folder locaiton
   */
  destPackageLinkSourceLocation(
    destination: Project,
    child: Project,
    currentBrowserFolder?: 'browser' | 'websql' | string,
  ) {
    //#region @backendFunc
    const destPackageLinkSourceLocation = currentBrowserFolder
      ? crossPlatformPath(
          path.join(
            destination.nodeModules.pathFor(this.childPackageName(child)),
            currentBrowserFolder,
            config.folder.source,
          ),
        )
      : crossPlatformPath(
          path.join(
            destination.nodeModules.pathFor(this.childPackageName(child)),
            config.folder.source,
          ),
        );

    return destPackageLinkSourceLocation;
    //#endregion
  }
  /**
   *'src.d.ts location
   */
  destPackageLinkSourceSrcDtsLocation(
    destination: Project,
    child: Project,
    currentBrowserFolder?: 'browser' | 'websql' | string,
  ) {
    //#region @backendFunc
    const destPackageLinkSourceLocation = currentBrowserFolder
      ? crossPlatformPath(
          path.join(
            destination.nodeModules.pathFor(this.childPackageName(child)),
            currentBrowserFolder,
            'src.d.ts',
          ),
        )
      : crossPlatformPath(
          path.join(
            destination.nodeModules.pathFor(this.childPackageName(child)),
            'src.d.ts',
          ),
        );

    return destPackageLinkSourceLocation;
    //#endregion
  }
  //#endregion

  //#region add source symlinks
  addSourceSymlinks(destination: Project): void {
    //#region @backendFunc
    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];
      const source = this.destPackageLinkSourceLocation(destination, child);
      const srcDts = this.destPackageLinkSourceSrcDtsLocation(
        destination,
        child,
      );
      const childLibLocation = this.sourcePathToLinkFor(child);

      Helpers.removeIfExists(source);
      Helpers.createSymLink(childLibLocation, source);
      Helpers.writeFile(
        srcDts,
        `
  // THIS FILE IS GENERATED
  export * from './source';
  // THIS FILE IS GENERATED
  // please use command: taon build:watch to see here links for your globally builded lib code files
  // THIS FILE IS GENERATED
                    `.trimStart(),
      );
    }
    //#endregion
  }
  //#endregion

  //#region remove source symlinks
  removeSourceSymlinks(destination: Project): void {
    //#region @backendFunc
    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];

      // source
      const source = this.destPackageLinkSourceLocation(destination, child);
      const srcDts = this.destPackageLinkSourceSrcDtsLocation(
        destination,
        child,
      );

      Helpers.writeFile(
        srcDts,
        `
// THIS FILE IS GENERATED
export * from './lib';
// THIS FILE IS GENERATED
// please use command: taon build:watch to see here links for your globally builded lib code files
// THIS FILE IS GENERATED
                    `.trimStart(),
      );
      Helpers.removeIfExists(source);
    }
    //#endregion
  }
  //#endregion

  //#region fix backend and browser js map files in local project
  fixBackendAndBrowserJsMapFilesInLocalProj() {
    //#region @backendFunc
    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];
      const destinationPackageLocation = this.localTempProj.nodeModules.pathFor(
        this.childPackageName(child),
      );

      for (
        let index = 0;
        index < CopyMangerHelpers.browserwebsqlFolders.length;
        index++
      ) {
        const currentBrowserFolder =
          CopyMangerHelpers.browserwebsqlFolders[index];
        this.fixJsMapFiles(destinationPackageLocation, currentBrowserFolder);
      }

      this.fixJsMapFiles(destinationPackageLocation);
    }
    //#endregion
  }
  //#endregion

  //#region copy backend and browser js map files from local project to destination
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

  //#region write fixed map file for cli
  writeFixedMapFileForCli(
    isForBrowser: boolean,
    specificFileRelativePath: string,
    destinationPackageLocation: string, // it is local path but is should not be!
  ) {
    //#region @backendFunc
    // TODO QUICK FIX
    if (
      crossPlatformPath(destinationPackageLocation) ==
      this.targetProj.pathFor(this.buildOptions.outDir)
    ) {
      super.writeFixedMapFileForCli(
        isForBrowser,
        specificFileRelativePath,
        destinationPackageLocation,
      );
      return;
    }

    let childName = destinationPackageLocation.replace(
      `${this.localTempProj.nodeModules.pathFor(this.rootPackageName)}/`,
      '',
    );

    let child = this.children.find(c => c.name === childName);
    if (!child) {
      childName = _.first(destinationPackageLocation.split('/').splice(-2));
      child = this.children.find(c => c.name === childName);
    }

    const monitoredOutDirFileToReplaceBack = crossPlatformPath(
      path.join(
        this.targetProj.pathFor(this.buildOptions.outDir),
        config.folder.libs,
        childName,
        specificFileRelativePath,
      ),
    );

    // console.log(`tryingfix: ${monitoredOutDirFileToReplaceBack}
    //  "${destinationPackageLocation}" "${specificFileRelativePath}" child: ${childName}`)

    if (!child) {
      super.writeFixedMapFileForCli(
        isForBrowser,
        specificFileRelativePath,
        destinationPackageLocation,
      );
      return;
    }

    if (Helpers.exists(monitoredOutDirFileToReplaceBack)) {
      const fixedContentCLIDebug = this.changedJsMapFilesInternalPathesForDebug(
        Helpers.readFile(monitoredOutDirFileToReplaceBack),
        isForBrowser,
        true,
        monitoredOutDirFileToReplaceBack,
      );

      Helpers.writeFile(monitoredOutDirFileToReplaceBack, fixedContentCLIDebug);
    }
    //#endregion
  }
  //#endregion

  //#region handle copy of single file

  //#region handle copy of single file / from child from libs
  handleCopyOfSingleFileForChildFromLibs(
    specificFileRelativePath: string,
    destination: Project,
    isTempLocalProj: boolean,
    wasRecrusive: boolean,
    specialReplace: '-' | 'libs' = config.folder.libs as any,
  ) {
    //#region @backendFunc
    const specialAppFilesMode = specialReplace === '-';
    const orgSpecyficFileRelativePath = specificFileRelativePath;

    const distLocation = crossPlatformPath(
      path.join(this.targetProj.location, this.buildOptions.outDir),
    );
    let absOrgFilePathInDist = crossPlatformPath(
      path.normalize(path.join(distLocation, orgSpecyficFileRelativePath)),
    );

    const childName = _.first(specificFileRelativePath.split('/').slice(1));
    const child = this.children.find(c => c.name === childName);

    if (!child) {
      Helpers.warn(`NO CHILD FOR ${specificFileRelativePath}`);
      return;
    }

    specificFileRelativePath = specificFileRelativePath.replace(
      `${specialReplace}/${childName}/`,
      '',
    );
    const rootPackageNameForChild = crossPlatformPath(
      path.join(this.rootPackageName, child.name),
    );

    Helpers.log(
      `Handle single file: ${specificFileRelativePath} for ${rootPackageNameForChild}`,
    );

    if (!wasRecrusive) {
      this.preventWeakDetectionOfchanges(
        orgSpecyficFileRelativePath,
        destination,
        isTempLocalProj,
      );
    }

    const destinationFilePath = crossPlatformPath(
      path.normalize(
        path.join(
          destination.nodeModules.pathFor(rootPackageNameForChild),
          specificFileRelativePath,
        ),
      ),
    );

    if (!isTempLocalProj && !specialAppFilesMode) {
      const readyToCopyFileInLocalTempProj = crossPlatformPath(
        path.join(
          this.localTempProj.nodeModules.pathFor(rootPackageNameForChild),
          specificFileRelativePath,
        ),
      );
      // Helpers.log(`Eqal content with temp proj: ${}`)
      if (Helpers.exists(readyToCopyFileInLocalTempProj)) {
        // TODO QUICK_FIX when creating empty file
        Helpers.copyFile(readyToCopyFileInLocalTempProj, destinationFilePath);
      }
      return;
    }

    // TODO QUICK_FIOX DISTINC WHEN IT COM FROM BROWSER
    // and do not allow
    if (destinationFilePath.endsWith('d.ts')) {
      const newAbsOrgFilePathInDist = absOrgFilePathInDist.replace(
        `/${this.targetProjName}/${this.buildOptions.outDir}/${orgSpecyficFileRelativePath}`,
        `/${this.targetProjName}/${this.buildOptions.outDir}-nocutsrc/${orgSpecyficFileRelativePath}`,
      );
      if (!Helpers.exists(newAbsOrgFilePathInDist)) {
        Helpers.log(
          `[copyto] New path does not exists or in browser | websql: ${newAbsOrgFilePathInDist}`,
        );
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
        if (specialAppFilesMode) {
          const fixedContentCLIDebug =
            this.changedJsMapFilesInternalPathesForDebug(
              Helpers.readFile(absOrgFilePathInDist),
              false,
              true,
              absOrgFilePathInDist,
            );
          Helpers.writeFile(absOrgFilePathInDist, fixedContentCLIDebug);
        } else {
          this.writeFixedMapFile(
            false,
            specificFileRelativePath,
            destination.nodeModules.pathFor(rootPackageNameForChild),
          );
        }
      }
      if (isBrowserMapsFile) {
        if (specialAppFilesMode) {
          const fixedContentCLIDebug =
            this.changedJsMapFilesInternalPathesForDebug(
              Helpers.readFile(absOrgFilePathInDist),
              false,
              true,
              absOrgFilePathInDist,
            );
          Helpers.writeFile(absOrgFilePathInDist, fixedContentCLIDebug);
        } else {
          this.writeFixedMapFile(
            true,
            specificFileRelativePath,
            destination.nodeModules.pathFor(rootPackageNameForChild),
          );
        }
      }
    } else {
      Helpers.writeFile(
        destinationFilePath,
        Helpers.readFile(absOrgFilePathInDist) || '',
      );
    }
    //#endregion
  }
  //#endregion

  //#region handle copy of single file / from app or root of (dist)
  handleCopyOfSingleFileFromAppAndRoot(
    specificFileRelativePath: string,
    destination: Project,
    isTempLocalProj: boolean,
    wasRecrusive: boolean,
  ) {
    //#region @backendFunc
    const orgSpecyficFileRelativePath = specificFileRelativePath;

    const distLocation = crossPlatformPath(
      path.join(this.targetProj.location, this.buildOptions.outDir),
    );
    const absOrgFilePathInDist = crossPlatformPath(
      path.normalize(path.join(distLocation, orgSpecyficFileRelativePath)),
    );

    const isBackendMapsFileAppJS = specificFileRelativePath.endsWith('.js.map');
    const isBrowserMapsFileAppJS =
      specificFileRelativePath.endsWith('.mjs.map');

    // this.fixDtsImportsWithWronPackageName(
    //   absOrgFilePathInDist,
    //   absOrgFilePathInDist,
    // );

    if (isBackendMapsFileAppJS || isBrowserMapsFileAppJS) {
      if (isBackendMapsFileAppJS) {
        this.writeFixedMapFile(false, specificFileRelativePath, distLocation);
      }
      if (isBrowserMapsFileAppJS) {
        this.writeFixedMapFile(true, specificFileRelativePath, distLocation);
      }
    }
    //#endregion
  }
  //#endregion

  //#region handle copy of single file / from non target apps
  handleCopyOfSingleFileFromNonTargetFiles(
    specificFileRelativePath: string,
    destination: Project,
    isTempLocalProj: boolean,
    wasRecrusive: boolean,
  ) {
    //#region @backendFunc
    this.handleCopyOfSingleFileForChildFromLibs(
      specificFileRelativePath,
      destination,
      isTempLocalProj,
      wasRecrusive,
      '-',
    );
    //#endregion
  }
  //#endregion

  handleCopyOfAssetFile(absoluteAssetFilePath: string, destination: Project) {
    //#region @backendFunc
    absoluteAssetFilePath = crossPlatformPath(absoluteAssetFilePath);
    const monitoredOutDirSharedAssets = this.monitoredOutDirSharedAssets;
    for (let index = 0; index < monitoredOutDirSharedAssets.length; index++) {
      const folderAssetsShareAbsPath = crossPlatformPath(
        monitoredOutDirSharedAssets[index],
      );
      if (absoluteAssetFilePath.startsWith(folderAssetsShareAbsPath)) {
        const relativePath = absoluteAssetFilePath.replace(
          `${folderAssetsShareAbsPath}/`,
          '',
        );

        const childName = absoluteAssetFilePath
          .replace(`${this.project.location}/`, '')
          .replace(
            `/${config.folder.src}/${config.folder.assets}/${config.folder.shared}/${relativePath}`,
            '',
          );

        const dest = destination.nodeModules.pathFor(
          `${this.rootPackageName}/${childName}/${config.folder.assets}/${config.folder.shared}/${relativePath}`,
        );

        Helpers.remove(dest, true);
        if (Helpers.exists(absoluteAssetFilePath)) {
          Helpers.copyFile(absoluteAssetFilePath, dest);
        }
      }
    }
    //#endregion
  }

  handleCopyOfSingleFile(
    destination: Project,
    isTempLocalProj: boolean,
    specificFileRelativePath: string,
    wasRecrusive = false,
  ): void {
    //#region @backendFunc
    specificFileRelativePath = crossPlatformPath(
      specificFileRelativePath,
    ).replace(/^\//, '');
    if (this.notAllowedFiles.includes(specificFileRelativePath)) {
      return;
    }

    if (
      specificFileRelativePath.startsWith(config.folder.libs) ||
      specificFileRelativePath.startsWith(
        [config.folder.assets, config.folder.shared].join('/'),
      )
    ) {
      this.handleCopyOfSingleFileForChildFromLibs(
        specificFileRelativePath,
        destination,
        isTempLocalProj,
        wasRecrusive,
      );
    } else if (
      specificFileRelativePath.startsWith(config.folder.browser) ||
      specificFileRelativePath.startsWith(config.folder.websql)
    ) {
      this.angularCopyManger.handleCopyOfSingleFile(
        specificFileRelativePath,
        destination,
        isTempLocalProj,
        wasRecrusive,
      );
    } else if (specificFileRelativePath.startsWith('-')) {
      this.handleCopyOfSingleFileFromNonTargetFiles(
        specificFileRelativePath,
        destination,
        isTempLocalProj,
        wasRecrusive,
      );
    } else {
      this.handleCopyOfSingleFileFromAppAndRoot(
        specificFileRelativePath,
        destination,
        isTempLocalProj,
        wasRecrusive,
      );
    }
    //#endregion
  }
  //#endregion

  //#region update backend full dts files
  /**
   * package ready to realse should have all/full *.d.ts files.. .to avoid any
   * erors when we import more "ui package" to backend code
   */
  updateBackendFullDtsFiles(destinationOrDist: Project | string) {
    //#region @backendFunc
    const base = crossPlatformPath(
      path.join(
        this.targetProj.location,
        `${this.buildOptions.outDir}-nocutsrc`,
        config.folder.libs,
      ),
    );

    const filesToUpdate = Helpers.filesFrom(base, true)
      .filter(f => f.endsWith('.d.ts'))
      .map(f => f.replace(`${base}/`, ''));

    for (let index = 0; index < filesToUpdate.length; index++) {
      const relativePath = filesToUpdate[index];
      // const childName = _.first(relativePath.split('/'));
      const source = crossPlatformPath(path.join(base, relativePath));
      const dest = crossPlatformPath(
        path.join(
          _.isString(destinationOrDist)
            ? crossPlatformPath(
                path.join(this.monitoredOutDir, config.folder.libs),
              )
            : destinationOrDist.nodeModules.pathFor(
                crossPlatformPath(
                  path.join(
                    this.rootPackageName,
                    // childName,
                  ),
                ),
              ),
          relativePath,
        ),
      );
      // console.log({
      //   source, dest
      // })
      // if (Helpers.exists(dest)) {
      // console.log(dest)
      const sourceContent = Helpers.readFile(source);

      Helpers.writeFile(dest, this.dtsFixer.forBackendContent(sourceContent));
      // }
    }
    //#endregion
  }
  //#endregion
}
