//#region imports
import { Taon, ClassHelpers } from 'taon/src';
import { _, dateformat, Helpers } from 'tnp-core/src';
import { BaseCliWorkerController } from 'tnp-helpers/src';

import { Processes } from './processes';
import { ProcessesRepository } from './processes.repository';
//#endregion

@Taon.Controller({
  className: 'ProcessesController',
})
export class ProcessesController extends Taon.Base.CrudController<Processes> {
  entityClassResolveFn: () => typeof Processes = () => Processes;
  // @ts-ignore
  private processesRepository = this.injectCustomRepo(ProcessesRepository);

  //#region get by process id
  @Taon.Http.GET()
  getByProcessID(
    @Taon.Http.Param.Query('processId')
    processId: number | string,
  ): Taon.Response<Processes> {
    //#region @websqlFunc
    return async (req, res) => {
      if (!processId) {
        throw new Error(`No processId query param provided!`);
      }
      const proc = await this.processesRepository.getByProcessID(processId);
      if (!proc) {
        throw new Error(`No process found by id ${processId}`);
      }
      return proc;
    };
    //#endregion
  }
  //#endregion

  //#region get by unique params
  @Taon.Http.GET()
  getByUniqueParams(
    @Taon.Http.Param.Query('cwd')
    cwd: string,
    @Taon.Http.Param.Query('command')
    command: string,
  ): Taon.Response<Processes> {
    //#region @websqlFunc
    return async (req, res) => {
      if (!cwd) {
        throw new Error(`No cwd query param provided!`);
      }
      if (!command) {
        throw new Error(`No command query param provided!`);
      }
      const proc = await this.processesRepository.getByUniqueParams({
        cwd,
        command,
      });
      if (!proc) {
        throw new Error(`No process found by given unique params!
          cwd: ${cwd}
          command: ${command}
          `);
      }
      return proc;
    };
    //#endregion
  }
  //#endregion

  //#region trigger start process
  @Taon.Http.GET()
  triggerStart(
    @Taon.Http.Param.Query('processId')
    processId: number | string,
    @Taon.Http.Param.Query('processName') processName?: string,
  ): Taon.Response<void> {
    //#region @websqlFunc
    return async (req, res) => {
      if (!processId) {
        throw new Error(`No processId queryParm provided!`);
      }
      await this.processesRepository.triggerStart(processId, {
        processName,
      });
    };
    //#endregion
  }
  //#endregion

  //#region trigger stop process
  @Taon.Http.GET()
  triggerStop(
    @Taon.Http.Param.Query('processId')
    processId: number | string,
  ): Taon.Response<void> {
    //#region @websqlFunc
    return async (req, res) => {
      if (!processId) {
        throw new Error(`No processId queryParm provided!`);
      }
      await this.processesRepository.triggerStop(processId);
    };
    //#endregion
  }
  //#endregion
}
