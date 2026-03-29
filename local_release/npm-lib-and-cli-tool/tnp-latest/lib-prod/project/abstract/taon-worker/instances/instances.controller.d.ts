import { Taon__NS__Response } from 'taon/lib-prod';
import { TaonBaseCliWorkerController } from 'tnp-helpers/lib-prod';
import { Instances } from './instances';
import { InstancesRepository } from './instances.repository';
export declare class InstancesController extends TaonBaseCliWorkerController {
    instancesRepository: InstancesRepository;
    getEntities(): Taon__NS__Response<Instances[]>;
    delete(id: string): Taon__NS__Response<Instances>;
    insertEntity(entity: Instances): Taon__NS__Response<Instances>;
}
