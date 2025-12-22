import { Taon } from 'taon/src';
import {
  TaonBaseAbstractEntity,
  Column,
  NumberColumn,
  SimpleJsonColumn,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { EnvOptions } from '../../../options';

@TaonEntity({
  className: 'TaonBuild',
})
export class TaonBuild extends TaonBaseAbstractEntity {
  static from(
    opt: Omit<TaonBuild, 'id' | 'version' | '_' | 'clone'>,
  ): TaonBuild {
    return _.merge(new TaonBuild(), opt);
  }

  //#region port entity / columns /  pid

  //#region @websql
  @NumberColumn()
  //#endregion
  processInfoPort: number;
  //#endregion

  //#region port entity / columns /  serviceId

  //#region @websql
  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  //#endregion
  projectLocation: string;
  //#endregion

  //#region port entity / columns /  type

  //#region @websql
  @SimpleJsonColumn()
  //#endregion
  type: EnvOptions;
  //#endregion
}
