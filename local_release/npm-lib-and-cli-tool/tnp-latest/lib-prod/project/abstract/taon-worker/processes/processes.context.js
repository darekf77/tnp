//#region imports
import { TaonBaseContext, Taon__NS__createContextTemplate } from 'taon/lib-prod';
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
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/processes/processes.context.js.map