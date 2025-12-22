//#region imports
import {
  config,
  dotTaonFolder,
  dotTnpFolder,
  LibTypeEnum,
  UtilsFilesFoldersSync,
} from 'tnp-core/src';
import {
  Utils,
  UtilsTerminal,
  _,
  chalk,
  crossPlatformPath,
  fse,
  path,
} from 'tnp-core/src';
import { fileName } from 'tnp-core/src';
import { tnpPackageName } from 'tnp-core/src';
import { Helpers } from 'tnp-helpers/src';

import {
  appElectronTsFromSrc,
  appTsFromSrc,
  distMainProject,
  dotFileTemplateExt,
  dotVscodeMainProject,
  globalScssFromSrc,
  indexTsFromLibFromSrc,
  indexTsFromSrc,
  libFromSrc,
  nodeModulesMainProject,
  srcMainProject,
  TaonGeneratedFiles,
  taonJsonMainProject,
} from '../../../constants';
import { ReleaseArtifactTaon, EnvOptions, ReleaseType } from '../../../options';
import { EXPORT_TEMPLATE } from '../../../templates';
import { Project } from '../project';

import { ArtifactsGlobalHelper } from './__helpers__/artifacts-helpers';
import type {
  BaseArtifact,
  IArtifactProcessObj,
  ReleasePartialOutput,
} from './base-artifact';
import { FilesRecreator } from './npm-lib-and-cli-tool/tools/files-recreation';
//#endregion

/**
 * Artifact manager
 * Responsible for group actions on
 * current project or/and children projects
 */
