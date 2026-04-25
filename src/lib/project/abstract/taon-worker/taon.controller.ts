import { POST, Query, Taon, TaonController } from 'taon/src';
import { GET } from 'taon/src';
import { CoreModels } from 'tnp-core/src';
import { TaonBaseCliWorkerController } from 'tnp-helpers/src';

import { TaonBuild } from './taon-build.entity';
import { TaonEnv } from './taon-env.entity';
import { TaonIsomorphicPkgsDetectionRepository } from './taon-isomorphic-pkgs-detection.repository';

//#region ports controller
@TaonController({
  className: 'TaonProjectsController',
})
export class TaonProjectsController extends TaonBaseCliWorkerController {
  taonEnvRepo = this.injectRepo(TaonEnv);

  taonIsomorphicPkgsDetectionRepository = this.injectCustomRepository(
    TaonIsomorphicPkgsDetectionRepository,
  );

  @GET()
  getEnvironments(): Taon.Response<TaonEnv[]> {
    //#region @backendFunc
    return async (req, res) => {
      return this.taonEnvRepo.find();
    };
    //#endregion
  }

  @POST()
  detectPackagesForContainer(
    @Query('coreContainerPath') coreContainerPath: string,
  ): Taon.Response<void> {
    //#region @backendFunc
    return async (req, res) => {
      this.taonIsomorphicPkgsDetectionRepository.detectPackagesForContainer(
        coreContainerPath,
      );
    };
    //#endregion
  }
}
//#endregion
