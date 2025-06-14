//#region imports
import { RegionRemover } from 'isomorphic-region-loader/src';
import { config, extAllowedToReplace, TAGS } from 'tnp-config/src';
import { CoreModels, _, crossPlatformPath, glob, path } from 'tnp-core/src';
import { Helpers, UtilsTypescript, UtilsZip } from 'tnp-helpers/src';

import {
  ReleaseArtifactTaon,
  ReleaseArtifactTaonNames,
  ReleaseArtifactTaonNamesArr,
  EnvOptions,
  ReleaseType,
} from './../../../options';
import type { Project } from './../project';
import type { ArtifactsGlobalHelper } from './__helpers__/artifacts-helpers';
import type { ArtifactAngularNodeApp } from './angular-node-app';
import type { ArtifactDocsWebapp } from './docs-webapp';
import type { ArtifactElectronApp } from './electron-app';
import type { ArtifactMobileApp } from './mobile-app';
import type { ArtifactNpmLibAndCliTool } from './npm-lib-and-cli-tool';
import type { ArtifactVscodePlugin } from './vscode-plugin';
//#endregion

//#region artifact process object
export type IArtifactProcessObj = {
  angularNodeApp: ArtifactAngularNodeApp;
  npmLibAndCliTool: ArtifactNpmLibAndCliTool;
  electronApp: ArtifactElectronApp;
  mobileApp: ArtifactMobileApp;
  docsWebapp: ArtifactDocsWebapp;
  vscodePlugin: ArtifactVscodePlugin;
};
//#endregion

//#region release partial output
export interface ReleasePartialOutput {
  /**
   * Compiled output path for the artifact
   */
  releaseProjPath: string;
  releaseType: ReleaseType;
  /**
   * Absolute path to project folder where the artifact is located
   * and ready to be released with new version
   */
  projectsReposToPushAndTag?: string[];
  projectsReposToPush?: string[];
  resolvedNewVersion?: string;
}
//#endregion

//#region platform arch type
export interface PlatformArchType {
  platform?: NodeJS.Platform;
  arch?: 'arm64' | 'x64';
}

export abstract class BaseArtifact<
  BUILD_OUTPUT extends {},
  RELEASE_OUTPUT extends ReleasePartialOutput,
