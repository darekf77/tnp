//#region imports
import { config } from 'tnp-config/src';
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
import { Helpers, UtilsQuickFixes } from 'tnp-helpers/src';
import { PackageJson } from 'type-fest';

import {
  COMPILATION_COMPLETE_LIB_NG_BUILD,
  DEFAULT_PORT,
  MESSAGES,
  tmpBaseHrefOverwriteRelPath,
} from '../../../../constants';
import { EnvOptions, ReleaseType } from '../../../../options';
import type { Project } from '../../project';
import { BaseArtifact } from '../base-artifact';

import { IncrementalBuildProcess } from './tools/build-isomorphic-lib/compilations/incremental-build-process';
import { CopyManager } from './tools/copy-manager/copy-manager';
import {
  FilesRecreator,
  FilesTemplatesBuilder,
} from './tools/files-recreation';
import { IndexAutogenProvider } from './tools/index-autogen-provider';
import { InsideStructuresLib } from './tools/inside-structures/inside-structures';
import { LibProjectStandalone } from './tools/lib-project/lib-project-standalone';
import { CypressTestRunner } from './tools/test-runner/cypress-test-runner';
import { JestTestRunner } from './tools/test-runner/jest-test-runner';
import { MochaTestRunner } from './tools/test-runner/mocha-test-runner';

//#endregion

export class ArtifactNpmLibAndCliTool extends BaseArtifact<
  {
    //#region build output options
    /**
     * for non org: <path-to-release-folder>/tmp-local-temp-proj/my-library/node_modules/my-library
     * for org: <path-to-release-folder>/tmp-local-temp-proj/my-library/node_modules/@my-library
     */
    tmpProjNpmLibraryInNodeModulesAbsPath: string;
    /**
     * contains all files from dist folder
     * /lib /browser /websql /shared /assets etc..
     *
     * example path
     * <path-to-release-folder>/tmp-local-temp-proj/my-library/node_modules/@my-library/my-specific-lib
     * <path-to-release-folder>/tmp-local-temp-proj/my-library/node_modules/my-lib
     */
    outputDistAbsPath: string;
    //#endregion
  },
  {
    //#region release output options
    releaseProjPath: string;
    releaseType: ReleaseType;
    //#endregion
  }
