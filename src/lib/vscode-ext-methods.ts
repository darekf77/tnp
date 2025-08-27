import { Utils, Helpers, crossPlatformPath, fse, path } from 'tnp-core/src';
import { CommandType } from 'tnp-helpers/src';

import { dirnameFromSourceToProject, whatToLinkFromCore } from './constants';

export const vscodeExtMethods = (FRAMEWORK_NAME: string): CommandType[] => {
  //#region @backendFunc
  const toolName = `${FRAMEWORK_NAME.toUpperCase()} CLI `;
  const group = `${toolName}`;
  const groupOpen = `${toolName} open`;
  const groupGENERATE = `${toolName} generate`;
  const groupRefactor = `${toolName} refactor`;
  // const groupTempFiles = `${toolName} temporary files`;
  // const groupOpen = `${toolName} open`;

  return (
    [
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
      //#region CREATE MIGRATION
      {
        group: groupGENERATE,
        title: `new migration`,
        exec: `${FRAMEWORK_NAME} migration:create %migrationname%`,
        options: {
          titleWhenProcessing: `taon is adding new migration..`,
          cancellable: false,
          findNearestProject: true,
          findNearestProjectType: 'isomorphic-lib',
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

      //#region GENERATE INDEX.TS
      {
        group: groupGENERATE,
        title: `generate ./index.ts with all isomorphic imports`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% generated-index-exports_custom`,
        options: {
          titleWhenProcessing: 'generating index.ts',
          showSuccessMessage: false,
        },
      },
      //#endregion

      //#region GENERATE INDEX.TS
      // {
      //   group: groupGENERATE,
      //   title: `app.routes.ts`,
      //   exec: `${FRAMEWORK_NAME} generate %absolutePath% generated-index-exports_custom`,
      //   options: {
      //     titleWhenProcessing: 'generating index.ts',
      //     showSuccessMessage: false,
      //   },
      // },
      //#endregion

      //#region GENERATE INDEX.TS
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

      //#region taon example
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

      //#region taon example
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

      //#region generate taon backend repository file
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

      //#region generate taon controller file
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

      //#region generate taon controller file
      {
        group: groupGENERATE,
        title: `taon .context.ts file`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% taon-context_flat  %entity%`,
        options: {
          titleWhenProcessing: 'generating taon context file',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-entity`, encode: true },
          ],
        },
      },
      //#endregion

      //#region generate taon provider file
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

      //#region generate taon middleware file
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

      //#region generate taon api-service file
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

      //#region generate taon flat app structure
      // {
      //   option: 'app-extended_flat',
      //   label: 'Generate extended app.* files for taon app',
      // },
      // {
      //   group: groupGENERATE,
      //   title: `taon flat app structure`,
      //   exec: `${FRAMEWORK_NAME} generate %absolutePath% app-extended_flat %entity%`,
      //   options: {
      //     titleWhenProcessing: 'generating taon flat app structure',
      //     showSuccessMessage: false,
      //     resolveVariables: [
      //       { variable: 'entity', placeholder: `my-component`, encode: true },
      //     ],
      //   },
      // },
      //#endregion

      //#region generate dummy angular component structure
      // {
      //   option: 'dummy-angular-standalone-component',
      //   label: 'Generate dummy Angular component structure',
      // },
      {
        group: groupGENERATE,
        title: `angular component structure`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% dummy-angular-standalone-component %entity%`,
        options: {
          titleWhenProcessing: 'generating dummy angular component structure',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-component`, encode: true },
          ],
        },
      },
      //#endregion

      //#region generate dummy angular module structure
      {
        group: groupGENERATE,
        title: `angular module structure`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% dummy-angular-module %entity%`,
        options: {
          titleWhenProcessing: 'generating dummy angular module structure',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-component`, encode: true },
          ],
        },
      },
      //#endregion

      //#region generate dummy angular lazy module structure
      {
        group: groupGENERATE,
        title: `angular lazy module structure`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% dummy-angular-lazy-module %entity%`,
        options: {
          titleWhenProcessing: 'generating dummy angular lazy module structure',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-component`, encode: true },
          ],
        },
      },
      //#endregion

      //#region generate dummy angular lazy module container structure
      {
        group: groupGENERATE,
        title: `angular lazy module container structure`,
        exec: `${FRAMEWORK_NAME} generate %absolutePath% dummy-angular-lazy-module-container %entity%`,
        options: {
          titleWhenProcessing:
            'generating dummy angular lazy module container structure',
          showSuccessMessage: false,
          resolveVariables: [
            { variable: 'entity', placeholder: `my-component`, encode: true },
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
