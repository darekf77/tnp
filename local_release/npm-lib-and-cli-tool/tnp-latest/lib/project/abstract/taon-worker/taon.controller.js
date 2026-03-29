"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaonProjectsController = void 0;
const lib_1 = require("taon/lib");
const lib_2 = require("taon/lib");
const lib_3 = require("tnp-helpers/lib");
const taon_env_entity_1 = require("./taon-env.entity");
//#region ports controller
let TaonProjectsController = class TaonProjectsController extends lib_3.TaonBaseCliWorkerController {
    taonEnvRepo = this.injectRepo(taon_env_entity_1.TaonEnv);
    getEnvironments() {
        //#region @backendFunc
        return async (req, res) => {
            return this.taonEnvRepo.find();
        };
        //#endregion
    }
};
exports.TaonProjectsController = TaonProjectsController;
__decorate([
    (0, lib_2.GET)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], TaonProjectsController.prototype, "getEnvironments", null);
exports.TaonProjectsController = TaonProjectsController = __decorate([
    (0, lib_1.TaonController)({
        className: 'TaonProjectsController',
    })
], TaonProjectsController);
//#endregion
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/taon.controller.js.map