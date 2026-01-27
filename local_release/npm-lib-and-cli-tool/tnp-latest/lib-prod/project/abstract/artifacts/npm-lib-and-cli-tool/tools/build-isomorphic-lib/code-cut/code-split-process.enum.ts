import { UtilsTypescript__NS__addBelowPlaceholder, UtilsTypescript__NS__addOrUpdateImportIfNotExists, UtilsTypescript__NS__calculateRelativeImportPath, UtilsTypescript__NS__clearRequireCacheRecursive, UtilsTypescript__NS__collapseFluentChains, UtilsTypescript__NS__DeepWritable, UtilsTypescript__NS__eslintFixAllFilesInsideFolder, UtilsTypescript__NS__eslintFixAllFilesInsideFolderAsync, UtilsTypescript__NS__eslintFixFile, UtilsTypescript__NS__ExportedThirdPartyNamespaces, UtilsTypescript__NS__ExportInfo, UtilsTypescript__NS__exportsFromContent, UtilsTypescript__NS__exportsFromFile, UtilsTypescript__NS__exportsRedefinedFromContent, UtilsTypescript__NS__exportsRedefinedFromFile, UtilsTypescript__NS__extractAngularComponentSelectors, UtilsTypescript__NS__extractClassNameFromString, UtilsTypescript__NS__extractClassNamesFromFile, UtilsTypescript__NS__extractDefaultClassNameFromFile, UtilsTypescript__NS__extractDefaultClassNameFromString, UtilsTypescript__NS__extractRenamedImportsOrExport, UtilsTypescript__NS__fixHtmlTemplatesInDir, UtilsTypescript__NS__FlattenMapping, UtilsTypescript__NS__formatAllFilesInsideFolder, UtilsTypescript__NS__formatFile, UtilsTypescript__NS__GatheredExportsMap, UtilsTypescript__NS__gatherExportsMapFromIndex, UtilsTypescript__NS__getCleanImport, UtilsTypescript__NS__getTaonContextFromContent, UtilsTypescript__NS__getTaonContextsNamesFromFile, UtilsTypescript__NS__hoistTrailingChainComments, UtilsTypescript__NS__injectImportsIntoImportsRegion, UtilsTypescript__NS__migrateFromNgModulesToStandaloneV21, UtilsTypescript__NS__normalizeBrokenLines, UtilsTypescript__NS__NSSPLITNAMESAPCE, UtilsTypescript__NS__ParsedTsDiagnostic, UtilsTypescript__NS__parseTsDiagnostic, UtilsTypescript__NS__recognizeImportsFromContent, UtilsTypescript__NS__recognizeImportsFromFile, UtilsTypescript__NS__RedefinedExportInfo, UtilsTypescript__NS__refactorClassToNamespace, UtilsTypescript__NS__removeRegionByName, UtilsTypescript__NS__removeTaggedArrayObjects, UtilsTypescript__NS__removeTaggedImportExport, UtilsTypescript__NS__removeTaggedLines, UtilsTypescript__NS__RenamedImportOrExport, UtilsTypescript__NS__replaceImportNamespaceWithWithExplodedNamespace, UtilsTypescript__NS__replaceNamespaceWithLongNames, UtilsTypescript__NS__setValueToVariableInTsFile, UtilsTypescript__NS__splitNamespaceForContent, UtilsTypescript__NS__splitNamespaceForFile, UtilsTypescript__NS__SplitNamespaceResult, UtilsTypescript__NS__transformComponentStandaloneOption, UtilsTypescript__NS__transformFlatImports, UtilsTypescript__NS__TsImportExport, UtilsTypescript__NS__updateSplitNamespaceReExports, UtilsTypescript__NS__updateSplitNamespaceResultMapReplaceObj, UtilsTypescript__NS__wrapContentClassMembersDecoratorsWithRegion, UtilsTypescript__NS__wrapFirstImportsInImportsRegion, UtilsTypescript__NS__wrapWithComment } from 'tnp-helpers/lib-prod';

import {
  DUMMY_LIB,
  libFromImport,
  sourceLinkInNodeModules,
  srcFromTaonImport,
} from '../../../../../../../constants';
export const CallBackProcess = (
  fun: (
    imp: UtilsTypescript__NS__TsImportExport,
    isomorphicLibraries: string[],
    currentProjectName: string,
    currentProjectNpmName: string,
  ) => boolean,
) => {
  return fun;
};

