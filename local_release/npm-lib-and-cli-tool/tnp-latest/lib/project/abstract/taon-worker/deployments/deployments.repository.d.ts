import { MulterFileUploadResponse } from 'taon';
import { ProcessesController } from '../processes/processes.controller';
import { Deployments } from './deployments';
import { TaonBaseRepository } from 'taon';
import { DeploymentsAddingStatusObj, DeploymentsStatus, DeploymentReleaseData, AllDeploymentsRemoveStatus, AllDeploymentsRemoveStatusObj } from './deployments.models';
export declare class DeploymentsRepository extends TaonBaseRepository<Deployments> {
    entityClassResolveFn: () => typeof Deployments;
    protected waitUntilDeploymentRemoved(deploymentId: string): Promise<void>;
    protected getProcessesController(): Promise<ProcessesController>;
    protected zipfileAbsPath(baseFileNameWithHashDatetime: string): string;
    protected jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime: string): string;
    saveDeployment(file?: MulterFileUploadResponse, queryParams?: DeploymentReleaseData): Promise<Deployments>;
    protected waitUntilProcessKilled(processId: string | number, callback: () => void | Promise<void>): Promise<void>;
    /**
     * wait until deployment reach final state
     * starting => started
     * stopping => stopped
     * + handle failure states
     */
    protected repeatRefreshDeploymentStateUntil(deploymentId: string | number, options?: {
        refreshEveryMs?: number;
        operation: DeploymentsStatus;
        callback?: () => void | Promise<void>;
    }): void;
    /**
     * refresh deployment state for start and stop
     */
    refreshDeploymentStateForStartStop(deploymentId: string | number, options?: {
        refreshEveryMs?: number;
        operation: DeploymentsStatus;
    }): Promise<boolean>;
    allDeploymentRemoveStatus: AllDeploymentsRemoveStatus;
    removingAllDeploymentsStatus(): AllDeploymentsRemoveStatusObj;
    protected clearAllDeployments(): Promise<void>;
    triggerAllDeploymentsRemove(): Promise<void>;
    triggerDeploymentStop(baseFileNameWithHashDatetime: string, options?: {
        removeAfterStop?: boolean;
        skipStatusCheck?: boolean;
    }): Promise<Deployments>;
    triggerDeploymentStart(baseFileNameWithHashDatetime: string, options?: {}): Promise<Deployments>;
    clearAndAddExistedDeploymentsProcess(): Promise<void>;
    private deploymentsIsAddingStatus;
    triggerAddExistedDeployments(): void;
    isAddingDeploymentStatus(): DeploymentsAddingStatusObj;
}