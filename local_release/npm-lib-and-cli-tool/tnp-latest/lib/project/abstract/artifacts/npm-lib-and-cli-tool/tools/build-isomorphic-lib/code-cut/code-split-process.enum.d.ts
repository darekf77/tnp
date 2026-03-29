import { UtilsTypescript } from 'tnp-helpers';
export declare const CallBackProcess: (fun: (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean) => (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
/**
 * TODO In progress documentation for whole code split process
 */
export declare namespace CodeSplitProcess {
    namespace Before {
        namespace Split {
            const ImportExport: {
                /**
                 * name => nameForNpmPackage
                 * my-lib => @my-org/my-lib
                 * my-lib => my-custom-npm-lib
                 */
                NAME_TO_NPM_NAME: (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
                WITH_LIB_TO_SRC: (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
                WITH_SOURCE_TO_SRC: (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
                NOTHING_TO_SRC: (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
                DEEP_TO_SHORT_SRC: (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
                BROWSER_TO_SRC: (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
                WEBSQL_TO_SRC: (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[], currentProjectName: string, currentProjectNpmName: string) => boolean;
            };
        }
    }
    namespace DURING {
        namespace BACKEND {
            const SPLIT: {
                FOR_APP_STANDALONE: (imp: UtilsTypescript.TsImportExport) => void;
                FOR_APP_ORGANIZATION: (imp: UtilsTypescript.TsImportExport) => void;
                FOR_LIB_STANDALONE: (imp: UtilsTypescript.TsImportExport) => void;
                FOR_LIB_ORGANIZATION: (imp: UtilsTypescript.TsImportExport) => void;
                FOR_FULL_DTS_STANDALONE: (imp: UtilsTypescript.TsImportExport) => void;
                FOR_FULL_DTS_ORGANIZATION: (imp: UtilsTypescript.TsImportExport) => void;
            };
        }
        namespace CLIENT {
            const SPLIT: {
                WEBSQL_FOR_LIB: (imp: UtilsTypescript.TsImportExport) => void;
                WEBSQL_FOR_APP: (imp: UtilsTypescript.TsImportExport) => void;
                BROWSER_FOR_LIB: (imp: UtilsTypescript.TsImportExport) => void;
                BROWSER_FOR_APP: (imp: UtilsTypescript.TsImportExport) => void;
            };
        }
    }
    namespace AFTER {
        const SPLIT: {
            MODULE_FOR_ORGANIZATION: string;
        };
    }
}