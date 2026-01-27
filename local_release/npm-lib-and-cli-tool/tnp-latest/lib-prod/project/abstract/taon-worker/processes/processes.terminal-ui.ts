//#region imports
import { debounceTime, exhaustMap, map, Subscription } from 'rxjs';
import { config } from 'tnp-core/lib-prod';
import { ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, UtilsCliClassMethod__NS__decoratorMethod, UtilsCliClassMethod__NS__getFrom, UtilsCliClassMethod__NS__staticClassNameProperty, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor } from 'tnp-core/lib-prod';
import {
  BaseCliWorkerTerminalUI,
  BaseWorkerTerminalActionReturnType,
} from 'tnp-helpers/lib-prod';

import { Processes } from './processes';
import { ProcessesController } from './processes.controller';
import { ProcessesStatesAllowedStart } from './processes.models';
import { ProcessesUtils__NS__displayRealtimeProgressMonitor } from './processes.utils';
import { ProcessesWorker } from './processes.worker';
//#endregion

let dummyProcessCreate = false;
export class ProcessesTerminalUI extends BaseCliWorkerTerminalUI<ProcessesWorker> {

  //#region header text
  protected async headerText(): Promise<string> {
    return 'Processes';
  }
  //#endregion

  //#region text header style
  protected textHeaderStyle(): CoreModels__NS__CfontStyle {
    return 'simpleBlock';
  }
  //#endregion

  //#region dummy process params
  async getDummyProcessParams(): Promise<{ command: string; cwd: string }> {

    //#region @backendFunc
    const { $Global } = await import('../../../cli/cli-_GLOBAL_');
    const dummyDummyCommand = `${config.frameworkName} ${UtilsCliClassMethod__NS__getFrom(
      $Global.prototype.showRandomHamstersTypes,
      { globalMethod: true },
    )}`;
    const dummyProcessCwd = UtilsOs__NS__getRealHomeDir();
    return { command: dummyDummyCommand, cwd: dummyProcessCwd };
    //#endregion

  }
  //#endregion

  //#region refetch process
  protected async refetchProcess(
    process: Processes,
    processesController: ProcessesController,
  ): Promise<Processes> {

    //#region @backendFunc
    while (true) {
      try {
        process = (
          await processesController.getByProcessID(process.id).request()
        ).body.json;
        return process;
      } catch (error) {
        const fetchAgain = await UtilsTerminal__NS__confirm({
          message: `Not able to fetch process (id=${process.id}). Try again?`,
          defaultValue: true,
        });
        if (!fetchAgain) {
          return;
        }
      }
    }
    //#endregion

  }
  //#endregion

  //#region crud menu for single deployment
  protected async crudMenuForSingleProcess(
    processFromDb: Processes,
    processesController: ProcessesController,
  ): Promise<void> {

    //#region @backendFunc
    while (true) {
      Helpers__NS__info(`Fetching processes data...`);
      processFromDb = (
        await processesController.getByProcessID(processFromDb.id).request()
      ).body.json;

      UtilsTerminal__NS__clearConsole();
      //       Helpers__NS__info(`You selected process:
      //  id: ${processFromDb.id}
      //  command: ${processFromDb.command}
      //  cwd: ${processFromDb.cwd}
      //  state: ${processFromDb.state}`);

      const choices = {
        back: {
          name: ' - back - ',
        },
        startProcess: {
          name: 'Start Process',
        },
        processInfo: {
          name: 'Process Info',
        },
        realtimeProcessMonitor: {
          name: 'Realtime Monitor',
        },
        displayProcessLog: {
          name: 'Display Log File',
        },
        stopProcess: {
          name: 'Stop Process',
        },
        removeProcess: {
          name: 'Remove Process',
        },
      };

      if (ProcessesStatesAllowedStart.includes(processFromDb.state)) {
        delete choices.stopProcess;
        delete choices.realtimeProcessMonitor;
      } else {
        delete choices.startProcess;
      }

      const selected = await UtilsTerminal__NS__select<keyof typeof choices>({
        choices,
        question: `[Process id=${processFromDb.id},status=${processFromDb.state}] What do you want to do?`,
      });

      switch (selected) {
        case 'back':
          return;
        case 'processInfo':
          processFromDb = await this.refetchProcess(
            processFromDb,
            processesController,
          );
          if (!processFromDb) {
            return;
          }
          UtilsTerminal__NS__clearConsole();
          console.log(processFromDb.fullPreviewString({ boldValues: true }));
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
          break;
        case 'startProcess':
          await processesController.triggerStart(processFromDb.id).request();
          Helpers__NS__info(`Triggered start for process`);
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
          break;
        case 'realtimeProcessMonitor':
          await ProcessesUtils__NS__displayRealtimeProgressMonitor(
            processFromDb.id,
            processesController,
          );
          break;
        case 'displayProcessLog':
          await UtilsTerminal__NS__previewLongListGitLogLike(
            Helpers__NS__readFile(processFromDb.fileLogAbsPath) ||
              '< empty log file >',
          );
          break;
        case 'stopProcess':
          await processesController.triggerStop(processFromDb.id).request();
          Helpers__NS__info(`Triggered stop for process..please wait`);
          await processesController.waitUntilProcessStopped(processFromDb.id);
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
          break;
        case 'removeProcess':
          await processesController
            .triggerStop(processFromDb.id, true)
            .request();

          Helpers__NS__info(`Triggered remove of process... please wait... `);
          await processesController.waitUntilProcessDeleted(processFromDb.id);
          Helpers__NS__info(`Process removed successfully.`);
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
          return;
      }
    }
    //#endregion

  }
  //#endregion

