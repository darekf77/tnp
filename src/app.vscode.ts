import { vscodeExtMethods } from 'tnp/src';
import { executeCommand } from 'tnp-helpers/src'; // @backend
import { ExtensionContext } from 'vscode';

const FRAMEWORK_NAME = 'tnp';
import * as menu from './lib/vscode-ext-menu';

const commands = vscodeExtMethods(FRAMEWORK_NAME);
export async function activate(context: ExtensionContext) {
  const vscode = await import('vscode');
  menu.activateMenuTnp(context, vscode, FRAMEWORK_NAME);

  //#region @backendFunc
  for (let index = 0; index < commands.length; index++) {
    const {
      title,
      command = '',
      exec = '',
      options,
      isDefaultBuildCommand,
    } = commands[index];
    const sub = executeCommand(
      title,
      command,
      exec as any,
      options,
      isDefaultBuildCommand,
      context,
    );
    if (sub) {
      context.subscriptions.push(sub);
    }
  }
  //#endregion

}

export function deactivate() {
  menu.deactivateMenuTnp();
}

export default { commands };
