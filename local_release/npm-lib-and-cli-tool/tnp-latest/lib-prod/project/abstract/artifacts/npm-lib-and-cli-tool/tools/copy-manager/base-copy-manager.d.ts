import { ChangeOfFile } from 'incremental-compiler/lib-prod';
import { BaseCompilerForProject } from 'tnp-helpers/lib-prod';
import { EnvOptions, ReleaseType } from '../../../../../../options';
import type { Project } from '../../../../project';
export interface BaseCopyMangerInitialParams {
    skipCopyDistToLocalTempProject?: boolean;
}
export declare abstract class BaseCopyManger extends BaseCompilerForProject<BaseCopyMangerInitialParams, Project> {
    _isomorphicPackages: string[];
    protected buildOptions: EnvOptions;
    protected copyto: Project[];
    protected renameDestinationFolder?: string;
    protected selectAllProjectCopyto(): Promise<void>;
    get customCompilerName(): string;
    protected readonly notAllowedFiles: string[];
    protected browserwebsqlFolders: string[];
    getBrowserwebsqlFolders(): string[];
    protected sourceFoldersToRemoveFromNpmPackage: string[];
    get sourcePathToLink(): string;
    get localTempProj(): Project;
    /**
     * when building from scratch:
     * taon - uses ~/.taon/taon-containers/container-vXX
     * tnp - uses ../taon-containers/container-vXX
     *
     * but when tnp is in deep refactor I need to use taon to build tnp
     * and force taon to recognize core container from node_modules link
     * inside project (instead normally from taon.json[frameworkVersion] property)
     */
    get projectToCopyTo(): Project[];
    get isomorphicPackages(): string[];
    updateTriggered: (() => void) & import("lodash").Cancelable;
    /**
     * @returns if trus - skip futher processing
     */
    protected contentReplaced(fileAbsolutePath: string): void;
    asyncAction(event: ChangeOfFile): Promise<void>;
    isStartFromScratch: boolean;
    syncAction(files: string[], initialParams: BaseCopyMangerInitialParams): Promise<void>;
    copyBuildedDistributionTo(destination: Project): void;
    /**
     * There are 3 typese of --copyto build
     * 1. dist build (wihout source maps buit without links)
     * 2. dist build (with source maps and links) - when no buildOptions
     * 3. same as 2 buit with watch
     */
    protected _copyBuildedDistributionTo(destination: Project, options?: {
        absoluteAssetFilePath?: string;
        specificFileRelativePath?: string;
        outDir?: string;
        event?: any;
    }): void;
    /**
     * first folder in node_modules for packge
     * example:
     * project/node_modules/<rootPackageName> # like 'ng2-rest' or '@angular'
     */
    abstract get rootPackageName(): string;
    /**
     * Path for local-temp-project-path
     */
    abstract get localTempProjPath(): string;
    /**
     * connected with specificRelativeFilePath
     * gives file in compilation folder... meaning:
     *
     * monitoredOutDir/specificRelativeFilePath
     * equals:
     * projectLocation/(dist)/specificRelativeFilePath
     */
    abstract get monitoredOutDir(): string;
    abstract changedJsMapFilesInternalPathesForDebug(content: string, isBrowser: boolean, isForCliDebuggerToWork: boolean, filePath: string, releaseType: ReleaseType): string;
    abstract initalFixForDestination(destination: Project): void;
    abstract copySourceMaps(destination: Project, isTempLocalProj: boolean): any;
    abstract addSourceSymlinks(destination: Project): any;
    abstract removeSourceSymlinks(destination: Project): any;
    abstract handleCopyOfSingleFile(destination: Project, isTempLocalProj: boolean, specificFileRelativePath: string): any;
    abstract handleCopyOfAssetFile(absoluteAssetFilePath: string, destination: Project): any;
    abstract replaceIndexDtsForEntryProjectIndex(destination: Project): any;
    addSrcJSToDestination(destination: Project): void;
    /**
     * fix d.ts files in angular build - problem with require() in d.ts with wrong name
     */
    abstract copyCompiledSourcesAndDeclarations(destination: Project, isTempLocalProj: boolean): any;
    abstract copySharedAssets(destination: Project, isTempLocalProj: boolean): any;
    abstract linksForPackageAreOk(destination: Project): boolean;
    abstract updateBackendFullDtsFiles(destinationOrDist: Project | string): void;
}
