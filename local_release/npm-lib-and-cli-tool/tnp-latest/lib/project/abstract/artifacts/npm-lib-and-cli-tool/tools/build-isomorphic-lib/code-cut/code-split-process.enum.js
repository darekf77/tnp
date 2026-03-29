"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeSplitProcess = exports.CallBackProcess = void 0;
const constants_1 = require("../../../../../../../constants");
const CallBackProcess = (fun) => {
    return fun;
};
exports.CallBackProcess = CallBackProcess;
/**
 * TODO In progress documentation for whole code split process
 */
var CodeSplitProcess;
(function (CodeSplitProcess) {
    //#region BEFORE
    let Before;
    (function (Before) {
        let Split;
        (function (Split) {
            Split.ImportExport = {
                // AT_LIB_TO_NPM_NAME: CallBackProcess(
                //   (
                //     imp: UtilsTypescript.TsImportExport,
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
                NAME_TO_NPM_NAME: (0, exports.CallBackProcess)((imp, isomorphicLibraries, currentProjectName, currentProjectNpmName) => {
                    if (imp.cleanEmbeddedPathToFile.startsWith(`${currentProjectName}/`)) {
                        imp.embeddedPathToFileResult = imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile.replace(`${currentProjectName}/`, `${currentProjectNpmName}/`));
                        return true;
                    }
                    return false;
                }),
                // my-lib/lib => my-lib/src
                WITH_LIB_TO_SRC: (0, exports.CallBackProcess)((imp, isomorphicLibraries) => {
                    if (imp.wrapInParenthesis(imp.packageName) + `/${constants_1.libFromImport}` ===
                        imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile)) {
                        imp.embeddedPathToFileResult = imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile + `/${constants_1.srcFromTaonImport}`);
                        return true;
                    }
                    return false;
                }),
                // my-lib/source => my-lib/src
                WITH_SOURCE_TO_SRC: (0, exports.CallBackProcess)((imp, isomorphicLibraries) => {
                    // console.log('WITH_SOURCE_TO_SRC');
                    if (imp.wrapInParenthesis(imp.packageName) +
                        `/${constants_1.sourceLinkInNodeModules}` ===
                        imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile)) {
                        imp.embeddedPathToFileResult = imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile + `/${constants_1.srcFromTaonImport}`);
                        return true;
                    }
                    return false;
                }),
                // my-lib => my-lib/src
                NOTHING_TO_SRC: (0, exports.CallBackProcess)((imp, isomorphicLibraries, currentProjectName, currentProjectNpmName) => {
                    // console.log('NOTHING_TO_SRC');
                    if (imp.wrapInParenthesis(imp.packageName) ===
                        imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile)) {
                        if (imp.packageName === constants_1.DUMMY_LIB) {
                            imp.embeddedPathToFileResult = imp.wrapInParenthesis(currentProjectNpmName + `/${constants_1.srcFromTaonImport}`);
                        }
                        else {
                            imp.embeddedPathToFileResult = imp.wrapInParenthesis(imp.cleanEmbeddedPathToFile + `/${constants_1.srcFromTaonImport}`);
                        }
                        return true;
                    }
                    return false;
                }),
                DEEP_TO_SHORT_SRC: (0, exports.CallBackProcess)((imp, isomorphicLibraries, currentProjectName, currentProjectNpmName) => {
                    // console.log('DEEP_TO_SHORT_SRC');
                    if (imp.cleanEmbeddedPathToFile.replace(imp.packageName + `/${constants_1.srcFromTaonImport}`, '') !== '') {
                        if (imp.packageName === constants_1.DUMMY_LIB) {
                            imp.embeddedPathToFileResult = imp.wrapInParenthesis(currentProjectNpmName + `/${constants_1.srcFromTaonImport}`);
                        }
                        else {
                            imp.embeddedPathToFileResult = imp.wrapInParenthesis(imp.packageName + `/${constants_1.srcFromTaonImport}`);
                        }
                        return true;
                    }
                    return false;
                }),
                BROWSER_TO_SRC: (0, exports.CallBackProcess)((imp, isomorphicLibraries) => {
                    return false; // TODO
                }),
                WEBSQL_TO_SRC: (0, exports.CallBackProcess)((imp, isomorphicLibraries) => {
                    return false; // TODO
                }),
            };
        })(Split = Before.Split || (Before.Split = {}));
    })(Before = CodeSplitProcess.Before || (CodeSplitProcess.Before = {}));
    //#endregion
    //#region DURING
    let DURING;
    (function (DURING) {
        let BACKEND;
        (function (BACKEND) {
            BACKEND.SPLIT = {
                FOR_APP_STANDALONE: (imp) => { },
                FOR_APP_ORGANIZATION: (imp) => { },
                FOR_LIB_STANDALONE: (imp) => { },
                FOR_LIB_ORGANIZATION: (imp) => { },
                FOR_FULL_DTS_STANDALONE: (imp) => { },
                FOR_FULL_DTS_ORGANIZATION: (imp) => { },
            };
        })(BACKEND = DURING.BACKEND || (DURING.BACKEND = {}));
        let CLIENT;
        (function (CLIENT) {
            CLIENT.SPLIT = {
                WEBSQL_FOR_LIB: (imp) => { },
                WEBSQL_FOR_APP: (imp) => { },
                BROWSER_FOR_LIB: (imp) => { },
                BROWSER_FOR_APP: (imp) => { },
            };
        })(CLIENT = DURING.CLIENT || (DURING.CLIENT = {}));
    })(DURING = CodeSplitProcess.DURING || (CodeSplitProcess.DURING = {}));
    //#endregion
    //#region AFTER
    let AFTER;
    (function (AFTER) {
        AFTER.SPLIT = {
            MODULE_FOR_ORGANIZATION: 'MODULE_FOR_ORGANIZATION',
        };
    })(AFTER = CodeSplitProcess.AFTER || (CodeSplitProcess.AFTER = {}));
    //#endregion
})(CodeSplitProcess || (exports.CodeSplitProcess = CodeSplitProcess = {}));
//#endregion
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/build-isomorphic-lib/code-cut/code-split-process.enum.js.map