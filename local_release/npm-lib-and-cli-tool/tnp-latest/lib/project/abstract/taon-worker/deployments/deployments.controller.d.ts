import * as FormData from 'form-data';
import { Ng2RestAxiosRequestConfig } from 'ng2-rest';
import { Taon, MulterFileUploadResponse, Models } from 'taon';
import { TaonBaseCliWorkerController } from 'tnp-helpers';
import { Deployments } from './deployments';
import { AllDeploymentsRemoveStatusObj, DeploymentReleaseData, DeploymentsAddingStatusObj } from './deployments.models';
import { DeploymentsRepository } from './deployments.repository';
export declare class DeploymentsController extends TaonBaseCliWorkerController<DeploymentReleaseData> {
    protected deploymentsRepository: DeploymentsRepository;
    /**
     * Not available in production environment
     */
    triggerAllDeploymentsRemove(): Taon.Response<void>;
    protected removingAllDeploymentsStatus(): Taon.Response<AllDeploymentsRemoveStatusObj>;
    waitUntilAllDeploymentsRemoved(): Promise<void>;
    getEntities(): Taon.Response<Deployments[]>;
    getByDeploymentId(deploymentId: number | string): Taon.Response<Deployments>;
    /**
     * @deprecated delete this
     */
    insertEntity(): Taon.Response<string>;
    uploadFormDataToServer(formData: FormData, queryParams?: DeploymentReleaseData): Models.Http.Response<MulterFileUploadResponse[]>;
    protected afterFileUploadAction(file?: MulterFileUploadResponse, queryParams?: DeploymentReleaseData): Promise<void>;
    uploadLocalFileToServer(absFilePath: string, options?: Pick<Ng2RestAxiosRequestConfig, 'onUploadProgress'>, queryParams?: DeploymentReleaseData): Promise<MulterFileUploadResponse[]>;
    triggerDeploymentStart(baseFileNameWithHashDatetime: string, forceStart?: boolean): Taon.Response<Deployments>;
    triggerDeploymentStop(baseFileNameWithHashDatetime: string): Taon.Response<void>;
    waitUntilDeploymentHasComposeUpProcess(deploymentId: string | number): Promise<void>;
    waitUntilDeploymentStopped(deploymentId: string | number): Promise<void>;
    waitUntilDeploymentRemoved(deploymentId: string | number): Promise<void>;
    triggerDeploymentRemove(baseFileNameWithHashDatetime: string): Taon.Response<void>;
    triggerTableClearAndAddExistedDeployments(): Taon.Response<void>;
    protected isClearingAndAddingDeployments(): Taon.Response<DeploymentsAddingStatusObj>;
    waitUntilTableClearAndAllExistedDeploymentsAdded(): Promise<void>;
}