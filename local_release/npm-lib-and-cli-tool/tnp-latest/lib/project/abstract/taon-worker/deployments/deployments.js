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
exports.Deployments = void 0;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("taon/lib");
const lib_3 = require("tnp-core/lib");
const options_1 = require("../../../../options");
const deployments_models_1 = require("./deployments.models");
//#endregion
let Deployments = class Deployments extends lib_2.TaonBaseEntity {
    //#region @websql
    //#endregion
    id;
    //#region base file name with hash datetime
    //#region @websql
    //#endregion
    baseFileNameWithHashDatetime;
    //#endregion
    //#region size
    //#region @websql
    //#endregion
    size;
    //#endregion
    //#region status
    //#region @websql
    //#endregion
    status;
    //#endregion
    //#region project name
    //#region @websql
    //#endregion
    projectName;
    //#endregion
    //#region environment name
    //#region @websql
    //#endregion
    envName;
    //#endregion
    //#region environment number
    //#region @websql
    //#endregion
    envNumber;
    //#endregion
    //#region target artifact
    //#region @websql
    //#endregion
    targetArtifact;
    //#endregion
    //#region target artifact
    //#region @websql
    //#endregion
    releaseType;
    //#endregion
    //#region project version
    //#region @websql
    //#endregion
    version;
    //#endregion
    //#region destination domain
    //#region @websql
    //#endregion
    destinationDomain;
    //#endregion
    //#region process compose up id
    //#region @websql
    //#endregion
    processIdComposeUp;
    //#endregion
    //#region process compose down id
    //#region @websql
    //#endregion
    processIdComposeDown;
    //#endregion
    //#region arrival date
    //#region @websql
    //#endregion
    arrivalDate;
    //#endregion
    //#region getters / release date
    // get releaseData(): Partial<DeploymentReleaseData> {
    //   const data = FilePathMetaData.extractData<DeploymentReleaseData>(
    //     this.baseFileNameWithHashDatetime,
    //     {
    //       keysMap,
    //     },
    //   );
    //   return data || ({} as Partial<DeploymentReleaseData>);
    // }
    //#endregion
    //#region getters / preview string
    get previewString() {
        return (`${this.id} ${this.destinationDomain || '<unknown-domain>'} v${this.version} ` +
            `(${this.status}) ` +
            `${this.arrivalDate ? (0, lib_3.dateformat)(this.arrivalDate, 'dd-mm-yyyy HH:MM:ss') : 'unknown date'} `);
    }
    //#endregion
    fullPreviewString(options) {
        //#region @websqlFunc
        options = options || {};
        const boldValues = !!options.boldValues;
        // const r = this.releaseData;
        let envName = '';
        if (!this.envName) {
            envName = 'unknown environment';
        }
        else if (this.envName === '__') {
            envName = '< default >';
        }
        else {
            envName = `${this.envName} ${this.envNumber}`;
        }
        const boldFn = (str) => (boldValues ? lib_3.chalk.bold(str) : str);
        return [
            `Destination domain (${boldFn(this.destinationDomain || '- unknown domain -')})`,
            `Project Name (${boldFn(this.projectName || '- unknown project -')})`,
            `Version (${boldFn(this.version || '- unknown version -')})`,
            `Status (${boldFn(this.status || '- unknown version -')})`,
            `Artifact (${boldFn(this.targetArtifact || '- unknown artifact -')})`,
            `Release Type (${boldFn(this.releaseType || '- unknown release type -')})`,
            `Environment (${boldFn(envName)})`,
            `Arrival Date (${boldFn(this.arrivalDate
                ? (0, lib_3.dateformat)(this.arrivalDate, 'dd-mm-yyyy HH:MM:ss')
                : '- unknown date -')})`,
        ].join('\n');
        //#endregion
    }
};
exports.Deployments = Deployments;
__decorate([
    (0, lib_2.PrimaryGeneratedColumn)()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "id", void 0);
__decorate([
    (0, lib_2.Column)({
        type: 'varchar',
        length: 500,
        unique: true,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "baseFileNameWithHashDatetime", void 0);
__decorate([
    (0, lib_2.NumberColumn)()
    //#endregion
    ,
    __metadata("design:type", Object)
], Deployments.prototype, "size", void 0);
__decorate([
    (0, lib_2.Column)({
        type: 'varchar',
        length: 20,
        default: deployments_models_1.DeploymentsStatus.NOT_STARTED,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "status", void 0);
__decorate([
    (0, lib_2.String100Column)()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "projectName", void 0);
__decorate([
    (0, lib_2.String100Column)()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "envName", void 0);
__decorate([
    (0, lib_2.String45Column)()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "envNumber", void 0);
__decorate([
    (0, lib_2.String45Column)()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "targetArtifact", void 0);
__decorate([
    (0, lib_2.String45Column)()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "releaseType", void 0);
__decorate([
    (0, lib_2.VersionColumn)()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "version", void 0);
__decorate([
    (0, lib_2.String200Column)()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "destinationDomain", void 0);
__decorate([
    (0, lib_2.String45Column)()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "processIdComposeUp", void 0);
__decorate([
    (0, lib_2.String45Column)()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "processIdComposeDown", void 0);
__decorate([
    (0, lib_2.CreateDateColumn)()
    //#endregion
    ,
    __metadata("design:type", Date)
], Deployments.prototype, "arrivalDate", void 0);
exports.Deployments = Deployments = __decorate([
    (0, lib_1.TaonEntity)({
        className: 'Deployments',
    })
], Deployments);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/deployments/deployments.js.map