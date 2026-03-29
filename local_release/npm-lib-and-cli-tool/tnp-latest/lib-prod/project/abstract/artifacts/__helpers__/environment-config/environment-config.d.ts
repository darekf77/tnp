import { CoreModels__NS__EnvironmentNameTaon } from 'tnp-core/lib-prod';
import { BaseFeatureForProject } from 'tnp-helpers/lib-prod';
import { EnvOptions, ReleaseArtifactTaon } from '../../../../../options';
import type { Project } from '../../../project';
export declare class EnvironmentConfig// @ts-ignore TODO weird inheritance problem
 extends BaseFeatureForProject<Project> {
    createForArtifact(artifactName: ReleaseArtifactTaon, envName?: CoreModels__NS__EnvironmentNameTaon, envNumber?: number): Promise<void>;
    watchAndRecreate(onChange: () => any): Promise<void>;
    update(envConfigFromParams: EnvOptions, options?: {
        fromWatcher?: boolean;
        saveEnvToLibEnv?: boolean;
    }): Promise<EnvOptions>;
    private envOptionsResolve;
    private getEnvFor;
    getEnvMain(): Partial<EnvOptions>;
    private getBaseEnvTemplate;
    updateGeneratedValues(envOptions: EnvOptions): void;
    private saveEnvironmentConfig;
    makeSureEnvironmentExists(): void;
    private get absPathToEnvTs();
}
