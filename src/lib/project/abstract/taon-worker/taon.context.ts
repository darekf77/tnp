//#region imports
import { TaonBaseContext, Taon } from 'taon/src';
import { config, taonPackageName } from 'tnp-core/src';
import { os, UtilsOs } from 'tnp-core/src';
import { crossPlatformPath, Helpers, path } from 'tnp-core/src';
import { getBaseCliWorkerDatabaseConfig } from 'tnp-helpers/src';

import { MIGRATIONS_CLASSES_FOR_TaonProjectsContext } from '../../../migrations';

import { TaonBuild } from './taon-build.entity';
import { TaonEnv } from './taon-env.entity';
import { TaonProject } from './taon-project.entity';
import { TaonProjectsController } from './taon.controller';
//#endregion

export const TaonProjectsContextTemplate = Taon.createContextTemplate(() => ({
  contextName: 'TaonProjectsContext',
  appId: 'dev.taon.projects.worker',
  contexts: { TaonBaseContext },
  controllers: { TaonProjectsController },
  entities: { TaonProject, TaonBuild, TaonEnv },
  migrations: { ...MIGRATIONS_CLASSES_FOR_TaonProjectsContext },
  skipWritingServerRoutes:
    taonPackageName === config.frameworkName,
  ...getBaseCliWorkerDatabaseConfig(
    'taon-projects-worker',
    'DROP_DB+MIGRATIONS',
  ),
  logs: {
    // framework: true,
  },
}));
