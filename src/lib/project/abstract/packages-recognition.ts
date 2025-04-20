//#region imports
import { config, PREFIXES } from 'tnp-config/src';
import { _, path, fse, crossPlatformPath, chalk } from 'tnp-core/src';
import { BaseFeatureForProject, Helpers } from 'tnp-helpers/src';

import { notAllowedAsPacakge } from '../../constants';

import type { Project } from './project';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class PackagesRecognition extends BaseFeatureForProject<Project> {
  //#region constructor
  private get coreContainer() {
    return this.project.framework.coreContainer;
  }

  public inMemoryIsomorphicLibs = [];

  //#region constructor
  constructor(project: Project) {
    super(project);
  }
  //#endregion

  //#region isomorphic packages json path
  get jsonPath(): string {
    //#region @backendFunc
    return crossPlatformPath([
      this.coreContainer.location,
      config.tempFiles.FILE_NAME_ISOMORPHIC_PACKAGES,
    ]);
    //#endregion
  }
  //#endregion

  //#region libs from json
  public get libsFromJson(): string[] {
    const json = Helpers.readJson(this.jsonPath) || {};
    // console.log(`json: `,this.jsonPath )
    const arr = json[config.array.isomorphicPackages] || [];
    // console.log(`libs from json: `,arr);
    return arr;
  }
  //#endregion

  //#region start
  async start(reasonToSearchPackages?: string): Promise<void> {
    //#region @backendFunc
    await this.coreContainer.nodeModules.makeSureInstalled();
    let recognizedPackages = [];
    Helpers.taskStarted(
      `[${this.project.genericName}]` +
        ` Searching isomorphic packages for ${this.coreContainer.genericName}...` +
        +` reason "${reasonToSearchPackages}"`,
    );

    //#region recreate json if not exists
    if (!Helpers.exists(this.jsonPath)) {
      Helpers.writeJson(this.jsonPath, {});
    }
    //#endregion

    //#region try to read ismoorphic packages from already exited json
    const readCurrent = (): string[] => {
      try {
        const pj = Helpers.readJson(this.jsonPath);
        if (_.isArray(pj[config.array.isomorphicPackages])) {
          return Helpers.uniqArray(pj[config.array.isomorphicPackages]);
        }
      } catch (error) {
        Helpers.log(`[${config.frameworkName}] ERROR not recognized in`);
        return [];
      }
    };

    recognizedPackages = readCurrent();

    //#endregion

    //#region search for isomorphic packages in folders
    let fromNodeModulesFolderSearch = Helpers.foldersFrom(
      this.coreContainer.nodeModules.path,
    )
      .reduce((a, b) => {
        if (path.basename(b).startsWith('@')) {
          const foldersFromB = Helpers.foldersFrom(b)
            .filter(f => !notAllowedAsPacakge.includes(path.basename(f)))
            .filter(f =>
              Helpers.exists([path.dirname(f), config.file.index_d_ts]),
            ) // QUICK_FIX @angular/animation
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
      })
      .filter(packageName => {
        Helpers.log(
          `[${config.frameworkName}] Checking package node_modules/${packageName}`,
          2,
        );
        // try {
        return this.checkIsomorphic(
          this.coreContainer.nodeModules.path,
          packageName,
        );
        // } catch (error) {
        //   return false;
        // }
      });
    //#endregion

    recognizedPackages = Helpers.uniqArray(
      [
        ...(recognizedPackages || []),
        ...this.project.framework.packageNamesFromProject,
        ...(fromNodeModulesFolderSearch || []),
        ...Object.values(config.frameworkNames),
      ].filter(f => !f.startsWith(PREFIXES.RESTORE_NPM)),
    );

    Helpers.writeJson(this.jsonPath, {
      [config.array.isomorphicPackages]: recognizedPackages,
    });
    this.coreContainer.packagesRecognition.resolveAndAddIsomorphicLibsToMemory(
      _.cloneDeep(recognizedPackages),
    );
    // Helpers.taskDone(`Search done. Watcher started...`);

    fse.watch(this.jsonPath, (eventType, filename) => {
      if (filename) {
        try {
          const newIsomorphicPackages = readCurrent();
          // Helpers.info(
          //   `[${config.frameworkName}] Isomorphic packages changed...`,
          // );

          this.coreContainer.packagesRecognition.resolveAndAddIsomorphicLibsToMemory(
            _.cloneDeep(newIsomorphicPackages),
            true,
          );
        } catch (error) {}
      } else {
        console.log('Filename not provided or unsupported platform.');
      }
    });

    //#endregion
  }
  //#endregion

  //#region resolve and add isomorphic libs to memory
  public resolveAndAddIsomorphicLibsToMemory(
    libsNames: string[],
    informAboutDiff = false,
  ): void {
    //#region @backendFunc
    // console.log(`add ed isomorphic libs to memory: ${libsNames.join(', ')}`);
    if (!this.coreContainer) {
      return;
    }

    if (informAboutDiff) {
      const current =
        this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs;
      const newAdded = libsNames.filter(l => !current.includes(l));
      for (const packageName of newAdded) {
        Helpers.info(
          `[${config.frameworkName}] ${packageName} added to isomorphic packages...`,
        );
      }
    }

    this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs =
      Helpers.uniqArray([
        ...this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs,
        ...libsNames,
        ...this.project.framework.packageNamesFromProject,
      ]);
    //#endregion
  }
  //#endregion

  //#region all isomorphic packages from memory
  /**
   * main source of isomorphic libs
   */
  public get allIsomorphicPackagesFromMemory(): string[] {
    //#region @backendFunc
    if (
      this.coreContainer?.packagesRecognition.inMemoryIsomorphicLibs.length ===
      0
    ) {
      this.resolveAndAddIsomorphicLibsToMemory(
        this.coreContainer?.packagesRecognition.libsFromJson,
        false,
      );

      if (
        this.coreContainer?.packagesRecognition.inMemoryIsomorphicLibs
          .length === 0
      ) {
        this.coreContainer
          .run(
            // $Global.prototype.reinstall.name
            `${config.frameworkName}  ${'reinstall'}`,
          )
          .sync();
        this.resolveAndAddIsomorphicLibsToMemory(
          this.coreContainer?.packagesRecognition.libsFromJson,
          false,
        );
        if (
          this.coreContainer?.packagesRecognition.inMemoryIsomorphicLibs
            .length === 0
        ) {
          Helpers.error(
            `Not able to resolve isomorphic libs for core container...`,
            false,
            true,
          );
        }
      }
    }
    const result = Helpers.uniqArray([
      ...this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs,
      ...this.project.framework.packageNamesFromProject,
    ]);
    // console.log(`allIsomorphicPackagesFromMemory: ${result.join('\n ')}`);
    return result;
    //#endregion
  }
  //#endregion

  //#region check isomorphic
  protected checkIsomorphic(node_modules: string, packageName: string) {
    //#region @backendFunc
    let isIsomorphic = false;
    const packageInNodeModulesPath = crossPlatformPath(
      fse.realpathSync(path.join(node_modules, packageName)),
    );
    const browser = crossPlatformPath(
      path.join(packageInNodeModulesPath, config.folder.browser),
    );
    const websql = crossPlatformPath(
      path.join(packageInNodeModulesPath, config.folder.websql),
    );
    isIsomorphic = Helpers.exists(browser) || Helpers.exists(websql);
    if (isIsomorphic && !Helpers.exists(websql)) {
      Helpers.removeIfExists(websql);
      Helpers.createSymLink(browser, websql);
    }
    return isIsomorphic;
    //#endregion
  }
  //#endregion
}
