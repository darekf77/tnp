import { TaonController } from 'taon/lib-prod';
import { GET } from 'taon/lib-prod';
import { TaonBaseCliWorkerController } from 'tnp-helpers/lib-prod';
import { TaonEnv } from './taon-env.entity';
//#region ports controller
let TaonProjectsController = class TaonProjectsController extends TaonBaseCliWorkerController {
    taonEnvRepo = this.injectRepo(TaonEnv);
    getEnvironments() {
        //#region @backendFunc
        return async (req, res) => {
            return this.taonEnvRepo.find();
        };
        //#endregion
    }
};
__decorate([
    GET(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], TaonProjectsController.prototype, "getEnvironments", null);
TaonProjectsController = __decorate([
    TaonController({
        className: 'TaonProjectsController',
    })
], TaonProjectsController);
export { TaonProjectsController };
//#endregion
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/taon.controller.js.map