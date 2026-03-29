import { BaseCli } from './base-cli';
export declare class $Open extends BaseCli {
    _(): void;
    CORE_CONTAINER(): Promise<void>;
    CORE_PROJECT(): Promise<void>;
    TNP_PROJECT(): Promise<void>;
    UNSTAGE(): Promise<void>;
}
declare const _default: {
    $Open: Function;
};
export default _default;
