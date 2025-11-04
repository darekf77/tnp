//#region imports
import * as FormData from 'form-data'; // @backend
import {
  Taon,
  ClassHelpers,
  MulterFileUploadResponse,
  Models,
  EndpointContext,
} from 'taon/src';
import { _, crossPlatformPath, Helpers } from 'tnp-core/src';
import { path } from 'tnp-core/src';
import { BaseCliWorkerController } from 'tnp-helpers/src';

import { ERR_MESSAGE_DEPLOYMENT_NOT_FOUND } from '../../../../constants';
import { ProcessesController } from '../processes/processes.controller';

import { Deployments } from './deployments';
import { DEPLOYMENT_LOCAL_FOLDER_PATH } from './deployments.constants';
import { DeploymentsMiddleware } from './deployments.middleware';
import {
  DeploymentReleaseData,
  DeploymentsAddingStatus,
  DeploymentsAddingStatusObj,
  DeploymentsStatesAllowedStart,
  DeploymentsStatus,
} from './deployments.models';
import { DeploymentsRepository } from './deployments.repository';
//#endregion

@Taon.Controller({
  className: 'DeploymentsController',
})
export class DeploymentsController extends BaseCliWorkerController<DeploymentReleaseData> {
  //#region fields & getters

  // @ts-ignore remove after move to separated repo
  protected deploymentsRepository = // @ts-ignore remove after move to separated repo
    this.injectCustomRepo<DeploymentsRepository>(DeploymentsRepository);

  //#endregion

  //#region get all entities
  @Taon.Http.GET()
  getEntities(): Taon.Response<Deployments[]> {
    //#region @backendFunc
    return async (req, res) => {
      // @ts-ignore
      return this.deploymentsRepository.find();
    };
    //#endregion
  }
  //#endregion

