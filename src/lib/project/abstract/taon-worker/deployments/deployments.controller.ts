//#region imports
import { Taon, ClassHelpers } from 'taon/src';
import { _ } from 'tnp-core/src';
import { BaseCliWorkerController } from 'tnp-helpers/src';

import { Deployments } from './deployments';
import { DeploymentsRepository } from './deployments.repository';
//#endregion

@Taon.Controller({
  className: 'DeploymentsController',
})
export class DeploymentsController extends BaseCliWorkerController {
  // @ts-ignore
  deploymentsRepository = this.injectCustomRepo(DeploymentsRepository);

  // @ts-ignore
  @Taon.Http.GET()
  getEntities(): Taon.Response<Deployments[]> {
    //#region @backendFunc
    return async (req, res) => {
      // @ts-ignore
      return this.deploymentsRepository.find();
    };
    //#endregion
  }

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
}
