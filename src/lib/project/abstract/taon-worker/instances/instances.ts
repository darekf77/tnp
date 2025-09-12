//#region imports
import { Taon } from 'taon/src';
import { _ } from 'tnp-core/src';

import { InstancesDefaultsValues } from './instances.defaults-values';
//#endregion

@Taon.Entity({
  className: 'Instances',
})
export class Instances extends Taon.Base.AbstractEntity<Instances> {
  /**
   * zip file with docker-compose and other files
   * needed to deploy this deployment
   */
  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'varchar',
    length: 45,
    nullable: false,
    unique: true,
  })
  //#endregion
  ipAddress: string;

  //#region @websql
  @Taon.Orm.Column.String200()
  //#endregion
  name: string;
}
