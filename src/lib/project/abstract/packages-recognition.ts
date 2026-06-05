//#region imports
import {
  config,
  CoreModels,
  PREFIXES,
  taonPackageName,
  tnpPackageName,
  Utils,
  UtilsWaitNotifier,
} from 'tnp-core/src';
import {
  _,
  path,
  fse,
  crossPlatformPath,
  chalk,
  UtilsCliClassMethod,
} from 'tnp-core/src';
import { fileName } from 'tnp-core/src';
import { BaseFeatureForProject, Helpers } from 'tnp-helpers/src';

import {
  browserMainProject,
  isomorphicPackagesJsonKey,
  notAllowedAsPacakge,
  tmpIsomorphicPackagesJson,
  websqlMainProject,
} from '../../constants';
// import { $Global } from '../cli/cli-_GLOBAL_';

import type { Project } from './project';
import type { TaonProjectResolve } from './project-resolve';
//#endregion

/**
 * TODO refactor this - use immutable db
 */
// @ts-ignore TODO weird inheritance problem
export class PackagesRecognition extends BaseFeatureForProject<Project> {
  //#region constructor
  private get coreContainer(): Project {
    return this.project.framework.coreContainer;
  }

  protected inMemoryIsomorphicLibs = [];

  //#region constructor
  constructor(project: Project) {
    super(project);
  }
  //#endregion

  //#region isomorphic packages json path
  /**
   * @deprecated not needed when using isomorphic-packages worker
   */
  get jsonPath(): string {
    //#region @backendFunc
    return crossPlatformPath([
      this.coreContainer.location,
      tmpIsomorphicPackagesJson,
    ]);
    //#endregion
  }
  //#endregion

  //#region isomorphic packages names from json
  /**
   * @deprecated not needed when using isomorphic-packages worker
   */
  private get isomorphicPackagesFromJson(): string[] {
    const json = Helpers.readJson(this.jsonPath) || {};
    // console.log(`json: `,this.jsonPath )
    const arr = json[isomorphicPackagesJsonKey] || [];
    // console.log(`isomorphicPackagess from json: `,arr);
    return arr;
  }
  //#endregion

  //#region callbacks register update
  private callbacks = new Set<
    (packages: string[], frameworkVersion: CoreModels.FrameworkVersion) => void
  >();

  public async registerUpdate(
    updateFn: (
      packages: string[],
      frameworkVersion: CoreModels.FrameworkVersion,
    ) => void | Promise<void>,
  ): Promise<void> {
    this.callbacks.add(updateFn);
    await updateFn(
      this.allIsomorphicPackagesFromMemory,
      this.project.framework.frameworkVersion,
    );
  }
  //#endregion

  //#region trigger callbacks
  public async triggerCallbacks(): Promise<void> {
    //#region @backendFunc
    const taskDetectionCallbacks = Helpers.actionStarted(
      'Updating callback for isomorpic packages',
    );
    const callbacks = [...this.callbacks];
    for (const callback of callbacks) {
      const frameworkVersion = this.project.taonJson.frameworkVersion;
      const packages =
        this.project.ins.packagesFromWorker.get(frameworkVersion);

      await callback(packages, frameworkVersion);
    }
    taskDetectionCallbacks.done();
    //#endregion
  }
  //#endregion

  //#region start from server

  public async startFromServer(reasonToSearchPackages?: string): Promise<void> {
    //#region @backendFunc
    if (!this.project.watcher.isTaonLightWatcherMode) {
      return;
    }
    const taskDetectionPkgs = Helpers.actionStarted(
      'Detecting isomorphic packages with worker',
    );
    const isomorphicPackagesController =
      await this.project.ins.taonProjectsWorker.isomorphicPackagesWorker.getRemoteControllerFor();

    await isomorphicPackagesController.updateIsomoprhicFor(
      this.project.taonJson.frameworkVersion,
      this.project.dataToRequest(),
    ).request!();

    await this.project.ins.notifierIsomorphicPackages.wait();

    taskDetectionPkgs.done();
    await this.triggerCallbacks();
    //#endregion
  }
  //#endregion

  //#region start
  /**
   * @deprecated  not needed when using isomorphic-packages worker
   */
  async start(reasonToSearchPackages?: string): Promise<void> {
    //#region @backendFunc
    if (this.project.watcher.isTaonLightWatcherMode) {
      //#region taon watcher mode
      return;
      //#endregion
    }
    //#region normal mode
    await this.coreContainer.nodeModules.makeSureInstalled();
    let recognizedPackages = [];
    Helpers.taskStarted(
      `[${this.project.genericName}]\n` +
        ` Searching isomorphic packages for ${this.coreContainer.genericName}...\n` +
        (reasonToSearchPackages ? ` reason "${reasonToSearchPackages}"` : ''),
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
        if (_.isArray(pj[isomorphicPackagesJsonKey])) {
          return Utils.uniqArray(pj[isomorphicPackagesJsonKey]);
        }
      } catch (error) {
        Helpers.log(`[${config.frameworkName}] ERROR not recognized in`);
        return [];
      }
    };

