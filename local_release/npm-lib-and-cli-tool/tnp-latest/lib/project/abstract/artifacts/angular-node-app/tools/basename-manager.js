"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngularFeBasenameManager = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
/**
 * Base href can be:
 *
 * '' - for electron release build ( / - doesn't work in file system)
 * '/' - root
 * '/my-base-href/'
 *
 */ // @ts-ignore TODO weird inheritance problem
class AngularFeBasenameManager extends lib_2.BaseFeatureForProject {
    rootBaseHref = '/';
    getBaseHrefForGhPages(envOptions) {
        if (envOptions.release.staticPagesCustomRepoUrl) {
            return lib_1.path.basename(envOptions.release.staticPagesCustomRepoUrl.replace('.git', ''));
        }
        return this.project.name;
    }
    resolveBaseHrefForProj(envOptions) {
        //#region @backendFunc
        const overrideBaseHref = envOptions.build.baseHref;
        let baseHref = this.rootBaseHref;
        if (overrideBaseHref === '') {
            baseHref = overrideBaseHref;
        }
        else {
            if (overrideBaseHref) {
                baseHref = overrideBaseHref;
            }
            else {
                if (envOptions.release.releaseType) {
                    if (envOptions.website.useDomain) {
                        baseHref = this.rootBaseHref;
                    }
                    else {
                        baseHref = `/${this.getBaseHrefForGhPages(envOptions)}/`;
                    }
                }
            }
        }
        return baseHref;
        //#endregion
    }
    getBaseHref(envOptions) {
        //#region @backendFunc
        let baseHref = this.resolveBaseHrefForProj(envOptions);
        // baseHref = baseHref.endsWith('/') ? baseHref : (baseHref + '/');
        // baseHref = baseHref.startsWith('/') ? baseHref : ('/' + baseHref);
        baseHref = baseHref.replace(/\/\//g, '/');
        return baseHref;
        //#endregion
    }
    replaceBaseHrefInFile(fileAbsPath, initOptions) {
        //#region @backendFunc
        let fileContent = lib_2.Helpers.readFile(fileAbsPath);
        const frontendBaseHref = this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(initOptions);
        fileContent = fileContent
            .replace('<<<TO_REPLACE_BASENAME>>>', frontendBaseHref)
            .replace('<<<TO_REPLACE_PROJ_NAME>>>', this.project.name);
        lib_2.Helpers.writeFile(fileAbsPath, fileContent);
        //#endregion
    }
}
exports.AngularFeBasenameManager = AngularFeBasenameManager;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/angular-node-app/tools/basename-manager.js.map