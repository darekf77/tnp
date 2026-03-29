//#region imports
import { TaonBaseContext, Taon__NS__createContextTemplate } from 'taon/lib-prod';
import { config, taonPackageName } from 'tnp-core/lib-prod';
import { getBaseCliWorkerDatabaseConfig } from 'tnp-helpers/lib-prod';
import { MIGRATIONS_CLASSES_FOR_TaonProjectsContext } from '../../../migrations';
import { TaonBuild } from './taon-build.entity';
import { TaonEnv } from './taon-env.entity';
import { TaonProject } from './taon-project.entity';
import { TaonProjectsController } from './taon.controller';
//#endregion
export const TaonProjectsContextTemplate = Taon__NS__createContextTemplate(() => ({
    contextName: 'TaonProjectsContext',
    appId: 'dev.taon.projects.worker',
    contexts: { TaonBaseContext },
    controllers: { TaonProjectsController },
    entities: { TaonProject, TaonBuild, TaonEnv },
    migrations: { ...MIGRATIONS_CLASSES_FOR_TaonProjectsContext },
    skipWritingServerRoutes: taonPackageName === config.frameworkName,
    ...getBaseCliWorkerDatabaseConfig('taon-projects-worker', 'DROP_DB+MIGRATIONS'),
    logs: {
    // framework: true,
    },
}));
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/taon.context.js.map