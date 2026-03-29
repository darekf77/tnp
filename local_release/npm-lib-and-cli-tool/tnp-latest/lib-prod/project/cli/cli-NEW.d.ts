import { Models__NS__NewSiteOptions } from '../../models';
import { BaseCli } from './base-cli';
export declare class $New extends BaseCli {
    _(): Promise<void>;
    open(): Promise<void>;
    private _initContainersAndApps;
    private _addRemoteToStandalone;
    _createContainersOrStandalone(options: Models__NS__NewSiteOptions): Promise<string>;
}
declare const _default: {
    $New: Function;
};
export default _default;
