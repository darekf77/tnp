//#region imports
import { config, fileName, UtilsOs__NS__commandExistsAsync, UtilsOs__NS__commandExistsSync, UtilsOs__NS__detectEditor, UtilsOs__NS__Editor, UtilsOs__NS__EDITOR_PROCESSES, UtilsOs__NS__EditorArr, UtilsOs__NS__EditorProcess, UtilsOs__NS__getEditorSettingsJsonPath, UtilsOs__NS__getRealHomeDir, UtilsOs__NS__isBrowser, UtilsOs__NS__isDockerAvailable, UtilsOs__NS__isElectron, UtilsOs__NS__isNode, UtilsOs__NS__isNodeVersionOk, UtilsOs__NS__isPortInUse, UtilsOs__NS__isRunningInBrowser, UtilsOs__NS__isRunningInCliMode, UtilsOs__NS__isRunningInDocker, UtilsOs__NS__isRunningInElectron, UtilsOs__NS__isRunningInLinuxGraphicsCapableEnvironment, UtilsOs__NS__isRunningInMochaTest, UtilsOs__NS__isRunningInNode, UtilsOs__NS__isRunningInOsWithGraphicsCapableEnvironment, UtilsOs__NS__isRunningInSSRMode, UtilsOs__NS__isRunningInVscodeExtension, UtilsOs__NS__isRunningInWebSQL, UtilsOs__NS__isRunningInWindows, UtilsOs__NS__isRunningInWindowsCmd, UtilsOs__NS__isRunningInWindowsPowerShell, UtilsOs__NS__isRunningInWsl, UtilsOs__NS__isRunningNodeDebugger, UtilsOs__NS__isSSRMode, UtilsOs__NS__isVscodeExtension, UtilsOs__NS__isWebSQL, UtilsOs__NS__killAllEditor, UtilsOs__NS__openFolderInFileExplorer, UtilsOs__NS__openFolderInVSCode, UtilsOs__NS__pipxNestedPackageExists, UtilsOs__NS__pipxPackageExists, UtilsOs__NS__pythonModuleExists, UtilsOs__NS__UnknownEditor } from 'tnp-core/lib-prod';
import { chalk, fse, json5, path, os, win32Path, ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith } from 'tnp-core/lib-prod';
import { Utils__NS__binary__NS__base64toBlob, Utils__NS__binary__NS__base64toBuffer, Utils__NS__binary__NS__base64toDbBinaryFormat, Utils__NS__binary__NS__blobToArrayBuffer, Utils__NS__binary__NS__blobToBase64, Utils__NS__binary__NS__blobToBuffer, Utils__NS__binary__NS__blobToFile, Utils__NS__binary__NS__blobToJson, Utils__NS__binary__NS__blobToText, Utils__NS__binary__NS__bufferToBase64, Utils__NS__binary__NS__bufferToBlob, Utils__NS__binary__NS__bufferToText, Utils__NS__binary__NS__dbBinaryFormatToBase64, Utils__NS__binary__NS__dbBinaryFormatToText, Utils__NS__binary__NS__fileToBlob, Utils__NS__binary__NS__fileToText, Utils__NS__binary__NS__getBlobFrom, Utils__NS__binary__NS__jsonToBlob, Utils__NS__binary__NS__textToBlob, Utils__NS__binary__NS__textToBuffer, Utils__NS__binary__NS__textToDbBinaryFormat, Utils__NS__binary__NS__textToFile, Utils__NS__camelize, Utils__NS__css__NS__numValue, Utils__NS__DbBinaryFormat, Utils__NS__DbBinaryFormatEnum, Utils__NS__DbBinaryFormatForBackend, Utils__NS__DbBinaryFormatForBrowser, Utils__NS__escapeStringForRegEx, Utils__NS__fullDate, Utils__NS__fullDateTime, Utils__NS__getFreePort, Utils__NS__removeChalkSpecialChars, Utils__NS__requireUncached, Utils__NS__sortKeys, Utils__NS__uniqArray, Utils__NS__wait, Utils__NS__waitMilliseconds } from 'tnp-core/lib-prod';
import { crossPlatformPath } from 'tnp-core/lib-prod';
import { BaseVscodeHelpers, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC, UtilsVSCode__NS__calculateContrastingHexColor, UtilsVSCode__NS__generateFancyColor, UtilsVSCode__NS__regenerateVsCodeSettingsColors, UtilsVSCode__NS__vscodeImport } from 'tnp-helpers/lib-prod';

