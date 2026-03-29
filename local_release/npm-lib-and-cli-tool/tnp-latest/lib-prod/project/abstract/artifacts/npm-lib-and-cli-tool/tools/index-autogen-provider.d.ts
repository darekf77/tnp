import { BaseCompilerForProject } from 'tnp-helpers/lib-prod';
import type { Project } from '../../../project';
export declare class IndexAutogenProvider extends BaseCompilerForProject<{}, Project> {
    readonly propertyInTaonJsonc = "shouldGenerateAutogenIndexFile";
    constructor(project: Project);
    get indexAutogenFileRelativePath(): string;
    private exportsToSave;
    private processFile;
    writeIndexFile(isPlaceholderOnly?: boolean): void;
    syncAction(absolteFilesPathes?: string[], initialParams?: {}): Promise<void>;
}
