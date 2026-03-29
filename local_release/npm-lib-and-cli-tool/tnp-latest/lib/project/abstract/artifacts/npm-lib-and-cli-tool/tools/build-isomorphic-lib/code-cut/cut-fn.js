"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeCuttFn = codeCuttFn;
const lib_1 = require("tnp-core/lib");
function codeCuttFn(cutIftrue) {
    return function (expression, reservedExpOne, reservedExpSec) {
        const exp = `(function(ENV,relativeOrAbsFilePath){
        return ${expression.trim()};
      })(reservedExpOne,reservedExpSec)`;
        try {
            return eval(exp);
        }
        catch (error) {
            const errMsg = (error instanceof Error && error.message) || String(error);
            lib_1.Helpers.log(`Expression Failed ${errMsg}`);
            lib_1.Helpers.error(`[codecutFn] Eval failed `, true, true);
            return null;
        }
    };
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/build-isomorphic-lib/code-cut/cut-fn.js.map