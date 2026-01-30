//#region imports
import {
  config,
  fileName,
  LibTypeEnum,
  taonPackageName,
  UtilsFilesFoldersSync,
} from 'tnp-core/src';
import {
  path,
  crossPlatformPath,
  fse,
  CoreModels,
  PROGRESS_DATA,
  dateformat,
} from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import {
  BaseNodeModules,
  Helpers,
  HelpersTaon,
} from 'tnp-helpers/src';

import {
  assetsFromNgProj,
  binMainProject,
  browserMainProject,
  dotGitIgnoreMainProject,
  dotInstallDate,
  dotNpmIgnoreMainProject,
  dotNpmrcMainProject,
  libFromCompiledDist,
  notAllowedAsPacakge,
  packageJsonLockMainProject,
  packageJsonMainProject,
  skipCoreCheck,
  sourceLinkInNodeModules,
  srcDtsFromNpmPackage,
  taonJsonMainProject,
  websqlMainProject,
  yarnLockMainProject,
} from '../../constants';

import type { NpmHelpers } from './npm-helpers';
import type { Project } from './project';

//#endregion

// @ts-ignore TODO weird inheritance problem
export class NodeModules extends BaseNodeModules {
  constructor(
    public project: Project,
    public npmHelpers: NpmHelpers,
  ) {
    super(
      project.location,
      // @ts-ignore TODO weird inheritance problem
      npmHelpers,
    );
  }

  /**
   * TODO use this when async not available
   */
  reinstallSync(): void {
    //#region @backendFunc
    // TODO in future - check if node_modules are empty
    // the problem is that I don't wanna check each time I am acessing core container
    if (this.project.nodeModules.empty) {
      this.project
        .run(`${config.frameworkName} reinstall ${skipCoreCheck}`)
        .sync();
    }
    //#endregion
  }

  //#region has package installed
  hasPackageInstalled(packageName: string): boolean {
    //#region @backendFunc
    const packagePath = crossPlatformPath([
      this.path,
      ...packageName.split('/'),
      fileName.package_json,
    ]);
    return Helpers.exists(packagePath);
    //#endregion
  }

  //#region reinstall
  /**
   * OVERRIDDEN METHOD for taon use case
   */
  async reinstall(
    options?: Omit<CoreModels.NpmInstallOptions, 'pkg'>,
  ): Promise<void> {
    //#region @backendFunc
    options = options || {};
    if (
      this.project.framework.isContainer &&
      !this.project.framework.isContainerCoreProject
    ) {
      Helpers.log(`No need for package installation in normal container`);
      return;
    }

    if (!global.globalSystemToolMode) {
      return;
    }

    if (global.tnpNonInteractive) {
      PROGRESS_DATA.log({
        msg:
          `${this.npmHelpers.useLinkAsNodeModules ? 'SMART ' : ''} ` +
          `npm installation for "${this.project.genericName}" started..`,
      });
    }

    Helpers.log(`Packages full installation for ${this.project.genericName}`);

    if (this.npmHelpers.useLinkAsNodeModules) {
      await this.project.nodeModules.linkFromCoreContainer();
    } else {
      //#region display message about long process for core container
      if (
        config.frameworkName === taonPackageName &&
        this.project.framework.isContainerCoreProject
      ) {
        Helpers.info(`
      [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
      This may take a long time (usually 10-15min on 0.5Gb/s internet connection)...
      more than 1GB to download from npm...
      `);
      }
      //#endregion

      // TODO UNCOMMENT WHEN REALLY GOOD PACKGES CLOUD DEPLOYMENT
      // options.generateYarnOrPackageJsonLock = true;
      // options.removeYarnOrPackageJsonLock = false;
      // options.skipRemovingNodeModules = true;
      await super.reinstall(options);

      //#region after npm install taon things
      // TODO not a good idea
      // this.project.quickFixes.unpackNodeModulesPackagesZipReplacements();
      this.project.quickFixes.createDummyEmptyLibsReplacements([]); // TODO
      this.project.quickFixes.removeBadTypesInNodeModules();
      await this.project.packagesRecognition.start('after npm install');
      if (!options.generateYarnOrPackageJsonLock) {
        if (options.useYarn) {
          const yarnLockPath = this.project.pathFor(yarnLockMainProject);
          const yarnLockExists = fse.existsSync(yarnLockPath);
          if (yarnLockExists) {
            if (this.project.git.isInsideGitRepo) {
              this.project.git.resetFiles(yarnLockMainProject);
            }
          } else {
            fse.existsSync(yarnLockPath) &&
              Helpers.removeFileIfExists(yarnLockPath);
          }
        } else {
          const packageLockPath = this.project.pathFor(
            packageJsonLockMainProject,
          );
          fse.existsSync(packageLockPath) &&
            Helpers.removeFileIfExists(packageLockPath);
        }
      }

      Helpers.writeFile(
        [this.project.nodeModules.path, dotInstallDate],
        `[${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]`,
      );
      if (this.project.nodeModules.shouldDedupePackages) {
        this.project.nodeModules.dedupe();
      }

      // TODO QUICK FIX in version 19 fix all d.ts

      this.project.quickFixes.excludeNodeModulesDtsFromTypescriptCheck([
        this.project.nodeModules.pathFor('@types/glob/index.d.ts'),
        this.project.nodeModules.pathFor('@types/lodash-es/debounce.d.ts'),
        this.project.nodeModules.pathFor('chokidar/types/index.d.ts'),
        this.project.nodeModules.pathFor(
          '@angular/core/types/_discovery-chunk.d.ts',
        ),
        this.project.nodeModules.pathFor('@types/node/process.d.ts'),
        this.project.nodeModules.pathFor('electron/electron.d.ts'),
        this.project.nodeModules.pathFor(
          '@angular/platform-browser/types/platform-browser.d.ts',
        ),
        this.project.nodeModules.pathFor('undici/types/formdata.d.ts'),
        this.project.nodeModules.pathFor(
          '@sweetalert2/ngx-sweetalert2/index.d.ts',
        ),
      ]);
      this.project.quickFixes.fixSQLLiteModuleInNodeModules();
      //#endregion
    }

    if (global.tnpNonInteractive) {
      PROGRESS_DATA.log({ msg: `npm installation finish ok` });
    }
    //#endregion
  }
  //#endregion

