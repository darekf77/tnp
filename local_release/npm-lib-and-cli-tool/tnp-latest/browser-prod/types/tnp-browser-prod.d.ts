// @ts-nocheck
import * as ora from 'ora';
import { CoreModels__NS__ManifestIcon, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__NewFactoryType, CoreModels__NS__FrameworkVersion, CoreModels__NS__ReleaseVersionType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__CfontStyle, CoreModels__NS__LibType, LibTypeEnum, CoreModels__NS__EnvironmentName } from 'tnp-core/browser-prod';
import axiosType from 'axios';
import { BaseFeatureForProject, UtilsTypescript__NS__SplitNamespaceResult, UtilsTypescript__NS__GatheredExportsMap, BaseDebounceCompilerForProject, BaseCompilerForProject, BaseGit, BaseIgnoreHideHelpers, BaseLinter, BasePackageJson, BaseJsonFileReaderOptions, BaseNpmHelpers, BaseNodeModules, TaonBaseCliWorkerController, BaseCliWorkerTerminalUI, BaseWorkerTerminalActionReturnType, BaseCliWorker, BaseProjectResolver, BaseQuickFixes, BaseReleaseProcess, BaseVscodeHelpers, BaseProject, PushProcessOptions, PackageJson as PackageJson$1, CommandType } from 'tnp-helpers/browser-prod';
import { Observable } from 'rxjs';
import { ChangeOfFile } from 'incremental-compiler/browser-prod';
import { Url } from 'url';
import * as lodash from 'lodash';
import { PackageJson } from 'type-fest';
import { Ng2RestAxiosRequestConfig } from 'ng2-rest/browser-prod';
import * as taon_browser_prod from 'taon/browser-prod';
import { TaonBaseEntity, MulterFileUploadResponse, TaonBaseAbstractEntity, TaonBaseCrudController, Taon__NS__Response, TaonBaseRepository, Models__NS__Http__NS__Response } from 'taon/browser-prod';
import * as vscode from 'vscode';
import { ExtensionContext } from 'vscode';

declare const globaLoaders: {
    'lds-default': (color: any, preload: any) => string;
    'lds-ellipsis': (color: any, preload: any) => string;
    'lds-facebook': (color: any, preload: any) => string;
    'lds-grid': (color: any, preload: any) => string;
    'lds-heart': (color: any, preload: any) => string;
    'lds-ripple': (color: any, preload: any) => string;
};

/**
 * Automatically brand you project (based on logo.png, taon.json, etc)
 */ declare class Branding extends BaseFeatureForProject<Project> {
    private get path();
    get exist(): boolean;
    get htmlIndexRepaceTag(): string;
    get htmlLinesToAdd(): string[];
    get iconsToAdd(): CoreModels__NS__ManifestIcon[];
    apply(force?: boolean): Promise<void>;
    createPngIconsFromPngLogo(absPathToLogoPng: string, absPathDestinationVscodeLogoPng: string): Promise<void>;
    generateLogoFroVscodeLocations(): Promise<void>;
}

declare class EnvironmentConfig// @ts-ignore TODO weird inheritance problem
 extends BaseFeatureForProject<Project> {
    createForArtifact(artifactName: ReleaseArtifactTaon, envName?: CoreModels__NS__EnvironmentNameTaon, envNumber?: number): Promise<void>;
    watchAndRecreate(onChange: () => any): Promise<void>;
    update(envConfigFromParams: EnvOptions, options?: {
        fromWatcher?: boolean;
        saveEnvToLibEnv?: boolean;
    }): Promise<EnvOptions>;
    private envOptionsResolve;
    private getEnvFor;
    getEnvMain(): Partial<EnvOptions>;
    private getBaseEnvTemplate;
    updateGeneratedValues(envOptions: EnvOptions): void;
    private saveEnvironmentConfig;
    makeSureEnvironmentExists(): void;
    private get absPathToEnvTs();
}

/**
 * Global helper for artifacts
 */
declare class ArtifactsGlobalHelper {
    private project;
    readonly branding: Branding;
    constructor(project: Project);
    addSrcFolderFromCoreProject(): void;
    /**
     * because of that
     * In vscode there is a mess..
     * TODO
     */
    __removeJsMapsFrom(absPathReleaseDistFolder: string): any;
}

declare class ProductionBuild {
    private project;
    protected namespacesForPackagesLib: Map<string, UtilsTypescript__NS__SplitNamespaceResult>;
    protected namespacesForPackagesBrowser: Map<string, UtilsTypescript__NS__SplitNamespaceResult>;
    protected namespacesForPackagesWebsql: Map<string, UtilsTypescript__NS__SplitNamespaceResult>;
    protected reExportsForPackagesLib: Map<string, UtilsTypescript__NS__GatheredExportsMap>;
    protected reExportsForPackagesBrowser: Map<string, UtilsTypescript__NS__GatheredExportsMap>;
    protected reExportsForPackagesWebsql: Map<string, UtilsTypescript__NS__GatheredExportsMap>;
    private readonly nameForNpmPackage;
    constructor(project: Project);
    /**
     *
     * @param generatingAppCode mode for building app code (that contains lib code as well)
     */
    runTask(buildOptions: EnvOptions, generatingAppCode?: boolean): void;
    private setGeneratedReExportsToMapForCurrentPackage;
    private saveGenerateReExportsIndProdDistForCurrentPackage;
    private setGeneratedNamespacesDataForCurrentPackage;
    private combineNamespacesForCurrentPackage;
    private productionCodeReplacement;
}

type InsideStructureData = {
    replacement?: Function;
};
type InsideStructLinkType = (options: InsideStructureData) => string;
type InsideStructLinkTypePathRep = (options: Omit<InsideStructureData, 'replacement'>) => string;
type InsideStructEndAction = (options: InsideStructureData) => void;
/**
 * @deprecated
 * This class will exectute algorithm
 * 1. Copy replative pathes to proper destination files/folders
 * 2. Link node_modules to desitnation projects
 */
declare class InsideStruct {
    relateivePathesFromContainer?: string[];
    projectType?: CoreModels__NS__NewFactoryType;
    frameworkVersion?: CoreModels__NS__FrameworkVersion;
    /**
     * Replace pathes while copying relateivePathesFromContainer
     * to destination project
     */
    pathReplacements: [RegExp, InsideStructLinkTypePathRep][];
    /**
     * Link node_modules to destination project (use template project path)
     * Example: template-app/node_modules -> tmp-apps-for-dist/project-name/node_modules
     */
    linkNodeModulesTo: string[];
    /**
     * Array of link functions [fromRelative, toRelative]
     */
    linksFuncs: [
        /**
         * original real path
         */
        InsideStructLinkType,
        /**
         * destination path
         */
        InsideStructLinkType
    ][];
    endAction?: InsideStructEndAction;
    project: Project;
    static from(options: Partial<InsideStruct>, project: Project): InsideStruct;
    private constructor();
}

declare abstract class BaseInsideStruct {
    readonly project: Project;
    readonly initOptions: EnvOptions;
    relativePaths(): string[];
    abstract insideStruct(): InsideStruct;
    abstract getCurrentArtifact(): ReleaseArtifactTaon;
    constructor(project: Project, initOptions: EnvOptions);
    replaceImportsForBrowserOrWebsql(fileContent: string, { websql }: {
        websql: boolean;
    }): string;
    replaceImportsForBackend(fileContent: string): string;
}

declare class InsideStructuresProcess extends BaseFeatureForProject<Project> {
    process(structs: BaseInsideStruct[], initOptions: EnvOptions): Promise<void>;
}

declare class InsideStructuresElectron extends InsideStructuresProcess {
    private insideStructAngular13AppNormal;
    init(initOptions: EnvOptions): Promise<void>;
}

/**
 * handle dockers image in taon projects
 */
declare class AppHostsRecreateHelper extends BaseDebounceCompilerForProject<{
    envOptions: EnvOptions;
}, // @ts-ignore TODO weird inheritance problem
Project> {
    private readonly baseSrcFolder;
    private lastTaonContexts;
    private lastMigrationExported;
    constructor(project: Project);
    get envOptions(): EnvOptions;
    private rebuild;
    action({ changeOfFiles, asyncEvent, }: {
        changeOfFiles: ChangeOfFile[];
        asyncEvent: boolean;
    }): Promise<void>;
    writePortsToFile(): void;
    protected prefixVarTemplate(varName: string, n: number | undefined, options?: {
        isURL?: boolean;
        sameAsFirstInDevMode?: boolean;
    }): string;
    updatePortsInHosts(buildOptions: EnvOptions): Promise<void>;
    APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(buildOptions: Partial<EnvOptions>, options?: {
        num?: number;
    }): Promise<number>;
    NODE_BACKEND_PORT_UNIQ_KEY(buildOptions: EnvOptions, num?: Number): Promise<number>;
}

/**
 * Base href can be:
 *
 * '' - for electron release build ( / - doesn't work in file system)
 * '/' - root
 * '/my-base-href/'
 *
 */ declare class AngularFeBasenameManager extends BaseFeatureForProject<Project> {
    readonly rootBaseHref: string;
    getBaseHrefForGhPages(envOptions: EnvOptions): string;
    private resolveBaseHrefForProj;
    getBaseHref(envOptions: EnvOptions): string;
    replaceBaseHrefInFile(fileAbsPath: string, initOptions: EnvOptions): any;
}

declare class InsideStructuresApp extends InsideStructuresProcess {
    private insideStructAngular13AppNormal;
    private insideStructAngular13AppWebsql;
    init(initOptions: EnvOptions): Promise<void>;
}

declare class MigrationHelper extends BaseDebounceCompilerForProject<{}, // @ts-ignore TODO weird inheritance problem
Project> {
    constructor(project: Project);
    get migrationIndexAutogeneratedTsFileAbsPath(): string;
    rebuild(relativePathsWithClasses: {
        relativePath: string;
        absPath: string;
        classes: string[];
    }[]): any;
    action({ changeOfFiles, asyncEvent, }: {
        changeOfFiles: ChangeOfFile[];
        asyncEvent: boolean;
    }): any;
}

declare class ArtifactAngularNodeApp extends BaseArtifact<{
    appDistOutBrowserAngularAbsPath: string;
    appDistOutBackendNodeAbsPath: string;
    angularNgServeAddress: URL;
}, ReleasePartialOutput> {
    readonly project: Project;
    readonly productionBuild: ProductionBuild;
    readonly migrationHelper: MigrationHelper;
    readonly angularFeBasenameManager: AngularFeBasenameManager;
    readonly insideStructureApp: InsideStructuresApp;
    readonly insideStructureElectron: InsideStructuresElectron;
    readonly appHostsRecreateHelper: AppHostsRecreateHelper;
    private readonly nameForNpmPackage;
    constructor(project: Project);
    clearPartial(options: EnvOptions): Promise<void>;
    initPartial(initOptions: EnvOptions): Promise<EnvOptions>;
    buildPartial(buildOptions: EnvOptions): Promise<{
        appDistOutBrowserAngularAbsPath: string;
        appDistOutBackendNodeAbsPath: string;
        angularNgServeAddress: URL;
    }>;
    private buildBackend;
    getBrowserENVJSON(releaseOptions: EnvOptions): Promise<any>;
    releasePartial(releaseOptions: EnvOptions): Promise<ReleasePartialOutput>;
    private deployToTaonCloud;
    /**
     * Absolute path to the output directory for the app
     */
    getOutDirNodeBackendAppAbsPath(buildOptions: EnvOptions): string;
    /**
     * Absolute path to the output directory for the app
     */
    getOutDirAngularBrowserAppAbsPath(buildOptions: EnvOptions): string;
}

