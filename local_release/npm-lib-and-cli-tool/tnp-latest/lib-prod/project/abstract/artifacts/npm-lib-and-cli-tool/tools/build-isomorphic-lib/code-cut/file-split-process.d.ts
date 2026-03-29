import { UtilsTypescript__NS__TsImportExport } from 'tnp-helpers/lib-prod';
export declare class SplitFileProcess {
    private readonly fileContent;
    private readonly filePath;
    private readonly isomorphicLibraries;
    private readonly currentProjectName;
    private readonly currentProjectNpmName;
    _importExports: UtilsTypescript__NS__TsImportExport[];
    get importExports(): UtilsTypescript__NS__TsImportExport[];
    private rewriteFile;
    constructor(fileContent: string, filePath: string, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string);
    get content(): {
        modifiedContent: string;
        rewriteFile: boolean;
    };
    private processImportsExports;
    replaceInFile(fileContent: string, imports: UtilsTypescript__NS__TsImportExport[], debug?: boolean): string;
}
