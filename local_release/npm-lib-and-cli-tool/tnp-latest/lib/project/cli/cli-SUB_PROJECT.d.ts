import { CoreModels } from 'tnp-core';
import { BaseCLiWorkerStartParams } from 'tnp-helpers';
import { EnvOptions } from '../../options';
import { BaseCli } from './base-cli';
export declare class $SubProject extends BaseCli {
    params: EnvOptions & Partial<BaseCLiWorkerStartParams>;
    static [CoreModels.ClassNameStaticProperty]: string;
    _(): Promise<void>;
}
declare const _default: {
    $SubProject: Function;
};
export default _default;