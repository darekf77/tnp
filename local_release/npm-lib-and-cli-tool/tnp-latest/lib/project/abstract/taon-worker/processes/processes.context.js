"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessesContext = void 0;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-helpers/lib");
const processes_1 = require("./processes");
const processes_controller_1 = require("./processes.controller");
const processes_repository_1 = require("./processes.repository");
const processes_worker_controller_1 = require("./processes.worker.controller");
//#endregion
const appId = 'processes-worker-app.project.worker';
exports.ProcessesContext = lib_1.Taon.createContextTemplate(() => ({
    contextName: 'ProcessesContext', // not needed if using HOST_CONFIG object
    appId,
    skipWritingServerRoutes: true,
    contexts: { TaonBaseContext: lib_1.TaonBaseContext },
    repositories: { ProcessesRepository: processes_repository_1.ProcessesRepository },
    database: true,
    entities: { Processes: processes_1.Processes },
    controllers: { ProcessesController: processes_controller_1.ProcessesController, ProcessesWorkerController: processes_worker_controller_1.ProcessesWorkerController },
    ...(0, lib_2.getBaseCliWorkerDatabaseConfig)(appId, 'DROP_DB+MIGRATIONS'),
}));
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/processes/processes.context.js.map