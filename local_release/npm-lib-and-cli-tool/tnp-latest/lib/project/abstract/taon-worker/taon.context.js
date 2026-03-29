"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaonProjectsContextTemplate = void 0;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-core/lib");
const lib_3 = require("tnp-helpers/lib");
const migrations_1 = require("../../../migrations");
const taon_build_entity_1 = require("./taon-build.entity");
const taon_env_entity_1 = require("./taon-env.entity");
const taon_project_entity_1 = require("./taon-project.entity");
const taon_controller_1 = require("./taon.controller");
//#endregion
exports.TaonProjectsContextTemplate = lib_1.Taon.createContextTemplate(() => ({
    contextName: 'TaonProjectsContext',
    appId: 'dev.taon.projects.worker',
    contexts: { TaonBaseContext: lib_1.TaonBaseContext },
    controllers: { TaonProjectsController: taon_controller_1.TaonProjectsController },
    entities: { TaonProject: taon_project_entity_1.TaonProject, TaonBuild: taon_build_entity_1.TaonBuild, TaonEnv: taon_env_entity_1.TaonEnv },
    migrations: { ...migrations_1.MIGRATIONS_CLASSES_FOR_TaonProjectsContext },
    skipWritingServerRoutes: lib_2.taonPackageName === lib_2.config.frameworkName,
    ...(0, lib_3.getBaseCliWorkerDatabaseConfig)('taon-projects-worker', 'DROP_DB+MIGRATIONS'),
    logs: {
    // framework: true,
    },
}));
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/taon.context.js.map