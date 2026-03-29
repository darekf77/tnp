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
exports.Processes = void 0;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("taon/lib");
const lib_3 = require("tnp-core/lib");
const processes_models_1 = require("./processes.models");
//#endregion
let Processes = class Processes extends lib_2.TaonBaseAbstractEntity {
    //#region @websql
    //#endregion
    command;
    //#region @websql
    //#endregion
    cwd;
    //#region @websql
    //#endregion
    state;
    //#region @websql
    //#endregion
    pid;
    //#region @websql
    //#endregion
    ppid;
    //#region @websql
    //#endregion
    conditionProcessActiveStdout;
    //#region @websql
    //#endregion
    conditionProcessActiveStderr;
    //#region @websql
    //#endregion
    /**
     * last 40 lines of output
     * (combined stdout + stderr)
     */
    outputLast40lines;
    //#region @websql
    //#endregion
    /**
     * absolute path to file where stdout + stderr is logged
     */
    fileLogAbsPath;
    //#region getters / preview string
    get previewString() {
        return `${this.id} ${this.command} in ${this.cwd} `;
    }
    //#endregion
    fullPreviewString(options) {
        //#region @websqlFunc
        options = options || {};
        const boldValues = !!options.boldValues;
        const boldFn = (str) => boldValues ? lib_3.chalk.bold(str?.toString()) : str;
        const processFromDB = this;
        return `
  > id: ${boldFn(processFromDB.id)}
  > cwd: ${boldFn(processFromDB.cwd)}
  > command: ${boldFn(processFromDB.command)}
  > state: ${boldFn(processFromDB.state)}
  > pid: ${boldFn(processFromDB.pid)}
  > ppid: ${boldFn(processFromDB.ppid)}
  > log path: ${boldFn(processFromDB.fileLogAbsPath)}
  > conditionProcessActiveStdout: ${boldFn((processFromDB.conditionProcessActiveStdout || []).join(', ') || '<empty>')}
  > conditionProcessActiveStderr: ${boldFn((processFromDB.conditionProcessActiveStderr || []).join(', ') || '<empty>')}
    `;
        //#endregion
    }
};
exports.Processes = Processes;
__decorate([
    (0, lib_1.CustomColumn)({
        type: 'varchar',
        length: 1500,
        nullable: false,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], Processes.prototype, "command", void 0);
__decorate([
    (0, lib_1.CustomColumn)({
        type: 'varchar',
        length: 500,
        default: process.cwd(),
    })
    //#endregion
    ,
    __metadata("design:type", String)
], Processes.prototype, "cwd", void 0);
__decorate([
    (0, lib_1.CustomColumn)({
        type: 'varchar',
        length: 20,
        default: processes_models_1.ProcessesState.NOT_STARTED,
        nullable: false,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], Processes.prototype, "state", void 0);
__decorate([
    (0, lib_1.CustomColumn)({
        type: 'int',
        default: null,
        nullable: true,
    })
    //#endregion
    ,
    __metadata("design:type", Number)
], Processes.prototype, "pid", void 0);
__decorate([
    (0, lib_1.CustomColumn)({
        type: 'int',
        default: null,
        nullable: true,
    })
    //#endregion
    ,
    __metadata("design:type", Number)
], Processes.prototype, "ppid", void 0);
__decorate([
    (0, lib_2.SimpleJsonColumn)()
    //#endregion
    ,
    __metadata("design:type", Array)
], Processes.prototype, "conditionProcessActiveStdout", void 0);
__decorate([
    (0, lib_2.SimpleJsonColumn)()
    //#endregion
    ,
    __metadata("design:type", Array)
], Processes.prototype, "conditionProcessActiveStderr", void 0);
__decorate([
    (0, lib_1.CustomColumn)({
        type: 'text',
        default: '',
    })
    //#endregion
    /**
     * last 40 lines of output
     * (combined stdout + stderr)
     */
    ,
    __metadata("design:type", String)
], Processes.prototype, "outputLast40lines", void 0);
__decorate([
    (0, lib_2.String500Column)()
    //#endregion
    /**
     * absolute path to file where stdout + stderr is logged
     */
    ,
    __metadata("design:type", String)
], Processes.prototype, "fileLogAbsPath", void 0);
exports.Processes = Processes = __decorate([
    (0, lib_1.TaonEntity)({
        className: 'Processes',
        createTable: true,
    })
], Processes);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/processes/processes.js.map