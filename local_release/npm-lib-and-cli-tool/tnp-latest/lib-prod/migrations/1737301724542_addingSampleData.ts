import { TaonBaseMigration, TaonMigration, Taon__NS__createContext, Taon__NS__createContextTemplate, Taon__NS__error, Taon__NS__getResponseValue, Taon__NS__init, Taon__NS__inject, Taon__NS__isBrowser, Taon__NS__isElectron, Taon__NS__isNode, Taon__NS__isWebSQL, Taon__NS__removeLoader, Taon__NS__Response, Taon__NS__ResponseHtml, Taon__NS__StartParams } from 'taon/lib-prod';
import { QueryRunner } from 'taon-typeorm/lib-prod';
import { CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings } from 'tnp-core/lib-prod';

import { TaonEnv } from '../project/abstract/taon-worker/taon-env.entity';

@TaonMigration({
  className: 'TaonProjectsContext_1737301724542_addingSampleData',
})
export class TaonProjectsContext_1737301724542_addingSampleData extends TaonBaseMigration {
  repoEnv = this.injectRepo(TaonEnv);

  /**
   * IMPORTANT !!!
   * remove this method if you are ready to run this migration
   */
  public isReadyToRun(): boolean {
    return true;
  }

  // @ts-ignore
  async up(queryRunner: QueryRunner): Promise<any> {
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
      await this.repoEnv.save(
        TaonEnv.from({
          name: envName,
          type: envName.replace(/[0-9]/g, '') as CoreModels__NS__EnvironmentNameTaon,
        }),
      );
    }
  }

  // @ts-ignore
  async down(queryRunner: QueryRunner): Promise<any> {
    // revert this "something" in db
    this.repoEnv.clear();
  }
}