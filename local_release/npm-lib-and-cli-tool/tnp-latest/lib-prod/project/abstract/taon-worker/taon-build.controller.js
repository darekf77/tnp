import { TaonController } from 'taon/lib-prod';
import { TaonBaseCrudController } from 'taon/lib-prod';
import { TaonBuild } from './taon-build.entity';
//#region port entity
let TaonBuildController = class TaonBuildController extends TaonBaseCrudController {
    entityClassResolveFn = () => TaonBuild;
};
TaonBuildController = __decorate([
    TaonController({
        className: 'TaonBuildController',
    })
], TaonBuildController);
export { TaonBuildController };
//#endregion
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/taon-build.controller.js.map