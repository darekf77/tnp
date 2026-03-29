import { BaseCli } from './base-cli';
export declare class $App extends BaseCli {
    _(): Promise<void>;
    private _build;
    electron(): Promise<void>;
    el(): Promise<void>;
    electronWebsql(): Promise<void>;
    websql(): Promise<void>;
    normal(): Promise<void>;
}
declare const _default: {
    $App: Function;
};
export default _default;
