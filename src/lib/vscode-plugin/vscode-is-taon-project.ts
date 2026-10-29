import type * as vscode from 'vscode';

export async function setIsTaonProject(
  context: vscode.ExtensionContext,
  vscode: typeof import('vscode'),
  FRAMEWORK_NAME: string,
) {
  async function updateTaonProjectContext(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders ?? [];

    const isTaonProject = (
      await Promise.all(
        workspaceFolders.map(async workspace => {
          const taonJsonc = vscode.Uri.joinPath(workspace.uri, 'taon.jsonc');

          try {
            await vscode.workspace.fs.stat(taonJsonc);
            return true;
          } catch {
            return false;
          }
        }),
      )
    ).some(Boolean);

    await vscode.commands.executeCommand(
      'setContext',
      `${FRAMEWORK_NAME.toLowerCase()}.isTaonProject`,
      isTaonProject,
    );
  }

  await updateTaonProjectContext();
}
