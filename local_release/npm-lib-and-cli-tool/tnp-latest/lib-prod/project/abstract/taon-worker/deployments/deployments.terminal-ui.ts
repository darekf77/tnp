//#region imports
import { ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import {
  BaseCliWorkerTerminalUI,
  BaseWorkerTerminalActionReturnType,
} from 'tnp-helpers/lib-prod';

import { Project } from '../../project';
import { ProcessesController } from '../processes/processes.controller';

import { Deployments } from './deployments';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsStatesAllowedStart } from './deployments.models';
import { DeploymentsUtils__NS__displayRealtimeProgressMonitor } from './deployments.utils';
import { DeploymentsWorker } from './deployments.worker';
//#endregion

// @ts-ignore TODO weird inheritance problem
export class DeploymentsTerminalUI extends BaseCliWorkerTerminalUI<DeploymentsWorker> {
  async headerText(): Promise<string> {
    return 'Taon Deployments';
  }

  textHeaderStyle(): CoreModels__NS__CfontStyle {
    return 'shade';
  }

  //#region stop deployment
  private async stopDeployment(
    deployment: Deployments,
    ctrl: DeploymentsController,
  ): Promise<void> {

    //#region @backendFunc
    console.log(`Stopping deployment... please wait...`);
    await ctrl
      .triggerDeploymentStop(deployment.baseFileNameWithHashDatetime)
      .request();
    console.log(`Waiting until deployment stopped...`);
    await ctrl.waitUntilDeploymentStopped(deployment.id);

    console.log(`Stopping done..`);
    await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
    //#endregion

  }
  //#endregion

