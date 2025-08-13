//#region imports
import { Taon } from 'taon/src';
import { _ } from 'tnp-core/src';

import { DeploymentsDefaultsValues } from './deployments.defaults-values';
//#endregion

@Taon.Entity({
  className: 'Deployments',
})
export class Deployments extends Taon.Base.AbstractEntity<Deployments> {
  /**
   * zip file with docker-compose and other files
   * needed to deploy this deployment
   */
  //#region @websql
  @Taon.Orm.Column.String(DeploymentsDefaultsValues.zipFileURL, 500)
  //#endregion
  zipFileURL?: string;

  //#region @websql
  @Taon.Orm.Column.String(DeploymentsDefaultsValues.deploymentNameFromZip, 200)
  //#endregion
  deploymentNameFromZip?: string;

  //#region @websql
  @Taon.Orm.Column.String(DeploymentsDefaultsValues.deploymentDescriptionFromZip, 500)
  //#endregion
  deploymentDescriptionFromZip?: string;

  //#region @websql
  // @ts-ignore
  @Taon.Orm.Column.DateTIme()
  //#endregion
  arrivalDate?: Date;
}