> {
  constructor(
    protected readonly project: Project,
    protected readonly currentArtifactName: ReleaseArtifactTaon,
  ) {}
  protected readonly artifacts: IArtifactProcessObj;
  protected readonly globalHelper: ArtifactsGlobalHelper;
  protected readonly NPM_RUN_NG_COMMAND: string = `npm-run ng`; // when there is not global "ng" command -> npm-run ng.js works

  //#region  public abstract methods / init
  /**
   * + create all temp files and folders for proper inside projects structure
   * + (when struct flag = false) start any longer process that reaches
   *   for external resources like for example: npm install
   */
  abstract initPartial(options: EnvOptions): Promise<EnvOptions>;
  //#endregion

  //#region  public abstract methods / build
  /**
   * everything that in init()
   * + build project
   */
  abstract buildPartial(options: EnvOptions): Promise<BUILD_OUTPUT>;
  //#endregion

  //#region  public abstract methods / release
  /**
   * everything that in build()
   * + release project (publish to npm, deploy to cloud/server etc.)
   */
  abstract releasePartial(options: EnvOptions): Promise<RELEASE_OUTPUT>;
  //#endregion

  //#region  public abstract methods / clear
  /**
   * everything that in build()
   * + release project (publish to npm, deploy to cloud/server etc.)
   */
  abstract clearPartial(options: EnvOptions): Promise<void>;
  //#endregion

  //#region update resolved version
  protected updateResolvedVersion(releaseOptions: EnvOptions): EnvOptions {
    // @ts-ignore
    releaseOptions.release.resolvedNewVersion =
      this.project.packageJson.resolvePossibleNewVersion(
        releaseOptions.release.releaseVersionBumpType,
      );

    return releaseOptions;
  }
  //#endregion

  //#region should skip  build
  protected shouldSkipBuild(releaseOptions: EnvOptions): boolean {
    if (_.isBoolean(releaseOptions.release.skipBuildingArtifacts)) {
      return releaseOptions.release.skipBuildingArtifacts;
    }
    if (_.isArray(releaseOptions.release.skipBuildingArtifacts)) {
      return (
        releaseOptions.release.skipBuildingArtifacts.includes(
          this.currentArtifactName,
        ) ||
        releaseOptions.release.skipBuildingArtifacts.includes(
          releaseOptions.release.targetArtifact,
        )
      );
    }
    return false;
  }
  //#endregion

  //#region private methods / get static pages cloned project location
  protected getStaticPagesClonedProjectLocation(
    releaseOptions: EnvOptions,
  ): string {
    //#region @backendFunc
    const staticPagesRepoBranch = `${releaseOptions.release.releaseType}-${this.currentArtifactName}`;
    const repoRoot = this.project.pathFor([
      `.${config.frameworkName}`,
      this.currentArtifactName,
    ]);
    const repoName = `repo-${this.project.name}-for-${releaseOptions.release.releaseType}`;
    const repoPath = crossPlatformPath([repoRoot, repoName]);
    const repoUrl = releaseOptions.release.staticPagesCustomRepoUrl
      ? releaseOptions.release.staticPagesCustomRepoUrl
      : this.project.git.remoteOriginUrl;

    if (!Helpers.exists(repoPath)) {
      Helpers.mkdirp(repoRoot);
      Helpers.git.clone({
        cwd: repoRoot,
        url: repoUrl,
        override: true,
        destinationFolderName: repoName,
      });
    }
    Helpers.git.resetHard(repoPath);
    Helpers.git.checkout(repoPath, staticPagesRepoBranch, {
      createBranchIfNotExists: true,
      fetchBeforeCheckout: true,
      switchBranchWhenExists: true,
    });
    return repoPath;
    //#endregion
  }
  //#endregion

  //#region getters & methods / all resources
  protected get __allResources(): string[] {
    //#region @backendFunc
    const res = [
      config.file.package_json,
      'tsconfig.json',
      'tsconfig.browser.json',
      'tsconfig.isomorphic.json',
      'tsconfig.isomorphic-flat-dist.json',
      config.file._npmrc,
      config.file._npmignore,
      config.file._gitignore,
      config.file.environment_js,
      config.file.tnpEnvironment_json,
      config.folder.bin,
      config.folder._vscode,
      ...this.project.taonJson.resources,
    ];
    return res;
    //#endregion
  }
  //#endregion

  //#region getters & methods / cut release code
  protected __restoreCuttedReleaseCodeFromSrc(buildOptions: EnvOptions) {
    //#region @backend
    const releaseSrcLocation = crossPlatformPath(
      path.join(this.project.location, config.folder.src),
    );
    const releaseSrcLocationOrg = crossPlatformPath(
      path.join(
        this.project.location,
        buildOptions.temporarySrcForReleaseCutCode,
      ),
    );

    Helpers.removeFolderIfExists(releaseSrcLocation);
    Helpers.copy(releaseSrcLocationOrg, releaseSrcLocation);

    //#endregion
  }
  protected __cutReleaseCodeFromSrc(buildOptions: EnvOptions) {
    //#region @backend
    const releaseSrcLocation = crossPlatformPath(
      path.join(this.project.location, config.folder.src),
    );
    const releaseSrcLocationOrg = crossPlatformPath(
      path.join(
        this.project.location,
        buildOptions.temporarySrcForReleaseCutCode,
      ),
    );
    Helpers.removeFolderIfExists(releaseSrcLocationOrg);
    Helpers.copy(releaseSrcLocation, releaseSrcLocationOrg, {
      copySymlinksAsFiles: true,
      copySymlinksAsFilesDeleteUnexistedLinksFromSourceFirst: true,
      recursive: true,
    });
    Helpers.removeFolderIfExists(releaseSrcLocation);
    Helpers.copy(releaseSrcLocationOrg, releaseSrcLocation);

    const filesForModyficaiton = glob.sync(`${releaseSrcLocation}/**/*`);
    filesForModyficaiton
      .filter(
        absolutePath =>
          !Helpers.isFolder(absolutePath) &&
          extAllowedToReplace.includes(path.extname(absolutePath)),
      )
      .forEach(absolutePath => {
        let rawContent = Helpers.readFile(absolutePath);
        rawContent = RegionRemover.from(
          absolutePath,
          rawContent,
          [TAGS.NOT_FOR_NPM],
          this,
        ).output;
        // rawContent = this.replaceRegionsWith(rawContent, ['@notFor'+'Npm']);
        Helpers.writeFile(absolutePath, rawContent);
      });
    //#endregion
  }
  //#endregion

  protected getDistinctArchitecturePrefix(
    options?: boolean | PlatformArchType,
    includeDashEnTheEnd = false,
  ): string {
    //#region @backendFunc
    options = options || {};
    if (typeof options === 'boolean' && options) {
      return `${process.platform}-${process.arch}${includeDashEnTheEnd ? '-' : ''}`;
    }

    options = options as PlatformArchType;
    if (options.arch || options.platform) {
      return (
        [options.platform, options.arch].filter(f => !!f).join('-') +
        `${includeDashEnTheEnd ? '-' : ''}`
      );
    }
    return '';
    //#endregion
  }

  //#region local release deploy
  async localReleaseDeploy(
    outputFromBuildAbsPath: string,
    releaseOptions: EnvOptions,
    options?: {
      /**
       * Example extensions: ['.zip', '.vsix']
       */
      copyOnlyExtensions?: string[];
      createReadme?: string;
      distinctArchitecturePrefix?: boolean | PlatformArchType;
    },
  ): Promise<
    Pick<ReleasePartialOutput, 'releaseProjPath' | 'projectsReposToPushAndTag'>
  > {
    //#region @backendFunc
    let releaseProjPath: string;
    const projectsReposToPushAndTag: string[] = [this.project.location];

    const architecturePrefix = this.getDistinctArchitecturePrefix(
      options.distinctArchitecturePrefix,
      false,
    );

    const localReleaseOutputBasePath = this.project.pathFor([
      config.folder.local_release,
      this.currentArtifactName,
      `${this.project.name}-latest`,
      architecturePrefix,
    ]);
    Helpers.remove(localReleaseOutputBasePath);
    if (options.copyOnlyExtensions) {
      const zips = Helpers.getFilesFrom(outputFromBuildAbsPath, {
        recursive: false,
      }).filter(f =>
        options.copyOnlyExtensions.some(
          ext => path.extname(f).replace('.', '') === ext.replace('.', ''),
        ),
      );

      for (const zipFile of zips) {
        const fileName = path.basename(zipFile);
        const destZipFile = crossPlatformPath([
          localReleaseOutputBasePath,
          fileName,
        ]);
        Helpers.copyFile(zipFile, destZipFile);
        if (await UtilsZip.splitFile(destZipFile)) {
          Helpers.removeIfExists(destZipFile);
        }
      }
    } else {
      Helpers.copy(outputFromBuildAbsPath, localReleaseOutputBasePath, {
        recursive: true,
        overwrite: true,
        copySymlinksAsFiles: true,
      });
    }

    if (options.createReadme) {
      Helpers.writeFile(
        crossPlatformPath([localReleaseOutputBasePath, 'README.md']),
        options.createReadme,
      );
    }

    releaseProjPath = localReleaseOutputBasePath;

    return {
      releaseProjPath,
      projectsReposToPushAndTag,
    };
    //#endregion
  }
  //#endregion

  //#region static pages deploy
  async staticPagesDeploy(
    outputFromBuildAbsPath: string,
    releaseOptions: EnvOptions,
    options?: {
      /**
       * Example extensions: ['.zip', '.vsix']
       */
      copyOnlyExtensions?: string[];
      createReadme?: string;
      distinctArchitecturePrefix?: boolean | PlatformArchType;
    },
  ): Promise<
    Pick<ReleasePartialOutput, 'releaseProjPath' | 'projectsReposToPush'>
  > {
    //#region @backendFunc
    options = options || {};
    const architecturePrefix = this.getDistinctArchitecturePrefix(
      options.distinctArchitecturePrefix,
    );
    const projectsReposToPush: string[] = [];
    let releaseProjPath: string;
    const staticPagesProjLocation =
      this.getStaticPagesClonedProjectLocation(releaseOptions);

    try {
      await Helpers.git.pullCurrentBranch(staticPagesProjLocation, {
        // @ts-ignore TODO @REMOVE
        exitOnError: false,
      });
    } catch (error) {}
    if (Helpers.exists([staticPagesProjLocation, config.file.taon_jsonc])) {
      Helpers.git.cleanRepoFromAnyFilesExceptDotGitFolder(
        staticPagesProjLocation,
      );
    }

    Helpers.writeFile([outputFromBuildAbsPath, '.nojekyll'], '');
    const destinationStaticPagesLocationRepoAbsPath = releaseOptions.release
      .skipStaticPagesVersioning
      ? staticPagesProjLocation
      : crossPlatformPath([
          staticPagesProjLocation,
          'version',
          this.project.packageJson
            .getVersionFor(
              releaseOptions.release.overrideStaticPagesReleaseType || 'patch',
            )
            ?.toString(),
          architecturePrefix,
        ]);
    if (options.copyOnlyExtensions) {
      Helpers.getFilesFrom(outputFromBuildAbsPath, {
        recursive: false,
      })
        .filter(f =>
          options.copyOnlyExtensions.some(
            ext => path.extname(f).replace('.', '') === ext.replace('.', ''),
          ),
        )
        .forEach(zipFile => {
          const fileName = path.basename(zipFile);
          const destZipFile = crossPlatformPath([
            destinationStaticPagesLocationRepoAbsPath,
            fileName,
          ]);
          Helpers.copyFile(zipFile, destZipFile);
        });
    } else {
      Helpers.copy(
        outputFromBuildAbsPath,
        destinationStaticPagesLocationRepoAbsPath,
      );
    }

    if (!releaseOptions.release.skipStaticPagesVersioning) {
      const versions = Helpers.foldersFrom(
        [staticPagesProjLocation, 'version'],
        {
          recursive: false,
        },
      );
      Helpers.writeFile(
        [staticPagesProjLocation, 'index.html'],
        `
        <html>
        <head>
          <title>Versions</title>
        </head>
        <body>
          <h1>${_.startCase(releaseOptions.release.targetArtifact)} ` +
          `versions for ${this.project.nameForNpmPackage}</h1>
          <ul>
            ${versions
              .map(version => {
                return (
                  `<li><a href="version/` +
                  `${path.basename(version)}${architecturePrefix ? `/${architecturePrefix}` : ''}">` +
                  `${path.basename(version)}${architecturePrefix ? `/${architecturePrefix}` : ''}</a></li>`
                );
              })
              .join('')}
          </ul>

        </body>
        </html>
        `,
      );

      UtilsTypescript.formatFile([staticPagesProjLocation, 'index.html']);
    }

    Helpers.git.revertFileChanges(staticPagesProjLocation, 'CNAME');

    if (options.createReadme) {
      Helpers.writeFile(
        crossPlatformPath([staticPagesProjLocation, 'README.md']),
        options.createReadme,
      );
    }

    Helpers.info(`Static pages release done: ${staticPagesProjLocation}`);

    releaseProjPath = staticPagesProjLocation;
    if (!releaseOptions.release.skipTagGitPush) {
      projectsReposToPush.unshift(staticPagesProjLocation);
    }
    return {
      projectsReposToPush,
      releaseProjPath,
    };
    //#endregion
  }
  //#endregion
}
