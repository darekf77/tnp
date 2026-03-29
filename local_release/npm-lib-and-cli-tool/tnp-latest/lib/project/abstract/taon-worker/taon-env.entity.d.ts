import { TaonBaseAbstractEntity } from 'taon';
import { CoreModels } from 'tnp-core';
export declare class TaonEnv extends TaonBaseAbstractEntity {
    static from(obj: {
        name: string;
        type: CoreModels.EnvironmentNameTaon;
    }): TaonEnv;
    type: CoreModels.EnvironmentNameTaon;
    name: string;
}