declare class Docs extends BaseDebounceCompilerForProject<{
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
    get outDocsDistFolderAbs(): any;
    get docsConfigGlobalContainerAbsPath(): any;
    get docsGlobalTimestampForWatcherAbsPath(): any;
    get docsConfigSchemaPath(): string;
    init(): Promise<any>;
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

declare class ArtifactDocsWebapp extends BaseArtifact<{
    docsWebappDistOutPath: string;
    combinedDocsHttpServerUrl: Url;
}, ReleasePartialOutput> {
    protected readonly project: Project;
    docs: Docs;
    constructor(project: Project);
    clearPartial(clearOptions: EnvOptions): Promise<void>;
    initPartial(initOptions: EnvOptions): Promise<EnvOptions>;
    buildPartial(buildOptions: EnvOptions): Promise<{
        docsWebappDistOutPath: string;
        combinedDocsHttpServerUrl: Url;
    }>;
    releasePartial(releaseOptions: EnvOptions): Promise<ReleasePartialOutput>;
    DOCS_ARTIFACT_PORT_UNIQ_KEY(buildOptions: EnvOptions): Promise<number>;
    private getOutDirTempDocsPath;
}

declare class ArtifactElectronApp extends BaseArtifact<{
    electronDistOutAppPath: string;
}, ReleasePartialOutput> {
    constructor(project: Project);
    clearPartial(options: EnvOptions): Promise<void>;
    initPartial(initOptions: EnvOptions): Promise<EnvOptions>;
    buildPartial(buildOptions: EnvOptions): Promise<{
        electronDistOutAppPath: string;
        proxyProj: Project;
    }>;
    releasePartial(releaseOptions: EnvOptions): Promise<ReleasePartialOutput>;
}

declare class ArtifactMobileApp extends BaseArtifact<{
    androidMobileAppApkPath: string;
    iosMobileAppIpaPath: string;
}, ReleasePartialOutput> {
    constructor(project: Project);
    clearPartial(options: EnvOptions): Promise<void>;
    initPartial(initOptions: EnvOptions): Promise<EnvOptions>;
    buildPartial(buildOptions: EnvOptions): Promise<{
        androidMobileAppApkPath: string;
        iosMobileAppIpaPath: string;
    }>;
    releasePartial(releaseOptions: any): Promise<ReleasePartialOutput>;
}

declare class AssetsManager extends BaseDebounceCompilerForProject<{}, Project> {
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

declare class AppRoutesAutogenProvider extends BaseCompilerForProject<{}, Project> {
    readonly propertyInTaonJsonc = "shouldGenerateAutogenIndexFile";
    private contextsRelativePaths;
    private routesRelativePaths;
    private processFile;
    writeDataIntoAppTs(): any;
    syncAction(absolteFilesPathes?: string[], initialParams?: {}): Promise<void>;
}

/**
 * TODO QUICK_FIX: for typescript compiler doing wrong imports/exports in d.ts files
 * example in file base context.d.ts
 * readonly __refSync: import("taon/browser-prod").EndpointContext;
 * instead of
 * readonly __refSync: import("taon/browser").EndpointContext;
 *
 * 1, import('') fixes for
 * - browser
 * - websql
 * 2. @dts nocheck fix at beginning
 * - browser
 * - websql
 * - nodejs
 */
declare class TypescriptDtsFixer {
    protected readonly isomorphicPackages: string[];
    static for(isomorphicPackages: string[]): TypescriptDtsFixer;
    private constructor();
    forBackendContent(content: string): any;
    /**
     * browserFolder = browser websql browser-prod websql-prod
     */
    forContent(content: string, browserFolder: string): any;
    /**
     *  fixing d.ts for (dist)/(browser|websql) when destination local project
     * @param absPathFolderLocationWithBrowserAdnWebsql usually dist
     * @param isTempLocalProj
     */
    processFolderWithBrowserWebsqlFolders(absPathFolderLocationWithBrowserAdnWebsql: string, browserwebsqlFolders: string[]): any;
    processFolder(absPathLocation: string, currentBrowserFolder: string): any;
    forFile(dtsFileAbsolutePath: string, currentBrowserFolder: string): any;
}

interface BaseCopyMangerInitialParams {
    skipCopyDistToLocalTempProject?: boolean;
}
declare class CopyManagerStandalone extends BaseCompilerForProject<BaseCopyMangerInitialParams, Project> {
    dtsFixer: TypescriptDtsFixer;
    isStartFromScratch: boolean;
    _isomorphicPackages: string[];
    protected buildOptions: EnvOptions;
    protected copyto: Project[];
    protected renameDestinationFolder?: string;
    updateTriggered: (() => void) & lodash.Cancelable;
    protected selectAllProjectCopyto(): Promise<any>;
    protected readonly notAllowedFiles: string[];
    protected browserwebsqlFolders: string[];
    protected sourceFoldersToRemoveFromNpmPackage: string[];
    get sourcePathToLink(): string;
    get localTempProj(): any;
    /**
     * when building from scratch:
     * taon - uses ~/.taon/taon-containers/container-vXX
     * tnp - uses ../taon-containers/container-vXX
     *
     * but when tnp is in deep refactor I need to use taon to build tnp
     * and force taon to recognize core container from node_modules link
     * inside project (instead normally from taon.json[frameworkVersion] property)
     */
    get projectToCopyTo(): any;
    get isomorphicPackages(): any;
    asyncAction(event: ChangeOfFile): Promise<void>;
    syncAction(files: string[], initialParams: BaseCopyMangerInitialParams): Promise<void>;
    /**
     * @returns if trus - skip futher processing
     */
    protected contentReplaced(fileAbsolutePath: string): void;
    copyBuildedDistributionTo(destination: Project): any;
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
    }): any;
    getBrowserwebsqlFolders(): string[];
    init(buildOptions: EnvOptions, renameDestinationFolder?: string): any;
    addSrcJSToDestination(destination: Project): any;
    linksForPackageAreOk(destination: Project): boolean;
    recreateTempProj(): any;
    initWatching(): any;
    get localTempProjPath(): any;
    /**
     * first folder in node_modules for packge
     * example:
     * project/node_modules/<rootPackageName> # like 'ng2-rest' or '@angular'
     */
    get rootPackageName(): any;
    get monitoredOutDir(): string;
    get monitoredOutDirSharedAssets(): string[];
    initalFixForDestination(destination: Project): void;
    changedJsMapFilesInternalPathesForDebug(content: string, isBrowser: boolean, isForLaunchJsonDebugging: boolean, absFilePath: string, releaseType: ReleaseType): string;
    sourceMapContentFix(content: string, isBrowser: boolean, absFilePath: string, releaseType: ReleaseType): any;
    removeSourceLinksFolders(pkgLocInDestNodeModules: string): any;
    copySharedAssets(destination: Project, isTempLocalProj: boolean): any;
    copyCompiledSourcesAndDeclarations(destination: Project, isTempLocalProj: boolean): any;
    replaceIndexDtsForEntryProjectIndex(destination: Project): any;
    addSourceSymlinks(destination: Project): any;
    removeSourceSymlinks(destination: Project): any;
    /**
     *
     * @param destination that already has node_modues/rootPackagename copied
     * @param isTempLocalProj
     */
    copySourceMaps(destination: Project, isTempLocalProj: boolean): any;
    fixJsMapFiles(destinationPackageLocation: string, 
    /**
     * browser websql browser-prod websql-prod
     */
    currentBrowserFolder?: string): any;
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
    fixBackendAndBrowserJsMapFilesInLocalProj(): any;
    copyMapFilesesFromLocalToCopyToProj(destination: Project, tmpLocalProjPackageLocation: string): any;
    /**
     * Copy fixed maps from tmpLocalCopytoProjDist to other projects
     *
     * @param destination any project other than tmpLocalCopytoProjDist
     */
    copyBackendAndBrowserJsMapFilesFromLocalProjTo(destination: Project): any;
    fixDtsImportsWithWronPackageName(absOrgFilePathInDist: string, destinationFilePath: string): any;
    handleCopyOfAssetFile(absoluteAssetFilePath: string, destination: Project): any;
    handleCopyOfSingleFile(destination: Project, isTempLocalProj: boolean, specificFileRelativePath: string, wasRecrusive?: boolean): void;
    /**
     * if I am changing just thing in single line - maps are not being triggered asynch (it is good)
     * BUT typescript/angular compiler changes maps files inside dist or dist/browser|websql
     *
     *
     */
    preventWeakDetectionOfchanges(specificFileRelativePath: string, destination: Project, isTempLocalProj: boolean): any;
    /**
     * fix content of map files in destination package location
     */
    writeFixedMapFileForNonCli(isForBrowser: boolean, specificFileRelativePath: string, destinationPackageLocation: string): any;
    writeFixedMapFileForCli(isForBrowser: boolean, specificFileRelativePath: string, destinationPackageLocation: string): any;
    /**
     *
     * @param isForBrowser
     * @param specificFileRelativePath
     * @param destinationPackageLocation should be ONLY temp project
     */
    protected writeFixedMapFile(isForBrowser: boolean, specificFileRelativePath: string, destinationPackageLocation: string): any;
    updateBackendFullDtsFiles(destinationOrDist: Project | string): any;
}

declare class FilesRecreator// @ts-ignore TODO weird inheritance problem
 extends BaseFeatureForProject<Project> {
    init(): Promise<void>;
    projectSpecificFilesForStandalone(): string[];
    projectSpecificFilesForContainer(): string[];
    /**
     * Return list of files that are copied from
     * core project each time struct method is called
     * @returns list of relative paths
     */
    projectSpecyficFiles(): string[];
    handleProjectSpecyficFiles(): void;
    filesTemplatesForStandalone(): string[];
    /**
     * Generated automaticly file templates exmpale:
     * file.ts.filetemplate -> will generate file.ts
     * inside triple bracked: {{{  ENV. }}}
     * property ENV can be used to check files
     */
    filesTemplates(): string[];
}

declare class FilesTemplatesBuilder extends BaseFeatureForProject<Project> {
    get files(): any;
    rebuild(initOptions: EnvOptions, soft?: boolean): void;
    private processFile;
}

declare class IndexAutogenProvider extends BaseCompilerForProject<{}, Project> {
    readonly propertyInTaonJsonc = "shouldGenerateAutogenIndexFile";
    get indexAutogenFileRelativePath(): any;
    private exportsToSave;
    private processFile;
    writeIndexFile(isPlaceholderOnly?: boolean): any;
    syncAction(absolteFilesPathes?: string[], initialParams?: {}): Promise<void>;
}

declare class InsideStructuresLib extends InsideStructuresProcess {
    private insideStructAngular13LibNormal;
    private insideStructAngular13LibWebsql;
    init(initOptions: EnvOptions): Promise<void>;
}

declare abstract class BaseTestRunner extends BaseFeatureForProject<Project> {
    abstract start(files: string[], debug: boolean): Promise<void>;
    abstract startAndWatch(files: string[], debug: boolean): Promise<void>;
    abstract fileCommand(files: string[]): string;
    run(baseFolderForCode: string, command: string): Promise<void>;
    getCommonFilePattern(where: 'src' | 'e2e' | 'src/tests', files?: string[], extensions?: string[]): string;
}

declare class CypressTestRunner extends BaseTestRunner {
    fileCommand(files: string[]): string;
    start(files?: string[], debug?: boolean): Promise<void>;
    startAndWatch(files?: string[], debug?: boolean): Promise<void>;
}

declare class JestTestRunner extends BaseTestRunner {
    fileCommand(files: string[]): string;
    start(files: string[], debug: boolean): Promise<void>;
    startAndWatch(files: string[], debug: boolean): Promise<void>;
}

declare class MochaTestRunner extends BaseTestRunner {
    fileCommand(files: string[]): string;
    start(files?: string[], debug?: boolean): Promise<void>;
    startAndWatch(files?: string[], debug?: boolean): Promise<any>;
}

declare class VitestTestRunner extends BaseTestRunner {
    fileCommand(files?: string[]): string;
    private buildCommand;
    start(files: string[], debug: boolean): Promise<any>;
    startAndWatch(files: string[], debug: boolean): Promise<any>;
}

declare class ArtifactNpmLibAndCliTool extends BaseArtifact<{
    /**
     * for non org: <path-to-release-folder>/tmpLocalCopytoProjDist/my-library/node_modules/my-library
     * for org: <path-to-release-folder>/tmpLocalCopytoProjDist/my-library/node_modules/@my-library
     */
    tmpProjNpmLibraryInNodeModulesAbsPath: string;
    /**
     * check if produced package is an organization package
     * (this can be from standalone with custom name OR container organization)
     */
    isOrganizationPackage?: boolean;
    /**
     * my-library or @my-library/my-inside-lib or @my-library/my-inside-lib/deep-core-lib
     */
    packageName?: string;
}, ReleasePartialOutput> {
    readonly testsMocha: MochaTestRunner;
    readonly testsJest: JestTestRunner;
    readonly testsVite: VitestTestRunner;
    readonly testsCypress: CypressTestRunner;
    readonly copyNpmDistLibManager: CopyManagerStandalone;
    readonly insideStructureLib: InsideStructuresLib;
    readonly indexAutogenProvider: IndexAutogenProvider;
    readonly appTsRoutesAutogenProvider: AppRoutesAutogenProvider;
    readonly filesTemplatesBuilder: FilesTemplatesBuilder;
    readonly assetsManager: AssetsManager;
    initPartial(initOptions: EnvOptions): Promise<EnvOptions>;
    buildPartial(buildOptions: EnvOptions, opt?: {
        normalBuildBeforeProd: boolean;
    }): Promise<{
        tmpProjNpmLibraryInNodeModulesAbsPath: string;
        isOrganizationPackage?: boolean;
        packageName?: string;
    }>;
    releasePartial(releaseOptions: EnvOptions): Promise<ReleasePartialOutput>;
    clearPartial(options?: EnvOptions): Promise<void>;
    /**
     * TODO
     * @param options
     * @returns
     */
    clearLib(options: EnvOptions): Promise<any>;
    unlinkNodeModulesWhenTnp(): void;
    private fixPackageJsonForRelease;
    private runAfterReleaseJsCodeActions;
    private preparePackageJsonForReleasePublish;
    private removeNotNpmRelatedFilesFromReleaseBundle;
    private outputFixNgLibBuild;
    private packResource;
    private copyEssentialFilesTo;
    private copyWhenExist;
    private linkWhenExist;
    private backendMinifyCode;
    private backendObscureCode;
    /**
     * because of that
     * In vscode there is a mess..
     * TODO
     */
    private backendRemoveJsMapsFrom;
    /**
     * remove dts files from release
     */
    private backendReleaseRemoveDts;
    private creteBuildInfoFile;
    private showMesageWhenBuildLibDone;
    backendIncludeNodeModulesInCompilation(releaseAbsLocation: string, minify: boolean, prod: boolean): Promise<void>;
}

declare class ArtifactVscodePlugin extends BaseArtifact<{
    vscodeVsixOutPath: string;
}, ReleasePartialOutput> {
    constructor(project: Project);
    clearPartial(clearOption: EnvOptions): Promise<void>;
    initPartial(initOptions: EnvOptions): Promise<EnvOptions>;
    buildPartial(buildOptions: EnvOptions): Promise<{
        vscodeVsixOutPath: string;
    }>;
    releasePartial(releaseOptions: EnvOptions): Promise<ReleasePartialOutput>;
    getTmpVscodeProjPath(envOptions?: EnvOptions): string;
    private getDestExtensionJs;
    private extensionVsixNameFrom;
    /**
     * TODO move this to local release
     */
    installLocally(pathToVsixFile: string): Promise<void>;
}

type IArtifactProcessObj = {
    angularNodeApp: ArtifactAngularNodeApp;
    npmLibAndCliTool: ArtifactNpmLibAndCliTool;
    electronApp: ArtifactElectronApp;
    mobileApp: ArtifactMobileApp;
    docsWebapp: ArtifactDocsWebapp;
    vscodePlugin: ArtifactVscodePlugin;
};
interface ReleasePartialOutput {
    /**
     * Compiled output path for the artifact
     */
    releaseProjPath: string;
    releaseType: ReleaseType;
    /**
     * Absolute path to project folder where the artifact is located
     * and ready to be released with new version
     */
    projectsReposToPushAndTag?: string[];
    projectsReposToPush?: string[];
    resolvedNewVersion?: string;
    deploymentFunction?: () => Promise<void>;
}
interface PlatformArchType {
    platform?: NodeJS.Platform;
    arch?: 'arm64' | 'x64';
}
declare abstract class BaseArtifact<BUILD_OUTPUT extends {}, RELEASE_OUTPUT extends ReleasePartialOutput> {
    protected readonly project: Project;
    protected readonly currentArtifactName: ReleaseArtifactTaon;
    constructor(project: Project, currentArtifactName: ReleaseArtifactTaon);
    protected readonly artifacts: IArtifactProcessObj;
    protected readonly globalHelper: ArtifactsGlobalHelper;
    /**
     * + create all temp files and folders for proper inside projects structure
     * + (when struct flag = false) start any longer process that reaches
     *   for external resources like for example: npm install
     */
    abstract initPartial(options: EnvOptions): Promise<EnvOptions>;
    /**
     * everything that in init()
     * + build project
     */
    abstract buildPartial(options: EnvOptions): Promise<BUILD_OUTPUT>;
    /**
     * everything that in build()
     * + release project (publish to npm, deploy to cloud/server etc.)
     */
    abstract releasePartial(options: EnvOptions): Promise<RELEASE_OUTPUT>;
    /**
     * everything that in build()
     * + release project (publish to npm, deploy to cloud/server etc.)
     */
    abstract clearPartial(options: EnvOptions): Promise<void>;
    protected updateResolvedVersion(releaseOptions: EnvOptions): EnvOptions;
    protected shouldSkipBuild(releaseOptions: EnvOptions): boolean;
    protected getStaticPagesClonedProjectLocation(releaseOptions: EnvOptions): Promise<string>;
    protected get __allResources(): string[];
    protected __restoreCuttedReleaseCodeFromSrc(buildOptions: EnvOptions): void;
    protected __cutReleaseCodeFromSrc(buildOptions: EnvOptions): void;
    protected getDistinctArchitecturePrefix(options?: boolean | PlatformArchType, includeDashEnTheEnd?: boolean): string;
    localReleaseDeploy(outputFromBuildAbsPath: string, releaseOptions: EnvOptions, options?: {
        /**
         * Example extensions: ['.zip', '.vsix']
         */
        copyOnlyExtensions?: string[];
        createReadme?: string;
        distinctArchitecturePrefix?: boolean | PlatformArchType;
    }): Promise<Pick<ReleasePartialOutput, 'releaseProjPath' | 'projectsReposToPushAndTag'>>;
    staticPagesDeploy(outputFromBuildAbsPath: string, releaseOptions: EnvOptions, options?: {
        /**
         * Example extensions: ['.zip', '.vsix']
         */
        copyOnlyExtensions?: string[];
        createReadme?: string;
        distinctArchitecturePrefix?: boolean | PlatformArchType;
    }): Promise<Pick<ReleasePartialOutput, 'releaseProjPath' | 'projectsReposToPush'>>;
}

