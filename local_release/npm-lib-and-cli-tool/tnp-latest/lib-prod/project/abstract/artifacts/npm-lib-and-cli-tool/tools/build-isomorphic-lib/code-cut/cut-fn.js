import { Helpers__NS__error, Helpers__NS__log } from 'tnp-core/lib-prod';
export function codeCuttFn(cutIftrue) {
    return function (expression, reservedExpOne, reservedExpSec) {
        const exp = `(function(ENV,relativeOrAbsFilePath){
        return ${expression.trim()};
      })(reservedExpOne,reservedExpSec)`;
        try {
            return eval(exp);
        }
        catch (error) {
            const errMsg = (error instanceof Error && error.message) || String(error);
            Helpers__NS__log(`Expression Failed ${errMsg}`);
            Helpers__NS__error(`[codecutFn] Eval failed `, true, true);
            return null;
        }
    };
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/build-isomorphic-lib/code-cut/cut-fn.js.map