import { debounceTime, exhaustMap, map, Subscription } from 'rxjs';
import { Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds, UtilsProcessLogger__NS__baseDirTaonProcessLogs, UtilsProcessLogger__NS__createStickyTopBox, UtilsProcessLogger__NS__getLogsFiles, UtilsProcessLogger__NS__ProcessFileLogger, UtilsProcessLogger__NS__ProcessFileLoggerOptions, UtilsProcessLogger__NS__SpecialEventInProcessLogger, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';

import { ProcessesController } from './processes.controller';

//namespace ProcessesUtils

  export const ProcessesUtils__NS__displayRealtimeProgressMonitor = async (
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
    UtilsTerminal__NS__clearConsole();
    const wrap = UtilsProcessLogger__NS__createStickyTopBox(
      `PROCESS REALTIME OUTPUT - PRESS ENTER KEY TO STOP`,
    );
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
            // UtilsTerminal__NS__clearConsole();
            wrap.clear();
            wrap.update(data.outputLast40lines);
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
        resolve(sub);
      });
    });

    UtilsTerminal__NS__clearConsole();
    try {
      unSub.unsubscribe();
    } catch (error) {}

    // console.log(`Starting started...`);
    // await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
    //#endregion

  };
  //#endregion


//end of namespace ProcessesUtils