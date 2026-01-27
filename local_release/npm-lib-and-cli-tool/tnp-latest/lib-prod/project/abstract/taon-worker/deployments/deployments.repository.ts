//#region imports
import { ChildProcess } from 'child_process';

import { Subscription } from 'rxjs';
import { EndpointContext, MulterFileUploadResponse, TaonRepository, Taon__NS__createContext, Taon__NS__createContextTemplate, Taon__NS__error, Taon__NS__getResponseValue, Taon__NS__init, Taon__NS__inject, Taon__NS__isBrowser, Taon__NS__isElectron, Taon__NS__isNode, Taon__NS__isWebSQL, Taon__NS__removeLoader, Taon__NS__Response, Taon__NS__ResponseHtml, Taon__NS__StartParams } from 'taon/lib-prod';
import { baseTaonDevProjectsNames, config } from 'tnp-core/lib-prod';
import { child_process, crossPlatformPath, fse, path, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds, UtilsProcess__NS__getBashOrShellName, UtilsProcess__NS__getChildPidsOnce, UtilsProcess__NS__getCurrentProcessAndChildUsage, UtilsProcess__NS__getGitBashPath, UtilsProcess__NS__getPathOfExecutable, UtilsProcess__NS__getUsageForPid, UtilsProcess__NS__isNodeVersionOk, UtilsProcess__NS__killAllJava, UtilsProcess__NS__killAllOtherNodeProcesses, UtilsProcess__NS__killProcess, UtilsProcess__NS__killProcessOnPort, UtilsProcess__NS__ProcessStartOptions, UtilsProcess__NS__startAsync, UtilsProcess__NS__startAsyncChildProcessCommandUntil, UtilsProcess__NS__startInNewTerminalWindow } from 'tnp-core/lib-prod';
import { UtilsCliClassMethod__NS__decoratorMethod, UtilsCliClassMethod__NS__getFrom, UtilsCliClassMethod__NS__staticClassNameProperty } from 'tnp-core/lib-prod';

import { $Cloud } from '../../../cli/cli-CLOUD';
import { Project } from '../../project';
import { Processes } from '../processes/processes';
import { ProcessesController } from '../processes/processes.controller';
import {
  ProcessesState,
  ProcessesStatesAllowedStart,
} from '../processes/processes.models';
import { ProcessesRepository } from '../processes/processes.repository';

import { Deployments } from './deployments';
import { DEPLOYMENT_LOCAL_FOLDER_PATH } from './deployments.constants';
import { TaonBaseRepository } from 'taon/lib-prod';

import {
  DeploymentsAddingStatus as DeploymentsIsAddingStatus,
  DeploymentsAddingStatusObj,
  DeploymentsStatesAllowedStart,
  DeploymentsStatus,
  DeploymentsStatesAllowedStop,
  DeploymentReleaseData,
  AllDeploymentsRemoveStatus,
  AllDeploymentsRemoveStatusObj,
} from './deployments.models';
//#endregion

@TaonRepository({
  className: 'DeploymentsRepository',
})
export class DeploymentsRepository extends TaonBaseRepository<Deployments> {
  entityClassResolveFn: () => typeof Deployments = () => Deployments;

  //#region protected methods

  //#region protected methods / wait until deployment removed
  protected async waitUntilDeploymentRemoved(
    deploymentId: string,
  ): Promise<void> {
    //#region @backendFunc
    while (true) {
      const deployment = await this.findOne({
        where: {
          id: deploymentId?.toString(),
        },
      });
      if (!deployment) {
        return;
      }
      Helpers__NS__logInfo(`Entity still exists... waiting`);
      await Utils__NS__waitMilliseconds(800);
    }
    //#endregion
  }
  //#endregion

  //#region protected methods / get processes controller
  protected async getProcessesController(): Promise<ProcessesController> {
    // const ctxProcess = await this.getCtxProcesses();
    const processesController =
      await Project.ins.taonProjectsWorker.processesWorker.getRemoteControllerFor<ProcessesController>(
        {
          methodOptions: {
            calledFrom: 'DeploymentsRepository.getCtxProcesses',
          },
          controllerClass: ProcessesController,
        },
      );
    return processesController;
  }
  //#endregion

