import { UtilsTypescript } from 'tnp-helpers/src';
export const CallBackProcess = (
  fun: (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[]) => boolean,
) => {
  return fun;
};

/**
 * TODO In progress documentation for whole code split process
 */
export namespace CODE_SPLIT_PROCESS {
  //#region BEFORE
  export namespace BEFORE {
    export namespace SPLIT {
      export const IMPORT_EXPORT = {
        // my-lib/lib => my-lib/src
        WITH_LIB_TO_SRC: CallBackProcess(
          (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[]) => {
            if (
              imp.wrapInParenthesis(imp.packageName) + '/lib' ===
              imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile)
            ) {
              imp.embeddedPathToFileResult = imp.wrapInParenthesis(
                imp.cleanEmbeddedPathToFile + '/src',
              );
              return true;
            }
            return false;
          },
        ),
        // my-lib/source => my-lib/src
        WITH_SOURCE_TO_SRC: CallBackProcess(
          (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[]) => {
            // console.log('WITH_SOURCE_TO_SRC');
            if (
              imp.wrapInParenthesis(imp.packageName) + '/source' ===
              imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile)
            ) {
              imp.embeddedPathToFileResult = imp.wrapInParenthesis(
                imp.cleanEmbeddedPathToFile + '/src',
              );
              return true;
            }
            return false;
          },
        ),
        // my-lib => my-lib/src
        NOTHING_TO_SRC: CallBackProcess(
          (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[]) => {
            // console.log('NOTHING_TO_SRC');
            if (
              imp.wrapInParenthesis(imp.packageName) ===
              imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile)
            ) {
              imp.embeddedPathToFileResult = imp.wrapInParenthesis(
                imp.cleanEmbeddedPathToFile + '/src',
              );
              return true;
            }
            return false;
          },
        ),
        DEEP_TO_SHORT_SRC: CallBackProcess(
          (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[]) => {
            // console.log('DEEP_TO_SHORT_SRC');
            if (
              imp.cleanEmbeddedPathToFile.replace(
                imp.packageName + '/src',
                '',
              ) !== ''
            ) {
              imp.embeddedPathToFileResult = imp.wrapInParenthesis(
                imp.packageName + '/src',
              );
              return true;
            }
            return false;
          },
        ),
        BROWSER_TO_SRC: CallBackProcess(
          (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[]) => {
            return false; // TODO
          },
        ),
        WEBSQL_TO_SRC: CallBackProcess(
          (imp: UtilsTypescript.TsImportExport, isomorphicLibraries: string[]) => {
            return false; // TODO
          },
        ),
      };
    }
  }
  //#endregion

  //#region DURING
  export namespace DURING {
    export namespace BACKEND {
      export const SPLIT = {
        FOR_APP_STANDALONE: (imp: UtilsTypescript.TsImportExport) => {},
        FOR_APP_ORGANIZATION: (imp: UtilsTypescript.TsImportExport) => {},
        FOR_LIB_STANDALONE: (imp: UtilsTypescript.TsImportExport) => {},
        FOR_LIB_ORGANIZATION: (imp: UtilsTypescript.TsImportExport) => {},
        FOR_FULL_DTS_STANDALONE: (imp: UtilsTypescript.TsImportExport) => {},
        FOR_FULL_DTS_ORGANIZATION: (imp: UtilsTypescript.TsImportExport) => {},
      };
    }
    export namespace CLIENT {
      export const SPLIT = {
        WEBSQL_FOR_LIB: (imp: UtilsTypescript.TsImportExport) => {},
        WEBSQL_FOR_APP: (imp: UtilsTypescript.TsImportExport) => {},
        BROWSER_FOR_LIB: (imp: UtilsTypescript.TsImportExport) => {},
        BROWSER_FOR_APP: (imp: UtilsTypescript.TsImportExport) => {},
      };
    }
  }
  //#endregion

  //#region AFTER
  export namespace AFTER {
    export const SPLIT = {
      MODULE_FOR_ORGANIZATION: 'MODULE_FOR_ORGANIZATION',
    };
  }
  //#endregion
}
//#endregion
