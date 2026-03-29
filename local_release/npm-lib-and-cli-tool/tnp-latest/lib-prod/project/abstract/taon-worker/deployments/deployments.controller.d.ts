import * as FormData from 'form-data';
import { Ng2RestAxiosRequestConfig } from 'ng2-rest/lib-prod';
import { MulterFileUploadResponse, Models__NS__Http__NS__Response, Taon__NS__Response } from 'taon/lib-prod';
import { TaonBaseCliWorkerController } from 'tnp-helpers/lib-prod';
import { Deployments } from './deployments';
import { AllDeploymentsRemoveStatusObj, DeploymentReleaseData, DeploymentsAddingStatusObj } from './deployments.models';
import { DeploymentsRepository } from './deployments.repository';
export declare class DeploymentsController extends TaonBaseCliWorkerController<DeploymentReleaseData> {
    protected deploymentsRepository: DeploymentsRepository;
    /**
     * Not available in production environment
     */
    triggerAllDeploymentsRemove(): Taon__NS__Response<void>;
    protected removingAllDeploymentsStatus(): Taon__NS__Response<AllDeploymentsRemoveStatusObj>;
    waitUntilAllDeploymentsRemoved(): Promise<void>;
    getEntities(): Taon__NS__Response<Deployments[]>;
    getByDeploymentId(deploymentId: number | string): Taon__NS__Response<Deployments>;
    /**
     * @deprecated delete this
     */
    insertEntity(): Taon__NS__Response<string>;
    uploadFormDataToServer(formData: FormData, queryParams?: DeploymentReleaseData): Models__NS__Http__NS__Response<MulterFileUploadResponse[]>;
    protected afterFileUploadAction(file?: MulterFileUploadResponse, queryParams?: DeploymentReleaseData): Promise<void>;
    uploadLocalFileToServer(absFilePath: string, options?: Pick<Ng2RestAxiosRequestConfig, 'onUploadProgress'>, queryParams?: DeploymentReleaseData): Promise<MulterFileUploadResponse[]>;
    triggerDeploymentStart(baseFileNameWithHashDatetime: string, forceStart?: boolean): Taon__NS__Response<Deployments>;
    triggerDeploymentStop(baseFileNameWithHashDatetime: string): Taon__NS__Response<void>;
    waitUntilDeploymentHasComposeUpProcess(deploymentId: string | number): Promise<void>;
    waitUntilDeploymentStopped(deploymentId: string | number): Promise<void>;
    waitUntilDeploymentRemoved(deploymentId: string | number): Promise<void>;
    triggerDeploymentRemove(baseFileNameWithHashDatetime: string): Taon__NS__Response<void>;
    triggerTableClearAndAddExistedDeployments(): Taon__NS__Response<void>;
    protected isClearingAndAddingDeployments(): Taon__NS__Response<DeploymentsAddingStatusObj>;
    waitUntilTableClearAndAllExistedDeploymentsAdded(): Promise<void>;
}
