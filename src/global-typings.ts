//#region @backend
// import { Ora } from 'ora';
export {};

declare global {
  namespace NodeJS {
    interface Global {
      /**
       * Check whether am running from:
       *  - system command line
       *  - I am calling Tnp from require/imports in some ts files
       */
      globalSystemToolMode: boolean;
      /**
       * Occasional mute of all messages
       */
      muteMessages: boolean;
      testMode: boolean;
      hideWarnings: boolean;
      hideInfos: boolean;
      /**
       * default true
       *
       * You can turn if of with "-verbose" paramter
       */
      hideLog: boolean;
      /**
       * This prevent circular dependency install in container
       * when showing deps in other projects
       */
      actionShowingDepsForContainer?: boolean;
      tnpShowProgress?: boolean;
      /**
       * Application will automaticly choose parameters
       * usefull for calling in global tool mode
       * when vscode plugin is running
       */
      tnpNonInteractive?: boolean;
      tnpNoColorsMode?: boolean;
      dbAlreadyRecreated?: boolean;
      spinner: any; // Ora;
    }
  }
}
//#endregion
