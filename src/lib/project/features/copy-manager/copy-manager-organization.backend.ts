import { config } from "tnp-config";
import { crossPlatformPath, glob, path, _ } from "tnp-core";
import { BuildOptions } from "tnp-db";
import { Helpers } from "tnp-helpers";
import { Models } from "tnp-models";
import { CLASS } from "typescript-class-helpers";
import { Project } from "../../abstract/project/project";
import { BundleMjsFesmModuleSpliter } from "./bundle-mjs-fesm-module-spliter.backend";
import { CopyMangerHelpers } from "./copy-manager-helpers.backend";
import { CopyMangerOrganizationAngularFiles } from "./copy-manager-organization-angular-files.backend";
import { CopyManagerStandalone } from "./copy-manager-standalone.backend";

@CLASS.NAME('CopyManagerOrganization')
export class CopyManagerOrganization extends CopyManagerStandalone {
  protected readonly children: Project[];
  protected readonly angularCopyManger: CopyMangerOrganizationAngularFiles;

  //#region target project name
  /**
   * target name for organizaiton (smart container) build
   */
  get targetProjName() {
    const target = _.first((this.args || '').split(' ')).replace('/', '')
    if (target?.startsWith('--')) {
      return;
    }
    return target;
  }
  //#endregion

  //#region target project path
  get targetProjPath() {
    return crossPlatformPath(path.join(
      this.project.location,
      this.outDir,
      this.project.name,
      this.targetProjName,
    ));
  }
  //#endregion

  //#region target project
  get targetProj() {
    return Project.From(this.targetProjPath) as Project;
  }
  //#endregion

  //#region init
  init(
    buildOptions: BuildOptions,
    renameDestinationFolder?: string,
  ) {
    super.init(buildOptions, renameDestinationFolder);
    // @ts-ignore
    this.children = this.getChildren();
    // @ts-ignore
    this.angularCopyManger = new CopyMangerOrganizationAngularFiles(this);
  }
  //#endregion

  //#region recreate temp proj
  recreateTempProj() {
    if (!this.targetProjName) {
      // @ts-ignore
      this.args = `${this.project.smartContainerBuildTarget.name} ${this.args}`;
    }
    super.recreateTempProj();
  }
  //#endregion

  //#region _ copy builded distibutino to

  _copyBuildedDistributionTo(
    destination: Project,
    options?: {
      specyficFileRelativePath?: string,
      outDir?: Models.dev.BuildDir,
      event?: any,
      files?: string[]
    }
  ) {
    super._copyBuildedDistributionTo(destination, options);
  }
  //#endregion

  //#region local temp proj path
  get localTempProjPath() {
    const targetProjPath = crossPlatformPath(path.join(
      this.targetProjPath,
      this.tempProjName,
    ));
    return crossPlatformPath(targetProjPath)
  }
  //#endregion

  //#region root package name
  get rootPackageName() {
    const rootPackageName = ((
      _.isString(this.renameDestinationFolder) && this.renameDestinationFolder !== '')
      ? this.renameDestinationFolder
      : `@${this.project.name}`
    );
    return rootPackageName
  }
  //#endregion

  //#region monitored out dir
  get monitoredOutDir(): string {
    const monitorDir: string = crossPlatformPath(path.join(
      this.targetProjPath,
      this.outDir
    ));
    return monitorDir;
  }
  //#endregion


  get monitoredOutDirSharedAssets(): string[] {
    const assetsFolders = this.project.children.map(c => {
      const monitorDir: string = crossPlatformPath([
        c.location,
        config.folder.src,
        config.folder.assets,
        config.folder.shared,
      ]);
      return monitorDir;
    })

    return assetsFolders;
  }


  //#region get chhildren
  getChildren(): Project[] {
    return [
      this.project.children.find(c => c.name === this.targetProjName),
      ...this.project.children.filter(c => c.name !== this.targetProjName),
    ].filter(f => !!f)
  }
  //#endregion

  //#region links for packages are ok
  linksForPackageAreOk(destination: Project): boolean {
    return true;
    // TODO
    const destPackageLinkSourceLocation = crossPlatformPath(path.join(
      destination.location,
      config.folder.node_modules,
      this.rootPackageName,
      config.folder.src
    ));

    return Helpers.exists(destPackageLinkSourceLocation);
  }
  //#endregion



