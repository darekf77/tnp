"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessesRepository = void 0;
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-core/lib");
const processes_1 = require("./processes");
const lib_4 = require("taon/lib");
const processes_models_1 = require("./processes.models");
//#endregion
let ProcessesRepository = class ProcessesRepository extends lib_4.TaonBaseRepository {
    //#region fields and getters
    entityClassResolveFn = () => processes_1.Processes;
    processFileLoggers = {};
    //#endregion
    //#region get by process id
    async getByProcessID(processId) {
        //#region @websqlFunc
        const proc = await this.findOne({
            where: {
                id: processId?.toString(),
            },
        });
        return proc;
        //#endregion
    }
    //#endregion
    //#region get by uniquer params
    async getByUniqueParams({ cwd, command, }) {
        //#region @websqlFunc
        const proc = await this.findOne({
            where: {
                cwd,
                command,
            },
        });
        return proc;
        //#endregion
    }
    //#endregion
    //#region start process
    async triggerStart(processId, options) {
        //#region @backendFunc
        options = options || {};
        await this.getAndUpdateProcess(processId, async (proc) => {
            if (!processes_models_1.ProcessesStatesAllowedStart.includes(proc.state)) {
                throw new Error(`Process not allowed to start with state: ${proc.state}`);
            }
            //#region prepare process for start
            proc.state = processes_models_1.ProcessesState.STARTING;
            proc.outputLast40lines =
                `${proc.outputLast40lines}` +
                    `\n----- new session ${(0, lib_2.dateformat)(new Date(), 'dd-mm-yyyy_HH:MM:ss')} -----\n`;
            const [cmd, ...commandArgs] = proc.command.split(' '); // safer: parse properly
            const realProcess = lib_2.child_process.spawn(cmd, commandArgs, {
                env: { ...process.env, FORCE_COLOR: '1' },
                stdio: ['ignore', 'pipe', 'pipe'], // don't inherit console
                shell: true, // use shell if command has operators (&&, |, etc.)
            });
            proc.pid = realProcess.pid;
            proc.ppid = process.pid;
            //#endregion
            //#region prepare logging
            const processFileLogger = new lib_3.UtilsProcessLogger.ProcessFileLogger({
                name: options.processName || `unknow-proc-name__id-${proc.id}`,
                id: proc.id,
            }, {
                specialEvent: {
                    stderr: (proc.conditionProcessActiveStderr || []).map(stringInStream => ({
                        stringInStream,
                        callback: async () => {
                            await this.getAndUpdateProcess(proc.id, proc1 => {
                                proc1.state = processes_models_1.ProcessesState.ACTIVE;
                            });
                        },
                    })),
                    stdout: (proc.conditionProcessActiveStdout || []).map(stringInStream => ({
                        stringInStream,
                        callback: async () => {
                            await this.getAndUpdateProcess(proc.id, proc1 => {
                                proc1.state = processes_models_1.ProcessesState.ACTIVE;
                            });
                        },
                    })),
                },
            });
            this.processFileLoggers[proc.id] = processFileLogger;
            processFileLogger.startLogging(realProcess, {
                cacheLinesMax: 40,
                update: async ({ outputLines, stderrLines, stdoutLines }) => {
                    await this.getAndUpdateProcess(proc.id, proc1 => {
                        proc1.outputLast40lines = outputLines;
                    });
                },
            });
            proc.fileLogAbsPath = processFileLogger.processLogAbsFilePath;
            //#endregion
            //#region handle process exit
            /**
             * 15 - soft kill
             * 9 - hard kill
             * 1 - from code exit
             * 0 - process done
             */
            realProcess.on('exit', async (code, data) => {
                await this.getAndUpdateProcess(proc.id, proc1 => {
                    if (proc1) {
                        if (proc1.state === processes_models_1.ProcessesState.KILLING) {
                            proc1.state = processes_models_1.ProcessesState.KILLED;
                        }
                        else {
                            proc1.state =
                                code === 0
                                    ? processes_models_1.ProcessesState.ENDED_OK
                                    : processes_models_1.ProcessesState.ENDED_WITH_ERROR;
                        }
                        proc1.pid = null;
                    }
                    delete this.processFileLoggers[proc.id];
                }, {
                    skipThrowingErrorWhenNoProcess: true,
                    executeCallbackWhenNoProcess: true,
                });
            });
            //#endregion
        });
        //#endregion
    }
    //#endregion
    //#region stop/remove process
    async triggerStop(processId, options) {
        //#region @websqlFunc
        options = options || {};
        await this.getAndUpdateProcess(processId, proc => {
            const alreadyStopped = processes_models_1.ProcessesStatesAllowedStart.includes(proc.state);
            if (!alreadyStopped) {
                if (!processes_models_1.ProcessesStatesAllowedStop.includes(proc.state)) {
                    throw new Error(`Process not allowed to stop with state: ${proc.state}`);
                }
            }
            if (!alreadyStopped) {
                proc.state = processes_models_1.ProcessesState.KILLING;
            }
            setTimeout(async () => {
                try {
                    await lib_2.UtilsProcess.killProcess(proc.pid);
                    console.info(`Process killed successfully (by pid = ${proc.pid})`);
                }
                catch (error) {
                    console.error(`Not able to kill process by pid ${proc.pid}`);
                }
                if (options.deleteAfterKill) {
                    try {
                        await this.remove(proc);
                    }
                    catch (error) { }
                }
            }, 1000);
        });
        //#endregion
    }
    //#endregion
    //#region private methods
    //#region  private methods / get and update process
    async getAndUpdateProcess(processId, 
    /**
     * Callback with process to update
     * (any modifications done in callback will be saved after its end)
     */
    callback, options) {
        //#region @backendFunc
        options = options || {};
        const proc = await this.findOne({
            where: { id: processId?.toString() },
        });
        if (!proc) {
            if (options.skipThrowingErrorWhenNoProcess) {
                if (options.executeCallbackWhenNoProcess) {
                    await callback();
                }
                return;
            }
            throw new Error(`No process with id ${processId}`);
        }
        await callback(proc);
        await this.update(proc);
        this.ctx.realtimeServer.triggerEntityPropertyChanges(proc, 'outputLast40lines');
        //#endregion
    }
};
exports.ProcessesRepository = ProcessesRepository;
exports.ProcessesRepository = ProcessesRepository = __decorate([
    (0, lib_1.TaonRepository)({
        className: 'ProcessesRepository',
    })
], ProcessesRepository);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/processes/processes.repository.js.map