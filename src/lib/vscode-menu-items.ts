import { config, tnpPackageName } from 'tnp-core/src';
import type { Project } from './project/abstract/project';
import type { activateMenuTnp } from './vscode-ext-menu';

export const vscodeMenuItems = ({
  vscode,
  FRAMEWORK_NAME,
  CURRENT_PROJECT,
  ProjectItem,
  focustFirstElement,
  runInTerminal,
  tmp_FRONTEND_NORMAL_APP_PORT,
  tmp_FRONTEND_WEBSQL_APP_PORT,
  skipTaonItems,
}: {
  vscode: typeof import('vscode');
  FRAMEWORK_NAME: string;
  CURRENT_PROJECT: Project | undefined;
  ProjectItem: ReturnType<typeof activateMenuTnp>;
  focustFirstElement: () => void;
  runInTerminal: (command: string) => void;
  tmp_FRONTEND_NORMAL_APP_PORT: string;
  tmp_FRONTEND_WEBSQL_APP_PORT: string;
  skipTaonItems?: boolean;
}) => {
  return [
    //#region items with actions / refresh vscode colors
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
    //#endregion

    //#region items with actions / taon push
    new ProjectItem(
      `$ ${FRAMEWORK_NAME} push`,
      vscode.TreeItemCollapsibleState.None,
      {
        iconPath: null,
        project: CURRENT_PROJECT,
        progressLocation: vscode.ProgressLocation.Notification,
        triggerActionOnClick: async (project, progress, token) => {
          focustFirstElement();
          if (project?.location) {
            progress?.report({ message: 'Pushing changes...' });
            await project.git.pushProcess();
            progress?.report({ message: 'Done', increment: 100 });
          }
        },
      },
    ),
    //#endregion

    //#region items with actions / hide temp files
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
    //#endregion

    //#region items with actions / show temp files
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
    //#endregion

    ...(!skipTaonItems
      ? [
          //#region items with actions / build lib
          new ProjectItem(
            `$ ${FRAMEWORK_NAME} build:lib`,
            vscode.TreeItemCollapsibleState.None,
            {
              iconPath: null,
              project: CURRENT_PROJECT,
              triggerActionOnClick: project => {
                runInTerminal(`${FRAMEWORK_NAME} build:lib`);
                if (project?.location) {
                  focustFirstElement();
                }
              },
            },
          ),
          //#endregion

          //#region items with actions / build lib watch
          new ProjectItem(
            `$ ${FRAMEWORK_NAME} build:watch:lib`,
            vscode.TreeItemCollapsibleState.None,
            {
              iconPath: null,
              project: CURRENT_PROJECT,
              triggerActionOnClick: project => {
                runInTerminal(`${FRAMEWORK_NAME} build:watch:lib`);
                if (project?.location) {
                  focustFirstElement();
                }
              },
            },
          ),
          //#endregion

          //#region items with actions / build docs
          new ProjectItem(
            `$ ${FRAMEWORK_NAME} docs`,
            vscode.TreeItemCollapsibleState.None,
            {
              iconPath: null,
              project: CURRENT_PROJECT,
              triggerActionOnClick: project => {
                runInTerminal(`${FRAMEWORK_NAME} docs`);
                if (project?.location) {
                  focustFirstElement();
                }
              },
            },
          ),
          //#endregion

          //#region items with actions / build lib watch
          new ProjectItem(
            `$ ${FRAMEWORK_NAME} docs:watch`,
            vscode.TreeItemCollapsibleState.None,
            {
              iconPath: null,
              project: CURRENT_PROJECT,
              triggerActionOnClick: project => {
                runInTerminal(`${FRAMEWORK_NAME} docs:watch`);
                if (project?.location) {
                  focustFirstElement();
                }
              },
            },
          ),
          //#endregion

          //#region items with actions /  app normal
          new ProjectItem(
            `$ ${FRAMEWORK_NAME} app:normal`,
            vscode.TreeItemCollapsibleState.None,
            {
              iconPath: null,
              project: CURRENT_PROJECT,
              triggerActionOnClick: project => {
                runInTerminal(`${FRAMEWORK_NAME} app:normal`);
                if (project?.location) {
                  focustFirstElement();
                }
              },
            },
          ),
          //#endregion

          //#region items with actions /  app websql
          new ProjectItem(
            `$ ${FRAMEWORK_NAME} app:websql`,
            vscode.TreeItemCollapsibleState.None,
            {
              iconPath: null,
              project: CURRENT_PROJECT,
              triggerActionOnClick: project => {
                runInTerminal(`${FRAMEWORK_NAME} app:websql`);
                if (project?.location) {
                  focustFirstElement();
                }
              },
            },
          ),
          //#endregion

          //#region items with actions /  start
          // new ProjectItem(
          //   `$ ${FRAMEWORK_NAME} start`,
          //   vscode.TreeItemCollapsibleState.None,
          //   {
          //     iconPath: null,
          //     project: CURRENT_PROJECT,
          //     triggerActionOnClick: project => {
          //       runInTerminal(`${FRAMEWORK_NAME} start`);
          //       if (project?.location) {
          //         focustFirstElement();
          //       }
          //     },
          //   },
          // ),
          //#endregion

          //#region items with actions /  start websql
          // new ProjectItem(
          //   `$ ${FRAMEWORK_NAME} start --websql`,
          //   vscode.TreeItemCollapsibleState.None,
          //   {
          //     iconPath: null,
          //     project: CURRENT_PROJECT,
          //     triggerActionOnClick: project => {
          //       runInTerminal(`${FRAMEWORK_NAME} start --websql`);
          //       if (project?.location) {
          //         focustFirstElement();
          //       }
          //     },
          //   },
          // ),
          //#endregion

          //#region items with actions /  clear
          new ProjectItem(
            `$ ${FRAMEWORK_NAME} clear`,
            vscode.TreeItemCollapsibleState.None,
            {
              iconPath: null,
              project: CURRENT_PROJECT,
              triggerActionOnClick: project => {
                runInTerminal(`${FRAMEWORK_NAME} clear`);
                if (project?.location) {
                  focustFirstElement();
                }
              },
            },
          ),
          //#endregion

          //#region items with actions /  melt
          new ProjectItem(
            `$ ${FRAMEWORK_NAME} melt`,
            vscode.TreeItemCollapsibleState.None,
            {
              iconPath: null,
              project: CURRENT_PROJECT,
              triggerActionOnClick: project => {
                if (project?.location) {
                  vscode.window.withProgress(
                    {
                      location: vscode.ProgressLocation.Notification,
                      title: `Melting ${FRAMEWORK_NAME} action commits...`,
                      cancellable: false,
                    },
                    progress => {
                      progress.report({
                        increment: 0,
                        message: 'Melting action commits...',
                      });
                      project.git.meltActionCommits();
                      progress.report({ message: 'Done', increment: 100 });
                      return Promise.resolve();
                    },
                  );
                }
                if (project?.location) {
                  focustFirstElement();
                }
              },
            },
          ),
          //#endregion

          //#region items with actions /  copy normal app url to clipboard
          new ProjectItem(
            `$ COPY normal app url to clipboard`,
            vscode.TreeItemCollapsibleState.None,
            {
              iconPath: null,
              project: CURRENT_PROJECT,
              triggerActionOnClick: project => {
                if (project?.location) {
                  vscode.window.withProgress(
                    {
                      location: vscode.ProgressLocation.Notification,
                      title: 'Copying normal app URL to clipboard...',
                      cancellable: false,
                    },
                    progress => {
                      progress.report({
                        increment: 0,
                        message: 'Copying normal app URL to clipboard...',
                      });
                      const normalAppUrl = `http://localhost:${project.readFile(tmp_FRONTEND_NORMAL_APP_PORT + '_1')}`;
                      vscode.env.clipboard.writeText(normalAppUrl);
                      progress.report({
                        message: 'Done',
                        increment: 100,
                      });
                      return Promise.resolve();
                    },
                  );
                }
                if (project?.location) {
                  focustFirstElement();
                }
              },
            },
          ),
          //#endregion

          //#region items with actions /  copy normal app url to clipboard
          new ProjectItem(
            `$ COPY websql app url to clipboard`,
            vscode.TreeItemCollapsibleState.None,
            {
              iconPath: null,
              project: CURRENT_PROJECT,
              triggerActionOnClick: project => {
                if (project?.location) {
                  vscode.window.withProgress(
                    {
                      location: vscode.ProgressLocation.Notification,
                      title: `Copying websql app URL to clipboard...`,
                      cancellable: false,
                    },
                    progress => {
                      progress.report({
                        increment: 0,
                        message: `Copying websql app URL to clipboard...`,
                      });
                      const normalAppUrl = `http://localhost:${project.readFile(tmp_FRONTEND_WEBSQL_APP_PORT + '_1')}`;
                      vscode.env.clipboard.writeText(normalAppUrl);

                      progress.report({
                        message: `Done`,
                        increment: 100,
                      });
                      return Promise.resolve();
                    },
                  );
                }
                if (project?.location) {
                  focustFirstElement();
                }
              },
            },
          ),
          //#endregion

          //#region items with actions / regenerate src/lib/index._auto-generated_.ts
          new ProjectItem(
            `$ ${FRAMEWORK_NAME} generate:lib:index`,
            vscode.TreeItemCollapsibleState.None,
            {
              iconPath: null as any,
              project: CURRENT_PROJECT as any,
              // skipReturnToMenu: true,
              triggerActionOnClick: async project => {
                if (project) {
                  await project.artifactsManager.artifact.npmLibAndCliTool.indexAutogenProvider.runTask();
                  // vscode.commands.executeCommand('workbench.view.explorer');
                }
              },
            },
          ),
          //#endregion

          //#region items with actions / regenerate src/lib/index._auto-generated_.ts
          new ProjectItem(
            `$ ${FRAMEWORK_NAME} generate:app:routes`,
            vscode.TreeItemCollapsibleState.None,
            {
              iconPath: null,
              project: CURRENT_PROJECT,
              // skipReturnToMenu: true,
              triggerActionOnClick: async project => {
                if (project) {
                  await project.artifactsManager.artifact.npmLibAndCliTool.appTsRoutesAutogenProvider.runTask();
                  // vscode.commands.executeCommand('workbench.view.explorer');
                }
              },
            },
          ),
          //#endregion

          //#region items with actions / regenerate src/lib/index._auto-generated_.ts
          new ProjectItem(
            `$ ${FRAMEWORK_NAME} refactor:self:imports`,
            vscode.TreeItemCollapsibleState.None,
            {
              iconPath: null,
              project: CURRENT_PROJECT,
              // skipReturnToMenu: true,
              triggerActionOnClick: async project => {
                if (project) {
                  await project.refactor.selfImports({});
                  // vscode.commands.executeCommand('workbench.view.explorer');
                }
              },
            },
          ),
          //#endregion
        ]
      : []),

    //#region items with actions / uninstall vscode extension itself
    //         new ProjectItem(
    //           `$ ${FRAMEWORK_NAME} vscode:uninstall:itself`,
    //           vscode.TreeItemCollapsibleState.None,
    //           {
    //             iconPath: null,
    //             project: CURRENT_PROJECT,
    //             triggerActionOnClick: project => {
    //               if (project) {
    //                 Helpers.run(
    //                   `${UtilsOs.detectEditor()} --uninstall-extension taon-dev.${FRAMEWORK_NAME}-vscode-ext
    // `,
    //                 ).sync();
    //                 vscode.commands.executeCommand('workbench.view.explorer');
    //               }
    //             },
    //           },
    //         ),
    // ...(CURRENT_PROJECT.typeIs(LibTypeEnum.ISOMORPHIC_LIB, LibTypeEnum.CONTAINER)
    //   ? [
    //       !isContainerOrganizationCurrentProj ? coreProjectItem : void 0,
    //       coreContainerItem,
    //     ].filter(f => !!f)
    //   : []),
    //#endregion
  ];
};
