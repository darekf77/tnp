//#region imports
import { config, LibTypeEnum } from 'tnp-core/lib-prod';
import { chalk, crossPlatformPath, path, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith, CoreModels__NS__BaseProjectType, CoreModels__NS__BaseProjectTypeArr, CoreModels__NS__CfontAlign, CoreModels__NS__CfontStyle, CoreModels__NS__ClassNameStaticProperty, CoreModels__NS__ContentType, CoreModels__NS__ContentTypeKeys, CoreModels__NS__CoreLibCategory, CoreModels__NS__CutableFileExt, CoreModels__NS__DatabaseType, CoreModels__NS__EnvironmentName, CoreModels__NS__EnvironmentNameTaon, CoreModels__NS__ExecuteOptions, CoreModels__NS__FileEvent, CoreModels__NS__FileExtension, CoreModels__NS__FrameworkVersion, CoreModels__NS__GlobalDependencies, CoreModels__NS__HttpMethod, CoreModels__NS__ImageFileExtension, CoreModels__NS__ImageFileExtensionArr, CoreModels__NS__InstalationType, CoreModels__NS__InstalationTypeArr, CoreModels__NS__LibType, CoreModels__NS__localhostDomain, CoreModels__NS__localhostIp127, CoreModels__NS__ManifestIcon, CoreModels__NS__MediaType, CoreModels__NS__MediaTypeAllArr, CoreModels__NS__MimeType, CoreModels__NS__mimeTypes, CoreModels__NS__MimeTypesObj, CoreModels__NS__NewFactoryType, CoreModels__NS__NpmInstallOptions, CoreModels__NS__NpmSpecialVersions, CoreModels__NS__OrignalClassKey, CoreModels__NS__OutFolder, CoreModels__NS__Package, CoreModels__NS__ParamType, CoreModels__NS__parentLocation, CoreModels__NS__pathToChildren, CoreModels__NS__Position, CoreModels__NS__PreReleaseVersionTag, CoreModels__NS__PROGRESS_DATA_TYPE, CoreModels__NS__PUSHTYPE, CoreModels__NS__PwaManifest, CoreModels__NS__ReleaseVersionType, CoreModels__NS__ReleaseVersionTypeEnum, CoreModels__NS__RunOptions, CoreModels__NS__Size, CoreModels__NS__SPECIAL_APP_READY_MESSAGE, CoreModels__NS__SPECIAL_WORKER_READY_MESSAGE, CoreModels__NS__tagForTaskName, CoreModels__NS__TaonHttpErrorCustomProp, CoreModels__NS__TsUsage, CoreModels__NS__UIFramework, CoreModels__NS__UploadedBackendFile, CoreModels__NS__VSCodeSettings, UtilsTerminal__NS__clearConsole, UtilsTerminal__NS__confirm, UtilsTerminal__NS__drawBigText, UtilsTerminal__NS__getTerminalHeight, UtilsTerminal__NS__input, UtilsTerminal__NS__isVerboseModeTaon, UtilsTerminal__NS__multiselect, UtilsTerminal__NS__multiselectActionAndExecute, UtilsTerminal__NS__pipeEnterToStdin, UtilsTerminal__NS__pressAnyKey, UtilsTerminal__NS__pressAnyKeyToContinueAsync, UtilsTerminal__NS__pressAnyKeyToTryAgainErrorOccurred, UtilsTerminal__NS__pressKeyAndContinueSync, UtilsTerminal__NS__previewLongList, UtilsTerminal__NS__previewLongListGitLogLike, UtilsTerminal__NS__select, UtilsTerminal__NS__selectActionAndExecute, UtilsTerminal__NS__SelectChoice, UtilsTerminal__NS__SelectChoiceValue, UtilsTerminal__NS__wait, UtilsTerminal__NS__waitForUserAnyKey, UtilsTerminal__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC } from 'tnp-helpers/lib-prod';
import { BaseReleaseProcess } from 'tnp-helpers/lib-prod';
import { PackageJson } from 'type-fest';

import { ALLOWED_TO_RELEASE } from '../../../app-utils';
import { environmentsFolder, releaseSuffix } from '../../../constants';
import {
  ReleaseArtifactTaon,
  ReleaseArtifactTaonNamesArr,
  EnvOptions,
  ReleaseType,
} from '../../../options';
import type { Project } from '../project';

// import { ReleaseConfig } from './release-config';
//#endregion

/**
 * manage standalone or container release process
 */ // @ts-ignore TODO weird inheritance problem
