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
  ReleaseArtifactTaonNames,
  ReleaseArtifactTaonNamesArr,
  EnvOptions,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact } from '../base-artifact';

export class ArtifactVscodePlugin extends BaseArtifact<
  {
    vscodeVsixOutPath: string;
  },
  {
    releaseProjPath: string;
    releaseType: ReleaseType;
  }
> {
  constructor(project: Project) {
    super(project, 'vscode-plugin');
  }

  public readonly appVscodeJsName = 'app.vscode.js';

  //#region private methods / get tmp vscode proj path (for any build)
  public getTmpVscodeProjPath(releaseType?: ReleaseType): string {
    const tmpVscodeProjPath = this.project.pathFor(
      `${this.project.vsCodeHelpers.vscodeTempProjFolderName}/${
        releaseType ? 'release' + releaseType : 'development'
      }/${this.project.name}`,
    );
    return tmpVscodeProjPath;
  }
  //#endregion

  //#region private methods / get dest extension js
  private getDestExtensionJs(releaseType: ReleaseType): string {
    const tmpVscodeProjPath = this.getTmpVscodeProjPath(releaseType);
    const res = crossPlatformPath([tmpVscodeProjPath, 'out/extension.js']);
    return res;
  }
  //#endregion

  //#region private methods / get vcode project update package json filename
  public get vcodeProjectUpdatePackageJsonFilename(): string {
    return 'update-vscode-package-json.js';
  }
  //#endregion

  //#region private methods / extension vsix name
  private get extensionVsixName(): string {
    return `${this.project.name}-${this.project.packageJson.version}.vsix`;
  }
  //#endregion

  //#region clear partial
  async clearPartial(clearOption: EnvOptions) {
    return void 0; // TODO implement
  }
  //#endregion

  //#region init partial
  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc
    if (!this.project.framework.isStandaloneProject) {
      return initOptions;
    }

    const tmpVscodeProjPath = this.getTmpVscodeProjPath(
      initOptions.release.releaseType,
    );

    Helpers.writeJson(
      crossPlatformPath([tmpVscodeProjPath, config.file.package_json]),
      {
        name: this.project.name,
        version: this.project.packageJson.version,
        main: `./out/${initOptions.release.releaseType ? 'extension.js' : 'app.vscode.js'}`,
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

    Helpers.createSymLink(
      this.project.pathFor(config.folder.dist),
      crossPlatformPath([
        tmpVscodeProjPath,
        initOptions.release.releaseType
          ? config.folder.dist
          : config.folder.out,
      ]),
      { tryRemoveDesPath: true, continueWhenExistedFolderDoesntExists: true },
    );

    Helpers.createSymLink(
      this.project.pathFor(config.folder.node_modules),
      crossPlatformPath([tmpVscodeProjPath, config.folder.node_modules]),
      { tryRemoveDesPath: true, continueWhenExistedFolderDoesntExists: true },
    );

    Helpers.createSymLink(
      this.project.pathFor(this.vcodeProjectUpdatePackageJsonFilename),
      crossPlatformPath([
        tmpVscodeProjPath,
        this.vcodeProjectUpdatePackageJsonFilename,
      ]),
      { tryRemoveDesPath: true, continueWhenExistedFolderDoesntExists: true },
    );

    //#region recreate app.vscode.js
    const relativeAppVscodeJsPath = crossPlatformPath('src/app.vscode.ts');
    if (!this.project.hasFile(relativeAppVscodeJsPath)) {
      this.project.writeFile(
        relativeAppVscodeJsPath,
        `import { Utils } from 'tnp-core/src';
import { CommandType, executeCommand } from 'tnp-helpers/src';
import type { ExtensionContext } from 'vscode';

const group = '${_.startCase(this.project.name)} CLI essentials';

export const commands: CommandType[] = (
  [
    {
      title: 'hello world',
    },
    {
      title: 'hey!',
    },
  ] as CommandType[]
).map(c => {
  if (!c.command) {
    c.command = \`extension.\${Utils.camelize(c.title)}\`;
  }
  if (!c.group) {
    c.group = group;
  }
  return c;
});

export function activate(context: ExtensionContext) {
  for (let index = 0; index < commands.length; index++) {
    const {
      title = '',
      command = '',
      exec = '',
      options,
      isDefaultBuildCommand,
    } = commands[index];
    const sub = executeCommand(
      title,
      command,
      exec,
      options,
      isDefaultBuildCommand,
      context,
    );
    if (sub) {
      context.subscriptions.push(sub);
    }
  }
}

export function deactivate() {}

export default { commands };


        `,
      );
    }
    //#endregion

    return initOptions;
    //#endregion
  }
  //#endregion

  //#region build partial
  async buildPartial(buildOptions: EnvOptions): Promise<{
    vscodeVsixOutPath: string;
  }> {
    //#region @backendFunc

    await this.initPartial(EnvOptions.fromBuild(buildOptions));

    const tmpVscodeProjPath = this.getTmpVscodeProjPath(
      buildOptions.release.releaseType,
    );
    const extProj = this.project.ins.From(tmpVscodeProjPath);
    const vscodeVsixOutPath: string = extProj.pathFor(this.extensionVsixName);
    const destExtensionJs = this.getDestExtensionJs(
      buildOptions.release.releaseType,
    );

    if (buildOptions.build.watch) {
      // NOTHING TO DO HERE
      // extProj
      //   .run(
      //     `node ${this.vcodeProjectUpdatePackageJsonFilename} ` +
      //       ` ${!buildOptions.releaseType ? 'app.vscode' : ''} ` +
      //       ` ${buildOptions.watch ? '--watch' : ''}`,
      //   )
      //   .async();
    } else {
      if (buildOptions.release.releaseType) {
        await Helpers.ncc(
          crossPlatformPath([
            tmpVscodeProjPath,
            config.folder.dist,
            'app.vscode.js',
          ]),
          destExtensionJs,
        );
      }

      extProj
        .run(
          `node ${this.vcodeProjectUpdatePackageJsonFilename} ` +
            `${!buildOptions.release.releaseType ? 'app.vscode' : ''} `,
        )
        .sync();
    }

    if (!buildOptions.build.watch && buildOptions.release.releaseType) {
      extProj.run(`taon-vsce package`).sync();
    }

    return { vscodeVsixOutPath };
    //#endregion
  }
  //#endregion

  //#region release partial
  async releasePartial(releaseOptions: EnvOptions): Promise<{
    releaseProjPath: string;
    releaseType: ReleaseType;
  }> {
    //#region @backendFunc
    let releaseProjPath: string;
    let releaseType: ReleaseType = releaseOptions.release.releaseType;
    const { vscodeVsixOutPath } = await this.buildPartial(
      EnvOptions.fromRelease(releaseOptions),
    );

    if (releaseOptions.release.releaseType === 'local') {
      Helpers.copyFile(
        vscodeVsixOutPath,
        this.project.pathFor(
          `${config.folder.local_release}` +
            `/${releaseOptions.release.targetArtifact}` +
            `/${this.extensionVsixName}`,
        ),
      );
    }
    if (releaseOptions.release.releaseType === 'manual') {
      // TODO release to microsoft store or serve with place to put assets
    }
    if (releaseOptions.release.releaseType === 'cloud') {
      // TODO trigger cloud release (it will actually be manual on remote server)
    }
    return { releaseProjPath, releaseType };
    //#endregion
  }
  //#endregion

  //#region methods / install locally
  /**
   * TODO move this to local release
   */
  private async installLocally(releaseOptions?: EnvOptions) {
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
      await this.project.build(EnvOptions.from({ build: { watch: false } })); // TODO remove this
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

    await tempProj.artifactsManager.artifact.vscodePlugin.createVscePackage({
      showInfo: false,
    });

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
