import { debounceTime, exhaustMap, map } from 'rxjs';
import { Utils__NS__waitMilliseconds, UtilsProcessLogger__NS__createStickyTopBox, UtilsTerminal__NS__clearConsole } from 'tnp-core/lib-prod';
//namespace ProcessesUtils
export const ProcessesUtils__NS__displayRealtimeProgressMonitor = async (processId, processesController, options) => {
    //#region @backendFunc
    if (!processId) {
        throw new Error(`processId is required`);
    }
    if (!processesController) {
        throw new Error(`processesController is required`);
    }
    options = options || {};
    UtilsTerminal__NS__clearConsole();
    const wrap = UtilsProcessLogger__NS__createStickyTopBox(`PROCESS REALTIME OUTPUT - PRESS ENTER KEY TO STOP`);
    wrap.clear();
    // wrap.update(`Waiting for process id=${processId} to start...`);
    // await processesController.waitUntilProcessExists(processId);
    // await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
    //   message: `Process started. Listening for realtime output...`,
    // });
    wrap.update(`PRESS ANY KEY TO STOP DISPLAYING PROGRESS...`);
    const procData = await processesController
        .getByProcessID(processId)
        .request();
    const proc = procData.body.json;
    if (proc.outputLast40lines) {
        await Utils__NS__waitMilliseconds(500);
        wrap.clear();
        wrap.update(proc.outputLast40lines);
    }
    // Helpers__NS__info(`Listening for process id=${processId}  realtime output...`);
    let displayLogs = true;
    const unSub = await new Promise((resolve, reject) => {
        const sub = processesController.ctx.realtimeClient
            .listenChangesEntity(proc, {
            property: 'outputLast40lines',
        })
            .pipe(debounceTime(500), exhaustMap(() => {
            return processesController
                .getByProcessID(proc.id)
                .request() // @ts-ignore
                .observable.pipe(map(r => r.body.rawJson));
        }), map(p => {
            return p;
        }))
            .subscribe(data => {
            if (displayLogs) {
                // UtilsTerminal__NS__clearConsole();
                wrap.clear();
                wrap.update(data.outputLast40lines);
                // process.stdout.write(data.outputLast40lines);
                if (options.resolveWhenTextInOutput &&
                    data?.outputLast40lines
                        ?.toString()
                        .includes(options.resolveWhenTextInOutput)) {
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
            resolve(sub);
        });
    });
    UtilsTerminal__NS__clearConsole();
    try {
        unSub.unsubscribe();
    }
    catch (error) { }
    // console.log(`Starting started...`);
    // await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
    //#endregion
};
//#endregion
//end of namespace ProcessesUtils
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/project/abstract/taon-worker/processes/processes.utils.js.map