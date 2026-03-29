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
var TaonEnv_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaonEnv = void 0;
const lib_1 = require("taon/lib");
const lib_2 = require("taon/lib");
const lib_3 = require("tnp-core/lib");
let TaonEnv = TaonEnv_1 = class TaonEnv extends lib_2.TaonBaseAbstractEntity {
    static from(obj) {
        return new TaonEnv_1().clone(obj);
    }
    //#region fields / type
    //#region @websql
    //#endregion
    type;
    //#endregion
    //#region fields / name
    //#region @websql
    //#endregion
    name;
};
exports.TaonEnv = TaonEnv;
__decorate([
    (0, lib_2.StringColumn)()
    //#endregion
    ,
    __metadata("design:type", String)
], TaonEnv.prototype, "type", void 0);
__decorate([
    (0, lib_2.StringColumn)()
    //#endregion
    ,
    __metadata("design:type", String)
], TaonEnv.prototype, "name", void 0);
exports.TaonEnv = TaonEnv = TaonEnv_1 = __decorate([
    (0, lib_1.TaonEntity)({
        className: 'TaonEnv',
    })
], TaonEnv);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/taon-env.entity.js.map