export class ReleaseProcess extends BaseReleaseProcess<Project> {
  // config = new ReleaseConfig(this.project);

  //#region constructor
  constructor(project: Project) {
    super(project);
  }
  //#endregion

  //#region display release process menu
  public async displayReleaseProcessMenu(
    envOptions: EnvOptions,
  ): Promise<void> {

    //#region @backendFunc
    while (true) {
      UtilsTerminal__NS__clearConsole();

      //#region return if not projects
      if (
        this.project.framework.isContainer &&
        this.project.children.length === 0
      ) {
        console.info(
          `No projects to release inside ${chalk.bold(this.project.genericName)} container`,
        );
        await UtilsTerminal__NS__pressAnyKeyToContinueAsync({
          message: 'Press any key to exit...',
        });
        return;
      }
      //#endregion

      const manual = 'manual' as ReleaseType;
      const cloud = 'cloud' as ReleaseType;
      const local = 'local' as ReleaseType;
      const staticPages = 'static-pages' as ReleaseType;
      const priovider =
        ___NS__upperFirst(___NS__first(this.project.git.remoteProvider?.split('.'))) ||
        'unknow';

      // const { actionResult } =
      await UtilsTerminal__NS__selectActionAndExecute(
        {
          readInfo: {
            name: 'READ INFO ABOUT RELEASE TYPES',
            action: async () => {
              UtilsTerminal__NS__clearConsole();

              //#region info
              console.info(
                `
${chalk.bold.green('Manual release')} => for everything whats Taon supports
        - everything is done here manually, you have to provide options
        - config saved during release process can be use for 'Cloud release' later
${chalk.bold.blue('Cloud release')} => trigger remote release action on server (local or remote)
        - trigger release base on config stored inside cloud
        - use local Taon Cloud or login to remote Taon Cloud
${chalk.bold.gray('Local release')} => use current git repo for storing release data
        - for anything that you want to backup inside your git repository
${chalk.bold.yellow('Static Pages release')} => use specific branch for storing release data
        - perfect for github pages, gitlab pages and similar solutions
        `.trimStart(),
              );
              //#endregion

              await UtilsTerminal__NS__pressAnyKeyToContinueAsync({});
            },
          },
          [manual]: {

            //#region manual
            name: `${this.getColoredTextItem(manual)} Taon release + create config for Cloud`,
            action: async () => {
              if (await this.releaseByType(manual, envOptions)) {
                process.exit(0);
              }
            },
            //#endregion
          },
          [cloud]: {

            //#region cloud
            name: `${this.getColoredTextItem(cloud)} release tirgger for Taon Cloud`,
            action: async () => {
              if (await this.releaseByType(cloud, envOptions)) {
                process.exit(0);
              }
            },
            //#endregion
          },
          [local]: {

            //#region local
            name: `${this.getColoredTextItem(local)} release to current git repository`,
            action: async () => {
              if (await this.releaseByType(local, envOptions)) {
                process.exit(0);
              }
            },
            //#endregion
          },
          [staticPages]: {

            //#region local
            name: `${this.getColoredTextItem(staticPages)} release for ${priovider} pages`,
            action: async () => {
              if (await this.releaseByType(staticPages, envOptions)) {
                process.exit(0);
              }
            },
            //#endregion
          },
        },
        {
          autocomplete: false,
          question:
            `Select release type for this ` +
            `${this.project.framework.isContainer ? LibTypeEnum.CONTAINER : 'standalone'} project ?`,
        },
      );
    }
    //#endregion

  }
  //#endregion

  //#region release by type
  async releaseByType(
    releaseType: ReleaseType,
    envOptions: EnvOptions,
  ): Promise<boolean> {

    //#region @backendFunc

    envOptions.release.releaseType = releaseType;

    const selectedProjects =
      await this.project.releaseProcess.displayProjectsSelectionMenu(
        envOptions,
      );

    const releaseArtifactsTaon = await this.displaySelectArtifactsMenu(
      envOptions,
      selectedProjects,
      ALLOWED_TO_RELEASE[releaseType] as ReleaseArtifactTaon[],
    );

    if (releaseArtifactsTaon.length > 0) {
      if (!envOptions.release.releaseVersionBumpType) {
        if (envOptions.release.autoReleaseUsingConfig) {
          envOptions.release.releaseVersionBumpType =
            CoreModels__NS__ReleaseVersionTypeEnum.PATCH;
        } else {
          envOptions.release.releaseVersionBumpType =
            await this.selectReleaseType(
              bumpType =>
                this.project.packageJson.resolvePossibleNewVersion(bumpType),
              {
                quesitonPrefixMessage: `${envOptions.release.releaseType}${releaseSuffix}`,
              },
            );
        }
      }
    } else {
      Helpers__NS__warn(`No release artifacts selected for release process`);
      await UtilsTerminal__NS__pressAnyKeyToContinueAsync();
      return false;
    }

    return await this.releaseArtifacts(
      releaseType,
      releaseArtifactsTaon,
      selectedProjects,
      envOptions,
    );
    //#endregion

  }
  //#endregion

