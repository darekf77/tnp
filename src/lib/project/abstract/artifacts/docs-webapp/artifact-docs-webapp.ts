import { Url } from 'url';

import {
  BuildOptions,
  ClearOptions,
  InitOptions,
  ReleaseOptions,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact } from '../base-artifact';

import { Docs } from './docs';

export class ArtifactDocsWebapp extends BaseArtifact<
  {
    docsWebappDistOutPath: string;
    combinedDocsHttpServerUrl: Url;
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

  async buildPartial(buildOptions: BuildOptions): Promise<{
    docsWebappDistOutPath: string;
    combinedDocsHttpServerUrl: Url;
  }> {
    await this.initPartial(InitOptions.fromBuild(buildOptions));
    const combinedDocsHttpServerUrl: Url = void 0; // TODO implement
    const docsWebappDistOutPath: string = buildOptions.overrideOutputPath;
    await this.docs.runTask({
      watch: buildOptions.watch,
      initalParams: {
        docsOutFolder: docsWebappDistOutPath,
        ciBuild: buildOptions.ciProcess,
      },
    });

    if (!buildOptions.watch) {
      buildOptions.finishCallback?.();
    }

    return { docsWebappDistOutPath, combinedDocsHttpServerUrl };
  }

  async releasePartial(
    releaseOptions: ReleaseOptions,
  ): Promise<{ releaseProjPath: string; releaseType: ReleaseType }> {
    const releaseProjPath: string = void 0; // TODO implement
    const releaseType: ReleaseType = void 0; // TODO implement

    const { docsWebappDistOutPath } = await this.buildPartial(
      BuildOptions.from({ ...releaseOptions, ciProcess: true }),
    );
    if (releaseOptions.releaseType === 'local') {
      // TODO move folder
    }

    return { releaseProjPath, releaseType };
  }
}