  //#region initial fix for destination pacakge
  initalFixForDestination(destination: Project): void {

    const destPackageInNodeModules = crossPlatformPath(path.join(
      destination.location,
      config.folder.node_modules,
      this.rootPackageName
    ));

    this.createCopyForRestore(destPackageInNodeModules, destination);

    for (let index = 0; index < CopyMangerHelpers.browserwebsqlFolders.length; index++) {
      const currentBrowserFolder = CopyMangerHelpers.browserwebsqlFolders[index];
      const destPackageInNodeModulesBrowser = crossPlatformPath(path.join(destPackageInNodeModules, currentBrowserFolder));

      Helpers.remove(destPackageInNodeModulesBrowser);
      const children = this.children;

      for (let index = 0; index < children.length; index++) {
        const child = children[index];
        // if (!child) {
        //   debugger
        // }
        const childDestPackageInNodeModules = crossPlatformPath(path.join(
          destPackageInNodeModules,
          CopyMangerHelpers.childPureName(child)
        ));

        const childDestPackageInNodeModulesBrowser = crossPlatformPath(path.join(
          destPackageInNodeModules,
          CopyMangerHelpers.childPureName(child),
          currentBrowserFolder,
        ));

        if (Helpers.isSymlinkFileExitedOrUnexisted(childDestPackageInNodeModules)) {
          Helpers.removeFileIfExists(childDestPackageInNodeModules);
        }
        if (!Helpers.exists(childDestPackageInNodeModules)) {
          Helpers.mkdirp(childDestPackageInNodeModules);
        }
        if (Helpers.isSymlinkFileExitedOrUnexisted(childDestPackageInNodeModulesBrowser)) {
          Helpers.removeFileIfExists(childDestPackageInNodeModulesBrowser);
        }
        if (!Helpers.exists(childDestPackageInNodeModulesBrowser)) {
          Helpers.mkdirp(childDestPackageInNodeModulesBrowser);
        }
      }

    }
  }
  //#endregion

  //#region transform map files
  changedJsMapFilesInternalPathesForDebug(
    content: string,
    isBrowser: boolean,
    isForLaunchJsonDebugging: boolean,
    absFilePath: string,
  ): string {


    if (!content || (!absFilePath.endsWith('.js.map') && !absFilePath.endsWith('.mjs.map'))) {
      // Helpers.warn(`[copytomanager] Empty content for ${absFilePath}`);
      return content;
    }

    // console.log({ fixing: absFilePath })

    if (isBrowser) {
      // TODO is angular maps not working in chrome debugger (the did not work whe switch lazy modules)
      // content = content.replace(regex1, `"./${config.folder.src}`);
      // content = content.replace(regex2, config.folder.src);
    } else {
      if (isForLaunchJsonDebugging) { // files is in dist or bundle or container target project
        // I am not allowing organizaition as cli tool

        const relative = crossPlatformPath(absFilePath).replace(`${this.monitoredOutDir}/`, '');


        if (this.isForSpecyficTargetCompilation(relative)) {
          let toReplaceString2 = `../tmp-source-${this.outDir}`;

          // let toReplaceString1 = `"${toReplaceString2}`;

          const regex2 = new RegExp(Helpers.escapeStringForRegEx(toReplaceString2), 'g');
          // console.log(`[changeamp] relative: ${relative}`)
          content = content.replace(regex2, `../../../../${this.targetProjName}/${config.folder.src}`);
          // console.log({ absFilePathTARGET: absFilePath })
        } else {

          const childName = relative.startsWith(config.folder.libs) ? _.first(relative.split('/').slice(1)) : void 0;
          let toReplaceString2 = `../tmp-source-${this.outDir}/${config.folder.libs}/${childName}`;
          const regex2 = new RegExp(Helpers.escapeStringForRegEx(toReplaceString2), 'g');

          // let toReplaceString1 = `"${toReplaceString2}`;
          // console.log(`[changeamp]
          // childName: ${childName} relative: ${relative}`)
          if (childName) {
            content = content.replace(regex2, `../../../../${childName}/${config.folder.src}/${config.folder.lib}`);
          } else {
            // don not modify anything
          }
          // console.log({ absFilePathLIBS: absFilePath })
        }
      } else { // debugging inside someone else project/node_modules/<pacakge>
        let toReplaceString2 = isBrowser
          ? `../tmp-${config.folder.libs}-for-${this.outDir}/${this.project.name}/projects/${this.project.name}/${config.folder.src}`
          : ((`../../../tmp-${config.folder.source}-${this.outDir}`));

        let toReplaceString1 = `"${toReplaceString2}`;
        const addon = `/${config.folder.libs}/(${this.children.map(c => {
          return Helpers.escapeStringForRegEx(CopyMangerHelpers.childPureName(c));
        }).join('|')})`;

        const regex1 = new RegExp(Helpers.escapeStringForRegEx(toReplaceString1) + addon, 'g');
        const regex2 = new RegExp(Helpers.escapeStringForRegEx(toReplaceString2) + addon, 'g');

        content = content.replace(regex1, `"./${config.folder.src}`);
        content = content.replace(regex2, `${config.folder.src}`);
      }
    }

    content = this.sourceMapContentFix(content, isBrowser, absFilePath);

    return content;
  }
  //#endregion

