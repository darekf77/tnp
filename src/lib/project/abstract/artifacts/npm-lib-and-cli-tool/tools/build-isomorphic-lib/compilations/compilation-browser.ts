//#region imports
import { IncCompiler } from 'incremental-compiler/src';
import { JSON10 } from 'json10/src';
import { config, extForSassLikeFiles } from 'tnp-config/src';
import { TAGS } from 'tnp-config/src';
import {
  _,
  path,
  fse,
  rimraf,
  crossPlatformPath,
  CoreModels,
} from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
import { CodeCut } from '../code-cut/code-cut';
import { codeCuttFn } from '../code-cut/cut-fn';
//#endregion

export class BrowserCompilation extends IncCompiler.Base {
  //#region fields & getters
  protected compilerName = 'Browser standard compiler';
  public codecutNORMAL: CodeCut;
  public codecutWEBSQL: CodeCut;

  get customCompilerName(): string {
    //#region @backendFunc
    return `Browser compilation`;
    //#endregion
  }

  //#endregion

  //#region constructor
  readonly sourceOutBrowserWEBSQL: string;
  readonly sourceOutBrowserNORMAL: string;
  readonly absPathTmpSrcDistFolderWEBSQL: string;
  readonly absPathTmpSrcDistFolderNORMAL: string;
  //#region @backend
  constructor(
    public project: Project,
    /**
     * tmp-src-for-(dist)-browser
     */

    protected srcFolder: string,
    public buildOptions: EnvOptions,
  ) {
    super({
      folderPath: crossPlatformPath([project.location, srcFolder]),
      notifyOnFileUnlink: true,
      followSymlinks: true,
      taskName: 'BrowserCompilation',
    });

    this.project = project;
    this.compilerName = this.customCompilerName;

    this.sourceOutBrowserWEBSQL = `tmp-src-dist-websql`;
    this.sourceOutBrowserNORMAL = `tmp-src-dist`;
    this.absPathTmpSrcDistFolderWEBSQL = crossPlatformPath(
      path.join(this.project.location || '', this.sourceOutBrowserWEBSQL || ''),
    );
    this.absPathTmpSrcDistFolderNORMAL = crossPlatformPath(
      path.join(this.project.location || '', this.sourceOutBrowserNORMAL || ''),
    );
  }
  //#endregion
  //#endregion

  //#region methods

  //#region methods / sync action
  async syncAction(absFilesFromSrc: string[]) {
    //#region @backendFunc
    const buildOptForNormal = this.buildOptions.clone({
      build: {
        websql: false,
      },
    });

    this.codecutNORMAL = new CodeCut(
      this.absPathTmpSrcDistFolderNORMAL,
      {
        replacements: [
          [TAGS.BACKEND_FUNC, `return (void 0);`],
          TAGS.BACKEND as any,
          TAGS.WEBSQL_ONLY as any,
          [TAGS.WEBSQL_FUNC, `return (void 0);`],
          TAGS.WEBSQL as any,
          [TAGS.CUT_CODE_IF_TRUE, codeCuttFn(true)],
          [TAGS.CUT_CODE_IF_FALSE, codeCuttFn(false)],
        ].filter(f => !!f),
        env: buildOptForNormal,
      },
      this.project,
      buildOptForNormal,
    );

    const buildOptForWebsql = this.buildOptions.clone({
      build: {
        websql: true,
      },
    });
    this.codecutWEBSQL = new CodeCut(
      this.absPathTmpSrcDistFolderWEBSQL,
      {
        replacements: [
          [TAGS.BACKEND_FUNC, `return (void 0);`],
          TAGS.BACKEND as any,
          [TAGS.CUT_CODE_IF_TRUE, codeCuttFn(true)],
          [TAGS.CUT_CODE_IF_FALSE, codeCuttFn(false)],
        ].filter(f => !!f),
        env: buildOptForWebsql,
      },
      this.project,
      buildOptForWebsql,
    );

    const tmpSource = this.project.pathFor('tmp-source-dist');
    Helpers.removeFolderIfExists(this.absPathTmpSrcDistFolderWEBSQL);
    Helpers.removeFolderIfExists(this.absPathTmpSrcDistFolderNORMAL);
    Helpers.mkdirp(this.absPathTmpSrcDistFolderNORMAL);
    Helpers.mkdirp(this.absPathTmpSrcDistFolderWEBSQL);
    Helpers.mkdirp(tmpSource);
    Helpers.removeFolderIfExists(tmpSource);

    this.project.quickFixes.recreateTempSourceNecessaryFilesForTesting();

    const filesBase = crossPlatformPath(
      path.join(this.project.location, this.srcFolder),
    );
    const relativePathesToProcess = absFilesFromSrc.map(absFilePath => {
      const relativePath = absFilePath.replace(`${filesBase}/`, '');
      const isScssOrSass = extForSassLikeFiles.includes(
        path.extname(path.basename(relativePath)),
      );
      if (isScssOrSass) {
        const destScss = this.sassDestFor(relativePath);
        Helpers.copyFile(absFilePath, destScss);
      }
      return relativePath;
    });

    this.codecutNORMAL.files(relativePathesToProcess);
    this.codecutWEBSQL.files(relativePathesToProcess);
    // process.exit(0)
    //#endregion
  }
  //#endregion

  private sassDestFor(relativePath: string): string {
    //#region @backendFunc
    const destScss = this.project.pathFor(
      `dist/${path.extname(path.basename(relativePath)).replace('.', '')}/${relativePath}`,
    );
    return destScss;
    //#endregion
  }

