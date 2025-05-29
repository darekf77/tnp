import { EnvOptions } from 'tnp/src';

import { BaseInsideStruct } from '../../__helpers__/inside-structures/structs/base-inside-struct';
import { InsideStructuresProcess } from '../../__helpers__/inside-structures-process';

import { InsideStructElectronApp } from './inside-struct-electron-app';

export class InsideStructuresElectron extends InsideStructuresProcess {
  private insideStructAngular13AppNormal: InsideStructElectronApp;
  private insideStructAngular13AppWebsql: InsideStructElectronApp;

  //#region api / recreate
  public async init(initOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    initOptions = EnvOptions.from(initOptions);

    const optionsNormal = initOptions.clone({ build: { websql: false } });
    const optionsWebsql = initOptions.clone({ build: { websql: true } });

    this.insideStructAngular13AppNormal = new InsideStructElectronApp(
      this.project,
      optionsNormal,
    );
    this.insideStructAngular13AppWebsql = new InsideStructElectronApp(
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
