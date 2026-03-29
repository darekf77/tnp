import { ChangeOfFile } from 'incremental-compiler';
import { BaseDebounceCompilerForProject } from 'tnp-helpers';
import type { Project } from '../../../project';
export declare class AssetsManager extends BaseDebounceCompilerForProject<{}, Project> {
    private tmpFolders;
    private readonly currentProjectNodeModulesPath;
    get tmpAllAssetsLinkedInCoreContainerAbsPath(): string;
    constructor(project: Project);
    private copyAssetsToTempFolders;
    action({ changeOfFiles, asyncEvent, }: {
        changeOfFiles: ChangeOfFile[];
        asyncEvent: boolean;
    }): Promise<void>;
    linkAssetToJoindedProject(): void;
}