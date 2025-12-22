import { Taon, TaonController } from 'taon/src';
import { GET } from 'taon/src';
import { TaonBaseCliWorkerController } from 'tnp-helpers/src';

import { TaonBuild } from './taon-build.entity';
import { TaonEnv } from './taon-env.entity';

//#region ports controller
@TaonController({
  className: 'TaonProjectsController',
})
export class TaonProjectsController extends TaonBaseCliWorkerController {
  taonEnvRepo = this.injectRepo(TaonEnv);

  @GET()
  getEnvironments(): Taon.Response<TaonEnv[]> {
    //#region @backendFunc
    return async (req, res) => {
      return this.taonEnvRepo.find();
    };
    //#endregion
  }
}
//#endregion
