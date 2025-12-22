//#region imports
import { Url } from 'url';

import { config } from 'tnp-core/src';
import { crossPlatformPath, path } from 'tnp-core/src';
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';

import {
  Development,
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';

import { Docs } from './docs';
//#endregion

export class ArtifactDocsWebapp extends BaseArtifact<
  {
    docsWebappDistOutPath: string;
    combinedDocsHttpServerUrl: Url;
  },
  ReleasePartialOutput
> {
  public docs: Docs;

  constructor(protected readonly project: Project) {
    super(project, ReleaseArtifactTaon.DOCS_DOCS_WEBAPP);
    this.docs = new Docs(this.project);
  }

  //#region clear partial
  async clearPartial(clearOptions: EnvOptions): Promise<void> {
    [
      this.project.pathFor(`.${config.frameworkName}/temp-docs-folders`),
    ].forEach(f => {
      Helpers.removeSymlinks(f);
      Helpers.removeFolderIfExists(f);
    });
  }
  //#endregion

  //#region init partial
  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    if (!initOptions.release.targetArtifact) {
      initOptions.release.targetArtifact = ReleaseArtifactTaon.DOCS_DOCS_WEBAPP;
    }
    await this.docs.initializeWatchers(initOptions);
    await this.docs.init();
    return initOptions;
  }
  //#endregion

  //#region build partial
  async buildPartial(buildOptions: EnvOptions): Promise<{
    docsWebappDistOutPath: string;
    combinedDocsHttpServerUrl: Url;
  }> {

    //#region @backendFunc
    buildOptions = await this.project.artifactsManager.init(
      EnvOptions.from(buildOptions),
    );

    const shouldSkipBuild = this.shouldSkipBuild(buildOptions);
    const combinedDocsHttpServerUrl: Url = void 0; // TODO implement
    const docsWebappDistOutPath: string = buildOptions.build.overrideOutputPath
      ? buildOptions.build.overrideOutputPath
      : this.getOutDirTempDocsPath(buildOptions);

    const port = await this.DOCS_ARTIFACT_PORT_UNIQ_KEY(buildOptions);

    if (!shouldSkipBuild) {
      await this.docs.runTask({
        watch: buildOptions.build.watch,
        initialParams: {
          docsOutFolder: docsWebappDistOutPath.replace(
            this.project.location + '/',
            '',
          ),
          ciBuild: buildOptions.isCiProcess,
          port,
        },
      });
    }

    if (!buildOptions.build.watch) {
      buildOptions.finishCallback?.();
    }

    return { docsWebappDistOutPath, combinedDocsHttpServerUrl };
    //#endregion

  }
  //#endregion

  //#region release partial
  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<ReleasePartialOutput> {

    //#region @backendFunc
    let releaseProjPath: string;
    const releaseType: ReleaseType = releaseOptions.release.releaseType;
    const projectsReposToPushAndTag: string[] = [this.project.location];
    const projectsReposToPush: string[] = [];
    releaseOptions = this.updateResolvedVersion(releaseOptions);

    const { docsWebappDistOutPath } = await this.buildPartial(
      EnvOptions.fromRelease({ ...releaseOptions, isCiProcess: true }),
    );

    releaseOptions.release.overrideStaticPagesReleaseType = releaseOptions
      .release.overrideStaticPagesReleaseType
      ? releaseOptions.release.overrideStaticPagesReleaseType
      : 'major';

    if (releaseOptions.release.releaseType === ReleaseType.STATIC_PAGES) {

      //#region static-pages release
      const releaseData = await this.staticPagesDeploy(
        docsWebappDistOutPath,
        releaseOptions,
      );

      projectsReposToPush.push(...releaseData.projectsReposToPush);
      releaseProjPath = releaseData.releaseProjPath;
      //#endregion

    }

    if (releaseOptions.release.releaseType === ReleaseType.LOCAL) {

      //#region static-pages release
      const releaseData = await this.localReleaseDeploy(
        docsWebappDistOutPath,
        releaseOptions,
      );

      projectsReposToPushAndTag.push(...releaseData.projectsReposToPushAndTag);
      //#endregion

    }

    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      releaseProjPath,
      releaseType,
      projectsReposToPushAndTag,
      projectsReposToPush,
    };
    //#endregions
  }
  //#endregion

  //#region helpers
  async DOCS_ARTIFACT_PORT_UNIQ_KEY(buildOptions: EnvOptions): Promise<number> {
    const key = 'docs port for http server';
    return await this.project.registerAndAssignPort(key, {
      startFrom: 3950,
    });
  }

  private getOutDirTempDocsPath(buildOptions: EnvOptions): string {
    let outDirApp =
      `.${config.frameworkName}/${this.currentArtifactName}/` +
      `${
        buildOptions.release.releaseType
          ? buildOptions.release.releaseType
          : Development
      }/` +
      this.project.packageJson.version;

    return this.project.pathFor(outDirApp);
  }
  //#endregion

}