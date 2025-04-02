//#region imports
import { config } from 'tnp-config/src';
import { Helpers, UtilsTerminal, _, chalk, path } from 'tnp-core/src';
import { BaseProcessManger, CommandConfig } from 'tnp-helpers/src';

import {
  COMPILATION_COMPLETE_APP_NG_SERVE,
  COMPILATION_COMPLETE_LIB_NG_BUILD,
} from '../../../constants';
import {
  BuildOptions,
  ClearOptions,
  InitOptions,
  ReleaseArtifactTaon,
  ReleaseOptions,
} from '../../../options';
import { Project } from '../project';

import { ArtifactsGlobalHelper } from './__helpers__/artifacts-helpers';
import type { BaseArtifact, IArtifactProcessObj } from './base-artifact';
//#endregion

/**
 * Artifact manager
 * Responsible for group actions on
 * current project or/and children projects
 */
export class ArtifactManager {
  static for(project: Project): ArtifactManager {
    //#region @backendFunc
    const artifactProcess = {
      angularNodeApp:
        new (require('./angular-node-app').ArtifactAngularNodeApp)(project),
      npmLibAndCliTool:
        new (require('./npm-lib-and-cli-tool').ArtifactNpmLibAndCliTool)(
          project,
        ),
      electronApp: new (require('./electron-app').ArtifactElectronApp)(project),
      mobileApp: new (require('./mobile-app').ArtifactMobileApp)(project),
      docsWebapp: new (require('./docs-webapp').ArtifactDocsWebapp)(project),
      vscodePlugin: new (require('./vscode-plugin').ArtifactVscodePlugin)(
        project,
      ),
    } as IArtifactProcessObj;
    const globalHelper = new ArtifactsGlobalHelper(project);
    const manager = new ArtifactManager(artifactProcess, project, globalHelper);
    for (const key of Object.keys(artifactProcess)) {
      const instance = artifactProcess[_.camelCase(key)] as BaseArtifact<
        any,
        any
      >;
      // @ts-expect-error
      instance.artifacts = artifactProcess;
      // @ts-expect-error
      instance.globalHelper = globalHelper;
    }

    return manager as ArtifactManager;
    //#endregion
  }

  //#region constructor
  private constructor(
    /**
     * @deprecated
     * this will be protected in future
     */
    public artifact: IArtifactProcessObj,
    private project: Project,
    public globalHelper: ArtifactsGlobalHelper,
  ) {}
  //#endregion

  //#region clear
  async clear(options: ClearOptions): Promise<void> {
    await this.artifact.npmLibAndCliTool.clearPartial(options);
    await this.artifact.angularNodeApp.clearPartial(options);
    await this.artifact.electronApp.clearPartial(options);
    await this.artifact.mobileApp.clearPartial(options);
    await this.artifact.docsWebapp.clearPartial(options);
    await this.artifact.vscodePlugin.clearPartial(options);
  }

