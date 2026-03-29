import { TaonRepository, Taon__NS__error } from 'taon/lib-prod';
import { config } from 'tnp-core/lib-prod';
import { crossPlatformPath, fse, path, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, Helpers__NS__exists, Helpers__NS__getFilesFrom, Helpers__NS__logInfo, Helpers__NS__mkdirp, Helpers__NS__readJson, Helpers__NS__removeFolderIfExists, Helpers__NS__writeJson, Utils__NS__wait, Utils__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { UtilsCliClassMethod__NS__getFrom } from 'tnp-core/lib-prod';
import { $Cloud } from '../../../cli/cli-CLOUD';
import { Project } from '../../project';
import { Processes } from '../processes/processes';
import { ProcessesController } from '../processes/processes.controller';
import { ProcessesState, ProcessesStatesAllowedStart, } from '../processes/processes.models';
import { Deployments } from './deployments';
import { DEPLOYMENT_LOCAL_FOLDER_PATH } from './deployments.constants';
import { TaonBaseRepository } from 'taon/lib-prod';
import { DeploymentsAddingStatus as DeploymentsIsAddingStatus, DeploymentsStatesAllowedStart, DeploymentsStatus, DeploymentsStatesAllowedStop, AllDeploymentsRemoveStatus, } from './deployments.models';
//#endregion
let DeploymentsRepository = class DeploymentsRepository extends TaonBaseRepository {
    entityClassResolveFn = () => Deployments;
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
            Helpers__NS__logInfo(`Entity still exists... waiting`);
            await Utils__NS__waitMilliseconds(800);
        }
        //#endregion
    }
    //#endregion
    //#region protected methods / get processes controller
    async getProcessesController() {
        // const ctxProcess = await this.getCtxProcesses();
        const processesController = await Project.ins.taonProjectsWorker.processesWorker.getRemoteControllerFor({
            methodOptions: {
                calledFrom: 'DeploymentsRepository.getCtxProcesses',
            },
            controllerClass: ProcessesController,
        });
        return processesController;
    }
    //#endregion
    //#region protected methods / zipfileAbsPath
    zipfileAbsPath(baseFileNameWithHashDatetime) {
        const zipfileAbsPath = crossPlatformPath([
            DEPLOYMENT_LOCAL_FOLDER_PATH,
            baseFileNameWithHashDatetime,
        ]);
        return zipfileAbsPath;
    }
    //#endregion
    //#region protected methods / json query params file abs path
    jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime) {
        return crossPlatformPath([
            `${this.zipfileAbsPath(baseFileNameWithHashDatetime)}.json`,
        ]);
    }
    //#endregion
    //#region public methods / save deployment
    async saveDeployment(file, queryParams) {
        //#region @backendFunc
        const baseFileNameWithHashDatetime = path.basename(file.savedAs);
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
        const deployment = await this.save(new Deployments().clone(partialDeployment));
        Helpers__NS__writeJson(this.jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime), partialDeployment);
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
                    if (ProcessesStatesAllowedStart.includes(proc.body.json.state)) {
                        await callback();
                        return;
                    }
                }
                catch (error) {
                    console.warn(`Process with id ${processId} not found, assuming it is killed or not exists.`);
                    await callback();
                    return;
                }
                await Utils__NS__wait(1);
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
                await Utils__NS__waitMilliseconds(options.refreshEveryMs || 2000);
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
                if (options.operation === DeploymentsStatus.STARTING) {
                    if (processComposeUp.state === ProcessesState.ACTIVE) {
                        deployment.status = DeploymentsStatus.STARTED_AND_ACTIVE;
                        await this.save(deployment);
                        return true; // achieved final state
                    }
                    if (processComposeUp.state === ProcessesState.ENDED_WITH_ERROR) {
                        deployment.status = DeploymentsStatus.FAILED_START;
                        await this.save(deployment);
                        return true; // achieved final state
                    }
                }
            }
            if (processComposeDown) {
                if (options.operation === DeploymentsStatus.STOPPING) {
                    if (processComposeDown.state === ProcessesState.ENDED_OK) {
                        deployment.status = DeploymentsStatus.STOPPED;
                        await this.save(deployment);
                        return true; // achieved final state
                    }
                    if (processComposeDown.state === ProcessesState.ENDED_WITH_ERROR) {
                        deployment.status = DeploymentsStatus.STOPPED;
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
    allDeploymentRemoveStatus = AllDeploymentsRemoveStatus.NOT_STARTED;
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
        Helpers__NS__removeFolderIfExists(DEPLOYMENT_LOCAL_FOLDER_PATH);
        Helpers__NS__mkdirp(DEPLOYMENT_LOCAL_FOLDER_PATH);
        this.allDeploymentRemoveStatus = AllDeploymentsRemoveStatus.DONE;
        //#endregion
    }
    async triggerAllDeploymentsRemove() {
        //#region @backendFunc
        if (config.frameworkName === 'taon') {
            Taon__NS__error({
                message: `This operation is not allowed in production environment`,
            });
        }
        this.allDeploymentRemoveStatus = AllDeploymentsRemoveStatus.REMOVING;
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
            deployment.status === DeploymentsStatus.NOT_STARTED;
        if (deployment.status === DeploymentsStatus.NOT_STARTED) {
            // nothing here do to
        }
        else {
            if (!options.skipStatusCheck &&
                !DeploymentsStatesAllowedStop.includes(deployment.status)) {
                throw new Error(`Deployment can't be stopped when process in status "${deployment.status}"`);
            }
        }
        if (!Helpers__NS__exists(this.zipfileAbsPath(baseFileNameWithHashDatetime))) {
            throw new Error(`File for deployment not found: ${this.zipfileAbsPath(baseFileNameWithHashDatetime)}`);
        }
        //#endregion
        deployment.status = DeploymentsStatus.STOPPING;
        await this.save(deployment);
        //#region trigger docker compose down process
        const triggerStop = async () => {
            const zipfileAbsPath = this.zipfileAbsPath(baseFileNameWithHashDatetime);
            const commandComposeDown = `${config.frameworkName} ${UtilsCliClassMethod__NS__getFrom(options.removeAfterStop
                ? $Cloud.prototype.removeFileDeploy
                : $Cloud.prototype.stopFileDeploy)} ${zipfileAbsPath}`;
            const processComposeDownRequest = await processesController
                .save(new Processes().clone({
                command: commandComposeDown,
                cwd: DEPLOYMENT_LOCAL_FOLDER_PATH,
            }))
                .request();
            const processComposeDown = processComposeDownRequest.body.json;
            deployment.processIdComposeDown = processComposeDown.id;
            await this.save(deployment);
            await processesController
                .triggerStart(processComposeDown.id, `docker-compose-down__deployment-${deployment.id}`)
                .request();
            this.repeatRefreshDeploymentStateUntil(deployment.id, {
                operation: DeploymentsStatus.STOPPING,
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
        if (!DeploymentsStatesAllowedStart.includes(deployment.status)) {
            throw new Error(`Deployment can't be started when process in status "${deployment.status}"`);
        }
        if (!Helpers__NS__exists(this.zipfileAbsPath(baseFileNameWithHashDatetime))) {
            throw new Error(`File for deployment not found: ${this.zipfileAbsPath(baseFileNameWithHashDatetime)}`);
        }
        //#endregion
        deployment.status = DeploymentsStatus.STARTING;
        await this.save(deployment);
        //#region trigger docker compose up process
        const triggerStart = async () => {
            const zipfileAbsPath = this.zipfileAbsPath(baseFileNameWithHashDatetime);
            const commandComposeUp = `${config.frameworkName} ${UtilsCliClassMethod__NS__getFrom($Cloud.prototype.startFileDeploy)} ${zipfileAbsPath}`;
            const cwd = DEPLOYMENT_LOCAL_FOLDER_PATH;
            const procFromReq = await processesController
                .save(new Processes().clone({
                command: commandComposeUp,
                cwd,
                conditionProcessActiveStderr: [
                    CoreModels__NS__SPECIAL_APP_READY_MESSAGE,
                ],
                conditionProcessActiveStdout: [
                    CoreModels__NS__SPECIAL_APP_READY_MESSAGE,
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
                operation: DeploymentsStatus.STARTING,
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
        const allZips = Helpers__NS__getFilesFrom(DEPLOYMENT_LOCAL_FOLDER_PATH).filter(f => f.endsWith('.zip'));
        console.log(`Found ${allZips.length} zip files in deployments folder.`);
        for (const zipAbsPath of allZips) {
            const baseFileNameWithHashDatetime = path.basename(zipAbsPath);
            const existing = await this.findOne({
                where: {
                    baseFileNameWithHashDatetime,
                },
            });
            if (!existing) {
                const queryParamsJsonAbsPath = this.jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime);
                if (!fse.existsSync(queryParamsJsonAbsPath)) {
                    continue;
                }
                const dataJson = Helpers__NS__readJson(this.jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime));
                const deployment = new Deployments().clone(dataJson);
                deployment.status = DeploymentsStatus.NOT_STARTED;
                deployment.arrivalDate = new Date();
                await this.save(deployment);
            }
        }
        this.deploymentsIsAddingStatus = DeploymentsIsAddingStatus.DONE;
        //#endregion
    }
    //#endregion
    //#region trigger add existed deployments
    deploymentsIsAddingStatus = DeploymentsIsAddingStatus.NOT_STARTED;
    triggerAddExistedDeployments() {
        //#region @backendFunc
        this.deploymentsIsAddingStatus = DeploymentsIsAddingStatus.IN_PROGRESS;
        setTimeout(async () => {
            try {
                await this.clearAndAddExistedDeploymentsProcess();
            }
            catch (error) {
                config.frameworkName === 'tnp' && console.log(error);
                this.deploymentsIsAddingStatus = DeploymentsIsAddingStatus.FAILED;
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
DeploymentsRepository = __decorate([
    TaonRepository({
        className: 'DeploymentsRepository',
    })
], DeploymentsRepository);
export { DeploymentsRepository };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/deployments/deployments.repository.js.map