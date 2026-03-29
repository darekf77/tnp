import { EnvOptions } from '../../../../../../../options';
import { ProductionBuild } from '../../../../../../../project/abstract/artifacts/__helpers__/production-build';
import type { Project } from '../../../../../project';
import { BackendCompilation } from './compilation-backend';
import { BrowserCompilation } from './compilation-browser';
export declare class IncrementalBuildProcess {
    private project;
    private buildOptions;
    protected backendCompilation: BackendCompilation;
    protected browserCompilationStandalone: BrowserCompilation;
    protected productionBuild: ProductionBuild;
    constructor(project: Project, buildOptions: EnvOptions);
    protected browserTaksName(taskName: string, bc: BrowserCompilation): string;
    runTask(options: {
        taskName: string;
        watch?: boolean;
    }): Promise<void>;
}
