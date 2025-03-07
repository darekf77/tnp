import { config } from 'tnp-config/src';
import {
  CoreModels,
  crossPlatformPath,
  fse,
  path,
  _,
  chalk,
} from 'tnp-core/src';
import { Helpers, UtilsQuickFixes } from 'tnp-helpers/src';

import { DEFAULT_PORT } from '../../../../constants';
import { Models } from '../../../../models';
import {
  BuildOptions,
  InitOptions,
  ReleaseArtifactTaonNames,
  ReleaseArtifactTaonNamesArr,
  ReleaseOptions,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact } from '../__base__/base-artifact';

export class ArtifactVscodePlugin extends BaseArtifact {
  async structPartial(options): Promise<void> {
    return void 0; // TODO implement
  }

  async initPartial(options) {
    return void 0; // TODO implement
  }

  async buildPartial(options) {
    return void 0; // TODO implement
  }

  async releasePartial(options) {
    return void 0; // TODO implement
  }

  async clearPartial(options) {
    return void 0; // TODO implement
  }

  //#region getters & methods / build vscide
  public async __buildVscode(buildOptions: BuildOptions) {
    //#region @backendFunc

    // TODO @REMOVE
    await this.initPartial(InitOptions.fromBuild(buildOptions));

    const tmpVscodeProjPath =
      buildOptions.isForRelease === 'local'
        ? this.project.pathFor(
            `tmp-vscode-proj/local-release/${this.project.name}`,
          )
        : this.project.pathFor(
            `tmp-vscode-proj/development/${this.project.name}`,
          );

    const destExtensionJs = crossPlatformPath([
      tmpVscodeProjPath,
      'out/extension.js',
    ]);

    Helpers.writeJson(
      crossPlatformPath([tmpVscodeProjPath, config.file.package_json]),
      {
        name: this.project.name,
        version: this.project.packageJson.version,
        main: './out/extension.js',
        categories: ['Other'],
        activationEvents: ['*'],
        displayName: `${this.project.name}-vscode-ext`,
        publisher: 'taon-dev-local',
        description: '',
        engines: {
          vscode: '^1.30.0',
        },
      },
    );
    const extProj = this.project.ins.From(tmpVscodeProjPath);

    Helpers.createSymLink(
      this.project.pathFor(config.folder.dist),
      crossPlatformPath([tmpVscodeProjPath, config.folder.dist]),
    );

    Helpers.createSymLink(
      this.project.pathFor(config.folder.node_modules),
      crossPlatformPath([tmpVscodeProjPath, config.folder.node_modules]),
    );

    const vcodePjUpdateFile = 'update-vscode-package-json.js';
    Helpers.createSymLink(
      this.project.pathFor(vcodePjUpdateFile),
      crossPlatformPath([tmpVscodeProjPath, vcodePjUpdateFile]),
    );

    if (
      !buildOptions.watch &&
      buildOptions.targetArtifact !==  'npm-lib-and-cli-tool' // TODO
    ) {
      await Helpers.ncc(
        crossPlatformPath([
          tmpVscodeProjPath,
          config.folder.dist,
          'app.vscode.js',
        ]),
        destExtensionJs,
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
    }

    if (buildOptions.watch) {
      extProj
        .run(`node ${vcodePjUpdateFile} ${buildOptions.watch ? '--watch' : ''}`)
        .async();
    } else {
      extProj.run(`node ${vcodePjUpdateFile}`).sync();
    }

    if (!buildOptions.watch && buildOptions.isForRelease === 'local') {
      extProj.run(`taon-vsce package`).sync();
    }

    //#endregion
  }
  //#endregion

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
        `${this.project.nameForCli}-v${this.project.packageJson.version}-${new Date().getTime()}`,
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
      version: this.project.packageJson.version,
      bin: this.project.packageJson.bin,
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
    const proj = this.project.ins.From(destBaseLatest);
    proj.quickFixes.createDummyEmptyLibsReplacements(['electron']);

    //#endregion
  }
  //#endregion

