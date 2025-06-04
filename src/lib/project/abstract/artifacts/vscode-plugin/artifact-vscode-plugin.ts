//#region imports
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

import { DEFAULT_PORT, tmpVscodeProj } from '../../../../constants';
import { Models } from '../../../../models';
import {
  ReleaseArtifactTaonNames,
  ReleaseArtifactTaonNamesArr,
  EnvOptions,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';
//#endregion

export class ArtifactVscodePlugin extends BaseArtifact<
  {
    vscodeVsixOutPath: string;
  },
  ReleasePartialOutput
> {
  constructor(project: Project) {
    super(project, 'vscode-plugin');
  }

  public readonly appVscodeJsName = 'app.vscode.js';

  //#region clear partial
  async clearPartial(clearOption: EnvOptions) {
    return void 0; // TODO implement
  }
  //#endregion

  //#region init partial
  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc
    if (!initOptions.release.targetArtifact) {
      initOptions.release.targetArtifact = 'vscode-plugin';
    }
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

    buildOptions = await this.project.artifactsManager.init(
      EnvOptions.fromBuild(buildOptions),
    );
    const shouldSkipBuild = this.shouldSkipBuild(buildOptions);

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
        if (!shouldSkipBuild) {
          await Helpers.ncc(
            crossPlatformPath([
              tmpVscodeProjPath,
              config.folder.dist,
              'app.vscode.js',
            ]),
            destExtensionJs,
            {
              strategy: 'vscode-ext',
            },
          );
        }
      }

      if (!shouldSkipBuild) {
        extProj
          .run(
            `node ${this.vcodeProjectUpdatePackageJsonFilename} ` +
              `${!buildOptions.release.releaseType ? 'app.vscode' : ''} `,
          )
          .sync();
      }
    }

    if (!buildOptions.build.watch && buildOptions.release.releaseType) {
      extProj.run(`taon-vsce package`).sync();
    }

    return { vscodeVsixOutPath };
    //#endregion
  }
  //#endregion

  //#region release partial
  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<ReleasePartialOutput> {
    //#region @backendFunc
    let releaseProjPath: string;
    let releaseType: ReleaseType = releaseOptions.release.releaseType;
    releaseOptions = this.updateResolvedVersion(releaseOptions);

    const { vscodeVsixOutPath } = await this.buildPartial(
      EnvOptions.fromRelease(releaseOptions),
    );

    if (releaseOptions.release.releaseType === 'local') {
      const localReleaseOutputBasePath = this.project.pathFor([
        config.folder.local_release,
        this.currentArtifactName,
        `${this.project.name}-latest`,
      ]);
      Helpers.remove(localReleaseOutputBasePath);
      Helpers.copyFile(
        vscodeVsixOutPath,
        crossPlatformPath([localReleaseOutputBasePath, this.extensionVsixName]),
      );
      Helpers.writeFile(
        crossPlatformPath([localReleaseOutputBasePath, 'README.md']),
        `# Installation

Right click on the file **${path.basename(this.extensionVsixName)}**
and select "Install Extension VSIX" to install it in your
local VSCode instance.

`,
      );
      releaseProjPath = localReleaseOutputBasePath;
    }
    if (releaseOptions.release.releaseType === 'manual') {
      // TODO release to microsoft store or serve with place to put assets
    }
    if (releaseOptions.release.releaseType === 'cloud') {
      // TODO trigger cloud release (it will actually be manual on remote server)
    }

    if (releaseOptions.release.installLocally) {
      await this.installLocally(vscodeVsixOutPath);
    }

    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      releaseProjPath,
      releaseType,
      projectsReposToPushAndTag: [this.project.location],
    };
    //#endregion
  }
  //#endregion

  //#region private methods

  //#region private methods / get tmp vscode proj path (for any build)
  public getTmpVscodeProjPath(releaseType?: ReleaseType): string {
    const tmpVscodeProjPath = this.project.pathFor(
      `${tmpVscodeProj}/${
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

  //#region private methods / get VSCode project update package json filename
  public get vcodeProjectUpdatePackageJsonFilename(): string {
    return 'update-vscode-package-json.js';
  }
  //#endregion

  //#region private methods / extension vsix name
  private get extensionVsixName(): string {
    return `${this.project.name}-${this.project.packageJson.version}.vsix`;
  }
  //#endregion

  //#region private methods / install locally
  /**
   * TODO move this to local release
   */
  public async installLocally(pathToVsixFile: string): Promise<void> {
    //#region @backendFunc
    Helpers.info(
      `Installing extension: ${path.basename(pathToVsixFile)} ` +
        `with creation date: ${fse.lstatSync(pathToVsixFile).birthtime}...`,
    );
    Helpers.run(`code --install-extension ${path.basename(pathToVsixFile)}`, {
      cwd: crossPlatformPath(path.dirname(pathToVsixFile)),
    }).sync();
    //#endregion
  }
  //#endregion

  //#region private methods / create vscode package
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

  //#endregion
}
