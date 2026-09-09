//#region imports
import { path, _, Helpers } from 'tnp-core/src';
import { UtilsTypescript } from 'tnp-helpers/src';

import {
  DUMMY_LIB,
  indexTsFromLibFromSrc,
  libFromImport,
  sourceLinkInNodeModules,
  srcFromTaonImport,
  srcMainProject,
} from '../../../../../../../constants';

import type { BrowserCodeCut } from './browser-code-cut';
//#endregion

export const CallBackProcess = (
  fun: (
    imp: UtilsTypescript.TsImportExport,
    isomorphicLibraries: string[],
    currentProjectName: string,
    currentProjectNpmName: string,
    browserCodeCut: BrowserCodeCut,
    relativeFilesToProcess: Map<string, boolean>,
    appendImports: (
      importToAppend: Pick<
        UtilsTypescript.TsImportExport,
        'cleanEmbeddedPathToFile' | 'importElements'
      >,
    ) => void,
  ) => boolean,
) => {
  return fun;
};

/**
 * TODO In progress documentation for whole code split process
 */
export namespace CodeSplitProcess {
  //#region BEFORE
  export namespace Before {
    export namespace Split {
      export const ImportExport = {
        //#region @backend

        //#region prevent import lib from src/index.ts
        PREVENT_IMPORTING_IN_LIB_FROM_SRC_INDEX: CallBackProcess(
          (
            imp: UtilsTypescript.TsImportExport,
            isomorphicLibraries: string[],
            currentProjectName: string,
            currentProjectNpmName: string,
            browserCodeCut: BrowserCodeCut,
            relativeFilesToProcess: Map<string, boolean>,
            appendImport,
          ) => {
            // const debug = browserCodeCut.debug;

            // debug &&
            //   console.log({
            //     'imp.cleanEmbeddedPathToFile': imp.cleanEmbeddedPathToFile,
            //   });

            // if (debug) {
            //   debugger;
            // }

            if (imp.isIsomorphic) {
              return false;
            }

            if (
              browserCodeCut.isAppFile &&
              imp.cleanEmbeddedPathToFile !==
                browserCodeCut.backFromAppCode_ToSrcIndex
              //   &&
              // imp.cleanEmbeddedPathToFile !==
              //   `${browserCodeCut.backFromAppCode_ToSrcLibIndex}index`
            ) {
              return false;
            }

            if (
              browserCodeCut.isLibFile &&
              // hanlde when vscode impot ../../index (from src/index.ts) ->
              imp.cleanEmbeddedPathToFile !==
                browserCodeCut.backFromLibCode_ToSrcIndex &&
              // hanlde when vscode impot ../index (from src/lib/index.ts) ->
              imp.cleanEmbeddedPathToFile !==
                `${browserCodeCut.backFromLibCode_ToSrcLibIndex}index`
            ) {
              return false;
            }

            let appended: string[] = [];
            const allFiles = [...relativeFilesToProcess.keys()]; // TODO may be expensive ?
            // console.log({ allFiles });
            for (const importElem of imp.importElements) {
              //#region search all file fro import with proper export elem
              const fileToProcess = allFiles
                .filter(f => {
                  const isTsFile = f.endsWith('.ts') || f.endsWith('.tsx');
                  const basename = _.kebabCase(path.basename(f));
                  const kebaBasebame = _.kebabCase(importElem);

                  // if (path.basename(f) === 'taon-notification.entity.ts') {
                  //   debugger;
                  // }
                  // debug &&
                  //   console.log({
                  //     basename,
                  //     kebaBasebame,
                  //   });
                  return isTsFile && basename.includes(kebaBasebame);
                })
                .map(f => {
                  const baseNameWithoutExit = path
                    .basename(f)
                    .replace('.tsx', '')
                    .replace('.ts', '');

                  const classOrElemFromBasename = _.upperFirst(
                    _.camelCase(baseNameWithoutExit),
                  );

                  return {
                    absPath: browserCodeCut.project.pathFor([
                      srcMainProject,
                      f,
                    ]),
                    relativePath: f,
                    classOrElemFromBasename,
                  };
                })
                .find(f => {
                  const nameIsProper = importElem === f.classOrElemFromBasename;
                  const fileExists = nameIsProper && Helpers.exists(f.absPath);
                  const exportFound =
                    fileExists &&
                    UtilsTypescript.exportsFromFile(f.absPath)
                      .map(c => c.name)
                      .includes(importElem);

                  return exportFound;
                });
              //#endregion

              if (fileToProcess) {
                //#region handle when possible import file found

                // if (debug) {
                //   debugger;
                // }

                appended.push(fileToProcess.classOrElemFromBasename);
                let cleanEmbeddedPathToFile: string;

                if (browserCodeCut.isAppFile) {
                  if (
                    imp.cleanEmbeddedPathToFile ===
                    browserCodeCut.backFromAppCode_ToSrcIndex
                  ) {
                    cleanEmbeddedPathToFile = `${currentProjectNpmName}/${srcFromTaonImport}`;
                  }
                }

                if (browserCodeCut.isLibFile) {
                  if (
                    imp.cleanEmbeddedPathToFile ===
                    browserCodeCut.backFromLibCode_ToSrcIndex
                  ) {
                    cleanEmbeddedPathToFile =
                      `${browserCodeCut.backFromLibCode_ToSrcLibIndex}` +
                      `${fileToProcess.relativePath
                        .split('/')
                        .slice(1)
                        .join('/')}`;
                  }

                  if (
                    imp.cleanEmbeddedPathToFile ===
                    `${browserCodeCut.backFromLibCode_ToSrcLibIndex}index`
                  ) {
                    cleanEmbeddedPathToFile =
                      `${browserCodeCut.backFromLibCode_ToSrcLibIndex}` +
                      `${fileToProcess.relativePath
                        .split('/')
                        .slice(1)
                        .join('/')}`;
                  }
                }

                let importNewElem = fileToProcess.classOrElemFromBasename;

                appendImport({
                  cleanEmbeddedPathToFile: cleanEmbeddedPathToFile
                    .replace('.tsx', '')
                    .replace('.ts', ''),
                  importElements: [importNewElem],
                });
                // console.log({ fileToProcess });
                //#endregion
              }
            }

            if (appended.length > 0) {
              if (appended.length === imp.importElements.length) {
                imp.markForDeletion = true;
                return true;
              }
              if (appended.length < imp.importElements.length) {
                imp.markForDeletionImportElems = appended;
                return true;
              }
            }

            //#region fallback replace normal lib index
            if (browserCodeCut.isAppFile) {
              if (
                imp.cleanEmbeddedPathToFile ===
                browserCodeCut.backFromAppCode_ToSrcIndex
              ) {
                imp.embeddedPathToFileResult = imp.wrapInParenthesis(
                  imp.cleanEmbeddedPathToFile.replace(
                    `${browserCodeCut.backFromAppCode_ToSrcIndex}`,
                    `${currentProjectNpmName}/${srcFromTaonImport}`,
                  ),
                );
                return true;
              }
            }
            if (browserCodeCut.isLibFile) {
              if (
                imp.cleanEmbeddedPathToFile ===
                browserCodeCut.backFromLibCode_ToSrcIndex
              ) {
                imp.embeddedPathToFileResult = imp.wrapInParenthesis(
                  imp.cleanEmbeddedPathToFile.replace(
                    `${browserCodeCut.backFromLibCode_ToSrcIndex}`,
                    `${browserCodeCut.backFromLibCode_ToSrcLibIndex}${indexTsFromLibFromSrc.replace('.ts', '').replace('.tsx', '')}`,
                  ),
                );
                return true;
              }
            }
            //#endregion

            return false;
          },
        ),
        //#endregion

        //#region prevent name as npm name
        /**
         * name => nameForNpmPackage
         * my-lib => @my-org/my-lib
         * my-lib => my-custom-npm-lib
         */
        NAME_TO_NPM_NAME: CallBackProcess(
          (
            imp: UtilsTypescript.TsImportExport,
            isomorphicLibraries: string[],
            currentProjectName: string,
            currentProjectNpmName: string,
          ) => {
            if (!imp.isIsomorphic) {
              return false;
            }
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
        //#endregion

        //#region prevent  my-lib/lib => my-lib/src
        WITH_LIB_TO_SRC: CallBackProcess(
          (
            imp: UtilsTypescript.TsImportExport,
            isomorphicLibraries: string[],
          ) => {
            if (!imp.isIsomorphic) {
              return false;
            }
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
        //#endregion

        //#region prevent my-lib/source => my-lib/src
        WITH_SOURCE_TO_SRC: CallBackProcess(
          (
            imp: UtilsTypescript.TsImportExport,
            isomorphicLibraries: string[],
          ) => {
            if (!imp.isIsomorphic) {
              return false;
            }
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
        //#endregion

        //#region prevent my-lib => my-lib/src
        NOTHING_TO_SRC: CallBackProcess(
          (
            imp: UtilsTypescript.TsImportExport,
            isomorphicLibraries: string[],
            currentProjectName: string,
            currentProjectNpmName: string,
          ) => {
            if (!imp.isIsomorphic) {
              return false;
            }
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
        //#endregion

        //#region prevent deep to short src
        DEEP_TO_SHORT_SRC: CallBackProcess(
          (
            imp: UtilsTypescript.TsImportExport,
            isomorphicLibraries: string[],
            currentProjectName: string,
            currentProjectNpmName: string,
          ) => {
            if (!imp.isIsomorphic) {
              return false;
            }
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
        //#endregion

        //#region prevent browser to src
        BROWSER_TO_SRC: CallBackProcess(
          (
            imp: UtilsTypescript.TsImportExport,
            isomorphicLibraries: string[],
          ) => {
            return false; // TODO
          },
        ),
        //#endregion

        //#region prevent websql to src
        WEBSQL_TO_SRC: CallBackProcess(
          (
            imp: UtilsTypescript.TsImportExport,
            isomorphicLibraries: string[],
          ) => {
            return false; // TODO
          },
        ),
        //#endregion

        //#endregion
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
