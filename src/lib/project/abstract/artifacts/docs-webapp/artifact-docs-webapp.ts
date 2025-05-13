import { Url } from 'url';

import { config } from 'tnp-config/src';
import { crossPlatformPath, path } from 'tnp-core/src';
import { Helpers, UtilsTypescript } from 'tnp-helpers/src';

import { EnvOptions, ReleaseType } from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';

import { Docs } from './docs';

export class ArtifactDocsWebapp extends BaseArtifact<
  {
    docsWebappDistOutPath: string;
    combinedDocsHttpServerUrl: Url;
  },
  ReleasePartialOutput
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
  }

  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<ReleasePartialOutput> {
    //#region @backendFunc
    let releaseProjPath: string;
    const releaseType: ReleaseType = releaseOptions.release.releaseType;
    const projectsReposToPushAndTag: string[] = [this.project.location];
    releaseOptions = this.updateResolvedVersion(releaseOptions);

    const { docsWebappDistOutPath } = await this.buildPartial(
      EnvOptions.fromRelease({ ...releaseOptions, isCiProcess: true }),
    );
    if (releaseOptions.release.releaseType === 'static-pages') {
      const staticPagesProjLocation =
        this.getStaticPagesClonedProjectLocation(releaseOptions);
      try {
        await Helpers.git.pullCurrentBranch(staticPagesProjLocation, {
          // @ts-ignore TODO @REMOVE
          exitOnError: false,
        });
      } catch (error) {}
      if (Helpers.exists([staticPagesProjLocation, config.file.taon_jsonc])) {
        Helpers.git.cleanRepoFromAnyFilesExceptDotGitFolder(
          staticPagesProjLocation,
        );
      }

      Helpers.writeFile([docsWebappDistOutPath, '.nojekyll'], '');
      Helpers.copy(
        docsWebappDistOutPath,
        crossPlatformPath([
          staticPagesProjLocation,
          'version',
          this.project.packageJson.majorVersion?.toString(),
        ]),
      );
      const versions = Helpers.foldersFrom(
        [staticPagesProjLocation, 'version'],
        {
          recursive: false,
        },
      );
      Helpers.writeFile(
        [staticPagesProjLocation, 'index.html'],
        `
        <html>
        <head>
          <title>Versions</title>
        </head>
        <body>
          <h1>Documentation versions for ${this.project.nameForNpmPackage}</h1>
          <ul>
            ${versions
              .map(version => {
                return `<li><a href="version/${path.basename(version)}">${path.basename(version)}</a></li>`;
              })
              .join('')}
          </ul>

        </body>
        </html>
        `,
      );

      UtilsTypescript.formatFile([staticPagesProjLocation, 'index.html']);

      Helpers.git.revertFileChanges(staticPagesProjLocation, 'CNAME');

      Helpers.info(`Static pages release done: ${staticPagesProjLocation}`);
      releaseProjPath = staticPagesProjLocation;
      if (!releaseOptions.release.skipTagGitPush) {
        projectsReposToPushAndTag.unshift(staticPagesProjLocation);
      }
    }

    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      releaseProjPath,
      releaseType,
      projectsReposToPushAndTag,
    };
    //#endregions
  }

  getOutDirTempDocsPath(buildOptions: EnvOptions): string {
    let outDirApp =
      `.${config.frameworkName}/${this.currentArtifactName}/` +
      `${
        buildOptions.release.releaseType
          ? buildOptions.release.releaseType
          : 'development'
      }/` +
      this.project.packageJson.version;

    return this.project.pathFor(outDirApp);
  }
}
