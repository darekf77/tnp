//#region imports
import { IncCompiler } from 'incremental-compiler/src';
import { JSON10 } from 'json10/src';
import { config } from 'tnp-config/src';
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

import { Models } from '../../../../../../../models';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
import { CodeCut } from '../code-cut/code-cut';
import { codeCuttFn } from '../code-cut/cut-fn';

import { BackendCompilation } from './compilation-backend';
//#endregion

export class BrowserCompilation extends BackendCompilation {
  /**
   * @deprecated
   */
  private static instances = {} as { [websql: string]: BrowserCompilation };

  //#region fields & getters
  compilerName = 'Browser standard compiler';
  public codecut: CodeCut;

  /**
   * ex: <project-path>/tmp-src-dist
   */
  public get absPathTmpSrcDistFolder() {
    //#region @backendFunc
    if (_.isString(this.sourceOutBrowser) && _.isString(this.cwd)) {
      return crossPlatformPath(path.join(this.cwd, this.sourceOutBrowser));
    }
    //#endregion
  }
  get customCompilerName() {
    //#region @backendFunc
    return `Browser compilation`;
    //#endregion
  }

  //#endregion

  //#region constructor
  //#region @backend
  constructor(
    public project: Project,
    /**
     * tmp-src-for-(dist)-browser
     */
    protected sourceOutBrowser: string,
    /**
     * browser-for-(dist|projectName)
     */
    outFolder: CoreModels.OutFolder,
    location: string,
    public backendOutFolder: string,
    public buildOptions: EnvOptions,
  ) {
    super(buildOptions, outFolder, location, project);
    BrowserCompilation.instances[String(!!buildOptions.build.websql)] = this;
    this.compilerName = this.customCompilerName;

    Helpers.log(
      `[BrowserCompilation][constructor]

    compilationProject.genericName: ${project?.genericName}
    compilationProject.type: ${project?.type}
    ENV?: ${!!this.buildOptions}

    cwd: ${this.project.location}
    sourceOut: ${sourceOutBrowser}
    location: ${location}
    backendOut: ${backendOutFolder}

    `,
      1,
    );

    Helpers.log(`\n\nbuildOptions: ${JSON10.stringify(buildOptions)}\n\n`, 2);

    // console.log('SOURCE OUT', sourceOut)
    // console.log('OUT FOLDER', outFolder)
    // console.log('LOCATION', location)
    // console.log('MODULE NAME', moduleName)
    // console.log(Helpers.terminalLine())
    // this.project = cwdProject.ins.From(this.cwd) as Project;
  }
  //#endregion
  //#endregion

  //#region methods

  //#region methods / sync action
  async syncAction(absFilesFromSrc: string[]) {
    //#region @backendFunc
    Helpers.removeFolderIfExists(this.absPathTmpSrcDistFolder);
    Helpers.mkdirp(this.absPathTmpSrcDistFolder);

    const tmpSource = this.absPathTmpSrcDistFolder.replace(
      'tmp-src-',
      'tmp-source-',
    );

    Helpers.removeFolderIfExists(tmpSource);
    Helpers.mkdirp(tmpSource);

    this.initCodeCut();
    this.project.quickFixes.recreateTempSourceNecessaryFilesForTesting();

    const filesBase = crossPlatformPath(path.join(this.cwd, this.srcFolder));
    const relativePathesToProcess = absFilesFromSrc.map(absFilePath => {
      return absFilePath.replace(`${filesBase}/`, '');
    });

    this.codecut.files(relativePathesToProcess);
    // process.exit(0)
    //#endregion
  }
  //#endregion