  //#region protected methods / zipfileAbsPath
  protected zipfileAbsPath(baseFileNameWithHashDatetime: string): string {
    const zipfileAbsPath = crossPlatformPath([
      DEPLOYMENT_LOCAL_FOLDER_PATH,
      baseFileNameWithHashDatetime,
    ]);
    return zipfileAbsPath;
  }
  //#endregion

  //#region protected methods / json query params file abs path
  protected jsonQueryParamsFileAbsPath(
    baseFileNameWithHashDatetime: string,
  ): string {
    return crossPlatformPath([
      `${this.zipfileAbsPath(baseFileNameWithHashDatetime)}.json`,
    ]);
  }
  //#endregion

  //#region public methods / save deployment
  public async saveDeployment(
    file?: MulterFileUploadResponse,
    queryParams?: DeploymentReleaseData,
  ): Promise<Deployments> {
    //#region @backendFunc
    const baseFileNameWithHashDatetime = path.basename(file.savedAs);
    const partialDeployment = {
      baseFileNameWithHashDatetime,
      size: file.size,
      projectName: queryParams.projectName,
      envName: queryParams.envName,
      envNumber: queryParams.envNumber,
      targetArtifact: queryParams.targetArtifact,
      releaseType: queryParams.releaseType,
      version: queryParams.version,
      destinationDomain: queryParams.destinationDomain,
    } as Partial<Deployments>;
    const deployment = await this.save(
      new Deployments().clone(partialDeployment),
    );
    Helpers__NS__writeJson(
      this.jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime),
      partialDeployment,
    );
    return deployment;
    //#endregion
  }
  //#endregion

  //#region protected methods / wait until process killed
  protected async waitUntilProcessKilled(
    processId: string | number,
    callback: () => void | Promise<void>,
  ): Promise<void> {
    //#region @backendFunc
    setTimeout(async () => {
      const processController = await this.getProcessesController();
      while (true) {
        try {
          const proc = await processController
            .getByProcessID(processId)
            .request();
          if (ProcessesStatesAllowedStart.includes(proc.body.json.state)) {
            await callback();
            return;
          }
        } catch (error) {
          console.warn(
            `Process with id ${processId} not found, assuming it is killed or not exists.`,
          );
          await callback();
          return;
        }
        await Utils__NS__wait(1);
      }
    });
    //#endregion
  }
  //#endregion

  //#region protected methods / repeat refresh deployment until final state
  /**
   * wait until deployment reach final state
   * starting => started
   * stopping => stopped
   * + handle failure states
   */
  protected repeatRefreshDeploymentStateUntil(
    deploymentId: string | number,
    options?: {
      refreshEveryMs?: number;
      operation: DeploymentsStatus;
      callback?: () => void | Promise<void>;
    },
  ): void {
    //#region @backendFunc
    options = options || ({} as any);
    options.refreshEveryMs = options.refreshEveryMs || 2000;

    setTimeout(async () => {
      while (true) {
        if (
          await this.refreshDeploymentStateForStartStop(deploymentId, options)
        ) {
          if (options.callback) {
            await options.callback();
          }
          return;
        }
        await Utils__NS__waitMilliseconds(options.refreshEveryMs || 2000);
      }
    }, 1000);
    //#endregion
  }
  //#endregion

  //#region protected methods / refresh deployment state for start stop
  /**
   * refresh deployment state for start and stop
   */
  async refreshDeploymentStateForStartStop(
    deploymentId: string | number,
    options?: {
      refreshEveryMs?: number;
      operation: DeploymentsStatus;
    },
  ): Promise<boolean> {
    //#region @backendFunc
    options = options || ({} as any);

    //#region fetch deployment
    let deployment: Deployments = null;
    try {
      deployment = await this.findOne({
        where: {
          id: deploymentId?.toString(),
        },
      });
    } catch (error) {}

    if (!deployment) {
      console.warn(
        `Deployment with id ${deploymentId} not found. Exiting refresh.`,
      );
      return true; // exit refresh
    }
    //#endregion

    //#region fetch processes
    const processesController = await this.getProcessesController();
    let processComposeUp: Processes = null;
    if (deployment.processIdComposeUp) {
      try {
        const processComposeUpReq = await processesController
          .getByProcessID(deployment.processIdComposeUp)
          .request();
        processComposeUp = processComposeUpReq.body.json;
      } catch (error) {}
    }

    let processComposeDown: Processes = null;
    if (deployment.processIdComposeDown) {
      try {
        const processComposeUpReq = await processesController
          .getByProcessID(deployment.processIdComposeDown)
          .request();
        processComposeDown = processComposeUpReq.body.json;
      } catch (error) {}
    }
    //#endregion

    //#region update deployment status based on processes
    if (processComposeUp && processComposeDown) {
      // both processes exists - should never happen
      throw `

        Both docker up/down exists for deployment ${deployment.id}

        `;
    } else {
      if (processComposeUp) {
        if (options.operation === DeploymentsStatus.STARTING) {
          if (processComposeUp.state === ProcessesState.ACTIVE) {
            deployment.status = DeploymentsStatus.STARTED_AND_ACTIVE;
            await this.save(deployment);
            return true; // achieved final state
          }
          if (processComposeUp.state === ProcessesState.ENDED_WITH_ERROR) {
            deployment.status = DeploymentsStatus.FAILED_START;
            await this.save(deployment);
            return true; // achieved final state
          }
        }
      }

      if (processComposeDown) {
        if (options.operation === DeploymentsStatus.STOPPING) {
          if (processComposeDown.state === ProcessesState.ENDED_OK) {
            deployment.status = DeploymentsStatus.STOPPED;
            await this.save(deployment);
            return true; // achieved final state
          }
          if (processComposeDown.state === ProcessesState.ENDED_WITH_ERROR) {
            deployment.status = DeploymentsStatus.STOPPED;
            await this.save(deployment);
            return true; // achieved final state
          }
        }
      }
    }

    //#endregion

    return false; // not achieved final state
    //#endregion
  }
  //#endregion

  //#endregion

  //#region remove all deployments

  public allDeploymentRemoveStatus: AllDeploymentsRemoveStatus =
    AllDeploymentsRemoveStatus.NOT_STARTED;

  removingAllDeploymentsStatus(): AllDeploymentsRemoveStatusObj {
    return {
      status: this.allDeploymentRemoveStatus,
    };
  }

  protected async clearAllDeployments(): Promise<void> {
    //#region @backendFunc
    const allDeployments = await this.find();
    for (const deployment of allDeployments) {
      try {
        await this.triggerDeploymentStop(
          deployment.baseFileNameWithHashDatetime,
          {
            removeAfterStop: true,
            skipStatusCheck: true,
          },
        );
      } catch (error) {
        const errMsg = (error instanceof Error && error.message) || error;
        console.error(errMsg);
      }

      await this.waitUntilDeploymentRemoved(deployment.id);
    }

    await this.clear(); // remove all records from db
    // remove all files from deployments folder
    Helpers__NS__removeFolderIfExists(DEPLOYMENT_LOCAL_FOLDER_PATH);
    Helpers__NS__mkdirp(DEPLOYMENT_LOCAL_FOLDER_PATH);
    this.allDeploymentRemoveStatus = AllDeploymentsRemoveStatus.DONE;
    //#endregion
  }

  async triggerAllDeploymentsRemove(): Promise<void> {
    //#region @backendFunc
    if (config.frameworkName === 'taon') {
      Taon__NS__error({
        message: `This operation is not allowed in production environment`,
      });
    }
    this.allDeploymentRemoveStatus = AllDeploymentsRemoveStatus.REMOVING;
    setTimeout(async () => {
      await this.clearAllDeployments();
    }, 1000);
    //#endregion
  }
  //#endregion

  //#region trigger deployment stop
  async triggerDeploymentStop(
    baseFileNameWithHashDatetime: string,
    options?: {
      removeAfterStop?: boolean;
      skipStatusCheck?: boolean;
    },
  ): Promise<Deployments> {
    //#region @backendFunc
    options = options || {};
    options.removeAfterStop = options.removeAfterStop || false;
    options.skipStatusCheck == !!options.skipStatusCheck;

    //#region find deployment
    let deployment = await this.findOne({
      where: {
        baseFileNameWithHashDatetime,
      },
    });
    //#endregion

    //#region handle errors
    if (!deployment) {
      throw new Error(
        `Deployment with base file name ${baseFileNameWithHashDatetime} not found`,
      );
    }

    let onlyRemove =
      options.removeAfterStop &&
      deployment.status === DeploymentsStatus.NOT_STARTED;

    if (deployment.status === DeploymentsStatus.NOT_STARTED) {
      // nothing here do to
    } else {
      if (
        !options.skipStatusCheck &&
        !DeploymentsStatesAllowedStop.includes(deployment.status)
      ) {
        throw new Error(
          `Deployment can't be stopped when process in status "${deployment.status}"`,
        );
      }
    }

    if (!Helpers__NS__exists(this.zipfileAbsPath(baseFileNameWithHashDatetime))) {
      throw new Error(
        `File for deployment not found: ${this.zipfileAbsPath(baseFileNameWithHashDatetime)}`,
      );
    }
    //#endregion

    deployment.status = DeploymentsStatus.STOPPING;
    await this.save(deployment);

    //#region trigger docker compose down process
    const triggerStop = async (): Promise<void> => {
      const zipfileAbsPath = this.zipfileAbsPath(baseFileNameWithHashDatetime);

      const commandComposeDown = `${config.frameworkName} ${UtilsCliClassMethod__NS__getFrom(
        options.removeAfterStop
          ? $Cloud.prototype.removeFileDeploy
          : $Cloud.prototype.stopFileDeploy,
      )} ${zipfileAbsPath}`;

      const processComposeDownRequest = await processesController
        .save(
          new Processes().clone({
            command: commandComposeDown,
            cwd: DEPLOYMENT_LOCAL_FOLDER_PATH,
          }),
        )
        .request();

      const processComposeDown = processComposeDownRequest.body.json;

      deployment.processIdComposeDown = processComposeDown.id;

      await this.save(deployment);

      await processesController
        .triggerStart(
          processComposeDown.id,
          `docker-compose-down__deployment-${deployment.id}`,
        )
        .request();

      this.repeatRefreshDeploymentStateUntil(deployment.id, {
        operation: DeploymentsStatus.STOPPING,
        callback: async () => {
          if (options.removeAfterStop) {
            await this.remove(deployment);
          }
        },
      });
    };
    //#endregion

    //#region handle existing up process
    const processesController = await this.getProcessesController();

    if (onlyRemove) {
      triggerStop();
    } else {
      if (deployment.processIdComposeUp) {
        await processesController
          .triggerStop(deployment.processIdComposeUp)
          .request();

        await this.waitUntilProcessKilled(
          deployment.processIdComposeUp,
          async () => {
            deployment.processIdComposeUp = null;
            await this.save(deployment);
            triggerStop();
          },
        );
      } else {
        triggerStop();
      }
    }

    //#endregion

    return deployment;
    //#endregion
  }
  //#endregion

  //#region trigger deployment start
  async triggerDeploymentStart(
    baseFileNameWithHashDatetime: string,
    options?: {
      // forceStart?: boolean;
    },
  ): Promise<Deployments> {
    //#region @backendFunc

    //#region find deployment
    options = options || {};
    let deployment = await this.findOne({
      where: {
        baseFileNameWithHashDatetime,
      },
    });
    //#endregion

    //#region handle errors
    if (!deployment) {
      throw new Error(
        `Deployment with base file name "${baseFileNameWithHashDatetime}" not found`,
      );
    }

    if (!DeploymentsStatesAllowedStart.includes(deployment.status)) {
      throw new Error(
        `Deployment can't be started when process in status "${deployment.status}"`,
      );
    }

    if (!Helpers__NS__exists(this.zipfileAbsPath(baseFileNameWithHashDatetime))) {
      throw new Error(
        `File for deployment not found: ${this.zipfileAbsPath(baseFileNameWithHashDatetime)}`,
      );
    }
    //#endregion

    deployment.status = DeploymentsStatus.STARTING;
    await this.save(deployment);

    //#region trigger docker compose up process
    const triggerStart = async (): Promise<void> => {
      const zipfileAbsPath = this.zipfileAbsPath(baseFileNameWithHashDatetime);

      const commandComposeUp = `${config.frameworkName} ${UtilsCliClassMethod__NS__getFrom(
        $Cloud.prototype.startFileDeploy,
      )} ${zipfileAbsPath}`;

      const cwd = DEPLOYMENT_LOCAL_FOLDER_PATH;

      const procFromReq = await processesController
        .save(
          new Processes().clone({
            command: commandComposeUp,
            cwd,
            conditionProcessActiveStderr: [
              CoreModels__NS__SPECIAL_APP_READY_MESSAGE,
            ],
            conditionProcessActiveStdout: [
              CoreModels__NS__SPECIAL_APP_READY_MESSAGE,
            ],
          }),
        )
        .request();

      const procFromDb = procFromReq.body.json;

      deployment.processIdComposeUp = procFromDb.id;

      await this.save(deployment);

      await processesController
        .triggerStart(
          procFromDb.id,
          `docker-compose-up__deployment-${deployment.id}`,
        )
        .request();

      this.repeatRefreshDeploymentStateUntil(deployment.id, {
        operation: DeploymentsStatus.STARTING,
      });
    };
    //#endregion

    //#region handle existing down process
    const processesController = await this.getProcessesController();
    if (deployment.processIdComposeDown) {
      await processesController
        .triggerStop(deployment.processIdComposeUp)
        .request();
      await this.waitUntilProcessKilled(
        deployment.processIdComposeDown,
        async () => {
          deployment.processIdComposeDown = null;
          await this.save(deployment);
          triggerStart();
        },
      );
    } else {
      triggerStart();
    }
    //#endregion

    return deployment;
    //#endregion
  }
  //#endregion

  //#region add existed

  //#region add existed deployments process
  async clearAndAddExistedDeploymentsProcess(): Promise<void> {
    //#region @backendFunc

    // clear all deployments first
    console.log('Clearing existing deployments from database...');
    await this.clear();
    console.log('Existing deployments cleared.');

    const allZips = Helpers__NS__getFilesFrom(DEPLOYMENT_LOCAL_FOLDER_PATH).filter(
      f => f.endsWith('.zip'),
    );

    console.log(`Found ${allZips.length} zip files in deployments folder.`);

    for (const zipAbsPath of allZips) {
      const baseFileNameWithHashDatetime = path.basename(zipAbsPath);
      const existing = await this.findOne({
        where: {
          baseFileNameWithHashDatetime,
        },
      });
      if (!existing) {
        const queryParamsJsonAbsPath = this.jsonQueryParamsFileAbsPath(
          baseFileNameWithHashDatetime,
        );
        if (!fse.existsSync(queryParamsJsonAbsPath)) {
          continue;
        }
        const dataJson = Helpers__NS__readJson(
          this.jsonQueryParamsFileAbsPath(baseFileNameWithHashDatetime),
        ) as Partial<Deployments>;

        const deployment = new Deployments().clone(dataJson);

        await this.save(deployment);
      }
    }

    this.deploymentsIsAddingStatus = DeploymentsIsAddingStatus.DONE;
    //#endregion
  }
  //#endregion

  //#region trigger add existed deployments
  private deploymentsIsAddingStatus: DeploymentsIsAddingStatus =
    DeploymentsIsAddingStatus.NOT_STARTED;

  triggerAddExistedDeployments(): void {
    //#region @backendFunc
    this.deploymentsIsAddingStatus = DeploymentsIsAddingStatus.IN_PROGRESS;
    setTimeout(async () => {
      try {
        await this.clearAndAddExistedDeploymentsProcess();
      } catch (error) {
        config.frameworkName === 'tnp' && console.log(error);
        this.deploymentsIsAddingStatus = DeploymentsIsAddingStatus.FAILED;
        return;
      }
    }, 1000);
    //#endregion
  }

  isAddingDeploymentStatus(): DeploymentsAddingStatusObj {
    return {
      status: this.deploymentsIsAddingStatus,
    };
  }

  //#endregion

  //#endregion
}