/**
 * Artifact manager
 * Responsible for group actions on
 * current project or/and children projects
 */
declare class ArtifactManager {
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

declare class Framework extends BaseFeatureForProject<Project> {
    get isUnknownNpmProject(): boolean;
    /**
     * TODO make this more robust
     */
    get isTnp(): boolean;
    /**
     * Core project with basic tested functionality
     */
    get isCoreProject(): boolean;
    get isContainerWithLinkedProjects(): boolean;
    /**
     * is normal or smart container
     */
    get isContainer(): boolean;
    get isContainerCoreProject(): boolean;
    get isContainerChild(): boolean;
    /**
     * Standalone project ready for publish on npm
     * Types of standalone project:
     * - isomorphic-lib : backend/fronded ts library with server,app preview
     * - angular-lib: frontend ui lib with angular preview
     */
    get isStandaloneProject(): boolean;
    get frameworkVersion(): CoreModels__NS__FrameworkVersion;
    get frameworkVersionMinusOne(): CoreModels__NS__FrameworkVersion;
    frameworkVersionEquals(version: CoreModels__NS__FrameworkVersion): boolean;
    frameworkVersionAtLeast(version: CoreModels__NS__FrameworkVersion): boolean;
    migrateFromNgModulesToStandaloneV21(tsFileContent: string): string;
    replaceModuleAndComponentName(tsFileContent: string): string;
    fixCoreContent: (appTsContent: string) => string;
    recreateVarsScss(initOptions: EnvOptions): void;
    preventNotExistedComponentAndModuleInAppTs(): void;
    recreateFileFromCoreProject: (options: {
        fileRelativePath?: string | string[];
        forceRecrete?: boolean;
        /**
         * if will override **fileRelativePath** with different path
         * to get file from core project
         * By default this helper will copy file from core project to this project:
         * <path-to-core-project><fileRelativePath>
         * <this-project><fileRelativePath>
         */
        relativePathInCoreProject?: string | string[];
        customDestinationLocation?: string | string[];
    }) => void;
    frameworkVersionLessThanOrEqual(version: CoreModels__NS__FrameworkVersion): boolean;
    frameworkVersionLessThan(version: CoreModels__NS__FrameworkVersion): boolean;
    get containerDataFromNodeModulesLink(): {
        isCoreContainer: boolean;
        coreContainerFromNodeModules: Project;
    };
    get coreProject(): Project;
    get isLinkToNodeModulesDifferentThanCoreContainer(): any;
    /**
     * Get automatic core container for project
     * WHEN NODE_MODULES BELONG TO TNP -> it uses tnp core container
     */
    get coreContainer(): Project;
    get tmpLocalProjectFullPath(): string;
    private resolveAbsPath;
    generateIndexTs(relativePath?: string): any;
    global(globalPackageName: string, packageOnly?: boolean): Promise<any>;
    /**
     * @returns by default it will always return at least one context
     */
    getAllDetectedContextsNames(): string[];
    /**
     * @returns by default it will always return at least one context
     */
    getAllDetectedTaonContexts(options?: {
        skipLibFolder?: boolean;
    }): Models__NS__TaonContext[];
    contextFilter(relativePath: string): boolean;
    private _allDetectedNestedContexts;
    get allDetectedExternalIsomorphicDependenciesForNpmLibCode(): string[];
    get allDetectedExternalNPmDependenciesForNpmLibCode(): string[];
    recreateAppTsPresentationFiles(): void;
    NODE_BUILTIN_MODULES: string[];
    setFrameworkVersion(newFrameworkVersion: CoreModels__NS__FrameworkVersion, options?: {
        confirm?: boolean;
    }): Promise<void>;
    setNpmVersion(npmVersion: string, options?: {
        confirm?: boolean;
    }): Promise<void>;
    generateLibIndex(): Promise<void>;
    generateAppRoutes(): Promise<void>;
    filterVerfiedBuilds(packagesNames: string[]): string[];
    get notVerifiedIsomorphicPackagesBuildsInNodeModules(): string[];
}

declare class Git extends BaseGit<Project> {
    /**
     * @overload
     */
    isUsingActionCommit(): boolean;
    /**
     * @deprecated
     */
    __removeTagAndCommit(autoReleaseUsingConfig: boolean): any;
    useGitBranchesWhenCommitingAndPushing(): boolean;
    useGitBranchesAsMetadataForCommits(): boolean;
    protected _beforePushProcessAction(setOrigin: 'ssh' | 'http'): Promise<any>;
    protected removeUnnecessaryFoldersAfterPullingFromGit(): Promise<void>;
    protected _afterPullProcessAction(setOrigin: 'ssh' | 'http'): Promise<void>;
    automaticallyAddAllChangesWhenPushingToGit(): boolean;
    duringPushWarnIfProjectNotOnSpecyficDevBranch(): string;
    getDefaultDevelopmentBranch(): string;
}

declare class IgnoreHide// @ts-ignore TODO weird inheritance problem
 extends BaseIgnoreHideHelpers<Project> {
    protected storeInRepoConfigFiles(): boolean;
    private applyToChildren;
    getPatternsIgnoredInRepoButVisibleToUser(): string[];
    get hideInProject(): string[];
    protected alwaysIgnoredHiddenPatterns(): string[];
    protected alwaysIgnoredAndHiddenFilesAndFolders(): string[];
    alwaysUseRecursivePattern(): string[];
    protected hiddenButNotNecessaryIgnoredInRepoFilesAndFolders(): string[];
    protected hiddenButNotNecessaryIgnoredInRepoPatterns(): string[];
    protected hiddenButNeverIgnoredInRepo(): string[];
    getVscodeFilesFoldersAndPatternsToHide(): {
        [fileFolderOrPattern: string]: true;
    };
}

declare class Linter// @ts-ignore TODO weird inheritance problem
 extends BaseLinter<Project> {
    isEnableForProject(): boolean;
}

declare class PackageJSON extends BasePackageJson {
    private project;
    KEY_TNP_PACKAGE_JSON: string;
    constructor(options: Omit<BaseJsonFileReaderOptions<PackageJson>, 'fileName'>, project: Project);
    private updateDataFromTaonJson;
    private setDataFromCoreContainer;
    recreateBin(): any;
    saveToDisk(purpose?: string): void;
    resolvePossibleNewVersion(releaseVersionBumpType: CoreModels__NS__ReleaseVersionType): string;
}

declare class NpmHelpers extends BaseNpmHelpers<Project> {
    _nodeModulesType: any;
    _packageJsonType: any;
    readonly packageJson: PackageJSON;
    readonly nodeModules: NodeModules;
    constructor(project: Project);
    /**
     * @deprecated
     */
    get lastNpmVersion(): string | undefined;
    checkProjectReadyForNpmRelease(): void;
    /**
     * check whether node_modules installed
     * or linked from core container
     * @returns boolean - true if linked from core container
     */
    get useLinkAsNodeModules(): boolean;
}

declare class NodeModules extends BaseNodeModules {
    project: Project;
    npmHelpers: NpmHelpers;
    constructor(project: Project, npmHelpers: NpmHelpers);
    /**
     * TODO use this when async not available
     */
    reinstallSync(): void;
    hasPackageInstalled(packageName: string): boolean;
    /**
     * OVERRIDDEN METHOD for taon use case
     */
    reinstall(options?: Omit<CoreModels__NS__NpmInstallOptions, 'pkg'>): Promise<void>;
    linkFromCoreContainer(): Promise<void>;
    get shouldDedupePackages(): boolean;
    /**
     * BIG TODO Organization project when compiled in dist folder
     * should store backend files in lib folder
     */
    get compiledProjectFilesAndFolders(): string[];
    dedupe(selectedPackages?: string[], fake?: boolean): void;
    dedupeCount(selectedPackages?: string[]): void;
    private get packagesToDedupe();
    /**
     * Remove already compiled package from node_modules
     * in project with the same name
     *
     * let say we have project "my-project" and we want to remove
     * "my-project" from node_modules of "my-project"
     *
     * This helper is helpful when we want to minified whole library
     * into single file (using ncc)
     */
    removeOwnPackage(actionwhenNotInNodeModules: () => {}): Promise<void>;
    getIsomorphicPackagesNames(): string[];
    getIsomorphicPackagesNamesInDevMode(): string[];
    getAllPackagesNames: (options?: {
        followSymlinks?: boolean;
    }) => string[];
    checkIfInDevMode(packageName: string): any;
    checkIsomorphic(packageName: string): boolean;
}

/**
 * TODO refactor this - use immutable db
 */
declare class PackagesRecognition extends BaseFeatureForProject<Project> {
    private get coreContainer();
    protected inMemoryIsomorphicLibs: any[];
    constructor(project: Project);
    get jsonPath(): string;
    get isomorphicPackagesFromJson(): string[];
    start(reasonToSearchPackages?: string): Promise<void>;
    addIsomorphicPackagesToFile(recognizedPackagesNewPackages: string[]): void;
    resolveAndAddIsomorphicLibsToMemory(isomorphicPackagesNames: string[], informAboutDiff?: boolean): void;
    /**
     * main source of isomorphic isomorphic packages
     */
    get allIsomorphicPackagesFromMemory(): string[];
}

/**
 * Based on this data  - system recognizes if stuff
 * is unique and what to do with it
 */
interface DeploymentReleaseData {
    projectName: string;
    destinationDomain: string;
    releaseType: ReleaseType;
    version: string;
    envName: CoreModels__NS__EnvironmentNameTaon;
    envNumber?: string;
    targetArtifact: ReleaseArtifactTaon;
}
/**
 * Temporary status while adding new deployment
 * already exists in the system
 */
declare enum DeploymentsAddingStatus {
    NOT_STARTED = "not-started",
    IN_PROGRESS = "in-progress",
    DONE = "done",
    FAILED = "failed"
}
interface DeploymentsAddingStatusObj {
    status: DeploymentsAddingStatus;
}
interface AllDeploymentsRemoveStatusObj {
    status: AllDeploymentsRemoveStatus;
}
declare enum DeploymentsStatus {
    NOT_STARTED = "not-started",
    STARTING = "starting",
    STARTED_AND_ACTIVE = "started-active",
    FAILED_START = "failed-start",
    STOPPING = "stopping",
    STOPPED = "stopped"
}
declare enum AllDeploymentsRemoveStatus {
    NOT_STARTED = "not-started",
    REMOVING = "removing",
    DONE = "done"
}

declare class Deployments extends TaonBaseEntity<Deployments> implements DeploymentReleaseData {
    id: string;
    baseFileNameWithHashDatetime?: string;
    size: MulterFileUploadResponse['size'];
    status: DeploymentsStatus;
    projectName: string;
    envName: CoreModels__NS__EnvironmentNameTaon;
    envNumber: string;
    targetArtifact: ReleaseArtifactTaon;
    releaseType: ReleaseType;
    version: string;
    destinationDomain: string;
    processIdComposeUp?: string | null;
    processIdComposeDown?: string | null;
    arrivalDate?: Date;
    get previewString(): string;
    fullPreviewString(options?: {
        boldValues?: boolean;
    }): string;
}

declare enum ProcessesState {
    /**
     * Process has not been started yet, only entity exists in the DB
     */
    NOT_STARTED = "not-started",
    /**
     * child_process is being started
     */
    STARTING = "starting",
    /**
     * Process is running and proper processActiveMessages displayed in
     * output (stdout / stderr)
     */
    ACTIVE = "active",
    /**
     * Process is being killed
     */
    KILLING = "killing",
    /**
     * Process killed after being active
     */
    KILLED = "killed",
    /**
     * Process ended with error (exit code different than 0)
     */
    ENDED_WITH_ERROR = "ended-with-error",
    /**
     * Process ended ok (exit code 0)
     */
    ENDED_OK = "ended-ok"
}

declare class Processes extends TaonBaseAbstractEntity<Processes> {
    command: string;
    cwd: string;
    state: ProcessesState;
    pid: number;
    ppid: number;
    conditionProcessActiveStdout: string[];
    conditionProcessActiveStderr: string[];
    /**
     * last 40 lines of output
     * (combined stdout + stderr)
     */
    outputLast40lines: string;
    /**
     * absolute path to file where stdout + stderr is logged
     */
    fileLogAbsPath: string;
    get previewString(): string;
    fullPreviewString(options?: {
        boldValues?: boolean;
    }): string;
}

declare class ProcessesController extends TaonBaseCrudController<Processes> {
    entityClassResolveFn: () => typeof Processes;
    private processesRepository;
    getByProcessID(processId: number | string): Taon__NS__Response<Processes>;
    getByUniqueParams(cwd: string, command: string): Taon__NS__Response<Processes>;
    triggerStart(processId: number | string, processName?: string): Taon__NS__Response<void>;
    triggerStop(processId: number | string, deleteAfterKill?: boolean): Taon__NS__Response<void>;
    waitUntilProcessDeleted(processId: string | number): Promise<void>;
    waitUntilProcessStopped(processId: string | number): Promise<void>;
}

declare class DeploymentsRepository extends TaonBaseRepository<Deployments> {
    entityClassResolveFn: () => typeof Deployments;
    protected waitUntilDeploymentRemoved(deploymentId: string): Promise<void>;
    protected getProcessesController(): Promise<ProcessesController>;
    protected zipfileAbsPath(baseFileNameWithHashDatetime: string): string;
    protected jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime: string): string;
    saveDeployment(file?: MulterFileUploadResponse, queryParams?: DeploymentReleaseData): Promise<Deployments>;
    protected waitUntilProcessKilled(processId: string | number, callback: () => void | Promise<void>): Promise<void>;
    /**
     * wait until deployment reach final state
     * starting => started
     * stopping => stopped
     * + handle failure states
     */
    protected repeatRefreshDeploymentStateUntil(deploymentId: string | number, options?: {
        refreshEveryMs?: number;
        operation: DeploymentsStatus;
        callback?: () => void | Promise<void>;
    }): void;
    /**
     * refresh deployment state for start and stop
     */
    refreshDeploymentStateForStartStop(deploymentId: string | number, options?: {
        refreshEveryMs?: number;
        operation: DeploymentsStatus;
    }): Promise<boolean>;
    allDeploymentRemoveStatus: AllDeploymentsRemoveStatus;
    removingAllDeploymentsStatus(): AllDeploymentsRemoveStatusObj;
    protected clearAllDeployments(): Promise<void>;
    triggerAllDeploymentsRemove(): Promise<void>;
    triggerDeploymentStop(baseFileNameWithHashDatetime: string, options?: {
        removeAfterStop?: boolean;
        skipStatusCheck?: boolean;
    }): Promise<Deployments>;
    triggerDeploymentStart(baseFileNameWithHashDatetime: string, options?: {}): Promise<Deployments>;
    clearAndAddExistedDeploymentsProcess(): Promise<void>;
    private deploymentsIsAddingStatus;
    triggerAddExistedDeployments(): void;
    isAddingDeploymentStatus(): DeploymentsAddingStatusObj;
}

