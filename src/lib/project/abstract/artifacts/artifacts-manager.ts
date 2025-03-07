//#region imports
import { BaseContext, Taon } from 'taon/src';
import { config } from 'tnp-config/src';
import { CoreModels, Helpers, _, chalk, dateformat, fse } from 'tnp-core/src';

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
      artifactProcess[key] = new (require(pathName)[className])(project);
    }
    const globalHelper = new ArtifactsGlobalHelper(project);
    const manager = new ArtifactManager(artifactProcess, project, globalHelper);
    for (const key of Object.keys(artifactProcess)) {
      const instance = artifactProcess[key] as BaseArtifact;
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
  async struct(options: InitOptions): Promise<void> {
    await this.artifact.npmLibAndCliTool.structPartial(options);
    await this.artifact.angularNodeApp.structPartial(options);
    await this.artifact.electronApp.structPartial(options);
    await this.artifact.mobileApp.structPartial(options);
    await this.artifact.docsWebapp.structPartial(options);
    await this.artifact.vscodeExtensionPLugin.structPartial(options);
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
  async init(options: InitOptions): Promise<void> {
    await this.artifact.npmLibAndCliTool.initPartial(options);
    await this.artifact.angularNodeApp.initPartial(options);
    await this.artifact.electronApp.initPartial(options);
    await this.artifact.mobileApp.initPartial(options);
    await this.artifact.docsWebapp.initPartial(options);
    await this.artifact.vscodeExtensionPLugin.initPartial(options);
  }

  async initAllChildren(options: InitOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.init(options);
    }
  }
  //#endregion

  //#region build
  async build(options: BuildOptions): Promise<void> {
    await this.artifact.npmLibAndCliTool.buildPartial(options);
    await this.artifact.angularNodeApp.buildPartial(options);
    await this.artifact.electronApp.buildPartial(options);
    await this.artifact.mobileApp.buildPartial(options);
    await this.artifact.docsWebapp.buildPartial(options);
    await this.artifact.vscodeExtensionPLugin.buildPartial(options);
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
