import { TaonController, Taon__NS__createContext, Taon__NS__createContextTemplate, Taon__NS__error, Taon__NS__getResponseValue, Taon__NS__init, Taon__NS__inject, Taon__NS__isBrowser, Taon__NS__isElectron, Taon__NS__isNode, Taon__NS__isWebSQL, Taon__NS__removeLoader, Taon__NS__Response, Taon__NS__ResponseHtml, Taon__NS__StartParams } from 'taon/lib-prod';
import { GET } from 'taon/lib-prod';
import { TaonBaseCliWorkerController } from 'tnp-helpers/lib-prod';

import { TaonBuild } from './taon-build.entity';
import { TaonEnv } from './taon-env.entity';

//#region ports controller
@TaonController({
  className: 'TaonProjectsController',
})
export class TaonProjectsController extends TaonBaseCliWorkerController {
  taonEnvRepo = this.injectRepo(TaonEnv);

  @GET()
  getEnvironments(): Taon__NS__Response<TaonEnv[]> {
    //#region @backendFunc
    return async (req, res) => {
      return this.taonEnvRepo.find();
    };
    //#endregion
  }
}
//#endregion