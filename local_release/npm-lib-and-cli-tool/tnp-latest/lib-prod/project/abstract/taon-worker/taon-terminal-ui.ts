//#region imports
import { URL } from 'url'; // @backend

import { config, LibTypeEnum } from 'tnp-core/lib-prod';
import { chalk, fse, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, UtilsNetwork__NS__checkIfServerOnline, UtilsNetwork__NS__checkIfServerPings, UtilsNetwork__NS__checkPing, UtilsNetwork__NS__etcHostHasProperLocalhostIp4Entry, UtilsNetwork__NS__etcHostHasProperLocalhostIp6Entry, UtilsNetwork__NS__getCurrentPublicIpAddress, UtilsNetwork__NS__getEtcHostEntriesByDomain, UtilsNetwork__NS__getEtcHostEntryByComment, UtilsNetwork__NS__getEtcHostEntryByIp, UtilsNetwork__NS__getEtcHostsPath, UtilsNetwork__NS__getFirstIpV4LocalActiveIpAddress, UtilsNetwork__NS__getLocalIpAddresses, UtilsNetwork__NS__isValidDomain, UtilsNetwork__NS__isValidIp, UtilsNetwork__NS__LocalIpInfo, UtilsNetwork__NS__PingResult, UtilsNetwork__NS__removeEtcHost, UtilsNetwork__NS__setEtcHost, UtilsNetwork__NS__SIMULATE_DOMAIN_TAG, UtilsNetwork__NS__simulateDomain, UtilsNetwork__NS__urlParse, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor } from 'tnp-core/lib-prod';
import {
  BaseCliWorkerConfig,
  BaseCliWorkerTerminalUI,
  BaseWorkerTerminalActionReturnType,
} from 'tnp-helpers/lib-prod';
import { BaseCliWorkerUtils__NS__getAllServicesFromOS, BaseCliWorkerUtils__NS__getPathToProcessLocalInfoJson } from 'tnp-helpers/lib-prod';
import { BaseCliWorker } from 'tnp-helpers/lib-prod';

import { DEFAULT_FRAMEWORK_VERSION } from '../../../constants';

import type { TaonProjectsWorker } from './taon.worker';
//#endregion

export class TaonTerminalUI extends BaseCliWorkerTerminalUI<TaonProjectsWorker> {

  //#region methods / header text
  protected async headerText(): Promise<string> {
    return 'Taon.dev';
  }
  //#endregion

  //#region methods / header
  async header(): Promise<void> {

    //#region @backendFunc
    // return super.header();
    let consoleLogoPath: string;
    let currentVersion = Number(DEFAULT_FRAMEWORK_VERSION.replace('v', ''));
    while (true) {
      try {
        consoleLogoPath = this.worker.ins
          .by(LibTypeEnum.CONTAINER, `v${currentVersion}` as any)
          .pathFor('../__images/logo/logo-console.png');
        break;
      } catch (error) {
        currentVersion--;
        // console.log({
        //   error, currentVersion
        // })
        if (currentVersion < 18) {
          throw new Error(
            '[taon] Could not find console logo image for any version',
          );
        }
      }
    }

    // console.log({ logoLight });
    const pngStringify = require('console-png');
    // consolePng.attachTo(console);
    const image = fse.readFileSync(consoleLogoPath);
    return new Promise((resolve, reject) => {
      pngStringify(image, function (err, string) {
        if (err) {
          throw err;
        }
        console.log(string);
        resolve();
      });
    });
    //#endregion

  }
  //#endregion

