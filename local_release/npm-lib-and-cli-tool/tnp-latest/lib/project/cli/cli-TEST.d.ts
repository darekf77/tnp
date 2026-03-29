import { BaseCli } from './base-cli';
export declare class $Test extends BaseCli {
    _(): Promise<void>;
    WATCH(): Promise<void>;
    _testSelectors(watch: boolean, debug: boolean): Promise<void>;
    private _runRunner;
}
declare const _default: {
    $Test: Function;
};
export default _default;
