import { ChangeOfFile } from 'incremental-compiler';
import { BaseDebounceCompilerForProject } from 'tnp-helpers';
import { EnvOptions } from '../../../../options';
import { Project } from '../../project';
/**
 * @deprecated TODO not needed ?
 * handle dockers image in taon projects
 */
export declare class DockerHelper extends BaseDebounceCompilerForProject<{
    envOptions: EnvOptions;
}, // @ts-ignore TODO weird inheritance problem
Project> {
    /**
     * Absolute path to the output directory for the app
     */
    getOutDirDockersRelease(buildOptions: EnvOptions): string;
    constructor(project: Project);
    get envOptions(): EnvOptions;
    get dockerComposeAbsPath(): string;
    rebuildBaseFiles(): void;
    private rebuild;
    action({ changeOfFiles, asyncEvent, }: {
        changeOfFiles: ChangeOfFile[];
        asyncEvent: boolean;
    }): void;
}