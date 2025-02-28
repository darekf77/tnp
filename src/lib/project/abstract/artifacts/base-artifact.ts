import { CoreModels } from 'tnp-core/src';
import { Project } from '../project';
import type { ArtifactAngularNodeApp } from './artifact-angular-node-app';
import type { ArtifactNpmLibAndCliTool } from './artifact-npm-lib-and-cli-tool';
import { BuildOptions, InitOptions, ReleaseOptions } from '../../../options';

type IArtifactProcessObj = {
  angularNodeApp: ArtifactAngularNodeApp;
  npmLibAndCLiTool: ArtifactNpmLibAndCliTool;
};

//#region base artifact
export abstract class BaseArtifact {
  static for(project: Project) {
    const artifactProcess: IArtifactProcessObj = {
      angularNodeApp:
        new (require('./artifact-angular-node-app').ArtifactAngularNodeApp)(),
      npmLibAndCLiTool:
        new (require('./artifact-npm-lib-and-cli-tool').ArtifactNpmLibAndCliTool)(),
    };
    const manager = new ArtifactManager(artifactProcess);

    return manager as ArtifactManager;
  }

  readonly manager: ArtifactManager;

  //#region  public abstract methods

  //#region  public abstract methods / struct
  /**
   * create all temp files and folders for proper inside projects structure
   * but without any external dependencies
   * (like npm install, or any other longer process)
   */
  abstract struct(options: InitOptions): Promise<void>;
  //#endregion

  //#region  public abstract methods / init
  /**
   * everything that in struct()
   * + install dependencies
   * + any longer process that reaches for external resources
   */
  abstract init(options: InitOptions): Promise<void>;
  //#endregion

  //#region  public abstract methods / build
  /**
   * everything that in init()
   * + build project
   */
  abstract build(options: BuildOptions): Promise<void>;
  //#endregion

  //#region  public abstract methods / release
  /**
   * everything that in build()
   * + release project (publish to npm, deploy to cloud/server etc.)
   */
  abstract release(options: ReleaseOptions): Promise<void>;
  //#endregion

  //#endregion
}
//#endregion

//#region artifact manager
export class ArtifactManager implements Omit<BaseArtifact, 'manager'> {
  constructor(public artifact: IArtifactProcessObj) {}
  async struct(options: InitOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async init(options: InitOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async build(options: BuildOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async release(options: ReleaseOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
//#endregion
