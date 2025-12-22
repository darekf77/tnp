import { Taon, TaonEntity } from 'taon/src';
import { TaonBaseEntity, PrimaryColumn, Column, BooleanColumn } from 'taon/src';
import { _, CoreModels } from 'tnp-core/src';

@TaonEntity({
  className: 'TaonProject',
  uniqueKeyProp: 'location',
})
export class TaonProject extends TaonBaseEntity {
  static from(
    opt: Omit<TaonProject, 'id' | 'version' | '_' | 'clone'>,
  ): TaonProject {
    return _.merge(new TaonProject(), opt);
  }

  //#region port entity / columns /  serviceId

  //#region @websql
  @PrimaryColumn({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  //#endregion

  location: string;
  //#endregion

  //#region port entity / columns /  type

  //#region @websql
  @Column({
    type: 'varchar',
    length: 20,
  })
  //#endregion

  type: CoreModels.LibType;
  //#endregion

  //#region port entity / columns /  type

  //#region @websql
  @BooleanColumn(false)
  //#endregion

  isTemporary: boolean;
  //#endregion

}
