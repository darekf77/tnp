import { CoreModels__NS__EnvironmentNameTaon } from 'tnp-core/lib-prod';
import { BaseReleaseProcess } from 'tnp-helpers/lib-prod';
import { ReleaseArtifactTaon, EnvOptions, ReleaseType } from '../../../options';
import type { Project } from '../project';
/**
 * manage standalone or container release process
 */ export declare class ReleaseProcess extends BaseReleaseProcess<Project> {
    constructor(project: Project);
    displayReleaseProcessMenu(envOptions: EnvOptions): Promise<void>;
    releaseByType(releaseType: ReleaseType, envOptions: EnvOptions): Promise<boolean>;
    getEnvNamesByArtifact(artifact: ReleaseArtifactTaon): {
        envName: CoreModels__NS__EnvironmentNameTaon;
        envNumber?: number | undefined;
    }[];
    displayProjectsSelectionMenu(envOptions: EnvOptions): Promise<Project[]>;
    displaySelectArtifactsMenu(envOptions: EnvOptions, selectedProjects: Project[], allowedArtifacts?: ReleaseArtifactTaon[] | undefined): Promise<ReleaseArtifactTaon[]>;
    startRelease(envOptions?: EnvOptions): Promise<void>;
    /**
     * return true if everything went ok
     */
    releaseArtifacts(releaseType: ReleaseType, releaseArtifactsTaon: ReleaseArtifactTaon[], selectedProjects: Project[], envOptions: EnvOptions): Promise<boolean>;
    /**
     * does not matter if container is releasing standalone
     * or organization packages -> release commit is pushed
     */
    pushReleaseCommits(): Promise<any>;
    private getReleaseHeader;
    private getColoredTextItem;
}