  sourceMapContentFix(content: string, isBrowser: boolean, absFilePath: string) {

    if (
      // process.platform === 'win32' &&
      !isBrowser) {
      const json = JSON.parse(content);
      if (json) {

        json.sources = (json.sources || []).map((pathToJoin: string) => {
          if (this.targetProj.isInRelaseBundle) {
            return '';
          }

          let dirnameAbs = crossPlatformPath(path.dirname(absFilePath))

          let resolved = crossPlatformPath(path.resolve(dirnameAbs, pathToJoin.startsWith('./') ? pathToJoin.replace('./', '') : pathToJoin));


          const children = this.children;
          for (let index = 0; index < children.length; index++) {
            const child = children[index];

            // rule 1
            (() => {
              const localProjFolderName = `/${this.outDir}/${this.project.name}/${child.name}/tmp-source-${this.outDir}/`;
              if (resolved.includes(localProjFolderName)) {
                resolved = resolved.replace(localProjFolderName, `/${child.name}/src/`);
              }
            })();

            // rule 2
            (() => {

              const ifFromLocal = `/${this.outDir}/${this.project.name}/${child.name}/tmp-local-copyto-proj-${this.outDir}/${config.folder.node_modules}/${this.rootPackageName}/`;

              if (resolved.includes(ifFromLocal)) {
                const [child] = resolved.replace(this.project.location, '').replace(ifFromLocal, '').split('/')
                // console.log('child: ' + child)
                resolved = resolved
                  .replace(ifFromLocal, `/`)
                  .replace(`${this.project.location}/${child}/src/`, `${this.project.location}/${child}/src/lib/`)
                  ;
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
                resolved = crossPlatformPath([this.project.location, child, config.folder.src, relative]);
              }
            })();
          }

          return resolved;
        })


      }
      content = JSON.stringify(json);
    }
    return content;
  }

  //#region write specyfic for child dts files
  /**
   * final copy from dist|bundle to node_moules/rootpackagename
   */
  writeSpecyficForChildDtsFiles(destination: Project, rootPackageNameForChildBrowser: string, monitorDirForModuleBrowser: string) {
    const pkgLocInDestNodeModulesForChildBrowser = destination.node_modules.pathFor(rootPackageNameForChildBrowser);
    const filter = Helpers.filterDontCopy(this.sourceFolders, monitorDirForModuleBrowser);
    // console.log('COPY', {
    //   monitorDirForModuleBrowser, pkgLocInDestNodeModulesForChildBrowser
    // })
    this.removeSourceLinksFolders(pkgLocInDestNodeModulesForChildBrowser);
    Helpers.copy(monitorDirForModuleBrowser, pkgLocInDestNodeModulesForChildBrowser, {
      copySymlinksAsFiles: false,
      filter,
    });
  }
  //#endregion

  //#region child package name
  /**
   * example: '@angular/core'
   */
  childPackageName(child: Project) {
    return crossPlatformPath(path.join(this.rootPackageName, child.name));
  }
  //#endregion

  //#region root pacakge name for child + browser
  /**
   * example: '@angular/core/(browser|websql)'
   */
  rootPackageNameForChildBrowser(child: Project, currentBrowserFolder: Models.dev.BuildDirBrowser) {
    return crossPlatformPath(path.join(this.childPackageName(child), currentBrowserFolder));
  }
  //#endregion

  //#region fixes for dts child files
  fixesForChildDtsFile(
    destination: Project,
    isTempLocalProj: boolean,
    child: Project,
    currentBrowserFolder: Models.dev.BuildDirBrowser,
  ) {

    // ex. @anguar/code/browser or @anguar/code/websql
    const rootPackageNameForChildBrowser = this.rootPackageNameForChildBrowser(child, currentBrowserFolder);

    if (child.name === this.targetProjName) { // target is in lib.... -> no need for target also being in libs
      const monitorDirForModuleBrowser = isTempLocalProj //
        ? crossPlatformPath(path.join(this.monitoredOutDir, currentBrowserFolder, config.folder.lib))
        : this.localTempProj.node_modules.pathFor(rootPackageNameForChildBrowser);

      if (isTempLocalProj) { // when destination === tmp-local-proj => fix d.ts imports in (dist|bundle)
        this.dtsFixer.processFolder(monitorDirForModuleBrowser, currentBrowserFolder);
      }
      this.writeSpecyficForChildDtsFiles(destination, rootPackageNameForChildBrowser, monitorDirForModuleBrowser);
    } else {
      const monitorDirForModuleBrowser = isTempLocalProj //
        ? crossPlatformPath(path.join(this.monitoredOutDir, currentBrowserFolder, config.folder.libs, child.name))
        : this.localTempProj.node_modules.pathFor(rootPackageNameForChildBrowser);

      if (isTempLocalProj) { // when destination === tmp-local-proj => fix d.ts imports in (dist|bundle)
        this.dtsFixer.processFolder(monitorDirForModuleBrowser, currentBrowserFolder);
      }
      this.writeSpecyficForChildDtsFiles(destination, rootPackageNameForChildBrowser, monitorDirForModuleBrowser);
    }
  }
  //#endregion

