"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vscodePatchingCodium = void 0;
const lib_1 = require("tnp-core/lib");
const vscodePatchingCodium = (context, vscode) => {
    // Based on https://github.com/ritwickdey/vscode-create-file-folder
    //#region app model
    class AppModel {
        createFileOrFolder(taskType, relativePath) {
            relativePath = relativePath || '/';
            const projectRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
            if (lib_1.path.resolve(relativePath) === relativePath)
                relativePath = relativePath
                    .substring(projectRoot.length)
                    .replace(/\\/g, '/');
            if (!relativePath.endsWith('/'))
                relativePath += '/';
            const basepath = projectRoot;
            vscode.window
                .showInputBox({
                value: relativePath || '/',
                prompt: `Create New ${taskType} (/path/subpath/to/${taskType})`,
                ignoreFocusOut: true,
                valueSelection: [-1, -1],
            })
                .then(fullpath => {
                if (!fullpath)
                    return;
                try {
                    let paths = fullpath.split('>').map(e => e.trim());
                    let targetpath = taskType === 'file' ? lib_1.path.dirname(paths[0]) : paths[0];
                    paths[0] = taskType === 'file' ? lib_1.path.basename(paths[0]) : '/';
                    targetpath = lib_1.path.join(basepath, targetpath);
                    paths = paths.map(e => lib_1.path.join(targetpath, e));
                    if (taskType === 'file')
                        this.makefiles(paths);
                    else
                        this.makefolders(paths);
                    setTimeout(() => {
                        //tiny delay
                        if (taskType === 'file') {
                            let openPath = paths.find(path => lib_1.fse.lstatSync(path).isFile());
                            if (!openPath)
                                return;
                            vscode.workspace.openTextDocument(openPath).then(editor => {
                                if (!editor)
                                    return;
                                vscode.window.showTextDocument(editor);
                            });
                        }
                    }, 50);
                }
                catch (error) {
                    this.logError(error);
                    vscode.window.showErrorMessage('Somthing went wrong! Please report on GitHub');
                }
            });
        }
        makefiles(filepaths) {
            filepaths.forEach(filepath => this.makeFileSync(filepath));
        }
        makefolders(files) {
            files.forEach(file => this.makeDirSync(file));
        }
        makeDirSync(dir) {
            if (lib_1.fse.existsSync(dir))
                return;
            if (!lib_1.fse.existsSync(lib_1.path.dirname(dir))) {
                this.makeDirSync(lib_1.path.dirname(dir));
            }
            lib_1.fse.mkdirSync(dir);
        }
        makeFileSync(filename) {
            if (!lib_1.fse.existsSync(filename)) {
                this.makeDirSync(lib_1.path.dirname(filename));
                lib_1.fse.createWriteStream(filename).close();
            }
        }
        findDir(filePath) {
            if (!filePath)
                return null;
            if (lib_1.fse.statSync(filePath).isFile())
                return lib_1.path.dirname(filePath);
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
    context.subscriptions.push(vscode.commands.registerCommand('extension.createFile', (file) => {
        appModel.createFileOrFolder('file', file ? appModel.findDir(file.fsPath) : '/');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.createFolder', (file) => {
        appModel.createFileOrFolder('folder', file ? appModel.findDir(file.fsPath) : '/');
    }));
    //#endregion
    // Based on https://github.com/natqe/reload
    //#region reload button
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
    statusBar.text = `Reload`;
    statusBar.command = `workbench.action.reloadWindow`;
    statusBar.tooltip = `Reload window`;
    statusBar.show();
    //#endregion
};
exports.vscodePatchingCodium = vscodePatchingCodium;
//# sourceMappingURL=c:/Users/darek/projects/npm/taon-dev/tnp/dist/lib/vscode-patching.js.map