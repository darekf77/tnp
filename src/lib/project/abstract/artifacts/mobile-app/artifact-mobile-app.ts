import { EnvOptions, ReleaseType } from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact } from '../base-artifact';

export class ArtifactMobileApp extends BaseArtifact<
  {
    androidMobileAppApkPath: string;
    iosMobileAppIpaPath: string;
  },
  {
    releaseProjPath: string;
    releaseType: ReleaseType;
  }
> {
  constructor(project: Project) {
    super(project, 'mobile-app');
  }
  async clearPartial(options: EnvOptions): Promise<void> {
    return void 0; // TODO implement
  }

  async initPartial(options: EnvOptions): Promise<EnvOptions> {
    return options;
  }
  async buildPartial(buildOptions: EnvOptions): Promise<{
    androidMobileAppApkPath: string;
    iosMobileAppIpaPath: string;
  }> {
    buildOptions = await this.initPartial(EnvOptions.from(buildOptions));
    return void 0;
  }

  async releasePartial(releaseOptions) {
    releaseOptions = this.updateResolvedVersion(releaseOptions);
    return void 0; // TODO implement
  }
}
