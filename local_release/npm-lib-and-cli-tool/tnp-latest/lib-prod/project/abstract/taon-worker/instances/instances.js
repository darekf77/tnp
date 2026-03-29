//#region imports
import { TaonEntity } from 'taon/lib-prod';
import { TaonBaseAbstractEntity, Column, String200Column } from 'taon/lib-prod';
//#endregion
let Instances = class Instances extends TaonBaseAbstractEntity {
    /**
     * zip file with docker-compose and other files
     * needed to deploy this deployment
     */
    //#region @websql
    //#endregion
    ipAddress;
    //#region @websql
    //#endregion
    name;
};
__decorate([
    Column({
        type: 'varchar',
        length: 45,
        nullable: false,
        unique: true,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], Instances.prototype, "ipAddress", void 0);
__decorate([
    String200Column()
    //#endregion
    ,
    __metadata("design:type", String)
], Instances.prototype, "name", void 0);
Instances = __decorate([
    TaonEntity({
        className: 'Instances',
    })
], Instances);
export { Instances };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/instances/instances.js.map