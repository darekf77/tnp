//#region imports
import { UtilsFilesFoldersSync__NS__getFilesFrom } from 'tnp-core/lib-prod';
import { Helpers__NS__filesFrom, Helpers__NS__readFile, Helpers__NS__removeFileIfExists, Helpers__NS__writeFile } from 'tnp-core/lib-prod';
import { HelpersTaon__NS__copy } from 'tnp-helpers/lib-prod';
import { srcMainProject, } from '../../../../constants';
import { RenameRule } from 'magic-renamer/lib-prod';
//#endregion
/**
 * Global helper for artifacts
 */
export class ArtifactsGlobalHelper {
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
        const corePath = this.project.framework.coreProject.pathFor(srcMainProject);
        const dest = this.project.pathFor(srcMainProject);
        HelpersTaon__NS__copy(corePath, dest, {
            recursive: true,
            overwrite: true,
            // filter: src => {
            //   return [appTsFromSrc, appVscodeTsFromSrc].includes(path.basename(src));
            // },
        });
        UtilsFilesFoldersSync__NS__getFilesFrom(dest, {
            recursive: true,
            followSymlinks: false,
        }).forEach(f => {
            let content = Helpers__NS__readFile(f);
            const rules = RenameRule.from(`${this.project.framework.coreProject.name} => ${this.project.name}`);
            for (const rule of rules) {
                content = rule.replaceInString(content);
            }
            // content = content.replace(/from 'tnp-core\/src/g, `from '${config.npmScope}/core/source`);
            // content = content.replace(/from "tnp-core\/src/g, `from "${config.npmScope}/core/source`);
            Helpers__NS__writeFile(f, content);
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
        Helpers__NS__filesFrom(absPathReleaseDistFolder, true)
            .filter(f => f.endsWith('.js.map') || f.endsWith('.mjs.map'))
            .forEach(f => Helpers__NS__removeFileIfExists(f));
        //#endregion
    }
}
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/__helpers__/artifacts-helpers.js.map