import { ChangeOfFile } from 'incremental-compiler/lib-prod';
import { BaseDebounceCompilerForProject } from 'tnp-helpers/lib-prod';
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