  //#region methods / async action
  async asyncAction(event: IncCompiler.Change) {
    if (!this.codecutWEBSQL || !this.codecutNORMAL) {
      // TODO QUICK - but I thin it make sense => there is not backedn compilation for websql
      return;
    }
    this.asyncActionFor(event, false);
    this.asyncActionFor(event, true);
  }

  async asyncActionFor(event: IncCompiler.Change, websql: boolean) {
    //#region @backendFunc
    // console.log('ASYNC ACTION CODE CUT ', event.fileAbsolutePath);

    const absoluteFilePath = crossPlatformPath(event.fileAbsolutePath);
    const relativeFilePath = crossPlatformPath(
      absoluteFilePath.replace(
        `${crossPlatformPath(path.join(this.project.location, this.srcFolder))}/`,
        '',
      ),
    );
    if (path.basename(relativeFilePath) === '.DS_Store') {
      return;
    }

    //#region handle backend & scss files
    if (!websql) {
      //#region backend file
      (() => {
        const destinationFileBackendPath = crossPlatformPath([
          this.project.location,
          'tmp-source-dist',
          relativeFilePath,
        ]);

        if (event.eventName === 'unlinkDir') {
          Helpers.removeFolderIfExists(destinationFileBackendPath);
        } else {
          if (event.eventName === 'unlink') {
            if (relativeFilePath.startsWith(`${config.folder.assets}/`)) {
              // nothing
            } else {
              try {
                Helpers.removeFileIfExists(destinationFileBackendPath);
              } catch (error) {
                Helpers.warn(
                  `Error during removing file ${destinationFileBackendPath}`,
                );
              }
            }
          } else {
            if (fse.existsSync(absoluteFilePath)) {
              //#region mkdirp basedir
              if (!fse.existsSync(path.dirname(destinationFileBackendPath))) {
                fse.mkdirpSync(path.dirname(destinationFileBackendPath));
              }
              //#endregion

              //#region remove deist if directory
              if (
                fse.existsSync(destinationFileBackendPath) &&
                fse.lstatSync(destinationFileBackendPath).isDirectory()
              ) {
                fse.removeSync(destinationFileBackendPath);
              }
              //#endregion
            }
          }
        }
      })();
      //#endregion

      //#region scss file
      (() => {
        const isScssOrSass = extForSassLikeFiles.includes(
          path.extname(path.basename(relativeFilePath)),
        );
        if (!isScssOrSass) {
          return;
        }
        const destinationFileScssPath = this.sassDestFor(relativeFilePath);

        if (event.eventName === 'unlinkDir') {
          try {
            Helpers.removeFolderIfExists(destinationFileScssPath);
          } catch (error) {
            Helpers.warn(
              `Error during removing folder ${destinationFileScssPath}`,
            );
          }
        } else {
          if (event.eventName === 'unlink') {
            if (relativeFilePath.startsWith(`${config.folder.assets}/`)) {
              // nothing
            } else {
              try {
                Helpers.removeFileIfExists(destinationFileScssPath);
              } catch (error) {
                Helpers.warn(
                  `Error during removing file ${destinationFileScssPath}`,
                );
              }
            }
          } else {
            if (fse.existsSync(absoluteFilePath)) {
              //#region mkdirp basedir
              if (!fse.existsSync(path.dirname(destinationFileScssPath))) {
                fse.mkdirpSync(path.dirname(destinationFileScssPath));
              }
              //#endregion

              //#region remove deist if directory
              if (
                fse.existsSync(destinationFileScssPath) &&
                fse.lstatSync(destinationFileScssPath).isDirectory()
              ) {
                fse.removeSync(destinationFileScssPath);
              }
              //#endregion
              Helpers.copyFile(absoluteFilePath, destinationFileScssPath);
            }
          }
        }
      })();
      //#endregion
    }
    //#endregion

    //#region browser file
    (() => {
      const destinationFilePath = crossPlatformPath(
        path.join(
          this.project.location,
          websql ? this.sourceOutBrowserWEBSQL : this.sourceOutBrowserNORMAL,
          relativeFilePath,
        ),
      );

      if (event.eventName === 'unlinkDir') {
        Helpers.removeFolderIfExists(destinationFilePath);
      } else {
        if (event.eventName === 'unlink') {
          if (relativeFilePath.startsWith(`${config.folder.assets}/`)) {
            websql
              ? this.codecutWEBSQL.files([relativeFilePath], true)
              : this.codecutNORMAL.files([relativeFilePath], true);
          } else {
            try {
              Helpers.removeFileIfExists(destinationFilePath);
            } catch (error) {
              Helpers.warn(`Error during removing file ${destinationFilePath}`);
            }
          }
        } else {
          if (fse.existsSync(absoluteFilePath)) {
            //#region mkdirp basedir
            if (!fse.existsSync(path.dirname(destinationFilePath))) {
              fse.mkdirpSync(path.dirname(destinationFilePath));
            }
            //#endregion

            //#region remove deist if directory
            if (
              fse.existsSync(destinationFilePath) &&
              fse.lstatSync(destinationFilePath).isDirectory()
            ) {
              fse.removeSync(destinationFilePath);
            }
            //#endregion

            if (websql) {
              this.codecutWEBSQL.files([relativeFilePath]);
            } else {
              this.codecutNORMAL.files([relativeFilePath]);
            }
          }
        }
      }
    })();
    //#endregion

    //#endregion
  }
  //#endregion

  //#endregion
}
