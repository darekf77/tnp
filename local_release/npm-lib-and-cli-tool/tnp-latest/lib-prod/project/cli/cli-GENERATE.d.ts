import { BaseCli } from './base-cli';
/**
 * TODO refactor move to tnp-helpers
 */ export declare class $Generate extends BaseCli {
    _(): Promise<void>;
    libIndex(): Promise<void>;
    appRoutes(): Promise<void>;
    fieldsWebsqlRegions(): void;
}
declare const _default: {
    $Generate: Function;
};
export default _default;
