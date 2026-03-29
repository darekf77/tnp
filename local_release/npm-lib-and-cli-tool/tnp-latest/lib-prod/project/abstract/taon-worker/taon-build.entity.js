var TaonBuild_1;
import { TaonBaseAbstractEntity, Column, NumberColumn, SimpleJsonColumn, TaonEntity, } from 'taon/lib-prod';
import { ___NS__merge } from 'tnp-core/lib-prod';
import { EnvOptions } from '../../../options';
let TaonBuild = TaonBuild_1 = class TaonBuild extends TaonBaseAbstractEntity {
    static from(opt) {
        return ___NS__merge(new TaonBuild_1(), opt);
    }
    //#region port entity / columns /  pid
    //#region @websql
    //#endregion
    processInfoPort;
    //#endregion
    //#region port entity / columns /  serviceId
    //#region @websql
    //#endregion
    projectLocation;
    //#endregion
    //#region port entity / columns /  type
    //#region @websql
    //#endregion
    type;
};
__decorate([
    NumberColumn()
    //#endregion
    ,
    __metadata("design:type", Number)
], TaonBuild.prototype, "processInfoPort", void 0);
__decorate([
    Column({
        type: 'varchar',
        length: 150,
        unique: true,
    })
    //#endregion
    ,
    __metadata("design:type", String)
], TaonBuild.prototype, "projectLocation", void 0);
__decorate([
    SimpleJsonColumn()
    //#endregion
    ,
    __metadata("design:type", EnvOptions)
], TaonBuild.prototype, "type", void 0);
TaonBuild = TaonBuild_1 = __decorate([
    TaonEntity({
        className: 'TaonBuild',
    })
], TaonBuild);
export { TaonBuild };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/taon-build.entity.js.map