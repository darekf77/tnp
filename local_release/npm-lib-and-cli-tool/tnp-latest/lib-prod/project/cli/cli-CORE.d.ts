import { BaseCli } from './base-cli';
export declare class $Core extends BaseCli {
    __initialize__(): Promise<void>;
    _(): Promise<void>;
    createNext(): Promise<void>;
    setNpmVersion(): Promise<void>;
    setFrameworkVersion(): Promise<void>;
    updateDepsFrom(): void;
}
declare const _default: {
    $Core: Function;
};
export default _default;
