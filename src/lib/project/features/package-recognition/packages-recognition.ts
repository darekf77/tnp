//#region imports
import {
  _,
  path,
  //#region @backend
  fse,
  //#endregion
  crossPlatformPath,
  chalk,
} from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { config, PREFIXES } from 'tnp-config/src';
import { BrowserCodeCut } from '../../compilers/build-isomorphic-lib/code-cut/browser-code-cut.backend';
import { Project } from '../../abstract/project';
import { notAllowedAsPacakge } from '../../../constants';
//#endregion

export class PackagesRecognition {
  //#region singleton implementation
  private static instances: { [location: string]: PackagesRecognition } = {};
  //#endregion

  //#region static / from project

  public static instance(project: Project): PackagesRecognition {
    //#region @backendFunc
    if (!project?.location || !project.coreContainer) {
      return;
    }
    if (!this.instances[project.location]) {
      this.instances[project.location] = new PackagesRecognition(project);
    }
    return this.instances[project.location] as PackagesRecognition;
    //#endregion
  }

  public static async startFor(
    project: Project,
    reasonToSeachPackages: string,
  ): Promise<void> {
    //#region @backendFunc
    if (!project?.location || !project.coreContainer) {
      return;
    }
    if (!this.instances[project.location]) {
      this.instances[project.location] = new PackagesRecognition(project);
      await (this.instances[project.location] as PackagesRecognition).start(
        reasonToSeachPackages,
      );
    }
    //#endregion
  }
  //#endregion

  //#region constructor
  private readonly coreContainer?: Project;
  private constructor(private orginalProject: Project) {
    this.coreContainer = orginalProject.coreContainer;
  }
  //#endregion

  //#region methods & getters / json path
  get jsonPath() {
    return crossPlatformPath([
      this.coreContainer.location,
      config.tempFiles.FILE_NAME_ISOMORPHIC_PACKAGES,
    ]);
  }

  get libsFromJson(): string[] {
    const json = Helpers.readJson(this.jsonPath) || {};
    // console.log(`json: `,this.jsonPath )
    const arr = json[config.array.isomorphicPackages] || [];
    // console.log(`libs from json: `,arr);
    return arr;
  }
  //#endregion

  //#region methods & getters / start

  private async start(reasonToSeachPackages?: string) {
    //#region @backendFunc
    await this.coreContainer.__node_modules.reinstallIfNeeded();
    let recognizedPackages = [];
    Helpers.taskStarted(
      `[${this.orginalProject.genericName}]` +
        ` Searching isomorphic packages for ${this.coreContainer.genericName}...`,
      // +        ` reson "${reasonToSeachPackages}"`,
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
      this.coreContainer.__node_modules.path,
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
          this.coreContainer.__node_modules.path,
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
        ...this.orginalProject.packageNamesFromProject,
        ...(fromNodeModulesFolderSearch || []),
        ...Object.values(config.frameworkNames),
      ].filter(f => !f.startsWith(PREFIXES.RESTORE_NPM)),
    );

    // console.log(`

    //     ${chalk.underline(this.jsonPath)}

    //     `);

    Helpers.writeJson(this.jsonPath, {
      [config.array.isomorphicPackages]: recognizedPackages,
    });
    this.coreContainer.resolveAndAddIsomorphicLibsToMemoery(
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

          this.coreContainer.resolveAndAddIsomorphicLibsToMemoery(
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

  //#region methods & getters / check isomorphic
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