/**
 * TODO In progress documentation for whole code split process
 */
//namespace CodeSplitProcess

  //#region BEFORE
  //namespace CodeSplitProcess__NS__Before

    //namespace CodeSplitProcess__NS__Before__NS__Split

      export const CodeSplitProcess__NS__Before__NS__Split__NS__ImportExport = {
        // AT_LIB_TO_NPM_NAME: CallBackProcess(
        //   (
        //     imp: UtilsTypescript__NS__TsImportExport,
        //     isomorphicLibraries: string[],
        //     currentProjectName: string,
        //     currentProjectNpmName: string,
        //   ) => {
        //     // if (imp.cleanEmbeddedPathToFile.startsWith(`${DUMMY_LIB}`)) {
        //     //   console.warn(
        //     //     `KURWA  ${currentProjectName}, currentProjectNpmName: ${currentProjectNpmName}. c;eanEmbeddedPathToFile: ${imp.cleanEmbeddedPathToFile}`,
        //     //   );
        //     // }
        //     if (imp.cleanEmbeddedPathToFile.startsWith(`${DUMMY_LIB}/`)) {
        //       // console.warn(
        //       //   `2 currentProjectName: ${currentProjectName}, currentProjectNpmName: ${currentProjectNpmName}`,
        //       // );
        //       imp.embeddedPathToFileResult = imp.wrapInParenthesis(
        //         imp.cleanEmbeddedPathToFile.replace(
        //           `${DUMMY_LIB}/`,
        //           `${currentProjectNpmName}/`,
        //         ),
        //       );
        //       return true;
        //     }
        //     if (imp.cleanEmbeddedPathToFile === DUMMY_LIB) {
        //       // console.warn(
        //       //   `2 currentProjectName: ${currentProjectName}, currentProjectNpmName: ${currentProjectNpmName}`,
        //       // );
        //       imp.embeddedPathToFileResult = imp.wrapInParenthesis(
        //         imp.cleanEmbeddedPathToFile.replace(
        //           `${DUMMY_LIB}`,
        //           `${currentProjectNpmName}/src`,
        //         ),
        //       );
        //       return true;
        //     }

        //     return false;
        //   },
        // ),
        /**
         * name => nameForNpmPackage
         * my-lib => @my-org/my-lib
         * my-lib => my-custom-npm-lib
         */
        NAME_TO_NPM_NAME: CallBackProcess(
          (
            imp: UtilsTypescript__NS__TsImportExport,
            isomorphicLibraries: string[],
            currentProjectName: string,
            currentProjectNpmName: string,
          ) => {
            if (
              imp.cleanEmbeddedPathToFile.startsWith(`${currentProjectName}/`)
            ) {
              imp.embeddedPathToFileResult = imp.wrapInParenthesis(
                imp.cleanEmbeddedPathToFile.replace(
                  `${currentProjectName}/`,
                  `${currentProjectNpmName}/`,
                ),
              );
              return true;
            }
            return false;
          },
        ),
        // my-lib/lib => my-lib/src
        WITH_LIB_TO_SRC: CallBackProcess(
          (
            imp: UtilsTypescript__NS__TsImportExport,
            isomorphicLibraries: string[],
          ) => {
            if (
              imp.wrapInParenthesis(imp.packageName) + `/${libFromImport}` ===
              imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile)
            ) {
              imp.embeddedPathToFileResult = imp.wrapInParenthesis(
                imp.cleanEmbeddedPathToFile + `/${srcFromTaonImport}`,
              );
              return true;
            }
            return false;
          },
        ),
        // my-lib/source => my-lib/src
        WITH_SOURCE_TO_SRC: CallBackProcess(
          (
            imp: UtilsTypescript__NS__TsImportExport,
            isomorphicLibraries: string[],
          ) => {
            // console.log('WITH_SOURCE_TO_SRC');
            if (
              imp.wrapInParenthesis(imp.packageName) +
                `/${sourceLinkInNodeModules}` ===
              imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile)
            ) {
              imp.embeddedPathToFileResult = imp.wrapInParenthesis(
                imp.cleanEmbeddedPathToFile + `/${srcFromTaonImport}`,
              );
              return true;
            }
            return false;
          },
        ),
        // my-lib => my-lib/src
        NOTHING_TO_SRC: CallBackProcess(
          (
            imp: UtilsTypescript__NS__TsImportExport,
            isomorphicLibraries: string[],
            currentProjectName: string,
            currentProjectNpmName: string,
          ) => {
            // console.log('NOTHING_TO_SRC');
            if (
              imp.wrapInParenthesis(imp.packageName) ===
              imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile)
            ) {
              if (imp.packageName === DUMMY_LIB) {
                imp.embeddedPathToFileResult = imp.wrapInParenthesis(
                  currentProjectNpmName + `/${srcFromTaonImport}`,
                );
              } else {
                imp.embeddedPathToFileResult = imp.wrapInParenthesis(
                  imp.cleanEmbeddedPathToFile + `/${srcFromTaonImport}`,
                );
              }

              return true;
            }
            return false;
          },
        ),
        DEEP_TO_SHORT_SRC: CallBackProcess(
          (
            imp: UtilsTypescript__NS__TsImportExport,
            isomorphicLibraries: string[],
            currentProjectName: string,
            currentProjectNpmName: string,
          ) => {
            // console.log('DEEP_TO_SHORT_SRC');
            if (
              imp.cleanEmbeddedPathToFile.replace(
                imp.packageName + `/${srcFromTaonImport}`,
                '',
              ) !== ''
            ) {
              if (imp.packageName === DUMMY_LIB) {
                imp.embeddedPathToFileResult = imp.wrapInParenthesis(
                  currentProjectNpmName + `/${srcFromTaonImport}`,
                );
              } else {
                imp.embeddedPathToFileResult = imp.wrapInParenthesis(
                  imp.packageName + `/${srcFromTaonImport}`,
                );
              }

              return true;
            }
            return false;
          },
        ),
        BROWSER_TO_SRC: CallBackProcess(
          (
            imp: UtilsTypescript__NS__TsImportExport,
            isomorphicLibraries: string[],
          ) => {
            return false; // TODO
          },
        ),
        WEBSQL_TO_SRC: CallBackProcess(
          (
            imp: UtilsTypescript__NS__TsImportExport,
            isomorphicLibraries: string[],
          ) => {
            return false; // TODO
          },
        ),
      };
    
