import { Models__NS__TscCompileOptions } from '../../../../../../../models';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
export declare class BackendCompilation {
    buildOptions: EnvOptions;
    project: Project;
    static counter: number;
    isEnableCompilation: boolean;
    protected compilerName: string;
    constructor(buildOptions: EnvOptions, project: Project);
    runTask(): Promise<void>;
    libCompilation(buildOptions: EnvOptions, { generateDeclarations, tsExe, diagnostics, }: Models__NS__TscCompileOptions): Promise<void>;
    protected buildStandardLibVer(buildOptions: EnvOptions, options: {
        commandJs: string;
        commandMaps: string;
        generateDeclarations: boolean;
    }): Promise<void>;
}
