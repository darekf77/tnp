//#region imports
import { IncCompiler } from 'incremental-compiler/src';
import { config } from 'tnp-config/src';
import {
  crossPlatformPath,
  fse,
  path,
  _,
  CoreModels,
  chalk,
} from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
//#endregion

export class BackendCompilation extends IncCompiler.Base {
  //#region static
  static counter = 1;
  //#endregion

  //#region fields & getters
  public isEnableCompilation = true;
  protected compilerName = 'Backend Compiler';
  get tsConfigName() {
    return 'tsconfig.json';
  }
  get tsConfigBrowserName() {
    return 'tsconfig.browser.json';
  }

  get cwd() {
    //#region @backendFunc
    return this.cwdProject.location;
    //#endregion
  }

  public get absPathTmpSrcDistFolder() {
    //#region @backendFunc
    if (_.isString(this.srcFolder) && _.isString(this.cwd)) {
      return crossPlatformPath(path.join(this.cwd, this.srcFolder));
    }
    //#endregion
  }
  //#endregion

  //#region constructor
  //#region @backend
  constructor(
    public buildOptions: EnvOptions,
    public isWatchBuild: boolean,
    /**
     * Output folder
     * Ex. dist
     */
    public outFolder: CoreModels.OutFolder,
    /**
     * Source location
     * Ex. src | components
     */
    public srcFolder: string,
    /**
     * Current cwd same for browser and backend
     * but browser project has own compilation folder
     * Ex. /home/username/project/myproject
     */
    public cwdProject: Project,
    public websql: boolean,
  ) {
    super({
      folderPath: crossPlatformPath([cwdProject.location, srcFolder]),
      notifyOnFileUnlink: true,
      followSymlinks: true,
      taskName: 'BackendCompilation',
    });
  }
  //#endregion
  //#endregion

