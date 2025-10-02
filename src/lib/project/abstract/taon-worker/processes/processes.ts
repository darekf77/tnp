//#region imports
import { Taon } from 'taon/src';
import { _ } from 'tnp-core/src';

import { ProcessesDefaultsValues } from './processes.defaults-values';
import { ProcessState } from './processes.models';
//#endregion

@Taon.Entity({
  className: 'Processes',
  createTable: true,
})
export class Processes extends Taon.Base.AbstractEntity<Processes> {
  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'varchar',
    length: 500,
  })
  //#endregion
  command: string;

  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'varchar',
    length: 1000,
  })
  //#endregion
  cwd: string;

  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'varchar',
    length: 10,
    default: 'created',
  })
  //#endregion
  state: ProcessState;

  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'int',
    default: null,
  })
  //#endregion
  pid: number;

  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'int',
    default: null,
  })
  //#endregion
  ppid: number;

  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'text',
    default: '',
  })
  //#endregion
  output: string;
}
