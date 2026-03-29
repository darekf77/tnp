import { TaonBaseEntity } from 'taon';
import { CoreModels } from 'tnp-core';
export declare class TaonProject extends TaonBaseEntity {
    static from(opt: Omit<TaonProject, 'id' | 'version' | '_' | 'clone'>): TaonProject;
    location: string;
    type: CoreModels.LibType;
    isTemporary: boolean;
}