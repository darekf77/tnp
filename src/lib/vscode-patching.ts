import { fse, path, _ } from 'tnp-core/src';
import type { ExtensionContext, Uri } from 'vscode';

export const vscodePatchingCodium = (
  context: ExtensionContext,
  vscode: typeof import('vscode'),
  frameworkName: 'taon' | 'tnp',
) => {
  // Based on https://github.com/ritwickdey/vscode-create-file-folder

  //#region app model
  class AppModel {
    createFileOrFolder(taskType: 'file' | 'folder', relativePath?: string) {
      relativePath = relativePath || '/';
      const projectRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
      if (path.resolve(relativePath) === relativePath)
        relativePath = relativePath
          .substring(projectRoot.length)
          .replace(/\\/g, '/');

      if (!relativePath.endsWith('/')) relativePath += '/';
      const basepath = projectRoot;

      vscode.window
        .showInputBox({
          value: relativePath || '/',
          prompt: `Create New ${taskType} (/path/subpath/to/${taskType})`,
          ignoreFocusOut: true,
          valueSelection: [-1, -1],
        })
        .then(fullpath => {
          if (!fullpath) return;
          try {
            let paths = fullpath.split('>').map(e => e.trim());
            let targetpath =
              taskType === 'file' ? path.dirname(paths[0]) : paths[0];
            paths[0] = taskType === 'file' ? path.basename(paths[0]) : '/';
            targetpath = path.join(basepath, targetpath);
            paths = paths.map(e => path.join(targetpath, e));

            if (taskType === 'file') this.makefiles(paths);
            else this.makefolders(paths);

            setTimeout(() => {
              //tiny delay
              if (taskType === 'file') {
                let openPath = paths.find(path => fse.lstatSync(path).isFile());
                if (!openPath) return;
                vscode.workspace.openTextDocument(openPath).then(editor => {
                  if (!editor) return;
                  vscode.window.showTextDocument(editor);
                });
              }
            }, 50);
          } catch (error) {
            this.logError(error);
            vscode.window.showErrorMessage(
              'Somthing went wrong! Please report on GitHub',
            );
          }
        });
    }

    makefiles(filepaths: string[]) {
      filepaths.forEach(filepath => this.makeFileSync(filepath));
    }

    makefolders(files: string[]) {
      files.forEach(file => this.makeDirSync(file));
    }

    makeDirSync(dir: string) {
      if (fse.existsSync(dir)) return;
      if (!fse.existsSync(path.dirname(dir))) {
        this.makeDirSync(path.dirname(dir));
      }
      fse.mkdirSync(dir);
    }

    makeFileSync(filename: string) {
      if (!fse.existsSync(filename)) {
        this.makeDirSync(path.dirname(filename));
        fse.createWriteStream(filename).close();
      }
    }

    findDir(filePath: string) {
      if (!filePath) return null;
      if (fse.statSync(filePath).isFile()) return path.dirname(filePath);

      return filePath;
    }

    logError(error) {
      console.log('==============Error===============');
      console.log(error);
      console.log('===================================');
    }
  }
  //#endregion

  //#region new file folder
  const appModel = new AppModel();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `extension.createFile${_.upperFirst(frameworkName)}`,
      (file: Uri) => {
        appModel.createFileOrFolder(
          'file',
          file ? appModel.findDir(file.fsPath) : '/',
        );
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      `extension.createFolder${_.upperFirst(frameworkName)}`,
      (file: Uri) => {
        appModel.createFileOrFolder(
          'folder',
          file ? appModel.findDir(file.fsPath) : '/',
        );
      },
    ),
  );
  //#endregion

  // Based on https://github.com/natqe/reload

  //#region reload button
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    0,
  );

  statusBar.text = `Reload`;

  statusBar.command = `workbench.action.reloadWindow`;

  statusBar.tooltip = `Reload window`;

  statusBar.show();

  //#endregion
};
