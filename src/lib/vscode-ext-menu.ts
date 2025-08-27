import { crossPlatformPath, Helpers } from 'tnp-core/src';
import type { ExtensionContext } from 'vscode';
import type * as vscode from 'vscode';

import { Project } from '../lib/project/abstract/project';

export function activate(
  context: vscode.ExtensionContext,
  vscode: typeof import('vscode'),
) {
  vscode.commands.registerCommand(
    'projectsView.openItem',
    (item: ProjectItem) => {
      if (item.project) {
        // example: open folder in same window
        vscode.commands
          .executeCommand(
            'vscode.openFolder',
            vscode.Uri.file(item.project.location),
            {
              forceNewWindow: true,
            },
          )
          .then(() => {
            // After open, re-select dummy element
            treeView.reveal(treeProvider.getDummy(), {
              select: true,
              focus: true,
            });
          });
      }
    },
  );
  class ProjectItem extends vscode.TreeItem {
    constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly project: Project,
    ) {
      super(label, collapsibleState);
      this.tooltip = project ? project.nameForNpmPackage : label;
      this.iconPath =
        collapsibleState === vscode.TreeItemCollapsibleState.None
          ? vscode.ThemeIcon.File
          : vscode.ThemeIcon.Folder;

      if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
        this.command = {
          command: 'projectsView.openItem', // must be registered
          title: 'Open',
          arguments: [this], // passed to command handler
        };
      }
    }
  }

  class ProjectsTreeProvider implements vscode.TreeDataProvider<ProjectItem> {
    private _onDidChangeTreeData =
      new vscode.EventEmitter<ProjectItem | void>();
    // @ts-ignore
    readonly onDidChangeTreeData: vscode.EventEmitter<void | ProjectItem> =
      this._onDidChangeTreeData.event;

    refresh(): void {
      this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ProjectItem): vscode.TreeItem {
      return element;
    }

    getParent(element: ProjectItem): ProjectItem | undefined {
      // All your items are root-level, so just return undefined.
      return undefined;
    }

    private dummy = new ProjectItem(
      '- choose project below to switch -',
      vscode.TreeItemCollapsibleState.None,
      undefined,
    );

    private taonProjWarning = new ProjectItem(
      '< Current project is not a Taon project >',
      vscode.TreeItemCollapsibleState.None,
      undefined,
    );

    getDummy() {
      return this.dummy;
    }

    async getChildren(element?: ProjectItem): Promise<ProjectItem[]> {
      // if (!element) {
      // root → workspace folders
      // const editorOrgFilePath = crossPlatformPath(
      //   vscode.window.activeTextEditor.document.uri.fsPath,
      // );
      // let currentFilePath = editorOrgFilePath;
      const workspacPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
      const currentProject = Project.ins.From(workspacPath);
      if (!currentProject) {
        return [this.taonProjWarning];
      }

      const parentIsOrganization =
        currentProject.framework.isContainerChild &&
        currentProject.parent?.taonJson.isOrganization;

      const root = 'ROOT';

      const parentProj = new ProjectItem(
        `${root} => @${parentIsOrganization ? currentProject.parent.name : currentProject.name}`,
        vscode.TreeItemCollapsibleState.None,
        parentIsOrganization ? currentProject.parent : currentProject,
      );

      const parentName = parentIsOrganization
        ? currentProject.parent.name
        : currentProject.name;

      const isOrganizationCurrentProj =
        currentProject.framework.isContainer &&
        currentProject.taonJson.isOrganization;

      const parentAbs = isOrganizationCurrentProj
        ? crossPlatformPath([workspacPath])
        : crossPlatformPath([workspacPath, '..']);

      const folders = Helpers.foldersFrom(parentAbs, { recursive: false });

      const projects = folders
        .map(f => {
          const project = Project.ins.From(f);
          if (!project) {
            return;
          }
          return new ProjectItem(
            project.name === project.nameForNpmPackage
              ? project.name
              : `${project.nameForNpmPackage.replace(parentName, `${root}`)} (${project.name})`,
            vscode.TreeItemCollapsibleState.None,
            project,
          );
        })
        .filter(f => !!f);

      return [
        this.dummy,
        ...(isOrganizationCurrentProj || parentIsOrganization
          ? [parentProj]
          : []),
        ...projects,
      ];
    }
  }

  const treeProvider = new ProjectsTreeProvider();
  // context.subscriptions.push(
  //   vscode.window.registerTreeDataProvider('projectsView', treeProvider as any),
  // );

  var treeView = vscode.window.createTreeView('projectsView', {
    treeDataProvider: treeProvider as any,
  });
  context.subscriptions.push(treeView);
}

export function deactivate() {}