export class ArtifactManager {
  public readonly filesRecreator: FilesRecreator;

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
  ) {
    this.filesRecreator = new FilesRecreator(this.project);
  }
  //#endregion

  //#region public methods / clear
  async clear(options: EnvOptions): Promise<void> {
    Helpers.taskStarted(`

      Clearing artifacts temp data in ${this.project.name}

      `);

    if (this.project.framework.isStandaloneProject) {
      this.project.removeFolderByRelativePath(dotTnpFolder);
      this.project.removeFolderByRelativePath(dotTaonFolder);
    }

    await this.artifact.npmLibAndCliTool.clearPartial(options);
    await this.artifact.angularNodeApp.clearPartial(options);
    await this.artifact.electronApp.clearPartial(options);
    await this.artifact.mobileApp.clearPartial(options);
    await this.artifact.docsWebapp.clearPartial(options);
    await this.artifact.vscodePlugin.clearPartial(options);

    if (this.project.framework.isContainer) {
      [
        srcMainProject,
        ...this.filesRecreator.projectSpecificFilesForContainer(),
        ...this.filesRecreator.projectSpecificFilesForStandalone(),
        ...this.filesRecreator.filesTemplatesForStandalone(),
        ...this.filesRecreator
          .filesTemplatesForStandalone()
          .map(f => f.replace(dotFileTemplateExt, '')),
      ].forEach(f => {
        console.log('removing', f);
        this.project.remove(f, true);
      });
    }

    Helpers.taskDone(`

      Done cleaning artifacts temp data in ${this.project.name}

      `);
  }

  async clearAllChildren(options: EnvOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.clear(options);
    }
  }
  //#endregion

  //#region public methods / struct
  /**
   * struct current project only
   * struct() <=> init() with struct flag
   */
  async struct(initOptions: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc
    initOptions.purpose = 'only structure init';
    initOptions.init.struct = true;
    return await this.init(initOptions);
    //#endregion
  }

  /**
   * struct all children artifacts
   */
  async structAllChildren(options: EnvOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.struct(options);
    }
  }
  //#endregion

  //#region public methods / init
  public async init(initOptions: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc

    //#region prevent not requested framework version
    if (this.project.framework.frameworkVersionLessThan('v18')) {
      // TODO QUICK_FIX @REMOVE
      if (this.project.framework.isCoreProject) {
        return;
      }
      Helpers.error(
        `Please upgrade taon framework version to to at least v18
        in project: ${this.project.name}

        ${taonJsonMainProject} => version => should be at least 18
        inside file
        ${chalk.underline(this.project.pathFor(taonJsonMainProject))}

        `,
        false,
        true,
      );
    }
    //#endregion

    this.project.quickFixes.fixPrettierCreatingConfigInNodeModules();
    if (!initOptions.init.struct) {
      //#region prevent incorrect node_modules with tnp dev mode
      if (config.frameworkName === tnpPackageName) {
        let node_modules_path = this.project.nodeModules.path;
        let node_modules_real_path = this.project.nodeModules.realPath;
        if (node_modules_path !== node_modules_real_path) {
          const containerName = path.basename(
            path.dirname(node_modules_real_path),
          );
          const properRelativeNodeModulesPath = crossPlatformPath(
            path.resolve(
              config.dirnameForTnp,
              this.project.ins.taonProjectsRelative,
              containerName,
              nodeModulesMainProject,
            ),
          );
          if (node_modules_real_path !== properRelativeNodeModulesPath) {
            console.warn(`
    (DEV MODE TNP) DETECTED NODE_MODULES LINK NOT FROM PROPER CONTAINER
    fixing/linking proper node_modules path
              `);
            try {
              fse.unlinkSync(node_modules_path);
            } catch (error) {}
          }
        }
      }
      //#endregion

      await this.project.nodeModules.makeSureInstalled();
    }

    //#region check isomorphic dependencies for npm lib
    if (this.project.framework.isStandaloneProject) {
      const missingDependencies: string[] = [];
      const isomorphicDependenciesForNpmLib =
        this.project.taonJson.isomorphicDependenciesForNpmLib;

      for (const packageName of isomorphicDependenciesForNpmLib) {
        if (!this.project.nodeModules.hasPackageInstalled(packageName)) {
          missingDependencies.push(packageName);
        }
      }

      if (missingDependencies.length > 0) {
        Helpers.error(
          `
            (taon.json) - isomorphicDependenciesForNpmLib property has defined packages
            that are not installed in node_modules.

            Please rebuild first your external dependency project(s):
    ${missingDependencies.map(d => `- ${chalk.bold(d)}`).join()}`,
          false,
          true,
        );
      }
    }
    //#endregion

    this.recreateAndFixCoreFiles();

    initOptions = await this.project.environmentConfig.update(initOptions, {
      saveEnvToLibEnv:
        initOptions.release.targetArtifact ===
          ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
        !initOptions.release.targetArtifact,
    });

    this.project.framework.recreateVarsScss(initOptions);

    // TODO QUICK_FIX change env to something else
    Helpers.removeFileIfExists(
      path.join(this.project.location, fileName.tnpEnvironment_json),
    );

    if (!initOptions.isCiProcess && !this.project.framework.isCoreProject) {
      // do some fixing on dev machine
      // TODO QUICK_FIX
      // if (this.project.framework.isStandaloneProject) {
      //   try {
      //     this.project.remove(`app`, true);
      //   } catch (error) {}
      // }

      // TODO QUICK_FIX when somehow linked node_modules to dist
      // make electron use node_modules from dist no from ./node_modules
      try {
        fse.unlinkSync(
          this.project.pathFor(`${distMainProject}/${nodeModulesMainProject}`),
        );
      } catch (error) {}

      try {
        this.project
          .run(
            `git rm -f ${dotVscodeMainProject}/${TaonGeneratedFiles.LAUNCH_JSON}`,
            {
              output: false,
              silence: true,
            },
          )
          .sync();
      } catch (error) {}
      this.project.removeFile('tsconfig.isomorphic-flat-bundle.json');
      this.project.removeFile('webpack.backend-bundle-build.js');
      this.project.removeFile('.eslintrc.json');
      this.project.removeFile('tslint.json');
      this.project.removeFile(
        `${dotVscodeMainProject}/${TaonGeneratedFiles.LAUNCH_BACKUP_JSON}`,
      );
      this.project.removeFile('run-org.js');
      if (this.project.typeIs(LibTypeEnum.CONTAINER)) {
        this.project.removeFile(
          `${srcMainProject}/${TaonGeneratedFiles.VARS_SCSS}`,
        );
      }
      this.project.remove(`${srcMainProject}/docker`, true);
      try {
        this.project
          .run(
            `git rm -f ${dotVscodeMainProject}/${TaonGeneratedFiles.LAUNCH_BACKUP_JSON}`,
            {
              output: false,
              silence: true,
            },
          )
          .sync();
      } catch (error) {}
    }

    // if organization project - children should have the same framework version
    if (
      this.project.framework.isContainer &&
      this.project.taonJson.isOrganization
    ) {
      for (const orgChild of this.project.children) {
        orgChild.taonJson.setFrameworkVersion(
          this.project.taonJson.frameworkVersion,
        );
      }
    }

    this.project.taonJson.preservePropsFromPackageJson(); // TODO temporary remove
    this.project.taonJson.preserveOldTaonProps(); // TODO temporary remove
    this.project.taonJson.saveToDisk('init');
    this.project.environmentConfig.updateGeneratedValues(initOptions);

    this.project.packagesRecognition.addIsomorphicPackagesToFile([
      this.project.nameForNpmPackage,
    ]);
    if (this.project.framework.isStandaloneProject) {
      await this.project.artifactsManager.artifact.angularNodeApp.appHostsRecreateHelper.runTask(
        {
          watch: initOptions.build.watch,
          initialParams: {
            envOptions: initOptions,
          },
        },
      );
    }

    await this.project.ignoreHide.init();
    await this.filesRecreator.init();
    await this.project.vsCodeHelpers.init({
      skipHiddingTempFiles: !initOptions.init.struct,
    });

    await this.project.linter.init();

    if (this.project.framework.isStandaloneProject) {
      await this.project.artifactsManager.globalHelper.branding.apply(
        !!initOptions.init.branding,
      );
    }

    this.artifact.npmLibAndCliTool.unlinkNodeModulesWhenTnp();
    const targetArtifact = initOptions.release.targetArtifact;

    if (this.project.framework.isStandaloneProject) {
      if (
        !targetArtifact ||
        targetArtifact === ReleaseArtifactTaon.DOCS_DOCS_WEBAPP
      ) {
        initOptions = await this.artifact.docsWebapp.initPartial(initOptions);
      }
      if (
        !targetArtifact ||
        targetArtifact === ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL
      ) {
        initOptions =
          await this.artifact.npmLibAndCliTool.initPartial(initOptions);
      }
      if (
        !targetArtifact ||
        targetArtifact === ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
        targetArtifact === ReleaseArtifactTaon.ANGULAR_NODE_APP
      ) {
        initOptions =
          await this.artifact.angularNodeApp.initPartial(initOptions);
      }
      if (
        !targetArtifact ||
        targetArtifact === ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
        targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
      ) {
        initOptions = await this.artifact.electronApp.initPartial(initOptions);
      }
      if (
        !targetArtifact ||
        targetArtifact === ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
        targetArtifact === ReleaseArtifactTaon.MOBILE_APP
      ) {
        initOptions = await this.artifact.mobileApp.initPartial(initOptions);
      }
      if (
        !targetArtifact ||
        targetArtifact === ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL ||
        targetArtifact === ReleaseArtifactTaon.VSCODE_PLUGIN
      ) {
        initOptions = await this.artifact.vscodePlugin.initPartial(initOptions);
      }
    }
    return initOptions;
    //#endregion
  }

  public async initAllChildren(options: EnvOptions): Promise<void> {
    for (const child of this.project.children) {
      await child.artifactsManager.init(options.clone({}));
    }
  }
  //#endregion

  //#region public methods / build

  //#region public methods / interactive menu TODO
  /**
   * @deprecated
   */
  private buildWatchCmdForArtifact = (
    artifact: ReleaseArtifactTaon,
    options?: Partial<EnvOptions>,
  ): string => {
    options = EnvOptions.from(options);
    let params = '';

    // try {
    params = EnvOptions.getParamsString({
      ...options,
      release: { targetArtifact: artifact },
    });
    // } catch (error) {
    //   Helpers.error(error, true, true);
    //   Helpers.throw(
    //     `Error while creating params for ${artifact} build command`,
    //   );
    // }

    return `${config.frameworkName} build${options.build.watch ? ':watch' : ''} ${params}`;
  };
  //#endregion

  //#region public methods / build standalone
  async build(buildOptions: EnvOptions): Promise<void> {
    if (!buildOptions.release.targetArtifact) {
      //#region  build Menu
      // TODO for unified build menu is not efficient enouth
      Helpers.error(
        `

        Please use commands:

        ${config.frameworkName} build:watch:lib
        ${config.frameworkName} build:watch:app
        ${config.frameworkName} build:watch:electron
        ${config.frameworkName} docs:watch

        `,
        false,
        true,
      );
      // await this.init(buildOptions.clone({ build: { watch: false } }));
      // const processManager = new BaseProcessManger(this.project as any);

      // const ngBuildLibCommand = CommandConfig.from({
      //   name: `Isomorphic Nodejs/Angular library`,
      //   cmd: this.buildWatchCmdForArtifact('npm-lib-and-cli-tool'),
      //   goToNextCommandWhenOutput: {
      //     stdoutContains: COMPILATION_COMPLETE_LIB_NG_BUILD,
      //   },
      // });

      // const ngNormalAppPort =
      //   await this.artifact.angularNodeApp.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
      //     buildOptions.clone({ build: { websql: false } }),
      //   );

      // const ngWebsqlAppPort =
      //   await this.artifact.angularNodeApp.APP_NG_SERVE_ARTIFACT_PORT_UNIQ_KEY(
      //     buildOptions.clone({ build: { websql: true } }),
      //   );

      // const nodeBeAppPort =
      //   await this.artifact.angularNodeApp.NODE_BACKEND_PORT_UNIQ_KEY(
      //     buildOptions.clone(),
      //   );

      // const ngServeAppCommand = CommandConfig.from({
      //   name: `Angular (for Nodejs backend) frontend app`,
      //   cmd: this.buildWatchCmdForArtifact('angular-node-app', {
      //     ports: { ngNormalAppPort, nodeBeAppPort, ngWebsqlAppPort },
      //   }),
      //   shouldBeActiveOrAlreadyBuild: [ngBuildLibCommand],
      //   goToNextCommandWhenOutput: {
      //     stdoutContains: COMPILATION_COMPLETE_APP_NG_SERVE,
      //   },
      //   headerMessageWhenActive:
      //     `Normal Angular App is running on ` +
      //     `http://localhost:${ngNormalAppPort}`,
      // });

      // const ngServeWebsqlAppCommand = CommandConfig.from({
      //   name: `Angular (for Websql backend) frontend app`,
      //   cmd: this.buildWatchCmdForArtifact('angular-node-app', {
      //     build: { websql: true },
      //     ports: { ngNormalAppPort, nodeBeAppPort, ngWebsqlAppPort },
      //   }),
      //   shouldBeActiveOrAlreadyBuild: [ngBuildLibCommand],
      //   goToNextCommandWhenOutput: {
      //     stdoutContains: COMPILATION_COMPLETE_APP_NG_SERVE,
      //   },
      //   headerMessageWhenActive:
      //     `Websql Angular App is running on ` +
      //     `http://localhost:${ngWebsqlAppPort}`,
      // });

      // const documenationCommand = CommandConfig.from({
      //   name: `Documentation (mkdocs, compodoc, typedoc)`,
      //   cmd: this.buildWatchCmdForArtifact('docs-webapp'),
      //   headerMessageWhenActive:
      //     `Documentation is running on http://localhost:` +
      //     `${await this.artifact.docsWebapp.DOCS_ARTIFACT_PORT_UNIQ_KEY(
      //       EnvOptions.from(buildOptions),
      //     )}`,
      // });

      // await processManager.init({
      //   watch: !!buildOptions.build.watch,
      //   header: `

      //   Build process for ${this.project.name}

      //   `,
      //   title: `Select what do you want to build ${buildOptions.build.watch ? 'in watch mode' : ''}?`,
      //   commands: [
      //     ngBuildLibCommand,
      //     ngServeAppCommand,
      //     ngServeWebsqlAppCommand,
      //     documenationCommand,
      //   ],
      // });
      //#endregion
    } else {
      //#region partial build
      if (
        !buildOptions.release.targetArtifact ||
        buildOptions.release.targetArtifact ===
          ReleaseArtifactTaon.DOCS_DOCS_WEBAPP
      ) {
        await this.artifact.docsWebapp.buildPartial(buildOptions.clone());
      }
      if (
        !buildOptions.release.targetArtifact ||
        buildOptions.release.targetArtifact ===
          ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL
      ) {
        await this.artifact.npmLibAndCliTool.buildPartial(buildOptions.clone());
      }
      if (
        !buildOptions.release.targetArtifact ||
        buildOptions.release.targetArtifact ===
          ReleaseArtifactTaon.ANGULAR_NODE_APP
      ) {
        await this.artifact.angularNodeApp.buildPartial(buildOptions.clone());
      }
      if (
        !buildOptions.release.targetArtifact ||
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
      ) {
        await this.artifact.electronApp.buildPartial(buildOptions.clone());
      }
      if (
        !buildOptions.release.targetArtifact ||
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.MOBILE_APP
      ) {
        await this.artifact.mobileApp.buildPartial(buildOptions.clone());
      }
      if (
        !buildOptions.release.targetArtifact ||
        buildOptions.release.targetArtifact === ReleaseArtifactTaon.MOBILE_APP
      ) {
        await this.artifact.vscodePlugin.buildPartial(buildOptions.clone());
      }
      //#endregion
    }
  }
  //#endregion

  //#region public methods / build all children
  async buildAllChildren(
    options: EnvOptions,
    children = this.project.children,
  ): Promise<void> {
    children = this.project.ins // @ts-ignore BaseProject inheritace compatiblity with Project problem
      .sortGroupOfProject<Project>(
        children,
        proj => [
          ...proj.taonJson.dependenciesNamesForNpmLib,
          ...proj.taonJson.isomorphicDependenciesForNpmLib,
          ...proj.taonJson.peerDependenciesNamesForNpmLib,
        ],
        proj => proj.nameForNpmPackage,
      );

    if (options.container.only.length > 0) {
      children = children.filter(c => {
        return options.container.only.includes(c.name);
      });
    }

    if (options.container.skip.length > 0) {
      children = children.filter(c => {
        return !options.container.skip.includes(c.name);
      });
    }

    const endIndex = this.project.children.findIndex(
      c => c.name === options.container.end,
    );
    if (endIndex !== -1) {
      children = children.filter((c, i) => {
        return i <= endIndex;
      });
    }
    const startIndex = this.project.children.findIndex(
      c => c.name === options.container.start,
    );
    if (startIndex !== -1) {
      children = children.filter((c, i) => {
        return i >= startIndex;
      });
    }

    if (options.container.skipReleased) {
      children = children.filter((c, i) => {
        const lastCommitMessage = c?.git?.lastCommitMessage()?.trim();
        return !lastCommitMessage?.startsWith('release: ');
      });
    }

    for (const child of children) {
      await child.artifactsManager.build(options);
    }
  }
  //#endregion

  //#endregion

  //#region public methods / release
  public async release(
    releaseOptions: EnvOptions,
    autoReleaseProcess = false,
  ): Promise<void> {
    //#region @backendFunc

    //#region handle autorelease
    if (!autoReleaseProcess && releaseOptions.release.autoReleaseUsingConfig) {
      let artifactsToRelease =
        this.project.taonJson.autoReleaseConfigAllowedItems.filter(item => {
          if (!releaseOptions.release.autoReleaseTaskName) {
            return true;
          }
          const allowed =
            item.taskName === releaseOptions.release.autoReleaseTaskName;
          if (!allowed) {
            Helpers.logWarn(`Skipping task ${item.taskName}`);
          }
          return allowed;
        });

      for (const item of artifactsToRelease) {
        const clonedOptions = releaseOptions.clone({
          release: {
            targetArtifact: item.artifactName,
            envName: item.envName || '__',
            envNumber: item.envNumber,
            releaseType: item.releaseType || releaseOptions.release.releaseType,
            taonInstanceIp: item.taonInstanceIp,
          },
        });
        await this.release(clonedOptions, true);
      }
      return;
    }
    //#endregion

    releaseOptions =
      await this.project.environmentConfig.update(releaseOptions);

    let releaseOutput: ReleasePartialOutput;

    //#region npm build helper
    const npmLibBUild = async (options: EnvOptions): Promise<void> => {
      await this.artifact.npmLibAndCliTool.buildPartial(
        options.clone({
          build: {
            watch: false,
          },
          release: {
            skipCodeCutting: true,
            targetArtifact: ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
          },
        }),
      );
    };
    //#endregion

    //#region docs app
    if (
      !releaseOptions.release.targetArtifact ||
      releaseOptions.release.targetArtifact ===
        ReleaseArtifactTaon.DOCS_DOCS_WEBAPP
    ) {
      releaseOutput =
        await this.artifact.docsWebapp.releasePartial(releaseOptions);
    }
    //#endregion

    //#region npm lib and cli tool
    if (
      !releaseOptions.release.targetArtifact ||
      releaseOptions.release.targetArtifact ===
        ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL
    ) {
      releaseOutput =
        await this.artifact.npmLibAndCliTool.releasePartial(releaseOptions);
    }
    //#endregion

    //#region angular-node-app
    if (
      !releaseOptions.release.targetArtifact ||
      releaseOptions.release.targetArtifact ===
        ReleaseArtifactTaon.ANGULAR_NODE_APP
    ) {
      if (releaseOptions.release.releaseType === ReleaseType.STATIC_PAGES) {
        releaseOptions.build.baseHref =
          this.artifact.angularNodeApp.angularFeBasenameManager.getBaseHref(
            releaseOptions,
          );
      }
      await npmLibBUild(releaseOptions);
      releaseOutput =
        await this.artifact.angularNodeApp.releasePartial(releaseOptions);
    }
    //#endregion

    //#region electron app
    if (
      !releaseOptions.release.targetArtifact ||
      releaseOptions.release.targetArtifact === ReleaseArtifactTaon.ELECTRON_APP
    ) {
      await npmLibBUild(
        releaseOptions.clone({
          build: {
            pwa: {
              disableServiceWorker: true,
            },
            baseHref: `./`,
          },
          copyToManager: {
            skip: true,
          },
          release: {
            targetArtifact: ReleaseArtifactTaon.ELECTRON_APP,
          },
        }),
      );

      releaseOutput =
        await this.artifact.electronApp.releasePartial(releaseOptions);
    }
    //#endregion

    //#region mobile app
    if (
      !releaseOptions.release.targetArtifact ||
      releaseOptions.release.targetArtifact === ReleaseArtifactTaon.MOBILE_APP
    ) {
      await npmLibBUild(releaseOptions);
      releaseOutput =
        await this.artifact.mobileApp.releasePartial(releaseOptions);
    }
    //#endregion

    //#region vscode plugin
    if (
      !releaseOptions.release.targetArtifact ||
      releaseOptions.release.targetArtifact ===
        ReleaseArtifactTaon.VSCODE_PLUGIN
    ) {
      await npmLibBUild(releaseOptions);
      releaseOutput =
        await this.artifact.vscodePlugin.releasePartial(releaseOptions);
    }
    //#endregion

    //#region tag and push
    if (!releaseOptions.release.skipTagGitPush) {
      if (!releaseOptions.release.autoReleaseUsingConfig) {
        Helpers.info(
          `Checking project path "${releaseOutput.releaseProjPath}" ..`,
        );
        await this.project.releaseProcess.checkBundleQuestion(
          releaseOutput.releaseProjPath,
          `[${releaseOptions.release.releaseType}] Check ${chalk.bold('bundled code')} before tagging/pushing`,
        );
      }

      releaseOutput.projectsReposToPush =
        releaseOutput.projectsReposToPush || [];

      for (const repoAbsPath of Utils.uniqArray(
        releaseOutput.projectsReposToPush,
      )) {
        Helpers.info(`Checking  path "${repoAbsPath}" `);
        if (!releaseOptions.release.autoReleaseUsingConfig) {
          await this.project.releaseProcess.checkBundleQuestion(
            repoAbsPath,
            `[${releaseOptions.release.releaseType}] Check ${chalk.bold('project repo')} before pushing`,
          );
        }
        await Helpers.git.tagAndPushToGitRepo(repoAbsPath, {
          newVersion: releaseOutput.resolvedNewVersion,
          autoReleaseUsingConfig: releaseOptions.release.autoReleaseUsingConfig,
          isCiProcess: releaseOptions.isCiProcess,
          skipTag: true,
        });
      }

      for (const repoAbsPath of Utils.uniqArray(
        releaseOutput.projectsReposToPushAndTag,
      )) {
        if (!releaseOptions.release.autoReleaseUsingConfig) {
          Helpers.info(`Checking  path "${repoAbsPath}" ..`);
          await this.project.releaseProcess.checkBundleQuestion(
            repoAbsPath,
            `[${releaseOptions.release.releaseType}] Check ${chalk.bold('project repo')} before tagging/pushing`,
          );
        }
        await Helpers.git.tagAndPushToGitRepo(repoAbsPath, {
          newVersion: releaseOutput.resolvedNewVersion,
          autoReleaseUsingConfig: releaseOptions.release.autoReleaseUsingConfig,
          isCiProcess: releaseOptions.isCiProcess,
        });
      }
    }

    if (releaseOutput.deploymentFunction) {
      if (releaseOptions.release.skipDeploy) {
        Helpers.warn(`Skipping deployment as per release.skipDeploy`);
      } else {
        await releaseOutput.deploymentFunction();
      }
    }
    //#endregion

    //#endregion
  }

  async releaseAllChildren(
    options: EnvOptions,
    children = this.project.children,
  ): Promise<void> {
    //#region @backendFunc
    const howManyChildren = children.length;
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (!options.isCiProcess) {
        UtilsTerminal.clearConsole();
      }
      Helpers.info(
        `Releasing container child: ${child.name}  (${howManyChildren}/${index + 1}) `,
      );
      await this.tryCatchWrapper(
        async () => {
          await child.artifactsManager.release(options);
        },
        'release',
        child,
      );
    }

    //#endregion
  }
  //#endregion

  //#region public methods / try catch wrapper
  public async tryCatchWrapper(
    action: () => any,
    actionName: 'release' | 'build' | 'init' | 'clear' | 'struct' | 'brand',
    project: Project = this.project,
  ): Promise<void> {
    //#region @backendFunc
    while (true) {
      try {
        await action();
        return;
      } catch (error) {
        if (error?.name === 'ExitPromptError') {
          process.exit(0);
        }
        console.error(error);
        Helpers.error(
          `Not able to ${actionName} your project ${chalk.bold(project.genericName)}`,
          true,
          true,
        );
        const errorOptions = {
          tryAgain: { name: 'Try again' },
          skipPackage: { name: `Skip ${actionName} for this project` },
          openInVscode: { name: `Open in VSCode ... try release again` },
          exit: { name: 'Exit process' },
        };
        const res = await UtilsTerminal.select<keyof typeof errorOptions>({
          choices: errorOptions,
          question: 'What you wanna do ?',
        });

        if (res === 'openInVscode') {
          project.vsCodeHelpers.openInVscode();
          await UtilsTerminal.pressAnyKeyToContinueAsync({
            message: 'Press any key to try release again',
          });
        }

        if (res === 'exit') {
          process.exit(0);
        } else if (res === 'skipPackage') {
          break;
        }
      }
    }
    //#endregion
  }
  //#endregion

  //#region private methods / recreation and fixing core files
  private recreateAndFixCoreFiles(): void {
    //#region @backendFunc
    const project = this.project;
    if (
      !project.framework.isCoreProject &&
      project.framework.isStandaloneProject
    ) {
      project.framework.recreateFileFromCoreProject({
        fileRelativePath: [srcMainProject, appTsFromSrc],
      });

      project.framework.preventNotExistedComponentAndModuleInAppTs();

      project.framework.recreateFileFromCoreProject({
        fileRelativePath: [srcMainProject, globalScssFromSrc],
      });

      project.framework.recreateFileFromCoreProject({
        fileRelativePath: [srcMainProject, appElectronTsFromSrc],
      });

      const indexInSrcFile = project.pathFor([srcMainProject, indexTsFromSrc]);

      if (!Helpers.exists(indexInSrcFile)) {
        Helpers.writeFile(indexInSrcFile, EXPORT_TEMPLATE(libFromSrc));
      }
    }
    //#endregion
  }
  //#endregion
}