  //#region copy compiled source and declaration (browser)
  /**
   * Problem here: spliting es2022, esfm2015 to modules
   */
  copyCompiledSourcesAndDeclarationsBrowsersFolders(
    destination: Project,
    isTempLocalProj: boolean
  ) {
    // TODO LAST copy app.ts
    for (let index = 0; index < this.children.length; index++) {
      //#region prepare variables
      const child = this.children[index];
      this.angularCopyManger.fixPackageJson(child, destination);
      for (let index = 0; index < CopyMangerHelpers.browserwebsqlFolders.length; index++) {
        const currentBrowserFolder = CopyMangerHelpers.browserwebsqlFolders[index];
        this.fixesForChildDtsFile(destination, isTempLocalProj, child, currentBrowserFolder);
        this.angularCopyManger.fixPackageJson(child, destination, currentBrowserFolder);
        this.angularCopyManger.fixBuildRelatedFiles(child, destination, currentBrowserFolder);
        //#endregion
      }
    }

    for (let index = 0; index < CopyMangerHelpers.browserwebsqlFolders.length; index++) {
      const currentBrowserFolder = CopyMangerHelpers.browserwebsqlFolders[index];
      CopyMangerHelpers.angularBrowserComiplationFoldersArr
        .forEach(angularCompilationFolder => {
          this.angularCopyManger.actionForFolder(
            destination,
            isTempLocalProj,
            currentBrowserFolder,
            angularCompilationFolder,
          )
        });
    }



  }
  //#endregion

  //#region files for specyfic target
  isForSpecyficTargetCompilation(specyficFileRelativePath: string) {
    specyficFileRelativePath = crossPlatformPath(specyficFileRelativePath).replace(/^\//, '');

    const shouldNotStartWith = [
      ...CopyMangerHelpers.browserwebsqlFolders,
      config.folder.libs,
      config.folder.node_modules,
      config.folder.src,
    ];
    for (let index = 0; index < shouldNotStartWith.length; index++) {
      const folder = shouldNotStartWith[index];
      if (specyficFileRelativePath.startsWith(folder)) {
        return false;
      }
    }
    return true;
  }

  filesForSpecyficTarget() {
    const base = this.monitoredOutDir;
    const appFiles = Helpers.filesFrom([base, config.folder.app], true);
    const libFiles = Helpers.filesFrom([base, config.folder.lib], true);
    const otherLibsApps = this.children
      .filter(c => c.name !== this.targetProjName)
      .map(c => {
        const baseName = crossPlatformPath([base, '-', c.name]);
        // console.log(baseName)
        return Helpers.exists(baseName) ? Helpers.filesFrom(baseName, true) : [];
      })
      .reduce((a, b) => {
        return a.concat(b);
      }, []);

    // @LAST add for children
    const appFlatFiles = Helpers.filesFrom(base);

    const allFiles = [
      ...appFiles,
      ...libFiles,
      ...appFlatFiles,
      ...otherLibsApps
    ];

    return allFiles;
  }
  //#endregion

  //#region fix additonal files and folder
  fixAdditonalFilesAndFolders(destination: Project) {
    const additonakFiles = this.filesForSpecyficTarget();
    // console.log({
    //   additonakFiles
    // })
    additonakFiles.forEach(specyficFileAbsPath => {
      const specyficFileRelativePath = specyficFileAbsPath.replace(`${this.monitoredOutDir}/`, '');
      // if (specyficFileRelativePath.endsWith('.d.ts')) {
      //   CopyMangerHelpers.browserwebsqlFolders.forEach(currentBrowserFolder => {
      //     const dtsFileAbsolutePath = crossPlatformPath(path.join(this.monitoredOutDir, specyficFileRelativePath));
      //     this.dtsFixer.forFile(
      //       dtsFileAbsolutePath,
      //       currentBrowserFolder,
      //     );
      //   });
      // } else if (specyficFileRelativePath.endsWith('.js.map')) {
      this.writeFixedMapFile(true, specyficFileRelativePath, this.monitoredOutDir);
      this.writeFixedMapFile(false, specyficFileRelativePath, this.monitoredOutDir);
      // }
    });
  }
  //#endregion

  //#region replace d.ts files in destination after copy
  replaceIndexDtsForEntryPorjIndex(destination: Project) {
    const children = this.getChildren();
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      const rootPackageNameForChild = crossPlatformPath(path.join(this.rootPackageName, child.name));
      const location = destination.node_modules.pathFor(rootPackageNameForChild);
      Helpers.writeFile(path.join( // override dts to easly debugging
        location,
        config.file.index_d_ts,
      ), `export * from './${config.folder.src}';\n`);
    }
  }
  //#endregion

