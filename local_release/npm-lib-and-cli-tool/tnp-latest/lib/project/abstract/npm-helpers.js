"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NpmHelpers = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const node_modules_1 = require("./node-modules");
const package_json_1 = require("./package-json");
//#endregion
// @ts-ignore TODO weird inheritance problem
class NpmHelpers extends lib_2.BaseNpmHelpers {
    _nodeModulesType = node_modules_1.NodeModules;
    _packageJsonType = package_json_1.PackageJSON;
    // @ts-ignore TODO weird inheritance problem
    packageJson;
    // @ts-ignore TODO weird inheritance problem
    nodeModules;
    constructor(project) {
        super(project);
        this.packageJson = new this._packageJsonType({ cwd: project.location }, project);
        this.nodeModules = new this._nodeModulesType(project, this);
    }
    //#region last npm version
    /**
     * @deprecated
     */
    get lastNpmVersion() {
        //#region @backendFunc
        let lastVer = void 0;
        try {
            const ver = this.project
                .run(`npm show ${this.project.name} version`, { output: false })
                .sync()
                .toString();
            if (ver) {
                lastVer = ver.trim();
            }
        }
        catch (error) { }
        return lastVer;
        //#endregion
    }
    //#endregion
    //#region check if ready for npm
    checkProjectReadyForNpmRelease() {
        //#region @backendFunc
        const standaloneAndNotCore = !this.project.framework.isCoreProject && this.project.framework;
        const containerNotCore = (this.project.framework.isContainer &&
            !this.project.framework.isCoreProject) ||
            (this.project.framework.isContainer &&
                this.project.framework.isCoreProject &&
                this.project.taonJson.createOnlyTagWhenRelease);
        if (standaloneAndNotCore || containerNotCore) {
            return;
        }
        lib_1.Helpers.error(`Project "${this.project.genericName}" can't be used in npm release`, false, true);
        //#endregion
    }
    //#endregion
    //#region use link as node modules
    /**
     * check whether node_modules installed
     * or linked from core container
     * @returns boolean - true if linked from core container
     */
    get useLinkAsNodeModules() {
        //#region @backendFunc
        if (this.project.taonJson.linkNodeModulesFromCoreContainer) {
            return true;
        }
        if (this.project.framework.isContainerCoreProject &&
            this.project.framework.frameworkVersionAtLeast('v2')) {
            return false;
        }
        if (this.project.taonJson.isUsingOwnNodeModulesInsteadCoreContainer) {
            return false;
        }
        return this.project.framework.isStandaloneProject;
        //#endregion
    }
}
exports.NpmHelpers = NpmHelpers;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/npm-helpers.js.map