  //#region get environment names by artifact
  public getEnvNamesByArtifact(artifact: ReleaseArtifactTaon): {
    envName: CoreModels__NS__EnvironmentNameTaon;
    envNumber?: number | undefined;
  }[] {

    //#region @backendFunc
    if (!artifact) {
      throw new Error('Artifact is required');
    }
    const pathToEnvFolder = this.project.pathFor([
      environmentsFolder,
      artifact,
    ]);
    const files = Helpers__NS__getFilesFrom(pathToEnvFolder, {
      recursive: false,
    });

    return files
      .map(f => path.basename(f))
      .filter(f => f.startsWith('env.') && f.endsWith('.ts'))
      .map(f => {
        const env = f.replace(`env.${artifact}.`, '').replace('.ts', '');
        const envRemovedNumbers = env.replace(/\d/g, '');
        const envNumber = parseInt(env.replace(envRemovedNumbers, ''));
        return {
          envName: envRemovedNumbers as CoreModels__NS__EnvironmentNameTaon,
          envNumber: !isNaN(envNumber) ? envNumber : undefined,
        };
      })
      .sort((a, b) => {
        if (a.envNumber && b.envNumber) {
          return a.envNumber - b.envNumber;
        }
        if (a.envName === '__') {
          return -1;
        }
        if (b.envName === '__') {
          return 1;
        }
        return 0;
      });
    //#endregion

  }
  //#endregion

  //#region display projects selection menu
  async displayProjectsSelectionMenu(
    envOptions: EnvOptions,
  ): Promise<Project[]> {

    //#region @backendFunc
    const selectedProjects: Project[] = [this.project];
    if (this.project.framework.isStandaloneProject) {
      return selectedProjects;
    }
    while (true) {
      UtilsTerminal__NS__clearConsole();
      // console.info(this.getReleaseHeader()); TODO UNCOMMET
      const choices = this.project.children.map(c => {
        return {
          name: c.genericName,
          value: c.location,
        };
      });

      const selectAll = await UtilsTerminal__NS__confirm({
        message: `Use all ${this.project.children.length} children projects in release process ?`,
      });

      if (selectAll) {
        selectedProjects.unshift(...this.project.children);
        return selectedProjects;
      }

      const selectedLocations = await UtilsTerminal__NS__multiselect({
        choices,
        question: `Select projects to release in ${this.project.genericName} container ?`,
      });
      if (selectedLocations.length > 0) {
        selectedProjects.unshift(
          ...selectedLocations.map(location => this.project.ins.From(location)),
        );
        return selectedProjects;
      }
    }
    //#endregion

  }
  //#endregion

