"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.$Cloud = void 0;
//#region imports
const constants_1 = require("../../constants");
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
// import { ProcessWorker } from '../abstract/taon-worker/processes/process/process.worker';
const base_cli_1 = require("./base-cli");
//#endregion
// @ts-ignore TODO weird inheritance problem
class $Cloud extends base_cli_1.BaseCli {
    static [lib_1.CoreModels.ClassNameStaticProperty] = '$Cloud';
    async __initialize__() {
        //#region @backendFunc
        const vscodeConfgiDotTaon = {
            'workbench.colorCustomizations': {
                'activityBar.background': '#be464e',
                'statusBar.background': '#be464e',
                'statusBar.debuggingBackground': '#15d8ff',
            },
        };
        lib_4.Helpers.writeJsonC([
            lib_3.UtilsOs.getRealHomeDir(),
            lib_1.dotTaonFolder,
            constants_1.dotVscodeMainProject,
            'settings.json',
        ], vscodeConfgiDotTaon);
        lib_4.Helpers.writeJsonC([
            lib_3.UtilsOs.getRealHomeDir(),
            lib_1.dotTaonFolder,
            constants_1.dotVscodeMainProject,
            constants_1.packageJsonMainProject,
        ], {
            name: 'dot-taon',
            description: 'Taon CLI workspace',
        });
        await super.__initialize__();
        //#endregion
    }
    //#region _
    async _() {
        const { Project } = await Promise.resolve().then(() => require('../abstract/project'));
        await Project.ins.taonProjectsWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    ...this.params,
                    mode: lib_4.BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
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
        if (!lib_1.path.isAbsolute(zipDeploymentFileAbsPath)) {
            throw new Error('You have to provide absolute path to file that should be deployed');
        }
        if (!zipDeploymentFileAbsPath.endsWith('.zip')) {
            throw new Error('Provided file for deployment has to be .zip file');
        }
        if (!lib_4.Helpers.exists(zipDeploymentFileAbsPath)) {
            throw new Error(`File provided for deployment does not exist: ${zipDeploymentFileAbsPath}`);
        }
        const unpackedZipFolder = zipDeploymentFileAbsPath.replace('.zip', '');
        lib_4.Helpers.remove(unpackedZipFolder);
        await lib_4.UtilsZip.unzipArchive(zipDeploymentFileAbsPath);
        const { Project } = await Promise.resolve().then(() => require('../abstract/project'));
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
        if (!lib_1.path.isAbsolute(zipDeploymentFileAbsPath)) {
            throw new Error('You have to provide absolute path to file that should be deployed');
        }
        if (!zipDeploymentFileAbsPath.endsWith('.zip')) {
            throw new Error('Provided file for deployment has to be .zip file');
        }
        if (!lib_4.Helpers.exists(zipDeploymentFileAbsPath)) {
            throw new Error(`File provided for deployment does not exist: ${zipDeploymentFileAbsPath}`);
        }
        const unpackedZipFolder = zipDeploymentFileAbsPath.replace('.zip', '');
        const { Project } = await Promise.resolve().then(() => require('../abstract/project'));
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
                lib_4.Helpers.remove(unpackedZipFolder); // cleanup
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
        lib_4.Helpers.remove(zipDeploymentFileAbsPath);
        lib_4.Helpers.remove(`${zipDeploymentFileAbsPath}.json`);
    }
    //#endregion
    //#region deployments
    async deployments() {
        // UtilsTerminal.drawBigText('Deployments');
        // await this.project.ins.taonProjectsWorker.deploymentsWorker.startNormallyInCurrentProcess();
        const { Project } = await Promise.resolve().then(() => require('../abstract/project'));
        await Project.ins.taonProjectsWorker.deploymentsWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    ...this.params,
                    mode: lib_4.BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
                },
                calledFrom: 'cli-CLOUD/$Cloud.deployments',
            },
        });
    }
    //#endregion
    //#region instances
    async instances() {
        // UtilsTerminal.drawBigText('Deployments');
        const { Project } = await Promise.resolve().then(() => require('../abstract/project'));
        await Project.ins.taonProjectsWorker.instancesWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    ...this.params,
                    mode: lib_4.BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
                },
                calledFrom: 'cli-CLOUD/$Cloud.instances',
            },
        });
    }
    //#endregion
    //#region processes
    async processes() {
        // UtilsTerminal.drawBigText('Deployments');
        const { Project } = await Promise.resolve().then(() => require('../abstract/project'));
        await Project.ins.taonProjectsWorker.processesWorker.cliStartProcedure({
            methodOptions: {
                cliParams: {
                    ...this.params,
                    mode: lib_4.BaseCLiWorkerStartMode.IN_CURRENT_PROCESS,
                },
                calledFrom: 'cli-CLOUD/$Cloud.processes',
            },
        });
    }
    //#endregion
    //#region send
    async send() {
        // await this.project.ins.taonProjectsWorker.deploymentsWorker.startNormallyInCurrentProcess();
        const { Project } = await Promise.resolve().then(() => require('../abstract/project'));
        const ctrl = await Project.ins.taonProjectsWorker.deploymentsWorker.getRemoteControllerFor({
            methodOptions: {
                calledFrom: 'cli-CLOUD/$Cloud.send',
            },
        });
        const filePath = lib_1.path.isAbsolute(this.firstArg)
            ? (0, lib_2.crossPlatformPath)(this.firstArg)
            : (0, lib_2.crossPlatformPath)([this.cwd, this.firstArg]);
        lib_4.Helpers.taskStarted(`Uploading file "${filePath}" to server...`);
        const data = await ctrl.uploadLocalFileToServer(filePath);
        console.log(data);
        lib_4.Helpers.taskDone(`Done uploading file "${this.firstArg}" to server`);
        this._exit();
    }
}
exports.$Cloud = $Cloud;
__decorate([
    lib_3.UtilsCliClassMethod.decoratorMethod('startFileDeploy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Cloud.prototype, "startFileDeploy", null);
__decorate([
    lib_3.UtilsCliClassMethod.decoratorMethod('stopFileDeploy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Cloud.prototype, "stopFileDeploy", null);
__decorate([
    lib_3.UtilsCliClassMethod.decoratorMethod('removeFileDeploy'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Cloud.prototype, "removeFileDeploy", null);
__decorate([
    lib_3.UtilsCliClassMethod.decoratorMethod('deployments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Cloud.prototype, "deployments", null);
__decorate([
    lib_3.UtilsCliClassMethod.decoratorMethod('instances'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Cloud.prototype, "instances", null);
__decorate([
    lib_3.UtilsCliClassMethod.decoratorMethod('processes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], $Cloud.prototype, "processes", null);
exports.default = {
    $Cloud: lib_4.HelpersTaon.CLIWRAP($Cloud, '$Cloud'),
};
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/cli/cli-CLOUD.js.map