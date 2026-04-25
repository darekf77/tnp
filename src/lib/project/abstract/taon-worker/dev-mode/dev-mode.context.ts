//#region imports
import { createContextTemplate, TaonBaseContext } from 'taon/src';
import { getBaseCliWorkerDatabaseConfig } from 'tnp-helpers/src';

import { DevModeController } from './dev-mode.controller';

import { DevModeRepository } from './dev-mode.repository';
//#endregion

const appId = 'dev-mode-worker-app.project.worker';

export const DevModeContext = createContextTemplate(() => ({
  contextName: 'DevModeContext',
  appId,
  skipWritingServerRoutes: true,
  contexts: { TaonBaseContext },
  repositories: { DevModeRepository },
  entities: {},
  controllers: { DevModeController },
  database: false,
}));
