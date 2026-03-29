"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentsContext = void 0;
//#region imports
const lib_1 = require("taon/lib");
const lib_2 = require("tnp-helpers/lib");
const deployments_1 = require("./deployments");
const deployments_controller_1 = require("./deployments.controller");
const deployments_middleware_1 = require("./deployments.middleware");
const deployments_repository_1 = require("./deployments.repository");
//#endregion
const appId = 'deployments-worker-app.project.worker';
exports.DeploymentsContext = lib_1.Taon.createContextTemplate(() => ({
    contextName: 'DeploymentsContext',
    appId,
    skipWritingServerRoutes: true,
    contexts: { TaonBaseContext: lib_1.TaonBaseContext },
    repositories: { DeploymentsRepository: deployments_repository_1.DeploymentsRepository },
    entities: { Deployments: deployments_1.Deployments },
    middlewares: { DeploymentsMiddleware: deployments_middleware_1.DeploymentsMiddleware },
    controllers: { DeploymentsController: deployments_controller_1.DeploymentsController },
    ...(0, lib_2.getBaseCliWorkerDatabaseConfig)(appId, 'DROP_DB+MIGRATIONS'),
}));
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/project/abstract/taon-worker/deployments/deployments.context.js.map