  //#region get deployment by id
  @Taon.Http.GET()
  getByDeploymentId(
    @Taon.Http.Param.Query('deploymentId') deploymentId: number | string,
  ): Taon.Response<Deployments> {
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
        Taon.error({
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
  @Taon.Http.POST()
  insertEntity(): Taon.Response<string> {
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
  @Taon.Http.POST({
    overrideContentType: 'multipart/form-data',
    middlewares: ({ parentMiddlewares }) => ({
      ...parentMiddlewares,
      BaseFileUploadMiddleware: DeploymentsMiddleware,
    }),
  }) // @ts-ignore TODO weird inheritance problem
  uploadFormDataToServer(
    @Taon.Http.Param.Body() formData: FormData,
    @Taon.Http.Param.Query() queryParams?: DeploymentReleaseData,
  ): Models.Http.Response<MulterFileUploadResponse[]> {
    //#region @backendFunc
    // @ts-ignore TODO weird inheritance problem
    return super.uploadFormDataToServer(formData, queryParams);
    //#endregion
  }

  protected async afterFileUploadAction(
    file?: MulterFileUploadResponse,
    queryParams?: DeploymentReleaseData,
  ): Promise<void> {
    //#region @backendFunc
    await this.deploymentsRepository.saveDeployment(file, queryParams);
    //#endregion
  }

  async uploadLocalFileToServer(
    absFilePath: string,
    options?: Pick<
      Models.Http.Rest.Ng2RestAxiosRequestConfig,
      'onUploadProgress'
    >,
    queryParams?: DeploymentReleaseData,
  ): Promise<MulterFileUploadResponse[]> {
    //#region @backendFunc
    return super.uploadLocalFileToServer(
      absFilePath,
      options,
      queryParams as DeploymentReleaseData,
    );
    //#endregion
  }
  //#endregion

  //#region trigger deployment start process
  @Taon.Http.POST()
  triggerDeploymentStart(
    @Taon.Http.Param.Body('baseFileNameWithHashDatetime')
    baseFileNameWithHashDatetime: string,
    @Taon.Http.Param.Body('forceStart') forceStart: boolean = false,
  ): Taon.Response<Deployments> {
    //#region @backendFunc
    return async (req, res) => {
      if (
        !baseFileNameWithHashDatetime ||
        _.isEmpty(baseFileNameWithHashDatetime.trim())
      ) {
        throw new Error(`Query param baseFileNameWithHashDatetime is required`);
      }
      return await this.deploymentsRepository.triggerDeploymentStart(
        baseFileNameWithHashDatetime,
        { forceStart: !!forceStart },
      );
    };
    //#endregion
  }
  //#endregion

  //#region trigger deployment stop process
  @Taon.Http.POST()
  triggerDeploymentStop(
    @Taon.Http.Param.Body('baseFileNameWithHashDatetime')
    baseFileNameWithHashDatetime: string,
  ): Taon.Response<void> {
    //#region @backendFunc
    return async (req, res) => {
      if (
        !baseFileNameWithHashDatetime ||
        _.isEmpty(baseFileNameWithHashDatetime.trim())
      ) {
        throw new Error(`Query param baseFileNameWithHashDatetime is required`);
      }
      await this.deploymentsRepository.triggerDeploymentStop(
        baseFileNameWithHashDatetime,
      );
    };
    //#endregion
  }
  //#endregion

  //#region wait deployment has compose up process
  async waitUntilDeploymentHasComposeUpProcess(
    deploymentId: string | number,
  ): Promise<void> {
    //#region @backendFunc
    await this._waitForProperStatusChange<Deployments>({
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
  async waitUntilDeploymentStopped(
    deploymentId: string | number,
  ): Promise<void> {
    //#region @backendFunc
    await this._waitForProperStatusChange<Deployments>({
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
  async waitUntilDeploymentRemoved(
    deploymentId: string | number,
  ): Promise<void> {
    //#region @backendFunc
    await this._waitForProperStatusChange<Deployments>({
      actionName: `Waiting until deployment ${deploymentId} is removed`,
      request: () =>
        // @ts-ignore
        this.getByDeploymentId(deploymentId).request({
          timeout: 1000,
        }),
      loopRequestsOnBackendError: opt => {
        if (
          opt.taonError &&
          opt.taonError.body.json.code === ERR_MESSAGE_DEPLOYMENT_NOT_FOUND
        ) {
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
  @Taon.Http.POST()
  triggerDeploymentRemove(
    @Taon.Http.Param.Body('baseFileNameWithHashDatetime')
    baseFileNameWithHashDatetime: string,
  ): Taon.Response<void> {
    //#region @backendFunc
    return async (req, res) => {
      if (
        !baseFileNameWithHashDatetime ||
        _.isEmpty(baseFileNameWithHashDatetime.trim())
      ) {
        throw new Error(`Query param baseFileNameWithHashDatetime is required`);
      }
      await this.deploymentsRepository.triggerDeploymentStop(
        baseFileNameWithHashDatetime,
        {
          removeAfterStop: true,
        },
      );
    };
    //#endregion
  }
  //#endregion

  //#region trigger adding existed deployments
  @Taon.Http.POST()
  triggerTableClearAndAddExistedDeployments(): Taon.Response<void> {
    //#region @backendFunc
    return async (req, res) => {
      await this.deploymentsRepository.triggerAddExistedDeployments();
    };
    //#endregion
  }
  //#endregion

  //#region check if adding deployments is in progress
  @Taon.Http.GET()
  protected isClearingAndAddingDeployments(): Taon.Response<DeploymentsAddingStatusObj> {
    //#region @backendFunc
    return async (req, res) => {
      return this.deploymentsRepository.isAddingDeploymentStatus();
    };
    //#endregion
  }
  //#endregion

  //#region wait until all existed deployments are added
  async waitUntilTableClearAndAllExistedDeploymentsAdded(): Promise<void> {
    await this._waitForProperStatusChange<DeploymentsAddingStatusObj>({
      actionName: 'Checking if all existed deployments are added',
      request: () =>
        this.isClearingAndAddingDeployments().request({
          timeout: 900,
        }) as any,
      statusCheck: resp => {
        if (resp.body.json.status === DeploymentsAddingStatus.FAILED) {
          // critical error occurred
          throw `Error occurred during adding existed deployments files`;
        }

        return resp.body.json.status === DeploymentsAddingStatus.DONE;
      },
    });
  }
  //#endregion
}
