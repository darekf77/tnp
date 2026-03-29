import { TaonBaseEntity } from 'taon/lib-prod';
import { CoreModels__NS__LibType } from 'tnp-core/lib-prod';
export declare class TaonProject extends TaonBaseEntity {
    static from(opt: Omit<TaonProject, 'id' | 'version' | '_' | 'clone'>): TaonProject;
    location: string;
    type: CoreModels__NS__LibType;
    isTemporary: boolean;
}
