"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaonProjectsContext_1737301724542_addingSampleData = void 0;
const lib_1 = require("taon/lib");
const taon_env_entity_1 = require("../project/abstract/taon-worker/taon-env.entity");
let TaonProjectsContext_1737301724542_addingSampleData = class TaonProjectsContext_1737301724542_addingSampleData extends lib_1.TaonBaseMigration {
    repoEnv = this.injectRepo(taon_env_entity_1.TaonEnv);
    /**
     * IMPORTANT !!!
     * remove this method if you are ready to run this migration
     */
    isReadyToRun() {
        return true;
    }
    // @ts-ignore
    async up(queryRunner) {
        // do "something" in db
        const environmentNames = [
            'dev',
            'dev2',
            'dev3',
            'dev4',
            'dev5',
            'dev6',
            'dev7',
            'dev8',
            'dev9',
            'test',
            'stage',
            'prod',
        ];
        for (const envName of environmentNames) {
            await this.repoEnv.save(taon_env_entity_1.TaonEnv.from({
                name: envName,
                type: envName.replace(/[0-9]/g, ''),
            }));
        }
    }
    // @ts-ignore
    async down(queryRunner) {
        // revert this "something" in db
        this.repoEnv.clear();
    }
};
exports.TaonProjectsContext_1737301724542_addingSampleData = TaonProjectsContext_1737301724542_addingSampleData;
exports.TaonProjectsContext_1737301724542_addingSampleData = TaonProjectsContext_1737301724542_addingSampleData = __decorate([
    (0, lib_1.TaonMigration)({
        className: 'TaonProjectsContext_1737301724542_addingSampleData',
    })
], TaonProjectsContext_1737301724542_addingSampleData);
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/migrations/1737301724542_addingSampleData.js.map