  //#region link from core container
  async linkFromCoreContainer(): Promise<void> {
    //#region @backendFunc
    const coreContainer = this.project.ins.by(
      LibTypeEnum.CONTAINER,
      this.project.framework.frameworkVersion,
    );
    if (this.project.location === coreContainer.location) {
      Helpers.logInfo(
        `Reinstalling node_modules for core container ${coreContainer.name}`,
      );
      await coreContainer.nodeModules.makeSureInstalled();
      return;
    }
    // console.log(
    //   `Linking from core container ${coreContainer.name} ${this.project.genericName}`,
    // );
    await coreContainer.nodeModules.makeSureInstalled();

    //#region respect other proper core container linked node_modules
    if (taonPackageName === config.frameworkName) {
      try {
        const realpathCCfromCurrentProj = fse.realpathSync(
          this.project.nodeModules.path,
        );
        const pathCCfromCurrentProj = crossPlatformPath(
          path.dirname(realpathCCfromCurrentProj),
        );

        const coreContainerFromNodeModules = this.project.ins.From(
          pathCCfromCurrentProj,
        );

        const isCoreContainer =
          coreContainerFromNodeModules?.framework.isCoreProject &&
          coreContainerFromNodeModules?.framework.isContainer &&
          coreContainerFromNodeModules.framework.frameworkVersionEquals(
            this.project.framework.frameworkVersion,
          );

        // console.log({
        //   realpathCCfromCurrentProj,
        //   pathCCfromCurrentProj,
        //   isCoreContainer,
        // });

        if (isCoreContainer) {
          return;
        }
      } catch (error) {}
    }
    //#endregion

    try {
      fse.unlinkSync(this.project.nodeModules.path);
    } catch (error) {
      Helpers.remove(this.project.nodeModules.path);
    }
    try {
      if (Helpers.exists(this.project.nodeModules.path)) {
        Helpers.removeFolderIfExists(this.project.nodeModules.path);
      }
    } catch (error) {}
    Helpers.createSymLink(
      coreContainer.nodeModules.path,
      this.project.nodeModules.path,
    );
    // Helpers.taskDone(
    //   `Linking from core container ${coreContainer.name} ${this.project.genericName}`,
    // );
    //#endregion
  }
  //#endregion

