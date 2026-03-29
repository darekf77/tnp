import { EnvOptions } from '../../../options';
import { Project } from '../project';
import { ArtifactsGlobalHelper } from './__helpers__/artifacts-helpers';
import type { IArtifactProcessObj } from './base-artifact';
import { FilesRecreator } from './npm-lib-and-cli-tool/tools/files-recreation';
/**
 * Artifact manager
 * Responsible for group actions on
 * current project or/and children projects
 */
export declare class ArtifactManager {
    /**
     * @deprecated
     * this will be protected in future
     */
    artifact: IArtifactProcessObj;
    private project;
    globalHelper: ArtifactsGlobalHelper;
    readonly filesRecreator: FilesRecreator;
    static for(project: Project): ArtifactManager;
    private constructor();
    clear(options: EnvOptions): Promise<void>;
    clearAllChildren(options: EnvOptions): Promise<void>;
    /**
     * struct current project only
     * struct() <=> init() with struct flag
     */
    struct(initOptions: EnvOptions): Promise<EnvOptions>;
    /**
     * struct all children artifacts
     */
    structAllChildren(options: EnvOptions): Promise<void>;
    init(initOptions: EnvOptions): Promise<EnvOptions>;
    initAllChildren(options: EnvOptions): Promise<void>;
    /**
     * @deprecated
     */
    private buildWatchCmdForArtifact;
    build(buildOptions: EnvOptions): Promise<void>;
    buildAllChildren(options: EnvOptions, children?: Project[]): Promise<void>;
    release(releaseOptions: EnvOptions, autoReleaseProcess?: boolean): Promise<void>;
    releaseAllChildren(options: EnvOptions, children?: Project[]): Promise<void>;
    tryCatchWrapper(action: () => any, actionName: 'release' | 'build' | 'init' | 'clear' | 'struct' | 'brand', project?: Project): Promise<void>;
    private recreateAndFixCoreFiles;
}
