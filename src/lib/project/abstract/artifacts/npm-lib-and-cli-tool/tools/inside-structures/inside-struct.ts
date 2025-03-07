import { CoreModels } from 'tnp-core/src';

import type { Project } from '../../../../project';

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
    public pathReplacements: [
      string | RegExp,
      InsideStructLinkTypePathRep,
    ][] = [],
    public linkNodeModulesTo: string[] = [],
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

  public get coreContainer() {
    //#region @backendFunc
    return this.project.ins.by(
      this.projectType,
      this.frameworkVersion,
    ) as Project;
    //#endregion
  }

  recreate(outFolder: CoreModels.OutFolder = 'dist') {}
}
