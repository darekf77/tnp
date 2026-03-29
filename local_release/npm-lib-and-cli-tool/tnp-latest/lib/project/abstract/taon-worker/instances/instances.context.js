"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstancesContext = void 0;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("taon/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const instances_1 = require("./instances");
const instances_controller_1 = require("./instances.controller");
const instances_repository_1 = require("./instances.repository");
//#endregion
const appId = 'instances-worker-app.project.worker';
const localhostInstanceName = 'Localhost';
let MigrationLocalhost = class MigrationLocalhost extends lib_2.TaonBaseMigration {
    instanceRepository = this.injectCustomRepository(instances_repository_1.InstancesRepository);
    async up(queryRunner) {
        console.log(`[TaonBaseMigration] Running migration UP "${lib_1.ClassHelpers.getName(this)}"`);
        try {
            await queryRunner.startTransaction();
            await this.instanceRepository.delete({
                ipAddress: lib_3.CoreModels.localhostIp127,
            });
            await this.instanceRepository.save(new instances_1.Instances().clone({
                name: localhostInstanceName,
                ipAddress: lib_3.CoreModels.localhostIp127,
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
        console.log(`[TaonBaseMigration] Running migration DOWN "${lib_1.ClassHelpers.getName(this)}"`);
        await this.instanceRepository.delete({
            name: localhostInstanceName,
        });
    }
};
MigrationLocalhost = __decorate([
    (0, lib_2.TaonMigration)({
        className: 'MigrationLocalhost',
    })
], MigrationLocalhost);
exports.InstancesContext = lib_1.Taon.createContextTemplate(() => ({
    contextName: 'InstancesContext',
    appId,
    skipWritingServerRoutes: true,
    contexts: { TaonBaseContext: lib_1.TaonBaseContext },
    repositories: { InstancesRepository: instances_repository_1.InstancesRepository },
    entities: { Instances: instances_1.Instances },
    migrations: { MigrationLocalhost },
    logs: {
        migrations: true,
    },
    controllers: { InstancesController: instances_controller_1.InstancesController },
    ...(0, lib_4.getBaseCliWorkerDatabaseConfig)(appId, 'DROP_DB+MIGRATIONS'),
}));
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/instances/instances.context.js.map