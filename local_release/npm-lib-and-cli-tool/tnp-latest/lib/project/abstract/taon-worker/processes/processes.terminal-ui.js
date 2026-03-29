"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessesTerminalUI = void 0;
const lib_1 = require("tnp-core/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const lib_4 = require("tnp-helpers/lib");
const processes_1 = require("./processes");
const processes_controller_1 = require("./processes.controller");
const processes_models_1 = require("./processes.models");
const processes_utils_1 = require("./processes.utils");
//#endregion
let dummyProcessCreate = false;
class ProcessesTerminalUI extends lib_4.BaseCliWorkerTerminalUI {
    //#region header text
    async headerText() {
        return 'Processes';
    }
    //#endregion
    //#region text header style
    textHeaderStyle() {
        return 'simpleBlock';
    }
    //#endregion
    //#region dummy process params
    async getDummyProcessParams() {
        //#region @backendFunc
        const { $Global } = await Promise.resolve().then(() => require('../../../cli/cli-_GLOBAL_'));
        const dummyDummyCommand = `${lib_1.config.frameworkName} ${lib_2.UtilsCliClassMethod.getFrom($Global.prototype.showRandomHamstersTypes, { globalMethod: true })}`;
        const dummyProcessCwd = lib_3.UtilsOs.getRealHomeDir();
        return { command: dummyDummyCommand, cwd: dummyProcessCwd };
        //#endregion
    }
    //#endregion
    //#region refetch process
    async refetchProcess(process, processesController) {
        //#region @backendFunc
        while (true) {
            try {
                process = (await processesController.getByProcessID(process.id).request()).body.json;
                return process;
            }
            catch (error) {
                const fetchAgain = await lib_2.UtilsTerminal.confirm({
                    message: `Not able to fetch process (id=${process.id}). Try again?`,
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
    async crudMenuForSingleProcess(processFromDb, processesController) {
        //#region @backendFunc
        while (true) {
            lib_2.Helpers.info(`Fetching processes data...`);
            processFromDb = (await processesController.getByProcessID(processFromDb.id).request()).body.json;
            lib_2.UtilsTerminal.clearConsole();
            //       Helpers.info(`You selected process:
            //  id: ${processFromDb.id}
            //  command: ${processFromDb.command}
            //  cwd: ${processFromDb.cwd}
            //  state: ${processFromDb.state}`);
            const choices = {
                back: {
                    name: ' - back - ',
                },
                startProcess: {
                    name: 'Start Process',
                },
                processInfo: {
                    name: 'Process Info',
                },
                realtimeProcessMonitor: {
                    name: 'Realtime Monitor',
                },
                displayProcessLog: {
                    name: 'Display Log File',
                },
                stopProcess: {
                    name: 'Stop Process',
                },
                removeProcess: {
                    name: 'Remove Process',
                },
            };
            if (processes_models_1.ProcessesStatesAllowedStart.includes(processFromDb.state)) {
                delete choices.stopProcess;
                delete choices.realtimeProcessMonitor;
            }
            else {
                delete choices.startProcess;
            }
            const selected = await lib_2.UtilsTerminal.select({
                choices,
                question: `[Process id=${processFromDb.id},status=${processFromDb.state}] What do you want to do?`,
            });
            switch (selected) {
                case 'back':
                    return;
                case 'processInfo':
                    processFromDb = await this.refetchProcess(processFromDb, processesController);
                    if (!processFromDb) {
                        return;
                    }
                    lib_2.UtilsTerminal.clearConsole();
                    console.log(processFromDb.fullPreviewString({ boldValues: true }));
                    await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync();
                    break;
                case 'startProcess':
                    await processesController.triggerStart(processFromDb.id).request();
                    lib_2.Helpers.info(`Triggered start for process`);
                    await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                    break;
                case 'realtimeProcessMonitor':
                    await processes_utils_1.ProcessesUtils.displayRealtimeProgressMonitor(processFromDb.id, processesController);
                    break;
                case 'displayProcessLog':
                    await lib_2.UtilsTerminal.previewLongListGitLogLike(lib_2.Helpers.readFile(processFromDb.fileLogAbsPath) ||
                        '< empty log file >');
                    break;
                case 'stopProcess':
                    await processesController.triggerStop(processFromDb.id).request();
                    lib_2.Helpers.info(`Triggered stop for process..please wait`);
                    await processesController.waitUntilProcessStopped(processFromDb.id);
                    await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                    break;
                case 'removeProcess':
                    await processesController
                        .triggerStop(processFromDb.id, true)
                        .request();
                    lib_2.Helpers.info(`Triggered remove of process... please wait... `);
                    await processesController.waitUntilProcessDeleted(processFromDb.id);
                    lib_2.Helpers.info(`Process removed successfully.`);
                    await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                    return;
            }
        }
        //#endregion
    }
    //#endregion
    getWorkerTerminalActions(options) {
        //#region @backendFunc
        const myActions = {
            //#region get all processes from backend
            getStuffFromBackend: {
                name: 'Get all processes from backend',
                action: async () => {
                    // Helpers.info(`Stuff from backend will be fetched`);
                    const processesController = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'ProcessesTerminalUI.getWorkerTerminalActions/getStuffFromBackend',
                        },
                        controllerClass: processes_controller_1.ProcessesController,
                    });
                    while (true) {
                        const list = (await processesController.getAll().request())?.body.json || [];
                        lib_2.Helpers.info(`Fetched ${list.length} processes from backend.`);
                        const options = [
                            { name: ' - back - ', value: 'back' },
                            ...list.map(c => ({
                                name: c.previewString,
                                value: c.id?.toString(),
                            })),
                        ];
                        const selected = await lib_2.UtilsTerminal.select({
                            choices: options,
                            question: 'Select process',
                        });
                        if (selected !== 'back') {
                            await this.crudMenuForSingleProcess(list.find(l => l.id?.toString() === selected), processesController);
                        }
                        if (selected === 'back') {
                            return;
                        }
                    }
                },
            },
            //#endregion
            //#region create custom process
            startCustomProcess: {
                name: 'Start custom process',
                action: async () => {
                    // Helpers.info(`Stuff from backend will be fetched`);
                    const processesController = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'ProcessesTerminalUI.getWorkerTerminalActions/startCustomProcess',
                        },
                        controllerClass: processes_controller_1.ProcessesController,
                    });
                    const command = await lib_2.UtilsTerminal.input({
                        required: true,
                        question: 'Enter command to run:',
                    });
                    const processFromDBReq = await processesController
                        .save(new processes_1.Processes().clone({
                        command,
                        cwd: process.cwd(),
                    }))
                        .request();
                    const processFromDB = processFromDBReq.body.json;
                    await processesController.triggerStart(processFromDB.id).request();
                    lib_2.Helpers.info(`Triggered start for process -

      > command: "${command}"

      `);
                    await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                },
            },
            //#endregion
            //#region create dummy process
            createDummyProcess: {
                name: 'DUMMY PROCESS - create and start',
                action: async () => {
                    // Helpers.info(`Stuff from backend will be fetched`);
                    try {
                        const processesController = await this.worker.getRemoteControllerFor({
                            methodOptions: {
                                calledFrom: 'ProcessesTerminalUI.getWorkerTerminalActions/createDummyProcess',
                            },
                            controllerClass: processes_controller_1.ProcessesController,
                        });
                        const { command, cwd } = await this.getDummyProcessParams();
                        const processFromDBReq = await processesController
                            .save(new processes_1.Processes().clone({
                            command,
                            cwd,
                        }))
                            .request();
                        const processFromDB = processFromDBReq.body.json;
                        await processesController.triggerStart(processFromDB.id).request();
                        dummyProcessCreate = true;
                        lib_2.Helpers.info(`Triggered start for dummy process -

            > command: "${command}"

            `);
                    }
                    catch (error) {
                        console.log(error);
                        await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync({
                            message: 'Press any key to go back to main menu',
                        });
                    }
                },
            },
            //#endregion
            //#region stop dummy process
            stopDummyProcess: {
                name: 'DUMMY PROCESS - stop process',
                action: async () => {
                    // Helpers.info(`Stuff from backend will be fetched`);
                    const processesController = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'ProcessesTerminalUI.getWorkerTerminalActions/stopDummyProcess',
                        },
                        controllerClass: processes_controller_1.ProcessesController,
                    });
                    const { command, cwd } = await this.getDummyProcessParams();
                    const processFromDBReq = await processesController
                        .save(new processes_1.Processes().clone({
                        command,
                        cwd,
                    }))
                        .request();
                    const processFromDB = processFromDBReq.body.json;
                    await processesController.triggerStop(processFromDB.id).request();
                    lib_2.Helpers.info(`Triggered stop for dummy process `);
                    await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                },
            },
            //#endregion
            //#region get dummy process info
            getDummyProcessInfo: {
                name: 'DUMMY PROCESS - get info',
                action: async () => {
                    // Helpers.info(`Stuff from backend will be fetched`);
                    const processesController = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'ProcessesTerminalUI.getWorkerTerminalActions/getDummyProcessInfo',
                        },
                        controllerClass: processes_controller_1.ProcessesController,
                    });
                    const { command, cwd } = await this.getDummyProcessParams();
                    const processFromDBReq = await processesController
                        .getByUniqueParams(cwd, command)
                        .request();
                    const processFromDB = processFromDBReq.body.json;
                    lib_2.Helpers.info(`
            Dummy process info:

  > id: ${processFromDB.id}
  > cwd: ${processFromDB.cwd}
  > command: ${processFromDB.command}
  > state: ${processFromDB.state}
  > pid: ${processFromDB.pid}
  > ppid: ${processFromDB.ppid}
  > log path: ${processFromDB.fileLogAbsPath}
  > conditionProcessActiveStdout: ${(processFromDB.conditionProcessActiveStdout || []).join(', ') || '<empty>'}
  > conditionProcessActiveStderr: ${(processFromDB.conditionProcessActiveStderr || []).join(', ') || '<empty>'}

            `);
                    await lib_2.UtilsTerminal.pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                },
            },
            //#endregion
            //#region preview log file of dummy process
            getPreviewLogFile: {
                name: 'DUMMY PROCESS - preview log file',
                action: async () => {
                    // Helpers.info(`Stuff from backend will be fetched`);
                    const processesController = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'ProcessesTerminalUI.getWorkerTerminalActions/getPreviewLogFile',
                        },
                        controllerClass: processes_controller_1.ProcessesController,
                    });
                    const { command, cwd } = await this.getDummyProcessParams();
                    const processFromDBReq = await processesController
                        .getByUniqueParams(cwd, command)
                        .request();
                    const processFromDB = processFromDBReq.body.json;
                    await lib_2.UtilsTerminal.previewLongListGitLogLike(lib_2.Helpers.readFile(processFromDB.fileLogAbsPath) ||
                        '< empty log file >');
                },
            },
            //#endregion
            //#region get realtime preview of dummy process output
            realtimePreviewDummyProcess: {
                name: 'DUMMY PROCESS - get realtime preview',
                action: async () => {
                    // Helpers.info(`Stuff from backend will be fetched`);
                    const processesController = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'realtimePreviewDummyProcess',
                        },
                        controllerClass: processes_controller_1.ProcessesController,
                    });
                    const { command, cwd } = await this.getDummyProcessParams();
                    const processFromDBReq = await processesController
                        .getByUniqueParams(cwd, command)
                        .request();
                    const processFromDB = processFromDBReq.body.json;
                    await processes_utils_1.ProcessesUtils.displayRealtimeProgressMonitor(processFromDB.id, processesController);
                },
            },
            //#endregion
        };
        if (!dummyProcessCreate) {
            delete myActions.stopDummyProcess;
            delete myActions.getDummyProcessInfo;
            delete myActions.getPreviewLogFile;
            delete myActions.realtimePreviewDummyProcess;
        }
        return {
            ...this.chooseAction,
            ...myActions,
            ...super.getWorkerTerminalActions({ ...options, chooseAction: false }),
        };
        //#endregion
    }
}
exports.ProcessesTerminalUI = ProcessesTerminalUI;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/processes/processes.terminal-ui.js.map