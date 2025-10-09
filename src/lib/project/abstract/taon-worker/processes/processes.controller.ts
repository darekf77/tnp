//#region imports
import { Taon, ClassHelpers } from 'taon/src';
import { _, dateformat, Helpers } from 'tnp-core/src';

import { Processes } from './processes';
import { ProcessesRepository } from './processes.repository';
//#endregion

@Taon.Controller({
  className: 'ProcessesController',
})
export class ProcessesController extends Taon.Base.CrudController<Processes> {
  entityClassResolveFn: () => typeof Processes = () => Processes;

  private processesRepository = this.injectCustomRepo(ProcessesRepository);

  //#region start process
  @Taon.Http.GET()
  getByProcessID(
    @Taon.Http.Param.Query('processId')
    processId: number | string,
  ): Taon.Response<Processes> {
    //#region @websqlFunc
    return async (req, res) => {
      if (!processId) {
        throw new Error(`[ProcessesController][get-process] No processId provided!`);
      }
      const proc = await this.processesRepository.getByProcessID(processId);
      if (!proc) {
        throw new Error(
          `[ProcessesController] No process found for id ${processId}`,
        );
      }
      return proc;
    };
    //#endregion
  }
  //#endregion

  //#region start process
  @Taon.Http.GET()
  start(
    @Taon.Http.Param.Query('processId')
    processId: number,
  ): Taon.Response<void> {
    //#region @websqlFunc
    return async (req, res) => {
      if (!processId) {
        throw new Error(`[ProcessesController][start] No processId provided!`);
      }
      await this.processesRepository.start(processId);
    };
    //#endregion
  }
  //#endregion

  //#region stop process
  @Taon.Http.GET()
  stop(
    @Taon.Http.Param.Query('processId')
    processId: number,
  ): Taon.Response<void> {
    //#region @websqlFunc
    return async (req, res) => {
      if (!processId) {
        throw new Error(`[ProcessesController][stop] No processId provided!`);
      }
      await this.processesRepository.stop(processId);
    };
    //#endregion
  }
  //#endregion
}
