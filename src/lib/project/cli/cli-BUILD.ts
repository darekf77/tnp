//#region imports
import { _, UtilsTerminal } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import { EnvOptions, ReleaseArtifactTaon, ReleaseType } from '../../options';

import { BaseCli } from './base-cli';
//#endregion

// @ts-ignore TODO weird inheritance problem
class $Build extends BaseCli {
  //#region initialize
  async __initialize__(): Promise<void> {
    await super.__initialize__();
    if (this.params.build['base-href'] && !this.params.build.baseHref) {
      this.params.build.baseHref = this.params.build['base-href'];
      delete this.params.build['base-href'];
    }
  }
  //#endregion

  //#region  _
  public async _(recursiveAction = false): Promise<void> {
    await this.project.build(
      this.params.clone({
        release: {
          targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        },
        recursiveAction,
        finishCallback: () => this._exit(),
      }),
    );
  }
  //#endregion

  async all(): Promise<void> {
    await this._(true);
  }

  //#region watch build interactive mode
  /**
   * display console menu
   */
  async watch(): Promise<void> {
    await this.project.build(
      this.params.clone({
        build: {
          watch: true,
        },
      }),
    );
  }
  //#endregion

  //#region other build commands

  //#region other build commands / watch build library
  async watchLib() {
    await this.project.build(
      this.params.clone({
        release: {
          targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        },
        build: {
          watch: true,
        },
        finishCallback: () => this._exit(),
      }),
    );
  }
  //#endregion

  //#region other build commands / build library
  async lib() {
    await this.project.build(
      EnvOptions.from({
        ...this.params,
        release: {
          ...this.params.release,
          targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        },
        recursiveAction: this.project.framework.isContainer,
        finishCallback: () => this._exit(),
      }),
    );
  }
  //#endregion

  //#region other build commands / watch build vscode
  async watchVscode() {
    await this.vscode(true);
  }
  //#endregion

  //#region other build commands / build vscode
  async vscode(watch = false) {
    await this.project.build(
      EnvOptions.from({
        ...this.params,
        build: {
          watch,
        },
        release: {
          targetArtifact: ReleaseArtifactTaon.VSCODE_PLUGIN,
        },
        finishCallback: () => this._exit(),
      }),
    );
  }
  //#endregion

  //#region other build commands / watch build websql app
  async watchAppWebsql() {
    await this.project.build(
      this.params.clone({
        build: {
          watch: true,
          websql: true,
        },
        release: {
          targetArtifact: ReleaseArtifactTaon.ANGULAR_NODE_APP,
        },
        finishCallback: () => this._exit(),
      }),
    );
  }
  //#endregion

  //#region other build commands / watch build normal app
  async watchApp(websql = false) {
    await this.project.build(
      this.params.clone({
        build: {
          watch: true,
        },
        release: {
          targetArtifact: ReleaseArtifactTaon.ANGULAR_NODE_APP,
        },
        finishCallback: () => this._exit(),
      }),
    );
  }
  //#endregion

  //#region other build commands / watch build electron websql app
  async watchElectronWebsql() {
    await this.watchElectron(true);
  }
  //#endregion

  //#region other build commands / watch build electron normal app
  async watchElectron(websql = false) {
    await this.project.build(
      this.params.clone({
        release: {
          targetArtifact: ReleaseArtifactTaon.ELECTRON_APP,
        },
        build: {
          websql,
          watch: true,
        },
        finishCallback: () => this._exit(),
      }),
    );
  }

  /**
   * JUST FOR TESTING PURPOSES
   */
  async electron(websql = false) {
    // await this.project.release(
    //   this.params.clone({
    //     release: {
    //       skipNpmPublish: true,
    //       skipCodeCutting: true,
    //       skipTagGitPush: true,
    //       skipResolvingGitChanges: true,
    //       targetArtifact: ReleaseArtifactTaon.ELECTRON_APP,
    //       releaseType: 'local',
    //       envName: '__',
    //     },
    //     build: {
    //       websql,
    //       watch: false,
    //     },
    //     finishCallback: () => this._exit(),
    //   }),
    // );
    // await this.project.artifactsManager.artifact.npmLibAndCliTool.buildPartial(
    //   this.params.clone({
    //     build: {
    //       pwa: {
    //         disableServiceWorker: true,
    //       },
    //       baseHref: `./`,
    //     },
    //     copyToManager: {
    //       skip: true,
    //     },
    //     release: {
    //       targetArtifact: ReleaseArtifactTaon.ELECTRON_APP,
    //     },
    //   }),
    // );
    // await this.project.build(
    //   this.params.clone({
    //     release: {
    //       targetArtifact: ReleaseArtifactTaon.ELECTRON_APP,
    //       releaseType: 'local',
    //     },
    //     build: {
    //       websql,
    //       watch: false,
    //     },
    //     finishCallback: () => this._exit(),
    //   }),
    // );
    // this._exit();
  }
  //#endregion

