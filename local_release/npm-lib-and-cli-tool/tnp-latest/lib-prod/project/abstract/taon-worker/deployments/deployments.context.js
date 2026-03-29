//#region imports
import { TaonBaseContext, Taon__NS__createContextTemplate } from 'taon/lib-prod';
import { getBaseCliWorkerDatabaseConfig } from 'tnp-helpers/lib-prod';
import { Deployments } from './deployments';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsMiddleware } from './deployments.middleware';
import { DeploymentsRepository } from './deployments.repository';
//#endregion
const appId = 'deployments-worker-app.project.worker';
export const DeploymentsContext = Taon__NS__createContextTemplate(() => ({
    contextName: 'DeploymentsContext',
    appId,
    skipWritingServerRoutes: true,
    contexts: { TaonBaseContext },
    repositories: { DeploymentsRepository },
    entities: { Deployments },
    middlewares: { DeploymentsMiddleware },
    controllers: { DeploymentsController },
    ...getBaseCliWorkerDatabaseConfig(appId, 'DROP_DB+MIGRATIONS'),
}));
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/deployments/deployments.context.js.map