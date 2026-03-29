export declare const TS_NOCHECK = "// @ts-nocheck";
/**
 * TODO QUICK_FIX: for typescript compiler doing wrong imports/exports in d.ts files
 * example in file base context.d.ts
 * readonly __refSync: import("taon").EndpointContext;
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
export declare class TypescriptDtsFixer {
    protected readonly isomorphicPackages: string[];
    static for(isomorphicPackages: string[]): TypescriptDtsFixer;
    private constructor();
    forBackendContent(content: string): string;
    /**
     * browserFolder = browser websql browser-prod websql-prod
     */
    forContent(content: string, browserFolder: string): string;
    /**
     *  fixing d.ts for (dist)/(browser|websql) when destination local project
     * @param absPathFolderLocationWithBrowserAdnWebsql usually dist
     * @param isTempLocalProj
     */
    processFolderWithBrowserWebsqlFolders(absPathFolderLocationWithBrowserAdnWebsql: string, browserwebsqlFolders: string[]): void;
    processFolder(absPathLocation: string, currentBrowserFolder: string): void;
    forFile(dtsFileAbsolutePath: string, currentBrowserFolder: string): void;
}
