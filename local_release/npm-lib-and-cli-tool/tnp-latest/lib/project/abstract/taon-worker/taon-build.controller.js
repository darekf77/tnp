"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaonBuildController = void 0;
const lib_1 = require("taon/lib");
const lib_2 = require("taon/lib");
const taon_build_entity_1 = require("./taon-build.entity");
//#region port entity
let TaonBuildController = class TaonBuildController extends lib_2.TaonBaseCrudController {
    entityClassResolveFn = () => taon_build_entity_1.TaonBuild;
};
exports.TaonBuildController = TaonBuildController;
exports.TaonBuildController = TaonBuildController = __decorate([
    (0, lib_1.TaonController)({
        className: 'TaonBuildController',
    })
], TaonBuildController);
//#endregion
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/taon-build.controller.js.map