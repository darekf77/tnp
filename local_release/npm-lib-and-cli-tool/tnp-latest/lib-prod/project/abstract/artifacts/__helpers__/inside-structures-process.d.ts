import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';
import { EnvOptions } from '../../../../options';
import type { Project } from '../../project';
import { BaseInsideStruct } from './inside-structures/structs/base-inside-struct';
export declare class InsideStructuresProcess extends BaseFeatureForProject<Project> {
    process(structs: BaseInsideStruct[], initOptions: EnvOptions): Promise<void>;
}
