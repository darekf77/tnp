//#region imports
import {
  config,
  CoreModels,
  GlobalStorage,
  startAsync,
  taonActionFromParent,
  tnpPackageName,
} from 'tnp-core/src';
import { crossPlatformPath, fse, _, chalk } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import {
  COMPILATION_COMPLETE_TSC,
  COMPILATION_WATCHING_STARTED,
  distMainProject,
  distNoCutSrcMainProject,
  libEsm,
  prodSuffix,
  srcMainProject,
  tmpSourceDist,
  tsconfigBackendDistJson,
  tsconfigBackendDistJson_PROD,
} from '../../../../../../../constants';
import { Models } from '../../../../../../../models';
import { EnvOptions } from '../../../../../../../options';
import type { Project } from '../../../../../project';
import { DevMode } from '../../../../../taon-worker/dev-mode/dev-mode.models';
import { ProductionBuild } from '../../../../__helpers__/production-build';
import { TaonBuildObserver } from '../../taon-build-observer';
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
    private taonBuildObserver: TaonBuildObserver,
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

    const tsconfigBackendPath = crossPlatformPath(
      this.project.pathFor(
        buildOptions.build.prod
          ? tsconfigBackendDistJson_PROD
          : tsconfigBackendDistJson,
      ),
    );

    let nocutsrcFolder = this.project.pathFor(
      distNoCutSrcMainProject + (buildOptions.build.prod ? prodSuffix : ''),
    );

    const paramsJS = {
      mapRoot: ` --mapRoot ${nocutsrcFolder} `,
      project: `--project ${tsconfigBackendPath}`,
      ...paramasCommon,
    };
    const paramsMaps = { ...paramasCommon };
    paramsMaps.outDir = ` --outDir ${nocutsrcFolder}`;
    paramsMaps.noEmitOnError = !watch ? ' --noEmitOnError false ' : '';

    const commandJs = `${tsExe} ${Object.values(paramsJS).join(' ')}  `;
    const commandMaps = `${tsExe} ${Object.values(paramsMaps).join(' ')} `;
    delete paramsJS.outDir;
    const commandJsEsm = `${tsExe} ${Object.values(paramsJS).join(' ').replace('.backend.', '.backend-esm.')}  `;

    const taonActionFromParentName = GlobalStorage.get(taonActionFromParent);

    Helpers.getIsVerboseMode() &&
      console.log({
        commandJs,
        commandMaps,
        commandJsEsm,
      });

    Helpers.info(`

    [compilation-backend] Starting (${
      buildOptions.build.watch ? 'watch' : 'normal'
    }) backend TypeScript build....

    `);

    const cwd = this.project.location;

    await this.project.nodeModules.makeSureInstalled();

    //#region output line replace
    const additionalReplace = (line: string) => {
      // nothing to replace for now
      if (taonActionFromParentName && line.includes('./src/')) {
        line = line.replace('./src/', `./${taonActionFromParentName}/src/`);
      }

      if (line.includes('../src/lib/')) {
        line = line.replace('../src/lib/', './src/lib/');
      }

      return line;
    };

    const outputLineReplace = (line: string): string => {
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
          .replace(`../${tmpSourceDist + prodSuffix}/`, `./${srcMainProject}/`)
          .replace(`../${tmpSourceDist}/`, `./${srcMainProject}/`),
      );
      //#endregion
    };

    //#endregion

    //#region compilation commonjs backend

    await startAsync(commandJs, cwd, {
      uniqueName: 'tsc cjs',
      prefix: true,
      similarProcessKey: 'tsc',
      resolvePromiseMsgCallback_anystd: () => {
        if (this.project.watcher.isTaonLightWatcherMode) {
          this.taonBuildObserver.backendCjsState.set(
            DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
          );
        }
      },
      onExitCallback: async (code, resolve, reject) =>
        this.project.framework.handlExitError(
          buildOptions,
          code,
          resolve,
          reject,
          'backend-cjs',
          `Typescript compilation (backend commonjs) error`,
        ),
      outputLineReplace: (line: string) => outputLineReplace(line),
      resolvePromiseMsg_stdout: [COMPILATION_COMPLETE_TSC],
      rebuildOnChange:
        this.project.watcher.rebuildTriggerWatcher('backend-cjs'),
    });
    //#endregion

    Helpers.logInfo(`* Typescript compilation first part done (cjs)`);

    await this.project.nodeModules.makeSureInstalled();

    //#region compilation esm backend
    if (!buildOptions.build.prod) {
      // in prod normal build is esm - not need for this
      await startAsync(commandJsEsm, cwd, {
        uniqueName: 'tsc esm',
        prefix: true,
        similarProcessKey: 'tsc',
        resolvePromiseMsgCallback_anystd: () => {
          if (this.project.watcher.isTaonLightWatcherMode) {
            this.taonBuildObserver.backendEsmState.set(
              DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
            );
          }
        },
        onExitCallback: async (code, resolve, reject) =>
          this.project.framework.handlExitError(
            buildOptions,
            code,
            resolve,
            reject,
            'backend-esm',
            `Typescript compilation (backend esm) error`,
          ),
        outputLineReplace: (line: string) => outputLineReplace(line),
        resolvePromiseMsg_stdout: [COMPILATION_COMPLETE_TSC],
        rebuildOnChange:
          this.project.watcher.rebuildTriggerWatcher('backend-esm'),
      });
    }
    //#endregion

    Helpers.logInfo(`* Typescript compilation second part done (esm)`);

    await this.project.nodeModules.makeSureInstalled();

    //#region compilation js maps backend
    await startAsync(commandMaps, cwd, {
      uniqueName: 'tsc js maps',
      similarProcessKey: 'tsc',
      prefix: true,
      hideOutput_stderr: true,
      hideOutput_stdout: true,
      resolvePromiseMsgCallback_anystd: () => {
        if (this.project.watcher.isTaonLightWatcherMode) {
          this.taonBuildObserver.backendJsMapsState.set(
            DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
          );
        }
      },
      onExitCallback: async (code, resolve, reject) => {
        resolve(); // TODO this is throwing tsocnfig errpr
      },
      resolvePromiseMsg_stdout: [COMPILATION_WATCHING_STARTED],
      rebuildOnChange:
        this.project.watcher.rebuildTriggerWatcher('backend-js-maps'),
    });
    //#endregion

    Helpers.logInfo(`* Typescript compilation thrid part done (js maps)`);
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
