import { debounceTime, exhaustMap, map, Subscription } from 'rxjs';
import { Helpers, UtilsTerminal } from 'tnp-core/src';

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
    options = options || {};
    UtilsTerminal.clearConsole();

    const procData = await processesController
      .getByProcessID(processId)
      .request();

    const proc = procData.body.json;
    let displayLogs = true;
    const unsub: Subscription = await new Promise((resolve, reject) => {
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
            // return processesActions.UPDATE_PROCESS({
            //   process: {
            //     //
            //     id: process.id,
            //     changes: process,
            //   },
            // });
          }),
        )
        .subscribe(data => {
          if (displayLogs) {
            UtilsTerminal.clearConsole();
            process.stdout.write(data.outputLast40lines);
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
      Helpers.info(`PRESS ANY KEY TO STOP DISPLAYING PROGRESS...`);
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
      unsub.unsubscribe();
    } catch (error) {}

    // console.log(`Starting started...`);
    // await UtilsTerminal.pressAnyKeyToContinueAsync();
    //#endregion
  };
  //#endregion
}
