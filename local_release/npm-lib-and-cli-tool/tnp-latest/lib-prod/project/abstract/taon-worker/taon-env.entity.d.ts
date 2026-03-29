import { TaonBaseAbstractEntity } from 'taon/lib-prod';
import { CoreModels__NS__EnvironmentNameTaon } from 'tnp-core/lib-prod';
export declare class TaonEnv extends TaonBaseAbstractEntity {
    static from(obj: {
        name: string;
        type: CoreModels__NS__EnvironmentNameTaon;
    }): TaonEnv;
    type: CoreModels__NS__EnvironmentNameTaon;
    name: string;
}