  getWorkerTerminalActions(options?: {
    exitIsOnlyReturn?: boolean;
    chooseAction?: boolean;
  }): BaseWorkerTerminalActionReturnType {

    //#region @backendFunc

    const myActions: BaseWorkerTerminalActionReturnType = {

      //#region get all processes from backend
      getStuffFromBackend: {
        name: 'Get all processes from backend',
        action: async () => {
          // Helpers__NS__info(`Stuff from backend will be fetched`);
          const processesController = await this.worker.getRemoteControllerFor({
            methodOptions: {
              calledFrom:
                'ProcessesTerminalUI.getWorkerTerminalActions/getStuffFromBackend',
            },
            controllerClass: ProcessesController,
          });

          while (true) {
            const list =
              (await processesController.getAll().request())?.body.json || [];
            Helpers__NS__info(`Fetched ${list.length} processes from backend.`);

            const options = [
              { name: ' - back - ', value: 'back' },
              ...list.map(c => ({
                name: c.previewString,
                value: c.id?.toString(),
              })),
            ];

            const selected = await UtilsTerminal__NS__select<string>({
              choices: options,
              question: 'Select process',
            });

            if (selected !== 'back') {
              await this.crudMenuForSingleProcess(
                list.find(l => l.id?.toString() === selected),
                processesController,
              );
            }

            if (selected === 'back') {
              return;
            }
          }
        },
      },
      //#endregion

      //#region create custom process
      startCustomProcess: {
        name: 'Start custom process',
        action: async () => {
          // Helpers__NS__info(`Stuff from backend will be fetched`);
          const processesController = await this.worker.getRemoteControllerFor({
            methodOptions: {
              calledFrom:
                'ProcessesTerminalUI.getWorkerTerminalActions/startCustomProcess',
            },
            controllerClass: ProcessesController,
          });

          const command = await UtilsTerminal__NS__input({
            required: true,
            question: 'Enter command to run:',
          });

          const processFromDBReq = await processesController
            .save(
              new Processes().clone({
                command,
                cwd: process.cwd(),
              }),
            )
            .request();
          const processFromDB = processFromDBReq.body.json;
          await processesController.triggerStart(processFromDB.id).request();

          Helpers__NS__info(
            `Triggered start for process -

      > command: "${command}"

      `,
          );
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      //#endregion

      //#region create dummy process
      createDummyProcess: {
        name: 'DUMMY PROCESS - create and start',
        action: async () => {
          // Helpers__NS__info(`Stuff from backend will be fetched`);

          try {
            const processesController =
              await this.worker.getRemoteControllerFor({
                methodOptions: {
                  calledFrom:
                    'ProcessesTerminalUI.getWorkerTerminalActions/createDummyProcess',
                },
                controllerClass: ProcessesController,
              });

            const { command, cwd } = await this.getDummyProcessParams();

            const processFromDBReq = await processesController
              .save(
                new Processes().clone({
                  command,
                  cwd,
                }),
              )
              .request();
            const processFromDB = processFromDBReq.body.json;
            await processesController.triggerStart(processFromDB.id).request();
            dummyProcessCreate = true;
            Helpers__NS__info(
              `Triggered start for dummy process -

            > command: "${command}"

            `,
            );
          } catch (error) {
            console.log(error);
            await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
              message: 'Press any key to go back to main menu',
            });
          }
        },
      },
      //#endregion

      //#region stop dummy process
      stopDummyProcess: {
        name: 'DUMMY PROCESS - stop process',
        action: async () => {
          // Helpers__NS__info(`Stuff from backend will be fetched`);
          const processesController = await this.worker.getRemoteControllerFor({
            methodOptions: {
              calledFrom:
                'ProcessesTerminalUI.getWorkerTerminalActions/stopDummyProcess',
            },
            controllerClass: ProcessesController,
          });
          const { command, cwd } = await this.getDummyProcessParams();
          const processFromDBReq = await processesController
            .save(
              new Processes().clone({
                command,
                cwd,
              }),
            )
            .request();
          const processFromDB = processFromDBReq.body.json;

          await processesController.triggerStop(processFromDB.id).request();

          Helpers__NS__info(`Triggered stop for dummy process `);
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      //#endregion

      //#region get dummy process info
      getDummyProcessInfo: {
        name: 'DUMMY PROCESS - get info',
        action: async () => {
          // Helpers__NS__info(`Stuff from backend will be fetched`);
          const processesController = await this.worker.getRemoteControllerFor({
            methodOptions: {
              calledFrom:
                'ProcessesTerminalUI.getWorkerTerminalActions/getDummyProcessInfo',
            },
            controllerClass: ProcessesController,
          });
          const { command, cwd } = await this.getDummyProcessParams();
          const processFromDBReq = await processesController
            .getByUniqueParams(cwd, command)
            .request();
          const processFromDB = processFromDBReq.body.json;

          Helpers__NS__info(
            `
            Dummy process info:

  > id: ${processFromDB.id}
  > cwd: ${processFromDB.cwd}
  > command: ${processFromDB.command}
  > state: ${processFromDB.state}
  > pid: ${processFromDB.pid}
  > ppid: ${processFromDB.ppid}
  > log path: ${processFromDB.fileLogAbsPath}
  > conditionProcessActiveStdout: ${(processFromDB.conditionProcessActiveStdout || []).join(', ') || '<empty>'}
  > conditionProcessActiveStderr: ${(processFromDB.conditionProcessActiveStderr || []).join(', ') || '<empty>'}

            `,
          );
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      //#endregion

      //#region preview log file of dummy process
      getPreviewLogFile: {
        name: 'DUMMY PROCESS - preview log file',
        action: async () => {
          // Helpers__NS__info(`Stuff from backend will be fetched`);
          const processesController = await this.worker.getRemoteControllerFor({
            methodOptions: {
              calledFrom:
                'ProcessesTerminalUI.getWorkerTerminalActions/getPreviewLogFile',
            },
            controllerClass: ProcessesController,
          });
          const { command, cwd } = await this.getDummyProcessParams();
          const processFromDBReq = await processesController
            .getByUniqueParams(cwd, command)
            .request();
          const processFromDB = processFromDBReq.body.json;

          await UtilsTerminal__NS__previewLongListGitLogLike(
            Helpers__NS__readFile(processFromDB.fileLogAbsPath) ||
              '< empty log file >',
          );
        },
      },
      //#endregion

      //#region get realtime preview of dummy process output
      realtimePreviewDummyProcess: {
        name: 'DUMMY PROCESS - get realtime preview',
        action: async () => {
          // Helpers__NS__info(`Stuff from backend will be fetched`);
          const processesController = await this.worker.getRemoteControllerFor({
            methodOptions: {
              calledFrom: 'realtimePreviewDummyProcess',
            },
            controllerClass: ProcessesController,
          });
          const { command, cwd } = await this.getDummyProcessParams();
          const processFromDBReq = await processesController
            .getByUniqueParams(cwd, command)
            .request();
          const processFromDB = processFromDBReq.body.json;

          await ProcessesUtils__NS__displayRealtimeProgressMonitor(
            processFromDB.id,
            processesController,
          );
        },
      },
      //#endregion

    };

    if (!dummyProcessCreate) {
      delete myActions.stopDummyProcess;
      delete myActions.getDummyProcessInfo;
      delete myActions.getPreviewLogFile;
      delete myActions.realtimePreviewDummyProcess;
    }

    return {
      ...this.chooseAction,
      ...myActions,
      ...super.getWorkerTerminalActions({ ...options, chooseAction: false }),
    };
    //#endregion

  }
}