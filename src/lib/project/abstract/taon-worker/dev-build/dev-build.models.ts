export namespace DevBuildModels {
  export enum CommandStatus {
    IDLE = 'IDLE',
    STARTED = 'STARTED',
    DONE = 'DONE',
    KILLED_OR_ERRROR = 'KILLED_OR_ERRROR',
  }

  export const START_PORT_BUID_PROCESS = 7777;
}