declare class DeploymentsController extends TaonBaseCliWorkerController<DeploymentReleaseData> {
    protected deploymentsRepository: DeploymentsRepository;
    /**
     * Not available in production environment
     */
    triggerAllDeploymentsRemove(): Taon__NS__Response<void>;
    protected removingAllDeploymentsStatus(): Taon__NS__Response<AllDeploymentsRemoveStatusObj>;
    waitUntilAllDeploymentsRemoved(): Promise<void>;
    getEntities(): Taon__NS__Response<Deployments[]>;
    getByDeploymentId(deploymentId: number | string): Taon__NS__Response<Deployments>;
    /**
     * @deprecated delete this
     */
    insertEntity(): Taon__NS__Response<string>;
    uploadFormDataToServer(formData: FormData, queryParams?: DeploymentReleaseData): Models__NS__Http__NS__Response<MulterFileUploadResponse[]>;
    protected afterFileUploadAction(file?: MulterFileUploadResponse, queryParams?: DeploymentReleaseData): Promise<void>;
    uploadLocalFileToServer(absFilePath: string, options?: Pick<Ng2RestAxiosRequestConfig, 'onUploadProgress'>, queryParams?: DeploymentReleaseData): Promise<MulterFileUploadResponse[]>;
    triggerDeploymentStart(baseFileNameWithHashDatetime: string, forceStart?: boolean): Taon__NS__Response<Deployments>;
    triggerDeploymentStop(baseFileNameWithHashDatetime: string): Taon__NS__Response<void>;
    waitUntilDeploymentHasComposeUpProcess(deploymentId: string | number): Promise<void>;
    waitUntilDeploymentStopped(deploymentId: string | number): Promise<void>;
    waitUntilDeploymentRemoved(deploymentId: string | number): Promise<void>;
    triggerDeploymentRemove(baseFileNameWithHashDatetime: string): Taon__NS__Response<void>;
    triggerTableClearAndAddExistedDeployments(): Taon__NS__Response<void>;
    protected isClearingAndAddingDeployments(): Taon__NS__Response<DeploymentsAddingStatusObj>;
    waitUntilTableClearAndAllExistedDeploymentsAdded(): Promise<void>;
}

declare class DeploymentsTerminalUI extends BaseCliWorkerTerminalUI<DeploymentsWorker> {
    headerText(): Promise<string>;
    textHeaderStyle(): CoreModels__NS__CfontStyle;
    private stopDeployment;
    private removeDeployment;
    private startDeployment;
    protected refetchDeployment(deployment: Deployments, deploymentsController: DeploymentsController): Promise<Deployments>;
    protected crudMenuForSingleDeployment(deployment: Deployments, deploymentsController: DeploymentsController, processesController: ProcessesController): Promise<void>;
    getWorkerTerminalActions(options?: {
        exitIsOnlyReturn?: boolean;
        chooseAction?: boolean;
    }): BaseWorkerTerminalActionReturnType;
}

declare class DeploymentsWorker extends BaseCliWorker<DeploymentsController, DeploymentsTerminalUI> {
    workerContextTemplate: any;
    terminalUI: DeploymentsTerminalUI;
    controllerClass: typeof DeploymentsController;
    constructor(
    /**
     * unique id for service
     */
    serviceID: string, 
    /**
     * external command that will start service
     */
    startCommandFn: () => string);
    startNormallyInCurrentProcess(): Promise<void>;
}

declare class Instances extends TaonBaseAbstractEntity<Instances> {
    /**
     * zip file with docker-compose and other files
     * needed to deploy this deployment
     */
    ipAddress: string;
    name: string;
}

declare class InstancesRepository extends TaonBaseRepository<Instances> {
    entityClassResolveFn: () => typeof Instances;
    testMethod(): void;
}

declare class InstancesController extends TaonBaseCliWorkerController {
    instancesRepository: InstancesRepository;
    getEntities(): Taon__NS__Response<Instances[]>;
    delete(id: string): Taon__NS__Response<Instances>;
    insertEntity(entity: Instances): Taon__NS__Response<Instances>;
}

declare class InstancesTerminalUI extends BaseCliWorkerTerminalUI<InstancesWorker> {
    headerText(): Promise<string>;
    textHeaderStyle(): CoreModels__NS__CfontStyle;
    getWorkerTerminalActions(options?: {
        exitIsOnlyReturn?: boolean;
        chooseAction?: boolean;
    }): BaseWorkerTerminalActionReturnType;
}

declare class InstancesWorker extends BaseCliWorker<InstancesController, InstancesTerminalUI> {
    workerContextTemplate: any;
    terminalUI: InstancesTerminalUI;
    controllerClass: typeof InstancesController;
    constructor(
    /**
     * unique id for service
     */
    serviceID: string, 
    /**
     * external command that will start service
     */
    startCommandFn: () => string);
    startNormallyInCurrentProcess(): Promise<void>;
}

declare class ProcessesTerminalUI extends BaseCliWorkerTerminalUI<ProcessesWorker> {
    protected headerText(): Promise<string>;
    protected textHeaderStyle(): CoreModels__NS__CfontStyle;
    getDummyProcessParams(): Promise<{
        command: string;
        cwd: string;
    }>;
    protected refetchProcess(process: Processes, processesController: ProcessesController): Promise<Processes>;
    protected crudMenuForSingleProcess(processFromDb: Processes, processesController: ProcessesController): Promise<void>;
    getWorkerTerminalActions(options?: {
        exitIsOnlyReturn?: boolean;
        chooseAction?: boolean;
    }): BaseWorkerTerminalActionReturnType;
}

declare class ProcessesWorkerController extends TaonBaseCliWorkerController {
}

declare class ProcessesWorker extends BaseCliWorker<ProcessesWorkerController, ProcessesTerminalUI> {
    workerContextTemplate: any;
    terminalUI: ProcessesTerminalUI;
    controllerClass: typeof ProcessesWorkerController;
    constructor(
    /**
     * unique id for service
     */
    serviceID: string, 
    /**
     * external command that will start service
     */
    startCommandFn: () => string);
    startNormallyInCurrentProcess(): Promise<void>;
}

declare class TaonTerminalUI extends BaseCliWorkerTerminalUI<TaonProjectsWorker> {
    protected headerText(): Promise<string>;
    header(): Promise<void>;
    protected getDomainsMenu(): Promise<void>;
    getWorkerTerminalActions(): BaseWorkerTerminalActionReturnType;
}

declare class TaonEnv extends TaonBaseAbstractEntity {
    static from(obj: {
        name: string;
        type: CoreModels__NS__EnvironmentNameTaon;
    }): TaonEnv;
    type: CoreModels__NS__EnvironmentNameTaon;
    name: string;
}

declare class TaonProjectsController extends TaonBaseCliWorkerController {
    taonEnvRepo: taon_browser_prod.TaonBaseRepository<TaonEnv>;
    getEnvironments(): Taon__NS__Response<TaonEnv[]>;
}

declare enum TaonCloudStatus {
    NOT_STARED = "NOT_STARED",
    KILLING = "KILLING",
    STARTING_NOT_SECURE_MODE = "STARTING_NOT_SECURE_MODE",
    STARTING_SECURE_MODE = "STARTING_SECURE_MODE",
    ENABLED_NOT_SECURE = "ENABLED_NOT_SECURED",
    ENABLED_SECURED = "ENABLED_SECURED"
}

declare class TraefikServiceProvider {
    private traefikProvider;
    constructor(traefikProvider: TraefikProvider);
    protected get dynamicServicesRelativePathPart(): string;
    protected getRuleFromIp(options: {
        publicOrLocalIp: string;
        worker?: BaseCliWorker<any, any>;
    }): string;
    protected yamlPathForServiceName(options: {
        ipAsServiceName: string;
    }): string;
    getIpFromYml(): string | undefined;
    initServiceReadme(): void;
    registerWorkers(publicOrLocalIp: string, workers: BaseCliWorker<any, any>[], options?: {
        /**
         * If true, Traefik will be restarted after registering the service
         */
        restartTraefikAfterRegister?: boolean;
    }): Promise<void>;
    /**
     * @deprecated
     */
    register(publicOrLocalIp: string, localhostPort: number, options?: {
        /**
         * If true, Traefik will be restarted after registering the service
         */
        restartTraefikAfterRegister?: boolean;
    }): Promise<boolean>;
    /**
     * Remove traefik routes for service
     * @param serviceId service name to unregister (kebab-case)
     */
    unregister(publicOrLocalIp: string): Promise<void>;
    /**
     * Check if a service is already registered in Traefik
     * (by verifying if dynamic YAML config exists)
     */
    isRegistered(publicOrLocalIp: string): Promise<boolean>;
}

declare class TraefikProvider {
    private taonProjectsWorker;
    service: TraefikServiceProvider;
    readonly cloudIps: string[];
    protected taonCloudStatus: TaonCloudStatus;
    protected reverseProxyNetworkName: string;
    get cloudIsEnabled(): boolean;
    get isDevMode(): boolean;
    /**
     * Path to traefik docker compose cwd where
     * compose will be started
     */
    get pathToTraefikComposeDestCwd(): string;
    /**
     * Path to traefik docker compose template files
     */
    private get pathToTraefikComposeSourceTemplateFilesCwd();
    constructor(taonProjectsWorker: TaonProjectsWorker);
    protected setEnabledMode(): void;
    protected checkIfDockerEnabled(): Promise<boolean>;
    protected deleteTraefikNetwork(): Promise<void>;
    protected makeSureTraefikNetworkCreated(): Promise<void>;
    protected selectModeExplain(): Promise<void>;
    protected selectMode(options?: {}): Promise<TaonCloudStatus>;
    protected checkIfTraefikIsRunning(options?: {
        waitUntilHealthy?: boolean;
        maxTries?: number;
    }): Promise<boolean>;
    protected selectCloudIps(): Promise<boolean>;
    protected areCloudIpsValid(): Promise<boolean>;
    initialCloudStatusCheck(): Promise<void>;
    restartTraefik(options?: {
        hardRestart?: boolean;
    }): Promise<void>;
    startTraefik(): Promise<boolean>;
    stopTraefik(): Promise<void>;
}

declare class TaonProjectsWorker extends BaseCliWorker<TaonProjectsController, TaonTerminalUI> {
    readonly ins: TaonProjectResolve;
    terminalUI: TaonTerminalUI;
    workerContextTemplate: any;
    controllerClass: typeof TaonProjectsController;
    deploymentsWorker: DeploymentsWorker;
    instancesWorker: InstancesWorker;
    processesWorker: ProcessesWorker;
    traefikProvider: TraefikProvider;
    constructor(
    /**
     * unique id for service
     */
    serviceID: string, 
    /**
     * external command that will start service
     */
    startCommandFn: () => string, ins: TaonProjectResolve);
    /**
     * start normally process
     * this will crash if process already started
     */
    startNormallyInCurrentProcess(): Promise<void>;
    enableCloud(): Promise<void>;
    disableCloud(): Promise<void>;
}

declare class TaonProjectResolve extends BaseProjectResolver<Project> {
    protected classFn: typeof Project;
    cliToolNameFn: () => string;
    taonProjectsWorker: TaonProjectsWorker;
    private hasResolveCoreDepsAndFolder;
    constructor(classFn: typeof Project, cliToolNameFn: () => string);
    typeFrom(location: string): CoreModels__NS__LibType;
    /**
     * TODO use base resolve
     */
    From(locationOfProj: string | string[]): Project;
    nearestTo<T = Project>(absoluteLocation: string, options?: {
        type?: CoreModels__NS__LibType;
        findGitRoot?: boolean;
        onlyOutSideNodeModules?: boolean;
    }): T;
    get Tnp(): Project;
    by(libraryType: CoreModels__NS__NewFactoryType): Project;
    private get projectsInUserFolder();
    /**
     * taon sync command
     */
    sync({ syncFromCommand }?: {
        syncFromCommand?: boolean;
    }): void;
    initialCheck(): any;
    private pathResolved;
    private resolveCoreProjectsPathes;
    /**
     * only for tnp dev mode cli
     */
    get taonProjectsRelative(): string;
    angularMajorVersionForCurrentCli(): number;
    taonTagToCheckoutForCurrentCliVersion(cwd: string): string;
}

declare class QuickFixes extends BaseQuickFixes<Project> {
    removeHuskyHooks(): void;
    fixPrettierCreatingConfigInNodeModules(): void;
    recreateTempSourceNecessaryFilesForTesting(initOptions: EnvOptions): void;
    makeSureDistFolderExists(): void;
    missingAngularLibFiles(): void;
    removeBadTypesInNodeModules(): void;
    addMissingSrcFolderToEachProject(): void;
    get nodeModulesPkgsReplacements(): any;
    /**
     * @deprecated
     * FIX for missing npm packages from npmjs.com
     *
     * Extract each file: node_modules-<package Name>.zip
     * to node_modules folder before instalation.
     * This will prevent packages deletion from npm
     */
    unpackNodeModulesPackagesZipReplacements(): any;
}

declare class Refactor extends BaseFeatureForProject<Project> {
    private prepareOptions;
    ALL(options?: {
        initingFromParent?: boolean;
        fixSpecificFile?: string | undefined;
    }): Promise<void>;
    prettier(options: {
        fixSpecificFile?: string;
    }): Promise<any>;
    eslint(options: {
        fixSpecificFile?: string;
    }): Promise<any>;
    removeBrowserRegion(options: {
        fixSpecificFile?: string;
    }): Promise<any>;
    changeCssToScss(options: {
        fixSpecificFile?: string;
    }): Promise<any>;
    properStandaloneNg19(options: {
        fixSpecificFile?: string;
    }): Promise<any>;
    importsWrap(options: {
        fixSpecificFile?: string;
    }): Promise<any>;
    flattenImports(options: {
        fixSpecificFile?: string;
    }): Promise<any>;
    taonNames(options: {
        fixSpecificFile?: string;
    }): Promise<any>;
    /**
     * Replaces self imports (imports using the package name) with proper relative paths.
     */
    selfImports(options: {
        fixSpecificFile?: string;
    }): Promise<any>;
    classIntoNs(options: {
        fixSpecificFile?: string;
    }): Promise<any>;
}

