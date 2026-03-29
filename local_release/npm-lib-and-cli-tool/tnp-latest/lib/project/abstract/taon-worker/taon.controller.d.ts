import { Taon } from 'taon';
import { TaonBaseCliWorkerController } from 'tnp-helpers';
import { TaonEnv } from './taon-env.entity';
export declare class TaonProjectsController extends TaonBaseCliWorkerController {
    taonEnvRepo: import("taon/source").TaonBaseRepository<TaonEnv>;
    getEnvironments(): Taon.Response<TaonEnv[]>;
}