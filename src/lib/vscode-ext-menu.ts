//#region imports
import { crossPlatformPath, Helpers, path } from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import type { ExtensionContext } from 'vscode';
import type * as vscode from 'vscode';

import { Project } from '../lib/project/abstract/project';
//#endregion

export function activateMenuTnp(
  context: vscode.ExtensionContext,
  vscode: typeof import('vscode'),
  FRAMEWORK_NAME: string,
) {
  //#region focus first element function
  const focustFirstElement = () => {
    treeView.reveal(treeProvider.getDummy(), {
      select: true,
      focus: true,
    });
  };
  //#endregion
  const FRAMEWORK_NAME_UPPER_FIST = _.upperFirst(FRAMEWORK_NAME);
  //#region open / click item command
  vscode.commands.registerCommand(
    `projectsView${FRAMEWORK_NAME_UPPER_FIST}.openItem`,
    (item: ProjectItem) => {
      if (item?.triggerActionOnClick) {
        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.SourceControl,
            title: 'Executing action...',
            cancellable: false,
          },
          async (progres, token) => {
            progres.report({ increment: 0, message: 'Processing...' });
            await item.triggerActionOnClick(item.project, progres, token);
            progres.report({ message: 'Done' });
          },
        );

        return;
      }
      if (item.project) {
        // example: open folder in same window
        const clickLink = item.refreshLinkOnClick
          ? item.clickLinkFn(item.project)
          : item.clickLink;

        vscode.commands
          .executeCommand('vscode.openFolder', vscode.Uri.file(clickLink), {
            forceNewWindow: true,
          })
          .then(() => {
            focustFirstElement();
          });
      }
    },
  );
  //#endregion

  //#region project item class
  class ProjectItem extends vscode.TreeItem {
    public readonly clickLink: string;
    public readonly project?: Project;
    public readonly clickLinkFn?: (project: Project) => string;
    public readonly refreshLinkOnClick?: boolean;
    public readonly triggerActionOnClick?: (
      project: Project,
      progres: vscode.Progress<{
        message?: string;
        increment?: number;
      }>,
      token: vscode.CancellationToken,
    ) => Promise<any>;
    public readonly processTitle?: string;

    //#region constructor
    constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      options?: {
        project?: Project;
        clickLinkFn?: (project: Project) => string;
        refreshLinkOnClick?: boolean;
        triggerActionOnClick?: (project: Project) => any;
        processTitle?: string;
        boldLabel?: boolean;
        iconPath?:
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
      if (options.boldLabel) {
        const labelBold = {
          label: label,
          highlights: [[0, label.length]],
        };
        this.label = labelBold as any;
      }
      if (options.iconPath !== undefined) {
        this.iconPath =
          options.iconPath === null ? undefined : options.iconPath;
      } else {
        this.iconPath =
          collapsibleState === vscode.TreeItemCollapsibleState.None
            ? vscode.ThemeIcon.File
            : vscode.ThemeIcon.Folder;
      }

      const project = options?.project;
      this.processTitle = options?.processTitle;
      this.clickLinkFn = options?.clickLinkFn
        ? options.clickLinkFn
        : p => p?.location;

      this.triggerActionOnClick = options.triggerActionOnClick;
      this.refreshLinkOnClick = options?.refreshLinkOnClick;

      this.project = project;
      this.clickLink = this.refreshLinkOnClick
        ? undefined
        : this.clickLinkFn(project);
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
      const CURRENT_PROJECT = Project.ins.From(WORKSPACE_MAIN_FOLDER_PATH);
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
      const coreProjectItem = new ProjectItem(
        `$ ${FRAMEWORK_NAME} open:core:project`,
        vscode.TreeItemCollapsibleState.None,

        {
          project: CURRENT_PROJECT.framework.coreProject,
          refreshLinkOnClick: true,
          iconPath: null,
        },
      );

      const coreContainerItem = new ProjectItem(
        `$ ${FRAMEWORK_NAME} open:core:container`,
        vscode.TreeItemCollapsibleState.None,
        {
          project: CURRENT_PROJECT.framework.coreContainer,
          refreshLinkOnClick: true,
          iconPath: null,
        },
      );
      //#endregion

      const isContainerOrganizationCurrentProj =
        CURRENT_PROJECT.framework.isContainer &&
        CURRENT_PROJECT.taonJson.isOrganization;

      const ORGANIZATION_PROJECTS_OR_CURRENT_PROJECT_CHILDREN =
        organizationMainItem
          ? [
              ...(CURRENT_PROJECT_PARENT_IS_ORGANIZATION
                ? CURRENT_PROJECT.parent?.children
                : CURRENT_PROJECT.children),
            ]
          : [...CURRENT_PROJECT.children];

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

      return [
        this.dummy,
        currentProjectProjects.length > 0 &&
          this.getInfoItem('Choose projects below to switch', true),
        ...currentProjectProjects,
        currentProjectProjects.length > 0 && this.empty,
        this.getInfoItem('Click item below to trigger action', true),
        //#region items with actions
        new ProjectItem(
          `$ ${FRAMEWORK_NAME} refresh:vscode:colors`,
          vscode.TreeItemCollapsibleState.None,
          {
            iconPath: null,
            project: CURRENT_PROJECT,
            triggerActionOnClick: project => {
              if (project?.location) {
                project.vsCodeHelpers.refreshColorsInSettings();
                focustFirstElement();
              }
            },
          },
        ),
        new ProjectItem(
          `$ ${FRAMEWORK_NAME} vscode:hide:temp`,
          vscode.TreeItemCollapsibleState.None,
          {
            iconPath: null,
            project: CURRENT_PROJECT,
            triggerActionOnClick: project => {
              if (project) {
                project.vsCodeHelpers.toogleFilesVisibilityInVscode({
                  action: 'hide-files',
                });
                vscode.commands.executeCommand('workbench.view.explorer');
              }
            },
          },
        ),
        new ProjectItem(
          `$ ${FRAMEWORK_NAME} vscode:show:temp`,
          vscode.TreeItemCollapsibleState.None,
          {
            iconPath: null,
            project: CURRENT_PROJECT,
            triggerActionOnClick: project => {
              if (project) {
                project.vsCodeHelpers.toogleFilesVisibilityInVscode({
                  action: 'show-files',
                });
                vscode.commands.executeCommand('workbench.view.explorer');
              }
            },
          },
        ),
//         new ProjectItem(
//           `$ ${FRAMEWORK_NAME} vscode:uninstall:itself`,
//           vscode.TreeItemCollapsibleState.None,
//           {
//             iconPath: null,
//             project: CURRENT_PROJECT,
//             triggerActionOnClick: project => {
//               if (project) {
//                 Helpers.run(
//                   `code --uninstall-extension taon-dev.${FRAMEWORK_NAME}-vscode-ext
// `,
//                 ).sync();
//                 vscode.commands.executeCommand('workbench.view.explorer');
//               }
//             },
//           },
//         ),
        ...(CURRENT_PROJECT.typeIs('isomorphic-lib', 'container')
          ? [
              !isContainerOrganizationCurrentProj ? coreProjectItem : void 0,
              coreContainerItem,
            ].filter(f => !!f)
          : []),
        //#endregion
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
}

export function deactivateMenuTnp() {}
