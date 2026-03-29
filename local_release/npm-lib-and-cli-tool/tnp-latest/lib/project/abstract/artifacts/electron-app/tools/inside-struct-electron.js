"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsideStructuresElectron = void 0;
const options_1 = require("../../../../../options");
const inside_structures_process_1 = require("../../__helpers__/inside-structures-process");
const inside_struct_electron_app_1 = require("./inside-struct-electron-app");
class InsideStructuresElectron extends inside_structures_process_1.InsideStructuresProcess {
    insideStructAngular13AppNormal;
    // TODO for now WebSQL is not supported in Electron, but it could be added later
    // private insideStructAngular13AppWebsql: InsideStructElectronApp;
    //#region api / recreate
    async init(initOptions) {
        //#region @backendFunc
        initOptions = options_1.EnvOptions.from(initOptions);
        const optionsNormal = initOptions.clone({ build: { websql: false } });
        const optionsWebsql = initOptions.clone({ build: { websql: true } });
        this.insideStructAngular13AppNormal = new inside_struct_electron_app_1.InsideStructElectronApp(this.project, optionsNormal);
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
exports.InsideStructuresElectron = InsideStructuresElectron;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/electron-app/tools/inside-struct-electron.js.map