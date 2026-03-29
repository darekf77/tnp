"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentsTerminalUI = void 0;
//#region imports
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-helpers/lib");
const project_1 = require("../../project");
const processes_controller_1 = require("../processes/processes.controller");
const deployments_models_1 = require("./deployments.models");
const deployments_utils_1 = require("./deployments.utils");
//#endregion
// @ts-ignore TODO weird inheritance problem
class DeploymentsTerminalUI extends lib_2.BaseCliWorkerTerminalUI {
    async headerText() {
        return 'Taon Deployments';
    }
    textHeaderStyle() {
        return 'shade';
    }
    //#region stop deployment
    async stopDeployment(deployment, ctrl) {
        //#region @backendFunc
        console.log(`Stopping deployment... please wait...`);
        await ctrl
            .triggerDeploymentStop(deployment.baseFileNameWithHashDatetime)
            .request();
        console.log(`Waiting until deployment stopped...`);
        await ctrl.waitUntilDeploymentStopped(deployment.id);
        console.log(`Stopping done..`);
        await lib_1.UtilsTerminal.pressAnyKeyToContinueAsync();
        //#endregion
    }
    //#endregion
    //#region remove deployment
    async removeDeployment(deployment, ctrl) {
        //#region @backendFunc
        while (true) {
            console.log(`Removing deployment... please wait...`);
            try {
                await ctrl
                    .triggerDeploymentRemove(deployment.baseFileNameWithHashDatetime)
                    .request();
                await ctrl.waitUntilDeploymentRemoved(deployment.id);
                console.log(`Removing done..`);
                break;
            }
            catch (error) {
                if (!(await lib_1.UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
                    break;
                }
            }
        }
        await lib_1.UtilsTerminal.pressAnyKeyToContinueAsync();
        //#endregion
    }
    //#endregion
    //#region start deployment
    async startDeployment(deployment, ctrl, options) {
        //#region @backendFunc
        options = options || {};
        console.log(`Starting deployment...`);
        try {
            await ctrl
                .triggerDeploymentStart(deployment.baseFileNameWithHashDatetime, !!options.forceStart)
                .request();
            console.log(`Waiting for deployment to start...`);
            await ctrl.waitUntilDeploymentHasComposeUpProcess(deployment.id);
            console.log(`deployment process started...`);
        }
        catch (error) {
            console.error('Fail to start deployment');
        }
        //#endregion
    }
    //#endregion
    //#region refetch deployment
    async refetchDeployment(deployment, deploymentsController) {
        //#region @backendFunc
        while (true) {
            try {
                deployment = (await deploymentsController.getByDeploymentId(deployment.id).request()).body.json;
                return deployment;
            }
            catch (error) {
                const fetchAgain = await lib_1.UtilsTerminal.confirm({
                    message: `Not able to fetch deployment (id=${deployment.id}). Try again?`,
                    defaultValue: true,
                });
                if (!fetchAgain) {
                    return;
                }
            }
        }
        //#endregion
    }
    //#endregion
    //#region crud menu for single deployment
    async crudMenuForSingleDeployment(deployment, deploymentsController, processesController) {
        //#region @backendFunc
        while (true) {
            lib_1.UtilsTerminal.clearConsole();
            lib_1.Helpers.info(`Fetching deployment data...`);
            deployment = (await deploymentsController.getByDeploymentId(deployment.id).request()).body.json;
            lib_1.Helpers.info(`Selected deployment:
  for domain: ${deployment.destinationDomain}, version: ${deployment.version}
  current status: ${deployment.status}, arrived at: ${deployment.arrivalDate}
    `);
            const choices = {
                back: {
                    name: ' - back - ',
                },
                startDeployment: {
                    name: 'Start Deployment',
                },
                info: {
                    name: 'Deployment info',
                },
                realtimeMonitor: {
                    name: 'Realtime Progress Monitor',
                },
                displayDeploymentLog: {
                    name: 'Display Log File',
                },
                displayDeploymentLogPath: {
                    name: 'Display Log File Path',
                },
                stopDeployment: {
                    name: 'Stop Deployment',
                },
                removeDeployment: {
                    name: 'Remove Deployment',
                },
            };
            if (deployments_models_1.DeploymentsStatesAllowedStart.includes(deployment.status)) {
                delete choices.stopDeployment;
                delete choices.realtimeMonitor;
            }
            else {
                delete choices.startDeployment;
            }
            const selected = await lib_1.UtilsTerminal.select({
                choices,
                question: '[Deployments] What do you want to do?',
            });
            switch (selected) {
                case 'back':
                    return;
                case 'displayDeploymentLogPath':
                    deployment = await this.refetchDeployment(deployment, deploymentsController);
                    if (!deployment) {
                        return;
                    }
                    lib_1.UtilsTerminal.clearConsole();
                    await (async () => {
                        const processComposeUp = deployment.processIdComposeUp;
                        try {
                            const processFromDb = await processesController
                                .getByProcessID(processComposeUp)
                                .request()
                                .then(r => r.body.json);
                            console.log(`

                Log file path: ${processFromDb.fileLogAbsPath}

                `);
                            await lib_1.UtilsTerminal.pressAnyKeyToContinueAsync({
                                message: 'Press any key go back to previous menu',
                            });
                        }
                        catch (error) {
                            console.error(`Error fetching process log for process id: ${processComposeUp}`);
                            await lib_1.UtilsTerminal.pressAnyKeyToContinueAsync();
                        }
                    })();
                case 'displayDeploymentLog':
                    deployment = await this.refetchDeployment(deployment, deploymentsController);
                    if (!deployment) {
                        return;
                    }
                    lib_1.UtilsTerminal.clearConsole();
                    const processComposeUp = deployment.processIdComposeUp;
                    try {
                        const processFromDb = await processesController
                            .getByProcessID(processComposeUp)
                            .request()
                            .then(r => r.body.json);
                        await lib_1.UtilsTerminal.previewLongListGitLogLike(lib_1.Helpers.readFile(processFromDb.fileLogAbsPath) ||
                            '< empty log file >');
                    }
                    catch (error) {
                        console.error(`Error fetching process log for process id: ${processComposeUp}`);
                        await lib_1.UtilsTerminal.pressAnyKeyToContinueAsync();
                    }
                    break;
                case 'info':
                    deployment = await this.refetchDeployment(deployment, deploymentsController);
                    if (!deployment) {
                        return;
                    }
                    lib_1.UtilsTerminal.clearConsole();
                    console.log(deployment.fullPreviewString({ boldValues: true }));
                    await lib_1.UtilsTerminal.pressAnyKeyToContinueAsync();
                    break;
                case 'startDeployment':
                    const displayRealtimePreview = await lib_1.UtilsTerminal.confirm({
                        message: `Would you like to see realtime preview in terminal after starting?`,
                        defaultValue: true,
                    });
                    await this.startDeployment(deployment, deploymentsController, {
                        forceStart: false,
                    });
                    if (displayRealtimePreview) {
                        deployment = await this.refetchDeployment(deployment, deploymentsController);
                        if (!deployment) {
                            return;
                        }
                        await deployments_utils_1.DeploymentsUtils.displayRealtimeProgressMonitor(deployment, processesController);
                    }
                    else {
                        await lib_1.UtilsTerminal.pressAnyKeyToContinueAsync();
                    }
                    break;
                case 'realtimeMonitor':
                    await deployments_utils_1.DeploymentsUtils.displayRealtimeProgressMonitor(deployment, processesController);
                    break;
                case 'stopDeployment':
                    await this.stopDeployment(deployment, deploymentsController);
                    break;
                case 'removeDeployment':
                    await this.removeDeployment(deployment, deploymentsController);
                    return;
            }
        }
        //#endregion
    }
    //#endregion
    //#region terminal actions
    getWorkerTerminalActions(options) {
        //#region @backendFunc
        const myActions = {
            getStuffFromBackend: {
                name: 'Get deployments from backend',
                action: async () => {
                    lib_1.Helpers.info(`Fetching deployments data...`);
                    const deploymentsController = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'Get stuff from backend action',
                        },
                    });
                    const processesController = await project_1.Project.ins.taonProjectsWorker.processesWorker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'Deployments.getStuffFromBackend',
                        },
                        controllerClass: processes_controller_1.ProcessesController,
                    });
                    while (true) {
                        const list = (await deploymentsController.getEntities().request())?.body
                            .json || [];
                        lib_1.Helpers.info(`Fetched ${list.length} entities`);
                        const options = [
                            { name: ' - back - ', value: 'back' },
                            ...list.map(c => ({
                                name: c.previewString,
                                value: c.id?.toString(),
                            })),
                        ];
                        const selected = await lib_1.UtilsTerminal.select({
                            choices: options,
                            question: 'Select deployment',
                        });
                        if (selected !== 'back') {
                            await this.crudMenuForSingleDeployment(list.find(l => l.id?.toString() === selected), deploymentsController, processesController);
                        }
                        if (selected === 'back') {
                            return;
                        }
                    }
                },
            },
            removeAllDeployments: {
                name: 'Remove all deployments',
                action: async () => {
                    const confirm = await lib_1.UtilsTerminal.confirm({
                        message: `Are you sure you want to remove ALL deployments?`,
                        defaultValue: false,
                    });
                    if (!confirm) {
                        return;
                    }
                    while (true) {
                        try {
                            lib_1.Helpers.info(`Removing all deployments...`);
                            const deploymentController = await this.worker.getRemoteControllerFor({
                                methodOptions: {
                                    calledFrom: 'Remove all deployments action',
                                },
                            });
                            await deploymentController
                                .triggerAllDeploymentsRemove()
                                .request();
                            lib_1.Helpers.info(`Waiting until all deployments are removed...`);
                            await deploymentController.waitUntilAllDeploymentsRemoved();
                            lib_1.Helpers.info(`All deployments removed.`);
                            break;
                        }
                        catch (error) {
                            if (!(await lib_1.UtilsTerminal.pressAnyKeyToTryAgainErrorOccurred(error))) {
                                break;
                            }
                            continue;
                        }
                    }
                    await lib_1.UtilsTerminal.pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                },
            },
            // insertDeployment: {
            //   name: 'Insert new deployment',
            //   action: async () => {
            //     Helpers.info(`Inserting new deployment`);
            //     const ctrl = await this.worker.getRemoteControllerFor({
            //       calledFrom: 'Insert new deployment action',
            //     });
            //     try {
            //       const response = await ctrl.insertEntity().request();
            //       console.info(`Entity saved successfully: ${response.body.text}`);
            //     } catch (error) {
            //       console.error('Error inserting entity:', error);
            //     }
            //     // console.log(response);
            //     await UtilsTerminal.pressAnyKeyToContinueAsync({
            //       message: 'Press any key to go back to main menu',
            //     });
            //   },
            // },
        };
        return {
            ...this.chooseAction,
            ...myActions,
            ...super.getWorkerTerminalActions({
                ...options,
                chooseAction: false,
            }),
        };
        //#endregion
    }
}
exports.DeploymentsTerminalUI = DeploymentsTerminalUI;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/deployments/deployments.terminal-ui.js.map