  //#region copy compiled sources and declarations
  copyCompiledSourcesAndDeclarations(destination: Project, isTempLocalProj: boolean) {

    if (isTempLocalProj) {
      this.fixAdditonalFilesAndFolders(destination);
    }

    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];
      const rootPackageNameForChild = crossPlatformPath(path.join(this.rootPackageName, child.name));
      const monitorDirForModule = isTempLocalProj //
        ? crossPlatformPath(path.join(this.monitoredOutDir, config.folder.libs, child.name))
        : this.localTempProj.node_modules.pathFor(rootPackageNameForChild);

      // if (isTempLocalProj) { // when destination === tmp-local-proj => fix d.ts imports in (dist|bundle)
      //   this.dtsFixer.processFolderWithBrowserWebsqlFolders(monitorDirForModule); // no need for fixing backend
      // }

      //#region final copy from dist|bundle to node_moules/rootpackagename
      const pkgLocInDestNodeModulesForChild = destination.node_modules.pathFor(rootPackageNameForChild);
      const filter = Helpers.filterDontCopy(this.sourceFolders, monitorDirForModule);
      this.removeSourceLinksFolders(pkgLocInDestNodeModulesForChild);
      Helpers.copy(monitorDirForModule, pkgLocInDestNodeModulesForChild, {
        copySymlinksAsFiles: (process.platform === 'win32'),
        filter,
      });
      //#endregion

    }
    this.copyCompiledSourcesAndDeclarationsBrowsersFolders(destination, isTempLocalProj);

    this.replaceIndexDtsFilesRootLevel(destination);
  }
  //#endregion

  //#region replace d.ts files in destination after copy
  replaceIndexDtsFilesRootLevel(destination: Project) {
    Helpers.writeFile(path.join(destination.location,
      config.folder.node_modules,
      this.rootPackageName,
      config.file.index_d_ts,
    ),
      `// Plase use: import { < anything > } from '@${this.project.name}/<${this.children.map(c => c.name).join('|')}>';\n`
    );
  }
  //#endregion

  //#region source for child
  sourcePathToLinkFor(child: Project) {
    const sourceToLink = crossPlatformPath(path.join(
      this.project.location,
      child.name,
      config.folder.src,
      config.folder.lib,
    ));
    return sourceToLink;
  }
  //#endregion

  //#region destination packge link source (usuall 'src' folder) location
  destPackageLinkSourceLocation(destination: Project, child: Project, currentBrowserFolder?: Models.dev.BuildDirBrowser) {
    const destPackageLinkSourceLocation = currentBrowserFolder ? crossPlatformPath(path.join(
      destination.node_modules.pathFor(this.childPackageName(child)),
      currentBrowserFolder,
      config.folder.src
    )) : crossPlatformPath(path.join(
      destination.node_modules.pathFor(this.childPackageName(child)),
      config.folder.src
    ));

    return destPackageLinkSourceLocation;
  }
  //#endregion

  //#region remove or add links
  private addOrRemoveSymlinks(destination: Project, remove = false) {
    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];

      const destPackageLinkSourceLocation = this.destPackageLinkSourceLocation(destination, child);
      Helpers.removeIfExists(destPackageLinkSourceLocation);
      if (!remove) {
        Helpers.createSymLink(this.sourcePathToLinkFor(child), destPackageLinkSourceLocation);
      }

      for (let index = 0; index < CopyMangerHelpers.browserwebsqlFolders.length; index++) {
        const currentBrowserFolder = CopyMangerHelpers.browserwebsqlFolders[index];
        const destPackageLinkSourceLocationForBrowser = this.destPackageLinkSourceLocation(
          destination,
          child,
          currentBrowserFolder,
        );
        Helpers.removeIfExists(destPackageLinkSourceLocationForBrowser);
        if (!remove) {
          Helpers.createSymLink(this.sourcePathToLinkFor(child), destPackageLinkSourceLocationForBrowser);
        }
      }
    }
  }
  //#endregion

  //#region add source symlinks
  addSourceSymlinks(destination: Project) {
    this.addOrRemoveSymlinks(destination);
  }
  //#endregion

  //#region remove source symlinks
  removeSourceSymlinks(destination: Project) {
    this.addOrRemoveSymlinks(destination, true);
  }
  //#endregion

  //#region fix backend and browser js map files in local project
  fixBackendAndBrowserJsMapFilesInLocalProj() {
    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];
      const destinationPackageLocation = this.localTempProj.node_modules.pathFor(this.childPackageName(child));

      for (let index = 0; index < CopyMangerHelpers.browserwebsqlFolders.length; index++) {
        const currentBrowserFolder = CopyMangerHelpers.browserwebsqlFolders[index];
        this.fixJsMapFiles(destinationPackageLocation, currentBrowserFolder);
      }

      this.fixJsMapFiles(destinationPackageLocation);
    }
  }
  //#endregion

  //#region copy backend and browser js map files from local project to destination
  copyBackendAndBrowserJsMapFilesFromLocalProjTo(destination: Project) {
    const destinationPackageLocation = this.localTempProj.node_modules.pathFor(this.rootPackageName);
    this.copyMapFilesesFromLocalToCopyToProj(destination, destinationPackageLocation);
  }
  //#endregion

  //#region write fixed map file for cli
  writeFixedMapFileForCli(
    isForBrowser: boolean,
    specyficFileRelativePath: string,
    destinationPackageLocation: string, // it is local path but is should not be!
  ) {

    // TODO QUICK FIX
    if (crossPlatformPath(destinationPackageLocation) == this.targetProj.pathFor(this.outDir)) {
      super.writeFixedMapFileForCli(isForBrowser, specyficFileRelativePath, destinationPackageLocation);
      return;
    }

    let childName = destinationPackageLocation
      .replace(`${this.localTempProj.node_modules.pathFor(this.rootPackageName)}/`, '');

    let child = this.children.find(c => c.name === childName);
    if (!child) {
      childName = _.first(destinationPackageLocation.split('/').splice(-2));
      child = this.children.find(c => c.name === childName);
    }

    const monitoredOutDirFileToReplaceBack = crossPlatformPath(path.join(
      this.targetProj.pathFor(this.outDir),
      config.folder.libs,
      childName,
      specyficFileRelativePath,
    ))

    // console.log(`tryingfix: ${monitoredOutDirFileToReplaceBack}
    //  "${destinationPackageLocation}" "${specyficFileRelativePath}" child: ${childName}`)

    if (!child) {
      super.writeFixedMapFileForCli(isForBrowser, specyficFileRelativePath, destinationPackageLocation);
      return;
    }

    if (Helpers.exists(monitoredOutDirFileToReplaceBack)) {
      const fixedContentCLIDebug = this.changedJsMapFilesInternalPathesForDebug(
        Helpers.readFile(monitoredOutDirFileToReplaceBack),
        isForBrowser,
        true,
        monitoredOutDirFileToReplaceBack,
      );

      Helpers.writeFile(
        monitoredOutDirFileToReplaceBack,
        fixedContentCLIDebug,
      );
    }
  }
  //#endregion

  //#region handle copy of single file

  //#region handle copy of single file / from child from libs
  handleCopyOfSingleFileForChildFromLibs(
    specyficFileRelativePath: string,
    destination: Project,
    isTempLocalProj: boolean,
    wasRecrusive: boolean,
    specialReplace: '-' | 'libs' = config.folder.libs as any
  ) {
    const specialAppFilesMode = (specialReplace === '-');
    const orgSpecyficFileRelativePath = specyficFileRelativePath;

    const distOrBundleLocation = crossPlatformPath(path.join(
      this.targetProj.location,
      this.outDir,
    ))
    let absOrgFilePathInDistOrBundle = crossPlatformPath(path.normalize(path.join(
      distOrBundleLocation,
      orgSpecyficFileRelativePath
    )));

    const childName = _.first(specyficFileRelativePath.split('/').slice(1));
    const child = this.children.find(c => c.name === childName);

    if (!child) {
      Helpers.warn(`NO CHILD FOR ${specyficFileRelativePath}`);
      return;
    }

    specyficFileRelativePath = specyficFileRelativePath.replace(`${specialReplace}/${childName}/`, '');
    const rootPackageNameForChild = crossPlatformPath(path.join(this.rootPackageName, child.name));

    Helpers.log(`Handle single file: ${specyficFileRelativePath} for ${rootPackageNameForChild}`)


    if (!wasRecrusive) {
      this.preventWeakDetectionOfchanges(orgSpecyficFileRelativePath, destination, isTempLocalProj);
    }

    const destinationFilePath = crossPlatformPath(path.normalize(path.join(
      destination.node_modules.pathFor(rootPackageNameForChild),
      specyficFileRelativePath
    )));

    if (!isTempLocalProj && !specialAppFilesMode) {
      const readyToCopyFileInLocalTempProj = crossPlatformPath(path.join(
        this.localTempProj.node_modules.pathFor(rootPackageNameForChild),
        specyficFileRelativePath
      ));
      // Helpers.log(`Eqal content with temp proj: ${}`)
      if (Helpers.exists(readyToCopyFileInLocalTempProj)) { // TODO QUICK_FIX when creating empty file
        Helpers.copyFile(readyToCopyFileInLocalTempProj, destinationFilePath);
      }
      return;
    }

    // TODO QUICK_FIOX DISTINC WHEN IT COM FROM BROWSER
    // and do not allow
    if (destinationFilePath.endsWith('d.ts')) {
      const newAbsOrgFilePathInDistOrBundle = absOrgFilePathInDistOrBundle.replace(
        `/${this.targetProjName}/${this.outDir}/${orgSpecyficFileRelativePath}`,
        `/${this.targetProjName}/${this.outDir}-nocutsrc/${orgSpecyficFileRelativePath}`,
      );
      if (!Helpers.exists(newAbsOrgFilePathInDistOrBundle)) {
        Helpers.log(`[copyto] New path does not exists or in browser | websql: ${newAbsOrgFilePathInDistOrBundle}`)
      } else {
        absOrgFilePathInDistOrBundle = newAbsOrgFilePathInDistOrBundle;
      }
    }

    this.fixDtsImportsWithWronPackageName(absOrgFilePathInDistOrBundle, destinationFilePath)

    const isBackendMapsFile = destinationFilePath.endsWith('.js.map');
    const isBrowserMapsFile = destinationFilePath.endsWith('.mjs.map');

    if (isBackendMapsFile || isBrowserMapsFile) {
      if (isBackendMapsFile) {
        if (specialAppFilesMode) {
          const fixedContentCLIDebug = this.changedJsMapFilesInternalPathesForDebug(
            Helpers.readFile(absOrgFilePathInDistOrBundle),
            false,
            true,
            absOrgFilePathInDistOrBundle,
          );
          Helpers.writeFile(
            absOrgFilePathInDistOrBundle,
            fixedContentCLIDebug,
          );
        } else {
          this.writeFixedMapFile(
            false,
            specyficFileRelativePath,
            destination.node_modules.pathFor(rootPackageNameForChild),
          )
        }

      }
      if (isBrowserMapsFile) {
        if (specialAppFilesMode) {
          const fixedContentCLIDebug = this.changedJsMapFilesInternalPathesForDebug(
            Helpers.readFile(absOrgFilePathInDistOrBundle),
            false,
            true,
            absOrgFilePathInDistOrBundle,
          );
          Helpers.writeFile(
            absOrgFilePathInDistOrBundle,
            fixedContentCLIDebug,
          );
        } else {
          this.writeFixedMapFile(
            true,
            specyficFileRelativePath,
            destination.node_modules.pathFor(rootPackageNameForChild),
          )
        }
      }
    } else {
      Helpers.writeFile(destinationFilePath, (Helpers.readFile(absOrgFilePathInDistOrBundle) || ''));
    }
  }
  //#endregion

  //#region handle copy of single file / from app or root of (dist|bundle)
  handleCopyOfSingleFileFromAppAndRoot(
    specyficFileRelativePath: string,
    destination: Project,
    isTempLocalProj: boolean,
    wasRecrusive: boolean,
  ) {
    const orgSpecyficFileRelativePath = specyficFileRelativePath;

    const distOrBundleLocation = crossPlatformPath(path.join(
      this.targetProj.location,
      this.outDir,
    ))
    const absOrgFilePathInDistOrBundle = crossPlatformPath(path.normalize(path.join(
      distOrBundleLocation,
      orgSpecyficFileRelativePath
    )));

    const isBackendMapsFileAppJS = specyficFileRelativePath.endsWith('.js.map');
    const isBrowserMapsFileAppJS = specyficFileRelativePath.endsWith('.mjs.map');

    // this.fixDtsImportsWithWronPackageName(
    //   absOrgFilePathInDistOrBundle,
    //   absOrgFilePathInDistOrBundle,
    // );

    if (isBackendMapsFileAppJS || isBrowserMapsFileAppJS) {
      if (isBackendMapsFileAppJS) {
        this.writeFixedMapFile(
          false,
          specyficFileRelativePath,
          distOrBundleLocation,
        )
      }
      if (isBrowserMapsFileAppJS) {
        this.writeFixedMapFile(
          true,
          specyficFileRelativePath,
          distOrBundleLocation
        )
      }
    }
  }
  //#endregion

  //#region handle copy of single file / from non target apps
  handleCopyOfSingleFileFromNonTargetFiles(
    specyficFileRelativePath: string,
    destination: Project,
    isTempLocalProj: boolean,
    wasRecrusive: boolean,
  ) {
    this.handleCopyOfSingleFileForChildFromLibs(
      specyficFileRelativePath,
      destination,
      isTempLocalProj,
      wasRecrusive,
      '-'
    );
  }
  //#endregion

  handleCopyOfAssetFile(absoluteAssetFilePath: string, destination: Project) {
    absoluteAssetFilePath = crossPlatformPath(absoluteAssetFilePath);
    const monitoredOutDirSharedAssets = this.monitoredOutDirSharedAssets;
    for (let index = 0; index < monitoredOutDirSharedAssets.length; index++) {
      const folderAssetsShareAbsPath = crossPlatformPath(monitoredOutDirSharedAssets[index]);
      if (absoluteAssetFilePath.startsWith(folderAssetsShareAbsPath)) {
        const relativePath = absoluteAssetFilePath.replace(`${folderAssetsShareAbsPath}/`, '');

        const childName = absoluteAssetFilePath
          .replace(`${this.project.location}/`, '')
          .replace(`/${config.folder.src}/${config.folder.assets}/${config.folder.shared}/${relativePath}`, '');

        const dest = destination.node_modules.pathFor(`${this.rootPackageName}/${childName}/${config.folder.assets}/${config.folder.shared}/${relativePath}`);

        Helpers.remove(dest, true);
        if (Helpers.exists(absoluteAssetFilePath)) {
          Helpers.copyFile(absoluteAssetFilePath, dest);
        }

      }
    }
  }

  handleCopyOfSingleFile(
    destination: Project,
    isTempLocalProj: boolean,
    specyficFileRelativePath: string,
    wasRecrusive = false
  ): void {
    specyficFileRelativePath = crossPlatformPath(specyficFileRelativePath).replace(/^\//, '');
    if (this.notAllowedFiles.includes(specyficFileRelativePath)) {
      return;
    }

    if (
      specyficFileRelativePath.startsWith(config.folder.libs)
      ||
      specyficFileRelativePath.startsWith([config.folder.assets, config.folder.shared].join('/'))
    ) {
      this.handleCopyOfSingleFileForChildFromLibs(
        specyficFileRelativePath,
        destination,
        isTempLocalProj,
        wasRecrusive,
      );
    } else if (
      specyficFileRelativePath.startsWith(config.folder.browser) ||
      specyficFileRelativePath.startsWith(config.folder.websql)
    ) {
      this.angularCopyManger.handleCopyOfSingleFile(
        specyficFileRelativePath,
        destination,
        isTempLocalProj,
        wasRecrusive,
      );
    } else if (specyficFileRelativePath.startsWith('-')) {
      this.handleCopyOfSingleFileFromNonTargetFiles(
        specyficFileRelativePath,
        destination,
        isTempLocalProj,
        wasRecrusive,
      )
    } else {
      this.handleCopyOfSingleFileFromAppAndRoot(
        specyficFileRelativePath,
        destination,
        isTempLocalProj,
        wasRecrusive,
      );
    }
  }
  //#endregion

  //#region update backend full dts files
  /**
   * package ready to realse should have all/full *.d.ts files.. .to avoid any
   * erors when we import more "ui package" to backend code
   */
  updateBackendFullDtsFiles(destinationOrBundleOrDist: Project | string) {
    const base = crossPlatformPath(path.join(this.targetProj.location, `${this.outDir}-nocutsrc`, config.folder.libs));

    const filesToUpdate = Helpers
      .filesFrom(base, true)
      .filter(f => f.endsWith('.d.ts'))
      .map(f => f.replace(`${base}/`, ''))

    for (let index = 0; index < filesToUpdate.length; index++) {
      const relativePath = filesToUpdate[index];
      // const childName = _.first(relativePath.split('/'));
      const source = crossPlatformPath(path.join(base, relativePath));
      const dest = crossPlatformPath(path.join(
        _.isString(destinationOrBundleOrDist)
          ? crossPlatformPath(path.join(this.monitoredOutDir, config.folder.libs))
          : destinationOrBundleOrDist.node_modules.pathFor(crossPlatformPath(path.join(
            this.rootPackageName,
            // childName,
          ))),
        relativePath,
      ));
      // console.log({
      //   source, dest
      // })
      // if (Helpers.exists(dest)) {
      // console.log(dest)
      Helpers.copyFile(source, dest);
      // }
    }
  }
  //#endregion

}
