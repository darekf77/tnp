import { Taon, TaonEntity } from 'taon/src';
import { TaonBaseAbstractEntity, StringColumn } from 'taon/src';
import { CoreModels } from 'tnp-core/src';

@TaonEntity({
  className: 'TaonEnv',
})
export class TaonEnv extends TaonBaseAbstractEntity {
  static from(obj: {
    name: string;
    type: CoreModels.EnvironmentNameTaon;
  }): TaonEnv {
    return new TaonEnv().clone(obj);
  }

  //#region fields / type

  //#region @websql
  @StringColumn()
  //#endregion

  type: CoreModels.EnvironmentNameTaon;
  //#endregion

  //#region fields / name

  //#region @websql
  @StringColumn()
  //#endregion

  name: string;
  //#endregion

}
