import { TaonBaseMigration } from 'taon/lib-prod';
import { QueryRunner } from 'taon-typeorm/lib-prod';
import { TaonEnv } from '../project/abstract/taon-worker/taon-env.entity';
export declare class TaonProjectsContext_1737301724542_addingSampleData extends TaonBaseMigration {
    repoEnv: import("taon/lib-prod").TaonBaseRepository<TaonEnv>;
    /**
     * IMPORTANT !!!
     * remove this method if you are ready to run this migration
     */
    isReadyToRun(): boolean;
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}
