//#region imports
import { CustomColumn, TaonEntity } from 'taon/lib-prod';
import { TaonBaseAbstractEntity, String500Column, SimpleJsonColumn, } from 'taon/lib-prod';
import { chalk } from 'tnp-core/lib-prod';
import { ProcessesState } from './processes.models';
//#endregion
let Processes = class Processes extends TaonBaseAbstractEntity {
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
        const boldFn = (str) => boldValues ? chalk.bold(str?.toString()) : str;
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
__decorate([
    CustomColumn({
        type: 'varchar',
        length: 1500,
        nullable: false,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], Processes.prototype, "command", void 0);
__decorate([
    CustomColumn({
        type: 'varchar',
        length: 500,
        default: process.cwd(),
    })
    //#endregion
    ,
    __metadata("design:type", String)
], Processes.prototype, "cwd", void 0);
__decorate([
    CustomColumn({
        type: 'varchar',
        length: 20,
        default: ProcessesState.NOT_STARTED,
        nullable: false,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], Processes.prototype, "state", void 0);
__decorate([
    CustomColumn({
        type: 'int',
        default: null,
        nullable: true,
    })
    //#endregion
    ,
    __metadata("design:type", Number)
], Processes.prototype, "pid", void 0);
__decorate([
    CustomColumn({
        type: 'int',
        default: null,
        nullable: true,
    })
    //#endregion
    ,
    __metadata("design:type", Number)
], Processes.prototype, "ppid", void 0);
__decorate([
    SimpleJsonColumn()
    //#endregion
    ,
    __metadata("design:type", Array)
], Processes.prototype, "conditionProcessActiveStdout", void 0);
__decorate([
    SimpleJsonColumn()
    //#endregion
    ,
    __metadata("design:type", Array)
], Processes.prototype, "conditionProcessActiveStderr", void 0);
__decorate([
    CustomColumn({
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
    String500Column()
    //#endregion
    /**
     * absolute path to file where stdout + stderr is logged
     */
    ,
    __metadata("design:type", String)
], Processes.prototype, "fileLogAbsPath", void 0);
Processes = __decorate([
    TaonEntity({
        className: 'Processes',
        createTable: true,
    })
], Processes);
export { Processes };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/processes/processes.js.map