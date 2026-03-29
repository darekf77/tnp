import { CoreModels } from 'tnp-core';
import { BaseCLiWorkerStartParams } from 'tnp-helpers';
import { EnvOptions } from '../../options';
import { BaseCli } from './base-cli';
export declare class $Cloud extends BaseCli {
    params: EnvOptions & Partial<BaseCLiWorkerStartParams>;
    static [CoreModels.ClassNameStaticProperty]: string;
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