  //#region should dedupe packages
  get shouldDedupePackages(): boolean {
    if (
      this.project.framework.isContainer &&
      !this.project.framework.isCoreProject
    ) {
      return false;
    }
    return (
      !this.project.npmHelpers.useLinkAsNodeModules &&
      !this.project.nodeModules.isLink
    );
  }
  //#endregion

  //#region compiled project files and folder
  /**
   * BIG TODO Organization project when compiled in dist folder
   * should store backend files in lib folder
   */
  public get compiledProjectFilesAndFolders(): string[] {
    //#region @backendFunc
    const jsDtsMapsArr = ['.js', '.js.map', '.d.ts'];
    if (this.project.framework.isStandaloneProject) {
      return [
        binMainProject,
        libFromCompiledDist,
        assetsFromNgProj,
        websqlMainProject,
        browserMainProject,
        taonJsonMainProject,
        fileName.tnpEnvironment_json,
        dotGitIgnoreMainProject,
        dotNpmIgnoreMainProject,
        dotNpmrcMainProject,
        srcDtsFromNpmPackage,
        ...this.project.taonJson.resources,
        packageJsonMainProject,
        packageJsonLockMainProject,
        ...jsDtsMapsArr.reduce((a, b) => {
          return a.concat([
            ...['cli', 'index', 'start', 'run', 'global-typings'].map(
              aa => `${aa}${b}`,
            ),
          ]);
        }, []),
      ];
    }
    return [];
    //#endregion
  }
  //#endregion

  //#region dedupe
  dedupe(selectedPackages?: string[], fake = false): void {
    //#region @backendFunc
    const packages: string[] = (
      _.isArray(selectedPackages) && selectedPackages.length >= 1
        ? selectedPackages
        : this.packagesToDedupe
    ) as any;

    this.dedupePackages(packages, false, fake);
    //#endregion
  }
  //#endregion

  //#region dedupe count
  dedupeCount(selectedPackages?: string[]): void {
    //#region @backendFunc
    const packages = (
      _.isArray(selectedPackages) && selectedPackages.length >= 1
        ? selectedPackages
        : this.packagesToDedupe
    ) as any;

    this.dedupePackages(packages, true);
    //#endregion
  }
  //#endregion

  //#region packages to dedupe
  private get packagesToDedupe(): (
    | string
    | {
        package: string;
        excludeFrom?: string[];
        includeOnlyIn?: string[];
      }
  )[] {
    return [
      'tnp-models', // TODO remove
      'tnp-helpers',
      'tnp-db', // TODO remove
      'tnp-core',
      'tnp-cli', // TODO remove
      'tnp-config', // TODO remove
      'tnp-tools', // TODO remove
      'taon',
      'taon-ui',
      'taon-typeorm',
      'taon-storage',
      // "better-sqlite3",
      // "any-project-cli",
      'node-cli-test',
      'fs-extra',
      '@types/fs-extra',
      'ng2-rest',
      'ng2-logger',
      'json10',
      'lodash-walk-object',
      'typescript-class-helpers',
      'background-worker-process',
      '@ngtools/webpack',
      'portfinder',
      'socket.io-client',
      'socket.io',
      'incremental-compiler',
      'rxjs',
      'webpack',
      'webpack-dev-server',
      '@angular/animations',
      '@angular/cdk',
      '@angular/common',
      '@angular/compiler',
      '@angular/http',
      '@angular/core',
      '@angular/forms',
      '@angular/material',
      '@angular/platform-browser',
      '@angular/platform-browser-dynamic',
      '@angular/pwa',
      '@angular/platform-server',
      '@angular/ssr',
      '@angular/router',
      '@angular/service-worker',
      'zone.js',
      'typescript',
      'hammerjs',
      'tslib',
      '@angular-devkit/build-optimizer',
      '@angular-devkit/build-angular',
      '@angular-devkit/schematics',
      '@angular-devkit/build-webpack',
      '@angular/cli',
      '@angular/compiler-cli',
      '@angular-builders/custom-webpack',
      '@angular/language-service',
      'ts-node',
      'tslint',
      'prettier',
      '@types/node',
      'record-replay-req-res-scenario',
      // [
      //   'core-js',
      //   '!babel-register',
      //   '!babel-runtime',
      //   '!babel-polyfill',
      //   '@jimp*',
      // ],
      {
        package: 'core-js',
        excludeFrom: ['babel-register', 'babel-runtime', 'babel-polyfill'],
        includeOnlyIn: ['@jimp'],
      },
      'core-js-compat',
      '@ngx-formly/bootstrap',
      '@ngx-formly/core',
      '@ngx-formly/ionic',
      '@ngx-formly/material',
      'sql.js',
      'axios',
      'mocha',
      'jest',
      'chai',
      'vpn-split',
    ];
  }
  //#endregion

