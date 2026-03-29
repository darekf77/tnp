import { TaonBaseMigration, TaonMigration } from 'taon/lib-prod';
import { TaonEnv } from '../project/abstract/taon-worker/taon-env.entity';
let TaonProjectsContext_1737301724542_addingSampleData = class TaonProjectsContext_1737301724542_addingSampleData extends TaonBaseMigration {
    repoEnv = this.injectRepo(TaonEnv);
    /**
     * IMPORTANT !!!
     * remove this method if you are ready to run this migration
     */
    isReadyToRun() {
        return true;
    }
    // @ts-ignore
    async up(queryRunner) {
        // do "something" in db
        const environmentNames = [
            'dev',
            'dev2',
            'dev3',
            'dev4',
            'dev5',
            'dev6',
            'dev7',
            'dev8',
            'dev9',
            'test',
            'stage',
            'prod',
        ];
        for (const envName of environmentNames) {
            await this.repoEnv.save(TaonEnv.from({
                name: envName,
                type: envName.replace(/[0-9]/g, ''),
            }));
        }
    }
    // @ts-ignore
    async down(queryRunner) {
        // revert this "something" in db
        this.repoEnv.clear();
    }
};
TaonProjectsContext_1737301724542_addingSampleData = __decorate([
    TaonMigration({
        className: 'TaonProjectsContext_1737301724542_addingSampleData',
    })
], TaonProjectsContext_1737301724542_addingSampleData);
export { TaonProjectsContext_1737301724542_addingSampleData };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/migrations/1737301724542_addingSampleData.js.map