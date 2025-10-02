//#region imports
import { Taon, BaseContext } from 'taon/src';
import { getBaseCliWorkerDatabaseConfig } from 'tnp-helpers/src';

import { ProcessesContext } from '../processes/processes.context';

import { Deployments } from './deployments';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsMiddleware } from './deployments.middleware';
import { DeploymentsRepository } from './deployments.repository';
//#endregion

const appId = 'deployments-worker-app.project.worker';

export const DeploymentsContext = Taon.createContextTemplate(() => ({
  contextName: 'DeploymentsContext',
  appId,
  skipWritingServerRoutes: true,
  contexts: { BaseContext, ProcessesContext },
  repositories: { DeploymentsRepository },
  entities: { Deployments },
  middlewares: { DeploymentsMiddleware },
  controllers: { DeploymentsController },
  ...getBaseCliWorkerDatabaseConfig(appId, 'DROP_DB+MIGRATIONS'),
}));
