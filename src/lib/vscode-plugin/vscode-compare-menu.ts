import type * as vscode from 'vscode';

type TaonBuildVariant =
  | 'browser-lib'
  | 'websql-lib'
  | 'browser-app'
  | 'websql-app'
  | 'backend-cjs'
  | 'backend-esm';

const variantFolders: Record<TaonBuildVariant, string> = {
  'browser-lib': 'tmp-src-dist',
  'websql-lib': 'tmp-src-dist-websql',
  'browser-app': 'tmp-src-app-dist',
  'websql-app': 'tmp-src-app-dist-websql',
  'backend-cjs': 'tmp-source-dist',
  'backend-esm': 'tmp-source-esm-dist',
};

export function activateCompareSelectMenu(
  context: vscode.ExtensionContext,
  vscode: typeof import('vscode'),
  FRAMEWORK_NAME: string,
) {
  vscode.commands.registerCommand(
    `${FRAMEWORK_NAME.toLowerCase()}.compareVersion`,
    async () => {
      async function compareTaonVersion(
        variant: TaonBuildVariant,
      ): Promise<void> {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
          return;
        }

        const sourceUri = editor.document.uri;
        const workspace = vscode.workspace.getWorkspaceFolder(sourceUri);

        if (!workspace) {
          return;
        }

        const relative = vscode.workspace.asRelativePath(sourceUri, false);

        if (!relative.startsWith('src/')) {
          return;
        }

        const sourceRelative = relative.replace(/^src\//, '');

        const generatedUri = vscode.Uri.joinPath(
          workspace.uri,
          variantFolders[variant],
          sourceRelative,
        );

        try {
          await vscode.workspace.fs.stat(generatedUri);
        } catch {
          vscode.window.showWarningMessage(
            `Taon generated file does not exist: ${generatedUri.fsPath}`,
          );
          return;
        }

        await vscode.commands.executeCommand(
          'vscode.diff',
          generatedUri,
          sourceUri,
          `${FRAMEWORK_NAME}: original ↔ ${variant}`,
        );
      }

      const selected = await vscode.window.showQuickPick(
        [
          {
            label: '$(browser) Browser',
            description: 'Lib',
            variant: 'browser-lib',
          },
          {
            label: '$(database) WebSQL',
            description: 'Lib',
            variant: 'websql-lib',
          },
          {
            label: '$(browser) Browser',
            description: 'App',
            variant: 'browser-app',
          },
          {
            label: '$(database) WebSQL',
            description: 'App',
            variant: 'websql-app',
          },
          {
            label: '$(server) Backend',
            description: 'CJS',
            variant: 'backend-cjs',
          },
          {
            label: '$(server) Backend',
            description: 'ESM',
            variant: 'backend-esm',
          },
        ],
        {
          placeHolder: `Compare with ${FRAMEWORK_NAME} generated version...`,
        },
      );

      if (!selected) {
        return;
      }

      await compareTaonVersion(selected.variant as TaonBuildVariant);
    },
  );
}
