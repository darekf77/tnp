//#region imports
import { dotVscodeMainProject, packageJsonMainProject } from '../../constants';
import { dotTaonFolder, path, CoreModels__NS__ClassNameStaticProperty } from 'tnp-core/lib-prod';
import { crossPlatformPath } from 'tnp-core/lib-prod';
import { UtilsCliClassMethod__NS__decoratorMethod, UtilsOs__NS__getRealHomeDir } from 'tnp-core/lib-prod';
import { BaseCLiWorkerStartMode, Helpers__NS__exists, Helpers__NS__remove, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__writeJsonC, HelpersTaon__NS__CLIWRAP, UtilsZip__NS__unzipArchive } from 'tnp-helpers/lib-prod';
// import { ProcessWorker } from '../abstract/taon-worker/processes/process/process.worker';
import { BaseCli } from './base-cli';
//#endregion
// @ts-ignore TODO weird inheritance problem
export class $Cloud extends BaseCli {
    static [CoreModels__NS__ClassNameStaticProperty] = '$Cloud';
    async __initialize__() {
        //#region @backendFunc
        const vscodeConfgiDotTaon = {
            'workbench.colorCustomizations': {
                'activityBar.background': '#be464e',
                'statusBar.background': '#be464e',
                'statusBar.debuggingBackground': '#15d8ff',
            },
        };
        Helpers__NS__writeJsonC([
            UtilsOs__NS__getRealHomeDir(),
            dotTaonFolder,
            dotVscodeMainProject,
            'settings.json',
        ], vscodeConfgiDotTaon);
        Helpers__NS__writeJsonC([
            UtilsOs__NS__getRealHomeDir(),
            dotTaonFolder,
            dotVscodeMainProject,
            packageJsonMainProject,
        ], {
            name: 'dot-taon',
            description: 'Taon CLI workspace',
        });
        await super.__initialize__();
        //#endregion
    }
    //#region _
    async _() {
        const { Project } = await import('../abstract/project');
        await Project.ins.taonProjectsWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    ...this.params,
                    mode: BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
                },
                calledFrom: 'cli-CLOUD/$Cloud._',
            },
        });
    }
    //#endregion
    //#region start file deploy
    async startFileDeploy() {
        let zipDeploymentFileAbsPath = this.firstArg;
        if (!zipDeploymentFileAbsPath) {
            throw new Error('You have to provide path to file that should be deployed');
        }
        if (!path.isAbsolute(zipDeploymentFileAbsPath)) {
            throw new Error('You have to provide absolute path to file that should be deployed');
        }
        if (!zipDeploymentFileAbsPath.endsWith('.zip')) {
            throw new Error('Provided file for deployment has to be .zip file');
        }
        if (!Helpers__NS__exists(zipDeploymentFileAbsPath)) {
            throw new Error(`File provided for deployment does not exist: ${zipDeploymentFileAbsPath}`);
        }
        const unpackedZipFolder = zipDeploymentFileAbsPath.replace('.zip', '');
        Helpers__NS__remove(unpackedZipFolder);
        await UtilsZip__NS__unzipArchive(zipDeploymentFileAbsPath);
        const { Project } = await import('../abstract/project');
        const dockerComposeProject = Project.ins.From(unpackedZipFolder);
        if (!dockerComposeProject) {
            throw new Error(`Docker compose project not found inside zip file. Make sure that you zipped the project folder.`);
        }
        if (!dockerComposeProject) {
            throw new Error(`Project not found. You have to be inside project folder to use this command.`);
        }
        await dockerComposeProject.docker.updateDockerComposePorts();
        await dockerComposeProject.docker.removeAllImagesBy_Env_COMPOSE_PROJECT_NAME();
        await new Promise(resolve => {
            dockerComposeProject.docker
                .getDockerComposeActionChildProcess('down')
                .once('exit', () => {
                resolve(void 0);
            })
                .once('error', () => {
                resolve(void 0);
            });
        });
        await new Promise(resolve => {
            dockerComposeProject.docker
                .getDockerComposeActionChildProcess('up')
                .once('exit', () => {
                resolve(void 0);
            })
                .once('error', () => {
                process.exit(1);
            });
        });
        process.exit(0);
    }
    //#endregion
    //#region stop file deploy
    async stopFileDeploy() {
        let zipDeploymentFileAbsPath = this.firstArg;
        if (!zipDeploymentFileAbsPath) {
            throw new Error('You have to provide path to file that should be deployed');
        }
        if (!path.isAbsolute(zipDeploymentFileAbsPath)) {
            throw new Error('You have to provide absolute path to file that should be deployed');
        }
        if (!zipDeploymentFileAbsPath.endsWith('.zip')) {
            throw new Error('Provided file for deployment has to be .zip file');
        }
        if (!Helpers__NS__exists(zipDeploymentFileAbsPath)) {
            throw new Error(`File provided for deployment does not exist: ${zipDeploymentFileAbsPath}`);
        }
        const unpackedZipFolder = zipDeploymentFileAbsPath.replace('.zip', '');
        const { Project } = await import('../abstract/project');
        const dockerComposeProject = Project.ins.From(unpackedZipFolder);
        if (!dockerComposeProject) {
            console.warn(`Docker compose project not found inside zip file. Make sure that you zipped the project folder.`);
            process.exit(0);
        }
        if (!dockerComposeProject) {
            console.warn(`Project not found. You have to be inside project folder to use this command.`);
            process.exit(1);
        }
        await dockerComposeProject.docker.removeAllImagesBy_Env_COMPOSE_PROJECT_NAME();
        const child = dockerComposeProject.docker.getDockerComposeActionChildProcess('down');
        await new Promise(resolve => {
            child.once('exit', () => {
                Helpers__NS__remove(unpackedZipFolder); // cleanup
                resolve(void 0);
            });
        });
        process.exit(0);
    }
    //#endregion
    //#region remove file deploy
    async removeFileDeploy() {
        await this.stopFileDeploy();
        let zipDeploymentFileAbsPath = this.firstArg;
        // remove zip files/json completely
        Helpers__NS__remove(zipDeploymentFileAbsPath);
        Helpers__NS__remove(`${zipDeploymentFileAbsPath}.json`);
    }
    //#endregion
    //#region deployments
    async deployments() {
        // UtilsTerminal__NS__drawBigText('Deployments');
        // await this.project.ins.taonProjectsWorker.deploymentsWorker.startNormallyInCurrentProcess();
        const { Project } = await import('../abstract/project');
        await Project.ins.taonProjectsWorker.deploymentsWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    ...this.params,
                    mode: BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
                },
                calledFrom: 'cli-CLOUD/$Cloud.deployments',
            },
        });
    }
    //#endregion
    //#region instances
    async instances() {
        // UtilsTerminal__NS__drawBigText('Deployments');
        const { Project } = await import('../abstract/project');
        await Project.ins.taonProjectsWorker.instancesWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    ...this.params,
                    mode: BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
                },
                calledFrom: 'cli-CLOUD/$Cloud.instances',
            },
        });
    }
    //#endregion
    //#region processes
    async processes() {
        // UtilsTerminal__NS__drawBigText('Deployments');
        const { Project } = await import('../abstract/project');
        await Project.ins.taonProjectsWorker.processesWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    ...this.params,
                    mode: BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
                },
                calledFrom: 'cli-CLOUD/$Cloud.processes',
            },
        });
    }
    //#endregion
    //#region send
    async send() {
        // await this.project.ins.taonProjectsWorker.deploymentsWorker.startNormallyInCurrentProcess();
        const { Project } = await import('../abstract/project');
        const ctrl = await Project.ins.taonProjectsWorker.deploymentsWorker.getRemoteControllerFor({
            methodOptions: {
                calledFrom: 'cli-CLOUD/$Cloud.send',
            },
        });
        const filePath = path.isAbsolute(this.firstArg)
            ? crossPlatformPath(this.firstArg)
            : crossPlatformPath([this.cwd, this.firstArg]);
        Helpers__NS__taskStarted(`Uploading file "${filePath}" to server...`);
        const data = await ctrl.uploadLocalFileToServer(filePath);
        console.log(data);
        Helpers__NS__taskDone(`Done uploading file "${this.firstArg}" to server`);
        this._exit();
    }
}
__decorate([
    UtilsCliClassMethod__NS__decoratorMethod('startFileDeploy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Cloud.prototype, "startFileDeploy", null);
__decorate([
    UtilsCliClassMethod__NS__decoratorMethod('stopFileDeploy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Cloud.prototype, "stopFileDeploy", null);
__decorate([
    UtilsCliClassMethod__NS__decoratorMethod('removeFileDeploy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Cloud.prototype, "removeFileDeploy", null);
__decorate([
    UtilsCliClassMethod__NS__decoratorMethod('deployments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Cloud.prototype, "deployments", null);
__decorate([
    UtilsCliClassMethod__NS__decoratorMethod('instances'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Cloud.prototype, "instances", null);
__decorate([
    UtilsCliClassMethod__NS__decoratorMethod('processes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Cloud.prototype, "processes", null);
export default {
    $Cloud: HelpersTaon__NS__CLIWRAP($Cloud, '$Cloud'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/cli/cli-CLOUD.js.map