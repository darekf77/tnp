import { CoreModels, _, chalk, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';
import { BaseCommandLineFeature } from 'tnp-helpers/src';
import { Project } from '../abstract/project';
import { BuildOptions, ReleaseOptions } from '../../options';

//#region imports
//#region @backend
import * as semver from 'semver';
//#endregion
import { BaseFeatureForProject, BaseNpmHelpers } from 'tnp-helpers/src';
import { BaseLinkedProjects } from 'tnp-helpers/src';
import { crossPlatformPath } from 'tnp-core/src';
import { config } from 'tnp-config/src';
//#endregion
/**
 * @deprecated
 */
export class BaseLocalRelease extends BaseFeatureForProject<Project> {
  protected async _() {
    await this.project.init('before local release');
  }
  //#region methods / compilation process
  async compilationProcess() {
    //#region @backendFunc
    //#region resolve pathes
    const destBaseLatest = this.project.pathFor(
      `${config.folder.local_release}/cli/${this.project.nameForCli}-latest`,
    );
    const destBase = destBaseLatest;
    // const destBase = this.project.pathFor(
    //   `${config.folder.local_release}/cli/${this.project.nameForCli}-v${this.project.version}`,
    // );
    const destTmpBaseOldVersions = this.project.pathFor(
      `${config.folder.local_release}/cli/tmp-old-versions/` +
        `${this.project.nameForCli}-v${this.project.version}-${new Date().getTime()}`,
    );
    const destCli = crossPlatformPath([
      destBase,
      config.folder.dist,
      config.file.cli_js,
    ]);
    const destPackageJson = crossPlatformPath([
      destBase,
      config.file.package_json,
    ]);
    const destREADMEmd = crossPlatformPath([destBase, config.file.README_MD]);
    //#endregion
    if (Helpers.exists(destBase)) {
      Helpers.copy(destBase, destTmpBaseOldVersions);
      Helpers.remove(destBase);
    }
    await Helpers.ncc(
      crossPlatformPath([
        this.project.location,
        config.folder.dist,
        config.file.cli_js,
      ]),
      destCli,
      // () => {
      // ({ copyToDestination, output }) => {
      // TODO not needed for now
      // const wasmfileSource = crossPlatformPath([
      //   this.project.coreProject.location,
      //   'app/src/assets/sql-wasm.wasm',
      // ]);
      // copyToDestination(wasmfileSource);
      // return output;
      // },
    );
    this.project.copy(['bin']).to(destBase);
    const destStartJS = crossPlatformPath([destBase, 'bin/start.js']);
    Helpers.writeFile(
      destStartJS,
      `console.log('<<< USING BUNDLED CLI >>>');` +
        `\n${Helpers.readFile(destStartJS)}`,
    );
    Helpers.writeJson(destPackageJson, {
      name: `${this.project.name.replace('-cli', '')}`,
      version: this.project.version,
      bin: this.project.npmHelpers.bin,
    });
    Helpers.writeFile(
      destREADMEmd,
      `# ${this.project.name} CLI\n\n
## Installation as global tool
\`\`\`bash
npm link
\`\`\`
`,
    );
    const proj = Project.ins.From(destBaseLatest);
    proj.quickFixes.createDummyEmptyLibsReplacements(['electron']);

    //#endregion
  }
  //#endregion
  //#region methods / startCLiRelease
  async startCLiRelease() {
    await this._();
    //#region @backendFunc
    await this.project.npmHelpers.bumpPatchVersion();
    this.project.__packageJson.reload();
    await this.compilationProcess();
    //#endregion
  }
  //#endregion
}

class $LocalRelease extends BaseCommandLineFeature<ReleaseOptions, Project> {
  //#region _
  public async _() {
    Helpers.clearConsole();
    const menuOption = await this._menu();
    if (menuOption === 'cli') {
      await this.cli();
    }
    if (menuOption === 'vscodeExt') {
      await this.vscode();
    }
    this._exit();
  }
  //#endregion

  //#region vscode
  async vscode() {
    await this.project.build(
      BuildOptions.from({
        targetApp: 'vscode-extension-plugin',
        isForRelease: 'local',
      }),
    );
    Helpers.info(`Local release for VScode Extension is done`);
    this._exit();
  }
  //#endregion

  //#region cli
  async cli() {
    await new BaseLocalRelease(this.project).startCLiRelease();
    // await this.project.localRelease.startCLiRelease();
    Helpers.info(`Local release for CLI is done`);
    this._exit();
  }
  //#endregion

  //#region local release menu
  public async _menu() {
    const currentVersion = this.project.npmHelpers.version;
    const options = {
      //#region cli
      cli: {
        name:
          `${chalk.bold.gray('CLI')}` +
          chalk.italic(
            ` (local_release/cli/` +
              `${
                this.project.name.endsWith('-cli')
                  ? this.project.name
                  : this.project.name + '-cli'
              }-v${currentVersion})`,
          ),
      },
      //#endregion
      //#region electron
      electron: {
        name:
          `${chalk.bold.gray('Electron')} ` +
          `(local_release/electron-desktop-app/` +
          `${
            this.project.name.endsWith('-app')
              ? this.project.name
              : this.project.name + '-app'
          }-v${currentVersion})`,
      },
      //#endregion
      //#region vscodeExt
      vscodeExt: {
        name:
          `${chalk.bold.gray('VScode Extension')}` +
          ` (local_release/vscode-ext/${this.project.name}` +
          `-vscode-ext-v${currentVersion})`,
      },
      //#endregion
      //#region dockerizedBackendFront
      dockerizedBackendFrontend: {
        name:
          `${chalk.bold.gray('Dockerized backend/frontend')} ` +
          `(local_release/docker/${this.project.name}` +
          `-backend-frontend-v${currentVersion})`,
      },
      //#endregion
    };
    const res: keyof typeof options = await Helpers.consoleGui.select(
      'Select local releas type',
      Object.keys(options).map(k => {
        return {
          ...options[k],
          value: k,
        };
      }),
    );
    return res;
  }
  //#endregion
}

/**
 * @deprecated
 */
export default {
  $LocalRelease: Helpers.CLIWRAP($LocalRelease, '$LocalRelease'),
};
