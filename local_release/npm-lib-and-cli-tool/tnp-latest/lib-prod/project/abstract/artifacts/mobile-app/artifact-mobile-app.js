import { EnvOptions, ReleaseArtifactTaon, } from '../../../../options';
import { BaseArtifact } from '../base-artifact';
export class ArtifactMobileApp extends BaseArtifact {
    constructor(project) {
        super(project, ReleaseArtifactTaon.MOBILE_APP);
    }
    async clearPartial(options) {
        return void 0; // TODO implement
    }
    async initPartial(initOptions) {
        if (!initOptions.release.targetArtifact) {
            initOptions.release.targetArtifact = ReleaseArtifactTaon.MOBILE_APP;
        }
        return initOptions;
    }
    async buildPartial(buildOptions) {
        buildOptions = await this.initPartial(EnvOptions.from(buildOptions));
        const shouldSkipBuild = this.shouldSkipBuild(buildOptions);
        return void 0;
    }
    async releasePartial(releaseOptions) {
        releaseOptions = this.updateResolvedVersion(releaseOptions);
        return {
            resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
        }; // TODO implement
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/mobile-app/artifact-mobile-app.js.map