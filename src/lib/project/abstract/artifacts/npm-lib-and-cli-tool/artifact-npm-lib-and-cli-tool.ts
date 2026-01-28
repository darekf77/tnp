//#region imports

import { config, folderName, LibTypeEnum } from 'tnp-core/src';
import {
  chalk,
  CoreModels,
  crossPlatformPath,
  dateformat,
  fse,
  glob,
  path,
  rimraf,
} from 'tnp-core/src';
import { _ } from 'tnp-core/src';
import { fileName } from 'tnp-core/src';
import { BasePackageJson, Helpers, HelpersTaon } from 'tnp-helpers/src';

import {
  angularProjProxyPath,
  getProxyNgProj,
  templateFolderForArtifact,
} from '../../../../app-utils';
import {
  AngularJsonLibTaskNameResolveFor,
  appFromSrc,
  assetsFromNgProj,
  assetsFromSrc,
  binMainProject,
  browserFromCompiledDist,
  browserMainProject,
  BundledFiles,
  cliDtsNpmPackage,
  cliJSMapNpmPackage,
  cliJSNpmPackage,
  COMPILATION_COMPLETE_LIB_NG_BUILD,
  CoreAssets,
  CoreNgTemplateFiles,
  defaultConfiguration,
  distMainProject,
  dotFileTemplateExt,
  dotGitIgnoreMainProject,
  dotNpmIgnoreMainProject,
  dotNpmrcMainProject,
  indexDtsNpmPackage,
  indexJSNpmPackage,
  indexTsProd,
  libFromCompiledDist,
  libFromNpmPackage,
  libFromSrc,
  libs,
  localReleaseMainProject,
  MESSAGES,
  migrationsFromLib,
  nodeModulesMainProject,
  packageJsonNpmLib,
  prodSuffix,
  reExportJson,
  sourceLinkInNodeModules,
  splitNamespacesJson,
  srcMainProject,
  srcNgProxyProject,
  suffixLatest,
  TaonCommands,
  TaonGeneratedFiles,
  taonJsonMainProject,
  testsFromSrc,
  THIS_IS_GENERATED_INFO_COMMENT,
  tmpBaseHrefOverwrite,
  tmpLocalCopytoProjDist,
  tmpSrcDist,
  tmpSrcDistWebsql,
  websqlFromCompiledDist,
  websqlMainProject,
} from '../../../../constants';
import {
  EnvOptions,
  ReleaseArtifactTaon,
  ReleaseType,
} from '../../../../options';
import type { Project } from '../../project';
import { AssetsManager } from '../angular-node-app/tools/assets-manager';
import { BaseArtifact, ReleasePartialOutput } from '../base-artifact';

import { IncrementalBuildProcess } from './tools/build-isomorphic-lib/compilations/incremental-build-process';
import { CopyManager } from './tools/copy-manager/copy-manager';
import { FilesTemplatesBuilder } from './tools/files-recreation';
import { IndexAutogenProvider } from './tools/index-autogen-provider';
import { InsideStructuresLib } from './tools/inside-struct-lib';
import { CypressTestRunner } from './tools/test-runner/cypress-test-runner';
import { JestTestRunner } from './tools/test-runner/jest-test-runner';
import { MochaTestRunner } from './tools/test-runner/mocha-test-runner';
import { AppRoutesAutogenProvider } from './tools/app-routes-autogen-provider';
//#endregion

export class ArtifactNpmLibAndCliTool extends BaseArtifact<
  {
    //#region build output options
    /**
     * for non org: <path-to-release-folder>/tmpLocalCopytoProjDist/my-library/node_modules/my-library
     * for org: <path-to-release-folder>/tmpLocalCopytoProjDist/my-library/node_modules/@my-library
     */
    tmpProjNpmLibraryInNodeModulesAbsPath: string;
    /**
     * check if produced package is an organization package
     * (this can be from standalone with custom name OR container organization)
     */
    isOrganizationPackage?: boolean;
    /**
     * my-library or @my-library/my-inside-lib or @my-library/my-inside-lib/deep-core-lib
     */
    packageName?: string;
    //#endregion
  },
  ReleasePartialOutput
