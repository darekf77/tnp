"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtifactsGlobalHelper = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const constants_1 = require("../../../../constants");
const lib_4 = require("magic-renamer/lib");
//#endregion
/**
 * Global helper for artifacts
 */
class ArtifactsGlobalHelper {
    project;
    branding;
    constructor(project) {
        this.project = project;
        //#region @backend
        this.branding = new (require('./branding').Branding)(project);
        //#endregion
        // this.docker = new DockerHelper(project); /// TODO @UNCOMMENT when docker is ready
    }
    //#region add sources from core
    addSrcFolderFromCoreProject() {
        //#region @backend
        const corePath = this.project.framework.coreProject.pathFor(constants_1.srcMainProject);
        const dest = this.project.pathFor(constants_1.srcMainProject);
        lib_3.HelpersTaon.copy(corePath, dest, {
            recursive: true,
            overwrite: true,
            // filter: src => {
            //   return [appTsFromSrc, appVscodeTsFromSrc].includes(path.basename(src));
            // },
        });
        lib_1.UtilsFilesFoldersSync.getFilesFrom(dest, {
            recursive: true,
            followSymlinks: false,
        }).forEach(f => {
            let content = lib_2.Helpers.readFile(f);
            const rules = lib_4.RenameRule.from(`${this.project.framework.coreProject.name} => ${this.project.name}`);
            for (const rule of rules) {
                content = rule.replaceInString(content);
            }
            // content = content.replace(/from 'tnp-core\/src/g, `from '${config.npmScope}/core/source`);
            // content = content.replace(/from "tnp-core\/src/g, `from "${config.npmScope}/core/source`);
            lib_2.Helpers.writeFile(f, content);
        });
        //#endregion
    }
    //#endregion
    //#region getters & methods / remove (m)js.map files from release
    /**
     * because of that
     * In vscode there is a mess..
     * TODO
     */
    __removeJsMapsFrom(absPathReleaseDistFolder) {
        //#region @backendFunc
        return; // TODO not a good idea
        lib_2.Helpers.filesFrom(absPathReleaseDistFolder, true)
            .filter(f => f.endsWith('.js.map') || f.endsWith('.mjs.map'))
            .forEach(f => lib_2.Helpers.removeFileIfExists(f));
        //#endregion
    }
}
exports.ArtifactsGlobalHelper = ArtifactsGlobalHelper;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/__helpers__/artifacts-helpers.js.map