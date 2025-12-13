import { config, folderName, PREFIXES } from 'tnp-core/src';
import { crossPlatformPath, glob, path, _, fse } from 'tnp-core/src';
import { fileName } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import {
  assetsFromNpmPackage,
  assetsFromSrc,
  distMainProject,
  distNoCutSrcMainProject,
  indexDtsMainProject,
  indexDtsNpmPackage,
  nodeModulesMainProject,
  packageJsonNpmLib,
  projectsFromNgTemplate,
  sharedFromAssets,
  sourceLinkInNodeModules,
  srcMainProject,
  THIS_IS_GENERATED_INFO_COMMENT,
  tmpLibsForDist,
  tmpLocalCopytoProjDist,
  tmpSourceDist,
} from '../../../../../../constants';
import {
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../../../options';
import type { Project } from '../../../../project';

import { CopyManager } from './copy-manager';
import { CopyMangerHelpers } from './copy-manager-helpers';
import { SourceMappingUrl } from './source-maping-url';
import { TypescriptDtsFixer } from './typescript-dts-fixer';

export class CopyManagerStandalone extends CopyManager {
  dtsFixer: TypescriptDtsFixer;

  //#region init
  public init(buildOptions: EnvOptions, renameDestinationFolder?: string) {
    //#region @backendFunc
    this.buildOptions = buildOptions;
    this.renameDestinationFolder = renameDestinationFolder;

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
          Helpers.escapeStringForRegEx(toReplaceString2),
          'g',
        );
        content = content.replace(regex2, `../${srcMainProject}`);
      } else {
        const regex1 = new RegExp(
          Helpers.escapeStringForRegEx(toReplaceString1),
          'g',
        );
        const regex2 = new RegExp(
          Helpers.escapeStringForRegEx(toReplaceString2),
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
  removeSourceLinksFolders(location: string) {
    //#region @backendFunc
    this.sourceFolders.forEach(sourceFolder => {
      const toRemoveLink = crossPlatformPath(path.join(location, sourceFolder));
      if (Helpers.isSymlinkFileExitedOrUnexisted(toRemoveLink)) {
        Helpers.remove(
          crossPlatformPath(path.join(location, sourceFolder)),
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

      Helpers.copy(sharedAssetsPath, dest, {
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
      this.dtsFixer.processFolderWithBrowserWebsqlFolders(monitorDir);
    }

    //#region final copy from dist to node_moules/rootpackagename
    const pkgLocInDestNodeModules = destination.nodeModules.pathFor(
      this.rootPackageName,
    );
    const filter = Helpers.filterDontCopy(this.sourceFolders, monitorDir);

    this.removeSourceLinksFolders(pkgLocInDestNodeModules);

    // TODO this thing is failing when copying unexisted file on macos
    Helpers.copy(monitorDir, pkgLocInDestNodeModules, {
      copySymlinksAsFiles: false,
      filter,
    });

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
    currentBrowserFolder?: 'browser' | 'websql' | string,
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
    //#endregion
  }
  //#endregion

  //#region copy map files from local proj to copyto proj§
  copyMapFilesesFromLocalToCopyToProj(
    destination: Project,
    tmpLocalProjPackageLocation: string,
  ) {
    //#region @backendFunc
    const allMjsBrowserFiles = CopyMangerHelpers.browserwebsqlFolders
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
      Helpers.copyFile(fileAbsPath, destAbs, { dontCopySameContent: false });
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
      for (
        let index = 0;
        index < CopyMangerHelpers.browserwebsqlFolders.length;
        index++
      ) {
        const currentBrowserFolder =
          CopyMangerHelpers.browserwebsqlFolders[index];
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
          Helpers.copyFile(absoluteAssetFilePath, dest);
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
      if (Helpers.exists(readyToCopyFileInLocalTempProj)) {
        Helpers.copyFile(readyToCopyFileInLocalTempProj, destinationFilePath);
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
      Helpers.writeFile(
        destinationFilePath,
        Helpers.readFile(absOrgFilePathInDist) || '',
      );
    }

    // TODO check this
    if (specificFileRelativePath === fileName.package_json) {
      // TODO this is VSCODE/typescirpt new fucking issue
      // Helpers.copyFile(sourceFile, path.join(path.dirname(destinationFile), folderName.browser, path.basename(destinationFile)));
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

    for (
      let index = 0;
      index < CopyMangerHelpers.browserwebsqlFolders.length;
      index++
    ) {
      const browserFolder = CopyMangerHelpers.browserwebsqlFolders[index];
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
      path.basename(monitoredOutDirFileToReplaceBack) !==
        packageJsonNpmLib // TODO QUICK_FIX
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
