import { ChangeOfFile } from 'incremental-compiler/lib-prod';
import { BaseDebounceCompilerForProject } from 'tnp-helpers/lib-prod';
import { EnvOptions } from '../../../../../options';
import { Project } from '../../../project';
/**
 * handle dockers image in taon projects
 */
export declare class AppHostsRecreateHelper extends BaseDebounceCompilerForProject<{
    envOptions: EnvOptions;
}, // @ts-ignore TODO weird inheritance problem
Project> {
    private readonly baseSrcFolder;
    private lastTaonContexts;
    private lastMigrationExported;
    constructor(project: Project);
    get envOptions(): EnvOptions;
    private rebuild;
    action({ changeOfFiles, asyncEvent, }: {
        changeOfFiles: ChangeOfFile[];
        asyncEvent: boolean;
    }): Promise<void>;
    writePortsToFile(): void;
    protected prefixVarTemplate(varName: string, n: number | undefined, options?: {
        isURL?: boolean;
        sameAsFirstInDevMode?: boolean;
    }): string;
    updatePortsInHosts(buildOptions: EnvOptions): Promise<void>;
    APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(buildOptions: Partial<EnvOptions>, options?: {
        num?: number;
    }): Promise<number>;
    NODE_BACKEND_PORT_UNIQ_KEY(buildOptions: EnvOptions, num?: Number): Promise<number>;
}
