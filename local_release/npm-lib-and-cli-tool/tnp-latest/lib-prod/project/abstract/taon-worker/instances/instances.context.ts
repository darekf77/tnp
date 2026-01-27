//#region imports
import { TaonBaseContext, ClassHelpers__NS__asyncHandler, ClassHelpers__NS__ensureClassConfig, ClassHelpers__NS__ensureMethodConfig, ClassHelpers__NS__getClassConfig, ClassHelpers__NS__getClassFnFromObject, ClassHelpers__NS__getControllerConfigs, ClassHelpers__NS__getFullInternalName, ClassHelpers__NS__getMethodsNames, ClassHelpers__NS__getName, ClassHelpers__NS__getOrginalClass, ClassHelpers__NS__getUniqueKey, ClassHelpers__NS__hasParentClassWithName, ClassHelpers__NS__isContextClassObject, ClassHelpers__NS__setName, Taon__NS__createContext, Taon__NS__createContextTemplate, Taon__NS__error, Taon__NS__getResponseValue, Taon__NS__init, Taon__NS__inject, Taon__NS__isBrowser, Taon__NS__isElectron, Taon__NS__isNode, Taon__NS__isWebSQL, Taon__NS__removeLoader, Taon__NS__Response, Taon__NS__ResponseHtml, Taon__NS__StartParams } from 'taon/lib-prod';
import { TaonBaseMigration,TaonMigration } from 'taon/lib-prod';
import { QueryRunner } from 'taon-typeorm/lib-prod';
import { CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings } from 'tnp-core/lib-prod';
import { getBaseCliWorkerDatabaseConfig } from 'tnp-helpers/lib-prod';

import { Instances } from './instances';
import { InstancesController } from './instances.controller';
import { InstancesRepository } from './instances.repository';

//#endregion

const appId = 'instances-worker-app.project.worker';
const localhostInstanceName = 'Localhost';
@TaonMigration({
  className: 'MigrationLocalhost',
})
class MigrationLocalhost extends TaonBaseMigration {
  instanceRepository = this.injectCustomRepository(InstancesRepository);

  async up(queryRunner: QueryRunner): Promise<any> {
    console.log(
      `[TaonBaseMigration] Running migration UP "${ClassHelpers__NS__getName(this)}"`,
    );

    try {
      await queryRunner.startTransaction();
      await this.instanceRepository.delete({
        ipAddress: CoreModels__NS__localhostIp127,
      });

      await this.instanceRepository.save(
        new Instances().clone({
          name: localhostInstanceName,
          ipAddress: CoreModels__NS__localhostIp127,
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
      `[TaonBaseMigration] Running migration DOWN "${ClassHelpers__NS__getName(this)}"`,
    );
    await this.instanceRepository.delete({
      name: localhostInstanceName,
    });
  }
}

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