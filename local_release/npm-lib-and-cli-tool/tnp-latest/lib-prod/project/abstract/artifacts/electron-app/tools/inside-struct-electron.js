import { EnvOptions } from '../../../../../options';
import { InsideStructuresProcess } from '../../__helpers__/inside-structures-process';
import { InsideStructElectronApp } from './inside-struct-electron-app';
export class InsideStructuresElectron extends InsideStructuresProcess {
    insideStructAngular13AppNormal;
    // TODO for now WebSQL is not supported in Electron, but it could be added later
    // private insideStructAngular13AppWebsql: InsideStructElectronApp;
    //#region api / recreate
    async init(initOptions) {
        //#region @backendFunc
        initOptions = EnvOptions.from(initOptions);
        const optionsNormal = initOptions.clone({ build: { websql: false } });
        const optionsWebsql = initOptions.clone({ build: { websql: true } });
        this.insideStructAngular13AppNormal = new InsideStructElectronApp(this.project, optionsNormal);
        // this.insideStructAngular13AppWebsql = new InsideStructElectronApp(
        //   this.project,
        //   optionsWebsql,
        // );
        const structs = [
            this.insideStructAngular13AppNormal,
            // this.insideStructAngular13AppWebsql,
        ];
        await this.process(structs, initOptions);
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/electron-app/tools/inside-struct-electron.js.map