//#region imports
import { Taon, BaseContext } from 'taon/src';
import { getBaseCliWorkerDatabaseConfig } from 'tnp-helpers/src';

import { Deployments } from './deployments';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsRepository } from './deployments.repository';
//#endregion

const appId = 'deployments-worker-app.project.worker';

export const DeploymentsContext = Taon.createContextTemplate(() => ({
  contextName: 'DeploymentsContext',
  appId,
  skipWritingServerRoutes: true,
  contexts: { BaseContext },
  repositories: { DeploymentsRepository },
  entities: { Deployments },
  controllers: { DeploymentsController },
  ...getBaseCliWorkerDatabaseConfig(
    appId,
    'DROP_DB+MIGRATIONS',
  ),
}));
