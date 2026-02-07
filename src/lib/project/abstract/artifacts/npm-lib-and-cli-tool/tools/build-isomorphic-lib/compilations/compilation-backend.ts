//#region imports
import { config } from 'tnp-core/src';
import { crossPlatformPath, fse, _, chalk } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import {
  distMainProject,
  distNoCutSrcMainProject,
  prodSuffix,
  srcMainProject,
  tmpSourceDist,
  tsconfigBackendDistJson,
  tsconfigBackendDistJson_PROD,
} from '../../../../../../../constants';
import { Models } from '../../../../../../../models';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
import { ProductionBuild } from '../../../../__helpers__/production-build';
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
    public project: Project,
  ) {}
  //#endregion

  //#endregion

  async runTask(): Promise<void> {
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
      generateDeclarations: true,
    });
    //#endregion
  }

  //#region methods / lib compilation
  async libCompilation(
    buildOptions: EnvOptions,
    {
      generateDeclarations = false,
      tsExe = 'npm-run tsc',
      diagnostics = false,
    }: Models.TscCompileOptions,
  ) {
    //#region @backendFunc
    const watch = buildOptions.build.watch;

    if (!this.isEnableCompilation) {
      Helpers.log(
        `Compilation disabled for ${_.startCase(BackendCompilation.name)}`,
      );
      return;
    }
    const paramasCommon = {
      watch: watch ? ' -w ' : '',
      outDir: ` --outDir ${distMainProject + (buildOptions.build.prod ? prodSuffix : '')} `,
      noEmitOnError: !watch ? ' --noEmitOnError true ' : '',
      extendedDiagnostics: diagnostics ? ' --extendedDiagnostics ' : '',
      preserveWatchOutput: ` --preserveWatchOutput `,
    };

    //#region cmd
    let prepareCmd = (specificTsconfig: string) => {
      let commandJs, commandMaps;
      let nocutsrcFolder = this.project.pathFor(
        distNoCutSrcMainProject + (buildOptions.build.prod ? prodSuffix : ''),
      );

      const paramsJS = {
        mapRoot: ` --mapRoot ${nocutsrcFolder} `,
        project: `--project ${specificTsconfig}`,
        ...paramasCommon,
      };
      const paramsMaps = { ...paramasCommon };
      paramsMaps.outDir = ` --outDir ${nocutsrcFolder}`;
      paramsMaps.noEmitOnError = !watch ? ' --noEmitOnError false ' : '';

      commandJs = `${tsExe} ${Object.values(paramsJS).join(' ')}  `;
      commandMaps = `${tsExe} ${Object.values(paramsMaps).join(' ')} `;
      return {
        commandJs, // use tsconfig.backend.dist<.prod>.json
        commandMaps, // uses main tsconfig.json to from /src directly everything
        // commandDts
      };
    };
    //#endregion

    const tsconfigBackendPath = crossPlatformPath(
      this.project.pathFor(
        buildOptions.build.prod
          ? tsconfigBackendDistJson_PROD
          : tsconfigBackendDistJson,
      ),
    );

    await this.buildStandardLibVer(buildOptions, {
      ...prepareCmd(tsconfigBackendPath),
      generateDeclarations,
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
    },
  ): Promise<void> {
    //#region @backendFunc

    let { commandJs, commandMaps } = options;

    Helpers.getIsVerboseMode() &&
      console.log({
        commandJs,
        commandMaps,
      });

    Helpers.info(`

Starting (${
      buildOptions.build.watch ? 'watch' : 'normal'
    }) backend TypeScript build....

    `);
    const additionalReplace = (line: string) => {
      // nothing to replace for now
      return line;
    };

    await this.project.nodeModules.makeSureInstalled();
    const cwd = this.project.location;
    await Helpers.execute(commandJs, cwd, {
      similarProcessKey: 'tsc',
      exitOnErrorCallback: async code => {
        //#region handle error
        if (buildOptions.release.releaseType) {
          throw 'Typescript compilation (backend)';
        } else {
          Helpers.error(
            `[${config.frameworkName}] Typescript compilation (backend) error (code=${code})`,
            false,
            true,
          );
        }
        //#endregion
      },
      outputLineReplace: (line: string) => {
        //#region outputs replacement
        if (line.startsWith(`${tmpSourceDist + prodSuffix}/`)) {
          return additionalReplace(
            line.replace(
              `${tmpSourceDist + prodSuffix}/`,
              `./${srcMainProject}/`,
            ),
          );
        }

        if (line.startsWith(`${tmpSourceDist}/`)) {
          return additionalReplace(
            line.replace(`${tmpSourceDist}/`, `./${srcMainProject}/`),
          );
        }

        return additionalReplace(
          line
            .replace(
              `../${tmpSourceDist + prodSuffix}/`,
              `./${srcMainProject}/`,
            )
            .replace(`../${tmpSourceDist}/`, `./${srcMainProject}/`),
        );
        //#endregion
      },
      resolvePromiseMsg: {
        stdout: ['Found 0 errors. Watching for file changes'],
      },
    });

    Helpers.logInfo(`* Typescript compilation first part done`);

    await this.project.nodeModules.makeSureInstalled();

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

    // Helpers.writeJson(
    //   [
    //     cwd,
    //     this.buildOptions.build.prod
    //       ? `${distMainProject}${prodSuffix}`
    //       : distMainProject,
    //     libFromCompiledDist,
    //     packageJsonLibDist,
    //   ],
    //   {
    //     name: `${this.project.nameForNpmPackage}/${
    //       libFromCompiledDist + this.buildOptions.build.prod ? prodSuffix : ''
    //     }`,
    //     type: 'module',
    //     exports: {
    //       '.': './index.js',
    //     },
    //   },
    // );

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
