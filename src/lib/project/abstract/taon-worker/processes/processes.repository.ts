//#region imports
import type { ChildProcess } from 'child_process';

import { Taon } from 'taon/src';
import { Raw } from 'taon-typeorm/src';
import { _, child_process, dateformat, Helpers } from 'tnp-core/src';

import { Processes } from './processes';
//#endregion

@Taon.Repository({
  className: 'ProcessesRepository',
})
export class ProcessesRepository extends Taon.Base.Repository<Processes> {
  entityClassResolveFn: () => typeof Processes = () => Processes;

  async getByProcessID(processId: number | string): Promise<Processes | null> {
    //#region @websqlFunc
    const proc = await this.findOne({
      where: {
        id: processId?.toString(),
      },
    });
    return proc;
    //#endregion
  }

  //#region start process
  async start(processId: string | number): Promise<void> {
    //#region @websqlFunc
    let processFromDb = await this.findOne({
      where: { id: processId?.toString() },
    });

    if (processFromDb.state === 'active') {
      Helpers.warn('[ProcesController] process already stated');
      return;
    }
    processFromDb.state = 'starting';
    processFromDb.output = `${processFromDb.output}\n----- new session ${dateformat(new Date())} -----\n`;
    await this.update(processFromDb);
    // const realProcess = child_process.exec(processFromDb.command, {
    //   stdio: ['ignore', 'pipe', 'pipe'], // stdin ignored, capture stdout & stderr
    //   cwd: processFromDb.cwd,
    // });
    const [cmd, ...args] = processFromDb.command.split(' '); // safer: parse properly
    const realProcess = child_process.spawn(cmd, args, {
      stdio: ['ignore', 'pipe', 'pipe'], // don't inherit console
      shell: true, // use shell if command has operators (&&, |, etc.)
    });

    processFromDb.state = 'active';
    processFromDb.pid = realProcess.pid;
    // console.log(`Starting child process with pid: ${realProcess.pid}`);
    await this.update(processFromDb);

    //#region update process
    const updateProcess = _.debounce(async (newData: string) => {
      processFromDb = await this.findOne({
        where: { id: processId?.toString() },
      });
      if (!processFromDb.output) {
        processFromDb.output = '';
      }
      processFromDb.output = `${processFromDb.output}${newData}`;
      await this.update(processFromDb);

      this.ctx.realtimeServer.triggerEntityChanges(Processes, processFromDb.id);
      // Taon.Realtime.Server.TrigggerEntityChanges(process);
    }, 500);
    //#endregion

    realProcess.stdout.on('data', data => {
      updateProcess(data);
    });
    realProcess.stderr.on('data', data => {
      updateProcess(data);
    });
    /**
     * 15 - soft kill
     * 9 - hard kill
     * 1 - from code exit
     * 0 - process done
     */
    realProcess.on('exit', async (code, data) => {
      processFromDb.state = code === 0 ? 'ended-ok' : 'ended-with-error';
      processFromDb.pid = void 0;
      await this.update(processFromDb);

      this.ctx.realtimeServer.triggerEntityChanges(Processes, processFromDb.id);
      // Taon.Realtime.Server.TrigggerEntityChanges(process);
    });
    //#endregion
  }
  //#endregion

  //#region stop process
  async stop(processId: string | number): Promise<void> {
    //#region @websqlFunc
    let processFromDb = await this.findOne({
      where: { id: processId?.toString() },
    });
    if (!processFromDb || !processFromDb.pid) {
      Helpers.warn(
        `[ProcessesRepository] No process with id ${processId} or pid ${processFromDb?.pid}`,
      );
      return;
    }
    processFromDb.state = 'killing';
    console.log(`Killing child process with pid: ${processFromDb.pid}`);
    await this.update(processFromDb);

    this.ctx.realtimeServer.triggerEntityChanges(Processes, processFromDb.id);
    try {
      Helpers.killProcess(processFromDb.pid);
      console.info(
        `Process killed successfully (by pid = ${processFromDb.pid})`,
      );
    } catch (error) {
      console.error(`Not able to kill process by pid ${processFromDb.pid}`);
    }
    processFromDb.state = 'killed';
    processFromDb.pid = void 0;
    await this.update(processFromDb);
    //#endregion
  }
  //#endregion
}
