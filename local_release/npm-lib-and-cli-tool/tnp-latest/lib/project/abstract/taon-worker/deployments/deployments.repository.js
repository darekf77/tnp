"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentsRepository = void 0;
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-core/lib");
const cli_CLOUD_1 = require("../../../cli/cli-CLOUD");
const project_1 = require("../../project");
const processes_1 = require("../processes/processes");
const processes_controller_1 = require("../processes/processes.controller");
const processes_models_1 = require("../processes/processes.models");
const deployments_1 = require("./deployments");
const deployments_constants_1 = require("./deployments.constants");
const lib_5 = require("taon/lib");
const deployments_models_1 = require("./deployments.models");
//#endregion
let DeploymentsRepository = class DeploymentsRepository extends lib_5.TaonBaseRepository {
    entityClassResolveFn = () => deployments_1.Deployments;
    //#region protected methods
    //#region protected methods / wait until deployment removed
    async waitUntilDeploymentRemoved(deploymentId) {
        //#region @backendFunc
        while (true) {
            const deployment = await this.findOne({
                where: {
                    id: deploymentId?.toString(),
                },
            });
            if (!deployment) {
                return;
            }
            lib_3.Helpers.logInfo(`Entity still exists... waiting`);
            await lib_3.Utils.waitMilliseconds(800);
        }
        //#endregion
    }
    //#endregion
    //#region protected methods / get processes controller
    async getProcessesController() {
        // const ctxProcess = await this.getCtxProcesses();
        const processesController = await project_1.Project.ins.taonProjectsWorker.processesWorker.getRemoteControllerFor({
            methodOptions: {
                calledFrom: 'DeploymentsRepository.getCtxProcesses',
            },
            controllerClass: processes_controller_1.ProcessesController,
        });
        return processesController;
    }
    //#endregion
    //#region protected methods / zipfileAbsPath
    zipfileAbsPath(baseFileNameWithHashDatetime) {
        const zipfileAbsPath = (0, lib_3.crossPlatformPath)([
            deployments_constants_1.DEPLOYMENT_LOCAL_FOLDER_PATH,
            baseFileNameWithHashDatetime,
        ]);
        return zipfileAbsPath;
    }
    //#endregion
    //#region protected methods / json query params file abs path
    jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime) {
        return (0, lib_3.crossPlatformPath)([
            `${this.zipfileAbsPath(baseFileNameWithHashDatetime)}.json`,
        ]);
    }
    //#endregion
    //#region public methods / save deployment
    async saveDeployment(file, queryParams) {
        //#region @backendFunc
        const baseFileNameWithHashDatetime = lib_3.path.basename(file.savedAs);
        const partialDeployment = {
            baseFileNameWithHashDatetime,
            size: file.size,
            projectName: queryParams.projectName,
            envName: queryParams.envName,
            envNumber: queryParams.envNumber,
            targetArtifact: queryParams.targetArtifact,
            releaseType: queryParams.releaseType,
            version: queryParams.version,
            destinationDomain: queryParams.destinationDomain,
        };
        const deployment = await this.save(new deployments_1.Deployments().clone(partialDeployment));
        lib_3.Helpers.writeJson(this.jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime), partialDeployment);
        return deployment;
        //#endregion
    }
    //#endregion
    //#region protected methods / wait until process killed
    async waitUntilProcessKilled(processId, callback) {
        //#region @backendFunc
        setTimeout(async () => {
            const processController = await this.getProcessesController();
            while (true) {
                try {
                    const proc = await processController
                        .getByProcessID(processId)
                        .request();
                    if (processes_models_1.ProcessesStatesAllowedStart.includes(proc.body.json.state)) {
                        await callback();
                        return;
                    }
                }
                catch (error) {
                    console.warn(`Process with id ${processId} not found, assuming it is killed or not exists.`);
                    await callback();
                    return;
                }
                await lib_3.Utils.wait(1);
            }
        });
        //#endregion
    }
    //#endregion
    //#region protected methods / repeat refresh deployment until final state
    /**
     * wait until deployment reach final state
     * starting => started
     * stopping => stopped
     * + handle failure states
     */
    repeatRefreshDeploymentStateUntil(deploymentId, options) {
        //#region @backendFunc
        options = options || {};
        options.refreshEveryMs = options.refreshEveryMs || 2000;
        setTimeout(async () => {
            while (true) {
                if (await this.refreshDeploymentStateForStartStop(deploymentId, options)) {
                    if (options.callback) {
                        await options.callback();
                    }
                    return;
                }
                await lib_3.Utils.waitMilliseconds(options.refreshEveryMs || 2000);
            }
        }, 1000);
        //#endregion
    }
    //#endregion
    //#region protected methods / refresh deployment state for start stop
    /**
     * refresh deployment state for start and stop
     */
    async refreshDeploymentStateForStartStop(deploymentId, options) {
        //#region @backendFunc
        options = options || {};
        //#region fetch deployment
        let deployment = null;
        try {
            deployment = await this.findOne({
                where: {
                    id: deploymentId?.toString(),
                },
            });
        }
        catch (error) { }
        if (!deployment) {
            console.warn(`Deployment with id ${deploymentId} not found. Exiting refresh.`);
            return true; // exit refresh
        }
        //#endregion
        //#region fetch processes
        const processesController = await this.getProcessesController();
        let processComposeUp = null;
        if (deployment.processIdComposeUp) {
            try {
                const processComposeUpReq = await processesController
                    .getByProcessID(deployment.processIdComposeUp)
                    .request();
                processComposeUp = processComposeUpReq.body.json;
            }
            catch (error) { }
        }
        let processComposeDown = null;
        if (deployment.processIdComposeDown) {
            try {
                const processComposeUpReq = await processesController
                    .getByProcessID(deployment.processIdComposeDown)
                    .request();
                processComposeDown = processComposeUpReq.body.json;
            }
            catch (error) { }
        }
        //#endregion
        //#region update deployment status based on processes
        if (processComposeUp && processComposeDown) {
            // both processes exists - should never happen
            throw `

        Both docker up/down exists for deployment ${deployment.id}

        `;
        }
        else {
            if (processComposeUp) {
                if (options.operation === deployments_models_1.DeploymentsStatus.STARTING) {
                    if (processComposeUp.state === processes_models_1.ProcessesState.ACTIVE) {
                        deployment.status = deployments_models_1.DeploymentsStatus.STARTED_AND_ACTIVE;
                        await this.save(deployment);
                        return true; // achieved final state
                    }
                    if (processComposeUp.state === processes_models_1.ProcessesState.ENDED_WITH_ERROR) {
                        deployment.status = deployments_models_1.DeploymentsStatus.FAILED_START;
                        await this.save(deployment);
                        return true; // achieved final state
                    }
                }
            }
            if (processComposeDown) {
                if (options.operation === deployments_models_1.DeploymentsStatus.STOPPING) {
                    if (processComposeDown.state === processes_models_1.ProcessesState.ENDED_OK) {
                        deployment.status = deployments_models_1.DeploymentsStatus.STOPPED;
                        await this.save(deployment);
                        return true; // achieved final state
                    }
                    if (processComposeDown.state === processes_models_1.ProcessesState.ENDED_WITH_ERROR) {
                        deployment.status = deployments_models_1.DeploymentsStatus.STOPPED;
                        await this.save(deployment);
                        return true; // achieved final state
                    }
                }
            }
        }
        //#endregion
        return false; // not achieved final state
        //#endregion
    }
    //#endregion
    //#endregion
    //#region remove all deployments
    allDeploymentRemoveStatus = deployments_models_1.AllDeploymentsRemoveStatus.NOT_STARTED;
    removingAllDeploymentsStatus() {
        return {
            status: this.allDeploymentRemoveStatus,
        };
    }
    async clearAllDeployments() {
        //#region @backendFunc
        const allDeployments = await this.find();
        for (const deployment of allDeployments) {
            try {
                await this.triggerDeploymentStop(deployment.baseFileNameWithHashDatetime, {
                    removeAfterStop: true,
                    skipStatusCheck: true,
                });
            }
            catch (error) {
                const errMsg = (error instanceof Error && error.message) || error;
                console.error(errMsg);
            }
            await this.waitUntilDeploymentRemoved(deployment.id);
        }
        await this.clear(); // remove all records from db
        // remove all files from deployments folder
        lib_3.Helpers.removeFolderIfExists(deployments_constants_1.DEPLOYMENT_LOCAL_FOLDER_PATH);
        lib_3.Helpers.mkdirp(deployments_constants_1.DEPLOYMENT_LOCAL_FOLDER_PATH);
        this.allDeploymentRemoveStatus = deployments_models_1.AllDeploymentsRemoveStatus.DONE;
        //#endregion
    }
    async triggerAllDeploymentsRemove() {
        //#region @backendFunc
        if (lib_2.config.frameworkName === 'taon') {
            lib_1.Taon.error({
                message: `This operation is not allowed in production environment`,
            });
        }
        this.allDeploymentRemoveStatus = deployments_models_1.AllDeploymentsRemoveStatus.REMOVING;
        setTimeout(async () => {
            await this.clearAllDeployments();
        }, 1000);
        //#endregion
    }
    //#endregion
    //#region trigger deployment stop
    async triggerDeploymentStop(baseFileNameWithHashDatetime, options) {
        //#region @backendFunc
        options = options || {};
        options.removeAfterStop = options.removeAfterStop || false;
        options.skipStatusCheck == !!options.skipStatusCheck;
        //#region find deployment
        let deployment = await this.findOne({
            where: {
                baseFileNameWithHashDatetime,
            },
        });
        //#endregion
        //#region handle errors
        if (!deployment) {
            throw new Error(`Deployment with base file name ${baseFileNameWithHashDatetime} not found`);
        }
        let onlyRemove = options.removeAfterStop &&
            deployment.status === deployments_models_1.DeploymentsStatus.NOT_STARTED;
        if (deployment.status === deployments_models_1.DeploymentsStatus.NOT_STARTED) {
            // nothing here do to
        }
        else {
            if (!options.skipStatusCheck &&
                !deployments_models_1.DeploymentsStatesAllowedStop.includes(deployment.status)) {
                throw new Error(`Deployment can't be stopped when process in status "${deployment.status}"`);
            }
        }
        if (!lib_3.Helpers.exists(this.zipfileAbsPath(baseFileNameWithHashDatetime))) {
            throw new Error(`File for deployment not found: ${this.zipfileAbsPath(baseFileNameWithHashDatetime)}`);
        }
        //#endregion
        deployment.status = deployments_models_1.DeploymentsStatus.STOPPING;
        await this.save(deployment);
        //#region trigger docker compose down process
        const triggerStop = async () => {
            const zipfileAbsPath = this.zipfileAbsPath(baseFileNameWithHashDatetime);
            const commandComposeDown = `${lib_2.config.frameworkName} ${lib_4.UtilsCliClassMethod.getFrom(options.removeAfterStop
                ? cli_CLOUD_1.$Cloud.prototype.removeFileDeploy
                : cli_CLOUD_1.$Cloud.prototype.stopFileDeploy)} ${zipfileAbsPath}`;
            const processComposeDownRequest = await processesController
                .save(new processes_1.Processes().clone({
                command: commandComposeDown,
                cwd: deployments_constants_1.DEPLOYMENT_LOCAL_FOLDER_PATH,
            }))
                .request();
            const processComposeDown = processComposeDownRequest.body.json;
            deployment.processIdComposeDown = processComposeDown.id;
            await this.save(deployment);
            await processesController
                .triggerStart(processComposeDown.id, `docker-compose-down__deployment-${deployment.id}`)
                .request();
            this.repeatRefreshDeploymentStateUntil(deployment.id, {
                operation: deployments_models_1.DeploymentsStatus.STOPPING,
                callback: async () => {
                    if (options.removeAfterStop) {
                        await this.remove(deployment);
                    }
                },
            });
        };
        //#endregion
        //#region handle existing up process
        const processesController = await this.getProcessesController();
        if (onlyRemove) {
            triggerStop();
        }
        else {
            if (deployment.processIdComposeUp) {
                await processesController
                    .triggerStop(deployment.processIdComposeUp)
                    .request();
                await this.waitUntilProcessKilled(deployment.processIdComposeUp, async () => {
                    deployment.processIdComposeUp = null;
                    await this.save(deployment);
                    triggerStop();
                });
            }
            else {
                triggerStop();
            }
        }
        //#endregion
        return deployment;
        //#endregion
    }
    //#endregion
    //#region trigger deployment start
    async triggerDeploymentStart(baseFileNameWithHashDatetime, options) {
        //#region @backendFunc
        //#region find deployment
        options = options || {};
        let deployment = await this.findOne({
            where: {
                baseFileNameWithHashDatetime,
            },
        });
        //#endregion
        //#region handle errors
        if (!deployment) {
            throw new Error(`Deployment with base file name "${baseFileNameWithHashDatetime}" not found`);
        }
        if (!deployments_models_1.DeploymentsStatesAllowedStart.includes(deployment.status)) {
            throw new Error(`Deployment can't be started when process in status "${deployment.status}"`);
        }
        if (!lib_3.Helpers.exists(this.zipfileAbsPath(baseFileNameWithHashDatetime))) {
            throw new Error(`File for deployment not found: ${this.zipfileAbsPath(baseFileNameWithHashDatetime)}`);
        }
        //#endregion
        deployment.status = deployments_models_1.DeploymentsStatus.STARTING;
        await this.save(deployment);
        //#region trigger docker compose up process
        const triggerStart = async () => {
            const zipfileAbsPath = this.zipfileAbsPath(baseFileNameWithHashDatetime);
            const commandComposeUp = `${lib_2.config.frameworkName} ${lib_4.UtilsCliClassMethod.getFrom(cli_CLOUD_1.$Cloud.prototype.startFileDeploy)} ${zipfileAbsPath}`;
            const cwd = deployments_constants_1.DEPLOYMENT_LOCAL_FOLDER_PATH;
            const procFromReq = await processesController
                .save(new processes_1.Processes().clone({
                command: commandComposeUp,
                cwd,
                conditionProcessActiveStderr: [
                    lib_3.CoreModels.SPECIAL_APP_READY_MESSAGE,
                ],
                conditionProcessActiveStdout: [
                    lib_3.CoreModels.SPECIAL_APP_READY_MESSAGE,
                ],
            }))
                .request();
            const procFromDb = procFromReq.body.json;
            deployment.processIdComposeUp = procFromDb.id;
            await this.save(deployment);
            await processesController
                .triggerStart(procFromDb.id, `docker-compose-up__deployment-${deployment.id}`)
                .request();
            this.repeatRefreshDeploymentStateUntil(deployment.id, {
                operation: deployments_models_1.DeploymentsStatus.STARTING,
            });
        };
        //#endregion
        //#region handle existing down process
        const processesController = await this.getProcessesController();
        if (deployment.processIdComposeDown) {
            await processesController
                .triggerStop(deployment.processIdComposeUp)
                .request();
            await this.waitUntilProcessKilled(deployment.processIdComposeDown, async () => {
                deployment.processIdComposeDown = null;
                await this.save(deployment);
                triggerStart();
            });
        }
        else {
            triggerStart();
        }
        //#endregion
        return deployment;
        //#endregion
    }
    //#endregion
    //#region add existed
    //#region add existed deployments process
    async clearAndAddExistedDeploymentsProcess() {
        //#region @backendFunc
        // clear all deployments first
        console.log('Clearing existing deployments from database...');
        await this.clear();
        console.log('Existing deployments cleared.');
        const allZips = lib_3.Helpers.getFilesFrom(deployments_constants_1.DEPLOYMENT_LOCAL_FOLDER_PATH).filter(f => f.endsWith('.zip'));
        console.log(`Found ${allZips.length} zip files in deployments folder.`);
        for (const zipAbsPath of allZips) {
            const baseFileNameWithHashDatetime = lib_3.path.basename(zipAbsPath);
            const existing = await this.findOne({
                where: {
                    baseFileNameWithHashDatetime,
                },
            });
            if (!existing) {
                const queryParamsJsonAbsPath = this.jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime);
                if (!lib_3.fse.existsSync(queryParamsJsonAbsPath)) {
                    continue;
                }
                const dataJson = lib_3.Helpers.readJson(this.jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime));
                const deployment = new deployments_1.Deployments().clone(dataJson);
                deployment.status = deployments_models_1.DeploymentsStatus.NOT_STARTED;
                deployment.arrivalDate = new Date();
                await this.save(deployment);
            }
        }
        this.deploymentsIsAddingStatus = deployments_models_1.DeploymentsAddingStatus.DONE;
        //#endregion
    }
    //#endregion
    //#region trigger add existed deployments
    deploymentsIsAddingStatus = deployments_models_1.DeploymentsAddingStatus.NOT_STARTED;
    triggerAddExistedDeployments() {
        //#region @backendFunc
        this.deploymentsIsAddingStatus = deployments_models_1.DeploymentsAddingStatus.IN_PROGRESS;
        setTimeout(async () => {
            try {
                await this.clearAndAddExistedDeploymentsProcess();
            }
            catch (error) {
                lib_2.config.frameworkName === 'tnp' && console.log(error);
                this.deploymentsIsAddingStatus = deployments_models_1.DeploymentsAddingStatus.FAILED;
                return;
            }
        }, 1000);
        //#endregion
    }
    isAddingDeploymentStatus() {
        return {
            status: this.deploymentsIsAddingStatus,
        };
    }
};
exports.DeploymentsRepository = DeploymentsRepository;
exports.DeploymentsRepository = DeploymentsRepository = __decorate([
    (0, lib_1.TaonRepository)({
        className: 'DeploymentsRepository',
    })
], DeploymentsRepository);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/deployments/deployments.repository.js.map