//#region imports
import { Taon, BaseContext } from 'taon/src';

import { Processes } from './processes';
import { ProcessesController } from './processes.controller';
import { ProcessesRepository } from './processes.repository';
//#endregion

export const ProcessesContext = Taon.createContext(() => ({
  /**
   * import HOST_CONFIG from app.hosts.ts if config initialization is needed
   * HOST_CONFIG contains contextName and other crusial information for context
   * seemless integration with Taon CLI
   */
  // ...HOST_CONFIG['ProcessesContext'],
  contextName: 'ProcessesContext', // not needed if using HOST_CONFIG object
  /**
   * set to false if you not going to initialize() this context independently
   * ( initialized context creates express server and database )
   */
  abstract: true,
  /**
   * database:true - if this context is going to use database
   */
  database: false,
  // if you need a migration to work - uncomment
  // migrations: {
  //   ...MIGRATIONS_CLASSES_FOR_ProcessesContext,
  // },
  contexts: { BaseContext },
  entities: { Processes },
  repositories: { ProcessesRepository },
  controllers: { ProcessesController },
}));
