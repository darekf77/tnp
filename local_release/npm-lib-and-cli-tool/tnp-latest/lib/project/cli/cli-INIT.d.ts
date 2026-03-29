import { BaseCli } from './base-cli';
export declare class $Init extends BaseCli {
    __initialize__(): Promise<void>;
    _(struct?: boolean, recursiveAction?: boolean): Promise<void>;
    clearInit(): Promise<void>;
    all(): Promise<void>;
    struct(): Promise<void>;
    templatesBuilder(): Promise<void>;
    vscode(): void;
    private __askForWhenEmpty;
}
declare const _default: {
    $Init: Function;
};
export default _default;
