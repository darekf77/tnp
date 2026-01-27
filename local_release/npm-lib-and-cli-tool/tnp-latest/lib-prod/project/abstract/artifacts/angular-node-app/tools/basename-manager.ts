import { BaseFeatureForProject, Helpers__NS___fixCommand, Helpers__NS__bigMaxBuffer, Helpers__NS__checkProcess, Helpers__NS__cleanExit, Helpers__NS__clearConsole, Helpers__NS__command, Helpers__NS__commandOutputAsString, Helpers__NS__commandOutputAsStringAsync, Helpers__NS__compilationWrapper, Helpers__NS__contain, Helpers__NS__createFolder, Helpers__NS__createSymLink, Helpers__NS__error, Helpers__NS__execute, Helpers__NS__exists, Helpers__NS__filesFrom, Helpers__NS__foldersFrom, Helpers__NS__getFilesFrom, Helpers__NS__getFoldersFrom, Helpers__NS__getIsBrowser, Helpers__NS__getIsElectron, Helpers__NS__getIsNode, Helpers__NS__getIsRunningInGitBash, Helpers__NS__getIsSupportedTaonTerminal, Helpers__NS__getIsVerboseMode, Helpers__NS__getIsWebSQL, Helpers__NS__getIsWsl, Helpers__NS__getStdio, Helpers__NS__hideNodeWarnings, Helpers__NS__info, Helpers__NS__isBlob, Helpers__NS__isBuffer, Helpers__NS__isClass, Helpers__NS__isExistedSymlink, Helpers__NS__isFile, Helpers__NS__isFolder, Helpers__NS__isRunningInDocker, Helpers__NS__isRunningInLinuxGraphicsCapableEnvironment, Helpers__NS__isSymlinkFileExitedOrUnexisted, Helpers__NS__isSymlinkThatMatchesUrl, Helpers__NS__isUnexistedLink, Helpers__NS__killOnPort, Helpers__NS__killProcess, Helpers__NS__killProcessByPort, Helpers__NS__linksToFolderFrom, Helpers__NS__linksToFoldersFrom, Helpers__NS__log, Helpers__NS__logError, Helpers__NS__logInfo, Helpers__NS__logProc, Helpers__NS__logSuccess, Helpers__NS__logWarn, Helpers__NS__mediaTypeFromSrc, Helpers__NS__mkdirp, Helpers__NS__modifyLineByLine, Helpers__NS__msgCacheClear, Helpers__NS__openFolderInFileExplorer, Helpers__NS__parse, Helpers__NS__pathContainLink, Helpers__NS__questionYesNo, Helpers__NS__readFile, Helpers__NS__readJson, Helpers__NS__readJson5, Helpers__NS__readJsonC, Helpers__NS__relative, Helpers__NS__remove, Helpers__NS__removeEmptyLineFromString, Helpers__NS__removeFileIfExists, Helpers__NS__removeFolderIfExists, Helpers__NS__removeIfExists, Helpers__NS__removeSlashAtBegin, Helpers__NS__removeSlashAtEnd, Helpers__NS__removeSymlinks, Helpers__NS__renderError, Helpers__NS__replaceLinesInFile, Helpers__NS__run, Helpers__NS__runAsyncIn, Helpers__NS__runSyncIn, Helpers__NS__runSyncOrAsync, Helpers__NS__sleep, Helpers__NS__stopApplication, Helpers__NS__stringify, Helpers__NS__success, Helpers__NS__taskDone, Helpers__NS__taskStarted, Helpers__NS__throwError, Helpers__NS__timeout, Helpers__NS__tryCatchError, Helpers__NS__tryReadFile, Helpers__NS__tryRemoveDir, Helpers__NS__values, Helpers__NS__wait, Helpers__NS__warn, Helpers__NS__writeFile, Helpers__NS__writeJson, Helpers__NS__writeJson5, Helpers__NS__writeJsonC } from 'tnp-helpers/lib-prod';

import { EnvOptions, ReleaseArtifactTaon } from '../../../../../options';
import type { Project } from '../../../project';

/**
 * Base href can be:
 *
 * '' - for electron release build ( / - doesn't work in file system)
 * '/' - root
 * '/my-base-href/'
 *
 */ // @ts-ignore TODO weird inheritance problem
export class AngularFeBasenameManager extends BaseFeatureForProject<Project> {
  public readonly rootBaseHref: string = '/';
  public get baseHrefForGhPages(): string {
    return this.project.name;
  }

  private resolveBaseHrefForProj(envOptions: EnvOptions): string {

    //#region @backendFunc
    const overrideBaseHref: string = envOptions.build.baseHref;
    let baseHref = this.rootBaseHref;

    if (overrideBaseHref === '') {
      baseHref = overrideBaseHref;
    } else {
      if (overrideBaseHref) {
        baseHref = overrideBaseHref;
      } else {
        if (envOptions.release.releaseType) {
          if (envOptions.website.useDomain) {
            baseHref = this.rootBaseHref;
          } else {
            baseHref = `/${this.baseHrefForGhPages}/`;
          }
        }
      }
    }

    return baseHref;
    //#endregion

  }

  getBaseHref(envOptions: EnvOptions): string {

    //#region @backendFunc
    let baseHref = this.resolveBaseHrefForProj(envOptions);

    // baseHref = baseHref.endsWith('/') ? baseHref : (baseHref + '/');
    // baseHref = baseHref.startsWith('/') ? baseHref : ('/' + baseHref);
    baseHref = baseHref.replace(/\/\//g, '/');
    return baseHref;
    //#endregion

  }

  replaceBaseHrefInFile(fileAbsPath: string, initOptions: EnvOptions) {

    //#region @backendFunc
    let fileContent = Helpers__NS__readFile(fileAbsPath);
    const frontendBaseHref =
      this.project.artifactsManager.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(
        initOptions,
      );
    fileContent = fileContent
      .replace('<<<TO_REPLACE_BASENAME>>>', frontendBaseHref)
      .replace('<<<TO_REPLACE_PROJ_NAME>>>', this.project.name);
    Helpers__NS__writeFile(fileAbsPath, fileContent);
    //#endregion

  }
}