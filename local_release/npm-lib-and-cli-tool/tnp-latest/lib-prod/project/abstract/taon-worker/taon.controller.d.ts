import { Taon__NS__Response } from 'taon/lib-prod';
import { TaonBaseCliWorkerController } from 'tnp-helpers/lib-prod';
import { TaonEnv } from './taon-env.entity';
export declare class TaonProjectsController extends TaonBaseCliWorkerController {
    taonEnvRepo: import("taon/lib-prod").TaonBaseRepository<TaonEnv>;
    getEnvironments(): Taon__NS__Response<TaonEnv[]>;
}
