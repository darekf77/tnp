//#region imports
import { config } from 'tnp-config/src';
import {
  path,
  crossPlatformPath,
  fse,
  chalk,
  moment,
  CoreModels,
  PROGRESS_DATA,
  dateformat,
} from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import {
  BaseFeatureForProject,
  BaseNodeModules,
  Helpers,
} from 'tnp-helpers/src';

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

  //#region reinstall
  /**
   * OVERRIDDEN METHOD for taon use case
   */
  async reinstall(
    options?: Omit<CoreModels.NpmInstallOptions, 'pkg'>,
  ): Promise<void> {
    //#region @backendFunc
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
        config.frameworkName ===
          config.frameworkNames.productionFrameworkName &&
        this.project.framework.isContainerCoreProject
      ) {
        Helpers.info(`
      [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
      This may take a long time (usually 10-15min on 0.5Gb/s internet connection)...
      more than 1GB to download from npm...
      `);
      }
      //#endregion

      await super.reinstall(options);

      //#region after npm install taon things
      this.project.quickFixes.unpackNodeModulesPackagesZipReplacements();
      await this.project.packagesRecognition.start('after npm install');
      if (!options.generateYarnOrPackageJsonLock) {
        if (options.useYarn) {
          const yarnLockPath = this.project.pathFor(config.file.yarn_lock);
          const yarnLockExisits = fse.existsSync(yarnLockPath);
          if (yarnLockExisits) {
            if (this.project.git.isInsideGitRepo) {
              this.project.git.resetFiles(config.file.yarn_lock);
            }
          } else {
            fse.existsSync(yarnLockPath) &&
              Helpers.removeFileIfExists(yarnLockPath);
          }
        } else {
          const packageLockPath = this.project.pathFor(
            config.file.package_lock_json,
          );
          fse.existsSync(packageLockPath) &&
            Helpers.removeFileIfExists(packageLockPath);
        }
      }

      Helpers.writeFile(
        [this.project.nodeModules.path, '.install-date'],
        moment(new Date()).format('L LTS'),
      );
      if (this.project.nodeModules.shouldDedupePackages) {
        this.project.nodeModules.dedupe();
      }
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
      'container',
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
    if (
      config.frameworkNames.productionFrameworkName.includes(
        config.frameworkName,
      )
    ) {
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
        config.folder.bin,
        config.folder.lib,
        config.folder.assets,
        config.folder.websql,
        config.folder.browser,
        config.file.taon_jsonc,
        config.file.tnpEnvironment_json,
        config.file._gitignore,
        config.file._npmignore,
        config.file._npmrc,
        'src.d.ts',
        ...this.project.taonJson.resources,
        config.file.package_json,
        config.file.package_lock_json,
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

  //#region update from release dist
  async updateFromReleaseDist(sourceOfCompiledProject: Project): Promise<void> {
    //#region @backendFunc

    //#region source folder
    const sourcePathToLocalProj = crossPlatformPath([
      sourceOfCompiledProject.location,
      config.folder.tmpDistRelease,
      config.folder.dist,
      'project',
      sourceOfCompiledProject.name,
      `tmp-local-copyto-proj-${config.folder.dist}/${config.folder.node_modules}/${sourceOfCompiledProject.name}`,
    ]);

    //#endregion

    //#region copy process
    const destBasePath = crossPlatformPath([
      this.project.nodeModules.path,
      sourceOfCompiledProject.name,
    ]);
    for (const fileOrFolder of sourceOfCompiledProject.nodeModules
      .compiledProjectFilesAndFolders) {
      const dest = crossPlatformPath([destBasePath, fileOrFolder]);
      const source = crossPlatformPath([sourcePathToLocalProj, fileOrFolder]);

      if (Helpers.exists(source)) {
        // Helpers.info(`Release update copying
        // EXISTS ${Helpers.exists(source)}
        // ${source}
        //  to
        // ${dest}`);
        if (Helpers.isFolder(source)) {
          Helpers.copy(source, dest, { overwrite: true, recursive: true });
        } else {
          Helpers.copyFile(source, dest);
        }
      }
    }
    //#endregion

    await sourceOfCompiledProject.packagesRecognition.start(
      'after release update',
    );

    //#endregion
  }
  //#endregion

  //#region dedupe
  dedupe(selectedPackages?: string[]): void {
    //#region @backendFunc
    const packages: string[] = (
      _.isArray(selectedPackages) && selectedPackages.length >= 1
        ? selectedPackages
        : this.packagesToDedupe
    ) as any;

    this.dedupePackages(
      packages,
      false,
      !this.project.npmHelpers.useLinkAsNodeModules,
    );
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

    this.dedupePackages(
      packages,
      true,
      !this.project.npmHelpers.useLinkAsNodeModules,
    );
    //#endregion
  }
  //#endregion

  //#region packages to dedupe
  private get packagesToDedupe(): (string | string[])[] {
    return [
      'tnp-models',
      'tnp-helpers',
      'tnp-db',
      'tnp-core',
      'tnp-cli',
      'tnp-config',
      'tnp-tools',
      // "better-sqlite3",
      // "any-project-cli",
      'node-cli-test',
      'fs-extra',
      'ng2-rest',
      'ng2-logger',
      'json10',
      'lodash-walk-object',
      'typescript-class-helpers',
      'background-worker-process',
      'taon-storage',
      'taon-storage',
      '@ngtools/webpack',
      'taon-typeorm',
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
      [
        'core-js',
        '!babel-register',
        '!babel-runtime',
        '!babel-polyfill',
        '@jimp*',
      ],
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

      Helpers.move(folderToMove, folderTemp);
      await actionwhenNotInNodeModules();
      Helpers.move(folderTemp, folderToMove);
    }
    //#endregion
  }
  //#endregion
}
