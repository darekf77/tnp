//#region imports
import { createContextTemplate, TaonBaseContext } from 'taon/src';
import { getBaseCliWorkerDatabaseConfig } from 'tnp-helpers/src';

import { IsomorphicPackagesController } from './isomorphic-packages.controller';
import { IsomorphicPackagesRepository } from './isomorphic-packages.repository';
//#endregion

const appId = 'isomorphic-packages-worker-app.project.worker';

export const IsomorphicPackagesContext = createContextTemplate(() => ({
  contextName: 'IsomorphicPackagesContext',
  appId,
  skipWritingServerRoutes: true,
  contexts: { TaonBaseContext },
  repositories: { IsomorphicPackagesRepository },
  controllers: { IsomorphicPackagesController },
  ...getBaseCliWorkerDatabaseConfig(appId, 'DROP_DB+MIGRATIONS'),
}));
