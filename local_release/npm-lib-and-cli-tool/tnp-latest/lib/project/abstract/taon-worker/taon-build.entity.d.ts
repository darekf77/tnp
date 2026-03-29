import { TaonBaseAbstractEntity } from 'taon';
import { EnvOptions } from '../../../options';
export declare class TaonBuild extends TaonBaseAbstractEntity {
    static from(opt: Omit<TaonBuild, 'id' | 'version' | '_' | 'clone'>): TaonBuild;
    processInfoPort: number;
    projectLocation: string;
    type: EnvOptions;
}