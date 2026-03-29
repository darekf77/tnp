import { TaonRepository } from 'taon/lib-prod';
import { child_process, dateformat, UtilsProcess__NS__killProcess } from 'tnp-core/lib-prod';
import { UtilsProcessLogger__NS__ProcessFileLogger } from 'tnp-core/lib-prod';
import { Processes } from './processes';
import { TaonBaseRepository } from 'taon/lib-prod';
import { ProcessesState, ProcessesStatesAllowedStart, ProcessesStatesAllowedStop, } from './processes.models';
//#endregion
let ProcessesRepository = class ProcessesRepository extends TaonBaseRepository {
    //#region fields and getters
    entityClassResolveFn = () => Processes;
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
            if (!ProcessesStatesAllowedStart.includes(proc.state)) {
                throw new Error(`Process not allowed to start with state: ${proc.state}`);
            }
            //#region prepare process for start
            proc.state = ProcessesState.STARTING;
            proc.outputLast40lines =
                `${proc.outputLast40lines}` +
                    `\n----- new session ${dateformat(new Date(), 'dd-mm-yyyy_HH:MM:ss')} -----\n`;
            const [cmd, ...commandArgs] = proc.command.split(' '); // safer: parse properly
            const realProcess = child_process.spawn(cmd, commandArgs, {
                env: { ...process.env, FORCE_COLOR: '1' },
                stdio: ['ignore', 'pipe', 'pipe'], // don't inherit console
                shell: true, // use shell if command has operators (&&, |, etc.)
            });
            proc.pid = realProcess.pid;
            proc.ppid = process.pid;
            //#endregion
            //#region prepare logging
            const processFileLogger = new UtilsProcessLogger__NS__ProcessFileLogger({
                name: options.processName || `unknow-proc-name__id-${proc.id}`,
                id: proc.id,
            }, {
                specialEvent: {
                    stderr: (proc.conditionProcessActiveStderr || []).map(stringInStream => ({
                        stringInStream,
                        callback: async () => {
                            await this.getAndUpdateProcess(proc.id, proc1 => {
                                proc1.state = ProcessesState.ACTIVE;
                            });
                        },
                    })),
                    stdout: (proc.conditionProcessActiveStdout || []).map(stringInStream => ({
                        stringInStream,
                        callback: async () => {
                            await this.getAndUpdateProcess(proc.id, proc1 => {
                                proc1.state = ProcessesState.ACTIVE;
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
                        if (proc1.state === ProcessesState.KILLING) {
                            proc1.state = ProcessesState.KILLED;
                        }
                        else {
                            proc1.state =
                                code === 0
                                    ? ProcessesState.ENDED_OK
                                    : ProcessesState.ENDED_WITH_ERROR;
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
            const alreadyStopped = ProcessesStatesAllowedStart.includes(proc.state);
            if (!alreadyStopped) {
                if (!ProcessesStatesAllowedStop.includes(proc.state)) {
                    throw new Error(`Process not allowed to stop with state: ${proc.state}`);
                }
            }
            if (!alreadyStopped) {
                proc.state = ProcessesState.KILLING;
            }
            setTimeout(async () => {
                try {
                    await UtilsProcess__NS__killProcess(proc.pid);
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
ProcessesRepository = __decorate([
    TaonRepository({
        className: 'ProcessesRepository',
    })
], ProcessesRepository);
export { ProcessesRepository };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/processes/processes.repository.js.map