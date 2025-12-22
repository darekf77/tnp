//#region imports
import { config, folderName } from 'tnp-core/src';
import {
  crossPlatformPath,
  fse,
  path,
  _,
  CoreModels,
  chalk,
} from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import {
  distMainProject,
  distNoCutSrcMainProject,
  libFromSrc,
  libs,
  srcMainProject,
  tmpSourceDist,
  tsconfigBackendDistJson,
} from '../../../../../../../constants';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
//#endregion

export class BackendCompilation {

  //#region static
  static counter = 1;
  //#endregion

  //#region fields & getters
  public isEnableCompilation = true;

  protected compilerName = 'Backend Compiler';

  //#endregion

  //#region constructor

  //#region @backend
  constructor(
    public buildOptions: EnvOptions,
    /**
     * Source location
     * Ex. src | components
     */
    public srcFolder: string,
    public project: Project,
  ) {}
  //#endregion

  //#endregion

  /**
   * @deprecated remove
   */
  async start({ taskName }): Promise<void> {

    //#region @backendFunc
    await this.syncAction(
      Helpers.getFilesFrom([this.project.location, this.srcFolder], {
        recursive: true,
        followSymlinks: false,
      }),
    );
    //#endregion

  }

  /**
   * @deprecated remove
   */
  async startAndWatch(options?: any): Promise<void> {

    //#region @backendFunc
    await this.start(options);
    //#endregion

  }

  //#region methods / sync action
  async syncAction(filesPathes: string[]) {

    //#region @backendFunc
    const outDistPath = this.project.pathFor(distMainProject);

    // Helpers.System.Operations.tryRemoveDir(outDistPath)
    try {
      fse.unlinkSync(outDistPath);
    } catch (error) {}
    if (!fse.existsSync(outDistPath)) {
      fse.mkdirpSync(outDistPath);
    }
    await this.libCompilation(this.buildOptions, {
      cwd: this.project.location,
      generateDeclarations: true,
    });
    //#endregion

  }
  //#endregion

  //#region methods / lib compilation
  async libCompilation(
    buildOptions: EnvOptions,
    {
      cwd,
      generateDeclarations = false,
      tsExe = 'npm-run tsc',
      diagnostics = false,
    }: CoreModels.TscCompileOptions,
  ) {

    //#region @backendFunc
    const watch = buildOptions.build.watch;
    if (!this.isEnableCompilation) {
      Helpers.log(
        `Compilation disabled for ${_.startCase(BackendCompilation.name)}`,
      );
      return;
    }
    // let id = BackendCompilation.counter++;

    const project = this.project.ins.nearestTo(cwd) as Project;

    //#region prepare params
    const paramsNoWatch = [
      ` --outDir ${distMainProject} `,
      !watch ? ' --noEmitOnError true ' : '',
      diagnostics ? ' --extendedDiagnostics ' : '',
      ` --preserveWatchOutput `,
    ];

    const params = [
      watch ? ' -w ' : '',
      ...paramsNoWatch,
      // hideErrors ? '' : ` --preserveWatchOutput `,
      // hideErrors ? ' --skipLibCheck true --noEmit true ' : '',
    ];
    //#endregion

    //#region cmd
    let prepareCmd = (specificTsconfig?: string) => {
      let commandJs, commandMaps, commandDts;
      const nocutsrcFolder = `${project.location}/${distNoCutSrcMainProject}`;
      // commandJs = `${tsExe} -d false  --mapRoot ${nocutsrc} ${params.join(' ')} `
      //   + (specificTsconfig ? `--project ${specificTsconfig}` : '');

      commandJs =
        `${tsExe} --mapRoot ${nocutsrcFolder} ${params.join(' ')} ` +
        (specificTsconfig ? `--project ${specificTsconfig}` : '');

      // commandDts = `${tsExe} --emitDeclarationOnly  ${params.join(' ')}`;
      params[1] = ` --outDir ${nocutsrcFolder}`;
      commandMaps = `${tsExe} ${params
        .join(' ')
        .replace('--noEmitOnError true', '--noEmitOnError false')} `;
      return {
        commandJs,
        commandMaps,
        // commandDts
      };
    };
    //#endregion

    let tscCommands = {} as {
      commandJs: string;
      commandMaps: string;
    };

    const tsconfigBackendPath = crossPlatformPath(
      project.pathFor(tsconfigBackendDistJson),
    );
    tscCommands = prepareCmd(tsconfigBackendPath);

    await this.buildStandardLibVer(buildOptions, {
      ...tscCommands,
      generateDeclarations,
      cwd,
      project,
    });
    //#endregion

  }

