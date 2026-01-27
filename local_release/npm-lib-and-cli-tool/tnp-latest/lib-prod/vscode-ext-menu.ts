//#region imports
import { crossPlatformPath, path, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC } from 'tnp-core/lib-prod';
import { ___NS__add, ___NS__after, ___NS__ary, ___NS__assign, ___NS__assignIn, ___NS__assignInWith, ___NS__assignWith, ___NS__at, ___NS__attempt, ___NS__before, ___NS__bind, ___NS__bindAll, ___NS__bindKey, ___NS__camelCase, ___NS__capitalize, ___NS__castArray, ___NS__ceil, ___NS__chain, ___NS__chunk, ___NS__clamp, ___NS__clone, ___NS__cloneDeep, ___NS__cloneDeepWith, ___NS__cloneWith, ___NS__compact, ___NS__concat, ___NS__cond, ___NS__conforms, ___NS__conformsTo, ___NS__constant, ___NS__countBy, ___NS__create, ___NS__curry, ___NS__curryRight, ___NS__debounce, ___NS__deburr, ___NS__defaults, ___NS__defaultsDeep, ___NS__defaultTo, ___NS__defer, ___NS__delay, ___NS__difference, ___NS__differenceBy, ___NS__differenceWith, ___NS__divide, ___NS__drop, ___NS__dropRight, ___NS__dropRightWhile, ___NS__dropWhile, ___NS__each, ___NS__eachRight, ___NS__endsWith, ___NS__entries, ___NS__entriesIn, ___NS__eq, ___NS__escape, ___NS__escapeRegExp, ___NS__every, ___NS__extend, ___NS__extendWith, ___NS__fill, ___NS__filter, ___NS__find, ___NS__findIndex, ___NS__findKey, ___NS__findLast, ___NS__findLastIndex, ___NS__findLastKey, ___NS__first, ___NS__flatMap, ___NS__flatMapDeep, ___NS__flatMapDepth, ___NS__flatten, ___NS__flattenDeep, ___NS__flattenDepth, ___NS__flip, ___NS__floor, ___NS__flow, ___NS__flowRight, ___NS__forEach, ___NS__forEachRight, ___NS__forIn, ___NS__forInRight, ___NS__forOwn, ___NS__forOwnRight, ___NS__fromPairs, ___NS__functions, ___NS__functionsIn, ___NS__get, ___NS__groupBy, ___NS__gt, ___NS__gte, ___NS__has, ___NS__hasIn, ___NS__head, ___NS__identity, ___NS__includes, ___NS__indexOf, ___NS__initial, ___NS__inRange, ___NS__intersection, ___NS__intersectionBy, ___NS__intersectionWith, ___NS__invert, ___NS__invertBy, ___NS__invoke, ___NS__invokeMap, ___NS__isArguments, ___NS__isArray, ___NS__isArrayBuffer, ___NS__isArrayLike, ___NS__isArrayLikeObject, ___NS__isBoolean, ___NS__isBuffer, ___NS__isDate, ___NS__isElement, ___NS__isEmpty, ___NS__isEqual, ___NS__isEqualWith, ___NS__isError, ___NS__isFinite, ___NS__isFunction, ___NS__isInteger, ___NS__isLength, ___NS__isMap, ___NS__isMatch, ___NS__isMatchWith, ___NS__isNaN, ___NS__isNative, ___NS__isNil, ___NS__isNull, ___NS__isNumber, ___NS__isObject, ___NS__isObjectLike, ___NS__isPlainObject, ___NS__isRegExp, ___NS__isSafeInteger, ___NS__isSet, ___NS__isString, ___NS__isSymbol, ___NS__isTypedArray, ___NS__isUndefined, ___NS__isWeakMap, ___NS__isWeakSet, ___NS__iteratee, ___NS__join, ___NS__kebabCase, ___NS__keyBy, ___NS__keys, ___NS__keysIn, ___NS__last, ___NS__lastIndexOf, ___NS__lowerCase, ___NS__lowerFirst, ___NS__lt, ___NS__lte, ___NS__map, ___NS__mapKeys, ___NS__mapValues, ___NS__matches, ___NS__matchesProperty, ___NS__max, ___NS__maxBy, ___NS__mean, ___NS__meanBy, ___NS__memoize, ___NS__merge, ___NS__mergeWith, ___NS__method, ___NS__methodOf, ___NS__min, ___NS__minBy, ___NS__mixin, ___NS__multiply, ___NS__negate, ___NS__noop, ___NS__now, ___NS__nth, ___NS__nthArg, ___NS__omit, ___NS__omitBy, ___NS__once, ___NS__orderBy, ___NS__over, ___NS__overArgs, ___NS__overEvery, ___NS__overSome, ___NS__pad, ___NS__padEnd, ___NS__padStart, ___NS__parseInt, ___NS__partial, ___NS__partialRight, ___NS__partition, ___NS__pick, ___NS__pickBy, ___NS__property, ___NS__propertyOf, ___NS__pull, ___NS__pullAll, ___NS__pullAllBy, ___NS__pullAllWith, ___NS__pullAt, ___NS__random, ___NS__range, ___NS__rangeRight, ___NS__rearg, ___NS__reduce, ___NS__reduceRight, ___NS__reject, ___NS__remove, ___NS__repeat, ___NS__replace, ___NS__rest, ___NS__result, ___NS__reverse, ___NS__round, ___NS__sample, ___NS__sampleSize, ___NS__set, ___NS__setWith, ___NS__shuffle, ___NS__size, ___NS__slice, ___NS__snakeCase, ___NS__some, ___NS__sortBy, ___NS__sortedIndex, ___NS__sortedIndexBy, ___NS__sortedIndexOf, ___NS__sortedLastIndex, ___NS__sortedLastIndexBy, ___NS__sortedLastIndexOf, ___NS__sortedUniq, ___NS__sortedUniqBy, ___NS__split, ___NS__spread, ___NS__startCase, ___NS__startsWith, ___NS__stubArray, ___NS__stubFalse, ___NS__stubObject, ___NS__stubString, ___NS__stubTrue, ___NS__subtract, ___NS__sum, ___NS__sumBy, ___NS__tail, ___NS__take, ___NS__takeRight, ___NS__takeRightWhile, ___NS__takeWhile, ___NS__tap, ___NS__template, ___NS__templateSettings, ___NS__throttle, ___NS__thru, ___NS__times, ___NS__toArray, ___NS__toFinite, ___NS__toInteger, ___NS__toLength, ___NS__toLower, ___NS__toNumber, ___NS__toPairs, ___NS__toPairsIn, ___NS__toPath, ___NS__toPlainObject, ___NS__toSafeInteger, ___NS__toString, ___NS__toUpper, ___NS__transform, ___NS__trim, ___NS__trimEnd, ___NS__trimStart, ___NS__truncate, ___NS__unary, ___NS__unescape, ___NS__union, ___NS__unionBy, ___NS__unionWith, ___NS__uniq, ___NS__uniqBy, ___NS__uniqueId, ___NS__uniqWith, ___NS__unset, ___NS__unzip, ___NS__unzipWith, ___NS__update, ___NS__updateWith, ___NS__upperCase, ___NS__upperFirst, ___NS__values, ___NS__valuesIn, ___NS__without, ___NS__words, ___NS__wrap, ___NS__xor, ___NS__xorBy, ___NS__xorWith, ___NS__zip, ___NS__zipObject, ___NS__zipObjectDeep, ___NS__zipWith } from 'tnp-core/lib-prod';
import type { ExtensionContext } from 'vscode';
import type * as vscode from 'vscode';

