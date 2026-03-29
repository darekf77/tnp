import { config } from 'tnp-core/lib-prod';
import { Helpers__NS__mkdirp, Helpers__NS__taskDone, Helpers__NS__taskStarted } from 'tnp-helpers/lib-prod';
import { BaseDebounceCompilerForProject, } from 'tnp-helpers/lib-prod';
import { DOCKER_COMPOSE_FILE_NAME, DOCKER_FOLDER, dotEnvFile, srcMainProject, } from '../../../../constants';
import { Development, ReleaseArtifactTaon, } from '../../../../options';
//#endregion
/**
 * @deprecated TODO not needed ?
 * handle dockers image in taon projects
 */
export class DockerHelper extends BaseDebounceCompilerForProject {
    //#region private methods / get out dir app
    /**
     * Absolute path to the output directory for the app
     */
    getOutDirDockersRelease(buildOptions) {
        let outDirApp = `.${config.frameworkName}/${ReleaseArtifactTaon.ANGULAR_NODE_APP}/` +
            `${buildOptions.release.releaseType ? buildOptions.release.releaseType : Development}/` +
            `dockers-to-build`;
        return this.project.pathFor(outDirApp);
    }
    //#endregion
    //#region constructor
    constructor(project) {
        super(project, {
            folderPath: project.pathFor([srcMainProject, DOCKER_FOLDER]),
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
            srcMainProject,
            DOCKER_FOLDER,
            DOCKER_COMPOSE_FILE_NAME,
        ]);
    }
    //#endregion
    //#region rebuild base files
    rebuildBaseFiles() {
        //#region @backendFunc
        return;
        this.project.framework.recreateFileFromCoreProject({
            fileRelativePath: [srcMainProject, DOCKER_FOLDER, dotEnvFile],
        });
        this.project.framework.recreateFileFromCoreProject({
            fileRelativePath: [
                srcMainProject,
                DOCKER_FOLDER,
                DOCKER_COMPOSE_FILE_NAME,
            ],
        });
        this.project.framework.recreateFileFromCoreProject({
            fileRelativePath: [
                srcMainProject,
                DOCKER_FOLDER,
                'hello-world/Dockerfile',
            ],
        });
        this.project.framework.recreateFileFromCoreProject({
            fileRelativePath: [srcMainProject, DOCKER_FOLDER, 'hello-world/index.js'],
        });
        const dockerFolder = this.getOutDirDockersRelease(this.envOptions);
        Helpers__NS__mkdirp(dockerFolder);
        console.log(`Rebuilding docker files in ${dockerFolder}`);
        //#endregion
    }
    //#endregion
    //#region rebuild
    rebuild(changeOfFiles, asyncEvent) {
        //#region @backendFunc
        Helpers__NS__taskStarted(`Rebuilding docker environment`);
        if (!asyncEvent) {
            this.rebuildBaseFiles();
            // console.log('changeOfFiles', changeOfFiles);
            // console.log('env release', this.envOptions.release);
        }
        Helpers__NS__taskDone(`Rebuilding docker environment Done`);
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/artifacts/__helpers__/docker-helper.js.map