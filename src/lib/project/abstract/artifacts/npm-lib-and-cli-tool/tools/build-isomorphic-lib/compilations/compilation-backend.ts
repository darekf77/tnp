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
  TaonCommands,
  tmpSourceDist,
  tsconfigBackendDistJson,
  tsconfigBackendDistJson_PROD,
  tsconfigBackendEsmDistJson,
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

    await this.libCompilation(this.buildOptions);
    //#endregion
  }

  //#region methods / lib compilation
  async libCompilation(buildOptions: EnvOptions): Promise<void> {
    //#region @backendFunc

    if (!this.isEnableCompilation) {
      Helpers.log(
        `Compilation disabled for ${_.startCase(BackendCompilation.name)}`,
      );
      return;
    }

    const isMacOSorWindows =
      process.platform === 'darwin' || process.platform === 'win32';

    const skipLightWeightWatcherFor_CjsESM = !isMacOSorWindows;
    const skipLightWeightWatcherFor_jsMaps = false;

    const tscTool = TaonCommands.NPM_RUN_TSC;
    // this.project.watcher.isTaonLightWatcherMode
    //   ? TaonCommands.NPM_RUN_TSCGO
    //   : TaonCommands.NPM_RUN_TSC;

    let watchModeCjsESM =
      buildOptions.build.watch && !this.project.watcher.isTaonLightWatcherMode;
    if (skipLightWeightWatcherFor_CjsESM) {
      watchModeCjsESM = buildOptions.build.watch;
    }

    let watchModeJsMaps =
      buildOptions.build.watch && !this.project.watcher.isTaonLightWatcherMode;
    if (skipLightWeightWatcherFor_jsMaps) {
      watchModeCjsESM = buildOptions.build.watch;
    }

    const tsconfigBackendCjsPath = crossPlatformPath(
      this.project.pathFor(
        buildOptions.build.prod
          ? tsconfigBackendDistJson_PROD
          : tsconfigBackendDistJson,
      ),
    );

    const tsconfigBackendEsmPath = crossPlatformPath(
      this.project.pathFor(tsconfigBackendEsmDistJson),
    );

    const nocutsrcFolder = this.project.pathFor(
      distNoCutSrcMainProject + (buildOptions.build.prod ? prodSuffix : ''),
    );

    const common = ` --preserveWatchOutput  `;
    const commandCjs =
      `${tscTool} --outDir ${distMainProject + (buildOptions.build.prod ? prodSuffix : '')}  ` +
      ` --project ${tsconfigBackendCjsPath}  ${watchModeCjsESM ? '-w' : ''}  ${common}  ` +
      ` --mapRoot ${nocutsrcFolder} `;
    const commandJsEsm =
      `${tscTool}  ` +
      `  --project ${tsconfigBackendEsmPath}  ${watchModeCjsESM ? '-w' : ''}  ${common} ` +
      ` --mapRoot ${nocutsrcFolder} `;
    const commandMaps =
      `${tscTool} --outDir ${nocutsrcFolder} ${watchModeJsMaps ? '-w' : ''}   ` +
      `   ${common} `;

    const taonActionFromParentName = GlobalStorage.get(taonActionFromParent);

    Helpers.getIsVerboseMode() &&
      console.log({
        commandCjs,
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

    await startAsync(commandCjs, cwd, {
      uniqueName: `${tscTool} cjs`,
      prefix: true,
      similarProcessKey: `${tscTool}`,
      resolvePromiseMsgCallback_anystd: () => {
        this.taonBuildObserver.backendCjsState.set(
          DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
        );
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
        this.project.watcher.isTaonLightWatcherMode &&
        !skipLightWeightWatcherFor_CjsESM &&
        this.project.watcher.rebuildTriggerWatcher('backend-cjs'),
    });
    //#endregion

    Helpers.logInfo(`* Typescript compilation first part done (cjs)`);

    await this.project.nodeModules.makeSureInstalled();

    //#region compilation esm backend
    if (!buildOptions.build.prod) {
      // in prod normal build is esm - not need for this
      await startAsync(commandJsEsm, cwd, {
        uniqueName: `${tscTool} esm`,
        prefix: true,
        similarProcessKey: `${tscTool}`,
        resolvePromiseMsgCallback_anystd: () => {
          this.taonBuildObserver.backendEsmState.set(
            DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
          );
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
          this.project.watcher.isTaonLightWatcherMode &&
          !skipLightWeightWatcherFor_CjsESM &&
          this.project.watcher.rebuildTriggerWatcher('backend-esm'),
      });
    }
    //#endregion

    Helpers.logInfo(`* Typescript compilation second part done (esm)`);

    await this.project.nodeModules.makeSureInstalled();

    //#region compilation js maps backend
    await startAsync(commandMaps, cwd, {
      uniqueName: `${tscTool} js maps`,
      similarProcessKey: `${tscTool}`,
      prefix: true,
      hideOutput_stderr: true,
      hideOutput_stdout: true,
      resolvePromiseMsgCallback_anystd: () => {
        this.taonBuildObserver.backendJsMapsState.set(
          DevMode.ProjectBuildStatus.DONE_BUILDING_SUCCESS,
        );
      },
      onExitCallback: async (code, resolve, reject) => {
        resolve(); // TODO this is throwing tsocnfig errpr
      },
      resolvePromiseMsg_stdout: [COMPILATION_WATCHING_STARTED],
      rebuildOnChange:
        this.project.watcher.isTaonLightWatcherMode &&
        !skipLightWeightWatcherFor_jsMaps &&
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
