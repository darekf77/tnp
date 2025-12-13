import {
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';

export class ArtifactMobileApp extends BaseArtifact<
  {
    androidMobileAppApkPath: string;
    iosMobileAppIpaPath: string;
  },
  ReleasePartialOutput
> {
  constructor(project: Project) {
    super(project, ReleaseArtifactTaon.MOBILE_APP);
  }

  async clearPartial(options: EnvOptions): Promise<void> {
    return void 0; // TODO implement
  }

  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    if (!initOptions.release.targetArtifact) {
      initOptions.release.targetArtifact = ReleaseArtifactTaon.MOBILE_APP;
    }
    return initOptions;
  }

  async buildPartial(buildOptions: EnvOptions): Promise<{
    androidMobileAppApkPath: string;
    iosMobileAppIpaPath: string;
  }> {
    buildOptions = await this.initPartial(EnvOptions.from(buildOptions));
    const shouldSkipBuild = this.shouldSkipBuild(buildOptions);
    return void 0;
  }

  async releasePartial(releaseOptions): Promise<ReleasePartialOutput> {
    releaseOptions = this.updateResolvedVersion(releaseOptions);
    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
    } as any; // TODO implement
  }
}
