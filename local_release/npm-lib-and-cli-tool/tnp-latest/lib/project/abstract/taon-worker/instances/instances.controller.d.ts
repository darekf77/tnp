import { Taon } from 'taon';
import { TaonBaseCliWorkerController } from 'tnp-helpers';
import { Instances } from './instances';
import { InstancesRepository } from './instances.repository';
export declare class InstancesController extends TaonBaseCliWorkerController {
    instancesRepository: InstancesRepository;
    getEntities(): Taon.Response<Instances[]>;
    delete(id: string): Taon.Response<Instances>;
    insertEntity(entity: Instances): Taon.Response<Instances>;
}