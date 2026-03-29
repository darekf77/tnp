import { ReplaceOptionsExtended } from 'isomorphic-region-loader';
import { UtilsTypescript } from 'tnp-helpers';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
/**
 * Allow imports or exports with '/src' at the end
 *
 * import { ProcessController, Process } from '@codete-ngrx-quick-start/shared/src';
 * loadChildren: () => import(`@codete-ngrx-quick-start/realtime-process/src`)
 *
 * to be changed into:
 *
 * import { ProcessController, Process } from '@codete-ngrx-quick-start/shared/src';
 * loadChildren: () => import(`@codete-ngrx-quick-start/realtime-process/src`)
 *
 */
export declare class BrowserCodeCut {
    /**
     * ex.< project location >/src/something.ts
     */
    protected absSourcePathFromSrc: string;
    /**
     * ex. < project location >/tmpSrcDistWebsql/my/relative/path.ts
     */
    protected absFileSourcePathBrowserOrWebsql: string;
    /**
     * ex. < project location >/tmpSrcDist
     */
    protected absPathTmpSrcDistFolder: string;
    private project;
    private buildOptions;
    static debugFile: any[];
    /**
     * slighted modifed app release dist
     */
    protected absFileSourcePathBrowserOrWebsqlAPPONLY: string;
    private rawContentForBrowser;
    private rawContentForAPPONLYBrowser;
    private rawContentBackend;
    static recreateAppTsPresentationFiles: () => void;
    get recreateAppTsPresentationFiles(): () => void;
    set recreateAppTsPresentationFiles(v: () => void);
    get importExportsFromOrgContent(): UtilsTypescript.TsImportExport[];
    private splitFileProcess;
    /**
     * ex. path/to/file-somewhere.ts or assets/something/here
     * in src or tmpSrcDist etc.
     */
    private readonly relativePath;
    private readonly isWebsqlMode;
    private readonly isAssetsFile;
    private readonly absoluteBackendDestFilePath;
    private readonly debug;
    private readonly nameForNpmPackage;
    private readonly isLinuxWatchModeAllowde;
    constructor(
    /**
     * ex.< project location >/src/something.ts
     */
    absSourcePathFromSrc: string, 
    /**
     * ex. < project location >/tmpSrcDistWebsql/my/relative/path.ts
     */
    absFileSourcePathBrowserOrWebsql: string, 
    /**
     * ex. < project location >/tmpSrcDist
     */
    absPathTmpSrcDistFolder: string, project: Project, buildOptions: EnvOptions);
    processFile({ fileRemovedEvent, regionReplaceOptions, isCuttableFile, }: {
        fileRemovedEvent?: boolean;
        isCuttableFile: boolean;
        regionReplaceOptions: ReplaceOptionsExtended;
    }): void;
    private initAndSaveCuttableFile;
    private initAndSaveAssetFile;
    rawOrginalContent: string;
    private init;
    get projectOwnSmartPackages(): string[];
    private get isEmptyBrowserFile();
    private get isEmptyModuleBackendFile();
    private saveEmptyFile;
    private saveNormalBrowserFile;
    private REPLACERegionsFromTsImportExport;
    private REPLACERegionsForIsomorphicLib;
    private processAssetsLinksForApp;
    private save;
    private static initialWarning;
    get initialWarnings(): {};
    private changeNpmNameToLocalLibNamePath;
    private replaceAssetsPath;
}