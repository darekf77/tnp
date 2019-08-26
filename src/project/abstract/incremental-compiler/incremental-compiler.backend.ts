import * as chokidar from 'chokidar';
import * as path from 'path';
import * as _ from 'lodash';
import * as glob from 'glob';
import * as fse from 'fs-extra';
import { CLASS } from 'typescript-class-helpers';
import { error, warn, log } from '../../../helpers/helpers-messages';
import { ChangeOfFile } from './change-of-file.backend';
import { BaseClientCompiler } from './base-client-compiler.backend';
import { FileExtension } from '../../../models';
import { patchingForAsync } from '../../../helpers';


export class CompilerManager {
  //#region singleton
  private static _instance: CompilerManager;
  public static get Instance() {
    if (!this._instance) {
      this._instance = new CompilerManager();
    }
    return this._instance;
  }
  //#endregion


  private watcher: chokidar.FSWatcher;
  private lastAsyncFiles = [];
  private currentObservedFolder = [];
  private clients: BaseClientCompiler[] = [];
  private asyncEventScenario: (event: ChangeOfFile) => Promise<ChangeOfFile>;
  private inited = false;

  public addClient(client: BaseClientCompiler) {
    const existed = this.clients.find(c => CLASS.getNameFromObject(c) === CLASS.getNameFromObject(client));
    if (existed) {
      error(`Client "${CLASS.getNameFromObject(client)}" alread added`, false, true);
    }
    this.clients.push(client);
  }

  public async init(
    onAsyncFileChange?: (event: ChangeOfFile) => Promise<any>) {
    this.asyncEventScenario = onAsyncFileChange;
    this.inited = true;
  }

  public changeExecuted(cange: ChangeOfFile, target: Function) {

  }


  public async syncInit(client: BaseClientCompiler) {
    log(`syncInit of ${CLASS.getNameFromObject(client)}`);
    await client.syncAction(this.syncActionResolvedFiles(client));
  }

  public async asyncInit(client: BaseClientCompiler) {
    log(`asyncInit of ${CLASS.getNameFromObject(client)}`);
    if (this.currentObservedFolder.length === 0 && this.allFoldersToWatch.length > 0) {
      this.watcher = chokidar.watch(this.allFoldersToWatch, {
        ignoreInitial: true,
        followSymlinks: true,
        ignorePermissionErrors: true,
      }).on('all', async (event, f) => {
        if (event !== 'addDir') {
          if (this.lastAsyncFiles.includes(f)) {
            return;
          } else {
            this.lastAsyncFiles.push(f);
          }
          // log(`event ${event}, path: ${f}`);
          const toNotify = this.clients
            .filter(c => f.startsWith(c.folderPath));

          const change = new ChangeOfFile(toNotify, f);
          if (this.asyncEventScenario) {
            await this.asyncEventScenario(change);
          }
          for (let index = 0; index < toNotify.length; index++) {
            const clientOfAsyncAction = toNotify[index];
            if (!change.executedFor.includes(clientOfAsyncAction)) {
              await clientOfAsyncAction.asyncAction(change);
            }
          }
          this.lastAsyncFiles = this.lastAsyncFiles.filter(ef => ef !== f);
        }
      });
    } else if (_.isString(client.folderPath) && !this.currentObservedFolder.includes(client.folderPath)) {
      this.watcher.add(client.folderPath);
    }
  }

  private preventNotInited() {
    if (!this.inited) {
      error(`Please init Compiler Manager:
      CompilerManager.Instance.init( ... async scenario ...  );
      `, false, true)
    }
  }

  private constructor() {

  }

  private get allFoldersToWatch() {
    const folders: string[] = [];
    this.clients.forEach(c => {
      if (_.isString(c.folderPath) && !folders.includes(c.folderPath)) {
        folders.push(c.folderPath);
      }
    });
    return folders;
  }


  private syncActionResolvedFiles(client: BaseClientCompiler) {
    if (client.folderPath) {
      return glob.sync(`${client.folderPath}/**/*.*`, {
        symlinks: false,
      }).filter(f => {
        if (client.subscribeOnlyFor.length > 0) {
          return client.subscribeOnlyFor.includes(path.extname(f).replace('.', '') as FileExtension);
        }
        return true;
      })
    }
    return [];
  }

}

