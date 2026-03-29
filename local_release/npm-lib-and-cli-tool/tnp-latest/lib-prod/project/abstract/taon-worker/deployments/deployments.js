//#region imports
import { TaonEntity } from 'taon/lib-prod';
import { TaonBaseEntity, PrimaryGeneratedColumn, CreateDateColumn, Column, String100Column, String45Column, String200Column, NumberColumn, VersionColumn, } from 'taon/lib-prod';
import { chalk, dateformat } from 'tnp-core/lib-prod';
import { ReleaseArtifactTaon, ReleaseType } from '../../../../options';
import { DeploymentsStatus } from './deployments.models';
//#endregion
let Deployments = class Deployments extends TaonBaseEntity {
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
    //   const data = FilePathMetaData__NS__extractData<DeploymentReleaseData>(
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
            `${this.arrivalDate ? dateformat(this.arrivalDate, 'dd-mm-yyyy HH:MM:ss') : 'unknown date'} `);
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
        const boldFn = (str) => (boldValues ? chalk.bold(str) : str);
        return [
            `Destination domain (${boldFn(this.destinationDomain || '- unknown domain -')})`,
            `Project Name (${boldFn(this.projectName || '- unknown project -')})`,
            `Version (${boldFn(this.version || '- unknown version -')})`,
            `Status (${boldFn(this.status || '- unknown version -')})`,
            `Artifact (${boldFn(this.targetArtifact || '- unknown artifact -')})`,
            `Release Type (${boldFn(this.releaseType || '- unknown release type -')})`,
            `Environment (${boldFn(envName)})`,
            `Arrival Date (${boldFn(this.arrivalDate
                ? dateformat(this.arrivalDate, 'dd-mm-yyyy HH:MM:ss')
                : '- unknown date -')})`,
        ].join('\n');
        //#endregion
    }
};
__decorate([
    PrimaryGeneratedColumn()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "id", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 500,
        unique: true,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "baseFileNameWithHashDatetime", void 0);
__decorate([
    NumberColumn()
    //#endregion
    ,
    __metadata("design:type", Object)
], Deployments.prototype, "size", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 20,
        default: DeploymentsStatus.NOT_STARTED,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "status", void 0);
__decorate([
    String100Column()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "projectName", void 0);
__decorate([
    String100Column()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "envName", void 0);
__decorate([
    String45Column()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "envNumber", void 0);
__decorate([
    String45Column()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "targetArtifact", void 0);
__decorate([
    String45Column()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "releaseType", void 0);
__decorate([
    VersionColumn()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "version", void 0);
__decorate([
    String200Column()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "destinationDomain", void 0);
__decorate([
    String45Column()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "processIdComposeUp", void 0);
__decorate([
    String45Column()
    //#endregion
    ,
    __metadata("design:type", String)
], Deployments.prototype, "processIdComposeDown", void 0);
__decorate([
    CreateDateColumn()
    //#endregion
    ,
    __metadata("design:type", Date)
], Deployments.prototype, "arrivalDate", void 0);
Deployments = __decorate([
    TaonEntity({
        className: 'Deployments',
    })
], Deployments);
export { Deployments };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/deployments/deployments.js.map