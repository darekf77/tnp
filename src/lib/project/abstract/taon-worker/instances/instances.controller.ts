//#region imports
import { Taon, ClassHelpers } from 'taon/src';
import { _ } from 'tnp-core/src';
import { BaseCliWorkerController } from 'tnp-helpers/src';

import { Instances } from './instances';
import { InstancesRepository } from './instances.repository';
//#endregion

@Taon.Controller({
  className: 'InstancesController',
})
export class InstancesController extends BaseCliWorkerController {
  // @ts-ignore
  instancesRepository = this.injectCustomRepo(InstancesRepository);

  // @ts-ignore
  @Taon.Http.GET()
  getEntities(): Taon.Response<Instances[]> {
    //#region @backendFunc
    return async (req, res) => {
      // @ts-ignore
      return this.instancesRepository.find();
    };
    //#endregion
  }

  @Taon.Http.PUT()
  insertEntity(
    @Taon.Http.Param.Body() entity: Instances,
  ): Taon.Response<Instances> {
    return async (req, res) => {
      //#region @backendFunc
      // @ts-expect-error TODO ! this should not trigger error
      const instance = await this.instancesRepository.save(
        new Instances().clone(entity || {}),
      );
      return instance;
      //#endregion
    };
  }
}
