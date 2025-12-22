import { Taon, TaonController } from 'taon/src';
import { TaonBaseCrudController } from 'taon/src';
import { _ } from 'tnp-core/src';

import { EnvOptions } from '../../../options';

import { TaonBuild } from './taon-build.entity';

//#region port entity
@TaonController({
  className: 'TaonBuildController',
})
export class TaonBuildController extends TaonBaseCrudController<TaonBuild> {

  entityClassResolveFn = (): typeof TaonBuild => TaonBuild;
}
//#endregion
