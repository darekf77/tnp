import { BaseCommandLineFeature } from 'tnp-helpers/lib-prod';
import { EnvOptions } from '../../options';
import type { Project } from '../abstract/project';
export declare class BaseCli extends BaseCommandLineFeature<EnvOptions, Project> {
    __initialize__(): Promise<void>;
    protected __recreateEnvForArtifactAndEnvironment(): Promise<void>;
    _(): void;
}
