import { CoreModels } from 'tnp-core/src';
import { TaonModels } from '../../../taon-models';
import { Project } from '../project';
import type { ArtifactAngularNodeApp } from './artifact-angular-node-app';
import type { ArtifactNpmLibAndCliTool } from './artifact-npm-lib-and-cli-tool';

type IArtifactProcessObj = {
  angularNodeApp: ArtifactAngularNodeApp;
  npmLibAndCLiTool: ArtifactNpmLibAndCliTool;
};

export abstract class BaseArtifact<
  STRUCT_OPTIONS extends TaonModels.StructOptions = TaonModels.StructOptions,
  INIT_OPTIONS extends TaonModels.InitOption = TaonModels.InitOption,
  BUILD_OPTIONS extends TaonModels.BuildOptions = TaonModels.BuildOptions,
  RELEASE_OPTIONS extends TaonModels.ReleaseOptions = TaonModels.ReleaseOptions,
  DEPLOY_PUBLISH_OPTIONS extends
    TaonModels.ReleaseOptions = TaonModels.ReleaseOptions,
> {
  static for(project: Project) {
    const artifactProcess: IArtifactProcessObj = {
      angularNodeApp:
        new (require('./artifact-angular-node-app').ArtifactAngularNodeApp)(),
      npmLibAndCLiTool:
        new (require('./artifact-npm-lib-and-cli-tool').ArtifactNpmLibAndCliTool)(),
    };

    return {
      startTask(taskType: keyof BaseArtifact) {},
      endTask(taskType: keyof BaseArtifact) {},
    };
  }

  constructor(
    public readonly processType: 'development' | TaonModels.ReleaseProcessType,
    public readonly artifactName: TaonModels.ReleaseArtifactTaon,
    protected artifactProcess: IArtifactProcessObj,
  ) {}

  abstract struct(options: STRUCT_OPTIONS): Promise<void>;

  abstract init(options: INIT_OPTIONS): Promise<void>;

  abstract build(options: BUILD_OPTIONS): Promise<void>;

  abstract release(options: RELEASE_OPTIONS): Promise<void>;

  abstract deployPublish(options: DEPLOY_PUBLISH_OPTIONS): Promise<void>;

  protected async prepareTempProject() {}
}