  //#region display artifacts menu
  public async displaySelectArtifactsMenu(
    envOptions: EnvOptions,
    selectedProjects: Project[],
    allowedArtifacts?: ReleaseArtifactTaon[] | undefined,
  ): Promise<ReleaseArtifactTaon[]> {

    //#region @backendFunc

    while (true) {
      UtilsTerminal__NS__clearConsole();
      // console.info(this.getReleaseHeader('')); // TODO UNCOMMET
      const choices = ReleaseArtifactTaonNamesArr.filter(f => {
        // if (Array.isArray(allowedArtifacts)) {
        //   return allowedArtifacts.includes(f as ReleaseArtifactTaon);
        // }
        return true;
      }).reduce((acc, curr) => {
        return ___NS__merge(acc, {
          [curr]: {
            name: `${___NS__upperFirst(___NS__startCase(curr))} release`,
            disabled:
              Array.isArray(allowedArtifacts) &&
              !allowedArtifacts.includes(curr as ReleaseArtifactTaon),
          },
        });
      }, {}) as {
        [key in ReleaseArtifactTaon]: { name: string; disabled: boolean };
      };

      const allDisabled = Object.values(choices).every(c => c.disabled);

      if (allDisabled) {
        if (!envOptions.release.autoReleaseUsingConfig) {
          Helpers__NS__warn(`No release artifacts available for this release type`);
        }
        return [];
      }

      const { selected } = await UtilsTerminal__NS__multiselectActionAndExecute(
        choices,
        {
          autocomplete: false,
          question:
            `[${envOptions.release.releaseType}-release] Select release artifacts for this ` +
            `${
              this.project.framework.isContainer
                ? `container's ${selectedProjects.length} projects`
                : 'standalone project'
            } ?`,
        },
      );
      if (!selected || selected.length === 0) {
        continue;
      }
      return selected;
    }

    //#endregion

  }
  //#endregion

  //#region public methods / start release
  // @ts-ignore TODO weird inheritance problem
  async startRelease(envOptions?: EnvOptions): Promise<void> {

    //#region @backendFunc
    if (!envOptions.release.envName) {
      if (!envOptions.release.autoReleaseUsingConfig) {
        const environments = this.getEnvNamesByArtifact(
          envOptions.release.targetArtifact,
        );
        let selected: ReturnType<typeof this.getEnvNamesByArtifact>[number];
        Helpers__NS__info(
          `Release environment for ${chalk.bold(envOptions.release.targetArtifact)}`,
        );
        if (environments.length == 0) {
          this.project.environmentConfig.createForArtifact(
            envOptions.release.targetArtifact,
          );
          selected = {
            envName: '__',
          };
        } else if (environments.length === 1) {
          selected = environments[0];
        } else {
          const selectedEnv = await UtilsTerminal__NS__select({
            choices: environments
              .filter(e => {
                if (envOptions.release.targetArtifact !== 'angular-node-app') {
                  return true;
                }

                return e.envName !== '__';
              }) // filter out default env from selection
              .map(e => {
                return {
                  name: e.envName === '__' ? '__ ( default )' : e.envName,
                  value: e.envName,
                };
              }),
            question: `[${envOptions?.release.releaseType}-release] Select environment`,
            autocomplete: true,
          });
          selected = environments.find(e => e.envName === selectedEnv);
        }

        envOptions.release.envName = selected.envName;
        envOptions.release.envNumber = selected.envNumber;
      }
    }

    await this.project.release(envOptions);
    //#endregion

  }
  //#endregion

  //#region private methods / release artifacts for each project

  /**
   * return true if everything went ok
   */
  async releaseArtifacts(
    releaseType: ReleaseType,
    releaseArtifactsTaon: ReleaseArtifactTaon[],
    selectedProjects: Project[],
    envOptions: EnvOptions,
  ): Promise<boolean> {

    //#region @backendFunc

    for (const project of selectedProjects) {
      for (const targetArtifact of releaseArtifactsTaon) {
        await project.releaseProcess.startRelease(
          EnvOptions.from({
            ...envOptions,
            release: {
              ...envOptions.release,
              targetArtifact,
              releaseType,
            },
          }),
        );
      }
    }
    await this.pushReleaseCommits();
    return true;
    //#endregion

  }
  //#endregion

  //#region private methods / push container release commit
  /**
   * does not matter if container is releasing standalone
   * or organization packages -> release commit is pushed
   */
  async pushReleaseCommits() {

    //#region @backend
    return void 0; // TODO implement
    //#endregion

  }
  //#endregion

  //#region private methods / get release header
  private getReleaseHeader(releaseProcessType: ReleaseType) {

    //#region @backendFunc
    // if (this.project.framework.isContainer) {
    //   return (
    //     `
    //       ${this.getColoredTextItem(releaseProcessType)}` +
    //     ` release of ${this.selectedProjects.length} ` +
    //     `projects inside ${chalk.bold(this.project.genericName)}
    //       `
    //   );
    // }
    // return (
    //   `
    //         ${this.getColoredTextItem(releaseProcessType)}` +
    //   ` release of ${chalk.bold(this.project.genericName)}
    //         `
    // );
    //#endregion

  }
  //#endregion

  //#region private methods / get colored text item
  private getColoredTextItem(releaseProcessType: ReleaseType): string {

    //#region @backendFunc
    if (releaseProcessType === 'manual') {
      return ___NS__upperFirst(chalk.bold.green('Manual'));
    }
    if (releaseProcessType === 'cloud') {
      return ___NS__upperFirst(chalk.bold.blue('Cloud'));
    }
    if (releaseProcessType === 'local') {
      return ___NS__upperFirst(chalk.bold.gray('Local'));
    }
    if (releaseProcessType === 'static-pages') {
      return ___NS__upperFirst(chalk.bold.yellow('Static Pages'));
    }
    //#endregion

  }
  //#endregion

}