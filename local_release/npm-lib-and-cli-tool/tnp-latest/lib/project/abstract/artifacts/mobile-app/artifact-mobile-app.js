"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactMobileApp = void 0;
const options_1 = require("../../../../options");
const base_artifact_1 = require("../base-artifact");
class ArtifactMobileApp extends base_artifact_1.BaseArtifact {
    constructor(project) {
        super(project, options_1.ReleaseArtifactTaon.MOBILE_APP);
    }
    async clearPartial(options) {
        return void 0; // TODO implement
    }
    async initPartial(initOptions) {
        if (!initOptions.release.targetArtifact) {
            initOptions.release.targetArtifact = options_1.ReleaseArtifactTaon.MOBILE_APP;
        }
        return initOptions;
    }
    async buildPartial(buildOptions) {
        buildOptions = await this.initPartial(options_1.EnvOptions.from(buildOptions));
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
exports.ArtifactMobileApp = ArtifactMobileApp;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/mobile-app/artifact-mobile-app.js.map