import {
  DEBUG_WORD,
  taonConfigSchemaJsonStandalone,
  taonConfigSchemaJsonContainer,
  THIS_IS_GENERATED_INFO_COMMENT,
  tmpVscodeProj,
  DEFAULT_PORT,
  dirnameFromSourceToProject,
  whatToLinkFromCoreDeepPart,
  whatToLinkFromCore,
  frameworkBuildFolders,
  docsConfigJsonFileName,
  docsConfigSchema,
  distMainProject,
  nodeModulesMainProject,
  sourceLinkInNodeModules,
  taonJsonMainProject,
  updateVscodePackageJsonJsMainProject,
  appVscodeJSFromBuild,
} from '../../constants';
import { Models__NS__CreateJsonSchemaOptions, Models__NS__DocsConfig, Models__NS__NewSiteOptions, Models__NS__PsListInfo, Models__NS__RootArgsType, Models__NS__TaonArtifactInclude, Models__NS__TaonAutoReleaseItem, Models__NS__TaonContext, Models__NS__TaonJson, Models__NS__TaonJsonContainer, Models__NS__TaonJsonStandalone, Models__NS__TaonLoaderConfig, Models__NS__TaonLoaders, Models__NS__TestTypeTaon, Models__NS__TestTypeTaonArr, Models__NS__TscCompileOptions } from '../../models';
import { Development, EnvOptions } from '../../options';

import type { Project } from './project';
//#endregion

/**
 * Handle taon things related to vscode
 * support for launch.json, settings.json etc
 */
