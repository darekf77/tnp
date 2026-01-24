//#region imports
import { BaseClientCompiler, ChangeOfFile } from 'incremental-compiler/src';
import { JSON10 } from 'json10/src';
import { config, extForSassLikeFiles } from 'tnp-core/src';
import { TAGS } from 'tnp-core/src';
import {
  _,
  path,
  fse,
  rimraf,
  crossPlatformPath,
  CoreModels,
} from 'tnp-core/src';
import { Helpers, HelpersTaon } from 'tnp-helpers/src';

import {
  assetsFromTempSrc,
  distMainProject,
  DS_Store,
  prodSuffix,
  tmpSourceDist,
  tmpSrcDist,
  tmpSrcDistWebsql,
} from '../../../../../../../constants';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
import { CodeCut } from '../code-cut/code-cut';
import { codeCuttFn } from '../code-cut/cut-fn';
//#endregion

export class BrowserCompilation extends BaseClientCompiler {
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

  readonly absPathTmpSrcDistFolderWEBSQL: string;

  readonly absPathTmpSrcDistFolderNORMAL: string;

  //#region @backend
  constructor(
    public project: Project,
    /**
     * tmpSrcDist(Websql)
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

    this.absPathTmpSrcDistFolderWEBSQL = crossPlatformPath(
      path.join(
        this.project.location || '',
        tmpSrcDistWebsql + (buildOptions.build.prod ? prodSuffix : ''),
      ),
    );
    this.absPathTmpSrcDistFolderNORMAL = crossPlatformPath(
      path.join(
        this.project.location || '',
        tmpSrcDist + (buildOptions.build.prod ? prodSuffix : ''),
      ),
    );
  }
  //#endregion

  //#endregion

  //#region methods

  //#region methods / sync action
  async syncAction(absFilesFromSrc: string[]) {
    //#region @backendFunc
    const isProd = this.buildOptions.build.prod;

    //#region tags to cut
    const tagsNormal = [
      [TAGS.BACKEND_FUNC, `return (void 0);`],
      TAGS.BACKEND as any,
      TAGS.WEBSQL_ONLY as any,
      [TAGS.WEBSQL_FUNC, `return (void 0);`],
      TAGS.WEBSQL as any,
      [TAGS.CUT_CODE_IF_TRUE, codeCuttFn(true)],
      [TAGS.CUT_CODE_IF_FALSE, codeCuttFn(false)],
    ].filter(f => !!f);

    const tagsWebsql = [
      [TAGS.BACKEND_FUNC, `return (void 0);`],
      TAGS.BACKEND as any,
      [TAGS.CUT_CODE_IF_TRUE, codeCuttFn(true)],
      [TAGS.CUT_CODE_IF_FALSE, codeCuttFn(false)],
    ].filter(f => !!f);
    //#endregion

    //#region build options for codecut
    const buildOptForNormal = this.buildOptions.clone({
      build: {
        websql: false,
      },
    });

    const buildOptForWebsql = this.buildOptions.clone({
      build: {
        websql: true,
      },
    });

    //#endregion

    //#region codecuts init
    this.codecutNORMAL = new CodeCut(
      this.absPathTmpSrcDistFolderNORMAL,
      {
        replacements: tagsNormal,
        env: buildOptForNormal,
      },
      this.project,
      buildOptForNormal,
    );

    this.codecutWEBSQL = new CodeCut(
      this.absPathTmpSrcDistFolderWEBSQL,
      {
        replacements: tagsWebsql,
        env: buildOptForWebsql,
      },
      this.project,
      buildOptForWebsql,
    );

    //#endregion

    //#region prepare tmp folders
    const tmpSource = this.project.pathFor(
      tmpSourceDist + isProd ? prodSuffix : '',
    );

    Helpers.removeFolderIfExists(this.absPathTmpSrcDistFolderWEBSQL);
    Helpers.removeFolderIfExists(this.absPathTmpSrcDistFolderNORMAL);

    Helpers.mkdirp(this.absPathTmpSrcDistFolderNORMAL);
    Helpers.mkdirp(this.absPathTmpSrcDistFolderWEBSQL);

    Helpers.mkdirp(tmpSource);

    Helpers.removeFolderIfExists(tmpSource);

    //#endregion

    // TODO @LAST fix everywhere _PROD

    this.project.quickFixes.recreateTempSourceNecessaryFilesForTesting(
      this.buildOptions,
    );

    const filesBase = this.project.pathFor(this.srcFolder);

    const relativePathesToProcess = absFilesFromSrc.map(absFilePath => {
      const relativePath = absFilePath.replace(`${filesBase}/`, '');
      const isScssOrSass = extForSassLikeFiles.includes(
        path.extname(path.basename(relativePath)),
      );
      if (isScssOrSass) {
        const destScss = this.sassDestFor(relativePath);
        HelpersTaon.copyFile(absFilePath, destScss);
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
      `${distMainProject}/${path
        .extname(path.basename(relativePath))
        .replace('.', '')}/${relativePath}`,
    );
    return destScss;
    //#endregion
  }

  //#region methods / async action
  async asyncAction(event: ChangeOfFile) {
    if (!this.codecutWEBSQL || !this.codecutNORMAL) {
      // TODO QUICK - but I thin it make sense => there is not backedn compilation for websql
      return;
    }
    this.asyncActionFor(event, false);
    this.asyncActionFor(event, true);
    // PROD NOT ALLOWED IN WATCH MODE
  }

  async asyncActionFor(event: ChangeOfFile, websql: boolean) {
    //#region @backendFunc
    // console.log('ASYNC ACTION CODE CUT ', event.fileAbsolutePath);

    const absoluteFilePath = crossPlatformPath(event.fileAbsolutePath);
    const relativeFilePath = crossPlatformPath(
      absoluteFilePath.replace(
        `${crossPlatformPath(path.join(this.project.location, this.srcFolder))}/`,
        '',
      ),
    );
    if (path.basename(relativeFilePath) === DS_Store) {
      return;
    }

    //#region handle backend & scss files
    if (!websql) {
      //#region backend file
      (() => {
        const destinationFileBackendPath = crossPlatformPath([
          this.project.location,
          tmpSourceDist, // prod not need for async
          relativeFilePath,
        ]);

        if (event.eventName === 'unlinkDir') {
          Helpers.removeFolderIfExists(destinationFileBackendPath);
        } else {
          if (event.eventName === 'unlink') {
            if (relativeFilePath.startsWith(`${assetsFromTempSrc}/`)) {
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
            if (relativeFilePath.startsWith(`${assetsFromTempSrc}/`)) {
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

              HelpersTaon.copyFile(absoluteFilePath, destinationFileScssPath);
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
          websql ? tmpSrcDistWebsql : tmpSrcDist, // prod not need for async
          relativeFilePath,
        ),
      );

      if (event.eventName === 'unlinkDir') {
        Helpers.removeFolderIfExists(destinationFilePath);
      } else {
        if (event.eventName === 'unlink') {
          if (relativeFilePath.startsWith(`${assetsFromTempSrc}/`)) {
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
