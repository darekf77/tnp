import { ClearOptions, ReleaseOptions, ReleaseType } from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact } from '../base-artifact';

export class ArtifactMobileApp extends BaseArtifact<
  {
    anrdoidMobileAppApkPath: string;
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
  async clearPartial(options: ClearOptions): Promise<void> {
    return void 0; // TODO implement
  }

  async initPartial(options) {
    return void 0; // TODO implement
  }

  async buildPartial(options) {
    return void 0; // TODO implement
  }

  async releasePartial(options) {
    return void 0; // TODO implement
  }
}