  //#region methods / startCLiRelease
  async startCLiRelease() {
    await this.project.init();
    //#region @backendFunc
    await this.project.packageJson.bumpPatchVersion();
    await this.compilationProcess();
    //#endregion
  }
  //#endregion

  //#region methods / extension vsix name
  public get extensionVsixName() {
    return `${this.project.name}-${this.project.packageJson.version}.vsix`;
  }
  //#endregion

  //#region methods / install locally
  async installLocally(releaseOptions?: ReleaseOptions) {
    //#region @backendFunc
    const vsixPackageName = this.extensionVsixName.replace(
      config.frameworkNames.productionFrameworkName,
      config.frameworkName,
    );
    // .replace('.vsix', '-') +
    // new Date().getTime() +
    // '.vsix';
    const copyToInstallDir = [
      'logo-128.png',
      config.file.package_json,
      config.file.tsconfig_json,
    ];

    if (!this.project.containsFile(config.folder.out)) {
      await this.project.build(BuildOptions.from({ watch: false }));
    }
    const pathTempInstallDir = this.project.pathFor(`tmp-install-dir`);
    const pathPackageJSON = crossPlatformPath([
      pathTempInstallDir,
      config.file.package_json,
    ]);
    const bundleExtensionJson = crossPlatformPath([
      pathTempInstallDir,
      'extension.js',
    ]);
    Helpers.remove(pathTempInstallDir);

    await Helpers.ncc(
      crossPlatformPath([this.project.location, 'out', 'extension.js']),
      bundleExtensionJson,
    );

    for (const fileRelative of copyToInstallDir) {
      const source = crossPlatformPath([this.project.location, fileRelative]);
      const dest = crossPlatformPath([pathTempInstallDir, fileRelative]);
      Helpers.copyFile(source, dest);
    }
    Helpers.setValueToJSON(pathPackageJSON, 'main', 'extension.js');
    const tempProj = this.project.ins.From(pathTempInstallDir);
    // await tempProj.build(BuildOptions.from({ watch: false }));
    const extensionName = (tempProj.readJson(config.file.package_json) as any)
      .name;

    Helpers.setValueToJSON(
      tempProj.pathFor(config.file.package_json),
      'name',
      extensionName.replace(
        config.frameworkNames.productionFrameworkName,
        config.frameworkName,
      ),
    );

    Helpers.setValueToJSON(
      tempProj.pathFor(config.file.package_json),
      'scripts.vscode:prepublish',
      void 0,
    );

    Helpers.setValueToJSON(
      tempProj.pathFor(config.file.package_json),
      'displayName',
      extensionName.replace(
        config.frameworkNames.productionFrameworkName,
        config.frameworkName,
      ),
    );

    await tempProj.artifactsManager.artifact.vscodeExtensionPLugin.createVscePackage(
      { showInfo: false },
    );

    Helpers.info(
      `Installing extension: ${vsixPackageName} ` +
        `with creation date: ${fse.lstatSync(tempProj.pathFor(vsixPackageName)).birthtime}...`,
    );
    tempProj.run(`code --install-extension ${vsixPackageName}`).sync();
    //#endregion
  }
  //#endregion

  //#region methods / create vscode package
  async createVscePackage({
    showInfo = true,
    args = '',
  }: { showInfo?: boolean; args?: string } = {}) {
    //#region @backendFunc
    const vsixPackageName = this.extensionVsixName;
    try {
      await Helpers.actionWrapper(
        () => {
          this.project.run(`taon-vsce package ${args}`).sync();
        },
        `Building vsix package ` + chalk.bold(vsixPackageName) + `... `,
      );
      if (showInfo) {
        const commandInstall = chalk.bold(
          `${config.frameworkName} install:locally`,
        );
        Helpers.info(`

        Please use command: ${commandInstall} # or ${config.frameworkName} il
        to install this package in local vscode instance.

        `);
      }
    } catch (error) {
      Helpers.error(error, true, true);
      Helpers.error(`Not able to build ${vsixPackageName} package `);
    }
    //#endregion
  }
  //#endregion
}