//end of namespace CodeSplitProcess__NS__Before__NS__Split

  
//end of namespace CodeSplitProcess__NS__Before

  //#endregion

  //#region DURING
  //namespace CodeSplitProcess__NS__DURING

    //namespace CodeSplitProcess__NS__DURING__NS__BACKEND

      export const CodeSplitProcess__NS__DURING__NS__BACKEND__NS__SPLIT = {
        FOR_APP_STANDALONE: (imp: UtilsTypescript__NS__TsImportExport) => {},
        FOR_APP_ORGANIZATION: (imp: UtilsTypescript__NS__TsImportExport) => {},
        FOR_LIB_STANDALONE: (imp: UtilsTypescript__NS__TsImportExport) => {},
        FOR_LIB_ORGANIZATION: (imp: UtilsTypescript__NS__TsImportExport) => {},
        FOR_FULL_DTS_STANDALONE: (imp: UtilsTypescript__NS__TsImportExport) => {},
        FOR_FULL_DTS_ORGANIZATION: (imp: UtilsTypescript__NS__TsImportExport) => {},
      };
    
//end of namespace CodeSplitProcess__NS__DURING__NS__BACKEND

    //namespace CodeSplitProcess__NS__DURING__NS__CLIENT

      export const CodeSplitProcess__NS__DURING__NS__CLIENT__NS__SPLIT = {
        WEBSQL_FOR_LIB: (imp: UtilsTypescript__NS__TsImportExport) => {},
        WEBSQL_FOR_APP: (imp: UtilsTypescript__NS__TsImportExport) => {},
        BROWSER_FOR_LIB: (imp: UtilsTypescript__NS__TsImportExport) => {},
        BROWSER_FOR_APP: (imp: UtilsTypescript__NS__TsImportExport) => {},
      };
    
//end of namespace CodeSplitProcess__NS__DURING__NS__CLIENT

  
//end of namespace CodeSplitProcess__NS__DURING

  //#endregion

  //#region AFTER
  //namespace CodeSplitProcess__NS__AFTER

    export const CodeSplitProcess__NS__AFTER__NS__SPLIT = {
      MODULE_FOR_ORGANIZATION: 'MODULE_FOR_ORGANIZATION',
    };
  
//end of namespace CodeSplitProcess__NS__AFTER

  //#endregion

//end of namespace CodeSplitProcess

//#endregion