import { vscodeExtMethods } from 'tnp/src';
import { executeCommand } from 'tnp-helpers/src'; // @backend
import { ExtensionContext } from 'vscode';

import { BUILD_FRAMEWORK_CLI_NAME } from './lib/build-info._auto-generated_';
import * as menu from './lib/vscode-ext-menu';

const commands = vscodeExtMethods(BUILD_FRAMEWORK_CLI_NAME);
export async function activate(context: ExtensionContext) {
  const vscode = await import('vscode');
  menu.activate(context, vscode, BUILD_FRAMEWORK_CLI_NAME);
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
