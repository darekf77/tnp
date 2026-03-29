import { ChangeOfFile } from 'incremental-compiler/lib-prod';
import { BaseCompilerForProject } from 'tnp-helpers/lib-prod';
import { EnvOptions, ReleaseType } from '../../../../../../options';
import type { Project } from '../../../../project';
import { TypescriptDtsFixer } from './typescript-dts-fixer';
export interface BaseCopyMangerInitialParams {
    skipCopyDistToLocalTempProject?: boolean;
}
export declare class CopyManagerStandalone extends BaseCompilerForProject<BaseCopyMangerInitialParams, Project> {
    dtsFixer: TypescriptDtsFixer;
    isStartFromScratch: boolean;
    _isomorphicPackages: string[];
    protected buildOptions: EnvOptions;
    protected copyto: Project[];
    protected renameDestinationFolder?: string;
    updateTriggered: (() => void) & import("lodash").Cancelable;
    protected selectAllProjectCopyto(): Promise<void>;
    protected readonly notAllowedFiles: string[];
    protected browserwebsqlFolders: string[];
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
    asyncAction(event: ChangeOfFile): Promise<void>;
    syncAction(files: string[], initialParams: BaseCopyMangerInitialParams): Promise<void>;
    /**
     * @returns if trus - skip futher processing
     */
    protected contentReplaced(fileAbsolutePath: string): void;
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
    getBrowserwebsqlFolders(): string[];
    init(buildOptions: EnvOptions, renameDestinationFolder?: string): void;
    addSrcJSToDestination(destination: Project): void;
    linksForPackageAreOk(destination: Project): boolean;
    recreateTempProj(): void;
    initWatching(): void;
    get localTempProjPath(): string;
    /**
     * first folder in node_modules for packge
     * example:
     * project/node_modules/<rootPackageName> # like 'ng2-rest' or '@angular'
     */
    get rootPackageName(): string;
    get monitoredOutDir(): string;
    get monitoredOutDirSharedAssets(): string[];
    initalFixForDestination(destination: Project): void;
    changedJsMapFilesInternalPathesForDebug(content: string, isBrowser: boolean, isForLaunchJsonDebugging: boolean, absFilePath: string, releaseType: ReleaseType): string;
    sourceMapContentFix(content: string, isBrowser: boolean, absFilePath: string, releaseType: ReleaseType): string;
    removeSourceLinksFolders(pkgLocInDestNodeModules: string): void;
    copySharedAssets(destination: Project, isTempLocalProj: boolean): void;
    copyCompiledSourcesAndDeclarations(destination: Project, isTempLocalProj: boolean): void;
    replaceIndexDtsForEntryProjectIndex(destination: Project): void;
    addSourceSymlinks(destination: Project): void;
    removeSourceSymlinks(destination: Project): void;
    /**
     *
     * @param destination that already has node_modues/rootPackagename copied
     * @param isTempLocalProj
     */
    copySourceMaps(destination: Project, isTempLocalProj: boolean): void;
    fixJsMapFiles(destinationPackageLocation: string, 
    /**
     * browser websql browser-prod websql-prod
     */
    currentBrowserFolder?: string): void;
    /**
     *  fix backend and browser js (m)js.map files (for proper debugging)
     *
     * destination is (should be) tmpLocalCopytoProjDist
     *
     * Fix for 2 things:
     * - debugging when in cli mode (fix in actual (dist)/(browser/websql)  )
     * - debugging when in node_modules of other project (fixing only tmpLocalCopytoProjDist)
     * @param destinationPackageLocation desitnation/node_modues/< rootPackageName >
     */
    fixBackendAndBrowserJsMapFilesInLocalProj(): void;
    copyMapFilesesFromLocalToCopyToProj(destination: Project, tmpLocalProjPackageLocation: string): void;
    /**
     * Copy fixed maps from tmpLocalCopytoProjDist to other projects
     *
     * @param destination any project other than tmpLocalCopytoProjDist
     */
    copyBackendAndBrowserJsMapFilesFromLocalProjTo(destination: Project): void;
    fixDtsImportsWithWronPackageName(absOrgFilePathInDist: string, destinationFilePath: string): void;
    handleCopyOfAssetFile(absoluteAssetFilePath: string, destination: Project): void;
    handleCopyOfSingleFile(destination: Project, isTempLocalProj: boolean, specificFileRelativePath: string, wasRecrusive?: boolean): void;
    /**
     * if I am changing just thing in single line - maps are not being triggered asynch (it is good)
     * BUT typescript/angular compiler changes maps files inside dist or dist/browser|websql
     *
     *
     */
    preventWeakDetectionOfchanges(specificFileRelativePath: string, destination: Project, isTempLocalProj: boolean): void;
    /**
     * fix content of map files in destination package location
     */
    writeFixedMapFileForNonCli(isForBrowser: boolean, specificFileRelativePath: string, destinationPackageLocation: string): void;
    writeFixedMapFileForCli(isForBrowser: boolean, specificFileRelativePath: string, destinationPackageLocation: string): void;
    /**
     *
     * @param isForBrowser
     * @param specificFileRelativePath
     * @param destinationPackageLocation should be ONLY temp project
     */
    protected writeFixedMapFile(isForBrowser: boolean, specificFileRelativePath: string, destinationPackageLocation: string): void;
    updateBackendFullDtsFiles(destinationOrDist: Project | string): void;
}
