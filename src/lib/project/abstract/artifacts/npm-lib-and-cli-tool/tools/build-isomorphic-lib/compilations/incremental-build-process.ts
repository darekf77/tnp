//#region imports
import { StartAndWatchOptions } from 'incremental-compiler/src';
import { config } from 'tnp-core/src';
import { path, crossPlatformPath } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import { srcMainProject } from '../../../../../../../constants';
import { EnvOptions } from '../../../../../../../options';
import { ProductionBuild } from '../../../../../../../project/abstract/artifacts/__helpers__/production-build';
import type { Project } from '../../../../../project';

import { BackendCompilation } from './compilation-backend';
import { BrowserCompilation } from './compilation-browser';

//#endregion

export class IncrementalBuildProcess {
  //#region fields & getters

  protected backendCompilation: BackendCompilation;

  protected browserCompilationStandalone: BrowserCompilation;

  protected productionBuild: ProductionBuild;

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

    this.backendCompilation = new BackendCompilation(buildOptions, project);

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
        project,
        srcMainProject,
        buildOptions,
      );

      this.productionBuild = new ProductionBuild(project);
    }
  }
  //#endregion

  //#endregion

  //#region  methods / browser task anme
  protected browserTaksName(taskName: string, bc: BrowserCompilation) {
    //#region @backendFunc
    return `browser ${taskName} in ${path.basename(this.project.location)}`;
    //#endregion
  }
  //#endregion

  //#region  methods / run task
  async runTask(options: { taskName: string; watch?: boolean }): Promise<void> {
    //#region @backendFunc
    const { taskName, watch } = options;

    if (!this.project.framework.isStandaloneProject) {
      return;
    }

    // this creates: tmp-src-dist, tmp-src-app-dist , tmp-source-dist
    // tmp-src-dist-websql, tmp-src-app-dist-websql , tmp-source-dist
    await this.browserCompilationStandalone.runTask({
      taskName: this.browserTaksName(
        taskName,
        this.browserCompilationStandalone,
      ),
      watch,
    });

    // produciton build prepares:
    // tmp-src-dist-prod, tmp-src-dist-websql-prod, tmp-source-dist-prod
    if (!watch) {
      this.productionBuild.runTask(this.buildOptions);
    }

    // compilation of  tmp-source-dist or tmp-source-dist-prod
    if (this.backendCompilation) {
      await this.backendCompilation.runTask();
    }

    // copy manager moves produciton stuff from dist-prod to dist

    //#endregion
  }

  //#endregion
}
