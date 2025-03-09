//#region imports
import { BaseContext, Taon } from 'taon/src';
import { config } from 'tnp-config/src';
import {
  CoreModels,
  Helpers,
  UtilsTerminal,
  _,
  chalk,
  dateformat,
  fse,
  path,
} from 'tnp-core/src';

import {
  PortUtils,
  tmpBaseHrefOverwriteRelPath,
  tmpBuildPort,
} from '../../../constants';
import {
  BuildOptions,
  ClearOptions,
  InitOptions,
  ReleaseArtifactTaonNames,
  ReleaseArtifactTaonNamesArr,
  ReleaseOptions,
} from '../../../options';
import type { Project } from '../project';

import type {
  BaseArtifact,
  IArtifactProcessObj,
} from './__base__/base-artifact';
import {
  BuildProcess,
  BuildProcessController,
} from './__base__/build-process/app/build-process';
import { ArtifactsGlobalHelper } from './__helpers__/artifacts-helpers';
//#endregion

/**
 * Artifact manager
 * Responsible for group actions on
 * current project or/and children projects
 */
export class ArtifactManager {
  static for(project: Project): ArtifactManager {
    //#region @backendFunc
    const artifactProcess = {} as IArtifactProcessObj;
    for (const key of ReleaseArtifactTaonNamesArr) {
      const pathName = `./${key}/artifact-${key}`;
      const className = `Artifact${_.upperFirst(_.camelCase(key))}`;
      // console.log({ pathName, className });
      artifactProcess[_.camelCase(key)] = new (require(pathName)[className])(
        project,
      );
    }
    const globalHelper = new ArtifactsGlobalHelper(project);
    const manager = new ArtifactManager(artifactProcess, project, globalHelper);
    for (const key of Object.keys(artifactProcess)) {
      const instance = artifactProcess[_.camelCase(key)] as BaseArtifact;
      // @ts-expect-error
      instance.artifacts = artifactProcess;
      // @ts-expect-error
      instance.globalHelper = globalHelper;
    }

    return manager as ArtifactManager;
    //#endregion
  }

  //#region constructor
  private constructor(
    /**
     * @deprecated
     * this will be protected in future
     */
    public artifact: IArtifactProcessObj,
    private project: Project,
    public globalHelper: ArtifactsGlobalHelper,
  ) {}
  //#endregion

  //#region clear
  async clear(options: ClearOptions): Promise<void> {
    await this.artifact.npmLibAndCliTool.clearPartial(options);
    await this.artifact.angularNodeApp.clearPartial(options);
    await this.artifact.electronApp.clearPartial(options);
    await this.artifact.mobileApp.clearPartial(options);
    await this.artifact.docsWebapp.clearPartial(options);
    await this.artifact.vscodeExtensionPLugin.clearPartial(options);
  }

  async clearAllChildren(options: ClearOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.clear(options);
    }
  }
  //#endregion

  //#region struct
  /**
   * struct current project only
   * struct() <=> init() with struct flag
   */
  async struct(initOptions: InitOptions): Promise<void> {
    //#region @backendFunc
    initOptions.purpose = 'only structure init';
    initOptions.struct = true;
    await this.init(initOptions);
    //#endregion
  }

  /**
   * struct all children artifacts
   */
  async structAllChildren(options: InitOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.struct(options);
    }
  }
  //#endregion

  //#region init
  async init(initOptions: InitOptions): Promise<void> {
    //#region @backendFunc
    // TODO QUICK_FIX change env to something else
    Helpers.removeFileIfExists(
      path.join(this.project.location, config.file.tnpEnvironment_json),
    );

    if (
      (this.project.framework.isContainer ||
        this.project.framework.isStandaloneProject) &&
      this.project.framework.frameworkVersionLessThan('v18')
    ) {
      Helpers.warn(`

        Project from this location is not supported

        ${this.project.location}


        `);
      UtilsTerminal.pressAnyKeyToContinueAsync({
        message: 'Press any key to continue',
      });
      return;
    }

    this.project.taonJson.preservePropsFromPackageJson(); // TODO temporary remove
    this.project.taonJson.preserveOldTaonProps(); // TODO temporary remove
    this.project.taonJson.saveToDisk('init');
    await this.project.vsCodeHelpers.init();
    await this.project.linter.init();

    if (this.project.framework.isStandaloneProject) {
      await this.project.artifactsManager.globalHelper.branding.apply(
        !!initOptions.branding,
      );
    }

    await this.artifact.npmLibAndCliTool.initPartial(initOptions);
    await this.artifact.angularNodeApp.initPartial(initOptions);
    await this.artifact.electronApp.initPartial(initOptions);
    await this.artifact.mobileApp.initPartial(initOptions);
    await this.artifact.docsWebapp.initPartial(initOptions);
    await this.artifact.vscodeExtensionPLugin.initPartial(initOptions);
    //#endregion
  }

  async initAllChildren(options: InitOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.init(options);
    }
  }
  //#endregion

  //#region build
  async build(buildOptions: BuildOptions): Promise<void> {
    //#region prevent not requested framework version
    if (this.project.framework.frameworkVersionLessThan('v18')) {
      Helpers.error(
        `Please upgrade taon framework version to to at least v18

        ${config.file.taon_jsonc} => version => should be at least 18

        `,
        false,
        true,
      );
    }
    //#endregion

    await this.artifact.npmLibAndCliTool.buildPartial(buildOptions);
    await this.artifact.angularNodeApp.buildPartial(buildOptions);
    await this.artifact.electronApp.buildPartial(buildOptions);
    await this.artifact.mobileApp.buildPartial(buildOptions);
    await this.artifact.docsWebapp.buildPartial(buildOptions);
    await this.artifact.vscodeExtensionPLugin.buildPartial(buildOptions);
  }

  async buildAllChildren(options: BuildOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.build(options);
    }
  }
  //#endregion

  //#region release
  async release(options: ReleaseOptions): Promise<void> {
    await this.artifact.npmLibAndCliTool.releasePartial(options);
    await this.artifact.angularNodeApp.releasePartial(options);
    await this.artifact.electronApp.releasePartial(options);
    await this.artifact.mobileApp.releasePartial(options);
    await this.artifact.docsWebapp.releasePartial(options);
    await this.artifact.vscodeExtensionPLugin.releasePartial(options);
  }

  async releaseAllChildren(options: ReleaseOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.release(options);
    }
  }
  //#endregion
}