  //#region remove deployment
  private async removeDeployment(
    deployment: Deployments,
    ctrl: DeploymentsController,
  ): Promise<void> {

    //#region @backendFunc
    while (true) {
      console.log(`Removing deployment... please wait...`);
      try {
        await ctrl
          .triggerDeploymentRemove(deployment.baseFileNameWithHashDatetime)
          .request();

        await ctrl.waitUntilDeploymentRemoved(deployment.id);

        console.log(`Removing done..`);
        break;
      } catch (error) {
        if (!(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))) {
          break;
        }
      }
    }
    await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
    //#endregion

  }
  //#endregion

  //#region start deployment
  private async startDeployment(
    deployment: Deployments,
    ctrl: DeploymentsController,
    options?: { forceStart?: boolean },
  ): Promise<void> {

    //#region @backendFunc
    options = options || {};
    console.log(`Starting deployment...`);
    try {
      await ctrl
        .triggerDeploymentStart(
          deployment.baseFileNameWithHashDatetime,
          !!options.forceStart,
        )
        .request();
      console.log(`Waiting for deployment to start...`);
      await ctrl.waitUntilDeploymentHasComposeUpProcess(deployment.id);
      console.log(`deployment process started...`);
    } catch (error) {
      console.error('Fail to start deployment');
    }
    //#endregion

  }
  //#endregion

  //#region refetch deployment
  protected async refetchDeployment(
    deployment: Deployments,
    deploymentsController: DeploymentsController,
  ): Promise<Deployments> {

    //#region @backendFunc
    while (true) {
      try {
        deployment = (
          await deploymentsController.getByDeploymentId(deployment.id).request()
        ).body.json;
        return deployment;
      } catch (error) {
        const fetchAgain = await UtilsTerminal__NS__confirm({
          message: `Not able to fetch deployment (id=${deployment.id}). Try again?`,
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
  protected async crudMenuForSingleDeployment(
    deployment: Deployments,
    deploymentsController: DeploymentsController,
    processesController: ProcessesController,
  ): Promise<void> {

    //#region @backendFunc
    while (true) {
      UtilsTerminal__NS__clearConsole();
      Helpers__NS__info(`Fetching deployment data...`);
      deployment = (
        await deploymentsController.getByDeploymentId(deployment.id).request()
      ).body.json;

      Helpers__NS__info(`Selected deployment:
  for domain: ${deployment.destinationDomain}, version: ${deployment.version}
  current status: ${deployment.status}, arrived at: ${deployment.arrivalDate}
    `);

      const choices = {
        back: {
          name: ' - back - ',
        },
        startDeployment: {
          name: 'Start Deployment',
        },
        info: {
          name: 'Deployment info',
        },
        realtimeMonitor: {
          name: 'Realtime Progress Monitor',
        },
        displayDeploymentLog: {
          name: 'Display Log File',
        },
        displayDeploymentLogPath: {
          name: 'Display Log File Path',
        },
        stopDeployment: {
          name: 'Stop Deployment',
        },
        removeDeployment: {
          name: 'Remove Deployment',
        },
      };

      if (DeploymentsStatesAllowedStart.includes(deployment.status)) {
        delete choices.stopDeployment;
        delete choices.realtimeMonitor;
      } else {
        delete choices.startDeployment;
      }

      const selected = await UtilsTerminal__NS__select<keyof typeof choices>({
        choices,
        question: '[Deployments] What do you want to do?',
      });

      switch (selected) {
        case 'back':
          return;
        case 'displayDeploymentLogPath':
          deployment = await this.refetchDeployment(
            deployment,
            deploymentsController,
          );
          if (!deployment) {
            return;
          }
          UtilsTerminal__NS__clearConsole();
          await (async () => {
            const processComposeUp = deployment.processIdComposeUp;
            try {
              const processFromDb = await processesController
                .getByProcessID(processComposeUp)
                .request()
                .then(r => r.body.json);
              console.log(
                `

                Log file path: ${processFromDb.fileLogAbsPath}

                `,
              );
              await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
                message: 'Press any key go back to previous menu',
              });
            } catch (error) {
              console.error(
                `Error fetching process log for process id: ${processComposeUp}`,
              );
              await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
            }
          })();

        case 'displayDeploymentLog':
          deployment = await this.refetchDeployment(
            deployment,
            deploymentsController,
          );
          if (!deployment) {
            return;
          }
          UtilsTerminal__NS__clearConsole();
          const processComposeUp = deployment.processIdComposeUp;
          try {
            const processFromDb = await processesController
              .getByProcessID(processComposeUp)
              .request()
              .then(r => r.body.json);

            await UtilsTerminal__NS__previewLongListGitLogLike(
              Helpers__NS__readFile(processFromDb.fileLogAbsPath) ||
                '< empty log file >',
            );
          } catch (error) {
            console.error(
              `Error fetching process log for process id: ${processComposeUp}`,
            );
            await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
          }
          break;
        case 'info':
          deployment = await this.refetchDeployment(
            deployment,
            deploymentsController,
          );
          if (!deployment) {
            return;
          }
          UtilsTerminal__NS__clearConsole();
          console.log(deployment.fullPreviewString({ boldValues: true }));
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
          break;
        case 'startDeployment':
          const displayRealtimePreview = await UtilsTerminal__NS__confirm({
            message: `Would you like to see realtime preview in terminal after starting?`,
            defaultValue: true,
          });

          await this.startDeployment(deployment, deploymentsController, {
            forceStart: false,
          });

          if (displayRealtimePreview) {
            deployment = await this.refetchDeployment(
              deployment,
              deploymentsController,
            );
            if (!deployment) {
              return;
            }
            await DeploymentsUtils__NS__displayRealtimeProgressMonitor(
              deployment,
              processesController,
            );
          } else {
            await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
          }

          break;
        case 'realtimeMonitor':
          await DeploymentsUtils__NS__displayRealtimeProgressMonitor(
            deployment,
            processesController,
          );
          break;
        case 'stopDeployment':
          await this.stopDeployment(deployment, deploymentsController);
          break;
        case 'removeDeployment':
          await this.removeDeployment(deployment, deploymentsController);
          return;
      }
    }
    //#endregion

  }
  //#endregion

  //#region terminal actions
  getWorkerTerminalActions(options?: {
    exitIsOnlyReturn?: boolean;
    chooseAction?: boolean;
  }): BaseWorkerTerminalActionReturnType {

    //#region @backendFunc
    const myActions: BaseWorkerTerminalActionReturnType = {
      getStuffFromBackend: {
        name: 'Get deployments from backend',
        action: async () => {
          Helpers__NS__info(`Fetching deployments data...`);
          const deploymentsController =
            await this.worker.getRemoteControllerFor({
              methodOptions: {
                calledFrom: 'Get stuff from backend action',
              },
            });

          const processesController =
            await Project.ins.taonProjectsWorker.processesWorker.getRemoteControllerFor(
              {
                methodOptions: {
                  calledFrom: 'Deployments.getStuffFromBackend',
                },
                controllerClass: ProcessesController,
              },
            );

          while (true) {
            const list =
              (await deploymentsController.getEntities().request())?.body
                .json || [];
            Helpers__NS__info(`Fetched ${list.length} entities`);

            const options = [
              { name: ' - back - ', value: 'back' },
              ...list.map(c => ({
                name: c.previewString,
                value: c.id?.toString(),
              })),
            ];

            const selected = await UtilsTerminal__NS__select<string>({
              choices: options,
              question: 'Select deployment',
            });

            if (selected !== 'back') {
              await this.crudMenuForSingleDeployment(
                list.find(l => l.id?.toString() === selected),
                deploymentsController,
                processesController,
              );
            }

            if (selected === 'back') {
              return;
            }
          }
        },
      },
      removeAllDeployments: {
        name: 'Remove all deployments',
        action: async () => {
          const confirm = await UtilsTerminal__NS__confirm({
            message: `Are you sure you want to remove ALL deployments?`,
            defaultValue: false,
          });
          if (!confirm) {
            return;
          }

          while (true) {
            try {
              Helpers__NS__info(`Removing all deployments...`);
              const deploymentController =
                await this.worker.getRemoteControllerFor({
                  methodOptions: {
                    calledFrom: 'Remove all deployments action',
                  },
                });

              await deploymentController
                .triggerAllDeploymentsRemove()
                .request();
              Helpers__NS__info(`Waiting until all deployments are removed...`);
              await deploymentController.waitUntilAllDeploymentsRemoved();
              Helpers__NS__info(`All deployments removed.`);
              break;
            } catch (error) {
              if (
                !(await UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred(error))
              ) {
                break;
              }
              continue;
            }
          }

          await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      // insertDeployment: {
      //   name: 'Insert new deployment',
      //   action: async () => {
      //     Helpers__NS__info(`Inserting new deployment`);
      //     const ctrl = await this.worker.getRemoteControllerFor({
      //       calledFrom: 'Insert new deployment action',
      //     });
      //     try {
      //       const response = await ctrl.insertEntity().request();
      //       console.info(`Entity saved successfully: ${response.body.text}`);
      //     } catch (error) {
      //       console.error('Error inserting entity:', error);
      //     }

      //     // console.log(response);
      //     await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
      //       message: 'Press any key to go back to main menu',
      //     });
      //   },
      // },
    };

    return {
      ...this.chooseAction,
      ...myActions,
      ...super.getWorkerTerminalActions({
        ...options,
        chooseAction: false,
      }),
    };
    //#endregion

  }
  //#endregion

}