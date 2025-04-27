import { Url } from 'url';

import { EnvOptions, ReleaseType } from '../../../../options';
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

  async DOCS_ARTIFACT_PORT_UNIQ_KEY(buildOptions: EnvOptions): Promise<number> {
    const key = 'docs port for http server';
    return await this.project.registerAndAssignPort(key, {
      startFrom: 3950,
    });
  }

  constructor(protected readonly project: Project) {
    super(project, 'docs-webapp');
    this.docs = new Docs(this.project);
  }

  async clearPartial(clearOptions: EnvOptions): Promise<void> {
    return void 0; // TODO implement
  }

  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    await this.docs.initializeWatchers(initOptions);
    await this.docs.init();
    return initOptions;
  }

  async buildPartial(buildOptions: EnvOptions): Promise<{
    docsWebappDistOutPath: string;
    combinedDocsHttpServerUrl: Url;
  }> {
    buildOptions = await this.initPartial(EnvOptions.from(buildOptions));
    const shouldSkipBuild = this.shouldSkipBuild(buildOptions);
    const combinedDocsHttpServerUrl: Url = void 0; // TODO implement
    const docsWebappDistOutPath: string = buildOptions.build.overrideOutputPath;
    const port = await this.DOCS_ARTIFACT_PORT_UNIQ_KEY(buildOptions);

    if (!shouldSkipBuild) {
      await this.docs.runTask({
        watch: buildOptions.build.watch,
        initialParams: {
          docsOutFolder: docsWebappDistOutPath,
          ciBuild: buildOptions.isCiProcess,
          port,
        },
      });
    }

    if (!buildOptions.build.watch) {
      buildOptions.finishCallback?.();
    }

    return { docsWebappDistOutPath, combinedDocsHttpServerUrl };
  }

  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<{ releaseProjPath: string; releaseType: ReleaseType }> {
    const releaseProjPath: string = void 0; // TODO implement
    const releaseType: ReleaseType = void 0; // TODO implement
    releaseOptions = this.updateResolvedVersion(releaseOptions);

    const { docsWebappDistOutPath } = await this.buildPartial(
      EnvOptions.from({ ...releaseOptions, isCiProcess: true }),
    );
    if (releaseOptions.release.releaseType === 'local') {
      // TODO move folder
    }

    return { releaseProjPath, releaseType };
  }
}
