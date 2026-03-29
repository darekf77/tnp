import { UtilsTypescript } from 'tnp-helpers';
export declare class SplitFileProcess {
    private readonly fileContent;
    private readonly filePath;
    private readonly isomorphicLibraries;
    private readonly currentProjectName;
    private readonly currentProjectNpmName;
    _importExports: UtilsTypescript.TsImportExport[];
    get importExports(): UtilsTypescript.TsImportExport[];
    private rewriteFile;
    constructor(fileContent: string, filePath: string, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string);
    get content(): {
        modifiedContent: string;
        rewriteFile: boolean;
    };
    private processImportsExports;
    replaceInFile(fileContent: string, imports: UtilsTypescript.TsImportExport[], debug?: boolean): string;
}