  //#region methods / get domains menu
  protected async getDomainsMenu(): Promise<void> {

    //#region @backendFunc
    while (true) {
      UtilsTerminal__NS__clearConsole();
      try {
        const choices = {
          back: {
            name: 'Back to main menu',
          },
          listSimulatedDomains: {
            name: 'List simulated domains (from /etc/hosts file)',
          },
        };

        const options = await UtilsTerminal__NS__select<keyof typeof choices>({
          choices,
        });

        if (options === 'back') {
          return;
        }
        if (options === 'listSimulatedDomains') {
          UtilsTerminal__NS__clearConsole();
          Helpers__NS__info(
            `

            Listing of simulated domains (from ${UtilsNetwork__NS__getEtcHostsPath()} file):

            `,
          );
          const domains = UtilsNetwork__NS__getEtcHostEntryByComment(
            UtilsNetwork__NS__SIMULATE_DOMAIN_TAG,
          );
          if (domains.length === 0) {
            await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
              message: 'No simulated domains found. Press any key to continue.',
            });
            return;
          }
          const domainsSimulated: string[] = domains.reduce((acc, curr) => {
            return acc.concat(curr.domains);
          }, []);
          for (let index = 0; index < domainsSimulated.length; index++) {
            const domain = domainsSimulated[index];
            Helpers__NS__info(`${index + 1}. ${chalk.bold(domain)}`);
          }
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
        }
      } catch (error) {
        await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
          message: 'Error occurred. Press any key to continue.',
        });
      }
    }
    //#endregion

  }
  //#endregion

  //#region methods / get worker terminal actions
  getWorkerTerminalActions(): BaseWorkerTerminalActionReturnType {

    //#region @backendFunc

    const myActions = {

      //#region enableCloud
      enableCloud: {
        name: '',
        action: async () => {
          if (this.worker.traefikProvider.cloudIsEnabled) {
            if (
              await UtilsTerminal__NS__confirm({
                message: `Are you sure you want to disable cloud?`,
              })
            ) {
              Helpers__NS__logInfo(`Disabling cloud...`);
              await this.worker.disableCloud();
            }
          } else {
            Helpers__NS__info(`${chalk.bold('Enabling cloud...')}

            port 80 will redirect to port 443
            port 443 will be used for https connections

            Use deployments to deploy your projects.

              `);
            await this.worker.enableCloud();
          }
        },
      },
      //#endregion

      //#region projects
      projects: {
        name: 'Manage Taon Projects',
        action: async () => {
          Helpers__NS__info(`This feature is not yet implemented.`);
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      //#endregion

      //#region ports
      ports: {
        name: 'Manage Ports (TCP/UDP)',
        action: async () => {
          await this.worker.ins.portsWorker.terminalUI.infoScreen({
            exitIsOnlyReturn: true,
          });
        },
      },
      //#endregion

      //#region domains
      domains: {
        name: 'Manage Domains (and /etc/hosts file)',
        action: async () => {
          await this.getDomainsMenu();
        },
      },
      //#endregion

      //#region deployments
      deployments: {
        name: 'Manage Deployments',
        action: async () => {
          await this.worker.deploymentsWorker.terminalUI.infoScreen({
            exitIsOnlyReturn: true,
          });
        },
      },
      //#endregion

      //#region instances
      instances: {
        name: 'Manage Instances',
        action: async () => {
          await this.worker.instancesWorker.terminalUI.infoScreen({
            exitIsOnlyReturn: true,
          });
        },
      },
      //#endregion

      //#region processes
      processes: {
        name: 'Manage Processes',
        action: async () => {
          await this.worker.processesWorker.terminalUI.infoScreen({
            exitIsOnlyReturn: true,
          });
        },
      },
      //#endregion

      //#region environments
      environments: {
        name: 'Manage Environments',
        action: async () => {
          console.log('hello world');
          const ctrl = await this.worker.getRemoteControllerFor({
            methodOptions: {
              calledFrom: 'Manage Environments action',
            },
          });
          const list =
            (await ctrl.getEnvironments().request())?.body.json || [];
          await UtilsTerminal__NS__previewLongList(
            list.map(s => `${s.name} ${s.type}`),
          );
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
        },
      },
      //#endregion

       //#region scheduler
       scheduler: {
        name: 'Manage Scheduler',
        action: async () => {
          console.log('Scheduler in progress... ');
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      //#endregion

       //#region environments
       settings: {
        name: 'Settings',
        action: async () => {
          console.log('Setting in progress... ');
          await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
            message: 'Press any key to go back to main menu',
          });
        },
      },
      //#endregion

    };

    delete myActions.environments;
    if (this.worker.traefikProvider.cloudIsEnabled) {
      myActions.enableCloud.name = `Disable Cloud ${this.worker.traefikProvider.isDevMode ? '(dev mode)' : ''}`;
    } else {
      myActions.enableCloud.name =
        'Enable Cloud (add possibility of deploying projects)';
      delete myActions.deployments;
      delete myActions.projects;
    }

    return {
      ...this.chooseAction,
      ...myActions,
      ...super.getWorkerTerminalActions({ chooseAction: false }),
    };
    //#endregion

  }
  //#endregion

}