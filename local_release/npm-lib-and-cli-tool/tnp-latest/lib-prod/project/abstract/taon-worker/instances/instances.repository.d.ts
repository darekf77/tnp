import { Instances } from './instances';
import { TaonBaseRepository } from 'taon/lib-prod';
export declare class InstancesRepository extends TaonBaseRepository<Instances> {
    entityClassResolveFn: () => typeof Instances;
    testMethod(): void;
}
