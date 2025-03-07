import { ClearOptions, ReleaseOptions } from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact } from '../__base__/base-artifact';

import { Docs } from './docs';

export class ArtifactDocsWebapp extends BaseArtifact {
  public docs: Docs;

  constructor(protected readonly project: Project) {
    super(project);
  }

  async clearPartial(options: ClearOptions): Promise<void> {
    return void 0; // TODO implement
  }

  async structPartial(options): Promise<void> {
    if (!this.docs) {
      this.docs = new Docs(this.project);
      await this.docs.initizalize();
    }

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
