import { Helpers } from 'tnp-core/src';

export function codeCuttFn(cutIftrue: boolean) {
  return function (
    expression: string,
    reservedExpOne: any,
    reservedExpSec?: string,
  ) {
    const exp = `(function(ENV,relativeOrAbsFilePath){
        return ${expression.trim()};
      })(reservedExpOne,reservedExpSec)`;
    try {
      return eval(exp);
    } catch (error) {
      const errMsg = (error instanceof Error && error.message) || String(error);
      Helpers.log(`Expression Failed ${errMsg}`);
      Helpers.error(`[codecutFn] Eval failed `, true, true);
      return null;
    }
  };
}
