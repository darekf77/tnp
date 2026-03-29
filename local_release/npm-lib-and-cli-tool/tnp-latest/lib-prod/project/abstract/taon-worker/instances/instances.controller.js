//#region imports
import { TaonController } from 'taon/lib-prod';
import { TaonBaseCliWorkerController } from 'tnp-helpers/lib-prod';
import { Instances } from './instances';
import { InstancesRepository } from './instances.repository';
import { GET, PUT, DELETE, Query, Body } from 'taon/lib-prod';
//#endregion
let InstancesController = class InstancesController extends TaonBaseCliWorkerController {
    // @ts-ignore
    instancesRepository = this.injectCustomRepo(InstancesRepository);
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
            const instance = await this.instancesRepository.save(new Instances().clone(entity || {}));
            return instance;
            //#endregion
        };
    }
};
__decorate([
    GET(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], InstancesController.prototype, "getEntities", null);
__decorate([
    DELETE(),
    __param(0, Query('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], InstancesController.prototype, "delete", null);
__decorate([
    PUT(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Instances]),
    __metadata("design:returntype", Object)
], InstancesController.prototype, "insertEntity", null);
InstancesController = __decorate([
    TaonController({
        className: 'InstancesController',
    })
], InstancesController);
export { InstancesController };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/instances/instances.controller.js.map