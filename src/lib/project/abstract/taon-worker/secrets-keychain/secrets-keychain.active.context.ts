//#region imports
import { createContext, TaonBaseContext } from 'taon/src';
import { createContextTemplate } from 'taon/src';
import { getBaseCliWorkerDatabaseConfig } from 'tnp-helpers/src';

import { SecretsKeychainController } from './secrets-keychain.controller';
import { SecretsKeychainEntity } from './secrets-keychain.entity';
import { SecretsKeychainKvRepository } from './secrets-keychain.kv.repository';
import { SecretsKeychainProvider } from './secrets-keychain.provider';
import { SecretsKeychainRepository } from './secrets-keychain.repository';
// import { SecretsKeychainKvRepository } from './secrets-keychain.kv.repository';

// import { SecretsKeychainMiddleware } from './secrets-keychain.middleware';
// import { SecretsKeychainSubscriber } from './secrets-keychain.subscriber';
//#endregion

const appId = 'secrets-keychain-app.project.worker';

export const SecretsKeychainActiveContext = createContextTemplate(() => ({
  contextName: 'SecretsKeychainActiveContext',
  appId,
  skipWritingServerRoutes: true,
  contexts: { TaonBaseContext },
  entities: { SecretsKeychainEntity },
  controllers: { SecretsKeychainController },
  repositories: {
    // SecretsKeychainKvRepository
    SecretsKeychainRepository,
    SecretsKeychainKvRepository,
  },
  providers: { SecretsKeychainProvider },
  ...getBaseCliWorkerDatabaseConfig(appId, 'DROP_DB__RUN_MIGRATIONS'),
}));
