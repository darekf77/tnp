//#region imports
import { Taon } from 'taon/src';
import { _, chalk, dateformat } from 'tnp-core/src';

import { ProcessesDefaultsValues } from './processes.defaults-values';
import { ProcessesState } from './processes.models';
//#endregion

@Taon.Entity({
  className: 'Processes',
  createTable: true,
})
export class Processes extends Taon.Base.AbstractEntity<Processes> {
  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'varchar',
    length: 1500,
    nullable: false,
  })
  //#endregion
  command: string;

  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'varchar',
    length: 500,
    default: process.cwd(),
  })
  //#endregion
  cwd: string;

  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'varchar',
    length: 20,
    default: ProcessesState.NOT_STARTED,
    nullable: false,
  })
  //#endregion
  state: ProcessesState;

  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'int',
    default: null,
    nullable: true,
  })
  //#endregion
  pid: number;

  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'int',
    default: null,
    nullable: true,
  })
  //#endregion
  ppid: number;

  //#region @websql
  @Taon.Orm.Column.SimpleJson()
  //#endregion
  conditionProcessActiveStdout: string[];

  //#region @websql
  @Taon.Orm.Column.SimpleJson()
  //#endregion
  conditionProcessActiveStderr: string[];

  //#region @websql
  @Taon.Orm.Column.Custom({
    type: 'text',
    default: '',
  })
  //#endregion
  /**
   * last 40 lines of output
   * (combined stdout + stderr)
   */
  outputLast40lines: string;

  //#region @websql
  @Taon.Orm.Column.String500()
  //#endregion
  /**
   * absolute path to file where stdout + stderr is logged
   */
  fileLogAbsPath: string;

  //#region getters / preview string
  get previewString(): string {
    return `${this.id} ${this.command} in ${this.cwd} `;
  }
  //#endregion

  fullPreviewString(options?: { boldValues?: boolean }): string {
    //#region @websqlFunc
    options = options || {};
    const boldValues = !!options.boldValues;

    const boldFn = (str: string | number) =>
      boldValues ? chalk.bold(str?.toString()) : str;

    const processFromDB = this;

    return `
  > id: ${boldFn(processFromDB.id)}
  > cwd: ${boldFn(processFromDB.cwd)}
  > command: ${boldFn(processFromDB.command)}
  > state: ${boldFn(processFromDB.state)}
  > pid: ${boldFn(processFromDB.pid)}
  > ppid: ${boldFn(processFromDB.ppid)}
  > log path: ${boldFn(processFromDB.fileLogAbsPath)}
  > conditionProcessActiveStdout: ${boldFn((processFromDB.conditionProcessActiveStdout || []).join(', ') || '<empty>')}
  > conditionProcessActiveStderr: ${boldFn((processFromDB.conditionProcessActiveStderr || []).join(', ') || '<empty>')}
    `;
    //#endregion
  }
}
