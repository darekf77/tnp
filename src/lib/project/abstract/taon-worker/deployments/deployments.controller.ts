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

import { ProcessesController } from '../processes/processes.controller';

import { Deployments } from './deployments';
import { DEPLOYMENT_LOCAL_FOLDER_PATH } from './deployments.constants';
import { DeploymentsMiddleware } from './deployments.middleware';
import { DeploymentsRepository } from './deployments.repository';
//#endregion

@Taon.Controller({
  className: 'DeploymentsController',
})
export class DeploymentsController extends BaseCliWorkerController {
  // @ts-ignore
  private deploymentsRepository = this.injectCustomRepo<DeploymentsRepository>(
    DeploymentsRepository,
  );

  processesController = this.injectController(ProcessesController);

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

  //#region get all entities
  @Taon.Http.GET()
  getByDeploymentId(
    @Taon.Http.Param.Query('deploymentId') deploymentId: number | string,
  ): Taon.Response<Deployments> {
    //#region @backendFunc
    return async (req, res) => {
      // @ts-ignore
      return this.deploymentsRepository.findOne({
        where: {
          id: deploymentId?.toString(),
        },
      });
    };
    //#endregion
  }
  //#endregion

  //#region insert entity
  /**
   * @deprecated delete this
   */
  @Taon.Http.PUT()
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
  ): Models.Http.Response<MulterFileUploadResponse[]> {
    //#region @backendFunc
    // @ts-ignore TODO weird inheritance problem
    return super.uploadFormDataToServer(formData);
    //#endregion
  }

  protected async afterFileUploadAction(
    file: MulterFileUploadResponse,
  ): Promise<void> {
    //#region @backendFunc
    await this.deploymentsRepository.save(
      new Deployments().clone({
        zipFileBasenameMetadataPart: path.basename(file.savedAs),
        size: file.size,
      }),
    );
    //#endregion
  }

  async uploadLocalFileToServer(
    absFilePath: string,
    options?: Pick<
      Models.Http.Rest.Ng2RestAxiosRequestConfig,
      'onUploadProgress'
    >,
  ): Promise<MulterFileUploadResponse[]> {
    //#region @backendFunc
    return super.uploadLocalFileToServer(absFilePath, options);
    //#endregion
  }
  //#endregion

  //#region start deployment process
  @Taon.Http.POST()
  startDeployment(
    @Taon.Http.Param.Body('deploymentBaseFileName')
    deploymentBaseFileName: string,
  ): Taon.Response<Deployments> {
    //#region @backendFunc
    return async (req, res) => {
      if (!deploymentBaseFileName || _.isEmpty(deploymentBaseFileName.trim())) {
        throw new Error(`Parameter deploymentBaseFileName is required`);
      }
      return await this.deploymentsRepository.startDeploymentFor(
        deploymentBaseFileName,
      );
    };
    //#endregion
  }
  //#endregion

  //#region stop deployment
  @Taon.Http.POST()
  stopDeployment(
    @Taon.Http.Param.Body('deploymentBaseFileName')
    deploymentBaseFileName: string,
  ): Taon.Response<void> {
    //#region @backendFunc
    return async (req, res) => {
      if (!deploymentBaseFileName || _.isEmpty(deploymentBaseFileName.trim())) {
        throw new Error(`Parameter deploymentBaseFileName is required`);
      }
      await this.deploymentsRepository.stopDeploymentFor(
        deploymentBaseFileName,
      );
    };
    //#endregion
  }
  //#endregion

  //#region remove deployment
  @Taon.Http.POST()
  removeDeployment(
    @Taon.Http.Param.Body('deploymentBaseFileName')
    deploymentBaseFileName: string,
  ): Taon.Response<void> {
    //#region @backendFunc
    return async (req, res) => {
      if (!deploymentBaseFileName || _.isEmpty(deploymentBaseFileName.trim())) {
        throw new Error(`Parameter deploymentBaseFileName is required`);
      }
      await this.deploymentsRepository.removeDeployment(deploymentBaseFileName);
    };
    //#endregion
  }
  //#endregion

  //#region start deployment process
  @Taon.Http.POST()
  addExistedDeployments(): Taon.Response<void> {
    //#region @backendFunc
    return async (req, res) => {
      await this.deploymentsRepository.addExistedDeployments();
    };
    //#endregion
  }
  //#endregion
}
