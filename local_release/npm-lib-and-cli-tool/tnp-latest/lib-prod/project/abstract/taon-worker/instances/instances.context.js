//#region imports
import { TaonBaseContext, ClassHelpers__NS__getName, Taon__NS__createContextTemplate } from 'taon/lib-prod';
import { TaonBaseMigration, TaonMigration } from 'taon/lib-prod';
import { CoreModels__NS__localhostIp127 } from 'tnp-core/lib-prod';
import { getBaseCliWorkerDatabaseConfig } from 'tnp-helpers/lib-prod';
import { Instances } from './instances';
import { InstancesController } from './instances.controller';
import { InstancesRepository } from './instances.repository';
//#endregion
const appId = 'instances-worker-app.project.worker';
const localhostInstanceName = 'Localhost';
let MigrationLocalhost = class MigrationLocalhost extends TaonBaseMigration {
    instanceRepository = this.injectCustomRepository(InstancesRepository);
    async up(queryRunner) {
        console.log(`[TaonBaseMigration] Running migration UP "${ClassHelpers__NS__getName(this)}"`);
        try {
            await queryRunner.startTransaction();
            await this.instanceRepository.delete({
                ipAddress: CoreModels__NS__localhostIp127,
            });
            await this.instanceRepository.save(new Instances().clone({
                name: localhostInstanceName,
                ipAddress: CoreModels__NS__localhostIp127,
            }));
            await queryRunner.commitTransaction();
            this.ctx.logMigrations &&
                console.log('All migrations marked as applied.');
        }
        catch (error) {
            this.ctx.logMigrations &&
                console.error('Failed to mark all migrations as applied, rolling back:', error);
            await queryRunner.rollbackTransaction();
        }
        finally {
            await queryRunner.release();
        }
    }
    async down(queryRunner) {
        console.log(`[TaonBaseMigration] Running migration DOWN "${ClassHelpers__NS__getName(this)}"`);
        await this.instanceRepository.delete({
            name: localhostInstanceName,
        });
    }
};
MigrationLocalhost = __decorate([
    TaonMigration({
        className: 'MigrationLocalhost',
    })
], MigrationLocalhost);
export const InstancesContext = Taon__NS__createContextTemplate(() => ({
    contextName: 'InstancesContext',
    appId,
    skipWritingServerRoutes: true,
    contexts: { TaonBaseContext },
    repositories: { InstancesRepository },
    entities: { Instances },
    migrations: { MigrationLocalhost },
    logs: {
        migrations: true,
    },
    controllers: { InstancesController },
    ...getBaseCliWorkerDatabaseConfig(appId, 'DROP_DB+MIGRATIONS'),
}));
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/instances/instances.context.js.map