//#region imports
import { TaonRepository } from 'taon/lib-prod';
import { Instances } from './instances';
import { TaonBaseRepository } from 'taon/lib-prod';
//#endregion
let InstancesRepository = class InstancesRepository extends TaonBaseRepository {
    entityClassResolveFn = () => Instances;
    testMethod() {
    }
};
InstancesRepository = __decorate([
    TaonRepository({
        className: 'InstancesRepository',
    })
], InstancesRepository);
export { InstancesRepository };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/instances/instances.repository.js.map