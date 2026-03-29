import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';
import { EnvOptions } from '../../../../../../options';
import type { Project } from '../../../../project';
export declare class FilesTemplatesBuilder extends BaseFeatureForProject<Project> {
    get files(): string[];
    rebuild(initOptions: EnvOptions, soft?: boolean): void;
    private processFile;
}
