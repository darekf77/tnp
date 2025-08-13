//#region imports
import { Taon } from 'taon/src';
import { Raw } from 'taon-typeorm/src';
import { _ } from 'tnp-core/src';

import { Deployments } from './deployments';
//#endregion

@Taon.Repository({
  className: 'DeploymentsRepository',
})
export class DeploymentsRepository extends Taon.Base.Repository<Deployments> {
  entityClassResolveFn: () => typeof Deployments = () => Deployments;

}
