import { TaonBaseMigration } from 'taon';
import { QueryRunner } from 'taon-typeorm';
import { TaonEnv } from '../project/abstract/taon-worker/taon-env.entity';
export declare class TaonProjectsContext_1737301724542_addingSampleData extends TaonBaseMigration {
    repoEnv: import("taon/source").TaonBaseRepository<TaonEnv>;
    /**
     * IMPORTANT !!!
     * remove this method if you are ready to run this migration
     */
    isReadyToRun(): boolean;
    up(queryRunner: QueryRunner): Promise<any>;
    down(queryRunner: QueryRunner): Promise<any>;
}