> {
  //#region fields

  public readonly __tests: MochaTestRunner;

  public readonly __testsJest: JestTestRunner;

  public readonly __testsCypress: CypressTestRunner;

  public readonly copyNpmDistLibManager: CopyManager;

  public readonly insideStructureLib: InsideStructuresLib;

  public readonly indexAutogenProvider: IndexAutogenProvider;
  public readonly appTsRoutesAutogenProvider: AppRoutesAutogenProvider;

  public readonly filesTemplatesBuilder: FilesTemplatesBuilder;

  public readonly assetsManager: AssetsManager;

  //#endregion

  //#region constructor

  //#region @backend
  constructor(project: Project) {
    super(project, ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL);

    this.__tests = new MochaTestRunner(project);
    this.__testsJest = new JestTestRunner(project);
    this.__testsCypress = new CypressTestRunner(project);

    this.copyNpmDistLibManager = CopyManager.for(project);
    this.indexAutogenProvider = new IndexAutogenProvider(project);
    this.appTsRoutesAutogenProvider = new AppRoutesAutogenProvider(project);
    this.filesTemplatesBuilder = new FilesTemplatesBuilder(project);
    this.insideStructureLib = new InsideStructuresLib(project);
    this.assetsManager = new AssetsManager(project);
  }
  //#endregion

  //#endregion

  //#region init partial

  async initPartial(initOptions: EnvOptions): Promise<EnvOptions> {
    //#region @backendFunc

    Helpers.taskStarted(
      `Initing project: ${chalk.bold(this.project.genericName)} ${
        initOptions.init.struct ? '(without packages install)' : ''
      } `,
    );

    // const updatedConfig =
    // if (updatedConfig) {
    //   initOptions = updatedConfig;
    // }

    if (this.project.framework.isStandaloneProject) {
      await this.insideStructureLib.init(initOptions);
      this.filesTemplatesBuilder.rebuild(initOptions);
    }

    if (this.project.framework.isStandaloneProject) {
      this.project.quickFixes.addMissingSrcFolderToEachProject();
      this.project.quickFixes.missingAngularLibFiles();
    }

    if (this.project.framework.isContainerCoreProject) {
      this.project.quickFixes.createDummyEmptyLibsReplacements([]); // TODO
      this.project.quickFixes.removeBadTypesInNodeModules();
    }

    if (this.project.framework.isStandaloneProject) {
      await this.project.artifactsManager.artifact.angularNodeApp.migrationHelper.runTask(
        {
          watch: false,
        },
      );
      await this.creteBuildInfoFile(initOptions);
      if (this.project.taonJson.shouldGenerateAutogenIndexFile) {
        await this.indexAutogenProvider.runTask({
          // watch: initOptions.build.watch, // TODO watching sucks here
        });
      } else {
        this.indexAutogenProvider.writeIndexFile(true);
      }
      if (this.project.taonJson.shouldGenerateAutogenAppRoutesFile) {
        await this.appTsRoutesAutogenProvider.runTask({
          // watch: initOptions.build.watch, // TODO watching sucks here
        });
      }
    }

    Helpers.log(
      `Init DONE for project: ${chalk.bold(this.project.genericName)} `,
    );

    this.project.quickFixes.makeSureDistFolderExists();

    // Helpers.info(`[buildLib] start of building ${websql ? '[WEBSQL]' : ''}`);

    this.copyEssentialFilesTo([
      crossPlatformPath([this.project.pathFor(distMainProject)]),
    ]);
    return initOptions;
    //#endregion
  }
  //#endregion

  //#region build partial
  async buildPartial(buildOptions: EnvOptions): Promise<{
    tmpProjNpmLibraryInNodeModulesAbsPath: string;
    isOrganizationPackage?: boolean;
    packageName?: string;
  }> {
    //#region @backendFunc

    if (!this.project.framework.isStandaloneProject) {
      Helpers.warn(
        `Project is not standalone. Skipping npm-lib-and-cli-tool build.`,
      );
      return;
    }
    const orgParams = buildOptions.clone();

    buildOptions = await this.project.artifactsManager.init(buildOptions);

    if (buildOptions.build.watch) {
      this.project.environmentConfig.watchAndRecreate(async () => {
        await this.project.environmentConfig.update(
          orgParams.clone({
            release: {
              targetArtifact: buildOptions.release.targetArtifact,
              envName: '__',
            },
          }),
          { fromWatcher: true, saveEnvToLibEnv: true },
        );
      });
    }

    const shouldSkipBuild = this.shouldSkipBuild(buildOptions);

    const packageName = this.project.nameForNpmPackage;
    const tmpProjNpmLibraryInNodeModulesAbsPath = this.project.pathFor([
      tmpLocalCopytoProjDist,
      nodeModulesMainProject,
      packageName,
    ]);
    const isOrganizationPackage =
      this.project.nameForNpmPackage.startsWith('@');

    if (shouldSkipBuild) {
      Helpers.warn(`

        Skipping build of npm-lib-and-cli-tool artifact...

        `);
      return {
        tmpProjNpmLibraryInNodeModulesAbsPath,
        isOrganizationPackage,
        packageName,
      };
    }

    Helpers.logInfo(
      `Start of (${buildOptions.build.watch ? 'watch' : 'normal'}) lib building...`,
    );

    //#region init incremental process
    const incrementalBuildProcess = new IncrementalBuildProcess(
      this.project,
      buildOptions,
    );
    //#endregion

    //#region init proxy projects
    const proxyProject = getProxyNgProj(
      this.project,
      buildOptions.clone({
        build: {
          websql: false,
        },
      }),
      ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    );

    const proxyProjectWebsql = getProxyNgProj(
      this.project,
      buildOptions.clone({
        build: {
          websql: true,
        },
      }),
      ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
    );
    Helpers.log(`

    proxy Proj = ${proxyProject?.location}
    proxy Proj websql = ${proxyProjectWebsql?.location}

    `);
    //#endregion

    //#region prepare commands + base href
    // const command = `${loadNvm} && ${this.npmRunNg} build ${this.name} ${watch ? '--watch' : ''}`;
    const commandForLibraryBuild = `${this.NPM_RUN_NG_COMMAND} build ${this.project.name} ${
      buildOptions.build.watch ? '--watch' : ''
    }`;

    const showInfoAngular = () => {
      Helpers.info(
        `Starting browser Angular/TypeScirpt build.... ${
          buildOptions.build.websql ? '[WEBSQL]' : ''
        }`,
      );
      Helpers.log(`

      ANGULAR ${this.project.framework.coreContainer?.packageJson.version} ${
        buildOptions.build.watch ? 'WATCH ' : ''
      } LIB BUILD STARTED... ${buildOptions.build.websql ? '[WEBSQL]' : ''}

      `);

      Helpers.log(` command: ${commandForLibraryBuild}`);
    };

    buildOptions.build.baseHref = !_.isUndefined(buildOptions.build.baseHref)
      ? buildOptions.build.baseHref
      : this.artifacts.angularNodeApp.angularFeBasenameManager.rootBaseHref;

    this.project.writeFile(tmpBaseHrefOverwrite, buildOptions.build.baseHref);

    Helpers.logInfo(`

    ${buildOptions.build.prod ? '[PROD]' : '[DEV]'} Building lib for base href: ${
      !_.isUndefined(buildOptions.build.baseHref)
        ? `'` + buildOptions.build.baseHref + `'`
        : '/ (default)'
    }

      `);
    //#endregion

    if (
      !buildOptions.build.watch &&
      buildOptions.release.releaseType &&
      !buildOptions.release.skipCodeCutting
    ) {
      this.__cutReleaseCodeFromSrc(buildOptions);
    }

    //#region incremental build
    if (!shouldSkipBuild) {
      await incrementalBuildProcess.runTask({
        taskName: 'isomorphic compilation',
        watch: buildOptions.build.watch,
      });
      await this.assetsManager.runTask({
        watch: buildOptions.build.watch,
      });
    }
    //#endregion

    showInfoAngular();

    //#region ng build
    const outputOptions = await this.outputFixNgLibBuild(buildOptions);

    const runNgBuild = async () => {
      await proxyProject.execute(commandForLibraryBuild, {
        similarProcessKey: TaonCommands.NG,
        resolvePromiseMsg: {
          stdout: buildOptions.build.watch
            ? COMPILATION_COMPLETE_LIB_NG_BUILD
            : undefined,
        },
        ...outputOptions,
      });
      await proxyProjectWebsql.execute(commandForLibraryBuild, {
        similarProcessKey: TaonCommands.NG,
        resolvePromiseMsg: {
          stdout: buildOptions.build.watch
            ? COMPILATION_COMPLETE_LIB_NG_BUILD
            : undefined,
        },
        ...outputOptions,
      });
    };
    //#endregion

    //#region set angular.json default tasks

    const tmpLibForDistNormalRelativePath = angularProjProxyPath({
      project: this.project,
      targetArtifact: buildOptions.release.targetArtifact,
      envOptions: buildOptions.clone({
        build: { websql: false },
      }),
    });

    const tmpLibForDistWebsqlRelativePath = angularProjProxyPath({
      project: this.project,
      targetArtifact: buildOptions.release.targetArtifact,
      envOptions: buildOptions.clone({
        build: { websql: true },
      }),
    });

    this.project.setValueToJSONC(
      [tmpLibForDistNormalRelativePath, CoreNgTemplateFiles.ANGULAR_JSON],
      `projects["${this.project.name}"].architect.build.${defaultConfiguration}`,
      AngularJsonLibTaskNameResolveFor(buildOptions),
    );

    this.project.setValueToJSONC(
      [tmpLibForDistWebsqlRelativePath, CoreNgTemplateFiles.ANGULAR_JSON],
      `projects["${this.project.name}"].architect.build.${defaultConfiguration}`,
      AngularJsonLibTaskNameResolveFor(buildOptions),
    );

    this.project.remove([tmpLibForDistNormalRelativePath, '.angular']);

    this.project.remove([tmpLibForDistWebsqlRelativePath, '.angular']);

    //#endregion

    //#region  handle watch & normal mode
    if (!shouldSkipBuild) {
      if (buildOptions.build.watch) {
        await runNgBuild();
      } else {
        try {
          await runNgBuild();
        } catch (e) {
          console.error(e);

          Helpers.throwError(
            `
          Command failed: ${commandForLibraryBuild}

          Not able to build project: ${this.project.genericName}`,
          );
        }
      }
    }
    //#endregion

    if (
      !buildOptions.build.watch &&
      buildOptions.release.releaseType &&
      !buildOptions.release.skipCodeCutting
    ) {
      this.__restoreCuttedReleaseCodeFromSrc(buildOptions);
    }

    //#region start copy manager
    if (!shouldSkipBuild) {
      if (!buildOptions.copyToManager.skip) {
        if (_.isFunction(buildOptions.copyToManager.beforeCopyHook)) {
          await buildOptions.copyToManager.beforeCopyHook();
        }
        this.copyNpmDistLibManager.init(buildOptions);
        await this.copyNpmDistLibManager.runTask({
          taskName: 'copyto manger',
          watch: buildOptions.build.watch,
        });
      }
    }
    //#endregion

    //#region show ending info
    this.showMesageWhenBuildLibDone(buildOptions);

    Helpers.info(
      buildOptions.build.watch
        ? `
     [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
     Files watcher started.. ${buildOptions.build.websql ? '[WEBSQL]' : ''}
   `
        : `
     [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
     End of Building ${this.project.genericName} ${buildOptions.build.websql ? '[WEBSQL]' : ''}

   `,
    );
    //#endregion

    return {
      tmpProjNpmLibraryInNodeModulesAbsPath,
      isOrganizationPackage,
      packageName,
    };
    //#endregion
  }
  //#endregion

  //#region release partial
  async releasePartial(
    releaseOptions: EnvOptions,
  ): Promise<ReleasePartialOutput> {
    //#region @backendFunc

    //#region prepare variables
    let releaseType: ReleaseType = releaseOptions.release.releaseType;

    releaseOptions = this.updateResolvedVersion(releaseOptions);

    // DEV BUILD
    const { tmpProjNpmLibraryInNodeModulesAbsPath } = await this.buildPartial(
      releaseOptions.clone({
        build: { prod: false, watch: false },
        copyToManager: {
          skip: true,
        },
      }),
    );

    // PROD BUILD

    await this.buildPartial(
      releaseOptions.clone({
        build: { prod: true, watch: false },
        copyToManager: {
          beforeCopyHook: () => {
            //#region copy prod build files to dist folder
            Helpers.logInfo(`Copying production build files to dist folder...`);

            //browser namespaces json
            HelpersTaon.copyFile(
              this.project.pathFor([
                distMainProject + prodSuffix,
                browserFromCompiledDist +
                  prodSuffix +
                  `.${splitNamespacesJson}`,
              ]),
              this.project.pathFor([
                distMainProject,
                browserFromCompiledDist +
                  prodSuffix +
                  `.${splitNamespacesJson}`,
              ]),
            );

            HelpersTaon.copyFile(
              this.project.pathFor([
                distMainProject + prodSuffix,
                browserFromCompiledDist + prodSuffix + `.${reExportJson}`,
              ]),
              this.project.pathFor([
                distMainProject,
                browserFromCompiledDist + prodSuffix + `.${reExportJson}`,
              ]),
            );

            //websql namespaces json
            HelpersTaon.copyFile(
              this.project.pathFor([
                distMainProject + prodSuffix,
                websqlFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
              ]),
              this.project.pathFor([
                distMainProject,
                websqlFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
              ]),
            );

            HelpersTaon.copyFile(
              this.project.pathFor([
                distMainProject + prodSuffix,
                websqlFromCompiledDist + prodSuffix + `.${reExportJson}`,
              ]),
              this.project.pathFor([
                distMainProject,
                websqlFromCompiledDist + prodSuffix + `.${reExportJson}`,
              ]),
            );

            //lib namespaces json
            HelpersTaon.copyFile(
              this.project.pathFor([
                distMainProject + prodSuffix,
                libFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
              ]),
              this.project.pathFor([
                distMainProject,
                libFromCompiledDist + prodSuffix + `.${splitNamespacesJson}`,
              ]),
            );

            HelpersTaon.copyFile(
              this.project.pathFor([
                distMainProject + prodSuffix,
                libFromCompiledDist + prodSuffix + `.${reExportJson}`,
              ]),
              this.project.pathFor([
                distMainProject,
                libFromCompiledDist + prodSuffix + `.${reExportJson}`,
              ]),
            );

            HelpersTaon.copy(
              this.project.pathFor([
                distMainProject + prodSuffix,
                browserMainProject,
              ]),
              this.project.pathFor([
                distMainProject,
                browserMainProject + prodSuffix,
              ]),
              { recursive: true, overwrite: true },
            );

            HelpersTaon.copy(
              this.project.pathFor([
                distMainProject + prodSuffix,
                websqlMainProject,
              ]),
              this.project.pathFor([
                distMainProject,
                websqlMainProject + prodSuffix,
              ]),
              { recursive: true, overwrite: true },
            );

            HelpersTaon.copy(
              this.project.pathFor([
                distMainProject + prodSuffix,
                libFromCompiledDist,
              ]),
              this.project.pathFor([
                distMainProject,
                libFromCompiledDist + prodSuffix,
              ]),
              { recursive: true, overwrite: true },
            );
            //#endregion
          },
        },
      }),
    );

    let releaseProjPath: string = tmpProjNpmLibraryInNodeModulesAbsPath;

    //#endregion

    if (releaseOptions.release.releaseType !== ReleaseType.LOCAL) {
      this.removeNotNpmRelatedFilesFromReleaseBundle(releaseProjPath);
    }

    this.copyEssentialFilesTo([tmpProjNpmLibraryInNodeModulesAbsPath]);

    this.packResource(tmpProjNpmLibraryInNodeModulesAbsPath);

    this.fixPackageJsonForRelease(
      tmpProjNpmLibraryInNodeModulesAbsPath,
      releaseOptions.release.resolvedNewVersion,
    );

    this.preparePackageJsonForReleasePublish(
      tmpProjNpmLibraryInNodeModulesAbsPath,
    );

    await this.runAfterReleaseJsCodeActions(
      tmpProjNpmLibraryInNodeModulesAbsPath,
      releaseOptions,
    );

    const projFromCompiled = this.project.ins.From(
      tmpProjNpmLibraryInNodeModulesAbsPath,
    );

    const allowedToNpmReleases: ReleaseType[] = [
      ReleaseType.MANUAL,
      ReleaseType.CLOUD,
    ];

    // console.log(`

    //   doNotIncludeLibFiles: ${releaseOptions.release.lib.doNotIncludeLibFiles}

    //   `);

    const clearLibFiles = (folderAbsPath: string) => {
      Helpers.remove([folderAbsPath, libFromSrc]);
      Helpers.remove([folderAbsPath, libFromSrc + prodSuffix]);
      Helpers.remove([folderAbsPath, sourceLinkInNodeModules]);
      Helpers.remove([folderAbsPath, assetsFromSrc]);
      Helpers.remove([folderAbsPath, browserMainProject]);
      Helpers.remove([folderAbsPath, browserMainProject + prodSuffix]);
      Helpers.remove([folderAbsPath, folderName.client]); // TODO REMOVE
      Helpers.remove([folderAbsPath, websqlMainProject]);
      Helpers.remove([folderAbsPath, websqlMainProject + prodSuffix]);
      Helpers.remove([folderAbsPath, migrationsFromLib]);
      Helpers.remove([folderAbsPath, srcMainProject]);
      Helpers.remove([folderAbsPath, 'src.*']);
      Helpers.remove([folderAbsPath, 'index.*']);
      Helpers.remove([folderAbsPath, cliDtsNpmPackage]);
      Helpers.remove([folderAbsPath, cliJSMapNpmPackage]);
      HelpersTaon.setValueToJSON(
        [folderAbsPath, packageJsonNpmLib],
        'scripts',
        {},
      );
    };

    if (
      releaseOptions.release.lib.doNotIncludeLibFiles &&
      releaseOptions.release.releaseType !== ReleaseType.LOCAL
    ) {
      clearLibFiles(releaseProjPath);
    }

    //#region remove lagacy file from final bundle
    Helpers.remove([
      tmpProjNpmLibraryInNodeModulesAbsPath,
      fileName.package_json__devDependencies_json,
    ]);

    Helpers.remove([
      tmpProjNpmLibraryInNodeModulesAbsPath,
      fileName.package_json__tnp_json5,
    ]);

    Helpers.remove([
      tmpProjNpmLibraryInNodeModulesAbsPath,
      fileName.package_json__tnp_json,
    ]);

    Helpers.remove([
      tmpProjNpmLibraryInNodeModulesAbsPath,
      fileName.tnpEnvironment_json,
    ]);

    Helpers.remove([
      tmpProjNpmLibraryInNodeModulesAbsPath,
      taonJsonMainProject,
    ]);
    Helpers.remove([tmpProjNpmLibraryInNodeModulesAbsPath, migrationsFromLib]);
    Helpers.remove([tmpProjNpmLibraryInNodeModulesAbsPath, 'firedev.jsonc']);
    Helpers.remove([tmpProjNpmLibraryInNodeModulesAbsPath, 'client']);
    //#endregion

    if (allowedToNpmReleases.includes(releaseOptions.release.releaseType)) {
      if (!releaseOptions.release.skipNpmPublish) {
        await projFromCompiled.releaseProcess.publishToNpm(
          tmpProjNpmLibraryInNodeModulesAbsPath,
          releaseOptions.release.autoReleaseUsingConfig,
        );
      }
    } else {
      if (releaseOptions.release.releaseType === ReleaseType.LOCAL) {
        //#region local release
        const releaseDest = this.project.pathFor([
          localReleaseMainProject,
          this.currentArtifactName,
          `${this.project.name}${suffixLatest}`,
        ]);
        Helpers.remove(releaseDest, true);
        HelpersTaon.copy(releaseProjPath, releaseDest);

        Helpers.taskStarted(`Installing dependencies for local release...`);
        Helpers.run(`npm install`, { cwd: releaseProjPath }).sync();
        Helpers.taskDone(`Dependencies installed for local release.`);

        releaseProjPath = releaseDest;
        if (releaseOptions.release.lib.doNotIncludeLibFiles) {
          clearLibFiles(releaseProjPath);
        }
        this.removeNotNpmRelatedFilesFromReleaseBundle(releaseProjPath);

        if (releaseOptions.release.installLocally) {
          // console.log('SHOULD INSTALL LOCALLY');
          Helpers.taskStarted('Linking local package globally...');
          Helpers.run(`npm link`, { cwd: releaseProjPath }).sync();
          Helpers.taskDone(`Done linking local package globally.

            Now you can use it globally via CLI:
            ${this.project.nameForCli} <command>

            `);
        }

        Helpers.info(`Local release done: ${releaseDest}`);
        //#endregion
      }
    }

    return {
      resolvedNewVersion: releaseOptions.release.resolvedNewVersion,
      releaseProjPath,
      releaseType,
      projectsReposToPushAndTag: [this.project.location],
    };
    //#endregion
  }
  //#endregion

  //#region clear partial
  async clearPartial(options?: EnvOptions): Promise<void> {
    // TODO make it better
    while (true) {
      try {
        rimraf.sync(this.project.pathFor(distMainProject) + '*');
        rimraf.sync(this.project.pathFor(folderName.tmp) + '*');
        return;
      } catch (error) {
        HelpersTaon.pressKeyAndContinue(
          MESSAGES.SHUT_DOWN_FOLDERS_AND_DEBUGGERS,
        );
        continue;
      }
    }
  }

  /**
   * TODO
   * @param options
   * @returns
   */
  async clearLib(options: EnvOptions) {
    //#region @backendFunc
    Helpers.taskStarted(`Cleaning project: ${this.project.genericName}`);

    if (
      this.project.typeIs(LibTypeEnum.UNKNOWN) ||
      this.project.typeIs(LibTypeEnum.UNKNOWN_NPM_PROJECT)
    ) {
      return;
    }

    while (true) {
      try {
        rimraf.sync(
          crossPlatformPath([this.project.location, folderName.tmp + '*']),
        );
        rimraf.sync(
          crossPlatformPath([this.project.location, folderName.dist + '*']),
        );
        try {
          this.project.removeFile(nodeModulesMainProject);
        } catch (error) {
          this.project.remove(nodeModulesMainProject);
        }
        this.project.removeFile(browserMainProject);
        this.project.removeFile(websqlMainProject);
        this.project.removeFile(browserMainProject + prodSuffix);
        this.project.removeFile(websqlMainProject + prodSuffix);
        this.project.removeFile(fileName.tnpEnvironment_json);
        if (this.project.framework.isCoreProject) {
          return;
        }

        glob
          .sync(`${this.project.location}/*${dotFileTemplateExt}`)
          .forEach(fileTemplate => {
            Helpers.remove(fileTemplate);
            Helpers.remove(fileTemplate.replace(dotFileTemplateExt, ''));
          });

        this.project.removeFile(fileName.tnpEnvironment_json);
        break;
      } catch (error) {
        HelpersTaon.pressKeyAndContinue(
          MESSAGES.SHUT_DOWN_FOLDERS_AND_DEBUGGERS,
        );
      }
    }

    this.project.quickFixes.addMissingSrcFolderToEachProject();
    Helpers.info(`Cleaning project: ${this.project.genericName} done`);

    if (options.recursiveAction) {
      for (const child of this.project.children) {
        await child.clear(options);
      }
    }
    //#endregion
  }

  //#endregion

  //#region unlink node_modules when tnp
  public unlinkNodeModulesWhenTnp(): void {
    //#region @backendFunc
    let shouldUnlinkNodeModules = false;
    if (config.frameworkName === 'tnp') {
      // TODO QUICK_FIX
      const { isCoreContainer, coreContainerFromNodeModules } =
        this.project.framework.containerDataFromNodeModulesLink;

      const isIncorrectLinkToNodeModules =
        !!coreContainerFromNodeModules &&
        this.project.taonJson.frameworkVersion !==
          coreContainerFromNodeModules.taonJson.frameworkVersion;

      shouldUnlinkNodeModules =
        isCoreContainer &&
        isIncorrectLinkToNodeModules &&
        this.project.nodeModules.isLink;
    }

    if (shouldUnlinkNodeModules) {
      this.project.nodeModules.unlinkNodeModulesWhenLinked();
    }

    //#region TODO LAST TEST THIS ON WINDOWS
    // if (
    //   !Helpers.isSymlinkFileExitedOrUnexisted(this.project.nodeModules.path)
    // ) {
    //   Helpers.taskStarted('Checking if node_modules folder is correct...');
    //   const minDepsLength = Object.keys(
    //     this.project.npmHelpers.packageJson.allDependencies,
    //   ).length;

    //   const notFullyInstalled =
    //     Helpers.findChildren(this.project.nodeModules.path, c => c).length <
    //     minDepsLength + 1;

    //   if (notFullyInstalled) {
    //     try {
    //       Helpers.info(`Removing incorrect node_modules folder...`);
    //       Helpers.removeSymlinks(this.project.nodeModules.path);
    //       Helpers.remove(this.project.nodeModules.path, true);
    //     } catch (error) {}
    //   }
    //   Helpers.taskDone('Checking if node_modules folder is correct DONE...');
    // }
    //#endregion

    //#endregion
  }
  //#endregion

  //#region private methods

  //#region private methods / fix release package.json
  private fixPackageJsonForRelease(
    releaseProjPath: string,
    newVersion: string,
  ): void {
    //#region @backendFunc
    const folderToFix = [
      browserMainProject,
      websqlMainProject,
      browserMainProject + prodSuffix,
      websqlMainProject + prodSuffix,
    ];

    for (const folder of folderToFix) {
      const folderAbsPath = crossPlatformPath([releaseProjPath, folder]);
      Helpers.remove([folderAbsPath, dotNpmIgnoreMainProject]);

      // const rootPackageNameForChildBrowser = crossPlatformPath([
      //   this.project.nameForNpmPackage,
      //   folder,
      // ]);
      // const childName = _.kebabCase(this.project.nameForNpmPackage);
      // const browserOrWebsql = _.last(rootPackageNameForChildBrowser.split('/'));
      HelpersTaon.setValueToJSON(
        [folderAbsPath, packageJsonNpmLib],
        'sideEffects',
        this.project.packageJson.sideEffects,
      );
      HelpersTaon.setValueToJSON(
        [folderAbsPath, packageJsonNpmLib],
        'version',
        newVersion,
      );
    }

    const prodbrowsefoldersToFix = [
      browserMainProject + prodSuffix,
      websqlMainProject + prodSuffix,
    ];

    for (const folder of prodbrowsefoldersToFix) {
      const folderAbsPath = crossPlatformPath([releaseProjPath, folder]);
      HelpersTaon.setValueToJSON(
        [folderAbsPath, packageJsonNpmLib],
        'name',
        crossPlatformPath([this.project.nameForNpmPackage, folder]),
      );
    }

    const folderToFixBackend = [
      libFromNpmPackage,
      libFromNpmPackage + prodSuffix,
    ];

    for (const folder of folderToFixBackend) {
      const folderAbsPath = crossPlatformPath([releaseProjPath, folder]);
      Helpers.remove([folderAbsPath, dotNpmIgnoreMainProject]);

      const packageName = crossPlatformPath([
        this.project.nameForNpmPackage,
        folder,
      ]);

      const pjBackendLib = {
        name: packageName,
        version: newVersion,
        // ! TODO @LAST ADD ESM SUPPORT
        // sideEffects: this.project.packageJson.sideEffects,
        // module: 'fesm2022/json10-writer-browser.mjs',
        // typings: 'types/json10-writer-browser.d.ts',
        // exports: {
        //   './package.json': {
        //     default: './package.json',
        //   },
        //   '.': {
        //     types: './types/json10-writer-browser.d.ts',
        //     default: './fesm2022/json10-writer-browser.mjs',
        //   },
        // },
      };
      Helpers.writeJson([folderAbsPath, packageJsonNpmLib], pjBackendLib);
    }

    //#endregion
  }
  //#endregion

  //#region private methods / run after release js code actions
  private async runAfterReleaseJsCodeActions(
    releaseAbsPath: string,
    releaseOptions: EnvOptions,
  ): Promise<void> {
    //#region cli
    if (releaseOptions.release.cli.includeNodeModules) {
      // await this.project.nodeModules.removeOwnPackage(async () => {
      await this.backendIncludeNodeModulesInCompilation(
        releaseAbsPath,
        releaseOptions.release.cli.minify,
        releaseOptions.build.prod,
      );
      // });
    }

    const reservedNames = ['reservedExpSec', 'reservedExpOne'];

    if (releaseOptions.release.cli.uglify) {
      await this.backendMinifyCode({
        releaseAbsPath,
        strategy: 'cli-only',
        reservedNames,
        compress: releaseOptions.release.cli.compress,
      });
    }

    if (releaseOptions.release.cli.obscure) {
      await this.backendObscureCode({
        releaseAbsPath,
        strategy: 'cli-only',
        reservedNames,
      });
    }
    //#endregion

    //#region lib
    if (releaseOptions.release.lib.removeDts) {
      await this.backendReleaseRemoveDts(releaseAbsPath);
    }

    if (releaseOptions.release.lib.uglifyFileByFile) {
      await this.backendMinifyCode({
        releaseAbsPath,
        strategy: 'lib-only',
        reservedNames,
        compress: releaseOptions.release.lib.compress,
      });
    }

    if (releaseOptions.release.lib.obscureFileByFile) {
      await this.backendObscureCode({
        releaseAbsPath,
        strategy: 'lib-only',
        reservedNames,
      });
    }
    //#endregion

    // await this.backendRemoveJsMapsFrom(releaseAbsPath);
  }

  //#endregion

  //#region private methods / prepare package json for release publish
  private preparePackageJsonForReleasePublish(relaseAbsPath: string): void {
    //#region @backendFunc
    const pathInRelease = crossPlatformPath([relaseAbsPath, packageJsonNpmLib]);
    HelpersTaon.copyFile(this.project.packageJson.path, pathInRelease);

    const pj = new BasePackageJson({
      cwd: relaseAbsPath,
    });
    const dependencies = pj.dependencies;
    pj.setDependencies({});
    if (this.project.taonJson.dependenciesNamesForNpmLib) {
      pj.setDependencies(
        [
          ...this.project.taonJson.dependenciesNamesForNpmLib,
          ...this.project.taonJson.isomorphicDependenciesForNpmLib,
        ].reduce((a, b) => {
          return { ...a, [b]: dependencies[b] };
        }, {}),
      );
    }

    if (this.project.taonJson.peerDependenciesNamesForNpmLib) {
      pj.setPeerDependencies(
        this.project.taonJson.peerDependenciesNamesForNpmLib.reduce((a, b) => {
          return { ...a, [b]: dependencies[b] };
        }, {}),
      );
    }

    if (this.project.taonJson.devDependenciesNamesForNpmLib) {
      pj.setDevDependencies(
        this.project.taonJson.devDependenciesNamesForNpmLib.reduce((a, b) => {
          return { ...a, [b]: dependencies[b] };
        }, {}),
      );
    }

    const optionalDeps = pj.optionalDependencies;

    if (this.project.taonJson.optionalDependenciesNamesForNpmLib) {
      pj.setOptionalDependencies(
        this.project.taonJson.optionalDependenciesNamesForNpmLib.reduce(
          (a, b) => {
            return { ...a, [b]: optionalDeps[b] };
          },
          {},
        ),
      );
    }

    if (!pj.repository) {
      pj.setRepository({
        type: 'git',
        url: HelpersTaon.git.originSshToHttp(this.project.git.originURL),
      });
    }

    //#endregion
  }
  //#endregion

  //#region private methods / remove not npm releated files from release bundle
  private removeNotNpmRelatedFilesFromReleaseBundle(
    releaseAbsPath: string,
  ): void {
    //#region @backendFunc
    Helpers.remove(`${releaseAbsPath}/${appFromSrc}*`); // QUICK_FIX
    Helpers.remove(`${releaseAbsPath}/${testsFromSrc}*`); // QUICK_FIX
    Helpers.remove(`${releaseAbsPath}/${srcMainProject}`, true); // QUICK_FIX
    // Helpers.removeFileIfExists(`${relaseAbsPath}/source`);

    // regenerate src.d.ts
    Helpers.writeFile(
      crossPlatformPath([releaseAbsPath, 'src.d.ts']),
      `
${THIS_IS_GENERATED_INFO_COMMENT}
export * from './${libFromSrc}';
${THIS_IS_GENERATED_INFO_COMMENT}
// please use command: taon build:watch to see here links for your globally builded lib code files
${THIS_IS_GENERATED_INFO_COMMENT}
    `.trimStart(),
    );

    //#endregion
  }

  //#endregion

  //#region private methods / fix terminal output paths
  private async outputFixNgLibBuild(buildOptions: EnvOptions): Promise<any> {
    return {
      // askToTryAgainOnError: true,
      exitOnErrorCallback: async code => {
        if (buildOptions.release.releaseType) {
          throw 'Typescript compilation lib error';
        } else {
          Helpers.error(
            `[${config.frameworkName}] Typescript compilation lib error (code=${code})`,
            false,
            true,
          );
        }
      },
      outputLineReplace: (line: string) => {
        // line = UtilsString.removeChalkSpecialChars(line);
        if (line.startsWith('WARNING: postcss-url')) {
          return ' --- [taon] IGNORED WARN ---- ';
        }
        line = line.replace(
          `projects/${this.project.name}/${srcMainProject}/`,
          `./${srcMainProject}/`,
        );

        if (line.includes(`../../${nodeModulesMainProject}/`)) {
          line = line.replace(
            `../../${nodeModulesMainProject}/`,
            `./${nodeModulesMainProject}/`,
          );
        }

        // ../../../../tmpSrcDistWebsql/lib/layout-proj-ng-related/layout-proj-ng-related.component.scss
        if (line.includes(`../../../../${tmpSrcDistWebsql + prodSuffix}/`)) {
          line = line.replace(
            `../../../../${tmpSrcDistWebsql + prodSuffix}/`,
            `./${srcMainProject}/`,
          );
        }

        if (line.includes(`../../../../${tmpSrcDistWebsql}/`)) {
          line = line.replace(
            `../../../../${tmpSrcDistWebsql}/`,
            `./${srcMainProject}/`,
          );
        }

        if (line.includes(`../../../../${tmpSrcDist + prodSuffix}/`)) {
          line = line.replace(
            `../../../../${tmpSrcDist + prodSuffix}/`,
            `./${srcMainProject}/`,
          );
        }

        if (line.includes(`../../../../${tmpSrcDist}/`)) {
          line = line.replace(
            `../../../../${tmpSrcDist}/`,
            `./${srcMainProject}/`,
          );
        }

        if (line.search(`/${srcMainProject}/${libs}/`) !== -1) {
          const [__, ___, ____, moduleName] = line.split('/');
          // console.log({
          //   moduleName,
          //   standalone: 'inlib'
          // })
          return line.replace(
            `/${srcMainProject}/${libs}/${moduleName}/`,
            `/${moduleName}/${srcMainProject}/${libFromSrc}/`,
          );
        }

        return line;
      },
    } as CoreModels.ExecuteOptions;
  }
  //#endregion

  //#region private methods / pack resources
  private packResource(releaseDistFolder: string): void {
    //#region @backendFunc
    if (!fse.existsSync(releaseDistFolder)) {
      fse.mkdirSync(releaseDistFolder);
    }

    [...this.project.taonJson.resources].forEach(res => {
      //  copy resource to org build and copy shared assets
      const file = path.join(this.project.location, res);
      const dest = path.join(releaseDistFolder, res);

      if (!fse.existsSync(file)) {
        throw new Error(
          `[${config.frameworkName}][lib-project] Resource file: ${chalk.bold(
            path.basename(file),
          )} does not ` +
            `exist in "${this.project.genericName}"  (package.json > resources[])
        `,
        );
      }

      if (fse.lstatSync(file).isDirectory()) {
        // console.log('IS DIRECTORY', file)
        // console.log('IS DIRECTORY DEST', dest)
        const filter = src => {
          return !/.*node_modules.*/g.test(src);
        };
        HelpersTaon.copy(file, dest, { filter });
      } else {
        // console.log('IS FILE', file)
        fse.copyFileSync(file, dest);
      }
    });
    Helpers.logInfo(`Resources copied to release folder: ${distMainProject}`);
    //#endregion
  }
  //#endregion

  //#region private methods / copy essential files
  private copyEssentialFilesTo(toDestinations: string[]): void {
    //#region @backendFunc
    this.copyWhenExist(binMainProject, toDestinations);

    this.copyWhenExist(dotNpmrcMainProject, toDestinations);
    this.copyWhenExist(dotNpmIgnoreMainProject, toDestinations);
    this.copyWhenExist(dotGitIgnoreMainProject, toDestinations);
    //#endregion
  }
  //#endregion

  //#region private methods / copy when exists
  private copyWhenExist(relativePath: string, destinations: string[]): void {
    //#region @backendFunc
    const absPath = crossPlatformPath([this.project.location, relativePath]);

    for (let index = 0; index < destinations.length; index++) {
      const dest = crossPlatformPath([destinations[index], relativePath]);
      if (Helpers.exists(absPath)) {
        if (Helpers.isFolder(absPath)) {
          Helpers.remove(dest, true);
          HelpersTaon.copy(absPath, dest, { recursive: true });
        } else {
          HelpersTaon.copyFile(absPath, dest);
        }
      } else {
        Helpers.log(`[isomorphic-lib][copyWhenExist] not exists: ${absPath}`);
      }
    }
    //#endregion
  }
  //#endregion

  //#region private methods / link when exists
  private linkWhenExist(relativePath: string, destinations: string[]): void {
    //#region @backendFunc
    let absPath = path.join(this.project.location, relativePath);

    if (Helpers.exists(absPath) && Helpers.isExistedSymlink(absPath)) {
      absPath = HelpersTaon.pathFromLink(absPath);
    }

    for (let index = 0; index < destinations.length; index++) {
      const dest = crossPlatformPath([destinations[index], relativePath]);
      if (Helpers.exists(absPath)) {
        Helpers.remove(dest, true);
        Helpers.createSymLink(absPath, dest);
      }
    }
    //#endregion
  }
  //#endregion

  //#region private methods / compile/cliBuildUglify backend code
  private backendMinifyCode(options: {
    strategy: 'lib-and-cli' | 'cli-only' | 'lib-only';
    releaseAbsPath: string;
    reservedNames: string[];
    compress: boolean;
  }): void {
    //#region @backendFunc
    const { strategy, releaseAbsPath, reservedNames, compress } = options;
    Helpers.taskStarted(`Minifying started , strategy: ${strategy}`);
    const cliJsPath = crossPlatformPath([releaseAbsPath, 'cli.js']);

    const files =
      strategy === 'cli-only'
        ? [cliJsPath]
        : [
            ...(strategy === 'lib-and-cli' ? [cliJsPath] : []),
            ...Helpers.filesFrom([releaseAbsPath, 'lib'], true).filter(f =>
              f.endsWith('.js'),
            ),
          ];

    for (const fileAbsPath of files) {
      const uglifiedTempPath = crossPlatformPath([
        path.dirname(fileAbsPath),
        path.basename(fileAbsPath).replace('.js', '') + '.min.js',
      ]);
      Helpers.logInfo(
        `minifying ${fileAbsPath} to ${path.basename(uglifiedTempPath)}`,
      );
      const command =
        `npm-run uglifyjs ${fileAbsPath} ${compress ? '--compress' : ''} ` +
        ` --output ${uglifiedTempPath} -b` +
        ` --mangle reserved=[${reservedNames.map(n => `'${n}'`).join(',')}]`;
      // + ` --mangle-props reserved=[${reservedNames.join(',')}]` // it breakes code
      this.project.run(command, { biggerBuffer: false }).sync();
      Helpers.removeFileIfExists(fileAbsPath);
      HelpersTaon.copyFile(uglifiedTempPath, fileAbsPath);
      Helpers.removeFileIfExists(uglifiedTempPath);
    }
    Helpers.taskDone(`Minifying done , strategy: ${strategy}`);
    //#endregion
  }
  //#endregion

  //#region private methods / compile/cliBuildObscure backend code
  private backendObscureCode(options: {
    strategy: 'lib-and-cli' | 'cli-only' | 'lib-only';
    releaseAbsPath: string;
    reservedNames: string[];
  }): void {
    //#region @backendFunc
    const { strategy, releaseAbsPath, reservedNames } = options;
    const cliJsPath = crossPlatformPath([releaseAbsPath, 'cli.js']);

    const files =
      strategy === 'cli-only'
        ? [cliJsPath]
        : [
            ...(strategy === 'lib-and-cli' ? [cliJsPath] : []),
            ...Helpers.filesFrom([releaseAbsPath, 'lib'], true).filter(f =>
              f.endsWith('.js'),
            ),
          ];

    for (const fileAbsPath of files) {
      const uglifiedTempPath = crossPlatformPath([
        path.dirname(fileAbsPath),
        path.basename(fileAbsPath).replace('.js', '') + '.min.js',
      ]);
      const command =
        `npm-run javascript-obfuscator ${fileAbsPath} ` +
        ` --output ${uglifiedTempPath}` +
        ` --target node` +
        ` --string-array-rotate true` +
        // + ` --stringArray true`
        ` --string-array-encoding base64` +
        ` --reserved-names '${reservedNames.join(',')}'` +
        ` --reserved-strings '${reservedNames.join(',')}'`;

      this.project.run(command, { biggerBuffer: false }).sync();
      Helpers.removeFileIfExists(fileAbsPath);
      HelpersTaon.copyFile(uglifiedTempPath, fileAbsPath);
      Helpers.removeFileIfExists(uglifiedTempPath);
    }

    //#endregion
  }
  //#endregion

  //#region getters & methods / remove (m)js.map files from release
  /**
   * because of that
   * In vscode there is a mess..
   * TODO
   */
  private async backendRemoveJsMapsFrom(
    absPathReleaseDistFolder: string,
  ): Promise<void> {
    //#region @backendFunc
    Helpers.getFilesFrom([absPathReleaseDistFolder, libFromCompiledDist], {
      recursive: true,
    })
      .filter(f => f.endsWith('.js.map') || f.endsWith('.mjs.map'))
      .forEach(f => Helpers.removeFileIfExists(f));

    Helpers.removeFileIfExists([absPathReleaseDistFolder, cliJSMapNpmPackage]);
    //#endregion
  }
  //#endregion

  //#region private methods / include remove dts
  /**
   * remove dts files from release
   */
  private async backendReleaseRemoveDts(
    releaseFolderAbsPath: string,
  ): Promise<void> {
    //#region @backendFunc

    Helpers.getFilesFrom([releaseFolderAbsPath, libFromCompiledDist], {
      recursive: true,
    })
      .filter(f => f.endsWith('.d.ts'))
      .forEach(f => Helpers.removeFileIfExists(f));

    Helpers.removeFileIfExists([releaseFolderAbsPath, cliDtsNpmPackage]);

    Helpers.writeFile(
      [releaseFolderAbsPath, `${libFromSrc}/${indexDtsNpmPackage}`],
      `export declare const dummy${new Date().getTime()};`,
    );
    //#endregion
  }
  //#endregion

  //#region private methods / build info
  private async creteBuildInfoFile(initOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    initOptions = EnvOptions.from(initOptions);
    if (this.project.framework.isStandaloneProject) {
      const dest = this.project.pathFor([
        srcMainProject,
        libFromSrc,
        TaonGeneratedFiles.build_info_generated_ts,
      ]);
      Helpers.writeFile(
        dest,
        `${THIS_IS_GENERATED_INFO_COMMENT}
/**
 *  Autogenerated by current cli tool
 */
export const BUILD_FRAMEWORK_CLI_NAME = '${config.frameworkName}';
/**
 *  This value can be change in taon.jsonc (appId)
 */
export const APP_ID = '${initOptions.appId}';
/**
 *  Autogenerated by current cli tool
 */
export const BUILD_BASE_HREF = '${initOptions.build?.baseHref || ''}';
/**
 *  This value can be change in taon.jsonc (overrideNpmName)
 */
export const PROJECT_NPM_NAME = '${this.project.nameForNpmPackage}';
/**
 * Taon version from you project taon.json
 */
export const CURRENT_PACKAGE_TAON_VERSION = '${this.project.taonJson.frameworkVersion}';
/**
 *  Autogenerated by current cli tool. Use *${config.frameworkName} release* to bump version.
 */
export const CURRENT_PACKAGE_VERSION = '${
          initOptions.release.releaseType &&
          initOptions.release.resolvedNewVersion
            ? initOptions.release.resolvedNewVersion
            : this.project.packageJson.version
        }';
${THIS_IS_GENERATED_INFO_COMMENT}
      `,
      );
    }

    //#endregion
  }
  //#endregion

  //#region private methods / show message when build lib done for smart container
  private showMesageWhenBuildLibDone(buildOptions: EnvOptions): void {
    //#region @backendFunc
    if (buildOptions.release.releaseType) {
      Helpers.logInfo(
        `${buildOptions.build.prod ? '[PROD]' : '[DEV]'} Lib build part done...  `,
      );
      return;
    }
    const buildLibDone = `LIB BUILD DONE.. `;
    const ifapp =
      'if you want to start app build -> please run in other terminal command:';

    // const bawOrba = buildOptions.watch ? 'baw' : 'ba';
    const bawOrbaLong = buildOptions.build.watch
      ? ' build:app:watch '
      : ' build:app ';
    const bawOrbaLongWebsql = buildOptions.build.watch
      ? 'build:app:watch --websql'
      : 'build:app --websql';

    Helpers.taskDone(`${chalk.underline(`${buildLibDone}...`)}`);
    Helpers.success(`

      ${ifapp}

      ${chalk.bold(config.frameworkName + bawOrbaLong)}
      or
      ${config.frameworkName} ${bawOrbaLongWebsql}
      `);

    //#endregion
  }
  //#endregion

  //#region private methods / include node_modules in compilation
  async backendIncludeNodeModulesInCompilation(
    releaseAbsLocation: string,
    minify: boolean,
    prod: boolean,
  ): Promise<void> {
    //#region @backendFunc

    const destCliTSProd = crossPlatformPath([releaseAbsLocation, indexTsProd]);

    let destCli = crossPlatformPath([releaseAbsLocation, indexJSNpmPackage]);
    const destCliMin = crossPlatformPath([releaseAbsLocation, cliJSNpmPackage]);

    if (prod) {
      Helpers.writeFile(
        destCliTSProd,
        `export * from './${libFromCompiledDist}${prodSuffix}';\n`,
      );
      destCli = destCliTSProd;
    }

    await HelpersTaon.bundleCodeIntoSingleFile(destCli, destCliMin, {
      minify,
      additionalExternals: [
        ...this.project.taonJson.additionalExternalsFor(
          ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        ),
      ],
      additionalReplaceWithNothing: [
        ...this.project.taonJson.additionalReplaceWithNothingFor(
          ReleaseArtifactTaon.NPM_LIB_PKG_AND_CLI_TOOL,
        ),
      ],
    });

    // copy wasm file for dest
    const wasmfileSource = crossPlatformPath([
      this.project.ins
        .by(LibTypeEnum.ISOMORPHIC_LIB, this.project.framework.frameworkVersion)
        .pathFor([
          templateFolderForArtifact(this.currentArtifactName),
          srcNgProxyProject,
          assetsFromNgProj,
          CoreAssets.sqlWasmFile,
        ]),
    ]);

    const wasmfileDest = crossPlatformPath([
      releaseAbsLocation,
      CoreAssets.sqlWasmFile,
    ]);
    HelpersTaon.copyFile(wasmfileSource, wasmfileDest);

    const destStartJS = crossPlatformPath([
      releaseAbsLocation,
      `${binMainProject}/start.js`,
    ]);
    Helpers.writeFile(
      destStartJS,
      `console.log('<<< USING BUNDLED CLI >>>');\n` +
        `global.taonUsingBundledCliMode = true;\n` +
        `global.frameworkName = "${this.project.nameForCli}";` +
        `\n${Helpers.readFile(destStartJS)}`,
    );

    Helpers.writeFile(
      crossPlatformPath([releaseAbsLocation, BundledFiles.CLI_README_MD]),
      `# ${this.project.name} CLI\n\n
## Installation as global tool
\`\`\`bash
npm link
\`\`\`
    `,
    );
    //#endregion
  }
  //#endregion

  //#endregion
}
