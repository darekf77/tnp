import { Taon } from 'taon/src';
import { _ } from 'tnp-core/src';

import { EnvOptions } from '../../../options';

import { TaonBuild } from './taon-build.entity';

//#region port entity
@Taon.Controller({
  className: 'TaonBuildController',
})
export class TaonBuildController extends Taon.Base.CrudController<TaonBuild> {
  // eslint-disable-next-line @typescript-eslint/typedef
  entityClassResolveFn = (): typeof TaonBuild => TaonBuild;
}
//#endregion
