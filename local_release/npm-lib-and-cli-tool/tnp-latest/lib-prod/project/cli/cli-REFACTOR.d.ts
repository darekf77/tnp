import { BaseCli } from './base-cli';
export declare class $Refactor extends BaseCli {
    _(): Promise<void>;
    prettier(): Promise<void>;
    eslint(): Promise<void>;
    removeBrowserRegion(): Promise<void>;
    changeCssToScss(): Promise<void>;
    properStandaloneNg19(): Promise<void>;
    importsWrap(): Promise<void>;
    flattenImports(): Promise<void>;
    taonNames(): Promise<void>;
    ng21(): Promise<void>;
    selfImports(): Promise<void>;
    classIntoNs(): Promise<void>;
}
declare const _default: {
    $Refactor: Function;
};
export default _default;
