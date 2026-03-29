import { path } from 'tnp-core/lib-prod';
import { BaseFeatureForProject, Helpers__NS__readFile, Helpers__NS__writeFile } from 'tnp-helpers/lib-prod';
/**
 * Base href can be:
 *
 * '' - for electron release build ( / - doesn't work in file system)
 * '/' - root
 * '/my-base-href/'
 *
 */ // @ts-ignore TODO weird inheritance problem
export class AngularFeBasenameManager extends BaseFeatureForProject {
    rootBaseHref = '/';
    getBaseHrefForGhPages(envOptions) {
        if (envOptions.release.staticPagesCustomRepoUrl) {
            return path.basename(envOptions.release.staticPagesCustomRepoUrl.replace('.git', ''));
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
        let fileContent = Helpers__NS__readFile(fileAbsPath);
        const frontendBaseHref = this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(initOptions);
        fileContent = fileContent
            .replace('<<<TO_REPLACE_BASENAME>>>', frontendBaseHref)
            .replace('<<<TO_REPLACE_PROJ_NAME>>>', this.project.name);
        Helpers__NS__writeFile(fileAbsPath, fileContent);
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/angular-node-app/tools/basename-manager.js.map