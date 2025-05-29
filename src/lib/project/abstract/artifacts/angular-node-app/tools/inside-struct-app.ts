import { EnvOptions } from '../../../../../options';
import { BaseInsideStruct } from '../../__helpers__/inside-structures/structs/base-inside-struct';
import { InsideStructuresProcess } from '../../__helpers__/inside-structures-process';

import { InsideStructAngularApp } from './inside-struct-angular-app';

export class InsideStructuresApp extends InsideStructuresProcess {
  private insideStructAngular13AppNormal: InsideStructAngularApp;
  private insideStructAngular13AppWebsql: InsideStructAngularApp;

  //#region api / recreate
  public async init(initOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    initOptions = EnvOptions.from(initOptions);

    const optionsNormal = initOptions.clone({ build: { websql: false } });
    const optionsWebsql = initOptions.clone({ build: { websql: true } });

    this.insideStructAngular13AppNormal = new InsideStructAngularApp(
      this.project,
      optionsNormal,
    );
    this.insideStructAngular13AppWebsql = new InsideStructAngularApp(
      this.project,
      optionsWebsql,
    );

    const structs: BaseInsideStruct[] = [
      this.insideStructAngular13AppNormal,
      this.insideStructAngular13AppWebsql,
    ];

    await this.process(structs, initOptions);
    //#endregion
  }
  //#endregion
}
