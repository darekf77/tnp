import { EnvOptions } from '../../../../../options';
import { BaseInsideStruct } from '../../__helpers__/inside-structures/structs/base-inside-struct';
import { InsideStructuresProcess } from '../../__helpers__/inside-structures-process';

import { InsideStructAngularLib } from './inside-struct-angular-lib';

export class InsideStructuresLib extends InsideStructuresProcess {
  private insideStructAngular13LibNormal: InsideStructAngularLib;

  private insideStructAngular13LibWebsql: InsideStructAngularLib;

  //#region api / recreate
  public async init(initOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    initOptions = EnvOptions.from(initOptions);

    this.insideStructAngular13LibNormal = new InsideStructAngularLib(
      this.project,
      initOptions.clone({
        build: { websql: false },
      }),
    );

    this.insideStructAngular13LibWebsql = new InsideStructAngularLib(
      this.project,
      initOptions.clone({
        build: { websql: true },
      }),
    );

    const structs: BaseInsideStruct[] = [
      this.insideStructAngular13LibNormal,
      this.insideStructAngular13LibWebsql,
    ];
    await this.process(structs, initOptions);
    //#endregion
  }
  //#endregion
}