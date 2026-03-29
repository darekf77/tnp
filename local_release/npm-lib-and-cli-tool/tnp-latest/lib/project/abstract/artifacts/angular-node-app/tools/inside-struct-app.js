"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsideStructuresApp = void 0;
const options_1 = require("../../../../../options");
const inside_structures_process_1 = require("../../__helpers__/inside-structures-process");
const inside_struct_angular_app_1 = require("./inside-struct-angular-app");
class InsideStructuresApp extends inside_structures_process_1.InsideStructuresProcess {
    insideStructAngular13AppNormal;
    insideStructAngular13AppWebsql;
    //#region api / recreate
    async init(initOptions) {
        //#region @backendFunc
        initOptions = options_1.EnvOptions.from(initOptions);
        this.insideStructAngular13AppNormal = new inside_struct_angular_app_1.InsideStructAngularApp(this.project, initOptions.clone({
            build: { websql: false },
        }));
        this.insideStructAngular13AppWebsql = new inside_struct_angular_app_1.InsideStructAngularApp(this.project, initOptions.clone({
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
exports.InsideStructuresApp = InsideStructuresApp;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/angular-node-app/tools/inside-struct-app.js.map