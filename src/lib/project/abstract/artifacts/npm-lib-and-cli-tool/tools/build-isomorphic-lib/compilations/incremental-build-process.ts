//#region imports
import { IncCompiler } from 'incremental-compiler/src';
import { config } from 'tnp-config/src';
import { path, crossPlatformPath } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';

import { BackendCompilation } from './compilation-backend';
import { BrowserCompilation } from './compilation-browser';

//#endregion

export class IncrementalBuildProcess {
  //#region fields & getters

  protected backendCompilation: BackendCompilation;
  // protected browserCompilations: BrowserCompilation[];
  protected browserCompilationStandalone: BrowserCompilation;
  protected browserCompilationSmartContainer: BrowserCompilation;

  //#region constructor
  //#region @backend
  constructor(
    private project: Project,
    private buildOptions: EnvOptions,
  ) {
    Helpers.log(
      `[incremental-build-process] for project: ${project.genericName}`,
    );

    //#region init variables
    const outFolder = config.folder.dist as any;
    const location = config.folder.src;

    Helpers.log(
      `[incremental-build-process]  this.project.grandpa: ${this.project.grandpa?.genericName} `,
    );
    Helpers.log(
      `[incremental-build-process]  this.project.parent: ${this.project.parent?.genericName} `,
    );
    Helpers.log(
      `[incremental-build-process] parentProj: ${project?.parent?.genericName} `,
    );
    //#endregion

    //#region int backend compilation

    this.backendCompilation = new BackendCompilation(
      buildOptions,
      buildOptions.build.watch,
      outFolder,
      location,
      project,
      this.buildOptions.build.websql,
    );

    Helpers.log(
      `[incremental-build-process] this.backendCompilation exists: ${!!this.backendCompilation}`,
    );

    if (buildOptions.build.genOnlyClientCode) {
      if (this.backendCompilation) {
        this.backendCompilation.isEnableCompilation = false;
      }
    }

    //#endregion

    if (project.framework.isStandaloneProject) {
      let browserOutFolder = Helpers.getBrowserVerPath(
        void 0,
        this.buildOptions.build.websql,
      );
      this.browserCompilationStandalone = new BrowserCompilation(
        buildOptions.build.watch,
        this.project,
        void 0,
        void 0,
        `tmp-src-${outFolder}${this.buildOptions.build.websql ? '-websql' : ''}`,
        browserOutFolder as any,
        location,
        project,
        outFolder,
        buildOptions,
      );
    } else {
      const moduleName = '';
      const envConfig = {} as any;
      let browserOutFolder = Helpers.getBrowserVerPath(
        moduleName,
        this.buildOptions.build.websql,
      );

      if (this.buildOptions.release.releaseType) {
        browserOutFolder = crossPlatformPath(
          path.join(outFolder, browserOutFolder),
        );
      }
      this.browserCompilationSmartContainer = new BrowserCompilation(
        buildOptions.build.watch,
        this.project,
        moduleName,
        envConfig,
        `tmp-src-${outFolder}-${browserOutFolder}`,
        browserOutFolder as any,
        location,
        project,
        outFolder,
        buildOptions,
      );
    }
  }
  //#endregion
  //#endregion

  //#region  methods
  protected browserTaksName(taskName: string, bc: BrowserCompilation) {
    //#region @backendFunc
    return `browser ${taskName} in ${path.basename(bc.absPathTmpSrcDistFolder)}`;
    //#endregion
  }

  protected backendTaskName(taskName) {
    //#region @backendFunc
    return `${taskName} in ${path.basename(this.backendCompilation.absPathTmpSrcDistFolder)}`;
    //#endregion
  }

  private recreateBrowserLinks(bc: BrowserCompilation) {
    //#region @backendFunc
    const outDistPath = crossPlatformPath(path.join(bc.cwd, bc.outFolder));
    Helpers.log(`recreateBrowserLinks: outDistPath: ${outDistPath}`);
    Helpers.removeFolderIfExists(outDistPath);
    const targetOut = crossPlatformPath(
      path.join(bc.cwd, bc.backendOutFolder, bc.outFolder),
    );
    Helpers.log(`recreateBrowserLinks: targetOut: ${targetOut}`);
    Helpers.createSymLink(targetOut, outDistPath, {
      continueWhenExistedFolderDoesntExists: true,
    });
    //#endregion
  }

  async runTask(options: {
    taskName: string;
    watch?: boolean;
    afterInitCallBack?: () => void;
  }): Promise<void> {
    //#region @backendFunc
    const { taskName, watch, afterInitCallBack } = options;
    if (watch) {
      await this.startAndWatch(taskName, {
        afterInitCallBack,
        taskName,
      });
    } else {
      await this.start(taskName, afterInitCallBack);
    }
    //#endregion
  }

  async start(taskName?: string, afterInitCallBack?: () => void) {
    //#region @backendFunc
    if (this.project.framework.isStandaloneProject) {
      await this.browserCompilationStandalone.start({
        taskName: this.browserTaksName(
          taskName,
          this.browserCompilationStandalone,
        ),
        afterInitCallBack: () => {
          this.recreateBrowserLinks(this.browserCompilationStandalone);
        },
      });
    } else {
      await this.browserCompilationSmartContainer.start({
        taskName: this.browserTaksName(
          taskName,
          this.browserCompilationSmartContainer,
        ),
        afterInitCallBack: () => {
          this.recreateBrowserLinks(this.browserCompilationSmartContainer);
        },
      });
    }

    if (this.backendCompilation) {
      await this.backendCompilation.start({
        taskName: this.backendTaskName(taskName),
      });
    }

    if (_.isFunction(afterInitCallBack)) {
      await Helpers.runSyncOrAsync({ functionFn: afterInitCallBack });
    }
    //#endregion
  }

  async startAndWatch(
    taskName?: string,
    options?: IncCompiler.Models.StartAndWatchOptions,
  ) {
    //#region @backendFunc
    // console.log('[${config.frameworkName}][incremental-build-process] taskName' + taskName)

    const { afterInitCallBack } = options || {};

    if (this.project.framework.isStandaloneProject) {
      await this.browserCompilationStandalone.startAndWatch({
        taskName: this.browserTaksName(
          taskName,
          this.browserCompilationStandalone,
        ),
        afterInitCallBack: () => {
          this.recreateBrowserLinks(this.browserCompilationStandalone);
        },
      });
    } else {
      await this.browserCompilationSmartContainer.startAndWatch({
        taskName: this.browserTaksName(
          taskName,
          this.browserCompilationSmartContainer,
        ),
        afterInitCallBack: () => {
          this.recreateBrowserLinks(this.browserCompilationSmartContainer);
        },
      });
    }

    if (this.backendCompilation) {
      await this.backendCompilation.startAndWatch({
        taskName: this.backendTaskName(taskName),
      });
    }

    if (_.isFunction(afterInitCallBack)) {
      await Helpers.runSyncOrAsync({ functionFn: afterInitCallBack });
    }
    //#endregion
  }

  //#endregion
}
