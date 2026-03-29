"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsideStruct = void 0;
/**
 * @deprecated
 * This class will exectute algorithm
 * 1. Copy replative pathes to proper destination files/folders
 * 2. Link node_modules to desitnation projects
 */
class InsideStruct {
    relateivePathesFromContainer;
    projectType;
    frameworkVersion;
    pathReplacements;
    linkNodeModulesTo;
    linksFuncs;
    endAction;
    project;
    static from(options, project) {
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
    constructor(relateivePathesFromContainer, projectType, frameworkVersion, 
    /**
     * Replace pathes while copying relateivePathesFromContainer
     * to destination project
     */
    pathReplacements = [], 
    /**
     * Link node_modules to destination project (use template project path)
     * Example: template-app/node_modules -> tmp-apps-for-dist/project-name/node_modules
     */
    linkNodeModulesTo = [], 
    /**
     * Array of link functions [fromRelative, toRelative]
     */
    linksFuncs = [], endAction) {
        this.relateivePathesFromContainer = relateivePathesFromContainer;
        this.projectType = projectType;
        this.frameworkVersion = frameworkVersion;
        this.pathReplacements = pathReplacements;
        this.linkNodeModulesTo = linkNodeModulesTo;
        this.linksFuncs = linksFuncs;
        this.endAction = endAction;
    }
}
exports.InsideStruct = InsideStruct;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/__helpers__/inside-structures/inside-struct.js.map