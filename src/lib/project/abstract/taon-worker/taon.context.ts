//#region imports
import { BaseContext, Taon } from 'taon/src';
import { config } from 'tnp-config/src';
import { os, UtilsOs } from 'tnp-core/src';
import { crossPlatformPath, Helpers, path } from 'tnp-core/src';
import { getBaseCliWorkerDatabaseConfig } from 'tnp-helpers/src';

import { MIGRATIONS_CLASSES_FOR_TaonProjectsContext } from '../../../../migrations';

import { TaonBuild } from './taon-build.entity';
import { TaonEnv } from './taon-env.entity';
import { TaonProject } from './taon-project.entity';
import { TaonProjectsController } from './taon.controller';
//#endregion

export const TaonProjectsContextTemplate = Taon.createContextTemplate(() => ({
  contextName: 'TaonProjectsContext',
  appId: 'dev.taon.projects.worker',
  contexts: { BaseContext },
  controllers: { TaonProjectsController },
  entities: { TaonProject, TaonBuild, TaonEnv },
  migrations: { ...MIGRATIONS_CLASSES_FOR_TaonProjectsContext },
  skipWritingServerRoutes:
    config.frameworkNames.productionFrameworkName === config.frameworkName,
  ...getBaseCliWorkerDatabaseConfig(
    'taon-projects-worker',
    'DROP_DB+MIGRATIONS',
  ),
  logs: {
    // framework: true,
  },
}));
