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
var TaonProject_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaonProject = void 0;
const lib_1 = require("taon/lib");
const lib_2 = require("taon/lib");
const lib_3 = require("tnp-core/lib");
let TaonProject = TaonProject_1 = class TaonProject extends lib_2.TaonBaseEntity {
    static from(opt) {
        return lib_3._.merge(new TaonProject_1(), opt);
    }
    //#region port entity / columns /  serviceId
    //#region @websql
    //#endregion
    location;
    //#endregion
    //#region port entity / columns /  type
    //#region @websql
    //#endregion
    type;
    //#endregion
    //#region port entity / columns /  type
    //#region @websql
    //#endregion
    isTemporary;
};
exports.TaonProject = TaonProject;
__decorate([
    (0, lib_2.PrimaryColumn)({
        type: 'varchar',
        length: 150,
        unique: true,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], TaonProject.prototype, "location", void 0);
__decorate([
    (0, lib_2.Column)({
        type: 'varchar',
        length: 20,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], TaonProject.prototype, "type", void 0);
__decorate([
    (0, lib_2.BooleanColumn)(false)
    //#endregion
    ,
    __metadata("design:type", Boolean)
], TaonProject.prototype, "isTemporary", void 0);
exports.TaonProject = TaonProject = TaonProject_1 = __decorate([
    (0, lib_1.TaonEntity)({
        className: 'TaonProject',
        uniqueKeyProp: 'location',
    })
], TaonProject);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/taon-project.entity.js.map