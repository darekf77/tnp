//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { DevBuildController } from './dev-build.controller';
import { DevBuildRepository } from './dev-build.repository';
//#endregion

export const DevBuildContext = createContext(() => ({
  contextName: 'DevBuildContext',
  abstract: true,
  contexts: { TaonBaseContext },
  controllers: { DevBuildController },
  repositories: { DevBuildRepository },
}));
