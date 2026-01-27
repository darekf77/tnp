//#region imports
import { TaonBaseContext, Taon__NS__createContext, Taon__NS__createContextTemplate, Taon__NS__error, Taon__NS__getResponseValue, Taon__NS__init, Taon__NS__inject, Taon__NS__isBrowser, Taon__NS__isElectron, Taon__NS__isNode, Taon__NS__isWebSQL, Taon__NS__removeLoader, Taon__NS__Response, Taon__NS__ResponseHtml, Taon__NS__StartParams } from 'taon/lib-prod';
import { getBaseCliWorkerDatabaseConfig } from 'tnp-helpers/lib-prod';

import { Processes } from './processes';
import { ProcessesController } from './processes.controller';
import { ProcessesRepository } from './processes.repository';
import { ProcessesWorkerController } from './processes.worker.controller';
//#endregion

const appId = 'processes-worker-app.project.worker';

export const ProcessesContext = Taon__NS__createContextTemplate(() => ({
  contextName: 'ProcessesContext', // not needed if using HOST_CONFIG object
  appId,
  skipWritingServerRoutes: true,
  contexts: { TaonBaseContext },
  repositories: { ProcessesRepository },
  database: true,
  entities: { Processes },
  controllers: { ProcessesController, ProcessesWorkerController },
  ...getBaseCliWorkerDatabaseConfig(appId, 'DROP_DB+MIGRATIONS'),
}));