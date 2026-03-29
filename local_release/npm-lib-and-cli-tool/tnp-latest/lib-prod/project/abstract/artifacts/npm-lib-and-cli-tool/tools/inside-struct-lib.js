import { EnvOptions } from '../../../../../options';
import { InsideStructuresProcess } from '../../__helpers__/inside-structures-process';
import { InsideStructAngularLib } from './inside-struct-angular-lib';
export class InsideStructuresLib extends InsideStructuresProcess {
    insideStructAngular13LibNormal;
    insideStructAngular13LibWebsql;
    //#region api / recreate
    async init(initOptions) {
        //#region @backendFunc
        initOptions = EnvOptions.from(initOptions);
        this.insideStructAngular13LibNormal = new InsideStructAngularLib(this.project, initOptions.clone({
            build: { websql: false },
        }));
        this.insideStructAngular13LibWebsql = new InsideStructAngularLib(this.project, initOptions.clone({
            build: { websql: true },
        }));
        const structs = [
            this.insideStructAngular13LibNormal,
            this.insideStructAngular13LibWebsql,
        ];
        await this.process(structs, initOptions);
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/npm-lib-and-cli-tool/tools/inside-struct-lib.js.map