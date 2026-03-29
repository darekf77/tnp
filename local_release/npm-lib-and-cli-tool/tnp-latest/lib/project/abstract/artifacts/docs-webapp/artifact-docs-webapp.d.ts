import { Url } from 'url';
import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';
import { Docs } from './docs';
export declare class ArtifactDocsWebapp extends BaseArtifact<{
    docsWebappDistOutPath: string;
    combinedDocsHttpServerUrl: Url;
}, ReleasePartialOutput> {
    protected readonly project: Project;
    docs: Docs;
    constructor(project: Project);
    clearPartial(clearOptions: EnvOptions): Promise<void>;
    initPartial(initOptions: EnvOptions): Promise<EnvOptions>;
    buildPartial(buildOptions: EnvOptions): Promise<{
        docsWebappDistOutPath: string;
        combinedDocsHttpServerUrl: Url;
    }>;
    releasePartial(releaseOptions: EnvOptions): Promise<ReleasePartialOutput>;
    DOCS_ARTIFACT_PORT_UNIQ_KEY(buildOptions: EnvOptions): Promise<number>;
    private getOutDirTempDocsPath;
}