/**
 * manage standalone or container release process
 */ declare class ReleaseProcess extends BaseReleaseProcess<Project> {
    constructor(project: Project);
    displayReleaseProcessMenu(envOptions: EnvOptions): Promise<void>;
    releaseByType(releaseType: ReleaseType, envOptions: EnvOptions): Promise<boolean>;
    getEnvNamesByArtifact(artifact: ReleaseArtifactTaon): {
        envName: CoreModels__NS__EnvironmentNameTaon;
        envNumber?: number | undefined;
    }[];
    displayProjectsSelectionMenu(envOptions: EnvOptions): Promise<Project[]>;
    displaySelectArtifactsMenu(envOptions: EnvOptions, selectedProjects: Project[], allowedArtifacts?: ReleaseArtifactTaon[] | undefined): Promise<ReleaseArtifactTaon[]>;
    startRelease(envOptions?: EnvOptions): Promise<void>;
    /**
     * return true if everything went ok
     */
    releaseArtifacts(releaseType: ReleaseType, releaseArtifactsTaon: ReleaseArtifactTaon[], selectedProjects: Project[], envOptions: EnvOptions): Promise<boolean>;
    /**
     * does not matter if container is releasing standalone
     * or organization packages -> release commit is pushed
     */
    pushReleaseCommits(): Promise<void>;
    private getReleaseHeader;
    private getColoredTextItem;
}

declare class SubProject extends BaseQuickFixes<Project> {
    private get tempSubProjectFolder();
    private pathToTempalteInCore;
    private pathToTempalteInCurrentProject;
    private workerNameFor;
    private npmInstall;
    deployment(cwdWorker: string): Promise<void>;
    loginCliCloudFlare(cwdWorker: string): Promise<void>;
    private initProcess;
    private addSecrets;
    private setMode;
    getAll(): string[];
    getAllSubProjects(): Project[];
    private coreProjectBy;
    initAll(): Promise<void>;
    protected getAllByTypePaths(tempalteType: TempalteSubprojectType): string[];
    getAllByType(tempalteType: TempalteSubprojectType): Project[];
    extractWorkersDevInfo(text: string): string;
    addAndConfigure(): Promise<void>;
    testWithExampleData(): Promise<void>;
    setModeForWorker(): Promise<void>;
    setWorkerSecrets(): Promise<void>;
    deployWorker(): Promise<void>;
}

declare class TaonJson extends BaseFeatureForProject<Project> {
    private readonly data?;
    /**
     * package.json override
     */
    readonly overridePackageJsonManager: BasePackageJson;
    get path(): string;
    /**
     * ! TODO EXPERMIENTAL
     * @deprecated
     */
    reloadFromDisk(): void;
    get exists(): boolean;
    preserveOldTaonProps(): void;
    preservePropsFromPackageJson(): void;
    saveToDisk(purpose?: string): void;
    get type(): CoreModels__NS__LibType;
    /**
     * Resource to include in npm lib
     * (relative paths to files or folders)
     */
    get resources(): string[];
    /**
     * Base url for content (docs, md files etc.)
     * Required if README.md has relative pathes to links
     */
    get baseContentUrl(): string | undefined;
    /**
     * Base url for content (docs, md files etc.)
     * Required if README.md has relative pathes to images
     */
    get baseImagesUrl(): string | undefined;
    get storeGeneratedAssetsInRepository(): boolean;
    get storeLocalReleaseFilesInRepository(): boolean;
    /**
     * Dependencies for npm lib (non isomorphic)
     */
    get dependenciesNamesForNpmLib(): string[];
    get overridePackagesOrder(): string[];
    private setDependenciesNamesForNpmLib;
    /**
     * External isomorphic dependencies for npm lib
     * (build-in/core taon isomorphic packages will not be here)
     */
    get isomorphicDependenciesForNpmLib(): string[];
    private setIsomorphicDependenciesForNpmLib;
    additionalExternalsFor(artifactName: ReleaseArtifactTaon): string[];
    additionalReplaceWithNothingFor(artifactName: ReleaseArtifactTaon): string[];
    getNativeDepsFor(artifactName: ReleaseArtifactTaon): string[];
    /**
     * Peer deps to inlculde in npm lib
     * (relative paths to files or folders)
     */
    get peerDependenciesNamesForNpmLib(): string[];
    /**
     * Peer deps to inlculde in npm lib
     * (relative paths to files or folders)
     */
    get devDependenciesNamesForNpmLib(): string[];
    private setPeerDependenciesNamesForNpmLib;
    /**
     * Peer deps to inlculde in npm lib
     * (relative paths to files or folders)
     */
    get optionalDependenciesNamesForNpmLib(): string[];
    setType(type: CoreModels__NS__LibType): void;
    setFrameworkVersion(frameworkVersionArg: CoreModels__NS__FrameworkVersion): Promise<void>;
    get isUsingOwnNodeModulesInsteadCoreContainer(): boolean;
    get linkNodeModulesFromCoreContainer(): Models__NS__TaonJsonContainer['linkNodeModulesFromCoreContainer'];
    get shouldGenerateAutogenIndexFile(): boolean;
    setShouldGenerateAutogenIndexFile(value: boolean): void;
    setShouldGenerateAutogenAppRoutes(value: boolean): void;
    setCloudFlareAccountSubdomain(value: string): void;
    get cloudFlareAccountSubdomain(): string;
    get shouldGenerateAutogenAppRoutesFile(): boolean;
    get isMonorepo(): boolean;
    get isOrganization(): boolean;
    get nameWhenInsideOrganiation(): string | undefined;
    get overrideNameForCli(): string | undefined;
    get overrideNpmName(): string | undefined;
    get isCoreProject(): boolean;
    get frameworkVersion(): CoreModels__NS__FrameworkVersion | undefined;
    get appId(): string;
    set appId(value: string);
    get removeAfterPullingFromGit(): string[];
    linkTo(destination: string): void;
    get autoReleaseConfigAllowedItems(): Models__NS__TaonAutoReleaseItem[];
    get createOnlyTagWhenRelease(): boolean;
    set autoReleaseConfigAllowedItems(items: Models__NS__TaonAutoReleaseItem[]);
    detectAndUpdateNpmExternalDependencies(): void;
    detectAndUpdateIsomorphicExternalDependencies(): void;
    updateDependenciesFromNpm(options?: {
        onlyPackageNames?: string[];
    }): Promise<void>;
}

/**
 * Handle taon things related to vscode
 * support for launch.json, settings.json etc
 */
declare class Vscode// @ts-ignore TODO weird inheritance problem
 extends BaseVscodeHelpers<Project> {
    init(options?: {
        skipHiddingTempFiles?: boolean;
    }): Promise<void>;
    saveCurrentSettings(): void;
    private saveColorsForWindow;
    recreateJsonSchemaForDocs(): void;
    recreateJsonSchemaForTaon(): void;
    private get vscodePluginDevPreLaunchTask();
    saveTasksJson(): void;
    saveLaunchJson(): Promise<void>;
    get __vscodeLaunchRuntimeArgs(): any;
    /**
     * for debugging node_modules
     * get out files for debugging
     */
    get outFiles(): any;
    get sourceMapPathOverrides(): any;
    get __vscodeFileTemplates(): string[];
    getVscodeBottomColor(): string;
    refreshColorsInSettings(): void;
    getBasicSettins(): Promise<object>;
}

declare class Project extends BaseProject<Project, CoreModels__NS__LibType> {
    static ins: TaonProjectResolve;
    readonly type: CoreModels__NS__LibType;
    readonly vsCodeHelpers: Vscode;
    readonly releaseProcess: ReleaseProcess;
    readonly npmHelpers: NpmHelpers;
    readonly subProject: SubProject;
    get packageJson(): PackageJSON;
    get nodeModules(): NodeModules;
    readonly linter: Linter;
    readonly framework: Framework;
    readonly quickFixes: QuickFixes;
    readonly artifactsManager: ArtifactManager;
    readonly git: Git;
    readonly ignoreHide: IgnoreHide;
    readonly taonJson: TaonJson;
    readonly packagesRecognition: PackagesRecognition;
    readonly environmentConfig: EnvironmentConfig;
    readonly refactor: Refactor;
    struct(initOptions?: EnvOptions): Promise<void>;
    init(initOptions?: EnvOptions): Promise<void>;
    build(buildOptions?: EnvOptions): Promise<void>;
    release(releaseOptions: EnvOptions): Promise<void>;
    lint(lintOptions?: PushProcessOptions): Promise<void>;
    clear(clearOptions?: Partial<EnvOptions>): Promise<void>;
    isLinuxWatchModeAllowde(): boolean;
    getWatcherFor(folders: string[], watcherType: 'backend' | 'browser' | 'webslq'): Observable<{}>;
    get tmpSourceRebuildForBackendObs(): Observable<{}> | undefined;
    get tmpSourceRebuildForBrowserObs(): Observable<{}> | undefined;
    get tmpSourceRebuildForWebsqlObs(): Observable<{}> | undefined;
    protected hasValidAutoReleaseConfig(envOptions: EnvOptions, options?: {
        project?: Project;
        hideTaskErrors?: boolean;
    }): boolean;
    get branding(): Branding;
    /**
     * @deprecated
     */
    get tnpCurrentCoreContainer(): Project;
    /**
     * @overload
     */
    get name(): string;
    get nameForCli(): string;
    /**
     * @overload
     */
    get nameForNpmPackage(): string;
    info(): Promise<string>;
    /**
     * @overload
     */
    get ins(): TaonProjectResolve;
    /**
     * @overload
     */
    get children(): Project[];
    get isMonorepo(): boolean;
}

interface Models__NS__TaonLoaderConfig {
    name?: Models__NS__TaonLoaders;
    color?: string;
}
type Models__NS__TaonLoaders = keyof typeof globaLoaders;
declare class Models__NS__TaonContext {
    contextName: string;
    fileRelativePath: string;
}
interface Models__NS__TaonAutoReleaseItem {
    artifactName: ReleaseArtifactTaon;
    /**
     * if not proviede default  env.<artifact-name>.__.ts will be in use
     */
    envName?: CoreModels__NS__EnvironmentName;
    /**
     * example for dev environtment
     * > undefined - env.<artifact-name>.dev.ts
     * > 1 - env.<artifact-name>.dev1.ts
     * > 2 - env.<artifact-name>.dev2.ts
     * ...
     */
    envNumber?: number | undefined;
    /**
     * select release type for automatic release
     */
    releaseType?: ReleaseType;
    /**
     * IP address of taon instance where to release
     */
    taonInstanceIp?: string;
    /**
     * friendly name of item in auto release list configuration
     */
    taskName: string;
    /**
     * Short description of auto release item
     */
    description?: string;
    /**
     * Ask for confirmation before deployement to taon cloud
     */
    askUserBeforeFinalAction?: boolean;
    /**
     * Custom url for static pages repo release (or custom prefix)
     * example:
     * - FULL LINK: 'https://githublink-env-stage'
     * - PREFIX LINK:  '-env-test'  I wil be change to https://current-origin-env-test
     */
    staticPagesCustomRepoUrl?: string;
}
interface Models__NS__TaonJsonContainer extends TaonJsonCommon {
    /**
     * (CONTAINER) Static resurces for site project, that are
     * going to be included in release dist
     */
    resources?: string[];
    /**
     * (CONTAINER) Force linking node_modules from core container
     */
    linkNodeModulesFromCoreContainer?: boolean;
    /**
     * (CONTAINER) override order of packages during release or buildq
     * so dependencies are released first
     */
    overridePackagesOrder: string[];
    /**
     * (CONTAINER) Don't release inside children -> only tag the version
     */
    createOnlyTagWhenRelease?: boolean;
    /**
     * (CONTAINER) Project is monorepo
     */
    monorepo?: boolean;
    /**
     * (CONTAINER) Project is organization/scope (like @angular)
     */
    organization?: boolean;
    /**
     * (CONTAINER) Container projects can be used as micro frontends
     * with router:
     *  <site-path>/  (microFrontendMainProjectName)
     *  <site-path>/_/other-project-name
     */
    microFrontendMainProjectName?: string;
}
interface TaonJsonCommon {
    type: LibTypeEnum;
    /**
     * version of taon framework for project
     */
    version?: CoreModels__NS__FrameworkVersion;
    /**
     * project is template for other project
     */
    isCoreProject: boolean;
    packageJsonOverride: Partial<PackageJson$1>;
    /**
     * Folders to remove after pulling from git.
     * Usefull when you have some folders that are
     * not needed in git but there just waiting to be deleted
     * after pulling from git.
     * This may be useful after refactor/moving huge
     * folders around.
     */
    removeAfterPullingFromGit?: string[];
    /**
     * @deprecated
     */
    overrided?: {
        /**
         * @deprecated
         */
        includeOnly?: string[];
    };
}
interface Models__NS__DocsConfig {
    /**
     * override site name (default is project name)
     */
    site_name: string;
    /**
     * relative pathes (or titles) of md files
     * for proper order
     */
    priorityOrder?: string[];
    /**
     * glob pattern to omit files by title
     */
    omitFilesPatters: string[];
    /**
     * relative path to the assets folders in project
     * [external assets not allowed... use externalDocs for that]
     */
    /**
     * include external docs
     * inside this docs
     */
    externalDocs: {
        mdfiles: {
            /**
             * path to *.md file
             * Examples:
             * taon-core/README.md
             * taon-core/docs/README.md # deep pathes allowed
             */
            packageNameWithPath: string;
            /**
             * if you want to rename something inside file
             * you can use this magic rename rules
             * example:
             *
             * framework-name => new-framework-name
             *
             * example with array:
             *
             * framework-name => new-framework-name, framework-name2 => new-framework-name2
             */
            magicRenameRules?: string;
            /**
             * override menu item name (by default titile is relative path)         *
             */
            overrideTitle?: string;
        }[];
        projects: {
            /**
             * default README.md file
             * If array -> file will be join and first file will be used as title
             */
            packageNameWithPath?: string | string[];
            /**
             * override menu item name
             */
            overrideTitle?: string;
        }[];
    };
    /**
     * rename/override titles in menu, exmaple:
     * README.md => Home
     */
    mapTitlesNames: {
        [title: string]: string;
    };
    customJsPath?: string;
    customCssPath?: string;
}

/**
 * All possible release types for taon
 * for MANUAL/CLOUD release
 */
