import { Taon } from 'taon/src';
import { TaonBaseCliWorkerController } from 'tnp-helpers/src';

import { TaonBuild } from './taon-build.entity';
import { TaonEnv } from './taon-env.entity';

//#region ports controller
@Taon.Controller({
  className: 'TaonProjectsController',
})
export class TaonProjectsController extends TaonBaseCliWorkerController {
  taonEnvRepo = this.injectRepo(TaonEnv);

  @Taon.Http.GET()
  getEnvironments(): Taon.Response<TaonEnv[]> {
    //#region @backendFunc
    return async (req, res) => {
      return this.taonEnvRepo.find();
    };
    //#endregion
  }
}
//#endregion
