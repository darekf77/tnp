//#region imports
import { TaonBaseContext, Taon__NS__createContext, Taon__NS__createContextTemplate, Taon__NS__error, Taon__NS__getResponseValue, Taon__NS__init, Taon__NS__inject, Taon__NS__isBrowser, Taon__NS__isElectron, Taon__NS__isNode, Taon__NS__isWebSQL, Taon__NS__removeLoader, Taon__NS__Response, Taon__NS__ResponseHtml, Taon__NS__StartParams } from 'taon/lib-prod';
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