  //#region methods / sync action
  async syncAction(filesPathes: string[]) {
    //#region @backendFunc
    const outDistPath = crossPlatformPath(path.join(this.cwd, this.outFolder));
    // Helpers.System.Operations.tryRemoveDir(outDistPath)
    if (!fse.existsSync(outDistPath)) {
      fse.mkdirpSync(outDistPath);
    }
    await this.libCompilation(this.buildOptions, {
      cwd: this.cwd,
      watch: this.isWatchBuild,
      outDir: this.outFolder as any,
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
      watch = false,
      outDir,
      generateDeclarations = false,
      tsExe = 'npm-run tsc',
      diagnostics = false,
    }: CoreModels.TscCompileOptions,
  ) {
    //#region @backendFunc
    if (!this.isEnableCompilation) {
      Helpers.log(
        `Compilation disabled for ${_.startCase(BackendCompilation.name)}`,
      );
      return;
    }
    // let id = BackendCompilation.counter++;

    const project = this.cwdProject.ins.nearestTo(cwd) as Project;

    //#region prepare params
    const paramsNoWatch = [
      outDir ? ` --outDir ${outDir} ` : '',
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
    let cmd = (specificTsconfig?: string) => {
      let commandJs, commandMaps, commandJsOrganizationInitial, commandDts;
      const nocutsrcFolder = `${project.location}/${outDir}-nocutsrc`;
      // commandJs = `${tsExe} -d false  --mapRoot ${nocutsrc} ${params.join(' ')} `
      //   + (specificTsconfig ? `--project ${specificTsconfig}` : '');

      commandJs =
        `${tsExe} --mapRoot ${nocutsrcFolder} ${params.join(' ')} ` +
        (specificTsconfig ? `--project ${specificTsconfig}` : '');

      commandJsOrganizationInitial =
        `${tsExe} --mapRoot ${nocutsrcFolder} ${paramsNoWatch.join(' ')} ` +
        (specificTsconfig ? `--project ${specificTsconfig}` : '');

      // commandDts = `${tsExe} --emitDeclarationOnly  ${params.join(' ')}`;
      params[1] = ` --outDir ${nocutsrcFolder}`;
      commandMaps = `${tsExe} ${params.join(' ').replace('--noEmitOnError true', '--noEmitOnError false')} `;
      return {
        commandJs,
        commandMaps,
        commandJsOrganizationInitial,
        // commandDts
      };
    };
    //#endregion

    let tscCommands = {} as {
      commandJs: string;
      commandJsOrganizationInitial: string;
      commandMaps: string;
    };

    const tsconfigBackendPath = crossPlatformPath(
      project.pathFor(`tsconfig.backend.${outDir}.json`),
    );
    tscCommands = cmd(tsconfigBackendPath);

    await this.buildStandardLibVer(buildOptions, {
      watch,
      ...tscCommands,
      generateDeclarations,
      cwd,
      project,
      outDir,
    });
    //#endregion
  }

  //#endregion

  //#region methods / build standar lib version
  protected async buildStandardLibVer(
    buildOptions: EnvOptions,
    options: {
      watch: boolean;
      commandJs: string;
      commandMaps: string;
      commandJsOrganizationInitial: string;
      generateDeclarations: boolean;
      cwd: string;
      project: Project;
      outDir: 'dist';
    },
  ) {
    //#region @backendFunc
    let { commandJs, commandMaps, cwd, project, outDir, watch } = options;

    // console.log({ childrenNames });

    const isStandalone = project.framework.isStandaloneProject;
    const parent = project.parent;

    Helpers.info(`

Starting backend TypeScript build....

    `);
    const additionalReplace = (line: string) => {
      const [tmpSource, dashOrFile, childName] = line.split('/');
      // console.log({ tmpSource, dashOrFile, childName });
      if (tmpSource === 'tmp-source-dist' && dashOrFile === '-') {
        return line.replace(
          `tmp-source-dist/-/${childName}/`,
          `${childName}/src/`,
        );
      }

      if (!parent) {
        return line;
      }
      const beforeModule = crossPlatformPath(
        path.join(
          parent.location,
          outDir,
          parent.name,
          project.name,
          `tmp-source-${outDir}/libs`,
        ),
      );

      if (line.search(beforeModule)) {
        const [__, filepath] = line.split(`'`);
        // console.log({
        //   filepath
        // })
        if (filepath) {
          const moduleName = _.first(
            filepath.replace(beforeModule + '/', '').split('/'),
          );
          if (moduleName) {
            return line.replace(
              crossPlatformPath(path.join(beforeModule, moduleName)),
              `./${path.join(moduleName, 'src/lib')}`,
            );
          }
        }
      }

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
          if (line.startsWith(`tmp-source-${outDir}/`)) {
            return additionalReplace(
              line.replace(`tmp-source-${outDir}/`, `./src/`),
            );
          }

          return additionalReplace(
            line.replace(`../tmp-source-${outDir}/`, `./src/`),
          );
        } else {
          line = line.trimLeft();
          // console.log({ line })
          if (line.startsWith('./src/libs/')) {
            const [__, ___, moduleName] = line.split('/');
            return additionalReplace(
              line.replace(
                `./src/libs/${moduleName}/`,
                `./${moduleName}/src/lib/`,
              ),
            );
          } else if (line.startsWith(`../tmp-source-${outDir}/libs/`)) {
            const [__, ___, ____, moduleName] = line.split('/');
            return additionalReplace(
              line.replace(
                `../tmp-source-${outDir}/libs/${moduleName}/`,
                `./${moduleName}/src/lib/`,
              ),
            );
          } else if (line.startsWith(`../tmp-source-${outDir}/`)) {
            return additionalReplace(
              line.replace(
                `../tmp-source-${outDir}/`,
                `./${project.name}/src/`,
              ),
            );
          } else if (line.startsWith(`tmp-source-${outDir}/libs/`)) {
            const [__, ___, moduleName] = line.split('/');
            return additionalReplace(
              line.replace(
                `tmp-source-${outDir}/libs/${moduleName}/`,
                `./${moduleName}/src/lib/`,
              ),
            );
          } else {
            return additionalReplace(
              line.replace(`./src/`, `./${project.name}/src/lib/`),
            );
          }
        }
      },
      resolvePromiseMsg: {
        stdout: ['Found 0 errors. Watching for file changes'],
      },
    });

    Helpers.logInfo(`* Typescirpt compilation first part done`);

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
    Helpers.log(
      `* Typescirpt compilation second part done (${outDir}  build). `,
    );
    Helpers.info(`

    Backend Typescirpt build done....

        `);

    if (watch) {
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
