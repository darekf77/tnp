import { CoreModels__NS__ClassNameStaticProperty } from 'tnp-core/lib-prod';
import { BaseCLiWorkerStartParams } from 'tnp-helpers/lib-prod';
import { EnvOptions } from '../../options';
import { BaseCli } from './base-cli';
export declare class $SubProject extends BaseCli {
    params: EnvOptions & Partial<BaseCLiWorkerStartParams>;
    static [CoreModels__NS__ClassNameStaticProperty]: string;
    _(): Promise<void>;
}
declare const _default: {
    $SubProject: Function;
};
export default _default;
