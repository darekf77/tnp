import { config } from 'tnp-core/lib-prod';
import { Helpers__NS__info, Helpers__NS__readFile, UtilsCliClassMethod__NS__getFrom, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__input, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select } from 'tnp-core/lib-prod';
import { UtilsOs__NS__getRealHomeDir } from 'tnp-core/lib-prod';
import { BaseCliWorkerTerminalUI, } from 'tnp-helpers/lib-prod';
import { Processes } from './processes';
import { ProcessesController } from './processes.controller';
import { ProcessesStatesAllowedStart } from './processes.models';
import { ProcessesUtils__NS__displayRealtimeProgressMonitor } from './processes.utils';
//#endregion
let dummyProcessCreate = false;
export class ProcessesTerminalUI extends BaseCliWorkerTerminalUI {
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
        const { $Global } = await import('../../../cli/cli-_GLOBAL_');
        const dummyDummyCommand = `${config.frameworkName} ${UtilsCliClassMethod__NS__getFrom($Global.prototype.showRandomHamstersTypes, { globalMethod: true })}`;
        const dummyProcessCwd = UtilsOs__NS__getRealHomeDir();
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
                const fetchAgain = await UtilsTerminal__NS__confirm({
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
            Helpers__NS__info(`Fetching processes data...`);
            processFromDb = (await processesController.getByProcessID(processFromDb.id).request()).body.json;
            UtilsTerminal__NS__clearConsole();
            //       Helpers__NS__info(`You selected process:
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
            if (ProcessesStatesAllowedStart.includes(processFromDb.state)) {
                delete choices.stopProcess;
                delete choices.realtimeProcessMonitor;
            }
            else {
                delete choices.startProcess;
            }
            const selected = await UtilsTerminal__NS__select({
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
                    UtilsTerminal__NS__clearConsole();
                    console.log(processFromDb.fullPreviewString({ boldValues: true }));
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
                    break;
                case 'startProcess':
                    await processesController.triggerStart(processFromDb.id).request();
                    Helpers__NS__info(`Triggered start for process`);
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                    break;
                case 'realtimeProcessMonitor':
                    await ProcessesUtils__NS__displayRealtimeProgressMonitor(processFromDb.id, processesController);
                    break;
                case 'displayProcessLog':
                    await UtilsTerminal__NS__previewLongListGitLogLike(Helpers__NS__readFile(processFromDb.fileLogAbsPath) ||
                        '< empty log file >');
                    break;
                case 'stopProcess':
                    await processesController.triggerStop(processFromDb.id).request();
                    Helpers__NS__info(`Triggered stop for process..please wait`);
                    await processesController.waitUntilProcessStopped(processFromDb.id);
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                    break;
                case 'removeProcess':
                    await processesController
                        .triggerStop(processFromDb.id, true)
                        .request();
                    Helpers__NS__info(`Triggered remove of process... please wait... `);
                    await processesController.waitUntilProcessDeleted(processFromDb.id);
                    Helpers__NS__info(`Process removed successfully.`);
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
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
                    // Helpers__NS__info(`Stuff from backend will be fetched`);
                    const processesController = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'ProcessesTerminalUI.getWorkerTerminalActions/getStuffFromBackend',
                        },
                        controllerClass: ProcessesController,
                    });
                    while (true) {
                        const list = (await processesController.getAll().request())?.body.json || [];
                        Helpers__NS__info(`Fetched ${list.length} processes from backend.`);
                        const options = [
                            { name: ' - back - ', value: 'back' },
                            ...list.map(c => ({
                                name: c.previewString,
                                value: c.id?.toString(),
                            })),
                        ];
                        const selected = await UtilsTerminal__NS__select({
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
                    // Helpers__NS__info(`Stuff from backend will be fetched`);
                    const processesController = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'ProcessesTerminalUI.getWorkerTerminalActions/startCustomProcess',
                        },
                        controllerClass: ProcessesController,
                    });
                    const command = await UtilsTerminal__NS__input({
                        required: true,
                        question: 'Enter command to run:',
                    });
                    const processFromDBReq = await processesController
                        .save(new Processes().clone({
                        command,
                        cwd: process.cwd(),
                    }))
                        .request();
                    const processFromDB = processFromDBReq.body.json;
                    await processesController.triggerStart(processFromDB.id).request();
                    Helpers__NS__info(`Triggered start for process -

      > command: "${command}"

      `);
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                },
            },
            //#endregion
            //#region create dummy process
            createDummyProcess: {
                name: 'DUMMY PROCESS - create and start',
                action: async () => {
                    // Helpers__NS__info(`Stuff from backend will be fetched`);
                    try {
                        const processesController = await this.worker.getRemoteControllerFor({
                            methodOptions: {
                                calledFrom: 'ProcessesTerminalUI.getWorkerTerminalActions/createDummyProcess',
                            },
                            controllerClass: ProcessesController,
                        });
                        const { command, cwd } = await this.getDummyProcessParams();
                        const processFromDBReq = await processesController
                            .save(new Processes().clone({
                            command,
                            cwd,
                        }))
                            .request();
                        const processFromDB = processFromDBReq.body.json;
                        await processesController.triggerStart(processFromDB.id).request();
                        dummyProcessCreate = true;
                        Helpers__NS__info(`Triggered start for dummy process -

            > command: "${command}"

            `);
                    }
                    catch (error) {
                        console.log(error);
                        await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
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
                    // Helpers__NS__info(`Stuff from backend will be fetched`);
                    const processesController = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'ProcessesTerminalUI.getWorkerTerminalActions/stopDummyProcess',
                        },
                        controllerClass: ProcessesController,
                    });
                    const { command, cwd } = await this.getDummyProcessParams();
                    const processFromDBReq = await processesController
                        .save(new Processes().clone({
                        command,
                        cwd,
                    }))
                        .request();
                    const processFromDB = processFromDBReq.body.json;
                    await processesController.triggerStop(processFromDB.id).request();
                    Helpers__NS__info(`Triggered stop for dummy process `);
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                },
            },
            //#endregion
            //#region get dummy process info
            getDummyProcessInfo: {
                name: 'DUMMY PROCESS - get info',
                action: async () => {
                    // Helpers__NS__info(`Stuff from backend will be fetched`);
                    const processesController = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'ProcessesTerminalUI.getWorkerTerminalActions/getDummyProcessInfo',
                        },
                        controllerClass: ProcessesController,
                    });
                    const { command, cwd } = await this.getDummyProcessParams();
                    const processFromDBReq = await processesController
                        .getByUniqueParams(cwd, command)
                        .request();
                    const processFromDB = processFromDBReq.body.json;
                    Helpers__NS__info(`
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
                    await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
                        message: 'Press any key to go back to main menu',
                    });
                },
            },
            //#endregion
            //#region preview log file of dummy process
            getPreviewLogFile: {
                name: 'DUMMY PROCESS - preview log file',
                action: async () => {
                    // Helpers__NS__info(`Stuff from backend will be fetched`);
                    const processesController = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'ProcessesTerminalUI.getWorkerTerminalActions/getPreviewLogFile',
                        },
                        controllerClass: ProcessesController,
                    });
                    const { command, cwd } = await this.getDummyProcessParams();
                    const processFromDBReq = await processesController
                        .getByUniqueParams(cwd, command)
                        .request();
                    const processFromDB = processFromDBReq.body.json;
                    await UtilsTerminal__NS__previewLongListGitLogLike(Helpers__NS__readFile(processFromDB.fileLogAbsPath) ||
                        '< empty log file >');
                },
            },
            //#endregion
            //#region get realtime preview of dummy process output
            realtimePreviewDummyProcess: {
                name: 'DUMMY PROCESS - get realtime preview',
                action: async () => {
                    // Helpers__NS__info(`Stuff from backend will be fetched`);
                    const processesController = await this.worker.getRemoteControllerFor({
                        methodOptions: {
                            calledFrom: 'realtimePreviewDummyProcess',
                        },
                        controllerClass: ProcessesController,
                    });
                    const { command, cwd } = await this.getDummyProcessParams();
                    const processFromDBReq = await processesController
                        .getByUniqueParams(cwd, command)
                        .request();
                    const processFromDB = processFromDBReq.body.json;
                    await ProcessesUtils__NS__displayRealtimeProgressMonitor(processFromDB.id, processesController);
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/processes/processes.terminal-ui.js.map