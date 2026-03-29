"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentsMiddleware = void 0;
//#region imports
const crypto = require("crypto");
const multer = require("multer");
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-core/lib");
const deployments_constants_1 = require("./deployments.constants");
//#endregion
let DeploymentsMiddleware = class DeploymentsMiddleware extends lib_1.TaonBaseFileUploadMiddleware {
    uploadDir() {
        return deployments_constants_1.DEPLOYMENT_LOCAL_FOLDER_PATH;
    }
    storage() {
        //#region @backendFunc
        const uploadDir = this.uploadDir();
        if (!lib_2.fse.existsSync(uploadDir)) {
            try {
                lib_2.fse.mkdirSync(uploadDir, { recursive: true });
            }
            catch (error) { }
        }
        return multer.diskStorage({
            destination: (_req, _file, cb) => cb(null, uploadDir),
            filename: (_req, file, cb) => {
                const ext = lib_2.path.extname(file.originalname).toLowerCase();
                const base = lib_2.path.basename(file.originalname, ext);
                const uniq = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
                const filenameToProcess = `${base}-${uniq}${ext}`;
                cb(null, filenameToProcess);
            },
        });
        //#endregion
    }
};
exports.DeploymentsMiddleware = DeploymentsMiddleware;
exports.DeploymentsMiddleware = DeploymentsMiddleware = __decorate([
    (0, lib_1.TaonMiddleware)({
        className: 'DeploymentsMiddleware',
    })
], DeploymentsMiddleware);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/deployments/deployments.middleware.js.map