import { CoreModels } from 'tnp-core/src';

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
    public projectType?: CoreModels.NewFactoryType,
    public frameworkVersion?: CoreModels.FrameworkVersion,
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
