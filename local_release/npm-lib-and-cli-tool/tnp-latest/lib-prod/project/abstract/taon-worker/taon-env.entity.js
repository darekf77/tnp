var TaonEnv_1;
import { TaonEntity } from 'taon/lib-prod';
import { TaonBaseAbstractEntity, StringColumn } from 'taon/lib-prod';
let TaonEnv = TaonEnv_1 = class TaonEnv extends TaonBaseAbstractEntity {
    static from(obj) {
        return new TaonEnv_1().clone(obj);
    }
    //#region fields / type
    //#region @websql
    //#endregion
    type;
    //#endregion
    //#region fields / name
    //#region @websql
    //#endregion
    name;
};
__decorate([
    StringColumn()
    //#endregion
    ,
    __metadata("design:type", String)
], TaonEnv.prototype, "type", void 0);
__decorate([
    StringColumn()
    //#endregion
    ,
    __metadata("design:type", String)
], TaonEnv.prototype, "name", void 0);
TaonEnv = TaonEnv_1 = __decorate([
    TaonEntity({
        className: 'TaonEnv',
    })
], TaonEnv);
export { TaonEnv };
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/taon-env.entity.js.map