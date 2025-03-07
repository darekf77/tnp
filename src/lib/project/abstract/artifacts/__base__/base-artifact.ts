//#region imports
import { RegionRemover } from 'isomorphic-region-loader/src';
import { config, extAllowedToReplace, TAGS } from 'tnp-config/src';
import { CoreModels, _, crossPlatformPath, glob, path } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import {
  BuildOptions,
  InitOptions,
  ReleaseArtifactTaonNames,
  ReleaseArtifactTaonNamesArr,
  ReleaseOptions,
} from '../../../../options';
import type { Project } from '../../project';
import type { ArtifactsGlobalHelper } from '../__helpers__/artifacts-helpers';
import type { ArtifactAngularNodeApp } from '../angular-node-app';
import type { ArtifactDocsWebapp } from '../docs-webapp';
import type { ArtifactElectronApp } from '../electron-app';
import type { ArtifactMobileApp } from '../mobile-app';
import type { ArtifactNpmLibAndCliTool } from '../npm-lib-and-cli-tool';
import type { ArtifactVscodePlugin } from '../vscode-plugin';
//#endregion

export type IArtifactProcessObj = {
  angularNodeApp: ArtifactAngularNodeApp;
  npmLibAndCliTool: ArtifactNpmLibAndCliTool;
  electronApp: ArtifactElectronApp;
  mobileApp: ArtifactMobileApp;
  docsWebapp: ArtifactDocsWebapp;
  vscodeExtensionPLugin: ArtifactVscodePlugin;
};

export abstract class BaseArtifact {
  constructor(protected readonly project: Project) {}
  protected readonly artifacts: IArtifactProcessObj;

  get artifact() {
    return this.artifacts;
  }
  
  protected readonly globalHelper: ArtifactsGlobalHelper;
  protected readonly NPM_RUN_NG_COMMAND: string = `npm-run ng`; // when there is not global "ng" command -> npm-run ng.js works

  //#region  public abstract methods / struct
  /**
   * create all temp files and folders for proper inside projects structure
   * but without any external dependencies
   * (like npm install, or any other longer process)
   * struct() <=> init() with struct flag
   */
  abstract structPartial(options: InitOptions): Promise<void>;
  //#endregion

  //#region  public abstract methods / init
  /**
   * everything that in struct()
   * + install dependencies
   * + any longer process that reaches for external resources
   */
  abstract initPartial(options: InitOptions): Promise<void>;
  //#endregion

  //#region  public abstract methods / build
  /**
   * everything that in init()
   * + build project
   */
  abstract buildPartial(options: BuildOptions): Promise<void>;
  //#endregion

  //#region  public abstract methods / release
  /**
   * everything that in build()
   * + release project (publish to npm, deploy to cloud/server etc.)
   */
  abstract releasePartial(options: ReleaseOptions): Promise<void>;
  //#endregion

  //#region  public abstract methods / clear
  /**
   * everything that in build()
   * + release project (publish to npm, deploy to cloud/server etc.)
   */
  abstract clearPartial(options: ReleaseOptions): Promise<void>;
  //#endregion

  //#region getters & methods / recreate release project
  protected async recreateReleaseProject(
    buildOptions: BuildOptions,
    soft = false,
  ) {
    this.project.remove(config.folder.tmpDistRelease);
    await this.__createTempCiReleaseProject(buildOptions);
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

  //#region getters & methods / create temp project
  protected async __createTempCiReleaseProject(
    buildOptions: BuildOptions,
  ): Promise<Project> {
    //#region @backendFunc
    const absolutePathReleaseProject =
      this.project.releaseProcess.__releaseCiProjectPath;

    this.project.npmHelpers.checkProjectReadyForNpmRelease();

    if (
      this.project.framework.isStandaloneProject ||
      this.project.framework.isSmartContainer
    ) {
      Helpers.removeFolderIfExists(
        this.project.pathFor(config.folder.tmpDistRelease),
      );

      const browserFolder = path.join(
        this.project.location,
        config.folder.browser,
      );

      if (!Helpers.exists(browserFolder)) {
        Helpers.remove(browserFolder);
      }

      const websqlFolder = path.join(
        this.project.location,
        config.folder.websql,
      );

      if (!Helpers.exists(websqlFolder)) {
        Helpers.remove(websqlFolder);
      }

      Helpers.removeFolderIfExists(absolutePathReleaseProject);
      Helpers.mkdirp(absolutePathReleaseProject);
      this.project.artifactsManager.artifact.npmLibAndCliTool.__copyManager.generateSourceCopyIn(
        absolutePathReleaseProject,
        {
          useTempLocation: true, // TODO not needed
          forceCopyPackageJSON: true, // TODO not needed
          dereference: true,
          regenerateProjectChilds: this.project.framework.isSmartContainer,
        },
      );

      this.project.packageJson.linkTo(absolutePathReleaseProject);
      this.project.taonJson.linkTo(absolutePathReleaseProject);

      if (this.project.framework.isStandaloneProject) {
        await this.project.artifactsManager.globalHelper.env.init();
        this.project.artifactsManager.globalHelper.env.copyTo(
          absolutePathReleaseProject,
        );
      }

      if (this.project.framework.isSmartContainer) {
        const children = this.project.children;
        for (let index = 0; index < children.length; index++) {
          const child = children[index] as Project;
          await child.artifactsManager.globalHelper.env.init();
          child.artifactsManager.globalHelper.env.copyTo(
            crossPlatformPath([absolutePathReleaseProject, child.name]),
          );
        }
      }

      const generatedProject = this.project.ins.From(
        absolutePathReleaseProject,
      ) as Project;
      this.__allResources.forEach(relPathResource => {
        const source = path.join(this.project.location, relPathResource);
        const dest = path.join(absolutePathReleaseProject, relPathResource);
        if (Helpers.exists(source)) {
          if (Helpers.isFolder(source)) {
            Helpers.copy(source, dest, { recursive: true });
          } else {
            Helpers.copyFile(source, dest);
          }
        }
      });

      // this.linkedRepos.linkToProject(generatedProject as Project)
      this.project.nodeModules.linkToProject(generatedProject as any);

      const vscodeFolder = path.join(
        generatedProject.location,
        config.folder._vscode,
      );
      Helpers.removeFolderIfExists(vscodeFolder);
      await generatedProject.artifactsManager.artifact.npmLibAndCliTool.__insideStructure.recrate(
        InitOptions.fromBuild(buildOptions),
      );
      return generatedProject;
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / cut release code
  protected __restoreCuttedReleaseCodeFromSrc(buildOptions: BuildOptions) {
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
  protected __cutReleaseCodeFromSrc(buildOptions: BuildOptions) {
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
