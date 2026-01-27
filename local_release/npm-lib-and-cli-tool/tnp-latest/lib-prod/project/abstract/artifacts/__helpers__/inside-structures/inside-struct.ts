import { CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings } from 'tnp-core/lib-prod';

import type { Project } from '../../../project';

export type InsideStructureData = {
  replacement?: Function;
};

export type InsideStructLinkType = (options: InsideStructureData) => string;
export type InsideStructLinkTypePathRep = (
  options: Omit<InsideStructureData, 'replacement'>,
) => string;
export type InsideStructEndAction = (options: InsideStructureData) => void;

/**
 * @deprecated
 * This class will exectute algorithm
 * 1. Copy replative pathes to proper destination files/folders
 * 2. Link node_modules to desitnation projects
 */
export class InsideStruct {
  project: Project;
  static from(options: Partial<InsideStruct>, project: Project) {
    const obj = new InsideStruct();
    Object.keys(options).forEach(key => {
      const v = options[key];
      if (!!v) {
        obj[key] = v;
      }
    });
    obj.project = project;
    return obj;
  }

  private constructor(
    public relateivePathesFromContainer?: string[],
    public projectType?: CoreModels__NS__NewFactoryType,
    public frameworkVersion?: CoreModels__NS__FrameworkVersion,
    /**
     * Replace pathes while copying relateivePathesFromContainer
     * to destination project
     */
    public pathReplacements: [RegExp, InsideStructLinkTypePathRep][] = [],
    /**
     * Link node_modules to destination project (use template project path)
     * Example: template-app/node_modules -> tmp-apps-for-dist/project-name/node_modules
     */
    public linkNodeModulesTo: string[] = [],
    /**
     * Array of link functions [fromRelative, toRelative]
     */
    public linksFuncs: [
      /**
       * original real path
       */
      InsideStructLinkType,
      /**
       * destination path
       */
      InsideStructLinkType,
    ][] = [],
    public endAction?: InsideStructEndAction,
  ) {}
}