import {
  tmp_FRONTEND_NORMAL_APP_PORT,
  tmp_FRONTEND_WEBSQL_APP_PORT,
} from './constants';
import { Project } from './project/abstract/project';
import { vscodeMenuItems } from './vscode-menu-items';
//#endregion

//#region models
type TriggerActionFn = (
  project?: Project,
  progres?: vscode.Progress<{
    message?: string;
    increment?: number;
  }>,
  token?: vscode.CancellationToken,
) => Promise<any> | void;
//#endregion

let menuItemClickable = true;
export function activateMenuTnp(
  context: vscode.ExtensionContext,
  vscode: typeof import('vscode'),
  FRAMEWORK_NAME: string,
) {
  function runInTerminal(command: string, inNewTerminal  = false) {
    let terminal = vscode.window.activeTerminal;

    if (inNewTerminal || !terminal) {
      terminal = vscode.window.createTerminal({
        name: `Running "${command}" command`,
      });
    }
    // terminal = vscode.window.createTerminal({
    //   name: `Starting "${command}" command`,
    // });

    terminal?.show(true);
    terminal?.sendText(command, true);
  }

  //#region focus first element function
  const focustFirstElement = () => {
    treeView.reveal(treeProvider.getDummy(), {
      select: true,
      focus: true,
    });
  };
  //#endregion

  const FRAMEWORK_NAME_UPPER_FIST = ___NS__upperFirst(FRAMEWORK_NAME);

  //#region open / click item command
  vscode.commands.registerCommand(
    `projectsView${FRAMEWORK_NAME_UPPER_FIST}.openItem`,
    (item: ProjectItem) => {
      if (!menuItemClickable) {
        return;
      }
      if (item?.triggerActionOnClick) {
        menuItemClickable = false;
        vscode.window.withProgress(
          {
            location: item.progressLocation,
            title: 'Executing action...',
            cancellable: false,
          },
          async (progres, token) => {
            progres.report({ increment: 0, message: 'Processing...' });
            try {
              if (item.triggerActionOnClick) {
                await item.triggerActionOnClick(item.project, progres, token);
              }
              progres.report({ message: 'Done' });
              if (
                item.progressLocation === vscode.ProgressLocation.Notification
              ) {
                vscode.window.showInformationMessage(`Done ${item.label}`);
              }
            } catch (error) {
              const errMsg =
                (error instanceof Error && error.message) || String(error);

              vscode.window.showErrorMessage(errMsg);
            }

            menuItemClickable = true;
          },
        );
        return;
      }
      if (item.project) {
        // example: open folder in same window
        const clickLink = item.refreshLinkOnClick
          ? item.clickLinkFn && item.clickLinkFn(item.project)
          : item.clickLink;

        vscode.commands
          .executeCommand(
            'vscode.openFolder',
            vscode.Uri.file(clickLink || ''),
            {
              forceNewWindow: true,
            },
          )
          .then(() => {
            focustFirstElement();
          });
      }
    },
  );
  //#endregion

  //#region project item class
  class ProjectItem extends vscode.TreeItem {
    public readonly clickLink: string | undefined;

    public readonly project?: Project;

    public readonly clickLinkFn?: (project: Project | undefined) => string;

    public readonly refreshLinkOnClick?: boolean;

    public readonly triggerActionOnClick?: TriggerActionFn;

    public readonly processTitle?: string;

    public readonly progressLocation: vscode.ProgressLocation;

    //#region constructor
    constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      options?: {
        project?: Project;
        clickLinkFn?: (project: Project) => string;
        refreshLinkOnClick?: boolean;
        triggerActionOnClick?: TriggerActionFn;
        processTitle?: string;
        progressLocation?: vscode.ProgressLocation;
        boldLabel?: boolean;
        iconPath?:
          | null
          | string
          | vscode.ThemeIcon
          | vscode.Uri
          | {
              light: string | vscode.Uri;
              dark: string | vscode.Uri;
            };
      },
    ) {
      super(label, collapsibleState);
      options = options || {};
      this.progressLocation =
        options.progressLocation || vscode.ProgressLocation.SourceControl;

      if (options.boldLabel) {
        const labelBold = {
          label: label,
          highlights: [[0, label.length]],
        };
        this.label = labelBold as any;
      }
      if (options.iconPath !== undefined) {
        this.iconPath = (
          options.iconPath === null ? undefined : options.iconPath
        ) as string;
      } else {
        this.iconPath =
          collapsibleState === vscode.TreeItemCollapsibleState.None
            ? vscode.ThemeIcon.File
            : vscode.ThemeIcon.Folder;
      }

      const project = options?.project;
      this.processTitle = options?.processTitle;
      this.clickLinkFn = (
        options?.clickLinkFn ? options.clickLinkFn : p => p?.location
      ) as any;

      this.triggerActionOnClick = options.triggerActionOnClick;
      this.refreshLinkOnClick = options?.refreshLinkOnClick;

      this.project = project;
      this.clickLink = this.refreshLinkOnClick
        ? undefined
        : this.clickLinkFn && this.clickLinkFn(project);

      this.tooltip = project ? project.nameForNpmPackage : label;

      if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
        this.command = {
          command: `projectsView${FRAMEWORK_NAME_UPPER_FIST}.openItem`, // must be registered
          title: 'Open',
          arguments: [this], // passed to command handler
        };
      }
    }
    //#endregion
  }
  //#endregion

  //#region tree provider class
  class ProjectsTreeProvider implements vscode.TreeDataProvider<ProjectItem> {
    //#region get children
    async getChildren(element?: ProjectItem): Promise<ProjectItem[]> {
      //#region resolve variables
      // if (!element) {
      // root → workspace folders
      // const editorOrgFilePath = crossPlatformPath(
      //   vscode.window.activeTextEditor.document.uri.fsPath,
      // );
      // let currentFilePath = editorOrgFilePath;

      const WORKSPACE_MAIN_FOLDER_PATH =
        vscode.workspace.workspaceFolders?.[0].uri.fsPath;

      /**
       * may be container (normal or organization) or standalone project or unknow project
       */
      const CURRENT_PROJECT = WORKSPACE_MAIN_FOLDER_PATH
        ? Project.ins.From(WORKSPACE_MAIN_FOLDER_PATH)
        : undefined;
      if (!CURRENT_PROJECT) {
        return [this.taonProjWarning];
      }

      const CURRENT_PROJECT_PARENT_IS_ORGANIZATION =
        CURRENT_PROJECT.framework.isContainerChild &&
        CURRENT_PROJECT.parent?.taonJson.isOrganization;

      /**
       * organization container or container organization child
       */
      const ORGANIZATION =
        CURRENT_PROJECT.taonJson.isOrganization ||
        (CURRENT_PROJECT_PARENT_IS_ORGANIZATION &&
          CURRENT_PROJECT.framework.isContainerChild);

      const MAP_PROJEC_FN = (
        project: Project,
        nameIsFirst: boolean = false,
      ): ProjectItem | undefined => {
        if (!project) {
          return;
        }

        const parentName = CURRENT_PROJECT_PARENT_IS_ORGANIZATION
          ? CURRENT_PROJECT.parent.name
          : CURRENT_PROJECT.name;

        const secondPartOfName = nameIsFirst
          ? `${project.name} ${project.nameForNpmPackage !== project.name ? `(${project.nameForNpmPackage})` : ''}`
          : `${project.nameForNpmPackage.replace(parentName, `---`)}` +
            ` ${project.name !== path.basename(project.nameForNpmPackage) ? `(${project.name})` : ''}`;

        return new ProjectItem(
          project.name === project.nameForNpmPackage
            ? project.name
            : secondPartOfName,
          vscode.TreeItemCollapsibleState.None,
          { project },
        );
      };
      //#endregion

      const parentOfParent = CURRENT_PROJECT_PARENT_IS_ORGANIZATION
        ? CURRENT_PROJECT.parent?.parent // special case
        : CURRENT_PROJECT.parent;

      const parentForParentChildren = [
        parentOfParent,
        ...(parentOfParent?.children || []),
      ]
        .filter(f => !!f)
        .filter(f => f.location !== CURRENT_PROJECT.location)
        .map(c => MAP_PROJEC_FN(c, true))
        .filter(f => !!f);

      const organizationMainItem =
        ORGANIZATION &&
        new ProjectItem(
          `@${CURRENT_PROJECT_PARENT_IS_ORGANIZATION ? CURRENT_PROJECT.parent.name : CURRENT_PROJECT.name}`,
          vscode.TreeItemCollapsibleState.None,
          {
            project: CURRENT_PROJECT_PARENT_IS_ORGANIZATION
              ? CURRENT_PROJECT.parent
              : CURRENT_PROJECT,
          },
        );

      //#region core items
      // TODO maybe later I will add it back
      // const coreProjectItem = new ProjectItem(
      //   `$ ${FRAMEWORK_NAME} open:core:project`,
      //   vscode.TreeItemCollapsibleState.None,

      //   {
      //     project: CURRENT_PROJECT.framework.coreProject,
      //     refreshLinkOnClick: true,
      //     iconPath: null,
      //   },
      // );

      // const coreContainerItem = new ProjectItem(
      //   `$ ${FRAMEWORK_NAME} open:core:container`,
      //   vscode.TreeItemCollapsibleState.None,
      //   {
      //     project: CURRENT_PROJECT.framework.coreContainer,
      //     refreshLinkOnClick: true,
      //     iconPath: null,
      //   },
      // );
      //#endregion

      const ORGANIZATION_PROJECTS_OR_CURRENT_PROJECT_CHILDREN =
        organizationMainItem
          ? [
              ...(CURRENT_PROJECT_PARENT_IS_ORGANIZATION
                ? CURRENT_PROJECT.parent?.children
                : CURRENT_PROJECT.children),
            ]
          : [];

      const currentProjectProjects = [
        organizationMainItem,
        ...ORGANIZATION_PROJECTS_OR_CURRENT_PROJECT_CHILDREN.map(c =>
          MAP_PROJEC_FN(c),
        ).filter(f => !!f),
      ].filter(f => !!f);

      if (
        // skip when project is not organizaition and not inside organization
        // and does not have children
        currentProjectProjects.length === 1 &&
        currentProjectProjects[0].project?.location === CURRENT_PROJECT.location
      ) {
        currentProjectProjects.length = 0;
      }

      if (CURRENT_PROJECT.typeIs('unknown-npm-project')) {
        return [
          this.dummy,
          this.getInfoItem('Click item below to trigger action', true),
          ...vscodeMenuItems({
            vscode,
            FRAMEWORK_NAME,
            CURRENT_PROJECT,
            runInTerminal,
            focustFirstElement,
            ProjectItem,
            tmp_FRONTEND_NORMAL_APP_PORT,
            tmp_FRONTEND_WEBSQL_APP_PORT,
            skipTaonItems: true,
          }),
          // children
          this.getInfoItem('Choose projects below to switch', true),
          ...(CURRENT_PROJECT?.children
            .map(c => MAP_PROJEC_FN(c))
            .filter(f => !!f) || []),
          // children
          this.getInfoItem('Choose parent projects below to switch', true),
          ...([CURRENT_PROJECT?.parent]
            .filter(f => !!f)
            .map(c => MAP_PROJEC_FN(c))
            .filter(f => !!f) || []),
          ...(CURRENT_PROJECT?.parent?.children
            .map(c => MAP_PROJEC_FN(c))
            .filter(f => !!f) || []),
        ];
      }

      return [
        this.dummy,
        currentProjectProjects.length > 0 &&
          this.getInfoItem('Choose projects below to switch', true),
        ...currentProjectProjects,
        currentProjectProjects.length > 0 && this.empty,
        this.getInfoItem('Click item below to trigger action', true),
        ...vscodeMenuItems({
          vscode,
          FRAMEWORK_NAME,
          CURRENT_PROJECT,
          runInTerminal,
          focustFirstElement,
          ProjectItem,
          tmp_FRONTEND_NORMAL_APP_PORT,
          tmp_FRONTEND_WEBSQL_APP_PORT,
        }),
        parentForParentChildren.length > 0 && this.empty,
        parentForParentChildren.length > 0 &&
          this.getInfoItem('Choose parent project children to switch', true),
        ...parentForParentChildren,
      ].filter(f => !!f);
    }
    //#endregion

    //#region methods & fields
    private _onDidChangeTreeData =
      new vscode.EventEmitter<ProjectItem | void>();

    // @ts-ignore
    readonly onDidChangeTreeData: vscode.EventEmitter<void | ProjectItem> =
      this._onDidChangeTreeData.event;

    refresh(): void {
      this._onDidChangeTreeData.fire();
    }

    getInfoItem(text: string, boldLabel: boolean = false) {
      return new ProjectItem(text, vscode.TreeItemCollapsibleState.None, {
        triggerActionOnClick: () => {
          focustFirstElement();
        },
        iconPath: null,
        boldLabel,
      });
    }

    getTreeItem(element: ProjectItem): vscode.TreeItem {
      return element;
    }

    getParent(element: ProjectItem): ProjectItem | undefined {
      // All your items are root-level, so just return undefined.
      return undefined;
    }

    private dummy = this.getInfoItem(' ');

    private empty = new ProjectItem(' ', vscode.TreeItemCollapsibleState.None, {
      triggerActionOnClick: () => {
        focustFirstElement();
      },
      iconPath: null,
    });

    private taonProjWarning = new ProjectItem(
      '< Current project is not a Taon project >',
      vscode.TreeItemCollapsibleState.None,
      {
        triggerActionOnClick: () => {
          focustFirstElement();
        },
      },
    );

    getDummy() {
      return this.dummy;
    }
    //#endregion
  }
  //#endregion

  //#region register tree view
  const treeProvider = new ProjectsTreeProvider();
  // context.subscriptions.push(
  //   vscode.window.registerTreeDataProvider(`projectsView${FRAMEWORK_NAME_UPPER_FIST}`, treeProvider as any),
  // );

  var treeView = vscode.window.createTreeView(
    `projectsView${FRAMEWORK_NAME_UPPER_FIST}`,
    {
      treeDataProvider: treeProvider as any,
    },
  );
  context.subscriptions.push(treeView);
  //#endregion

  return ProjectItem;
}

export function deactivateMenuTnp() {}