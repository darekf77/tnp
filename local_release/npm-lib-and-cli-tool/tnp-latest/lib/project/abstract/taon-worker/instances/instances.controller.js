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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstancesController = void 0;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-helpers/lib");
const instances_1 = require("./instances");
const instances_repository_1 = require("./instances.repository");
const lib_3 = require("taon/lib");
//#endregion
let InstancesController = class InstancesController extends lib_2.TaonBaseCliWorkerController {
    // @ts-ignore
    instancesRepository = this.injectCustomRepo(instances_repository_1.InstancesRepository);
    getEntities() {
        //#region @backendFunc
        return async (req, res) => {
            // @ts-ignore
            return this.instancesRepository.find();
        };
        //#endregion
    }
    delete(id) {
        //#region @backendFunc
        return async (req, res) => {
            return this.instancesRepository.deleteById(id);
        };
        //#endregion
    }
    insertEntity(entity) {
        return async (req, res) => {
            //#region @backendFunc
            const instance = await this.instancesRepository.save(new instances_1.Instances().clone(entity || {}));
            return instance;
            //#endregion
        };
    }
};
exports.InstancesController = InstancesController;
__decorate([
    (0, lib_3.GET)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], InstancesController.prototype, "getEntities", null);
__decorate([
    (0, lib_3.DELETE)(),
    __param(0, (0, lib_3.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], InstancesController.prototype, "delete", null);
__decorate([
    (0, lib_3.PUT)(),
    __param(0, (0, lib_3.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instances_1.Instances]),
    __metadata("design:returntype", Object)
], InstancesController.prototype, "insertEntity", null);
exports.InstancesController = InstancesController = __decorate([
    (0, lib_1.TaonController)({
        className: 'InstancesController',
    })
], InstancesController);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/instances/instances.controller.js.map