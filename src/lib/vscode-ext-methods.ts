import {
  Utils,
  Helpers,
  crossPlatformPath,
  fse,
  path,
  UtilsOs,
  _,
  LibTypeEnum,
} from 'tnp-core/src';
import { CommandType } from 'tnp-helpers/src';
import type { Uri } from 'vscode';

import { dirnameFromSourceToProject, whatToLinkFromCore } from './constants';
import { Project } from './project/abstract/project';

interface CopyPasteTaonProjectJson {
  toCopy?: string;
  toMove?: string;
}

export const vscodeExtMethods = (FRAMEWORK_NAME: string): CommandType[] => {
  //#region @backendFunc
  const toolName = `${FRAMEWORK_NAME.toUpperCase()} CLI `;
  const group = `${toolName}`;
  const groupOpen = `${toolName} open`;
  const groupGENERATE = `${toolName} generate`;
  const groupRefactor = `${toolName} refactor`;
  const groupGroupOperations = `${toolName} projects operations`;
  // const groupTempFiles = `${toolName} temporary files`;
  // const groupOpen = `${toolName} open`;

  const taonHomeDirForCopyPathJson = crossPlatformPath([
    UtilsOs.getRealHomeDir(),
    `.taon/vscode-copy-buffor/path.json`,
  ]);
  if (!Helpers.exists(path.dirname(taonHomeDirForCopyPathJson))) {
    Helpers.mkdirp(path.dirname(taonHomeDirForCopyPathJson));
  }
  if (!Helpers.exists(taonHomeDirForCopyPathJson)) {
    Helpers.writeJson(taonHomeDirForCopyPathJson, {});
  }

  //#region copy or cut project
  const copyOrCutProject = async (
    action: keyof CopyPasteTaonProjectJson,
    vscode: typeof import('vscode'),
    uri: Uri,
  ): Promise<void> => {
    //#region @backendFunc

    const WORKSPACE_MAIN_FOLDER_PATH = crossPlatformPath(uri.path);

    const nearestProject = Project.ins.From(WORKSPACE_MAIN_FOLDER_PATH);
    if (!nearestProject) {
      vscode.window.showErrorMessage(
        `Cannot find project nearest project in path ${WORKSPACE_MAIN_FOLDER_PATH}`,
      );
      return;
    }
    if (!Helpers.exists(taonHomeDirForCopyPathJson)) {
      Helpers.writeJson(taonHomeDirForCopyPathJson, {});
    }
    const currentContent = Helpers.readJson(
      taonHomeDirForCopyPathJson,
    ) as CopyPasteTaonProjectJson;

    const resultContent = _.merge(currentContent, {
      [action]: nearestProject.location,
    } as CopyPasteTaonProjectJson);

    if (action === 'toCopy') {
      delete resultContent.toMove;
    }
    if (action === 'toMove') {
      delete resultContent.toCopy;
    }

    Helpers.writeJson(taonHomeDirForCopyPathJson, resultContent);
    vscode.window.showInformationMessage(`
            Path ${nearestProject.location} saved ${_.startCase(action)?.toLowerCase()} .
            `);

    //#endregion
  };
  //#endregion

  return (
    [
      //#region COPY/CUT PASTE PROJECT
      // {
      //   group: groupGroupOperations,
      //   title: `init project`,
      //   options: {
      //     // showSuccessMessage: false,
      //   },
      //   async exec({ vscode, uri }) {
      //     const nearestProject = Project.ins.From(crossPlatformPath(uri.path));
      //     await nearestProject?.init();
      //   },
      // },
      // {
      //   group: groupGroupOperations,
      //   title: `refresh project`,
      //   options: {
      //     // showSuccessMessage: false,
      //   },
      //   async exec({ vscode, uri }) {
      //     const nearestProject = Project.ins.From(crossPlatformPath(uri.path));
      //     await nearestProject?.refreshChildrenProjects();
      //   },
      // },
      {
        group: groupGroupOperations,
        title: `copy project`,
        options: {
          showSuccessMessage: false,
        },
        async exec({ vscode, uri }) {
          await copyOrCutProject('toCopy', vscode, uri);
        },
      },
      {
        group: groupGroupOperations,
        title: `cut project`,
        options: {
          showSuccessMessage: false,
        },
        async exec({ vscode, uri }) {
          await copyOrCutProject('toMove', vscode, uri);
        },
      },
      //#endregion

      //#region PASTE PROJECT
      {
        group: groupGroupOperations,
        options: {
          showSuccessMessage: false,
        },
        title: `paste project`,
        async exec({ vscode, uri, rootFolderPath }) {
          //#region @backendFunc

          let MAIN_CLICKED_PATH =
            crossPlatformPath(uri.path) || crossPlatformPath(rootFolderPath);
          if (!MAIN_CLICKED_PATH) {
            return;
          }
          if (!Helpers.isFolder(MAIN_CLICKED_PATH)) {
            MAIN_CLICKED_PATH = crossPlatformPath(
              path.dirname(MAIN_CLICKED_PATH),
            );
          }

          if (!Helpers.exists(taonHomeDirForCopyPathJson)) {
            Helpers.writeJson(taonHomeDirForCopyPathJson, {});
          }
          const currentContent = Helpers.readJson(
            taonHomeDirForCopyPathJson,
          ) as CopyPasteTaonProjectJson;

          const copyOrMove = async (action: keyof CopyPasteTaonProjectJson) => {
            const copyOrMoveSource = Project.ins.nearestTo(
              currentContent[action],
            );
            if (!copyOrMoveSource) {
              vscode.window.showErrorMessage(
                `Cannot find project in path ${currentContent[action]}`,
              );
              return;
            }
            if (action === 'toMove') {
              await copyOrMoveSource.fileFoldersOperations.moveProjectTo(
                MAIN_CLICKED_PATH,
              );
            } else if (action === 'toCopy') {
              await copyOrMoveSource.fileFoldersOperations.copyProjectTo(
                MAIN_CLICKED_PATH,
              );
            } else {
              vscode.window.showWarningMessage(`NOTHING TO PASTE!`);
              return;
            }

            //#region refresh projects in container
            const mainProj = Project.ins.From(MAIN_CLICKED_PATH);
            if (mainProj) {
              try {
                await mainProj.refreshChildrenProjects();
              } catch (error) {}
            }
            //#endregion

            //#region init copied project
            const destProj = Project.ins.From([
              MAIN_CLICKED_PATH,
              copyOrMoveSource.basename,
            ]);
            if (destProj) {
              try {
                destProj.run(`${FRAMEWORK_NAME.toLowerCase()} init`).sync();
              } catch (error) {}
            }
            //#endregion

            Helpers.writeJson(taonHomeDirForCopyPathJson, {});
            const actionName = action === 'toCopy' ? 'copied' : 'moved';
            vscode.window.showInformationMessage(`Done ${actionName}!`);
          };

          if (currentContent.toCopy) {
            await copyOrMove('toCopy');
          } else if (currentContent.toMove) {
            await copyOrMove('toMove');
          } else {
            vscode.window.showWarningMessage(`NOTHING TO PASTE!`);
            return;
          }
          //#endregion
        },
      },
      //#endregion

      //#region OPEN DEBUGGABLE PATH
      {
        group: null,
        title: `${toolName} open debuggable path`,
        async exec({ vscode }) {
          // opt.vscode.
          const editorOrgFilePath = crossPlatformPath(
            vscode.window.activeTextEditor.document.uri.fsPath,
          );
          let currentFilePath = editorOrgFilePath;
          let relativePath: string = '';
          let projectRoot = '';
          while (true) {
            currentFilePath = crossPlatformPath(path.dirname(currentFilePath));
            if (
              currentFilePath === '/' ||
              !currentFilePath ||
              currentFilePath.length < 3
            ) {
              break;
            }
            if (Helpers.isUnexistedLink(currentFilePath)) {
              break;
            }
            if (fse.lstatSync(currentFilePath).isSymbolicLink()) {
              projectRoot = dirnameFromSourceToProject(currentFilePath);
              relativePath = crossPlatformPath([
                whatToLinkFromCore,
                editorOrgFilePath.replace(currentFilePath + '/', ''),
              ]);
              break;
            }
          }

          const targetPath = crossPlatformPath([projectRoot, relativePath]);

          // now close the original file if it's open
          const unwantedUri = vscode.Uri.file(editorOrgFilePath);
          const editors = vscode.window.visibleTextEditors;
          const unwantedEditorPath = crossPlatformPath(unwantedUri.fsPath);

          for (const editor of editors) {
            const editorPath = crossPlatformPath(editor.document.uri.fsPath);

            if (editorPath === unwantedEditorPath) {
              await vscode.window.showTextDocument(editor.document); // bring it to front
              await vscode.commands.executeCommand(
                'workbench.action.closeActiveEditor',
              );
            }
          }

          const doc = await vscode.workspace.openTextDocument(targetPath);
          await vscode.window.showTextDocument(doc);
        },
        options: {
          titleWhenProcessing: `taon opening debuggable version of file.`,
        },
      },
      //#endregion

      //#region CREATE MIGRATION
      {
        group: groupGENERATE,
        title: `new migration`,
        exec: `${FRAMEWORK_NAME} migration:create %migrationname%`,
        options: {
          titleWhenProcessing: `taon is adding new migration..`,
          cancellable: false,
          findNearestProject: true,
          findNearestProjectType: LibTypeEnum.ISOMORPHIC_LIB,
          resolveVariables: [
            { variable: 'migrationname', placeholder: `my new db change` },
          ],
        },
      },
      //#endregion

      //#region MAGIC COPY AND RENAME
      {
        title: `magic copy and rename`,
        exec: `${FRAMEWORK_NAME} copy:and:rename '%rules%'`,
        options: {
          titleWhenProcessing: `taon is magically renaming files and folders..`,
          cancellable: false,
          resolveVariables: [
            {
              variable: 'rules',
              placeholder: `%fileName% -> %fileName%-new`,
              encode: true,
            },
          ],
        },
      },
      //#endregion

      //#region OPEN CORE CONTAINER
      {
        group,
        title: `open core container`,
        exec: `${FRAMEWORK_NAME} open:core:container`,
        options: {
          titleWhenProcessing: 'opening core container',
          findNearestProject: true,
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region OPEN CORE PROJECT
      {
        group,
        title: `open core project`,
        exec: `${FRAMEWORK_NAME} open:core:project`,
        options: {
          title: 'opening core project',
          findNearestProject: true,
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region GENERATE index.ts in selected folder
      {
        group: groupGENERATE,
        title: `generate ./index.ts with all isomorphic imports in selected folder`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% generated-index-exports_custom`,
        options: {
          titleWhenProcessing: 'generating index.ts',
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region GENERATE @websql regions for entity
      {
        group: groupRefactor,
        title: `class fields @websql regions`,
        exec: `${FRAMEWORK_NAME} generate:fieldsWebsqlRegions %absolutePath%`,
        options: {
          titleWhenProcessing: 'refactoring class field with @websql regions',
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region GENERATE taon simple example
      {
        group: groupGENERATE,
        title: `taon simple example (context, ctrl, entity, repo, api-service)`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-simple %entity%`,
        options: {
          titleWhenProcessing: 'generating taon simple example code',
          showSuccessMessage: false,
          resolveVariables: [
            {
              variable: 'entity',
              placeholder: `my-entity`,
              encode: true,
            },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon entity ui components
      {
        group: groupGENERATE,
        title: `taon entity ui components (list, page, form etc..)`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-entity-components %entity%`,
        options: {
          titleWhenProcessing: 'generating taon entity ui components',
          showSuccessMessage: false,
          resolveVariables: [
            {
              variable: 'entity',
              placeholder: `my-entity`,
              encode: true,
            },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon worker example
      {
        group: groupGENERATE,
        title: `taon worker (worker, ui, context, ctrl, entity, repo, api-service)`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-worker %entity%`,
        options: {
          titleWhenProcessing: 'generating taon worker code',
          showSuccessMessage: false,
          resolveVariables: [
            {
              variable: 'entity',
              placeholder: `my-entity`,
              encode: true,
            },
          ],
        },
      },
      //#endregion

      //#region WRAP FILE WITH @BROWSER TAG
      {
        group: groupRefactor,
        title: `wrap file with @browser TAG`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% wrap-with-browser-regions_custom`,
        options: {
          title: 'wrapping file with @browser',
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region GENERATE taon backend repository file
      {
        group: groupGENERATE,
        title: `taon .repository.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-repo_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon backend repository file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon controller file
      {
        group: groupGENERATE,
        title: `taon .controller.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-controller_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon controller file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon active context file
      {
        group: groupGENERATE,
        title: `taon .active.context.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-active-context_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon context file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon abstract context file
      {
        group: groupGENERATE,
        title: `taon .abstract.context.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-abstract-context_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon context file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon provider file
      {
        group: groupGENERATE,
        title: `taon .provider.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-provider_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon provider file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon middleware file
      {
        group: groupGENERATE,
        title: `taon .middleware.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-middleware_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon middleware file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE taon api-service file
      {
        group: groupGENERATE,
        title: `taon .api-service.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-api-service_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon api-service file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE dummy angular component structure
      {
        group: groupGENERATE,
        title: `angular component structure`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% dummy-angular-standalone-component %entity%`,
        options: {
          titleWhenProcessing: 'generating angular component structure',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-component`, encode: true },
          ],
        },
      },
      //#endregion

      //#region GENERATE dummy angular container structure
      {
        group: groupGENERATE,
        title: `angular container structure with active context`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% dummy-angular-standalone-container %entity%`,
        options: {
          titleWhenProcessing: 'generating angular container structure',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-container`, encode: true },
          ],
        },
      },
      //#endregion

      //#region temp files show
      {
        title: `show vscode temporary files`,
        exec: `${FRAMEWORK_NAME} vscode:temp:show`,
        options: {
          title: 'show temporary files',
          findNearestProject: true,
          debug: true,
          cancellable: false,
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region temp files hide
      {
        title: `hide vscode temporary files`,
        exec: `${FRAMEWORK_NAME} vscode:temp:hide`,
        options: {
          title: 'hide temporary files',
          debug: true,
          findNearestProject: true,
          cancellable: false,
          showSuccessMessage: false,
        },
      },
      //#endregion
    ] as CommandType[]
  ).map(c => {
    if (!c.command) {
      c.command = `extension.${FRAMEWORK_NAME}.${Utils.camelize(c.title)}`;
    }
    if (c.group === undefined) {
      c.group = group;
    }
    return c;
  }) as CommandType[];
  //#endregion
};
