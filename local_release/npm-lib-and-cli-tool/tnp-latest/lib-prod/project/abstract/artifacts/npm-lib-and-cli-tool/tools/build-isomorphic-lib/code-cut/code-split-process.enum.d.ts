import { UtilsTypescript__NS__TsImportExport } from 'tnp-helpers/lib-prod';
export declare const CallBackProcess: (fun: (imp: UtilsTypescript__NS__TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean) => (imp: UtilsTypescript__NS__TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
/**
 * TODO In progress documentation for whole code split process
 */
export declare const CodeSplitProcess__NS__Before__NS__Split__NS__ImportExport: {
    /**
     * name => nameForNpmPackage
     * my-lib => @my-org/my-lib
     * my-lib => my-custom-npm-lib
     */
    NAME_TO_NPM_NAME: (imp: UtilsTypescript__NS__TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
    WITH_LIB_TO_SRC: (imp: UtilsTypescript__NS__TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
    WITH_SOURCE_TO_SRC: (imp: UtilsTypescript__NS__TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
    NOTHING_TO_SRC: (imp: UtilsTypescript__NS__TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
    DEEP_TO_SHORT_SRC: (imp: UtilsTypescript__NS__TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
    BROWSER_TO_SRC: (imp: UtilsTypescript__NS__TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
    WEBSQL_TO_SRC: (imp: UtilsTypescript__NS__TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
};
export declare const CodeSplitProcess__NS__DURING__NS__BACKEND__NS__SPLIT: {
    FOR_APP_STANDALONE: (imp: UtilsTypescript__NS__TsImportExport) => void;
    FOR_APP_ORGANIZATION: (imp: UtilsTypescript__NS__TsImportExport) => void;
    FOR_LIB_STANDALONE: (imp: UtilsTypescript__NS__TsImportExport) => void;
    FOR_LIB_ORGANIZATION: (imp: UtilsTypescript__NS__TsImportExport) => void;
    FOR_FULL_DTS_STANDALONE: (imp: UtilsTypescript__NS__TsImportExport) => void;
    FOR_FULL_DTS_ORGANIZATION: (imp: UtilsTypescript__NS__TsImportExport) => void;
};
export declare const CodeSplitProcess__NS__DURING__NS__CLIENT__NS__SPLIT: {
    WEBSQL_FOR_LIB: (imp: UtilsTypescript__NS__TsImportExport) => void;
    WEBSQL_FOR_APP: (imp: UtilsTypescript__NS__TsImportExport) => void;
    BROWSER_FOR_LIB: (imp: UtilsTypescript__NS__TsImportExport) => void;
    BROWSER_FOR_APP: (imp: UtilsTypescript__NS__TsImportExport) => void;
};
export declare const CodeSplitProcess__NS__AFTER__NS__SPLIT: {
    MODULE_FOR_ORGANIZATION: string;
};
