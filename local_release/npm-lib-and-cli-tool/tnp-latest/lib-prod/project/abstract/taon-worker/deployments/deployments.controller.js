//#region imports
import * as FormData from 'form-data'; // @backend
import { TaonController, Taon__NS__error } from 'taon/lib-prod';
import { GET, POST, DELETE, Query, Body } from 'taon/lib-prod';
import { config } from 'tnp-core/lib-prod';
import { ___NS__isEmpty } from 'tnp-core/lib-prod';
import { TaonBaseCliWorkerController } from 'tnp-helpers/lib-prod';
import { ERR_MESSAGE_DEPLOYMENT_NOT_FOUND } from '../../../../constants';
import { Deployments } from './deployments';
import { DeploymentsMiddleware } from './deployments.middleware';
import { AllDeploymentsRemoveStatus, DeploymentsAddingStatus, DeploymentsStatesAllowedStart, } from './deployments.models';
import { DeploymentsRepository } from './deployments.repository';
//#endregion
let DeploymentsController = class DeploymentsController extends TaonBaseCliWorkerController {
    //#region fields & getters
    // @ts-ignore remove after move to separated repo
    deploymentsRepository = // @ts-ignore remove after move to separated repo
     this.injectCustomRepo(DeploymentsRepository);
    //#endregion
    //#region remove all deployments
    // (NOT FOR PRODUCTION)
    //#region remove all deployments / trigger
    /**
     * Not available in production environment
     */
    triggerAllDeploymentsRemove() {
        //#region @backendFunc
        return async (req, res) => {
            if (config.frameworkName === 'taon') {
                Taon__NS__error({
                    message: `This operation is not allowed in production environment`,
                });
            }
            return await this.deploymentsRepository.triggerAllDeploymentsRemove();
        };
        //#endregion
    }
    //#endregion
    //#region remove all deployments / status check
    removingAllDeploymentsStatus() {
        //#region @backendFunc
        return async (req, res) => {
            return this.deploymentsRepository.removingAllDeploymentsStatus();
        };
        //#endregion
    }
    //#endregion
    //#region remove all deployments / wait until done
    waitUntilAllDeploymentsRemoved() {
        //#region @backendFunc
        return this._waitForProperStatusChange({
            actionName: 'Checking if all deployments are removed',
            request: () => this.removingAllDeploymentsStatus().request({
                timeout: 900,
            }),
            statusCheck: resp => {
                return resp.body.json.status === AllDeploymentsRemoveStatus.DONE;
            },
        });
        //#endregion
    }
    //#endregion
    //#endregion
    //#region get all entities
    getEntities() {
        //#region @backendFunc
        return async (req, res) => {
            // @ts-ignore
            return this.deploymentsRepository.find();
        };
        //#endregion
    }
    //#endregion
    //#region get deployment by id
    getByDeploymentId(deploymentId) {
        //#region @backendFunc
        return async (req, res) => {
            if (!deploymentId) {
                throw new Error(`DeploymentId query param is required`);
            }
            const deployment = await this.deploymentsRepository.findOne({
                where: {
                    id: deploymentId?.toString(),
                },
            });
            if (!deployment) {
                Taon__NS__error({
                    message: `Deployment with id ${deploymentId} not found`,
                    status: 404,
                    code: ERR_MESSAGE_DEPLOYMENT_NOT_FOUND,
                });
            }
            return deployment;
        };
        //#endregion
    }
    //#endregion
    //#region insert entity
    /**
     * @deprecated delete this
     */
    insertEntity() {
        return async (req, res) => {
            //#region @backendFunc
            // @ts-ignore
            await this.deploymentsRepository.save(new Deployments().clone({}));
            return 'Entity saved successfully';
            //#endregion
        };
    }
    //#endregion
    //#region upload deployment files to server
    uploadFormDataToServer(formData, queryParams) {
        //#region @backendFunc
        // @ts-ignore TODO weird inheritance problem
        return super.uploadFormDataToServer(formData, queryParams);
        //#endregion
    }
    async afterFileUploadAction(file, queryParams) {
        //#region @backendFunc
        await this.deploymentsRepository.saveDeployment(file, queryParams);
        //#endregion
    }
    async uploadLocalFileToServer(absFilePath, options, queryParams) {
        //#region @backendFunc
        return super.uploadLocalFileToServer(absFilePath, options, queryParams);
        //#endregion
    }
    //#endregion
    //#region trigger deployment start process
    triggerDeploymentStart(baseFileNameWithHashDatetime, forceStart = false) {
        //#region @backendFunc
        return async (req, res) => {
            if (!baseFileNameWithHashDatetime ||
                ___NS__isEmpty(baseFileNameWithHashDatetime.trim())) {
                throw new Error(`Query param baseFileNameWithHashDatetime is required`);
            }
            return await this.deploymentsRepository.triggerDeploymentStart(baseFileNameWithHashDatetime, { forceStart: !!forceStart });
        };
        //#endregion
    }
    //#endregion
    //#region trigger deployment stop process
    triggerDeploymentStop(baseFileNameWithHashDatetime) {
        //#region @backendFunc
        return async (req, res) => {
            if (!baseFileNameWithHashDatetime ||
                ___NS__isEmpty(baseFileNameWithHashDatetime.trim())) {
                throw new Error(`Query param baseFileNameWithHashDatetime is required`);
            }
            await this.deploymentsRepository.triggerDeploymentStop(baseFileNameWithHashDatetime);
        };
        //#endregion
    }
    //#endregion
    //#region wait deployment has compose up process
    async waitUntilDeploymentHasComposeUpProcess(deploymentId) {
        //#region @backendFunc
        await this._waitForProperStatusChange({
            actionName: `Waiting until deployment ${deploymentId} has compose up process`,
            request: () => 
            // @ts-ignore remove after move to separated repo
            this.getByDeploymentId(deploymentId).request({
                timeout: 1000,
            }),
            statusCheck: resp => {
                return !!resp.body.json.processIdComposeUp;
            },
        });
        //#endregion
    }
    //#endregion
    //#region wait until deployment stopped
    async waitUntilDeploymentStopped(deploymentId) {
        //#region @backendFunc
        await this._waitForProperStatusChange({
            actionName: `Waiting until deployment ${deploymentId} is stopped`,
            request: () => 
            // @ts-ignore
            this.getByDeploymentId(deploymentId).request({
                timeout: 1000,
            }),
            statusCheck: resp => {
                return DeploymentsStatesAllowedStart.includes(resp.body.json.status);
            },
        });
        //#endregion
    }
    //#endregion
    //#region wait until deployment removed
    async waitUntilDeploymentRemoved(deploymentId) {
        //#region @backendFunc
        await this._waitForProperStatusChange({
            actionName: `Waiting until deployment ${deploymentId} is removed`,
            request: () => 
            // @ts-ignore
            this.getByDeploymentId(deploymentId).request({
                timeout: 1000,
            }),
            loopRequestsOnBackendError: opt => {
                if (opt.taonError &&
                    opt.taonError.body.json.code === ERR_MESSAGE_DEPLOYMENT_NOT_FOUND) {
                    return false;
                }
                // if (opt.unknownError || opt.unknownHttpError) {
                //   return true;
                // }
                return true;
            },
        });
        //#endregion
    }
    //#endregion
    //#region trigger remove deployment
    triggerDeploymentRemove(baseFileNameWithHashDatetime) {
        //#region @backendFunc
        return async (req, res) => {
            if (!baseFileNameWithHashDatetime ||
                ___NS__isEmpty(baseFileNameWithHashDatetime.trim())) {
                throw new Error(`Query param baseFileNameWithHashDatetime is required`);
            }
            await this.deploymentsRepository.triggerDeploymentStop(baseFileNameWithHashDatetime, {
                removeAfterStop: true,
            });
        };
        //#endregion
    }
    //#endregion
    //#region trigger adding existed deployments
    triggerTableClearAndAddExistedDeployments() {
        //#region @backendFunc
        return async (req, res) => {
            await this.deploymentsRepository.triggerAddExistedDeployments();
        };
        //#endregion
    }
    //#endregion
    //#region check if adding deployments is in progress
    isClearingAndAddingDeployments() {
        //#region @backendFunc
        return async (req, res) => {
            return this.deploymentsRepository.isAddingDeploymentStatus();
        };
        //#endregion
    }
    //#endregion
    //#region wait until all existed deployments are added
    async waitUntilTableClearAndAllExistedDeploymentsAdded() {
        await this._waitForProperStatusChange({
            actionName: 'Checking if all existed deployments are added',
            request: () => this.isClearingAndAddingDeployments().request({
                timeout: 900,
            }),
            statusCheck: resp => {
                if (resp.body.json.status === DeploymentsAddingStatus.FAILED) {
                    // critical error occurred
                    throw `Error occurred during adding existed deployments files`;
                }
                return resp.body.json.status === DeploymentsAddingStatus.DONE;
            },
            loopRequestsOnBackendError: err => {
                config.frameworkName === 'tnp' && console.log(err);
                throw new Error('Error occurred during checking adding existed deployments');
            },
        });
    }
};
__decorate([
    DELETE(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], DeploymentsController.prototype, "triggerAllDeploymentsRemove", null);
__decorate([
    GET(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], DeploymentsController.prototype, "removingAllDeploymentsStatus", null);
__decorate([
    GET(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], DeploymentsController.prototype, "getEntities", null);
__decorate([
    GET(),
    __param(0, Query('deploymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], DeploymentsController.prototype, "getByDeploymentId", null);
__decorate([
    POST(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], DeploymentsController.prototype, "insertEntity", null);
__decorate([
    POST({
        overrideContentType: 'multipart/form-data',
        middlewares: ({ parentMiddlewares }) => ({
            ...parentMiddlewares,
            TaonBaseFileUploadMiddleware: DeploymentsMiddleware,
        }),
    }) // @ts-ignore TODO weird inheritance problem
    ,
    __param(0, Body()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FormData, Object]),
    __metadata("design:returntype", Object)
], DeploymentsController.prototype, "uploadFormDataToServer", null);
__decorate([
    POST(),
    __param(0, Body('baseFileNameWithHashDatetime')),
    __param(1, Body('forceStart')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Object)
], DeploymentsController.prototype, "triggerDeploymentStart", null);
__decorate([
    POST(),
    __param(0, Body('baseFileNameWithHashDatetime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], DeploymentsController.prototype, "triggerDeploymentStop", null);
__decorate([
    POST(),
    __param(0, Body('baseFileNameWithHashDatetime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], DeploymentsController.prototype, "triggerDeploymentRemove", null);
__decorate([
    POST(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], DeploymentsController.prototype, "triggerTableClearAndAddExistedDeployments", null);
__decorate([
    GET(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], DeploymentsController.prototype, "isClearingAndAddingDeployments", null);
DeploymentsController = __decorate([
    TaonController({
        className: 'DeploymentsController',
    })
], DeploymentsController);
export { DeploymentsController };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/deployments/deployments.controller.js.map