"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsideStructuresLib = void 0;
const options_1 = require("../../../../../options");
const inside_structures_process_1 = require("../../__helpers__/inside-structures-process");
const inside_struct_angular_lib_1 = require("./inside-struct-angular-lib");
class InsideStructuresLib extends inside_structures_process_1.InsideStructuresProcess {
    insideStructAngular13LibNormal;
    insideStructAngular13LibWebsql;
    //#region api / recreate
    async init(initOptions) {
        //#region @backendFunc
        initOptions = options_1.EnvOptions.from(initOptions);
        this.insideStructAngular13LibNormal = new inside_struct_angular_lib_1.InsideStructAngularLib(this.project, initOptions.clone({
            build: { websql: false },
        }));
        this.insideStructAngular13LibWebsql = new inside_struct_angular_lib_1.InsideStructAngularLib(this.project, initOptions.clone({
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
exports.InsideStructuresLib = InsideStructuresLib;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/npm-lib-and-cli-tool/tools/inside-struct-lib.js.map