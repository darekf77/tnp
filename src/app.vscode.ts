import { vscodeExtMethods } from 'tnp/src';
import { executeCommand } from 'tnp-helpers/src'; // @backend
import { ExtensionContext } from 'vscode';
import * as menu from './lib/vscode-ext-menu';

const commands = vscodeExtMethods('tnp');
export async function activate(context: ExtensionContext) {
  const vscode = await import('vscode');
  menu.activate(context, vscode);
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
      exec,
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
  menu.deactivate();
}

export default { commands };
