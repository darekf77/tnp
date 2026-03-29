import { MulterFileUploadResponse } from 'taon';
import { TaonBaseEntity } from 'taon';
import { CoreModels } from 'tnp-core';
import { ReleaseArtifactTaon, ReleaseType } from '../../../../options';
import { DeploymentReleaseData, DeploymentsStatus } from './deployments.models';
export declare class Deployments extends TaonBaseEntity<Deployments> implements DeploymentReleaseData {
    id: string;
    baseFileNameWithHashDatetime?: string;
    size: MulterFileUploadResponse['size'];
    status: DeploymentsStatus;
    projectName: string;
    envName: CoreModels.EnvironmentNameTaon;
    envNumber: string;
    targetArtifact: ReleaseArtifactTaon;
    releaseType: ReleaseType;
    version: string;
    destinationDomain: string;
    processIdComposeUp?: string | null;
    processIdComposeDown?: string | null;
    arrivalDate?: Date;
    get previewString(): string;
    fullPreviewString(options?: {
        boldValues?: boolean;
    }): string;
}