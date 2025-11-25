//#region imports
import { config } from 'tnp-core/src';
import {
  CoreModels,
  crossPlatformPath,
  fse,
  path,
  _,
  chalk,
} from 'tnp-core/src';
import { Helpers, UtilsQuickFixes } from 'tnp-helpers/src';

import {
  DEFAULT_PORT,
  iconVscode128Basename,
  tmpVscodeProj,
} from '../../../../constants';
import { Models } from '../../../../models';
import {
  ReleaseArtifactTaonNames,
  ReleaseArtifactTaonNamesArr,
  EnvOptions,
  ReleaseType,
  Development,
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
    [this.project.pathFor('tmp-vscode-proj')].forEach(f => {
      Helpers.removeSymlinks(f);
      Helpers.removeFolderIfExists(f);
    });
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

    const packageJsonForVscode = {
      name: this.project.name,
      version:
        initOptions.release.resolvedNewVersion ||
        this.project.packageJson.version,
      main: `./out/${initOptions.release.releaseType ? 'extension.js' : 'app.vscode.js'}`,
      categories: ['Other'],
      activationEvents: ['*'],
      displayName:
        this.project.packageJson.displayName ||
        `${this.project.name}-vscode-ext`,
      publisher: this.project.packageJson.publisher || 'taon-dev-local',
      icon: `${iconVscode128Basename}`,
      description:
        this.project.packageJson.description ||
        `Description of ${this.project.nameForNpmPackage} extension`,
      engines: {
        vscode: '^1.30.0',
      },
      repository: this.project.packageJson.repository || {
        url: this.project.git.remoteOriginUrl,
        type: 'git',
      },
    };

    // will be done by update-vscode-package-json.js
    if (this.project.taonJson.overridePackageJsonManager.contributes) {
      packageJsonForVscode['contributes'] =
        this.project.taonJson.overridePackageJsonManager.contributes;
    }

    Helpers.writeJson(
      crossPlatformPath([tmpVscodeProjPath, config.file.package_json]),
      packageJsonForVscode,
    );

    for (const resourceRelative of this.project.taonJson.resources) {
      Helpers.copyFile(
        this.project.pathFor(resourceRelative),
        crossPlatformPath([tmpVscodeProjPath, resourceRelative]),
      );
    }

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
      const coreName = _.upperFirst(_.camelCase(this.project.name));
      const coreNameKebab = _.kebabCase(this.project.name);
      const contentOrgVscode =
        this.project.framework.coreProject.readFile('src/app.vscode.ts');
      this.project.writeFile(
        relativeAppVscodeJsPath,
        contentOrgVscode
          .replace(
            new RegExp(
              `IsomorphicLibV${this.project.framework.frameworkVersion.replace('v', '')}`,
              'g',
            ),
            `${coreName}`,
          )
          .replace(
            new RegExp(
              `isomorphic-lib-v${this.project.framework.frameworkVersion.replace('v', '')}`,
              'g',
            ),
            `${coreNameKebab}`,
          ),
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
    const vscodeVsixOutPath: string = extProj.pathFor(
      this.extensionVsixNameFrom(buildOptions),
    );
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
        await this.project.artifactsManager.globalHelper.branding.generateLogoFroVscodeLocations();
        if (!shouldSkipBuild) {
          await Helpers.bundleCodeIntoSingleFile(
            crossPlatformPath([
              tmpVscodeProjPath,
              config.folder.dist,
              'app.vscode.js',
            ]),
            destExtensionJs,
            {
              strategy: 'vscode-ext',
              additionalExternals: [
                ...this.project.taonJson.additionalExternalsFor(
                  'vscode-plugin',
                ),
              ],
              additionalReplaceWithNothing: [
                ...this.project.taonJson.additionalReplaceWithNothingFor(
                  'vscode-plugin',
                ),
              ],
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
      try {
        const args = [
          ...(this.project.taonJson.baseContentUrl
            ? [`--baseContentUrl "${this.project.taonJson.baseContentUrl}"`]
            : []),
          ...(this.project.taonJson.baseImagesUrl
            ? [`--baseImagesUrl "${this.project.taonJson.baseImagesUrl}"`]
            : []),
        ];
        extProj.run(`taon-vsce package ${args.join(' ')}`).sync();
      } catch (error) {
        throw 'Problem with vscode package metadata';
      }
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
    let projectsReposToPushAndTag: string[] = [this.project.location];
    let projectsReposToPush: string[] = [];

    const { vscodeVsixOutPath } = await this.buildPartial(
      EnvOptions.fromRelease(releaseOptions),
    );

    if (releaseOptions.release.releaseType === 'local') {
      //#region local release
      const releaseData = await this.localReleaseDeploy(
        path.dirname(vscodeVsixOutPath),
        releaseOptions,
        {
          copyOnlyExtensions: ['.vsix'],
          createReadme: `# Installation

Right click on the file **${path.basename(this.extensionVsixNameFrom(releaseOptions))}**
and select "Install Extension VSIX" to install it in your
local VSCode instance.

`,
        },
      );

      projectsReposToPushAndTag.push(...releaseData.projectsReposToPushAndTag);
      releaseProjPath = releaseData.releaseProjPath;
      //#endregion
    }
    if (releaseOptions.release.releaseType === 'static-pages') {
      //#region local release
      const releaseData = await this.staticPagesDeploy(
        path.dirname(vscodeVsixOutPath),
        releaseOptions,
        {
          copyOnlyExtensions: ['.vsix'],
        },
      );

      projectsReposToPush.push(...releaseData.projectsReposToPush);
      releaseProjPath = releaseData.releaseProjPath;
      //#endregion
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

    if (releaseOptions.release.removeReleaseOutputAfterLocalInstall) {
      Helpers.removeFolderIfExists(releaseProjPath);
    }

    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      releaseProjPath,
      releaseType,
      projectsReposToPushAndTag,
      projectsReposToPush,
    };
    //#endregion
  }
  //#endregion

  //#region private methods

  //#region private methods / get tmp vscode proj path (for any build)
  public getTmpVscodeProjPath(releaseType?: ReleaseType): string {
    const tmpVscodeProjPath = this.project.pathFor(
      `${tmpVscodeProj}/${
        releaseType ? releaseType : Development
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
  private extensionVsixNameFrom(initOptions: EnvOptions): string {
    return `${this.project.name}-${
      initOptions.release.resolvedNewVersion || this.project.packageJson.version
    }.vsix`;
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

  //#endregion
}
