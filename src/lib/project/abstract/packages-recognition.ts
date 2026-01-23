//#region imports
import {
  config,
  PREFIXES,
  taonPackageName,
  tnpPackageName,
  Utils,
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
//#endregion

/**
 * TODO refactor this - use immutable db
 */
// @ts-ignore TODO weird inheritance problem
export class PackagesRecognition extends BaseFeatureForProject<Project> {
  //#region constructor
  private get coreContainer() {
    return this.project.framework.coreContainer;
  }

  protected inMemoryIsomorphicLibs = [];

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
      tmpIsomorphicPackagesJson,
    ]);
    //#endregion
  }
  //#endregion

  //#region isomorphic packages names from json
  public get isomorphicPackagesFromJson(): string[] {
    const json = Helpers.readJson(this.jsonPath) || {};
    // console.log(`json: `,this.jsonPath )
    const arr = json[isomorphicPackagesJsonKey] || [];
    // console.log(`isomorphicPackagess from json: `,arr);
    return arr;
  }
  //#endregion

  //#region start
  async start(reasonToSearchPackages?: string): Promise<void> {
    //#region @backendFunc
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
          return Helpers.uniqArray(pj[isomorphicPackagesJsonKey]);
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
        this.project.name,
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
    this.addIsomorphicPackagesToFile(recognizedPackages);
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

  //#region add isomorphic packages to file
  addIsomorphicPackagesToFile(recognizedPackagesNewPackages: string[]): void {
    //#region @backendFunc
    const alreadyExistsJson = Helpers.readJsonC(this.jsonPath) || {};
    const alreadyExistsJsonArr =
      alreadyExistsJson[isomorphicPackagesJsonKey] || [];

    Helpers.writeJson(this.jsonPath, {
      [isomorphicPackagesJsonKey]: Helpers.uniqArray(
        alreadyExistsJsonArr.concat(recognizedPackagesNewPackages),
      ),
    });
    //#endregion
  }

  //#endregion

  //#region resolve and add isomorphic isomorphic packages names to memory
  public resolveAndAddIsomorphicLibsToMemory(
    isomorphicPackagesNames: string[],
    informAboutDiff = false,
  ): void {
    //#region @backendFunc
    // console.log(`add ed isomorphic isomorphic packages names to memory: ${isomorphicPackagesNames.join(', ')}`);
    if (!this.coreContainer) {
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
      Helpers.uniqArray([
        ...this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs,
        ...isomorphicPackagesNames,
        this.project.name,
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
    const result = Helpers.uniqArray([
      ...this.coreContainer.packagesRecognition.inMemoryIsomorphicLibs,
      this.project.nameForNpmPackage,
      this.project.name,
    ]);
    // console.log(`allIsomorphicPackagesFromMemory: ${result.join('\n ')}`);
    return result;
    //#endregion
  }
  //#endregion

  //#region check isomorphic

  //#endregion
}