  //#region other build commands / clean watch/build
  async cleanWatchLib() {
    await this.project.clear();
    await this.watchLib();
  }

  async cleanLib() {
    await this.project.clear();
    await this.lib();
  }

  async cleanBuild() {
    await this.project.artifactsManager.artifact.npmLibAndCliTool.clearPartial();
    await this._();
  }
  //#endregion

  //#region other build commands / default build for project
  async default() {
    await this.project.build(
      // TODO ADD ARTIFACT ?
      EnvOptions.from({
        ...this.params,
        build: {
          watch: true,
        },
      }),
    );
  }
  //#endregion

  //#region other build commands / build angular app
  /**
   * @deprecated
   */
  async releaseApp() {
    // await this.project.build(
    //   this.params.clone({
    //     build: {
    //       watch: false,
    //     },
    //     release: {
    //       targetArtifact: 'npm-lib-and-cli-tool',
    //     },
    //   }),
    // );
    await this.project.release(
      this.params.clone({
        copyToManager: {
          skip: true,
        },
        release: {
          skipNpmPublish: true,
          skipTagGitPush: true,
          skipReleaseQuestion: true,
          targetArtifact: ReleaseArtifactTaon.ANGULAR_NODE_APP,
          releaseType: ReleaseType.MANUAL,
        },
        build: {
          watch: false,
          // angularSsr: true,
        },
      }),
    );
    this._exit();
  }

  /**
   * @deprecated
   */
  async appWatch() {
    await this.project.build(
      this.params.clone({
        release: {
          targetArtifact: ReleaseArtifactTaon.ANGULAR_NODE_APP,
        },
        build: {
          watch: true,
        },
      }),
    );
  }
  //#endregion

  //#region other build commands / start lib/app build
  async start() {
    // TODO add proper logic
    await this.project.build(
      this.params.clone({
        release: {
          targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        },
        build: {
          watch: true,
        },
      }),
    );
    await this.project.build(
      this.params.clone({
        release: {
          targetArtifact: ReleaseArtifactTaon.ANGULAR_NODE_APP,
        },
        build: {
          watch: true,
        },
      }),
    );
  }

  async startElectron() {
    // TODO add proper logic
    await this.project.build(
      this.params.clone({
        release: {
          targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        },
        build: {
          watch: true,
        },
      }),
    );
    await this.project.build(
      this.params.clone({
        release: {
          targetArtifact: ReleaseArtifactTaon.ELECTRON_APP,
        },
        build: {
          watch: true,
        },
      }),
    );
  }

  async cleanStartElectron() {
    await this.project.clear(this.params);
    await this.startElectron();
  }

  /**
   * @deprecated
   */
  async startClean() {
    await this.project.clear(this.params);
    await this.start();
  }
  //#endregion

  //#region other build commands / mk docs build
  /**
   * @deprecated
   */
  async mkdocs() {
    const mkdocsActions = {
      //#region @notForNpm
      SELECT_COMMAND: {
        name: '< select command >',
      },
      // BUILD_DEPLY_DOCS_TAON: {
      //   name: 'Build & deply docs for www.taon.dev',
      //   value: {
      //     command: `python -m mkdocs build --site-dir ../../taon-projects/www-taon-dev/docs/documentation`,
      //     action: async () => {
      //       const taonProjWww = this.ins.From([
      //         this.cwd,
      //         '../../taon-projects/www-taon-dev',
      //       ]);
      //       if (await Helpers.questionYesNo('Push and commit docs update ?')) {
      //         taonProjWww.git.addAndCommit('docs: update');
      //         await taonProjWww.git.pushCurrentBranch();
      //       }
      //     },
      //   },
      // },
      // BUILD_DOCS_TAON: {
      //   name: 'Build docs for www.taon.dev',
      //   value: {
      //     command: `python -m mkdocs build --site-dir ../../taon-projects/www-taon-dev/${TEMP_DOCS}`,
      //     action: void 0,
      //   },
      // },
      //#endregion

      SERVE_DOCS_TAON: {
        name: 'Serve docs for www.taon.dev on 8000',
        value: {
          command: 'python -m mkdocs serve',
          action: void 0,
        },
      },
    };

    let res: {
      command: string;
      action: () => Promise<void>;
    };

    while (true) {
      Helpers.clearConsole();
      const q = await UtilsTerminal.select<{
        command: string;
        action: () => Promise<void>;
      }>({
        choices: mkdocsActions,
        question: 'What you wanna do with docs ?',
      });

      if (q.command) {
        res = q;
        break;
      }
    }

    this.project.run(res.command, { output: true }).sync();
    if (_.isFunction(res.action)) {
      await res.action();
    }
    Helpers.info('DONE BUILDING DOCS');
    this._exit();
  }
  //#endregion

  //#endregion
}

export default {
  $Build: Helpers.CLIWRAP($Build, '$Build'),
};
