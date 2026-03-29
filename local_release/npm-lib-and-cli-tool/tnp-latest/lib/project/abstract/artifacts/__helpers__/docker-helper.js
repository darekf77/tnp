"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerHelper = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const lib_3 = require("tnp-helpers/lib");
const constants_1 = require("../../../../constants");
const options_1 = require("../../../../options");
//#endregion
/**
 * @deprecated TODO not needed ?
 * handle dockers image in taon projects
 */
class DockerHelper extends lib_3.BaseDebounceCompilerForProject {
    //#region private methods / get out dir app
    /**
     * Absolute path to the output directory for the app
     */
    getOutDirDockersRelease(buildOptions) {
        let outDirApp = `.${lib_1.config.frameworkName}/${options_1.ReleaseArtifactTaon.ANGULAR_NODE_APP}/` +
            `${buildOptions.release.releaseType ? buildOptions.release.releaseType : options_1.Development}/` +
            `dockers-to-build`;
        return this.project.pathFor(outDirApp);
    }
    //#endregion
    //#region constructor
    constructor(project) {
        super(project, {
            folderPath: project.pathFor([constants_1.srcMainProject, constants_1.DOCKER_FOLDER]),
            taskName: 'MigrationHelper',
            notifyOnFileUnlink: true,
        });
    }
    //#endregion
    //#region getters
    get envOptions() {
        return this.initialParams.envOptions;
    }
    get dockerComposeAbsPath() {
        return this.project.pathFor([
            constants_1.srcMainProject,
            constants_1.DOCKER_FOLDER,
            constants_1.DOCKER_COMPOSE_FILE_NAME,
        ]);
    }
    //#endregion
    //#region rebuild base files
    rebuildBaseFiles() {
        //#region @backendFunc
        return;
        this.project.framework.recreateFileFromCoreProject({
            fileRelativePath: [constants_1.srcMainProject, constants_1.DOCKER_FOLDER, constants_1.dotEnvFile],
        });
        this.project.framework.recreateFileFromCoreProject({
            fileRelativePath: [
                constants_1.srcMainProject,
                constants_1.DOCKER_FOLDER,
                constants_1.DOCKER_COMPOSE_FILE_NAME,
            ],
        });
        this.project.framework.recreateFileFromCoreProject({
            fileRelativePath: [
                constants_1.srcMainProject,
                constants_1.DOCKER_FOLDER,
                'hello-world/Dockerfile',
            ],
        });
        this.project.framework.recreateFileFromCoreProject({
            fileRelativePath: [constants_1.srcMainProject, constants_1.DOCKER_FOLDER, 'hello-world/index.js'],
        });
        const dockerFolder = this.getOutDirDockersRelease(this.envOptions);
        lib_2.Helpers.mkdirp(dockerFolder);
        console.log(`Rebuilding docker files in ${dockerFolder}`);
        //#endregion
    }
    //#endregion
    //#region rebuild
    rebuild(changeOfFiles, asyncEvent) {
        //#region @backendFunc
        lib_2.Helpers.taskStarted(`Rebuilding docker environment`);
        if (!asyncEvent) {
            this.rebuildBaseFiles();
            // console.log('changeOfFiles', changeOfFiles);
            // console.log('env release', this.envOptions.release);
        }
        lib_2.Helpers.taskDone(`Rebuilding docker environment Done`);
        //#endregion
    }
    //#endregion
    //#region action
    action({ changeOfFiles, asyncEvent, }) {
        //#region @backendFunc
        this.rebuild(changeOfFiles, asyncEvent);
        //#endregion
    }
}
exports.DockerHelper = DockerHelper;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/artifacts/__helpers__/docker-helper.js.map