declare enum ReleaseArtifactTaon {
    /**
     * Npm lib package and global cli tool
     */
    NPM_LIB_PKG_AND_CLI_TOOL = "npm-lib-and-cli-tool",
    /**
     * Angular frontend webapp (pwa) + nodejs backend inside docker
     */
    ANGULAR_NODE_APP = "angular-node-app",
    /**
     * Angular + Electron app
     */
    ELECTRON_APP = "electron-app",
    /**
     * Angular + Capacitor
     */
    MOBILE_APP = "mobile-app",
    /**
     * Visual Studio Code extension/plugin
     */
    VSCODE_PLUGIN = "vscode-plugin",
    /**
     * Documentation (MkDocs + compodoc + storybook)
     * webapp (pwa) inside docker
     */
    DOCS_DOCS_WEBAPP = "docs-webapp"
}
declare const ReleaseArtifactTaonNamesArr: ReleaseArtifactTaon[];
declare enum ReleaseType {
    /**
     * Manual release (happen physically on local machine)
     */
    MANUAL = "manual",
    /**
     * Releases artifact to local repository <project-location>/local_release/<artifact-name>/<release build files>
     */
    LOCAL = "local",
    /**
     * Trigger cloud release (happen on cloud server)
     * Cloud release actually start "Manual" release process on cloud server
     */
    CLOUD = "cloud",
    /**
     * Trigger cloud release (happen on cloud server)
     * Cloud release actually start "Manual" release process on cloud server
     */
    STATIC_PAGES = "static-pages"
}
declare const ReleaseTypeArr: ReleaseType[];
declare const Development = "development";
declare const ReleaseTypeWithDevelopmentArr: (ReleaseType | 'development')[];
declare class EnvOptionsBuildPwa {
    disableServiceWorker: boolean;
    name?: string;
    short_name?: string;
    start_url?: string;
}
declare class EnvOptionsBuildElectron {
    showDevTools: boolean;
}
declare class EnvOptionsBuildCli {
    /**
     * using esbuild (default false)
     */
    minify: boolean;
    /**
     *  using esbuild (default false)
     */
    includeNodeModules: boolean;
    /**
     * using uglifyjs
     */
    uglify: boolean;
    /**
     * using only works with uglify = true
     */
    compress: boolean;
    /**
     * using  obscurejs
     */
    obscure: boolean;
}
declare class EnvOptionsNodeBackendApp {
    /**
     * using esbuild
     */
    minify: boolean;
}
declare class EnvOptionsBuildLib {
    removeDts: boolean;
    uglifyFileByFile: boolean;
    obscureFileByFile: boolean;
    includeSourceMaps: boolean;
    compress: boolean;
    /**
     * skip include lib files (only cli.js + bin stays)
     * Perfect for just releasing cli tool
     */
    doNotIncludeLibFiles: boolean;
}
declare class EnvOptionsBuild {
    /**
     * override output path
     * for combined/bundled build artifact
     */
    overrideOutputPath: string;
    /**
     * base-href -> is a part of lib code build
     *
     * overwrite base href for app deployment.
     * Must be at least equal: '/'
     *
     * default: /
     * default for github pages standalone project: '/<project-name-or-overwritten>/'
     * default for organizaion main target: '/<project-name-or-overwritten>/'
     * default for organizaion main other targets: '/<project-name-or-overwritten>/-/<other-target-name>/'
     */
    baseHref: string;
    websql: boolean;
    /**
     * Taon production release mode:
     * - splitting namespaces
     * - all possible optimization
     */
    prod?: boolean;
    /**
     * watch build
     */
    watch: boolean;
    /**
     * true by default
     */
    ssr: boolean;
    /**
     * show electron dev tools
     */
    electron: Partial<EnvOptionsBuildElectron>;
    /**
     * Do not generate backend code
     */
    genOnlyClientCode: boolean;
    pwa: Partial<EnvOptionsBuildPwa>;
}
declare const dockerBackendAppNode: TaonDockerContainerConfig;
declare const dockerFrontendNginx: TaonDockerContainerConfig;
declare const dockerDatabaseMysql: TaonDockerContainerConfig<{
    MYSQL_ROOT_PASSWORD: string;
    MYSQL_DATABASE: string;
    MYSQL_USER: string;
    MYSQL_PASSWORD: string;
    readonly HEALTH_PORT: number;
}>;
declare const taonBuiltinDockerImages: {
    'backend-app-node': TaonDockerContainerConfig<{}>;
    'frontend-app': TaonDockerContainerConfig<{}>;
    'database-mysql': TaonDockerContainerConfig<{
        MYSQL_ROOT_PASSWORD: string;
        MYSQL_DATABASE: string;
        MYSQL_USER: string;
        MYSQL_PASSWORD: string;
        readonly HEALTH_PORT: number;
    }>;
};
declare const taonBuildInImages: TaonDockerContainerConfig[];
interface TaonDockerContainerConfig<ENV = {}> {
    /**
     * name for container - should be unique
     */
    name: string;
    /**
     * based on image name or function that return path to dockerfile
     */
    pathToProjectWithDockerfile?: (opt?: {
        project?: Project;
        env?: ENV;
    }) => string;
    /**
     * if true container wont start in dev mode
     * (ng serve, debug js mode on localhost etc.)
     */
    skipStartInDevMode?: boolean;
    /**
     * if wait unit healthy is true
     * then healthCheck function is required
     * and it will be called to check if container is healthy
     */
    healthCheck?: (opt?: {
        axios?: typeof axiosType;
        project?: Project;
        env?: ENV;
    }) => Promise<boolean>;
    waitUnitHealthy?: boolean;
    overrideDotEnv?: {
        [key in keyof ENV]: string | number | boolean;
    };
}
/**
 * Each taon context will get mysql mariadb instead
 * sqljs file database when using docker
 */
declare class EnvOptionsDocker {
    skipStartInOrder?: boolean;
    /**
     * each taon context will use sql.js file database
     */
    skipUsingMysqlDb?: boolean;
    additionalContainer: (Partial<TaonDockerContainerConfig<any>> | keyof typeof taonBuiltinDockerImages)[];
}
declare class EnvOptionsPorts {
}
declare class EnvOptionsLoadingPreAngularBootstrap {
    /**
     * loder path to image or
     * build in loader config
     */
    loader?: string | Models__NS__TaonLoaderConfig;
    /**
     * background body
     */
    background?: string;
}
declare class EnvOptionsLoading {
    /**
     * this is presented before bootstrapping of angular
     * at the beginning of first index.html fetch
     */
    preAngularBootstrap?: Partial<EnvOptionsLoadingPreAngularBootstrap>;
}
declare class EnvOptionsRelease {
    taonInstanceIp?: string;
    /**
     * new version resolve at the beginning of release process
     * and is used for all artifacts
     */
    readonly resolvedNewVersion: string;
    /**
     * skip npm publish
     */
    skipDeploy?: boolean;
    /**
     * skip npm publish
     */
    skipNpmPublish?: boolean;
    /**
     * skip git commit
     */
    skipTagGitPush?: boolean;
    /**
     * skip release question
     */
    skipReleaseQuestion?: boolean;
    /**
     * Useful if you just want to release static pages
     * without any versioning
     */
    skipStaticPagesVersioning?: boolean;
    /**
     * skip git commit
     */
    skipResolvingGitChanges?: boolean;
    /**
     * skip cuting @ n o t F o r N p m tags
     */
    skipCodeCutting?: boolean;
    /**
     * release artifact name
     * for example: "angular-node-app"
     */
    targetArtifact: ReleaseArtifactTaon;
    /**
     * true - skip all artifacts build
     * or array of artifacts to skip
     */
    skipBuildingArtifacts?: ReleaseArtifactTaon[] | boolean;
    /**
     * undefined  - means it is development build
     */
    releaseType?: ReleaseType | undefined;
    /**
     * process that is running in CI (no questions for user)
     */
    releaseVersionBumpType: CoreModels__NS__ReleaseVersionType;
    /**
     * quick automatic release of lib
     */
    autoReleaseUsingConfig: boolean;
    /**
     * ask before deployment to taon cloud
     */
    askUserBeforeFinalAction: boolean;
    /**
     * Task of auto release from config
     */
    autoReleaseTaskName: string;
    /**
     * Tell when to override (html,js,css) static pages files
     * when releasing new version
     * Example:
     * - for docs on "static pages" you just want one docs version for major release
     * - for electron apps on "static pages" you want to have an version for each minor or patch release
     */
    overrideStaticPagesReleaseType: CoreModels__NS__ReleaseVersionType;
    /**
     * Separated repository for static pages releases
     */
    staticPagesCustomRepoUrl?: string;
    envName: CoreModels__NS__EnvironmentNameTaon;
    /**
     * undefined - prod
     * number   -  prod1
     */
    envNumber: number | undefined;
    cli: Partial<EnvOptionsBuildCli>;
    nodeBackendApp: Partial<EnvOptionsNodeBackendApp>;
    lib: Partial<EnvOptionsBuildLib>;
    /**
     * after release install locally
     * - vscode plugin -> to Local VSCode
     * - npm lib -> to Local NPM
     * - angular-node-app -> to Local docker
     * - electron-app -> to current os
     * - mobile-app -> to current connected device
     * - docs-webapp -> as offline pwa app installed in current os
     */
    installLocally: boolean;
    /**
     * after local install remove release output
     * (for quick local test releases)
     */
    removeReleaseOutputAfterLocalInstall?: boolean;
    fixStaticPagesCustomRepoUrl(project?: Project): void;
}
declare class EnvOptionsInit {
    /**
     * init only structure without external deps
     */
    struct: boolean;
    branding: boolean;
}
declare class EnvOptionsCopyToManager {
    skip: boolean;
    beforeCopyHook: () => void | Promise<void>;
    copyToLocations: string[];
    copyToProjects: string[];
}
declare class EnvOptionsWebsite {
    title: string;
    domain: string;
    /**
     * Where taon should allow doamin use in this project.
     *
     * Not using domain ( useDomain = false ) means:
     * -> github pages generated domain
     * -> ip address as domain
     */
    useDomain: boolean;
}
declare class EnvOptionsContainer {
    /**
     * start release on project
     */
    start?: string;
    /**
     * release only specified projects
     */
    only?: string | string[];
    /**
     * skip specified projects
     */
    skip?: string | string[];
    /**
     * end release on project
     */
    end?: string;
    /**
     * skip just released projects (last commit starts with 'release: ')
     * and only release projects with new changes
     */
    skipReleased?: boolean;
}
declare class EnvOptions<ENV_CONFIG = Record<string, string | number | boolean | null>> {
    static releaseSkipMenu(options: EnvOptions, opt?: {
        selectDefaultValues?: boolean;
        args?: string[];
    }): Promise<EnvOptions>;
    static from(options: Partial<EnvOptions>): EnvOptions;
    toStringCommand(taonCommand?: string): string;
    /**
     * override existed/proper fields from "override" object
     * inside "destination" object
     */
    static merge(destination: any, override: any): EnvOptions;
    static saveToFile(options: Partial<EnvOptions>, absFilePath: string): void;
    static loadFromFile(absFilePath: string): EnvOptions;
    static getParamsString(options: Partial<EnvOptions>): string;
    finishCallback: () => any;
    config?: ENV_CONFIG;
    purpose?: string;
    /**
     * action is recursive
     */
    recursiveAction?: boolean;
    isCiProcess?: boolean;
    container: Partial<EnvOptionsContainer>;
    /**
     * @deprecated everything automatically handled by taon
     */
    ports: Partial<EnvOptionsPorts>;
    docker: Partial<EnvOptionsDocker>;
    release: Partial<EnvOptionsRelease>;
    init: Partial<EnvOptionsInit>;
    build: Partial<EnvOptionsBuild>;
    /**
     * Use this only when you are not using SSR
     */
    loading: Partial<EnvOptionsLoading>;
    copyToManager: Partial<EnvOptionsCopyToManager>;
    website: Partial<EnvOptionsWebsite>;
    readonly name?: CoreModels__NS__EnvironmentNameTaon;
    readonly currentProjectName?: string;
    readonly currentProjectType?: CoreModels__NS__LibType;
    readonly appId?: string;
    readonly buildInfo?: {
        hash?: string;
        date?: Date;
    };
    protected constructor(options?: Partial<EnvOptions>);
    applyFieldsFrom(override?: Partial<EnvOptions>): void;
    saveToFile(absFilePath: string): void;
    loadFromFile(absFilePath: string): void;
    clone(override?: Partial<EnvOptions>, options?: {
        skipPreservingFinishCallback?: boolean;
    }): EnvOptions<ENV_CONFIG>;
}
/**
 * Purpose of this dummy is to have all properties
 * when generating environments
 */
declare const EnvOptionsDummyWithAllProps: EnvOptions<Record<string, string | number | boolean>>;
declare const allPathsEnvConfig: string[];

declare const whatToLinkFromCore: 'src' | 'src/lib';
/**
 *  '' - when whatToLinkFromCore is src
 *  'lib' - when whatToLinkFromCore is src/lib
 *  'deep/folder' - when whatToLinkFromCore is src/deep/folder
 */
declare const whatToLinkFromCoreDeepPart: string;
declare const keysMap: Required<{ [key in keyof DeploymentReleaseData]: string; }>;
declare const dirnameFromSourceToProject: (linkToSource: string) => string;
declare const DUMMY_LIB = "@lib";
declare const DOCKER_COMPOSE_FILE_NAME = "docker-compose.yml";
declare const DOCKER_FOLDER = "docker";
declare const BASE_TEMP_DOCKER_FOLDER = "tmp-docker";
declare const DOCKER_TEMPLATES = "docker-templates";
declare const ACTIVE_CONTEXT = "ACTIVE_CONTEXT";
declare const friendlyNameForReleaseAutoConfigIsRequired = false;
declare const iconVscode128Basename = "icon-vscode.png";
declare const startJsFromBin = "start.js";
declare const startTsFromLib = "start-cli.ts";
declare const taonIgnore: string;
declare const DEBUG_WORD = "Debug/Start";
declare const GENERATE_CMD_COPY_TO_AI = "generate-cmd-copy-to-ai";
declare const scriptsCommands: string[];
declare const THIS_IS_GENERATED_STRING = "THIS FILE IS GENERATED - DO NOT MODIFY";
declare const THIS_IS_GENERATED_INFO_COMMENT = "// THIS FILE IS GENERATED - DO NOT MODIFY";
declare const defaultLicenseVscodePlugin = "MIT";
declare const OVERRIDE_FROM_TNP: string[];
declare const globalSpinner: {
    readonly instance: Pick<ora.Ora, "start" | "text" | "succeed" | "stop" | "fail">;
};
declare const startSpinner = "start-spinner";
declare const stopSpinner = "stop-spinner";
declare const failSpinner = "fail-spinner";
declare const succeedSpinner = "succeed-spinner";
declare const USE_IN_HOST_CONFIG_FULL_CONTEXT_PATH = false;
declare const MIGRATION_CONST_PREFIX = "MIGRATIONS_CLASSES_FOR_";
declare let taonUsingBundledCliMode: boolean;

declare const UNIT_TEST_TIMEOUT = 30000;
declare const INTEGRATION_TEST_TIMEOUT = 30000;
declare const USE_MIGRATIONS_DATA_IN_HOST_CONFIG = false;
declare const COMPILATION_COMPLETE_LIB_NG_BUILD = "Compilation complete. Watching for file changes";
declare const COMPILATION_COMPLETE_APP_NG_SERVE = "Compiled successfully";
declare const COMPILATION_COMPLETE_TSC = "Found 0 errors. Watching for file changes";
declare const DEFAULT_FRAMEWORK_VERSION: CoreModels__NS__FrameworkVersion;
declare let taonRepoPathUserInUserDir: string;
declare const taonBasePathToGlobalDockerTemplates: string;

/**
 * Prevents taon from checking core container when
 * calling itself from child process
 */
