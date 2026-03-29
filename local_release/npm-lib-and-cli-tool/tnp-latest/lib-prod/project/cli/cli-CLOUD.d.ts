import { CoreModels__NS__ClassNameStaticProperty } from 'tnp-core/lib-prod';
import { BaseCLiWorkerStartParams } from 'tnp-helpers/lib-prod';
import { EnvOptions } from '../../options';
import { BaseCli } from './base-cli';
export declare class $Cloud extends BaseCli {
    params: EnvOptions & Partial<BaseCLiWorkerStartParams>;
    static [CoreModels__NS__ClassNameStaticProperty]: string;
    __initialize__(): Promise<void>;
    _(): Promise<void>;
    startFileDeploy(): Promise<void>;
    stopFileDeploy(): Promise<void>;
    removeFileDeploy(): Promise<void>;
    deployments(): Promise<void>;
    instances(): Promise<void>;
    processes(): Promise<void>;
    send(): Promise<void>;
}
declare const _default: {
    $Cloud: Function;
};
export default _default;
