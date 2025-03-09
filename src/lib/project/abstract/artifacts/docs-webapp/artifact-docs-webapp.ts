import { ClearOptions, ReleaseOptions } from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact } from '../__base__/base-artifact';

import { Docs } from './docs';

export class ArtifactDocsWebapp extends BaseArtifact {
  public docs: Docs;

  constructor(protected readonly project: Project) {
    super(project);
    this.docs = new Docs(this.project);
  }

  async clearPartial(options: ClearOptions): Promise<void> {
    return void 0; // TODO implement
  }

  async initPartial(options) {
    await this.docs.initizalizeWatchers();
    await this.docs.init();
  }

  async buildPartial(options) {
    return void 0; // TODO implement
  }

  async releasePartial(options) {
    return void 0; // TODO implement
  }
}
