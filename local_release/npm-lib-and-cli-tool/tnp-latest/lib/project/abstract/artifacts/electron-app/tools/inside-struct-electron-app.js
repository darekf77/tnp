"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsideStructElectronApp = void 0;
const options_1 = require("../../../../../options");
const inside_struct_angular_app_1 = require("../../angular-node-app/tools/inside-struct-angular-app");
//#endregion
class InsideStructElectronApp extends inside_struct_angular_app_1.InsideStructAngularApp {
    getCurrentArtifact() {
        return options_1.ReleaseArtifactTaon.ELECTRON_APP;
    }
}
exports.InsideStructElectronApp = InsideStructElectronApp;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/electron-app/tools/inside-struct-electron-app.js.map