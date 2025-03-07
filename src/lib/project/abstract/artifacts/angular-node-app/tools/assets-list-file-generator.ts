import { COMPILER_POOLING, incrementalWatcher } from 'incremental-compiler/src';
import { IncrementalWatcherInstance } from 'incremental-compiler/src';
import { config } from 'tnp-config/src';
import { crossPlatformPath, _, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseFeatureForProject } from 'tnp-helpers/src';

import { folder_shared_folder_info } from '../../../../../constants';
import type { Project } from '../../../project';

// @ts-ignore TODO weird inheritance problem
export class AssetsFileListGenerator extends BaseFeatureForProject<Project> {
  //#region fields & getters
  private targetProjectName: string;
  private outFolder: 'dist';
  private websql: boolean;
  watchers: IncrementalWatcherInstance[] = [];
  readonly filename = 'assets-list.json';
  private detectedFiles = [] as string[];

  get assetsFolder() {
    //#region @backendFunc
    if (this.project.framework.isSmartContainer) {
      // codete-ngrx-quick-start/main/src/assets/assets-for
      // return crossPlatformPath([
      //   this.project.location,
      //   this.outFolder,
      //   this.project.name,
      //   this.targetProjectName,
      //   config.folder.src,
      //   config.folder.assets,
      // ])
      return crossPlatformPath([
        this.project.location,
        this.outFolder,
        this.project.name,
        this.targetProjectName,
        `tmp-apps-for-${this.outFolder}${this.websql ? '-websql' : ''}`,
        this.targetProjectName,
        config.folder.src,
        config.folder.assets,
      ]);
    }
    return crossPlatformPath([
      this.project.location,
      `tmp-apps-for-${this.outFolder}${this.websql ? '-websql' : ''}`,
      this.project.name,
      config.folder.src,
      config.folder.assets,
    ]);
    //#endregion
  }

  get srcPath() {
    //#region @backendFunc
    return crossPlatformPath(path.dirname(this.assetsFolder));
    //#endregion
  }

  //#endregion

  async start(targetProjectName: string, outFolder: 'dist', websql: boolean) {
    //#region @backendFunc
    this.targetProjectName = targetProjectName;
    this.outFolder = outFolder;
    this.websql = websql;
    const files = Helpers.filesFrom(this.assetsFolder, true).filter(
      f => !this.shoudBeIgnore(f),
    );
    const assetsSrcFolder = this.srcPath;
    // console.log({
    //   files,
    //   assetsSrcFolder,
    // })

    this.detectedFiles = files
      .map(f => {
        const relative = f.replace(assetsSrcFolder, '');
        return relative;
      })
      .filter(f => this.allowedOnList(f));
    this.update();
    //#endregion
  }

  update() {
    //#region @backendFunc
    const assetsListFilePath = crossPlatformPath([
      this.assetsFolder,
      this.filename,
    ]);
    Helpers.logInfo(`\nSAVING ASSETS LIST INTO: ${assetsListFilePath}`);
    Helpers.writeJson(
      assetsListFilePath,
      this.detectedFiles.map(f => f.slice(1)),
    );
    //#endregion
  }

  updateDebounce = _.debounce(() => {
    this.update();
  }, 1000);

  private readonly notAllowed = [
    '/assets/.gitkeep',
    '/assets/assets-list.json',
    '/assets/sql-wasm.wasm',
    '/assets',
  ];

  allowedOnList = (relativePath: string) => {
    //#region @backendFunc
    return _.isUndefined(this.notAllowed.find(f => f === relativePath));
    //#endregion
  };

  shoudBeIgnore = filePathj => {
    //#region @backendFunc
    return (
      crossPlatformPath(filePathj).includes(
        `/${config.folder.generated}/pwa`,
      ) ||
      crossPlatformPath(filePathj).includes(`/${folder_shared_folder_info}`)
    );
    // shared_folder_info.txt
    //#endregion
  };

  async startAndWatch(
    targetProjectName: string,
    outFolder: 'dist',
    websql?: boolean,
  ) {
    //#region @backendFunc
    await this.start(targetProjectName, outFolder, websql);
    const srcPath = this.srcPath;

    const watcher = (
      await incrementalWatcher(
        [this.assetsFolder, `${this.assetsFolder}/**/*.*`],
        {
          name: `TAON ASSETS LIST`,
          ignoreInitial: true,
          followSymlinks: false,
          ignored: filePath => this.shoudBeIgnore(filePath),
          ...COMPILER_POOLING,
        },
      )
    ).on('all', (event, f) => {
      // console.log('TAON ASSETS LIST EVENT')
      f = crossPlatformPath(f);
      const relative = f.replace(srcPath, '');
      if (this.allowedOnList(f)) {
        if (event === 'add') {
          if (!this.detectedFiles.includes(relative)) {
            this.detectedFiles.push(relative);
            this.updateDebounce();
          }
        }
        if (event === 'unlink') {
          this.detectedFiles = this.detectedFiles.filter(f => f !== relative);
          this.updateDebounce();
        }
      }
    });
    this.watchers.push(watcher);
    //#endregion
  }
}
