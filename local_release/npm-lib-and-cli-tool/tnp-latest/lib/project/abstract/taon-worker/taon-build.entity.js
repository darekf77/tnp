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
var TaonBuild_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaonBuild = void 0;
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-core/lib");
const options_1 = require("../../../options");
let TaonBuild = TaonBuild_1 = class TaonBuild extends lib_1.TaonBaseAbstractEntity {
    static from(opt) {
        return lib_2._.merge(new TaonBuild_1(), opt);
    }
    //#region port entity / columns /  pid
    //#region @websql
    //#endregion
    processInfoPort;
    //#endregion
    //#region port entity / columns /  serviceId
    //#region @websql
    //#endregion
    projectLocation;
    //#endregion
    //#region port entity / columns /  type
    //#region @websql
    //#endregion
    type;
};
exports.TaonBuild = TaonBuild;
__decorate([
    (0, lib_1.NumberColumn)()
    //#endregion
    ,
    __metadata("design:type", Number)
], TaonBuild.prototype, "processInfoPort", void 0);
__decorate([
    (0, lib_1.Column)({
        type: 'varchar',
        length: 150,
        unique: true,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], TaonBuild.prototype, "projectLocation", void 0);
__decorate([
    (0, lib_1.SimpleJsonColumn)()
    //#endregion
    ,
    __metadata("design:type", options_1.EnvOptions)
], TaonBuild.prototype, "type", void 0);
exports.TaonBuild = TaonBuild = TaonBuild_1 = __decorate([
    (0, lib_1.TaonEntity)({
        className: 'TaonBuild',
    })
], TaonBuild);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/taon-build.entity.js.map