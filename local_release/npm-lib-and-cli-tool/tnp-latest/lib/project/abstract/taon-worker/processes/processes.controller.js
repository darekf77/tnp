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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessesController = void 0;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("taon/lib");
const constants_1 = require("../../../../constants");
const processes_1 = require("./processes");
const processes_models_1 = require("./processes.models");
const processes_repository_1 = require("./processes.repository");
//#endregion
let ProcessesController = class ProcessesController extends lib_2.TaonBaseCrudController {
    entityClassResolveFn = () => processes_1.Processes;
    // @ts-ignore
    processesRepository = this.injectCustomRepo(processes_repository_1.ProcessesRepository);
    //#region get by process id
    getByProcessID(processId) {
        //#region @websqlFunc
        return async (req, res) => {
            if (!processId) {
                throw new Error(`No processId query param provided!`);
            }
            const proc = await this.processesRepository.getByProcessID(processId);
            if (!proc) {
                throw lib_1.Taon.error({
                    code: constants_1.ERR_MESSAGE_PROCESS_NOT_FOUND,
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
                    opt.taonError.body.json.code === constants_1.ERR_MESSAGE_PROCESS_NOT_FOUND) {
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
                return processes_models_1.ProcessesStatesAllowedStart.includes(resp.body.json.state);
            },
            loopRequestsOnBackendError: opt => {
                // console.log(opt);
                return true;
            },
        });
        //#endregion
    }
};
exports.ProcessesController = ProcessesController;
__decorate([
    (0, lib_2.GET)(),
    __param(0, (0, lib_2.Query)('processId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], ProcessesController.prototype, "getByProcessID", null);
__decorate([
    (0, lib_2.GET)(),
    __param(0, (0, lib_2.Query)('cwd')),
    __param(1, (0, lib_2.Query)('command')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Object)
], ProcessesController.prototype, "getByUniqueParams", null);
__decorate([
    (0, lib_2.GET)(),
    __param(0, (0, lib_2.Query)('processId')),
    __param(1, (0, lib_2.Query)('processName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Object)
], ProcessesController.prototype, "triggerStart", null);
__decorate([
    (0, lib_2.GET)(),
    __param(0, (0, lib_2.Query)('processId')),
    __param(1, (0, lib_2.Query)('deleteAfterKill')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", Object)
], ProcessesController.prototype, "triggerStop", null);
exports.ProcessesController = ProcessesController = __decorate([
    (0, lib_1.TaonController)({
        className: 'ProcessesController',
    })
], ProcessesController);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/processes/processes.controller.js.map