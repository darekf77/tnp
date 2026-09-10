import { Taon, TaonEntity } from 'taon/src';
import { TaonBaseAbstractEntity, StringColumn } from 'taon/src';
import { CoreModels, UtilsEnv } from 'tnp-core/src';

@TaonEntity({
  className: 'TaonEnv',
})
export class TaonEnv extends TaonBaseAbstractEntity {
  static from(obj: {
    name: string;
    type: UtilsEnv.EnvironmentNameTaon;
  }): TaonEnv {
    return new TaonEnv().clone(obj);
  }

  //#region fields / type

  //#region @websql
  @StringColumn()
  //#endregion

  type: UtilsEnv.EnvironmentNameTaon;
  //#endregion

  //#region fields / name

  //#region @websql
  @StringColumn()
  //#endregion

  name: string;
  //#endregion

}
