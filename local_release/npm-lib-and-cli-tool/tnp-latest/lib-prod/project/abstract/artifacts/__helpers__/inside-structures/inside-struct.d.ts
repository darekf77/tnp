import { CoreModels__NS__FrameworkVersion, CoreModels__NS__NewFactoryType } from 'tnp-core/lib-prod';
import type { Project } from '../../../project';
export type InsideStructureData = {
    replacement?: Function;
};
export type InsideStructLinkType = (options: InsideStructureData) => string;
export type InsideStructLinkTypePathRep = (options: Omit<InsideStructureData, 'replacement'>) => string;
export type InsideStructEndAction = (options: InsideStructureData) => void;
/**
 * @deprecated
 * This class will exectute algorithm
 * 1. Copy replative pathes to proper destination files/folders
 * 2. Link node_modules to desitnation projects
 */
export declare class InsideStruct {
    relateivePathesFromContainer?: string[];
    projectType?: CoreModels__NS__NewFactoryType;
    frameworkVersion?: CoreModels__NS__FrameworkVersion;
    /**
     * Replace pathes while copying relateivePathesFromContainer
     * to destination project
     */
    pathReplacements: [RegExp, InsideStructLinkTypePathRep][];
    /**
     * Link node_modules to destination project (use template project path)
     * Example: template-app/node_modules -> tmp-apps-for-dist/project-name/node_modules
     */
    linkNodeModulesTo: string[];
    /**
     * Array of link functions [fromRelative, toRelative]
     */
    linksFuncs: [
        /**
         * original real path
         */
        InsideStructLinkType,
        /**
         * destination path
         */
        InsideStructLinkType
    ][];
    endAction?: InsideStructEndAction;
    project: Project;
    static from(options: Partial<InsideStruct>, project: Project): InsideStruct;
    private constructor();
}
