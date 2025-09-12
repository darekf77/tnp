//#region imports
import { Taon } from 'taon/src';
import { Raw } from 'taon-typeorm/src';
import { _ } from 'tnp-core/src';

import { Instances } from './instances';
//#endregion

@Taon.Repository({
  className: 'InstancesRepository',
})
export class InstancesRepository extends Taon.Base.Repository<Instances> {
  entityClassResolveFn: () => typeof Instances = () => Instances;

  testMethod() {

  }

}
