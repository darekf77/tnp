import { ChangeOfFile } from 'incremental-compiler/lib-prod';
import { BaseDebounceCompilerForProject } from 'tnp-helpers/lib-prod';
import { Models__NS__DocsConfig } from '../../../../models';
import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';
export declare class Docs extends BaseDebounceCompilerForProject<{
    disableMkdocsCompilation?: boolean;
    /**
     * Relative or absolute (TODO) path to the folder where the docs will be generated
     */
    docsOutFolder?: string;
    ciBuild?: boolean;
    port?: number;
}, Project> {
    private envOptions;
    protected mkdocsServePort: number;
    private linkedAlreadProjects;
    get docsConfigCurrentProjAbsPath(): string;
    get config(): Models__NS__DocsConfig;
    private linkDocsToGlobalContainer;
    /**
     * mkdocs temp folder
     */
    readonly tmpDocsFolderRoot: string;
    /**
     * Example:
     * .taon/temp-docs-folder/allmdfiles
     */
    get tmpDocsFolderRootDocsDirRelativePath(): string;
    get outDocsDistFolderAbs(): string;
    get docsConfigGlobalContainerAbsPath(): string;
    get docsGlobalTimestampForWatcherAbsPath(): string;
    get docsConfigSchemaPath(): string;
    init(): Promise<void>;
    initializeWatchers(envOptions: EnvOptions): void;
    action({ changeOfFiles, asyncEvent, }: {
        changeOfFiles: ChangeOfFile[];
        asyncEvent: boolean;
    }): Promise<void>;
    protected docsConfigSchemaContent(): string;
    private defaultDocsConfig;
    private applyPriorityOrder;
    private mkdocsYmlContent;
    validateEnvironemntForMkdocsBuild(): Promise<boolean>;
    private buildMkdocs;
    private copyFilesToTempDocsFolder;
    private getRootFiles;
    private linkProjectToDocsFolder;
    private resolvePackageDataFrom;
    private getExternalMdFiles;
    private getProjectsFiles;
    private recreateFilesInTempFolder;
    private writeGlobalWatcherTimestamp;
    private getTimestampWatcherForPackageName;
}
