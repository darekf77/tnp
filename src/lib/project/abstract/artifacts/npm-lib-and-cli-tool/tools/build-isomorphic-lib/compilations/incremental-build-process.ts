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
    const srcFolder = config.folder.src;

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
      srcFolder,
      project,
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
      this.browserCompilationStandalone = new BrowserCompilation(
        this.project,
        srcFolder,
        buildOptions,
      );
    }
  }
  //#endregion
  //#endregion

  //#region  methods
  protected browserTaksName(taskName: string, bc: BrowserCompilation) {
    //#region @backendFunc
    return `browser ${taskName} in ${path.basename(this.project.location)}`;
    //#endregion
  }

  protected backendTaskName(taskName) {
    //#region @backendFunc
    return `${taskName} in ${path.basename(this.project.location)}`;
    //#endregion
  }

  private recreateBrowserLinks(bc: BrowserCompilation) {
    //#region @backendFunc
    // TODO does not make sense anymore ?
    // const outDistPath = crossPlatformPath(
    //   path.join(bc.project.location, 'dist'),
    // );
    // Helpers.log(`recreateBrowserLinks: outDistPath: ${outDistPath}`);
    // Helpers.removeFolderIfExists(outDistPath);
    // const targetOut = crossPlatformPath(
    //   path.join(bc.project.location, bc.backendOutFolder, 'dist'),
    // );
    // Helpers.log(`recreateBrowserLinks: targetOut: ${targetOut}`);
    // Helpers.createSymLink(targetOut, outDistPath, {
    //   continueWhenExistedFolderDoesntExists: true,
    // });
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
