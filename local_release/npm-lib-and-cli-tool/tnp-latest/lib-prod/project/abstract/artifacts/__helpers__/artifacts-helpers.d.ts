import type { Project } from '../../project';
import { Branding } from './branding';
/**
 * Global helper for artifacts
 */
export declare class ArtifactsGlobalHelper {
    private project;
    readonly branding: Branding;
    constructor(project: Project);
    addSrcFolderFromCoreProject(): void;
    /**
     * because of that
     * In vscode there is a mess..
     * TODO
     */
    __removeJsMapsFrom(absPathReleaseDistFolder: string): void;
}
