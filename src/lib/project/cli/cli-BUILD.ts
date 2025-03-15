import { config } from 'tnp-config/src';
import { _, chalk, UtilsTerminal } from 'tnp-core/src';
import { Utils } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';

import { TEMP_DOCS } from '../../constants';
import { BuildOptions } from '../../options';
import type { Project } from '../abstract/project';

// @ts-ignore TODO weird inheritance problem
class $Build extends BaseCommandLineFeature<BuildOptions, Project> {
  protected async __initialize__() {
    if (this.params['base-href'] && !this.params.baseHref) {
      this.params.baseHref = this.params['base-href'];
      delete this.params['base-href'];
    }
    this.params = BuildOptions.from(this.params);
    //#region resolve smart containter
    this._tryResolveChildIfInsideArg();

    //#endregion
    // console.log(this.params)
  }

  public async _() {
    await this.project.build(
      BuildOptions.from({
        ...this.params,
        finishCallback: () => this._exit(),
      }),
    );
  }

  async watchLib() {
    await this.project.build(
      BuildOptions.from({
        ...this.params,
        targetArtifact: 'npm-lib-and-cli-tool',
        watch: true,
        finishCallback: () => this._exit(),
      }),
    );
  }

  async lib() {
    await this.project.build(
      BuildOptions.from({
        ...this.params,
        targetArtifact: 'npm-lib-and-cli-tool',
        finishCallback: () => this._exit(),
      }),
    );
  }

  async vscode(watch = false) {
    await this.project.build(
      BuildOptions.from({
        ...this.params,
        watch,
        targetArtifact: 'vscode-plugin',
        finishCallback: () => this._exit(),
      }),
    );
  }

  async watchVscode() {
    await this.vscode(true);
  }

  async watchAppWebsql() {
    await this.watchApp(true);
  }

  async watchApp(websql = false) {
    await this.project.build(
      BuildOptions.from({
        ...this.params,
        websql,
        targetArtifact: 'angular-node-app',
        finishCallback: () => this._exit(),
      }),
    );
  }

  async watchElectronWebsql() {
    await this.watchElectron(true);
  }

  async watchElectron(websql = false) {
    await this.project.build(
      BuildOptions.from({
        ...this.params,
        websql,
        watch: true,
        targetArtifact: 'electron-app',
        finishCallback: () => this._exit(),
      }),
    );
  }

  /**
   * display console menu
   */
  async watch() {
    await this.project.build(
      BuildOptions.from({
        ...this.params,
        watch: true,
      }),
    );
  }

  async cleanWatch() {
    await this.project.artifactsManager.artifact.npmLibAndCliTool.clearPartial();
    await this.watch();
  }

  async cleanBuild() {
    await this.project.artifactsManager.artifact.npmLibAndCliTool.clearPartial();
    await this._();
  }

  async default() {
    await this.project.build(
      BuildOptions.from({
        ...this.params,
        watch: true,
      }),
    );
  }

  async app() {
    await this.project.build(
      BuildOptions.from({
        ...this.params,
        finishCallback: () => this._exit(),
      }),
    );
  }

  async appWatch() {
    await this.project.build(
      BuildOptions.from({
        ...this.params,
        watch: true,
      }),
    );
  }

  async start() {
    await this.project.build(
      BuildOptions.from({
        ...this.params,
        watch: true,
      }),
    );
  }

  async startClean() {
    await this.project.artifactsManager.artifact.npmLibAndCliTool.clearPartial();
    await this.start();
  }

  async mkdocs() {
    const mkdocsActions = {
      //#region @notForNpm
      SELECT_COMMAND: {
        name: '< select command >',
      },
      BUILD_DEPLY_DOCS_TAON: {
        name: 'Build & deply docs for www.taon.dev',
        value: {
          command: `python -m mkdocs build --site-dir ../../taon-projects/www-taon-dev/docs/documentation`,
          action: async () => {
            const taonProjWww = this.ins.From([
              this.cwd,
              '../../taon-projects/www-taon-dev',
            ]);
            if (await Helpers.questionYesNo('Push and commit docs update ?')) {
              taonProjWww.git.addAndCommit('docs: update');
              await taonProjWww.git.pushCurrentBranch();
            }
          },
        },
      },
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
}

export default {
  $Build: Helpers.CLIWRAP($Build, '$Build'),
};
