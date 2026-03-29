"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactDocsWebapp = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const options_1 = require("../../../../options");
const base_artifact_1 = require("../base-artifact");
const docs_1 = require("./docs");
//#endregion
class ArtifactDocsWebapp extends base_artifact_1.BaseArtifact {
    project;
    docs;
    constructor(project) {
        super(project, options_1.ReleaseArtifactTaon.DOCS_DOCS_WEBAPP);
        this.project = project;
        this.docs = new docs_1.Docs(this.project);
    }
    //#region clear partial
    async clearPartial(clearOptions) {
        [
            this.project.pathFor(`.${lib_1.config.frameworkName}/temp-docs-folders`),
        ].forEach(f => {
            lib_2.Helpers.removeSymlinks(f);
            lib_2.Helpers.removeFolderIfExists(f);
        });
    }
    //#endregion
    //#region init partial
    async initPartial(initOptions) {
        if (!initOptions.release.targetArtifact) {
            initOptions.release.targetArtifact = options_1.ReleaseArtifactTaon.DOCS_DOCS_WEBAPP;
        }
        await this.docs.initializeWatchers(initOptions);
        await this.docs.init();
        return initOptions;
    }
    //#endregion
    //#region build partial
    async buildPartial(buildOptions) {
        //#region @backendFunc
        buildOptions = await this.project.artifactsManager.init(options_1.EnvOptions.from(buildOptions));
        const shouldSkipBuild = this.shouldSkipBuild(buildOptions);
        const combinedDocsHttpServerUrl = void 0; // TODO implement
        const docsWebappDistOutPath = buildOptions.build.overrideOutputPath
            ? buildOptions.build.overrideOutputPath
            : this.getOutDirTempDocsPath(buildOptions);
        const port = await this.DOCS_ARTIFACT_PORT_UNIQ_KEY(buildOptions);
        if (!shouldSkipBuild) {
            await this.docs.runTask({
                watch: buildOptions.build.watch,
                initialParams: {
                    docsOutFolder: docsWebappDistOutPath.replace(this.project.location + '/', ''),
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
    async releasePartial(releaseOptions) {
        //#region @backendFunc
        let releaseProjPath;
        const releaseType = releaseOptions.release.releaseType;
        const projectsReposToPushAndTag = [this.project.location];
        const projectsReposToPush = [];
        releaseOptions = this.updateResolvedVersion(releaseOptions);
        const { docsWebappDistOutPath } = await this.buildPartial(releaseOptions.clone({
            isCiProcess: true,
        }));
        releaseOptions.release.overrideStaticPagesReleaseType = releaseOptions
            .release.overrideStaticPagesReleaseType
            ? releaseOptions.release.overrideStaticPagesReleaseType
            : 'major';
        if (releaseOptions.release.releaseType === options_1.ReleaseType.STATIC_PAGES) {
            //#region static-pages release
            const releaseData = await this.staticPagesDeploy(docsWebappDistOutPath, releaseOptions);
            projectsReposToPush.push(...releaseData.projectsReposToPush);
            releaseProjPath = releaseData.releaseProjPath;
            //#endregion
        }
        if (releaseOptions.release.releaseType === options_1.ReleaseType.LOCAL) {
            //#region static-pages release
            const releaseData = await this.localReleaseDeploy(docsWebappDistOutPath, releaseOptions);
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
    async DOCS_ARTIFACT_PORT_UNIQ_KEY(buildOptions) {
        const key = 'docs port for http server';
        return await this.project.registerAndAssignPort(key, {
            startFrom: 3950,
        });
    }
    getOutDirTempDocsPath(buildOptions) {
        let outDirApp = `.${lib_1.config.frameworkName}/${this.currentArtifactName}/` +
            `${buildOptions.release.releaseType
                ? buildOptions.release.releaseType
                : options_1.Development}/` +
            this.project.packageJson.version;
        return this.project.pathFor(outDirApp);
    }
}
exports.ArtifactDocsWebapp = ArtifactDocsWebapp;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/docs-webapp/artifact-docs-webapp.js.map