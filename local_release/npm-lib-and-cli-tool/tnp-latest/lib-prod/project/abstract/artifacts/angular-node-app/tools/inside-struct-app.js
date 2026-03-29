import { EnvOptions } from '../../../../../options';
import { InsideStructuresProcess } from '../../__helpers__/inside-structures-process';
import { InsideStructAngularApp } from './inside-struct-angular-app';
export class InsideStructuresApp extends InsideStructuresProcess {
    insideStructAngular13AppNormal;
    insideStructAngular13AppWebsql;
    //#region api / recreate
    async init(initOptions) {
        //#region @backendFunc
        initOptions = EnvOptions.from(initOptions);
        this.insideStructAngular13AppNormal = new InsideStructAngularApp(this.project, initOptions.clone({
            build: { websql: false },
        }));
        this.insideStructAngular13AppWebsql = new InsideStructAngularApp(this.project, initOptions.clone({
            build: { websql: true },
        }));
        const structs = [
            this.insideStructAngular13AppNormal,
            this.insideStructAngular13AppWebsql,
        ];
        await this.process(structs, initOptions);
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/angular-node-app/tools/inside-struct-app.js.map