  async clearAllChildren(options: ClearOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.clear(options);
    }
  }
  //#endregion

  //#region struct
  /**
   * struct current project only
   * struct() <=> init() with struct flag
   */
  async struct(initOptions: InitOptions): Promise<void> {
    //#region @backendFunc
    initOptions.purpose = 'only structure init';
    initOptions.struct = true;
    await this.init(initOptions);
    //#endregion
  }

  /**
   * struct all children artifacts
   */
  async structAllChildren(options: InitOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.struct(options);
    }
  }
  //#endregion

  //#region init
  async init(initOptions: InitOptions): Promise<void> {
    //#region @backendFunc
    //#region prevent not requested framework version
    if (this.project.framework.frameworkVersionLessThan('v18')) {
      Helpers.error(
        `Please upgrade taon framework version to to at least v18

        ${config.file.taon_jsonc} => version => should be at least 18

        `,
        false,
        true,
      );
    }
    //#endregion

    // TODO QUICK_FIX change env to something else
    Helpers.removeFileIfExists(
      path.join(this.project.location, config.file.tnpEnvironment_json),
    );

    if (
      (this.project.framework.isContainer ||
        this.project.framework.isStandaloneProject) &&
      this.project.framework.frameworkVersionLessThan('v18')
    ) {
      Helpers.warn(`

        Project from this location is not supported

        ${this.project.location}


        `);
      UtilsTerminal.pressAnyKeyToContinueAsync({
        message: 'Press any key to continue',
      });
      return;
    }

    this.project.taonJson.preservePropsFromPackageJson(); // TODO temporary remove
    this.project.taonJson.preserveOldTaonProps(); // TODO temporary remove
    this.project.taonJson.saveToDisk('init');
    await this.project.vsCodeHelpers.init();
    await this.project.linter.init();

    if (this.project.framework.isStandaloneProject) {
      await this.project.artifactsManager.globalHelper.branding.apply(
        !!initOptions.branding,
      );
    }

    if (
      !initOptions.targetArtifact ||
      initOptions.targetArtifact === 'docs-webapp'
    ) {
      await this.artifact.docsWebapp.initPartial(initOptions);
    }
    if (
      !initOptions.targetArtifact ||
      initOptions.targetArtifact === 'npm-lib-and-cli-tool'
    ) {
      await this.artifact.npmLibAndCliTool.initPartial(initOptions);
    }
    if (
      !initOptions.targetArtifact ||
      initOptions.targetArtifact === 'angular-node-app'
    ) {
      await this.artifact.angularNodeApp.initPartial(initOptions);
    }
    if (
      !initOptions.targetArtifact ||
      initOptions.targetArtifact === 'electron-app'
    ) {
      await this.artifact.electronApp.initPartial(initOptions);
    }
    if (
      !initOptions.targetArtifact ||
      initOptions.targetArtifact === 'mobile-app'
    ) {
      await this.artifact.mobileApp.initPartial(initOptions);
    }
    if (
      !initOptions.targetArtifact ||
      initOptions.targetArtifact === 'vscode-plugin'
    ) {
      await this.artifact.vscodePlugin.initPartial(initOptions);
    }

    //#endregion
  }

  async initAllChildren(options: InitOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.init(options);
    }
  }
  //#endregion

  //#region build
  async build(buildOptions: BuildOptions): Promise<void> {
    if (!buildOptions.targetArtifact) {
      await this.init(InitOptions.from({ ...buildOptions, watch: false }));

      //#region  build Menu
      const buildWatchCmdForArtifact = (
        artifact: ReleaseArtifactTaon,
        options?: Partial<BuildOptions>,
      ): string => {
        options = options || {};
        return (
          `${config.frameworkName} build${buildOptions.watch ? ':watch' : ''} ` +
          `--targetArtifact ${artifact} ` +
          ` ${options.websql ? '--websql' : ''} ` +
          ` ${options.ngNormalAppPort ? `--ngNormalAppPort ${options.ngNormalAppPort}` : ''}` +
          ` ${options.ngWebsqlAppPort ? `--ngWebsqlAppPort ${options.ngWebsqlAppPort}` : ''}` +
          ` ${options.nodeBeAppPort ? `--nodeBeAppPort ${options.nodeBeAppPort}` : ''}`
        );
      };
      const processManager = new BaseProcessManger(this.project as any);

      const ngBuildLibCommand = CommandConfig.from({
        name: `Isomorphic Nodejs/Angular library`,
        cmd: buildWatchCmdForArtifact('npm-lib-and-cli-tool'),
        goToNextCommandWhenOutput: {
          stdoutContains: COMPILATION_COMPLETE_LIB_NG_BUILD,
        },
      });

      const ngNormalAppPort =
        await this.artifact.angularNodeApp.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
          BuildOptions.from({ ...buildOptions, websql: false }),
        );

      const ngWebsqlAppPort =
        await this.artifact.angularNodeApp.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
          BuildOptions.from({ ...buildOptions, websql: true }),
        );

      const nodeBeAppPort =
        await this.artifact.angularNodeApp.NODE_BACKEND_PORT_UNIQ_KEY(
          BuildOptions.from(buildOptions),
        );

      const ngServeAppCommand = CommandConfig.from({
        name: `Angular (for Nodejs backend) frontend app`,
        cmd: buildWatchCmdForArtifact('angular-node-app', {
          ngNormalAppPort,
          nodeBeAppPort,
          ngWebsqlAppPort,
        }),
        shouldBeActiveOrAlreadyBuild: [ngBuildLibCommand],
        goToNextCommandWhenOutput: {
          stdoutContains: COMPILATION_COMPLETE_APP_NG_SERVE,
        },
        headerMessageWhenActive:
          `Normal Angular App is running on ` +
          `http://localhost:${ngNormalAppPort}`,
      });

      const ngServeWebsqlAppCommand = CommandConfig.from({
        name: `Angular (for Websql backend) frontend app`,
        cmd: buildWatchCmdForArtifact('angular-node-app', {
          websql: true,
          ngNormalAppPort,
          nodeBeAppPort,
          ngWebsqlAppPort,
        }),
        shouldBeActiveOrAlreadyBuild: [ngBuildLibCommand],
        goToNextCommandWhenOutput: {
          stdoutContains: COMPILATION_COMPLETE_APP_NG_SERVE,
        },
        headerMessageWhenActive:
          `Websql Angular App is running on ` +
          `http://localhost:${ngWebsqlAppPort}`,
      });

      const documenationCommand = CommandConfig.from({
        name: `Documentation (mkdocs, compodoc, typedoc)`,
        cmd: buildWatchCmdForArtifact('docs-webapp'),
        headerMessageWhenActive:
          `Documentation is running on http://localhost:` +
          `${await this.artifact.docsWebapp.DOCS_ARTIFACT_PORT_UNIQ_KEY(
            BuildOptions.from(buildOptions),
          )}`,
      });

      await processManager.init({
        watch: !!buildOptions.watch,
        header: `

        Build process for ${this.project.name}

        `,
        title: `Select what do you want to build ${buildOptions.watch ? 'in watch mode' : ''}?`,
        commands: [
          ngBuildLibCommand,
          ngServeAppCommand,
          ngServeWebsqlAppCommand,
          documenationCommand,
        ],
      });
      //#endregion
    } else {
      //#region partial build
      if (
        !buildOptions.targetArtifact ||
        buildOptions.targetArtifact === 'docs-webapp'
      ) {
        await this.artifact.docsWebapp.buildPartial(buildOptions);
      }
      if (
        !buildOptions.targetArtifact ||
        buildOptions.targetArtifact === 'npm-lib-and-cli-tool'
      ) {
        await this.artifact.npmLibAndCliTool.buildPartial(buildOptions);
      }
      if (
        !buildOptions.targetArtifact ||
        buildOptions.targetArtifact === 'angular-node-app'
      ) {
        await this.artifact.angularNodeApp.buildPartial(buildOptions);
      }
      if (
        !buildOptions.targetArtifact ||
        buildOptions.targetArtifact === 'electron-app'
      ) {
        await this.artifact.electronApp.buildPartial(buildOptions);
      }
      if (
        !buildOptions.targetArtifact ||
        buildOptions.targetArtifact === 'mobile-app'
      ) {
        await this.artifact.mobileApp.buildPartial(buildOptions);
      }
      if (
        !buildOptions.targetArtifact ||
        buildOptions.targetArtifact === 'vscode-plugin'
      ) {
        await this.artifact.vscodePlugin.buildPartial(buildOptions);
      }
      //#endregion
    }
  }

  async buildAllChildren(options: BuildOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.build(options);
    }
  }
  //#endregion

  //#region release
  async release(releaseOptions: ReleaseOptions): Promise<void> {
    if (
      !releaseOptions.targetArtifact ||
      releaseOptions.targetArtifact === 'docs-webapp'
    ) {
      await this.artifact.docsWebapp.releasePartial(releaseOptions);
    }
    if (
      !releaseOptions.targetArtifact ||
      releaseOptions.targetArtifact === 'npm-lib-and-cli-tool'
    ) {
      await this.artifact.npmLibAndCliTool.releasePartial(releaseOptions);
    }
    if (
      !releaseOptions.targetArtifact ||
      releaseOptions.targetArtifact === 'angular-node-app'
    ) {
      await this.artifact.npmLibAndCliTool.buildPartial(
        BuildOptions.fromRelease(releaseOptions),
      );
      await this.artifact.angularNodeApp.releasePartial(releaseOptions);
    }
    if (
      !releaseOptions.targetArtifact ||
      releaseOptions.targetArtifact === 'electron-app'
    ) {
      await this.artifact.npmLibAndCliTool.buildPartial(
        BuildOptions.fromRelease(releaseOptions),
      );
      await this.artifact.angularNodeApp.buildPartial(
        BuildOptions.fromRelease(releaseOptions),
      );
      await this.artifact.electronApp.releasePartial(releaseOptions);
    }
    if (
      !releaseOptions.targetArtifact ||
      releaseOptions.targetArtifact === 'mobile-app'
    ) {
      await this.artifact.npmLibAndCliTool.buildPartial(
        BuildOptions.fromRelease(releaseOptions),
      );
      await this.artifact.mobileApp.releasePartial(releaseOptions);
    }
    if (
      !releaseOptions.targetArtifact ||
      releaseOptions.targetArtifact === 'vscode-plugin'
    ) {
      await this.artifact.npmLibAndCliTool.buildPartial(
        BuildOptions.fromRelease(releaseOptions),
      );
      await this.artifact.vscodePlugin.releasePartial(releaseOptions);
    }
  }

  async releaseAllChildren(options: ReleaseOptions): Promise<void> {
    // let resolved = [];
    // if (this.project.framework.isContainer) {
    //   resolved = Helpers.cliTool.resolveItemsFromArgsBegin<Project>(
    //     this.args,
    //     a => {
    //       return this.project.ins.From(path.join(this.project.location, a));
    //     },
    //   )?.allResolved;

    //   const otherDeps = this.project.children.filter(c => {
    //     return !resolved.includes(c);
    //   });

    //   resolved = this.project.ins // @ts-ignore
    //     .sortGroupOfProject<Project>(
    //       [...resolved, ...otherDeps],
    //       proj => proj.taonJson.dependenciesNamesForNpmLib,
    //       proj => proj.name,
    //     )
    //     .filter(d => d.name !== this.project.name);
    // }

    for (const child of this.project.children) {
      await child.artifactsManager.release(options);
    }
  }
  //#endregion

  //#region DEPRECATED
  private async wrappWithProcessInfo(
    fn: () => Promise<void>,
    processName: keyof ArtifactManager,
  ) {
    //#region @backendFunc
    // const projectInfoPort = await this.project.registerAndAssignPort(
    //   `project-build-info`,
    //   {
    //     startFrom: 4100,
    //   },
    // );
    // this.project.artifactsManager.artifact.angularNodeApp.__setProjectInfoPort(
    //   projectInfoPort,
    // );
    // this.project.artifactsManager.artifact.angularNodeApp.backendPort =
    //   PortUtils.instance(
    //     this.project.artifactsManager.artifact.angularNodeApp.projectInfoPort,
    //   ).calculateServerPortFor(this.project);
    // Helpers.writeFile(
    //   this.project.pathFor(tmpBuildPort),
    //   projectInfoPort?.toString(),
    // );
    // const hostForBuild = `http://localhost:${projectInfoPort}`;
    // console.info(`
    //   You can check info about build in ${chalk.bold(hostForBuild)}
    //         `);
    // Helpers.taskStarted(`starting project service... ${hostForBuild}`);
    // // TODO @LAST create global task server
    // const ProjectBuildContext = Taon.createContext(() => ({
    //   contextName: 'ProjectBuildContext',
    //   host: hostForBuild,
    //   contexts: { BaseContext },
    //   controllers: { BuildProcessController },
    //   entities: { BuildProcess },
    //   skipWritingServerRoutes: true,
    //   logs: false,
    //   database: {
    //     autoSave: false, // skip creationg db file
    //   },
    // }));
    // await ProjectBuildContext.initialize();
    // const buildProcessController: BuildProcessController =
    //   ProjectBuildContext.getClassInstance(BuildProcessController);
    // await buildProcessController.initializeServer(this.project);
    // this.project.vsCodeHelpers.__saveLaunchJson(projectInfoPort);
    // Helpers.taskDone('project service started');
    //#endregion
  }

  async getInforServerController() {
    //#region @backendFunc
    // const projectInfoPortFromFile = Number(
    //   Helpers.readFile(this.project.pathFor(tmpBuildPort)),
    // );
    // console.log({
    //   projectInfoPortFromFile,
    // });
    // this.project.artifactsManager.artifact.angularNodeApp.__setProjectInfoPort(
    //   projectInfoPortFromFile,
    // );
    // const hostForAppWorker = `http://localhost:${projectInfoPortFromFile}`;
    // // console.log({ hostForAppWorker })
    // const ProjectBuildContext = Taon.createContext(() => ({
    //   contextName: 'ProjectBuildContext',
    //   remoteHost: hostForAppWorker,
    //   contexts: { BaseContext },
    //   controllers: { BuildProcessController },
    //   entities: { BuildProcess },
    //   skipWritingServerRoutes: true,
    //   logs: false,
    //   database: {
    //     autoSave: false, // probably not needed here
    //   },
    // }));
    // await ProjectBuildContext.initialize();
    // const buildProcessController: BuildProcessController =
    //   ProjectBuildContext.getClassInstance(BuildProcessController);
    // await buildProcessController.initializeClientToRemoteServer(this.project);
    //#endregion
  }
  //#endregion
}
