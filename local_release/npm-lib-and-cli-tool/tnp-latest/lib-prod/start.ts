//#region imports
import 'reflect-metadata';
import axios from 'axios';
import type * as ora from 'ora';
import { config, crossPlatformPath, taonPackageName, child_process, tnpPackageName, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { chalk, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, UtilsNetwork__NS__checkIfServerOnline, UtilsNetwork__NS__checkIfServerPings, UtilsNetwork__NS__checkPing, UtilsNetwork__NS__etcHostHasProperLocalhostIp4Entry, UtilsNetwork__NS__etcHostHasProperLocalhostIp6Entry, UtilsNetwork__NS__getCurrentPublicIpAddress, UtilsNetwork__NS__getEtcHostEntriesByDomain, UtilsNetwork__NS__getEtcHostEntryByComment, UtilsNetwork__NS__getEtcHostEntryByIp, UtilsNetwork__NS__getEtcHostsPath, UtilsNetwork__NS__getFirstIpV4LocalActiveIpAddress, UtilsNetwork__NS__getLocalIpAddresses, UtilsNetwork__NS__isValidDomain, UtilsNetwork__NS__isValidIp, UtilsNetwork__NS__LocalIpInfo, UtilsNetwork__NS__PingResult, UtilsNetwork__NS__removeEtcHost, UtilsNetwork__NS__setEtcHost, UtilsNetwork__NS__SIMULATE_DOMAIN_TAG, UtilsNetwork__NS__simulateDomain, UtilsNetwork__NS__urlParse, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith } from 'tnp-core/lib-prod';
import { UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor } from 'tnp-core/lib-prod';
import { BaseCLiWorkerStartMode, BaseStartConfig } from 'tnp-helpers/lib-prod';

// import { globalSpinner } from './constants';
import {
  debugBrkSuffix,
  debugSuffix,
  failSpinner,
  globalSpinner,
  SKIP_CORE_CHECK_PARAM,
  spinnerPrefix,
  startSpinner,
  stopSpinner,
  succeedSpinner,
  verbosePrefix,
  websqlPrefix,
} from './constants';
import cliClassArr from './project/cli/index';

//#endregion

global.frameworkName = global.frameworkName ?? tnpPackageName;

//#region startWrapper
export function start(argv, filename): void {
  //#region @backendFunc
  const oraSpinner = require('ora');

  //#region quick fixes

  global.globalSystemToolMode = true;

  global.spinner = oraSpinner();
  //#endregion

  //#region resolve constants
  const childprocsecretarg = '-childproc';
  // const isWinGitBash = process.platform === 'win32';
  const debugMode =
    argv[1]?.endsWith(debugSuffix.replace('--', '-')) ||
    argv[1]?.endsWith(debugBrkSuffix.replace('--', '-'));

  const procType =
    argv[1]?.endsWith(tnpPackageName) ||
    argv[1]?.endsWith(taonPackageName) ||
    debugMode
      ? 'root'
      : argv.find(a => a.startsWith(childprocsecretarg))
        ? 'child-of-root'
        : 'child-of-child';

  // console.log({ procType, argv });

  global.spinnerInParentProcess = procType === 'child-of-root';

  const orgArgv = [...argv];

  global.tnpNonInteractive = argv.some(a =>
    a.startsWith('--tnpNonInteractive'),
  );

  const spinnerIsDefault = !global.tnpNonInteractive;

  const verboseInArgs = argv.includes(verbosePrefix);
  global.hideLog = !verboseInArgs;

  global.skipCoreCheck = argv.some(a => a.startsWith(SKIP_CORE_CHECK_PARAM));

  const verboseLevelArg = argv.find(a => a.startsWith(`${verbosePrefix}=`));
  global.verboseLevel = verboseLevelArg
    ? Number(verboseLevelArg.replace(`${verbosePrefix}=`, '')) || 0
    : 0;

  if (!verboseInArgs && verboseLevelArg) {
    global.hideLog = false;
  }
  // console.log({ verbose, verboseLevelArg });

  const spinnerOnInArgs = argv.includes(spinnerPrefix);
  const spinnerOffInArgs =
    argv.includes(`${spinnerPrefix}=false`) ||
    argv.includes(`${spinnerPrefix}=off`);
  //#endregion

  //#region clean argv
  argv = argv
    .filter(a => !a.startsWith(spinnerPrefix))
    .filter(a => a !== childprocsecretarg)
    .filter(a => a !== SKIP_CORE_CHECK_PARAM)
    .filter(a => !a.startsWith(verbosePrefix))
    .map(a => (a === websqlPrefix ? `-${websqlPrefix}` : a));

  argv = argv.filter(f => !!f);

  process.argv = argv;
  //#endregion

  //#region spinner decision
  let startSpinner = spinnerIsDefault || spinnerOnInArgs;

  if (
    spinnerOffInArgs ||
    procType === 'child-of-root' ||
    debugMode ||
    verboseInArgs ||
    global.frameworkName === tnpPackageName ||
    global.skipCoreCheck
  ) {
    startSpinner = false;
  }
  //#endregion

  //#region child process wrapper
  if (procType === 'root') {
    global.spinner = {
      start() {
        process.send?.(startSpinner);
      },
      stop() {
        process.send?.(startSpinner);
      },
      fail(errMSg) {
        process.send?.(`${failSpinner}::${errMSg}`);
      },
      succeed(doneMsg) {
        process.send?.(`${succeedSpinner}::${doneMsg}`);
      },
    } as typeof globalSpinner.instance;
  }

  // console.log({ startSpinner, filename });

  if (startSpinner) {
    globalSpinner.instance.start();

    const env = {
      ...process.env,
      FORCE_COLOR: '1',
    };

    const cwd = process.cwd();
    const argsToChild = [
      ...orgArgv.slice(2),
      verboseInArgs ? verbosePrefix : '',
      global.skipCoreCheck ? SKIP_CORE_CHECK_PARAM : '',
      spinnerOnInArgs ? spinnerPrefix : '',
      childprocsecretarg,
    ].filter(Boolean);

    // console.log(argsToChild);

    const proc = child_process.fork(filename, argsToChild, {
      env,
      cwd,
      stdio: [0, 1, 2, 'ipc'],
    });

    proc.on('exit', code => {
      globalSpinner.instance.stop();
      // console.log('PROCESS EXIT');
      setTimeout(() => process.exit(code));
    });

    proc.on('message', msg =>
      handleSpinnerMessage(msg?.toString() || '', globalSpinner.instance),
    );
  } else {
    run(argv, global.frameworkName);
  }
  //#endregion

  //#endregion
}
//#endregion

//#region helpers

const handleSpinnerMessage = (
  message: string | undefined,
  spinner: typeof globalSpinner.instance,
) => {
  //#region @backendFunc
  message = (message || '').trimLeft();

  if (message === startSpinner) {
    spinner.start();
  } else if (message === stopSpinner) {
    console.log('SHOULD STOP SPINNER');
    spinner.stop();
  } else if (message?.startsWith(`${failSpinner}::`)) {
    spinner.fail(___NS__first(message.split('::')));
  } else if (message?.startsWith(`${succeedSpinner}::`)) {
    spinner.succeed(___NS__first(message.split('::')));
  } else {
    setText(message, message?.startsWith('log::'));
  }
  //#endregion
};

const setText = (text, toSpinner = false) => {
  //#region @backendFunc
  const spinner = globalSpinner.instance;
  if (text) text = text.split('::').slice(1).join('::');

  if (spinner) {
    if (toSpinner) {
      spinner.text = text.replace(/\s+/g, ' ');
    } else {
      console.log(text);
    }
  } else {
    console.log(text);
  }
  //#endregion
};
//#endregion

//#region run
export async function run(
  argsv: string[],
  frameworkName: 'tnp' | 'taon',
): Promise<void> {
  config.frameworkName = frameworkName;

  if (frameworkName === tnpPackageName) {
    process.on('unhandledRejection', (err, promise) => {
      const reason = err as Error;
      console.error('Unhandled Promise Rejection at:', promise);
      console.error('Reason:', reason);

      // Optional: get full stack trace even for objects
      if (reason && typeof reason === 'object') {
        console.error('Error name:', reason.name);
        console.error('Error message:', reason.message);
        console.error('Error stack:\n', reason.stack || 'No stack');
      } else {
        console.error(`Error occurred`);
        console.trace('Error:', reason);
      }
      process.exit(1);
      // Prevent crash during development
      // In production, you might want to log and exit gracefully
      // process.exit(1);
    });
  }

  if (taonPackageName === config.frameworkName) {
    /**
     * ISSUE largest http request sometime are failing ... but with second try everything is OK
     */
    axios.defaults.timeout = 3000;
  }

  //#region prevent incorrect /etc/hosts file
  const isGraphicsCapableOs =
    UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment();
  Helpers__NS__logInfo(`Checking your /etc/hosts file...`);
  try {
    if (!UtilsNetwork__NS__etcHostHasProperLocalhostIp4Entry()) {
      globalSpinner.instance.stop();
      Helpers__NS__error(
        `Your ${UtilsNetwork__NS__getEtcHostsPath()} file does not have proper entry for "localhost" hostname.

      Please add:
      ${chalk.bold('127.0.0.1 localhost')}
      `,
        isGraphicsCapableOs,
        true,
      );
      await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
    }
  } catch (error) {
    console.error(`Not able to check your /etc/hosts file`);
  }

  // TODO not needed for now
  // if (!UtilsNetwork__NS__etcHostHasProperLocalhostIp6Entry()) {
  //   Helpers__NS__error(
  //     `Your /etc/hosts file does not have proper entry for "localhost" hostname.

  //     Please add:
  //     ${chalk.bold('::1 localhost')}
  //     `,
  //     isGraphicsCapableOs,
  //     true,
  //   );
  //   await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
  // }
  Helpers__NS__logInfo(`Done checking your /etc/hosts file...`);
  //#endregion

  // Helpers__NS__log(`ins start, mode: "${mode}"`);
  const ProjectClass = (await import('./project/abstract/project')).Project;
  ProjectClass.ins.initialCheck();

  // console.log(argsv);
  if (
    !global.skipCoreCheck &&
    ___NS__isUndefined(
      argsv.find(
        a =>
          a.startsWith('startCliService') ||
          a.startsWith('kill') ||
          a.startsWith('clear') ||
          a.startsWith('reinstall') ||
          a.startsWith('push') ||
          a.startsWith('pul') ||
          a.startsWith('mp3') ||
          a.startsWith('mp4') ||
          a.startsWith('dedupe') ||
          a.startsWith('cloud:') ||
          a.startsWith('link:') ||
          a.startsWith('copy:and:rename') ||
          a.startsWith('generate') ||
          a.startsWith('shorten') ||
          a === 'dumpPackagesVersions' ||
          a === 'melt' ||
          a === 'soft' ||
          a === 'local:sync' ||
          a === 'localSync' ||
          a === 'localsync' ||
          a === 'cloud' ||
          a === 'link' ||
          a === 'up' ||
          a === 'apiup' ||
          a === 'apiupforce',
      ),
    ) // for workers
  ) {
    // console.log('starting projects workers...');

    await ProjectClass.ins.taonProjectsWorker.cliStartProcedure({
      methodOptions: {
        cliParams: {
          mode: BaseCLiWorkerStartMode.DETACHED_WINDOW,
        },
        calledFrom: 'start framework function',
      },
    });
  }

  globalSpinner.instance.stop();

  new BaseStartConfig({
    ProjectClass: ProjectClass as any,
    functionsOrClasses: BaseStartConfig.prepareArgs(cliClassArr),
    argsv,
    callbackNotRecognizedCommand: async options => {
      Helpers__NS__warn('Command has not been recognized. ');
      if (
        await UtilsTerminal__NS__confirm({
          message:
            `Do you want to start ${chalk.bold(config.frameworkName)}` +
            ` ${chalk.bold('cli menu')} to see what you can do in this project ?`,
          defaultValue: true,
        })
      ) {
        await ProjectClass.ins.taonProjectsWorker.terminalUI.infoScreen();
      } else {
        process.exit(0);
      }
    },
    shortArgsReplaceConfig: {
      //#region short args replacement
      // TODO use UtilsCliClassMethod !!!
      il: 'release:install:locally',
      ilvscodeplugin: 'release:install:locally:vscode:plugin',
      ilclitool: 'release:install:locally:cli:tool',
      cil: 'release:clear:install:locally',
      'install:locally': 'release:install:locally',
      cinit: 'init:clearInit',
      an: 'app:normal',
      aw: 'app:websql',
      ba: 'build:app',
      b: 'build',
      bl: 'build:lib',
      bvscode: 'build:vscode',
      d: 'docs',
      dw: 'docs:watch',
      cb: 'build:clean:build',
      cbuild: 'build:clean:build',
      baw: 'build:watchApp',
      bw: 'build:watch',
      bwl: 'build:watchLib',
      bwa: 'build:watchApp',
      bwaw: 'build:watchAppWebsql',
      bwvscode: 'build:watchVscode',
      bwe: 'build:watchElectron',
      bew: 'build:watchElectron',
      bwew: 'build:watchElectronWebsql',
      beww: 'build:watchElectronWebsql',
      cbwl: 'build:clean:watch:lib',
      cbl: 'build:clean:lib',
      cbuildwwatch: 'build:clean:watch',
      c: 'clear',
      s: 'build:start',
      start: 'build:start',
      startElectron: 'build:start:electron',
      se: 'build:start:electron',
      sd: 'simulateDomain',
      simd: 'simulateDomain',
      cse: 'build:clear:start:electron',
      cstart: 'build:start:clean',
      cs: 'build:start:clean',
      mkdocs: 'build:mkdocs',
      ew: 'electron:watch',
      r: 'release',
      rl: 'release:local',
      rlnpm: 'release:localCliLib',
      rlelectron: 'release:localElectron',
      rlvscode: 'release:localVscode',
      rc: 'release:cloud',
      rm: 'release:manual',
      rmajor: 'release:major',
      rminor: 'release:minor',
      setFrameworkVersion: 'version:setFrameworkVersion',
      'r:major': 'release:major',
      'r:minor': 'release:minor',
      'set:minor:version': 'release:set:minor:version',
      'set:major:version': 'release:set:major:version',
      'set:minor:ver': 'release:set:minor:version',
      'set:major:ver': 'release:set:major:version',
      'set:framework:ver': 'version:set:framework:version',
      'set:framework:version': 'version:set:framework:version',
      // 'ra': 'release:all',
      e: 'electron',
      ekill: 'electron:kill',
      car: 'release:auto:clear',
      autorelease: 'release:auto',
      ar: 'release:auto',
      ard: 'release:auto:docs',
      re: 'reinstall',
      '--version': 'version',
      '-v': 'version',
      // open
      occ: 'open:core:container',
      ocp: 'open:core:project',
      o: 'open',
      or: 'open:release',
      // test
      twd: 'test:watch:debug',
      tdw: 'test:watch:debug',
      tw: 'test:watch',
      td: 'test:debug',
      t: 'test',
      // migrations
      m: 'migration',
      mc: 'migration:create',
      mr: 'migration:run',
      mrun: 'migration:run',
      mrw: 'migration:revert',
      mrev: 'migration:revert',
      mrevert: 'migration:revert',
      mctxs: 'migration:contexts',
      // vscode
      vsce: 'vscode:vsce',
      vts: 'vscode:temp:show',
      vth: 'vscode:temp:hide',
      hide: 'vscode:temp:hide',
      show: 'vscode:temp:show',
      simulate: 'simulateDomain',
      taonjson: 'recreateTaonJsonSchema',
      p: 'push',
      pl: 'pull',
      //#endregion
    },
  });
}
//#endregion
export default start;