declare const skipCoreCheck = "--skipCoreCheck";
declare const argsToClear: string[];
declare const verbosePrefix = "-verbose";
declare const spinnerPrefix = "-spinner";
declare const linuxWatchPrefix = "-linuxWatch";
declare const websqlPrefix = "-websql";
declare const folder_shared_folder_info = "shared_folder_info.txt";
declare const taonConfigSchemaJsonStandalone = "taon-config-standalone.schema.json";
declare const taonConfigSchemaJsonContainer = "taon-config-container.schema.json";
declare const TEMP_DOCS = "tmp-documentation";
declare const HOST_BACKEND_PORT = "HOST_BACKEND_PORT";
declare const tmp_HOST_BACKEND_PORT = ".taon/libs-apps-ports/HOST_BACKEND_PORT";
declare const FRONTEND_WEBSQL_APP_PORT = "FRONTEND_WEBSQL_APP_PORT";
declare const tmp_FRONTEND_WEBSQL_APP_PORT = ".taon/libs-apps-ports/FRONTEND_WEBSQL_APP_PORT";
declare const FRONTEND_NORMAL_APP_PORT = "FRONTEND_NORMAL_APP_PORT";
declare const tmp_FRONTEND_NORMAL_APP_PORT = ".taon/libs-apps-ports/FRONTEND_NORMAL_APP_PORT";
declare const FRONTEND_NORMAL_ELECTRON_PORT = "FRONTEND_NORMAL_ELECTRON_PORT";
declare const tmp_FRONTEND_NORMAL_ELECTRON_PORT = ".taon/libs-apps-ports/FRONTEND_NORMAL_ELECTRON_PORT";
declare const DEFAULT_PORT: {
    DIST_SERVER_DOCS: number;
    APP_BUILD_LOCALHOST: number;
    SERVER_LOCALHOST: number;
    DEBUGGING_CLI_TOOL: number;
    DEBUGGING_ELECTRON: number;
};
declare const docsConfigJsonFileName = "docs-config.jsonc";
declare const docsConfigSchema = "docs-config.schema.json";
declare const customDefaultCss = "custom-default.css";
declare const customDefaultJs = "custom-default.js";
declare const frameworkBuildFolders: string[];
declare const envTs = "env.ts";
declare const environmentsFolder = "environments";
declare const coreRequiredEnvironments: CoreModels__NS__EnvironmentNameTaon[];
/**
 * @deprecated not needed probably
 */
declare const result_packages_json = "result-packages.json";
declare const readmeMdMainProject = "README.md";
declare const tmpIsomorphicPackagesJson = "tmp-isomorphic-packages.json";
/**
 * If exist - copy manager will clean copy bundled package to destinations
 */
declare const tmpAlreadyStartedCopyManager = "tmp-already-started-copy-manager";
declare const tmpAllAssetsLinked = "tmp-all-assets-linked";
/**
 * Destination place for all taon processes (tsc, ng build, etc)
 * From this folder code is copied to final destinations node_modules
 */
declare const tmpLocalCopytoProjDist = "tmp-local-copyto-proj-dist";
/**
 * Folder where tmpSrdDist code is cutted file by file before publishing
 */
declare const tmpCutReleaseSrcDist = "tmp-cut-release-src-dist";
/**
 * Folder where tmpSrdDist code is cutted file by file before publishing (websql version)
 */
declare const tmpCutReleaseSrcDistWebsql = "tmp-cut-release-src-dist-websql";
/**
 * Temporary folder for base href overwrite during build
 * (taon library build sets it)
 */
declare const tmpBaseHrefOverwrite = "tmp-base-href-overwrite";
/**
 * Temporary folder for vscode project files
 */
declare const tmpVscodeProj = "tmp-vscode-proj";
/**
 * Taon code transformed for backend
 */
declare const tmpSourceDist = "tmp-source-dist";
/**
 * Taon code transformed for backend in websql mode
 * (this code is probably never used)
 */
declare const tmpSourceDistWebsql = "tmp-source-dist-websql";
/**
 * Taon code transformed for browser
 */
declare const tmpSrcDist = "tmp-src-dist";
/**
 * Taon code transformed for browser in websql mode
 */
declare const tmpSrcDistWebsql = "tmp-src-dist-websql";
/**
 * Taon code transformed for browser (angular app uses this)
 */
declare const tmpSrcAppDist = "tmp-src-app-dist";
/**
 * Taon code transformed for browser (angular app in websql uses this)
 */
declare const tmpSrcAppDistWebsql = "tmp-src-app-dist-websql";
declare const defaultConfiguration = "defaultConfiguration";
declare const mainProjectSubProjects = "sub-projects";
declare enum TempalteSubprojectType {
    TAON_STRIPE_CLOUDFLARE_WORKER = "taon-stripe-cloudflare-worker",
    TAON_YT_CLOUDFLARE_WORKER = "taon-yt-cloudflare-worker"
}
declare const TempalteSubprojectTypeArr: TempalteSubprojectType[];
declare const TemplateSubprojectDbPrefix: {
    "taon-stripe-cloudflare-worker": string;
    "taon-yt-cloudflare-worker": string;
};
declare enum TempalteSubprojectGroup {
    KEY_VALUE_FAST_WORKER_DATABASE = "key-value-fast-worker-database"
}
declare const TempalteSubprojectTypeGroup: {
    "taon-stripe-cloudflare-worker": TempalteSubprojectGroup;
    "taon-yt-cloudflare-worker": TempalteSubprojectGroup;
};
/**
 * template folders from isomorphic lib
 */
declare enum TemplateFolder {
    /**
     * Core project for angular app webapp, library and electron app
     */
    templateApp = "template-app",
    templatesSubprojects = "templates-subprojects"
}
declare enum AngularJsonTaskName {
    ANGULAR_APP = "app",
    ELECTRON_APP = "angular-electron"
}
declare enum CoreAssets {
    sqlWasmFile = "sql-wasm.wasm",
    mainFont = "flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2"
}
declare const dockerTemplatesFolder = "docker-templates";
declare enum DockerTemplatesFolders {
    ANGULAR_APP_NODE = "angular-app-node",
    ANGULAR_APP_SSR_NODE = "angular-app-ssr-node",
    BACKEND_APP_NODE = "backend-app-node",
    DATABASE_MYSQL = "database-mysql"
}
declare enum CoreNgTemplateFiles {
    sqlJSLoaderTs = "sqljs-loader.ts",
    SERVER_TS = "server.ts",
    JEST_CONFIG_JS = "jest.config.js",
    SETUP_JEST_TS = "setupJest.ts",
    JEST_GLOBAL_MOCKS_TS = "jestGlobalMocks.ts",
    NG_PACKAGE_JSON = "ng-package.json",
    PACKAGE_JSON = "package.json",// fileName.package_json,
    ANGULAR_JSON = "angular.json",// fileName.angular_json,
    INDEX_HTML_NG_APP = "index.html",
    FAVICON_ICO = "favicon.ico",
    WEBMANIFEST_JSON = "manifest.webmanifest"
}
declare enum TaonGeneratedFiles {
    BUILD_INFO_MD = "BUILD-INFO.md",
    build_info_generated_ts = "build-info._auto-generated_.ts",
    index_generated_ts = "index._auto-generated_.ts",
    BUILD_INFO_AUTO_GENERATED_JS = "build-info._auto-generated_.js",
    MIGRATIONS_INFO_MD = "migrations-info.md",
    MOCHA_TESTS_INFO_MD = "mocha-tests-info.md",
    SHARED_FOLDER_INFO_TXT = "shared_folder_info.txt",
    APP_HOSTS_TS = "app.hosts.ts",
    LAUNCH_JSON = "launch.json",
    LAUNCH_BACKUP_JSON = "launch-backup.json",
    VARS_SCSS = "vars.scss",
    LIB_INFO_MD = "lib-info.md",
    APP_FOLDER_INFO_MD = "app-folder-info.md"
}
declare const DS_Store = ".DS_Store";
declare enum TaonGeneratedFolders {
    ENV_FOLDER = "env",
    COMPILED = "compiled"
}
declare const splitNamespacesJson = "split-namespaces.json";
declare const reExportJson = "re-export.json";
/**
 * Main project /dist folder
 */
declare const nodeModulesMainProject: string;
declare const nodeModulesSubPorject: string;
/**
 * Main project /dist-nocutsrc folder (d.ts files without code cutting)
 */
declare const distNoCutSrcMainProject = "dist-nocutsrc";
/**
 * Main project /dist folder
 */
declare const distMainProject: string;
/**
 * Vscode project dist folder
 */
declare const distVscodeProj: string;
/**
 * Electron project dist folder
 */
declare const distElectronProj: string;
/**
 * Normal angular app build
 */
declare const distFromNgBuild: string;
/**
 * Dist from sass loader
 */
declare const distFromSassLoader: string;
declare const electronNgProj = "electron";
declare const combinedDocsAllMdFilesFolder = "allmdfiles";
/**
 * Vscode project dist folder
 */
declare const outVscodeProj: string;
/**
 * Main project /docs folder
 */
declare const docsMainProject: string;
/**
 * Main project /bin folder
 */
declare const binMainProject: string;
/**
 * Main project /src folder
 */
declare const srcMainProject: string;
/**
 * src from template proxy project
 */
declare const srcNgProxyProject: string;
/**
 * each taon import ends with /src
 */
declare const srcFromTaonImport: string;
/**
 * each taon import ends with /src
 */
declare const srcDtsFromNpmPackage = "src.d.ts";
declare const srcJSFromNpmPackage = "src.js";
declare const myLibFromNgProject = "my-lib";
declare const externalLibsFromNgProject = "external-libs";
/**
 * projects/my-lib form angular lib template
 */
declare const projectsFromNgTemplate: string;
/**
 * @deprecated special place in standalone project for projects
 */
declare const projectsFromMainProject: string;
/**
 * Main project app folder from /src/app folder
 */
declare const appFromSrc: string;
/**
 * Generated app inside angular app (comes from /src/app folder)
 */
declare const appFromSrcInsideNgApp: string;
declare const libTypeString: string;
declare const browserTypeString: string;
declare const websqlTypeString: string;
/**
 * Main project lib folder from /src/lib folder
 */
declare const libFromSrc: string;
/**
 * Lib from taon import
 */
declare const libFromImport: string;
/**
 * Lib from dist/lib
 */
declare const libFromCompiledDist: string;
/**
 * Lib from npm packages
 */
declare const libFromNpmPackage: string;
/**
 * lib from ng projects
 */
declare const libFromNgProject: string;
/**
 * Main project tests folder from /src/tests folder
 */
declare const testsFromSrc: string;
/**
 * Main project assets from /src/assets folder
 */
declare const assetsFromSrc: string;
/**
 * Assets stored in taon isomorphic npm package with
 */
declare const assetsFromNpmLib: string;
/**
 * Main project assets from /tmp-*\/src/assets folder
 */
declare const assetsFromTempSrc: string;
/**
 * Assets from ng template project
 */
declare const assetsFromNgProj: string;
/**
 * Assets from npm package
 */
declare const assetsFromNpmPackage: string;
/**
 * Shared from assets from /TTTTTTTTOOOOOOOO________RRRRRRRREEEEEEEEMMMMMMMMOOOOOOOOVVVVVVVVEEEEEEEEassets/assets-for/tnp/assets/shared folder
 */
declare const sharedFromAssets: string;
/**
 * Generated folder in assets from /TTTTTTTTOOOOOOOO________RRRRRRRREEEEEEEEMMMMMMMMOOOOOOOOVVVVVVVVEEEEEEEEassets/assets-for/tnp/assets/generated folder
 */
declare const generatedFromAssets: string;
/**
 * Generated pwa assets from /TTTTTTTTOOOOOOOO________RRRRRRRREEEEEEEEMMMMMMMMOOOOOOOOVVVVVVVVEEEEEEEEassets/assets-for/tnp/assets/generated/pwa folder
 */
declare const pwaGeneratedFolder = "pwa";
/**
 * Generated assets-for folder
 */
declare const assetsFor = "assets-for";
/**
 * @deprecated it was probably needed for old container build
 * Folder for all browser libs
 */
declare const libs: string;
declare enum BundledFiles {
    CNAME = "CNAME",
    README_MD = "README.md",
    CLI_README_MD = "CLI-README.md",
    INDEX_HTML = "index.html"
}
declare enum AngularJsonAppOrElectronTaskName {
    developmentSsr = "development",
    productionSsr = "production",
    developmentStatic = "development-static",
    productionStatic = "production-static"
}
declare const AngularJsonAppOrElectronTaskNameResolveFor: (envOptions: EnvOptions) => AngularJsonAppOrElectronTaskName;
declare enum AngularJsonLibTaskName {
    development = "development",
    production = "production"
}
declare const AngularJsonLibTaskNameResolveFor: (envOptions: EnvOptions) => AngularJsonLibTaskName;
declare enum BundledDocsFolders {
    VERSION = "version"
}
declare enum TaonCommands {
    NPM_RUN_TSC = "npm-run tsc",
    NPM_RUN_NG = "npm-run ng",
    NG = "ng"
}
declare const appTsFromSrc = "app.ts";
declare const appAutoGenDocsMd = "app.auto-gen-docs.md";
declare const appAutoGenJs = "app.auto-gen-ver.js";
declare const appJsBackend = "app.js";
declare const appScssFromSrc = "app.scss";
declare const globalScssFromSrc = "global.scss";
declare const ngProjectStylesScss = "styles.scss";
declare const appElectronTsFromSrc = "app.electron.ts";
declare const appVscodeTsFromSrc = "app.vscode.ts";
declare const appVscodeJSFromBuild = "app.vscode.js";
declare enum TaonFileExtension {
    DOT_WORKER_TS = ".worker.ts",
    DOT_CONTEXT_TS = ".context.ts"
}
/**
 * ng build for library from /src/lib
 */
declare const tmpLibsForDist = "tmp-libs-for-dist";
/**
 * ng build for library from /src/lib (websql code)
 */
declare const tmpLibsForDistWebsql = "tmp-libs-for-dist-websql";
/**
 * normal angular app build
 */
declare const tmpAppsForDist = "tmp-apps-for-dist";
/**
 * websql angular app build
 */
declare const tmpAppsForDistWebsql = "tmp-apps-for-dist-websql";
/**
 * electron angular app build
 */
declare const tmpAppsForDistElectron = "tmp-apps-for-dist-electron";
declare const tmpAppsForDistElectronWebsql = "tmp-apps-for-dist-websql-electron";
/**
 * Dummy auto generated /src/index.ts
 */
declare const indexTsFromSrc: string;
/**
 * Entry point for angular lib from /src/lib/index.ts
 */
declare const indexTsFromLibFromSrc: string;
/**
 * Entry point for scss from /src/index.scss
 */
declare const indexScssFromSrc: string;
/**
 * Index for autogenerated migrations /src/migrations/index.ts
 */
declare const indexTsFromMigrationsFromSrc: string;
/**
 * Entry point for scss from /src/lib/index.scss
 */
declare const indexScssFromSrcLib = "index.scss";
/**
 *
 * @param appForLib if true code is for angular (ng server/build) app build, false for lib ng build
 * @param websql if true websql version
 * @returns relative path to temp browser source folder
 */
