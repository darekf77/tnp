//#region imports
import { Taon, BaseContext, ClassHelpers } from 'taon/src';
import { QueryRunner } from 'taon-typeorm/src';
import { getBaseCliWorkerDatabaseConfig } from 'tnp-helpers/src';

import { localhostIpAddress } from '../../../../constants';

import { Instances } from './instances';
import { InstancesController } from './instances.controller';
import { InstancesRepository } from './instances.repository';
//#endregion

const appId = 'instances-worker-app.project.worker';

@Taon.Migration({
  className: 'MigrationLocalhost',
})
class MigrationLocalhost extends Taon.Base.Migration {
  instanceRepository = this.injectCustomRepository(InstancesRepository);
  async up(queryRunner: QueryRunner): Promise<any> {
    console.log(
      `[BaseMigration] Running migration UP "${ClassHelpers.getName(this)}"`,
    );

    try {
      await queryRunner.startTransaction();
      await this.instanceRepository.delete({
        ipAddress: localhostIpAddress,
      });

      await this.instanceRepository.save(
        new Instances().clone({
          name: 'Localhost',
          ipAddress: localhostIpAddress,
        }),
      );

      await queryRunner.commitTransaction();
      this.ctx.logMigrations &&
        console.log('All migrations marked as applied.');
    } catch (error) {
      this.ctx.logMigrations &&
        console.error(
          'Failed to mark all migrations as applied, rolling back:',
          error,
        );
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
  async down(queryRunner: QueryRunner): Promise<any> {
    console.log(
      `[BaseMigration] Running migration DOWN "${ClassHelpers.getName(this)}"`,
    );
    await this.instanceRepository.delete({
      ipAddress: localhostIpAddress,
    });
  }
}

export const InstancesContext = Taon.createContextTemplate(() => ({
  contextName: 'InstancesContext',
  appId,
  skipWritingServerRoutes: true,
  contexts: { BaseContext },
  repositories: { InstancesRepository },
  entities: { Instances },
  migrations: { MigrationLocalhost },
  logs: {
    migrations: true,
  },
  controllers: { InstancesController },
  ...getBaseCliWorkerDatabaseConfig(appId, 'DROP_DB+MIGRATIONS'),
}));
