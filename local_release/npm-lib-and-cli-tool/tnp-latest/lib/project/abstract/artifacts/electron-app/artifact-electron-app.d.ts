import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';
export declare class ArtifactElectronApp extends BaseArtifact<{
    electronDistOutAppPath: string;
}, ReleasePartialOutput> {
    constructor(project: Project);
    clearPartial(options: EnvOptions): Promise<void>;
    initPartial(initOptions: EnvOptions): Promise<EnvOptions>;
    buildPartial(buildOptions: EnvOptions): Promise<{
        electronDistOutAppPath: string;
        proxyProj: Project;
    }>;
    releasePartial(releaseOptions: EnvOptions): Promise<ReleasePartialOutput>;
}
