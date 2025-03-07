import { ClearOptions, ReleaseOptions } from '../../../../options';
import { BaseArtifact } from '../__base__/base-artifact';

export class ArtifactMobileApp extends BaseArtifact {
  async clearPartial(options: ClearOptions): Promise<void> {
    return void 0; // TODO implement
  }
  async structPartial(options): Promise<void> {
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
