//#region imports
import { _, UtilsTerminal } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import { EnvOptions } from '../../options';

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
  public async _(): Promise<void> {
    await this.project.build(
      EnvOptions.from({
        ...this.params,
        finishCallback: () => this._exit(),
      }),
    );
  }
  //#endregion

  //#region watch build interactive mode
  /**
   * display console menu
   */
  async watch() {
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
          targetArtifact: 'npm-lib-and-cli-tool',
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
          targetArtifact: 'npm-lib-and-cli-tool',
        },
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
          targetArtifact: 'vscode-plugin',
        },
        finishCallback: () => this._exit(),
      }),
    );
  }
  //#endregion

  //#region other build commands / watch build websql app
  async watchAppWebsql() {
    await this.watchApp(true);
  }
  //#endregion

  //#region other build commands / watch build normal app
  async watchApp(websql = false) {
    await this.project.build(
      EnvOptions.from({
        ...this.params,
        build: {
          websql,
        },
        release: {
          targetArtifact: 'angular-node-app',
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
          targetArtifact: 'electron-app',
        },
        build: {
          websql,
          watch: true,
        },
        finishCallback: () => this._exit(),
      }),
    );
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
  async app() {
    await this.project.build(
      this.params.clone({
        release: {
          targetArtifact: 'angular-node-app',
        },
        finishCallback: () => this._exit(),
      }),
    );
  }

  /**
   * @deprecated
   */
  async appWatch() {
    await this.project.build(
      this.params.clone({
        release: {
          targetArtifact: 'angular-node-app',
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
          targetArtifact: 'npm-lib-and-cli-tool',
        },
        build: {
          watch: true,
        },
      }),
    );
    await this.project.build(
      this.params.clone({
        release: {
          targetArtifact: 'angular-node-app',
        },
        build: {
          watch: true,
        },
      }),
    );
  }

  /**
   * @deprecated
   */
  async startClean() {
    await this.project.artifactsManager.artifact.npmLibAndCliTool.clearPartial();
    await this.start();
  }
  //#endregion

  //#region other build commands / mk docs build
  /**
   * @deprecated
   */
  async mkdocs() {
    const mkdocsActions = {
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */
      /* */

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
