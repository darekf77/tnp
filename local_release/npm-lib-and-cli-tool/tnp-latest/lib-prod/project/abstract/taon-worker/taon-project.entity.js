var TaonProject_1;
import { TaonEntity } from 'taon/lib-prod';
import { TaonBaseEntity, PrimaryColumn, Column, BooleanColumn } from 'taon/lib-prod';
import { ___NS__merge } from 'tnp-core/lib-prod';
let TaonProject = TaonProject_1 = class TaonProject extends TaonBaseEntity {
    static from(opt) {
        return ___NS__merge(new TaonProject_1(), opt);
    }
    //#region port entity / columns /  serviceId
    //#region @websql
    //#endregion
    location;
    //#endregion
    //#region port entity / columns /  type
    //#region @websql
    //#endregion
    type;
    //#endregion
    //#region port entity / columns /  type
    //#region @websql
    //#endregion
    isTemporary;
};
__decorate([
    PrimaryColumn({
        type: 'varchar',
        length: 150,
        unique: true,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], TaonProject.prototype, "location", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 20,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], TaonProject.prototype, "type", void 0);
__decorate([
    BooleanColumn(false)
    //#endregion
    ,
    __metadata("design:type", Boolean)
], TaonProject.prototype, "isTemporary", void 0);
TaonProject = TaonProject_1 = __decorate([
    TaonEntity({
        className: 'TaonProject',
        uniqueKeyProp: 'location',
    })
], TaonProject);
export { TaonProject };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/taon-project.entity.js.map