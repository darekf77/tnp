//#region imports
import { TaonController, Taon__NS__error } from 'taon/lib-prod';
import { GET, Query, TaonBaseCrudController } from 'taon/lib-prod';
import { ERR_MESSAGE_PROCESS_NOT_FOUND } from '../../../../constants';
import { Processes } from './processes';
import { ProcessesStatesAllowedStart, } from './processes.models';
import { ProcessesRepository } from './processes.repository';
//#endregion
let ProcessesController = class ProcessesController extends TaonBaseCrudController {
    entityClassResolveFn = () => Processes;
    // @ts-ignore
    processesRepository = this.injectCustomRepo(ProcessesRepository);
    //#region get by process id
    getByProcessID(processId) {
        //#region @websqlFunc
        return async (req, res) => {
            if (!processId) {
                throw new Error(`No processId query param provided!`);
            }
            const proc = await this.processesRepository.getByProcessID(processId);
            if (!proc) {
                throw Taon__NS__error({
                    code: ERR_MESSAGE_PROCESS_NOT_FOUND,
                    message: `No process found by given processId: ${processId}`,
                    status: 404,
                });
            }
            return proc;
        };
        //#endregion
    }
    //#endregion
    //#region get by unique params
    getByUniqueParams(cwd, command) {
        //#region @websqlFunc
        return async (req, res) => {
            if (!cwd) {
                throw new Error(`No cwd query param provided!`);
            }
            if (!command) {
                throw new Error(`No command query param provided!`);
            }
            const proc = await this.processesRepository.getByUniqueParams({
                cwd,
                command,
            });
            if (!proc) {
                throw new Error(`No process found by given unique params!
          cwd: ${cwd}
          command: ${command}
          `);
            }
            return proc;
        };
        //#endregion
    }
    //#endregion
    //#region trigger start process
    triggerStart(processId, processName) {
        //#region @websqlFunc
        return async (req, res) => {
            if (!processId) {
                throw new Error(`No processId queryParm provided!`);
            }
            await this.processesRepository.triggerStart(processId, {
                processName,
            });
        };
        //#endregion
    }
    //#endregion
    //#region trigger stop process
    triggerStop(processId, deleteAfterKill) {
        //#region @websqlFunc
        return async (req, res) => {
            if (!processId) {
                throw new Error(`No processId queryParm provided!`);
            }
            await this.processesRepository.triggerStop(processId, {
                deleteAfterKill,
            });
        };
        //#endregion
    }
    //#endregion
    //#region wait until deployment removed
    async waitUntilProcessDeleted(processId) {
        //#region @backendFunc
        await this._waitForProperStatusChange({
            actionName: `Waiting until process ${processId} is removed`,
            request: () => {
                // console.log(`Checking if process ${processId} deleted...`);
                return this.getByProcessID(processId).request({
                    timeout: 1000,
                });
            },
            loopRequestsOnBackendError: opt => {
                //  console.log(opt);
                if (opt.taonError &&
                    opt.taonError.body.json.code === ERR_MESSAGE_PROCESS_NOT_FOUND) {
                    return false;
                }
                return true;
            },
        });
        //#endregion
    }
    //#endregion
    //#region wait until deployment removed
    async waitUntilProcessStopped(processId) {
        //#region @backendFunc
        await this._waitForProperStatusChange({
            actionName: `Waiting until process ${processId} stopped`,
            request: () => {
                return this.getByProcessID(processId).request({
                    timeout: 1000,
                });
            },
            poolingInterval: 1000,
            statusCheck: resp => {
                return ProcessesStatesAllowedStart.includes(resp.body.json.state);
            },
            loopRequestsOnBackendError: opt => {
                // console.log(opt);
                return true;
            },
        });
        //#endregion
    }
};
__decorate([
    GET(),
    __param(0, Query('processId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], ProcessesController.prototype, "getByProcessID", null);
__decorate([
    GET(),
    __param(0, Query('cwd')),
    __param(1, Query('command')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Object)
], ProcessesController.prototype, "getByUniqueParams", null);
__decorate([
    GET(),
    __param(0, Query('processId')),
    __param(1, Query('processName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Object)
], ProcessesController.prototype, "triggerStart", null);
__decorate([
    GET(),
    __param(0, Query('processId')),
    __param(1, Query('deleteAfterKill')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Object)
], ProcessesController.prototype, "triggerStop", null);
ProcessesController = __decorate([
    TaonController({
        className: 'ProcessesController',
    })
], ProcessesController);
export { ProcessesController };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/processes/processes.controller.js.map