export class Vscode // @ts-ignore TODO weird inheritance problem
  extends BaseVscodeHelpers<Project>
{
  //#region init
  async init(options?: { skipHiddingTempFiles?: boolean }): Promise<void> {
    options = options || {};

    await this.saveLaunchJson();
    this.saveTasksJson();

    // modyfing settings.json
    this.recreateJsonSchemaForDocs();
    this.recreateJsonSchemaForTaon();
    this.saveColorsForWindow();
    this.saveCurrentSettings();
    await super.init(options);
  }
  //#endregion

  //#region save current settings
  saveCurrentSettings(): void {
    //#region @backendFunc
    // TODO QUCIK_FIX for asar that can be deleted because of vscode watcher
    this.currentSettingsValue['files.watcherExclude'] = {
      'local_release/**': true,
    };

    super.saveCurrentSettings();
    //#endregion
  }
  //#endregion

  //#region save colors for window
  private saveColorsForWindow(checkingParent: boolean = false): void {
    //#region @backendFunc

    const parentIsOrg = this.project.parent?.taonJson.isOrganization;
    if (parentIsOrg) {
      this.project.parent.vsCodeHelpers.saveColorsForWindow(true);
    }
    const parentSettings =
      parentIsOrg && this.project.parent.vsCodeHelpers.currentSettingsValue;

    if (___NS__isNil(this.currentSettingsValue['workbench.colorCustomizations'])) {
      this.currentSettingsValue['workbench.colorCustomizations'] = {
        'activityBar.background': `${UtilsVSCode__NS__generateFancyColor()}`,
      };
    }
    this.currentSettingsValue['workbench.colorCustomizations'][
      'statusBar.background'
    ] = `${
      parentIsOrg
        ? parentSettings['workbench.colorCustomizations'][
            'statusBar.background'
          ]
        : this.currentSettingsValue['workbench.colorCustomizations'][
            'statusBar.background'
          ] || UtilsVSCode__NS__generateFancyColor()
    }`;

    this.currentSettingsValue['workbench.colorCustomizations'][
      'statusBar.debuggingBackground'
    ] = `#15d8ff`; // nice blue for debugging

    //#endregion
  }
  //#endregion

  //#region recreate jsonc schema for docs
  public recreateJsonSchemaForDocs(): void {
    //#region @backendFunc
    const properSchema = {
      fileMatch: [`/${docsConfigJsonFileName}`],
      url: `./${docsConfigSchema}`,
    };

    const currentSchemas: {
      fileMatch: string[];
      url: string;
    }[] = ___NS__get(this.currentSettingsValue, `['json.schemas']`) || [];

    const toDeleteIndex = currentSchemas
      .filter(
        (x, i) => x =>
          (___NS__first(x.fileMatch) as string)?.startsWith(
            `/${docsConfigJsonFileName}`,
          ),
      )
      .map((_, i) => i);

    for (const index of toDeleteIndex) {
      currentSchemas.splice(index, 1);
    }

    currentSchemas.push(properSchema);

    ___NS__set(this.currentSettingsValue, '["json.schemas"]', currentSchemas);
    //#endregion
  }
  //#endregion

  //#region recreate jsonc schema for taon
  public recreateJsonSchemaForTaon(): void {
    //#region @backendFunc
    let currentSchemas: {
      fileMatch: string[];
      url: string;
    }[] = ___NS__get(this.currentSettingsValue, `['json.schemas']`) || [];

    const toDeleteIndex = currentSchemas
      .filter(
        (x, i) => x =>
          (___NS__first(x.fileMatch) as string)?.startsWith(
            `/${taonJsonMainProject}`,
          ),
      )
      .map((_, i) => i);

    for (const index of toDeleteIndex) {
      currentSchemas.splice(index, 1);
    }

    if (this.project.framework.isStandaloneProject) {
      const properSchema = {
        fileMatch: [`/${fileName.taon_jsonc}`],
        url: `./${taonConfigSchemaJsonStandalone}`,
      };

      currentSchemas.push(properSchema);

      if (!this.project.framework.isCoreProject) {
        this.project.removeFile(taonConfigSchemaJsonContainer);
      }
    } else if (this.project.framework.isContainer) {
      const properSchema = {
        fileMatch: [`/${fileName.taon_jsonc}`],
        url: `./${taonConfigSchemaJsonContainer}`,
      };

      currentSchemas.push(properSchema);

      if (!this.project.framework.isCoreProject) {
        this.project.removeFile(taonConfigSchemaJsonStandalone);
      }
    }

    this.project.removeFile('taon-config.schema.json'); // QUICK_FIX

    ___NS__set(this.currentSettingsValue, '["json.schemas"]', currentSchemas);
    //#endregion
  }
  //#endregion

  //#region vscode plugin dev pre launch task
  private get vscodePluginDevPreLaunchTask() {
    //#region vscode update package.json
    return {
      label: 'Update package.json vscode metadata',
      type: 'shell',
      command:
        `cd ${this.project.artifactsManager.artifact.vscodePlugin
          .getTmpVscodeProjPath()
          .replace(this.project.location + '/', '')}` +
        ` && node --no-deprecation ${
          updateVscodePackageJsonJsMainProject
        } ${appVscodeJSFromBuild.replace('.js', '')}`,
      presentation: {
        reveal: 'always',
        panel: 'shared',
      },
      problemMatcher: [
        {
          owner: 'custom',
          pattern: [
            {
              regexp: '^(.*)$',
              file: 1,
              line: 1,
              column: 1,
              message: 1,
            },
          ],
          background: {
            activeOnStart: true,
            beginsPattern: 'Update package.json vscode plugin metadata...',
            endsPattern: 'Done update package.json',
          },
        },
      ],
      group: {
        kind: 'build',
        isDefault: true,
      },
    };
  }
  //#endregion

  //#region save tasks.json
  public saveTasksJson(): void {
    //#region @backendFunc

    //#endregion

    this.project.writeJson('.vscode/tasks.json', {
      version: '2.0.0',
      tasks: [this.vscodePluginDevPreLaunchTask],
    });
    //#endregion
  }
  //#endregion

  //#region save launch.json
  public async saveLaunchJson(): Promise<void> {
    //#region @backendFunc
    if (!this.project.framework.isStandaloneProject) {
      return;
    }

    //#region standalone save

    let configurations = [];
    let compounds: { name: string; configurations: any[] }[] = [];

    //#region template vscode config
    const vscodeProjDevPath =
      `${tmpVscodeProj}` + `/${Development}/${this.project.name}`;

    const templatesVscodeExConfig = [
      {
        name: 'Debug/Start Vscode Plugin',
        type: 'extensionHost',
        request: 'launch',
        runtimeExecutable: '${execPath}',
        sourceMaps: true,
        resolveSourceMapLocations: [
          '${workspaceFolder}/**',
          '!**/node_modules/**',
        ],
        args: [
          `--extensionDevelopmentPath=\${workspaceFolder}/${vscodeProjDevPath}`,
        ],
        sourceMapPathOverrides: this.sourceMapPathOverrides,
        outFiles: [
          `\${workspaceFolder}/${vscodeProjDevPath}/out/**/*.js`,
          ...this.outFiles.slice(1), // skip dist
        ],
        preLaunchTask: this.vscodePluginDevPreLaunchTask.label,
      },
      // {
      //   name: 'Extension Tests',
      //   type: 'extensionHost',
      //   request: 'launch',
      //   runtimeExecutable: '${execPath}',
      //   args: [
      //     '--extensionDevelopmentPath=${workspaceFolder}',
      //     '--extensionTestsPath=${workspaceFolder}/out/test',
      //   ],
      //   outFiles: ['${workspaceFolder}/out/test/**/*.js'],
      //   preLaunchTask: 'npm: watch',
      // },
    ];
    //#endregion

    //#region template attach process
    const templateAttachProcess = (
      debuggingPort: number = DEFAULT_PORT.DEBUGGING_CLI_TOOL,
    ) => ({
      type: 'node',
      request: 'attach',
      name: 'Attach to global cli tool',
      autoAttachChildProcesses: false, // TODO probably no need for now
      // port: debuggingPort,
      skipFiles: ['<node_internals>/**'],
      outFiles: this.outFiles,
      sourceMapPathOverrides: this.sourceMapPathOverrides,
    });
    //#endregion

    //#region tempalte start normal nodejs server
    const templateForServer = (
      serverChild: Project,
      clientProject: Project,
      workspaceLevel: boolean,
    ) => {
      // const backendPort = 4000;

      const startServerTemplate = {
        type: 'node',
        request: 'launch',
        name: `${DEBUG_WORD} Server`,
        program: '${workspaceFolder}/run.js',
        cwd: void 0,
        args: [
          // `port=${backendPort}`
        ],
        outFiles: this.outFiles,
        sourceMapPathOverrides: this.sourceMapPathOverrides,
        // "outFiles": ["${workspaceFolder}/dist/**/*.js"], becouse of this debugging inside node_moudles
        // with compy manager created moduels does not work..
        runtimeArgs: this.__vscodeLaunchRuntimeArgs,
      };
      if (serverChild.name !== clientProject.name) {
        let cwd = '${workspaceFolder}' + `/../ ${serverChild.name}`;
        if (workspaceLevel) {
          cwd = '${workspaceFolder}' + `/${serverChild.name}`;
        }
        startServerTemplate.program = cwd + '/run.js';
        startServerTemplate.cwd = cwd;
      }
      if (
        serverChild.location === clientProject.location &&
        serverChild.framework.isStandaloneProject
      ) {
        // startServerTemplate.name = `${startServerTemplate.name} Standalone`
      } else {
        startServerTemplate.name = `${startServerTemplate.name} '${serverChild.name}' for '${clientProject.name}'`;
      }
      // startServerTemplate.args.push(
      //   `--ENVoverride=${encodeURIComponent(
      //     JSON.stringify(
      //       {
      //         clientProjectName: clientProject.name,
      //       } as Partial<EnvOptions>,
      //       null,
      //       4,
      //     ),
      //   )} `,
      // );
      return startServerTemplate;
    };
    //#endregion

    //#region electron
    const startElectronServeTemplate = (remoteDebugElectronPort: number) => {
      return {
        name: `${DEBUG_WORD} Electron`,
        type: 'node',
        request: 'launch',
        protocol: 'inspector',
        cwd: '${workspaceFolder}',
        runtimeExecutable: '${workspaceFolder}/node_modules/.bin/electron',
        trace: 'verbose',
        runtimeArgs: [
          '--serve',
          '.',
          `--remote-debugging-port=${remoteDebugElectronPort}`, // 9876
        ],
        windows: {
          runtimeExecutable:
            '${workspaceFolder}/node_modules/.bin/electron.cmd',
        },
      };
    };
    //#endregion

    //#region handle standalone or worksapce child

    configurations = [
      // startNodemonServer()
    ];

    configurations.push(templateForServer(this.project, this.project, false));
    // configurations.push(startNgServeTemplate(9000, void 0, false));
    // const key =;
    const portForElectronDebugging = await this.project.registerAndAssignPort(
      `electron debugging port`,
      {
        startFrom: 9876,
      },
    );
    configurations.push(startElectronServeTemplate(portForElectronDebugging));
    // compounds.push({
    //   name: `${DEBUG_WORD} (Server + Electron)`,
    //   configurations: [...configurations.map(c => c.name)],
    // });

    const portForCliDebugging = await this.project.registerAndAssignPort(
      `cli debugging port`,
      {
        startFrom: 9229,
      },
    );

    configurations.push(templateAttachProcess(portForCliDebugging));

    configurations.push(...templatesVscodeExConfig);

    //#endregion

    this.project.writeJson('.vscode/launch.json', {
      version: '0.2.0',
      configurations,
      compounds,
    });

    configurations.forEach(c => {
      // c.outFiles = ['${workspaceFolder}/dist/**/*.js', '!**/node_modules/**'];
      delete c.outFiles;
      delete c.sourceMapPathOverrides;
      if (c.name === `${DEBUG_WORD} Electron`) {
        c.runtimeArgs[2] = `--remote-debugging-port=${DEFAULT_PORT.DEBUGGING_ELECTRON}`; // 9876
      }
      if (c.request === 'attach') {
        c.port = DEFAULT_PORT.DEBUGGING_CLI_TOOL;
      }
    });

    this.project.writeFile(
      '.vscode/launch-backup.jsonc',
      `${THIS_IS_GENERATED_INFO_COMMENT}\n` +
        `${JSON.stringify(
          {
            version: '0.2.0',
            configurations,
            compounds,
          },
          null,
          2,
        )}` +
        `\n${THIS_IS_GENERATED_INFO_COMMENT}`,
    );
    //#endregion

    //#endregion
  }
  //#endregion

  //#region vscode launch.json runtime args
  get __vscodeLaunchRuntimeArgs() {
    //#region @backendFunc
    return [
      // '--nolazy',
      // '-r',
      // 'ts-node/register',
      // // needs to be for debugging from node_modules
      '--preserve-symlinks',
      // // "--preserve-symlinks-main",NOT WORKING
      // '--experimental-worker',
    ];
    //#endregion
  }
  //#endregion

  //#region open in vscode
  public openInVscode(): void {
    //#region @backendFunc
    this.project
      .run(`${UtilsOs__NS__detectEditor()} ${this.project.location}`)
      .sync();
    //#endregion
  }
  //#endregion

  //#region get out files for debugging
  /**
   * for debugging node_modules
   * get out files for debugging
   */
  get outFiles() {
    //#region @backendFunc
    return [
      `\${workspaceFolder}/${distMainProject}/**/*.js`,
      // '!**/node_modules/**',
      // TODO this allow debugging thir party modules.. but it is not reliable
      ...Utils__NS__uniqArray(
        this.project.packagesRecognition.allIsomorphicPackagesFromMemory
          .filter(f => this.project.name !== f) // TODO or other names of this project
          .map(packageName => {
            const p = this.project.pathFor([
              nodeModulesMainProject,
              packageName,
              sourceLinkInNodeModules,
            ]);
            return Helpers__NS__isExistedSymlink(p)
              ? `${dirnameFromSourceToProject(p)}/${distMainProject}/${whatToLinkFromCoreDeepPart}/**/*.js`.replace(
                  /\/\//g,
                  '/',
                )
              : void 0;
          })
          .filter(f => !!f),
      ),
    ];
    //#endregion
  }
  //#endregion

  //#region get source map path overrides
  get sourceMapPathOverrides() {
    //#region @backendFunc
    const sourceMapPathOverrides = {};
    Utils__NS__uniqArray(
      this.project.packagesRecognition.allIsomorphicPackagesFromMemory,
    )
      .filter(f => this.project.name !== f) // TODO or other names of this project
      .forEach(packageName => {
        const p = this.project.pathFor([
          nodeModulesMainProject,
          packageName,
          sourceLinkInNodeModules,
        ]);
        if (!Helpers__NS__isExistedSymlink(p)) {
          return;
        }
        const realPathToPackage = dirnameFromSourceToProject(p);

        // Somehow this work if debuggable path
        sourceMapPathOverrides[
          `*/${path.basename(realPathToPackage)}/${whatToLinkFromCore}/*`
        ] =
          `\${workspaceFolder}/${nodeModulesMainProject}/${packageName}/${sourceLinkInNodeModules}/*`;

        // that thing should work
        // sourceMapPathOverrides[`${realPathToPackage}/${whatToLinkFromCore}/*`] =
        //   `\${workspaceFolder}/node_modules/${packageName}/source/*`;

        // that was goog long time ago - when first good debugging made with chat gpt
        // sourceMapPathOverrides[`${realPathToPackage}/src/lib/*`] =
        //   `\${workspaceFolder}/node_modules/${packageName}/source/lib/*`;
      });

    return sourceMapPathOverrides;
    //#endregion
  }
  //#endregion

  //#region vscode all file template files
  get __vscodeFileTemplates(): string[] {
    //#region @backendFunc
    if (this.project.framework.frameworkVersionAtLeast('v2')) {
      return [];
    }
    return [];
    //#endregion
  }
  //#endregion

  //#region get vscode bottom color
  getVscodeBottomColor(): string {
    let overrideBottomColor =
      this.project?.parent?.taonJson.isOrganization &&
      this.project.framework.isContainerChild
        ? this.project?.parent.getValueFromJSONC(
            '.vscode/settings.json',
            `['workbench.colorCustomizations']['statusBar.background']`,
          )
        : void 0;

    return overrideBottomColor;
  }
  //#endregion

  //#region refresh colors in settings for org and children
  refreshColorsInSettings(): void {
    super.refreshColorsInSettings();
    if (this.project.taonJson.isOrganization) {
      this.project.children.forEach(child => {
        child.vsCodeHelpers.refreshColorsInSettings();
      });
    }
  }
  //#endregion

  //#region get basic settings
  async getBasicSettins(): Promise<object> {
    //#region @backendFunc
    const settings = await super.getBasicSettins();
    frameworkBuildFolders.forEach(f => {
      settings['search.exclude'][f] = true;
    });
    return settings;
    //#endregion
  }
  //#endregion
}