//#region imports
import { path } from 'tnp-core/lib-prod';
import { ___NS__upperFirst } from 'tnp-core/lib-prod';
import { tmp_FRONTEND_NORMAL_APP_PORT, tmp_FRONTEND_WEBSQL_APP_PORT, } from './constants';
import { Project } from './project/abstract/project';
import { vscodeMenuItems } from './vscode-menu-items';
//#endregion
let menuItemClickable = true;
export function activateMenuTnp(context, vscode, FRAMEWORK_NAME) {
    function runInTerminal(command, inNewTerminal = false) {
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
    vscode.commands.registerCommand(`projectsView${FRAMEWORK_NAME_UPPER_FIST}.openItem`, (item) => {
        if (!menuItemClickable) {
            return;
        }
        if (item?.triggerActionOnClick) {
            menuItemClickable = false;
            vscode.window.withProgress({
                location: item.progressLocation,
                title: 'Executing action...',
                cancellable: false,
            }, async (progres, token) => {
                progres.report({ increment: 0, message: 'Processing...' });
                try {
                    if (item.triggerActionOnClick) {
                        await item.triggerActionOnClick(item.project, progres, token);
                    }
                    progres.report({ message: 'Done' });
                    if (item.progressLocation === vscode.ProgressLocation.Notification) {
                        vscode.window.showInformationMessage(`Done ${item.label}`);
                    }
                }
                catch (error) {
                    const errMsg = (error instanceof Error && error.message) || String(error);
                    vscode.window.showErrorMessage(errMsg);
                }
                menuItemClickable = true;
            });
            return;
        }
        if (item.project) {
            // example: open folder in same window
            const clickLink = item.refreshLinkOnClick
                ? item.clickLinkFn && item.clickLinkFn(item.project)
                : item.clickLink;
            vscode.commands
                .executeCommand('vscode.openFolder', vscode.Uri.file(clickLink || ''), {
                forceNewWindow: true,
            })
                .then(() => {
                focustFirstElement();
            });
        }
    });
    //#endregion
    //#region project item class
    class ProjectItem extends vscode.TreeItem {
        label;
        collapsibleState;
        clickLink;
        project;
        clickLinkFn;
        refreshLinkOnClick;
        triggerActionOnClick;
        processTitle;
        progressLocation;
        //#region constructor
        constructor(label, collapsibleState, options) {
            super(label, collapsibleState);
            this.label = label;
            this.collapsibleState = collapsibleState;
            options = options || {};
            this.progressLocation =
                options.progressLocation || vscode.ProgressLocation.SourceControl;
            if (options.boldLabel) {
                const labelBold = {
                    label: label,
                    highlights: [[0, label.length]],
                };
                this.label = labelBold;
            }
            if (options.iconPath !== undefined) {
                this.iconPath = (options.iconPath === null ? undefined : options.iconPath);
            }
            else {
                this.iconPath =
                    collapsibleState === vscode.TreeItemCollapsibleState.None
                        ? vscode.ThemeIcon.File
                        : vscode.ThemeIcon.Folder;
            }
            const project = options?.project;
            this.processTitle = options?.processTitle;
            this.clickLinkFn = (options?.clickLinkFn ? options.clickLinkFn : p => p?.location);
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
    }
    //#endregion
    //#region tree provider class
    class ProjectsTreeProvider {
        //#region get children
        async getChildren(element) {
            //#region resolve variables
            // if (!element) {
            // root → workspace folders
            // const editorOrgFilePath = crossPlatformPath(
            //   vscode.window.activeTextEditor.document.uri.fsPath,
            // );
            // let currentFilePath = editorOrgFilePath;
            const WORKSPACE_MAIN_FOLDER_PATH = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
            /**
             * may be container (normal or organization) or standalone project or unknow project
             */
            const CURRENT_PROJECT = WORKSPACE_MAIN_FOLDER_PATH
                ? Project.ins.From(WORKSPACE_MAIN_FOLDER_PATH)
                : undefined;
            if (!CURRENT_PROJECT) {
                return [this.taonProjWarning];
            }
            const CURRENT_PROJECT_PARENT_IS_ORGANIZATION = CURRENT_PROJECT.framework.isContainerChild &&
                CURRENT_PROJECT.parent?.taonJson.isOrganization;
            /**
             * organization container or container organization child
             */
            const ORGANIZATION = CURRENT_PROJECT.taonJson.isOrganization ||
                (CURRENT_PROJECT_PARENT_IS_ORGANIZATION &&
                    CURRENT_PROJECT.framework.isContainerChild);
            const MAP_PROJEC_FN = (project, nameIsFirst = false) => {
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
                return new ProjectItem(project.name === project.nameForNpmPackage
                    ? project.name
                    : secondPartOfName, vscode.TreeItemCollapsibleState.None, { project });
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
            const organizationMainItem = ORGANIZATION &&
                new ProjectItem(`@${CURRENT_PROJECT_PARENT_IS_ORGANIZATION ? CURRENT_PROJECT.parent.name : CURRENT_PROJECT.name}`, vscode.TreeItemCollapsibleState.None, {
                    project: CURRENT_PROJECT_PARENT_IS_ORGANIZATION
                        ? CURRENT_PROJECT.parent
                        : CURRENT_PROJECT,
                });
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
            const ORGANIZATION_PROJECTS_OR_CURRENT_PROJECT_CHILDREN = organizationMainItem
                ? [
                    ...(CURRENT_PROJECT_PARENT_IS_ORGANIZATION
                        ? CURRENT_PROJECT.parent?.children
                        : CURRENT_PROJECT.children),
                ]
                : [];
            const currentProjectProjects = [
                organizationMainItem,
                ...ORGANIZATION_PROJECTS_OR_CURRENT_PROJECT_CHILDREN.map(c => MAP_PROJEC_FN(c)).filter(f => !!f),
            ].filter(f => !!f);
            if (
            // skip when project is not organizaition and not inside organization
            // and does not have children
            currentProjectProjects.length === 1 &&
                currentProjectProjects[0].project?.location === CURRENT_PROJECT.location) {
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
        _onDidChangeTreeData = new vscode.EventEmitter();
        // @ts-ignore
        onDidChangeTreeData = this._onDidChangeTreeData.event;
        refresh() {
            this._onDidChangeTreeData.fire();
        }
        getInfoItem(text, boldLabel = false) {
            return new ProjectItem(text, vscode.TreeItemCollapsibleState.None, {
                triggerActionOnClick: () => {
                    focustFirstElement();
                },
                iconPath: null,
                boldLabel,
            });
        }
        getTreeItem(element) {
            return element;
        }
        getParent(element) {
            // All your items are root-level, so just return undefined.
            return undefined;
        }
        dummy = this.getInfoItem(' ');
        empty = new ProjectItem(' ', vscode.TreeItemCollapsibleState.None, {
            triggerActionOnClick: () => {
                focustFirstElement();
            },
            iconPath: null,
        });
        taonProjWarning = new ProjectItem('< Current project is not a Taon project >', vscode.TreeItemCollapsibleState.None, {
            triggerActionOnClick: () => {
                focustFirstElement();
            },
        });
        getDummy() {
            return this.dummy;
        }
    }
    //#endregion
    //#region register tree view
    const treeProvider = new ProjectsTreeProvider();
    // context.subscriptions.push(
    //   vscode.window.registerTreeDataProvider(`projectsView${FRAMEWORK_NAME_UPPER_FIST}`, treeProvider as any),
    // );
    var treeView = vscode.window.createTreeView(`projectsView${FRAMEWORK_NAME_UPPER_FIST}`, {
        treeDataProvider: treeProvider,
    });
    context.subscriptions.push(treeView);
    //#endregion
    return ProjectItem;
}
export function deactivateMenuTnp() { }
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib-prod/vscode-ext-menu.js.map