declare function tempSourceFolder(appForLib: boolean, websql: boolean, prod?: boolean): string;
declare const ENV_INJECT_COMMENT = "<!--ENV_INJECT-->";
declare const isomorphicPackagesJsonKey = "isomorphicPackages";
declare const browserMainProject: string;
declare const browserFromCompiledDist: string;
declare const browserNgBuild: string;
declare const browserFromImport: string;
declare const browserNpmPackage: string;
declare const websqlMainProject: string;
declare const websqlFromCompiledDist: string;
declare const websqlFromImport: string;
declare const websqlNpmPackage: string;
declare const clientCodeVersionFolder: string[];
declare const notAllowedAsPacakge: string[];
declare const MESSAGES: {
    SHUT_DOWN_FOLDERS_AND_DEBUGGERS: string;
};
declare const localReleaseMainProject = "local_release";
declare const dotInstallDate = ".install-date";
declare const KV_DATABASE_ONLINE_NAME = "KV_DATABASE_ONLINE_NAME";
declare const dotVscodeMainProject = ".vscode";
declare const indexTsInSrcForWorker = "src/index.ts";
declare const wranglerJsonC = "wrangler.jsonc";
declare const packageJsonLockMainProject: string;
declare const packageJsonLockSubProject: string;
declare const yarnLockMainProject: string;
declare const packageJsonMainProject: string;
declare const packageJsonSubProject: string;
declare const packageJsonNpmLib: string;
declare const packageJsonVscodePlugin: string;
declare const packageJsonNpmLibAngular: string;
declare const packageJsonNgProject: string;
declare const packageJsonLibDist: string;
declare const tsconfigJsonMainProject = "tsconfig.json";
declare const tsconfigNgProject = "tsconfig.json";
declare const tsconfigSubProject = "tsconfig.json";
declare const tsconfigSpecNgProject = "tsconfig.spec.json";
declare const tsconfigSpecJsonMain = "tsconfig.spec.json";
/**
 * TODO not used?
 */
declare const tsconfigJsonBrowserMainProject = "tsconfig.browser.json";
declare const tsconfigBackendDistJson = "tsconfig.backend.dist.json";
declare const tsconfigBackendDistJson_PROD = "tsconfig.backend.dist.prod.json";
declare const tsconfigForSchemaJson = "tsconfig-for-schema.json";
declare const tsconfigJsonIsomorphicMainProject = "tsconfig.isomorphic.json";
declare const dotNpmrcMainProject: string;
declare const dotGitIgnoreMainProject: string;
declare const dotNpmIgnoreMainProject: string;
declare const webpackConfigJsMainProject = "webpack.config.js";
declare const esLintCustomRulesMainProject = "eslint-rules";
declare const esLintConfigJsonMainProject = "eslint.config.ts";
declare const vitestConfigJsonMainProject = "vitest.config.ts";
declare const esLintRuleNoNamespaceReExport = "eslint-rules/no-namespace-reexport.ts";
declare const runJsMainProject = "run.js";
declare const indexDtsMainProject: string;
declare const indexDtsNpmPackage: string;
declare const indexJSNpmPackage: string;
declare const indexJSElectronDist: string;
declare const indexProdJs = "index-prod.js";
declare const cliTsFromSrc = "cli.ts";
declare const cliJSNpmPackage = "cli.js";
declare const cliJSMapNpmPackage = "cli.js.map";
declare const cliDtsNpmPackage = "cli.d.js";
declare const indexJsMainProject: string;
declare const indexJsMapMainProject: string;
declare const sourceLinkInNodeModules: string;
declare const taonJsonMainProject: string;
declare const updateVscodePackageJsonJsMainProject = "update-vscode-package-json.js";
declare const VERIFIED_BUILD_DATA = "VERIFIED-BUILD-DATA.jsonc";
interface TaonVerifiedBuild {
    commitHash: string;
    commitName: string;
    commitDate: string | Date;
}
declare const routes = "routes";
declare const databases = "databases";
declare const dotFileTemplateExt = ".filetemplate";
declare const dotEnvFile = ".env";
declare const suffixLatest = "-latest";
declare const prodSuffix = "-prod";
declare const releaseSuffix = "-release";
declare const debugSuffix = "--debug";
declare const debugBrkSuffix = "--debug-brk";
declare const inspectSuffix = "--inspect";
declare const inspectBrkSuffix = "--inspect-brk";
declare const containerPrefix = "container-";
declare const testEnvironmentsMainProject: string;
declare const ONLY_COPY_ALLOWED: string[];
/**
 * to prevent lib error when building with asserts
 */
declare const TO_REMOVE_TAG: string;
declare const ERR_MESSAGE_DEPLOYMENT_NOT_FOUND = "DEPLOYMENT_NOT_FOUND";
declare const ERR_MESSAGE_PROCESS_NOT_FOUND = "PROCESS_NOT_FOUND";
declare const migrationsFromLib: string;
declare const migration_index_autogenerated_ts = "migrations_index._auto-generated_.ts";
declare const migrationIndexAutogeneratedTsFileRelativeToSrcPath: string;

declare const vscodeExtMethods: (FRAMEWORK_NAME: string) => CommandType[];

type TriggerActionFn = (project?: Project, progres?: vscode.Progress<{
    message?: string;
    increment?: number;
}>, token?: vscode.CancellationToken) => Promise<any> | void;
declare function activateMenuTnp(context: vscode.ExtensionContext, vscode: typeof vscode, FRAMEWORK_NAME: string): {
    new (label: string, collapsibleState: vscode.TreeItemCollapsibleState, options?: {
        project?: Project;
        clickLinkFn?: (project: Project) => string;
        refreshLinkOnClick?: boolean;
        triggerActionOnClick?: TriggerActionFn;
        processTitle?: string;
        progressLocation?: vscode.ProgressLocation;
        boldLabel?: boolean;
        iconPath?: null | string | vscode.ThemeIcon | vscode.Uri | {
            light: string | vscode.Uri;
            dark: string | vscode.Uri;
        };
    }): {
        readonly clickLink: string | undefined;
        readonly project?: Project;
        readonly clickLinkFn?: (project: Project | undefined) => string;
        readonly refreshLinkOnClick?: boolean;
        readonly triggerActionOnClick?: TriggerActionFn;
        readonly processTitle?: string;
        readonly progressLocation: vscode.ProgressLocation;
        readonly label: string;
        readonly collapsibleState: vscode.TreeItemCollapsibleState;
        id?: string;
        iconPath?: string | vscode.IconPath;
        description?: string | boolean;
        resourceUri?: vscode.Uri;
        tooltip?: string | vscode.MarkdownString | undefined;
        command?: vscode.Command;
        contextValue?: string;
        accessibilityInformation?: vscode.AccessibilityInformation;
        checkboxState?: vscode.TreeItemCheckboxState | {
            readonly state: vscode.TreeItemCheckboxState;
            readonly tooltip?: string;
            readonly accessibilityInformation?: vscode.AccessibilityInformation;
        };
    };
};
declare function deactivateMenuTnp(): void;

declare function handleTaonRedirect(context: vscode.ExtensionContext, vscode: typeof vscode): void;

declare const vscodePatchingCodium: (context: ExtensionContext, vscode: typeof vscode) => void;

export { ACTIVE_CONTEXT, AngularJsonAppOrElectronTaskName, AngularJsonAppOrElectronTaskNameResolveFor, AngularJsonLibTaskName, AngularJsonLibTaskNameResolveFor, AngularJsonTaskName, BASE_TEMP_DOCKER_FOLDER, BundledDocsFolders, BundledFiles, COMPILATION_COMPLETE_APP_NG_SERVE, COMPILATION_COMPLETE_LIB_NG_BUILD, COMPILATION_COMPLETE_TSC, CoreAssets, CoreNgTemplateFiles, DEBUG_WORD, DEFAULT_FRAMEWORK_VERSION, DEFAULT_PORT, DOCKER_COMPOSE_FILE_NAME, DOCKER_FOLDER, DOCKER_TEMPLATES, DS_Store, DUMMY_LIB, Development, DockerTemplatesFolders, ENV_INJECT_COMMENT, ERR_MESSAGE_DEPLOYMENT_NOT_FOUND, ERR_MESSAGE_PROCESS_NOT_FOUND, EnvOptions, EnvOptionsDummyWithAllProps, FRONTEND_NORMAL_APP_PORT, FRONTEND_NORMAL_ELECTRON_PORT, FRONTEND_WEBSQL_APP_PORT, GENERATE_CMD_COPY_TO_AI, HOST_BACKEND_PORT, INTEGRATION_TEST_TIMEOUT, KV_DATABASE_ONLINE_NAME, MESSAGES, MIGRATION_CONST_PREFIX, ONLY_COPY_ALLOWED, OVERRIDE_FROM_TNP, Project, ReleaseArtifactTaon, ReleaseArtifactTaonNamesArr, ReleaseType, ReleaseTypeArr, ReleaseTypeWithDevelopmentArr, TEMP_DOCS, THIS_IS_GENERATED_INFO_COMMENT, THIS_IS_GENERATED_STRING, TO_REMOVE_TAG, TaonCommands, TaonFileExtension, TaonGeneratedFiles, TaonGeneratedFolders, TempalteSubprojectGroup, TempalteSubprojectType, TempalteSubprojectTypeArr, TempalteSubprojectTypeGroup, TemplateFolder, TemplateSubprojectDbPrefix, UNIT_TEST_TIMEOUT, USE_IN_HOST_CONFIG_FULL_CONTEXT_PATH, USE_MIGRATIONS_DATA_IN_HOST_CONFIG, VERIFIED_BUILD_DATA, activateMenuTnp, allPathsEnvConfig, appAutoGenDocsMd, appAutoGenJs, appElectronTsFromSrc, appFromSrc, appFromSrcInsideNgApp, appJsBackend, appScssFromSrc, appTsFromSrc, appVscodeJSFromBuild, appVscodeTsFromSrc, argsToClear, assetsFor, assetsFromNgProj, assetsFromNpmLib, assetsFromNpmPackage, assetsFromSrc, assetsFromTempSrc, binMainProject, browserFromCompiledDist, browserFromImport, browserMainProject, browserNgBuild, browserNpmPackage, browserTypeString, cliDtsNpmPackage, cliJSMapNpmPackage, cliJSNpmPackage, cliTsFromSrc, clientCodeVersionFolder, combinedDocsAllMdFilesFolder, containerPrefix, coreRequiredEnvironments, customDefaultCss, customDefaultJs, databases, deactivateMenuTnp, debugBrkSuffix, debugSuffix, defaultConfiguration, defaultLicenseVscodePlugin, dirnameFromSourceToProject, distElectronProj, distFromNgBuild, distFromSassLoader, distMainProject, distNoCutSrcMainProject, distVscodeProj, dockerBackendAppNode, dockerDatabaseMysql, dockerFrontendNginx, dockerTemplatesFolder, docsConfigJsonFileName, docsConfigSchema, docsMainProject, dotEnvFile, dotFileTemplateExt, dotGitIgnoreMainProject, dotInstallDate, dotNpmIgnoreMainProject, dotNpmrcMainProject, dotVscodeMainProject, electronNgProj, envTs, environmentsFolder, esLintConfigJsonMainProject, esLintCustomRulesMainProject, esLintRuleNoNamespaceReExport, externalLibsFromNgProject, failSpinner, folder_shared_folder_info, frameworkBuildFolders, friendlyNameForReleaseAutoConfigIsRequired, generatedFromAssets, globalScssFromSrc, globalSpinner, handleTaonRedirect, iconVscode128Basename, indexDtsMainProject, indexDtsNpmPackage, indexJSElectronDist, indexJSNpmPackage, indexJsMainProject, indexJsMapMainProject, indexProdJs, indexScssFromSrc, indexScssFromSrcLib, indexTsFromLibFromSrc, indexTsFromMigrationsFromSrc, indexTsFromSrc, indexTsInSrcForWorker, inspectBrkSuffix, inspectSuffix, isomorphicPackagesJsonKey, keysMap, libFromCompiledDist, libFromImport, libFromNgProject, libFromNpmPackage, libFromSrc, libTypeString, libs, linuxWatchPrefix, localReleaseMainProject, mainProjectSubProjects, migrationIndexAutogeneratedTsFileRelativeToSrcPath, migration_index_autogenerated_ts, migrationsFromLib, myLibFromNgProject, ngProjectStylesScss, nodeModulesMainProject, nodeModulesSubPorject, notAllowedAsPacakge, outVscodeProj, packageJsonLibDist, packageJsonLockMainProject, packageJsonLockSubProject, packageJsonMainProject, packageJsonNgProject, packageJsonNpmLib, packageJsonNpmLibAngular, packageJsonSubProject, packageJsonVscodePlugin, prodSuffix, projectsFromMainProject, projectsFromNgTemplate, pwaGeneratedFolder, reExportJson, readmeMdMainProject, releaseSuffix, result_packages_json, routes, runJsMainProject, scriptsCommands, sharedFromAssets, skipCoreCheck, sourceLinkInNodeModules, spinnerPrefix, splitNamespacesJson, srcDtsFromNpmPackage, srcFromTaonImport, srcJSFromNpmPackage, srcMainProject, srcNgProxyProject, startJsFromBin, startSpinner, startTsFromLib, stopSpinner, succeedSpinner, suffixLatest, taonBasePathToGlobalDockerTemplates, taonBuildInImages, taonConfigSchemaJsonContainer, taonConfigSchemaJsonStandalone, taonIgnore, taonJsonMainProject, taonRepoPathUserInUserDir, taonUsingBundledCliMode, tempSourceFolder, testEnvironmentsMainProject, testsFromSrc, tmpAllAssetsLinked, tmpAlreadyStartedCopyManager, tmpAppsForDist, tmpAppsForDistElectron, tmpAppsForDistElectronWebsql, tmpAppsForDistWebsql, tmpBaseHrefOverwrite, tmpCutReleaseSrcDist, tmpCutReleaseSrcDistWebsql, tmpIsomorphicPackagesJson, tmpLibsForDist, tmpLibsForDistWebsql, tmpLocalCopytoProjDist, tmpSourceDist, tmpSourceDistWebsql, tmpSrcAppDist, tmpSrcAppDistWebsql, tmpSrcDist, tmpSrcDistWebsql, tmpVscodeProj, tmp_FRONTEND_NORMAL_APP_PORT, tmp_FRONTEND_NORMAL_ELECTRON_PORT, tmp_FRONTEND_WEBSQL_APP_PORT, tmp_HOST_BACKEND_PORT, tsconfigBackendDistJson, tsconfigBackendDistJson_PROD, tsconfigForSchemaJson, tsconfigJsonBrowserMainProject, tsconfigJsonIsomorphicMainProject, tsconfigJsonMainProject, tsconfigNgProject, tsconfigSpecJsonMain, tsconfigSpecNgProject, tsconfigSubProject, updateVscodePackageJsonJsMainProject, verbosePrefix, vitestConfigJsonMainProject, vscodeExtMethods, vscodePatchingCodium, webpackConfigJsMainProject, websqlFromCompiledDist, websqlFromImport, websqlMainProject, websqlNpmPackage, websqlPrefix, websqlTypeString, whatToLinkFromCore, whatToLinkFromCoreDeepPart, wranglerJsonC, yarnLockMainProject };
export type { TaonDockerContainerConfig, TaonVerifiedBuild };