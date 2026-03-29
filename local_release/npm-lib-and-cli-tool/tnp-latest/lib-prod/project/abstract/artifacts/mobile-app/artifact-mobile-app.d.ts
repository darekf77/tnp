import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';
export declare class ArtifactMobileApp extends BaseArtifact<{
    androidMobileAppApkPath: string;
    iosMobileAppIpaPath: string;
}, ReleasePartialOutput> {
    constructor(project: Project);
    clearPartial(options: EnvOptions): Promise<void>;
    initPartial(initOptions: EnvOptions): Promise<EnvOptions>;
    buildPartial(buildOptions: EnvOptions): Promise<{
        androidMobileAppApkPath: string;
        iosMobileAppIpaPath: string;
    }>;
    releasePartial(releaseOptions: any): Promise<ReleasePartialOutput>;
}
