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
exports.Instances = void 0;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("taon/lib");
//#endregion
let Instances = class Instances extends lib_2.TaonBaseAbstractEntity {
    /**
     * zip file with docker-compose and other files
     * needed to deploy this deployment
     */
    //#region @websql
    //#endregion
    ipAddress;
    //#region @websql
    //#endregion
    name;
};
exports.Instances = Instances;
__decorate([
    (0, lib_2.Column)({
        type: 'varchar',
        length: 45,
        nullable: false,
        unique: true,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], Instances.prototype, "ipAddress", void 0);
__decorate([
    (0, lib_2.String200Column)()
    //#endregion
    ,
    __metadata("design:type", String)
], Instances.prototype, "name", void 0);
exports.Instances = Instances = __decorate([
    (0, lib_1.TaonEntity)({
        className: 'Instances',
    })
], Instances);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/instances/instances.js.map