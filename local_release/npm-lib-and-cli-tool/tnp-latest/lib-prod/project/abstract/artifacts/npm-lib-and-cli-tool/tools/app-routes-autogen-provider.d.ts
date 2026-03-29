import { BaseCompilerForProject } from 'tnp-helpers/lib-prod';
import type { Project } from '../../../project';
export declare class AppRoutesAutogenProvider extends BaseCompilerForProject<{}, Project> {
    readonly propertyInTaonJsonc = "shouldGenerateAutogenIndexFile";
    constructor(project: Project);
    private contextsRelativePaths;
    private routesRelativePaths;
    private processFile;
    writeDataIntoAppTs(): void;
    syncAction(absolteFilesPathes?: string[], initialParams?: {}): Promise<void>;
}
