//#region imports
import { RegionRemover } from 'isomorphic-region-loader/src';
import { config, extAllowedToReplace, TAGS } from 'tnp-config/src';
import { CoreModels, _, crossPlatformPath, glob, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

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

export type IArtifactProcessObj = {
  angularNodeApp: ArtifactAngularNodeApp;
  npmLibAndCliTool: ArtifactNpmLibAndCliTool;
  electronApp: ArtifactElectronApp;
  mobileApp: ArtifactMobileApp;
  docsWebapp: ArtifactDocsWebapp;
  vscodePlugin: ArtifactVscodePlugin;
};

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
  resolvedNewVersion?: string;
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

  protected updateResolvedVersion(releaseOptions: EnvOptions): EnvOptions {
    // @ts-ignore
    releaseOptions.release.resolvedNewVersion =
      this.project.packageJson.resolvePossibleNewVersion(
        releaseOptions.release.releaseVersionBumpType,
      );

    return releaseOptions;
  }

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

  //#region private methods / get static pages cloned project location
  protected getStaticPagesClonedProjectLocation(
    releaseOptions: EnvOptions,
  ): string {
    //#region @backendFunc
    const staticPagesRepoBranch = releaseOptions.release.releaseType;
    const repoRoot = this.project.pathFor([
      `.${config.frameworkName}`,
      this.currentArtifactName,
    ]);
    const repoName = `repo-${this.project.name}-for-${releaseOptions.release.releaseType}`;
    const repoPath = crossPlatformPath([repoRoot, repoName]);
    if (!Helpers.exists(repoPath)) {
      Helpers.mkdirp(repoRoot);
      Helpers.git.clone({
        cwd: repoRoot,
        url: this.project.git.remoteOriginUrl,
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
}
