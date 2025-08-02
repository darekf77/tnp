import { Taon } from 'taon/src';
import { CoreModels } from 'tnp-core/src';

@Taon.Entity({
  className: 'TaonEnv',
})
export class TaonEnv extends Taon.Base.AbstractEntity {
  static from(obj: {
    name: string;
    type: CoreModels.EnvironmentNameTaon;
  }): TaonEnv {
    return new TaonEnv().clone(obj);
  }

  //#region fields / type
  //#region @websql
  @Taon.Orm.Column.String()
  //#endregion
  type: CoreModels.EnvironmentNameTaon;
  //#endregion

  //#region fields / name
  //#region @websql
  @Taon.Orm.Column.String()
  //#endregion
  name: string;
  //#endregion
}