> {
  //#region fields

  public readonly __libStandalone: LibProjectStandalone;

  public readonly __tests: MochaTestRunner;
  public readonly __testsJest: JestTestRunner;
  public readonly __testsCypress: CypressTestRunner;

  public readonly filesRecreator: FilesRecreator;

  public readonly copyNpmDistLibManager: CopyManager;
  public readonly insideStructureLib: InsideStructuresLib;
  protected readonly indexAutogenProvider: IndexAutogenProvider;
  public readonly filesTemplatesBuilder: FilesTemplatesBuilder;

  //#endregion

  //#region constructor
  //#region @backend
  constructor(project: Project) {
    super(project, 'npm-lib-and-cli-tool');

    this.__libStandalone = new LibProjectStandalone(project);

    this.__tests = new MochaTestRunner(project);
    this.__testsJest = new JestTestRunner(project);
    this.__testsCypress = new CypressTestRunner(project);

    this.copyNpmDistLibManager = CopyManager.for(project);
    this.indexAutogenProvider = new IndexAutogenProvider(project);
    this.filesTemplatesBuilder = new FilesTemplatesBuilder(project);
    this.filesRecreator = new FilesRecreator(project);
    this.insideStructureLib = new InsideStructuresLib(project);
  }
  //#endregion
  //#endregion

  //#region init partial
  async initPartial(initOptions: EnvOptions): Promise<void> {
    //#region @backendFunc

    Helpers.taskStarted(
      `Initing project: ${chalk.bold(this.project.genericName)} ${
        initOptions.init.struct ? '(without packages install)' : ''
      } `,
    );

    await this.filesRecreator.init();

    this.filesRecreator.vscode.settings.toogleHideOrShowDeps();

    await this.project.environmentConfig.init();

    if (this.project.framework.isStandaloneProject) {
      await this.insideStructureLib.init(initOptions);
      this.filesTemplatesBuilder.rebuild(initOptions);
    }

    if (!initOptions.init.struct) {
      await this.project.nodeModules.makeSureInstalled();
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
          watch: initOptions.build.watch,
        },
      );
      await this.creteBuildInfoFile(initOptions);
      if (this.indexAutogenProvider.generateIndexAutogenFile) {
        await this.indexAutogenProvider.runTask({
          watch: initOptions.build.watch,
        });
      } else {
        this.indexAutogenProvider.writeIndexFile(true);
      }
    }

    Helpers.log(
      `Init DONE for project: ${chalk.bold(this.project.genericName)} `,
    );

    this.project.quickFixes.makeSureDistFolderExists();

    // Helpers.info(`[buildLib] start of building ${websql ? '[WEBSQL]' : ''}`);

    this.copyEssentialFilesTo(
      this.project,
      [crossPlatformPath([this.project.pathFor(config.folder.dist)])],
      initOptions.release.releaseType,
    );

    //#endregion
  }
  //#endregion

  //#region build partial
  async buildPartial(buildOptions: EnvOptions): Promise<{
    tmpProjNpmLibraryInNodeModulesAbsPath: string;
    outputDistAbsPath: string;
  }> {
    //#region @backendFunc
    if (!this.project.framework.isStandaloneProject) {
      return;
    }

    await this.initPartial(EnvOptions.fromBuild(buildOptions));

    const tmpProjNpmLibraryInNodeModulesAbsPath = this.project.pathFor(
      `tmp-local-copyto-proj-${config.folder.dist}/` +
        `${config.folder.node_modules}/` +
        `${this.project.framework.packageNamesFromProject}`,
    );
    // const isOrganizationProject; // TODO @LAST PROVIDE PROPER NPM NAME
    const outputDistAbsPath: string = void 0; // TODO

    Helpers.log(`[buildLib] start of building...`);

    //#region init incremental process
    const incrementalBuildProcess = new IncrementalBuildProcess(
      this.project,
      buildOptions.clone({
        build: {
          websql: false,
        },
      }),
    );

    const incrementalBuildProcessWebsql = new IncrementalBuildProcess(
      this.project,
      buildOptions.clone({
        build: {
          websql: true,
          genOnlyClientCode: true,
        },
      }),
    );
    //#endregion

    //#region init proxy projects
    const proxyProject =
      this.project.artifactsManager.globalHelper.getProxyNgProj(
        buildOptions.clone({
          build: {
            websql: false,
          },
        }),
        'lib',
      );

    const proxyProjectWebsql =
      this.project.artifactsManager.globalHelper.getProxyNgProj(
        buildOptions.clone({
          build: {
            websql: true,
          },
        }),
        'lib',
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

      ANGULAR ${this.project.ins.Tnp?.packageJson.version} ${
        buildOptions.build.watch ? 'WATCH ' : ''
      } LIB BUILD STARTED... ${buildOptions.build.websql ? '[WEBSQL]' : ''}

      `);

      Helpers.log(` command: ${commandForLibraryBuild}`);
    };

    buildOptions.build.baseHref = !_.isUndefined(buildOptions.build.baseHref)
      ? buildOptions.build.baseHref
      : this.artifacts.angularNodeApp.angularFeBasenameManager.rootBaseHref;

    this.project.writeFile(
      tmpBaseHrefOverwriteRelPath,
      buildOptions.build.baseHref,
    );

    Helpers.logInfo(`

      Building lib for base href: ${
        !_.isUndefined(buildOptions.build.baseHref)
          ? `'` + buildOptions.build.baseHref + `'`
          : '/ (default)'
      }

      `);
    //#endregion

    if (
      !buildOptions.build.watch &&
      buildOptions.release.cutNpmPublishLibReleaseCode
    ) {
      this.__cutReleaseCodeFromSrc(buildOptions);
    }

    //#region incremental build
    await incrementalBuildProcess.runTask({
      taskName: 'isomorphic compilation',
      watch: buildOptions.build.watch,
    });
    await incrementalBuildProcessWebsql.runTask({
      taskName: 'isomorphic compilation [WEBSQL]',
      watch: buildOptions.build.watch,
    });
    //#endregion

    showInfoAngular();

    //#region ng build
    const runNgBuild = async () => {
      await proxyProject.execute(commandForLibraryBuild, {
        similarProcessKey: 'ng',
        resolvePromiseMsg: {
          stdout: buildOptions.build.watch
            ? COMPILATION_COMPLETE_LIB_NG_BUILD
            : undefined,
        },
        ...this.sharedOptions(buildOptions),
      });
      await proxyProjectWebsql.execute(commandForLibraryBuild, {
        similarProcessKey: 'ng',
        resolvePromiseMsg: {
          stdout: buildOptions.build.watch
            ? COMPILATION_COMPLETE_LIB_NG_BUILD
            : undefined,
        },
        ...this.sharedOptions(buildOptions),
      });
    };
    //#endregion

    //#region  handle watch & normal mode
    if (buildOptions.build.watch) {
      await runNgBuild();
    } else {
      try {
        await runNgBuild();
      } catch (e) {
        console.error(e);

        Helpers.throw(
          `
          Command failed: ${commandForLibraryBuild}

          Not able to build project: ${this.project.genericName}`,
        );
      }

      if (buildOptions.build.cli.includeNodeModules) {
        const cliJsFile = 'cli.js';
        this.project.nodeModules.removeOwnPackage(async () => {
          this.__backendIncludeNodeModulesInCompilation(
            false, // cliBuildUglify,
            cliJsFile,
          );
        });
      }
    }
    //#endregion

    if (buildOptions.release.cutNpmPublishLibReleaseCode) {
      this.__restoreCuttedReleaseCodeFromSrc(buildOptions);
    }

    //#region start copy manager
    if (!buildOptions.copyToManager.skip) {
      this.copyNpmDistLibManager.init(buildOptions);
      await this.copyNpmDistLibManager.runTask({
        taskName: 'copyto manger',
        watch: buildOptions.build.watch,
      });
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
      outputDistAbsPath,
    };
    //#endregion
  }
  //#endregion

  async releasePartial(releaseOptions: EnvOptions): Promise<{
    releaseProjPath: string;
    releaseType: ReleaseType;
  }> {
    let releaseProjPath: string;
    let releaseType: ReleaseType;

    // skip copy manager
    // resolve all action commits (BEFORE EVERYTHING)

    const { outputDistAbsPath, tmpProjNpmLibraryInNodeModulesAbsPath } =
      await this.buildPartial(EnvOptions.fromRelease(releaseOptions));

    // update peerDependencies in outputDistAbsPath
    // publish to npm stuff from outputDistAbsPath
    // copy dist from tmpProjNpmLibraryInNodeModulesAbsPath to container node_modules

    return { releaseProjPath, releaseType };
  }

  //#region clear
  async clearPartial(options?: EnvOptions): Promise<void> {
    // TODO make it better
    rimraf.sync(this.project.pathFor('dist') + '*');
    rimraf.sync(this.project.pathFor('tmp') + '*');
  }
  //#endregion

  //#region update stanalone project before publishing
  private updateStanaloneProjectBeforePublishing(): void {
    //#region @backendFunc
    if (this.project.framework.isStandaloneProject) {
      const distForPublishPath = crossPlatformPath([
        this.project.location,
        this.project.framework.getTempProjectNameForCopyTo(),
        config.folder.node_modules,
        this.project.name,
      ]);

      Helpers.remove(`${distForPublishPath}/app*`); // QUICK_FIX
      Helpers.remove(`${distForPublishPath}/tests*`); // QUICK_FIX
      Helpers.remove(`${distForPublishPath}/src`, true); // QUICK_FIX
      Helpers.writeFile(
        crossPlatformPath([distForPublishPath, 'src.d.ts']),
        `
// THIS FILE IS GENERATED
export * from './lib';
// THIS FILE IS GENERATED
// please use command: taon build:watch to see here links for your globally builded lib code files
// THIS FILE IS GENERATED
      `.trimStart(),
      );

      const pjPath = crossPlatformPath([
        distForPublishPath,
        config.file.package_json,
      ]);

      const pj = Helpers.readJson(pjPath) as PackageJson;
      // if (this..name === 'tnp') {
      //   pj.devDependencies = {};
      //   pj.dependencies = {}; // tnp is not going to be use in any other project
      // } else {
      //   pj.devDependencies = {};
      // }
      Helpers.removeFileIfExists(pjPath);
      Helpers.writeJson(pjPath, pj); // QUICK_FIX
    }
    //#endregion
  }
  //#endregion

  //#region fix terminal output paths
  async sharedOptions(buildOptions: EnvOptions) {
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
        if (this.project.framework.isStandaloneProject) {
          if (line.startsWith('WARNING: postcss-url')) {
            return ' --- [taon] IGNORED WARN ---- ';
          }

          line = line.replace(`projects/${this.project.name}/src/`, `./src/`);

          if (line.search(`/src/libs/`) !== -1) {
            const [__, ___, ____, moduleName] = line.split('/');
            // console.log({
            //   moduleName,
            //   standalone: 'inlib'
            // })
            return line.replace(
              `/src/libs/${moduleName}/`,
              `/${moduleName}/src/lib/`,
            );
          }

          return line;
        }
        return line;
      },
    } as CoreModels.ExecuteOptions;
  }
  //#endregion

  //#region release children
  private async releaseChildrenLibApps(
    releaseOptions: EnvOptions,
  ): Promise<void> {
    // TODO @LAST move to artifact
    //#region @backendFunc

    //#region prepare params
    if (releaseOptions.release.autoReleaseUsingConfig) {
      global.tnpNonInteractive = true;
    }

    // if (!global.tnpNonInteractive) {
    //   Helpers.clearConsole();
    // }
    //#endregion

    //#region resolve ishould release library

    if (releaseOptions.release.releaseVersionBumpType === 'major') {
      const newVersion =
        this.project.packageJson
          .versionWithMajorPlusOneAndMinorZeroAndPatchZero;
      this.project.packageJson.setVersion(newVersion);
    } else if (releaseOptions.release.releaseVersionBumpType === 'minor') {
      const newVersion =
        this.project.packageJson.versionWithMinorPlusOneAndPatchZero;
      this.project.packageJson.setVersion(newVersion);
    } else if (releaseOptions.release.releaseVersionBumpType === 'patch') {
      const newVersion = this.project.packageJson.versionWithPatchPlusOne;
      this.project.packageJson.setVersion(newVersion);
    }

    //#endregion

    this.project.npmHelpers.copyDepsFromCoreContainer('Release');

    if (this.project.framework.isContainer) {
      //#region container release
      //#region resolve deps
      // releaseOptions.resolved = releaseOptions.resolved.filter(
      //   f => f.location !== this.project.location,
      // );
      // const depsOnlyToPush = [];
      //#endregion
      //#region filter children
      // for (let index = 0; index < releaseOptions.resolved.length; index++) {
      //   const child = releaseOptions.resolved[index];
      //   const lastBuildHash = child.packageJson.getBuildHash();
      //   const lastTagHash = child.git.lastTagHash();
      //   const versionIsOk = !!releaseOptions.specifiedVersion
      //     ? child.framework.frameworkVersionAtLeast(
      //         releaseOptions.specifiedVersion as any,
      //       )
      //     : true;
      //   const shouldRelease = versionIsOk;
      //   Helpers.log(`ACTUALL RELEASE ${child.name}: ${shouldRelease}
      // lastBuildHash: ${lastBuildHash}
      // lastTagHash: ${lastTagHash}
      // isPrivate: ${child.packageJson.isPrivate}
      // versionIsOk: ${versionIsOk}
      // `);
      //   if (!shouldRelease) {
      //     // child.git.addAndCommit();
      //     // await child.git.pushCurrentBranch();
      //     depsOnlyToPush.push(child);
      //     releaseOptions.resolved[index] = void 0;
      //   }
      // }
      // releaseOptions.resolved = releaseOptions.resolved
      //   .filter(f => !!f)
      //   .map(c => this.project.ins.From(c.location));
      //#endregion
      //#region projs tempalte
      //       const projsTemplate = (child?: Project) => {
      //         return `
      //     PROJECTS FOR RELEASE: ${
      //       releaseOptions.specifiedVersion
      //         ? '(only framework version = ' + releaseOptions.specifiedVersion + ' )'
      //         : ''
      //     }
      // ${releaseOptions.resolved
      //   .filter(p => {
      //     if (releaseOptions.resolved.length > 0) {
      //       return releaseOptions.resolved.includes(p);
      //     }
      //     return true;
      //   })
      //   .map((p, i) => {
      //     const bold = child?.name === p.name;
      //     const index = i + 1;
      //     return `(${bold ? chalk.underline(chalk.bold(index.toString())) : index}. ${
      //       bold ? chalk.underline(chalk.bold(p.name)) : p.name
      //     }@${p.packageJson.versionWithPatchPlusOne})`;
      //   })
      //   .join(', ')}
      // ${Helpers.terminalLine()}
      // processing...
      //     `;
      //       };
      //#endregion
      //#region release loop
      // for (let index = 0; index < releaseOptions.resolved.length; index++) {
      //   const child = releaseOptions.resolved[index] as Project;
      //   if (releaseOptions.only) {
      //     releaseOptions.only = Array.isArray(releaseOptions.only)
      //       ? releaseOptions.only
      //       : [releaseOptions.only];
      //     if (
      //       !releaseOptions.only.includes(child.name) &&
      //       !releaseOptions.only.includes(child.basename)
      //     ) {
      //       continue;
      //     }
      //   }
      //   if (releaseOptions.start) {
      //     if (
      //       child.name !== releaseOptions.start &&
      //       child.basename !== releaseOptions.start
      //     ) {
      //       continue;
      //     }
      //     releaseOptions.start = void 0;
      //   }
      //   // console.log({ child })
      //   if (index === 0) {
      //     global.tnpNonInteractive = releaseOptions.resolved.length === 0;
      //     // Helpers.info(`
      //     // to release
      //     // ${depsOfResolved.map((d, i) => i + '.' + d.name).join('\n')}
      //     // `)
      //   }
      //   const exitBecouseNotInResolved =
      //     releaseOptions.resolved.length > 0 &&
      //     _.isUndefined(
      //       releaseOptions.resolved.find(c => c.location === child.location),
      //     );
      //   if (exitBecouseNotInResolved) {
      //     continue;
      //   }
      //   Helpers.clearConsole();
      //   Helpers.info(projsTemplate(child));
      //   await child.release(
      //     releaseOptions.clone({
      //       resolved: [],
      //     }),
      //   );
      //   if (releaseOptions.end) {
      //     if (
      //       child.name === releaseOptions.end ||
      //       child.basename === releaseOptions.end
      //     ) {
      //       Helpers.info('Done. Release end on project: ' + releaseOptions.end);
      //       process.exit(0);
      //     }
      //   }
      // }
      //#endregion
      // Helpers.clearConsole();
      // Helpers.info(projsTemplate());
      //#region display end message
      // if (releaseOptions.resolved.length === 0) {
      //   for (let index = 0; index < depsOnlyToPush.length; index++) {
      //     const depForPush = depsOnlyToPush[index] as Project;
      //     Helpers.warn(`
      //   No realase needed for ${chalk.bold(
      //     depForPush.name,
      //   )} ..just initing and pushing to git...
      //   `); // hash in package.json to check
      //     if (depForPush.typeIs('isomorphic-lib')) {
      //       try {
      //         await depForPush.init(
      //           EnvOptions.from({ purpose: 'release chain init' }),
      //         );
      //       } catch (error) {
      //         console.error(error);
      //         Helpers.info(`Not able to init fully...`);
      //       }
      //     }
      //     depForPush.git.stageAllAndCommit(`release push`);
      //     await depForPush.git.pushCurrentBranch();
      //   }
      //   this.project.git.stageAllAndCommit(`Update after release`);
      //   await this.project.git.pushCurrentBranch();
      //   const tnpProj = this.project.ins.Tnp;
      //   tnpProj.git.stageAllAndCommit(`Update after release`);
      //   await tnpProj.git.pushCurrentBranch();
      //   Helpers.success(`
      // [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
      // R E L E A S E   O F   C O N T I A I N E R  ${chalk.bold(
      //   this.project.genericName,
      // )}  D O N E
      // `);
      // } else {
      //   Helpers.success(`
      // [${dateformat(new Date(), 'dd-mm-yyyy HH:MM:ss')}]
      // P A R T I A L  R E L E A S E   O F   C O N T I A I N E R  ${chalk.bold(
      //   this.project.genericName,
      // )}  D O N E
      // `);
      // }
      //#endregion
      //#endregion
    } else {
      //#region standalone project release
      // await this.project.nodeModules.makeSureInstalled();
      // const tryReleaseProject = async () => {
      //   while (true) {
      //     try {
      //       await this.initPartial(
      //         EnvOptions.from({
      //           purpose: 'release project init',
      //         }),
      //       ); // TODO not needed build includes init
      //       break;
      //     } catch (error) {
      //       console.error(error);
      //       if (
      //         !(await Helpers.consoleGui.question.yesNo(
      //           `Not able to INIT your project ${chalk.bold(
      //             this.project.genericName,
      //           )} try again..`,
      //         ))
      //       ) {
      //         releaseOptions?.finishCallback();
      //       }
      //     }
      //   }
      // };
      // while (true) {
      //   await tryReleaseProject();
      //   try {
      //     await this.artifacts.npmLibAndCliTool.releaseLibProcess(
      //       releaseOptions,
      //     );
      //     break;
      //   } catch (error) {
      //     console.error(error);
      //     Helpers.error(
      //       `Not able to RELEASE your project ${chalk.bold(this.project.genericName)}`,
      //       true,
      //       true,
      //     );
      //     const errorOptions = {
      //       tryAgain: {
      //         name: 'Try again',
      //       },
      //       skipPackage: {
      //         name: 'Skip release for this package',
      //       },
      //       exit: {
      //         name: 'Exit process',
      //       },
      //     };
      //     const res = await Helpers.consoleGui.select<
      //       keyof typeof errorOptions
      //     >('What you wanna do ?', errorOptions);
      //     if (res === 'exit') {
      //       process.exit(0);
      //     } else if (res === 'skipPackage') {
      //       break;
      //     }
      //   }
      // }
      //#endregion
    }
    //#endregion
  }
  //#endregion

  //#region release lib process
  private async releaseLibProcess(releaseOptions: EnvOptions) {
    //#region @backendFunc
    // if (!this.project.releaseProcess.isInCiReleaseProject) {
    //   const tempGeneratedCiReleaseProject =
    //     await this.__createTempCiReleaseProject(EnvOptions.from({}));
    //   await tempGeneratedCiReleaseProject.artifactsManager.artifact.npmLibAndCliTool.releaseLibProcess(
    //     releaseOptions,
    //   );
    //   return;
    // }
    // Helpers.log(
    //   `autoReleaseUsingConfig=${releaseOptions.autoReleaseUsingConfig}`,
    // );
    // Helpers.log(`global.tnpNonInteractive=${global.tnpNonInteractive}`);
    // // const this.project =
    // //   this.project.releaseProcess.__releaseCiProjectParent;
    // let specificProjectForBuild: Project;
    // if (!releaseOptions.autoReleaseUsingConfigDocs) {
    //#region publish lib process
    // var newVersion = this.project.packageJson.version;
    // await this.project.npmHelpers.loginToRegistry();
    // await this.project.npmHelpers.checkProjectReadyForNpmRelease();
    // // TODO somehting need when decide what is child
    // // for standalone or smartcontainer
    // // if (this.isStandaloneProject) {
    // //   await this.__libStandalone.bumpVersionInOtherProjects(newVersion, true);
    // // }
    // this.project.git.__commitRelease(newVersion);
    // this.project.packageJson.setVersion(newVersion);
    // this.project.npmHelpers.copyDepsFromCoreContainer('show for release');
    // specificProjectForBuild = await this.__releaseBuildProcess({
    //   releaseOptions,
    //   cutNpmPublishLibReleaseCode: true,
    // });
    // if (this.project.framework.isStandaloneProject) {
    //   specificProjectForBuild.artifactsManager.artifact.npmLibAndCliTool.__libStandalone.preparePackage(
    //     this.project,
    //     newVersion,
    //   );
    // }
    // if (this.project.framework.isStandaloneProject) {
    //   this.project.artifactsManager.artifact.npmLibAndCliTool.__libStandalone.fixPackageJson();
    // }
    // if (this.project.framework.isStandaloneProject) {
    //   this.updateStanaloneProjectBeforePublishing();
    // }
    // let publish = true;
    // const readyToNpmPublishVersionPath = `${this.project.framework.getTempProjectNameForCopyTo()}/${
    //   config.folder.node_modules
    // }`;
    // if (this.project.framework.isStandaloneProject) {
    //   const distFolder = crossPlatformPath([
    //     specificProjectForBuild.location,
    //     readyToNpmPublishVersionPath,
    //     this.project.name,
    //     config.folder.dist,
    //   ]);
    //   // console.log('Remove dist ' + distFolder)
    //   Helpers.remove(distFolder);
    // }
    // if (!global.tnpNonInteractive) {
    //   await Helpers.questionYesNo(
    //     `Do you wanna check compiled version before publishing ?`,
    //     async () => {
    //       specificProjectForBuild
    //         .run(`code ${readyToNpmPublishVersionPath}`)
    //         .sync();
    //       Helpers.pressKeyAndContinue(
    //         `Check your compiled code and press any key ...`,
    //       );
    //     },
    //   );
    // }
    // publish = await Helpers.questionYesNo(`Publish this package ?`);
    // if (publish) {
    //   if (this.project.framework.isStandaloneProject) {
    //     await specificProjectForBuild.artifactsManager.artifact.npmLibAndCliTool.__libStandalone.publish(
    //       {
    //         newVersion,
    //         autoReleaseUsingConfig: releaseOptions.autoReleaseUsingConfig,
    //         prod: releaseOptions.prod,
    //       },
    //     );
    //   }
    // } else {
    //   Helpers.info('Omitting npm publish...');
    // }
    //#endregion
    // }
    //#region build docs
    // if (
    //   !global.tnpNonInteractive ||
    //   releaseOptions.autoReleaseUsingConfigDocs
    // ) {
    //   // Helpers.clearConsole();
    //   await new Promise<void>(async (resolve, reject) => {
    //     if (this.project.framework.isStandaloneProject) {
    //       await this.project.artifactsManager.artifact.npmLibAndCliTool.__libStandalone.buildDocs(
    //         releaseOptions.prod,
    //         releaseOptions.autoReleaseUsingConfigDocs,
    //         async () => {
    //           try {
    //             specificProjectForBuild = await this.__releaseBuildProcess({
    //               releaseOptions,
    //               cutNpmPublishLibReleaseCode: false,
    //             });
    //             resolve();
    //           } catch (error) {
    //             reject(error);
    //           }
    //         },
    //       );
    //     }
    //   });
    //   this.project.git.__commitRelease(newVersion);
    // }
    //#endregion
    //#region push code to repo
    // const docsCwd = this.project.pathFor('docs');
    // if (!releaseOptions.autoReleaseUsingConfigDocs && Helpers.exists(docsCwd)) {
    //   await this.project.artifactsManager.artifact.npmLibAndCliTool.__displayInfoBeforePublish(
    //     DEFAULT_PORT.DIST_SERVER_DOCS,
    //   );
    // }
    // await this.project.git.tagAndPushToGitRepo(
    //   newVersion,
    //   releaseOptions.autoReleaseUsingConfigDocs,
    // );
    // if (!releaseOptions.autoReleaseUsingConfigDocs && Helpers.exists(docsCwd)) {
    //   await Helpers.killProcessByPort(DEFAULT_PORT.DIST_SERVER_DOCS);
    // }
    //#endregion
    // Helpers.info('RELEASE DONE');
    //#endregion
  }
  //#endregion

  //#region getters & methods / info before publish
  public async __displayInfoBeforePublish(
    envOptions: EnvOptions,
    defaultTestPort: Number,
  ) {
    //#region @backendFunc
    if (envOptions.website.useDomain) {
      Helpers.info(
        `Cannot local preview.. using doamin: ` +
          `${envOptions.website.domain}`,
      );
      return;
    }
    const originPath = `http://localhost:`;
    const docsCwd = this.project.pathFor('docs');
    if (!Helpers.exists(docsCwd)) {
      return;
    }
    await Helpers.killProcessByPort(DEFAULT_PORT.DIST_SERVER_DOCS);
    const commandHostLoclDocs =
      `taon-http-server -s -p ` +
      `${DEFAULT_PORT.DIST_SERVER_DOCS} --base-dir ${this.project.name}`;

    // console.log({
    //   cwd, commandHostLoclDocs
    // })
    Helpers.run(commandHostLoclDocs, {
      cwd: docsCwd,
      output: false,
      silence: true,
    }).async();
    if (this.project.framework.isStandaloneProject) {
      Helpers.info(`Before pushing you can access project here:

- ${originPath}${defaultTestPort}/${this.project.name}

`);
    }

    //#endregion
  }
  //#endregion

  //#region clear lib
  async clearLib(options: EnvOptions) {
    //#region @backendFunc
    Helpers.taskStarted(`Cleaning project: ${this.project.genericName}`);

    if (
      this.project.typeIs('unknown') ||
      this.project.typeIs('unknown-npm-project')
    ) {
      return;
    }

    while (true) {
      try {
        rimraf.sync(
          crossPlatformPath([this.project.location, config.folder.tmp + '*']),
        );
        rimraf.sync(
          crossPlatformPath([this.project.location, config.folder.dist + '*']),
        );
        try {
          this.project.removeFile(config.folder.node_modules);
        } catch (error) {
          this.project.remove(config.folder.node_modules);
        }
        this.project.removeFile(config.folder.browser);
        this.project.removeFile(config.folder.websql);
        this.project.removeFile(config.file.tnpEnvironment_json);
        if (this.project.framework.isCoreProject) {
          return;
        }

        glob
          .sync(`${this.project.location}/*.filetemplate`)
          .forEach(fileTemplate => {
            Helpers.remove(fileTemplate);
            Helpers.remove(fileTemplate.replace('.filetemplate', ''));
          });

        Helpers.removeIfExists(
          path.join(this.project.location, config.file.tnpEnvironment_json),
        );
        break;
      } catch (error) {
        Helpers.pressKeyAndContinue(MESSAGES.SHUT_DOWN_FOLDERS_AND_DEBUGGERS);
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

  //#region build & release methods

  //#region getters & methods / pack resources
  public __packResourceInReleaseDistResources(releaseDistFolder: string) {
    //#region @backendFunc
    this.project.npmHelpers.checkProjectReadyForNpmRelease();

    if (!fse.existsSync(releaseDistFolder)) {
      fse.mkdirSync(releaseDistFolder);
    }
    []
      .concat([...this.project.taonJson.resources, ...[config.file._npmignore]])
      .forEach(res => {
        //  copy resource to org build and copy shared assets
        const file = path.join(this.project.location, res);
        const dest = path.join(releaseDistFolder, res);
        if (!fse.existsSync(file)) {
          Helpers.error(
            `[${config.frameworkName}][lib-project] Resource file: ${chalk.bold(
              path.basename(file),
            )} does not ` +
              `exist in "${this.project.genericName}"  (package.json > resources[])
        `,
            false,
            true,
          );
        }
        if (fse.lstatSync(file).isDirectory()) {
          // console.log('IS DIRECTORY', file)
          // console.log('IS DIRECTORY DEST', dest)
          const filter = src => {
            return !/.*node_modules.*/g.test(src);
          };
          Helpers.copy(file, dest, { filter });
        } else {
          // console.log('IS FILE', file)
          fse.copyFileSync(file, dest);
        }
      });
    Helpers.logInfo(
      `Resources copied to release folder: ${config.folder.dist}`,
    );
    //#endregion
  }
  //#endregion

  //#region getters & methods / release build
  private async __releaseBuildProcess({
    releaseOptions,
    cutNpmPublishLibReleaseCode,
  }: {
    releaseOptions: EnvOptions;
    cutNpmPublishLibReleaseCode: boolean;
  }) {
    //#region @backendFunc

    // TODO  - only here so  smartContainerBuildTarget is available
    await this.initPartial(
      EnvOptions.from({
        purpose: 'init before release process',
      }),
    );

    const specificProjectForBuild: Project = this.project.framework
      .isStandaloneProject
      ? this.project
      : (this.project.ins.From(
          crossPlatformPath(
            path.join(
              this.project.location,
              config.folder.dist,
              this.project.name,
            ),
          ),
        ) as Project);

    // TODO @UNCOMMENT
    // await this.buildPartial(
    //   EnvOptions.from({
    //     // buildType: 'lib',
    //     prod,
    //     cliBuildObscure,
    //     cliBuildIncludeNodeModules,
    //     cliBuildNoDts,
    //     cliBuildUglify,
    //     cutNpmPublishLibReleaseCode,
    //     buildForRelease: true,
    //   }),
    // );

    //#region prepare release resources
    // const dists = [
    //   crossPlatformPath([specificProjectForBuild.location, config.folder.dist]),
    //   crossPlatformPath([
    //     specificProjectForBuild.location,
    //     specificProjectForBuild.framework.getTempProjectNameForCopyTo(),
    //     config.folder.node_modules,
    //     this.project.name,
    //   ]),
    // ];

    // if (this.project.framework.isStandaloneProject) {
    //   for (let index = 0; index < dists.length; index++) {
    //     const releaseDistFolder = dists[index];
    //     this.__createClientVersionAsCopyOfBrowser(
    //       specificProjectForBuild,
    //       releaseDistFolder,
    //     );
    //   }
    // }

    // for (let index = 0; index < dists.length; index++) {
    //   const releaseDist = dists[index];
    //   this.__compileBrowserES5version(specificProjectForBuild, releaseDist);
    // }

    // if (this.project.framework.isStandaloneProject) {
    //   for (let index = 0; index < dists.length; index++) {
    //     const releaseDist = dists[index];
    //     specificProjectForBuild.artifactsManager.artifact.npmLibAndCliTool.__packResourceInReleaseDistResources(
    //       releaseDist,
    //     );
    //   }
    //   this.copyEssentialFilesTo(
    //     specificProjectForBuild,
    //     dists,
    //     releaseOptions.releaseType,
    //   );
    // }
    //#endregion

    return specificProjectForBuild;

    //#endregion
  }
  //#endregion

  //#region getters & methods / create client folder from browser folder
  private __createClientVersionAsCopyOfBrowser(
    this: {},
    project: Project,
    releaseDistFolder: string,
  ) {
    //#region @backendFunc
    const browser = path.join(releaseDistFolder, config.folder.browser);
    const client = path.join(releaseDistFolder, config.folder.client);
    if (fse.existsSync(browser)) {
      Helpers.remove(client);
      Helpers.tryCopyFrom(browser, client);
    } else {
      Helpers.logWarn(
        `Browser folder not generated.. replacing with dummy files: browser.js, client.js`,
        false,
      );
      const msg = `console.log('${project.genericName} only for backend') `;
      Helpers.writeFile(`${browser}.js`, msg);
      Helpers.writeFile(`${client}.js`, msg);
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / compile es5
  private __compileBrowserES5version(
    this: {},
    project: Project,
    pathReleaseDist: string,
  ) {
    //#region @backendFunc
    // TODO fix this for angular-lib
    if (project.framework.frameworkVersionAtLeast('v3')) {
      return;
    }

    if (
      project.framework.frameworkVersionEquals('v1') ||
      project.typeIsNot('isomorphic-lib')
    ) {
      return;
    }

    const cwdBrowser = path.join(pathReleaseDist, config.folder.browser);
    const cwdClient = path.join(pathReleaseDist, config.folder.client);
    const pathBabelRc = path.join(cwdBrowser, config.file._babelrc);
    const pathCompiled = path.join(cwdBrowser, 'es5');
    const pathCompiledClient = path.join(cwdClient, 'es5');
    Helpers.writeFile(pathBabelRc, '{ "presets": ["env"] }\n');
    try {
      Helpers.run(`babel . -d es5`, { cwd: cwdBrowser }).sync();
      Helpers.copy(pathCompiled, pathCompiledClient);
    } catch (err) {
      Helpers.removeFileIfExists(pathBabelRc);
      Helpers.error(err, true, true);
      Helpers.error(`Not able to create es5 version of lib`, false, true);
    }
    Helpers.removeFileIfExists(pathBabelRc);
    //#endregion
  }
  //#endregion

  //#region getters & methods / copy essential files
  private copyEssentialFilesTo(
    fromProject: Project,
    toDestinations: string[],
    releaseType?: ReleaseType,
  ): void {
    //#region @backendFunc
    fromProject.artifactsManager.artifact.npmLibAndCliTool.copyWhenExist(
      'bin',
      toDestinations,
    );
    fromProject.artifactsManager.artifact.npmLibAndCliTool.linkWhenExist(
      config.file.package_json,
      toDestinations,
    );
    fromProject.artifactsManager.artifact.npmLibAndCliTool.copyWhenExist(
      config.file.taon_jsonc,
      toDestinations,
    );
    fromProject.artifactsManager.artifact.npmLibAndCliTool.copyWhenExist(
      '.npmrc',
      toDestinations,
    );
    fromProject.artifactsManager.artifact.npmLibAndCliTool.copyWhenExist(
      '.npmignore',
      toDestinations,
    );
    fromProject.artifactsManager.artifact.npmLibAndCliTool.copyWhenExist(
      '.gitignore',
      toDestinations,
    );

    fromProject.artifactsManager.artifact.npmLibAndCliTool.copyWhenExist(
      config.file.tnpEnvironment_json,
      toDestinations,
    );

    if (releaseType) {
      fromProject.artifactsManager.artifact.npmLibAndCliTool.copyWhenExist(
        config.file.package_json,
        toDestinations,
      );
      fromProject.artifactsManager.artifact.npmLibAndCliTool.linkWhenExist(
        config.folder.node_modules,
        toDestinations,
      );
      fromProject.artifactsManager.artifact.npmLibAndCliTool.copyWhenExist(
        config.file.package_json,
        toDestinations.map(d => crossPlatformPath([d, config.folder.client])),
      );
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / copy when exists
  public copyWhenExist(relativePath: string, destinations: string[]) {
    //#region @backendFunc
    const absPath = crossPlatformPath([this.project.location, relativePath]);

    for (let index = 0; index < destinations.length; index++) {
      const dest = crossPlatformPath([destinations[index], relativePath]);
      if (Helpers.exists(absPath)) {
        if (Helpers.isFolder(absPath)) {
          Helpers.remove(dest, true);
          Helpers.copy(absPath, dest, { recursive: true });
        } else {
          Helpers.copyFile(absPath, dest);
          if (path.basename(absPath) === config.file.tnpEnvironment_json) {
            Helpers.setValueToJSON(dest, 'currentProjectLocation', void 0);
          }
        }
      } else {
        Helpers.log(`[isomorphic-lib][copyWhenExist] not exists: ${absPath}`);
      }
    }
    //#endregion
  }
  //#endregion

  //#region getters & methods / link when exists
  private linkWhenExist(relativePath: string, destinations: string[]): void {
    //#region @backendFunc
    let absPath = path.join(this.project.location, relativePath);

    if (Helpers.exists(absPath) && Helpers.isExistedSymlink(absPath)) {
      absPath = Helpers.pathFromLink(absPath);
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

  //#region getters & methods / compile backend es5
  /**
   * TODO not working
   */
  protected __backendCompileToEs5(mainCliJSFileName = 'index.js') {
    return;
    //#region @backend
    const outDir = config.folder.dist as 'dist';
    if (!Helpers.exists(path.join(this.project.location, outDir, 'index.js'))) {
      Helpers.warn(
        `[compileToEs5] Nothing to compile to es5... no index.js in ${outDir}`,
      );
      return;
    }
    const indexEs5js = `index-es5.js`;
    Helpers.writeFile(
      path.join(this.project.location, outDir, config.file._babelrc),
      '{ "presets": ["env"] }\n',
    );
    this.project
      .run(
        `npm-run babel  ./${outDir}/index.js --out-file ./${outDir}/${indexEs5js}`,
      )
      .sync();
    Helpers.writeFile(
      path.join(this.project.location, outDir, config.file.index_js),
      Helpers.readFile(path.join(this.project.location, outDir, indexEs5js)),
    );
    Helpers.removeFileIfExists(
      path.join(this.project.location, outDir, indexEs5js),
    );
    Helpers.removeFileIfExists(
      path.join(this.project.location, outDir, config.file._babelrc),
    );
    //#endregion
  }
  //#endregion

  //#region getters & methods / compile/cliBuildUglify backend code
  private __backendUglifyCode(
    reservedNames: string[],
    mainCliJSFileName = 'index.js',
  ) {
    //#region @backendFunc
    const outDir = config.folder.dist;
    if (
      !Helpers.exists(
        path.join(this.project.location, outDir, mainCliJSFileName),
      )
    ) {
      Helpers.warn(
        `[cliBuildUglifyCode] Nothing to cliBuildUglify... no ${mainCliJSFileName} in /${outDir}`,
      );
      return;
    }
    const command =
      `npm-run cliBuildUglifyjs ${outDir}/${mainCliJSFileName} --output ${outDir}/${mainCliJSFileName} -b` +
      ` --mangle reserved=[${reservedNames.map(n => `'${n}'`).join(',')}]`;
    // + ` --mangle-props reserved=[${reservedNames.join(',')}]` // it breakes code

    Helpers.info(`

    JAVASCRIPT-UGLIFY PROCESSING...

    ${command}

      `);
    this.project.run(command).sync();
    //#endregion
  }
  //#endregion

  //#region getters & methods / compile/cliBuildObscure backend code
  private __backendObscureCode(
    reservedNames: string[],
    mainCliJSFileName = 'index.js',
  ) {
    //#region @backendFunc
    const outDir = config.folder.dist;
    if (
      !Helpers.exists(
        path.join(this.project.location, config.folder.dist, mainCliJSFileName),
      )
    ) {
      Helpers.warn(
        `[cliBuildObscureCode] Nothing to cliBuildObscure... no ${mainCliJSFileName} in release dist`,
      );
      return;
    }
    const commnad =
      `npm-run javascript-obfuscator dist/${mainCliJSFileName} ` +
      ` --output dist/${mainCliJSFileName}` +
      ` --target node` +
      ` --string-array-rotate true` +
      // + ` --stringArray true`
      ` --string-array-encoding base64` +
      ` --reserved-names '${reservedNames.join(',')}'` +
      ` --reserved-strings '${reservedNames.join(',')}'`;

    Helpers.info(`

        JAVASCRIPT-OBFUSCATOR PROCESSING...

        ${commnad}

          `);
    this.project.run(commnad).sync();
    //#endregion
  }
  //#endregion

  //#region getters & methods / include node_modules in compilation
  private __backendIncludeNodeModulesInCompilation(
    cliBuildUglify: boolean,
    mainCliJSFileName: string = config.file.index_js,
  ) {
    //#region @backend
    const outDir = config.folder.dist;
    // QUICK_FIX TODO ncc input change does not work (it takes always index.js)
    //#region QUICK_FIX
    const indexOrg = this.project.pathFor(`${outDir}/${config.file.index_js}`);
    const indexOrgBackup = this.project.pathFor(
      `${outDir}/${config.file.index_js}-backup`,
    );
    const mainFileAbs = this.project.pathFor(`${outDir}/${mainCliJSFileName}`);
    const useBackupFile = mainCliJSFileName !== config.file.index_js;
    if (useBackupFile) {
      Helpers.copyFile(indexOrg, indexOrgBackup);
    }
    //#endregion

    const nccComand = `ncc build ${outDir}/${
      config.file.index_js
    } -o ${outDir}/temp/ncc ${cliBuildUglify ? '-m' : ''}  --no-cache `;
    // console.log({
    //   useBackupFile,
    //   indexOrg,
    //   indexOrgBackup,
    //   nccComand
    // })
    this.project.run(nccComand).sync();
    // Helpers
    //   .filesFrom([this.location, outDir, 'lib'], true)
    //   .filter(f => f.endsWith('.js') || f.endsWith('.js.map'))
    //   .forEach(f => Helpers.removeFileIfExists(f))
    //   ;

    const baseDistRelease = crossPlatformPath(
      path.join(this.project.location, outDir),
    );
    const nccBase = crossPlatformPath(
      path.join(this.project.location, outDir, 'temp', 'ncc'),
    );
    const indexJSPath = crossPlatformPath([nccBase, 'index.js']);
    Helpers.writeFile(
      indexJSPath,
      UtilsQuickFixes.replaceSQLliteFaultyCode(Helpers.readFile(indexJSPath)),
    );

    // copy wasm file for dest
    const wasmfileSource = crossPlatformPath([
      this.project.ins.by(
        'isomorphic-lib',
        this.project.framework.frameworkVersion,
      ).location,
      'app/src/assets/sql-wasm.wasm',
    ]);

    const wasmfileDest = crossPlatformPath([nccBase, 'sql-wasm.wasm']);
    Helpers.copyFile(wasmfileSource, wasmfileDest);

    Helpers.filesFrom(nccBase, true)
      .filter(f => f.replace(`${nccBase}/`, '') !== config.file.package_json)
      .forEach(f => {
        const relativePath = f.replace(`${nccBase}/`, '');
        const dest = crossPlatformPath(
          path.join(baseDistRelease, relativePath),
        );
        Helpers.copyFile(f, dest);
      });

    Helpers.removeFolderIfExists(path.dirname(nccBase));

    // remove dependencies
    const pjPath = this.project.pathFor(
      `${outDir}/${config.file.package_json}`,
    );
    const pj: PackageJson = Helpers.readJson(pjPath);
    Object.keys(pj.dependencies).forEach(name => {
      if (!['ora'].includes(name)) {
        // TODO QUICK FIX FOF TNP
        delete pj.dependencies[name];
      }
    });
    pj.peerDependencies = {};
    pj.devDependencies = {};
    Helpers.removeFileIfExists(pjPath);
    Helpers.writeFile(pjPath, pj);

    if (useBackupFile) {
      Helpers.copyFile(indexOrg, mainFileAbs);
      Helpers.copyFile(indexOrgBackup, indexOrg);
    }
    Helpers.removeIfExists(indexOrgBackup);

    //#endregion
  }
  //#endregion

  //#region getters & methods / include remove dts
  /**
   * @deprecated
   */
  private __backendRemoveDts() {
    //#region @backend
    const outDir = config.folder.dist;
    Helpers.filesFrom([this.project.location, outDir, 'lib'], true)
      .filter(f => f.endsWith('.d.ts'))
      .forEach(f => Helpers.removeFileIfExists(f));
    Helpers.writeFile(
      [this.project.location, outDir, 'lib/index.d.ts'],
      `export declare const dummy${new Date().getTime()};`,
    );
    //#endregion
  }
  //#endregion

  //#region getters & methods / build info
  async creteBuildInfoFile(initOptions: EnvOptions): Promise<void> {
    //#region @backendFunc
    initOptions = EnvOptions.from(initOptions);
    if (this.project.framework.isStandaloneProject) {
      const dest = this.project.pathFor([
        config.folder.src,
        config.folder.lib,
        config.file.build_info_generated_ts,
      ]);
      Helpers.writeFile(
        dest,
        `
export const BUILD_FRAMEWORK_CLI_NAME = '${config.frameworkName}';

      `,
      );
    }

    //#endregion
  }
  //#endregion

  //#region getters & methods / show message when build lib done for smart container
  protected showMesageWhenBuildLibDone(buildOptions: EnvOptions): void {
    //#region @backend
    if (buildOptions.release.releaseType) {
      Helpers.logInfo('Lib build part done...  ');
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

  //#endregion

  //#region methods / compilation process
  async compilationProcessCliMinified() {
    //#region @backendFunc
    //     const destBaseLatest = this.project.pathFor(
    //       `${config.folder.local_release}/cli/${this.project.nameForCli}-latest`,
    //     );
    //     const destBase = destBaseLatest;
    //     // const destBase = this.project.pathFor(
    //     //   `${config.folder.local_release}/cli/${this.project.nameForCli}-v${this.project.version}`,
    //     // );
    //     const destTmpBaseOldVersions = this.project.pathFor(
    //       `${config.folder.local_release}/cli/tmp-old-versions/` +
    //         `${this.project.nameForCli}-v${this.project.packageJson.version}-${new Date().getTime()}`,
    //     );
    //     const destCli = crossPlatformPath([
    //       destBase,
    //       config.folder.dist,
    //       config.file.cli_js,
    //     ]);
    //     const destPackageJson = crossPlatformPath([
    //       destBase,
    //       config.file.package_json,
    //     ]);
    //     const destREADMEmd = crossPlatformPath([destBase, config.file.README_MD]);
    //     if (Helpers.exists(destBase)) {
    //       Helpers.copy(destBase, destTmpBaseOldVersions);
    //       Helpers.remove(destBase);
    //     }
    //     await Helpers.ncc(
    //       crossPlatformPath([
    //         this.project.location,
    //         config.folder.dist,
    //         config.file.cli_js,
    //       ]),
    //       destCli,
    //       // () => {
    //       // ({ copyToDestination, output }) => {
    //       // TODO not needed for now
    //       // const wasmfileSource = crossPlatformPath([
    //       //   this.project.coreProject.location,
    //       //   'app/src/assets/sql-wasm.wasm',
    //       // ]);
    //       // copyToDestination(wasmfileSource);
    //       // return output;
    //       // },
    //     );
    //     this.project.copy(['bin']).to(destBase);
    //     const destStartJS = crossPlatformPath([destBase, 'bin/start.js']);
    //     Helpers.writeFile(
    //       destStartJS,
    //       `console.log('<<< USING BUNDLED CLI >>>');` +
    //         `\n${Helpers.readFile(destStartJS)}`,
    //     );
    //     Helpers.writeJson(destPackageJson, {
    //       name: `${this.project.name.replace('-cli', '')}`,
    //       version: this.project.packageJson.version,
    //       bin: this.project.packageJson.bin,
    //     });
    //     Helpers.writeFile(
    //       destREADMEmd,
    //       `# ${this.project.name} CLI\n\n
    // ## Installation as global tool
    // \`\`\`bash
    // npm link
    // \`\`\`
    // `,
    //     );
    //     const proj = this.project.ins.From(destBaseLatest);
    //     proj.quickFixes.createDummyEmptyLibsReplacements(['electron']);
    //#endregion
  }
  //#endregion
}