    recognizedPackages = readCurrent();

    //#endregion

    //#region search for isomorphic packages in folders
    let fromNodeModulesFolderSearch =
      this.coreContainer.nodeModules.getIsomorphicPackagesNames();

    //#endregion

    recognizedPackages = Utils.uniqArray(
      [
        ...(recognizedPackages || []),
        this.project.nameForNpmPackage,
        ...(fromNodeModulesFolderSearch || []),
        taonPackageName,
        tnpPackageName,
        ,
      ].filter(f => !f.startsWith(PREFIXES.RESTORE_NPM)),
    );

    this.resolveAndAddIsomorphicLibsToMemory(recognizedPackages);
    this.coreContainer.packagesRecognition.resolveAndAddIsomorphicLibsToMemory(
      _.cloneDeep(recognizedPackages),
    );
    // Helpers.taskDone(`Search done. Watcher started...`);
    await this.addIsomorphicPackagesToFile(recognizedPackages);
    Helpers.logInfo(`Watching isomorphic pacakges from: ${this.jsonPath}`);
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

    //#endregion
  }
  //#endregion

  //#region add isomorphic packages to file
  /**
   * @deprecated  not needed when using isomorphic-packages worker
   */
  async addIsomorphicPackagesToFile(
    recognizedPackagesNewPackages: string[],
  ): Promise<void> {
    //#region @backendFunc
    if (this.project.watcher.isTaonLightWatcherMode) {
      return;
    }
    const alreadyExistsJson = Helpers.readJsonC(this.jsonPath) || {};
    const alreadyExistsJsonArr =
      alreadyExistsJson[isomorphicPackagesJsonKey] || [];

    Helpers.writeJson(this.jsonPath, {
      [isomorphicPackagesJsonKey]: Utils.uniqArray(
        alreadyExistsJsonArr.concat(recognizedPackagesNewPackages),
      ),
    });
    //#endregion
  }

  //#endregion

  //#region resolve and add isomorphic isomorphic packages names to memory
  /**
   * @deprecated  not needed when using isomorphic-packages worker
   */
  private resolveAndAddIsomorphicLibsToMemory(
    isomorphicPackagesNames: string[],
    informAboutDiff = false,
  ): void {
    //#region @backendFunc
    // console.log(`add ed isomorphic isomorphic packages names to memory: ${isomorphicPackagesNames.join(', ')}`);
    if (!this.coreContainer) {
      return;
    }
    if (this.project.watcher.isTaonLightWatcherMode) {
      return;
    }

    if (informAboutDiff) {
      const current =
        this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs;

      const newAdded = isomorphicPackagesNames.filter(
        l => !current.includes(l),
      );
      for (const packageName of newAdded) {
        Helpers.info(
          `[${config.frameworkName}] ${packageName} added to isomorphic packages...`,
        );
      }
    }

    this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs =
      Utils.uniqArray([
        ...this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs,
        ...isomorphicPackagesNames,

        this.project.nameForNpmPackage,
      ]);
    //#endregion
  }
  //#endregion

  //#region all isomorphic packages from memory
  /**
   * main source of isomorphic isomorphic packages
   */
  public get allIsomorphicPackagesFromMemory(): string[] {
    //#region @backendFunc
    if (this.project.watcher.isTaonLightWatcherMode) {
      return (
        this.project.ins.packagesFromWorker.get(
          this.project.taonJson.frameworkVersion,
        ) || []
      );
    }

    //#region normal build mode
    if (
      this.coreContainer?.packagesRecognition.inMemoryIsomorphicLibs.length ===
      0
    ) {
      this.resolveAndAddIsomorphicLibsToMemory(
        this.coreContainer?.packagesRecognition.isomorphicPackagesFromJson,
        false,
      );

      if (
        this.coreContainer?.packagesRecognition.inMemoryIsomorphicLibs
          .length === 0
      ) {
        // const command =
        //   `${config.frameworkName} ` +
        //   `${UtilsCliClassMethod.getFrom($Global.prototype.reinstall, { globalMethod: true })}`;
        // this.coreContainer.run(command).sync();

        this.coreContainer
          .run(
            // $Global.prototype.reinstall.name
            `${config.frameworkName}  ${'reinstall'}`,
          )
          .sync();

        this.resolveAndAddIsomorphicLibsToMemory(
          this.coreContainer?.packagesRecognition.isomorphicPackagesFromJson,
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
    const result = Utils.uniqArray([
      ...this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs,
      this.project.nameForNpmPackage,
    ]);
    // console.log(`allIsomorphicPackagesFromMemory: ${result.join('\n ')}`);
    return result;
    //#endregion

    //#endregion
  }
  //#endregion
}
