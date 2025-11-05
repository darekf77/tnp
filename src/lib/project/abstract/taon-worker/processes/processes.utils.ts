import { debounceTime, exhaustMap, map, Subscription } from 'rxjs';
import { Helpers, UtilsTerminal, UtilsProcessLogger } from 'tnp-core/src';

import { ProcessesController } from './processes.controller';

export namespace ProcessesUtils {
  export const displayRealtimeProgressMonitor = async (
    processId: number | string,
    processesController: ProcessesController,
    options?: {
      resolveWhenTextInOutput?: string;
    },
  ): Promise<void> => {
    //#region @backendFunc
    if (!processId) {
      throw new Error(`processId is required`);
    }
    if (!processesController) {
      throw new Error(`processesController is required`);
    }
    options = options || {};

    const wrap = UtilsProcessLogger.createStickyTopBox(
      `PROCESS REALTIME OUTPUT - PRESS ENTER KEY TO STOP`,
    );
    wrap.clear();
    wrap.draw(`Waiting for process ${processId} to start...`);
    await processesController.waitUntilProcessStartedOrActive(processId);
    wrap.draw(`PRESS ANY KEY TO STOP DISPLAYING PROGRESS...`);
    const procData = await processesController
      .getByProcessID(processId)
      .request();

    const proc = procData.body.json;
    let displayLogs = true;
    const unSub: Subscription = await new Promise((resolve, reject) => {
      const sub = processesController.ctx.realtimeClient
        .listenChangesEntity(proc, {
          property: 'outputLast40lines',
        })
        .pipe(
          debounceTime(500),
          exhaustMap(() => {
            return processesController
              .getByProcessID(proc.id)
              .request()
              .observable.pipe(map(r => r.body.rawJson));
          }),
          map(p => {
            return p;
          }),
        )
        .subscribe(data => {
          if (displayLogs) {
            // UtilsTerminal.clearConsole();
            wrap.append(data.outputLast40lines);
            // process.stdout.write(data.outputLast40lines);
            if (
              options.resolveWhenTextInOutput &&
              data?.outputLast40lines
                ?.toString()
                .includes(options.resolveWhenTextInOutput)
            ) {
              process.stdin.emit('data', Buffer.from('\n'));
            }
          }
        });
      let closing = false;

      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', () => {
        if (closing) {
          return;
        }
        displayLogs = false;
        // If we are already closing, ignore further input
        sub.unsubscribe();
        Helpers.clearConsole();
        resolve(sub);
      });
    });
    try {
      unSub.unsubscribe();
    } catch (error) {}

    // console.log(`Starting started...`);
    // await UtilsTerminal.pressAnyKeyToContinueAsync();
    //#endregion
  };
  //#endregion
}