  //#endregion

  //#region methods / build standard lib version
  protected async buildStandardLibVer(
    buildOptions: EnvOptions,
    options: {
      commandJs: string;
      commandMaps: string;
      generateDeclarations: boolean;
      cwd: string;
      project: Project;
    },
  ): Promise<void> {

    //#region @backendFunc

    let { commandJs, commandMaps, cwd, project } = options;

    // console.log({ commandMaps, commandJs, cwd, outDir, watch });
    // console.log({ childrenNames });

    const isStandalone = project.framework.isStandaloneProject;
    const parent = project.parent;

    Helpers.info(`

Starting (${
      buildOptions.build.watch ? 'watch' : 'normal'
    }) backend TypeScript build....

    `);
    const additionalReplace = (line: string) => {
      // nothing to replace for now
      return line;
    };

    await Helpers.execute(commandJs, cwd, {
      similarProcessKey: 'tsc',
      exitOnErrorCallback: async code => {
        if (buildOptions.release.releaseType) {
          throw 'Typescript compilation (backend)';
        } else {
          Helpers.error(
            `[${config.frameworkName}] Typescript compilation (backend) error (code=${code})`,
            false,
            true,
          );
        }
      },
      outputLineReplace: (line: string) => {
        if (isStandalone) {
          if (line.startsWith(`${tmpSourceDist}/`)) {
            return additionalReplace(
              line.replace(`${tmpSourceDist}/`, `./${srcMainProject}/`),
            );
          }

          return additionalReplace(
            line.replace(`../${tmpSourceDist}/`, `./${srcMainProject}/`),
          );
        } else {
          line = line.trimLeft();
          // console.log({ line })
          if (line.startsWith(`./${srcMainProject}/${libs}/`)) {
            const [__, ___, moduleName] = line.split('/');
            return additionalReplace(
              line.replace(
                `./${srcMainProject}/${libs}/${moduleName}/`,
                `./${moduleName}/${srcMainProject}/${libFromSrc}/`,
              ),
            );
          } else if (line.startsWith(`../${tmpSourceDist}/${libs}/`)) {
            const [__, ___, ____, moduleName] = line.split('/');
            return additionalReplace(
              line.replace(
                `../${tmpSourceDist}/${libs}/${moduleName}/`,
                `./${moduleName}/${srcMainProject}/${libFromSrc}/`,
              ),
            );
          } else if (line.startsWith(`../${tmpSourceDist}/`)) {
            return additionalReplace(
              line.replace(`../${tmpSourceDist}/`, `./${project.name}/src/`),
            );
          } else if (line.startsWith(`${tmpSourceDist}/${libs}/`)) {
            const [__, ___, moduleName] = line.split('/');
            return additionalReplace(
              line.replace(
                `${tmpSourceDist}/${libs}/${moduleName}/`,
                `./${moduleName}/${srcMainProject}/${libFromSrc}/`,
              ),
            );
          } else {
            return additionalReplace(
              line.replace(
                `./${srcMainProject}/`,
                `./${project.name}/${srcMainProject}/${libFromSrc}/`,
              ),
            );
          }
        }
      },
      resolvePromiseMsg: {
        stdout: ['Found 0 errors. Watching for file changes'],
      },
    });

    Helpers.logInfo(`* Typescript compilation first part done`);

    await Helpers.execute(commandMaps, cwd, {
      similarProcessKey: 'tsc',
      hideOutput: {
        stderr: true,
        stdout: true,
        acceptAllExitCodeAsSuccess: true,
      },
      resolvePromiseMsg: {
        stdout: ['Watching for file changes.'],
      },
    });
    Helpers.logInfo(`* Typescript compilation second part done`);
    Helpers.info(`

    Backend TypeScript build done....

        `);

    if (buildOptions.build.watch) {
      // console.log(Helpers.terminalLine());
      Helpers.info(`

    ${chalk.bold('YOU CAN ATTACH YOUR CODE DEBUGGER NOW')}

    `);
      // console.log(Helpers.terminalLine());
    }
    //#endregion

  }
  //#endregion

}