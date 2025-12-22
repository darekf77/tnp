//#region imports
import { RegionRemover } from 'isomorphic-region-loader/src';
import { config, extAllowedToReplace, TAGS } from 'tnp-core/src';
import { CoreModels, _, crossPlatformPath, glob, path } from 'tnp-core/src';
import { fileName } from 'tnp-core/src';
import { Helpers, UtilsTypescript, UtilsZip } from 'tnp-helpers/src';

import {
  binMainProject,
  BundledFiles,
  BundledDocsFolders,
  dotGitIgnoreMainProject,
  dotNpmIgnoreMainProject,
  dotNpmrcMainProject,
  dotVscodeMainProject,
  localReleaseMainProject,
  packageJsonMainProject,
  readmeMdMainProject,
  srcMainProject,
  suffixLatest,
  TaonCommands,
  taonJsonMainProject,
  TemplateFolder,
  tsconfigIsomorphicFlatDistMainProject,
  tsconfigJsonBrowserMainProject,
  tsconfigJsonIsomorphicMainProject,
  tsconfigJsonMainProject,
} from '../../../constants';

import {
  ReleaseArtifactTaon,
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
  deploymentFunction?: () => Promise<void>;
}
//#endregion

//#region platform arch type
export interface PlatformArchType {
  platform?: NodeJS.Platform;
  arch?: 'arm64' | 'x64';
}
//#endregion

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

  // when there is not global "ng" command -> npm-run ng.js works
  protected readonly NPM_RUN_NG_COMMAND: string = TaonCommands.NPM_RUN_NG;

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

    this.project.packageJson.setVersion(
      releaseOptions.release.resolvedNewVersion,
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
  protected async getStaticPagesClonedProjectLocation(
    releaseOptions: EnvOptions,
  ): Promise<string> {

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
      await Helpers.git.clone({
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
      packageJsonMainProject,
      tsconfigJsonMainProject,
      tsconfigJsonBrowserMainProject,
      tsconfigJsonIsomorphicMainProject,
      tsconfigIsomorphicFlatDistMainProject,
      dotNpmrcMainProject,
      dotNpmIgnoreMainProject,
      dotGitIgnoreMainProject,
      fileName.environment_js,
      fileName.tnpEnvironment_json, // TODO NOT NEEDED ?
      binMainProject,
      dotVscodeMainProject,
      ...this.project.taonJson.resources,
    ];
    return res;
    //#endregion

  }
  //#endregion

  //#region getters & methods / cut release code
  protected __restoreCuttedReleaseCodeFromSrc(buildOptions: EnvOptions) {

    //#region @backend
    const releaseSrcLocation = this.project.pathFor(srcMainProject);

    const releaseSrcLocationOrg = this.project.pathFor(
      buildOptions.temporarySrcForReleaseCutCode,
    );

    Helpers.removeFolderIfExists(releaseSrcLocation);
    Helpers.copy(releaseSrcLocationOrg, releaseSrcLocation);

    //#endregion

  }

  protected __cutReleaseCodeFromSrc(buildOptions: EnvOptions) {

    //#region @backend
    const releaseSrcLocation = this.project.pathFor(srcMainProject);

    const releaseSrcLocationOrg = this.project.pathFor(
      buildOptions.temporarySrcForReleaseCutCode,
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

  //#region getters & methods / distinct architecture prefix
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
  //#endregion

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
      localReleaseMainProject,
      this.currentArtifactName,
      `${this.project.name}${suffixLatest}`,
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
        if (await UtilsZip.splitFile7Zip(destZipFile)) {
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
        crossPlatformPath([localReleaseOutputBasePath, readmeMdMainProject]),
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
      await this.getStaticPagesClonedProjectLocation(releaseOptions);

    try {
      await Helpers.git.pullCurrentBranch(staticPagesProjLocation, {
        // @ts-ignore TODO @REMOVE
        exitOnError: false,
      });
    } catch (error) {}
    if (Helpers.exists([staticPagesProjLocation, taonJsonMainProject])) {
      Helpers.git.cleanRepoFromAnyFilesExceptDotGitFolder(
        staticPagesProjLocation,
      );
    }

    Helpers.writeFile([outputFromBuildAbsPath, '.nojekyll'], '');

    //#region make sure version folder are proper
    let versionFolderName = this.project.packageJson.version;

    const versionType =
      releaseOptions.release.overrideStaticPagesReleaseType ||
      CoreModels.ReleaseVersionTypeEnum.PATCH;

    if (versionType === CoreModels.ReleaseVersionTypeEnum.MAJOR) {
      versionFolderName = this.project.packageJson.majorVersion?.toString();
    }

    if (versionType === CoreModels.ReleaseVersionTypeEnum.MINOR) {
      versionFolderName = [
        this.project.packageJson.majorVersion?.toString(),
        this.project.packageJson.minorVersion?.toString(),
      ].join('.');
    }
    //#endregion

    const destinationStaticPagesLocationRepoAbsPath = releaseOptions.release
      .skipStaticPagesVersioning
      ? staticPagesProjLocation
      : crossPlatformPath([
          staticPagesProjLocation,
          BundledDocsFolders.VERSION,
          versionFolderName,
          architecturePrefix,
        ]);
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
          destinationStaticPagesLocationRepoAbsPath,
          fileName,
        ]);
        Helpers.copyFile(zipFile, destZipFile);
        if (await UtilsZip.splitFile7Zip(destZipFile)) {
          Helpers.removeIfExists(destZipFile);
        }
      }
    } else {
      Helpers.copy(
        outputFromBuildAbsPath,
        destinationStaticPagesLocationRepoAbsPath,
      );
    }

    if (!releaseOptions.release.skipStaticPagesVersioning) {
      const versions = Helpers.foldersFrom(
        [staticPagesProjLocation, BundledDocsFolders.VERSION],
        {
          recursive: false,
        },
      );
      Helpers.writeFile(
        [staticPagesProjLocation, BundledFiles.INDEX_HTML],
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
                  `<li><a href="${BundledDocsFolders.VERSION}/` +
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

      UtilsTypescript.formatFile([
        staticPagesProjLocation,
        BundledFiles.INDEX_HTML,
      ]);
    }

    Helpers.git.revertFileChanges(staticPagesProjLocation, BundledFiles.CNAME);

    if (options.createReadme) {
      Helpers.writeFile(
        crossPlatformPath([staticPagesProjLocation, BundledFiles.README_MD]),
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