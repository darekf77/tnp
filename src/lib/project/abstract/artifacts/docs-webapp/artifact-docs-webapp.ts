import {
  BuildOptions,
  ClearOptions,
  InitOptions,
  ReleaseOptions,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact } from '../__base__/base-artifact';

import { Docs } from './docs';

export class ArtifactDocsWebapp extends BaseArtifact<
  {
    docsWebappDistOutPath: string;
  },
  {
    releaseProjPath: string;
    releaseType: ReleaseType;
  }
> {
  public docs: Docs;

  constructor(protected readonly project: Project) {
    super(project, 'docs-webapp');
    this.docs = new Docs(this.project);
  }

  async clearPartial(clearOptions: ClearOptions): Promise<void> {
    return void 0; // TODO implement
  }

  async initPartial(initOptions: InitOptions): Promise<void> {
    await this.docs.initizalizeWatchers();
    await this.docs.init();
  }

  async buildPartial(
    buildOptions: BuildOptions,
  ): Promise<{ docsWebappDistOutPath: string }> {
    return void 0; // TODO implement
  }

  async releasePartial(
    releaseOptions: ReleaseOptions,
  ): Promise<{ releaseProjPath: string; releaseType: ReleaseType }> {
    return void 0; // TODO implement
  }
}