  //#region remove tnp from itself
  /**
   * Remove already compiled package from node_modules
   * in project with the same name
   *
   * let say we have project "my-project" and we want to remove
   * "my-project" from node_modules of "my-project"
   *
   * This helper is helpful when we want to minified whole library
   * into single file (using ncc)
   */
  public async removeOwnPackage(
    actionwhenNotInNodeModules: () => {},
  ): Promise<void> {
    //#region @backendFunc
    const nodeModulesPath = this.project.nodeModules.path;
    if (Helpers.exists(nodeModulesPath)) {
      const folderToMove = crossPlatformPath([
        crossPlatformPath(fse.realpathSync(nodeModulesPath)),
        this.project.name,
      ]);

      const folderTemp = crossPlatformPath([
        crossPlatformPath(fse.realpathSync(nodeModulesPath)),
        `temp-location-${this.project.name}`,
      ]);

      HelpersTaon.move(folderToMove, folderTemp, {
        purpose: `Moving own "${this.project.nameForNpmPackage}" package to temp location`,
      });
      await actionwhenNotInNodeModules();
      HelpersTaon.move(folderTemp, folderToMove, {
        purpose: `Restoring own "${this.project.nameForNpmPackage}" package after action`,
      });
    }
    //#endregion
  }
  //#endregion

  getIsomorphicPackagesNames(): string[] {
    //#region @backendFunc
    return this.getAllPackagesNames().filter(packageName =>
      this.checkIsomorphic(packageName),
    );
    //#endregion
  }

  getIsomorphicPackagesNamesInDevMode(): string[] {
    //#region @backendFunc
    return this.getAllPackagesNames().filter(
      packageName =>
        this.checkIsomorphic(packageName) && this.checkIfInDevMode(packageName),
    );
    //#endregion
  }

  //#region get folders with packages
  getAllPackagesNames = (options?: { followSymlinks?: boolean }): string[] => {
    //#region @backendFunc
    options = options || {};
    const followSymlinks = !!options.followSymlinks;
    let fromNodeModulesFolderSearch = UtilsFilesFoldersSync.getFoldersFrom(
      this.path,
      {
        recursive: false,
        followSymlinks,
      },
    )
      .reduce((a, b) => {
        if (path.basename(b).startsWith('@')) {
          const foldersFromB = Helpers.foldersFrom(b)
            .filter(f => !notAllowedAsPacakge.includes(path.basename(f)))
            // .filter(f => Helpers.exists([path.dirname(f), fileName.index_d_ts])) // QUICK_FIX @angular/animation
            .map(f => {
              return `${path.basename(b)}/${path.basename(f)}`;
            });
          return [...a, ...foldersFromB];
        }
        return [...a, b];
      }, [])
      .map(f => {
        if (f.startsWith('@')) {
          return f;
        }
        return path.basename(f);
      });

    return fromNodeModulesFolderSearch;
    //#endregion
  };
  //#endregion

  checkIfInDevMode(packageName: string) {
    //#region @backendFunc
    const packageInNodeModulesPath = crossPlatformPath([
      this.realPath,
      packageName,
    ]);
    return Helpers.isExistedSymlink([
      packageInNodeModulesPath,
      sourceLinkInNodeModules,
    ]);
    //#endregion
  }

  checkIsomorphic(packageName: string) {
    //#region @backendFunc
    let isIsomorphic = false;
    // !  TODO this in probably incorrect packages is never a link
    const packageInNodeModulesPath = crossPlatformPath([
      this.realPath,
      packageName,
    ]);
    const browser = crossPlatformPath([
      packageInNodeModulesPath,
      browserMainProject,
    ]);
    const websql = crossPlatformPath([
      packageInNodeModulesPath,
      websqlMainProject,
    ]);
    isIsomorphic = Helpers.exists(browser) && Helpers.exists(websql);
    return isIsomorphic;
    //#endregion
  }
}
