import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';
export declare class ArtifactVscodePlugin extends BaseArtifact<{
    vscodeVsixOutPath: string;
}, ReleasePartialOutput> {
    constructor(project: Project);
    clearPartial(clearOption: EnvOptions): Promise<void>;
    initPartial(initOptions: EnvOptions): Promise<EnvOptions>;
    buildPartial(buildOptions: EnvOptions): Promise<{
        vscodeVsixOutPath: string;
    }>;
    releasePartial(releaseOptions: EnvOptions): Promise<ReleasePartialOutput>;
    getTmpVscodeProjPath(envOptions?: EnvOptions): string;
    private getDestExtensionJs;
    private extensionVsixNameFrom;
    /**
     * TODO move this to local release
     */
    installLocally(pathToVsixFile: string): Promise<void>;
}