  //#region methods / async action
  async asyncAction(event: IncCompiler.Change) {
    //#region @backendFunc
    // console.log('ASYNC ACTION CODE CUT ', event.fileAbsolutePath);
    if (!this.codecut) {
      // TODO QUICK - but I thin it make sense => there is not backedn compilation for websql
      return;
    }

    if (!this.buildOptions.build.websql) {
      // TODO QUICK_FIX QUICK_DIRTY_FIX
      const websqlInstance =
        BrowserCompilation.instances[String(!this.buildOptions.build.websql)];
      await websqlInstance.asyncAction(event);
    }

    const absoluteFilePath = crossPlatformPath(event.fileAbsolutePath);
    const relativeFilePath = crossPlatformPath(
      absoluteFilePath.replace(
        `${crossPlatformPath(path.join(this.cwd, this.srcFolder))}/`,
        '',
      ),
    );
    if (path.basename(relativeFilePath) === '.DS_Store') {
      return;
    }

    const destinationFilePath = crossPlatformPath(
      path.join(this.cwd, this.sourceOutBrowser, relativeFilePath),
    );
    const destinationFileBackendPath = crossPlatformPath(
      path.join(
        this.cwd,
        this.sourceOutBrowser.replace('tmp-src', 'tmp-source'),
        relativeFilePath,
      ),
    );

    if (event.eventName === 'unlinkDir') {
      Helpers.removeFolderIfExists(destinationFilePath);
      Helpers.removeFolderIfExists(destinationFileBackendPath);
    } else {
      if (event.eventName === 'unlink') {
        if (relativeFilePath.startsWith(`${config.folder.assets}/`)) {
          this.codecut.files([relativeFilePath], true);
        } else {
          Helpers.removeFileIfExists(destinationFilePath);
          Helpers.removeFileIfExists(destinationFileBackendPath);
        }
      } else {
        if (fse.existsSync(absoluteFilePath)) {
          //#region mkdirp basedir
          if (!fse.existsSync(path.dirname(destinationFilePath))) {
            fse.mkdirpSync(path.dirname(destinationFilePath));
          }
          if (!fse.existsSync(path.dirname(destinationFileBackendPath))) {
            fse.mkdirpSync(path.dirname(destinationFileBackendPath));
          }
          //#endregion

          //#region remove deist if directory
          if (
            fse.existsSync(destinationFilePath) &&
            fse.lstatSync(destinationFilePath).isDirectory()
          ) {
            fse.removeSync(destinationFilePath);
          }
          if (
            fse.existsSync(destinationFileBackendPath) &&
            fse.lstatSync(destinationFileBackendPath).isDirectory()
          ) {
            fse.removeSync(destinationFileBackendPath);
          }
          //#endregion

          this.codecut.files([relativeFilePath]);
        }
      }
    }
    //#endregion
  }
  //#endregion

  //#region methods / init code cut
  initCodeCut() {
    //#region @backendFunc
    // console.log('inside')

    const compilationProject: Project = this.project;
    if (!compilationProject) {
      return;
    }
    // console.log('here1')

    let project: Project = this.project;
    // if (env) {
    //   project = this.cwdProject.ins.From(env.currentProjectLocation);
    // }

    if (compilationProject.framework.isStandaloneProject) {
      project = compilationProject;
    }

    const replacements = [];

    replacements.push([TAGS.BACKEND_FUNC, `return (void 0);`]);
    replacements.push(TAGS.BACKEND as any);

    if (!this.buildOptions.build.websql) {
      replacements.push(TAGS.WEBSQL_ONLY as any);
      replacements.push([TAGS.WEBSQL_FUNC, `return (void 0);`]);
      replacements.push(TAGS.WEBSQL as any);
    }

    replacements.push([TAGS.CUT_CODE_IF_TRUE, codeCuttFn(true)]);
    replacements.push([TAGS.CUT_CODE_IF_FALSE, codeCuttFn(false)]);

    this.codecut = new CodeCut(
      this.absPathTmpSrcDistFolder,
      {
        replacements: replacements.filter(f => !!f),
        env: this.buildOptions.clone(),
      },
      project,
      compilationProject,
      this.buildOptions,
      this.sourceOutBrowser,
    );
    //#endregion
  }
  //#endregion

  //#endregion
}
