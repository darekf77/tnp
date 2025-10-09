import { debounceTime, exhaustMap, map, Subscription } from 'rxjs';
import { Helpers, UtilsTerminal } from 'tnp-core/src';

import { Deployments } from './deployments';
import { DeploymentsController } from './deployments.controller';

export namespace DeploymentsUtils {
  //#region display deployment progress
  export const displayRealtimeProgressMonitor = async (
    deployment: Deployments,
    ctrl: DeploymentsController,
    options?: {
      resolveWhenTextInStdoutOrStder?: string;
    },
  ): Promise<void> => {
    //#region @backendFunc
    options = options || {};
    UtilsTerminal.clearConsole();

    const procData = await ctrl.processesController
      .getByProcessID(deployment.processId)
      .request();

    const proc = procData.body.json;
    let displayLogs = true;
    const unsub: Subscription = await new Promise((resolve, reject) => {
      const sub = ctrl.ctx.realtimeClient
        .listenChangesEntityObj(proc)
        .pipe(
          debounceTime(500),
          exhaustMap(() => {
            return ctrl.processesController
              .getBy(proc.id)
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
            Helpers.clearConsole();
            console.log(data.output);
            if (
              options.resolveWhenTextInStdoutOrStder &&
              data?.output
                ?.toString()
                .includes(options.resolveWhenTextInStdoutOrStder)
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
